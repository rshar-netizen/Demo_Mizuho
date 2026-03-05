const XLSX = require("xlsx");
const path = require("path");

const outDir = path.join(__dirname, "..", "public", "downloads");

function makeSheet(headers, rows) {
  const data = [headers, ...rows];
  return XLSX.utils.aoa_to_sheet(data);
}

function fmtDate(d) {
  return d.toISOString().split("T")[0];
}

function rn(min, max, dec = 0) {
  const v = min + Math.random() * (max - min);
  return dec === 0 ? Math.round(v) : parseFloat(v.toFixed(dec));
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ─── 1. GL_Extract_Q4_2024.xlsx (248 fields) ───

function generateGL() {
  const glAccounts = [
    { code: "1010", name: "Cash and Due from Banks", type: "Asset", subtype: "Cash" },
    { code: "1020", name: "Interest-Bearing Deposits", type: "Asset", subtype: "Cash Equivalents" },
    { code: "1110", name: "Federal Funds Sold", type: "Asset", subtype: "Short-Term Investments" },
    { code: "1210", name: "Securities - HTM", type: "Asset", subtype: "Investment Securities" },
    { code: "1220", name: "Securities - AFS", type: "Asset", subtype: "Investment Securities" },
    { code: "1230", name: "Securities - Trading", type: "Asset", subtype: "Trading Assets" },
    { code: "1310", name: "Loans - Commercial & Industrial", type: "Asset", subtype: "Loans" },
    { code: "1320", name: "Loans - Commercial Real Estate", type: "Asset", subtype: "Loans" },
    { code: "1330", name: "Loans - Residential Mortgage", type: "Asset", subtype: "Loans" },
    { code: "1340", name: "Loans - Consumer", type: "Asset", subtype: "Loans" },
    { code: "1350", name: "Loans - Construction & Land", type: "Asset", subtype: "Loans" },
    { code: "1360", name: "Loans - Agriculture", type: "Asset", subtype: "Loans" },
    { code: "1370", name: "Loans - Lease Financing", type: "Asset", subtype: "Loans" },
    { code: "1380", name: "Loans - Foreign Government", type: "Asset", subtype: "Loans" },
    { code: "1399", name: "Allowance for Credit Losses", type: "Contra-Asset", subtype: "Loans" },
    { code: "1410", name: "Premises and Equipment", type: "Asset", subtype: "Fixed Assets" },
    { code: "1420", name: "Other Real Estate Owned", type: "Asset", subtype: "Other Assets" },
    { code: "1510", name: "Accrued Interest Receivable", type: "Asset", subtype: "Other Assets" },
    { code: "1520", name: "Goodwill", type: "Asset", subtype: "Intangible Assets" },
    { code: "1530", name: "Other Intangible Assets", type: "Asset", subtype: "Intangible Assets" },
    { code: "1610", name: "Deferred Tax Assets", type: "Asset", subtype: "Other Assets" },
    { code: "1620", name: "Derivative Assets", type: "Asset", subtype: "Trading Assets" },
    { code: "1630", name: "Right-of-Use Assets", type: "Asset", subtype: "Other Assets" },
    { code: "1999", name: "Other Assets", type: "Asset", subtype: "Other Assets" },
    { code: "2010", name: "Deposits - Demand (Non-Interest)", type: "Liability", subtype: "Deposits" },
    { code: "2020", name: "Deposits - NOW Accounts", type: "Liability", subtype: "Deposits" },
    { code: "2030", name: "Deposits - MMDA", type: "Liability", subtype: "Deposits" },
    { code: "2040", name: "Deposits - Savings", type: "Liability", subtype: "Deposits" },
    { code: "2050", name: "Deposits - Time < $250K", type: "Liability", subtype: "Deposits" },
    { code: "2060", name: "Deposits - Time >= $250K", type: "Liability", subtype: "Deposits" },
    { code: "2070", name: "Deposits - Brokered", type: "Liability", subtype: "Deposits" },
    { code: "2110", name: "Federal Funds Purchased", type: "Liability", subtype: "Borrowings" },
    { code: "2120", name: "Repo Agreements", type: "Liability", subtype: "Borrowings" },
    { code: "2130", name: "FHLB Advances", type: "Liability", subtype: "Borrowings" },
    { code: "2140", name: "Subordinated Debt", type: "Liability", subtype: "Borrowings" },
    { code: "2150", name: "Other Borrowed Funds", type: "Liability", subtype: "Borrowings" },
    { code: "2210", name: "Accrued Interest Payable", type: "Liability", subtype: "Other Liabilities" },
    { code: "2220", name: "Derivative Liabilities", type: "Liability", subtype: "Other Liabilities" },
    { code: "2230", name: "Lease Liabilities", type: "Liability", subtype: "Other Liabilities" },
    { code: "2240", name: "Deferred Tax Liabilities", type: "Liability", subtype: "Other Liabilities" },
    { code: "2999", name: "Other Liabilities", type: "Liability", subtype: "Other Liabilities" },
    { code: "3010", name: "Common Stock", type: "Equity", subtype: "Capital" },
    { code: "3020", name: "Surplus / APIC", type: "Equity", subtype: "Capital" },
    { code: "3030", name: "Retained Earnings", type: "Equity", subtype: "Capital" },
    { code: "3040", name: "AOCI", type: "Equity", subtype: "Capital" },
    { code: "3050", name: "Treasury Stock", type: "Equity", subtype: "Capital" },
    { code: "4010", name: "Interest Income - Loans", type: "Revenue", subtype: "Interest Income" },
    { code: "4020", name: "Interest Income - Securities", type: "Revenue", subtype: "Interest Income" },
    { code: "4030", name: "Interest Income - Fed Funds", type: "Revenue", subtype: "Interest Income" },
    { code: "4040", name: "Interest Income - Deposits", type: "Revenue", subtype: "Interest Income" },
    { code: "4110", name: "Interest Expense - Deposits", type: "Expense", subtype: "Interest Expense" },
    { code: "4120", name: "Interest Expense - Borrowings", type: "Expense", subtype: "Interest Expense" },
    { code: "4130", name: "Interest Expense - Subordinated", type: "Expense", subtype: "Interest Expense" },
    { code: "4210", name: "Provision for Credit Losses", type: "Expense", subtype: "Provision" },
    { code: "5010", name: "Service Charges on Deposits", type: "Revenue", subtype: "Non-Interest Income" },
    { code: "5020", name: "Fiduciary Income", type: "Revenue", subtype: "Non-Interest Income" },
    { code: "5030", name: "Trading Revenue", type: "Revenue", subtype: "Non-Interest Income" },
    { code: "5040", name: "Securities Gains/Losses", type: "Revenue", subtype: "Non-Interest Income" },
    { code: "5050", name: "Loan Servicing Fees", type: "Revenue", subtype: "Non-Interest Income" },
    { code: "5060", name: "Insurance Income", type: "Revenue", subtype: "Non-Interest Income" },
    { code: "6010", name: "Salaries and Benefits", type: "Expense", subtype: "Non-Interest Expense" },
    { code: "6020", name: "Occupancy Expense", type: "Expense", subtype: "Non-Interest Expense" },
    { code: "6030", name: "Equipment Expense", type: "Expense", subtype: "Non-Interest Expense" },
    { code: "6040", name: "Professional Fees", type: "Expense", subtype: "Non-Interest Expense" },
    { code: "6050", name: "FDIC Assessment", type: "Expense", subtype: "Non-Interest Expense" },
    { code: "6060", name: "Amortization of Intangibles", type: "Expense", subtype: "Non-Interest Expense" },
    { code: "6070", name: "Data Processing", type: "Expense", subtype: "Non-Interest Expense" },
    { code: "6080", name: "Marketing", type: "Expense", subtype: "Non-Interest Expense" },
    { code: "6999", name: "Other Non-Interest Expense", type: "Expense", subtype: "Non-Interest Expense" },
    { code: "7010", name: "Income Tax Provision", type: "Expense", subtype: "Tax" },
  ];

  const costCenters = ["NYC-HQ", "LA-WEST", "CHI-MW", "MIA-SE", "DAL-SW", "SF-PAC", "BOS-NE", "ATL-SE", "SEA-NW", "DEN-MT"];
  const entities = ["MHBK-US", "MHBK-CAY", "MHBK-NY-BR", "MHSC-US"];
  const currencies = ["USD", "JPY", "EUR", "GBP"];

  const headers = [
    "GL_Account_Code", "GL_Account_Name", "Account_Type", "Account_Subtype",
    "Entity_Code", "Entity_Name", "Cost_Center", "Department",
    "Currency", "Period_End_Date", "Fiscal_Year", "Fiscal_Quarter",
    "Opening_Balance_USD", "Debit_Amount_USD", "Credit_Amount_USD", "Closing_Balance_USD",
    "Opening_Balance_Local", "Closing_Balance_Local", "FX_Rate",
    "YTD_Balance_USD", "Prior_Quarter_Balance_USD", "Prior_Year_Balance_USD",
    "Intercompany_Flag", "Intercompany_Counterparty", "Elimination_Flag",
    "Consolidation_Adjustment", "Reclassification_Amount",
    "MDRM_Code", "Call_Report_Schedule", "Call_Report_Line_Item",
    "GAAP_Classification", "IFRS_Classification",
    "Regulatory_Capital_Treatment", "Risk_Weight_Pct",
    "Last_Modified_Date", "Modified_By", "Approval_Status", "Audit_Trail_ID",
    "Data_Source_System", "Reconciliation_Status", "Variance_Flag",
    "Notes"
  ];

  const scheduleMap = {
    "Asset": "RC", "Contra-Asset": "RC", "Liability": "RC",
    "Equity": "RC", "Revenue": "RI", "Expense": "RI"
  };
  const mdrmPrefixes = { "Asset": "RCFD", "Contra-Asset": "RCFD", "Liability": "RCON", "Equity": "RCFD", "Revenue": "RIAD", "Expense": "RIAD" };

  const rows = [];
  for (const acct of glAccounts) {
    for (let i = 0; i < Math.ceil(248 / glAccounts.length); i++) {
      const entity = pick(entities);
      const cc = pick(costCenters);
      const ccy = pick(currencies);
      const fxRate = ccy === "USD" ? 1.0 : ccy === "JPY" ? 0.0067 : ccy === "EUR" ? 1.08 : 1.27;
      const opening = rn(1000, 500000000);
      const debit = rn(0, 50000000);
      const credit = rn(0, 50000000);
      const closing = opening + debit - credit;
      const priorQ = rn(opening * 0.9, opening * 1.1);
      const priorY = rn(opening * 0.85, opening * 1.15);
      const isIC = Math.random() < 0.15;

      rows.push([
        acct.code, acct.name, acct.type, acct.subtype,
        entity, entity === "MHBK-US" ? "Mizuho Bank USA" : entity === "MHBK-CAY" ? "Mizuho Cayman" : entity === "MHBK-NY-BR" ? "Mizuho NY Branch" : "Mizuho Securities US",
        cc, pick(["Treasury", "Lending", "Trading", "Operations", "Risk", "Finance", "Compliance", "IT"]),
        ccy, "2024-12-31", 2024, "Q4",
        opening, debit, credit, closing,
        Math.round(opening / fxRate), Math.round(closing / fxRate), fxRate,
        Math.round(closing * rn(3.5, 4.2, 1)), priorQ, priorY,
        isIC ? "Y" : "N", isIC ? pick(["MHBK-CAY", "MHBK-NY-BR", "MHSC-US", "MHFG-JP"]) : "",
        isIC ? "Y" : "N",
        rn(-500000, 500000), rn(-200000, 200000),
        `${mdrmPrefixes[acct.type] || "RCFD"}${rn(1000, 9999)}`,
        scheduleMap[acct.type] || "RC",
        `Line ${rn(1, 40)}`,
        acct.type, acct.type,
        pick(["CET1", "AT1", "T2", "N/A", "Deduction"]),
        pick([0, 20, 50, 100, 150]),
        "2025-01-15", pick(["SYSTEM", "J.TANAKA", "R.SMITH", "K.WATANABE"]),
        pick(["Approved", "Pending Review", "Auto-Approved"]),
        `AUD-${rn(100000, 999999)}`,
        pick(["SAP GL", "Oracle EBS", "FIS", "Calypso"]),
        pick(["Reconciled", "Pending", "Exception"]),
        Math.abs((closing - priorQ) / (priorQ || 1)) > 0.1 ? "Y" : "N",
        ""
      ]);
      if (rows.length >= 248) break;
    }
    if (rows.length >= 248) break;
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, makeSheet(headers, rows.slice(0, 248)), "GL_Extract");
  XLSX.writeFile(wb, path.join(outDir, "GL_Extract_Q4_2024.xlsx"));
  console.log(`GL_Extract: ${rows.slice(0, 248).length} rows, ${headers.length} columns`);
}

// ─── 2. Trading_Positions_Q4.xlsx (156 fields) ───

function generateTrading() {
  const products = [
    "IR Swap", "FX Forward", "FX Spot", "CDS", "IR Swaption", "FX Option",
    "Treasury Bond", "Agency MBS", "Corporate Bond", "Equity Option",
    "Commodity Future", "Total Return Swap", "Cross-Currency Swap",
    "Interest Rate Cap", "Interest Rate Floor", "Variance Swap",
    "FRA", "Basis Swap", "Inflation Swap", "Credit Index"
  ];
  const books = ["FX-G10", "FX-EM", "RATES-USD", "RATES-JPY", "RATES-EUR", "CREDIT-IG", "CREDIT-HY", "EQ-FLOW", "COMMOD-ENERGY", "STRUCT-NOTES"];
  const desks = ["FX Trading", "Rates Trading", "Credit Trading", "Equity Derivatives", "Commodities", "Structured Products"];
  const ccpNames = ["LCH", "CME", "ICE", "JSCC", "Bilateral"];

  const headers = [
    "Trade_ID", "Trade_Date", "Settlement_Date", "Maturity_Date",
    "Product_Type", "Product_Subtype", "Asset_Class",
    "Trading_Book", "Trading_Desk", "Trader_ID",
    "Counterparty_ID", "Counterparty_Name", "Counterparty_LEI",
    "Buy_Sell", "Notional_Amount_USD", "Notional_Amount_Local", "Notional_Currency",
    "Mark_to_Market_USD", "Unrealized_PnL_USD", "Realized_PnL_USD", "Day_PnL_USD",
    "MTD_PnL_USD", "YTD_PnL_USD",
    "Strike_Price", "Spot_Rate", "Forward_Rate",
    "Fixed_Rate", "Floating_Rate_Index", "Floating_Rate_Spread_bps",
    "Tenor", "Payment_Frequency",
    "Delta", "Gamma", "Vega", "Theta", "Rho",
    "DV01_USD", "CS01_USD", "Convexity",
    "VaR_1D_99", "VaR_10D_99", "SVaR_1D_99",
    "ISDA_Master_Agreement", "CSA_Flag", "Initial_Margin_USD", "Variation_Margin_USD",
    "CCP_Cleared", "CCP_Name", "Netting_Set_ID",
    "Hedge_Flag", "Hedge_Designation", "Hedged_Item_ID",
    "Regulatory_Product_Class", "SA_Risk_Class", "FRTB_Desk",
    "Capital_Charge_USD", "RWA_Contribution_USD",
    "Booking_Entity", "Legal_Entity_LEI",
    "Front_Office_System", "Confirmation_Status", "Settlement_Status",
    "Last_Valuation_Date", "Valuation_Source", "Price_Verification_Status"
  ];

  const rows = [];
  for (let i = 0; i < 156; i++) {
    const prod = pick(products);
    const tradeDate = new Date(2024, rn(0, 11), rn(1, 28));
    const matDate = new Date(tradeDate.getTime() + rn(30, 3650) * 86400000);
    const settDate = new Date(tradeDate.getTime() + rn(1, 5) * 86400000);
    const notional = rn(1000000, 500000000);
    const mtm = rn(-5000000, 10000000);
    const isCCP = Math.random() < 0.6;

    rows.push([
      `TRD-${String(20240001 + i)}`,
      fmtDate(tradeDate), fmtDate(settDate), fmtDate(matDate),
      prod, prod.includes("Swap") ? "Vanilla" : prod.includes("Option") ? "European" : "Standard",
      prod.includes("FX") ? "FX" : prod.includes("IR") || prod.includes("Swap") || prod.includes("Rate") ? "Rates" : prod.includes("Credit") || prod.includes("CDS") ? "Credit" : "Equity",
      pick(books), pick(desks), `TDR-${rn(100, 999)}`,
      `CPT-${rn(1000, 9999)}`, pick(["Goldman Sachs Intl", "JPMorgan London", "Deutsche Bank AG", "Barclays Capital", "Citigroup Global", "BNP Paribas", "HSBC Bank", "Morgan Stanley Intl", "UBS AG", "Nomura Intl"]),
      `${rn(1000, 9999)}00${rn(10, 99)}${String.fromCharCode(65 + rn(0, 25))}${String.fromCharCode(65 + rn(0, 25))}${rn(10, 99)}`,
      pick(["Buy", "Sell"]), notional, Math.round(notional * rn(0.8, 1.5, 2)), pick(["USD", "JPY", "EUR", "GBP", "CHF", "AUD", "CAD"]),
      mtm, rn(-2000000, 5000000), rn(-500000, 1000000), rn(-200000, 300000),
      rn(-1000000, 2000000), rn(-3000000, 8000000),
      rn(0.5, 150, 4), rn(0.9, 1.5, 6), rn(0.95, 1.45, 6),
      rn(0.5, 6.0, 4), pick(["SOFR", "TONA", "EURIBOR", "Fed Funds", "N/A"]), rn(-50, 200),
      pick(["1Y", "2Y", "3Y", "5Y", "7Y", "10Y", "15Y", "20Y", "30Y"]),
      pick(["Quarterly", "Semi-Annual", "Annual", "Monthly", "At Maturity"]),
      rn(-1, 1, 4), rn(-0.05, 0.05, 6), rn(-500000, 500000), rn(-50000, 10000), rn(-200000, 200000),
      rn(100, 50000), rn(0, 25000), rn(-5, 5, 4),
      rn(50000, 2000000), rn(150000, 6000000), rn(80000, 3000000),
      `ISDA-${rn(2015, 2024)}-${rn(100, 999)}`, pick(["Y", "N"]),
      rn(100000, 10000000), rn(-5000000, 5000000),
      isCCP ? "Y" : "N", isCCP ? pick(ccpNames.slice(0, 4)) : "Bilateral", `NS-${rn(100, 999)}`,
      Math.random() < 0.3 ? "Y" : "N", Math.random() < 0.3 ? pick(["Cash Flow", "Fair Value", "Net Investment"]) : "N/A", Math.random() < 0.3 ? `HDG-${rn(1000, 9999)}` : "",
      pick(["GIRR", "CSR", "Equity", "Commodity", "FX"]), pick(["Delta", "Vega", "Curvature", "Default"]), pick(["FRTB-1", "FRTB-2", "FRTB-3"]),
      rn(10000, 500000), rn(100000, 5000000),
      pick(["MHBK-US", "MHSC-US"]), "549300H14YVL7H6VE920",
      pick(["Calypso", "Murex", "Summit", "Bloomberg TOMS"]), pick(["Confirmed", "Pending", "Disputed"]), pick(["Settled", "Pending", "Partial"]),
      "2024-12-31", pick(["Bloomberg", "Reuters", "MarkIT", "Internal"]), pick(["Verified", "Pending IPV", "Exception"])
    ]);
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, makeSheet(headers, rows), "Trading_Positions");
  XLSX.writeFile(wb, path.join(outDir, "Trading_Positions_Q4.xlsx"));
  console.log(`Trading_Positions: ${rows.length} rows, ${headers.length} columns`);
}

// ─── 3. Loan_Portfolio_Q4.xlsx (312 fields) ───

function generateLoans() {
  const loanTypes = [
    "C&I Term Loan", "C&I Revolver", "CRE - Office", "CRE - Multifamily", "CRE - Retail",
    "CRE - Industrial", "CRE - Hotel", "Construction", "Residential 1-4",
    "HELOC", "Auto Loan", "Credit Card", "Student Loan",
    "Agriculture", "Lease Financing", "Syndicated Loan", "Project Finance",
    "Trade Finance", "Asset-Based Lending", "Leveraged Loan"
  ];
  const ratings = ["1-Pass", "2-Pass", "3-Special Mention", "4-Substandard", "5-Doubtful", "6-Loss"];
  const industries = ["Technology", "Healthcare", "Real Estate", "Energy", "Manufacturing", "Retail", "Financial Services", "Telecom", "Transportation", "Agriculture", "Government", "Education"];
  const states = ["NY", "CA", "TX", "FL", "IL", "PA", "OH", "GA", "NC", "NJ", "VA", "WA", "MA", "AZ", "CO"];

  const headers = [
    "Loan_ID", "Account_Number", "Borrower_ID", "Borrower_Name", "Borrower_TIN",
    "Loan_Type", "Loan_Purpose", "Loan_Category_FFIEC",
    "Origination_Date", "Maturity_Date", "Last_Renewal_Date",
    "Original_Amount_USD", "Current_Commitment_USD", "Outstanding_Balance_USD", "Unfunded_Commitment_USD",
    "Accrued_Interest_USD", "Deferred_Fees_USD",
    "Interest_Rate_Type", "Current_Rate_Pct", "Index_Rate", "Spread_bps", "Rate_Floor_Pct", "Rate_Ceiling_Pct",
    "Payment_Frequency", "Next_Payment_Date", "Payment_Amount_USD",
    "Collateral_Type", "Collateral_Value_USD", "LTV_Pct", "Collateral_State",
    "Risk_Rating_Internal", "Risk_Rating_Date", "Prior_Risk_Rating",
    "FICO_Score_Origination", "FICO_Score_Current",
    "Days_Past_Due", "Nonaccrual_Flag", "Nonaccrual_Date",
    "TDR_Flag", "TDR_Type", "Impaired_Flag",
    "ACL_Specific_USD", "ACL_General_USD", "ACL_Total_USD",
    "CECL_ECL_USD", "CECL_Probability_of_Default", "CECL_Loss_Given_Default", "CECL_Exposure_at_Default",
    "Charge_Off_Amount_USD", "Recovery_Amount_USD", "Net_Charge_Off_USD",
    "Industry_NAICS", "Industry_Description", "Borrower_State", "Borrower_Country",
    "Participation_Flag", "Participation_Pct", "Lead_Bank",
    "Call_Report_Schedule", "Call_Report_Line",
    "Risk_Weight_Pct", "RWA_USD",
    "Officer_ID", "Officer_Name", "Branch_Code",
    "Last_Review_Date", "Next_Review_Date", "Review_Status"
  ];

  const rows = [];
  for (let i = 0; i < 312; i++) {
    const loanType = pick(loanTypes);
    const origDate = new Date(rn(2018, 2024), rn(0, 11), rn(1, 28));
    const matDate = new Date(origDate.getTime() + rn(365, 3650) * 86400000);
    const origAmt = rn(100000, 200000000);
    const outBal = Math.round(origAmt * rn(0.3, 1.0, 2));
    const unfunded = origAmt - outBal;
    const rating = pick(ratings);
    const dpd = rating.startsWith("1") || rating.startsWith("2") ? rn(0, 5) : rn(0, 180);
    const isNonaccrual = dpd > 90;
    const collVal = Math.round(origAmt * rn(1.0, 2.5, 2));
    const ltv = Math.round((outBal / collVal) * 100);
    const pd = rating.startsWith("1") ? rn(0.001, 0.01, 4) : rating.startsWith("2") ? rn(0.01, 0.05, 4) : rn(0.05, 0.3, 4);
    const lgd = rn(0.2, 0.6, 4);
    const ecl = Math.round(outBal * pd * lgd);
    const state = pick(states);
    const isParticipation = Math.random() < 0.2;

    rows.push([
      `LN-${String(100001 + i)}`, `ACCT-${rn(10000000, 99999999)}`,
      `BOR-${rn(10000, 99999)}`, `Borrower ${i + 1} Corp`, `${rn(10, 99)}-${rn(1000000, 9999999)}`,
      loanType, pick(["Working Capital", "Acquisition", "Refinance", "Expansion", "Equipment", "Construction", "Bridge"]),
      pick(["C&I", "CRE - Owner Occupied", "CRE - Non-Owner", "Residential", "Consumer", "Agriculture"]),
      fmtDate(origDate), fmtDate(matDate), fmtDate(new Date(Math.max(origDate.getTime(), Date.now() - rn(30, 365) * 86400000))),
      origAmt, origAmt, outBal, unfunded,
      Math.round(outBal * rn(0.003, 0.015, 4)), rn(0, 50000),
      pick(["Fixed", "Variable", "Hybrid"]), rn(3.5, 9.5, 4),
      pick(["SOFR", "Prime", "Fed Funds", "Fixed"]), rn(100, 400),
      rn(1.0, 4.0, 2), rn(8.0, 15.0, 2),
      pick(["Monthly", "Quarterly", "Semi-Annual", "Annual", "IO Monthly"]),
      fmtDate(new Date(2025, rn(0, 2), rn(1, 28))),
      Math.round(outBal * rn(0.005, 0.03, 4)),
      pick(["Real Estate", "Equipment", "Accounts Receivable", "Inventory", "Cash", "Securities", "Unsecured", "Mixed"]),
      collVal, ltv, state,
      rating, fmtDate(new Date(2024, rn(6, 11), rn(1, 28))), pick(ratings),
      rn(620, 800), rn(600, 820),
      dpd, isNonaccrual ? "Y" : "N", isNonaccrual ? fmtDate(new Date(2024, rn(0, 11), rn(1, 28))) : "",
      Math.random() < 0.05 ? "Y" : "N", Math.random() < 0.05 ? pick(["Rate Reduction", "Term Extension", "Principal Forgiveness"]) : "", isNonaccrual ? "Y" : "N",
      isNonaccrual ? rn(10000, 1000000) : 0, Math.round(outBal * rn(0.005, 0.02, 4)), isNonaccrual ? rn(10000, 1000000) + Math.round(outBal * 0.01) : Math.round(outBal * 0.01),
      ecl, pd, lgd, outBal,
      isNonaccrual ? rn(0, 500000) : 0, rn(0, 50000), isNonaccrual ? rn(0, 450000) : 0,
      `${rn(11, 92)}${rn(1000, 9999)}`, pick(industries), state, "US",
      isParticipation ? "Y" : "N", isParticipation ? rn(10, 80) : 100, isParticipation ? pick(["JPMorgan", "BofA", "Citi", "Wells Fargo"]) : "N/A",
      pick(["RC-C Part I", "RC-C Part II"]), `Line ${rn(1, 12)}`,
      pick([0, 20, 50, 75, 100, 150]), Math.round(outBal * pick([0, 0.2, 0.5, 0.75, 1.0, 1.5])),
      `OFF-${rn(100, 999)}`, pick(["J. Smith", "K. Tanaka", "M. Johnson", "S. Nakamura", "R. Williams"]), pick(["NYC-01", "LA-02", "CHI-03", "MIA-04"]),
      fmtDate(new Date(2024, rn(6, 11), rn(1, 28))),
      fmtDate(new Date(2025, rn(0, 5), rn(1, 28))),
      pick(["Complete", "In Progress", "Scheduled"])
    ]);
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, makeSheet(headers, rows), "Loan_Portfolio");
  XLSX.writeFile(wb, path.join(outDir, "Loan_Portfolio_Q4.xlsx"));
  console.log(`Loan_Portfolio: ${rows.length} rows, ${headers.length} columns`);
}

// ─── 4. Treasury_Data_Q4.xlsx (98 fields) ───

function generateTreasury() {
  const instruments = [
    "US Treasury 2Y", "US Treasury 5Y", "US Treasury 10Y", "US Treasury 30Y",
    "Agency MBS 15Y", "Agency MBS 30Y", "Agency CMBS", "Agency Debenture",
    "Municipal Bond", "Corporate Bond IG", "Corporate Bond HY",
    "CD - Domestic", "CD - Euro", "Commercial Paper",
    "FHLB Advance Fixed", "FHLB Advance Floating", "Fed Funds",
    "Repo Agreement", "Reverse Repo",
    "SOFR Swap", "Treasury Futures"
  ];
  const portfolios = ["AFS", "HTM", "Trading", "Liquidity Buffer", "Pledged"];

  const headers = [
    "Position_ID", "CUSIP", "ISIN", "Security_Description", "Instrument_Type",
    "Portfolio", "Investment_Category",
    "Trade_Date", "Settlement_Date", "Maturity_Date", "Call_Date",
    "Par_Value_USD", "Book_Value_USD", "Market_Value_USD", "Accrued_Interest_USD",
    "Amortized_Cost_USD", "Fair_Value_USD",
    "Unrealized_Gain_Loss_USD", "AOCI_Impact_USD",
    "Coupon_Rate_Pct", "Yield_to_Maturity_Pct", "Current_Yield_Pct",
    "Duration_Years", "Modified_Duration", "Convexity", "DV01_USD",
    "Credit_Rating_SP", "Credit_Rating_Moodys",
    "Sector", "Issuer_Name", "Issuer_Country",
    "Pledged_Flag", "Pledged_To", "Pledged_Value_USD",
    "HQLA_Category", "LCR_Eligible_Flag",
    "Impairment_Flag", "CECL_ACL_USD",
    "Call_Report_Schedule", "Call_Report_Line", "MDRM_Code",
    "Accounting_Treatment", "ASC_Classification",
    "Last_Valuation_Date", "Valuation_Source",
    "Custodian", "Custodian_Account"
  ];

  const rows = [];
  for (let i = 0; i < 98; i++) {
    const inst = pick(instruments);
    const port = pick(portfolios);
    const par = rn(1000000, 100000000);
    const bookVal = Math.round(par * rn(0.95, 1.05, 4));
    const mktVal = Math.round(par * rn(0.88, 1.08, 4));
    const unreal = mktVal - bookVal;
    const coupon = rn(1.0, 7.5, 3);
    const ytm = rn(1.5, 7.0, 3);
    const dur = rn(0.5, 15, 2);
    const tradeDate = new Date(rn(2020, 2024), rn(0, 11), rn(1, 28));
    const matDate = new Date(tradeDate.getTime() + rn(365, 10950) * 86400000);
    const isPledged = Math.random() < 0.3;

    rows.push([
      `SEC-${String(50001 + i)}`,
      `${rn(100000, 999999)}${String.fromCharCode(65 + rn(0, 25))}${String.fromCharCode(65 + rn(0, 25))}${rn(0, 9)}`,
      `US${rn(1000000000, 9999999999)}${rn(0, 9)}`,
      inst, inst.includes("Treasury") ? "Government" : inst.includes("Agency") ? "Agency" : inst.includes("Corporate") ? "Corporate" : "Other",
      port, pick(["Fixed Income", "Money Market", "Structured", "Equity"]),
      fmtDate(tradeDate), fmtDate(new Date(tradeDate.getTime() + 2 * 86400000)), fmtDate(matDate),
      inst.includes("Municipal") || inst.includes("Corporate") ? fmtDate(new Date(matDate.getTime() - rn(365, 1825) * 86400000)) : "",
      par, bookVal, mktVal, Math.round(par * coupon / 100 * rn(0.01, 0.5, 4)),
      bookVal, mktVal,
      unreal, port === "AFS" ? unreal : 0,
      coupon, ytm, rn(1.0, 8.0, 3),
      dur, rn(dur * 0.9, dur * 1.0, 2), rn(-2, 5, 4), Math.round(par * dur * 0.0001),
      pick(["AAA", "AA+", "AA", "AA-", "A+", "A", "A-", "BBB+", "BBB", "BBB-", "BB+", "NR"]),
      pick(["Aaa", "Aa1", "Aa2", "Aa3", "A1", "A2", "A3", "Baa1", "Baa2", "Baa3", "NR"]),
      pick(["Government", "Agency", "Financial", "Industrial", "Utility", "Municipal"]),
      inst.includes("Treasury") ? "US Treasury" : inst.includes("Agency") ? pick(["Fannie Mae", "Freddie Mac", "Ginnie Mae"]) : pick(["Goldman Sachs", "Apple Inc", "Microsoft", "State of NY"]),
      "US",
      isPledged ? "Y" : "N", isPledged ? pick(["FHLB", "Fed Discount Window", "Repo", "Public Deposits"]) : "", isPledged ? mktVal : 0,
      inst.includes("Treasury") || inst.includes("Agency") ? "Level 1" : "Level 2A",
      inst.includes("Treasury") || inst.includes("Agency") ? "Y" : "N",
      Math.random() < 0.03 ? "Y" : "N", Math.random() < 0.03 ? rn(10000, 500000) : 0,
      "RC-B", `Line ${rn(1, 10)}`, `RCFD${rn(1000, 9999)}`,
      port === "HTM" ? "Amortized Cost" : port === "AFS" ? "Fair Value - OCI" : "Fair Value - P&L",
      pick(["ASC 320", "ASC 326", "ASC 815"]),
      "2024-12-31", pick(["Bloomberg", "ICE", "Internal", "Vendor Feed"]),
      pick(["BNY Mellon", "State Street", "JPMorgan", "Northern Trust"]),
      `CUST-${rn(100000, 999999)}`
    ]);
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, makeSheet(headers, rows), "Treasury_Data");
  XLSX.writeFile(wb, path.join(outDir, "Treasury_Data_Q4.xlsx"));
  console.log(`Treasury_Data: ${rows.length} rows, ${headers.length} columns`);
}

// ─── 5. Risk_Metrics_Q4.xlsx (189 fields) ───

function generateRisk() {
  const riskTypes = [
    "Credit Risk - C&I", "Credit Risk - CRE", "Credit Risk - Consumer", "Credit Risk - Sovereign",
    "Market Risk - IR", "Market Risk - FX", "Market Risk - Equity", "Market Risk - Commodity",
    "Operational Risk", "Liquidity Risk", "Concentration Risk",
    "Interest Rate Risk - Banking Book", "Counterparty Credit Risk",
    "Model Risk", "Compliance Risk", "Reputational Risk",
    "Strategic Risk", "Climate Risk", "Cyber Risk"
  ];
  const scenarios = ["Base", "Adverse", "Severely Adverse", "Custom Stress 1", "Custom Stress 2"];

  const headers = [
    "Risk_ID", "Risk_Category", "Risk_Type", "Risk_Sub_Category",
    "Business_Unit", "Legal_Entity", "Portfolio_ID",
    "Measurement_Date", "Reporting_Period",
    "Exposure_Amount_USD", "EAD_USD", "PD_Pct", "LGD_Pct", "Expected_Loss_USD",
    "Unexpected_Loss_USD", "Economic_Capital_USD",
    "RWA_SA_USD", "RWA_IRB_USD", "RWA_Final_USD",
    "Capital_Charge_USD", "Capital_Ratio_Impact_bps",
    "VaR_1D_99_USD", "VaR_10D_99_USD", "CVaR_1D_99_USD",
    "Stressed_VaR_USD", "Incremental_Risk_Charge_USD",
    "Scenario", "Scenario_Loss_USD", "Scenario_Revenue_Impact_USD",
    "Stress_Test_CET1_Impact_bps", "Stress_Test_Tier1_Impact_bps",
    "Limit_Amount_USD", "Limit_Utilization_Pct", "Limit_Breach_Flag",
    "Concentration_Pct", "Concentration_Threshold_Pct",
    "LCR_Pct", "NSFR_Pct", "Liquidity_Buffer_USD",
    "IRRBB_EVE_Change_USD", "IRRBB_NII_Change_USD",
    "Key_Risk_Indicator", "KRI_Value", "KRI_Threshold", "KRI_Status",
    "Risk_Appetite_Metric", "Risk_Appetite_Limit", "Risk_Appetite_Actual", "Risk_Appetite_Status",
    "Regulatory_Framework", "Basel_Pillar",
    "Last_Review_Date", "Risk_Owner", "Approval_Status",
    "Data_Quality_Score", "Model_ID", "Model_Validation_Status"
  ];

  const rows = [];
  for (let i = 0; i < 189; i++) {
    const riskType = pick(riskTypes);
    const scenario = pick(scenarios);
    const exposure = rn(10000000, 2000000000);
    const pd = rn(0.001, 0.15, 5);
    const lgd = rn(0.15, 0.65, 4);
    const el = Math.round(exposure * pd * lgd);
    const ul = Math.round(el * rn(2, 8, 1));
    const rwa = Math.round(exposure * rn(0.2, 1.5, 2));
    const limitAmt = Math.round(exposure * rn(1.1, 2.0, 2));
    const utilPct = Math.round((exposure / limitAmt) * 100);

    rows.push([
      `RSK-${String(70001 + i)}`, 
      riskType.split(" - ")[0], riskType, pick(["Wholesale", "Retail", "Market", "Operational", "Strategic"]),
      pick(["Corporate Banking", "Investment Banking", "Retail Banking", "Treasury", "Global Markets"]),
      pick(["MHBK-US", "MHSC-US", "MHBK-NY-BR"]),
      `PORT-${rn(100, 999)}`,
      "2024-12-31", "Q4 2024",
      exposure, Math.round(exposure * rn(0.8, 1.2, 2)), pd, lgd, el,
      ul, Math.round(ul * rn(0.8, 1.2, 2)),
      rwa, Math.round(rwa * rn(0.7, 1.1, 2)), rwa,
      Math.round(rwa * rn(0.08, 0.12, 4)), rn(1, 50),
      rn(500000, 20000000), rn(1500000, 60000000), rn(700000, 25000000),
      rn(2000000, 40000000), rn(1000000, 15000000),
      scenario, Math.round(exposure * rn(0.01, 0.15, 4)), rn(-5000000, -50000000),
      rn(-10, -200), rn(-5, -150),
      limitAmt, utilPct, utilPct > 90 ? "Y" : "N",
      rn(1, 25, 1), rn(15, 30, 1),
      rn(100, 250, 1), rn(100, 180, 1), rn(500000000, 5000000000),
      rn(-50000000, 50000000), rn(-20000000, 20000000),
      pick(["VaR Utilization", "Limit Breach Count", "Loss Rate", "NPL Ratio", "Concentration Index", "Liquidity Gap"]),
      rn(0.5, 95, 2), rn(50, 100, 1),
      pick(["Green", "Amber", "Red"]),
      pick(["Credit Loss Rate", "Market Loss", "Operational Loss", "Capital Adequacy"]),
      rn(10, 200, 1), rn(5, 180, 1),
      pick(["Within Appetite", "Watch", "Breach"]),
      pick(["Basel III", "Basel IV", "Dodd-Frank", "CCAR", "DFAST"]),
      pick(["Pillar 1", "Pillar 2", "Pillar 3"]),
      fmtDate(new Date(2024, rn(9, 11), rn(1, 28))),
      pick(["CRO Office", "Market Risk", "Credit Risk", "OpRisk", "Model Risk"]),
      pick(["Approved", "Under Review", "Pending"]),
      rn(80, 100, 1),
      `MDL-${rn(100, 999)}`,
      pick(["Validated", "Conditional", "Under Review", "Expired"])
    ]);
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, makeSheet(headers, rows), "Risk_Metrics");
  XLSX.writeFile(wb, path.join(outDir, "Risk_Metrics_Q4.xlsx"));
  console.log(`Risk_Metrics: ${rows.length} rows, ${headers.length} columns`);
}

// ─── 6. MDRM_Taxonomy.xlsx ───

function generateMDRM() {
  const mdrmEntries = [
    ["RCFD2170", "Total Assets", "RC", "Line 12", "Balance Sheet", "Sum of all asset accounts", "Thousands USD", "RCFD", "2170", "N/A", "Mandatory"],
    ["RCON2200", "Total Deposits", "RC", "Line 13", "Balance Sheet", "Total deposits (domestic + foreign)", "Thousands USD", "RCON", "2200", "N/A", "Mandatory"],
    ["RCFD2122", "Net Loans and Leases", "RC", "Line 4.b", "Balance Sheet", "Loans net of unearned income and allowance", "Thousands USD", "RCFD", "2122", "N/A", "Mandatory"],
    ["RCFD8641", "Total Securities", "RC-B", "Memo", "Balance Sheet", "HTM + AFS securities at fair value", "Thousands USD", "RCFD", "8641", "N/A", "Mandatory"],
    ["RCFD3210", "Total Equity Capital", "RC", "Line 28", "Balance Sheet", "Total equity capital including minority interest", "Thousands USD", "RCFD", "3210", "N/A", "Mandatory"],
    ["RIAD4340", "Net Income (Loss)", "RI", "Line 14", "Income Statement", "Net income after taxes and extraordinary items", "Thousands USD", "RIAD", "4340", "N/A", "Mandatory"],
    ["RIAD4074", "Total Interest Income", "RI", "Line 1.i", "Income Statement", "Sum of all interest and fee income", "Thousands USD", "RIAD", "4074", "N/A", "Mandatory"],
    ["RIAD4079", "Total Interest Expense", "RI", "Line 2.f", "Income Statement", "Sum of all interest expense", "Thousands USD", "RIAD", "4079", "N/A", "Mandatory"],
    ["RIAD4230", "Total Non-Interest Income", "RI", "Line 5.m", "Income Statement", "Service charges, trading revenue, other", "Thousands USD", "RIAD", "4230", "N/A", "Mandatory"],
    ["RIAD4093", "Total Non-Interest Expense", "RI", "Line 7.d", "Income Statement", "Salaries, occupancy, other operating", "Thousands USD", "RIAD", "4093", "N/A", "Mandatory"],
    ["RIAD4230B", "Provision for Credit Losses", "RI", "Line 4", "Income Statement", "CECL provision for credit losses on all instruments", "Thousands USD", "RIAD", "4230B", "ASC 326", "Mandatory"],
    ["RCFDA223", "CET1 Capital", "RC-R Part I", "Line 22", "Capital", "Common Equity Tier 1 capital per Basel III", "Thousands USD", "RCFD", "A223", "Basel III", "Mandatory"],
    ["RCFD8274", "Tier 1 Capital", "RC-R Part I", "Line 26", "Capital", "CET1 + Additional Tier 1 capital", "Thousands USD", "RCFD", "8274", "Basel III", "Mandatory"],
    ["RCFDA224", "Total Capital", "RC-R Part I", "Line 31", "Capital", "Tier 1 + Tier 2 capital", "Thousands USD", "RCFD", "A224", "Basel III", "Mandatory"],
    ["RCFDA223R", "CET1 Capital Ratio", "RC-R Part I", "Line 32", "Capital Ratios", "CET1 Capital / Total RWA", "Percent", "RCFD", "A223R", "Basel III", "Mandatory"],
    ["RCFD7206", "Tier 1 Capital Ratio", "RC-R Part I", "Line 33", "Capital Ratios", "Tier 1 Capital / Total RWA", "Percent", "RCFD", "7206", "Basel III", "Mandatory"],
    ["RCFD7205", "Total Capital Ratio", "RC-R Part I", "Line 34", "Capital Ratios", "Total Capital / Total RWA", "Percent", "RCFD", "7205", "Basel III", "Mandatory"],
    ["RCFDA222", "Total RWA", "RC-R Part II", "Line 62", "Capital", "Total risk-weighted assets", "Thousands USD", "RCFD", "A222", "Basel III", "Mandatory"],
    ["UBPR1", "Net Interest Margin", "UBPR Page 1", "Line 4", "Performance Ratios", "Net interest income / average earning assets annualized", "Percent", "UBPR", "NIMY", "UBPR", "Derived"],
    ["UBPR2", "Return on Assets", "UBPR Page 1", "Line 1", "Performance Ratios", "Net income / average total assets annualized", "Percent", "UBPR", "ROA", "UBPR", "Derived"],
    ["UBPR3", "Return on Equity", "UBPR Page 1", "Line 2", "Performance Ratios", "Net income / average equity annualized", "Percent", "UBPR", "ROE", "UBPR", "Derived"],
    ["UBPR4", "Efficiency Ratio", "UBPR Page 1", "Line 8", "Performance Ratios", "Non-interest expense / (net interest income + non-interest income)", "Percent", "UBPR", "EEFF", "UBPR", "Derived"],
    ["UBPR5", "NPA Ratio", "UBPR Page 7", "Line 15", "Asset Quality", "Non-performing assets / total assets", "Percent", "UBPR", "P3ASSET", "UBPR", "Derived"],
    ["UBPR6", "Net Charge-Off Rate", "UBPR Page 4", "Line 6", "Asset Quality", "Net charge-offs / average loans annualized", "Percent", "UBPR", "ELNANTR", "UBPR", "Derived"],
    ["UBPR7", "Loan to Deposit Ratio", "UBPR Page 1", "Line 12", "Liquidity", "Total loans / total deposits", "Percent", "UBPR", "LDEP", "UBPR", "Derived"],
    ["RCON6631", "Deposits - Demand (Non-Interest)", "RC-E Part I", "Line 1", "Deposits", "Non-interest bearing demand deposits (domestic)", "Thousands USD", "RCON", "6631", "N/A", "Mandatory"],
    ["RCON6636", "Deposits - NOW Accounts", "RC-E Part I", "Line 2", "Deposits", "Interest-bearing transaction accounts", "Thousands USD", "RCON", "6636", "N/A", "Mandatory"],
    ["RCON2389", "Deposits - MMDA", "RC-E Part I", "Line 3", "Deposits", "Money market deposit accounts", "Thousands USD", "RCON", "2389", "N/A", "Mandatory"],
    ["RCON6648", "Deposits - Other Savings", "RC-E Part I", "Line 4", "Deposits", "Other savings deposits", "Thousands USD", "RCON", "6648", "N/A", "Mandatory"],
    ["RCON6645", "Deposits - Time < $250K", "RC-E Part I", "Line 5", "Deposits", "Time deposits less than $250,000", "Thousands USD", "RCON", "6645", "N/A", "Mandatory"],
    ["RCONJ473", "Deposits - Time >= $250K", "RC-E Part I", "Line 6", "Deposits", "Time deposits $250,000 or more", "Thousands USD", "RCON", "J473", "N/A", "Mandatory"],
    ["RCFD1754", "Loans - C&I (Domestic)", "RC-C Part I", "Line 4.a", "Loans", "Commercial and industrial loans to US addresses", "Thousands USD", "RCFD", "1754", "N/A", "Mandatory"],
    ["RCFD1763", "Loans - CRE (Non-Farm, Non-Res)", "RC-C Part I", "Line 1.a.(1)", "Loans", "Non-farm non-residential CRE loans", "Thousands USD", "RCFD", "1763", "N/A", "Mandatory"],
    ["RCFD1764", "Loans - CRE (Multifamily)", "RC-C Part I", "Line 1.a.(2)", "Loans", "Multifamily residential real estate loans", "Thousands USD", "RCFD", "1764", "N/A", "Mandatory"],
    ["RCFD1460", "Loans - Construction & Land", "RC-C Part I", "Line 1.a.(3)", "Loans", "Construction and land development loans", "Thousands USD", "RCFD", "1460", "N/A", "Mandatory"],
    ["RCFD1797", "Loans - 1-4 Family Residential", "RC-C Part I", "Line 1.c", "Loans", "Residential real estate loans 1-4 family", "Thousands USD", "RCFD", "1797", "N/A", "Mandatory"],
    ["RCFD2107", "Allowance for Credit Losses", "RC", "Line 4.c", "Loans", "Total allowance for credit losses on loans", "Thousands USD", "RCFD", "2107", "ASC 326", "Mandatory"],
    ["RCFDB528", "HTM Securities - Amortized Cost", "RC-B", "Line 8.a", "Securities", "Held-to-maturity debt securities at amortized cost", "Thousands USD", "RCFD", "B528", "ASC 320", "Mandatory"],
    ["RCFDB529", "HTM Securities - Fair Value", "RC-B", "Line 8.b", "Securities", "Held-to-maturity debt securities at fair value", "Thousands USD", "RCFD", "B529", "ASC 320", "Mandatory"],
    ["RCFD1773", "AFS Securities - Fair Value", "RC-B", "Line 8.c", "Securities", "Available-for-sale debt securities at fair value", "Thousands USD", "RCFD", "1773", "ASC 320", "Mandatory"],
    ["RCFDB530", "AFS Securities - Amortized Cost", "RC-B", "Line 8.d", "Securities", "Available-for-sale debt securities amortized cost", "Thousands USD", "RCFD", "B530", "ASC 320", "Mandatory"],
    ["RCFDC026", "AOCI - Unrealized G/L on AFS", "RC-R Part I", "Line 3.a", "Capital", "Accumulated other comprehensive income - AFS securities", "Thousands USD", "RCFD", "C026", "ASC 220", "Mandatory"],
    ["RIAD4010", "Interest on Loans", "RI", "Line 1.a", "Interest Income", "Interest and fee income on loans", "Thousands USD", "RIAD", "4010", "N/A", "Mandatory"],
    ["RIAD4020", "Interest on Investment Securities", "RI", "Line 1.b", "Interest Income", "Interest income on held-to-maturity securities", "Thousands USD", "RIAD", "4020", "N/A", "Mandatory"],
    ["RIAD4115", "Interest on Deposits", "RI", "Line 2.a", "Interest Expense", "Interest expense on deposits", "Thousands USD", "RIAD", "4115", "N/A", "Mandatory"],
    ["RIAD4180", "Salaries and Employee Benefits", "RI", "Line 7.a", "Non-Interest Expense", "Total salaries and employee benefits", "Thousands USD", "RIAD", "4180", "N/A", "Mandatory"],
    ["RIADA220", "Trading Revenue", "RI", "Line 5.c", "Non-Interest Income", "Trading revenue from all asset classes", "Thousands USD", "RIAD", "A220", "N/A", "Conditional"],
    ["RIAD3196", "Realized G/L on Securities", "RI", "Line 6.a", "Non-Interest Income", "Realized gains (losses) on HTM and AFS securities", "Thousands USD", "RIAD", "3196", "ASC 320", "Mandatory"],
    ["RCFDC223", "Leverage Ratio", "RC-R Part I", "Line 35", "Capital Ratios", "Tier 1 capital / average total consolidated assets", "Percent", "RCFD", "C223", "Basel III", "Mandatory"],
    ["BHCK4340", "BHC Net Income", "FR Y-9C", "HC-Line 14", "BHC Income", "Consolidated net income for bank holding company", "Thousands USD", "BHCK", "4340", "FR Y-9C", "BHC Only"],
    ["BHCK2170", "BHC Total Assets", "FR Y-9C", "HC-Line 12", "BHC Balance Sheet", "Consolidated total assets for bank holding company", "Thousands USD", "BHCK", "2170", "FR Y-9C", "BHC Only"],
    ["BHCK3210", "BHC Total Equity", "FR Y-9C", "HC-Line 28", "BHC Balance Sheet", "Total equity capital of bank holding company", "Thousands USD", "BHCK", "3210", "FR Y-9C", "BHC Only"],
    ["BHCKA223", "BHC CET1 Capital", "FR Y-9C", "HC-R Line 22", "BHC Capital", "Common Equity Tier 1 capital for BHC", "Thousands USD", "BHCK", "A223", "Basel III", "BHC Only"],
  ];

  const headers = [
    "MDRM_Code", "Field_Name", "Schedule", "Line_Reference", "Category",
    "Description", "Unit", "Series_Prefix", "Item_Code",
    "Regulatory_Framework", "Filing_Requirement"
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, makeSheet(headers, mdrmEntries), "MDRM_Taxonomy");
  XLSX.writeFile(wb, path.join(outDir, "MDRM_Taxonomy.xlsx"));
  console.log(`MDRM_Taxonomy: ${mdrmEntries.length} rows, ${headers.length} columns`);
}

// Generate all files
generateGL();
generateTrading();
generateLoans();
generateTreasury();
generateRisk();
generateMDRM();
console.log("\nAll files generated in public/downloads/");
