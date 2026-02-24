import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  getFinancialsByCert,
  getAllPeerFinancials,
  checkFDICConnection,
  PEER_BANKS,
  PEER_DISPLAY_NAMES,
  formatReportDate,
  clearCache,
  getCacheStats,
  computeNIMPercent,
  computeNPAPercent,
  computeLoanToDeposit,
  type FDICFinancialRecord,
} from "./lib/fdic-api";
import {
  checkFFIECConnection,
  fetchUBPRData,
  getAllPeerUBPR,
  PEER_RSSD_IDS,
  clearUBPRCache,
} from "./lib/ffiec-api";
import {
  checkFedConnection,
  fetchFRY9CData,
  getAllBHCData,
  BHC_RSSD_IDS,
  clearFRY9CCache,
} from "./lib/fed-api";

function mapRecord(f: FDICFinancialRecord, cert: number) {
  return {
    reportDate: formatReportDate(f.REPDTE),
    rawDate: f.REPDTE,
    institutionName: PEER_DISPLAY_NAMES[cert] || `CERT ${cert}`,
    cert: f.CERT || cert,
    totalAssets: f.ASSET,
    totalDeposits: f.DEP,
    netIncome: f.NETINC,
    totalInterestIncome: f.INTINC,
    totalInterestExpense: f.EINTEXP,
    totalLoansAndLeases: f.LNLSNET || f.NTLNLS,
    roe: f.ROE,
    roa: f.ROA,
    nim: computeNIMPercent(f),
    tier1Ratio: f.IDT1CER,
    totalCapitalRatio: f.IDTRCR,
    efficiencyRatio: f.EEFFR,
    npaRatio: computeNPAPercent(f),
    chargeOffRate: f.ELNANTR,
    loanToDeposit: computeLoanToDeposit(f),
    securities: f.SC,
    loanLossReserve: f.LNATRES,
    domesticDeposits: f.DEPDOM,
    tier1Capital: f.RBCT1J,
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/data-sources/status", async (_req, res) => {
    try {
      const [fdicCheck, ffiecStatus, fedStatus] = await Promise.all([
        checkFDICConnection(),
        checkFFIECConnection(),
        checkFedConnection(),
      ]);

      const cacheStats = getCacheStats();

      res.json({
        sources: [
          {
            source: "FDIC BankFind Suite",
            status: fdicCheck.connected ? "connected" : "error",
            lastChecked: Date.now(),
            responseTimeMs: fdicCheck.responseTimeMs,
            message: fdicCheck.message,
            reportType: "Call Reports (FFIEC 031/041)",
            entity: "Mizuho Americas LLC",
            identifier: "RSSD: 3819869",
          },
          {
            ...ffiecStatus,
            reportType: "UBPR (Uniform Bank Performance Report)",
            entity: "Mizuho Americas LLC",
            identifier: `RSSD: ${PEER_RSSD_IDS["Mizuho Americas"]}`,
          },
          {
            ...fedStatus,
            reportType: "FR Y-9C (Consolidated Financial Statements for BHCs)",
            entity: "Mizuho Americas LLC",
            identifier: `RSSD: ${BHC_RSSD_IDS["Mizuho Americas"]}`,
          },
        ],
        cache: cacheStats,
        lastRefresh: Date.now(),
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to check data source status" });
    }
  });

  app.get("/api/data-sources/call-reports", async (req, res) => {
    try {
      const cert = parseInt(req.query.cert as string) || PEER_BANKS["PNC Bank, N.A."];
      const periods = parseInt(req.query.periods as string) || 8;

      const financials = await getFinancialsByCert(cert, periods);
      const mapped = financials.map((f) => mapRecord(f, cert));

      res.json({
        source: "FDIC BankFind Suite API",
        reportType: "Call Report (FFIEC 031/041)",
        cert,
        recordCount: mapped.length,
        fetchedAt: new Date().toISOString(),
        data: mapped,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to fetch Call Report data" });
    }
  });

  app.get("/api/data-sources/ubpr", async (req, res) => {
    try {
      const rssdId = (req.query.rssd as string) || PEER_RSSD_IDS["Mizuho Americas"];
      const bankName = (req.query.name as string) || "Mizuho Americas";

      const ubprData = await fetchUBPRData(rssdId, bankName);

      res.json({
        source: "FFIEC Central Data Repository",
        reportType: "UBPR (Uniform Bank Performance Report)",
        rssdId,
        fetchedAt: new Date().toISOString(),
        data: ubprData,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to fetch UBPR data" });
    }
  });

  app.get("/api/data-sources/fry9c", async (req, res) => {
    try {
      const rssdId = (req.query.rssd as string) || BHC_RSSD_IDS["Mizuho Americas"];
      const bhcName = (req.query.name as string) || "Mizuho Americas";

      const fry9cData = await fetchFRY9CData(rssdId, bhcName);

      res.json({
        source: "Federal Reserve NIC",
        reportType: "FR Y-9C (Consolidated Financial Statements)",
        rssdId,
        fetchedAt: new Date().toISOString(),
        data: fry9cData,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to fetch FR Y-9C data" });
    }
  });

  app.get("/api/data-sources/peer-data", async (_req, res) => {
    try {
      const [callReports, ubprData, fry9cData] = await Promise.all([
        getAllPeerFinancials(),
        getAllPeerUBPR(),
        getAllBHCData(),
      ]);

      const peerSummary = Object.entries(PEER_BANKS).map(([name, cert]) => {
        const records = callReports[name] || [];
        const latestReport = records[0];
        const displayName = PEER_DISPLAY_NAMES[cert] || name;
        const ubpr = ubprData[displayName];
        const fry9c = fry9cData[displayName];

        return {
          name: displayName,
          cert,
          rssd: PEER_RSSD_IDS[displayName] || null,
          callReport: latestReport ? {
            reportDate: formatReportDate(latestReport.REPDTE),
            totalAssets: latestReport.ASSET,
            totalDeposits: latestReport.DEP,
            totalLoans: latestReport.LNLSNET || latestReport.NTLNLS,
            netIncome: latestReport.NETINC,
            roe: latestReport.ROE,
            roa: latestReport.ROA,
            nim: computeNIMPercent(latestReport),
            tier1Ratio: latestReport.IDT1CER,
            totalCapitalRatio: latestReport.IDTRCR,
            efficiencyRatio: latestReport.EEFFR,
            npaRatio: computeNPAPercent(latestReport),
            chargeOffRate: latestReport.ELNANTR,
            loanToDeposit: computeLoanToDeposit(latestReport),
          } : null,
          ubpr: ubpr?.metrics || null,
          fry9c: fry9c?.metrics || null,
          historicalData: records.map((r) => ({
            period: formatReportDate(r.REPDTE),
            rawDate: r.REPDTE,
            totalAssets: r.ASSET,
            totalDeposits: r.DEP,
            totalLoans: r.LNLSNET || r.NTLNLS,
            netIncome: r.NETINC,
            roe: r.ROE,
            roa: r.ROA,
            nim: computeNIMPercent(r),
            tier1Ratio: r.IDT1CER,
          })),
        };
      });

      res.json({
        sources: ["FDIC BankFind Suite", "FFIEC CDR", "Federal Reserve NIC"],
        fetchedAt: new Date().toISOString(),
        peerCount: peerSummary.length,
        data: peerSummary,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to fetch peer data" });
    }
  });

  app.post("/api/data-sources/refresh", async (_req, res) => {
    try {
      clearCache();
      clearUBPRCache();
      clearFRY9CCache();

      const [callReports, ubprData, fry9cData] = await Promise.all([
        getAllPeerFinancials(),
        getAllPeerUBPR(),
        getAllBHCData(),
      ]);

      const callReportCount = Object.values(callReports).reduce((sum, arr) => sum + arr.length, 0);
      const ubprCount = Object.keys(ubprData).length;
      const fry9cCount = Object.keys(fry9cData).length;

      res.json({
        success: true,
        refreshedAt: new Date().toISOString(),
        summary: {
          callReports: { institutions: Object.keys(callReports).length, records: callReportCount },
          ubpr: { institutions: ubprCount },
          fry9c: { institutions: fry9cCount },
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Refresh failed" });
    }
  });

  return httpServer;
}
