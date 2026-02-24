export interface ReportingInstruction {
  id: string;
  section: string;
  description: string;
  schedule: string;
  frequency: string;
  status: "analyzed" | "pending" | "flagged";
  requirements: string[];
}

export interface DataColumn {
  name: string;
  type: string;
  source: string;
  nullable: boolean;
  description: string;
}

export interface DataDictionary {
  tableName: string;
  columns: DataColumn[];
  recordCount: number;
  lastUpdated: string;
}

export interface AnomalyRecord {
  period: string;
  metric: string;
  value: number;
  expected: number;
  deviation: number;
  severity: "high" | "medium" | "low";
  description: string;
}

export interface ReportLineItem {
  id: string;
  lineItem: string;
  schedule: string;
  currentPeriod: number;
  priorPeriod: number;
  change: number;
  changePercent: number;
  crossCheck: "passed" | "failed" | "warning";
  derivation: string;
}

export interface PeriodComparison {
  metric: string;
  q1_2024: number;
  q2_2024: number;
  q3_2024: number;
  q4_2024: number;
  commentary: string;
  trend: "up" | "down" | "stable";
}

export interface TrendDataPoint {
  period: string;
  totalAssets: number;
  totalLoans: number;
  totalDeposits: number;
  netIncome: number;
  tier1Capital: number;
}

export interface PeerBank {
  name: string;
  ticker: string;
  totalAssets: number;
  totalLoans: number;
  totalDeposits: number;
  netIncome: number;
  roe: number;
  roa: number;
  nim: number;
  tier1Ratio: number;
  cet1Ratio: number;
  leverageRatio: number;
  efficiencyRatio: number;
  npaRatio: number;
  loanToDeposit: number;
  chargeOffRate: number;
}

export interface PeerTrendData {
  period: string;
  [bankName: string]: number | string;
}

export const reportingInstructions: ReportingInstruction[] = [
  {
    id: "FFIEC-031",
    section: "Schedule RC - Balance Sheet",
    description: "Consolidated Report of Condition: Total assets, liabilities, and equity capital of the reporting institution",
    schedule: "RC",
    frequency: "Quarterly",
    status: "analyzed",
    requirements: [
      "Total assets must equal total liabilities plus equity capital",
      "All amounts reported in thousands of dollars",
      "Consolidate all domestic and foreign offices",
      "Report on a fully consolidated basis"
    ]
  },
  {
    id: "FFIEC-031",
    section: "Schedule RC-C - Loans and Leases",
    description: "Loans and lease financing receivables broken down by category including real estate, commercial, consumer, and agricultural loans",
    schedule: "RC-C",
    frequency: "Quarterly",
    status: "analyzed",
    requirements: [
      "Report gross loans before deducting unearned income and allowance",
      "Classify by loan type per FFIEC instructions",
      "Include commitments and letters of credit",
      "Reconcile to RC Schedule line items"
    ]
  },
  {
    id: "FFIEC-031",
    section: "Schedule RC-R - Regulatory Capital",
    description: "Risk-based capital ratios including CET1, Tier 1, and Total Capital ratios with risk-weighted assets calculation",
    schedule: "RC-R",
    frequency: "Quarterly",
    status: "flagged",
    requirements: [
      "Calculate CET1 capital per Basel III standards",
      "Apply correct risk weights to all asset categories",
      "Include off-balance-sheet exposures in RWA calculation",
      "Report supplementary leverage ratio for advanced approaches"
    ]
  },
  {
    id: "FR Y-9C",
    section: "Schedule HI - Income Statement",
    description: "Consolidated income statement reporting interest income, non-interest income, provisions, and net income",
    schedule: "HI",
    frequency: "Quarterly",
    status: "analyzed",
    requirements: [
      "Report interest income on a taxable-equivalent basis where applicable",
      "Separate trading revenue from banking book income",
      "Include provision for credit losses per CECL methodology",
      "Report extraordinary items separately"
    ]
  },
  {
    id: "FR Y-14Q",
    section: "Schedule A - Summary",
    description: "Capital Assessments and Stress Testing: Summary schedule covering BHC-level data on capital composition and RWA",
    schedule: "A",
    frequency: "Quarterly",
    status: "pending",
    requirements: [
      "Report pre-provision net revenue components",
      "Include projected losses by loan category under stress scenarios",
      "Provide operational risk capital calculations",
      "Report market risk RWA for trading positions"
    ]
  },
  {
    id: "FR 2052a",
    section: "Liquidity Coverage Ratio",
    description: "Complex institution liquidity monitoring: inflows, outflows, and HQLA for LCR calculation",
    schedule: "LCR",
    frequency: "Daily",
    status: "analyzed",
    requirements: [
      "Classify HQLA into Level 1, Level 2A, and Level 2B categories",
      "Apply haircuts to Level 2 assets per regulatory guidance",
      "Calculate stressed outflows using prescribed run-off rates",
      "Maintain LCR above 100% minimum requirement"
    ]
  }
];

export const dataDictionaries: DataDictionary[] = [
  {
    tableName: "GL_BALANCES",
    columns: [
      { name: "ENTITY_ID", type: "VARCHAR(20)", source: "Core Banking", nullable: false, description: "Legal entity identifier" },
      { name: "GL_ACCOUNT", type: "VARCHAR(15)", source: "Core Banking", nullable: false, description: "General ledger account number" },
      { name: "ACCOUNT_DESC", type: "VARCHAR(100)", source: "Core Banking", nullable: true, description: "Account description" },
      { name: "CURRENCY_CODE", type: "CHAR(3)", source: "Core Banking", nullable: false, description: "ISO 4217 currency code" },
      { name: "BALANCE_USD", type: "DECIMAL(18,2)", source: "Derived", nullable: false, description: "Balance in USD equivalent" },
      { name: "BALANCE_LOCAL", type: "DECIMAL(18,2)", source: "Core Banking", nullable: false, description: "Balance in local currency" },
      { name: "REPORTING_DATE", type: "DATE", source: "System", nullable: false, description: "As-of reporting date" },
      { name: "COST_CENTER", type: "VARCHAR(10)", source: "HR System", nullable: true, description: "Cost center code" },
    ],
    recordCount: 2847563,
    lastUpdated: "2024-12-31"
  },
  {
    tableName: "LOAN_PORTFOLIO",
    columns: [
      { name: "LOAN_ID", type: "VARCHAR(20)", source: "Loan System", nullable: false, description: "Unique loan identifier" },
      { name: "BORROWER_ID", type: "VARCHAR(20)", source: "CRM", nullable: false, description: "Borrower entity ID" },
      { name: "LOAN_TYPE", type: "VARCHAR(5)", source: "Loan System", nullable: false, description: "FFIEC loan classification code" },
      { name: "OUTSTANDING_BAL", type: "DECIMAL(18,2)", source: "Loan System", nullable: false, description: "Current outstanding balance" },
      { name: "ORIGINAL_BAL", type: "DECIMAL(18,2)", source: "Loan System", nullable: false, description: "Original loan amount" },
      { name: "RISK_RATING", type: "INTEGER", source: "Credit Risk", nullable: false, description: "Internal risk rating (1-10)" },
      { name: "COLLATERAL_VALUE", type: "DECIMAL(18,2)", source: "Appraisal", nullable: true, description: "Current collateral valuation" },
      { name: "MATURITY_DATE", type: "DATE", source: "Loan System", nullable: false, description: "Loan maturity date" },
    ],
    recordCount: 156892,
    lastUpdated: "2024-12-31"
  },
  {
    tableName: "SECURITIES_POSITION",
    columns: [
      { name: "CUSIP", type: "CHAR(9)", source: "Trading System", nullable: false, description: "CUSIP identifier" },
      { name: "SECURITY_TYPE", type: "VARCHAR(10)", source: "Trading System", nullable: false, description: "Security classification" },
      { name: "PAR_VALUE", type: "DECIMAL(18,2)", source: "Trading System", nullable: false, description: "Par/face value" },
      { name: "FAIR_VALUE", type: "DECIMAL(18,2)", source: "Pricing Service", nullable: false, description: "Current fair market value" },
      { name: "BOOK_VALUE", type: "DECIMAL(18,2)", source: "Accounting", nullable: false, description: "Amortized cost / book value" },
      { name: "PORTFOLIO_TYPE", type: "VARCHAR(5)", source: "Accounting", nullable: false, description: "HTM, AFS, or Trading" },
    ],
    recordCount: 8934,
    lastUpdated: "2024-12-31"
  }
];

export const anomalyRecords: AnomalyRecord[] = [
  { period: "Q4 2024", metric: "C&I Loans Growth", value: 12.3, expected: 4.5, deviation: 7.8, severity: "high", description: "Unusual spike in C&I loan originations; verify large corporate drawdowns" },
  { period: "Q4 2024", metric: "AOCI Change", value: -2.1, expected: -0.3, deviation: -1.8, severity: "high", description: "Significant unrealized losses on AFS securities portfolio; rate sensitivity impact" },
  { period: "Q4 2024", metric: "Provision Rate", value: 0.45, expected: 0.28, deviation: 0.17, severity: "medium", description: "Provision for credit losses above historical trend; review CECL model inputs" },
  { period: "Q3 2024", metric: "Non-Interest Income", value: 892, expected: 1050, deviation: -158, severity: "medium", description: "Trading revenue shortfall vs. prior quarters; market volatility impact" },
  { period: "Q4 2024", metric: "Efficiency Ratio", value: 62.4, expected: 58.1, deviation: 4.3, severity: "low", description: "Slight increase in operating costs; technology investment cycle" },
  { period: "Q4 2024", metric: "LCR Ratio", value: 118, expected: 125, deviation: -7, severity: "low", description: "Decrease in HQLA buffer; monitor wholesale funding outflows" },
];

export const reportLineItems: ReportLineItem[] = [
  { id: "RC-1", lineItem: "Cash and Balances Due", schedule: "RC", currentPeriod: 45230000, priorPeriod: 42180000, change: 3050000, changePercent: 7.23, crossCheck: "passed", derivation: "Sum of GL accounts 1000-1099 across all entities" },
  { id: "RC-2", lineItem: "Securities - HTM", schedule: "RC", currentPeriod: 28450000, priorPeriod: 31200000, change: -2750000, changePercent: -8.81, crossCheck: "passed", derivation: "SECURITIES_POSITION where PORTFOLIO_TYPE = 'HTM' at amortized cost" },
  { id: "RC-3", lineItem: "Securities - AFS", schedule: "RC", currentPeriod: 18920000, priorPeriod: 21340000, change: -2420000, changePercent: -11.34, crossCheck: "warning", derivation: "SECURITIES_POSITION where PORTFOLIO_TYPE = 'AFS' at fair value; AOCI impact flagged" },
  { id: "RC-4", lineItem: "Loans and Leases, Net", schedule: "RC-C", currentPeriod: 112500000, priorPeriod: 105800000, change: 6700000, changePercent: 6.33, crossCheck: "passed", derivation: "LOAN_PORTFOLIO aggregate less ALLL reserve of $3,240,000" },
  { id: "RC-5", lineItem: "Total Assets", schedule: "RC", currentPeriod: 225100000, priorPeriod: 218520000, change: 6580000, changePercent: 3.01, crossCheck: "passed", derivation: "Sum of all asset line items RC-1 through RC-12" },
  { id: "RC-6", lineItem: "Total Deposits", schedule: "RC-E", currentPeriod: 178400000, priorPeriod: 175200000, change: 3200000, changePercent: 1.83, crossCheck: "passed", derivation: "DEPOSITS table aggregated by product type, reconciled to GL" },
  { id: "RC-7", lineItem: "Total Liabilities", schedule: "RC", currentPeriod: 205300000, priorPeriod: 200100000, change: 5200000, changePercent: 2.60, crossCheck: "passed", derivation: "Sum of all liability line items including borrowed funds and subordinated debt" },
  { id: "RC-8", lineItem: "Total Equity Capital", schedule: "RC", currentPeriod: 19800000, priorPeriod: 18420000, change: 1380000, changePercent: 7.49, crossCheck: "passed", derivation: "Common stock + surplus + retained earnings + AOCI" },
  { id: "RC-R1", lineItem: "CET1 Capital Ratio", schedule: "RC-R", currentPeriod: 12.8, priorPeriod: 12.1, change: 0.7, changePercent: 5.79, crossCheck: "passed", derivation: "CET1 capital / Total RWA; minimum requirement 4.5%" },
  { id: "RC-R2", lineItem: "Total Capital Ratio", schedule: "RC-R", currentPeriod: 15.2, priorPeriod: 14.8, change: 0.4, changePercent: 2.70, crossCheck: "passed", derivation: "Total capital (Tier 1 + Tier 2) / Total RWA; minimum requirement 8.0%" },
];

export const periodComparisons: PeriodComparison[] = [
  { metric: "Net Interest Income ($M)", q1_2024: 2840, q2_2024: 2920, q3_2024: 2780, q4_2024: 2950, commentary: "NII improved in Q4 driven by loan growth and favorable mix shift toward higher-yielding assets. NIM expansion of 5bps QoQ.", trend: "up" },
  { metric: "Non-Interest Income ($M)", q1_2024: 1120, q2_2024: 1085, q3_2024: 892, q4_2024: 1040, commentary: "Recovery in Q4 after weak Q3 trading revenues. Fee income from advisory and wealth management remained stable.", trend: "stable" },
  { metric: "Provision for Credit Losses ($M)", q1_2024: 320, q2_2024: 285, q3_2024: 310, q4_2024: 425, commentary: "Elevated provisions in Q4 reflecting increased reserves for commercial real estate portfolio. CECL model recalibrated for macro outlook.", trend: "up" },
  { metric: "Net Income ($M)", q1_2024: 1580, q2_2024: 1620, q3_2024: 1410, q4_2024: 1520, commentary: "Q4 net income reflects higher revenue partially offset by increased provisioning. Full year net income of $6.13B, up 3.2% YoY.", trend: "stable" },
  { metric: "CET1 Capital Ratio (%)", q1_2024: 12.1, q2_2024: 12.3, q3_2024: 12.5, q4_2024: 12.8, commentary: "Continued capital accretion through retained earnings. Well above minimum requirement of 4.5% and buffer of 2.5%.", trend: "up" },
  { metric: "Efficiency Ratio (%)", q1_2024: 57.2, q2_2024: 58.5, q3_2024: 60.1, q4_2024: 62.4, commentary: "Slight deterioration from technology transformation investments. Expected to normalize as digital initiatives reduce operating costs in 2025.", trend: "down" },
  { metric: "NPL Ratio (%)", q1_2024: 0.82, q2_2024: 0.78, q3_2024: 0.85, q4_2024: 0.91, commentary: "Marginal increase in NPLs concentrated in office CRE segment. Proactive risk management with enhanced monitoring protocols.", trend: "up" },
  { metric: "Loan-to-Deposit Ratio (%)", q1_2024: 59.2, q2_2024: 60.1, q3_2024: 61.8, q4_2024: 63.1, commentary: "Gradual increase reflecting strong loan demand. Deposit base remains stable with competitive rate adjustments.", trend: "up" },
];

export const trendData: TrendDataPoint[] = [
  { period: "Q1 2022", totalAssets: 195000, totalLoans: 88000, totalDeposits: 160000, netIncome: 1320, tier1Capital: 10.8 },
  { period: "Q2 2022", totalAssets: 198000, totalLoans: 90500, totalDeposits: 162000, netIncome: 1380, tier1Capital: 10.9 },
  { period: "Q3 2022", totalAssets: 201000, totalLoans: 92000, totalDeposits: 163500, netIncome: 1450, tier1Capital: 11.1 },
  { period: "Q4 2022", totalAssets: 204000, totalLoans: 94500, totalDeposits: 165000, netIncome: 1290, tier1Capital: 11.3 },
  { period: "Q1 2023", totalAssets: 206000, totalLoans: 96000, totalDeposits: 166500, netIncome: 1350, tier1Capital: 11.4 },
  { period: "Q2 2023", totalAssets: 208500, totalLoans: 97500, totalDeposits: 168000, netIncome: 1420, tier1Capital: 11.5 },
  { period: "Q3 2023", totalAssets: 211000, totalLoans: 99000, totalDeposits: 169500, netIncome: 1480, tier1Capital: 11.7 },
  { period: "Q4 2023", totalAssets: 214000, totalLoans: 101500, totalDeposits: 171000, netIncome: 1380, tier1Capital: 11.9 },
  { period: "Q1 2024", totalAssets: 216500, totalLoans: 103000, totalDeposits: 173000, netIncome: 1580, tier1Capital: 12.1 },
  { period: "Q2 2024", totalAssets: 218000, totalLoans: 104500, totalDeposits: 174500, netIncome: 1620, tier1Capital: 12.3 },
  { period: "Q3 2024", totalAssets: 220500, totalLoans: 106800, totalDeposits: 175800, netIncome: 1410, tier1Capital: 12.5 },
  { period: "Q4 2024", totalAssets: 225100, totalLoans: 112500, totalDeposits: 178400, netIncome: 1520, tier1Capital: 12.8 },
];

export const peerBanks: PeerBank[] = [
  { name: "Mizuho Americas", ticker: "MFG", totalAssets: 225100, totalLoans: 112500, totalDeposits: 178400, netIncome: 1520, roe: 7.68, roa: 0.68, nim: 2.42, tier1Ratio: 12.8, cet1Ratio: 12.8, leverageRatio: 8.2, efficiencyRatio: 62.4, npaRatio: 0.91, loanToDeposit: 63.1, chargeOffRate: 0.35 },
  { name: "MUFG Americas", ticker: "MUFG", totalAssets: 312400, totalLoans: 148200, totalDeposits: 245800, netIncome: 2180, roe: 8.12, roa: 0.70, nim: 2.58, tier1Ratio: 13.2, cet1Ratio: 12.9, leverageRatio: 8.5, efficiencyRatio: 59.8, npaRatio: 0.78, loanToDeposit: 60.3, chargeOffRate: 0.31 },
  { name: "SMBC Americas", ticker: "SMFG", totalAssets: 198500, totalLoans: 95800, totalDeposits: 158200, netIncome: 1280, roe: 7.45, roa: 0.65, nim: 2.35, tier1Ratio: 13.5, cet1Ratio: 13.1, leverageRatio: 8.8, efficiencyRatio: 61.2, npaRatio: 0.72, loanToDeposit: 60.6, chargeOffRate: 0.28 },
  { name: "PNC Financial", ticker: "PNC", totalAssets: 557300, totalLoans: 321400, totalDeposits: 423500, netIncome: 5840, roe: 12.85, roa: 1.05, nim: 2.78, tier1Ratio: 10.4, cet1Ratio: 10.1, leverageRatio: 7.8, efficiencyRatio: 56.2, npaRatio: 0.65, loanToDeposit: 75.9, chargeOffRate: 0.42 },
  { name: "U.S. Bancorp", ticker: "USB", totalAssets: 668200, totalLoans: 374800, totalDeposits: 512600, netIncome: 6420, roe: 13.52, roa: 0.96, nim: 2.85, tier1Ratio: 10.2, cet1Ratio: 9.8, leverageRatio: 7.5, efficiencyRatio: 58.4, npaRatio: 0.58, loanToDeposit: 73.1, chargeOffRate: 0.48 },
  { name: "Citizens Financial", ticker: "CFG", totalAssets: 221800, totalLoans: 145200, totalDeposits: 178900, netIncome: 1680, roe: 9.24, roa: 0.76, nim: 3.12, tier1Ratio: 11.1, cet1Ratio: 10.6, leverageRatio: 7.9, efficiencyRatio: 60.5, npaRatio: 0.82, loanToDeposit: 81.2, chargeOffRate: 0.52 },
  { name: "KeyCorp", ticker: "KEY", totalAssets: 187200, totalLoans: 112800, totalDeposits: 148500, netIncome: 1120, roe: 8.45, roa: 0.60, nim: 2.48, tier1Ratio: 11.8, cet1Ratio: 10.5, leverageRatio: 8.1, efficiencyRatio: 64.8, npaRatio: 0.88, loanToDeposit: 75.9, chargeOffRate: 0.45 },
  { name: "M&T Bank", ticker: "MTB", totalAssets: 208400, totalLoans: 132600, totalDeposits: 165200, netIncome: 2050, roe: 11.28, roa: 0.98, nim: 3.45, tier1Ratio: 11.5, cet1Ratio: 11.2, leverageRatio: 8.4, efficiencyRatio: 55.8, npaRatio: 0.95, loanToDeposit: 80.3, chargeOffRate: 0.38 },
];

export const peerTrendROE: PeerTrendData[] = [
  { period: "Q1 2023", "Mizuho Americas": 6.8, "MUFG Americas": 7.5, "SMBC Americas": 6.9, "PNC Financial": 11.2, "U.S. Bancorp": 12.1 },
  { period: "Q2 2023", "Mizuho Americas": 7.1, "MUFG Americas": 7.8, "SMBC Americas": 7.2, "PNC Financial": 11.8, "U.S. Bancorp": 12.5 },
  { period: "Q3 2023", "Mizuho Americas": 7.3, "MUFG Americas": 7.6, "SMBC Americas": 7.0, "PNC Financial": 12.1, "U.S. Bancorp": 12.8 },
  { period: "Q4 2023", "Mizuho Americas": 7.0, "MUFG Americas": 7.4, "SMBC Americas": 6.8, "PNC Financial": 11.5, "U.S. Bancorp": 13.0 },
  { period: "Q1 2024", "Mizuho Americas": 7.2, "MUFG Americas": 7.9, "SMBC Americas": 7.1, "PNC Financial": 12.4, "U.S. Bancorp": 13.2 },
  { period: "Q2 2024", "Mizuho Americas": 7.5, "MUFG Americas": 8.0, "SMBC Americas": 7.3, "PNC Financial": 12.6, "U.S. Bancorp": 13.4 },
  { period: "Q3 2024", "Mizuho Americas": 7.1, "MUFG Americas": 7.7, "SMBC Americas": 7.0, "PNC Financial": 12.2, "U.S. Bancorp": 13.1 },
  { period: "Q4 2024", "Mizuho Americas": 7.68, "MUFG Americas": 8.12, "SMBC Americas": 7.45, "PNC Financial": 12.85, "U.S. Bancorp": 13.52 },
];

export const peerTrendNIM: PeerTrendData[] = [
  { period: "Q1 2023", "Mizuho Americas": 2.15, "MUFG Americas": 2.32, "SMBC Americas": 2.10, "PNC Financial": 2.55, "U.S. Bancorp": 2.62 },
  { period: "Q2 2023", "Mizuho Americas": 2.20, "MUFG Americas": 2.38, "SMBC Americas": 2.15, "PNC Financial": 2.60, "U.S. Bancorp": 2.68 },
  { period: "Q3 2023", "Mizuho Americas": 2.28, "MUFG Americas": 2.42, "SMBC Americas": 2.20, "PNC Financial": 2.65, "U.S. Bancorp": 2.72 },
  { period: "Q4 2023", "Mizuho Americas": 2.32, "MUFG Americas": 2.48, "SMBC Americas": 2.25, "PNC Financial": 2.70, "U.S. Bancorp": 2.78 },
  { period: "Q1 2024", "Mizuho Americas": 2.35, "MUFG Americas": 2.50, "SMBC Americas": 2.28, "PNC Financial": 2.72, "U.S. Bancorp": 2.80 },
  { period: "Q2 2024", "Mizuho Americas": 2.38, "MUFG Americas": 2.52, "SMBC Americas": 2.30, "PNC Financial": 2.75, "U.S. Bancorp": 2.82 },
  { period: "Q3 2024", "Mizuho Americas": 2.40, "MUFG Americas": 2.55, "SMBC Americas": 2.32, "PNC Financial": 2.76, "U.S. Bancorp": 2.84 },
  { period: "Q4 2024", "Mizuho Americas": 2.42, "MUFG Americas": 2.58, "SMBC Americas": 2.35, "PNC Financial": 2.78, "U.S. Bancorp": 2.85 },
];

export const peerTrendCET1: PeerTrendData[] = [
  { period: "Q1 2023", "Mizuho Americas": 11.4, "MUFG Americas": 12.5, "SMBC Americas": 12.8, "PNC Financial": 9.8, "U.S. Bancorp": 9.2 },
  { period: "Q2 2023", "Mizuho Americas": 11.5, "MUFG Americas": 12.6, "SMBC Americas": 12.9, "PNC Financial": 9.9, "U.S. Bancorp": 9.3 },
  { period: "Q3 2023", "Mizuho Americas": 11.7, "MUFG Americas": 12.7, "SMBC Americas": 13.0, "PNC Financial": 9.9, "U.S. Bancorp": 9.4 },
  { period: "Q4 2023", "Mizuho Americas": 11.9, "MUFG Americas": 12.8, "SMBC Americas": 13.0, "PNC Financial": 10.0, "U.S. Bancorp": 9.5 },
  { period: "Q1 2024", "Mizuho Americas": 12.1, "MUFG Americas": 12.8, "SMBC Americas": 13.0, "PNC Financial": 10.0, "U.S. Bancorp": 9.6 },
  { period: "Q2 2024", "Mizuho Americas": 12.3, "MUFG Americas": 12.9, "SMBC Americas": 13.0, "PNC Financial": 10.0, "U.S. Bancorp": 9.7 },
  { period: "Q3 2024", "Mizuho Americas": 12.5, "MUFG Americas": 12.9, "SMBC Americas": 13.1, "PNC Financial": 10.1, "U.S. Bancorp": 9.7 },
  { period: "Q4 2024", "Mizuho Americas": 12.8, "MUFG Americas": 12.9, "SMBC Americas": 13.1, "PNC Financial": 10.1, "U.S. Bancorp": 9.8 },
];

export const chatMessages = [
  { role: "user" as const, content: "What are the key requirements for Schedule RC-R regulatory capital reporting?" },
  { role: "assistant" as const, content: "Schedule RC-R requires reporting of risk-based capital ratios including:\n\n1. **CET1 Capital Ratio** - Common Equity Tier 1 capital divided by total risk-weighted assets. Minimum requirement is 4.5% plus a capital conservation buffer of 2.5%.\n\n2. **Tier 1 Capital Ratio** - Tier 1 capital (CET1 + AT1) divided by total RWA. Minimum 6.0%.\n\n3. **Total Capital Ratio** - Total capital (Tier 1 + Tier 2) divided by total RWA. Minimum 8.0%.\n\n4. **Risk-Weighted Assets** must be calculated using standardized or advanced approaches, applying prescribed risk weights to each asset category.\n\nFor your current filing, CET1 stands at 12.8% (well above the 7.0% minimum with buffer), with total RWA of $154.7B." },
  { role: "user" as const, content: "Show me the reconciliation between GL balances and the reported loan figures on RC-C." },
  { role: "assistant" as const, content: "Here's the reconciliation of GL balances to Schedule RC-C reported loans:\n\n| Component | Amount ($M) |\n|-----------|------------|\n| Gross Loans per GL | $115,740 |\n| Less: Unearned Income | ($1,240) |\n| Less: ALLL Reserve | ($3,240) |\n| Plus: Fair Value Adjustments | $1,240 |\n| **Net Loans per RC-C** | **$112,500** |\n\nThe $112.5B ties to Schedule RC line 4.a. The ALLL reserve of $3.24B represents 2.88% coverage ratio, consistent with CECL methodology applied to the portfolio.\n\n**Cross-check:** Total loans on RC-C Part I ($112.5B) reconciles to the sum of individual loan categories on RC-C Part II within a $0 variance." },
];

export function formatCurrency(value: number, decimals: number = 0): string {
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000).toFixed(decimals)}B`;
  }
  if (Math.abs(value) >= 1000) {
    return `$${value.toLocaleString()}M`;
  }
  return `$${value.toFixed(decimals)}M`;
}

export function formatPercent(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString();
}
