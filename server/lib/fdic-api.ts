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
  IDT1CER: number;
  IDTRCR: number;
  EEFFR: number;
  P3ASSET: number;
  ELNANTR: number;
  LNLSNET: number;
  SC: number;
  LNATRES: number;
  DEPDOM: number;
  RBCT1J: number;
}

export interface FDICAPIResponse {
  meta: { total: number };
  data: Array<{ data: Partial<FDICFinancialRecord> }>;
  totals: { count: number };
}

const FINANCIAL_FIELDS = [
  "CERT", "REPDTE", "INSTNAME", "ASSET", "DEP", "NETINC", "INTINC", "EINTEXP",
  "NTLNLS", "ROE", "ROA", "NIM", "IDT1CER", "IDTRCR", "EEFFR", "P3ASSET",
  "ELNANTR", "LNLSNET", "SC", "LNATRES", "DEPDOM", "RBCT1J"
].join(",");

export const PEER_BANKS: Record<string, number> = {
  "MUFG Bank, N.A.": 29950,
  "PNC Bank, N.A.": 6384,
  "U.S. Bank N.A.": 6548,
  "Citizens Bank, N.A.": 57957,
  "KeyBank N.A.": 17534,
  "M&T Bank": 57803,
};

export const PEER_DISPLAY_NAMES: Record<number, string> = {
  29950: "MUFG Americas",
  6384: "PNC Financial",
  6548: "U.S. Bancorp",
  57957: "Citizens Financial",
  17534: "KeyCorp",
  57803: "M&T Bank",
};

export function computeNIMPercent(record: FDICFinancialRecord): number {
  if (record.ASSET && record.INTINC && record.EINTEXP) {
    const nii = record.INTINC - record.EINTEXP;
    return (nii / record.ASSET) * 100;
  }
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
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) throw new Error(`FDIC API error: ${response.status}`);
  return await response.json() as FDICAPIResponse;
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
