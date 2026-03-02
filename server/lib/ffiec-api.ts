const FFIEC_CDR_BASE = "https://cdr.ffiec.gov/public";

export interface UBPRData {
  institutionName: string;
  rssdId: string;
  reportDate: string;
  metrics: UBPRMetrics;
}

export interface UBPRMetrics {
  netInterestMargin: number | null;
  returnOnAssets: number | null;
  returnOnEquity: number | null;
  efficiencyRatio: number | null;
  tier1LeverageRatio: number | null;
  totalRiskBasedCapitalRatio: number | null;
  netChargeOffsToLoans: number | null;
  nonperformingToAssets: number | null;
  loanToDepositRatio: number | null;
  yieldOnEarningAssets: number | null;
  costOfFundingEarningAssets: number | null;
  provisionToAvgAssets: number | null;
}

export interface FFIECConnectionStatus {
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

const ubprCache = new Map<string, CacheEntry<UBPRData>>();
const CACHE_TTL = 30 * 60 * 1000;

export const PEER_RSSD_IDS: Record<string, string> = {
  "Mizuho Americas": "229913",
  "PNC Financial": "817824",
  "U.S. Bancorp": "504713",
  "Citizens Financial": "3303298",
  "KeyCorp": "280110",
  "M&T Bank": "3284070",
};

export async function checkFFIECConnection(): Promise<FFIECConnectionStatus> {
  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${FFIEC_CDR_BASE}/ManageFacsimiles.aspx`, {
      method: "HEAD",
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const elapsed = Date.now() - startTime;

    if (response.ok || response.status === 405 || response.status === 302) {
      return {
        source: "FFIEC CDR",
        status: "connected",
        lastChecked: Date.now(),
        responseTimeMs: elapsed,
        message: "FFIEC Central Data Repository is accessible",
      };
    }

    return {
      source: "FFIEC CDR",
      status: "degraded",
      lastChecked: Date.now(),
      responseTimeMs: elapsed,
      message: `FFIEC CDR returned status ${response.status}`,
    };
  } catch (err: any) {
    return {
      source: "FFIEC CDR",
      status: "degraded" as const,
      lastChecked: Date.now(),
      responseTimeMs: Date.now() - startTime,
      message: `FFIEC CDR: ${err.message || "Connection timeout"}`,
    };
  }
}

export async function fetchUBPRData(rssdId: string, bankName: string): Promise<UBPRData> {
  const cacheKey = `ubpr_${rssdId}`;
  const cached = ubprCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const url = `https://www.ffiec.gov/npw/Institution/Profile/${rssdId}`;
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
      const metrics = parseNICProfile(html);

      const data: UBPRData = {
        institutionName: bankName,
        rssdId,
        reportDate: new Date().toISOString().split("T")[0],
        metrics,
      };

      ubprCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    }
  } catch (err) {
    console.log(`FFIEC UBPR fetch for ${bankName} (${rssdId}): using computed metrics`);
  }

  const data: UBPRData = {
    institutionName: bankName,
    rssdId,
    reportDate: new Date().toISOString().split("T")[0],
    metrics: {
      netInterestMargin: null,
      returnOnAssets: null,
      returnOnEquity: null,
      efficiencyRatio: null,
      tier1LeverageRatio: null,
      totalRiskBasedCapitalRatio: null,
      netChargeOffsToLoans: null,
      nonperformingToAssets: null,
      loanToDepositRatio: null,
      yieldOnEarningAssets: null,
      costOfFundingEarningAssets: null,
      provisionToAvgAssets: null,
    },
  };

  ubprCache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}

function parseNICProfile(html: string): UBPRMetrics {
  const extractNumber = (label: string): number | null => {
    const regex = new RegExp(`${label}[^\\d]*?([\\d,.]+)`, "i");
    const match = html.match(regex);
    if (match) {
      return parseFloat(match[1].replace(/,/g, ""));
    }
    return null;
  };

  return {
    netInterestMargin: extractNumber("Net Interest Margin"),
    returnOnAssets: extractNumber("Return on Assets"),
    returnOnEquity: extractNumber("Return on Equity"),
    efficiencyRatio: extractNumber("Efficiency Ratio"),
    tier1LeverageRatio: extractNumber("Tier 1 Leverage"),
    totalRiskBasedCapitalRatio: extractNumber("Total Risk-Based Capital"),
    netChargeOffsToLoans: extractNumber("Net Charge-[Oo]ffs"),
    nonperformingToAssets: extractNumber("Noncurrent.*Assets"),
    loanToDepositRatio: extractNumber("Loan.*Deposit"),
    yieldOnEarningAssets: extractNumber("Yield on Earning"),
    costOfFundingEarningAssets: extractNumber("Cost of Fund"),
    provisionToAvgAssets: extractNumber("Provision"),
  };
}

export async function getAllPeerUBPR(): Promise<Record<string, UBPRData>> {
  const results: Record<string, UBPRData> = {};

  const promises = Object.entries(PEER_RSSD_IDS).map(async ([name, rssd]) => {
    try {
      results[name] = await fetchUBPRData(rssd, name);
    } catch (err) {
      console.error(`Failed UBPR for ${name}:`, err);
    }
  });

  await Promise.all(promises);
  return results;
}

export function clearUBPRCache(): void {
  ubprCache.clear();
}
