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
    id: "FFIEC-031",
    section: "Schedule RC-E - Deposit Liabilities",
    description: "Breakdown of deposit liabilities by type, maturity, and insurance status including transaction and non-transaction accounts",
    schedule: "RC-E",
    frequency: "Quarterly",
    status: "analyzed",
    requirements: [
      "Classify deposits as transaction or non-transaction accounts",
      "Report time deposits by remaining maturity buckets",
      "Separate insured vs uninsured deposits per FDIC coverage rules",
      "Reconcile total deposits to Schedule RC line 13"
    ]
  },
  {
    id: "FFIEC-031",
    section: "Schedule RC-N - Past Due and Nonaccrual",
    description: "Delinquency and nonaccrual status of loans and leases by category, including 30-89 days past due and 90+ days past due",
    schedule: "RC-N",
    frequency: "Quarterly",
    status: "flagged",
    requirements: [
      "Report loans past due 30-89 days separately from 90+ days",
      "Identify nonaccrual loans by loan category per ASC 326 guidance",
      "Include restructured loans in appropriate aging buckets",
      "Cross-reference delinquency totals to Schedule RC-C loan categories"
    ]
  },
  {
    id: "FFIEC-031",
    section: "Schedule RC-L - Derivatives and Off-Balance Sheet",
    description: "Notional amounts and fair values of derivative contracts and off-balance sheet exposures including commitments and guarantees",
    schedule: "RC-L",
    frequency: "Quarterly",
    status: "flagged",
    requirements: [
      "Report notional amounts by derivative type (interest rate, FX, credit, equity)",
      "Separate trading vs hedging derivative positions",
      "Report gross positive and negative fair values before netting",
      "Include unused commitments and standby letters of credit"
    ]
  },
  {
    id: "FFIEC-031",
    section: "Schedule RI - Income Statement",
    description: "Income and expense detail for the reporting period including interest income, interest expense, provisions, and non-interest components",
    schedule: "RI",
    frequency: "Quarterly",
    status: "flagged",
    requirements: [
      "Report interest income and expense on an accrual basis",
      "Separate provision for credit losses per CECL from other provisions",
      "Report realized gains and losses on securities separately",
      "Reconcile net income to Schedule RC equity changes"
    ]
  },
  {
    id: "FR Y-9C",
    section: "Schedule HI - Consolidated Income Statement",
    description: "Consolidated income statement reporting interest income, non-interest income, provisions, and net income for the BHC",
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
];

export const dataDictionaries: DataDictionary[] = [
  {
    tableName: "FFIEC_031_CALL_REPORT",
    columns: [
      { name: "CERT", type: "INTEGER", source: "FDIC BankFind Suite", nullable: false, description: "FDIC Certificate Number — unique institution identifier" },
      { name: "REPDTE", type: "DATE", source: "FDIC BankFind Suite", nullable: false, description: "Report date (quarter-end, e.g. 20241231)" },
      { name: "ASSET", type: "DECIMAL(18,0)", source: "Schedule RC", nullable: false, description: "Total assets (thousands USD)" },
      { name: "DEP", type: "DECIMAL(18,0)", source: "Schedule RC-E", nullable: false, description: "Total deposits (thousands USD)" },
      { name: "LNLSNET", type: "DECIMAL(18,0)", source: "Schedule RC-C", nullable: false, description: "Total loans and leases, net of unearned income (thousands USD)" },
      { name: "NETINC", type: "DECIMAL(18,0)", source: "Schedule RI", nullable: false, description: "Net income (thousands USD)" },
      { name: "INTINC", type: "DECIMAL(18,0)", source: "Schedule RI", nullable: false, description: "Total interest income (thousands USD)" },
      { name: "EINTEXP", type: "DECIMAL(18,0)", source: "Schedule RI", nullable: false, description: "Total interest expense (thousands USD)" },
      { name: "ROE", type: "DECIMAL(6,2)", source: "FDIC Derived", nullable: true, description: "Return on equity (%)" },
      { name: "ROA", type: "DECIMAL(6,2)", source: "FDIC Derived", nullable: true, description: "Return on assets (%)" },
      { name: "IDT1RWA", type: "DECIMAL(6,2)", source: "Schedule RC-R", nullable: true, description: "Tier 1 risk-based capital ratio (%)" },
      { name: "P3ASSET", type: "DECIMAL(18,0)", source: "Schedule RC-N", nullable: true, description: "Past-due 90+ days and nonaccrual assets (thousands USD)" },
      { name: "EEFFR", type: "DECIMAL(6,2)", source: "FDIC Derived", nullable: true, description: "Efficiency ratio (%)" },
    ],
    recordCount: 48,
    lastUpdated: "2025-01-15"
  },
  {
    tableName: "FFIEC_UBPR_RATIOS",
    columns: [
      { name: "RSSD_ID", type: "VARCHAR(10)", source: "FFIEC CDR", nullable: false, description: "Federal Reserve RSSD identifier" },
      { name: "REPORTING_PERIOD", type: "DATE", source: "FFIEC CDR", nullable: false, description: "UBPR reporting period" },
      { name: "NET_INTEREST_MARGIN", type: "DECIMAL(6,2)", source: "UBPR Page 1", nullable: true, description: "Net interest margin (%)" },
      { name: "RETURN_ON_ASSETS", type: "DECIMAL(6,2)", source: "UBPR Page 1", nullable: true, description: "Return on average assets (%)" },
      { name: "RETURN_ON_EQUITY", type: "DECIMAL(6,2)", source: "UBPR Page 1", nullable: true, description: "Return on average equity (%)" },
      { name: "EFFICIENCY_RATIO", type: "DECIMAL(6,2)", source: "UBPR Page 7", nullable: true, description: "Operating efficiency ratio (%)" },
      { name: "TIER1_LEVERAGE", type: "DECIMAL(6,2)", source: "UBPR Page 11", nullable: true, description: "Tier 1 leverage ratio (%)" },
      { name: "RISK_BASED_CAPITAL", type: "DECIMAL(6,2)", source: "UBPR Page 11", nullable: true, description: "Total risk-based capital ratio (%)" },
      { name: "NET_CHARGEOFFS", type: "DECIMAL(6,2)", source: "UBPR Page 4", nullable: true, description: "Net charge-offs to average loans (%)" },
      { name: "NPA_TO_ASSETS", type: "DECIMAL(6,2)", source: "UBPR Page 4", nullable: true, description: "Nonperforming assets to total assets (%)" },
      { name: "LOAN_TO_DEPOSIT", type: "DECIMAL(6,2)", source: "UBPR Page 6", nullable: true, description: "Loan-to-deposit ratio (%)" },
    ],
    recordCount: 56,
    lastUpdated: "2025-01-15"
  },
  {
    tableName: "FR_Y9C_BHC_DATA",
    columns: [
      { name: "RSSD_ID", type: "VARCHAR(10)", source: "Federal Reserve NIC", nullable: false, description: "Federal Reserve RSSD identifier" },
      { name: "REPORTING_PERIOD", type: "DATE", source: "Federal Reserve", nullable: false, description: "FR Y-9C reporting quarter" },
      { name: "BHCK2170", type: "DECIMAL(18,0)", source: "Schedule HC", nullable: false, description: "Total consolidated assets (thousands USD)" },
      { name: "BHDM5367", type: "DECIMAL(18,0)", source: "Schedule HC-E", nullable: true, description: "Total deposits (thousands USD)" },
      { name: "BHCK4340", type: "DECIMAL(18,0)", source: "Schedule HI", nullable: true, description: "Net income (thousands USD)" },
      { name: "BHCK4074", type: "DECIMAL(18,0)", source: "Schedule HI", nullable: true, description: "Total interest income (thousands USD)" },
      { name: "BHCK3210", type: "DECIMAL(18,0)", source: "Schedule HC", nullable: true, description: "Total equity capital (thousands USD)" },
      { name: "BHCKA223", type: "DECIMAL(18,0)", source: "Schedule HC-R", nullable: true, description: "Common equity tier 1 capital (thousands USD)" },
      { name: "BHCKA224", type: "DECIMAL(6,2)", source: "Schedule HC-R", nullable: true, description: "CET1 risk-based capital ratio (%)" },
      { name: "BHCK7206", type: "DECIMAL(6,2)", source: "Schedule HC-R", nullable: true, description: "Tier 1 capital ratio (%)" },
      { name: "BHCK7205", type: "DECIMAL(6,2)", source: "Schedule HC-R", nullable: true, description: "Total risk-based capital ratio (%)" },
    ],
    recordCount: 8,
    lastUpdated: "2025-01-15"
  }
];

export const anomalyRecords: AnomalyRecord[] = [
  { period: "Q4 2024", metric: "C&I Loans Growth", value: 12.3, expected: 4.5, deviation: 7.8, severity: "high", description: "FDIC LNLSNET shows unusual spike in C&I loan originations vs prior 8 quarters; verify large corporate drawdowns against Call Report RC-C" },
  { period: "Q4 2024", metric: "AOCI Change", value: -2.1, expected: -0.3, deviation: -1.8, severity: "high", description: "FR Y-9C BHCK3210 equity movement inconsistent with FDIC EQ; AFS mark-to-market AOCI impact flagged per UBPR Page 6" },
  { period: "Q4 2024", metric: "Provision Rate", value: 0.45, expected: 0.28, deviation: 0.17, severity: "medium", description: "FDIC ELNATR (provision for credit losses) above 8-quarter historical mean; CECL model inputs need review vs UBPR peer benchmarks" },
  { period: "Q3 2024", metric: "Non-Interest Income", value: 892, expected: 1050, deviation: -158, severity: "medium", description: "Call Report Schedule RI non-interest income below trend; cross-referenced with FR Y-9C BHCK4079 trading revenue shortfall" },
  { period: "Q4 2024", metric: "Efficiency Ratio", value: 62.4, expected: 58.1, deviation: 4.3, severity: "low", description: "FDIC EEFFR (efficiency ratio) above peer median from UBPR Page 7; technology investment cycle per management commentary" },
  { period: "Q4 2024", metric: "LCR Ratio", value: 118, expected: 125, deviation: -7, severity: "low", description: "LCR below internal buffer target; HQLA reduction visible in FDIC SCAFS + SCHTM quarter-over-quarter decline" },
];

export const reportLineItems: ReportLineItem[] = [
  { id: "RC-1", lineItem: "Cash and Balances Due", schedule: "RC", currentPeriod: 45230000, priorPeriod: 42180000, change: 3050000, changePercent: 7.23, crossCheck: "passed", derivation: "FDIC Call Report field CASHDUE; cross-validated against FR Y-9C BHCK0081+BHCK0395" },
  { id: "RC-2", lineItem: "Securities - HTM", schedule: "RC", currentPeriod: 28450000, priorPeriod: 31200000, change: -2750000, changePercent: -8.81, crossCheck: "passed", derivation: "FDIC field SCHTM (held-to-maturity at amortized cost); validated against FR Y-9C BHCK1754" },
  { id: "RC-3", lineItem: "Securities - AFS", schedule: "RC", currentPeriod: 18920000, priorPeriod: 21340000, change: -2420000, changePercent: -11.34, crossCheck: "warning", derivation: "FDIC field SCAFS (available-for-sale at fair value); AOCI variance flagged vs UBPR Page 6" },
  { id: "RC-4", lineItem: "Loans and Leases, Net", schedule: "RC-C", currentPeriod: 112500000, priorPeriod: 105800000, change: 6700000, changePercent: 6.33, crossCheck: "passed", derivation: "FDIC field LNLSNET (net loans); reconciled to UBPR loan concentration ratios" },
  { id: "RC-5", lineItem: "Total Assets", schedule: "RC", currentPeriod: 225100000, priorPeriod: 218520000, change: 6580000, changePercent: 3.01, crossCheck: "passed", derivation: "FDIC field ASSET; cross-checked against FR Y-9C BHCK2170 consolidated total" },
  { id: "RC-6", lineItem: "Total Deposits", schedule: "RC-E", currentPeriod: 178400000, priorPeriod: 175200000, change: 3200000, changePercent: 1.83, crossCheck: "passed", derivation: "FDIC field DEP; validated against FR Y-9C BHDM6631+BHDM6636 by deposit type" },
  { id: "RC-7", lineItem: "Total Liabilities", schedule: "RC", currentPeriod: 205300000, priorPeriod: 200100000, change: 5200000, changePercent: 2.60, crossCheck: "passed", derivation: "FDIC derived ASSET minus EQ; reconciled to FR Y-9C Schedule HC" },
  { id: "RC-8", lineItem: "Total Equity Capital", schedule: "RC", currentPeriod: 19800000, priorPeriod: 18420000, change: 1380000, changePercent: 7.49, crossCheck: "passed", derivation: "FDIC field EQ; cross-checked against FR Y-9C BHCK3210 total equity" },
  { id: "RI-1", lineItem: "Total Interest Income", schedule: "RI", currentPeriod: 8450000, priorPeriod: 7920000, change: 530000, changePercent: 6.69, crossCheck: "passed", derivation: "FDIC field INTINC (total interest income); reconciled to FR Y-9C BHCK4107" },
  { id: "RI-2", lineItem: "Total Interest Expense", schedule: "RI", currentPeriod: 5500000, priorPeriod: 5000000, change: 500000, changePercent: 10.00, crossCheck: "passed", derivation: "FDIC field EINTEXP (total interest expense); validated against FR Y-9C BHCK4073" },
  { id: "RI-3", lineItem: "Provision for Credit Losses", schedule: "RI", currentPeriod: 425000, priorPeriod: 310000, change: 115000, changePercent: 37.10, crossCheck: "warning", derivation: "FDIC field ELNATR vs FR Y-9C BHCK4230; 37% QoQ increase exceeds 20% threshold — CECL model inputs require review against UBPR peer reserve ratios" },
  { id: "RI-4", lineItem: "Non-Interest Income", schedule: "RI", currentPeriod: 1040000, priorPeriod: 892000, change: 148000, changePercent: 16.59, crossCheck: "passed", derivation: "FDIC field NONII; reconciled to FR Y-9C BHCK4079 non-interest income components" },
  { id: "RC-N1", lineItem: "Loans Past Due 30-89 Days", schedule: "RC-N", currentPeriod: 1850000, priorPeriod: 1420000, change: 430000, changePercent: 30.28, crossCheck: "warning", derivation: "FDIC field P3ASSET vs FR Y-9C BHCK5524; 30% increase in early-stage delinquencies flagged — migration analysis needed for loss reserve adequacy" },
  { id: "RC-N2", lineItem: "Loans Past Due 90+ Days", schedule: "RC-N", currentPeriod: 680000, priorPeriod: 590000, change: 90000, changePercent: 15.25, crossCheck: "passed", derivation: "FDIC field P9ASSET; validated against FR Y-9C BHCK5525 and UBPR Page 8 delinquency rates" },
  { id: "RC-N3", lineItem: "Nonaccrual Loans", schedule: "RC-N", currentPeriod: 1024000, priorPeriod: 885000, change: 139000, changePercent: 15.71, crossCheck: "warning", derivation: "FDIC field NAESSION vs FR Y-9C BHCK3506; nonaccrual increase concentrated in CRE office — cross-check with RC-C Part I memo items for sector breakdown" },
  { id: "RC-L1", lineItem: "Notional Amount - Interest Rate Derivatives", schedule: "RC-L", currentPeriod: 895000000, priorPeriod: 842000000, change: 53000000, changePercent: 6.30, crossCheck: "passed", derivation: "FDIC field DTEFV (derivative fair values); validated against FR Y-9C BHCKA126 notional amounts" },
  { id: "RC-L2", lineItem: "Derivative Fair Value - Net Position", schedule: "RC-L", currentPeriod: 2340000, priorPeriod: 3180000, change: -840000, changePercent: -26.42, crossCheck: "warning", derivation: "FDIC derivative fair values vs FR Y-9C BHCK8741/BHCK8742; net position swing of 26% exceeds tolerance — netting agreement classifications need verification" },
  { id: "RC-R1", lineItem: "CET1 Capital Ratio", schedule: "RC-R", currentPeriod: 12.8, priorPeriod: 12.1, change: 0.7, changePercent: 5.79, crossCheck: "passed", derivation: "FR Y-9C BHCKA224 (CET1 ratio); validated against FDIC IDT1RWA and UBPR Page 11" },
  { id: "RC-R2", lineItem: "Total Risk-Weighted Assets", schedule: "RC-R", currentPeriod: 154700000, priorPeriod: 152300000, change: 2400000, changePercent: 1.58, crossCheck: "passed", derivation: "FR Y-9C BHCKA223 (total RWA); reconciled to FDIC risk-based capital denominators" },
  { id: "RC-R3", lineItem: "Total Capital Ratio", schedule: "RC-R", currentPeriod: 15.2, priorPeriod: 14.8, change: 0.4, changePercent: 2.70, crossCheck: "passed", derivation: "FR Y-9C BHCK7205 (total capital ratio); cross-checked with UBPR risk-based capital" },
  { id: "RC-R4", lineItem: "Standardized RWA - CRE Exposures", schedule: "RC-R", currentPeriod: 38200000, priorPeriod: 34100000, change: 4100000, changePercent: 12.02, crossCheck: "warning", derivation: "FR Y-9C risk-weight assignment vs FDIC Call Report RC-R Part II; 12% CRE RWA increase warrants review of 150% risk-weight applicability on HVCRE exposures" },
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

export interface AIQueryItem {
  id: string;
  schedule: string;
  question: string;
  answer: string;
  sources: { label: string; reference: string }[];
}

export const aiQueries: AIQueryItem[] = [
  {
    id: "q-rc-1",
    schedule: "RC",
    question: "What is the current total asset position and how does it reconcile across sources?",
    answer: "Total assets stand at $225.1B as of Q4 2024, representing a 3.01% increase from Q3 2024 ($218.5B).\n\nCross-source reconciliation:\n- FDIC Call Report field ASSET: $225,100,000K\n- FR Y-9C field BHCK2170: $225,100,000K\n- Variance: $0 (0.00%)\n\nThe balance sheet is fully reconciled across both federal data sources. Asset growth was driven primarily by a $6.7B increase in net loans (RC-C) partially offset by a $5.2B reduction in the securities portfolio (HTM + AFS combined).",
    sources: [
      { label: "FDIC Call Report", reference: "Schedule RC, field ASSET (total assets in thousands)" },
      { label: "FR Y-9C", reference: "Schedule HC, field BHCK2170 (consolidated total assets)" },
      { label: "UBPR", reference: "Page 1 — Balance Sheet Summary" },
    ],
  },
  {
    id: "q-rc-r-1",
    schedule: "RC-R",
    question: "Are capital ratios above minimum requirements including buffers?",
    answer: "Yes. All risk-based capital ratios exceed both minimum requirements and conservation buffers:\n\n- CET1 Ratio: 12.8% (minimum 4.5% + 2.5% buffer = 7.0%)\n- Total Capital Ratio: 15.2% (minimum 8.0% + 2.5% buffer = 10.5%)\n- Total RWA: $154.7B, up 1.58% QoQ\n\nHowever, CRE risk-weighted assets increased 12.02% QoQ to $38.2B, which warrants review of 150% risk-weight applicability on High Volatility CRE (HVCRE) exposures under the standardized approach. This is flagged for human review.",
    sources: [
      { label: "FR Y-9C", reference: "Field BHCKA224 (CET1 ratio), BHCK7205 (total capital ratio)" },
      { label: "FDIC Call Report", reference: "Schedule RC-R Part II, field IDT1RWA (Tier 1 ratio)" },
      { label: "UBPR", reference: "Page 11 — Risk-Based Capital Ratios" },
    ],
  },
  {
    id: "q-rc-r-2",
    schedule: "RC-R",
    question: "Why is the CRE RWA exposure flagged for review?",
    answer: "Standardized RWA for CRE exposures increased from $34.1B to $38.2B (+12.02% QoQ), which exceeds the 10% quarterly change threshold.\n\nPotential issues:\n1. New CRE originations may qualify as HVCRE under Basel III, requiring a 150% risk weight instead of the standard 100%\n2. Reclassification of existing loans from ADC (Acquisition, Development, Construction) may not have been reflected in risk-weight assignments\n3. CRE concentration risk — the $38.2B CRE RWA represents 24.7% of total RWA ($154.7B)\n\nRecommendation: Verify HVCRE classification criteria are applied consistently and cross-check against RC-C Part I CRE loan detail memo items.",
    sources: [
      { label: "FDIC Call Report", reference: "Schedule RC-R Part II — Risk-Weighted Assets by category" },
      { label: "FR Y-9C", reference: "Schedule HC-C — CRE loan concentration data" },
    ],
  },
  {
    id: "q-ri-1",
    schedule: "RI",
    question: "Why is the provision for credit losses flagged?",
    answer: "Provision for credit losses increased 37.1% QoQ from $310M to $425M, exceeding the 20% quarterly change threshold that triggers automatic review.\n\nContributing factors from ingested data:\n- FDIC field ELNATR shows the elevated provision aligns with increased early-stage delinquencies in Schedule RC-N (30-89 day past dues up 30.3%)\n- Nonaccrual loans rose 15.7%, concentrated in CRE office segment\n- UBPR peer benchmarks show the provision rate (0.45%) is above the peer median (0.28%)\n\nThe increase appears driven by CECL model recalibration for deteriorating CRE office conditions. Reserve adequacy should be assessed against the migration analysis from RC-N delinquency trends.",
    sources: [
      { label: "FDIC Call Report", reference: "Schedule RI, field ELNATR (provision for credit losses)" },
      { label: "FR Y-9C", reference: "Field BHCK4230 (provision for credit losses)" },
      { label: "UBPR", reference: "Page 4 — Provision and charge-off peer comparison" },
    ],
  },
  {
    id: "q-rc-n-1",
    schedule: "RC-N",
    question: "What is driving the increase in past due and nonaccrual loans?",
    answer: "Delinquency metrics deteriorated across multiple categories in Q4 2024:\n\n- 30-89 days past due: $1.85B, up 30.3% from $1.42B (flagged)\n- 90+ days past due: $680M, up 15.3% from $590M\n- Nonaccrual loans: $1.02B, up 15.7% from $885M (flagged)\n\nThe increase is concentrated in CRE office exposures per FR Y-9C field BHCK3506 cross-referenced with FDIC Call Report RC-N. The nonaccrual migration from 30-89 day bucket to nonaccrual suggests credit deterioration rather than seasonal fluctuation.\n\nThe NPL ratio rose to 0.91% from 0.85% QoQ, still below the peer median of 0.95% per UBPR but trending adversely for three consecutive quarters.",
    sources: [
      { label: "FDIC Call Report", reference: "Schedule RC-N, fields P3ASSET, P9ASSET, NAESSION" },
      { label: "FR Y-9C", reference: "Fields BHCK5524, BHCK5525, BHCK3506 (delinquency & nonaccrual)" },
      { label: "UBPR", reference: "Page 8 — Delinquency and Loss Rates vs Peer" },
    ],
  },
  {
    id: "q-rc-l-1",
    schedule: "RC-L",
    question: "Why is the derivative net position flagged for review?",
    answer: "The net derivative fair value position swung from $3.18B to $2.34B, a 26.4% decline that exceeds the 15% quarterly change tolerance.\n\nAnalysis from ingested data:\n- Interest rate derivative notional: $895B, up 6.3% QoQ (within tolerance)\n- Gross positive fair value decreased more than gross negative, suggesting mark-to-market losses on rate hedges\n- The swing may reflect interest rate curve movements affecting hedge effectiveness\n\nThe flag relates to netting agreement classifications — FDIC derivative fair values and FR Y-9C fields BHCK8741/BHCK8742 should be reconciled to ensure master netting agreements and collateral offsets are applied consistently across both reports.",
    sources: [
      { label: "FDIC Call Report", reference: "Schedule RC-L — Derivatives and Off-Balance Sheet Items" },
      { label: "FR Y-9C", reference: "Fields BHCK8741 (positive fair value), BHCK8742 (negative fair value)" },
    ],
  },
  {
    id: "q-rc-c-1",
    schedule: "RC-C",
    question: "How do loan balances reconcile between FDIC Call Report and FR Y-9C?",
    answer: "Cross-source reconciliation of net loans and leases:\n\n- FDIC Call Report (LNLSNET): $112,500,000K\n- FR Y-9C (BHCK2122): $112,480,000K\n- Variance: $20,000K (0.02%)\n\nThe $20M variance is within the acceptable threshold and stems from consolidation timing differences between the bank-level Call Report and BHC-level FR Y-9C.\n\nLoan growth of 6.33% QoQ ($6.7B) was primarily driven by C&I originations. UBPR loan-to-deposit ratio of 63.1% is consistent with FDIC DEP ($178.4B) and LNLSNET ($112.5B). Loan concentration ratios from UBPR remain within peer benchmarks.",
    sources: [
      { label: "FDIC Call Report", reference: "Schedule RC-C, field LNLSNET (net loans and leases)" },
      { label: "FR Y-9C", reference: "Field BHCK2122 (total loans and leases, net)" },
      { label: "UBPR", reference: "Page 6 — Loan Mix and Concentration Ratios" },
    ],
  },
  {
    id: "q-rc-e-1",
    schedule: "RC-E",
    question: "What is the deposit composition and how does it compare to peers?",
    answer: "Total deposits stand at $178.4B, up 1.83% QoQ from $175.2B.\n\nDeposit classification from ingested Call Report:\n- Transaction accounts and demand deposits form the core funding base\n- Time deposits by maturity are reported per FDIC field DEP breakdowns\n- Validated against FR Y-9C fields BHDM6631 (domestic) + BHDM6636 (foreign)\n\nThe loan-to-deposit ratio of 63.1% is conservative relative to peers (PNC: 75.9%, Citizens: 81.2%, M&T: 80.3%), indicating strong liquidity and deposit funding capacity. UBPR peer analysis confirms deposit stability metrics are in the top quartile.",
    sources: [
      { label: "FDIC Call Report", reference: "Schedule RC-E, field DEP (total deposits)" },
      { label: "FR Y-9C", reference: "Fields BHDM6631, BHDM6636 (deposits by type)" },
      { label: "UBPR", reference: "Page 3 — Funding and Liquidity Ratios" },
    ],
  },
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
