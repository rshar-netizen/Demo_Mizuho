import { PEER_DISPLAY_NAMES } from "./fdic-api";

export interface DailyTradingPL {
  date: string;
  pnl: number;
}

export interface FFIEC102Quarter {
  period: string;
  rawDate: string;
  tradingDays: number;
  profitableDays: number;
  unprofitableDays: number;
  profitableDaysPct: number;
  totalTradingRevenue: number;
  averageDailyPnL: number;
  maxDailyGain: number;
  maxDailyLoss: number;
  stdDevDailyPnL: number;
  varBreaches: number;
  dailyPnL: DailyTradingPL[];
}

export interface FFIEC102BankData {
  name: string;
  cert: number;
  quarters: FFIEC102Quarter[];
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function generateQuarterDailyPnL(
  rng: () => number,
  avgDailyPnL: number,
  volatility: number,
  tradingDays: number
): DailyTradingPL[] {
  const dailyData: DailyTradingPL[] = [];

  for (let d = 0; d < tradingDays; d++) {
    const u1 = rng();
    const u2 = rng();
    const z = Math.sqrt(-2 * Math.log(Math.max(u1, 0.0001))) * Math.cos(2 * Math.PI * u2);
    const pnl = avgDailyPnL + z * volatility;

    const dayOffset = d + 1;
    const dateStr = `Day ${dayOffset}`;
    dailyData.push({ date: dateStr, pnl: Math.round(pnl * 100) / 100 });
  }

  return dailyData;
}

const QUARTERS_8 = [
  { period: "Q2 2024", rawDate: "20240630", tradingDays: 64 },
  { period: "Q3 2024", rawDate: "20240930", tradingDays: 64 },
  { period: "Q4 2024", rawDate: "20241231", tradingDays: 62 },
  { period: "Q1 2025", rawDate: "20250331", tradingDays: 61 },
  { period: "Q2 2025", rawDate: "20250630", tradingDays: 64 },
  { period: "Q3 2025", rawDate: "20250930", tradingDays: 64 },
  { period: "Q4 2025", rawDate: "20251231", tradingDays: 62 },
  { period: "Q1 2026", rawDate: "20260331", tradingDays: 61 },
];

interface BankProfile {
  cert: number;
  avgDailyPnL: number;
  volatility: number;
  seed: number;
}

const BANK_PROFILES: Record<string, BankProfile> = {
  "Mizuho Americas":      { cert: 21843, avgDailyPnL: 2.8,  volatility: 4.5,  seed: 21843 },
  "MUFG Americas":        { cert: 32633, avgDailyPnL: 3.2,  volatility: 5.0,  seed: 32633 },
  "SMBC (Manufacturers)": { cert: 22538, avgDailyPnL: 1.5,  volatility: 3.2,  seed: 22538 },
  "Deutsche Bank Americas": { cert: 623, avgDailyPnL: 5.5,  volatility: 9.0,  seed: 62300 },
  "Barclays US":          { cert: 57062, avgDailyPnL: 4.0,  volatility: 7.5,  seed: 57062 },
  "JPMorgan Chase":       { cert: 628,   avgDailyPnL: 45.0, volatility: 30.0, seed: 62800 },
  "Citibank":             { cert: 7213,  avgDailyPnL: 25.0, volatility: 20.0, seed: 72130 },
  "Goldman Sachs":        { cert: 33124, avgDailyPnL: 35.0, volatility: 28.0, seed: 33124 },
  "Morgan Stanley":       { cert: 32992, avgDailyPnL: 30.0, volatility: 25.0, seed: 32992 },
  "Bank of America":      { cert: 3510,  avgDailyPnL: 22.0, volatility: 18.0, seed: 35100 },
  "PNC Financial":        { cert: 6384,  avgDailyPnL: 3.5,  volatility: 4.0,  seed: 63840 },
  "U.S. Bancorp":         { cert: 6548,  avgDailyPnL: 2.0,  volatility: 3.0,  seed: 65480 },
  "Citizens Financial":   { cert: 57957, avgDailyPnL: 1.2,  volatility: 2.5,  seed: 57957 },
  "KeyCorp":              { cert: 17534, avgDailyPnL: 1.0,  volatility: 2.0,  seed: 17534 },
  "M&T Bank":             { cert: 57803, avgDailyPnL: 0.8,  volatility: 1.8,  seed: 57803 },
};

let cachedData: FFIEC102BankData[] | null = null;

export function generateFFIEC102Data(): FFIEC102BankData[] {
  if (cachedData) return cachedData;

  const results: FFIEC102BankData[] = [];

  for (const [bankName, profile] of Object.entries(BANK_PROFILES)) {
    const rng = seededRandom(profile.seed);
    const quarters: FFIEC102Quarter[] = [];

    for (const q of QUARTERS_8) {
      const seasonalAdj = q.period.includes("Q4") ? 0.85 : q.period.includes("Q1") ? 0.95 : 1.0;
      const adjAvg = profile.avgDailyPnL * seasonalAdj;

      const dailyPnL = generateQuarterDailyPnL(rng, adjAvg, profile.volatility, q.tradingDays);

      const profitableDays = dailyPnL.filter(d => d.pnl > 0).length;
      const unprofitableDays = q.tradingDays - profitableDays;
      const totalRevenue = dailyPnL.reduce((s, d) => s + d.pnl, 0);
      const avgPnL = totalRevenue / q.tradingDays;
      const maxGain = Math.max(...dailyPnL.map(d => d.pnl));
      const maxLoss = Math.min(...dailyPnL.map(d => d.pnl));
      const mean = avgPnL;
      const variance = dailyPnL.reduce((s, d) => s + (d.pnl - mean) ** 2, 0) / q.tradingDays;
      const stdDev = Math.sqrt(variance);
      const varThreshold = mean - 2.33 * stdDev;
      const varBreaches = dailyPnL.filter(d => d.pnl < varThreshold).length;

      quarters.push({
        period: q.period,
        rawDate: q.rawDate,
        tradingDays: q.tradingDays,
        profitableDays,
        unprofitableDays,
        profitableDaysPct: Math.round((profitableDays / q.tradingDays) * 1000) / 10,
        totalTradingRevenue: Math.round(totalRevenue * 100) / 100,
        averageDailyPnL: Math.round(avgPnL * 100) / 100,
        maxDailyGain: Math.round(maxGain * 100) / 100,
        maxDailyLoss: Math.round(maxLoss * 100) / 100,
        stdDevDailyPnL: Math.round(stdDev * 100) / 100,
        varBreaches,
        dailyPnL,
      });
    }

    results.push({
      name: bankName,
      cert: profile.cert,
      quarters,
    });
  }

  cachedData = results;
  return results;
}

export function getFFIEC102ForCert(cert: number): FFIEC102BankData | null {
  const data = generateFFIEC102Data();
  return data.find(d => d.cert === cert) || null;
}

export function clearFFIEC102Cache(): void {
  cachedData = null;
}
