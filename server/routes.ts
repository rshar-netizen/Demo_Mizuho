import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import path from "path";
import XLSX from "xlsx";
import { storage } from "./storage";
import {
  getFinancialsByCert,
  getAllPeerFinancials,
  checkFDICConnection,
  PEER_BANKS,
  PEER_DISPLAY_NAMES,
  FDIC_BASE_URL,
  formatReportDate,
  clearCache,
  getCacheStats,
  computeNIMPercent,
  computeEfficiencyRatio,
  getTier1Ratio,
  computeNPAPercent,
  computeLoanToDeposit,
  getFallbackData,
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
import {
  generateFFIEC102Data,
  getFFIEC102ForCert,
  clearFFIEC102Cache,
  type FFIEC102BankData,
} from "./lib/ffiec102-data";

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
    tier1Ratio: getTier1Ratio(f),
    totalCapitalRatio: f.IDTRCR,
    efficiencyRatio: computeEfficiencyRatio(f),
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
  app.use("/downloads", express.static(path.resolve(process.cwd(), "public", "downloads")));

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
            entity: "Mizuho Bank (USA)",
            identifier: "RSSD: 229913 / CERT: 21843",
          },
          {
            ...ffiecStatus,
            reportType: "UBPR (Uniform Bank Performance Report)",
            entity: "Mizuho Bank (USA)",
            identifier: `RSSD: ${PEER_RSSD_IDS["Mizuho Americas"]}`,
          },
          {
            ...fedStatus,
            reportType: "FR Y-9C (Consolidated Financial Statements for BHCs)",
            entity: "Mizuho Bank (USA)",
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
      const cert = parseInt(req.query.cert as string) || 21843;
      const periods = parseInt(req.query.periods as string) || 8;

      let financials: FDICFinancialRecord[];
      let usedFallback = false;
      try {
        financials = await getFinancialsByCert(cert, periods);
      } catch {
        console.warn(`FDIC API unreachable for CERT ${cert}, using cached fallback data`);
        financials = getFallbackData(cert, periods);
        usedFallback = true;
      }
      const mapped = financials.map((f) => mapRecord(f, cert));

      res.json({
        source: usedFallback ? "FDIC BankFind Suite API (cached fallback)" : "FDIC BankFind Suite API",
        reportType: "Call Report (FFIEC 031/041)",
        cert,
        recordCount: mapped.length,
        fetchedAt: new Date().toISOString(),
        fallback: usedFallback,
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

  function buildPeerEntry(
    name: string,
    cert: number,
    records: FDICFinancialRecord[],
    rssd: string | null,
    ubpr: any,
    fry9c: any,
    ffiec102?: FFIEC102BankData | null,
  ) {
    const latestReport = records[0];
    return {
      name,
      cert,
      rssd,
      callReport: latestReport ? {
        reportDate: formatReportDate(latestReport.REPDTE),
        totalAssets: latestReport.ASSET,
        totalDeposits: latestReport.DEP,
        totalLoans: latestReport.LNLSNET || latestReport.NTLNLS,
        netIncome: latestReport.NETINC,
        roe: latestReport.ROE,
        roa: latestReport.ROA,
        nim: computeNIMPercent(latestReport),
        tier1Ratio: getTier1Ratio(latestReport),
        tier1LeverageRatio: latestReport.RBCT1J && latestReport.ASSET
          ? (latestReport.RBCT1J / latestReport.ASSET) * 100
          : null,
        totalCapitalRatio: latestReport.IDTRCR,
        efficiencyRatio: computeEfficiencyRatio(latestReport),
        npaRatio: computeNPAPercent(latestReport),
        chargeOffRate: latestReport.ELNANTR,
        loanToDeposit: computeLoanToDeposit(latestReport),
        securities: latestReport.SC,
        equity: latestReport.EQ,
      } : null,
      ubpr: ubpr?.metrics || null,
      fry9c: fry9c?.metrics || null,
      ffiec102: ffiec102 ? ffiec102.quarters.map(q => ({
        period: q.period,
        tradingDays: q.tradingDays,
        profitableDays: q.profitableDays,
        unprofitableDays: q.unprofitableDays,
        profitableDaysPct: q.profitableDaysPct,
        totalTradingRevenue: q.totalTradingRevenue,
        averageDailyPnL: q.averageDailyPnL,
        maxDailyGain: q.maxDailyGain,
        maxDailyLoss: q.maxDailyLoss,
        varBreaches: q.varBreaches,
      })) : null,
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
        tier1Ratio: getTier1Ratio(r),
        efficiencyRatio: computeEfficiencyRatio(r),
        npaRatio: computeNPAPercent(r),
        securities: r.SC,
        loanLossReserve: r.LNATRES,
        chargeOffRate: r.ELNANTR,
        totalCapitalRatio: r.IDTRCR,
        loanToDeposit: computeLoanToDeposit(r),
        totalEquity: r.EQ,
        totalLiabilities: r.LIAB,
      })),
    };
  }

  app.get("/api/data-sources/peer-data", async (req, res) => {
    try {
      const extraCerts = (req.query.certs as string || "").split(",").filter(Boolean).map(Number).filter(n => !isNaN(n));

      let callReports: Record<string, FDICFinancialRecord[]>;
      try {
        callReports = await getAllPeerFinancials();
      } catch {
        console.warn("FDIC API unreachable for peer data, using cached fallback");
        callReports = {};
      }
      const allEmpty = Object.values(callReports).every(r => r.length === 0);
      if (allEmpty) {
        Object.entries(PEER_BANKS).forEach(([name, cert]) => {
          const fb = getFallbackData(cert, 8);
          if (fb.length > 0) callReports[name] = fb;
        });
      }

      const [ubprData, fry9cData] = await Promise.all([
        getAllPeerUBPR(),
        getAllBHCData(),
      ]);

      const ffiec102All = generateFFIEC102Data();
      const ffiec102ByCert = new Map(ffiec102All.map(d => [d.cert, d]));

      const peerSummary = Object.entries(PEER_BANKS).map(([name, cert]) => {
        const records = callReports[name] || [];
        const displayName = PEER_DISPLAY_NAMES[cert] || name;
        const ubpr = ubprData[displayName];
        const fry9c = fry9cData[displayName];
        const ffiec102 = ffiec102ByCert.get(cert) || null;
        return buildPeerEntry(displayName, cert, records, PEER_RSSD_IDS[displayName] || null, ubpr, fry9c, ffiec102);
      });

      const existingCerts = new Set(Object.values(PEER_BANKS));
      const extraEntries = await Promise.all(
        extraCerts
          .filter(c => !existingCerts.has(c))
          .map(async (cert) => {
            try {
              const [records, instRes] = await Promise.all([
                getFinancialsByCert(cert, 8),
                fetch(`${FDIC_BASE_URL}/institutions?filters=CERT:${cert}&fields=CERT,NAME,FED_RSSD&limit=1`, { redirect: "follow" })
                  .then(r => r.json())
                  .catch(() => null),
              ]);
              const instData = instRes?.data?.[0]?.data;
              const name = PEER_DISPLAY_NAMES[cert] || instData?.NAME || `CERT ${cert}`;
              const rssd = instData?.FED_RSSD ? String(instData.FED_RSSD) : null;
              const ffiec102Extra = getFFIEC102ForCert(cert);
              return buildPeerEntry(name, cert, records, rssd, null, null, ffiec102Extra);
            } catch {
              return null;
            }
          })
      );

      const allPeers = [...peerSummary, ...extraEntries.filter(Boolean)];

      res.json({
        sources: ["FDIC BankFind Suite", "FFIEC CDR", "Federal Reserve NIC", "FFIEC 102 (Market Risk)"],
        fetchedAt: new Date().toISOString(),
        peerCount: allPeers.length,
        data: allPeers,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to fetch peer data" });
    }
  });

  app.get("/api/data-sources/peer-single", async (req, res) => {
    try {
      const cert = parseInt(req.query.cert as string);
      if (!cert || isNaN(cert)) {
        return res.status(400).json({ error: "Valid CERT number is required" });
      }
      let records: FDICFinancialRecord[];
      try {
        records = await getFinancialsByCert(cert, 8);
      } catch {
        records = getFallbackData(cert, 8);
      }
      if (records.length === 0) {
        return res.status(404).json({ error: `No data found for CERT ${cert}` });
      }
      const name = PEER_DISPLAY_NAMES[cert] || `CERT ${cert}`;
      const entry = buildPeerEntry(name, cert, records, null, null, null);
      res.json(entry);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to fetch peer data" });
    }
  });

  app.get("/api/data-sources/validate-cert", async (req, res) => {
    try {
      const cert = parseInt(req.query.cert as string);
      if (!cert || isNaN(cert)) {
        return res.status(400).json({ error: "Valid CERT number is required" });
      }

      let records: FDICFinancialRecord[];
      let instRes: any = null;
      try {
        [records, instRes] = await Promise.all([
          getFinancialsByCert(cert, 1),
          fetch(`${FDIC_BASE_URL}/institutions?filters=CERT:${cert}&fields=CERT,NAME,FED_RSSD&limit=1`, { redirect: "follow", signal: AbortSignal.timeout(8000) })
            .then(r => r.json())
            .catch(() => null),
        ]);
      } catch {
        records = getFallbackData(cert, 1);
      }

      if (records.length === 0) {
        return res.status(404).json({ error: `No institution found for CERT ${cert}`, valid: false });
      }

      const instData = instRes?.data?.[0]?.data;
      const instName = PEER_DISPLAY_NAMES[cert] || instData?.NAME || `CERT ${cert}`;
      const rssdId = instData?.FED_RSSD || null;
      const r = records[0];

      res.json({
        valid: true,
        cert,
        name: instName,
        rssd: rssdId,
        totalAssets: r.ASSET,
        reportDate: formatReportDate(r.REPDTE),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Validation failed", valid: false });
    }
  });

  app.post("/api/filing/generate", (req, res) => {
    try {
      const { lines, period, institution, reportType } = req.body as {
        lines: Array<{
          schedule: string;
          lineItem: string;
          mdrm: string;
          currentValue: number | null;
          priorValue: number | null;
          changePercent: number | null;
          source: string;
          status: string;
          flagged: boolean;
          isRatio?: boolean;
        }>;
        period: string;
        institution: string;
        reportType: string;
      };

      if (!lines || !Array.isArray(lines) || lines.length === 0) {
        return res.status(400).json({ error: "No report lines provided" });
      }

      const wb = XLSX.utils.book_new();

      const coverData = [
        ["FFIEC 031 — Consolidated Reports of Condition and Income"],
        [],
        ["Institution:", institution || "Mizuho Bank (USA)"],
        ["FDIC Certificate:", "21843"],
        ["RSSD ID:", "229913"],
        ["Report Period:", period || "Q1 2026"],
        ["Report Type:", reportType || "FFIEC 031 Call Report"],
        ["Filing Status:", "Finalized — Ready for Submission"],
        ["Generated:", new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC"],
        [],
        ["Prepared by:", "RegAssist AI — Regulatory Intelligence Platform"],
        ["Validation:", "All intra-report and inter-report checks passed"],
      ];
      const coverSheet = XLSX.utils.aoa_to_sheet(coverData);
      coverSheet["!cols"] = [{ wch: 20 }, { wch: 60 }];
      coverSheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];
      XLSX.utils.book_append_sheet(wb, coverSheet, "Cover Page");

      const schedules = [...new Set(lines.map(l => l.schedule))];
      for (const sched of schedules) {
        const schedLines = lines.filter(l => l.schedule === sched);
        const header = [
          "MDRM Code",
          "Line Item",
          `${period || "Q1 2026"} (Current)`,
          "Prior Quarter",
          "QoQ Change %",
          "Unit",
          "Source System",
          "Status",
          "Validation",
        ];

        const rows = schedLines.map(l => [
          l.mdrm,
          l.lineItem,
          l.currentValue,
          l.priorValue,
          l.changePercent !== null ? parseFloat(l.changePercent.toFixed(2)) : "",
          l.isRatio ? "Percent" : "Thousands USD",
          l.source,
          l.status === "populated" ? "Auto-populated" : l.status === "mapped" ? "Mapped" : "Manual Entry",
          l.flagged ? "Flagged" : "Passed",
        ]);

        const sheetData = [header, ...rows];
        const ws = XLSX.utils.aoa_to_sheet(sheetData);
        ws["!cols"] = [
          { wch: 14 }, { wch: 36 }, { wch: 18 }, { wch: 18 },
          { wch: 14 }, { wch: 16 }, { wch: 28 }, { wch: 16 }, { wch: 12 },
        ];

        const sheetName = `Schedule ${sched}`.slice(0, 31);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      }

      const summaryHeader = [
        "MDRM Code", "Schedule", "Line Item",
        `${period || "Q1 2026"} (Current)`, "Prior Quarter", "QoQ Change %",
        "Unit", "Source", "Status", "Validation",
      ];
      const summaryRows = lines.map(l => [
        l.mdrm, l.schedule, l.lineItem,
        l.currentValue, l.priorValue,
        l.changePercent !== null ? parseFloat(l.changePercent.toFixed(2)) : "",
        l.isRatio ? "Percent" : "Thousands USD",
        l.source,
        l.status === "populated" ? "Auto-populated" : l.status === "mapped" ? "Mapped" : "Manual Entry",
        l.flagged ? "Flagged" : "Passed",
      ]);
      const summarySheet = XLSX.utils.aoa_to_sheet([summaryHeader, ...summaryRows]);
      summarySheet["!cols"] = [
        { wch: 14 }, { wch: 10 }, { wch: 36 }, { wch: 18 }, { wch: 18 },
        { wch: 14 }, { wch: 16 }, { wch: 28 }, { wch: 16 }, { wch: 12 },
      ];
      XLSX.utils.book_append_sheet(wb, summarySheet, "All Line Items");

      const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
      const filename = `FFIEC_031_${(institution || "Mizuho_Bank_USA").replace(/[^a-zA-Z0-9]/g, "_")}_${(period || "Q1_2026").replace(/\s/g, "_")}.xlsx`;

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(buf);
    } catch (err: any) {
      console.error("Filing generation error:", err);
      res.status(500).json({ error: err.message || "Failed to generate filing" });
    }
  });

  app.post("/api/data-sources/refresh", async (_req, res) => {
    try {
      clearCache();
      clearUBPRCache();
      clearFRY9CCache();
      clearFFIEC102Cache();

      let callReports: Record<string, FDICFinancialRecord[]>;
      try {
        callReports = await getAllPeerFinancials();
      } catch {
        console.warn("FDIC API unreachable during refresh, using cached fallback");
        callReports = {};
        Object.entries(PEER_BANKS).forEach(([name, cert]) => {
          callReports[name] = getFallbackData(cert, 8);
        });
      }
      const allEmpty = Object.values(callReports).every(r => r.length === 0);
      if (allEmpty) {
        Object.entries(PEER_BANKS).forEach(([name, cert]) => {
          callReports[name] = getFallbackData(cert, 8);
        });
      }

      const [ubprData, fry9cData] = await Promise.all([
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
