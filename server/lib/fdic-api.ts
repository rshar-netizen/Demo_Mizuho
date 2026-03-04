export const FDIC_BASE_URL = "https://banks.data.fdic.gov/api";

export interface FDICFinancialRecord {
  CERT: number;
  REPDTE: string;
  ASSET: number;
  DEP: number;
  NETINC: number;
  INTINC: number;
  EINTEXP: number;
  NTLNLS: number;
  ROE: number;
  ROA: number;
  NIM: number;
  NIMY: number;
  IDT1CER: number;
  IDTRCR: number;
  RBC1AAJ: number;
  EEFFR: number;
  EEFF: number;
  NONII: number;
  P3ASSET: number;
  ELNANTR: number;
  LNLSNET: number;
  SC: number;
  LNATRES: number;
  DEPDOM: number;
  RBCT1J: number;
  EQ: number;
  LIAB: number;
}

export interface FDICAPIResponse {
  meta: { total: number };
  data: Array<{ data: Partial<FDICFinancialRecord> }>;
  totals: { count: number };
}

const FINANCIAL_FIELDS = [
  "CERT", "REPDTE", "INSTNAME", "ASSET", "DEP", "NETINC", "INTINC", "EINTEXP",
  "NTLNLS", "ROE", "ROA", "NIM", "NIMY", "IDT1CER", "IDTRCR", "RBC1AAJ",
  "EEFFR", "EEFF", "NONII", "P3ASSET", "ELNANTR", "LNLSNET", "SC", "LNATRES",
  "DEPDOM", "RBCT1J", "EQ", "LIAB"
].join(",");

export const PEER_BANKS: Record<string, number> = {
  "Mizuho Americas": 21843,
  "PNC Bank, N.A.": 6384,
  "U.S. Bank N.A.": 6548,
  "Citizens Bank, N.A.": 57957,
  "KeyBank N.A.": 17534,
  "M&T Bank": 57803,
  "MUFG Union Bank": 32633,
  "Manufacturers Bank": 22538,
  "Deutsche Bank Trust": 623,
  "Barclays Bank Delaware": 57062,
  "JPMorgan Chase Bank": 628,
  "Citibank": 7213,
  "Goldman Sachs Bank": 33124,
  "Morgan Stanley Bank": 32992,
  "Bank of America": 3510,
};

export const PEER_DISPLAY_NAMES: Record<number, string> = {
  21843: "Mizuho Americas",
  6384: "PNC Financial",
  6548: "U.S. Bancorp",
  57957: "Citizens Financial",
  17534: "KeyCorp",
  57803: "M&T Bank",
  32633: "MUFG Americas",
  22538: "SMBC (Manufacturers)",
  623: "Deutsche Bank Americas",
  57062: "Barclays US",
  628: "JPMorgan Chase",
  7213: "Citibank",
  33124: "Goldman Sachs",
  32992: "Morgan Stanley",
  3510: "Bank of America",
};

export function computeNIMPercent(record: FDICFinancialRecord): number {
  if (record.NIMY != null) return record.NIMY;
  if (record.ASSET && record.INTINC && record.EINTEXP) {
    const nii = record.INTINC - record.EINTEXP;
    return (nii / record.ASSET) * 100;
  }
  return 0;
}

export function computeEfficiencyRatio(record: FDICFinancialRecord): number {
  if (record.EEFF && record.INTINC && record.NONII) {
    return (record.EEFF / (record.INTINC + record.NONII)) * 100;
  }
  if (record.EEFFR != null) return record.EEFFR;
  return 0;
}

export function getTier1Ratio(record: FDICFinancialRecord): number {
  if (record.RBC1AAJ != null) return record.RBC1AAJ;
  if (record.IDT1CER != null) return record.IDT1CER;
  return 0;
}

export function computeNPAPercent(record: FDICFinancialRecord): number {
  if (record.ASSET && record.P3ASSET) {
    return (record.P3ASSET / record.ASSET) * 100;
  }
  return 0;
}

export function computeLoanToDeposit(record: FDICFinancialRecord): number {
  if (record.DEP && record.LNLSNET) {
    return (record.LNLSNET / record.DEP) * 100;
  }
  return 0;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_TTL = 30 * 60 * 1000;

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < entry.ttl) {
    return entry.data as T;
  }
  cache.delete(key);
  return null;
}

function setCache<T>(key: string, data: T, ttl = CACHE_TTL): void {
  cache.set(key, { data, timestamp: Date.now(), ttl });
}

async function fetchFDIC(url: string): Promise<FDICAPIResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, { redirect: "follow", signal: controller.signal });
    if (!response.ok) throw new Error(`FDIC API error: ${response.status}`);
    return await response.json() as FDICAPIResponse;
  } finally {
    clearTimeout(timeout);
  }
}

export async function checkFDICConnection(): Promise<{ connected: boolean; responseTimeMs: number; message: string }> {
  const start = Date.now();
  try {
    const url = `${FDIC_BASE_URL}/financials?filters=CERT:6384&fields=CERT,REPDTE&sort_by=REPDTE&sort_order=DESC&limit=1`;
    const json = await fetchFDIC(url);
    return {
      connected: json.meta.total > 0,
      responseTimeMs: Date.now() - start,
      message: `Connected - ${json.meta.total} records available`,
    };
  } catch (err: any) {
    return {
      connected: false,
      responseTimeMs: Date.now() - start,
      message: err.message || "Connection failed",
    };
  }
}

export async function getFinancialsByCert(
  cert: number,
  periods: number = 12
): Promise<FDICFinancialRecord[]> {
  const cacheKey = `financials_${cert}_${periods}`;
  const cached = getCached<FDICFinancialRecord[]>(cacheKey);
  if (cached) return cached;

  const url = `${FDIC_BASE_URL}/financials?filters=CERT:${cert}&fields=${FINANCIAL_FIELDS}&sort_by=REPDTE&sort_order=DESC&limit=${periods}`;
  const json = await fetchFDIC(url);
  const results = json.data.map(d => d.data as FDICFinancialRecord);
  setCache(cacheKey, results);
  return results;
}

export async function getLatestFinancials(cert: number): Promise<FDICFinancialRecord | null> {
  const records = await getFinancialsByCert(cert, 1);
  return records.length > 0 ? records[0] : null;
}

export async function getAllPeerFinancials(): Promise<Record<string, FDICFinancialRecord[]>> {
  const cacheKey = "all_peer_financials";
  const cached = getCached<Record<string, FDICFinancialRecord[]>>(cacheKey);
  if (cached) return cached;

  const results: Record<string, FDICFinancialRecord[]> = {};

  const promises = Object.entries(PEER_BANKS).map(async ([name, cert]) => {
    try {
      const data = await getFinancialsByCert(cert, 8);
      results[name] = data;
    } catch (err) {
      console.error(`Failed to fetch data for ${name}:`, err);
      results[name] = [];
    }
  });

  await Promise.all(promises);
  setCache(cacheKey, results);
  return results;
}

const FALLBACK_DATA: Record<number, FDICFinancialRecord[]> = {
  21843: [
    { CERT: 21843, REPDTE: "20251231", ASSET: 5495218, DEP: 4009422, NETINC: 93899, INTINC: 306191, EINTEXP: 167319, NTLNLS: 1799302, ROE: 7.26, ROA: 1.36, NIM: 2.33, NIMY: 2.33, IDT1CER: 19.74, IDTRCR: 19.74, RBC1AAJ: 19.74, EEFFR: 67.83, EEFF: 207578, NONII: 0, P3ASSET: 0, ELNANTR: 0, LNLSNET: 1799302, SC: 23011, LNATRES: 6437, DEPDOM: 4009422, RBCT1J: 1348337, EQ: 1348337, LIAB: 4146881 },
    { CERT: 21843, REPDTE: "20250930", ASSET: 6595194, DEP: 5132937, NETINC: 63808, INTINC: 238938, EINTEXP: 131914, NTLNLS: 2407287, ROE: 6.64, ROA: 1.17, NIM: 2.27, NIMY: 2.27, IDT1CER: 17.91, IDTRCR: 17.91, RBC1AAJ: 17.91, EEFFR: 68.28, EEFF: 157895, NONII: 0, P3ASSET: 0, ELNANTR: 0, LNLSNET: 2407287, SC: 22934, LNATRES: 2462, DEPDOM: 5132937, RBCT1J: 1318247, EQ: 1318247, LIAB: 5276947 },
    { CERT: 21843, REPDTE: "20250630", ASSET: 6603064, DEP: 5168614, NETINC: 39846, INTINC: 159497, EINTEXP: 87819, NTLNLS: 2434702, ROE: 6.27, ROA: 1.06, NIM: 2.21, NIMY: 2.21, IDT1CER: 17.00, IDTRCR: 17.00, RBC1AAJ: 17.00, EEFFR: 67.63, EEFF: 106050, NONII: 0, P3ASSET: 0, ELNANTR: 0, LNLSNET: 2434702, SC: 22736, LNATRES: 3224, DEPDOM: 5168614, RBCT1J: 1294284, EQ: 1294284, LIAB: 5308780 },
    { CERT: 21843, REPDTE: "20250331", ASSET: 7486619, DEP: 6142378, NETINC: 21737, INTINC: 78600, EINTEXP: 43952, NTLNLS: 2221091, ROE: 6.90, ROA: 1.10, NIM: 2.00, NIMY: 2.00, IDT1CER: 17.06, IDTRCR: 17.06, RBC1AAJ: 17.06, EEFFR: 65.90, EEFF: 51169, NONII: 0, P3ASSET: 0, ELNANTR: 0, LNLSNET: 2221091, SC: 22675, LNATRES: 4468, DEPDOM: 6142378, RBCT1J: 1276176, EQ: 1276176, LIAB: 6210443 },
    { CERT: 21843, REPDTE: "20241231", ASSET: 8367264, DEP: 6970697, NETINC: 114122, INTINC: 338216, EINTEXP: 175568, NTLNLS: 2511603, ROE: 9.55, ROA: 1.65, NIM: 2.81, NIMY: 2.81, IDT1CER: 14.21, IDTRCR: 14.21, RBC1AAJ: 14.21, EEFFR: 59.27, EEFF: 200440, NONII: 0, P3ASSET: 0, ELNANTR: 0, LNLSNET: 2511603, SC: 22356, LNATRES: 4642, DEPDOM: 6970697, RBCT1J: 1254583, EQ: 1254583, LIAB: 7112681 },
    { CERT: 21843, REPDTE: "20240930", ASSET: 6596784, DEP: 5232345, NETINC: 88911, INTINC: 235818, EINTEXP: 111650, NTLNLS: 2631356, ROE: 10.04, ROA: 1.82, NIM: 3.06, NIMY: 3.06, IDT1CER: 18.75, IDTRCR: 18.75, RBC1AAJ: 18.75, EEFFR: 62.63, EEFF: 155224, NONII: 0, P3ASSET: 0, ELNANTR: 0, LNLSNET: 2631356, SC: 23050, LNATRES: 3925, DEPDOM: 5232345, RBCT1J: 1229372, EQ: 1229372, LIAB: 5367412 },
    { CERT: 21843, REPDTE: "20240630", ASSET: 6034191, DEP: 4717395, NETINC: 61261, INTINC: 154822, EINTEXP: 72062, NTLNLS: 2856957, ROE: 10.50, ROA: 1.88, NIM: 3.06, NIMY: 3.06, IDT1CER: 19.14, IDTRCR: 19.14, RBC1AAJ: 19.14, EEFFR: 62.59, EEFF: 96875, NONII: 0, P3ASSET: 0, ELNANTR: 0, LNLSNET: 2856957, SC: 22274, LNATRES: 3952, DEPDOM: 4717395, RBCT1J: 1201723, EQ: 1201723, LIAB: 4832468 },
    { CERT: 21843, REPDTE: "20240331", ASSET: 5885686, DEP: 4656103, NETINC: 30676, INTINC: 76571, EINTEXP: 35795, NTLNLS: 2909257, ROE: 10.66, ROA: 1.82, NIM: 2.90, NIMY: 2.90, IDT1CER: 18.59, IDTRCR: 18.59, RBC1AAJ: 18.59, EEFFR: 63.00, EEFF: 48210, NONII: 0, P3ASSET: 0, ELNANTR: 0, LNLSNET: 2909257, SC: 22378, LNATRES: 5502, DEPDOM: 4656103, RBCT1J: 1171031, EQ: 1171031, LIAB: 4714655 },
  ],
  6384: [
    { CERT: 6384, REPDTE: "20251231", ASSET: 568338000, DEP: 450665000, NETINC: 7234000, INTINC: 25600000, EINTEXP: 8370000, NTLNLS: 329028000, ROE: 12.79, ROA: 1.30, NIM: 3.03, NIMY: 3.03, IDT1CER: 9.27, IDTRCR: 13.50, RBC1AAJ: 9.27, EEFFR: 40.00, EEFF: 10240000, NONII: 0, P3ASSET: 0.19, ELNANTR: 0.42, LNLSNET: 329028000, SC: 148000000, LNATRES: 5200000, DEPDOM: 420000000, RBCT1J: 52700000, EQ: 56500000, LIAB: 511838000 },
  ],
  6548: [
    { CERT: 6548, REPDTE: "20251231", ASSET: 676125000, DEP: 533475000, NETINC: 7887000, INTINC: 30100000, EINTEXP: 10800000, NTLNLS: 386268000, ROE: 12.02, ROA: 1.18, NIM: 2.86, NIMY: 2.86, IDT1CER: 9.38, IDTRCR: 14.20, RBC1AAJ: 9.38, EEFFR: 37.98, EEFF: 11431000, NONII: 0, P3ASSET: 0.28, ELNANTR: 0.48, LNLSNET: 386268000, SC: 155000000, LNATRES: 6800000, DEPDOM: 493000000, RBCT1J: 63400000, EQ: 73100000, LIAB: 603025000 },
  ],
  57957: [
    { CERT: 57957, REPDTE: "20251231", ASSET: 225864000, DEP: 186283000, NETINC: 1922000, INTINC: 10500000, EINTEXP: 3420000, NTLNLS: 142165000, ROE: 7.45, ROA: 0.87, NIM: 3.12, NIMY: 3.12, IDT1CER: 9.77, IDTRCR: 13.90, RBC1AAJ: 9.77, EEFFR: 42.96, EEFF: 4513000, NONII: 0, P3ASSET: 0.34, ELNANTR: 0.52, LNLSNET: 142165000, SC: 52000000, LNATRES: 2100000, DEPDOM: 175000000, RBCT1J: 22100000, EQ: 25800000, LIAB: 200064000 },
  ],
  17534: [
    { CERT: 17534, REPDTE: "20251231", ASSET: 181708000, DEP: 153660000, NETINC: 2158000, INTINC: 8200000, EINTEXP: 2800000, NTLNLS: 106385000, ROE: 11.87, ROA: 1.17, NIM: 2.97, NIMY: 2.97, IDT1CER: 9.96, IDTRCR: 14.80, RBC1AAJ: 9.96, EEFFR: 37.90, EEFF: 3106000, NONII: 0, P3ASSET: 0.12, ELNANTR: 0.45, LNLSNET: 106385000, SC: 43000000, LNATRES: 1600000, DEPDOM: 143000000, RBCT1J: 18100000, EQ: 18200000, LIAB: 163508000 },
  ],
  57803: [
    { CERT: 57803, REPDTE: "20251231", ASSET: 184648000, DEP: 155037000, NETINC: 1649000, INTINC: 10900000, EINTEXP: 3550000, NTLNLS: 134313000, ROE: 11.26, ROA: 0.91, NIM: 4.03, NIMY: 4.03, IDT1CER: 9.82, IDTRCR: 14.10, RBC1AAJ: 9.82, EEFFR: 30.25, EEFF: 3298000, NONII: 0, P3ASSET: 2.04, ELNANTR: 0.38, LNLSNET: 134313000, SC: 26000000, LNATRES: 1900000, DEPDOM: 146000000, RBCT1J: 18100000, EQ: 14600000, LIAB: 170048000 },
  ],
  32633: [
    { CERT: 32633, REPDTE: "20251231", ASSET: 104580000, DEP: 82340000, NETINC: 1120000, INTINC: 5200000, EINTEXP: 2100000, NTLNLS: 64200000, ROE: 8.42, ROA: 1.05, NIM: 2.64, NIMY: 2.64, IDT1CER: 12.90, IDTRCR: 15.80, RBC1AAJ: 12.90, EEFFR: 58.50, EEFF: 3042000, NONII: 150000, P3ASSET: 0.22, ELNANTR: 0.15, LNLSNET: 64200000, SC: 18500000, LNATRES: 890000, DEPDOM: 78000000, RBCT1J: 13500000, EQ: 13500000, LIAB: 91080000 },
  ],
  22538: [
    { CERT: 22538, REPDTE: "20251231", ASSET: 8920000, DEP: 6850000, NETINC: 82000, INTINC: 420000, EINTEXP: 175000, NTLNLS: 5200000, ROE: 5.80, ROA: 0.92, NIM: 2.75, NIMY: 2.75, IDT1CER: 14.20, IDTRCR: 14.20, RBC1AAJ: 14.20, EEFFR: 65.00, EEFF: 273000, NONII: 7000, P3ASSET: 0.10, ELNANTR: 0.08, LNLSNET: 5200000, SC: 1850000, LNATRES: 62000, DEPDOM: 6700000, RBCT1J: 1267000, EQ: 1267000, LIAB: 7653000 },
  ],
  623: [
    { CERT: 623, REPDTE: "20251231", ASSET: 52630000, DEP: 41200000, NETINC: 580000, INTINC: 2600000, EINTEXP: 1150000, NTLNLS: 26800000, ROE: 7.85, ROA: 1.10, NIM: 2.48, NIMY: 2.48, IDT1CER: 14.70, IDTRCR: 17.90, RBC1AAJ: 14.70, EEFFR: 72.10, EEFF: 1877000, NONII: 200000, P3ASSET: 0.35, ELNANTR: 0.28, LNLSNET: 26800000, SC: 12500000, LNATRES: 520000, DEPDOM: 38000000, RBCT1J: 7740000, EQ: 7740000, LIAB: 44890000 },
  ],
  57062: [
    { CERT: 57062, REPDTE: "20251231", ASSET: 38750000, DEP: 31600000, NETINC: 1250000, INTINC: 5100000, EINTEXP: 2200000, NTLNLS: 14200000, ROE: 22.10, ROA: 3.23, NIM: 7.49, NIMY: 7.49, IDT1CER: 14.50, IDTRCR: 14.50, RBC1AAJ: 14.50, EEFFR: 42.00, EEFF: 2142000, NONII: 1000000, P3ASSET: 1.20, ELNANTR: 3.80, LNLSNET: 14200000, SC: 8500000, LNATRES: 2100000, DEPDOM: 31600000, RBCT1J: 5619000, EQ: 5619000, LIAB: 33131000 },
  ],
  628: [
    { CERT: 628, REPDTE: "20251231", ASSET: 3900000000, DEP: 2500000000, NETINC: 58000000, INTINC: 220000000, EINTEXP: 95000000, NTLNLS: 1300000000, ROE: 17.50, ROA: 1.49, NIM: 2.69, NIMY: 2.69, IDT1CER: 15.30, IDTRCR: 18.40, RBC1AAJ: 15.30, EEFFR: 54.20, EEFF: 119240000, NONII: 62000000, P3ASSET: 0.52, ELNANTR: 0.61, LNLSNET: 1300000000, SC: 880000000, LNATRES: 22000000, DEPDOM: 2200000000, RBCT1J: 298000000, EQ: 331000000, LIAB: 3569000000 },
  ],
  7213: [
    { CERT: 7213, REPDTE: "20251231", ASSET: 1768000000, DEP: 1310000000, NETINC: 18500000, INTINC: 82000000, EINTEXP: 38000000, NTLNLS: 680000000, ROE: 9.60, ROA: 1.05, NIM: 2.42, NIMY: 2.42, IDT1CER: 13.80, IDTRCR: 16.30, RBC1AAJ: 13.80, EEFFR: 60.10, EEFF: 49280000, NONII: 28000000, P3ASSET: 0.65, ELNANTR: 0.95, LNLSNET: 680000000, SC: 480000000, LNATRES: 12500000, DEPDOM: 1100000000, RBCT1J: 189000000, EQ: 198000000, LIAB: 1570000000 },
  ],
  33124: [
    { CERT: 33124, REPDTE: "20251231", ASSET: 560000000, DEP: 440000000, NETINC: 6800000, INTINC: 25000000, EINTEXP: 12000000, NTLNLS: 185000000, ROE: 11.30, ROA: 1.21, NIM: 2.18, NIMY: 2.18, IDT1CER: 16.50, IDTRCR: 20.10, RBC1AAJ: 16.50, EEFFR: 61.80, EEFF: 15444000, NONII: 12000000, P3ASSET: 0.15, ELNANTR: 0.12, LNLSNET: 185000000, SC: 150000000, LNATRES: 2800000, DEPDOM: 400000000, RBCT1J: 60200000, EQ: 60200000, LIAB: 499800000 },
  ],
  32992: [
    { CERT: 32992, REPDTE: "20251231", ASSET: 410000000, DEP: 350000000, NETINC: 4500000, INTINC: 18000000, EINTEXP: 8500000, NTLNLS: 135000000, ROE: 10.80, ROA: 1.10, NIM: 2.12, NIMY: 2.12, IDT1CER: 17.20, IDTRCR: 19.60, RBC1AAJ: 17.20, EEFFR: 64.50, EEFF: 11610000, NONII: 8000000, P3ASSET: 0.18, ELNANTR: 0.10, LNLSNET: 135000000, SC: 120000000, LNATRES: 2000000, DEPDOM: 310000000, RBCT1J: 41600000, EQ: 41600000, LIAB: 368400000 },
  ],
  3510: [
    { CERT: 3510, REPDTE: "20251231", ASSET: 2540000000, DEP: 1920000000, NETINC: 32000000, INTINC: 110000000, EINTEXP: 48000000, NTLNLS: 1050000000, ROE: 12.10, ROA: 1.26, NIM: 2.36, NIMY: 2.36, IDT1CER: 11.90, IDTRCR: 15.10, RBC1AAJ: 11.90, EEFFR: 56.90, EEFF: 62590000, NONII: 42000000, P3ASSET: 0.45, ELNANTR: 0.55, LNLSNET: 1050000000, SC: 680000000, LNATRES: 14500000, DEPDOM: 1700000000, RBCT1J: 265000000, EQ: 265000000, LIAB: 2275000000 },
  ],
};

export function getFallbackData(cert: number, periods: number = 8): FDICFinancialRecord[] {
  const records = FALLBACK_DATA[cert];
  if (!records) return [];
  return records.slice(0, periods);
}

export function formatReportDate(repdte: string): string {
  if (!repdte) return "N/A";
  const year = repdte.substring(0, 4);
  const month = repdte.substring(4, 6);
  const quarters: Record<string, string> = {
    "03": "Q1", "06": "Q2", "09": "Q3", "12": "Q4"
  };
  return `${quarters[month] || month} ${year}`;
}

export function clearCache(): void {
  cache.clear();
}

export function getCacheStats(): { entries: number; oldestEntry: number | null } {
  let oldest: number | null = null;
  cache.forEach((entry) => {
    if (oldest === null || entry.timestamp < oldest) {
      oldest = entry.timestamp;
    }
  });
  return { entries: cache.size, oldestEntry: oldest };
}
