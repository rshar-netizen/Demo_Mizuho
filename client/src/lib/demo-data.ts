export interface ReportingInstruction {
  id: string;
  section: string;
  description: string;
  schedule: string;
  frequency: string;
  status: "analyzed" | "pending" | "flagged";
  requirements: string[];
  humanReview?: boolean;
  reviewReason?: string;
}

export interface DataColumn {
  name: string;
  type: string;
  source: string;
  nullable: boolean;
  description: string;
}

export interface DataQuality {
  totalFields: number;
  autoMapped: number;
  manualReview: number;
  qualityScore: number;
  nullRate: number;
  flaggedRecords: number;
}

export interface DataDictionary {
  tableName: string;
  columns: DataColumn[];
  recordCount: number;
  lastUpdated: string;
  quality: DataQuality;
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
    humanReview: true,
    reviewReason: "Complex risk-weighting methodology — Basel III standardized vs. advanced approaches require manual validation of asset category assignments and off-balance-sheet conversion factors",
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
    humanReview: true,
    reviewReason: "Judgment-based loan classification — nonaccrual determinations and TDR identification rely on subjective credit risk assessments that AI cannot fully validate",
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
    humanReview: true,
    reviewReason: "Complex fair value hierarchy and netting rules — derivative valuation (Level 2/3), hedge accounting eligibility, and master netting agreement offsets require expert judgment",
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
      { name: "IDT1CER", type: "DECIMAL(6,2)", source: "Schedule RC-R Part I", nullable: true, description: "Tier 1 risk-based capital ratio (%)" },
      { name: "P3ASSET", type: "DECIMAL(18,0)", source: "Schedule RC-N", nullable: true, description: "Past-due 90+ days and nonaccrual assets (thousands USD)" },
      { name: "EEFFR", type: "DECIMAL(6,2)", source: "FDIC Derived", nullable: true, description: "Efficiency ratio (%)" },
    ],
    recordCount: 56,
    lastUpdated: "2025-01-15",
    quality: {
      totalFields: 728,
      autoMapped: 694,
      manualReview: 34,
      qualityScore: 95.3,
      nullRate: 1.8,
      flaggedRecords: 4,
    },
  },
  {
    tableName: "FFIEC_UBPR_RATIOS",
    columns: [
      { name: "RSSD_ID", type: "VARCHAR(10)", source: "FFIEC CDR", nullable: false, description: "Federal Reserve RSSD identifier" },
      { name: "REPORTING_PERIOD", type: "DATE", source: "FFIEC CDR", nullable: false, description: "UBPR reporting period" },
      { name: "NET_INTEREST_MARGIN", type: "DECIMAL(6,2)", source: "UBPR Page 1, Line 21", nullable: true, description: "Net interest margin (%), NII TE to avg earning assets" },
      { name: "RETURN_ON_ASSETS", type: "DECIMAL(6,2)", source: "UBPR Page 1, Line 16", nullable: true, description: "Return on average assets (%)" },
      { name: "RETURN_ON_EQUITY", type: "DECIMAL(6,2)", source: "Derived", nullable: true, description: "Return on average equity (%), derived from net income / avg equity" },
      { name: "EFFICIENCY_RATIO", type: "DECIMAL(6,2)", source: "UBPR Page 3, Line 6", nullable: true, description: "Operating efficiency ratio (%), overhead / revenue" },
      { name: "TIER1_LEVERAGE", type: "DECIMAL(6,2)", source: "UBPR Page 11, Line 15", nullable: true, description: "Tier 1 leverage ratio (%)" },
      { name: "RISK_BASED_CAPITAL", type: "DECIMAL(6,2)", source: "UBPR Page 11, Line 18", nullable: true, description: "Total risk-based capital ratio (%)" },
      { name: "NET_CHARGEOFFS", type: "DECIMAL(6,2)", source: "UBPR Page 1, Line 22", nullable: true, description: "Net loss to average total loans & leases (%)" },
      { name: "NPA_TO_ASSETS", type: "DECIMAL(6,2)", source: "UBPR Page 1, Line 29", nullable: true, description: "Non-curr LNS+OREO to LNS+OREO (%)" },
      { name: "LOAN_TO_DEPOSIT", type: "DECIMAL(6,2)", source: "UBPR Page 1, Line 32", nullable: true, description: "Net loans & leases to deposits (%)" },
    ],
    recordCount: 56,
    lastUpdated: "2025-01-15",
    quality: {
      totalFields: 504,
      autoMapped: 489,
      manualReview: 15,
      qualityScore: 97.0,
      nullRate: 0.6,
      flaggedRecords: 2,
    },
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
    recordCount: 56,
    lastUpdated: "2025-01-15",
    quality: {
      totalFields: 616,
      autoMapped: 582,
      manualReview: 34,
      qualityScore: 94.5,
      nullRate: 2.4,
      flaggedRecords: 6,
    },
  }
];

export interface UnmappedField {
  fieldName: string;
  source: string;
  table: string;
  expectedType: string;
  issue: "format_mismatch" | "missing_source" | "ambiguous_mapping" | "deprecated_field" | "null_population" | "cross_source_conflict";
  issueDescription: string;
  suggestedResolution: string;
  severity: "high" | "medium" | "low";
  affectedRecords: number;
}

export const unmappedFields: UnmappedField[] = [
  {
    fieldName: "SCMTGBK",
    source: "FDIC BankFind Suite",
    table: "FFIEC_031_CALL_REPORT",
    expectedType: "DECIMAL(18,0)",
    issue: "deprecated_field",
    issueDescription: "Mortgage-backed securities book value field was deprecated in Q1 2024 FFIEC instructions; replaced by SCMTGA (amortized cost) and SCMTGF (fair value) split",
    suggestedResolution: "Map to new fields SCMTGA + SCMTGF; apply historical backfill for prior quarters using SCMTGBK as proxy",
    severity: "high",
    affectedRecords: 8,
  },
  {
    fieldName: "STALPBK",
    source: "FDIC BankFind Suite",
    table: "FFIEC_031_CALL_REPORT",
    expectedType: "DECIMAL(18,0)",
    issue: "format_mismatch",
    issueDescription: "State & local government securities field returns values in whole dollars for 3 quarters but in thousands for the remaining 5; inconsistent unit scaling detected",
    suggestedResolution: "Normalize all values to thousands USD; apply magnitude check (if value > 10x median, divide by 1000)",
    severity: "high",
    affectedRecords: 3,
  },
  {
    fieldName: "EQCDIV",
    source: "FDIC BankFind Suite",
    table: "FFIEC_031_CALL_REPORT",
    expectedType: "DECIMAL(18,0)",
    issue: "null_population",
    issueDescription: "Cash dividends declared field is null for 6 of 8 quarterly periods; only Q4 filings contain non-null values, consistent with annual dividend declaration pattern",
    suggestedResolution: "Accept null for Q1-Q3 as expected; flag only if Q4 is also null — indicates missing annual declaration",
    severity: "low",
    affectedRecords: 6,
  },
  {
    fieldName: "INTEXPY",
    source: "FDIC BankFind Suite",
    table: "FFIEC_031_CALL_REPORT",
    expectedType: "DECIMAL(18,0)",
    issue: "ambiguous_mapping",
    issueDescription: "Year-to-date interest expense field overlaps with quarterly EINTEXP; both are present in source data but map to different aggregation periods causing potential double-count",
    suggestedResolution: "Use EINTEXP for quarterly analysis; derive QoQ change from INTEXPY year-to-date delta; do not sum both fields",
    severity: "medium",
    affectedRecords: 8,
  },
  {
    fieldName: "LNRESNCR",
    source: "FDIC BankFind Suite",
    table: "FFIEC_031_CALL_REPORT",
    expectedType: "DECIMAL(18,0)",
    issue: "cross_source_conflict",
    issueDescription: "FDIC loan loss reserve field diverges from FR Y-9C BHCK3123 by >2% for 2 quarters (Q2 and Q3 2024); bank-level vs. BHC-level consolidation difference exceeds tolerance",
    suggestedResolution: "Investigate subsidiary-level reserve allocations; reconcile using intercompany elimination schedule; flag for manual review if variance persists",
    severity: "high",
    affectedRecords: 2,
  },
  {
    fieldName: "NET_CHARGEOFFS_PCT",
    source: "FFIEC CDR",
    table: "FFIEC_UBPR_RATIOS",
    expectedType: "DECIMAL(6,2)",
    issue: "format_mismatch",
    issueDescription: "UBPR net charge-off ratio returns basis points (e.g. 45) for some periods and percentage (e.g. 0.45) for others; format changed in 2024 UBPR update",
    suggestedResolution: "Apply conditional transformation: if value > 10, divide by 100 to normalize to percentage format",
    severity: "medium",
    affectedRecords: 4,
  },
  {
    fieldName: "LIQUIDITY_COVERAGE",
    source: "FFIEC CDR",
    table: "FFIEC_UBPR_RATIOS",
    expectedType: "DECIMAL(6,2)",
    issue: "missing_source",
    issueDescription: "Liquidity coverage ratio field is referenced in UBPR Page 12 but not available via CDR bulk download; only accessible through individual institution UBPR PDF reports",
    suggestedResolution: "Omit from automated pipeline; add to manual data collection checklist for quarterly UBPR PDF extraction",
    severity: "medium",
    affectedRecords: 0,
  },
  {
    fieldName: "PEER_GROUP_PCT",
    source: "FFIEC CDR",
    table: "FFIEC_UBPR_RATIOS",
    expectedType: "DECIMAL(6,2)",
    issue: "ambiguous_mapping",
    issueDescription: "Peer group percentile rank is returned as both a numeric rank and a descriptive category (e.g. '75' vs 'Top Quartile'); CDR API returns mixed format across endpoints",
    suggestedResolution: "Parse numeric value only; discard descriptive text; standardize to percentile rank 0-100",
    severity: "low",
    affectedRecords: 3,
  },
  {
    fieldName: "BHCK4230",
    source: "Federal Reserve NIC",
    table: "FR_Y9C_BHC_DATA",
    expectedType: "DECIMAL(18,0)",
    issue: "null_population",
    issueDescription: "Provision for credit losses field returns null for all 8 quarters via NIC bulk data API; field is present in PDF filings but not in structured data feed",
    suggestedResolution: "Supplement with FDIC ELNATR field as proxy at bank level; escalate NIC data feed gap to Federal Reserve data team",
    severity: "high",
    affectedRecords: 8,
  },
  {
    fieldName: "BHCK8741",
    source: "Federal Reserve NIC",
    table: "FR_Y9C_BHC_DATA",
    expectedType: "DECIMAL(18,0)",
    issue: "cross_source_conflict",
    issueDescription: "Gross positive fair value of derivatives (FR Y-9C) does not reconcile to FDIC RC-L derivative fair value within 5% tolerance for Q3 2024; BHC includes non-bank subsidiaries",
    suggestedResolution: "Apply BHC-to-bank-level adjustment factor based on subsidiary contribution; document variance in reconciliation workpaper",
    severity: "medium",
    affectedRecords: 1,
  },
  {
    fieldName: "BHCKB704",
    source: "Federal Reserve NIC",
    table: "FR_Y9C_BHC_DATA",
    expectedType: "DECIMAL(18,0)",
    issue: "deprecated_field",
    issueDescription: "Supplementary leverage ratio exposure field was restructured in 2024 Basel III endgame proposal; BHCKB704 split into BHCKHT85 (on-balance) and BHCKHT86 (off-balance)",
    suggestedResolution: "Map to new split fields for Q1 2025+; maintain BHCKB704 for historical quarters; add transformation logic for trend continuity",
    severity: "medium",
    affectedRecords: 4,
  },
  {
    fieldName: "BHCA7204",
    source: "Federal Reserve NIC",
    table: "FR_Y9C_BHC_DATA",
    expectedType: "DECIMAL(6,2)",
    issue: "null_population",
    issueDescription: "Leverage ratio field returns null via NIC API for all periods; structured data feed does not populate this derived ratio — only raw capital and exposure components are available",
    suggestedResolution: "Derive from BHCKA223 (Tier 1 capital) / BHCK2170 (total assets); validate derived ratio against PDF filing",
    severity: "low",
    affectedRecords: 8,
  },
];

export interface FieldLinkage {
  concept: string;
  schedule: string;
  callReport: { field: string; description: string } | null;
  frY9C: { field: string; description: string } | null;
  ubpr: { field: string; description: string } | null;
  reconciliationStatus: "reconciled" | "variance" | "partial" | "unavailable";
  varianceNote?: string;
  linkageType: "reconciliation" | "derivation" | "validation";
}

export const fieldLinkages: FieldLinkage[] = [
  {
    concept: "Total Assets",
    schedule: "RC / HC",
    callReport: { field: "ASSET", description: "Total assets, bank-level (Schedule RC line 12)" },
    frY9C: { field: "BHCK2170", description: "Total consolidated assets, BHC-level (Schedule HC line 12)" },
    ubpr: { field: "Page 4, Line 33", description: "Total assets (UBPR2170), Balance Sheet $" },
    reconciliationStatus: "reconciled",
    linkageType: "reconciliation",
  },
  {
    concept: "Net Loans & Leases",
    schedule: "RC-C / HC-C",
    callReport: { field: "LNLSNET", description: "Loans and leases net of unearned income (Schedule RC-C)" },
    frY9C: { field: "BHCK2122", description: "Total loans and leases, net (Schedule HC-C)" },
    ubpr: { field: "Page 4, Line 14", description: "Net loans and leases (UBPRE119), Balance Sheet $" },
    reconciliationStatus: "variance",
    varianceNote: "BHC consolidation includes non-bank subsidiary loans; $20M (0.02%) variance within tolerance",
    linkageType: "reconciliation",
  },
  {
    concept: "Total Deposits",
    schedule: "RC-E / HC-E",
    callReport: { field: "DEP", description: "Total deposits, bank-level (Schedule RC-E)" },
    frY9C: { field: "BHDM6631 + BHDM6636", description: "Domestic + foreign deposits (Schedule HC-E)" },
    ubpr: { field: "Page 4, Line 45", description: "Total deposits (UBPR2200), Balance Sheet $" },
    reconciliationStatus: "reconciled",
    linkageType: "reconciliation",
  },
  {
    concept: "Net Income",
    schedule: "RI / HI",
    callReport: { field: "NETINC", description: "Net income, bank-level (Schedule RI)" },
    frY9C: { field: "BHCK4340", description: "Net income, BHC consolidated (Schedule HI)" },
    ubpr: { field: "Page 1, Line 43", description: "Net income $000 (UBPR4340); Line 16 as % avg assets (UBPRE013)" },
    reconciliationStatus: "reconciled",
    linkageType: "reconciliation",
  },
  {
    concept: "Total Interest Income",
    schedule: "RI / HI",
    callReport: { field: "INTINC", description: "Total interest income (Schedule RI, line 1)" },
    frY9C: { field: "BHCK4074", description: "Total interest income (Schedule HI, line 1)" },
    ubpr: { field: "Page 1, Line 1", description: "Interest income (TE) as % avg assets (UBPRE001)" },
    reconciliationStatus: "reconciled",
    linkageType: "reconciliation",
  },
  {
    concept: "Total Interest Expense",
    schedule: "RI / HI",
    callReport: { field: "EINTEXP", description: "Total interest expense (Schedule RI, line 2)" },
    frY9C: { field: "BHCK4079", description: "Total interest expense (Schedule HI, line 2)" },
    ubpr: { field: "Page 1, Line 2", description: "Interest expense as % avg assets (UBPRE002)" },
    reconciliationStatus: "reconciled",
    linkageType: "reconciliation",
  },
  {
    concept: "Net Interest Margin",
    schedule: "Derived",
    callReport: { field: "NIMY", description: "Net interest margin, derived from INTINC - EINTEXP / avg earning assets" },
    frY9C: null,
    ubpr: { field: "Page 1, Line 21", description: "Net int inc (TE) to avg earning assets (UBPRE018)" },
    reconciliationStatus: "reconciled",
    varianceNote: "UBPR NIM uses tax-equivalent interest income; FDIC NIMY may use different averaging methodology",
    linkageType: "derivation",
  },
  {
    concept: "Tier 1 Capital Ratio",
    schedule: "RC-R / HC-R",
    callReport: { field: "IDT1CER", description: "Tier 1 risk-based capital ratio (Schedule RC-R Part I)" },
    frY9C: { field: "BHCK7206", description: "Tier 1 capital ratio (Schedule HC-R)" },
    ubpr: { field: "Page 11, Line 17", description: "Tier 1 risk-based capital ratio (UBPRD487)" },
    reconciliationStatus: "reconciled",
    linkageType: "reconciliation",
  },
  {
    concept: "CET1 Capital Ratio",
    schedule: "RC-R / HC-R",
    callReport: { field: "IDT1CERWAT", description: "CET1 risk-based capital ratio (Schedule RC-R Part I)" },
    frY9C: { field: "BHCA7205", description: "CET1 ratio (Schedule HC-R)" },
    ubpr: { field: "Page 11, Line 16", description: "CET1 capital ratio (UBPRR029)" },
    reconciliationStatus: "reconciled",
    linkageType: "reconciliation",
  },
  {
    concept: "Total Capital Ratio",
    schedule: "RC-R / HC-R",
    callReport: { field: "RBCRWAJ", description: "Total risk-based capital ratio (Schedule RC-R Part I)" },
    frY9C: { field: "BHCK7210", description: "Total capital ratio (Schedule HC-R)" },
    ubpr: { field: "Page 11, Line 18", description: "Total risk-based capital ratio (UBPRD488)" },
    reconciliationStatus: "reconciled",
    linkageType: "reconciliation",
  },
  {
    concept: "Provision for Credit Losses",
    schedule: "RI / HI",
    callReport: { field: "ELNATR", description: "Provision for credit losses (Schedule RI, line 4)" },
    frY9C: { field: "BHCK4230", description: "Provision for credit losses (Schedule HI, line 4)" },
    ubpr: { field: "Page 1, Line 7", description: "Provision: credit losses as % avg assets (UBPRE006)" },
    reconciliationStatus: "unavailable",
    varianceNote: "FR Y-9C field BHCK4230 returns null via NIC data feed; FDIC ELNATR used as primary source",
    linkageType: "reconciliation",
  },
  {
    concept: "Nonperforming Assets Ratio",
    schedule: "RC-N / HC-N",
    callReport: { field: "P3ASSET + P9ASSET + NAESSION", description: "Past due 90+ days + nonaccrual / total assets" },
    frY9C: { field: "BHCK5525 + BHCK3506", description: "Noncurrent loans + OREO / total assets" },
    ubpr: { field: "Page 1, Line 29", description: "Non-curr LNS+OREO to LNS+OREO (UBPRE549)" },
    reconciliationStatus: "variance",
    varianceNote: "Calculation methodology differs: FDIC uses past-due 90+ basis; FR Y-9C uses noncurrent (90+ and nonaccrual combined)",
    linkageType: "derivation",
  },
  {
    concept: "Return on Equity",
    schedule: "Derived",
    callReport: { field: "ROE", description: "Return on equity (FDIC-derived from NETINC / avg equity)" },
    frY9C: null,
    ubpr: null,
    reconciliationStatus: "partial",
    varianceNote: "UBPR does not report ROE as a standalone line; derivable from Page 1 Line 43 (net income) / Page 11 Line 28 (equity). FR Y-9C: BHCK4340 / avg BHCK3210",
    linkageType: "derivation",
  },
  {
    concept: "Efficiency Ratio",
    schedule: "Derived",
    callReport: { field: "EEFFR", description: "Efficiency ratio (FDIC-derived from non-interest expense / revenue)" },
    frY9C: null,
    ubpr: { field: "Page 3, Line 6", description: "Efficiency ratio: overhead expense / (NII TE + non-int income) (UBPRE088)" },
    reconciliationStatus: "partial",
    varianceNote: "FR Y-9C does not report efficiency ratio; derivable from Schedule HI non-interest expense and revenue lines",
    linkageType: "derivation",
  },
  {
    concept: "Total Assets = Liabilities + Equity",
    schedule: "RC / HC",
    callReport: { field: "ASSET = LIAB + EQ", description: "Balance sheet identity: RC line 12 = line 21 + line 28" },
    frY9C: { field: "BHCK2170 = BHCK2948 + BHCK3210", description: "HC line 12 = line 21 + line 28" },
    ubpr: null,
    reconciliationStatus: "reconciled",
    linkageType: "validation",
  },
  {
    concept: "Loan Loss Reserve Adequacy",
    schedule: "RC / RC-N",
    callReport: { field: "LNATRES / P3ASSET", description: "ALLL-to-noncurrent loans ratio (Schedule RC / RC-N)" },
    frY9C: { field: "BHCK3123 / BHCK5525", description: "ALLL / noncurrent loans (HC / HC-N)" },
    ubpr: { field: "Page 1, Line 24", description: "ACL on LN&LS HFI to LN&LS HFI (UBPRE022)" },
    reconciliationStatus: "variance",
    varianceNote: "FDIC loan loss reserve (LNATRES) diverges from FR Y-9C BHCK3123 by >2% in Q2-Q3 2024; flagged in Data Quality Issues",
    linkageType: "validation",
  },
];

export const anomalyRecords: AnomalyRecord[] = [
  { period: "Q4 2024", metric: "Net Loans QoQ Growth", value: 6.33, expected: 2.5, deviation: 3.83, severity: "high", description: "FDIC LNLSNET increased from $105.8B to $112.5B (+6.33% QoQ), more than double the 8-quarter average growth rate of 2.5%; Schedule RC-C concentration review recommended" },
  { period: "Q4 2024", metric: "AFS Securities Decline", value: -11.34, expected: -3.0, deviation: -8.34, severity: "high", description: "FDIC SCAFS dropped from $21.3B to $18.9B (−11.34% QoQ); AOCI variance flagged in cross-check with UBPR Page 6 — unrealized loss impact on equity needs review" },
  { period: "Q4 2024", metric: "Provision for Credit Losses", value: 425, expected: 306, deviation: 119, severity: "medium", description: "Schedule RI provisions rose 37.1% QoQ from $310M to $425M, exceeding 20% threshold; 8-quarter average is $306M — elevated reserves linked to RC-N delinquency increases" },
  { period: "Q4 2024", metric: "Past Due 30-89 Days", value: 1850, expected: 1420, deviation: 430, severity: "medium", description: "Schedule RC-N early-stage delinquencies increased 30.3% QoQ from $1.42B to $1.85B; migration risk to nonaccrual status warrants enhanced monitoring" },
  { period: "Q4 2024", metric: "Efficiency Ratio", value: 59.27, expected: 58.1, deviation: 1.17, severity: "low", description: "FDIC efficiency ratio at 59.27% vs UBPR Page 3 Line 6 peer median of 58.1%; marginally above peer median, reflecting stable operating cost discipline" },
  { period: "Q4 2024", metric: "Derivative Net Fair Value", value: -26.42, expected: -5.0, deviation: -21.42, severity: "low", description: "Schedule RC-L net derivative position declined 26.4% QoQ from $3.18B to $2.34B; netting agreement classification review flagged in Report Review cross-check" },
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
  { id: "RC-R1", lineItem: "CET1 Capital Ratio", schedule: "RC-R", currentPeriod: 14.21, priorPeriod: 18.75, change: -4.54, changePercent: -24.21, crossCheck: "warning", derivation: "FDIC RBC1AAJ (Tier 1 capital / adjusted average assets); validated against UBPR Page 11 Line 16" },
  { id: "RC-R2", lineItem: "Total Risk-Weighted Assets", schedule: "RC-R", currentPeriod: 154700000, priorPeriod: 152300000, change: 2400000, changePercent: 1.58, crossCheck: "passed", derivation: "FR Y-9C BHCKA223 (total RWA); reconciled to FDIC risk-based capital denominators" },
  { id: "RC-R3", lineItem: "Total Capital Ratio", schedule: "RC-R", currentPeriod: 15.2, priorPeriod: 14.8, change: 0.4, changePercent: 2.70, crossCheck: "passed", derivation: "FR Y-9C BHCK7205 (total capital ratio); cross-checked with UBPR risk-based capital" },
  { id: "RC-R4", lineItem: "Standardized RWA - CRE Exposures", schedule: "RC-R", currentPeriod: 38200000, priorPeriod: 34100000, change: 4100000, changePercent: 12.02, crossCheck: "warning", derivation: "FR Y-9C risk-weight assignment vs FDIC Call Report RC-R Part II; 12% CRE RWA increase warrants review of 150% risk-weight applicability on HVCRE exposures" },
];

export const periodComparisons: PeriodComparison[] = [
  { metric: "Net Interest Income ($M)", q1_2024: 2840, q2_2024: 2920, q3_2024: 2780, q4_2024: 2950, commentary: "NII improved in Q4 driven by loan growth and favorable mix shift toward higher-yielding assets. NIM expansion of 5bps QoQ.", trend: "up" },
  { metric: "Non-Interest Income ($M)", q1_2024: 1120, q2_2024: 1085, q3_2024: 892, q4_2024: 1040, commentary: "Recovery in Q4 after weak Q3 trading revenues. Fee income from advisory and wealth management remained stable.", trend: "stable" },
  { metric: "Provision for Credit Losses ($M)", q1_2024: 320, q2_2024: 285, q3_2024: 310, q4_2024: 425, commentary: "Elevated provisions in Q4 reflecting increased reserves for commercial real estate portfolio. CECL model recalibrated for macro outlook.", trend: "up" },
  { metric: "Net Income ($M)", q1_2024: 1580, q2_2024: 1620, q3_2024: 1410, q4_2024: 1520, commentary: "Q4 net income reflects higher revenue partially offset by increased provisioning. Full year net income of $6.13B, up 3.2% YoY.", trend: "stable" },
  { metric: "CET1 Capital Ratio (%)", q1_2024: 18.59, q2_2024: 19.14, q3_2024: 18.75, q4_2024: 14.21, commentary: "Tier 1 capital ratio declined in Q4 2024 due to significant balance sheet growth (total assets up 26.8% QoQ). Capital levels remain well above regulatory minimums.", trend: "down" },
  { metric: "Efficiency Ratio (%)", q1_2024: 63.00, q2_2024: 62.59, q3_2024: 62.63, q4_2024: 59.27, commentary: "Efficiency ratio improved in Q4 to 59.27% from 62.63%, driven by revenue growth outpacing non-interest expense increases. Operating cost discipline remains strong.", trend: "up" },
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
  { name: "Mizuho Americas", ticker: "MFG", totalAssets: 5495, totalLoans: 1799, totalDeposits: 4009, netIncome: 94, roe: 7.26, roa: 1.36, nim: 2.33, tier1Ratio: 19.74, cet1Ratio: 19.74, leverageRatio: 19.74, efficiencyRatio: 67.83, npaRatio: 0, loanToDeposit: 44.88, chargeOffRate: 0 },
  { name: "PNC Financial", ticker: "PNC", totalAssets: 568338, totalLoans: 329028, totalDeposits: 450665, netIncome: 7234, roe: 12.79, roa: 1.30, nim: 3.03, tier1Ratio: 9.27, cet1Ratio: 9.27, leverageRatio: 7.8, efficiencyRatio: 40.00, npaRatio: 0.19, loanToDeposit: 73.0, chargeOffRate: 0.42 },
  { name: "U.S. Bancorp", ticker: "USB", totalAssets: 676125, totalLoans: 386268, totalDeposits: 533475, netIncome: 7887, roe: 12.02, roa: 1.18, nim: 2.86, tier1Ratio: 9.38, cet1Ratio: 9.38, leverageRatio: 7.5, efficiencyRatio: 37.98, npaRatio: 0.28, loanToDeposit: 72.4, chargeOffRate: 0.48 },
  { name: "Citizens Financial", ticker: "CFG", totalAssets: 225864, totalLoans: 142165, totalDeposits: 186283, netIncome: 1922, roe: 7.45, roa: 0.87, nim: 3.12, tier1Ratio: 9.77, cet1Ratio: 9.77, leverageRatio: 7.9, efficiencyRatio: 42.96, npaRatio: 0.34, loanToDeposit: 76.3, chargeOffRate: 0.52 },
  { name: "KeyCorp", ticker: "KEY", totalAssets: 181708, totalLoans: 106385, totalDeposits: 153660, netIncome: 2158, roe: 11.87, roa: 1.17, nim: 2.97, tier1Ratio: 9.96, cet1Ratio: 9.96, leverageRatio: 8.1, efficiencyRatio: 37.90, npaRatio: 0.12, loanToDeposit: 69.2, chargeOffRate: 0.45 },
  { name: "M&T Bank", ticker: "MTB", totalAssets: 184648, totalLoans: 134313, totalDeposits: 155037, netIncome: 1649, roe: 11.26, roa: 0.91, nim: 4.03, tier1Ratio: 9.82, cet1Ratio: 9.82, leverageRatio: 8.4, efficiencyRatio: 30.25, npaRatio: 2.04, loanToDeposit: 86.6, chargeOffRate: 0.38 },
];

export const peerTrendROE: PeerTrendData[] = [
  { period: "Q1 2023", "Mizuho Americas": 6.8, "PNC Financial": 11.2, "U.S. Bancorp": 12.1 },
  { period: "Q2 2023", "Mizuho Americas": 7.1, "PNC Financial": 11.8, "U.S. Bancorp": 12.5 },
  { period: "Q3 2023", "Mizuho Americas": 7.3, "PNC Financial": 12.1, "U.S. Bancorp": 12.8 },
  { period: "Q4 2023", "Mizuho Americas": 7.0, "PNC Financial": 11.5, "U.S. Bancorp": 13.0 },
  { period: "Q1 2024", "Mizuho Americas": 7.2, "PNC Financial": 12.4, "U.S. Bancorp": 13.2 },
  { period: "Q2 2024", "Mizuho Americas": 7.5, "PNC Financial": 12.6, "U.S. Bancorp": 13.4 },
  { period: "Q3 2024", "Mizuho Americas": 7.1, "PNC Financial": 12.2, "U.S. Bancorp": 13.1 },
  { period: "Q4 2024", "Mizuho Americas": 7.68, "PNC Financial": 12.85, "U.S. Bancorp": 13.52 },
];

export const peerTrendNIM: PeerTrendData[] = [
  { period: "Q1 2023", "Mizuho Americas": 2.15, "PNC Financial": 2.55, "U.S. Bancorp": 2.62 },
  { period: "Q2 2023", "Mizuho Americas": 2.20, "PNC Financial": 2.60, "U.S. Bancorp": 2.68 },
  { period: "Q3 2023", "Mizuho Americas": 2.28, "PNC Financial": 2.65, "U.S. Bancorp": 2.72 },
  { period: "Q4 2023", "Mizuho Americas": 2.32, "PNC Financial": 2.70, "U.S. Bancorp": 2.78 },
  { period: "Q1 2024", "Mizuho Americas": 2.35, "PNC Financial": 2.72, "U.S. Bancorp": 2.80 },
  { period: "Q2 2024", "Mizuho Americas": 2.38, "PNC Financial": 2.75, "U.S. Bancorp": 2.82 },
  { period: "Q3 2024", "Mizuho Americas": 2.40, "PNC Financial": 2.76, "U.S. Bancorp": 2.84 },
  { period: "Q4 2024", "Mizuho Americas": 2.42, "PNC Financial": 2.78, "U.S. Bancorp": 2.85 },
];

export const peerTrendCET1: PeerTrendData[] = [
  { period: "Q1 2023", "Mizuho Americas": 11.4, "PNC Financial": 9.8, "U.S. Bancorp": 9.2 },
  { period: "Q2 2023", "Mizuho Americas": 11.5, "PNC Financial": 9.9, "U.S. Bancorp": 9.3 },
  { period: "Q3 2023", "Mizuho Americas": 11.7, "PNC Financial": 9.9, "U.S. Bancorp": 9.4 },
  { period: "Q4 2023", "Mizuho Americas": 11.9, "PNC Financial": 10.0, "U.S. Bancorp": 9.5 },
  { period: "Q1 2024", "Mizuho Americas": 12.1, "PNC Financial": 10.0, "U.S. Bancorp": 9.6 },
  { period: "Q2 2024", "Mizuho Americas": 12.3, "PNC Financial": 10.0, "U.S. Bancorp": 9.7 },
  { period: "Q3 2024", "Mizuho Americas": 12.5, "PNC Financial": 10.1, "U.S. Bancorp": 9.7 },
  { period: "Q4 2024", "Mizuho Americas": 12.8, "PNC Financial": 10.1, "U.S. Bancorp": 9.8 },
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
    question: "What are the key filing requirements for Schedule RC (Balance Sheet)?",
    answer: "Schedule RC requires a consolidated balance sheet reported on a fully consolidated basis per GAAP. Key requirements:\n\n1. Total assets must equal total liabilities plus total equity capital — any imbalance will trigger an edit check failure.\n2. All amounts must be reported in thousands of USD, rounded to the nearest thousand.\n3. Both domestic and foreign offices must be consolidated for filers using FFIEC 031 (international). Domestic-only filers use FFIEC 041.\n4. Assets and liabilities must be reported gross unless the reporting entity has a legal right of setoff under ASC 210-20.\n\nCommon filing pitfalls:\n- Failing to include accrued interest receivable (moved from separate line to embedded in asset lines per 2025 FFIEC guidance)\n- Intercompany eliminations must be completed before filing\n- Trading assets and liabilities must be marked to fair value as of the report date",
    sources: [
      { label: "FFIEC Instructions", reference: "Schedule RC, General Instructions" },
      { label: "ASC 210-20", reference: "Balance Sheet Offsetting" },
    ],
  },
  {
    id: "q-rc-r-1",
    schedule: "RC-R",
    question: "What are the Basel III capital ratio requirements for Schedule RC-R?",
    answer: "Schedule RC-R Part I requires reporting of regulatory capital components and ratios under the Basel III framework:\n\nMinimum capital requirements (plus capital conservation buffer):\n- CET1 Capital Ratio: 4.5% minimum + 2.5% buffer = 7.0% effective minimum\n- Tier 1 Capital Ratio: 6.0% minimum + 2.5% buffer = 8.5% effective minimum\n- Total Capital Ratio: 8.0% minimum + 2.5% buffer = 10.5% effective minimum\n- Leverage Ratio: 4.0% minimum (not risk-based)\n\nPart II covers risk-weighted assets (RWA) calculation under the standardized approach:\n- On-balance-sheet assets are assigned risk weights from 0% (U.S. Treasuries) to 150% (HVCRE)\n- Off-balance-sheet items use credit conversion factors (CCFs) before applying risk weights\n- Institutions must apply the correct approach — standardized vs. advanced — based on their asset size and complexity category\n\nThis schedule is flagged for human review because risk-weight assignments involve subjective classification decisions that require manual validation.",
    sources: [
      { label: "FFIEC Instructions", reference: "Schedule RC-R Parts I & II" },
      { label: "Basel III Final Rule", reference: "12 CFR Part 3 / 217 / 324" },
    ],
  },
  {
    id: "q-rc-r-2",
    schedule: "RC-R",
    question: "How should HVCRE exposures be classified and risk-weighted?",
    answer: "High Volatility Commercial Real Estate (HVCRE) exposures receive a 150% risk weight under the standardized approach, compared to the standard 100% for other CRE.\n\nAn ADC (Acquisition, Development, or Construction) loan qualifies as HVCRE unless it meets ALL of the following exclusion criteria:\n1. The borrower has contributed capital of at least 15% of the appraised \"as completed\" value before the bank advances funds\n2. The borrower's capital contribution is contractually required to remain in the project throughout the life of the loan\n3. The contributed capital is cash or unencumbered readily marketable assets\n\nFiling requirements for Schedule RC-R Part II:\n- Report HVCRE exposures in the designated 150% risk-weight column\n- Ensure loans that transition from ADC to permanent financing are reclassified out of HVCRE\n- Document the basis for excluding ADC loans from HVCRE treatment\n\nFor questions about your institution's specific HVCRE portfolio composition or current exposure levels, please consult the Credit Risk team or refer to the Pattern Detection tab.",
    sources: [
      { label: "FFIEC Instructions", reference: "Schedule RC-R Part II, Risk-Weight Categories" },
      { label: "OCC Bulletin 2015-16", reference: "HVCRE Definition" },
    ],
  },
  {
    id: "q-ri-1",
    schedule: "RI",
    question: "What are the reporting requirements for provision for credit losses under CECL?",
    answer: "Schedule RI requires reporting of provision for credit losses in accordance with ASC 326 (CECL methodology). Key filing instructions:\n\n1. Report the total provision for credit losses on line 4, which includes:\n   - Provision for loan and lease losses\n   - Provision for credit losses on HTM debt securities\n   - Provision for credit losses on off-balance-sheet credit exposures\n\n2. The provision must reflect the change in the allowance for credit losses (ACL) during the reporting period, adjusted for net charge-offs.\n\n3. CECL-specific requirements:\n   - Expected credit losses must be estimated over the contractual life of the asset\n   - Reasonable and supportable forecasts must be incorporated\n   - Historical loss experience must be adjusted for current conditions\n\n4. Negative provisions (releases) should be reported as negative values when the ACL decreases.\n\nCommon filing issues:\n- Misclassifying provision components between loan losses and off-balance-sheet exposure losses\n- Inconsistency between the provision amount on RI and the change in ACL on Schedule RC\n- For guidance on how your current provision levels compare to thresholds, see the Pattern Detection tab.",
    sources: [
      { label: "FFIEC Instructions", reference: "Schedule RI, Line 4" },
      { label: "ASC 326", reference: "CECL Measurement" },
    ],
  },
  {
    id: "q-rc-n-1",
    schedule: "RC-N",
    question: "When should a loan be placed on nonaccrual status per filing instructions?",
    answer: "Per FFIEC Call Report instructions for Schedule RC-N, a loan must be placed on nonaccrual status when either of the following conditions is met:\n\n1. The loan is maintained on a cash basis due to deterioration in the borrower's financial condition\n2. Payment in full of principal or interest is not expected\n3. Principal or interest has been in default for 90 days or more, unless the loan is both well-secured AND in the process of collection\n\nReporting requirements:\n- Report nonaccrual loans by loan category, consistent with Schedule RC-C classifications\n- Loans past due 30-89 days are reported separately from 90+ days past due\n- Troubled Debt Restructurings (TDRs) in compliance with their modified terms may be reported as current, but must still be identified as TDRs in the applicable memoranda items\n\nThis schedule is flagged for human review because:\n- \"Well-secured and in process of collection\" involves judgment-based assessments\n- TDR identification requires evaluating whether a concession was granted to a borrower experiencing financial difficulty\n- Nonaccrual reversal decisions (return to accrual status) require documented evidence of sustained performance\n\nFor questions about specific loan classifications or current delinquency trends, please consult the Credit Risk team or refer to the Report Review tab.",
    sources: [
      { label: "FFIEC Instructions", reference: "Schedule RC-N, General Instructions" },
      { label: "ASC 310-10", reference: "Receivables — Nonaccrual Guidance" },
    ],
  },
  {
    id: "q-rc-l-1",
    schedule: "RC-L",
    question: "How should derivative fair values be reported under netting agreements?",
    answer: "Schedule RC-L requires reporting of derivative contracts and off-balance-sheet items. Key filing instructions for derivatives:\n\n1. Report notional amounts by derivative type:\n   - Interest rate contracts (swaps, futures, forwards, options)\n   - Foreign exchange contracts\n   - Credit derivatives (CDS, total return swaps)\n   - Equity and commodity contracts\n\n2. Fair value reporting:\n   - Report gross positive fair values (replacement cost) and gross negative fair values separately\n   - Netting is permitted ONLY for contracts covered by qualifying bilateral netting agreements under ASC 815-10-45\n   - Cash collateral received/posted may be netted against fair values if the agreement meets the criteria in ASC 210-20\n\n3. Classification requirements:\n   - Separate trading derivatives from hedging derivatives\n   - Hedging derivatives must have documented hedge designation and effectiveness testing under ASC 815-20 or ASC 815-25\n\nThis schedule is flagged for human review because:\n- Master netting agreement qualification requires legal analysis\n- Level 2 and Level 3 fair value inputs require valuation expertise\n- Hedge effectiveness testing involves quantitative assessment that impacts balance sheet presentation\n\nFor questions about specific derivative positions or valuations, please consult the Treasury/Trading desk.",
    sources: [
      { label: "FFIEC Instructions", reference: "Schedule RC-L, Derivatives" },
      { label: "ASC 815", reference: "Derivatives and Hedging" },
    ],
  },
  {
    id: "q-rc-c-1",
    schedule: "RC-C",
    question: "How should loans be classified by category in Schedule RC-C?",
    answer: "Schedule RC-C Part I requires loans and leases to be reported by category. Key classification requirements:\n\n1. Real estate loans (secured by real property):\n   - Construction, land development, and other land loans\n   - Secured by farmland\n   - Secured by 1-4 family residential (first liens vs. junior liens)\n   - Secured by multifamily (5+ units) residential\n   - Secured by nonfarm nonresidential (owner-occupied vs. other)\n\n2. Commercial and industrial (C&I) loans:\n   - Reported net of unearned income\n   - Include loans to non-depository financial institutions if for commercial purposes\n\n3. Consumer loans:\n   - Credit cards\n   - Other revolving credit plans\n   - Automobile loans\n   - Other consumer loans\n\n4. Reporting basis:\n   - Report gross loans before deducting the allowance for credit losses\n   - Unearned income should be netted against the applicable loan category\n   - Loans held for sale should be reported at the lower of cost or fair value\n\nTotal loans on RC-C must reconcile to Schedule RC line 4.a. Any discrepancy will trigger an FFIEC edit check.",
    sources: [
      { label: "FFIEC Instructions", reference: "Schedule RC-C Part I" },
      { label: "FFIEC Glossary", reference: "Loan Classification Definitions" },
    ],
  },
  {
    id: "q-rc-e-1",
    schedule: "RC-E",
    question: "What are the deposit classification requirements for Schedule RC-E?",
    answer: "Schedule RC-E requires deposits to be classified by type and account characteristics:\n\n1. Transaction accounts (demand deposits):\n   - Noninterest-bearing demand deposits\n   - Interest-bearing checking (NOW accounts, ATS accounts)\n   - Money market deposit accounts (MMDAs) with transaction features\n\n2. Non-transaction accounts:\n   - Savings deposits (including MMDAs classified as savings)\n   - Time deposits by remaining maturity:\n     • Less than $250,000: report by maturity bucket (≤3 months, 3-12 months, 1-3 years, >3 years)\n     • $250,000 or more: report separately by maturity bucket\n\n3. Key filing requirements:\n   - Total deposits on RC-E must reconcile to Schedule RC line 13\n   - Brokered deposits must be reported in the memoranda section\n   - Reciprocal deposits (under the FDIC reciprocal deposit exception) must be identified separately\n   - Estimated amount of uninsured deposits must be reported per FDIC requirements\n\n4. Common pitfalls:\n   - Misclassifying MMDAs between transaction and non-transaction categories\n   - Failing to update the $250,000 threshold breakdowns when FDIC insurance limits change\n   - Not reconciling foreign office deposits for FFIEC 031 filers",
    sources: [
      { label: "FFIEC Instructions", reference: "Schedule RC-E" },
      { label: "FDIC Rules", reference: "12 CFR 370 — Deposit Insurance" },
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
