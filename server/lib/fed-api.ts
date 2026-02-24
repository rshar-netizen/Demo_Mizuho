const FED_NIC_BASE = "https://www.ffiec.gov/nicpubweb/nicweb";

export interface FRY9CData {
  bhcName: string;
  rssdId: string;
  reportDate: string;
  formType: string;
  metrics: FRY9CMetrics;
}

export interface FRY9CMetrics {
  totalConsolidatedAssets: number | null;
  totalLoans: number | null;
  totalDeposits: number | null;
  totalEquityCapital: number | null;
  netIncome: number | null;
  netInterestIncome: number | null;
  nonInterestIncome: number | null;
  provisionForCreditLosses: number | null;
  totalRiskWeightedAssets: number | null;
  cet1Capital: number | null;
  cet1Ratio: number | null;
  tier1CapitalRatio: number | null;
  totalCapitalRatio: number | null;
  supplementaryLeverageRatio: number | null;
}

export interface FedConnectionStatus {
  source: string;
  status: "connected" | "degraded" | "error";
  lastChecked: number;
  responseTimeMs: number;
  message: string;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const fry9cCache = new Map<string, CacheEntry<FRY9CData>>();
const CACHE_TTL = 30 * 60 * 1000;

export const BHC_RSSD_IDS: Record<string, string> = {
  "Mizuho Americas": "3819869",
  "MUFG Americas": "1378434",
  "PNC Financial": "817824",
  "U.S. Bancorp": "1119794",
  "Citizens Financial": "1132449",
  "KeyCorp": "1068025",
  "M&T Bank": "3587412",
};

export async function checkFedConnection(): Promise<FedConnectionStatus> {
  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${FED_NIC_BASE}/SearchForm.aspx`, {
      method: "HEAD",
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const elapsed = Date.now() - startTime;

    return {
      source: "Federal Reserve NIC",
      status: "connected",
      lastChecked: Date.now(),
      responseTimeMs: elapsed,
      message: "Federal Reserve NIC portal is accessible",
    };
  } catch (err: any) {
    return {
      source: "Federal Reserve NIC",
      status: "degraded" as const,
      lastChecked: Date.now(),
      responseTimeMs: Date.now() - startTime,
      message: `Federal Reserve NIC: ${err.message || "Connection timeout"}`,
    };
  }
}

export async function fetchFRY9CData(rssdId: string, bhcName: string): Promise<FRY9CData> {
  const cacheKey = `fry9c_${rssdId}`;
  const cached = fry9cCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const url = `${FED_NIC_BASE}/InstitutionProfile.aspx?parID_Rssd=${rssdId}&parDT_END=99991231`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "RegAssist-AI/1.0 (Regulatory Intelligence Platform)",
        "Accept": "text/html,application/xhtml+xml",
      },
    });

    clearTimeout(timeout);

    if (response.ok) {
      const html = await response.text();
      const metrics = parseNICInstitutionProfile(html);

      const data: FRY9CData = {
        bhcName,
        rssdId,
        reportDate: new Date().toISOString().split("T")[0],
        formType: "FR Y-9C",
        metrics,
      };

      fry9cCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    }
  } catch (err) {
    console.log(`FR Y-9C fetch for ${bhcName} (${rssdId}): using computed metrics`);
  }

  const data: FRY9CData = {
    bhcName,
    rssdId,
    reportDate: new Date().toISOString().split("T")[0],
    formType: "FR Y-9C",
    metrics: {
      totalConsolidatedAssets: null,
      totalLoans: null,
      totalDeposits: null,
      totalEquityCapital: null,
      netIncome: null,
      netInterestIncome: null,
      nonInterestIncome: null,
      provisionForCreditLosses: null,
      totalRiskWeightedAssets: null,
      cet1Capital: null,
      cet1Ratio: null,
      tier1CapitalRatio: null,
      totalCapitalRatio: null,
      supplementaryLeverageRatio: null,
    },
  };

  fry9cCache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}

function parseNICInstitutionProfile(html: string): FRY9CMetrics {
  const extractNumber = (label: string): number | null => {
    const regex = new RegExp(`${label}[^\\d]*?\\$?([\\d,.]+)`, "i");
    const match = html.match(regex);
    if (match) {
      return parseFloat(match[1].replace(/,/g, ""));
    }
    return null;
  };

  return {
    totalConsolidatedAssets: extractNumber("Total Assets"),
    totalLoans: extractNumber("Total Loans"),
    totalDeposits: extractNumber("Total Deposits"),
    totalEquityCapital: extractNumber("Total Equity"),
    netIncome: extractNumber("Net Income"),
    netInterestIncome: extractNumber("Net Interest Income"),
    nonInterestIncome: extractNumber("Non.?interest Income"),
    provisionForCreditLosses: extractNumber("Provision"),
    totalRiskWeightedAssets: extractNumber("Risk.?Weighted"),
    cet1Capital: extractNumber("CET1 Capital"),
    cet1Ratio: extractNumber("CET1.*Ratio"),
    tier1CapitalRatio: extractNumber("Tier 1.*Ratio"),
    totalCapitalRatio: extractNumber("Total Capital.*Ratio"),
    supplementaryLeverageRatio: extractNumber("Supplementary Leverage"),
  };
}

export async function getAllBHCData(): Promise<Record<string, FRY9CData>> {
  const results: Record<string, FRY9CData> = {};

  const promises = Object.entries(BHC_RSSD_IDS).map(async ([name, rssd]) => {
    try {
      results[name] = await fetchFRY9CData(rssd, name);
    } catch (err) {
      console.error(`Failed FR Y-9C for ${name}:`, err);
    }
  });

  await Promise.all(promises);
  return results;
}

export function clearFRY9CCache(): void {
  fry9cCache.clear();
}
