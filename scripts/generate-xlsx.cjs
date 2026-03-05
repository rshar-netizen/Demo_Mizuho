const XLSX = require("xlsx");
const path = require("path");

const outDir = path.join(__dirname, "..", "public", "downloads");

function makeSheet(headers, rows) {
  const data = [headers, ...rows];
  return XLSX.utils.aoa_to_sheet(data);
}

function rn(min, max, dec = 0) {
  const v = min + Math.random() * (max - min);
  return dec === 0 ? Math.round(v) : parseFloat(v.toFixed(dec));
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const COMMON_HEADERS = [
  "MDRM_Code", "Field_Name", "Schedule", "Line_Reference", "Category",
  "Value_Q1_2026", "Value_Q4_2025", "Value_Q1_2025",
  "QoQ_Change_Pct", "YoY_Change_Pct",
  "Unit", "Source_System", "Entity",
  "Description", "Regulatory_Framework", "Filing_Requirement",
  "Period_End_Date", "Validation_Status"
];

function pctChange(curr, prior) {
  if (!prior || prior === 0) return "";
  return parseFloat(((curr - prior) / Math.abs(prior) * 100).toFixed(2));
}

function row(mdrm, name, schedule, lineRef, category, valQ1, valQ4, valQ1Prior, unit, source, entity, desc, framework, filing) {
  return [
    mdrm, name, schedule, lineRef, category,
    valQ1, valQ4, valQ1Prior,
    pctChange(valQ1, valQ4), pctChange(valQ1, valQ1Prior),
    unit, source, entity,
    desc, framework, filing,
    "2026-03-31", pick(["Validated", "Validated", "Validated", "Pending Review"])
  ];
}

function generateGL() {
  const rows = [
    row("RCFD2170", "Total Assets", "RC", "Line 12", "Balance Sheet",
      5495000, 5612000, 8367000, "Thousands USD", "SAP GL", "MHBK-US",
      "Sum of all asset accounts", "N/A", "Mandatory"),
    row("RCON2200", "Total Deposits", "RC", "Line 13", "Balance Sheet",
      3180000, 3250000, 4920000, "Thousands USD", "SAP GL", "MHBK-US",
      "Total deposits (domestic + foreign)", "N/A", "Mandatory"),
    row("RCFD3210", "Total Equity Capital", "RC", "Line 28", "Balance Sheet",
      824000, 810000, 1190000, "Thousands USD", "SAP GL", "MHBK-US",
      "Total equity capital including minority interest", "N/A", "Mandatory"),
    row("RIAD4340", "Net Income (Loss)", "RI", "Line 14", "Income Statement",
      28500, 31200, 42800, "Thousands USD", "SAP GL", "MHBK-US",
      "Net income after taxes and extraordinary items", "N/A", "Mandatory"),
    row("RIAD4074", "Total Interest Income", "RI", "Line 1.i", "Income Statement",
      78200, 82500, 118000, "Thousands USD", "SAP GL", "MHBK-US",
      "Sum of all interest and fee income", "N/A", "Mandatory"),
    row("RIAD4079", "Total Interest Expense", "RI", "Line 2.f", "Income Statement",
      46800, 49100, 71500, "Thousands USD", "SAP GL", "MHBK-US",
      "Sum of all interest expense", "N/A", "Mandatory"),
    row("RIAD4230", "Total Non-Interest Income", "RI", "Line 5.m", "Income Statement",
      12400, 11800, 18200, "Thousands USD", "SAP GL", "MHBK-US",
      "Service charges, trading revenue, other", "N/A", "Mandatory"),
    row("RIAD4093", "Total Non-Interest Expense", "RI", "Line 7.d", "Income Statement",
      61500, 59200, 80100, "Thousands USD", "SAP GL", "MHBK-US",
      "Salaries, occupancy, other operating", "N/A", "Mandatory"),
    row("RIAD4230B", "Provision for Credit Losses", "RI", "Line 4", "Income Statement",
      4200, 3800, 6100, "Thousands USD", "SAP GL", "MHBK-US",
      "CECL provision for credit losses on all instruments", "ASC 326", "Mandatory"),
    row("RCON6631", "Deposits - Demand (Non-Interest)", "RC-E Part I", "Line 1", "Deposits",
      510000, 530000, 785000, "Thousands USD", "SAP GL", "MHBK-US",
      "Non-interest bearing demand deposits (domestic)", "N/A", "Mandatory"),
    row("RCON6636", "Deposits - NOW Accounts", "RC-E Part I", "Line 2", "Deposits",
      285000, 292000, 440000, "Thousands USD", "SAP GL", "MHBK-US",
      "Interest-bearing transaction accounts", "N/A", "Mandatory"),
    row("RCON2389", "Deposits - MMDA", "RC-E Part I", "Line 3", "Deposits",
      720000, 735000, 1120000, "Thousands USD", "SAP GL", "MHBK-US",
      "Money market deposit accounts", "N/A", "Mandatory"),
    row("RCON6648", "Deposits - Other Savings", "RC-E Part I", "Line 4", "Deposits",
      380000, 390000, 590000, "Thousands USD", "SAP GL", "MHBK-US",
      "Other savings deposits", "N/A", "Mandatory"),
    row("RCON6645", "Deposits - Time < $250K", "RC-E Part I", "Line 5", "Deposits",
      620000, 640000, 985000, "Thousands USD", "SAP GL", "MHBK-US",
      "Time deposits less than $250,000", "N/A", "Mandatory"),
    row("RCONJ473", "Deposits - Time >= $250K", "RC-E Part I", "Line 6", "Deposits",
      665000, 663000, 1000000, "Thousands USD", "SAP GL", "MHBK-US",
      "Time deposits $250,000 or more", "N/A", "Mandatory"),
    row("RIAD4010", "Interest on Loans", "RI", "Line 1.a", "Interest Income",
      52100, 55200, 79000, "Thousands USD", "SAP GL", "MHBK-US",
      "Interest and fee income on loans", "N/A", "Mandatory"),
    row("RIAD4020", "Interest on Investment Securities", "RI", "Line 1.b", "Interest Income",
      18400, 19500, 28000, "Thousands USD", "SAP GL", "MHBK-US",
      "Interest income on held-to-maturity securities", "N/A", "Mandatory"),
    row("RIAD4115", "Interest on Deposits", "RI", "Line 2.a", "Interest Expense",
      31200, 33500, 48000, "Thousands USD", "SAP GL", "MHBK-US",
      "Interest expense on deposits", "N/A", "Mandatory"),
    row("RIAD4180", "Salaries and Employee Benefits", "RI", "Line 7.a", "Non-Interest Expense",
      28500, 27800, 37200, "Thousands USD", "SAP GL", "MHBK-US",
      "Total salaries and employee benefits", "N/A", "Mandatory"),
    row("RIADA220", "Trading Revenue", "RI", "Line 5.c", "Non-Interest Income",
      4800, 4200, 7100, "Thousands USD", "SAP GL", "MHBK-US",
      "Trading revenue from all asset classes", "N/A", "Conditional"),
    row("RIAD3196", "Realized G/L on Securities", "RI", "Line 6.a", "Non-Interest Income",
      -1200, -800, -1500, "Thousands USD", "SAP GL", "MHBK-US",
      "Realized gains (losses) on HTM and AFS securities", "ASC 320", "Mandatory"),
    row("RCFDC026", "AOCI - Unrealized G/L on AFS", "RC-R Part I", "Line 3.a", "Capital",
      -42000, -38000, -65000, "Thousands USD", "SAP GL", "MHBK-US",
      "Accumulated other comprehensive income - AFS securities", "ASC 220", "Mandatory"),
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, makeSheet(COMMON_HEADERS, rows), "GL_Extract");
  XLSX.writeFile(wb, path.join(outDir, "GL_Extract_Q1_2026.xlsx"));
  console.log(`GL_Extract: ${rows.length} rows, ${COMMON_HEADERS.length} columns`);
}

function generateTrading() {
  const rows = [
    row("RIADA220", "Trading Revenue - Total", "RI", "Line 5.c", "Non-Interest Income",
      4800, 4200, 7100, "Thousands USD", "Calypso", "MHBK-US",
      "Trading revenue from all asset classes", "N/A", "Conditional"),
    row("RIADA220-IR", "Trading Revenue - Interest Rate", "RI", "Line 5.c.(1)", "Non-Interest Income",
      1850, 1600, 2800, "Thousands USD", "Calypso", "MHBK-US",
      "Trading revenue from interest rate instruments", "N/A", "Conditional"),
    row("RIADA220-FX", "Trading Revenue - FX", "RI", "Line 5.c.(2)", "Non-Interest Income",
      2100, 1900, 3200, "Thousands USD", "Calypso", "MHBK-US",
      "Trading revenue from foreign exchange", "N/A", "Conditional"),
    row("RIADA220-EQ", "Trading Revenue - Equity", "RI", "Line 5.c.(3)", "Non-Interest Income",
      520, 430, 680, "Thousands USD", "Calypso", "MHBK-US",
      "Trading revenue from equity instruments", "N/A", "Conditional"),
    row("RIADA220-CR", "Trading Revenue - Credit", "RI", "Line 5.c.(4)", "Non-Interest Income",
      330, 270, 420, "Thousands USD", "Calypso", "MHBK-US",
      "Trading revenue from credit instruments", "N/A", "Conditional"),
    row("RCON3545", "Trading Assets", "RC", "Line 5", "Balance Sheet",
      164850, 172000, 209000, "Thousands USD", "Calypso", "MHBK-US",
      "Total trading assets at fair value", "ASC 820", "Mandatory"),
    row("RCON3548", "Trading Liabilities", "RC", "Line 15", "Balance Sheet",
      98200, 105000, 132000, "Thousands USD", "Calypso", "MHBK-US",
      "Total trading liabilities at fair value", "ASC 820", "Mandatory"),
    row("RCFDA126", "IR Derivatives - Notional", "RC-L", "Line 12.a", "Off-Balance Sheet",
      8500000, 8200000, 12000000, "Thousands USD", "Calypso", "MHBK-US",
      "Interest rate derivative contracts notional amount", "N/A", "Mandatory"),
    row("RCFDA127", "FX Derivatives - Notional", "RC-L", "Line 12.b", "Off-Balance Sheet",
      6200000, 5900000, 8800000, "Thousands USD", "Calypso", "MHBK-US",
      "Foreign exchange derivative contracts notional amount", "N/A", "Mandatory"),
    row("RCFD8733", "Credit Derivatives - Notional (Bought)", "RC-L", "Line 12.c.(1)", "Off-Balance Sheet",
      450000, 420000, 620000, "Thousands USD", "Calypso", "MHBK-US",
      "Credit derivative contracts - protection purchased notional", "N/A", "Mandatory"),
    row("RCFD8734", "Credit Derivatives - Notional (Sold)", "RC-L", "Line 12.c.(2)", "Off-Balance Sheet",
      380000, 350000, 510000, "Thousands USD", "Calypso", "MHBK-US",
      "Credit derivative contracts - protection sold notional", "N/A", "Mandatory"),
    row("RCFDC968", "Equity Derivatives - Notional", "RC-L", "Line 12.d", "Off-Balance Sheet",
      320000, 290000, 430000, "Thousands USD", "Calypso", "MHBK-US",
      "Equity derivative contracts notional amount", "N/A", "Mandatory"),
    row("RCFDC969", "Commodity Derivatives - Notional", "RC-L", "Line 12.e", "Off-Balance Sheet",
      85000, 78000, 110000, "Thousands USD", "Calypso", "MHBK-US",
      "Commodity and other derivative contracts notional amount", "N/A", "Mandatory"),
    row("RCFD8760", "Derivative Assets - Fair Value", "RC", "Line 11.a", "Balance Sheet",
      142000, 138000, 195000, "Thousands USD", "Calypso", "MHBK-US",
      "Derivative trading assets at fair value", "ASC 815", "Mandatory"),
    row("RCFD8765", "Derivative Liabilities - Fair Value", "RC", "Line 15.a", "Balance Sheet",
      118000, 112000, 162000, "Thousands USD", "Calypso", "MHBK-US",
      "Derivative trading liabilities at fair value", "ASC 815", "Mandatory"),
    row("RCFDC219", "CCP Cleared - Notional", "RC-L", "Line 12.f", "Off-Balance Sheet",
      9800000, 9400000, 14200000, "Thousands USD", "Calypso", "MHBK-US",
      "Total notional amount of derivatives cleared through CCP", "N/A", "Mandatory"),
    row("RCFDC220", "Bilateral - Notional", "RC-L", "Line 12.g", "Off-Balance Sheet",
      6237000, 5890000, 8770000, "Thousands USD", "Calypso", "MHBK-US",
      "Total notional amount of bilateral (non-cleared) derivatives", "N/A", "Mandatory"),
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, makeSheet(COMMON_HEADERS, rows), "Trading_Positions");
  XLSX.writeFile(wb, path.join(outDir, "Trading_Positions_Q1_2026.xlsx"));
  console.log(`Trading_Positions: ${rows.length} rows, ${COMMON_HEADERS.length} columns`);
}

function generateLoans() {
  const rows = [
    row("RCFD2122", "Net Loans and Leases", "RC", "Line 4.b", "Balance Sheet",
      2910000, 2980000, 4450000, "Thousands USD", "FIS Loan IQ", "MHBK-US",
      "Loans net of unearned income and allowance", "N/A", "Mandatory"),
    row("RCFD1754", "Loans - C&I (Domestic)", "RC-C Part I", "Line 4.a", "Loans",
      1120000, 1150000, 1720000, "Thousands USD", "FIS Loan IQ", "MHBK-US",
      "Commercial and industrial loans to US addresses", "N/A", "Mandatory"),
    row("RCFD1763", "Loans - CRE (Non-Farm, Non-Res)", "RC-C Part I", "Line 1.a.(1)", "Loans",
      485000, 498000, 745000, "Thousands USD", "FIS Loan IQ", "MHBK-US",
      "Non-farm non-residential CRE loans", "N/A", "Mandatory"),
    row("RCFD1764", "Loans - CRE (Multifamily)", "RC-C Part I", "Line 1.a.(2)", "Loans",
      210000, 215000, 325000, "Thousands USD", "FIS Loan IQ", "MHBK-US",
      "Multifamily residential real estate loans", "N/A", "Mandatory"),
    row("RCFD1460", "Loans - Construction & Land", "RC-C Part I", "Line 1.a.(3)", "Loans",
      95000, 102000, 148000, "Thousands USD", "FIS Loan IQ", "MHBK-US",
      "Construction and land development loans", "N/A", "Mandatory"),
    row("RCFD1797", "Loans - 1-4 Family Residential", "RC-C Part I", "Line 1.c", "Loans",
      320000, 328000, 490000, "Thousands USD", "FIS Loan IQ", "MHBK-US",
      "Residential real estate loans 1-4 family", "N/A", "Mandatory"),
    row("RCFD1590", "Loans - Consumer", "RC-C Part I", "Line 6", "Loans",
      185000, 190000, 285000, "Thousands USD", "FIS Loan IQ", "MHBK-US",
      "Loans to individuals for household, family, and personal expenditures", "N/A", "Mandatory"),
    row("RCFD2165", "Loans - Foreign Government", "RC-C Part I", "Line 7", "Loans",
      42000, 45000, 68000, "Thousands USD", "FIS Loan IQ", "MHBK-US",
      "Loans to foreign governments and official institutions", "N/A", "Mandatory"),
    row("RCFD2746", "Loans - Agriculture", "RC-C Part I", "Line 3", "Loans",
      18000, 19000, 28000, "Thousands USD", "FIS Loan IQ", "MHBK-US",
      "Loans secured by farmland and agricultural production", "N/A", "Mandatory"),
    row("RCFD2107", "Allowance for Credit Losses", "RC", "Line 4.c", "Loans",
      65000, 62000, 98000, "Thousands USD", "FIS Loan IQ", "MHBK-US",
      "Total allowance for credit losses on loans", "ASC 326", "Mandatory"),
    row("RIAD4635", "Net Charge-Offs - Total", "RI-B Part I", "Line 9", "Asset Quality",
      8200, 7500, 12000, "Thousands USD", "FIS Loan IQ", "MHBK-US",
      "Total net charge-offs on loans and leases", "N/A", "Mandatory"),
    row("RCFD1403", "Past Due 30-89 Days", "RC-N", "Line 1", "Asset Quality",
      28000, 25000, 38000, "Thousands USD", "FIS Loan IQ", "MHBK-US",
      "Loans past due 30 through 89 days and still accruing", "N/A", "Mandatory"),
    row("RCFD1407", "Past Due 90+ Days", "RC-N", "Line 2", "Asset Quality",
      12000, 10500, 16000, "Thousands USD", "FIS Loan IQ", "MHBK-US",
      "Loans past due 90 days or more and still accruing", "N/A", "Mandatory"),
    row("RCFD1583", "Nonaccrual Loans", "RC-N", "Line 3", "Asset Quality",
      18500, 16000, 24000, "Thousands USD", "FIS Loan IQ", "MHBK-US",
      "Loans in nonaccrual status", "N/A", "Mandatory"),
    row("RCFDK038", "CECL - Lifetime ECL", "RC-N Memo", "Line M.1", "Asset Quality",
      52000, 49000, 76000, "Thousands USD", "FIS Loan IQ", "MHBK-US",
      "CECL lifetime expected credit loss estimate", "ASC 326", "Mandatory"),
    row("RCFDK039", "CECL - Weighted Avg PD", "RC-N Memo", "Line M.2", "Asset Quality",
      1.82, 1.75, 1.65, "Percent", "FIS Loan IQ", "MHBK-US",
      "Weighted average probability of default across portfolio", "ASC 326", "Mandatory"),
    row("RCFDK040", "CECL - Weighted Avg LGD", "RC-N Memo", "Line M.3", "Asset Quality",
      38.5, 37.2, 36.8, "Percent", "FIS Loan IQ", "MHBK-US",
      "Weighted average loss given default across portfolio", "ASC 326", "Mandatory"),
    row("RCFD5369", "Unfunded Commitments", "RC-L", "Line 1", "Off-Balance Sheet",
      1450000, 1520000, 2200000, "Thousands USD", "FIS Loan IQ", "MHBK-US",
      "Unused commitments to extend credit", "N/A", "Mandatory"),
    row("RCFD3814", "Standby Letters of Credit", "RC-L", "Line 2", "Off-Balance Sheet",
      185000, 192000, 280000, "Thousands USD", "FIS Loan IQ", "MHBK-US",
      "Amount of standby letters of credit outstanding", "N/A", "Mandatory"),
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, makeSheet(COMMON_HEADERS, rows), "Loan_Portfolio");
  XLSX.writeFile(wb, path.join(outDir, "Loan_Portfolio_Q1_2026.xlsx"));
  console.log(`Loan_Portfolio: ${rows.length} rows, ${COMMON_HEADERS.length} columns`);
}

function generateTreasury() {
  const rows = [
    row("RCFD8641", "Total Securities", "RC-B", "Memo", "Balance Sheet",
      1285000, 1310000, 1980000, "Thousands USD", "Bloomberg AIM", "MHBK-US",
      "HTM + AFS securities at fair value", "N/A", "Mandatory"),
    row("RCFDB528", "HTM Securities - Amortized Cost", "RC-B", "Line 8.a", "Securities",
      520000, 535000, 810000, "Thousands USD", "Bloomberg AIM", "MHBK-US",
      "Held-to-maturity debt securities at amortized cost", "ASC 320", "Mandatory"),
    row("RCFDB529", "HTM Securities - Fair Value", "RC-B", "Line 8.b", "Securities",
      498000, 510000, 775000, "Thousands USD", "Bloomberg AIM", "MHBK-US",
      "Held-to-maturity debt securities at fair value", "ASC 320", "Mandatory"),
    row("RCFD1773", "AFS Securities - Fair Value", "RC-B", "Line 8.c", "Securities",
      765000, 775000, 1170000, "Thousands USD", "Bloomberg AIM", "MHBK-US",
      "Available-for-sale debt securities at fair value", "ASC 320", "Mandatory"),
    row("RCFDB530", "AFS Securities - Amortized Cost", "RC-B", "Line 8.d", "Securities",
      808000, 815000, 1235000, "Thousands USD", "Bloomberg AIM", "MHBK-US",
      "Available-for-sale debt securities amortized cost", "ASC 320", "Mandatory"),
    row("RCFD1754B", "US Treasury & Agency - HTM", "RC-B", "Line 1.a", "Securities",
      310000, 320000, 485000, "Thousands USD", "Bloomberg AIM", "MHBK-US",
      "US Treasury and agency securities held-to-maturity", "ASC 320", "Mandatory"),
    row("RCFD1773B", "US Treasury & Agency - AFS", "RC-B", "Line 1.b", "Securities",
      420000, 430000, 650000, "Thousands USD", "Bloomberg AIM", "MHBK-US",
      "US Treasury and agency securities available-for-sale", "ASC 320", "Mandatory"),
    row("RCFD1698", "MBS - Agency", "RC-B", "Line 4.a", "Securities",
      285000, 290000, 440000, "Thousands USD", "Bloomberg AIM", "MHBK-US",
      "Mortgage-backed securities issued by US government agencies", "ASC 320", "Mandatory"),
    row("RCFD1702", "MBS - Non-Agency", "RC-B", "Line 4.b", "Securities",
      35000, 38000, 55000, "Thousands USD", "Bloomberg AIM", "MHBK-US",
      "Mortgage-backed securities not issued by agencies", "ASC 320", "Mandatory"),
    row("RCFD1737", "Municipal Securities", "RC-B", "Line 3", "Securities",
      42000, 44000, 65000, "Thousands USD", "Bloomberg AIM", "MHBK-US",
      "Securities issued by states and political subdivisions", "ASC 320", "Mandatory"),
    row("RCFD1741", "Corporate Bonds", "RC-B", "Line 5.a", "Securities",
      128000, 130000, 195000, "Thousands USD", "Bloomberg AIM", "MHBK-US",
      "Other domestic and foreign debt securities", "ASC 320", "Mandatory"),
    row("RCFDC026", "AOCI - Unrealized G/L on AFS", "RC-R Part I", "Line 3.a", "Capital",
      -42000, -38000, -65000, "Thousands USD", "Bloomberg AIM", "MHBK-US",
      "Accumulated other comprehensive income - AFS securities", "ASC 220", "Mandatory"),
    row("RIAD4020", "Interest Income on Securities", "RI", "Line 1.b", "Interest Income",
      18400, 19500, 28000, "Thousands USD", "Bloomberg AIM", "MHBK-US",
      "Interest income on held-to-maturity securities", "N/A", "Mandatory"),
    row("RIAD3196", "Realized G/L on Securities", "RI", "Line 6.a", "Non-Interest Income",
      -1200, -800, -1500, "Thousands USD", "Bloomberg AIM", "MHBK-US",
      "Realized gains (losses) on HTM and AFS securities", "ASC 320", "Mandatory"),
    row("TREAS-DUR", "Portfolio Duration (Weighted Avg)", "Internal", "N/A", "Risk Metrics",
      4.2, 4.1, 3.8, "Years", "Bloomberg AIM", "MHBK-US",
      "Weighted average modified duration of total securities portfolio", "Internal", "Internal"),
    row("TREAS-HQLA", "HQLA Level 1 Securities", "LCR", "Line 1", "Liquidity",
      730000, 750000, 1135000, "Thousands USD", "Bloomberg AIM", "MHBK-US",
      "High-quality liquid assets Level 1 for LCR calculation", "Basel III", "Mandatory"),
    row("TREAS-HQLA2", "HQLA Level 2A Securities", "LCR", "Line 2.a", "Liquidity",
      285000, 290000, 440000, "Thousands USD", "Bloomberg AIM", "MHBK-US",
      "High-quality liquid assets Level 2A for LCR calculation", "Basel III", "Mandatory"),
    row("TREAS-PLEDGE", "Pledged Securities", "RC-B Memo", "Line M.1", "Securities",
      350000, 360000, 545000, "Thousands USD", "Bloomberg AIM", "MHBK-US",
      "Securities pledged as collateral", "N/A", "Mandatory"),
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, makeSheet(COMMON_HEADERS, rows), "Treasury_Data");
  XLSX.writeFile(wb, path.join(outDir, "Treasury_Data_Q1_2026.xlsx"));
  console.log(`Treasury_Data: ${rows.length} rows, ${COMMON_HEADERS.length} columns`);
}

function generateRisk() {
  const rows = [
    row("RCFDA223", "CET1 Capital", "RC-R Part I", "Line 22", "Capital",
      780000, 768000, 1125000, "Thousands USD", "Axiom SL", "MHBK-US",
      "Common Equity Tier 1 capital per Basel III", "Basel III", "Mandatory"),
    row("RCFD8274", "Tier 1 Capital", "RC-R Part I", "Line 26", "Capital",
      810000, 798000, 1170000, "Thousands USD", "Axiom SL", "MHBK-US",
      "CET1 + Additional Tier 1 capital", "Basel III", "Mandatory"),
    row("RCFDA224", "Total Capital", "RC-R Part I", "Line 31", "Capital",
      920000, 905000, 1340000, "Thousands USD", "Axiom SL", "MHBK-US",
      "Tier 1 + Tier 2 capital", "Basel III", "Mandatory"),
    row("RCFDA222", "Total Risk-Weighted Assets", "RC-R Part II", "Line 62", "Capital",
      4105000, 4200000, 6400000, "Thousands USD", "Axiom SL", "MHBK-US",
      "Total risk-weighted assets", "Basel III", "Mandatory"),
    row("RCFDA223R", "CET1 Capital Ratio", "RC-R Part I", "Line 32", "Capital Ratios",
      19.0, 18.3, 17.6, "Percent", "Axiom SL", "MHBK-US",
      "CET1 Capital / Total RWA", "Basel III", "Mandatory"),
    row("RCFD7206", "Tier 1 Capital Ratio", "RC-R Part I", "Line 33", "Capital Ratios",
      19.74, 19.0, 18.3, "Percent", "Axiom SL", "MHBK-US",
      "Tier 1 Capital / Total RWA", "Basel III", "Mandatory"),
    row("RCFD7205", "Total Capital Ratio", "RC-R Part I", "Line 34", "Capital Ratios",
      22.4, 21.5, 20.9, "Percent", "Axiom SL", "MHBK-US",
      "Total Capital / Total RWA", "Basel III", "Mandatory"),
    row("RCFDC223", "Leverage Ratio", "RC-R Part I", "Line 35", "Capital Ratios",
      14.7, 14.2, 14.0, "Percent", "Axiom SL", "MHBK-US",
      "Tier 1 capital / average total consolidated assets", "Basel III", "Mandatory"),
    row("RCFDR-RWA-CR", "RWA - Credit Risk", "RC-R Part II", "Line 58", "Capital",
      3280000, 3360000, 5120000, "Thousands USD", "Axiom SL", "MHBK-US",
      "Risk-weighted assets for credit risk exposures", "Basel III", "Mandatory"),
    row("RCFDR-RWA-MR", "RWA - Market Risk", "RC-R Part II", "Line 59", "Capital",
      412000, 420000, 640000, "Thousands USD", "Axiom SL", "MHBK-US",
      "Risk-weighted assets for market risk exposures", "Basel III", "Mandatory"),
    row("RCFDR-RWA-OR", "RWA - Operational Risk", "RC-R Part II", "Line 60", "Capital",
      413000, 420000, 640000, "Thousands USD", "Axiom SL", "MHBK-US",
      "Risk-weighted assets for operational risk", "Basel III", "Mandatory"),
    row("UBPR1", "Net Interest Margin", "UBPR Page 1", "Line 4", "Performance Ratios",
      2.33, 2.41, 2.81, "Percent", "Axiom SL", "MHBK-US",
      "Net interest income / average earning assets annualized", "UBPR", "Derived"),
    row("UBPR2", "Return on Assets", "UBPR Page 1", "Line 1", "Performance Ratios",
      0.52, 0.56, 0.51, "Percent", "Axiom SL", "MHBK-US",
      "Net income / average total assets annualized", "UBPR", "Derived"),
    row("UBPR3", "Return on Equity", "UBPR Page 1", "Line 2", "Performance Ratios",
      3.46, 3.85, 3.60, "Percent", "Axiom SL", "MHBK-US",
      "Net income / average equity annualized", "UBPR", "Derived"),
    row("UBPR4", "Efficiency Ratio", "UBPR Page 1", "Line 8", "Performance Ratios",
      67.83, 62.8, 59.27, "Percent", "Axiom SL", "MHBK-US",
      "Non-interest expense / (net interest income + non-interest income)", "UBPR", "Derived"),
    row("UBPR5", "NPA Ratio", "UBPR Page 7", "Line 15", "Asset Quality",
      0.56, 0.47, 0.48, "Percent", "Axiom SL", "MHBK-US",
      "Non-performing assets / total assets", "UBPR", "Derived"),
    row("UBPR6", "Net Charge-Off Rate", "UBPR Page 4", "Line 6", "Asset Quality",
      0.28, 0.25, 0.27, "Percent", "Axiom SL", "MHBK-US",
      "Net charge-offs / average loans annualized", "UBPR", "Derived"),
    row("UBPR7", "Loan to Deposit Ratio", "UBPR Page 1", "Line 12", "Liquidity",
      91.5, 91.7, 90.4, "Percent", "Axiom SL", "MHBK-US",
      "Total loans / total deposits", "UBPR", "Derived"),
    row("RISK-VAR99", "VaR (1-Day, 99%)", "FFIEC 102", "Line 1", "Market Risk",
      12500, 11800, 18000, "Thousands USD", "Axiom SL", "MHBK-US",
      "Value at Risk at 99% confidence, 1-day holding period", "Basel III", "Mandatory"),
    row("RISK-SVAR", "Stressed VaR (1-Day, 99%)", "FFIEC 102", "Line 2", "Market Risk",
      28000, 26500, 39000, "Thousands USD", "Axiom SL", "MHBK-US",
      "Stressed Value at Risk at 99% confidence, 1-day holding period", "Basel III", "Mandatory"),
    row("RISK-LCR", "Liquidity Coverage Ratio", "FR 2052a", "Summary", "Liquidity",
      142.5, 138.2, 135.8, "Percent", "Axiom SL", "MHBK-US",
      "HQLA / Total net cash outflows over 30 days", "Basel III", "Mandatory"),
    row("RISK-NSFR", "Net Stable Funding Ratio", "FR 2052a", "Summary", "Liquidity",
      118.3, 115.6, 112.4, "Percent", "Axiom SL", "MHBK-US",
      "Available stable funding / Required stable funding", "Basel III", "Mandatory"),
    row("BHCK4340", "BHC Net Income", "FR Y-9C", "HC-Line 14", "BHC Income",
      45200, 48500, 68000, "Thousands USD", "Axiom SL", "MHFG-US",
      "Consolidated net income for bank holding company", "FR Y-9C", "BHC Only"),
    row("BHCK2170", "BHC Total Assets", "FR Y-9C", "HC-Line 12", "BHC Balance Sheet",
      7800000, 7950000, 12100000, "Thousands USD", "Axiom SL", "MHFG-US",
      "Consolidated total assets for bank holding company", "FR Y-9C", "BHC Only"),
    row("BHCK3210", "BHC Total Equity", "FR Y-9C", "HC-Line 28", "BHC Balance Sheet",
      1250000, 1220000, 1850000, "Thousands USD", "Axiom SL", "MHFG-US",
      "Total equity capital of bank holding company", "FR Y-9C", "BHC Only"),
    row("BHCKA223", "BHC CET1 Capital", "FR Y-9C", "HC-R Line 22", "BHC Capital",
      1180000, 1150000, 1740000, "Thousands USD", "Axiom SL", "MHFG-US",
      "Common Equity Tier 1 capital for BHC", "Basel III", "BHC Only"),
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, makeSheet(COMMON_HEADERS, rows), "Risk_Metrics");
  XLSX.writeFile(wb, path.join(outDir, "Risk_Metrics_Q1_2026.xlsx"));
  console.log(`Risk_Metrics: ${rows.length} rows, ${COMMON_HEADERS.length} columns`);
}

function generateMDRM() {
  const headers = [
    "MDRM_Code", "Field_Name", "Schedule", "Line_Reference", "Category",
    "Description", "Unit", "Series_Prefix", "Item_Code",
    "Regulatory_Framework", "Filing_Requirement", "Source_File"
  ];

  const mdrmEntries = [
    ["RCFD2170", "Total Assets", "RC", "Line 12", "Balance Sheet", "Sum of all asset accounts", "Thousands USD", "RCFD", "2170", "N/A", "Mandatory", "GL_Extract"],
    ["RCON2200", "Total Deposits", "RC", "Line 13", "Balance Sheet", "Total deposits (domestic + foreign)", "Thousands USD", "RCON", "2200", "N/A", "Mandatory", "GL_Extract"],
    ["RCFD2122", "Net Loans and Leases", "RC", "Line 4.b", "Balance Sheet", "Loans net of unearned income and allowance", "Thousands USD", "RCFD", "2122", "N/A", "Mandatory", "Loan_Portfolio"],
    ["RCFD8641", "Total Securities", "RC-B", "Memo", "Balance Sheet", "HTM + AFS securities at fair value", "Thousands USD", "RCFD", "8641", "N/A", "Mandatory", "Treasury_Data"],
    ["RCFD3210", "Total Equity Capital", "RC", "Line 28", "Balance Sheet", "Total equity capital including minority interest", "Thousands USD", "RCFD", "3210", "N/A", "Mandatory", "GL_Extract"],
    ["RIAD4340", "Net Income (Loss)", "RI", "Line 14", "Income Statement", "Net income after taxes and extraordinary items", "Thousands USD", "RIAD", "4340", "N/A", "Mandatory", "GL_Extract"],
    ["RIAD4074", "Total Interest Income", "RI", "Line 1.i", "Income Statement", "Sum of all interest and fee income", "Thousands USD", "RIAD", "4074", "N/A", "Mandatory", "GL_Extract"],
    ["RIAD4079", "Total Interest Expense", "RI", "Line 2.f", "Income Statement", "Sum of all interest expense", "Thousands USD", "RIAD", "4079", "N/A", "Mandatory", "GL_Extract"],
    ["RIAD4230", "Total Non-Interest Income", "RI", "Line 5.m", "Income Statement", "Service charges, trading revenue, other", "Thousands USD", "RIAD", "4230", "N/A", "Mandatory", "GL_Extract"],
    ["RIAD4093", "Total Non-Interest Expense", "RI", "Line 7.d", "Income Statement", "Salaries, occupancy, other operating", "Thousands USD", "RIAD", "4093", "N/A", "Mandatory", "GL_Extract"],
    ["RIAD4230B", "Provision for Credit Losses", "RI", "Line 4", "Income Statement", "CECL provision for credit losses on all instruments", "Thousands USD", "RIAD", "4230B", "ASC 326", "Mandatory", "GL_Extract"],
    ["RCFDA223", "CET1 Capital", "RC-R Part I", "Line 22", "Capital", "Common Equity Tier 1 capital per Basel III", "Thousands USD", "RCFD", "A223", "Basel III", "Mandatory", "Risk_Metrics"],
    ["RCFD8274", "Tier 1 Capital", "RC-R Part I", "Line 26", "Capital", "CET1 + Additional Tier 1 capital", "Thousands USD", "RCFD", "8274", "Basel III", "Mandatory", "Risk_Metrics"],
    ["RCFDA224", "Total Capital", "RC-R Part I", "Line 31", "Capital", "Tier 1 + Tier 2 capital", "Thousands USD", "RCFD", "A224", "Basel III", "Mandatory", "Risk_Metrics"],
    ["RCFDA223R", "CET1 Capital Ratio", "RC-R Part I", "Line 32", "Capital Ratios", "CET1 Capital / Total RWA", "Percent", "RCFD", "A223R", "Basel III", "Mandatory", "Risk_Metrics"],
    ["RCFD7206", "Tier 1 Capital Ratio", "RC-R Part I", "Line 33", "Capital Ratios", "Tier 1 Capital / Total RWA", "Percent", "RCFD", "7206", "Basel III", "Mandatory", "Risk_Metrics"],
    ["RCFD7205", "Total Capital Ratio", "RC-R Part I", "Line 34", "Capital Ratios", "Total Capital / Total RWA", "Percent", "RCFD", "7205", "Basel III", "Mandatory", "Risk_Metrics"],
    ["RCFDA222", "Total RWA", "RC-R Part II", "Line 62", "Capital", "Total risk-weighted assets", "Thousands USD", "RCFD", "A222", "Basel III", "Mandatory", "Risk_Metrics"],
    ["RCFDC223", "Leverage Ratio", "RC-R Part I", "Line 35", "Capital Ratios", "Tier 1 capital / average total consolidated assets", "Percent", "RCFD", "C223", "Basel III", "Mandatory", "Risk_Metrics"],
    ["UBPR1", "Net Interest Margin", "UBPR Page 1", "Line 4", "Performance Ratios", "Net interest income / average earning assets annualized", "Percent", "UBPR", "NIMY", "UBPR", "Derived", "Risk_Metrics"],
    ["UBPR2", "Return on Assets", "UBPR Page 1", "Line 1", "Performance Ratios", "Net income / average total assets annualized", "Percent", "UBPR", "ROA", "UBPR", "Derived", "Risk_Metrics"],
    ["UBPR3", "Return on Equity", "UBPR Page 1", "Line 2", "Performance Ratios", "Net income / average equity annualized", "Percent", "UBPR", "ROE", "UBPR", "Derived", "Risk_Metrics"],
    ["UBPR4", "Efficiency Ratio", "UBPR Page 1", "Line 8", "Performance Ratios", "Non-interest expense / (net interest income + non-interest income)", "Percent", "UBPR", "EEFF", "UBPR", "Derived", "Risk_Metrics"],
    ["UBPR5", "NPA Ratio", "UBPR Page 7", "Line 15", "Asset Quality", "Non-performing assets / total assets", "Percent", "UBPR", "P3ASSET", "UBPR", "Derived", "Risk_Metrics"],
    ["UBPR6", "Net Charge-Off Rate", "UBPR Page 4", "Line 6", "Asset Quality", "Net charge-offs / average loans annualized", "Percent", "UBPR", "ELNANTR", "UBPR", "Derived", "Risk_Metrics"],
    ["UBPR7", "Loan to Deposit Ratio", "UBPR Page 1", "Line 12", "Liquidity", "Total loans / total deposits", "Percent", "UBPR", "LDEP", "UBPR", "Derived", "Risk_Metrics"],
    ["RCON6631", "Deposits - Demand (Non-Interest)", "RC-E Part I", "Line 1", "Deposits", "Non-interest bearing demand deposits (domestic)", "Thousands USD", "RCON", "6631", "N/A", "Mandatory", "GL_Extract"],
    ["RCON6636", "Deposits - NOW Accounts", "RC-E Part I", "Line 2", "Deposits", "Interest-bearing transaction accounts", "Thousands USD", "RCON", "6636", "N/A", "Mandatory", "GL_Extract"],
    ["RCON2389", "Deposits - MMDA", "RC-E Part I", "Line 3", "Deposits", "Money market deposit accounts", "Thousands USD", "RCON", "2389", "N/A", "Mandatory", "GL_Extract"],
    ["RCON6648", "Deposits - Other Savings", "RC-E Part I", "Line 4", "Deposits", "Other savings deposits", "Thousands USD", "RCON", "6648", "N/A", "Mandatory", "GL_Extract"],
    ["RCON6645", "Deposits - Time < $250K", "RC-E Part I", "Line 5", "Deposits", "Time deposits less than $250,000", "Thousands USD", "RCON", "6645", "N/A", "Mandatory", "GL_Extract"],
    ["RCONJ473", "Deposits - Time >= $250K", "RC-E Part I", "Line 6", "Deposits", "Time deposits $250,000 or more", "Thousands USD", "RCON", "J473", "N/A", "Mandatory", "GL_Extract"],
    ["RCFD1754", "Loans - C&I (Domestic)", "RC-C Part I", "Line 4.a", "Loans", "Commercial and industrial loans to US addresses", "Thousands USD", "RCFD", "1754", "N/A", "Mandatory", "Loan_Portfolio"],
    ["RCFD1763", "Loans - CRE (Non-Farm, Non-Res)", "RC-C Part I", "Line 1.a.(1)", "Loans", "Non-farm non-residential CRE loans", "Thousands USD", "RCFD", "1763", "N/A", "Mandatory", "Loan_Portfolio"],
    ["RCFD1764", "Loans - CRE (Multifamily)", "RC-C Part I", "Line 1.a.(2)", "Loans", "Multifamily residential real estate loans", "Thousands USD", "RCFD", "1764", "N/A", "Mandatory", "Loan_Portfolio"],
    ["RCFD1460", "Loans - Construction & Land", "RC-C Part I", "Line 1.a.(3)", "Loans", "Construction and land development loans", "Thousands USD", "RCFD", "1460", "N/A", "Mandatory", "Loan_Portfolio"],
    ["RCFD1797", "Loans - 1-4 Family Residential", "RC-C Part I", "Line 1.c", "Loans", "Residential real estate loans 1-4 family", "Thousands USD", "RCFD", "1797", "N/A", "Mandatory", "Loan_Portfolio"],
    ["RCFD2107", "Allowance for Credit Losses", "RC", "Line 4.c", "Loans", "Total allowance for credit losses on loans", "Thousands USD", "RCFD", "2107", "ASC 326", "Mandatory", "Loan_Portfolio"],
    ["RCFDB528", "HTM Securities - Amortized Cost", "RC-B", "Line 8.a", "Securities", "Held-to-maturity debt securities at amortized cost", "Thousands USD", "RCFD", "B528", "ASC 320", "Mandatory", "Treasury_Data"],
    ["RCFDB529", "HTM Securities - Fair Value", "RC-B", "Line 8.b", "Securities", "Held-to-maturity debt securities at fair value", "Thousands USD", "RCFD", "B529", "ASC 320", "Mandatory", "Treasury_Data"],
    ["RCFD1773", "AFS Securities - Fair Value", "RC-B", "Line 8.c", "Securities", "Available-for-sale debt securities at fair value", "Thousands USD", "RCFD", "1773", "ASC 320", "Mandatory", "Treasury_Data"],
    ["RCFDB530", "AFS Securities - Amortized Cost", "RC-B", "Line 8.d", "Securities", "Available-for-sale debt securities amortized cost", "Thousands USD", "RCFD", "B530", "ASC 320", "Mandatory", "Treasury_Data"],
    ["RCFDC026", "AOCI - Unrealized G/L on AFS", "RC-R Part I", "Line 3.a", "Capital", "Accumulated other comprehensive income - AFS securities", "Thousands USD", "RCFD", "C026", "ASC 220", "Mandatory", "GL_Extract"],
    ["RIAD4010", "Interest on Loans", "RI", "Line 1.a", "Interest Income", "Interest and fee income on loans", "Thousands USD", "RIAD", "4010", "N/A", "Mandatory", "GL_Extract"],
    ["RIAD4020", "Interest on Investment Securities", "RI", "Line 1.b", "Interest Income", "Interest income on held-to-maturity securities", "Thousands USD", "RIAD", "4020", "N/A", "Mandatory", "GL_Extract"],
    ["RIAD4115", "Interest on Deposits", "RI", "Line 2.a", "Interest Expense", "Interest expense on deposits", "Thousands USD", "RIAD", "4115", "N/A", "Mandatory", "GL_Extract"],
    ["RIAD4180", "Salaries and Employee Benefits", "RI", "Line 7.a", "Non-Interest Expense", "Total salaries and employee benefits", "Thousands USD", "RIAD", "4180", "N/A", "Mandatory", "GL_Extract"],
    ["RIADA220", "Trading Revenue", "RI", "Line 5.c", "Non-Interest Income", "Trading revenue from all asset classes", "Thousands USD", "RIAD", "A220", "N/A", "Conditional", "Trading_Positions"],
    ["RIAD3196", "Realized G/L on Securities", "RI", "Line 6.a", "Non-Interest Income", "Realized gains (losses) on HTM and AFS securities", "Thousands USD", "RIAD", "3196", "ASC 320", "Mandatory", "Treasury_Data"],
    ["RCON3545", "Trading Assets", "RC", "Line 5", "Balance Sheet", "Total trading assets at fair value", "Thousands USD", "RCON", "3545", "ASC 820", "Mandatory", "Trading_Positions"],
    ["BHCK4340", "BHC Net Income", "FR Y-9C", "HC-Line 14", "BHC Income", "Consolidated net income for bank holding company", "Thousands USD", "BHCK", "4340", "FR Y-9C", "BHC Only", "Risk_Metrics"],
    ["BHCK2170", "BHC Total Assets", "FR Y-9C", "HC-Line 12", "BHC Balance Sheet", "Consolidated total assets for bank holding company", "Thousands USD", "BHCK", "2170", "FR Y-9C", "BHC Only", "Risk_Metrics"],
    ["BHCK3210", "BHC Total Equity", "FR Y-9C", "HC-Line 28", "BHC Balance Sheet", "Total equity capital of bank holding company", "Thousands USD", "BHCK", "3210", "FR Y-9C", "BHC Only", "Risk_Metrics"],
    ["BHCKA223", "BHC CET1 Capital", "FR Y-9C", "HC-R Line 22", "BHC Capital", "Common Equity Tier 1 capital for BHC", "Thousands USD", "BHCK", "A223", "Basel III", "BHC Only", "Risk_Metrics"],
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, makeSheet(headers, mdrmEntries), "MDRM_Taxonomy");
  XLSX.writeFile(wb, path.join(outDir, "MDRM_Taxonomy.xlsx"));
  console.log(`MDRM_Taxonomy: ${mdrmEntries.length} rows, ${headers.length} columns`);
}

generateGL();
generateTrading();
generateLoans();
generateTreasury();
generateRisk();
generateMDRM();
console.log("\nAll files generated in public/downloads/");
