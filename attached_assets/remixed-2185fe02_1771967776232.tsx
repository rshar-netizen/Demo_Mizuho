import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, Cell
} from "recharts";

// ─── MIZUHO BRAND TOKENS ─────────────────────────────────────────────────────
const brand = {
  navy:        "#183181",
  navyDeep:    "#0f1f55",
  navyMid:     "#1e3d8f",
  navyLight:   "#2a4fad",
  navyTint:    "#e8edf7",
  navyTintSoft:"#f0f4fa",
  red:         "#ED1A3A",
  redLight:    "#f9e5e9",
  white:       "#ffffff",
  offWhite:    "#f7f8fb",
  border:      "#dce3f0",
  borderLight: "#edf0f8",
  textDark:    "#0d1635",
  textMid:     "#3d4d72",
  textLight:   "#6b7fa6",
  textMuted:   "#9aaac8",
  green:       "#0d7c4d",
  greenLight:  "#e6f5ef",
  amber:       "#b55a00",
  amberLight:  "#fdf0e3",
  tableAlt:    "#f9fafd",
};

// ─── SYNTHETIC DATA ───────────────────────────────────────────────────────────
const trendData = [
  { q:"Q1 2022", cet1:12.1, rwa:148200, deposits:89400, tier1Lev:7.2, lcr:118 },
  { q:"Q2 2022", cet1:12.4, rwa:151300, deposits:91200, tier1Lev:7.4, lcr:121 },
  { q:"Q3 2022", cet1:12.2, rwa:155600, deposits:92800, tier1Lev:7.3, lcr:119 },
  { q:"Q4 2022", cet1:12.8, rwa:153100, deposits:94100, tier1Lev:7.6, lcr:124 },
  { q:"Q1 2023", cet1:13.1, rwa:149800, deposits:91300, tier1Lev:7.8, lcr:127 },
  { q:"Q2 2023", cet1:13.4, rwa:152400, deposits:93700, tier1Lev:7.9, lcr:129 },
  { q:"Q3 2023", cet1:13.2, rwa:157800, deposits:96200, tier1Lev:7.7, lcr:126 },
  { q:"Q4 2023", cet1:13.7, rwa:155200, deposits:98400, tier1Lev:8.1, lcr:131 },
  { q:"Q1 2024", cet1:13.9, rwa:153600, deposits:97100, tier1Lev:8.2, lcr:133 },
  { q:"Q2 2024", cet1:14.1, rwa:156900, deposits:99800, tier1Lev:8.3, lcr:135 },
  { q:"Q3 2024", cet1:14.3, rwa:161200, deposits:102400, tier1Lev:8.4, lcr:137 },
  { q:"Q4 2024", cet1:14.6, rwa:158700, deposits:104200, tier1Lev:8.6, lcr:139 },
];

const anomalyData = [
  { period:"Q1 2023", cre:18200, residential:24100, commercial:31400, consumer:12800 },
  { period:"Q2 2023", cre:18900, residential:24800, commercial:32100, consumer:13100 },
  { period:"Q3 2023", cre:19200, residential:25300, commercial:32800, consumer:13400 },
  { period:"Q4 2023", cre:19800, residential:25700, commercial:33200, consumer:13700 },
  { period:"Q1 2024", cre:20100, residential:26200, commercial:33800, consumer:14100 },
  { period:"Q2 2024", cre:20400, residential:26800, commercial:34100, consumer:14300 },
  { period:"Q3 2024", cre:20900, residential:27200, commercial:34600, consumer:14600 },
  { period:"Q4 2024", cre:28700, residential:27800, commercial:35100, consumer:14900 },
];

const varianceData = [
  { schedule:"HC — Balance Sheet",       q3:892400,  q4:921300,  variance:28900,  pct:3.24,  driver:"Loan growth and securities",            flag:false },
  { schedule:"HC-R — Tier 1 Capital",    q3:74200,   q4:79100,   variance:4900,   pct:6.60,  driver:"Retained earnings, reduced RWA",        flag:false },
  { schedule:"HC-R — RWA",               q3:161200,  q4:158700,  variance:-2500,  pct:-1.55, driver:"CRE portfolio optimization",            flag:false },
  { schedule:"HC-C — Loans & Leases",    q3:412800,  q4:431200,  variance:18400,  pct:4.46,  driver:"C&I and CRE originations",              flag:true  },
  { schedule:"HC-B — Securities",        q3:198600,  q4:201400,  variance:2800,   pct:1.41,  driver:"AFS portfolio increase",                flag:false },
  { schedule:"HC-E — Deposits",          q3:324100,  q4:338900,  variance:14800,  pct:4.57,  driver:"Retail deposit inflows",                flag:true  },
  { schedule:"HC-M — Memoranda",         q3:31200,   q4:29800,   variance:-1400,  pct:-4.49, driver:"Reduced off-balance sheet items",       flag:false },
  { schedule:"HC-N — Past Due",          q3:4820,    q4:5190,    variance:370,    pct:7.68,  driver:"Aging concentration in CRE portfolio",  flag:true  },
];

const reportLines = [
  { line:"HC-1",  label:"Cash & balances due from depository institutions", current:18420,  prior:17890,  src:"GL-0010–0012", notes:"Federal Reserve account and vault cash" },
  { line:"HC-2a", label:"Interest-bearing deposits in U.S. banks",          current:8240,   prior:7610,   src:"GL-0020–0025", notes:"Nostro and correspondent accounts" },
  { line:"HC-4a", label:"U.S. Treasury and agency securities (AFS)",        current:44100,  prior:42800,  src:"SEC-MASTER-T",  notes:"Available-for-sale portfolio" },
  { line:"HC-4b", label:"Mortgage-backed securities (AFS/HTM)",             current:38700,  prior:39200,  src:"SEC-MASTER-A",  notes:"Includes agency MBS" },
  { line:"HC-7",  label:"Loans and leases held for investment, net of ALLL",current:419800, prior:401200, src:"LOAN-TAPE-01",  notes:"Net of allowance $4.2B" },
  { line:"HC-9",  label:"Premises and fixed assets",                        current:6420,   prior:6180,   src:"GL-4500–4599",  notes:"Includes right-of-use lease assets" },
  { line:"HC-11", label:"Other real estate owned (OREO)",                   current:892,    prior:1104,   src:"OREO-FILE-24",  notes:"Decreased through dispositions" },
  { line:"HC-12", label:"Other assets",                                     current:21480,  prior:19870,  src:"GL-9000–9199",  notes:"Accrued interest receivable, deferred tax" },
  { line:"HC-20", label:"TOTAL ASSETS",                                     current:558052, prior:535854, src:"DERIVED",       notes:"Sum of HC-1 through HC-19" },
  { line:"HC-21", label:"Deposits — domestic offices",                      current:338900, prior:324100, src:"DEP-MASTER-01", notes:"DDA, savings, and time deposits" },
  { line:"HC-22", label:"Federal funds purchased",                          current:12400,  prior:14200,  src:"MM-TRADE-FILE", notes:"Overnight borrowings" },
  { line:"HC-28", label:"TOTAL LIABILITIES",                                current:496800, prior:476300, src:"DERIVED",       notes:"Sum of HC-21 through HC-27" },
  { line:"HC-30", label:"Common equity tier 1 capital",                     current:61252,  prior:59554,  src:"DERIVED",       notes:"CET1 after regulatory deductions" },
];

const dataDictionary = {
  GL: [
    { field:"ACCT_CD",    type:"VARCHAR(10)",   nullable:false, sample:"0010–0012",  desc:"Chart of accounts code — maps to FFIEC account taxonomy" },
    { field:"ENTITY_ID",  type:"VARCHAR(8)",    nullable:false, sample:"MZH-US-01",  desc:"Legal entity identifier — aligned with FR Y-9C consolidation scope" },
    { field:"PERIOD_DT",  type:"DATE",          nullable:false, sample:"2024-12-31", desc:"Reporting period end date" },
    { field:"DEBIT_AMT",  type:"DECIMAL(18,3)", nullable:true,  sample:"48,291.500", desc:"Debit balance in USD thousands" },
    { field:"CREDIT_AMT", type:"DECIMAL(18,3)", nullable:true,  sample:"0.000",      desc:"Credit balance in USD thousands" },
    { field:"CURRENCY",   type:"CHAR(3)",        nullable:false, sample:"USD",        desc:"ISO 4217 currency code; non-USD translated at period-end spot rate" },
    { field:"ELIM_FLAG",  type:"CHAR(1)",        nullable:false, sample:"N",          desc:"Y = intercompany elimination required per Schedule HC consolidation rules" },
  ],
  LOAN: [
    { field:"LOAN_ID",      type:"VARCHAR(16)",   nullable:false, sample:"LN-2024-009821",        desc:"Unique loan identifier; join key to GL via mapping table" },
    { field:"LOAN_CLASS",   type:"VARCHAR(4)",    nullable:false, sample:"CRE",                   desc:"FFIEC loan class: CRE, C&I, RES, CON, OTH" },
    { field:"ORIG_DT",      type:"DATE",          nullable:false, sample:"2022-03-15",             desc:"Origination date — used for vintage analysis" },
    { field:"OUTST_BAL",    type:"DECIMAL(18,3)", nullable:false, sample:"4,250.000",              desc:"Outstanding principal balance at period end" },
    { field:"RISK_RATING",  type:"VARCHAR(2)",    nullable:false, sample:"3A",                     desc:"Internal risk rating; maps to Pass / Watch / Substandard / Doubtful / Loss" },
    { field:"PAST_DUE_DYS", type:"INTEGER",       nullable:true,  sample:"0",                      desc:"Days past due; triggers HC-N classification at 30 and 90 days" },
    { field:"COLLATERAL",   type:"VARCHAR(20)",   nullable:true,  sample:"COMMERCIAL REAL ESTATE", desc:"Collateral type per current appraisal" },
  ],
  SEC: [
    { field:"CUSIP",         type:"CHAR(9)",        nullable:false, sample:"912828YH7", desc:"CUSIP identifier — primary key; links to pricing source" },
    { field:"SEC_TYPE",      type:"VARCHAR(6)",     nullable:false, sample:"UST",       desc:"Security type: UST, AGY, MBS, CORP, MUNI" },
    { field:"CLASS_AFS_HTM", type:"CHAR(3)",        nullable:false, sample:"AFS",       desc:"AFS or HTM — governs Schedule HC-B classification" },
    { field:"BOOK_VALUE",    type:"DECIMAL(18,3)",  nullable:false, sample:"9,842.500", desc:"Amortized cost basis in USD thousands" },
    { field:"FAIR_VALUE",    type:"DECIMAL(18,3)",  nullable:false, sample:"9,614.200", desc:"Mark-to-market fair value; OCI impact flows to HC-R" },
    { field:"DURATION",      type:"DECIMAL(6,2)",   nullable:true,  sample:"4.82",      desc:"Modified duration — interest rate risk analytics" },
  ],
};

const joinMappings = [
  { from:"GL.ACCT_CD",    to:"ACCT_MAP.GL_ACCT_CD",    type:"INNER", purpose:"Map GL accounts to FR Y-9C schedule and line items",  confidence:"High"   },
  { from:"GL.ENTITY_ID",  to:"ENTITY_REF.ENTITY_ID",   type:"INNER", purpose:"Apply consolidation scope and elimination rules",      confidence:"High"   },
  { from:"LOAN.LOAN_ID",  to:"GL_LOAN_BRIDGE.LOAN_ID", type:"LEFT",  purpose:"Link loan detail records to GL booking entries",       confidence:"Medium" },
  { from:"SEC.CUSIP",     to:"PRICING.CUSIP",           type:"LEFT",  purpose:"Attach period-end fair value marks from pricing feed", confidence:"High"   },
  { from:"SEC.CUSIP",     to:"SEC_CLASS.CUSIP",         type:"INNER", purpose:"AFS/HTM classification for OCI calculation",          confidence:"High"   },
];

const regulatoryQueries = [
  {
    q: "What are the key changes in FR Y-9C Schedule HC-R for the current reporting cycle?",
    a: `FR Y-9C Schedule HC-R — Current Cycle Key Changes
(Synthetic — based on Basel III Endgame and FFIEC revision patterns)

1. GSIB Surcharge Integration
Institutions with $100B+ in consolidated assets are required to report GSIB score components in Part II, Section C. Applicability under Category II/III thresholds per the Federal Reserve's tailoring rules should be confirmed.

2. Standardized Approach for Operational Risk (SA-OR)
The SA-OR replaces the Advanced Measurement Approach (AMA) effective Q1 2024. Business Indicator Components (BIC) must be mapped from internal P&L categories to the three regulatory buckets: Services, Financial, and Interest/Leasing.

3. CVA Capital Requirement (SA-CVA)
The Standardized Approach for CVA risk replaces the legacy Current Exposure Method (CEM) for counterparty credit risk. Updated Exposure at Default (EAD) inputs are required from the Front Office for all over-the-counter derivatives books.

4. Output Floor (85%)
Under Basel III Endgame proposals, internal models-based RWA cannot fall below 85% of the Standardized Approach floor. Coordinate with Risk to assess whether upward RWA adjustment is required.

Cross-Check Note: HC-R changes cascade to Schedule HC (equity section) and HC-M (off-balance sheet). Reconciliation between all three schedules must be refreshed following any revision.`,
  },
  {
    q: "What is the threshold for reporting intercompany eliminations in Schedule HC?",
    a: `Intercompany Eliminations — Schedule HC General Instructions
(Synthetic — based on FR Y-9C General Instructions)

Consolidation Requirement
Full consolidation is required for all majority-owned subsidiaries and variable interest entities (VIEs) where the BHC is the primary beneficiary under ASC 810. There is no de minimis threshold — all intercompany balances must be eliminated in full.

Elimination Scope
• Intercompany loans, deposits, and receivables/payables: fully eliminated on Schedule HC
• Intercompany income and expense (interest, fees, dividends): eliminated on Schedule HC-I
• Investment in subsidiary: eliminated against subsidiary equity on Schedule HC

VIE Disclosure Trigger
Where a consolidated VIE has total assets exceeding $10M or represents more than 5% of BHC consolidated assets, separate VIE disclosures are required in Schedule HC-M, Memoranda (lines M.1 through M.5).

Operational Note
Coordination with MUS Securities Corp. and Mizuho Capital Markets LLC is required. Intercompany elimination entries must be posted by Day 3 of close to meet the FR Y-9C 40-day filing deadline with the Federal Reserve.`,
  },
  {
    q: "Explain the distinction between Schedule HC-R Part I and Part II.",
    a: `Schedule HC-R Part I vs. Part II — Comparative Overview
(Synthetic)

Part I — Capital Adequacy Ratios
Part I contains the filed capital ratios: CET1, Tier 1, Total Capital, and Tier 1 Leverage Ratio. These are the headline figures reviewed by regulators, management, and investors. This section answers the question: "Are we adequately capitalized?"

Part II — Risk-Weighted Asset Calculation
Part II provides the complete build-up of risk-weighted assets (RWA) across credit risk, market risk, and operational risk sub-categories. It also captures all regulatory capital deductions (goodwill, intangibles, deferred tax assets, etc.) that reduce the numerator used in Part I ratios. Federal Reserve examiners focus primarily on this section during targeted reviews.

Relationship Between the Two
The Part I numerator (capital) and denominator (RWA) are both derived from Part II detail. Any unexplained discrepancy between the two parts is a common examiner finding.

Frequently Observed Control Gap
Institutions sometimes report gross RWA in Part II without applying eligible credit risk mitigation (CRM) or eligible financial collateral netting. The HC-R Part II RWA denominator must tie precisely to the ratios shown in Part I — this cross-check is performed as a first step in any examination.`,
  },
];

// ─── CSS ──────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@500;600&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background:${brand.offWhite}; color:${brand.textDark}; font-family:'Inter',sans-serif; font-size:13px; -webkit-font-smoothing:antialiased; }
  ::-webkit-scrollbar { width:4px; height:4px; }
  ::-webkit-scrollbar-track { background:${brand.borderLight}; }
  ::-webkit-scrollbar-thumb { background:${brand.navyLight}; border-radius:2px; }

  .app { min-height:100vh; display:flex; flex-direction:column; }

  .header { background:${brand.navy}; padding:0 40px; position:sticky; top:0; z-index:200; box-shadow:0 2px 12px rgba(24,49,129,0.25); }
  .header-inner { display:flex; align-items:center; height:58px; max-width:1560px; margin:0 auto; gap:20px; }
  .logo-block { display:flex; flex-direction:column; gap:3px; padding-right:20px; border-right:1px solid rgba(255,255,255,0.18); }
  .logo-word { font-family:'EB Garamond',serif; font-size:21px; font-weight:600; color:#fff; letter-spacing:0.06em; line-height:1; }
  .logo-arc { height:3px; background:linear-gradient(90deg,${brand.red} 0%,rgba(237,26,58,0.15) 100%); border-radius:2px; }
  .header-sub { font-size:12px; color:rgba(255,255,255,0.6); letter-spacing:0.02em; }
  .hdr-right { margin-left:auto; display:flex; align-items:center; gap:8px; }

  .badge { display:inline-flex; align-items:center; padding:3px 8px; border-radius:3px; font-size:10px; font-family:'JetBrains Mono',monospace; font-weight:500; letter-spacing:0.06em; text-transform:uppercase; white-space:nowrap; }
  .badge-hdr    { background:rgba(255,255,255,0.1);  color:rgba(255,255,255,0.8); border:1px solid rgba(255,255,255,0.15); }
  .badge-syn    { background:${brand.navyTint};       color:${brand.navyMid};      border:1px solid ${brand.border}; }
  .badge-pub    { background:${brand.navyTint};       color:${brand.navyDeep};     border:1px solid ${brand.border}; }
  .badge-flag   { background:${brand.amberLight};     color:${brand.amber};        border:1px solid rgba(181,90,0,0.2); }
  .badge-ano    { background:${brand.redLight};       color:${brand.red};          border:1px solid rgba(237,26,58,0.2); }
  .badge-pass   { background:${brand.greenLight};     color:${brand.green};        border:1px solid rgba(13,124,77,0.2); }

  .subnav { background:${brand.white}; border-bottom:1px solid ${brand.border}; padding:0 40px; position:sticky; top:58px; z-index:100; box-shadow:0 1px 4px rgba(24,49,129,0.06); }
  .subnav-inner { display:flex; align-items:stretch; max-width:1560px; margin:0 auto; }
  .ntab { display:flex; align-items:center; gap:8px; padding:12px 18px; cursor:pointer; border:none; background:none; color:${brand.textLight}; font-family:'Inter',sans-serif; font-size:12px; font-weight:500; white-space:nowrap; border-bottom:2px solid transparent; transition:all 0.15s; }
  .ntab:hover { color:${brand.navy}; }
  .ntab.active { color:${brand.navy}; border-bottom-color:${brand.red}; font-weight:600; }
  .ntab-num { width:18px; height:18px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; font-family:'JetBrains Mono',monospace; background:${brand.navyTint}; color:${brand.navyMid}; flex-shrink:0; transition:all 0.15s; }
  .ntab.active .ntab-num { background:${brand.red}; color:${brand.white}; }
  .nav-ctrl { margin-left:auto; display:flex; align-items:center; gap:8px; }

  .main { flex:1; max-width:1560px; margin:0 auto; padding:28px 40px; width:100%; }

  .eyebrow { font-size:10px; font-family:'JetBrains Mono',monospace; font-weight:500; color:${brand.red}; letter-spacing:0.12em; text-transform:uppercase; margin-bottom:5px; }
  .mod-title { font-family:'EB Garamond',serif; font-size:27px; font-weight:600; color:${brand.navyDeep}; margin-bottom:5px; line-height:1.2; }
  .mod-desc { color:${brand.textMid}; font-size:12.5px; line-height:1.65; max-width:760px; }

  .divider { height:1px; background:${brand.border}; margin:22px 0; }
  .g2 { display:grid; grid-template-columns:1fr 1fr; gap:18px; }
  .g4 { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }

  .card { background:${brand.white}; border:1px solid ${brand.border}; border-radius:6px; padding:18px; }
  .card-sm { padding:14px; }
  .card-title { font-size:10.5px; font-weight:600; letter-spacing:0.07em; text-transform:uppercase; color:${brand.textLight}; margin-bottom:12px; display:flex; align-items:center; gap:8px; flex-wrap:wrap; }

  .kv { font-family:'JetBrains Mono',monospace; font-size:24px; font-weight:400; color:${brand.navyDeep}; line-height:1; margin-bottom:4px; }
  .kl { font-size:10.5px; font-weight:600; letter-spacing:0.05em; text-transform:uppercase; color:${brand.textLight}; }
  .ks { font-size:11px; color:${brand.textMuted}; margin-top:3px; }
  .kc { font-size:11.5px; font-family:'JetBrains Mono',monospace; margin-top:5px; }
  .up { color:${brand.green}; } .dn { color:${brand.red}; }

  .tw { overflow-x:auto; }
  table { width:100%; border-collapse:collapse; }
  th { text-align:left; padding:8px 13px; background:${brand.navyTint}; color:${brand.navyDeep}; font-weight:600; font-size:10px; letter-spacing:0.07em; text-transform:uppercase; border-bottom:1px solid ${brand.border}; white-space:nowrap; }
  td { padding:8px 13px; border-bottom:1px solid ${brand.borderLight}; font-size:12px; vertical-align:middle; color:${brand.textDark}; }
  tr:last-child td { border-bottom:none; }
  tr:nth-child(even) td { background:${brand.tableAlt}; }
  tr.fr { background:none; } tr.fr td { background:${brand.amberLight}; }
  tr.dr { cursor:pointer; } tr.dr:hover td { background:${brand.navyTintSoft}; }
  tr.ex td { background:${brand.navyTintSoft} !important; border-bottom:2px solid ${brand.navy}; }
  tr.tot td { background:${brand.navyTint} !important; font-weight:600; color:${brand.navyDeep}; }

  .mono { font-family:'JetBrains Mono',monospace; }

  .qpanel { background:${brand.white}; border:1px solid ${brand.border}; border-radius:6px; overflow:hidden; }
  .qhdr { padding:11px 16px; background:${brand.navyTint}; border-bottom:1px solid ${brand.border}; display:flex; align-items:center; gap:8px; }
  .qhdr-label { font-size:11px; font-weight:600; color:${brand.navyDeep}; font-family:'Inter',sans-serif; letter-spacing:0.02em; }
  .qbtn { padding:9px 13px; background:${brand.white}; border:1px solid ${brand.border}; border-radius:4px; color:${brand.textDark}; font-family:'Inter',sans-serif; font-size:12px; cursor:pointer; text-align:left; transition:all 0.15s; width:100%; display:flex; align-items:flex-start; gap:7px; line-height:1.5; }
  .qbtn:hover { background:${brand.navyTintSoft}; border-color:${brand.navy}; color:${brand.navy}; }
  .qbtn.sel { background:${brand.navyTint}; border-color:${brand.navy}; color:${brand.navyDeep}; font-weight:500; }
  .apanel { padding:18px; border-top:2px solid ${brand.navy}; }
  .alabel { font-size:10px; font-family:'JetBrains Mono',monospace; font-weight:500; color:${brand.navy}; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:10px; display:flex; align-items:center; gap:8px; }
  .alabel::after { content:''; flex:1; height:1px; background:${brand.border}; }
  .atext { font-size:12.5px; line-height:1.8; color:${brand.textDark}; white-space:pre-line; }

  .insight { background:${brand.navyTint}; border-left:3px solid ${brand.navy}; border-radius:0 4px 4px 0; padding:13px 15px; margin-top:14px; }
  .ilabel { font-size:10px; font-family:'JetBrains Mono',monospace; color:${brand.navy}; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:5px; font-weight:500; }
  .itext { font-size:12.5px; line-height:1.68; color:${brand.textMid}; }
  .insight-r { background:${brand.redLight}; border-left-color:${brand.red}; }
  .insight-r .ilabel { color:${brand.red}; }
  .insight-r .itext { color:${brand.textDark}; }

  .exp-panel { padding:14px; background:${brand.navyTintSoft}; border:1px solid ${brand.border}; border-radius:4px; margin:6px 0; }
  .exp-label { font-size:9.5px; font-family:'JetBrains Mono',monospace; font-weight:500; color:${brand.navy}; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:8px; }
  .code { background:${brand.navyDeep}; color:#a8c4ff; font-family:'JetBrains Mono',monospace; font-size:10.5px; padding:10px 12px; border-radius:4px; line-height:1.7; }

  .pills { display:flex; gap:5px; flex-wrap:wrap; }
  .pill { padding:5px 11px; border-radius:3px; font-size:11px; cursor:pointer; border:1px solid ${brand.border}; background:${brand.white}; color:${brand.textMid}; font-family:'Inter',sans-serif; font-weight:500; transition:all 0.15s; }
  .pill:hover { border-color:${brand.navy}; color:${brand.navy}; }
  .pill.on { background:${brand.navy}; color:${brand.white}; border-color:${brand.navy}; }

  .cc { background:${brand.white}; border:1px solid ${brand.border}; border-left:3px solid ${brand.navy}; border-radius:0 4px 4px 0; padding:13px 16px; margin-bottom:10px; }
  .cq { font-family:'JetBrains Mono',monospace; font-size:10.5px; color:${brand.navy}; font-weight:500; margin-bottom:4px; }
  .ct { font-size:12px; color:${brand.textMid}; line-height:1.65; }

  .sn { background:${brand.white}; border:1px solid ${brand.border}; border-radius:6px; padding:13px 15px; margin-bottom:9px; }
  .sn-title { font-family:'JetBrains Mono',monospace; font-size:10.5px; color:${brand.navyDeep}; font-weight:500; margin-bottom:9px; display:flex; align-items:center; gap:7px; }
  .dot { width:7px; height:7px; border-radius:50%; display:inline-block; flex-shrink:0; }
  .pt { height:3px; background:${brand.border}; border-radius:2px; margin-top:8px; overflow:hidden; }
  .pf { height:100%; background:${brand.navy}; border-radius:2px; }

  .btn { padding:7px 14px; border-radius:3px; font-size:12px; cursor:pointer; font-family:'Inter',sans-serif; font-weight:500; transition:all 0.15s; white-space:nowrap; }
  .btn-n { background:${brand.navy}; color:#fff; border:1px solid ${brand.navy}; }
  .btn-n:hover { background:${brand.navyDeep}; }
  .btn-o { background:#fff; color:${brand.navy}; border:1px solid ${brand.navy}; }
  .btn-o:hover { background:${brand.navyTint}; }
  .btn-g { background:#fff; color:${brand.textMid}; border:1px solid ${brand.border}; }
  .btn-g:hover { border-color:${brand.navy}; color:${brand.navy}; }
  .btn-a { background:${brand.green}; color:#fff; border:1px solid ${brand.green}; }

  .acno { background:${brand.white}; border:1px solid ${brand.border}; border-radius:6px; overflow:hidden; margin-bottom:10px; }
  .acno-hdr { padding:8px 13px; display:flex; align-items:center; gap:9px; border-bottom:1px solid ${brand.borderLight}; }
  .acno-body { padding:11px 13px; }

  .footer { border-top:1px solid ${brand.border}; padding:13px 40px; background:${brand.white}; display:flex; justify-content:space-between; align-items:center; }
  .ft { font-size:10.5px; color:${brand.textMuted}; font-family:'JetBrains Mono',monospace; }

  .cov { display:inline-flex; align-items:center; gap:6px; padding:5px 10px; background:${brand.white}; border:1px solid ${brand.border}; border-radius:4px; font-size:11px; margin:3px; }

  .ai { animation:fu 0.22s ease-out; }
  @keyframes fu { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }

  @media(max-width:960px){.g2,.g4{grid-template-columns:1fr}.main{padding:14px 18px}.header,.subnav,.footer{padding-left:18px;padding-right:18px}}
`;

// ─── TOOLTIP ─────────────────────────────────────────────────────────────────
const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: brand.white, border: `1px solid ${brand.border}`, borderRadius: 4, padding: "9px 13px", fontSize: 11, boxShadow: "0 4px 16px rgba(24,49,129,0.1)" }}>
      <div style={{ color: brand.textMid, marginBottom: 5, fontFamily: "JetBrains Mono", fontWeight: 500 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || brand.navy, fontFamily: "JetBrains Mono", marginBottom: 2 }}>
          {p.name}: {typeof p.value === "number" && p.value > 1000 ? p.value.toLocaleString() : p.value}
        </div>
      ))}
    </div>
  );
};

// ─── MODULE 1 ─────────────────────────────────────────────────────────────────
function M1() {
  const [sel, setSel] = useState(0);
  const q = regulatoryQueries[sel];
  return (
    <div className="ai">
      <div style={{ marginBottom: 22 }}>
        <div className="eyebrow">Act I of VI</div>
        <div className="mod-title">Reviewing Regulatory Instructions</div>
        <div className="mod-desc">AI-assisted interpretation of FR Y-9C reporting requirements. Regulatory instructions are ingested and made interactively queryable, reducing reliance on manual review of primary source documentation.</div>
      </div>
      <div className="g4" style={{ marginBottom: 18 }}>
        {[
          { l:"Instruction Pages Indexed",    v:"312",   s:"FR Y-9C 2024 edition" },
          { l:"Schedules Available",           v:"28",    s:"HC through HC-V" },
          { l:"Average Response Latency",      v:"< 2s",  s:"Per query" },
          { l:"Regulatory Alignment Score",    v:"97.2%", s:"vs. FFIEC primary source" },
        ].map((k,i) => (
          <div key={i} className="card card-sm">
            <div className="kv">{k.v}</div>
            <div className="kl" style={{ marginTop:3 }}>{k.l}</div>
            <div className="ks">{k.s}</div>
          </div>
        ))}
      </div>
      <div className="g2">
        <div className="qpanel">
          <div className="qhdr">
            <span className="qhdr-label">Interactive Query Interface</span>
            <span className="badge badge-syn" style={{ marginLeft:"auto" }}>Synthetic Responses</span>
          </div>
          <div style={{ padding:12, display:"flex", flexDirection:"column", gap:6 }}>
            {regulatoryQueries.map((item, i) => (
              <button key={i} className={`qbtn ${sel===i?"sel":""}`} onClick={() => setSel(i)}>
                <span style={{ color:brand.red, fontSize:12, flexShrink:0, marginTop:1 }}>›</span>
                <span>{item.q}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="qpanel" style={{ display:"flex", flexDirection:"column" }}>
          <div className="qhdr">
            <span className="qhdr-label">AI Response</span>
            <div style={{ marginLeft:"auto", display:"flex", gap:5 }}>
              <span className="badge badge-syn">Synthetic</span>
            </div>
          </div>
          <div className="apanel" style={{ flex:1 }}>
            <div className="alabel">Regulatory Analysis</div>
            <div className="atext">{q.a}</div>
          </div>
          <div style={{ padding:"9px 14px", borderTop:`1px solid ${brand.borderLight}`, display:"flex", gap:5, alignItems:"center", flexWrap:"wrap", background:brand.navyTintSoft }}>
            <span style={{ fontSize:10, color:brand.textLight, fontFamily:"JetBrains Mono,monospace" }}>Source References:</span>
            {["FR Y-9C Instructions 2024","FFIEC Manual §3.2","SR Letter 12-17"].map((s,i) => (
              <span key={i} className="badge badge-pub">{s}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="divider" />
      <div>
        <div className="card-title" style={{ marginBottom:10 }}>Schedule Coverage Map <span className="badge badge-pub">FFIEC FR Y-9C — 2024 Edition</span></div>
        <div>
          {[
            {s:"HC",   n:"Balance Sheet",      st:"Loaded",  c:brand.green},
            {s:"HC-R", n:"Capital Adequacy",   st:"Loaded",  c:brand.green},
            {s:"HC-C", n:"Loans & Leases",     st:"Loaded",  c:brand.green},
            {s:"HC-B", n:"Securities",         st:"Loaded",  c:brand.green},
            {s:"HC-E", n:"Deposits",           st:"Loaded",  c:brand.green},
            {s:"HC-I", n:"Income Statement",   st:"Loaded",  c:brand.green},
            {s:"HC-M", n:"Memoranda",          st:"Loaded",  c:brand.green},
            {s:"HC-N", n:"Past Due & NCA",     st:"Loaded",  c:brand.green},
            {s:"HC-P", n:"MSA & MSR",          st:"Partial", c:brand.amber},
            {s:"HC-Q", n:"Fair Value Option",  st:"Partial", c:brand.amber},
            {s:"HC-S", n:"Securitization",     st:"Pending", c:brand.textMuted},
            {s:"HC-V", n:"Variable Rate Loans",st:"Pending", c:brand.textMuted},
          ].map((x,i) => (
            <span key={i} className="cov">
              <span className="dot" style={{ background:x.c }} />
              <span className="mono" style={{ color:brand.navyDeep, fontSize:11, fontWeight:500 }}>{x.s}</span>
              <span style={{ color:brand.textMid }}>{x.n}</span>
              <span style={{ fontSize:10, color:x.c }}>{x.st}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MODULE 2 ─────────────────────────────────────────────────────────────────
function M2() {
  const [ds, setDs] = useState("GL");
  return (
    <div className="ai">
      <div style={{ marginBottom: 22 }}>
        <div className="eyebrow">Act II of VI</div>
        <div className="mod-title">Data Ingestion, Dictionary & Linkage</div>
        <div className="mod-desc">Multiple source data sets are ingested and automatically profiled. The system generates data dictionaries, proposes join logic, and flags data quality issues prior to report population.</div>
      </div>
      <div className="g4" style={{ marginBottom:18 }}>
        {[
          { l:"Source Files Ingested",   v:"3",      s:"GL, Loan Tape, Securities" },
          { l:"Total Records Processed", v:"2.4M",   s:"Across all source files" },
          { l:"Fields Auto-Mapped",      v:"84%",    s:"16% require manual review" },
          { l:"Data Quality Score",      v:"96.1%",  s:"3.9% of records flagged" },
        ].map(function(k,i) { return (<div key={i} className="card card-sm"><div className="kv">{k.v}</div><div className="kl" style={{marginTop:3}}>{k.l}</div><div className="ks">{k.s}</div></div>); })}
      </div>
      <div className="g2" style={{ marginBottom:18 }}>
        <div>
          <div className="card-title">Source File Summary <span className="badge badge-syn">Synthetic</span></div>
          {[
            { n:"GL_EXTRACT_Q4_2024.csv",    r:"1,284,920", sz:"382 MB", f:7, q:98 },
            { n:"LOAN_TAPE_Q4_2024.csv",     r:"842,114",   sz:"218 MB", f:7, q:96 },
            { n:"SEC_MASTER_Q4_2024.csv",    r:"284,442",   sz:"74 MB",  f:6, q:94 },
          ].map((f,i) => (
            <div key={i} className="sn">
              <div className="sn-title"><span className="dot" style={{background:brand.green}}/>{f.n}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                {[["Rows",f.r],["Size",f.sz],["Fields",f.f]].map(([l,v])=>(
                  <div key={l}><div style={{fontSize:9,color:brand.textMuted,fontFamily:"JetBrains Mono,monospace",letterSpacing:"0.08em",textTransform:"uppercase"}}>{l}</div><div className="mono" style={{fontSize:12,color:brand.navyDeep,marginTop:2}}>{v}</div></div>
                ))}
              </div>
              <div className="pt"><div className="pf" style={{width:`${f.q}%`}}/></div>
              <div style={{fontSize:10,color:brand.textMuted,marginTop:4,fontFamily:"JetBrains Mono,monospace"}}>Quality: {f.q}%</div>
            </div>
          ))}
        </div>
        <div>
          <div className="card-title">Join & Linkage Map <span className="badge badge-syn">Synthetic</span></div>
          <div className="tw">
            <table>
              <thead><tr><th>Source Field</th><th>Target Field</th><th>Join Type</th><th>Confidence</th><th>Purpose</th></tr></thead>
              <tbody>
                {joinMappings.map((j,i)=>(
                  <tr key={i}>
                    <td className="mono" style={{color:brand.navy,fontSize:10}}>{j.from}</td>
                    <td className="mono" style={{color:brand.navyDeep,fontSize:10}}>{j.to}</td>
                    <td><span className="badge" style={{background:j.type==="INNER"?brand.greenLight:brand.amberLight,color:j.type==="INNER"?brand.green:brand.amber,border:`1px solid ${j.type==="INNER"?"rgba(13,124,77,0.2)":"rgba(181,90,0,0.2)"}`}}>{j.type}</span></td>
                    <td style={{color:j.confidence==="High"?brand.green:brand.amber,fontWeight:600,fontSize:11}}>{j.confidence}</td>
                    <td style={{color:brand.textMid,fontSize:11}}>{j.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div className="card-title" style={{marginBottom:0}}>Auto-Generated Data Dictionary <span className="badge badge-syn">Synthetic</span></div>
          <div className="pills">{Object.keys(dataDictionary).map(function(k) { return <button key={k} className={"pill " + (ds===k?"on":"")} onClick={function(){setDs(k);}}>{k} Source</button>; })}</div>
        </div>
        <div className="tw">
          <table>
            <thead><tr><th>Field Name</th><th>Data Type</th><th>Nullable</th><th>Sample Value</th><th>Regulatory Description & Mapping Note</th></tr></thead>
            <tbody>
              {dataDictionary[ds].map((r,i)=>(
                <tr key={i}>
                  <td className="mono" style={{color:brand.navy,fontWeight:500}}>{r.field}</td>
                  <td className="mono" style={{color:brand.textMid,fontSize:11}}>{r.type}</td>
                  <td><span style={{color:r.nullable?brand.amber:brand.green,fontWeight:600,fontSize:11}}>{r.nullable?"Yes":"No"}</span></td>
                  <td className="mono" style={{color:brand.textMid,fontSize:11}}>{r.sample}</td>
                  <td style={{color:brand.textMid}}>{r.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── MODULE 3 ─────────────────────────────────────────────────────────────────
function M3() {
  return (
    <div className="ai">
      <div style={{marginBottom:22}}>
        <div className="eyebrow">Act III of VI</div>
        <div className="mod-title">Pre-Processing Anomaly Detection</div>
        <div className="mod-desc">Eight quarters of source data are analyzed for statistical anomalies, pattern breaks, and data integrity issues before any figures are processed into the regulatory report.</div>
      </div>
      <div className="g4" style={{marginBottom:18}}>
        {[
          {l:"Periods Analyzed",      v:"8",       s:"Q1 2023 – Q4 2024",            r:false},
          {l:"Anomalies Identified",  v:"3",       s:"1 High, 1 Medium, 1 Low",       r:false},
          {l:"CRE Quarter-on-Quarter",v:"+37.1%",  s:"Exceeds 3σ threshold — flagged",r:true},
          {l:"Format & Load Checks",  v:"Pass",    s:"No structural issues detected", r:false},
        ].map((k,i)=>(
          <div key={i} className="card card-sm" style={{borderColor:k.r?"rgba(237,26,58,0.3)":brand.border}}>
            <div className="kv" style={{color:k.r?brand.red:brand.navyDeep}}>{k.v}</div>
            <div className="kl" style={{marginTop:3,color:k.r?brand.red:brand.textLight}}>{k.l}</div>
            <div className="ks">{k.s}</div>
          </div>
        ))}
      </div>
      <div className="g2" style={{marginBottom:18}}>
        <div className="card">
          <div className="card-title">Loan Portfolio Balances by Class — 8-Quarter Trend <span className="badge badge-ano">Anomaly Detected</span></div>
          <div style={{fontSize:11,color:brand.textLight,marginBottom:10}}><span className="badge badge-syn" style={{marginRight:6}}>Synthetic Data</span>USD millions · Q4 2024 CRE spike exceeds 3σ threshold</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={anomalyData} margin={{top:4,right:8,left:4,bottom:4}}>
              <CartesianGrid strokeDasharray="3 3" stroke={brand.borderLight}/>
              <XAxis dataKey="period" tick={{fill:brand.textLight,fontSize:10,fontFamily:"JetBrains Mono,monospace"}} axisLine={{stroke:brand.border}}/>
              <YAxis tick={{fill:brand.textLight,fontSize:10,fontFamily:"JetBrains Mono,monospace"}} axisLine={{stroke:brand.border}} tickFormatter={v=>`$${(v/1000).toFixed(0)}B`}/>
              <Tooltip content={<Tip/>}/>
              <Legend wrapperStyle={{fontSize:11,fontFamily:"Inter,sans-serif"}}/>
              <Bar dataKey="cre"         name="CRE"         fill={brand.red}       opacity={0.85} radius={[2,2,0,0]}/>
              <Bar dataKey="residential" name="Residential" fill={brand.navy}      opacity={0.75} radius={[2,2,0,0]}/>
              <Bar dataKey="commercial"  name="C&I"         fill={brand.navyLight} opacity={0.7}  radius={[2,2,0,0]}/>
              <Bar dataKey="consumer"    name="Consumer"    fill={brand.textMuted} opacity={0.8}  radius={[2,2,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="card-title">CRE Balance — Standard Deviations from Mean <span className="badge badge-syn">Synthetic</span></div>
          <ResponsiveContainer width="100%" height={195}>
            <LineChart data={[{p:"Q1 2023",z:0.1},{p:"Q2 2023",z:0.4},{p:"Q3 2023",z:0.6},{p:"Q4 2023",z:0.8},{p:"Q1 2024",z:0.9},{p:"Q2 2024",z:1.1},{p:"Q3 2024",z:1.3},{p:"Q4 2024",z:4.2}]} margin={{top:4,right:14,left:0,bottom:4}}>
              <CartesianGrid strokeDasharray="3 3" stroke={brand.borderLight}/>
              <XAxis dataKey="p" tick={{fill:brand.textLight,fontSize:9,fontFamily:"JetBrains Mono,monospace"}} axisLine={{stroke:brand.border}}/>
              <YAxis tick={{fill:brand.textLight,fontSize:10}} axisLine={{stroke:brand.border}} domain={[0,5]} tickFormatter={v=>`${v}σ`}/>
              <Tooltip content={<Tip/>}/>
              <ReferenceLine y={3} stroke={brand.red} strokeDasharray="4 4" label={{value:"3σ",fill:brand.red,fontSize:9}}/>
              <ReferenceLine x="Q4 2024" stroke={brand.red} strokeDasharray="4 4" label={{value:"Anomaly", fill:brand.red, fontSize:9}}/>
              <Line type="monotone" dataKey="z" name="Z-Score" stroke={brand.navy} strokeWidth={2} dot={{r:4, fill:brand.navy, stroke:brand.white, strokeWidth:2}}/>
            </LineChart>
          </ResponsiveContainer>
          <div className="insight insight-r">
            <div className="ilabel">Pre-Processing Hold — Q4 2024</div>
            <div className="itext">CRE balance of $28.7B represents a +4.2σ deviation from the 7-quarter mean. Filing should not proceed until root cause is confirmed: (a) portfolio acquisition, (b) source file error, or (c) loan reclassification per updated FFIEC guidance.</div>
          </div>
        </div>
      </div>
      <div>
        <div className="card-title" style={{marginBottom:12}}>Anomaly Detail Log <span className="badge badge-syn">Synthetic</span></div>
        {[
          {id:"ANO-2024-001",sev:"High",  field:"CRE Portfolio Outstanding Balance",period:"Q4 2024",obs:"$28.7B",        exp:"$20.1–$21.5B",       z:"+4.2σ",detail:"CRE outstanding balance increased $7.8B (+37.1%) quarter-over-quarter, exceeding the 3σ statistical threshold. Three scenarios are under investigation: (1) Large portfolio acquisition ($6.2B — pending confirmation); (2) Regional file concatenation error duplicating certain exposures; (3) Reclassification of C&I exposure to CRE per revised FFIEC guidance. Filing is blocked pending resolution."},
          {id:"ANO-2024-002",sev:"Medium",field:"Past Due Loan Count (HC-N)",       period:"Q4 2024",obs:"5,190 loans",  exp:"4,200–4,900 range",  z:"+1.8σ",detail:"30-day past due loan count increased 7.7% quarter-over-quarter. While within the 2σ range, this represents the third consecutive quarter of increase and is concentrated in the CRE book. Does not breach HC-N reporting thresholds, but warrants specific management commentary in the approval memorandum."},
          {id:"ANO-2024-003",sev:"Low",   field:"GL Account Code 9142",             period:"Q4 2024",obs:"$184M — new code",exp:"Absent in prior 7 quarters",z:"N/A",detail:"Account code 9142 appears for the first time in the Q4 2024 GL extract and is absent from the current ACCT_MAP lookup table. The resulting unmapped balance of $184M must be classified to the appropriate FR Y-9C schedule line by the accounting team before data processing proceeds."},
        ].map((a,i)=>(
          <div key={i} className="acno" style={{borderColor:a.sev==="High"?"rgba(237,26,58,0.35)":a.sev==="Medium"?"rgba(181,90,0,0.25)":brand.border}}>
            <div className="acno-hdr" style={{background:a.sev==="High"?brand.redLight:a.sev==="Medium"?brand.amberLight:brand.navyTintSoft}}>
              <span className="badge" style={{background:"none",color:a.sev==="High"?brand.red:a.sev==="Medium"?brand.amber:brand.textMid,border:`1px solid ${a.sev==="High"?brand.red:a.sev==="Medium"?brand.amber:brand.border}`}}>{a.sev} Severity</span>
              <span className="mono" style={{fontSize:10,color:brand.navyDeep,fontWeight:500}}>{a.id}</span>
              <span style={{fontSize:12,color:brand.textDark,fontWeight:500}}>{a.field}</span>
              <span className="mono" style={{marginLeft:"auto",fontSize:10,color:brand.textMid}}>{a.period}</span>
            </div>
            <div className="acno-body">
              <div style={{display:"flex",gap:20,marginBottom:7}}>
                {[["Observed",a.obs,a.sev==="High"?brand.red:brand.amber],["Expected Range",a.exp,brand.textMid],["Z-Score",a.z,brand.navy]].map(([l,v,c])=>(
                  <div key={l}><div style={{fontSize:9,fontFamily:"JetBrains Mono,monospace",color:brand.textMuted,letterSpacing:"0.08em",textTransform:"uppercase"}}>{l}</div><div className="mono" style={{fontSize:12,color:c,fontWeight:500,marginTop:2}}>{v}</div></div>
                ))}
              </div>
              <div style={{fontSize:12,color:brand.textMid,lineHeight:1.7}}>{a.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MODULE 4 ─────────────────────────────────────────────────────────────────
function DrillPanel({ row }) {
  const chg = row.current - row.prior;
  const pct = ((chg / row.prior) * 100).toFixed(1);
  const query = "SELECT SUM(DEBIT_AMT)\nFROM GL_EXTRACT\nWHERE ACCT_CD IN\n  (SELECT GL_ACCT FROM\n   ACCT_MAP WHERE\n   SCHEDULE='" + row.line + "')\nAND PERIOD_DT='2024-12-31'\nAND ELIM_FLAG='N'";
  const checks = [
    ["HC-20 total agrees to sum of component lines","Pass"],
    ["Agrees to prior month close ± period movement","Pass"],
    ["Non-USD balances translated at 12/31/24 spot rate","Pass"],
    ["Intercompany eliminations applied per HC rules","Pass"]
  ];
  return (
    <div className="exp-panel" style={{marginTop:12}}>
      <div className="exp-label">Derivation Trace — {row.line}: {row.label}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
        <div>
          <div style={{fontSize:9,color:brand.textMuted,fontFamily:"JetBrains Mono,monospace",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:5}}>Source Query (Synthetic)</div>
          <div className="code" style={{whiteSpace:"pre"}}>{query}</div>
        </div>
        <div>
          <div style={{fontSize:9,color:brand.textMuted,fontFamily:"JetBrains Mono,monospace",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:5}}>Cross-Checks</div>
          {checks.map(function(item, ci) {
            return (
              <div key={ci} style={{fontSize:11,display:"flex",gap:6,marginBottom:5,alignItems:"flex-start"}}>
                <span style={{color:brand.green,flexShrink:0}}>✓</span>
                <span style={{color:brand.textMid}}>{item[0]}</span>
                <span className="badge badge-pass" style={{marginLeft:"auto",fontSize:9}}>{item[1]}</span>
              </div>
            );
          })}
        </div>
        <div>
          <div style={{fontSize:9,color:brand.textMuted,fontFamily:"JetBrains Mono,monospace",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:5}}>Movement Commentary</div>
          <div style={{fontSize:11.5,color:brand.textMid,lineHeight:1.7}}>
            Quarter-over-quarter change of <span className="mono" style={{color:chg>=0?brand.green:brand.red}}>{pct}%</span> driven by {row.notes}. Source: <span className="mono" style={{color:brand.navy,fontSize:10}}>{row.src}</span>. No manual override applied to this line item.
          </div>
        </div>
      </div>
    </div>
  );
}

function M4() {
  const [sel, setSel] = useState(null);
  const selRow = sel !== null ? reportLines[sel] : null;
  return (
    <div className="ai">
      <div style={{marginBottom:22}}>
        <div className="eyebrow">Act IV of VI</div>
        <div className="mod-title">Interactive Report Review & Drill-Down</div>
        <div className="mod-desc">Each line item in the completed FR Y-9C Schedule HC can be interrogated to trace derivation back to source GL entries. Cross-checks and data lineage are fully auditable.</div>
      </div>
      <div className="g4" style={{marginBottom:18}}>
        {[
          {l:"Total Assets (Q4 2024)",      v:"$558.1B", c:"+$22.2B vs Q3",  u:true},
          {l:"Total Liabilities (Q4 2024)", v:"$496.8B", c:"+$20.5B vs Q3",  u:true},
          {l:"CET1 Ratio",                  v:"14.6%",   c:"+30bps vs Q3",   u:true},
          {l:"Tier 1 Leverage Ratio",       v:"8.6%",    c:"+20bps vs Q3",   u:true},
        ].map(function(k,i) {
          return (
            <div key={i} className="card card-sm">
              <div className="kv" style={{fontSize:21}}>{k.v}</div>
              <div className="kl" style={{marginTop:3}}>{k.l}</div>
              <div className={"kc " + (k.u?"up":"dn")} style={{marginTop:3}}>{k.u?"▲":"▼"} {k.c}</div>
            </div>
          );
        })}
      </div>
      <div style={{marginBottom:10,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
        <div className="card-title" style={{marginBottom:0}}>FR Y-9C Schedule HC — Balance Sheet</div>
        <span className="badge badge-syn">Synthetic Data</span>
        <span className="badge badge-pub">FFIEC FR Y-9C Format</span>
        <span style={{marginLeft:"auto",fontSize:11,color:brand.textLight}}>Select any row to view source derivation and cross-checks</span>
      </div>
      <div className="tw">
        <table>
          <thead>
            <tr><th>Line</th><th>Description</th><th>Q4 2024 ($M)</th><th>Q3 2024 ($M)</th><th>Change ($M)</th><th>Change %</th><th>Source File</th><th>Notes</th></tr>
          </thead>
          <tbody>
            {reportLines.map(function(row, i) {
              const chg = row.current - row.prior;
              const pct = ((chg / row.prior) * 100).toFixed(1);
              const isTotal = row.line === "HC-20" || row.line === "HC-28";
              const isSel = sel === i;
              const baseClass = "dr" + (isTotal ? " tot" : "") + (isSel ? " ex" : "");
              return (
                <tr key={i} className={baseClass} onClick={function(){ setSel(isSel ? null : i); }}>
                  <td className="mono" style={{color:brand.navy,fontWeight:600}}>{row.line}</td>
                  <td style={{minWidth:250}}>
                    <span style={{color:brand.textMuted,marginRight:5,fontSize:10}}>{isSel?"▼":"▶"}</span>
                    {row.label}
                  </td>
                  <td className="mono">{row.current.toLocaleString()}</td>
                  <td className="mono" style={{color:brand.textMid}}>{row.prior.toLocaleString()}</td>
                  <td className="mono" style={{color:chg>=0?brand.green:brand.red}}>{chg>=0?"+":""}{chg.toLocaleString()}</td>
                  <td className="mono" style={{color:chg>=0?brand.green:brand.red}}>{chg>=0?"+":""}{pct}%</td>
                  <td className="mono" style={{color:brand.navyLight,fontSize:10}}>{row.src}</td>
                  <td style={{color:brand.textMid,fontSize:11}}>{row.notes}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {selRow && <DrillPanel key={sel} row={selRow} />}
      <div className="insight" style={{marginTop:14}}>
        <div className="ilabel">Cross-Check Summary — Q4 2024 FR Y-9C</div>
        <div className="itext">All primary cross-checks are passing for the Q4 2024 submission. Total assets ($558.1B) reconcile to the sum of individual asset line items. Total liabilities ($496.8B) plus equity ($61.3B) equal total assets. CET1 ratio denominator (RWA $158.7B) reconciles to Schedule HC-R Part II. One item remains under review: CRE concentration identified in Act III pending management confirmation prior to filing.</div>
      </div>
    </div>
  );
}

// ─── MODULE 5 ─────────────────────────────────────────────────────────────────
function M5() {
  const [editing, setEditing] = useState(false);
  const [memo, setMemo] = useState(`Q4 2024 FR Y-9C — Management Review Memorandum
Period Ended: December 31, 2024
Prepared by: Regulatory Reporting, Mizuho Americas BHC
Status: Pending CFO Approval

────────────────────────────────────────────────
OVERALL ASSESSMENT
────────────────────────────────────────────────
The Company reported a sound Q4 2024 regulatory filing position. Total assets increased 4.1% to $558.1 billion, driven by loan portfolio growth and a stable securities book. Capital ratios improved across all measures, with CET1 advancing to 14.6% — the highest level in 12 quarters.

────────────────────────────────────────────────
KEY MOVEMENTS
────────────────────────────────────────────────
Loans & Leases (HC-C): Increased $18.4B (+4.5%) reflecting solid C&I and CRE origination activity, partially offset by scheduled residential payoffs. The CRE component requires CFO acknowledgment pending resolution of the pre-processing anomaly identified in Act III.

Total Deposits (HC-E): Grew $14.8B (+4.6%), primarily reflecting retail checking and money market inflows. Deposit pricing strategy implemented in Q3 2024 is demonstrating the intended effect.

Past Due Loans (HC-N): Increased $370M (+7.7%), concentrated within the CRE book. Credit quality remains sound with annualized NCO ratio of 18 basis points. This is the third consecutive quarter of increase and warrants specific commentary in the filing narrative.

────────────────────────────────────────────────
CAPITAL POSITION
────────────────────────────────────────────────
CET1 ratio of 14.6% is 464 basis points above the 10.0% well-capitalized threshold and 214 basis points above the applicable Stress Capital Buffer (SCB) requirement. Risk-weighted assets declined $2.5B (-1.6%) reflecting CRE portfolio optimization and model recalibration under SA-OR.

────────────────────────────────────────────────
ITEMS REQUIRING CFO ACKNOWLEDGMENT
────────────────────────────────────────────────
1. CRE portfolio increase of $7.8B QoQ — confirm as acquisition vs. reclassification
2. New GL account code 9142 ($184M) — pending schedule assignment from Accounting
3. HC-N past due trend — confirm management narrative approach for third consecutive quarter increase

────────────────────────────────────────────────
FILING READINESS
────────────────────────────────────────────────
Subject to resolution of the items above, the FR Y-9C filing is otherwise prepared for CFO approval and submission to the Federal Reserve within the 40-day statutory deadline.`);
  return (
    <div className="ai">
      <div style={{marginBottom:22}}>
        <div className="eyebrow">Act V of VI</div>
        <div className="mod-title">Period-over-Period Variance Review & Approval</div>
        <div className="mod-desc">AI-generated variance analysis and management commentary are presented for CFO review. Commentary is editable inline and the workflow concludes with a formal approval action.</div>
      </div>
      <div className="g4" style={{marginBottom:18}}>
        {[
          {l:"Schedules with Variances",   v:"8 of 28",   s:"3 flagged for review"},
          {l:"Largest Quarter-on-Quarter", v:"HC-N +7.7%", s:"Past due loans"},
          {l:"Commentary Status",          v:"Draft",      s:"AI-generated, awaiting review"},
          {l:"Approval Status",            v:"Pending",    s:"CFO sign-off required"},
        ].map(function(k,i){ return (<div key={i} className="card card-sm"><div className="kv" style={{fontSize:20}}>{k.v}</div><div className="kl" style={{marginTop:3}}>{k.l}</div><div className="ks">{k.s}</div></div>); })}
      </div>
      <div className="g2" style={{marginBottom:18}}>
        <div>
          <div className="card-title" style={{marginBottom:10}}>Schedule Variance Summary <span className="badge badge-syn">Synthetic</span></div>
          <div className="tw">
            <table>
              <thead><tr><th>Schedule</th><th>Q3 2024</th><th>Q4 2024</th><th>Chg $M</th><th>Chg %</th><th>Primary Driver</th><th></th></tr></thead>
              <tbody>
                {varianceData.map((r,i)=>(
                  <tr key={i} className={r.flag?"fr":""}>
                    <td style={{fontSize:11.5}}>{r.schedule}</td>
                    <td className="mono">{r.q3.toLocaleString()}</td>
                    <td className="mono" style={{fontWeight:600}}>{r.q4.toLocaleString()}</td>
                    <td className="mono" style={{color:r.variance>=0?brand.green:brand.red}}>{r.variance>=0?"+":""}{r.variance.toLocaleString()}</td>
                    <td className="mono" style={{color:r.variance>=0?brand.green:brand.red}}>{r.pct>=0?"+":""}{r.pct}%</td>
                    <td style={{color:brand.textMid,fontSize:11}}>{r.driver}</td>
                    <td>{r.flag?<span className="badge badge-flag">Review</span>:null}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Variance by Schedule — Q3 to Q4 2024 <span className="badge badge-syn">Synthetic</span></div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={varianceData.map(r=>({name:r.schedule.split("—")[0].trim(),variance:r.variance}))} margin={{top:4,right:8,left:4,bottom:52}}>
              <CartesianGrid strokeDasharray="3 3" stroke={brand.borderLight}/>
              <XAxis dataKey="name" tick={{fill:brand.textLight,fontSize:9,fontFamily:"JetBrains Mono,monospace"}} axisLine={{stroke:brand.border}} angle={-35} textAnchor="end"/>
              <YAxis tick={{fill:brand.textLight,fontSize:10}} axisLine={{stroke:brand.border}} tickFormatter={v=>`${v>0?"+":""}${(v/1000).toFixed(0)}B`}/>
              <Tooltip content={<Tip/>}/>
              <ReferenceLine y={0} stroke={brand.border}/>
              <Bar dataKey="variance" name="Variance $M" radius={[2,2,0,0]} opacity={0.85}>
                {varianceData.map(function(entry, index) {
                  return <Cell key={index} fill={entry.variance >= 0 ? brand.navy : brand.red} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div className="card-title" style={{marginBottom:0}}>Management Review Memorandum <span className="badge badge-syn">AI-Generated Draft</span></div>
          <div style={{display:"flex",gap:7}}>
            <button className={`btn ${editing?"btn-n":"btn-o"}`} onClick={()=>setEditing(!editing)}>{editing?"✓  Save Revisions":"✎  Edit Memorandum"}</button>
            <button className="btn btn-a">✓  CFO Approval</button>
          </div>
        </div>
        {editing
          ? <textarea value={memo} onChange={e=>setMemo(e.target.value)} style={{width:"100%",height:380,background:brand.white,border:`1px solid ${brand.navy}`,borderRadius:4,padding:16,color:brand.textDark,fontFamily:"JetBrains Mono,monospace",fontSize:11.5,lineHeight:1.8,resize:"vertical",outline:"none"}}/>
          : <div className="card" style={{borderColor:brand.border}}><pre style={{fontFamily:"Inter,sans-serif",fontSize:12.5,lineHeight:1.85,color:brand.textDark,whiteSpace:"pre-wrap"}}>{memo}</pre></div>}
      </div>
    </div>
  );
}

// ─── MODULE 6 ─────────────────────────────────────────────────────────────────
function M6() {
  const [m, setM] = useState("cet1");
  const cfg = {
    cet1:     {label:"CET1 Ratio",              color:brand.navy,      fmt:v=>`${v}%`,              narrative:"The CET1 ratio improved 250 basis points over 12 quarters, advancing from 12.1% in Q1 2022 to 14.6% in Q4 2024. The most significant single-quarter improvement occurred in Q1 2024, driven by adoption of the Standardized Approach for Operational Risk (SA-OR), which reduced operational risk RWA by approximately $4 billion. The trajectory reflects consistent retained earnings accumulation and disciplined risk-weighted asset management."},
    rwa:      {label:"Risk-Weighted Assets",     color:brand.red,       fmt:v=>`$${(v/1000).toFixed(0)}B`,  narrative:"Risk-weighted assets grew modestly from $148.2B to $158.7B over the 12-quarter period, a 7.1% increase. The Q1 2023 compression reflects a Basel model recalibration. The Q4 2024 decline from the Q3 peak demonstrates the effect of CRE portfolio optimization. RWA growth has been managed well below total asset growth, supporting consistent capital ratio improvement."},
    deposits: {label:"Total Deposits",           color:brand.navyLight, fmt:v=>`$${(v/1000).toFixed(0)}B`,  narrative:"The deposit base expanded from $89.4B to $104.2B over the 12-quarter period, a 3-year CAGR of 5.2%. Growth has been consistent with no quarters of deposit decline, reflecting franchise strength. Acceleration in Q4 2023 and Q4 2024 is attributable to targeted retail pricing strategies. Deposit mix remains diversified with no concentration risk identified."},
    lcr:      {label:"Liquidity Coverage Ratio", color:brand.green,     fmt:v=>`${v}%`,              narrative:"The Liquidity Coverage Ratio has been maintained consistently above the 100% regulatory minimum across all 12 periods, averaging 127%, with Q4 2024 at 139%. The upward trend reflects disciplined HQLA portfolio management. The Q1 2023 moderation to 127% was a deliberate response to broader industry deposit volatility observed during that period."},
  };
  const c=cfg[m];
  return (
    <div className="ai">
      <div style={{marginBottom:22}}>
        <div className="eyebrow">Act VI of VI</div>
        <div className="mod-title">Multi-Period Trend Analysis</div>
        <div className="mod-desc">Twelve quarters of regulatory filing data are synthesized into strategic trend analysis. Key inflection points are identified and narrated to support executive oversight and forward planning.</div>
      </div>
      <div className="g4" style={{marginBottom:18}}>
        {[
          {l:"CET1 Ratio (Q4 2024)",        v:"14.6%",  c:"+250bps since Q1 2022"},
          {l:"Tier 1 Leverage (Q4 2024)",   v:"8.6%",   c:"+140bps since Q1 2022"},
          {l:"LCR (Q4 2024)",               v:"139%",   c:"+21pp since Q1 2022"},
          {l:"Deposits — 3-Year CAGR",      v:"+5.2%",  c:"$89.4B → $104.2B"},
        ].map((k,i)=>(
          <div key={i} className="card card-sm">
            <div className="kv" style={{color:brand.navyDeep}}>{k.v}</div>
            <div className="kl" style={{marginTop:3}}>{k.l}</div>
            <div className="kc up" style={{marginTop:3}}>▲ {k.c}</div>
          </div>
        ))}
      </div>
      <div className="card" style={{marginBottom:18}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
          <div className="card-title" style={{marginBottom:0}}>12-Quarter Regulatory Trend <span className="badge badge-syn">Synthetic</span></div>
          <div className="pills">{Object.entries(cfg).map(function(entry){ const k=entry[0]; const v=entry[1]; return <button key={k} className={"pill " + (m===k?"on":"")} onClick={function(){setM(k);}}>{v.label}</button>; })}</div>
        </div>
        <ResponsiveContainer width="100%" height={270}>
          <AreaChart data={trendData} margin={{top:4,right:14,left:14,bottom:4}}>
            <defs>
              <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={c.color} stopOpacity={0.12}/>
                <stop offset="95%" stopColor={c.color} stopOpacity={0.01}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={brand.borderLight}/>
            <XAxis dataKey="q" tick={{fill:brand.textLight,fontSize:10,fontFamily:"JetBrains Mono,monospace"}} axisLine={{stroke:brand.border}}/>
            <YAxis tick={{fill:brand.textLight,fontSize:10,fontFamily:"JetBrains Mono,monospace"}} axisLine={{stroke:brand.border}} tickFormatter={c.fmt} domain={["auto","auto"]}/>
            <Tooltip content={<Tip/>}/>
            <Area type="monotone" dataKey={m} name={c.label} stroke={c.color} strokeWidth={2} fill="url(#ag)" dot={{fill:c.color,r:3.5,stroke:brand.white,strokeWidth:2}} activeDot={{r:6,stroke:c.color,strokeWidth:2,fill:brand.white}}/>
          </AreaChart>
        </ResponsiveContainer>
        <div className="insight">
          <div className="ilabel">Analytical Narrative — {c.label}</div>
          <div className="itext">{c.narrative}</div>
        </div>
      </div>
      <div className="g2">
        <div>
          <div className="card-title" style={{marginBottom:12}}>Inflection Point Analysis <span className="badge badge-syn">Synthetic</span></div>
          {[
            {q:"Q1 2023",flag:false,t:"Industry-wide deposit outflows following regional bank stress events. LCR management activated; HQLA buffer temporarily increased. No material impact on Mizuho Americas deposit base."},
            {q:"Q1 2024",flag:false,t:"Adoption of the Standardized Approach for Operational Risk (SA-OR). Operational risk RWA reduced approximately $4B, contributing to material CET1 improvement. Methodology change reflected in HC-R Part II disclosures."},
            {q:"Q3 2024",flag:true, t:"CRE origination acceleration and emerging past due trend noted. RWA approached a three-year high. HC-N monitoring activated. Management commentary prepared for regulatory submission."},
            {q:"Q4 2024",flag:false,t:"Strong deposit growth and continued capital retention. CET1 reaches 12-quarter high at 14.6%. CRE anomaly under investigation prior to filing; all other metrics within expected range."},
          ].map((pt,i)=>(
            <div key={i} className="cc" style={{borderLeftColor:pt.flag?brand.amber:brand.navy}}>
              <div className="cq">{pt.q}{pt.flag&&<span className="badge badge-flag" style={{marginLeft:8}}>Attention</span>}</div>
              <div className="ct">{pt.t}</div>
            </div>
          ))}
        </div>
        <div>
          <div className="card" style={{marginBottom:14}}>
            <div className="card-title">Capital Ratios vs. Regulatory Minima <span className="badge badge-syn">Synthetic</span></div>
            <ResponsiveContainer width="100%" height={190}>
              <LineChart data={trendData.slice(-8)} margin={{top:4,right:8,left:0,bottom:4}}>
                <CartesianGrid strokeDasharray="3 3" stroke={brand.borderLight}/>
                <XAxis dataKey="q" tick={{fill:brand.textLight,fontSize:9,fontFamily:"JetBrains Mono,monospace"}} axisLine={{stroke:brand.border}}/>
                <YAxis tick={{fill:brand.textLight,fontSize:10}} axisLine={{stroke:brand.border}} domain={[5,16]} tickFormatter={v=>`${v}%`}/>
                <Tooltip content={<Tip/>}/>
                <Legend wrapperStyle={{fontSize:11,fontFamily:"Inter,sans-serif"}}/>
                <Line type="monotone" dataKey="cet1"     name="CET1 Ratio"       stroke={brand.navy}  strokeWidth={2} dot={{r:3,fill:brand.navy}}/>
                <Line type="monotone" dataKey="tier1Lev" name="Tier 1 Leverage"  stroke={brand.red}   strokeWidth={2} dot={{r:3,fill:brand.red}} strokeDasharray="5 3"/>
                <ReferenceLine y={10} stroke={brand.textMuted} strokeDasharray="3 3" label={{value:"Min 10%",fill:brand.textMuted,fontSize:9}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="card card-sm">
            <div className="card-title" style={{marginBottom:10}}>Peer Benchmarking — Selected Ratios <span className="badge badge-pub">FFIEC CDR — Public</span></div>
            <table>
              <thead><tr><th>Institution</th><th>CET1 %</th><th>LCR %</th><th>T1 Lev %</th></tr></thead>
              <tbody>
                {[
                  {n:"Mizuho Americas BHC", c:"14.6", l:"139", t:"8.6", self:true},
                  {n:"Large FBO Peer A",    c:"13.1", l:"128", t:"7.9", self:false},
                  {n:"Large FBO Peer B",    c:"14.2", l:"134", t:"8.2", self:false},
                  {n:"Large FBO Peer C",    c:"12.8", l:"122", t:"7.4", self:false},
                  {n:"Category III Avg.",   c:"13.4", l:"126", t:"7.8", self:false},
                ].map((r,i)=>(
                  <tr key={i} style={{background:r.self?brand.navyTint:""}}>
                    <td style={{fontWeight:r.self?600:400,color:r.self?brand.navyDeep:brand.textDark}}>{r.n}</td>
                    <td className="mono" style={{color:r.self?brand.navy:brand.textDark,fontWeight:r.self?600:400}}>{r.c}</td>
                    <td className="mono" style={{color:r.self?brand.navy:brand.textDark,fontWeight:r.self?600:400}}>{r.l}</td>
                    <td className="mono" style={{color:r.self?brand.navy:brand.textDark,fontWeight:r.self?600:400}}>{r.t}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
const MODS=[
  {n:1,l:"Regulatory Instructions",component:M1},
  {n:2,l:"Data Preparation",       component:M2},
  {n:3,l:"Anomaly Detection",      component:M3},
  {n:4,l:"Report Interrogation",   component:M4},
  {n:5,l:"Review & Approval",      component:M5},
  {n:6,l:"Trend Analysis",         component:M6},
];

export default function App(){
  const [active,setActive]=useState(0);
  const AM=MODS[active].component;
  return(
    <>
      <style>{css}</style>
      <div className="app">
        <header className="header">
          <div className="header-inner">
            <div className="logo-block">
              <div className="logo-word">MIZUHO</div>
              <div className="logo-arc"/>
            </div>
            <div className="header-sub">Regulatory Reporting — AI-Assisted Lifecycle</div>
            <div className="hdr-right">
              <span className="badge badge-hdr">FR Y-9C</span>
              <span className="badge badge-hdr">Mizuho Americas BHC</span>
            </div>
          </div>
        </header>
        <nav className="subnav">
          <div className="subnav-inner">
            {MODS.map(function(m,i) {
              return (
                <button key={i} className={"ntab " + (active===i?"active":"")} onClick={function(){setActive(i);}}>
                  <span className="ntab-num">{m.n}</span>{m.l}
                </button>
              );
            })}
            <div className="nav-ctrl">
              {active>0 ? <button className="btn btn-g" onClick={function(){setActive(active-1);}}>← Previous</button> : null}
              {active<MODS.length-1 ? <button className="btn btn-n" onClick={function(){setActive(active+1);}}>Next →</button> : null}
            </div>
          </div>
        </nav>
        <main className="main"><AM key={active}/></main>
        <footer className="footer">
          <span className="ft">All data is synthetic or sourced from publicly available FFIEC Call Report Data. For internal demonstration purposes only. Not for regulatory submission.</span>
          <span className="ft">Mizuho Americas · Regulatory Reporting · Powered by Claude, Anthropic</span>
        </footer>
      </div>
    </>
  );
}
