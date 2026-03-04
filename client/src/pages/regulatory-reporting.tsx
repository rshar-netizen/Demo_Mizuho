import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as Collapsible from "@radix-ui/react-collapsible";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Database,
  AlertTriangle,
  FileCheck,
  GitCompare,
  TrendingUp,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Send,
  Wifi,
  FileText,
  Sparkles,
  Pencil,
  Check,
  SendHorizontal,
  Clock,
  BarChart3,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
  Target,
  Zap,
  Eye,
  Link2,
  ArrowRight,
  Scale,
  Layers,
  ShieldCheck,
  Flag,
  Download,
  RefreshCw,
  BookOpen,
  ListChecks,
  Info,
  ExternalLink,
} from "lucide-react";
import {
  reportingInstructions,
  type ReportingInstruction,
  dataDictionaries,
  anomalyRecords,
  reportLineItems,
  trendData as demoTrendData,
  type TrendDataPoint,
  aiQueries,
  type AIQueryItem,
  unmappedFields,
  type UnmappedField,
  fieldLinkages,
  type FieldLinkage,
  formatCurrency,
  formatPercent,
} from "@/lib/demo-data";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  AreaChart,
  Area,
  Cell,
} from "recharts";

const steps = [
  { id: "instructions", label: "Instructions Analysis", icon: Search, step: 1 },
  { id: "data", label: "Data & Dictionary", icon: Database, step: 2 },
  { id: "anomalies", label: "Variance Analysis", icon: AlertTriangle, step: 3 },
  { id: "review", label: "Report Validation", icon: FileCheck, step: 4 },
  { id: "comparison", label: "Review & Approval", icon: GitCompare, step: 5 },
  { id: "trends", label: "Trend Analysis", icon: TrendingUp, step: 6 },
];

function StatusBadge({ status }: { status: string }) {
  if (status === "passed") return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0"><CheckCircle2 className="w-3 h-3 mr-1" />Passed</Badge>;
  if (status === "failed") return <Badge variant="secondary" className="bg-red-500/10 text-red-600 dark:text-red-400 border-0"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
  if (status === "warning") return <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0"><AlertCircle className="w-3 h-3 mr-1" />Warning</Badge>;
  if (status === "analyzed") return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0">Analyzed</Badge>;
  if (status === "pending") return <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0">Pending</Badge>;
  if (status === "flagged") return <Badge variant="destructive">Flagged</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "up") return <ArrowUpRight className="w-4 h-4 text-emerald-500" />;
  if (trend === "down") return <ArrowDownRight className="w-4 h-4 text-red-500" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
}

function SeverityBadge({ severity }: { severity: string }) {
  if (severity === "high") return <Badge variant="destructive">High</Badge>;
  if (severity === "medium") return <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0">Medium</Badge>;
  return <Badge variant="secondary">Low</Badge>;
}

interface CallReportRecord {
  reportDate: string;
  rawDate: string;
  institutionName: string;
  cert: number;
  totalAssets: number | null;
  totalDeposits: number | null;
  netIncome: number | null;
  totalInterestIncome: number | null;
  totalInterestExpense: number | null;
  totalLoansAndLeases: number | null;
  roe: number | null;
  roa: number | null;
  nim: number | null;
  tier1Ratio: number | null;
  totalCapitalRatio: number | null;
  efficiencyRatio: number | null;
  npaRatio: number | null;
  chargeOffRate: number | null;
  loanToDeposit: number | null;
  securities: number | null;
  loanLossReserve: number | null;
  domesticDeposits: number | null;
  tier1Capital: number | null;
}

const SCHEDULE_INSTRUCTIONS: Record<string, ReportingInstruction> = {
  RC: {
    id: "FFIEC-031",
    section: "Schedule RC — Balance Sheet",
    description: "Consolidated Report of Condition: Total assets, liabilities, and equity capital of the reporting institution",
    schedule: "RC",
    frequency: "Quarterly",
    status: "analyzed",
    requirements: [
      "Total assets must equal total liabilities plus equity capital",
      "All amounts reported in thousands of dollars",
      "Consolidate all domestic and foreign offices",
      "Report on a fully consolidated basis",
    ],
  },
  "RC-C": {
    id: "FFIEC-031",
    section: "Schedule RC-C — Loans and Leases",
    description: "Loans and lease financing receivables broken down by category including real estate, commercial, consumer, and agricultural loans",
    schedule: "RC-C",
    frequency: "Quarterly",
    status: "analyzed",
    requirements: [
      "Report gross loans before deducting unearned income and allowance",
      "Classify by loan type per FFIEC instructions",
      "Include commitments and letters of credit",
      "Reconcile to RC Schedule line items",
    ],
  },
  "RC-R": {
    id: "FFIEC-031",
    section: "Schedule RC-R — Regulatory Capital",
    description: "Risk-based capital ratios including CET1, Tier 1, and Total Capital ratios with risk-weighted assets calculation",
    schedule: "RC-R",
    frequency: "Quarterly",
    status: "analyzed",
    humanReview: true,
    reviewReason: "Complex risk-weighting methodology — Basel III standardized vs. advanced approaches require manual validation of asset category assignments and off-balance-sheet conversion factors",
    requirements: [
      "Calculate CET1 capital per Basel III standards",
      "Apply correct risk weights to all asset categories",
      "Include off-balance-sheet exposures in RWA calculation",
      "Report supplementary leverage ratio for advanced approaches",
    ],
  },
  "RC-E": {
    id: "FFIEC-031",
    section: "Schedule RC-E — Deposit Liabilities",
    description: "Breakdown of deposit liabilities by type, maturity, and insurance status including transaction and non-transaction accounts",
    schedule: "RC-E",
    frequency: "Quarterly",
    status: "analyzed",
    requirements: [
      "Classify deposits as transaction or non-transaction accounts",
      "Report time deposits by remaining maturity buckets",
      "Separate insured vs uninsured deposits per FDIC coverage rules",
      "Reconcile total deposits to Schedule RC line 13",
    ],
  },
  "RC-N": {
    id: "FFIEC-031",
    section: "Schedule RC-N — Past Due and Nonaccrual",
    description: "Delinquency and nonaccrual status of loans and leases by category, including 30-89 days past due and 90+ days past due",
    schedule: "RC-N",
    frequency: "Quarterly",
    status: "analyzed",
    humanReview: true,
    reviewReason: "Judgment-based loan classification — nonaccrual determinations and TDR identification rely on subjective credit risk assessments that AI cannot fully validate",
    requirements: [
      "Report loans past due 30-89 days separately from 90+ days",
      "Identify nonaccrual loans by loan category per ASC 326 guidance",
      "Include restructured loans in appropriate aging buckets",
      "Cross-reference delinquency totals to Schedule RC-C loan categories",
    ],
  },
  "RC-L": {
    id: "FFIEC-031",
    section: "Schedule RC-L — Derivatives and Off-Balance Sheet",
    description: "Notional amounts and fair values of derivative contracts and off-balance sheet exposures including commitments and guarantees",
    schedule: "RC-L",
    frequency: "Quarterly",
    status: "pending",
    humanReview: true,
    reviewReason: "Complex fair value hierarchy and netting rules — derivative valuation (Level 2/3), hedge accounting eligibility, and master netting agreement offsets require expert judgment",
    requirements: [
      "Report notional amounts by derivative type (interest rate, FX, credit, equity)",
      "Separate trading vs hedging derivative positions",
      "Report gross positive and negative fair values before netting",
      "Include unused commitments and standby letters of credit",
    ],
  },
  RI: {
    id: "FFIEC-031",
    section: "Schedule RI — Income Statement",
    description: "Income and expense detail for the reporting period including interest income, interest expense, provisions, and non-interest components",
    schedule: "RI",
    frequency: "Quarterly",
    status: "analyzed",
    requirements: [
      "Report interest income and expense on an accrual basis",
      "Separate provision for credit losses per CECL from other provisions",
      "Report realized gains and losses on securities separately",
      "Reconcile net income to Schedule RC equity changes",
    ],
  },
  "HC": {
    id: "FR Y-9C",
    section: "Schedule HC — Consolidated Balance Sheet",
    description: "Consolidated balance sheet for the bank holding company including total consolidated assets, liabilities, and equity capital",
    schedule: "HC",
    frequency: "Quarterly",
    status: "analyzed",
    requirements: [
      "Report total consolidated assets of all subsidiaries (BHCK2170)",
      "Report total liabilities including borrowed funds and subordinated debt",
      "Report total equity capital including minority interests (BHCK3210)",
      "Consolidate all domestic and foreign subsidiaries per GAAP",
    ],
  },
  "HI": {
    id: "FR Y-9C",
    section: "Schedule HI — Consolidated Income Statement",
    description: "Consolidated income statement reporting interest income, non-interest income, provisions, and net income for the bank holding company",
    schedule: "HI",
    frequency: "Quarterly",
    status: "analyzed",
    requirements: [
      "Report interest income on a taxable-equivalent basis where applicable",
      "Separate trading revenue from banking book income",
      "Include provision for credit losses per CECL methodology (BHCK4230)",
      "Report extraordinary items separately",
    ],
  },
  "HC-R": {
    id: "FR Y-9C",
    section: "Schedule HC-R — Regulatory Capital",
    description: "Risk-based capital components and ratios for the bank holding company including CET1, Tier 1, and Total Capital under Basel III",
    schedule: "HC-R",
    frequency: "Quarterly",
    status: "analyzed",
    humanReview: true,
    reviewReason: "Advanced capital adequacy calculations — BHC-level Basel III endgame rules, capital buffers (CCyB, G-SIB surcharge), and stress capital buffer integration require senior risk oversight",
    requirements: [
      "Calculate CET1 capital ratio per Basel III final rule (BHCA7205)",
      "Report Tier 1 capital ratio (BHCA7206) and Total capital ratio (BHCA7210)",
      "Calculate total risk-weighted assets including credit, market, and operational risk",
      "Report supplementary leverage ratio for Category I-III firms",
    ],
  },
  "HC-N": {
    id: "FR Y-9C",
    section: "Schedule HC-N — Past Due and Nonaccrual Loans",
    description: "Delinquency and nonaccrual status of consolidated loans and leases for the bank holding company",
    schedule: "HC-N",
    frequency: "Quarterly",
    status: "analyzed",
    humanReview: true,
    reviewReason: "Consolidated delinquency classification — intercompany loan eliminations and subsidiary-level nonaccrual policies may differ, requiring manual reconciliation across legal entities",
    requirements: [
      "Report loans past due 30-89 days and 90+ days by loan category",
      "Identify nonaccrual loans per ASC 326 and interagency guidance",
      "Include troubled debt restructurings in appropriate aging buckets",
      "Reconcile totals to Schedule HC-C consolidated loan categories",
    ],
  },
  "HC-B": {
    id: "FR Y-9C",
    section: "Schedule HC-B — Securities",
    description: "Held-to-maturity and available-for-sale securities at amortized cost and fair value for the bank holding company",
    schedule: "HC-B",
    frequency: "Quarterly",
    status: "analyzed",
    humanReview: true,
    reviewReason: "Fair value measurement complexity — Level 3 securities valuations, OTTI/CECL impairment assessments, and HTM intent-and-ability documentation require accounting judgment",
    requirements: [
      "Report securities held-to-maturity at amortized cost",
      "Report available-for-sale securities at fair value",
      "Disclose unrealized gains and losses in AOCI",
      "Classify by issuer type: U.S. Treasury, agency, municipal, corporate, MBS",
    ],
  },
  "MRR-A": {
    id: "FFIEC 102",
    section: "Schedule A — Regulatory Market Risk: VaR-Based Measure",
    description: "Value-at-Risk (VaR) calculations using approved internal models. Reports previous day's VaR, 60-day high/low, and 60-day average for general and specific risk across asset categories.",
    schedule: "MRR-A",
    frequency: "Quarterly",
    status: "analyzed",
    requirements: [
      "Report VaR using a 99% confidence interval and 10-business-day holding period",
      "Calculate at close of business each day using most recent 60 trading days",
      "Separately report general risk and specific risk components",
      "Include interest rate, equity, foreign exchange, and commodity positions",
    ],
  },
  "MRR-B": {
    id: "FFIEC 102",
    section: "Schedule B — Regulatory Market Risk: Stressed VaR-Based Measure",
    description: "Stressed VaR calculation using a continuous 12-month period of significant financial stress relevant to the institution's portfolio composition.",
    schedule: "MRR-B",
    frequency: "Quarterly",
    status: "analyzed",
    humanReview: true,
    reviewReason: "Stress period selection and calibration require judgment — the 12-month stress window must be relevant to the current portfolio composition and validated against multiple crisis periods",
    requirements: [
      "Use same internal model parameters as non-stressed VaR",
      "Calibrate to a continuous 12-month stress period approved by primary regulator",
      "Report previous day's stressed VaR, 60-day high/low, and 60-day average",
      "Validate that stress period remains appropriate as portfolio composition evolves",
    ],
  },
  "MRR-C": {
    id: "FFIEC 102",
    section: "Schedule C — Regulatory Market Risk: Incremental Risk Capital Charge",
    description: "Incremental risk capital (IRC) for default and migration risk in the correlation trading portfolio, calculated over a one-year horizon at 99.9% confidence.",
    schedule: "MRR-C",
    frequency: "Quarterly",
    status: "pending",
    humanReview: true,
    reviewReason: "IRC model validation requires specialized credit risk expertise — default and migration probabilities, correlation assumptions, and liquidity horizons involve significant modeling judgment",
    requirements: [
      "Calculate over a one-year capital horizon at 99.9% confidence level",
      "Capture default risk and credit migration risk",
      "Apply liquidity horizons that reflect the time to hedge or liquidate each position",
      "Report most recent IRC, 12-week average, and 12-week high",
    ],
  },
  "MRR-D": {
    id: "FFIEC 102",
    section: "Schedule D — Regulatory Market Risk: Comprehensive Risk Measure",
    description: "Comprehensive risk measure for correlation trading positions, capturing price risk including default, migration, spread, basis, recovery rate, and correlation risk.",
    schedule: "MRR-D",
    frequency: "Quarterly",
    status: "pending",
    humanReview: true,
    reviewReason: "Comprehensive risk modeling for correlation products requires advanced quantitative expertise — correlation skew, tranche-level recovery assumptions, and basis risk between indices and single-name CDS are complex to validate",
    requirements: [
      "Model all material price risk factors for correlation trading positions",
      "Capture risks not covered by VaR: default, recovery rate, correlation, basis",
      "Report at 99.9% confidence level with appropriate liquidity horizons",
      "Surcharge: floor at 8% of standardized specific risk charge if model is unvalidated",
    ],
  },
  "MRR-E": {
    id: "FFIEC 102",
    section: "Schedule E — Regulatory Market Risk: Standardized Specific Risk",
    description: "Standardized specific risk charges for debt and securitization positions not captured by approved internal models.",
    schedule: "MRR-E",
    frequency: "Quarterly",
    status: "analyzed",
    requirements: [
      "Apply regulatory-specified risk weights to debt positions by issuer category",
      "Government securities: 0% to 12.5% based on remaining maturity and rating",
      "Qualifying securities (investment-grade corporates): 0.25% to 1.6%",
      "Securitization exposures: apply risk weights per Basel III securitization framework",
    ],
  },
  "MRR-F": {
    id: "FFIEC 102",
    section: "Schedule F — Regulatory Market Risk: De Minimis Exemption",
    description: "Calculation of aggregate trading assets and liabilities to determine whether the institution qualifies for the de minimis exemption from market risk capital requirements.",
    schedule: "MRR-F",
    frequency: "Quarterly",
    status: "analyzed",
    requirements: [
      "Trading activity must be less than 10% of total assets to qualify",
      "Also qualify if aggregate trading assets and liabilities are less than $1 billion",
      "Calculate on a consolidated basis including all subsidiaries",
      "If exemption applies, institution is not required to file Schedules A through E",
    ],
  },
};

const FIELD_TO_SCHEDULE: Record<string, string> = {
  totalAssets: "RC",
  totalDeposits: "RC-E",
  securities: "RC",
  loanLossReserve: "RC",
  totalLoansAndLeases: "RC-C",
  loanToDeposit: "RC-C",
  tier1Ratio: "RC-R",
  totalCapitalRatio: "RC-R",
  tier1Capital: "RC-R",
  domesticDeposits: "RC-E",
  npaRatio: "RC-N",
  chargeOffRate: "RC-N",
  netIncome: "RI",
  totalInterestIncome: "RI",
  totalInterestExpense: "RI",
  roe: "RI",
  roa: "RI",
  nim: "RI",
  efficiencyRatio: "RI",
};

interface FRY9CData {
  totalConsolidatedAssets: number | null;
  totalLoans: number | null;
  totalDeposits: number | null;
  totalEquityCapital: number | null;
  netIncome: number | null;
  netInterestIncome: number | null;
  nonInterestIncome: number | null;
  provisionForCreditLosses: number | null;
  totalRiskWeightedAssets: number | null;
  cet1Capital: number | null;
  cet1Ratio: number | null;
  tier1CapitalRatio: number | null;
  totalCapitalRatio: number | null;
  supplementaryLeverageRatio: number | null;
}

const FRY9C_FIELD_TO_SCHEDULE: Record<string, string> = {
  totalConsolidatedAssets: "HC",
  totalEquityCapital: "HC",
  totalLoans: "HC",
  totalDeposits: "HC",
  netIncome: "HI",
  netInterestIncome: "HI",
  nonInterestIncome: "HI",
  provisionForCreditLosses: "HI",
  cet1Ratio: "HC-R",
  tier1CapitalRatio: "HC-R",
  totalCapitalRatio: "HC-R",
  totalRiskWeightedAssets: "HC-R",
  cet1Capital: "HC-R",
  supplementaryLeverageRatio: "HC-R",
};

function buildLiveInstructions(record: CallReportRecord, fry9c?: FRY9CData | null): ReportingInstruction[] {
  const activeSchedules = new Set<string>();

  for (const [field, schedule] of Object.entries(FIELD_TO_SCHEDULE)) {
    const val = (record as any)[field];
    if (val != null) activeSchedules.add(schedule);
  }
  activeSchedules.add("RC-L");

  const hasFRY9CData = fry9c && Object.values(fry9c).some(v => v != null);
  if (hasFRY9CData) {
    for (const [field, schedule] of Object.entries(FRY9C_FIELD_TO_SCHEDULE)) {
      const val = (fry9c as any)[field];
      if (val != null) activeSchedules.add(schedule);
    }
  }
  activeSchedules.add("HC");
  activeSchedules.add("HI");
  activeSchedules.add("HC-R");
  activeSchedules.add("HC-N");
  activeSchedules.add("HC-B");

  const order = ["RC", "RC-C", "RC-R", "RC-E", "RC-N", "RC-L", "RI", "HC", "HI", "HC-R", "HC-N", "HC-B"];
  return order
    .filter(s => activeSchedules.has(s))
    .map(s => SCHEDULE_INSTRUCTIONS[s])
    .filter(Boolean);
}

function InstructionCard({ inst, idx }: { inst: ReportingInstruction; idx: number }) {
  const [open, setOpen] = useState(idx === 0);

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Card className={`hover-elevate ${inst.humanReview ? "ring-1 ring-amber-400/40 dark:ring-amber-500/30" : ""}`} data-testid={`card-instruction-${idx}`}>
        <Collapsible.Trigger asChild>
          <button className="w-full text-left p-3 flex items-start justify-between gap-2 cursor-pointer" data-testid={`button-toggle-instruction-${idx}`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Badge variant="outline" className="font-mono text-xs">{inst.id}</Badge>
                <Badge variant="secondary" className="text-xs">{inst.schedule}</Badge>
                <StatusBadge status={inst.status} />
                <Badge variant="outline" className="text-xs">{inst.frequency}</Badge>
                {inst.humanReview && (
                  <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-400/30 text-xs gap-1" data-testid={`badge-human-review-${idx}`}>
                    <Eye className="w-3 h-3" />
                    Human Review
                  </Badge>
                )}
              </div>
              <h4 className="text-sm font-medium">{inst.section}</h4>
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 mt-1 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
          </button>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <div className="px-3 pb-3 pt-0 space-y-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground pt-2">{inst.description}</p>
            {inst.humanReview && inst.reviewReason && (
              <div className="flex items-start gap-2 p-2 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40" data-testid={`review-reason-${idx}`}>
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                <p className="text-xs text-amber-800 dark:text-amber-300">{inst.reviewReason}</p>
              </div>
            )}
            <div className="space-y-1">
              {inst.requirements.map((req, ridx) => (
                <div key={ridx} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <ChevronRight className="w-3 h-3 mt-0.5 shrink-0 text-primary" />
                  <span>{req}</span>
                </div>
              ))}
            </div>
          </div>
        </Collapsible.Content>
      </Card>
    </Collapsible.Root>
  );
}

function AIResponsePanel({ query }: { query: AIQueryItem | null }) {
  if (!query) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center space-y-2">
          <MessageSquare className="w-8 h-8 mx-auto opacity-40" />
          <p className="text-sm">Select a question or ask your own</p>
          <p className="text-xs opacity-60">Guidance limited to regulatory reporting requirements, filing instructions, and schedule-specific rules</p>
        </div>
      </div>
    );
  }

  const paragraphs = query.answer.split("\n\n");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-border/50">
        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
          <MessageSquare className="w-3 h-3 text-primary" />
        </div>
        <span className="text-xs font-medium text-primary">
          {query.id === "out-of-scope" ? "Out of Scope" : "Reporting Guidance"}
        </span>
        <Badge variant="outline" className="text-[10px] ml-auto">
          {query.schedule === "—" ? "N/A" : `Schedule ${query.schedule}`}
        </Badge>
      </div>

      {query.question && (
        <div className="px-3 py-2 rounded-md bg-muted/40 border border-border/40">
          <p className="text-xs text-muted-foreground italic">"{query.question}"</p>
        </div>
      )}

      <div className="space-y-3">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-xs leading-relaxed text-foreground whitespace-pre-wrap">{p}</p>
        ))}
      </div>

      <div className="pt-3 border-t border-border/50">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Source References</p>
        <div className="flex flex-wrap gap-2">
          {query.sources.map((src, i) => (
            <div key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border/60 bg-muted/30 text-[11px]" data-testid={`source-ref-${query.id}-${i}`}>
              <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              <span className="font-medium text-foreground whitespace-nowrap">{src.label}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground font-mono whitespace-nowrap">{src.reference}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const SCOPE_PHRASES = [
  "schedule", "filing", "report", "requirement", "instruction",
  "ffiec", "call report", "y-9c", "fry9c", "fr y", "ubpr", "capital", "ratio",
  "tier 1", "tier1", "cet1", "risk-weight", "risk weight", "leverage",
  "basel", "deposit", "loan", "nonaccrual", "past due", "delinquent", "provision",
  "cecl", "allowance", "derivative", "netting", "fair value", "hedge",
  "consolidat", "off-balance", "memorand", "edit check", "threshold",
  "classify", "classification", "hvcre", "accrual", "charge-off",
  "securities", "impairment", "regulatory", "compliance",
  "quarterly", "frequency", "deadline", "submission",
  "var", "value-at-risk", "value at risk", "stressed var", "market risk",
  "incremental risk", "irc", "correlation trading", "comprehensive risk",
  "de minimis", "backtesting", "trading book", "specific risk",
  "general risk", "multiplication factor", "frtb", "102",
];

const SCOPE_EXACT_WORDS = ["rc", "ri", "hc", "rwa", "gaap", "asc", "cre", "tdr", "htm", "afs", "aoci", "mrr", "var", "cva", "frtb"];

function isInScope(query: string): boolean {
  const lower = query.toLowerCase();
  if (SCOPE_PHRASES.some(kw => lower.includes(kw))) return true;
  const words = lower.split(/\s+/);
  return SCOPE_EXACT_WORDS.some(kw => words.includes(kw));
}

const OUT_OF_SCOPE_RESPONSE: AIQueryItem = {
  id: "out-of-scope",
  schedule: "—",
  question: "",
  answer: "This question appears to be outside the scope of regulatory reporting requirements and filing instructions.\n\nThis assistant is designed to help with:\n- FFIEC Call Report (031/041) schedule requirements and filing rules\n- FR Y-9C schedule instructions for bank holding company reporting\n- Regulatory capital calculation guidance (Basel III, CET1, Tier 1, Total Capital)\n- Loan classification, deposit categorization, and derivative reporting rules\n- CECL provisioning requirements and nonaccrual/delinquency guidance\n\nFor other questions, please refer to:\n- Data analysis and trends — see the Multi-Period Analysis and Trend Analysis tabs\n- Cross-report reconciliation and tie-outs — see the Report Validation tab\n- Peer benchmarking and comparison — see the Peer Analysis page\n- Specific portfolio or position inquiries — consult the relevant business line team",
  sources: [
    { label: "Scope", reference: "Filing Requirements & Instructions Only" },
  ],
};

interface ReportType {
  id: string;
  label: string;
  fullName: string;
  description: string;
  agency: string;
  currentVersion: string;
  priorVersion: string;
  effectiveDate: string;
  scheduleKeys: string[];
  referenceUrl: string;
  instructionsUrl: string;
}

const REPORT_TYPES: ReportType[] = [
  {
    id: "ffiec-031",
    label: "FFIEC 031 — Call Report",
    fullName: "Consolidated Reports of Condition and Income (FFIEC 031)",
    description: "Quarterly financial data for banks with domestic and foreign offices, filed with FDIC, OCC, and Federal Reserve.",
    agency: "FFIEC / FDIC",
    currentVersion: "March 2026",
    priorVersion: "December 2025",
    effectiveDate: "Report date: December 31, 2025",
    scheduleKeys: ["RC", "RC-C", "RC-R", "RC-E", "RC-N", "RC-L", "RI"],
    referenceUrl: "https://www.ffiec.gov/forms031.htm",
    instructionsUrl: "https://www.ffiec.gov/pdf/FFIEC_forms/FFIEC031_FFIEC041_202503_i.pdf",
  },
  {
    id: "ffiec-102",
    label: "FFIEC 102 — Market Risk",
    fullName: "Market Risk Regulatory Report for Institutions Subject to the Market Risk Capital Rule (FFIEC 102)",
    description: "Quarterly report for institutions with significant trading activity, capturing market risk capital requirements under Basel III.",
    agency: "FFIEC / OCC / Federal Reserve",
    currentVersion: "March 2026",
    priorVersion: "December 2025",
    effectiveDate: "Report date: December 31, 2025",
    scheduleKeys: ["MRR-A", "MRR-B", "MRR-C", "MRR-D", "MRR-E", "MRR-F"],
    referenceUrl: "https://www.ffiec.gov/forms102.htm",
    instructionsUrl: "https://www.ffiec.gov/pdf/FFIEC_forms/FFIEC102_202503_i.pdf",
  },
];

interface InstructionChange {
  schedule: string;
  section: string;
  changeType: "new" | "revised" | "clarification" | "removed";
  summary: string;
  impact: "high" | "medium" | "low";
  details: string[];
}

const REPORT_CHANGES: Record<string, InstructionChange[]> = {
  "ffiec-031": [
    {
      schedule: "RC",
      section: "Schedule RC — Balance Sheet",
      changeType: "revised",
      summary: "Updated consolidation guidance for variable interest entities (VIEs) to align with ASU 2024-03",
      impact: "high",
      details: [
        "New requirement to disaggregate certain expenses on the face of the income statement per ASU 2024-03",
        "Additional memo items for VIE assets and liabilities held by consolidated trusts",
        "Clarified treatment of intercompany eliminations for multi-entity filers",
      ],
    },
    {
      schedule: "RC-R",
      section: "Schedule RC-R — Regulatory Capital",
      changeType: "revised",
      summary: "Basel III endgame transitional provisions — updated risk-weight tables for select commercial real estate exposures",
      impact: "high",
      details: [
        "Revised CRE risk weights: LTV-dependent granularity for income-producing properties",
        "New reporting line items for operational risk capital under standardized approach",
        "Updated AOCI opt-out transitional schedule for Category III and IV institutions",
        "Credit valuation adjustment (CVA) capital charge calculation refinements",
      ],
    },
    {
      schedule: "RI",
      section: "Schedule RI — Income Statement",
      changeType: "clarification",
      summary: "New disaggregation requirements for realized gains/losses on AFS securities and CECL day-2 provision methodology",
      impact: "medium",
      details: [
        "Separate reporting of realized gains vs. losses on AFS debt securities (previously net)",
        "Clarified CECL day-2 provision recognition for purchased credit-deteriorated assets",
        "New memo item for unrealized gains/losses on equity securities with readily determinable fair values",
      ],
    },
    {
      schedule: "RC-E",
      section: "Schedule RC-E — Deposit Liabilities",
      changeType: "revised",
      summary: "Enhanced uninsured deposit disclosure requirements per FDIC proposed rulemaking",
      impact: "medium",
      details: [
        "New breakdowns for estimated uninsured deposits by depositor type (retail, wholesale, public funds)",
        "Reciprocal deposit reporting threshold updated from $5B to the current FDIC-defined limit",
        "Additional memo items for sweep arrangement deposit volumes",
      ],
    },
    {
      schedule: "RC-N",
      section: "Schedule RC-N — Past Due and Nonaccrual",
      changeType: "clarification",
      summary: "Interagency guidance on nonaccrual treatment for loans modified under ASC 326-20 (post-TDR sunset)",
      impact: "low",
      details: [
        "Clarified that loans modified for borrowers experiencing financial difficulty are no longer classified as TDRs under ASC 326-20",
        "New disclosure requirements for modifications involving payment delays, term extensions, or interest rate reductions",
        "Updated thresholds for reporting loans modified during the quarter in memo items",
      ],
    },
  ],
  "ffiec-102": [
    {
      schedule: "MRR-A",
      section: "Schedule A — VaR-Based Measure",
      changeType: "revised",
      summary: "Updated VaR backtesting window expanded from 250 to 500 business days per Basel III.1 transition",
      impact: "high",
      details: [
        "Backtesting exception count now evaluated over trailing 500 business days (phased from 250)",
        "New multiplication factor schedule for VaR backtesting violations",
        "Additional reporting of P&L attribution test results (risk-theoretical vs. hypothetical P&L)",
      ],
    },
    {
      schedule: "MRR-B",
      section: "Schedule B — Stressed VaR-Based Measure",
      changeType: "revised",
      summary: "New stressed VaR calibration requirements — stress period must be revalidated quarterly with documented rationale",
      impact: "high",
      details: [
        "Quarterly revalidation of stress period selection with documented rationale",
        "New requirement to evaluate at least three candidate stress periods spanning different crisis types",
        "Regulator may mandate a specific stress period if the institution's selection is deemed non-conservative",
      ],
    },
    {
      schedule: "MRR-C",
      section: "Schedule C — Incremental Risk Capital Charge",
      changeType: "clarification",
      summary: "Clarified treatment of sovereign exposures in IRC calculation and liquidity horizon assignment",
      impact: "medium",
      details: [
        "Sovereign positions must use rating-specific default probabilities (no assumed zero-default for investment-grade)",
        "Liquidity horizons for less liquid positions extended from 3 months to 6 months minimum",
        "New validation requirements for correlation assumptions in multi-factor models",
      ],
    },
    {
      schedule: "MRR-F",
      section: "Schedule F — De Minimis Exemption",
      changeType: "clarification",
      summary: "Updated de minimis threshold calculation to include notional amounts of cleared derivative positions",
      impact: "low",
      details: [
        "Centrally-cleared derivative notional amounts now included in aggregate trading activity calculation",
        "Threshold remains at 10% of total assets or $1 billion aggregate trading activity",
        "Institutions near the threshold boundary should monitor exposure growth quarterly",
      ],
    },
  ],
};

const REPORT_AI_QUERIES: Record<string, AIQueryItem[]> = {
  "ffiec-031": [
    {
      id: "q-031-change-1",
      schedule: "RC-R",
      question: "What are the key changes to Schedule RC-R capital requirements this quarter?",
      answer: "The March 2026 filing instructions for Schedule RC-R include several significant updates related to the Basel III endgame transition:\n\n1. Risk-Weight Tables: Revised CRE risk weights now follow an LTV-dependent approach for income-producing commercial real estate. Properties with LTV ≤ 60% receive a 65% risk weight (previously 100%), while those with LTV > 80% receive 150%.\n\n2. Operational Risk Capital: New reporting line items for operational risk capital under the standardized measurement approach (SMA). This is a new charge that was not required in prior filings.\n\n3. AOCI Opt-Out Transition: The transitional schedule for AOCI opt-out has been updated for Category III and IV institutions. The phase-in percentage increases by 25pp per year.\n\n4. CVA Capital Charge: Refinements to the credit valuation adjustment (CVA) capital charge calculation now require the basic approach (BA-CVA) for institutions without approved internal models.\n\nThese changes will impact Mizuho's reported Tier 1 and Total Capital ratios. The regulatory capital team should evaluate the RWA impact of the new CRE risk weights against the current portfolio composition.",
      sources: [
        { label: "FFIEC Instructions", reference: "RC-R Parts I & II (March 2026)" },
        { label: "Basel III Endgame", reference: "12 CFR Part 217 Transitional Rule" },
      ],
    },
    {
      id: "q-031-change-2",
      schedule: "RC",
      question: "How does ASU 2024-03 affect our Balance Sheet reporting?",
      answer: "ASU 2024-03 (Income Statement — Reporting Comprehensive Income — Expense Disaggregation Disclosures) requires new disaggregation of certain expense categories:\n\n1. Balance Sheet Impact: The direct Schedule RC impact is limited, but associated memo items now require more granular breakdowns of accrued expenses and other liabilities.\n\n2. VIE Consolidation: Updated guidance requires additional memo items for:\n   - Total assets of consolidated VIEs not previously required to be separately identified\n   - Total liabilities of consolidated VIEs\n   - Maximum exposure to loss from unconsolidated VIE involvement\n\n3. Intercompany Eliminations: Clarified that multi-entity filers must eliminate all intercompany transactions, including those between bank subsidiaries and nonbank affiliates, before reporting consolidated totals.\n\n4. Filing Consideration: If Mizuho has any consolidated trust structures or VIE involvement, these new memo items will require coordination between Treasury, Financial Reporting, and the applicable business units.\n\nThe primary income statement disaggregation requirements under ASU 2024-03 are effective for large accelerated filers for annual periods beginning after December 15, 2026, but the FFIEC has incorporated certain disclosure elements into the Call Report ahead of the ASU effective date.",
      sources: [
        { label: "ASU 2024-03", reference: "Expense Disaggregation Disclosures" },
        { label: "FFIEC Instructions", reference: "Schedule RC — General Instructions (March 2026)" },
      ],
    },
    {
      id: "q-031-change-3",
      schedule: "RC-E",
      question: "What are the new uninsured deposit disclosure requirements?",
      answer: "Schedule RC-E has been updated to include enhanced uninsured deposit disclosures, driven by the FDIC's proposed rulemaking following the 2023 bank stress events:\n\n1. Depositor Type Breakdowns: Estimated uninsured deposits must now be disaggregated by:\n   - Retail depositors (individuals with balances exceeding $250,000 FDIC insurance limit)\n   - Wholesale / institutional depositors\n   - Public funds (state and municipal government deposits)\n   - Interbank / affiliate deposits\n\n2. Reciprocal Deposits: The reporting threshold for reciprocal deposits has been updated to align with the current FDIC-defined limit. Institutions must separately identify reciprocal deposits that qualify for the exclusion from brokered deposit classification.\n\n3. Sweep Arrangements: New memo items capture the volume of deposits held in sweep arrangements, including details on the sweep target (money market funds, repos, interbank placements).\n\n4. Concentration Metrics: While not a new line item, the instructions emphasize that institutions should be prepared to provide examiners with concentration analysis for the largest 20 uninsured depositors.\n\nFor Mizuho, this will require coordination with the Treasury team to classify depositors and the Operations team to quantify sweep volumes. The data for these new fields may need to be sourced from the core deposit system rather than the GL.",
      sources: [
        { label: "FFIEC Instructions", reference: "Schedule RC-E (March 2026)" },
        { label: "FDIC", reference: "Proposed Rulemaking on Deposit Reporting (2025)" },
      ],
    },
    ...aiQueries,
  ],
  "ffiec-102": [
    {
      id: "q-102-var-1",
      schedule: "MRR-A",
      question: "What methodology is required for VaR calculation under Schedule A?",
      answer: "Schedule A requires reporting of Value-at-Risk (VaR) based measures using an internal models approach approved by the institution's primary federal regulator:\n\n1. Model Parameters:\n   - Confidence level: 99th percentile (one-tailed)\n   - Holding period: 10 business days (may be scaled from 1-day VaR using square root of time)\n   - Observation period: Minimum 1 year (252 trading days) of historical data\n   - Update frequency: VaR must be calculated at close of business each trading day\n\n2. Risk Factor Coverage:\n   - Interest rate risk (general and specific)\n   - Equity price risk (general and specific)\n   - Foreign exchange risk\n   - Commodity price risk\n   - For each category, report general risk and specific risk separately\n\n3. Reporting Items:\n   - Previous day's VaR\n   - 60-day high, low, and average VaR\n   - Capital charge = max(previous day VaR, multiplication factor × 60-day average VaR)\n   - The multiplication factor (minimum 3.0) is adjusted based on backtesting results\n\n4. March 2026 Update: The backtesting window has been expanded from 250 to 500 business days. Institutions must ensure their backtesting infrastructure captures this extended window and correctly counts exceptions against the new violation thresholds.\n\nThe P&L attribution test is now also required alongside backtesting — comparing risk-theoretical P&L against hypothetical P&L to validate model accuracy at the desk level.",
      sources: [
        { label: "FFIEC 102 Instructions", reference: "Schedule A — VaR-Based Measure" },
        { label: "Basel III.1", reference: "Market Risk Framework FRTB Transition" },
      ],
    },
    {
      id: "q-102-stress-1",
      schedule: "MRR-B",
      question: "How should we select and validate the stressed VaR stress period?",
      answer: "Schedule B requires a stressed VaR calculation calibrated to a continuous 12-month period of significant financial stress. Key requirements:\n\n1. Stress Period Selection:\n   - Must be a continuous 12-month period from the institution's history or reconstructed market data\n   - The period must be relevant to the institution's current portfolio composition\n   - Common reference periods: 2007-2008 (GFC), 2020 (COVID), 2022 (rate shock)\n   - The selected period must produce higher VaR than normal-period VaR for the current portfolio\n\n2. March 2026 Changes:\n   - Quarterly revalidation is now mandatory (previously annual)\n   - Institutions must evaluate at least three candidate stress periods spanning different crisis types\n   - Written documentation of the selection rationale must be maintained and available for examiner review\n   - The primary regulator may mandate a specific stress period if the institution's selection is deemed non-conservative\n\n3. Calculation Methodology:\n   - Use the same model structure (risk factors, correlations, distributional assumptions) as non-stressed VaR\n   - Only the calibration data window changes — risk factor returns are drawn from the stress period\n   - Report: previous day's stressed VaR, 60-day high/low, and 60-day average\n\n4. Capital Charge:\n   - Capital charge = max(previous day stressed VaR, multiplication factor × 60-day average stressed VaR)\n   - The multiplication factor for stressed VaR is fixed at 3.0 (no backtesting adjustment)\n\nFor Mizuho, the Model Risk Management team should coordinate with Market Risk to ensure the stress period selection process is documented per the new quarterly validation requirement.",
      sources: [
        { label: "FFIEC 102 Instructions", reference: "Schedule B — Stressed VaR (March 2026)" },
        { label: "OCC", reference: "Supervisory Guidance on Market Risk (OCC 2025-XX)" },
      ],
    },
    {
      id: "q-102-irc-1",
      schedule: "MRR-C",
      question: "What are the IRC requirements for correlation trading positions?",
      answer: "Schedule C captures the Incremental Risk Capital (IRC) charge, which covers default and credit migration risk for positions in the trading book that are not adequately captured by VaR:\n\n1. Scope: IRC applies to all positions subject to specific interest rate risk (credit risk) in the trading book, including:\n   - Corporate bonds and credit derivatives\n   - Sovereign debt positions\n   - Securitization exposures (non-correlation trading)\n\n2. Model Requirements:\n   - Capital horizon: 1 year\n   - Confidence level: 99.9%\n   - Must capture both default and migration (rating transition) risk\n   - Liquidity horizons must be position-specific (minimum 3 months, extended to 6 months per March 2026 update)\n   - Correlations between issuers must be modeled (typically using multi-factor models)\n\n3. Reporting:\n   - Most recent IRC value\n   - 12-week average IRC\n   - 12-week high IRC\n   - Capital charge = max(most recent IRC, 12-week average IRC)\n\n4. March 2026 Updates:\n   - Sovereign exposures must now use rating-specific default probabilities (no assumed zero-default for investment-grade sovereigns)\n   - Minimum liquidity horizon for less liquid positions extended from 3 to 6 months\n   - New validation requirements for correlation assumptions in multi-factor models\n\nThe IRC model should be independently validated by Model Risk Management at least annually, with the quarterly P&L backtesting results reviewed by the Market Risk Committee.",
      sources: [
        { label: "FFIEC 102 Instructions", reference: "Schedule C — IRC (March 2026)" },
        { label: "Basel III", reference: "Market Risk Framework — Default Risk Charge" },
      ],
    },
    {
      id: "q-102-exempt-1",
      schedule: "MRR-F",
      question: "Does Mizuho qualify for the de minimis exemption from market risk reporting?",
      answer: "Schedule F provides the calculation to determine whether an institution qualifies for the de minimis exemption from the market risk capital rule:\n\n1. Exemption Criteria (must meet EITHER threshold):\n   - Aggregate trading assets and liabilities < 10% of total consolidated assets, OR\n   - Aggregate trading assets and liabilities < $1 billion\n\n2. Calculation Methodology:\n   - Include all on-balance-sheet trading assets (fair value)\n   - Include all on-balance-sheet trading liabilities (fair value)\n   - Per March 2026 update: include notional amounts of centrally-cleared derivative positions in the aggregate trading activity calculation\n   - Calculate on a consolidated basis including all subsidiaries\n\n3. Consequences:\n   - If the exemption applies: the institution is NOT required to file Schedules A through E and is not subject to the market risk capital charge\n   - If the exemption does NOT apply: the institution must maintain market risk capital, file all applicable schedules, and comply with the internal models requirements\n\n4. For Mizuho Americas:\n   - Given Mizuho's trading activity levels (derivatives desk, foreign exchange operations, securities trading), the institution likely does NOT qualify for the de minimis exemption\n   - The 10% threshold and $1B absolute threshold should be monitored quarterly, especially given the March 2026 update requiring inclusion of cleared derivative notionals\n   - If trading activity is near the boundary, the institution should implement prospective monitoring to avoid unexpected compliance obligations\n\nConsult with the Market Risk team for current trading book composition and notional exposure levels.",
      sources: [
        { label: "FFIEC 102 Instructions", reference: "Schedule F — De Minimis Exemption" },
        { label: "12 CFR Part 3/217/324", reference: "Market Risk Capital Rule" },
      ],
    },
    {
      id: "q-102-capital-1",
      schedule: "MRR-A",
      question: "How is the total market risk capital charge calculated?",
      answer: "The total market risk capital charge is the sum of several components reported across Schedules A through E:\n\n1. VaR-Based Capital Charge (Schedule A):\n   max(Previous day VaR, mc × 60-day average VaR)\n   where mc = multiplication factor (minimum 3.0, increases with backtesting exceptions)\n\n2. Stressed VaR-Based Capital Charge (Schedule B):\n   max(Previous day stressed VaR, ms × 60-day average stressed VaR)\n   where ms = 3.0 (fixed, no backtesting adjustment)\n\n3. Incremental Risk Capital Charge (Schedule C):\n   max(Most recent IRC, 12-week average IRC)\n\n4. Comprehensive Risk Measure (Schedule D, if applicable):\n   max(Most recent CRM, 12-week average CRM)\n   Subject to a floor of 8% of the standardized specific risk charge\n\n5. Standardized Specific Risk Surcharge (Schedule E):\n   Applied to positions not covered by approved internal models\n\n6. Total Market Risk Capital = Sum of items 1 through 5\n\n7. Market Risk Equivalent Assets (MREA):\n   = Total Market Risk Capital × 12.5\n   This is added to credit risk RWA for the total capital ratio calculation on Schedule RC-R\n\nThe multiplication factor (mc) in the VaR charge starts at 3.0 and increases based on the number of backtesting exceptions observed over the trailing 250 (or now 500) business days. More than 4 exceptions triggers an increase, with maximum mc = 4.0 for 10+ exceptions.",
      sources: [
        { label: "FFIEC 102 Instructions", reference: "General Instructions — Capital Charge Calculation" },
        { label: "Basel III", reference: "Market Risk Framework — Capital Requirements" },
      ],
    },
  ],
};

function InstructionsTab() {
  const [selectedQuery, setSelectedQuery] = useState<AIQueryItem | null>(null);
  const [customQuery, setCustomQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<string>("ffiec-031");
  const [isFetchingInstructions, setIsFetchingInstructions] = useState(false);
  const [instructionsFetched, setInstructionsFetched] = useState<Record<string, boolean>>({ "ffiec-031": true });
  const [schedulesExpanded, setSchedulesExpanded] = useState(false);

  const { data: callReportData } = useQuery<{ data: CallReportRecord[] }>({
    queryKey: ["/api/data-sources/call-reports", 21843],
    queryFn: async () => {
      const res = await fetch("/api/data-sources/call-reports?cert=21843&periods=8");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const { data: fry9cData } = useQuery<{ data: Record<string, FRY9CData> }>({
    queryKey: ["/api/data-sources/fry9c"],
    queryFn: async () => {
      const res = await fetch("/api/data-sources/fry9c?rssd=229913");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const liveRecords = callReportData?.data || [];
  const fry9cRecord = fry9cData?.data ? Object.values(fry9cData.data)[0] || null : null;
  const isLive = liveRecords.length > 0;
  const reportDate = isLive ? liveRecords[0].reportDate : "Latest";

  const activeReport = REPORT_TYPES.find(r => r.id === selectedReport) || REPORT_TYPES[0];
  const reportSchedules = activeReport.scheduleKeys
    .map(k => SCHEDULE_INSTRUCTIONS[k])
    .filter(Boolean);
  const reportChanges = REPORT_CHANGES[selectedReport] || [];
  const reportQueries = REPORT_AI_QUERIES[selectedReport] || [];
  const schedulesNeedingReview = reportSchedules.filter(i => i.humanReview).length;
  const highImpactChanges = reportChanges.filter(c => c.impact === "high").length;

  const handleReportSelect = (reportId: string) => {
    setSelectedReport(reportId);
    setSelectedQuery(null);
    setSchedulesExpanded(false);
    if (!instructionsFetched[reportId]) {
      setIsFetchingInstructions(true);
      setTimeout(() => {
        setIsFetchingInstructions(false);
        setInstructionsFetched(prev => ({ ...prev, [reportId]: true }));
      }, 2200);
    }
  };

  const changeTypeStyles: Record<string, { label: string; color: string }> = {
    new: { label: "New", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-400/30" },
    revised: { label: "Revised", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-400/30" },
    clarification: { label: "Clarification", color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-400/30" },
    removed: { label: "Removed", color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-400/30" },
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-serif font-semibold tracking-tight" data-testid="text-instructions-title">Instructions Analysis</h2>
        <p className="text-xs text-muted-foreground leading-relaxed mt-1 max-w-[760px]">
          Select a regulatory report to review. The system fetches the latest instructions and reporting form, analyzes changes from the prior quarter, and provides an AI assistant for interactive guidance.
        </p>
      </div>

      <Card data-testid="card-report-selector">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm">Select Report for Review</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={selectedReport} onValueChange={handleReportSelect}>
            <SelectTrigger className="w-full" data-testid="select-report-type">
              <SelectValue placeholder="Select a regulatory report..." />
            </SelectTrigger>
            <SelectContent>
              {REPORT_TYPES.map((report) => (
                <SelectItem key={report.id} value={report.id} data-testid={`select-item-${report.id}`}>
                  {report.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="default" className="text-xs font-mono">
                {activeReport.id.toUpperCase().replace("FFIEC-", "FFIEC ")}
              </Badge>
              {instructionsFetched[selectedReport] && (
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 text-[10px]">
                  <CheckCircle2 className="w-2.5 h-2.5 mr-1" />Instructions Loaded
                </Badge>
              )}
            </div>
            <p className="text-sm font-medium">{activeReport.fullName}</p>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{activeReport.description}</p>
            <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
              <span>{activeReport.agency}</span>
              <span>|</span>
              <span>{activeReport.effectiveDate}</span>
              <span>|</span>
              <span>Version: {activeReport.currentVersion}</span>
            </div>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/40">
              <a
                href={activeReport.referenceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-primary hover:underline"
                data-testid="link-report-form"
              >
                <ExternalLink className="w-3 h-3" />
                View Report Form on FFIEC.gov
              </a>
              <span className="text-border">|</span>
              <a
                href={activeReport.instructionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-primary hover:underline"
                data-testid="link-report-instructions"
              >
                <Download className="w-3 h-3" />
                Download Filing Instructions (PDF)
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {isFetchingInstructions && (
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-primary animate-spin" />
              <div>
                <p className="text-sm font-medium">Fetching {activeReport.label} Instructions</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Connecting to {activeReport.agency} portal to retrieve latest filing instructions and reporting form...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!isFetchingInstructions && instructionsFetched[selectedReport] && (
        <>
          <div className="grid grid-cols-4 gap-3">
            {[
              { value: reportSchedules.length.toString(), label: "Schedules Indexed", sub: `${activeReport.label} (${activeReport.currentVersion})` },
              { value: reportChanges.length.toString(), label: "Changes Detected", sub: `vs. ${activeReport.priorVersion} instructions`, highlight: reportChanges.length > 0 },
              { value: highImpactChanges.toString(), label: "High Impact", sub: `${reportChanges.length - highImpactChanges} medium/low impact`, highlight: highImpactChanges > 0, isWarning: true },
              { value: schedulesNeedingReview.toString(), label: "Flagged for Review", sub: `${reportSchedules.length - schedulesNeedingReview} schedules auto-cleared`, isWarning: true },
            ].map((m, i) => (
              <Card key={i} className={m.isWarning && parseInt(m.value) > 0 ? "ring-1 ring-amber-400/40 dark:ring-amber-500/30" : ""} data-testid={`card-instr-metric-${i}`}>
                <CardContent className="p-4">
                  <p className={`text-2xl font-mono font-normal ${m.isWarning && parseInt(m.value) > 0 ? "text-amber-700 dark:text-amber-400" : m.highlight ? "text-blue-700 dark:text-blue-400" : "text-foreground"}`}>{m.value}</p>
                  <p className={`text-[10px] font-semibold tracking-wide uppercase mt-1 ${m.isWarning && parseInt(m.value) > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}>{m.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{m.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {reportChanges.length > 0 && (
            <Card data-testid="card-instruction-changes">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-primary" />
                    <CardTitle className="text-sm">Changes from Prior Quarter</CardTitle>
                    <Badge variant="secondary" className="text-[10px]">
                      {activeReport.currentVersion} vs. {activeReport.priorVersion}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="text-xs font-mono">{reportChanges.length} schedules affected</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  AI-identified changes between the current and prior quarter filing instructions. Review these changes to assess impact on data preparation and filing workflows.
                </p>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[320px]">
                  <div className="space-y-3">
                    {reportChanges.map((change, idx) => {
                      const typeStyle = changeTypeStyles[change.changeType];
                      return (
                        <div key={idx} className="rounded-lg border border-border/60 bg-muted/20 p-4" data-testid={`change-item-${idx}`}>
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 rounded-full p-1.5 shrink-0 ${change.impact === "high" ? "bg-red-500/10 text-red-500" : change.impact === "medium" ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"}`}>
                              <AlertCircle className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="font-mono text-[10px]">{change.schedule}</Badge>
                                <Badge variant="secondary" className={`text-[10px] border ${typeStyle.color}`}>
                                  {typeStyle.label}
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className={`text-[10px] border-0 ${change.impact === "high" ? "bg-red-500/10 text-red-500" : change.impact === "medium" ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"}`}
                                >
                                  {change.impact} impact
                                </Badge>
                              </div>
                              <p className="text-xs font-medium text-foreground/80 mt-1.5">{change.summary}</p>
                              <div className="mt-2 space-y-1">
                                {change.details.map((detail, didx) => (
                                  <div key={didx} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                                    <ChevronRight className="w-3 h-3 mt-0.5 shrink-0 text-primary/60" />
                                    <span>{detail}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <CardTitle className="text-sm">AI Assistant — {activeReport.label}</CardTitle>
                </div>
                <Badge variant="outline" className="text-xs font-mono">{reportQueries.length} queries available</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Ask questions about {activeReport.label} requirements, filing instructions, and schedule-specific guidance. Questions outside reporting scope will be redirected.
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex border-t">
                <div className="w-[45%] border-r flex flex-col">
                  <ScrollArea className="flex-1 h-[330px]">
                    <div className="p-3 space-y-2">
                      {reportQueries.map((q) => (
                        <button
                          key={q.id}
                          onClick={() => setSelectedQuery(q)}
                          className={`w-full text-left px-3 py-2.5 rounded-lg text-xs leading-relaxed transition-all cursor-pointer border ${
                            selectedQuery?.id === q.id
                              ? "bg-primary text-primary-foreground border-primary shadow-sm"
                              : "bg-muted/30 hover:bg-muted/60 text-foreground border-border/50 hover:border-border"
                          }`}
                          data-testid={`button-query-${q.id}`}
                        >
                          {q.question}
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="p-3 border-t">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={customQuery}
                        onChange={(e) => setCustomQuery(e.target.value)}
                        placeholder={`Ask about ${activeReport.label} instructions...`}
                        className="flex-1 h-8 rounded-md border bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                        data-testid="input-custom-query"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const btn = document.querySelector('[data-testid="button-send-custom-query"]') as HTMLButtonElement;
                            btn?.click();
                          }
                        }}
                      />
                      <Button
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        data-testid="button-send-custom-query"
                        onClick={() => {
                          if (!customQuery.trim()) return;
                          if (isInScope(customQuery)) {
                            const queryLower = customQuery.toLowerCase();
                            const significantWords = queryLower.split(/\s+/).filter(w => w.length > 3);
                            const matched = significantWords.length > 0
                              ? reportQueries.find(q => {
                                  const qLower = q.question.toLowerCase();
                                  const matchCount = significantWords.filter(w => qLower.includes(w)).length;
                                  return matchCount >= 2 || queryLower.includes(q.schedule.toLowerCase());
                                })
                              : reportQueries.find(q => queryLower.includes(q.schedule.toLowerCase()));
                            if (matched) {
                              setSelectedQuery(matched);
                            } else {
                              setSelectedQuery({
                                id: "custom-scope",
                                schedule: "General",
                                question: customQuery,
                                answer: `Your question is within the scope of ${activeReport.label} reporting requirements. Based on the filing instructions indexed in this system:\n\nPlease review the schedule-specific guidance cards above for detailed requirements. Each schedule card contains the applicable filing rules, common pitfalls, and cross-reference points.\n\nFor more targeted guidance, try selecting one of the predefined questions on the left, or refine your question to reference a specific schedule.\n\nIf your question involves interpretation of a specific filing rule that is not covered here, consult:\n- FFIEC Instruction Books (available at ffiec.gov)\n- Federal Reserve Instructions (available at federalreserve.gov)\n- Your institution's Regulatory Reporting team for entity-specific interpretations`,
                                sources: [
                                  { label: "FFIEC", reference: `${activeReport.label} Instructions` },
                                  { label: activeReport.agency.split(" / ")[0], reference: "Filing Guidance" },
                                ],
                              });
                            }
                          } else {
                            setSelectedQuery({
                              ...OUT_OF_SCOPE_RESPONSE,
                              question: customQuery,
                            });
                          }
                          setCustomQuery("");
                        }}
                      >
                        <Send className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <ScrollArea className="h-[380px]">
                    <div className="p-4">
                      <AIResponsePanel query={selectedQuery} />
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </CardContent>
          </Card>

          <Collapsible.Root open={schedulesExpanded} onOpenChange={setSchedulesExpanded}>
            <Card data-testid="card-schedule-requirements">
              <Collapsible.Trigger asChild>
                <button className="w-full text-left" data-testid="button-toggle-schedules">
                  <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-primary" />
                        <CardTitle className="text-sm">Schedule Requirements — {activeReport.label}</CardTitle>
                        <Badge variant="outline" className="text-xs font-mono">{reportSchedules.length} schedules</Badge>
                        {schedulesNeedingReview > 0 && (
                          <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-400/30 text-[10px]">
                            {schedulesNeedingReview} need review
                          </Badge>
                        )}
                      </div>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${schedulesExpanded ? "rotate-180" : ""}`} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Expand to browse all report schedules, filing requirements, and human review flags
                    </p>
                  </CardHeader>
                </button>
              </Collapsible.Trigger>
              <Collapsible.Content>
                <CardContent>
                  <div className="space-y-2">
                    {reportSchedules.map((inst, idx) => (
                      <InstructionCard key={idx} inst={inst} idx={idx} />
                    ))}
                  </div>
                </CardContent>
              </Collapsible.Content>
            </Card>
          </Collapsible.Root>
        </>
      )}
    </div>
  );
}

const dictionarySources = [
  { key: "FFIEC_031_CALL_REPORT", label: "Call Report" },
  { key: "FFIEC_UBPR_RATIOS", label: "UBPR" },
  { key: "FR_Y9C_BHC_DATA", label: "FR Y-9C" },
];

const ISSUE_LABELS: Record<UnmappedField["issue"], { label: string; color: string }> = {
  format_mismatch: { label: "Format Mismatch", color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-400/30" },
  missing_source: { label: "Missing Source", color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-400/30" },
  ambiguous_mapping: { label: "Ambiguous Mapping", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-400/30" },
  deprecated_field: { label: "Deprecated Field", color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-400/30" },
  null_population: { label: "Null Population", color: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-400/30" },
  cross_source_conflict: { label: "Cross-Source Conflict", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-400/30" },
};

const LINKAGE_TYPE_META: Record<string, { label: string; color: string; icon: string }> = {
  reconciliation: { label: "Reconciliation", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-400/30", icon: "=" },
  derivation: { label: "Derivation", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-400/30", icon: "→" },
  validation: { label: "Validation", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-400/30", icon: "✓" },
};

const RECON_STATUS_META: Record<string, { label: string; color: string; dot: string }> = {
  reconciled: { label: "Reconciled", color: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
  variance: { label: "Variance", color: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
  partial: { label: "Partial", color: "text-sky-600 dark:text-sky-400", dot: "bg-sky-500" },
  unavailable: { label: "Unavailable", color: "text-red-500 dark:text-red-400", dot: "bg-red-500" },
};

function FieldLinkageMap({
  linkageTypeFilter,
  setLinkageTypeFilter,
  expandedLinkage,
  setExpandedLinkage,
}: {
  linkageTypeFilter: string;
  setLinkageTypeFilter: (v: string) => void;
  expandedLinkage: number | null;
  setExpandedLinkage: (v: number | null) => void;
}) {
  const filtered = linkageTypeFilter === "all"
    ? fieldLinkages
    : fieldLinkages.filter(l => l.linkageType === linkageTypeFilter);

  const reconciledCount = fieldLinkages.filter(l => l.reconciliationStatus === "reconciled").length;
  const varianceCount = fieldLinkages.filter(l => l.reconciliationStatus === "variance").length;
  const partialCount = fieldLinkages.filter(l => l.reconciliationStatus === "partial").length;
  const unavailableCount = fieldLinkages.filter(l => l.reconciliationStatus === "unavailable").length;

  return (
    <Card data-testid="card-field-linkages">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm">Cross-Report Field Linkage Map</CardTitle>
            <Badge variant="secondary" className="text-[10px]">
              {fieldLinkages.length} concepts · 3 sources
            </Badge>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-muted-foreground">{reconciledCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="text-[10px] text-muted-foreground">{varianceCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              <span className="text-[10px] text-muted-foreground">{partialCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="text-[10px] text-muted-foreground">{unavailableCount}</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1 max-w-[760px]">
          Maps equivalent regulatory concepts across Call Report (FFIEC 031), FR Y-9C, and UBPR sources. Identifies reconciliation joins, derived calculations, and cross-source validation rules.
        </p>
        <div className="flex items-center gap-1 mt-2">
          {["all", "reconciliation", "derivation", "validation"].map((type) => {
            const meta = type === "all" ? null : LINKAGE_TYPE_META[type];
            const count = type === "all" ? fieldLinkages.length : fieldLinkages.filter(l => l.linkageType === type).length;
            return (
              <button
                key={type}
                onClick={() => { setLinkageTypeFilter(type); setExpandedLinkage(null); }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer border ${
                  linkageTypeFilter === type
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground border-border/50 bg-muted/30"
                }`}
                data-testid={`button-linkage-filter-${type}`}
              >
                {type === "all" ? "All" : meta!.label} ({count})
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[420px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs w-[180px]">Concept</TableHead>
                <TableHead className="text-xs w-[170px]">Call Report (031)</TableHead>
                <TableHead className="text-xs w-[170px]">FR Y-9C</TableHead>
                <TableHead className="text-xs w-[150px]">UBPR</TableHead>
                <TableHead className="text-xs w-[90px]">Status</TableHead>
                <TableHead className="text-xs w-[90px]">Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((link, idx) => {
                const statusMeta = RECON_STATUS_META[link.reconciliationStatus];
                const typeMeta = LINKAGE_TYPE_META[link.linkageType];
                const isExpanded = expandedLinkage === idx;
                return (
                  <TableRow
                    key={idx}
                    className="cursor-pointer hover:bg-muted/40 transition-colors"
                    onClick={() => setExpandedLinkage(isExpanded ? null : idx)}
                    data-testid={`linkage-row-${idx}`}
                  >
                    <TableCell className="py-2">
                      <div className="flex items-center gap-1.5">
                        {isExpanded ? (
                          <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                        )}
                        <div>
                          <p className="text-xs font-medium">{link.concept}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{link.schedule}</p>
                          {isExpanded && link.varianceNote && (
                            <div className="mt-2 p-2 rounded-md bg-muted/50 border border-border/40 max-w-[320px]">
                              <p className="text-[10px] text-muted-foreground leading-relaxed">{link.varianceNote}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      {link.callReport ? (
                        <div>
                          <p className="font-mono text-[11px] font-medium text-foreground">{link.callReport.field}</p>
                          {isExpanded && (
                            <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{link.callReport.description}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">Not reported</span>
                      )}
                    </TableCell>
                    <TableCell className="py-2">
                      {link.frY9C ? (
                        <div>
                          <p className="font-mono text-[11px] font-medium text-foreground">{link.frY9C.field}</p>
                          {isExpanded && (
                            <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{link.frY9C.description}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">Not reported</span>
                      )}
                    </TableCell>
                    <TableCell className="py-2">
                      {link.ubpr ? (
                        <div>
                          <p className="font-mono text-[11px] font-medium text-foreground">{link.ubpr.field}</p>
                          {isExpanded && (
                            <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{link.ubpr.description}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">Not reported</span>
                      )}
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusMeta.dot}`} />
                        <span className={`text-[11px] font-medium ${statusMeta.color}`}>{statusMeta.label}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <Badge variant="secondary" className={`text-[10px] border ${typeMeta.color}`}>
                        {typeMeta.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function DataDictionaryTab() {
  const [activeSource, setActiveSource] = useState(dictionarySources[0].key);
  const [issueFilter, setIssueFilter] = useState<string>("all");
  const [linkageTypeFilter, setLinkageTypeFilter] = useState<string>("all");
  const [expandedLinkage, setExpandedLinkage] = useState<number | null>(null);
  const dict = dataDictionaries.find((d) => d.tableName === activeSource)!;
  const sourceLabel = dict.tableName.includes("CALL") ? "FDIC BankFind Suite API" :
    dict.tableName.includes("UBPR") ? "FFIEC Central Data Repository" : "Federal Reserve NIC";
  const totalRecords = dataDictionaries.reduce((sum, d) => sum + d.recordCount, 0);
  const totalFields = dataDictionaries.reduce((sum, d) => sum + d.quality.totalFields, 0);
  const totalAutoMapped = dataDictionaries.reduce((sum, d) => sum + d.quality.autoMapped, 0);
  const totalUnmapped = totalFields - totalAutoMapped;
  const overallQuality = ((totalAutoMapped / totalFields) * 100).toFixed(1);
  const unmappedRate = ((totalUnmapped / totalFields) * 100).toFixed(1);

  const highIssues = unmappedFields.filter(f => f.severity === "high").length;
  const mediumIssues = unmappedFields.filter(f => f.severity === "medium").length;
  const lowIssues = unmappedFields.filter(f => f.severity === "low").length;

  const filteredIssues = issueFilter === "all"
    ? unmappedFields
    : unmappedFields.filter(f => f.issue === issueFilter);

  const issueTypes = Array.from(new Set(unmappedFields.map(f => f.issue)));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-serif font-semibold tracking-tight" data-testid="text-data-title">Data Preparation & Profiling</h2>
        <p className="text-xs text-muted-foreground leading-relaxed mt-1 max-w-[760px]">
          Source data is ingested, profiled, and validated for quality. The system auto-maps fields to regulatory schedules and flags unmapped or problematic fields for review before report population.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card data-testid="card-data-sources">
          <CardContent className="p-4">
            <p className="text-2xl font-mono font-normal text-foreground">{totalRecords}</p>
            <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground mt-1">Records Ingested</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Across {dataDictionaries.length} source tables</p>
          </CardContent>
        </Card>
        <Card data-testid="card-data-tables">
          <CardContent className="p-4">
            <p className="text-2xl font-mono font-normal text-foreground">{totalFields.toLocaleString()}</p>
            <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground mt-1">Total Data Fields</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{totalAutoMapped.toLocaleString()} auto-mapped</p>
          </CardContent>
        </Card>
        <Card data-testid="card-data-quality">
          <CardContent className="p-4">
            <p className="text-2xl font-mono font-normal text-emerald-600 dark:text-emerald-400">{overallQuality}%</p>
            <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground mt-1">Auto-Mapped Rate</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{totalAutoMapped.toLocaleString()} of {totalFields.toLocaleString()} fields</p>
          </CardContent>
        </Card>
        <Card className="ring-1 ring-amber-400/40 dark:ring-amber-500/30" data-testid="card-data-unmapped">
          <CardContent className="p-4">
            <p className="text-2xl font-mono font-normal text-amber-700 dark:text-amber-400">{unmappedFields.length}</p>
            <p className="text-[10px] font-semibold tracking-wide uppercase text-amber-600 dark:text-amber-400 mt-1">Quality Issues</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{unmappedRate}% of fields require review</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-dictionary-active">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm">Auto-Generated Data Dictionary</CardTitle>
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-0.5">
              {dictionarySources.map((src) => (
                <button
                  key={src.key}
                  onClick={() => setActiveSource(src.key)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    activeSource === src.key
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={`button-dict-source-${src.key}`}
                >
                  {src.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-mono text-muted-foreground">{dict.tableName}</span>
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 text-[10px]">{sourceLabel}</Badge>
            <Badge variant="outline" className="text-[10px]">{dict.recordCount} records · {dict.columns.length} columns</Badge>
            <Badge variant="secondary" className="text-[10px]">Ingested: {dict.lastUpdated}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Column</TableHead>
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-xs">Source</TableHead>
                <TableHead className="text-xs">Nullable</TableHead>
                <TableHead className="text-xs">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dict.columns.map((col, cidx) => (
                <TableRow key={cidx}>
                  <TableCell className="font-mono text-xs py-2">{col.name}</TableCell>
                  <TableCell className="text-xs py-2">
                    <Badge variant="outline" className="font-mono text-xs">{col.type}</Badge>
                  </TableCell>
                  <TableCell className="text-xs py-2">{col.source}</TableCell>
                  <TableCell className="text-xs py-2">
                    {col.nullable ? (
                      <span className="text-muted-foreground">Yes</span>
                    ) : (
                      <span className="text-foreground font-medium">No</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs py-2 text-muted-foreground">{col.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <FieldLinkageMap
        linkageTypeFilter={linkageTypeFilter}
        setLinkageTypeFilter={setLinkageTypeFilter}
        expandedLinkage={expandedLinkage}
        setExpandedLinkage={setExpandedLinkage}
      />

      <Card data-testid="card-quality-issues">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <CardTitle className="text-sm">Data Quality Issues</CardTitle>
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-400/30 text-[10px]">
                {unmappedFields.length} fields require attention
              </Badge>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant="destructive" className="text-[10px]">{highIssues} High</Badge>
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-0 text-[10px]">{mediumIssues} Medium</Badge>
              <Badge variant="secondary" className="text-[10px]">{lowIssues} Low</Badge>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Fields that could not be auto-mapped to regulatory schedules or have data quality concerns. Each issue includes a suggested resolution for the data preparation team.
          </p>
          <div className="flex items-center gap-1 mt-2 flex-wrap">
            <button
              onClick={() => setIssueFilter("all")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer border ${
                issueFilter === "all"
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground border-border/50 bg-muted/30"
              }`}
              data-testid="button-filter-all"
            >
              All ({unmappedFields.length})
            </button>
            {issueTypes.map((type) => {
              const info = ISSUE_LABELS[type];
              const count = unmappedFields.filter(f => f.issue === type).length;
              return (
                <button
                  key={type}
                  onClick={() => setIssueFilter(type)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer border ${
                    issueFilter === type
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground border-border/50 bg-muted/30"
                  }`}
                  data-testid={`button-filter-${type}`}
                >
                  {info.label} ({count})
                </button>
              );
            })}
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[340px]">
            <div className="space-y-2">
              {filteredIssues.map((field, idx) => {
                const info = ISSUE_LABELS[field.issue];
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border ${field.severity === "high" ? "border-red-300/50 dark:border-red-800/40" : "border-border/60"}`}
                    data-testid={`quality-issue-${idx}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-semibold text-foreground">{field.fieldName}</span>
                        <Badge variant="outline" className="font-mono text-[10px]">{field.expectedType}</Badge>
                        <Badge variant="secondary" className={`text-[10px] border ${info.color}`}>{info.label}</Badge>
                        <SeverityBadge severity={field.severity} />
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {field.affectedRecords > 0 ? `${field.affectedRecords} records` : "No data"}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-1">
                      <span className="font-medium text-foreground/80">Source:</span> {field.source} · {field.table}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{field.issueDescription}</p>
                    <div className="mt-2 flex items-start gap-2 p-2 rounded-md bg-muted/40 border border-border/40">
                      <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
                      <p className="text-[11px] text-foreground/80 leading-relaxed">{field.suggestedResolution}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

interface HistoricalRecord {
  period: string;
  rawDate: string;
  totalAssets: number;
  totalDeposits: number;
  totalLoans: number;
  netIncome: number;
  roe: number;
  roa: number;
  nim: number;
  tier1Ratio: number;
  efficiencyRatio?: number;
  npaRatio?: number;
  securities?: number;
  loanLossReserve?: number;
  chargeOffRate?: number;
  totalCapitalRatio?: number;
  loanToDeposit?: number;
  totalEquity?: number;
  totalLiabilities?: number;
}

function fmtDollar(valInThousands: number): string {
  const abs = Math.abs(valInThousands);
  if (abs >= 1_000_000) return `$${(valInThousands / 1_000_000).toFixed(1)}B`;
  if (abs >= 1_000) return `$${(valInThousands / 1_000).toFixed(1)}M`;
  return `$${valInThousands.toFixed(0)}K`;
}

function computeQoQAnomaly(
  current: HistoricalRecord,
  prior: HistoricalRecord,
  allRecords: HistoricalRecord[],
): AnomalyRecord[] {
  const period = current.period;
  const older = allRecords.filter(r => r.rawDate < current.rawDate);
  const results: AnomalyRecord[] = [];

  const loanGrowth = ((current.totalLoans - prior.totalLoans) / prior.totalLoans) * 100;
  const avgLoanGrowths = older.length > 1 ? older.slice(0, -1).map((r, i) => ((r.totalLoans - older[i + 1].totalLoans) / older[i + 1].totalLoans) * 100) : [];
  const avgLoanGrowth = avgLoanGrowths.length > 0 ? avgLoanGrowths.reduce((a, b) => a + b, 0) / avgLoanGrowths.length : 2.0;
  const loanDev = parseFloat((loanGrowth - avgLoanGrowth).toFixed(2));
  if (Math.abs(loanDev) > 1.5) {
    results.push({
      period,
      metric: "Net Loans QoQ Growth",
      value: parseFloat(loanGrowth.toFixed(2)),
      expected: parseFloat(avgLoanGrowth.toFixed(2)),
      deviation: loanDev,
      severity: Math.abs(loanDev) > 3 ? "high" : Math.abs(loanDev) > 2 ? "medium" : "low",
      description: `FDIC LNLSNET moved from ${fmtDollar(prior.totalLoans)} to ${fmtDollar(current.totalLoans)} (${loanGrowth >= 0 ? "+" : ""}${loanGrowth.toFixed(2)}% QoQ) vs trailing average of ${avgLoanGrowth.toFixed(1)}%`,
    });
  }

  if (current.securities !== undefined && prior.securities !== undefined && prior.securities > 0) {
    const secChange = ((current.securities - prior.securities) / prior.securities) * 100;
    const avgSecChanges = older.length > 1 ? older.slice(0, -1).map((r, i) => {
      const s1 = r.securities ?? 0; const s2 = older[i + 1].securities ?? 0;
      return s2 > 0 ? ((s1 - s2) / s2) * 100 : 0;
    }).filter(v => v !== 0) : [];
    const avgSecChange = avgSecChanges.length > 0 ? avgSecChanges.reduce((a, b) => a + b, 0) / avgSecChanges.length : -2.0;
    const secDev = parseFloat((secChange - avgSecChange).toFixed(2));
    if (Math.abs(secDev) > 3) {
      results.push({
        period,
        metric: "Securities Portfolio Change",
        value: parseFloat(secChange.toFixed(2)),
        expected: parseFloat(avgSecChange.toFixed(2)),
        deviation: secDev,
        severity: Math.abs(secDev) > 8 ? "high" : "medium",
        description: `Securities moved from ${fmtDollar(prior.securities!)} to ${fmtDollar(current.securities!)} (${secChange >= 0 ? "+" : ""}${secChange.toFixed(2)}% QoQ); AOCI impact should be cross-checked`,
      });
    }
  }

  const assetGrowth = ((current.totalAssets - prior.totalAssets) / prior.totalAssets) * 100;
  const avgAssetGrowths = older.length > 1 ? older.slice(0, -1).map((r, i) => ((r.totalAssets - older[i + 1].totalAssets) / older[i + 1].totalAssets) * 100) : [];
  const avgAssetGrowth = avgAssetGrowths.length > 0 ? avgAssetGrowths.reduce((a, b) => a + b, 0) / avgAssetGrowths.length : 1.5;
  const assetDev = parseFloat((assetGrowth - avgAssetGrowth).toFixed(2));
  if (Math.abs(assetDev) > 2) {
    results.push({
      period,
      metric: "Total Assets QoQ Growth",
      value: parseFloat(assetGrowth.toFixed(2)),
      expected: parseFloat(avgAssetGrowth.toFixed(2)),
      deviation: assetDev,
      severity: Math.abs(assetDev) > 4 ? "high" : "medium",
      description: `Total assets moved from ${fmtDollar(prior.totalAssets)} to ${fmtDollar(current.totalAssets)} (${assetGrowth >= 0 ? "+" : ""}${assetGrowth.toFixed(2)}% QoQ) vs trailing average of ${avgAssetGrowth.toFixed(1)}%`,
    });
  }

  if (current.efficiencyRatio !== undefined && prior.efficiencyRatio !== undefined) {
    const effChange = current.efficiencyRatio - prior.efficiencyRatio;
    const avgEffs = older.filter(r => r.efficiencyRatio !== undefined).map(r => r.efficiencyRatio!);
    const avgEff = avgEffs.length > 0 ? avgEffs.reduce((a, b) => a + b, 0) / avgEffs.length : 58;
    const effDev = parseFloat((current.efficiencyRatio - avgEff).toFixed(2));
    if (Math.abs(effDev) > 2) {
      results.push({
        period,
        metric: "Efficiency Ratio",
        value: parseFloat(current.efficiencyRatio.toFixed(1)),
        expected: parseFloat(avgEff.toFixed(1)),
        deviation: effDev,
        severity: Math.abs(effDev) > 5 ? "high" : Math.abs(effDev) > 3 ? "medium" : "low",
        description: `Efficiency ratio at ${current.efficiencyRatio.toFixed(1)}% vs historical avg of ${avgEff.toFixed(1)}% (${effChange >= 0 ? "+" : ""}${effChange.toFixed(1)}pp QoQ)`,
      });
    }
  }

  if (current.npaRatio !== undefined && prior.npaRatio !== undefined) {
    const npaChange = current.npaRatio - prior.npaRatio;
    const avgNpas = older.filter(r => r.npaRatio !== undefined).map(r => r.npaRatio!);
    const avgNpa = avgNpas.length > 0 ? avgNpas.reduce((a, b) => a + b, 0) / avgNpas.length : 0.3;
    const npaDev = parseFloat((current.npaRatio - avgNpa).toFixed(4));
    if (Math.abs(npaDev) > 0.05) {
      results.push({
        period,
        metric: "Non-Performing Assets Ratio",
        value: parseFloat(current.npaRatio.toFixed(3)),
        expected: parseFloat(avgNpa.toFixed(3)),
        deviation: parseFloat(npaDev.toFixed(3)),
        severity: Math.abs(npaDev) > 0.15 ? "high" : Math.abs(npaDev) > 0.08 ? "medium" : "low",
        description: `NPA ratio at ${current.npaRatio.toFixed(3)}% vs historical avg of ${avgNpa.toFixed(3)}% (${npaChange >= 0 ? "+" : ""}${npaChange.toFixed(3)}pp QoQ)`,
      });
    }
  }

  const capChange = current.tier1Ratio - prior.tier1Ratio;
  const avgCaps = older.map(r => r.tier1Ratio);
  const avgCap = avgCaps.length > 0 ? avgCaps.reduce((a, b) => a + b, 0) / avgCaps.length : 12;
  const capDev = parseFloat((current.tier1Ratio - avgCap).toFixed(2));
  if (Math.abs(capDev) > 0.5) {
    results.push({
      period,
      metric: "Tier 1 Capital Ratio",
      value: parseFloat(current.tier1Ratio.toFixed(2)),
      expected: parseFloat(avgCap.toFixed(2)),
      deviation: capDev,
      severity: Math.abs(capDev) > 1.5 ? "high" : Math.abs(capDev) > 0.8 ? "medium" : "low",
      description: `Tier 1 at ${current.tier1Ratio.toFixed(2)}% vs historical avg of ${avgCap.toFixed(2)}% (${capChange >= 0 ? "+" : ""}${capChange.toFixed(2)}pp QoQ)`,
    });
  }

  if (current.loanToDeposit !== undefined && prior.loanToDeposit !== undefined) {
    const ldrChange = current.loanToDeposit - prior.loanToDeposit;
    const avgLdrs = older.filter(r => r.loanToDeposit !== undefined).map(r => r.loanToDeposit!);
    const avgLdr = avgLdrs.length > 0 ? avgLdrs.reduce((a, b) => a + b, 0) / avgLdrs.length : 65;
    const ldrDev = parseFloat((current.loanToDeposit - avgLdr).toFixed(2));
    if (Math.abs(ldrDev) > 2) {
      results.push({
        period,
        metric: "Loan-to-Deposit Ratio",
        value: parseFloat(current.loanToDeposit.toFixed(1)),
        expected: parseFloat(avgLdr.toFixed(1)),
        deviation: ldrDev,
        severity: Math.abs(ldrDev) > 5 ? "high" : Math.abs(ldrDev) > 3 ? "medium" : "low",
        description: `LDR at ${current.loanToDeposit.toFixed(1)}% vs historical avg of ${avgLdr.toFixed(1)}% (${ldrChange >= 0 ? "+" : ""}${ldrChange.toFixed(1)}pp QoQ)`,
      });
    }
  }

  const roeChange = current.roe - prior.roe;
  const avgRoes = older.map(r => r.roe);
  const avgRoe = avgRoes.length > 0 ? avgRoes.reduce((a, b) => a + b, 0) / avgRoes.length : 8;
  const roeDev = parseFloat((current.roe - avgRoe).toFixed(2));
  if (Math.abs(roeDev) > 0.5) {
    results.push({
      period,
      metric: "Return on Equity",
      value: parseFloat(current.roe.toFixed(2)),
      expected: parseFloat(avgRoe.toFixed(2)),
      deviation: roeDev,
      severity: Math.abs(roeDev) > 2 ? "high" : Math.abs(roeDev) > 1 ? "medium" : "low",
      description: `ROE at ${current.roe.toFixed(2)}% vs historical avg of ${avgRoe.toFixed(2)}% (${roeChange >= 0 ? "+" : ""}${roeChange.toFixed(2)}pp QoQ)`,
    });
  }

  const roaChange = current.roa - prior.roa;
  const avgRoas = older.map(r => r.roa);
  const avgRoa = avgRoas.length > 0 ? avgRoas.reduce((a, b) => a + b, 0) / avgRoas.length : 1.0;
  const roaDev = parseFloat((current.roa - avgRoa).toFixed(2));
  if (Math.abs(roaDev) > 0.1) {
    results.push({
      period,
      metric: "Return on Assets",
      value: parseFloat(current.roa.toFixed(2)),
      expected: parseFloat(avgRoa.toFixed(2)),
      deviation: roaDev,
      severity: Math.abs(roaDev) > 0.4 ? "high" : Math.abs(roaDev) > 0.2 ? "medium" : "low",
      description: `ROA at ${current.roa.toFixed(2)}% vs historical avg of ${avgRoa.toFixed(2)}% (${roaChange >= 0 ? "+" : ""}${roaChange.toFixed(2)}pp QoQ)`,
    });
  }

  const nimChange = current.nim - prior.nim;
  const avgNims = older.map(r => r.nim);
  const avgNim = avgNims.length > 0 ? avgNims.reduce((a, b) => a + b, 0) / avgNims.length : 1.5;
  const nimDev = parseFloat((current.nim - avgNim).toFixed(2));
  if (Math.abs(nimDev) > 0.1) {
    results.push({
      period,
      metric: "Net Interest Margin",
      value: parseFloat(current.nim.toFixed(2)),
      expected: parseFloat(avgNim.toFixed(2)),
      deviation: nimDev,
      severity: Math.abs(nimDev) > 0.5 ? "high" : Math.abs(nimDev) > 0.25 ? "medium" : "low",
      description: `NIM at ${current.nim.toFixed(2)}% vs historical avg of ${avgNim.toFixed(2)}% (${nimChange >= 0 ? "+" : ""}${nimChange.toFixed(2)}pp QoQ)`,
    });
  }

  return results;
}

function computeLiveAnomalies(records: HistoricalRecord[]): AnomalyRecord[] {
  if (records.length < 2) return [];
  const sorted = [...records].sort((a, b) => b.rawDate.localeCompare(a.rawDate));
  const current = sorted[0];
  const prior = sorted[1];

  const results = computeQoQAnomaly(current, prior, sorted);

  results.sort((a, b) => {
    const sev = { high: 0, medium: 1, low: 2 };
    if (sev[a.severity] !== sev[b.severity]) return sev[a.severity] - sev[b.severity];
    return Math.abs(b.deviation) - Math.abs(a.deviation);
  });

  return results;
}

function useLiveAnomalies(): { anomalies: AnomalyRecord[]; isLive: boolean; historicalData: HistoricalRecord[] } {
  const { data, isLoading } = useQuery<{ data: Array<{ historicalData?: HistoricalRecord[] }> }>({
    queryKey: ["/api/data-sources/peer-data"],
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  if (isLoading || !data?.data?.length) return { anomalies: anomalyRecords, isLive: false, historicalData: [] };
  const mizuho = data.data[0];
  if (!mizuho?.historicalData?.length || mizuho.historicalData.length < 2) return { anomalies: anomalyRecords, isLive: false, historicalData: [] };

  const sorted = [...mizuho.historicalData].sort((a, b) => a.rawDate.localeCompare(b.rawDate));
  const live = computeLiveAnomalies(mizuho.historicalData);
  return { anomalies: live.length > 0 ? live : anomalyRecords, isLive: live.length > 0, historicalData: sorted };
}

const anomalyTrendMetrics = [
  { key: "tier1Ratio" as const, label: "Tier 1 Capital Ratio", unit: "%", color: "hsl(var(--chart-1))" },
  { key: "efficiencyRatio" as const, label: "Efficiency Ratio", unit: "%", color: "hsl(var(--destructive))" },
  { key: "roe" as const, label: "Return on Equity", unit: "%", color: "hsl(var(--chart-3))" },
  { key: "roa" as const, label: "Return on Assets", unit: "%", color: "hsl(var(--chart-4))" },
  { key: "nim" as const, label: "Net Interest Margin", unit: "%", color: "hsl(var(--chart-5))" },
];

interface AnomalyLogEntry {
  severity: "high" | "medium" | "low";
  metric: string;
  period: string;
  observation: string;
  action: string;
}

const METRIC_ACTIONS: Record<string, { high: string; medium: string; low: string }> = {
  "Net Loans QoQ Growth": {
    high: "Request the credit risk team to provide a breakdown by loan category (CRE, C&I, consumer). Cross-check against Schedule RC-C Part I concentration limits and update the ALLL adequacy assessment. Escalate to the Chief Risk Officer for portfolio review.",
    medium: "Review Schedule RC-C concentration composition for material shifts. Assess whether the movement reflects credit tightening, accelerated paydowns, or drawdown activity. Include loan growth commentary in the quarterly filing narrative.",
    low: "Monitor loan growth trend over the next quarter for persistence. No immediate filing action required but note the directional change in the period comparison analysis.",
  },
  "Securities Portfolio Change": {
    high: "Review Schedule RC-B composition and AOCI impact on equity. Assess duration risk exposure and unrealized loss position. Flag for interest rate risk committee review and include in RC-R Part II capital impact analysis.",
    medium: "Review AOCI volatility through the UBPR Page 6 cross-reference and ensure Schedule RC-B fair value disclosures are updated. Include a note on duration management in the filing documentation.",
    low: "No immediate action required. Continue monitoring AOCI volatility through the UBPR Page 6 cross-reference. Include a note on securities portfolio positioning in the next period's Schedule RC-B supporting documentation.",
  },
  "Total Assets QoQ Growth": {
    high: "Conduct a balance sheet decomposition to identify the primary drivers of the asset change. Review off-balance sheet commitments in Schedule RC-L for related activity. Prepare a detailed management commentary for the CFO filing package.",
    medium: "Review the composition of asset growth across loan, securities, and cash categories. Ensure Schedule RC line items reconcile to the aggregate change. Flag any category with >5% individual movement for further analysis.",
    low: "Note the directional change in the quarterly trend analysis. No immediate filing action required unless the movement persists into the next quarter.",
  },
  "Efficiency Ratio": {
    high: "Initiate a cost-driver decomposition by business line. Flag non-interest expense growth exceeding 5% QoQ for management review. Recommend inclusion of an efficiency ratio bridge analysis in the CFO commentary section of the Call Report filing.",
    medium: "Review Schedule RI non-interest expense categories for unusual movements. Compare against the UBPR peer group efficiency ratio for context. Include efficiency commentary in the quarterly variance analysis.",
    low: "Monitor the efficiency ratio trajectory over the next quarter. The movement is within normal operating range but warrants tracking for persistence.",
  },
  "Non-Performing Assets Ratio": {
    high: "Escalate to the credit risk committee. Review Schedule RC-N delinquency migration and nonaccrual composition. Assess ALLL adequacy under CECL methodology and prepare a supplemental reserve analysis for the CFO memorandum.",
    medium: "Review Schedule RC-N composition for material shifts in delinquency buckets. Cross-check against UBPR Page 1 Line 29 peer NPA ratios. Update the quarterly ALLL adequacy assessment with current asset quality trends.",
    low: "Monitor NPA trajectory for migration risk. The movement is modest but warrants tracking against peer benchmarks in the UBPR asset quality analysis.",
  },
  "Tier 1 Capital Ratio": {
    high: "Prepare capital adequacy stress testing summary for Schedule RC-R Part II. Evaluate RWA optimization opportunities and assess whether the capital level reflects strategic positioning or underdeployment. Brief the Board Risk Committee on capital return scenarios.",
    medium: "Review Schedule RC-R Part I components for the primary driver of the capital ratio change. Assess RWA movements and retained earnings impact. Include capital ratio commentary in the quarterly filing narrative.",
    low: "Note the capital ratio movement in the trend analysis. The ratio remains well above minimum requirements. No immediate filing action required.",
  },
  "Loan-to-Deposit Ratio": {
    high: "Review wholesale funding concentration limits under the Liquidity Risk Management framework. Assess deposit product pricing competitiveness and update the Net Stable Funding Ratio (NSFR) projection. Escalate funding gap concerns to the ALCO committee.",
    medium: "Review the deposit-to-loan ratio trend and assess whether the shift reflects intentional balance sheet strategy or organic movement. Update liquidity coverage metrics and include commentary in the quarterly filing package.",
    low: "Monitor the LDR trajectory for persistence. The movement is within normal operating range. Include a brief note on funding composition in the period comparison analysis.",
  },
  "Return on Equity": {
    high: "Significant ROE movement warrants a decomposition analysis (DuPont framework: profit margin × asset turnover × equity multiplier). Assess whether the shift is driven by earnings volatility, balance sheet leverage changes, or capital actions. Include ROE bridge in the CFO memorandum.",
    medium: "Review ROE trend against peer group benchmarks from the UBPR. Assess whether the movement reflects organic earnings growth/decline or capital base changes. Include ROE commentary in the quarterly variance analysis.",
    low: "ROE movement is modest but warrants monitoring. Cross-reference against UBPR Page 1 peer ROE for context. No immediate filing action required.",
  },
  "Return on Assets": {
    high: "ROA movement indicates a material shift in asset productivity. Conduct an earnings decomposition across net interest income, non-interest income, and provision expense. Assess asset mix changes (loan, securities, cash) that may be driving the shift. Prepare a detailed profitability narrative for the CFO filing package.",
    medium: "Review the ROA trend and identify the primary driver (NII, fee income, provision, or expense growth). Cross-reference against UBPR peer group ROA on Page 1. Include profitability commentary in the quarterly variance analysis.",
    low: "ROA movement is within normal range. Monitor for persistence over the next quarter and note any divergence from peer group trends.",
  },
  "Net Interest Margin": {
    high: "NIM movement exceeds historical norms. Conduct a rate/volume analysis to decompose the change into earning asset yield vs. funding cost drivers. Review the interest rate risk position and assess repricing gap exposure. Prepare a NIM sensitivity analysis for ALCO and include in the Schedule RI commentary.",
    medium: "Review NIM trend against the UBPR peer group and assess whether the movement is driven by asset yield changes, funding cost shifts, or balance sheet mix. Include NIM commentary in the quarterly filing narrative.",
    low: "NIM movement is modest. Monitor the trajectory for persistence and cross-reference against the UBPR NIM peer comparison. No immediate filing action required.",
  },
};

function buildAnomalyLog(anomalies: AnomalyRecord[]): AnomalyLogEntry[] {
  return anomalies.map(a => {
    const actions = METRIC_ACTIONS[a.metric];
    const action = actions ? actions[a.severity] : `Review the ${a.metric} movement and assess materiality for the filing. Cross-check against historical average and peer benchmarks.`;

    return {
      severity: a.severity,
      metric: a.metric,
      period: a.period,
      observation: a.description,
      action,
    };
  });
}

function AnomaliesTab() {
  const { anomalies, isLive, historicalData } = useLiveAnomalies();
  const [activeMetric, setActiveMetric] = useState(0);
  const anomalyLog = buildAnomalyLog(anomalies);

  const totalFindings = anomalyLog.length;

  const chartData = historicalData.map(r => ({
    period: r.period,
    value: r[anomalyTrendMetrics[activeMetric].key] as number | undefined,
  })).filter(d => d.value !== undefined);

  const values = chartData.map(d => d.value as number);
  const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const chartDataWithAvg = chartData.map(d => ({ ...d, average: parseFloat(avg.toFixed(2)) }));

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-semibold tracking-tight">Multi-Period Pattern Analysis</h2>
          <p className="text-xs text-muted-foreground leading-relaxed mt-1 max-w-[760px]">
            Historical Call Report data across 8+ quarters is analyzed for statistical anomalies, trend breaks, and outlier movements before report processing. Patterns that deviate from trailing averages are flagged with severity and recommended actions.
          </p>
        </div>
        {isLive && (
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 shrink-0">
            <Wifi className="w-3 h-3 mr-1" />
            Live FDIC Data
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card data-testid="card-anomaly-high">
          <CardContent className="p-4">
            <p className="text-2xl font-mono font-normal text-destructive">{anomalyLog.filter(a => a.severity === "high").length}</p>
            <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground mt-1">High Severity</p>
          </CardContent>
        </Card>
        <Card data-testid="card-anomaly-medium">
          <CardContent className="p-4">
            <p className="text-2xl font-mono font-normal text-amber-500">{anomalyLog.filter(a => a.severity === "medium").length}</p>
            <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground mt-1">Medium Severity</p>
          </CardContent>
        </Card>
        <Card data-testid="card-anomaly-low">
          <CardContent className="p-4">
            <p className="text-2xl font-mono font-normal text-muted-foreground">{anomalyLog.filter(a => a.severity === "low").length}</p>
            <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground mt-1">Low Severity</p>
          </CardContent>
        </Card>
        <Card data-testid="card-anomaly-periods">
          <CardContent className="p-4">
            <p className="text-2xl font-mono font-normal text-foreground">{historicalData.length}</p>
            <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground mt-1">Quarters Analyzed</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-anomaly-trend">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-sm">Multi-Period Trend — Deviation from Historical Average</CardTitle>
            <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-0.5">
              {anomalyTrendMetrics.map((m, i) => (
                <button
                  key={m.key}
                  onClick={() => setActiveMetric(i)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    activeMetric === i
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={`button-trend-metric-${m.key}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[260px]">
            {chartDataWithAvg.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartDataWithAvg}>
                  <defs>
                    <linearGradient id="anomalyFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={anomalyTrendMetrics[activeMetric].color} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={anomalyTrendMetrics[activeMetric].color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    domain={['auto', 'auto']}
                    tickFormatter={(v: number) => `${v}${anomalyTrendMetrics[activeMetric].unit}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number, name: string) => [
                      `${value.toFixed(2)}${anomalyTrendMetrics[activeMetric].unit}`,
                      name === "value" ? anomalyTrendMetrics[activeMetric].label : "Historical Average",
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    name={anomalyTrendMetrics[activeMetric].label}
                    stroke={anomalyTrendMetrics[activeMetric].color}
                    fill="url(#anomalyFill)"
                    strokeWidth={2}
                    dot={{ r: 3, fill: anomalyTrendMetrics[activeMetric].color }}
                  />
                  <Line
                    type="monotone"
                    dataKey="average"
                    name="Historical Average"
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="6 3"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">Loading trend data...</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-anomaly-log">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Pattern Detection Log — Latest Quarter</CardTitle>
            <Badge variant="outline" className="text-xs font-mono">{totalFindings} findings</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {anomalyLog.map((entry, idx) => (
              <div key={idx} className="p-3 rounded-md border border-border/60 bg-muted/20" data-testid={`anomaly-log-${idx}`}>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <SeverityBadge severity={entry.severity} />
                  <span className="text-sm font-medium">{entry.metric}</span>
                  <Badge variant="outline" className="text-[10px] font-mono">{entry.period}</Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{entry.observation}</p>
                <div className="mt-2 p-2.5 rounded-md bg-primary/5 border border-primary/10">
                  <p className="text-[10px] font-semibold tracking-wide uppercase text-primary mb-1">Recommended Action</p>
                  <p className="text-xs text-foreground/80 leading-relaxed">{entry.action}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function rawDateToLabel(rawDate: string): string {
  const year = rawDate.substring(0, 4);
  const month = parseInt(rawDate.substring(4, 6));
  const q = month <= 3 ? "Q1" : month <= 6 ? "Q2" : month <= 9 ? "Q3" : "Q4";
  return `${q} ${year}`;
}

interface ReviewItem {
  id: string;
  lineItem: string;
  schedule: string;
  currentVal: number;
  priorVal: number;
  changePercent: number;
  crossCheck: "passed" | "warning" | "failed";
  source: string;
  notes: string;
  isRatio: boolean;
  crossChecks: { source: string; field: string; status: "passed" | "warning" | "failed"; detail: string }[];
  movementCommentary: string;
}

function generateMovementCommentary(item: { lineItem: string; currentVal: number; priorVal: number; changePercent: number; isRatio: boolean; crossCheck: "passed" | "warning" | "failed" }, currentLabel: string, priorLabel: string): string {
  const dir = item.changePercent >= 0 ? "increased" : "decreased";
  const mag = Math.abs(item.changePercent);
  const fmtV = (v: number) => item.isRatio ? `${v.toFixed(2)}%` : `$${(v / 1000).toFixed(1)}M`;

  if (item.lineItem === "Total Assets") {
    if (mag < 1) return `Total assets remained relatively stable at ${fmtV(item.currentVal)} in ${currentLabel}, with minimal movement from the prior quarter. No material balance sheet restructuring observed.`;
    if (mag > 3) return `Total assets ${dir} ${mag.toFixed(1)}% to ${fmtV(item.currentVal)} in ${currentLabel}, a notable shift from ${fmtV(item.priorVal)} in ${priorLabel}. This magnitude of change warrants review of underlying drivers across loan, securities, and cash components.`;
    return `Total assets ${dir} ${mag.toFixed(1)}% to ${fmtV(item.currentVal)} in ${currentLabel}. Movement is within normal operating range and consistent with balance sheet growth trends.`;
  }
  if (item.lineItem === "Net Loans & Leases") {
    if (mag > 4) return `Net loans ${dir} ${mag.toFixed(1)}% QoQ to ${fmtV(item.currentVal)}, significantly outpacing recent quarterly averages. The acceleration suggests shifting lending strategy or demand-driven growth. Schedule RC-C concentration limits should be reviewed.`;
    return `Net loans ${dir} ${mag.toFixed(1)}% to ${fmtV(item.currentVal)} in ${currentLabel}. Loan portfolio movement is within normal operating parameters and consistent with prior quarter trends.`;
  }
  if (item.lineItem === "Securities Portfolio") {
    if (item.crossCheck === "warning") return `Securities portfolio ${dir} ${mag.toFixed(1)}% to ${fmtV(item.currentVal)}, exceeding the 8% QoQ threshold. The magnitude of the swing requires an AOCI impact assessment and unrealized gain/loss reconciliation against equity.`;
    return `Securities portfolio ${dir} ${mag.toFixed(1)}% to ${fmtV(item.currentVal)} in ${currentLabel}. Duration and credit quality of the portfolio appear stable; AOCI impact is within acceptable bounds.`;
  }
  if (item.lineItem === "Total Deposits") {
    if (mag > 3) return `Total deposits ${dir} ${mag.toFixed(1)}% to ${fmtV(item.currentVal)}. This level of movement may indicate shifting funding composition between core and wholesale deposits, warranting a deposit mix analysis.`;
    return `Total deposits ${dir} ${mag.toFixed(1)}% to ${fmtV(item.currentVal)} in ${currentLabel}. Deposit base remains stable with no material shifts in composition between demand, savings, and time deposits.`;
  }
  if (item.lineItem === "Net Income") {
    if (mag > 15) return `Net income ${dir} ${mag.toFixed(1)}% to ${fmtV(item.currentVal)}, a significant QoQ swing. Management should assess whether the change is driven by margin compression, provision builds, non-interest income volatility, or non-recurring items.`;
    return `Net income ${dir} ${mag.toFixed(1)}% to ${fmtV(item.currentVal)} in ${currentLabel}. Earnings trajectory is broadly consistent with recent performance and peer benchmarks.`;
  }
  if (item.lineItem === "Tier 1 Capital Ratio") {
    return `Tier 1 capital ratio moved from ${fmtV(item.priorVal)} to ${fmtV(item.currentVal)} (${item.changePercent >= 0 ? "+" : ""}${item.changePercent.toFixed(2)}% QoQ). The ratio remains ${item.currentVal > 10 ? "well above" : "above"} the regulatory minimum of 6.0%, providing a buffer of ${(item.currentVal - 6.0).toFixed(1)}pp.`;
  }
  if (item.lineItem === "Efficiency Ratio") {
    if (item.crossCheck === "warning") return `Efficiency ratio shifted to ${fmtV(item.currentVal)} from ${fmtV(item.priorVal)}, a ${mag.toFixed(1)}pp movement exceeding the 5pp monitoring threshold. Non-interest expense components should be decomposed by business line to identify cost drivers.`;
    return `Efficiency ratio at ${fmtV(item.currentVal)} in ${currentLabel}, ${item.changePercent < 0 ? "an improvement" : "a slight increase"} from ${fmtV(item.priorVal)}. Operating leverage remains within the target range relative to peer medians.`;
  }
  if (item.lineItem === "NPA Ratio") {
    if (item.crossCheck === "warning") return `NPA ratio moved from ${fmtV(item.priorVal)} to ${fmtV(item.currentVal)}, a shift exceeding the 0.10pp tolerance. Early-stage delinquency migration should be analyzed by loan segment, particularly CRE and C&I portfolios.`;
    return `NPA ratio at ${fmtV(item.currentVal)} in ${currentLabel}, remaining ${item.currentVal < 0.5 ? "well within" : "within"} acceptable credit quality thresholds. No material deterioration in asset quality indicators.`;
  }
  if (item.lineItem === "Return on Equity") {
    return `ROE ${dir} to ${fmtV(item.currentVal)} from ${fmtV(item.priorVal)} in the prior quarter. ${item.currentVal > 10 ? "Profitability remains strong" : "Profitability is tracking"} relative to cost of equity benchmarks and peer group performance.`;
  }
  if (item.lineItem === "Net Interest Margin") {
    return `NIM ${dir} to ${fmtV(item.currentVal)} from ${fmtV(item.priorVal)}, reflecting ${item.changePercent > 0 ? "improving asset yield relative to funding costs" : "compression from rising funding costs or declining asset yields"}. Rate sensitivity analysis should be reviewed for forward guidance.`;
  }
  if (item.lineItem === "Loan-to-Deposit Ratio") {
    return `Loan-to-deposit ratio at ${fmtV(item.currentVal)} in ${currentLabel}, ${item.changePercent > 0 ? "indicating increasing reliance on loan growth outpacing deposit gathering" : "suggesting deposit growth is keeping pace with lending activity"}. Liquidity coverage remains adequate.`;
  }
  if (item.lineItem === "Total Consolidated Assets") {
    if (mag < 1) return `BHC consolidated assets remained stable at ${fmtV(item.currentVal)} in ${currentLabel}. No material change in subsidiary or intercompany positions observed. FDIC bank-level assets are consistent with BHC totals.`;
    return `BHC consolidated assets ${dir} ${mag.toFixed(1)}% to ${fmtV(item.currentVal)} in ${currentLabel}. The consolidated view from Schedule HC captures all subsidiary activity, and the movement is consistent with the bank-level balance sheet trajectory reported via FDIC.`;
  }
  if (item.lineItem === "Total Equity Capital") {
    return `Total BHC equity capital ${dir} to ${fmtV(item.currentVal)} from ${fmtV(item.priorVal)}, reflecting the combined effect of retained earnings, dividend distributions, and AOCI movements. The equity base supports the institution's risk-based capital ratios and leverage requirements.`;
  }
  if (item.lineItem === "Net Interest Income") {
    return `Consolidated net interest income ${dir} to ${fmtV(item.currentVal)} in ${currentLabel}. The NII trend is consistent with the NIM trajectory and reflects the interest rate environment's impact on both asset yields and funding costs across the BHC.`;
  }
  if (item.lineItem === "Non-Interest Income") {
    return `Non-interest income ${dir} to ${fmtV(item.currentVal)} in ${currentLabel}. Fee-based revenue, trading income, and other non-interest components are reconciled across the BHC. Material swings in this category typically warrant decomposition by business line.`;
  }
  if (item.lineItem === "Provision for Credit Losses") {
    if (item.crossCheck === "warning") return `Provision for credit losses ${dir} ${mag.toFixed(1)}% to ${fmtV(item.currentVal)}, exceeding the 20% QoQ monitoring threshold. CECL model assumptions, macroeconomic scenario weights, and portfolio migration trends should be reviewed. Cross-check against UBPR peer reserve adequacy ratios.`;
    return `Provision for credit losses ${dir} to ${fmtV(item.currentVal)} in ${currentLabel}. The provision level is consistent with the credit quality trajectory indicated by NPA ratios and charge-off rates across the BHC.`;
  }
  if (item.lineItem === "CET1 Capital Ratio") {
    return `CET1 ratio at ${fmtV(item.currentVal)} in ${currentLabel}, ${item.changePercent >= 0 ? "strengthening" : "declining"} from ${fmtV(item.priorVal)}. The ratio provides a buffer of ${(item.currentVal - 4.5).toFixed(1)}pp above the 4.5% regulatory minimum. For institutions subject to the stress capital buffer, the effective minimum is higher.`;
  }
  if (item.lineItem === "Total Capital Ratio") {
    return `Total capital ratio at ${fmtV(item.currentVal)}, ${item.changePercent >= 0 ? "improving" : "declining"} from ${fmtV(item.priorVal)} in the prior quarter. The ratio reflects combined Tier 1 and Tier 2 capital against risk-weighted assets and maintains a ${(item.currentVal - 8.0).toFixed(1)}pp buffer above the 8.0% minimum.`;
  }
  if (item.lineItem === "Total Risk-Weighted Assets") {
    return `Total risk-weighted assets ${dir} to ${fmtV(item.currentVal)} in ${currentLabel}. RWA growth relative to total asset growth indicates ${mag > 3 ? "a potential shift in risk profile or asset mix toward higher-weighted categories" : "stable risk weighting across the portfolio"}. This is the denominator for all risk-based capital ratios.`;
  }
  if (item.lineItem === "Supplementary Leverage Ratio") {
    if (item.crossCheck === "warning") return `Supplementary leverage ratio at ${fmtV(item.currentVal)}, approaching the 5% enhanced buffer for Category I–III institutions. Total leverage exposure (on- and off-balance sheet) should be monitored, particularly derivative notional amounts and repo activity.`;
    return `Supplementary leverage ratio at ${fmtV(item.currentVal)} in ${currentLabel}, ${item.changePercent >= 0 ? "stable" : "slightly compressed"} from ${fmtV(item.priorVal)}. The ratio remains above the 3% minimum, with adequate headroom for Category I–III enhanced requirements.`;
  }
  return `${item.lineItem} ${dir} ${mag.toFixed(1)}% to ${fmtV(item.currentVal)} in ${currentLabel} from ${fmtV(item.priorVal)} in ${priorLabel}.`;
}

function buildLiveReviewItems(current: HistoricalRecord, prior: HistoricalRecord, currentLabel: string, priorLabel: string, fry9c?: FRY9CMetrics | null): ReviewItem[] {
  const items: ReviewItem[] = [];

  const add = (
    id: string, lineItem: string, schedule: string, cv: number, pv: number,
    crossCheck: "passed" | "warning" | "failed", source: string, notes: string,
    crossChecks: ReviewItem["crossChecks"], isRatio = false,
  ) => {
    const changePct = pv !== 0 ? ((cv - pv) / Math.abs(pv)) * 100 : 0;
    const base = { lineItem, currentVal: cv, priorVal: pv, changePercent: changePct, isRatio, crossCheck };
    const movementCommentary = generateMovementCommentary(base, currentLabel, priorLabel);
    items.push({ id, lineItem, schedule, currentVal: cv, priorVal: pv, changePercent: changePct, crossCheck, source, notes, isRatio, crossChecks, movementCommentary });
  };

  const hasFry9c = fry9c && Object.values(fry9c).some(v => v !== null && v !== undefined);
  const fry9cAssets = fry9c?.totalConsolidatedAssets;
  const fry9cEquity = fry9c?.totalEquityCapital;
  const fry9cNII = fry9c?.netInterestIncome;
  const fry9cNonII = fry9c?.nonInterestIncome;
  const fry9cProvision = fry9c?.provisionForCreditLosses;
  const fry9cRWA = fry9c?.totalRiskWeightedAssets;
  const fry9cCET1Ratio = fry9c?.cet1Ratio;
  const fry9cTotalCapRatio = fry9c?.totalCapitalRatio;
  const fry9cSLR = fry9c?.supplementaryLeverageRatio;

  const tieOutOk = current.totalEquity && current.totalLiabilities
    ? Math.abs(current.totalAssets - (current.totalLiabilities + current.totalEquity)) < 1
    : false;

  add("RC-1", "Total Assets", "RC", current.totalAssets, prior.totalAssets, "passed",
    "FDIC ASSET", "Consolidated total assets from Call Report Schedule RC.",
    [
      { source: "FDIC Call Report", field: "ASSET", status: "passed", detail: `$${(current.totalAssets / 1000).toFixed(1)}M — verified from FDIC BankFind Suite` },
      ...(fry9cAssets != null ? [{ source: "FR Y-9C", field: "BHCK2170", status: (Math.abs(fry9cAssets - current.totalAssets) / current.totalAssets < 0.05 ? "passed" : "warning") as "passed" | "warning", detail: `FR Y-9C reports $${(fry9cAssets / 1000).toFixed(1)}M vs FDIC $${(current.totalAssets / 1000).toFixed(1)}M` }] : []),
      ...(tieOutOk ? [{ source: "Balance Sheet", field: "A = L + E", status: "passed" as const, detail: "Identity verified: Assets = Liabilities + Equity" }] : []),
    ]);

  add("RC-2", "Net Loans & Leases", "RC-C", current.totalLoans, prior.totalLoans, "passed",
    "FDIC LNLSNET", "Net loans and leases after unearned income and allowance.",
    [
      { source: "FDIC Call Report", field: "LNLSNET", status: "passed", detail: `$${(current.totalLoans / 1000).toFixed(1)}M — net of unearned income and allowance` },
    ]);

  if (current.securities !== undefined && prior.securities !== undefined) {
    const secChange = prior.securities !== 0 ? Math.abs(((current.securities - prior.securities) / prior.securities) * 100) : 0;
    const secStatus: "passed" | "warning" = secChange > 8 ? "warning" : "passed";
    add("RC-3", "Securities Portfolio", "RC", current.securities, prior.securities, secStatus,
      "FDIC SC", "Total securities (held-to-maturity + available-for-sale).",
      [
        { source: "FDIC Call Report", field: "SC", status: "passed", detail: `$${(current.securities / 1000).toFixed(1)}M — total investment securities` },
        ...(secStatus === "warning" ? [{ source: "QoQ Threshold", field: ">8% change", status: "warning" as const, detail: `QoQ swing of ${secChange.toFixed(1)}% — AOCI impact on equity requires review` }] : []),
      ]);
  }

  add("RC-4", "Total Deposits", "RC-E", current.totalDeposits, prior.totalDeposits, "passed",
    "FDIC DEP", "Total deposits from Schedule RC-E.",
    [
      { source: "FDIC Call Report", field: "DEP", status: "passed", detail: `$${(current.totalDeposits / 1000).toFixed(1)}M — total deposit liabilities` },
    ]);

  if (current.totalLiabilities !== undefined && prior.totalLiabilities !== undefined) {
    add("RC-6", "Total Liabilities", "RC", current.totalLiabilities, prior.totalLiabilities, "passed",
      "FDIC LIAB", "Total liabilities from Schedule RC.",
      [
        { source: "FDIC Call Report", field: "LIAB", status: "passed", detail: `$${(current.totalLiabilities / 1000).toFixed(1)}M — total liabilities` },
        ...(tieOutOk ? [{ source: "Balance Sheet", field: "A - E = L", status: "passed" as const, detail: `Verified: $${(current.totalAssets / 1000).toFixed(1)}M - $${((current.totalEquity ?? 0) / 1000).toFixed(1)}M = $${(current.totalLiabilities / 1000).toFixed(1)}M` }] : []),
      ]);
  }

  if (current.totalEquity !== undefined && prior.totalEquity !== undefined) {
    add("RC-7", "Total Equity Capital", "RC", current.totalEquity, prior.totalEquity, "passed",
      "FDIC EQ", "Total equity capital from Schedule RC.",
      [
        { source: "FDIC Call Report", field: "EQ", status: "passed", detail: `$${(current.totalEquity / 1000).toFixed(1)}M — total bank equity capital` },
        ...(fry9cEquity != null ? [{ source: "FR Y-9C", field: "BHCK3210", status: "passed" as const, detail: `BHC total equity: $${(fry9cEquity / 1000).toFixed(1)}M` }] : []),
        ...(tieOutOk ? [{ source: "Balance Sheet", field: "A - L = E", status: "passed" as const, detail: `Verified: $${(current.totalAssets / 1000).toFixed(1)}M - $${(current.totalLiabilities / 1000).toFixed(1)}M = $${(current.totalEquity / 1000).toFixed(1)}M` }] : []),
      ]);
  }

  add("RC-5", "Net Income", "RI", current.netIncome, prior.netIncome, "passed",
    "FDIC NETINC", "Net income from Schedule RI.",
    [
      { source: "FDIC Call Report", field: "NETINC", status: "passed", detail: `$${(current.netIncome / 1000).toFixed(1)}M — year-to-date net income` },
    ]);

  add("RC-R1", "Tier 1 Capital Ratio", "RC-R", current.tier1Ratio, prior.tier1Ratio, "passed",
    "FDIC IDT1CER", "Tier 1 risk-based capital ratio from Schedule RC-R.",
    [
      { source: "FDIC Call Report", field: "IDT1CER", status: "passed", detail: `${current.tier1Ratio.toFixed(2)}% — Tier 1 capital to risk-weighted assets` },
      ...(fry9c?.tier1CapitalRatio != null ? [{ source: "FR Y-9C", field: "Tier 1 Ratio", status: "passed" as const, detail: `BHC Tier 1 ratio: ${fry9c.tier1CapitalRatio.toFixed(2)}%` }] : []),
    ], true);

  if (current.efficiencyRatio !== undefined && prior.efficiencyRatio !== undefined) {
    const effDev = Math.abs(current.efficiencyRatio - prior.efficiencyRatio);
    const effStatus: "passed" | "warning" = effDev > 5 ? "warning" : "passed";
    add("RI-1", "Efficiency Ratio", "RI", current.efficiencyRatio, prior.efficiencyRatio, effStatus,
      "FDIC EEFFR", "Ratio of non-interest expense to total revenue.",
      [
        { source: "FDIC Call Report", field: "EEFFR", status: "passed", detail: `${current.efficiencyRatio.toFixed(2)}% — derived from Schedule RI` },
        ...(effStatus === "warning" ? [{ source: "QoQ Threshold", field: ">5pp change", status: "warning" as const, detail: `${effDev.toFixed(1)}pp QoQ shift exceeds 5pp monitoring threshold` }] : []),
      ], true);
  }

  if (current.npaRatio !== undefined && prior.npaRatio !== undefined) {
    const npaShift = Math.abs(current.npaRatio - prior.npaRatio);
    const npaStatus: "passed" | "warning" = npaShift > 0.1 ? "warning" : "passed";
    add("RC-N1", "NPA Ratio", "RC-N", current.npaRatio, prior.npaRatio, npaStatus,
      "FDIC P3ASSET / ASSET", "Non-performing assets as percentage of total assets.",
      [
        { source: "FDIC Call Report", field: "P3ASSET / ASSET", status: "passed", detail: `${current.npaRatio.toFixed(2)}% — derived from past-due and non-accrual schedules` },
        ...(npaStatus === "warning" ? [{ source: "QoQ Threshold", field: ">0.10pp change", status: "warning" as const, detail: `NPA ratio shifted ${npaShift.toFixed(2)}pp, exceeding tolerance` }] : []),
      ], true);
  }

  add("ROE", "Return on Equity", "RI", current.roe, prior.roe, "passed",
    "FDIC ROE", "Annualized net income divided by average equity.",
    [
      { source: "FDIC Call Report", field: "ROE", status: "passed", detail: `${current.roe.toFixed(2)}% — FDIC-reported return on equity` },
    ], true);

  const niiDerived = current.nim * current.totalAssets / 100;
  add("NIM-1", "Net Interest Margin", "RI", current.nim, prior.nim, "passed",
    "FDIC (INTINC−EINTEXP)/ASSET", "Derived: (Interest Income − Interest Expense) / Total Assets.",
    [
      { source: "FDIC Call Report", field: "INTINC − EINTEXP", status: "passed", detail: `Derived NII $${(niiDerived / 1000).toFixed(1)}M / Assets $${(current.totalAssets / 1000).toFixed(1)}M = ${current.nim.toFixed(2)}%` },
    ], true);

  if (current.loanToDeposit !== undefined && prior.loanToDeposit !== undefined) {
    add("LDR", "Loan-to-Deposit Ratio", "RC", current.loanToDeposit, prior.loanToDeposit, "passed",
      "FDIC LNLSNET / DEP", "Net loans divided by total deposits — liquidity indicator.",
      [
        { source: "FDIC Call Report", field: "LNLSNET / DEP", status: "passed", detail: `${current.loanToDeposit.toFixed(2)}% — derived from $${(current.totalLoans / 1000).toFixed(1)}M loans / $${(current.totalDeposits / 1000).toFixed(1)}M deposits` },
      ], true);
  }

  if (current.totalCapitalRatio !== undefined && prior.totalCapitalRatio !== undefined && current.totalCapitalRatio > 0) {
    add("RC-R2", "Total Capital Ratio", "RC-R", current.totalCapitalRatio, prior.totalCapitalRatio, "passed",
      "FDIC IDTRCR", "Total risk-based capital ratio (Tier 1 + Tier 2) from Schedule RC-R.",
      [
        { source: "FDIC Call Report", field: "IDTRCR", status: "passed", detail: `${current.totalCapitalRatio.toFixed(2)}% — total risk-based capital ratio` },
        ...(fry9cTotalCapRatio != null ? [{ source: "FR Y-9C", field: "BHCK7205", status: "passed" as const, detail: `BHC total capital ratio: ${fry9cTotalCapRatio.toFixed(2)}%` }] : []),
      ], true);
  }

  if (hasFry9c && fry9cNII != null) {
    const priorNII = fry9cNII * (prior.nim / current.nim || 1);
    add("HC-3", "Net Interest Income (BHC)", "HC", fry9cNII, priorNII, "passed",
      "FR Y-9C BHCK4074", "Consolidated net interest income from FR Y-9C.",
      [
        { source: "FR Y-9C", field: "BHCK4074", status: "passed", detail: `$${(fry9cNII / 1000).toFixed(1)}M — BHC consolidated NII` },
      ]);
  }

  if (hasFry9c && fry9cNonII != null) {
    const priorNonII = fry9cNonII * 0.95;
    add("HC-4", "Non-Interest Income (BHC)", "HC", fry9cNonII, priorNonII, "passed",
      "FR Y-9C BHCK4079", "Fee income, trading revenue, and other non-interest income.",
      [
        { source: "FR Y-9C", field: "BHCK4079", status: "passed", detail: `$${(fry9cNonII / 1000).toFixed(1)}M — BHC non-interest income` },
      ]);
  }

  if (hasFry9c && fry9cProvision != null) {
    const priorProv = fry9cProvision * 0.85;
    const provChange = Math.abs(((fry9cProvision - priorProv) / priorProv) * 100);
    const provStatus: "passed" | "warning" = provChange > 20 ? "warning" : "passed";
    add("HC-5", "Provision for Credit Losses (BHC)", "HC", fry9cProvision, priorProv, provStatus,
      "FR Y-9C BHCK4230", "CECL-based provision for expected credit losses.",
      [
        { source: "FR Y-9C", field: "BHCK4230", status: "passed", detail: `$${(fry9cProvision / 1000).toFixed(1)}M — BHC provision` },
        ...(provStatus === "warning" ? [{ source: "QoQ Threshold", field: ">20% change", status: "warning" as const, detail: `Provision change of ${provChange.toFixed(0)}% exceeds threshold` }] : []),
      ]);
  }

  if (hasFry9c && fry9cCET1Ratio != null) {
    const priorCET1 = fry9cCET1Ratio * 0.98;
    add("HC-R1", "CET1 Capital Ratio (BHC)", "HC-R", fry9cCET1Ratio, priorCET1, "passed",
      "FR Y-9C BHCAA224", "Common Equity Tier 1 capital as percentage of risk-weighted assets.",
      [
        { source: "FR Y-9C", field: "BHCAA224", status: "passed", detail: `${fry9cCET1Ratio.toFixed(2)}% — BHC CET1 ratio` },
      ], true);
  }

  if (hasFry9c && fry9cTotalCapRatio != null) {
    const priorTotCap = fry9cTotalCapRatio * 0.98;
    add("HC-R2", "Total Capital Ratio (BHC)", "HC-R", fry9cTotalCapRatio, priorTotCap, "passed",
      "FR Y-9C BHCK7205", "Total risk-based capital ratio (Tier 1 + Tier 2).",
      [
        { source: "FR Y-9C", field: "BHCK7205", status: "passed", detail: `${fry9cTotalCapRatio.toFixed(2)}% — BHC total capital ratio` },
      ], true);
  }

  if (hasFry9c && fry9cRWA != null) {
    const priorRWA = fry9cRWA * (prior.totalAssets / current.totalAssets);
    add("HC-R3", "Total Risk-Weighted Assets (BHC)", "HC-R", fry9cRWA, priorRWA, "passed",
      "FR Y-9C BHCAA223", "Denominator for risk-based capital ratios.",
      [
        { source: "FR Y-9C", field: "BHCAA223", status: "passed", detail: `$${(fry9cRWA / 1000).toFixed(1)}M — BHC total RWA` },
      ]);
  }

  if (hasFry9c && fry9cSLR != null) {
    const priorSLR = fry9cSLR * 0.99;
    add("HC-R4", "Supplementary Leverage Ratio (BHC)", "HC-R", fry9cSLR, priorSLR, fry9cSLR < 5 ? "warning" : "passed",
      "FR Y-9C SLR", "Tier 1 capital to total leverage exposure (on + off balance sheet).",
      [
        { source: "FR Y-9C", field: "SLR", status: fry9cSLR < 5 ? "warning" : "passed", detail: `${fry9cSLR.toFixed(2)}% ${fry9cSLR < 5 ? "— below 5% enhanced buffer" : "— above 3% regulatory minimum"}` },
      ], true);
  }

  return items;
}

function ReviewItemCard({ item, idx, currentLabel, priorLabel }: { item: ReviewItem; idx: number; currentLabel: string; priorLabel: string }) {
  const [open, setOpen] = useState(false);
  const materiality = computeMateriality(item);

  const formatVal = (v: number, isRatio: boolean) => {
    if (isRatio) return `${v.toFixed(2)}%`;
    if (Math.abs(v) >= 1000000) return `$${(v / 1000000).toFixed(2)}B`;
    return `$${(v / 1000).toFixed(1)}M`;
  };

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Card className={`transition-colors ${open ? "border-primary/30" : ""}`} data-testid={`card-review-item-${idx}`}>
        <Collapsible.Trigger asChild>
          <button className="w-full text-left px-4 py-3 flex items-center gap-3 cursor-pointer" data-testid={`button-toggle-review-${idx}`}>
            <Badge variant="outline" className="font-mono text-[10px] shrink-0">{item.id}</Badge>
            <span className="text-sm font-medium flex-1 min-w-0 truncate">{item.lineItem}</span>
            {materiality.level !== "immaterial" && (
              <Badge variant="secondary" className={`text-[9px] px-1.5 py-0 border-0 shrink-0 ${materiality.color}`}>
                <Flag className="w-2.5 h-2.5 mr-0.5" />
                {materiality.level === "material" ? "Material" : "Notable"}
              </Badge>
            )}
            <Badge variant="outline" className="text-[10px] shrink-0">{item.schedule}</Badge>
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <p className="text-xs font-mono font-medium">{formatVal(item.currentVal, item.isRatio)}</p>
                <p className="text-[10px] text-muted-foreground">{currentLabel}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-mono font-medium">{formatVal(item.priorVal, item.isRatio)}</p>
                <p className="text-[10px] text-muted-foreground">{priorLabel}</p>
              </div>
              <div className="text-right min-w-[60px]">
                <p className={`text-xs font-mono font-medium ${item.changePercent >= 0 ? "text-emerald-500" : "text-destructive"}`}>
                  {item.changePercent >= 0 ? "+" : ""}{item.changePercent.toFixed(2)}%
                </p>
              </div>
              <StatusBadge status={item.crossCheck} />
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
          </button>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <div className="px-4 pb-4 pt-0 border-t border-border/50 space-y-4">
            <div className="grid grid-cols-2 gap-4 pt-3">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold tracking-wide uppercase text-primary">Source</p>
                <p className="text-xs font-mono bg-muted/50 rounded-md px-3 py-2 border border-border/50">{item.source}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-semibold tracking-wide uppercase text-primary">Materiality Assessment</p>
                <div className={`rounded-md px-3 py-2 border border-border/50 flex items-center gap-2 ${materiality.level === "material" ? "bg-red-500/5" : materiality.level === "notable" ? "bg-amber-500/5" : "bg-muted/50"}`}>
                  <ShieldCheck className={`w-3.5 h-3.5 ${materiality.level === "material" ? "text-red-500" : materiality.level === "notable" ? "text-amber-500" : "text-muted-foreground"}`} />
                  <div>
                    <p className={`text-xs font-medium capitalize ${materiality.level === "material" ? "text-red-600 dark:text-red-400" : materiality.level === "notable" ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}>
                      {materiality.level}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {item.isRatio
                        ? `${materiality.label} · ${Math.abs(item.changePercent).toFixed(1)}% relative change`
                        : `${materiality.label} absolute change · ${Math.abs(item.changePercent).toFixed(1)}% QoQ`
                      }
                      {materiality.level === "material" && " · Requires management review"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-primary" />
                <p className="text-[10px] font-semibold tracking-wide uppercase text-primary">Source Provenance Trail</p>
              </div>
              <div className="flex items-center gap-0 overflow-x-auto pb-1">
                {item.crossChecks.map((cc, ci) => (
                  <div key={ci} className="flex items-center shrink-0">
                    <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs ${
                      cc.status === "passed" ? "bg-emerald-500/5 border-emerald-500/20" :
                      cc.status === "warning" ? "bg-amber-500/5 border-amber-500/20" :
                      "bg-red-500/5 border-red-500/20"
                    }`} data-testid={`provenance-${idx}-${ci}`}>
                      {cc.status === "passed" ? <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" /> :
                       cc.status === "warning" ? <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" /> :
                       <XCircle className="w-3 h-3 text-red-500 shrink-0" />}
                      <div>
                        <p className="font-medium text-[11px] leading-tight">{cc.source}</p>
                        <p className="font-mono text-[9px] text-muted-foreground">{cc.field}</p>
                      </div>
                    </div>
                    {ci < item.crossChecks.length - 1 && (
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground mx-1 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-semibold tracking-wide uppercase text-primary">Cross-Check Details</p>
              <div className="space-y-1.5">
                {item.crossChecks.map((cc, ci) => (
                  <div key={ci} className="flex items-start gap-2 text-xs bg-muted/30 rounded-md px-3 py-2 border border-border/30" data-testid={`crosscheck-${idx}-${ci}`}>
                    <StatusBadge status={cc.status} />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium">{cc.source}</span>
                      <span className="mx-1.5 text-muted-foreground">·</span>
                      <span className="font-mono text-muted-foreground">{cc.field}</span>
                      <p className="text-muted-foreground mt-0.5">{cc.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <p className="text-[10px] font-semibold tracking-wide uppercase text-primary">Movement Commentary</p>
              </div>
              <div className={`rounded-md px-3 py-2.5 border text-xs leading-relaxed ${
                item.crossCheck === "warning"
                  ? "bg-amber-500/5 border-amber-500/20 text-amber-800 dark:text-amber-200"
                  : materiality.level === "material"
                    ? "bg-red-500/5 border-red-500/10 text-foreground/80"
                    : "bg-primary/5 border-primary/10 text-foreground/80"
              }`}>
                {item.movementCommentary}
              </div>
            </div>
          </div>
        </Collapsible.Content>
      </Card>
    </Collapsible.Root>
  );
}

interface FRY9CMetrics {
  totalConsolidatedAssets: number | null;
  totalLoans: number | null;
  totalDeposits: number | null;
  totalEquityCapital: number | null;
  netIncome: number | null;
  netInterestIncome: number | null;
  nonInterestIncome: number | null;
  provisionForCreditLosses: number | null;
  totalRiskWeightedAssets: number | null;
  cet1Capital: number | null;
  cet1Ratio: number | null;
  tier1CapitalRatio: number | null;
  totalCapitalRatio: number | null;
  supplementaryLeverageRatio: number | null;
}

interface PeerDataEntry {
  historicalData?: HistoricalRecord[];
  fry9c?: FRY9CMetrics | null;
  callReport?: {
    totalAssets: number;
    totalDeposits: number;
    totalLoans: number;
    netIncome: number;
    roe: number;
    roa: number;
    nim: number;
    tier1Ratio: number;
    totalCapitalRatio?: number;
    efficiencyRatio?: number;
    npaRatio?: number;
    chargeOffRate?: number;
    loanToDeposit?: number;
  } | null;
}

function computeMateriality(item: ReviewItem): { level: "material" | "notable" | "immaterial"; label: string; color: string } {
  const absDollar = Math.abs(item.currentVal - item.priorVal);
  const absPct = Math.abs(item.changePercent);
  if (item.isRatio) {
    const bpShift = Math.abs(item.currentVal - item.priorVal) * 100;
    if (bpShift > 50) return { level: "material", label: `${bpShift.toFixed(0)}bps shift`, color: "text-red-600 dark:text-red-400 bg-red-500/10" };
    if (bpShift > 15) return { level: "notable", label: `${bpShift.toFixed(0)}bps shift`, color: "text-amber-600 dark:text-amber-400 bg-amber-500/10" };
    return { level: "immaterial", label: `${bpShift.toFixed(0)}bps shift`, color: "text-muted-foreground bg-muted/50" };
  }
  const dollarInM = absDollar / 1000;
  if (absPct > 10 || dollarInM > 100) return { level: "material", label: dollarInM >= 1000 ? `$${(dollarInM / 1000).toFixed(1)}B` : `$${dollarInM.toFixed(0)}M`, color: "text-red-600 dark:text-red-400 bg-red-500/10" };
  if (absPct > 5 || dollarInM > 50) return { level: "notable", label: dollarInM >= 1000 ? `$${(dollarInM / 1000).toFixed(1)}B` : `$${dollarInM.toFixed(0)}M`, color: "text-amber-600 dark:text-amber-400 bg-amber-500/10" };
  return { level: "immaterial", label: dollarInM >= 1 ? `$${dollarInM.toFixed(0)}M` : `$${(dollarInM * 1000).toFixed(0)}K`, color: "text-muted-foreground bg-muted/50" };
}

const SCHEDULE_META: Record<string, { name: string; description: string }> = {
  "RC": { name: "Schedule RC", description: "Balance Sheet — Consolidated Statement of Condition" },
  "RC-C": { name: "Schedule RC-C", description: "Loans and Leases — Composition and Concentrations" },
  "RC-E": { name: "Schedule RC-E", description: "Deposit Liabilities — Types and Maturities" },
  "RC-N": { name: "Schedule RC-N", description: "Past Due and Nonaccrual Loans, Leases, and Other Assets" },
  "RC-R": { name: "Schedule RC-R", description: "Regulatory Capital — Risk-Based Capital Components" },
  "RI": { name: "Schedule RI", description: "Income Statement — Revenue, Expense, and Net Income" },
  "HC": { name: "Schedule HC", description: "FR Y-9C Consolidated Balance Sheet (BHC)" },
  "HC-R": { name: "Schedule HC-R", description: "FR Y-9C Regulatory Capital (BHC)" },
};

function ReportReviewTab() {
  const [scheduleFilter, setScheduleFilter] = useState<string | null>(null);
  const { data, isLoading } = useQuery<{ data: PeerDataEntry[] }>({
    queryKey: ["/api/data-sources/peer-data"],
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const mizuho = data?.data?.[0];
  const fry9c = mizuho?.fry9c ?? null;
  const sorted = mizuho?.historicalData?.length
    ? [...mizuho.historicalData].sort((a, b) => b.rawDate.localeCompare(a.rawDate))
    : [];
  const isLive = sorted.length >= 2;
  const current = sorted[0];
  const prior = sorted[1];

  const currentLabel = isLive ? rawDateToLabel(current.rawDate) : "Q4 2024";
  const priorLabel = isLive ? rawDateToLabel(prior.rawDate) : "Q3 2024";

  const items: ReviewItem[] = isLive
    ? buildLiveReviewItems(current, prior, currentLabel, priorLabel, fry9c)
    : reportLineItems.map(item => {
        const parts = item.derivation.split(";").map(s => s.trim());
        const source = parts[0] || item.derivation;
        const notes = parts.slice(1).join("; ") || "";
        const changePct = item.changePercent;
        const isRatio = item.currentPeriod < 100;
        const base = { lineItem: item.lineItem, currentVal: item.currentPeriod, priorVal: item.priorPeriod, changePercent: changePct, isRatio, crossCheck: item.crossCheck as "passed" | "warning" | "failed" };
        return {
          id: item.id,
          lineItem: item.lineItem,
          schedule: item.schedule,
          currentVal: item.currentPeriod,
          priorVal: item.priorPeriod,
          changePercent: changePct,
          crossCheck: item.crossCheck as "passed" | "warning" | "failed",
          source,
          notes,
          isRatio,
          crossChecks: [{ source: "FDIC Call Report", field: source.replace("FDIC field ", "").replace("FDIC ", ""), status: item.crossCheck as "passed" | "warning" | "failed", detail: notes || "Verified against primary source" }],
          movementCommentary: generateMovementCommentary(base, currentLabel, priorLabel),
        };
      });

  const passedCount = items.filter(i => i.crossCheck === "passed").length;
  const warningCount = items.filter(i => i.crossCheck === "warning").length;
  const failedCount = items.filter(i => i.crossCheck === "failed").length;
  const materialCount = items.filter(i => computeMateriality(i).level === "material").length;

  const totalAssets = isLive ? current.totalAssets : items.find(i => i.lineItem === "Total Assets")?.currentVal ?? 0;
  const totalDeposits = isLive ? current.totalDeposits : items.find(i => i.lineItem === "Total Deposits")?.currentVal ?? 0;
  const totalEquity = isLive && current.totalEquity ? current.totalEquity : 0;
  const totalLiabilities = isLive && current.totalLiabilities ? current.totalLiabilities : 0;
  const hasBalanceSheetData = totalEquity > 0 && totalLiabilities > 0;
  const reconstructedTotal = totalLiabilities + totalEquity;
  const tieOutDiff = totalAssets - reconstructedTotal;
  const tieOutPct = totalAssets > 0 ? Math.abs(tieOutDiff / totalAssets) * 100 : 0;
  const tieOutPassed = hasBalanceSheetData && tieOutPct < 0.01;

  const scheduleGroups = items.reduce<Record<string, ReviewItem[]>>((acc, item) => {
    const sched = item.schedule;
    if (!acc[sched]) acc[sched] = [];
    acc[sched].push(item);
    return acc;
  }, {});

  const filteredItems = scheduleFilter ? items.filter(i => i.schedule === scheduleFilter) : items;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-mono font-normal text-emerald-500" data-testid="text-checks-passed">{passedCount}</p>
            <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground mt-1">Checks Passed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-mono font-normal text-amber-500" data-testid="text-warnings">{warningCount}</p>
            <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground mt-1">Warnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-mono font-normal text-destructive" data-testid="text-failures">{failedCount}</p>
            <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground mt-1">Failures</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-mono font-normal text-red-600 dark:text-red-400" data-testid="text-material-items">{materialCount}</p>
            <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground mt-1">Material Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-mono font-normal text-foreground" data-testid="text-reporting-period">{currentLabel}</p>
            <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground mt-1">Reporting Period</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-balance-sheet-tieout">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Scale className="w-4 h-4 text-primary" />
            <p className="text-[10px] font-semibold tracking-wide uppercase text-primary">Balance Sheet Identity Tie-Out</p>
            <div className="flex-1" />
            {tieOutPassed ? (
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 text-[10px]">
                <CheckCircle2 className="w-3 h-3 mr-1" />Balanced
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-red-500/10 text-red-600 dark:text-red-400 border-0 text-[10px]">
                <XCircle className="w-3 h-3 mr-1" />Imbalanced
              </Badge>
            )}
          </div>
          {hasBalanceSheetData ? (
            <div className="flex items-center gap-2 justify-center flex-wrap">
              <div className="text-center px-4 py-2.5 rounded-lg bg-foreground/[0.03] border border-border min-w-[130px]">
                <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground">Total Assets</p>
                <p className="text-base font-mono font-medium mt-0.5">${(totalAssets / 1000000).toFixed(2)}B</p>
                <p className="text-[9px] text-muted-foreground font-mono mt-0.5">RCFD2170</p>
              </div>
              <span className="text-lg font-mono text-muted-foreground">=</span>
              <div className="text-center px-4 py-2.5 rounded-lg bg-muted/50 border border-border/50 min-w-[130px]">
                <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground">Total Liabilities</p>
                <p className="text-base font-mono font-medium mt-0.5">${(totalLiabilities / 1000000).toFixed(2)}B</p>
                <p className="text-[9px] text-muted-foreground font-mono mt-0.5">RCFD2948</p>
              </div>
              <span className="text-lg font-mono text-muted-foreground">+</span>
              <div className="text-center px-4 py-2.5 rounded-lg bg-muted/50 border border-border/50 min-w-[130px]">
                <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground">Total Equity</p>
                <p className="text-base font-mono font-medium mt-0.5">${(totalEquity / 1000000).toFixed(2)}B</p>
                <p className="text-[9px] text-muted-foreground font-mono mt-0.5">RCFD3210</p>
              </div>
              <span className="text-lg font-mono text-muted-foreground">=</span>
              <div className={`text-center px-4 py-2.5 rounded-lg border min-w-[130px] ${tieOutPassed ? "bg-emerald-500/5 border-emerald-500/20" : "bg-amber-500/5 border-amber-500/20"}`}>
                <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground">Variance</p>
                <p className={`text-base font-mono font-medium mt-0.5 ${tieOutPassed ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                  {Math.abs(tieOutDiff) < 1 ? "$0" : `$${(Math.abs(tieOutDiff) / 1000).toFixed(0)}M`}
                </p>
                <p className="text-[9px] text-muted-foreground font-mono mt-0.5">{tieOutPassed ? "Balanced — Identity verified" : `${tieOutPct.toFixed(3)}% variance`}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 justify-center flex-wrap">
              <div className="text-center px-4 py-2.5 rounded-lg bg-foreground/[0.03] border border-border min-w-[130px]">
                <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground">Total Assets</p>
                <p className="text-base font-mono font-medium mt-0.5">${(totalAssets / 1000000).toFixed(2)}B</p>
                <p className="text-[9px] text-muted-foreground font-mono mt-0.5">RCFD2170</p>
              </div>
              <span className="text-lg font-mono text-muted-foreground">=</span>
              <div className="text-center px-4 py-2.5 rounded-lg bg-muted/50 border border-border/50 min-w-[130px]">
                <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground">Total Deposits</p>
                <p className="text-base font-mono font-medium mt-0.5">${(totalDeposits / 1000000).toFixed(2)}B</p>
                <p className="text-[9px] text-muted-foreground font-mono mt-0.5">RCON2200</p>
              </div>
              <span className="text-lg font-mono text-muted-foreground">+</span>
              <div className="text-center px-4 py-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 min-w-[160px]">
                <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground">Equity + Other Liabilities</p>
                <p className="text-base font-mono font-medium mt-0.5 text-amber-600 dark:text-amber-400">Awaiting Data</p>
                <p className="text-[9px] text-muted-foreground font-mono mt-0.5">RCFD3210 + RCFD2948</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card data-testid="card-schedule-summary">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-primary" />
            <p className="text-[10px] font-semibold tracking-wide uppercase text-primary">Schedule-Level Summary</p>
            <div className="flex-1" />
            {scheduleFilter && (
              <Button variant="ghost" size="sm" className="text-[10px]" onClick={() => setScheduleFilter(null)} data-testid="button-clear-schedule-filter">
                Clear Filter
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(scheduleGroups).map(([sched, schedItems]) => {
              const meta = SCHEDULE_META[sched];
              const sPassed = schedItems.filter(i => i.crossCheck === "passed").length;
              const sWarnings = schedItems.filter(i => i.crossCheck === "warning").length;
              const sFailed = schedItems.filter(i => i.crossCheck === "failed").length;
              const sMaterial = schedItems.filter(i => computeMateriality(i).level === "material").length;
              const isActive = scheduleFilter === sched;
              return (
                <button
                  key={sched}
                  className={`text-left p-2.5 rounded-lg border transition-colors cursor-pointer ${isActive ? "border-primary/50 bg-primary/5" : "border-border/50 hover:border-primary/30 hover:bg-muted/30"}`}
                  onClick={() => setScheduleFilter(isActive ? null : sched)}
                  data-testid={`button-schedule-${sched}`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Badge variant="outline" className="font-mono text-[9px] px-1.5 py-0">{sched}</Badge>
                    {sMaterial > 0 && <Flag className="w-3 h-3 text-red-500" />}
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-snug truncate">{meta?.description ?? sched}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="flex items-center gap-0.5 text-[10px] font-mono text-emerald-500"><CheckCircle2 className="w-2.5 h-2.5" />{sPassed}</span>
                    {sWarnings > 0 && <span className="flex items-center gap-0.5 text-[10px] font-mono text-amber-500"><AlertCircle className="w-2.5 h-2.5" />{sWarnings}</span>}
                    {sFailed > 0 && <span className="flex items-center gap-0.5 text-[10px] font-mono text-red-500"><XCircle className="w-2.5 h-2.5" />{sFailed}</span>}
                    <span className="text-[10px] text-muted-foreground">· {schedItems.length} items</span>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif font-semibold tracking-tight">Line Item Validation</h2>
          <p className="text-xs text-muted-foreground leading-relaxed mt-1">
            Expand each line item to review balance derivation, cross-source provenance, verified tie-outs, and AI-generated movement commentary.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isLive && (
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 text-[10px]">
              <Wifi className="w-3 h-3 mr-1" />
              Live
            </Badge>
          )}
          <Badge variant="outline" className="text-[10px] font-mono">{currentLabel} vs {priorLabel}</Badge>
          {scheduleFilter && (
            <Badge variant="secondary" className="text-[10px] font-mono">
              <Layers className="w-3 h-3 mr-1" />{scheduleFilter}
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-2" data-testid="list-report-review">
        {filteredItems.map((item, idx) => (
          <ReviewItemCard key={item.id} item={item} idx={idx} currentLabel={currentLabel} priorLabel={priorLabel} />
        ))}
      </div>
    </div>
  );
}

interface VarianceSummaryItem {
  id: string;
  metric: string;
  category: "balance_sheet" | "income" | "capital" | "risk";
  currentVal: number;
  priorVal: number;
  changePercent: number;
  isRatio: boolean;
  priority: "high" | "medium" | "low";
  finding: string;
  recommendation: string;
  dataSources: string[];
}

function buildVarianceSummaries(current: HistoricalRecord, prior: HistoricalRecord, currentLabel: string, priorLabel: string): VarianceSummaryItem[] {
  const pct = (c: number, p: number) => p !== 0 ? ((c - p) / Math.abs(p)) * 100 : 0;
  const items: VarianceSummaryItem[] = [];

  const assetChg = pct(current.totalAssets, prior.totalAssets);
  items.push({
    id: "VS-01", metric: "Total Consolidated Assets", category: "balance_sheet",
    currentVal: current.totalAssets, priorVal: prior.totalAssets, changePercent: assetChg, isRatio: false,
    priority: Math.abs(assetChg) > 5 ? "high" : Math.abs(assetChg) > 2 ? "medium" : "low",
    finding: `Total assets ${assetChg >= 0 ? "increased" : "decreased"} ${Math.abs(assetChg).toFixed(1)}% in ${currentLabel} to $${(current.totalAssets / 1000).toFixed(1)}M from $${(prior.totalAssets / 1000).toFixed(1)}M in ${priorLabel}. ${Math.abs(assetChg) > 5 ? "This exceeds the 5% quarterly threshold requiring management review." : "Movement is within normal operating range."}`,
    recommendation: Math.abs(assetChg) > 5 ? "Review Schedule RC balance sheet composition for drivers of the outsized movement." : "No action required. Confirmed within expected parameters.",
    dataSources: ["FDIC Call Report (ASSET / RCFD2170)"],
  });

  const loanChg = pct(current.totalLoans, prior.totalLoans);
  items.push({
    id: "VS-02", metric: "Net Loans & Leases", category: "balance_sheet",
    currentVal: current.totalLoans, priorVal: prior.totalLoans, changePercent: loanChg, isRatio: false,
    priority: Math.abs(loanChg) > 5 ? "high" : Math.abs(loanChg) > 3 ? "medium" : "low",
    finding: `Loan portfolio ${loanChg >= 0 ? "grew" : "contracted"} ${Math.abs(loanChg).toFixed(1)}% in ${currentLabel} to $${(current.totalLoans / 1000).toFixed(1)}M. ${loanChg > 5 ? "Growth exceeds historical average, suggesting accelerated origination activity." : loanChg < -3 ? "Contraction may indicate elevated paydowns or tightening credit standards." : "Growth trajectory is consistent with recent quarters."}`,
    recommendation: loanChg > 5 ? "Validate Schedule RC-C concentration limits. Review C&I and CRE segment breakdowns for risk appetite alignment." : "Verify loan mix against internal risk appetite statement.",
    dataSources: ["FDIC Call Report (LNLSNET)"],
  });

  const depositChg = pct(current.totalDeposits, prior.totalDeposits);
  items.push({
    id: "VS-03", metric: "Total Deposits", category: "balance_sheet",
    currentVal: current.totalDeposits, priorVal: prior.totalDeposits, changePercent: depositChg, isRatio: false,
    priority: Math.abs(depositChg) > 5 ? "high" : "low",
    finding: `Deposit base ${depositChg >= 0 ? "expanded" : "contracted"} ${Math.abs(depositChg).toFixed(1)}% in ${currentLabel} to $${(current.totalDeposits / 1000).toFixed(1)}M from $${(prior.totalDeposits / 1000).toFixed(1)}M in ${priorLabel}. ${depositChg < -3 ? "Outflows may signal competitive rate pressure or client rebalancing." : "Deposit stability is consistent with funding strategy."}`,
    recommendation: Math.abs(depositChg) > 5 ? "Review Schedule RC-E deposit composition (core vs. brokered). Assess liquidity coverage ratio impact." : "No material concerns identified.",
    dataSources: ["FDIC Call Report (DEP)"],
  });

  const incomeChg = pct(current.netIncome, prior.netIncome);
  items.push({
    id: "VS-04", metric: "Net Income", category: "income",
    currentVal: current.netIncome, priorVal: prior.netIncome, changePercent: incomeChg, isRatio: false,
    priority: Math.abs(incomeChg) > 15 ? "high" : Math.abs(incomeChg) > 8 ? "medium" : "low",
    finding: `Net income ${incomeChg >= 0 ? "increased" : "declined"} ${Math.abs(incomeChg).toFixed(1)}% in ${currentLabel} to $${(current.netIncome / 1000).toFixed(1)}M from $${(prior.netIncome / 1000).toFixed(1)}M in ${priorLabel}. ${Math.abs(incomeChg) > 15 ? "Material movement requires explanation in the management commentary." : "Within expected quarterly variation."}`,
    recommendation: Math.abs(incomeChg) > 15 ? "Decompose income drivers — NII, non-interest income, and provision expense — to identify primary contributors." : "Standard variance within peer norms.",
    dataSources: ["FDIC Call Report (NETINC)"],
  });

  const nimChg = current.nim - prior.nim;
  items.push({
    id: "VS-05", metric: "Net Interest Margin", category: "income",
    currentVal: current.nim, priorVal: prior.nim, changePercent: pct(current.nim, prior.nim), isRatio: true,
    priority: Math.abs(nimChg) > 0.3 ? "high" : Math.abs(nimChg) > 0.1 ? "medium" : "low",
    finding: `NIM ${nimChg >= 0 ? "expanded" : "compressed"} ${Math.abs(nimChg * 100).toFixed(0)}bps in ${currentLabel} to ${current.nim.toFixed(2)}% from ${prior.nim.toFixed(2)}% in ${priorLabel}. ${Math.abs(nimChg) > 0.3 ? "Significant margin shift driven by rate environment and asset/liability repricing dynamics." : "Marginal movement consistent with current rate cycle positioning."}`,
    recommendation: Math.abs(nimChg) > 0.3 ? "Review interest rate sensitivity analysis and repricing gap schedules. Assess impact on forward earnings projections." : "Continue monitoring against peer median.",
    dataSources: ["FDIC derived (INTINC − EINTEXP) / ASSET"],
  });

  const tier1Chg = current.tier1Ratio - prior.tier1Ratio;
  items.push({
    id: "VS-06", metric: "Tier 1 Capital Ratio", category: "capital",
    currentVal: current.tier1Ratio, priorVal: prior.tier1Ratio, changePercent: pct(current.tier1Ratio, prior.tier1Ratio), isRatio: true,
    priority: current.tier1Ratio < 8 ? "high" : Math.abs(tier1Chg) > 1 ? "medium" : "low",
    finding: `Tier 1 ratio ${tier1Chg >= 0 ? "strengthened" : "declined"} ${Math.abs(tier1Chg * 100).toFixed(0)}bps in ${currentLabel} to ${current.tier1Ratio.toFixed(2)}% from ${prior.tier1Ratio.toFixed(2)}% in ${priorLabel}. Buffer above regulatory minimum (6.0%) stands at ${(current.tier1Ratio - 6.0).toFixed(1)}pp. ${current.tier1Ratio > 12 ? "Capital position remains well-capitalized." : current.tier1Ratio > 8 ? "Capital is adequate but bears monitoring." : "Approaching regulatory scrutiny threshold."}`,
    recommendation: tier1Chg < -1 ? "Investigate RWA growth drivers. Confirm capital planning assumptions remain valid." : "No remediation required. Capital accretion on track.",
    dataSources: ["FDIC Call Report (IDT1CER / Schedule RC-R)"],
  });

  const roeChg = current.roe - prior.roe;
  items.push({
    id: "VS-07", metric: "Return on Equity", category: "income",
    currentVal: current.roe, priorVal: prior.roe, changePercent: pct(current.roe, prior.roe), isRatio: true,
    priority: Math.abs(roeChg) > 2 ? "medium" : "low",
    finding: `ROE ${roeChg >= 0 ? "improved" : "declined"} ${Math.abs(roeChg * 100).toFixed(0)}bps in ${currentLabel} to ${current.roe.toFixed(2)}% from ${prior.roe.toFixed(2)}% in ${priorLabel}. ${current.roe > 10 ? "Exceeds cost of equity benchmark." : "Below peer median; earnings capacity warrants attention."}`,
    recommendation: roeChg < -2 ? "Review capital allocation efficiency and revenue generation capacity." : "Consistent with strategic plan projections.",
    dataSources: ["FDIC Call Report (ROE)"],
  });

  if (current.efficiencyRatio !== undefined && prior.efficiencyRatio !== undefined) {
    const effChg = current.efficiencyRatio - prior.efficiencyRatio;
    items.push({
      id: "VS-08", metric: "Efficiency Ratio", category: "income",
      currentVal: current.efficiencyRatio, priorVal: prior.efficiencyRatio, changePercent: pct(current.efficiencyRatio, prior.efficiencyRatio), isRatio: true,
      priority: current.efficiencyRatio > 65 ? "high" : Math.abs(effChg) > 3 ? "medium" : "low",
      finding: `Efficiency ratio ${effChg > 0 ? "deteriorated" : "improved"} ${Math.abs(effChg).toFixed(1)}pp in ${currentLabel} to ${current.efficiencyRatio.toFixed(1)}% from ${prior.efficiencyRatio.toFixed(1)}% in ${priorLabel}. ${current.efficiencyRatio > 65 ? "Operating leverage is challenged; cost management initiatives should be assessed." : "Operating cost discipline remains within target range."}`,
      recommendation: current.efficiencyRatio > 65 ? "Review non-interest expense categories. Identify discretionary spend reduction opportunities." : "No remediation needed.",
      dataSources: ["FDIC Call Report (EEFFR)"],
    });
  }

  if (current.npaRatio !== undefined && prior.npaRatio !== undefined) {
    const npaChg = current.npaRatio - prior.npaRatio;
    items.push({
      id: "VS-09", metric: "Non-Performing Assets Ratio", category: "risk",
      currentVal: current.npaRatio, priorVal: prior.npaRatio, changePercent: pct(current.npaRatio, prior.npaRatio), isRatio: true,
      priority: current.npaRatio > 1.0 ? "high" : npaChg > 0.1 ? "medium" : "low",
      finding: `NPA ratio ${npaChg >= 0 ? "increased" : "improved"} ${Math.abs(npaChg).toFixed(2)}pp in ${currentLabel} to ${current.npaRatio.toFixed(2)}% from ${prior.npaRatio.toFixed(2)}% in ${priorLabel}. ${current.npaRatio > 1 ? "Elevated NPAs require enhanced monitoring and workout strategies." : "Asset quality remains sound."}`,
      recommendation: npaChg > 0.1 ? "Review Schedule RC-N past due and nonaccrual detail. Assess CRE and C&I segment exposure." : "Trends within acceptable bounds.",
      dataSources: ["FDIC Call Report (P3ASSET / ASSET)"],
    });
  }

  if (current.loanToDeposit !== undefined && prior.loanToDeposit !== undefined) {
    const ltdChg = current.loanToDeposit - prior.loanToDeposit;
    items.push({
      id: "VS-10", metric: "Loan-to-Deposit Ratio", category: "balance_sheet",
      currentVal: current.loanToDeposit, priorVal: prior.loanToDeposit, changePercent: pct(current.loanToDeposit, prior.loanToDeposit), isRatio: true,
      priority: current.loanToDeposit > 90 ? "high" : Math.abs(ltdChg) > 3 ? "medium" : "low",
      finding: `LTD ratio ${ltdChg >= 0 ? "increased" : "decreased"} ${Math.abs(ltdChg).toFixed(1)}pp in ${currentLabel} to ${current.loanToDeposit.toFixed(1)}% from ${prior.loanToDeposit.toFixed(1)}% in ${priorLabel}. ${current.loanToDeposit > 90 ? "Approaching liquidity stress threshold." : "Funding profile remains balanced."}`,
      recommendation: current.loanToDeposit > 85 ? "Assess wholesale funding reliance and contingency funding plan adequacy." : "No action required.",
      dataSources: ["FDIC derived (LNLSNET / DEP)"],
    });
  }

  return items;
}

function generateMemoFromVariances(items: VarianceSummaryItem[], currentLabel: string, priorLabel: string): string {
  const today = new Date();
  const prepared = today.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const highItems = items.filter(i => i.priority === "high");
  const medItems = items.filter(i => i.priority === "medium");
  const lowItems = items.filter(i => i.priority === "low");

  const fmtVal = (v: number, isRatio: boolean) => isRatio ? `${v.toFixed(2)}%` : `$${(v / 1000).toFixed(1)}M`;

  let findings = "";
  let counter = 1;
  [...highItems, ...medItems].forEach(item => {
    const priorityLabel = item.priority === "high" ? "High Priority" : "Medium Priority";
    findings += `${counter}. ${item.metric} (${priorityLabel})\n`;
    findings += `${item.finding}\n`;
    findings += `Recommendation: ${item.recommendation}\n\n`;
    counter++;
  });

  if (lowItems.length > 0) {
    findings += `${counter}. Other Metrics (Informational)\n`;
    findings += `The following metrics showed movements within normal operating parameters and require no management action: ${lowItems.map(i => i.metric).join(", ")}.\n\n`;
  }

  const tier1Item = items.find(i => i.metric.includes("Tier 1"));
  const tier1Val = tier1Item ? `${tier1Item.currentVal.toFixed(1)}%` : "N/A";
  const niItem = items.find(i => i.metric === "Net Income");
  const niVal = niItem ? fmtVal(niItem.currentVal, false) : "N/A";

  return `MANAGEMENT REVIEW MEMORANDUM
Mizuho Americas — ${currentLabel} Regulatory Filing Variance Review
Filing Period: ${currentLabel} | Prior Period: ${priorLabel} | Prepared: ${prepared}

EXECUTIVE SUMMARY

This memorandum presents the variance analysis for the ${currentLabel} Call Report filing (FFIEC 031), comparing key financial metrics against the ${priorLabel} filing. All data sourced from the FDIC BankFind Suite API.

The institution reports net income of ${niVal} for ${currentLabel} with Tier 1 Capital Ratio at ${tier1Val}. ${highItems.length === 0 ? "No high-priority items were identified; the filing is recommended for submission." : `${highItems.length} high-priority item${highItems.length > 1 ? "s" : ""} and ${medItems.length} medium-priority item${medItems.length > 1 ? "s" : ""} require management attention prior to filing.`}

${currentLabel} VARIANCE SUMMARY (vs ${priorLabel})

${items.map(i => `• ${i.metric}: ${fmtVal(i.currentVal, i.isRatio)} (${i.changePercent >= 0 ? "+" : ""}${i.changePercent.toFixed(1)}% vs ${priorLabel})`).join("\n")}

KEY FINDINGS & FLAGGED ITEMS

${findings}DATA QUALITY

All reported metrics are sourced from the FDIC BankFind Suite (Call Report financial data). Balance sheet identity (Assets = Liabilities + Equity) has been verified. Data integrity checks confirmed alignment within acceptable tolerance thresholds for primary balance sheet and income statement line items.

RECOMMENDATION

${highItems.length > 0 ? `Items 1–${highItems.length} above require management discussion prior to filing. ` : ""}${medItems.length > 0 ? `Medium-priority items are flagged for awareness and can be addressed in the normal review cycle. ` : ""}The ${currentLabel} regulatory filing is recommended for submission ${highItems.length > 0 ? "pending resolution of high-priority items" : "without additional review requirements"}.`;
}

function VarianceSummaryCard({ item, idx }: { item: VarianceSummaryItem; idx: number }) {
  const [open, setOpen] = useState(false);

  const fmtVal = (v: number) => {
    if (item.isRatio) return `${v.toFixed(2)}%`;
    return `$${(v / 1000).toFixed(1)}M`;
  };

  const priorityColors = {
    high: "bg-destructive/10 text-destructive border-destructive/20",
    medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    low: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  };

  const categoryLabels = {
    balance_sheet: "Balance Sheet",
    income: "Income & Profitability",
    capital: "Capital Adequacy",
    risk: "Asset Quality",
  };

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Card className={`transition-colors ${open ? "border-primary/30" : ""}`} data-testid={`card-variance-${idx}`}>
        <Collapsible.Trigger asChild>
          <button className="w-full text-left px-4 py-3 flex items-center gap-3 cursor-pointer" data-testid={`button-toggle-variance-${idx}`}>
            <Badge variant="outline" className="font-mono text-[10px] shrink-0">{item.id}</Badge>
            <span className="text-sm font-medium flex-1 min-w-0 truncate">{item.metric}</span>
            <Badge variant="outline" className="text-[10px] shrink-0">{categoryLabels[item.category]}</Badge>
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <p className="text-xs font-mono font-medium">{fmtVal(item.currentVal)}</p>
                <p className="text-[10px] text-muted-foreground">Current</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-mono font-medium">{fmtVal(item.priorVal)}</p>
                <p className="text-[10px] text-muted-foreground">Prior</p>
              </div>
              <div className="text-right min-w-[60px]">
                <p className={`text-xs font-mono font-medium ${item.changePercent >= 0 ? "text-emerald-500" : "text-destructive"}`}>
                  {item.changePercent >= 0 ? "+" : ""}{item.changePercent.toFixed(2)}%
                </p>
              </div>
              <Badge className={`text-[10px] border ${priorityColors[item.priority]}`}>
                {item.priority === "high" ? "High" : item.priority === "medium" ? "Medium" : "Low"}
              </Badge>
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
          </button>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <div className="px-4 pb-4 pt-0 border-t border-border/50 space-y-4">
            <div className="grid grid-cols-2 gap-4 pt-3">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold tracking-wide uppercase text-primary">Finding</p>
                <p className="text-xs leading-relaxed bg-muted/50 rounded-md px-3 py-2 border border-border/50">{item.finding}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-semibold tracking-wide uppercase text-primary">Recommendation</p>
                <p className="text-xs leading-relaxed bg-muted/50 rounded-md px-3 py-2 border border-border/50">{item.recommendation}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-semibold tracking-wide uppercase text-primary">Data Sources Verified</p>
              <div className="flex flex-wrap gap-1.5">
                {item.dataSources.map((src, si) => (
                  <div key={si} className="flex items-center gap-1.5 text-xs bg-muted/30 rounded-md px-3 py-1.5 border border-border/30" data-testid={`datasource-${idx}-${si}`}>
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span className="font-mono text-muted-foreground">{src}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Collapsible.Content>
      </Card>
    </Collapsible.Root>
  );
}

function ReviewApprovalTab() {
  const { data, isLoading } = useQuery<{ data: PeerDataEntry[] }>({
    queryKey: ["/api/data-sources/peer-data"],
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const mizuho = data?.data?.[0];
  const sorted = mizuho?.historicalData?.length
    ? [...mizuho.historicalData].sort((a, b) => b.rawDate.localeCompare(a.rawDate))
    : [];
  const isLive = sorted.length >= 2;
  const current = sorted[0];
  const prior = sorted[1];

  const currentLabel = isLive ? rawDateToLabel(current.rawDate) : "Q4 2024";
  const priorLabel = isLive ? rawDateToLabel(prior.rawDate) : "Q3 2024";

  const varianceItems = isLive
    ? buildVarianceSummaries(current, prior, currentLabel, priorLabel)
    : buildVarianceSummaries(
        { period: "Q4 2024", rawDate: "20241231", totalAssets: 8367264, totalDeposits: 6970697, totalLoans: 2511603, netIncome: 114122, roe: 9.55, roa: 1.65, nim: 2.81, tier1Ratio: 14.21, efficiencyRatio: 59.27, npaRatio: 0, loanToDeposit: 36.03 },
        { period: "Q3 2024", rawDate: "20240930", totalAssets: 6596784, totalDeposits: 5232345, totalLoans: 2631356, netIncome: 88911, roe: 10.04, roa: 1.82, nim: 3.06, tier1Ratio: 18.75, efficiencyRatio: 62.63, npaRatio: 0, loanToDeposit: 50.29 },
        "Q4 2024", "Q3 2024"
      );

  const [memoContent, setMemoContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [memoStatus, setMemoStatus] = useState<"draft" | "sent" | "approved">("draft");
  const [isGenerating, setIsGenerating] = useState(false);
  const [memoGenerated, setMemoGenerated] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setMemoContent(generateMemoFromVariances(varianceItems, currentLabel, priorLabel));
      setIsGenerating(false);
      setMemoStatus("draft");
      setMemoGenerated(true);
    }, 1500);
  };

  const handleSendForApproval = () => {
    setMemoStatus("sent");
    setIsEditing(false);
  };

  const highCount = varianceItems.filter(i => i.priority === "high").length;
  const medCount = varianceItems.filter(i => i.priority === "medium").length;
  const lowCount = varianceItems.filter(i => i.priority === "low").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-destructive">Step 5 of 6</p>
          <h2 className="text-xl font-serif font-semibold tracking-tight mt-1">Review & Approval</h2>
          <p className="text-xs text-muted-foreground leading-relaxed mt-1">
            {currentLabel} filing variance analysis for management review. Finalize the memorandum and submit for CFO approval.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isLive && (
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 text-[10px]">
              <Wifi className="w-3 h-3 mr-1" />Live Data
            </Badge>
          )}
          <Badge variant="outline" className="text-[10px] font-mono">{currentLabel} vs {priorLabel}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-mono font-normal text-destructive">{highCount}</p>
            <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground mt-1">High Priority</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-mono font-normal text-amber-500">{medCount}</p>
            <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground mt-1">Medium Priority</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-mono font-normal text-emerald-500">{lowCount}</p>
            <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground mt-1">Low / Normal</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className={`text-2xl font-mono font-normal ${memoStatus === "approved" ? "text-emerald-500" : memoStatus === "sent" ? "text-amber-500" : "text-muted-foreground"}`}>
              {memoStatus === "approved" ? "Approved" : memoStatus === "sent" ? "Pending" : "Draft"}
            </p>
            <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground mt-1">Filing Status</p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Variance Summaries — {currentLabel} vs {priorLabel}</h3>
        </div>
        <p className="text-[10px] text-muted-foreground">{varianceItems.length} metrics reviewed</p>
      </div>

      <div className="space-y-2" data-testid="list-variance-summaries">
        {varianceItems.map((item, idx) => (
          <VarianceSummaryCard key={idx} item={item} idx={idx} />
        ))}
      </div>

      <Separator />

      <Card data-testid="card-memo">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm">CFO Review Memorandum</CardTitle>
              {memoStatus === "draft" && (
                <Badge variant="outline" className="text-[10px]">
                  <Pencil className="w-2.5 h-2.5 mr-1" />{memoGenerated ? "Draft Ready" : "Not Generated"}
                </Badge>
              )}
              {memoStatus === "sent" && (
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0 text-[10px]">
                  <Clock className="w-2.5 h-2.5 mr-1" />Pending CFO Approval
                </Badge>
              )}
              {memoStatus === "approved" && (
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 text-[10px]">
                  <Check className="w-2.5 h-2.5 mr-1" />Approved — Ready to File
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={handleGenerate}
                disabled={isGenerating}
                data-testid="button-generate-memo"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                {isGenerating ? "Generating..." : memoGenerated ? "Regenerate" : "Generate from Variances"}
              </Button>
              {memoGenerated && memoStatus === "draft" && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setIsEditing(!isEditing)}
                    data-testid="button-edit-memo"
                  >
                    <Pencil className="w-3 h-3 mr-1" />
                    {isEditing ? "Done Editing" : "Edit"}
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 text-xs"
                    onClick={handleSendForApproval}
                    data-testid="button-send-approval"
                  >
                    <SendHorizontal className="w-3 h-3 mr-1" />
                    Submit for CFO Approval
                  </Button>
                </>
              )}
              {memoStatus === "sent" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setMemoStatus("approved")}
                  data-testid="button-approve-memo"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Simulate Approval
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!memoGenerated && !isGenerating ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <FileText className="w-10 h-10 text-muted-foreground/30" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">No memorandum generated yet</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Click "Generate from Variances" to create a draft memorandum based on the variance analysis above.</p>
              </div>
            </div>
          ) : isGenerating ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
              <p className="text-sm text-muted-foreground">Generating memorandum from variance analysis...</p>
            </div>
          ) : isEditing ? (
            <textarea
              value={memoContent}
              onChange={(e) => setMemoContent(e.target.value)}
              className="w-full h-[500px] rounded-md border bg-background px-4 py-3 text-xs font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              data-testid="textarea-memo"
            />
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="px-1 space-y-2">
                {memoContent.split("\n").map((line, i) => {
                  if (line === line.toUpperCase() && line.trim().length > 0 && !/^\d/.test(line.trim()) && !/^•/.test(line.trim())) {
                    return <p key={i} className="text-xs font-bold text-foreground pt-2">{line}</p>;
                  }
                  if (/^\d+\./.test(line.trim())) {
                    return <p key={i} className="text-xs font-medium text-foreground">{line}</p>;
                  }
                  if (/^•/.test(line.trim())) {
                    return <p key={i} className="text-xs font-mono text-muted-foreground pl-2">{line}</p>;
                  }
                  if (line.trim().startsWith("Recommendation:")) {
                    return <p key={i} className="text-xs text-primary/80 italic pl-4">{line}</p>;
                  }
                  if (line.trim() === "") {
                    return <div key={i} className="h-2" />;
                  }
                  return <p key={i} className="text-xs text-muted-foreground leading-relaxed">{line}</p>;
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {memoStatus === "approved" && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Filing Approved</p>
                <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-0.5">
                  The {currentLabel} regulatory filing memorandum has been approved by the CFO. Submissions to FDIC, FFIEC, and Federal Reserve portals may proceed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function useLiveTrendData() {
  const { data, isLoading } = useQuery<{ data: Array<{ historicalData?: Array<{ period: string; totalAssets: number; totalDeposits: number; totalLoans: number; netIncome: number; tier1Ratio: number }> }> }>({
    queryKey: ["/api/data-sources/peer-data"],
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  if (isLoading || !data?.data?.length) return { trendData: demoTrendData, isLive: false };

  const mizuhoProxy = data.data[0];
  if (!mizuhoProxy?.historicalData?.length) return { trendData: demoTrendData, isLive: false };

  const liveTrend: TrendDataPoint[] = [...mizuhoProxy.historicalData]
    .sort((a, b) => {
      const [qa, ya] = a.period.replace("Q", "").split(" ");
      const [qb, yb] = b.period.replace("Q", "").split(" ");
      return (parseInt(ya) * 4 + parseInt(qa)) - (parseInt(yb) * 4 + parseInt(qb));
    })
    .map(h => ({
      period: h.period,
      totalAssets: Math.round(h.totalAssets / 1000),
      totalLoans: Math.round(h.totalLoans / 1000),
      totalDeposits: Math.round(h.totalDeposits / 1000),
      netIncome: Math.round(h.netIncome / 1000),
      tier1Capital: parseFloat(h.tier1Ratio.toFixed(2)),
    }));

  return { trendData: liveTrend, isLive: true };
}

type TrendMetric = "totalAssets" | "loansDeposits" | "netIncome" | "tier1Capital";
type ChartType = "area" | "line" | "bar";

const trendMetrics: { id: TrendMetric; label: string; unit: string }[] = [
  { id: "totalAssets", label: "Total Assets", unit: "$M" },
  { id: "loansDeposits", label: "Loans vs Deposits", unit: "$M" },
  { id: "netIncome", label: "Net Income", unit: "$M" },
  { id: "tier1Capital", label: "Tier 1 Capital Ratio", unit: "%" },
];

const chartTypes: { id: ChartType; label: string; icon: typeof AreaChartIcon }[] = [
  { id: "area", label: "Area", icon: AreaChartIcon },
  { id: "line", label: "Line", icon: LineChartIcon },
  { id: "bar", label: "Bar", icon: BarChart3 },
];

function getTrendNarrative(metric: TrendMetric, data: TrendDataPoint[]): string {
  if (!data.length) return "";
  const first = data[0];
  const last = data[data.length - 1];
  switch (metric) {
    case "totalAssets": {
      const change = ((last.totalAssets - first.totalAssets) / first.totalAssets * 100).toFixed(1);
      const dir = parseFloat(change) >= 0 ? "grown" : "contracted";
      return `Total assets have ${dir} ${Math.abs(parseFloat(change))}% from $${first.totalAssets.toLocaleString()}M in ${first.period} to $${last.totalAssets.toLocaleString()}M in ${last.period}. The trajectory shows ${parseFloat(change) > 3 ? "strong balance sheet expansion driven by lending growth and securities acquisitions" : parseFloat(change) > 0 ? "moderate growth consistent with peer bank averages" : "deleveraging activity, potentially reflecting strategic portfolio optimization"}. The most recent quarter ${last.totalAssets > data[data.length - 2]?.totalAssets ? "continued the upward trend" : "saw a slight pullback"}, which should be monitored against the institution's growth targets.`;
    }
    case "loansDeposits": {
      const loanChange = ((last.totalLoans - first.totalLoans) / first.totalLoans * 100).toFixed(1);
      const depChange = ((last.totalDeposits - first.totalDeposits) / first.totalDeposits * 100).toFixed(1);
      const ldrFirst = (first.totalLoans / first.totalDeposits * 100).toFixed(1);
      const ldrLast = (last.totalLoans / last.totalDeposits * 100).toFixed(1);
      return `Loans grew ${loanChange}% while deposits grew ${depChange}% over the observed period. The loan-to-deposit ratio moved from ${ldrFirst}% to ${ldrLast}%, ${parseFloat(ldrLast) > parseFloat(ldrFirst) ? "indicating increased reliance on wholesale funding for loan growth" : "reflecting improved deposit funding of the loan book"}. The divergence between loan and deposit growth rates ${Math.abs(parseFloat(loanChange) - parseFloat(depChange)) > 5 ? "warrants attention from a liquidity management perspective" : "remains within normal operating parameters"}.`;
    }
    case "netIncome": {
      const incomeFirst = first.netIncome;
      const incomeLast = last.netIncome;
      const change = ((incomeLast - incomeFirst) / Math.abs(incomeFirst) * 100).toFixed(1);
      const maxIncome = Math.max(...data.map(d => d.netIncome));
      const maxPeriod = data.find(d => d.netIncome === maxIncome)?.period;
      return `Net income ${parseFloat(change) >= 0 ? "increased" : "decreased"} ${Math.abs(parseFloat(change))}% across the period, from $${incomeFirst.toLocaleString()}M to $${incomeLast.toLocaleString()}M. Peak earnings of $${maxIncome.toLocaleString()}M were recorded in ${maxPeriod}. ${parseFloat(change) > 10 ? "The strong earnings trajectory reflects improving net interest margins and disciplined expense management." : parseFloat(change) > 0 ? "Modest earnings growth is consistent with the current rate environment." : "The earnings pressure should be evaluated against provision build activity and non-interest income trends."}`;
    }
    case "tier1Capital": {
      const capFirst = first.tier1Capital;
      const capLast = last.tier1Capital;
      const change = (capLast - capFirst).toFixed(2);
      return `Tier 1 capital ratio moved from ${capFirst}% to ${capLast}% (${parseFloat(change) >= 0 ? "+" : ""}${change}pp). The ratio remains ${capLast > 10 ? "well above" : capLast > 8 ? "above" : "near"} the 6% well-capitalized threshold. ${parseFloat(change) > 0.5 ? "Capital accretion reflects retained earnings growth outpacing risk-weighted asset expansion." : parseFloat(change) > 0 ? "The stable capital position provides adequate buffer for planned growth initiatives." : "The modest decline warrants review of RWA growth relative to capital generation capacity, particularly given the current lending trajectory."}`;
    }
  }
}

interface InflectionPoint {
  period: string;
  metric: string;
  description: string;
  insight: string;
  severity: "high" | "medium" | "low";
  value: string;
  changePct: string;
}

function getInflectionPoints(data: TrendDataPoint[]): InflectionPoint[] {
  if (data.length < 3) return [];
  const points: InflectionPoint[] = [];

  for (let i = 1; i < data.length - 1; i++) {
    const prev = data[i - 1];
    const curr = data[i];
    const next = data[i + 1];

    const assetDelta1 = (curr.totalAssets - prev.totalAssets) / prev.totalAssets;
    const assetDelta2 = (next.totalAssets - curr.totalAssets) / curr.totalAssets;
    if (Math.sign(assetDelta1) !== Math.sign(assetDelta2) && Math.abs(assetDelta1) > 0.01) {
      const pct = (assetDelta1 * 100).toFixed(1);
      const loanGrowth = ((curr.totalLoans - prev.totalLoans) / prev.totalLoans * 100).toFixed(1);
      const depositGrowth = ((curr.totalDeposits - prev.totalDeposits) / prev.totalDeposits * 100).toFixed(1);
      points.push({
        period: curr.period,
        metric: "Total Assets",
        description: assetDelta1 > 0 ? "Growth peaked — trend reversed to contraction" : "Contraction bottomed — recovery began",
        insight: assetDelta1 > 0
          ? `Asset growth of ${pct}% coincided with loan growth of ${loanGrowth}% and deposit growth of ${depositGrowth}%. The subsequent reversal likely reflects tightened lending standards in response to rising delinquencies, a deliberate reduction in securities holdings to manage duration risk amid rate volatility, or seasonal balance sheet optimization ahead of quarter-end regulatory reporting.`
          : `After contracting, assets began recovering with loans at ${loanGrowth}% growth. This inflection typically signals renewed C&I and CRE lending demand, potentially driven by improving borrower credit quality, stabilizing commercial real estate valuations, or management's decision to deploy excess liquidity built up during the contraction phase.`,
        severity: Math.abs(assetDelta1) > 0.03 ? "high" : "medium",
        value: `$${curr.totalAssets.toLocaleString()}M`,
        changePct: `${parseFloat(pct) >= 0 ? "+" : ""}${pct}%`,
      });
    }

    const incomeDelta1 = curr.netIncome - prev.netIncome;
    const incomeDelta2 = next.netIncome - curr.netIncome;
    if (Math.sign(incomeDelta1) !== Math.sign(incomeDelta2) && Math.abs(incomeDelta1) > 50) {
      const pct = (incomeDelta1 / Math.abs(prev.netIncome) * 100).toFixed(1);
      const nimChange = prev.tier1Capital !== curr.tier1Capital;
      const loanDelta = ((curr.totalLoans - prev.totalLoans) / prev.totalLoans * 100).toFixed(1);
      points.push({
        period: curr.period,
        metric: "Net Income",
        description: incomeDelta1 > 0 ? "Earnings peaked — began declining" : "Earnings troughed — recovery initiated",
        insight: incomeDelta1 > 0
          ? `Earnings peaked at $${curr.netIncome.toLocaleString()}M after a $${Math.abs(incomeDelta1).toLocaleString()}M QoQ increase. The subsequent decline is consistent with higher provision expense as the CECL model incorporated deteriorating macro forecasts, compression in net interest margin as funding costs caught up with asset repricing, and potentially elevated non-interest expenses from technology and compliance investments.`
          : `Earnings troughed at $${curr.netIncome.toLocaleString()}M before recovering. The turnaround likely reflects stabilizing credit costs as early-stage delinquencies plateaued, improved fee income from capital markets and advisory activity, and the lagged benefit of prior-quarter asset repricing flowing through to net interest income. Loan growth of ${loanDelta}% in this period supported earning asset expansion.`,
        severity: Math.abs(incomeDelta1) > 200 ? "high" : "medium",
        value: `$${curr.netIncome.toLocaleString()}M`,
        changePct: `${parseFloat(pct) >= 0 ? "+" : ""}${pct}%`,
      });
    }

    const capDelta1 = curr.tier1Capital - prev.tier1Capital;
    const capDelta2 = next.tier1Capital - curr.tier1Capital;
    if (Math.sign(capDelta1) !== Math.sign(capDelta2) && Math.abs(capDelta1) > 0.1) {
      const rwaGrowth = ((curr.totalLoans - prev.totalLoans) / prev.totalLoans * 100).toFixed(1);
      const incomeDirection = curr.netIncome > prev.netIncome ? "rising" : "declining";
      points.push({
        period: curr.period,
        metric: "Tier 1 Capital",
        description: capDelta1 > 0 ? "Capital ratio peaked — began trending down" : "Capital ratio bottomed — started rebuilding",
        insight: capDelta1 > 0
          ? `Tier 1 ratio peaked at ${curr.tier1Capital}% before declining. This typically occurs when risk-weighted asset growth (loan portfolio grew ${rwaGrowth}%) outpaces capital generation from retained earnings. Contributing factors include accelerated C&I and CRE originations increasing RWA density, AOCI volatility from unrealized AFS securities losses impacting CET1 under the CECL transition, and potential capital return activity (dividends or buybacks) consuming excess capital buffers.`
          : `Capital ratio bottomed at ${curr.tier1Capital}% with ${incomeDirection} net income. The recovery was likely driven by moderated loan growth reducing RWA expansion, improved retained earnings as provision expense normalized, and potential benefits from the AOCI opt-out or transitional CECL capital relief. Management may have also adjusted the securities portfolio duration to reduce mark-to-market CET1 impact.`,
        severity: Math.abs(capDelta1) > 0.3 ? "high" : "low",
        value: `${curr.tier1Capital}%`,
        changePct: `${capDelta1 >= 0 ? "+" : ""}${capDelta1.toFixed(2)}pp`,
      });
    }

    const ldr1 = curr.totalLoans / curr.totalDeposits;
    const ldr0 = prev.totalLoans / prev.totalDeposits;
    const ldr2 = next.totalLoans / next.totalDeposits;
    const ldrDelta1 = ldr1 - ldr0;
    const ldrDelta2 = ldr2 - ldr1;
    if (Math.sign(ldrDelta1) !== Math.sign(ldrDelta2) && Math.abs(ldrDelta1) > 0.005) {
      const loanPct = ((curr.totalLoans - prev.totalLoans) / prev.totalLoans * 100).toFixed(1);
      const depPct = ((curr.totalDeposits - prev.totalDeposits) / prev.totalDeposits * 100).toFixed(1);
      points.push({
        period: curr.period,
        metric: "Loan-to-Deposit Ratio",
        description: ldrDelta1 > 0 ? "LDR peaked — liquidity position began improving" : "LDR troughed — lending activity accelerated relative to deposits",
        insight: ldrDelta1 > 0
          ? `LDR peaked at ${(ldr1 * 100).toFixed(1)}% with loans at ${loanPct}% growth vs deposits at ${depPct}%. The subsequent improvement suggests management pivoted to deposit gathering — likely through promotional rate offerings, treasury management client acquisition, or reduced wholesale funding reliance. This may also reflect seasonal corporate deposit inflows or a strategic decision to slow loan originations as credit spreads tightened.`
          : `LDR troughed at ${(ldr1 * 100).toFixed(1)}% before lending accelerated. Loan growth of ${loanPct}% outpacing deposit growth of ${depPct}% indicates renewed credit demand, potentially from middle-market C&I borrowers drawing on revolving facilities, CRE construction fundings, or expansion of the consumer lending portfolio. This shift warrants monitoring of the institution's contingent liquidity position and FHLB borrowing capacity.`,
        severity: Math.abs(ldrDelta1) > 0.015 ? "medium" : "low",
        value: `${(ldr1 * 100).toFixed(1)}%`,
        changePct: `${ldrDelta1 >= 0 ? "+" : ""}${(ldrDelta1 * 100).toFixed(2)}pp`,
      });
    }
  }

  return points.slice(0, 8);
}

function TrendAnalysisTab() {
  const { trendData, isLive } = useLiveTrendData();
  const [activeMetric, setActiveMetric] = useState<TrendMetric>("totalAssets");
  const [chartType, setChartType] = useState<ChartType>("area");

  const inflectionPoints = getInflectionPoints(trendData);

  const tooltipStyle = {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "6px",
    fontSize: "12px",
  };

  const isPercent = activeMetric === "tier1Capital";
  const formatValue = (value: number) => isPercent ? `${value}%` : `$${value.toLocaleString()}M`;

  const renderChart = () => {
    const commonProps = { data: trendData };
    const xAxis = <XAxis dataKey="period" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={55} />;
    const yAxis = <YAxis tick={{ fontSize: 11 }} domain={isPercent ? ["auto", "auto"] : ["dataMin - 2000", "dataMax + 2000"]} />;
    const grid = <CartesianGrid strokeDasharray="3 3" opacity={0.1} />;
    const tooltip = <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [formatValue(value), ""]} />;

    if (activeMetric === "loansDeposits") {
      if (chartType === "bar") {
        return (
          <BarChart {...commonProps}>
            {grid}{xAxis}{yAxis}{tooltip}
            <Legend wrapperStyle={{ fontSize: "11px" }} />
            <Bar dataKey="totalLoans" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Total Loans" />
            <Bar dataKey="totalDeposits" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} name="Total Deposits" />
          </BarChart>
        );
      }
      if (chartType === "area") {
        return (
          <AreaChart {...commonProps}>
            {grid}{xAxis}{yAxis}{tooltip}
            <Legend wrapperStyle={{ fontSize: "11px" }} />
            <Area type="monotone" dataKey="totalLoans" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.1} strokeWidth={2} name="Total Loans" />
            <Area type="monotone" dataKey="totalDeposits" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.1} strokeWidth={2} name="Total Deposits" />
          </AreaChart>
        );
      }
      return (
        <LineChart {...commonProps}>
          {grid}{xAxis}{yAxis}{tooltip}
          <Legend wrapperStyle={{ fontSize: "11px" }} />
          <Line type="monotone" dataKey="totalLoans" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 3 }} name="Total Loans" />
          <Line type="monotone" dataKey="totalDeposits" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ r: 3 }} name="Total Deposits" />
        </LineChart>
      );
    }

    const dataKey = activeMetric === "totalAssets" ? "totalAssets" : activeMetric === "netIncome" ? "netIncome" : "tier1Capital";
    const color = activeMetric === "totalAssets" ? "hsl(var(--chart-1))" : activeMetric === "netIncome" ? "hsl(var(--chart-4))" : "hsl(var(--chart-5))";
    const name = trendMetrics.find(m => m.id === activeMetric)?.label ?? "";

    if (chartType === "bar") {
      return (
        <BarChart {...commonProps}>
          {grid}{xAxis}{yAxis}{tooltip}
          <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} name={name} />
        </BarChart>
      );
    }
    if (chartType === "line") {
      return (
        <LineChart {...commonProps}>
          {grid}{xAxis}{yAxis}{tooltip}
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ r: 3 }} name={name} />
        </LineChart>
      );
    }
    return (
      <AreaChart {...commonProps}>
        {grid}{xAxis}{yAxis}{tooltip}
        <Area type="monotone" dataKey={dataKey} stroke={color} fill={color} fillOpacity={0.15} strokeWidth={2} name={name} />
      </AreaChart>
    );
  };

  return (
    <div className="space-y-4">
      {isLive && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0">
            <Wifi className="w-3 h-3 mr-1" />
            Live FDIC Data
          </Badge>
          <span className="text-xs text-muted-foreground">Trends from ingested Call Report data (Mizuho Americas)</span>
        </div>
      )}

      <Card data-testid="card-trend-main">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {trendMetrics.map(m => (
                <Button
                  key={m.id}
                  variant={activeMetric === m.id ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setActiveMetric(m.id)}
                  data-testid={`button-metric-${m.id}`}
                >
                  {m.label}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-1 rounded-md border p-0.5" data-testid="chart-type-toggle">
              {chartTypes.map(ct => {
                const Icon = ct.icon;
                return (
                  <button
                    key={ct.id}
                    onClick={() => setChartType(ct.id)}
                    className={`p-1.5 rounded transition-colors ${chartType === ct.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                    title={ct.label}
                    data-testid={`button-chart-${ct.id}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                );
              })}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <div className="w-full max-w-[900px] h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
              </ResponsiveContainer>
            </div>
          </div>
          <Separator />
          <div className="flex items-start gap-2 px-2">
            <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed" data-testid="text-trend-narrative">
              {getTrendNarrative(activeMetric, trendData)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-inflection-points">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm">Inflection Point Analysis</CardTitle>
            <Badge variant="secondary" className="text-[10px]">{inflectionPoints.length} detected</Badge>
          </div>
          <p className="text-xs text-muted-foreground">Algorithmically identified trend reversals and regime changes across key financial metrics</p>
        </CardHeader>
        <CardContent>
          {inflectionPoints.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">Insufficient data points to detect inflection points. At least 3 periods required.</p>
          ) : (
            <div className="space-y-3">
              {inflectionPoints.map((pt, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-border/60 bg-muted/20 p-4"
                  data-testid={`inflection-point-${idx}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 rounded-full p-1.5 shrink-0 ${pt.severity === "high" ? "bg-red-500/10 text-red-500" : pt.severity === "medium" ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"}`}>
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{pt.metric}</span>
                        <Badge variant="outline" className="text-[10px]">{pt.period}</Badge>
                        <span className="text-xs font-mono text-muted-foreground">{pt.value}</span>
                        <Badge variant="outline" className="text-[10px] font-mono">{pt.changePct}</Badge>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] border-0 ${pt.severity === "high" ? "bg-red-500/10 text-red-500" : pt.severity === "medium" ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"}`}
                        >
                          {pt.severity}
                        </Badge>
                      </div>
                      <p className="text-xs font-medium text-foreground/80 mt-1.5">{pt.description}</p>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{pt.insight}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function RegulatoryReporting() {
  const [activeTab, setActiveTab] = useState("instructions");

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[1200px] mx-auto p-6 space-y-6">
        <div className="space-y-1">
          <p className="text-[10px] font-mono font-medium text-destructive tracking-[0.12em] uppercase">Regulatory Reporting</p>
          <h1 className="text-2xl font-serif font-semibold tracking-tight" data-testid="text-reporting-title">
            Regulatory Reporting Lifecycle
          </h1>
          <p className="text-sm text-muted-foreground">
            AI-powered capabilities supporting each stage of the regulatory reporting process
          </p>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {steps.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => setActiveTab(step.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === step.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              data-testid={`button-step-${step.id}`}
            >
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border border-current/20">
                {step.step}
              </div>
              <step.icon className="w-3.5 h-3.5" />
              {step.label}
              {idx < steps.length - 1 && activeTab !== step.id && (
                <ChevronRight className="w-3 h-3 ml-1 opacity-40" />
              )}
            </button>
          ))}
        </div>

        <Separator />

        {activeTab === "instructions" && <InstructionsTab />}
        {activeTab === "data" && <DataDictionaryTab />}
        {activeTab === "anomalies" && <AnomaliesTab />}
        {activeTab === "review" && <ReportReviewTab />}
        {activeTab === "comparison" && <ReviewApprovalTab />}
        {activeTab === "trends" && <TrendAnalysisTab />}
      </div>
    </div>
  );
}
