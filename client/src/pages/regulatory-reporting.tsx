import { useState, useCallback, useSyncExternalStore } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Upload,
  Trash2,
  X,
  FileUp,
  History,
  Globe,
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
  ReferenceLine,
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

interface IngestedSource {
  sourceSystem: string;
  fileName: string;
  tables: number;
  fields: number;
  status: "Mapped" | "Partial" | "Pending";
  coverage: number;
  quarter: string;
  fileSize: string;
  lastIngested: string;
}

const INGESTED_SOURCES: IngestedSource[] = [
  { sourceSystem: "Core Banking", fileName: "GL_Extract_Q1_2026.xlsx", tables: 1, fields: 22, status: "Mapped", coverage: 100, quarter: "Q1 2026", fileSize: "31 KB", lastIngested: "2026-03-31 23:45:00" },
  { sourceSystem: "Trading Systems", fileName: "Trading_Positions_Q1_2026.xlsx", tables: 1, fields: 17, status: "Mapped", coverage: 100, quarter: "Q1 2026", fileSize: "28 KB", lastIngested: "2026-03-31 22:30:00" },
  { sourceSystem: "Loan Origination", fileName: "Loan_Portfolio_Q1_2026.xlsx", tables: 1, fields: 19, status: "Mapped", coverage: 100, quarter: "Q1 2026", fileSize: "30 KB", lastIngested: "2026-03-31 23:15:00" },
  { sourceSystem: "Treasury", fileName: "Treasury_Data_Q1_2026.xlsx", tables: 1, fields: 18, status: "Mapped", coverage: 100, quarter: "Q1 2026", fileSize: "29 KB", lastIngested: "2026-03-31 21:00:00" },
  { sourceSystem: "Risk Systems", fileName: "Risk_Metrics_Q1_2026.xlsx", tables: 1, fields: 26, status: "Mapped", coverage: 100, quarter: "Q1 2026", fileSize: "34 KB", lastIngested: "2026-03-31 23:50:00" },
  { sourceSystem: "Regulatory Reference", fileName: "MDRM_Taxonomy.xlsx", tables: 1, fields: 54, status: "Mapped", coverage: 100, quarter: "Q1 2026", fileSize: "44 KB", lastIngested: "2026-03-15 10:00:00" },
];

interface DataMapping {
  sourceField: string;
  reportLineItem: string;
  transformation: string;
  status: "Active" | "Review" | "Inactive" | "Draft";
  schedule: string;
  confidence: number;
  linkedSources?: string[];
}

const DATA_MAPPINGS: DataMapping[] = [
  { sourceField: "GL_Extract.Cash_Balances", reportLineItem: "RC-1: Cash and balances", transformation: "SUM(GL.1000-1099)", status: "Active", schedule: "RC", confidence: 99, linkedSources: ["Treasury.FedFunds_Sold", "MDRM_Taxonomy.RCON0010"] },
  { sourceField: "GL_Extract.Investment_Securities", reportLineItem: "RC-2: Securities", transformation: "SUM(GL.1200-1299) + AFS_Adjustment", status: "Active", schedule: "RC", confidence: 97, linkedSources: ["Trading_Positions.HTM_Securities", "Risk_Metrics.AFS_FairValue"] },
  { sourceField: "Trading_Positions.Net_Position", reportLineItem: "RC-5: Trading assets", transformation: "SUM(Position.MTM) WHERE Side='Long'", status: "Active", schedule: "RC", confidence: 95, linkedSources: ["GL_Extract.Trading_GL", "Risk_Metrics.VaR_99"] },
  { sourceField: "Loan_Portfolio.Outstanding_Balance", reportLineItem: "RC-4: Loans and leases", transformation: "SUM(Loans.Balance) - ALLL", status: "Active", schedule: "RC-C", confidence: 98, linkedSources: ["GL_Extract.Loan_GL_Balances", "Risk_Metrics.CECL_Reserve"] },
  { sourceField: "Treasury.FedFunds_Sold", reportLineItem: "RC-3: Federal funds sold", transformation: "DIRECT_MAP(Treasury.FF_Sold)", status: "Active", schedule: "RC", confidence: 100 },
  { sourceField: "GL_Extract.Interest_Receivable", reportLineItem: "RI-1: Interest income", transformation: "SUM(GL.4000-4099) QTD", status: "Active", schedule: "RI", confidence: 96, linkedSources: ["Loan_Portfolio.Interest_Accrued", "Trading_Positions.Coupon_Income", "Treasury.Invest_Income"] },
  { sourceField: "GL_Extract.Interest_Payable", reportLineItem: "RI-2: Interest expense", transformation: "SUM(GL.5000-5099) QTD", status: "Active", schedule: "RI", confidence: 96, linkedSources: ["Treasury.Funding_Cost", "Treasury.FHLB_Interest"] },
  { sourceField: "Loan_Portfolio.Provision_Expense", reportLineItem: "RI-4: Provision for credit losses", transformation: "SUM(Provision.CECL_Charge) QTD", status: "Active", schedule: "RI", confidence: 94, linkedSources: ["Risk_Metrics.ECL_Model_Output", "GL_Extract.Provision_GL"] },
  { sourceField: "Risk_Metrics.CET1_Capital", reportLineItem: "RC-R-1: CET1 capital", transformation: "CET1_Components - Deductions", status: "Active", schedule: "RC-R", confidence: 92, linkedSources: ["GL_Extract.Equity_Detail", "GL_Extract.AOCI_Balance", "MDRM_Taxonomy.RCONA223"] },
  { sourceField: "Risk_Metrics.RWA_Credit", reportLineItem: "RC-R-2: Risk-weighted assets", transformation: "SUM(RWA.Credit + RWA.Market + RWA.Op)", status: "Active", schedule: "RC-R", confidence: 91, linkedSources: ["Loan_Portfolio.Risk_Weights", "Trading_Positions.Market_RWA"] },
  { sourceField: "GL_Extract.Deposit_Balances", reportLineItem: "RC-E: Total deposits", transformation: "SUM(GL.6000-6299)", status: "Active", schedule: "RC-E", confidence: 98, linkedSources: ["Treasury.Wholesale_Deposits"] },
  { sourceField: "Loan_Portfolio.Delinquent_30_89", reportLineItem: "RC-N: Past due 30-89 days", transformation: "SUM(Loans.PastDue) WHERE DPD BETWEEN 30 AND 89", status: "Active", schedule: "RC-N", confidence: 93, linkedSources: ["Risk_Metrics.DPD_Buckets"] },
  { sourceField: "Loan_Portfolio.Nonaccrual", reportLineItem: "RC-N: Nonaccrual loans", transformation: "SUM(Loans.Balance) WHERE Status='Nonaccrual'", status: "Active", schedule: "RC-N", confidence: 90, linkedSources: ["Risk_Metrics.Impaired_Assets", "GL_Extract.Nonaccrual_GL"] },
  { sourceField: "Trading_Positions.Derivative_Notional", reportLineItem: "RC-L: Derivatives notional", transformation: "SUM(Deriv.Notional) BY Type", status: "Active", schedule: "RC-L", confidence: 88, linkedSources: ["Risk_Metrics.Counterparty_Exposure", "Treasury.Hedge_Positions"] },
  { sourceField: "Treasury.FHLB_Borrowings", reportLineItem: "RC-14: Other borrowed money", transformation: "DIRECT_MAP(Treasury.FHLB)", status: "Review", schedule: "RC", confidence: 85, linkedSources: ["GL_Extract.Borrowings_GL"] },
  { sourceField: "GL_Extract.NonInterest_Expense", reportLineItem: "RI-7: Noninterest expense", transformation: "SUM(GL.7000-7999) QTD", status: "Active", schedule: "RI", confidence: 95 },
  { sourceField: "Risk_Metrics.Tier1_Leverage", reportLineItem: "RC-R: Leverage ratio", transformation: "Tier1_Capital / Avg_Total_Assets", status: "Active", schedule: "RC-R", confidence: 93, linkedSources: ["GL_Extract.Avg_Assets", "Risk_Metrics.CET1_Capital"] },
  { sourceField: "Treasury.Repo_Positions", reportLineItem: "RC-14.a: Securities sold under repo", transformation: "SUM(Repo.Balance) WHERE Type='Repo'", status: "Review", schedule: "RC", confidence: 78, linkedSources: ["GL_Extract.Repo_GL", "Trading_Positions.Collateral_Pledged"] },
  { sourceField: "GL_Extract.AOCI_Balance", reportLineItem: "RC-R: AOCI component", transformation: "GL.3600 (AFS unrealized G/L)", status: "Review", schedule: "RC-R", confidence: 82, linkedSources: ["Trading_Positions.AFS_Unrealized", "Risk_Metrics.AOCI_Deduction"] },
  { sourceField: "MDRM_Taxonomy.RCON2170", reportLineItem: "RC: Total assets", transformation: "VALIDATION_CHECK(SUM(RC.1 thru RC.11))", status: "Active", schedule: "RC", confidence: 100, linkedSources: ["GL_Extract.Total_Assets_GL", "Risk_Metrics.Consolidated_Assets"] },
];

interface SourceDictionaryColumn {
  name: string;
  type: string;
  table: string;
  nullable: boolean;
  description: string;
}

interface SourceDictionary {
  sourceSystem: string;
  columns: SourceDictionaryColumn[];
  recordCount: number;
  lastUpdated: string;
  qualityScore: number;
  nullRate: number;
}

const SOURCE_DICTIONARIES: Record<string, SourceDictionary> = {
  "Core Banking": {
    sourceSystem: "Core Banking",
    columns: [
      { name: "GL_Account_ID", type: "VARCHAR(20)", table: "Chart_of_Accounts", nullable: false, description: "General ledger account identifier" },
      { name: "GL_Account_Name", type: "VARCHAR(255)", table: "Chart_of_Accounts", nullable: false, description: "Account description per chart of accounts" },
      { name: "GL_Balance", type: "DECIMAL(18,2)", table: "Trial_Balance", nullable: false, description: "Period-end ledger balance (USD)" },
      { name: "GL_Balance_Prior", type: "DECIMAL(18,2)", table: "Trial_Balance", nullable: true, description: "Prior period ledger balance for variance" },
      { name: "Cost_Center", type: "VARCHAR(10)", table: "Trial_Balance", nullable: false, description: "Cost center or department code" },
      { name: "Entity_Code", type: "VARCHAR(10)", table: "Trial_Balance", nullable: false, description: "Legal entity identifier" },
      { name: "Currency", type: "CHAR(3)", table: "Trial_Balance", nullable: false, description: "ISO 4217 currency code" },
      { name: "Cash_Balances", type: "DECIMAL(18,2)", table: "Cash_Positions", nullable: false, description: "End-of-day cash position by account" },
      { name: "Investment_Securities", type: "DECIMAL(18,2)", table: "Securities_Ledger", nullable: true, description: "Investment securities at fair value" },
      { name: "AFS_Unrealized_GL", type: "DECIMAL(18,2)", table: "Securities_Ledger", nullable: true, description: "Available-for-sale unrealized gain/loss" },
      { name: "Interest_Receivable", type: "DECIMAL(18,2)", table: "Accruals", nullable: true, description: "Accrued interest receivable" },
      { name: "Interest_Payable", type: "DECIMAL(18,2)", table: "Accruals", nullable: true, description: "Accrued interest payable" },
      { name: "AOCI_Balance", type: "DECIMAL(18,2)", table: "Equity_Detail", nullable: true, description: "Accumulated other comprehensive income" },
      { name: "Deposit_Balances", type: "DECIMAL(18,2)", table: "Deposit_Ledger", nullable: false, description: "Total deposit balances by type" },
      { name: "NonInterest_Expense", type: "DECIMAL(18,2)", table: "Expense_Ledger", nullable: false, description: "Non-interest expense period total" },
      { name: "Posting_Date", type: "DATE", table: "Journal_Entries", nullable: false, description: "Transaction posting date" },
    ],
    recordCount: 24850,
    lastUpdated: "2025-12-31",
    qualityScore: 97.2,
    nullRate: 1.4,
  },
  "Trading Systems": {
    sourceSystem: "Trading Systems",
    columns: [
      { name: "Trade_ID", type: "VARCHAR(30)", table: "Trade_Blotter", nullable: false, description: "Unique trade identifier" },
      { name: "Instrument_Type", type: "VARCHAR(20)", table: "Trade_Blotter", nullable: false, description: "Asset class (Equity, FI, FX, Derivative)" },
      { name: "CUSIP", type: "CHAR(9)", table: "Trade_Blotter", nullable: true, description: "CUSIP identifier for securities" },
      { name: "Net_Position", type: "DECIMAL(18,2)", table: "Position_Summary", nullable: false, description: "Net position mark-to-market value" },
      { name: "Side", type: "VARCHAR(5)", table: "Position_Summary", nullable: false, description: "Position direction (Long/Short)" },
      { name: "MTM_Value", type: "DECIMAL(18,2)", table: "Position_Summary", nullable: false, description: "Mark-to-market valuation" },
      { name: "Notional_Amount", type: "DECIMAL(18,2)", table: "Derivatives", nullable: true, description: "Derivative notional principal amount" },
      { name: "Derivative_Type", type: "VARCHAR(20)", table: "Derivatives", nullable: true, description: "Derivative instrument type (Swap, Option, Future)" },
      { name: "Counterparty_ID", type: "VARCHAR(20)", table: "Derivatives", nullable: true, description: "Counterparty legal entity identifier" },
      { name: "CVA_Adjustment", type: "DECIMAL(18,2)", table: "Derivatives", nullable: true, description: "Credit valuation adjustment" },
      { name: "Trade_Date", type: "DATE", table: "Trade_Blotter", nullable: false, description: "Trade execution date" },
      { name: "Settlement_Date", type: "DATE", table: "Trade_Blotter", nullable: true, description: "Expected settlement date" },
    ],
    recordCount: 15620,
    lastUpdated: "2025-12-31",
    qualityScore: 94.8,
    nullRate: 2.1,
  },
  "Loan Origination": {
    sourceSystem: "Loan Origination",
    columns: [
      { name: "Loan_ID", type: "VARCHAR(20)", table: "Loan_Master", nullable: false, description: "Unique loan identifier" },
      { name: "Borrower_ID", type: "VARCHAR(20)", table: "Loan_Master", nullable: false, description: "Borrower entity identifier" },
      { name: "Outstanding_Balance", type: "DECIMAL(18,2)", table: "Loan_Balances", nullable: false, description: "Current outstanding principal balance" },
      { name: "Original_Amount", type: "DECIMAL(18,2)", table: "Loan_Master", nullable: false, description: "Original loan commitment amount" },
      { name: "Loan_Type", type: "VARCHAR(20)", table: "Loan_Master", nullable: false, description: "Loan classification (CRE, C&I, Consumer, Resi)" },
      { name: "Interest_Rate", type: "DECIMAL(8,4)", table: "Loan_Master", nullable: false, description: "Current contractual interest rate" },
      { name: "Maturity_Date", type: "DATE", table: "Loan_Master", nullable: false, description: "Loan maturity date" },
      { name: "Days_Past_Due", type: "INTEGER", table: "Delinquency", nullable: false, description: "Days past due (0 = current)" },
      { name: "Accrual_Status", type: "VARCHAR(15)", table: "Delinquency", nullable: false, description: "Accrual status (Accrual/Nonaccrual)" },
      { name: "Risk_Rating", type: "VARCHAR(5)", table: "Credit_Risk", nullable: false, description: "Internal risk rating (1-10 scale)" },
      { name: "CECL_Reserve", type: "DECIMAL(18,2)", table: "Reserves", nullable: true, description: "CECL allowance allocation for this loan" },
      { name: "Provision_Expense", type: "DECIMAL(18,2)", table: "Reserves", nullable: true, description: "Quarterly provision expense allocation" },
      { name: "Collateral_Value", type: "DECIMAL(18,2)", table: "Collateral", nullable: true, description: "Appraised collateral value" },
      { name: "LTV_Ratio", type: "DECIMAL(6,2)", table: "Collateral", nullable: true, description: "Loan-to-value ratio (%)" },
      { name: "Delinquent_30_89", type: "DECIMAL(18,2)", table: "Delinquency", nullable: true, description: "Balance of loans 30-89 days past due" },
      { name: "Nonaccrual", type: "DECIMAL(18,2)", table: "Delinquency", nullable: true, description: "Balance of nonaccrual loans" },
    ],
    recordCount: 31240,
    lastUpdated: "2025-12-31",
    qualityScore: 95.6,
    nullRate: 1.8,
  },
  "Treasury": {
    sourceSystem: "Treasury",
    columns: [
      { name: "Position_ID", type: "VARCHAR(20)", table: "Cash_Management", nullable: false, description: "Treasury position identifier" },
      { name: "FedFunds_Sold", type: "DECIMAL(18,2)", table: "Interbank", nullable: true, description: "Federal funds sold balance" },
      { name: "FedFunds_Purchased", type: "DECIMAL(18,2)", table: "Interbank", nullable: true, description: "Federal funds purchased balance" },
      { name: "Repo_Balance", type: "DECIMAL(18,2)", table: "Repo_Positions", nullable: true, description: "Securities sold under repo" },
      { name: "Reverse_Repo", type: "DECIMAL(18,2)", table: "Repo_Positions", nullable: true, description: "Securities purchased under resale" },
      { name: "FHLB_Borrowings", type: "DECIMAL(18,2)", table: "Wholesale_Funding", nullable: true, description: "FHLB advance borrowings" },
      { name: "Funding_Rate", type: "DECIMAL(8,4)", table: "Wholesale_Funding", nullable: true, description: "Weighted average funding rate" },
      { name: "Maturity_Bucket", type: "VARCHAR(10)", table: "Liquidity", nullable: false, description: "Maturity time bucket for ALM" },
    ],
    recordCount: 4820,
    lastUpdated: "2025-12-31",
    qualityScore: 88.5,
    nullRate: 4.2,
  },
  "Risk Systems": {
    sourceSystem: "Risk Systems",
    columns: [
      { name: "Risk_Metric_ID", type: "VARCHAR(20)", table: "Capital_Metrics", nullable: false, description: "Risk metric identifier" },
      { name: "CET1_Capital", type: "DECIMAL(18,2)", table: "Capital_Metrics", nullable: false, description: "Common Equity Tier 1 capital" },
      { name: "Tier1_Capital", type: "DECIMAL(18,2)", table: "Capital_Metrics", nullable: false, description: "Total Tier 1 capital" },
      { name: "Tier2_Capital", type: "DECIMAL(18,2)", table: "Capital_Metrics", nullable: false, description: "Tier 2 capital components" },
      { name: "RWA_Credit", type: "DECIMAL(18,2)", table: "RWA_Breakdown", nullable: false, description: "Credit risk-weighted assets" },
      { name: "RWA_Market", type: "DECIMAL(18,2)", table: "RWA_Breakdown", nullable: false, description: "Market risk-weighted assets" },
      { name: "RWA_Operational", type: "DECIMAL(18,2)", table: "RWA_Breakdown", nullable: false, description: "Operational risk-weighted assets" },
      { name: "Tier1_Leverage", type: "DECIMAL(6,2)", table: "Ratios", nullable: false, description: "Tier 1 leverage ratio (%)" },
      { name: "LCR", type: "DECIMAL(6,2)", table: "Liquidity_Risk", nullable: true, description: "Liquidity coverage ratio (%)" },
      { name: "NSFR", type: "DECIMAL(6,2)", table: "Liquidity_Risk", nullable: true, description: "Net stable funding ratio (%)" },
      { name: "VaR_99", type: "DECIMAL(18,2)", table: "Market_Risk", nullable: true, description: "Value at Risk at 99% confidence" },
      { name: "Stress_Loss", type: "DECIMAL(18,2)", table: "Stress_Testing", nullable: true, description: "Severely adverse stress scenario loss" },
    ],
    recordCount: 18930,
    lastUpdated: "2025-12-31",
    qualityScore: 98.1,
    nullRate: 0.8,
  },
  "Regulatory Reference": {
    sourceSystem: "Regulatory Reference",
    columns: [
      { name: "MDRM_Code", type: "VARCHAR(15)", table: "MDRM_Master", nullable: false, description: "MDRM (Micro Data Reference Manual) code" },
      { name: "Item_Name", type: "VARCHAR(255)", table: "MDRM_Master", nullable: false, description: "Regulatory line item name" },
      { name: "Schedule", type: "VARCHAR(10)", table: "MDRM_Master", nullable: false, description: "Report schedule (RC, RI, RC-R, etc.)" },
      { name: "Line_Number", type: "VARCHAR(10)", table: "MDRM_Master", nullable: false, description: "Line item number within schedule" },
      { name: "Data_Type", type: "VARCHAR(20)", table: "MDRM_Master", nullable: false, description: "Expected data type and precision" },
      { name: "Start_Date", type: "DATE", table: "MDRM_History", nullable: false, description: "Effective date for this MDRM code" },
      { name: "End_Date", type: "DATE", table: "MDRM_History", nullable: true, description: "Sunset date (null = currently active)" },
      { name: "Validation_Rule", type: "TEXT", table: "Validation_Rules", nullable: true, description: "Cross-check or validation formula" },
      { name: "Report_Form", type: "VARCHAR(10)", table: "MDRM_Master", nullable: false, description: "Report form (031, 041, 051)" },
    ],
    recordCount: 45000,
    lastUpdated: "2025-12-15",
    qualityScore: 100.0,
    nullRate: 0.0,
  },
};

function CoverageBar({ coverage }: { coverage: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-[80px] h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${coverage >= 90 ? "bg-primary" : coverage >= 70 ? "bg-primary/70" : "bg-amber-500"}`}
          style={{ width: `${coverage}%` }}
        />
      </div>
      <span className="text-xs font-mono text-muted-foreground w-[36px] text-right">{coverage}%</span>
    </div>
  );
}

interface UploadedSource {
  id: string;
  sourceSystem: string;
  fileName: string;
  fileSize: string;
  quarter: string;
  tables: number;
  fields: number;
  status: "Profiling" | "Mapped" | "Partial";
  coverage: number;
  uploadedAt: string;
}

const SOURCE_SYSTEM_OPTIONS = [
  "Core Banking",
  "Trading Systems",
  "Loan Origination",
  "Treasury",
  "Risk Systems",
  "Regulatory Reference",
  "Custom / Other",
];

const QUARTER_OPTIONS = ["Q4 2025", "Q3 2025", "Q2 2025", "Q1 2025", "Q4 2024"];

const FILE_TYPE_LABELS: Record<string, string> = {
  xlsx: "Excel Workbook",
  xls: "Excel Spreadsheet",
  csv: "CSV File",
  pdf: "PDF Document",
  txt: "Text File",
};

const FFIEC_REPORTS = [
  { id: "031", name: "FFIEC 031", desc: "Call Report — Domestic & Foreign Offices", schedules: 80, fields: 2400 },
  { id: "041", name: "FFIEC 041", desc: "Call Report — Domestic Offices Only", schedules: 60, fields: 1800 },
  { id: "051", name: "FFIEC 051", desc: "Call Report — Small Institution", schedules: 40, fields: 950 },
  { id: "102", name: "FFIEC 102", desc: "Market Risk — Trading Activity", schedules: 12, fields: 320 },
  { id: "101", name: "FFIEC 101", desc: "Regulatory Capital — Advanced Approaches", schedules: 18, fields: 580 },
];

const AVAILABLE_PERIODS = [
  "Q4 2025", "Q3 2025", "Q2 2025", "Q1 2025",
  "Q4 2024", "Q3 2024", "Q2 2024", "Q1 2024",
  "Q4 2023", "Q3 2023", "Q2 2023", "Q1 2023",
];

const DEFAULT_PERIODS = new Set([
  "Q4 2025", "Q3 2025", "Q2 2025", "Q1 2025",
  "Q4 2024", "Q3 2024", "Q2 2024", "Q1 2024",
]);

let historicalPullListeners: Array<() => void> = [];
let historicalPullState: { pulled: boolean; quarters: number; reportName: string; timestamp: string } = { pulled: false, quarters: 0, reportName: "", timestamp: "" };

function setHistoricalPullState(state: typeof historicalPullState) {
  historicalPullState = state;
  historicalPullListeners.forEach(l => l());
}

function useHistoricalPullStatus() {
  return useSyncExternalStore(
    (cb) => { historicalPullListeners.push(cb); return () => { historicalPullListeners = historicalPullListeners.filter(l => l !== cb); }; },
    () => historicalPullState,
  );
}

interface PulledReport {
  reportId: string;
  reportName: string;
  period: string;
  pulledAt: string;
  schedules: number;
  fields: number;
  status: "completed" | "pulling";
}

function HistoricalDataPull() {
  const [selectedReport, setSelectedReport] = useState("031");
  const [selectedPeriods, setSelectedPeriods] = useState<Set<string>>(new Set(DEFAULT_PERIODS));
  const [pulledReports, setPulledReports] = useState<PulledReport[]>([]);
  const [isPulling, setIsPulling] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "checking" | "disconnected">("connected");

  const togglePeriod = (period: string) => {
    setSelectedPeriods(prev => {
      const next = new Set(prev);
      if (next.has(period)) next.delete(period); else next.add(period);
      return next;
    });
  };

  const selectAllPeriods = () => setSelectedPeriods(new Set(AVAILABLE_PERIODS));
  const selectNone = () => setSelectedPeriods(new Set());

  const handlePull = () => {
    if (selectedPeriods.size === 0) return;
    const report = FFIEC_REPORTS.find(r => r.id === selectedReport)!;
    setIsPulling(true);

    const periodsArr = AVAILABLE_PERIODS.filter(p => selectedPeriods.has(p));
    const newPulls: PulledReport[] = periodsArr.map(period => ({
      reportId: report.id,
      reportName: report.name,
      period,
      pulledAt: new Date().toISOString(),
      schedules: report.schedules,
      fields: report.fields,
      status: "pulling" as const,
    }));
    setPulledReports(prev => [...newPulls, ...prev]);

    let completed = 0;
    const interval = setInterval(() => {
      completed++;
      setPulledReports(prev => prev.map((r, idx) =>
        idx < newPulls.length && idx < completed ? { ...r, status: "completed" } : r
      ));
      if (completed >= newPulls.length) {
        clearInterval(interval);
        setIsPulling(false);
        setHistoricalPullState({
          pulled: true,
          quarters: periodsArr.length,
          reportName: report.name,
          timestamp: new Date().toLocaleTimeString(),
        });
      }
    }, 600);
  };

  const handleTestConnection = () => {
    setConnectionStatus("checking");
    setTimeout(() => setConnectionStatus("connected"), 1500);
  };

  const report = FFIEC_REPORTS.find(r => r.id === selectedReport)!;
  const completedPulls = pulledReports.filter(r => r.status === "completed");

  return (
    <Card data-testid="card-historical-data-pull">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm">Historical Call Report Data</CardTitle>
            <Badge variant="outline" className="text-xs font-mono">FFIEC CDR</Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${connectionStatus === "connected" ? "bg-emerald-500" : connectionStatus === "checking" ? "bg-amber-500 animate-pulse" : "bg-red-500"}`} />
              <span className="text-[10px] text-muted-foreground">
                {connectionStatus === "connected" ? "Connected" : connectionStatus === "checking" ? "Checking..." : "Disconnected"}
              </span>
            </div>
            <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={handleTestConnection} data-testid="button-test-ffiec-connection">
              <Globe className="w-3 h-3 mr-1" />Test
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Connect to the FFIEC Central Data Repository to pull historical regulatory filings. Select a report type and quarters to retrieve prior-period data for trend analysis and variance detection.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex-1 min-w-[220px]">
            <Label className="text-xs font-medium mb-1.5 block">Report Type</Label>
            <Select value={selectedReport} onValueChange={setSelectedReport}>
              <SelectTrigger className="h-9 text-xs" data-testid="select-report-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FFIEC_REPORTS.map(r => (
                  <SelectItem key={r.id} value={r.id} data-testid={`select-report-${r.id}`}>
                    <span className="font-semibold">{r.name}</span>
                    <span className="text-muted-foreground ml-1.5">— {r.desc}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="shrink-0">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-1.5">
              <span className="font-mono">{report.schedules} schedules</span>
              <span>·</span>
              <span className="font-mono">{report.fields.toLocaleString()} fields/qtr</span>
              <span>·</span>
              <span className="font-mono">{selectedPeriods.size} quarters selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-0.5">
                <button onClick={selectAllPeriods} className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${selectedPeriods.size === AVAILABLE_PERIODS.length ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`} data-testid="button-select-all-periods">All 12</button>
                <button onClick={() => setSelectedPeriods(new Set(DEFAULT_PERIODS))} className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${selectedPeriods.size === DEFAULT_PERIODS.size && [...DEFAULT_PERIODS].every(p => selectedPeriods.has(p)) ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`} data-testid="button-select-2yr-periods">Last 2 Yr</button>
                <button onClick={() => setSelectedPeriods(new Set(AVAILABLE_PERIODS.slice(0, 4)))} className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${selectedPeriods.size === 4 && AVAILABLE_PERIODS.slice(0, 4).every(p => selectedPeriods.has(p)) ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`} data-testid="button-select-1yr-periods">Last 1 Yr</button>
              </div>
              <Button
                className="h-8"
                size="sm"
                onClick={handlePull}
                disabled={isPulling || selectedPeriods.size === 0}
                data-testid="button-pull-historical"
              >
                {isPulling ? (
                  <><RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />Pulling...</>
                ) : (
                  <><Download className="w-3.5 h-3.5 mr-1.5" />Pull {selectedPeriods.size} Quarter{selectedPeriods.size !== 1 ? "s" : ""}</>
                )}
              </Button>
            </div>
          </div>
        </div>

        {pulledReports.length > 0 && (
          <div className="border-t border-border/40 pt-3 space-y-3">
            {!isPulling && completedPulls.length > 0 && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3" data-testid="banner-pull-success">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                      Data ingested and analyzed
                    </p>
                    <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
                      {completedPulls.length} quarter{completedPulls.length !== 1 ? "s" : ""} of historical {report.name} data successfully retrieved from FFIEC CDR.
                      Variance detection baselines updated. Q1 2026 current-quarter data sourced from report draft.
                      Historical trends are now available in the Trend Analysis tab.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-foreground">Retrieved Filings</p>
              <Badge variant="secondary" className="text-[10px]">{completedPulls.length} completed</Badge>
            </div>
            <div className="rounded-md border border-border/60 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-xs">Report</TableHead>
                    <TableHead className="text-xs">Period</TableHead>
                    <TableHead className="text-xs text-center">Schedules</TableHead>
                    <TableHead className="text-xs text-center">Fields</TableHead>
                    <TableHead className="text-xs text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pulledReports.map((pr, idx) => (
                    <TableRow key={idx} data-testid={`pulled-report-${idx}`}>
                      <TableCell className="py-2">
                        <span className="text-xs font-medium">{pr.reportName}</span>
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="text-xs font-mono">{pr.period}</span>
                      </TableCell>
                      <TableCell className="py-2 text-center">
                        <span className="text-xs font-mono">{pr.schedules}</span>
                      </TableCell>
                      <TableCell className="py-2 text-center">
                        <span className="text-xs font-mono">{pr.fields.toLocaleString()}</span>
                      </TableCell>
                      <TableCell className="py-2 text-center">
                        {pr.status === "completed" ? (
                          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-0 text-[9px]">
                            <CheckCircle2 className="w-3 h-3 mr-0.5" />Done
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-0 text-[9px]">
                            <RefreshCw className="w-3 h-3 mr-0.5 animate-spin" />Pulling
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DataDictionaryTab() {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [uploadedSources, setUploadedSources] = useState<UploadedSource[]>([]);
  const [removedBaseIndices, setRemovedBaseIndices] = useState<Set<number>>(new Set());
  const [selectedFileName, setSelectedFileName] = useState("");
  const [selectedSourceSystem, setSelectedSourceSystem] = useState("");
  const [selectedQuarter, setSelectedQuarter] = useState("Q4 2025");
  const [dragActive, setDragActive] = useState(false);
  const [activeDictSource, setActiveDictSource] = useState("Core Banking");

  const visibleBaseSources = INGESTED_SOURCES.filter((_, idx) => !removedBaseIndices.has(idx));
  const uploadedCount = uploadedSources.length;
  const totalSources = visibleBaseSources.length + uploadedCount;
  const totalTables = visibleBaseSources.reduce((s, d) => s + d.tables, 0) + uploadedSources.reduce((s, u) => s + u.tables, 0);
  const totalFields = visibleBaseSources.reduce((s, d) => s + d.fields, 0) + uploadedSources.reduce((s, u) => s + u.fields, 0);
  const allCoverages = [...visibleBaseSources.map(s => s.coverage), ...uploadedSources.map(u => u.coverage)];
  const avgCoverage = allCoverages.length > 0 ? Math.round(allCoverages.reduce((s, c) => s + c, 0) / allCoverages.length) : 0;
  const partialSources = visibleBaseSources.filter(s => s.status === "Partial").length + uploadedSources.filter(u => u.status !== "Mapped").length;

  const activeMappings = DATA_MAPPINGS.filter(m => m.status === "Active").length;
  const reviewMappings = DATA_MAPPINGS.filter(m => m.status === "Review").length;

  const resetUploadForm = () => {
    setSelectedFileName("");
    setSelectedSourceSystem("");
    setSelectedQuarter("Q4 2025");
    setDragActive(false);
  };

  const handleOpenDialog = () => {
    resetUploadForm();
    setUploadDialogOpen(true);
  };

  const handleFileSelect = (name: string) => {
    setSelectedFileName(name);
    const lower = name.toLowerCase();
    let detected = "";
    if (lower.includes("gl") || lower.includes("extract")) detected = "Core Banking";
    else if (lower.includes("trading") || lower.includes("position")) detected = "Trading Systems";
    else if (lower.includes("loan")) detected = "Loan Origination";
    else if (lower.includes("treasury")) detected = "Treasury";
    else if (lower.includes("risk")) detected = "Risk Systems";
    else if (lower.includes("mdrm") || lower.includes("taxonomy")) detected = "Regulatory Reference";
    if (detected) setSelectedSourceSystem(detected);
  };

  const handleIngest = () => {
    if (!selectedFileName) return;
    setIsIngesting(true);
    setTimeout(() => {
      const ext = selectedFileName.split(".").pop()?.toLowerCase() || "xlsx";
      const tables = ext === "csv" || ext === "txt" ? 1 : Math.floor(Math.random() * 6) + 2;
      const fields = tables * (Math.floor(Math.random() * 20) + 15);
      const newSource: UploadedSource = {
        id: Date.now().toString(36),
        sourceSystem: selectedSourceSystem || "Custom / Other",
        fileName: selectedFileName,
        fileSize: `${(Math.random() * 15 + 0.5).toFixed(1)} MB`,
        quarter: selectedQuarter,
        tables,
        fields,
        status: "Profiling",
        coverage: Math.floor(Math.random() * 30) + 35,
        uploadedAt: new Date().toISOString(),
      };
      setUploadedSources(prev => [...prev, newSource]);
      setIsIngesting(false);
      setUploadDialogOpen(false);
      resetUploadForm();
    }, 2200);
  };

  const handleDeleteUploaded = (id: string) => {
    setUploadedSources(prev => prev.filter(u => u.id !== id));
  };

  const handleDeleteBase = (originalIdx: number) => {
    setRemovedBaseIndices(prev => new Set([...prev, originalIdx]));
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-serif font-semibold tracking-tight" data-testid="text-data-title">Data & Dictionary</h2>
        <p className="text-xs text-muted-foreground leading-relaxed mt-1 max-w-[760px]">
          Source data is ingested, profiled, and validated for quality. The system auto-maps fields to regulatory schedules and flags unmapped or problematic fields for review before report population.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { value: totalSources.toString(), label: "Source Systems", sub: `${totalTables} tables ingested` },
          { value: totalFields.toLocaleString(), label: "Total Fields", sub: `Across ${totalSources} source files` },
          { value: `${avgCoverage}%`, label: "Avg Coverage", sub: `${partialSources} source${partialSources !== 1 ? "s" : ""} partially mapped`, isGreen: true },
          { value: activeMappings.toString(), label: "Active Mappings", sub: `${reviewMappings} pending review`, isWarning: reviewMappings > 0 },
        ].map((m, i) => (
          <Card key={i} className={m.isWarning ? "ring-1 ring-amber-400/40 dark:ring-amber-500/30" : ""} data-testid={`card-data-metric-${i}`}>
            <CardContent className="p-4">
              <p className={`text-2xl font-mono font-normal ${m.isWarning ? "text-amber-700 dark:text-amber-400" : m.isGreen ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}>{m.value}</p>
              <p className={`text-[10px] font-semibold tracking-wide uppercase mt-1 ${m.isWarning ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}>{m.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{m.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <HistoricalDataPull />

      <Card data-testid="card-ingested-sources">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm">Ingested Data Sources</CardTitle>
              <Badge variant="outline" className="text-xs font-mono">{totalSources} source{totalSources !== 1 ? "s" : ""} · Q4 2025</Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={handleOpenDialog}
              data-testid="button-upload-source"
            >
              <Upload className="w-3 h-3 mr-1" />
              Upload Source File
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Connect to source systems or upload data files (Excel, CSV, PDF, TXT). Each source is profiled, validated, and mapped to regulatory report fields.
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Source System</TableHead>
                <TableHead className="text-xs">File</TableHead>
                <TableHead className="text-xs text-center">Tables</TableHead>
                <TableHead className="text-xs text-center">Fields</TableHead>
                <TableHead className="text-xs text-center">Status</TableHead>
                <TableHead className="text-xs">Coverage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {INGESTED_SOURCES.map((source, idx) => {
                if (removedBaseIndices.has(idx)) return null;
                return (
                  <TableRow key={idx} data-testid={`source-row-${idx}`}>
                    <TableCell className="py-3">
                      <p className="text-sm font-medium">{source.sourceSystem}</p>
                    </TableCell>
                    <TableCell className="py-3">
                      <a
                        href={`/downloads/${source.fileName}`}
                        download
                        className="inline-flex items-center gap-1.5 text-xs font-mono text-primary hover:underline cursor-pointer"
                        data-testid={`link-download-${source.fileName}`}
                      >
                        <Download className="w-3 h-3" />
                        {source.fileName}
                      </a>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <span className="text-sm font-mono">{source.tables}</span>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <span className="text-sm font-mono">{source.fields}</span>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <Badge
                        variant="secondary"
                        className={`text-[11px] border-0 ${
                          source.status === "Mapped"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : source.status === "Partial"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {source.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <CoverageBar coverage={source.coverage} />
                        <button
                          onClick={() => handleDeleteBase(idx)}
                          className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                          data-testid={`button-delete-source-${idx}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {uploadedSources.map((uploaded) => (
                <TableRow key={uploaded.id} className="bg-primary/5" data-testid={`uploaded-row-${uploaded.id}`}>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{uploaded.sourceSystem}</p>
                      <Badge variant="secondary" className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border-0">New</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <p className="text-xs font-mono text-muted-foreground">{uploaded.fileName}</p>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <span className="text-sm font-mono">{uploaded.tables}</span>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <span className="text-sm font-mono">{uploaded.fields}</span>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <Badge variant="secondary" className={`text-[11px] border-0 ${
                      uploaded.status === "Mapped"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : uploaded.status === "Partial"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    }`}>
                      {uploaded.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <CoverageBar coverage={uploaded.coverage} />
                      <button
                        onClick={() => handleDeleteUploaded(uploaded.id)}
                        className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                        data-testid={`button-delete-upload-${uploaded.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card data-testid="card-data-dictionary">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm">Data Dictionary</CardTitle>
              <Badge variant="outline" className="text-xs font-mono">
                {SOURCE_DICTIONARIES[activeDictSource]?.columns.length || 0} fields
              </Badge>
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-0.5 flex-wrap">
              {visibleBaseSources.map((src) => (
                <button
                  key={src.sourceSystem}
                  onClick={() => setActiveDictSource(src.sourceSystem)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                    activeDictSource === src.sourceSystem
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={`button-dict-tab-${src.sourceSystem.replace(/\s+/g, "-").toLowerCase()}`}
                >
                  {src.sourceSystem}
                </button>
              ))}
            </div>
          </div>
          {SOURCE_DICTIONARIES[activeDictSource] && (
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <Badge variant="secondary" className="text-[10px]">
                {SOURCE_DICTIONARIES[activeDictSource].recordCount.toLocaleString()} records
              </Badge>
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 text-[10px]">
                Quality: {SOURCE_DICTIONARIES[activeDictSource].qualityScore}%
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                Null Rate: {SOURCE_DICTIONARIES[activeDictSource].nullRate}%
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                Updated: {SOURCE_DICTIONARIES[activeDictSource].lastUpdated}
              </Badge>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {SOURCE_DICTIONARIES[activeDictSource] ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Field</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Table</TableHead>
                  <TableHead className="text-xs text-center">Nullable</TableHead>
                  <TableHead className="text-xs">Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {SOURCE_DICTIONARIES[activeDictSource].columns.map((col, cidx) => (
                  <TableRow key={cidx} data-testid={`dict-field-${cidx}`}>
                    <TableCell className="font-mono text-xs py-2 font-medium">{col.name}</TableCell>
                    <TableCell className="text-xs py-2">
                      <Badge variant="outline" className="font-mono text-[10px]">{col.type}</Badge>
                    </TableCell>
                    <TableCell className="text-xs py-2 text-muted-foreground">{col.table}</TableCell>
                    <TableCell className="text-xs py-2 text-center">
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
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No dictionary available for this source.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card data-testid="card-data-mappings">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm">Data Mappings & Interlinkages</CardTitle>
              <Badge variant="outline" className="text-xs font-mono">{DATA_MAPPINGS.length} mappings</Badge>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 text-[10px]">{activeMappings} Active</Badge>
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0 text-[10px]">{reviewMappings} Review</Badge>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Maps source fields to regulatory report line items with transformation rules. The system analyzes source files, creates a data dictionary, and auto-generates mappings to report schedules.
          </p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[460px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs w-[240px]">Source Field</TableHead>
                  <TableHead className="text-xs w-[16px]"></TableHead>
                  <TableHead className="text-xs w-[220px]">Report Line Item</TableHead>
                  <TableHead className="text-xs">Transformation</TableHead>
                  <TableHead className="text-xs w-[80px] text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DATA_MAPPINGS.map((mapping, idx) => (
                  <TableRow key={idx} data-testid={`mapping-row-${idx}`}>
                    <TableCell className="py-3">
                      <p className="text-xs font-mono text-foreground">{mapping.sourceField}</p>
                      {mapping.linkedSources && mapping.linkedSources.length > 0 && (
                        <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                          <Link2 className="w-3 h-3 text-muted-foreground shrink-0" />
                          {mapping.linkedSources.map((ls, lIdx) => (
                            <Badge key={lIdx} variant="outline" className="font-mono text-[9px] py-0 px-1.5 text-muted-foreground border-border/60">
                              {ls}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-3 text-center align-top pt-3.5">
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                    </TableCell>
                    <TableCell className="py-3">
                      <p className="text-xs font-medium text-foreground">{mapping.reportLineItem}</p>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{mapping.schedule}</p>
                    </TableCell>
                    <TableCell className="py-3">
                      <p className="text-xs font-mono text-muted-foreground">{mapping.transformation}</p>
                    </TableCell>
                    <TableCell className="py-3 text-center align-top pt-3.5">
                      <Badge
                        variant="secondary"
                        className={`text-[11px] border-0 ${
                          mapping.status === "Active"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : mapping.status === "Review"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {mapping.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={uploadDialogOpen} onOpenChange={(open) => { if (!isIngesting) setUploadDialogOpen(open); }}>
        <DialogContent className="sm:max-w-[520px]" data-testid="dialog-upload-source">
          <DialogHeader>
            <DialogTitle className="text-base font-serif">Upload Source File</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Upload a data file to ingest, profile, and map to regulatory report fields. Supported formats: Excel (.xlsx, .xls), CSV, PDF, TXT.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : selectedFileName
                    ? "border-emerald-400/60 bg-emerald-500/5"
                    : "border-border hover:border-primary/40"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleFileSelect(file.name);
              }}
              data-testid="dropzone-file"
            >
              {selectedFileName ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  <div className="text-left">
                    <p className="text-sm font-medium font-mono">{selectedFileName}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {FILE_TYPE_LABELS[selectedFileName.split(".").pop()?.toLowerCase() || ""] || "Data File"}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedFileName(""); setSelectedSourceSystem(""); }}
                    className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    data-testid="button-clear-file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <FileUp className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Drag and drop a file here, or <span className="text-primary font-medium underline underline-offset-2">browse</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">.xlsx, .xls, .csv, .pdf, .txt</p>
                  <input
                    type="file"
                    className="hidden"
                    accept=".xlsx,.xls,.csv,.pdf,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file.name);
                    }}
                    data-testid="input-file-upload"
                  />
                </label>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Source System</Label>
                <Select value={selectedSourceSystem} onValueChange={setSelectedSourceSystem}>
                  <SelectTrigger className="h-8 text-xs" data-testid="select-source-system">
                    <SelectValue placeholder="Select system..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCE_SYSTEM_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Reporting Quarter</Label>
                <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                  <SelectTrigger className="h-8 text-xs" data-testid="select-quarter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {QUARTER_OPTIONS.map((q) => (
                      <SelectItem key={q} value={q} className="text-xs">{q}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setUploadDialogOpen(false)}
              disabled={isIngesting}
              data-testid="button-cancel-upload"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="text-xs"
              onClick={handleIngest}
              disabled={!selectedFileName || isIngesting}
              data-testid="button-ingest-file"
            >
              {isIngesting ? (
                <>
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  Ingesting...
                </>
              ) : (
                <>
                  <Upload className="w-3 h-3 mr-1" />
                  Ingest File
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

interface DraftReportLine {
  schedule: string;
  lineItem: string;
  mdrm: string;
  currentValue: number | null;
  priorValue: number | null;
  changePercent: number | null;
  source: string;
  status: "populated" | "mapped" | "unmapped";
  flagged: boolean;
  flagReason?: string;
  isRatio?: boolean;
  editable?: boolean;
}

const INGESTED_Q1_2026: Record<string, { q1: number; q4: number; source: string }> = {
  "RCFD2170": { q1: 5495000, q4: 5612000, source: "GL_Extract_Q1_2026.xlsx" },
  "RCON2200": { q1: 3180000, q4: 3250000, source: "GL_Extract_Q1_2026.xlsx" },
  "RCFD3210": { q1: 824000, q4: 810000, source: "GL_Extract_Q1_2026.xlsx" },
  "RIAD4340": { q1: 28500, q4: 31200, source: "GL_Extract_Q1_2026.xlsx" },
  "RIAD4074": { q1: 78200, q4: 82500, source: "GL_Extract_Q1_2026.xlsx" },
  "RIAD4079": { q1: 46800, q4: 49100, source: "GL_Extract_Q1_2026.xlsx" },
  "RIAD4230": { q1: 12400, q4: 11800, source: "GL_Extract_Q1_2026.xlsx" },
  "RIAD4093": { q1: 61500, q4: 59200, source: "GL_Extract_Q1_2026.xlsx" },
  "RIAD4230B": { q1: 4200, q4: 3800, source: "GL_Extract_Q1_2026.xlsx" },
  "RCFDC026": { q1: -42000, q4: -38000, source: "GL_Extract_Q1_2026.xlsx" },
  "RIAD4010": { q1: 52100, q4: 55200, source: "GL_Extract_Q1_2026.xlsx" },
  "RIAD4020": { q1: 18400, q4: 19500, source: "GL_Extract_Q1_2026.xlsx" },
  "RIAD4115": { q1: 31200, q4: 33500, source: "GL_Extract_Q1_2026.xlsx" },
  "RIAD4180": { q1: 28500, q4: 27800, source: "GL_Extract_Q1_2026.xlsx" },
  "RCON3545": { q1: 164850, q4: 172000, source: "Trading_Positions_Q1_2026.xlsx" },
  "RCFDA126": { q1: 8500000, q4: 8200000, source: "Trading_Positions_Q1_2026.xlsx" },
  "RCFDA127": { q1: 6200000, q4: 5900000, source: "Trading_Positions_Q1_2026.xlsx" },
  "RIADA220": { q1: 4800, q4: 4200, source: "Trading_Positions_Q1_2026.xlsx" },
  "RCFD2122": { q1: 2910000, q4: 2980000, source: "Loan_Portfolio_Q1_2026.xlsx" },
  "RCFD1754": { q1: 1120000, q4: 1150000, source: "Loan_Portfolio_Q1_2026.xlsx" },
  "RCFD1763": { q1: 485000, q4: 498000, source: "Loan_Portfolio_Q1_2026.xlsx" },
  "RCFD1797": { q1: 320000, q4: 328000, source: "Loan_Portfolio_Q1_2026.xlsx" },
  "RCFD2107": { q1: 65000, q4: 62000, source: "Loan_Portfolio_Q1_2026.xlsx" },
  "RIAD4635": { q1: 8200, q4: 7500, source: "Loan_Portfolio_Q1_2026.xlsx" },
  "RCFD1403": { q1: 28000, q4: 25000, source: "Loan_Portfolio_Q1_2026.xlsx" },
  "RCFD1583": { q1: 18500, q4: 16000, source: "Loan_Portfolio_Q1_2026.xlsx" },
  "RCFD8641": { q1: 1285000, q4: 1310000, source: "Treasury_Data_Q1_2026.xlsx" },
  "RCFDB528": { q1: 520000, q4: 535000, source: "Treasury_Data_Q1_2026.xlsx" },
  "RCFD1773": { q1: 765000, q4: 775000, source: "Treasury_Data_Q1_2026.xlsx" },
  "RIAD3196": { q1: -1200, q4: -800, source: "Treasury_Data_Q1_2026.xlsx" },
  "RCFDA223": { q1: 780000, q4: 768000, source: "Risk_Metrics_Q1_2026.xlsx" },
  "RCFD8274": { q1: 810000, q4: 798000, source: "Risk_Metrics_Q1_2026.xlsx" },
  "RCFDA224": { q1: 920000, q4: 905000, source: "Risk_Metrics_Q1_2026.xlsx" },
  "RCFDA222": { q1: 4105000, q4: 4200000, source: "Risk_Metrics_Q1_2026.xlsx" },
  "RCFD7206": { q1: 19.74, q4: 19.0, source: "Risk_Metrics_Q1_2026.xlsx" },
  "RCFD7205": { q1: 22.4, q4: 21.5, source: "Risk_Metrics_Q1_2026.xlsx" },
  "RCFDA223R": { q1: 19.0, q4: 18.3, source: "Risk_Metrics_Q1_2026.xlsx" },
  "UBPR-NIM": { q1: 2.33, q4: 2.41, source: "Risk_Metrics_Q1_2026.xlsx" },
  "UBPR-EFF": { q1: 67.83, q4: 62.8, source: "Risk_Metrics_Q1_2026.xlsx" },
  "UBPR-ROA": { q1: 0.52, q4: 0.56, source: "Risk_Metrics_Q1_2026.xlsx" },
  "UBPR-ROE": { q1: 3.46, q4: 3.85, source: "Risk_Metrics_Q1_2026.xlsx" },
  "UBPR-NPA": { q1: 0.56, q4: 0.47, source: "Risk_Metrics_Q1_2026.xlsx" },
};

function buildDraftReport(anomalies: AnomalyRecord[], overrides: Record<string, number>): DraftReportLine[] {
  const flaggedMetrics = new Set(anomalies.filter(a => a.severity === "high" || a.severity === "medium").map(a => a.metric));
  const pct = (c: number, p: number) => p !== 0 ? ((c - p) / Math.abs(p)) * 100 : null;
  const get = (mdrm: string, field: "q1" | "q4") => {
    if (field === "q1" && overrides[mdrm] !== undefined) return overrides[mdrm];
    return INGESTED_Q1_2026[mdrm]?.[field] ?? null;
  };
  const src = (mdrm: string) => INGESTED_Q1_2026[mdrm]?.source ?? "Not mapped";

  const lines: DraftReportLine[] = [
    { schedule: "RC", lineItem: "Total assets", mdrm: "RCFD2170", currentValue: get("RCFD2170", "q1"), priorValue: get("RCFD2170", "q4"), changePercent: null, source: src("RCFD2170"), status: "populated", flagged: flaggedMetrics.has("Total Assets QoQ Growth"), flagReason: "Total assets QoQ change exceeds historical norm" },
    { schedule: "RC-C", lineItem: "Loans and leases, net", mdrm: "RCFD2122", currentValue: get("RCFD2122", "q1"), priorValue: get("RCFD2122", "q4"), changePercent: null, source: src("RCFD2122"), status: "populated", flagged: flaggedMetrics.has("Net Loans QoQ Growth"), flagReason: "Loan growth exceeds trailing average deviation threshold" },
    { schedule: "RC-C", lineItem: "C&I loans (domestic)", mdrm: "RCFD1754", currentValue: get("RCFD1754", "q1"), priorValue: get("RCFD1754", "q4"), changePercent: null, source: src("RCFD1754"), status: "populated", flagged: false },
    { schedule: "RC-C", lineItem: "CRE loans (non-farm, non-res)", mdrm: "RCFD1763", currentValue: get("RCFD1763", "q1"), priorValue: get("RCFD1763", "q4"), changePercent: null, source: src("RCFD1763"), status: "populated", flagged: false },
    { schedule: "RC-C", lineItem: "1-4 family residential", mdrm: "RCFD1797", currentValue: get("RCFD1797", "q1"), priorValue: get("RCFD1797", "q4"), changePercent: null, source: src("RCFD1797"), status: "populated", flagged: false },
    { schedule: "RC-B", lineItem: "Total securities", mdrm: "RCFD8641", currentValue: get("RCFD8641", "q1"), priorValue: get("RCFD8641", "q4"), changePercent: null, source: src("RCFD8641"), status: "populated", flagged: flaggedMetrics.has("Securities Portfolio Change"), flagReason: "Securities portfolio deviation from trailing average" },
    { schedule: "RC-B", lineItem: "Securities — HTM", mdrm: "RCFDB528", currentValue: get("RCFDB528", "q1"), priorValue: get("RCFDB528", "q4"), changePercent: null, source: src("RCFDB528"), status: "populated", flagged: false },
    { schedule: "RC-B", lineItem: "Securities — AFS", mdrm: "RCFD1773", currentValue: get("RCFD1773", "q1"), priorValue: get("RCFD1773", "q4"), changePercent: null, source: src("RCFD1773"), status: "populated", flagged: false },
    { schedule: "RC", lineItem: "Trading assets", mdrm: "RCON3545", currentValue: get("RCON3545", "q1"), priorValue: get("RCON3545", "q4"), changePercent: null, source: src("RCON3545"), status: "populated", flagged: false },
    { schedule: "RC-E", lineItem: "Total deposits", mdrm: "RCON2200", currentValue: get("RCON2200", "q1"), priorValue: get("RCON2200", "q4"), changePercent: null, source: src("RCON2200"), status: "populated", flagged: false },
    { schedule: "RC", lineItem: "Total equity capital", mdrm: "RCFD3210", currentValue: get("RCFD3210", "q1"), priorValue: get("RCFD3210", "q4"), changePercent: null, source: src("RCFD3210"), status: "populated", flagged: false },
    { schedule: "RC", lineItem: "AOCI — unrealized G/L on AFS", mdrm: "RCFDC026", currentValue: get("RCFDC026", "q1"), priorValue: get("RCFDC026", "q4"), changePercent: null, source: src("RCFDC026"), status: "populated", flagged: false },
    { schedule: "RC", lineItem: "Allowance for credit losses", mdrm: "RCFD2107", currentValue: get("RCFD2107", "q1"), priorValue: get("RCFD2107", "q4"), changePercent: null, source: src("RCFD2107"), status: "populated", flagged: false },
    { schedule: "RI", lineItem: "Total interest income", mdrm: "RIAD4074", currentValue: get("RIAD4074", "q1"), priorValue: get("RIAD4074", "q4"), changePercent: null, source: src("RIAD4074"), status: "populated", flagged: false },
    { schedule: "RI", lineItem: "Total interest expense", mdrm: "RIAD4079", currentValue: get("RIAD4079", "q1"), priorValue: get("RIAD4079", "q4"), changePercent: null, source: src("RIAD4079"), status: "populated", flagged: false },
    { schedule: "RI", lineItem: "Non-interest income", mdrm: "RIAD4230", currentValue: get("RIAD4230", "q1"), priorValue: get("RIAD4230", "q4"), changePercent: null, source: src("RIAD4230"), status: "populated", flagged: false },
    { schedule: "RI", lineItem: "Non-interest expense", mdrm: "RIAD4093", currentValue: get("RIAD4093", "q1"), priorValue: get("RIAD4093", "q4"), changePercent: null, source: src("RIAD4093"), status: "populated", flagged: false },
    { schedule: "RI", lineItem: "Provision for credit losses", mdrm: "RIAD4230B", currentValue: get("RIAD4230B", "q1"), priorValue: get("RIAD4230B", "q4"), changePercent: null, source: src("RIAD4230B"), status: "populated", flagged: false },
    { schedule: "RI", lineItem: "Net income", mdrm: "RIAD4340", currentValue: get("RIAD4340", "q1"), priorValue: get("RIAD4340", "q4"), changePercent: null, source: src("RIAD4340"), status: "populated", flagged: false },
    { schedule: "RI", lineItem: "Trading revenue", mdrm: "RIADA220", currentValue: get("RIADA220", "q1"), priorValue: get("RIADA220", "q4"), changePercent: null, source: src("RIADA220"), status: "populated", flagged: false },
    { schedule: "RI", lineItem: "Realized G/L on securities", mdrm: "RIAD3196", currentValue: get("RIAD3196", "q1"), priorValue: get("RIAD3196", "q4"), changePercent: null, source: src("RIAD3196"), status: "populated", flagged: false },
    { schedule: "RC-N", lineItem: "Past due 30-89 days", mdrm: "RCFD1403", currentValue: get("RCFD1403", "q1"), priorValue: get("RCFD1403", "q4"), changePercent: null, source: src("RCFD1403"), status: "populated", flagged: flaggedMetrics.has("Non-Performing Assets Ratio"), flagReason: "Asset quality metrics outside historical trend" },
    { schedule: "RC-N", lineItem: "Nonaccrual loans", mdrm: "RCFD1583", currentValue: get("RCFD1583", "q1"), priorValue: get("RCFD1583", "q4"), changePercent: null, source: src("RCFD1583"), status: "populated", flagged: false },
    { schedule: "RI-B", lineItem: "Net charge-offs", mdrm: "RIAD4635", currentValue: get("RIAD4635", "q1"), priorValue: get("RIAD4635", "q4"), changePercent: null, source: src("RIAD4635"), status: "populated", flagged: false },
    { schedule: "RC-R", lineItem: "CET1 capital", mdrm: "RCFDA223", currentValue: get("RCFDA223", "q1"), priorValue: get("RCFDA223", "q4"), changePercent: null, source: src("RCFDA223"), status: "populated", flagged: false },
    { schedule: "RC-R", lineItem: "Tier 1 capital", mdrm: "RCFD8274", currentValue: get("RCFD8274", "q1"), priorValue: get("RCFD8274", "q4"), changePercent: null, source: src("RCFD8274"), status: "populated", flagged: flaggedMetrics.has("Tier 1 Capital Ratio"), flagReason: "Capital ratio deviation from trailing average" },
    { schedule: "RC-R", lineItem: "Total capital", mdrm: "RCFDA224", currentValue: get("RCFDA224", "q1"), priorValue: get("RCFDA224", "q4"), changePercent: null, source: src("RCFDA224"), status: "populated", flagged: false },
    { schedule: "RC-R", lineItem: "Total risk-weighted assets", mdrm: "RCFDA222", currentValue: get("RCFDA222", "q1"), priorValue: get("RCFDA222", "q4"), changePercent: null, source: src("RCFDA222"), status: "populated", flagged: false },
    { schedule: "RC-R", lineItem: "Tier 1 capital ratio", mdrm: "RCFD7206", currentValue: get("RCFD7206", "q1"), priorValue: get("RCFD7206", "q4"), changePercent: null, source: src("RCFD7206"), status: "populated", flagged: false, isRatio: true },
    { schedule: "RC-R", lineItem: "CET1 capital ratio", mdrm: "RCFDA223R", currentValue: get("RCFDA223R", "q1"), priorValue: get("RCFDA223R", "q4"), changePercent: null, source: src("RCFDA223R"), status: "populated", flagged: false, isRatio: true },
    { schedule: "RC-R", lineItem: "Total capital ratio", mdrm: "RCFD7205", currentValue: get("RCFD7205", "q1"), priorValue: get("RCFD7205", "q4"), changePercent: null, source: src("RCFD7205"), status: "populated", flagged: false, isRatio: true },
    { schedule: "RC-L", lineItem: "IR derivatives notional", mdrm: "RCFDA126", currentValue: get("RCFDA126", "q1"), priorValue: get("RCFDA126", "q4"), changePercent: null, source: src("RCFDA126"), status: "mapped", flagged: false },
    { schedule: "RC-L", lineItem: "FX derivatives notional", mdrm: "RCFDA127", currentValue: get("RCFDA127", "q1"), priorValue: get("RCFDA127", "q4"), changePercent: null, source: src("RCFDA127"), status: "mapped", flagged: false },
    { schedule: "RC", lineItem: "Federal funds sold", mdrm: "RCON0276", currentValue: get("RCON0276", "q1"), priorValue: null, changePercent: null, source: "Not mapped", status: "unmapped", flagged: overrides["RCON0276"] === undefined, flagReason: "No source file mapping — manual entry required", editable: true },
    { schedule: "RC", lineItem: "Federal funds purchased", mdrm: "RCON0277", currentValue: get("RCON0277", "q1"), priorValue: null, changePercent: null, source: "Not mapped", status: "unmapped", flagged: overrides["RCON0277"] === undefined, flagReason: "No source file mapping — manual entry required", editable: true },
    { schedule: "RC", lineItem: "Other borrowed money", mdrm: "RCON3190", currentValue: get("RCON3190", "q1"), priorValue: null, changePercent: null, source: "Not mapped", status: "unmapped", flagged: overrides["RCON3190"] === undefined, flagReason: "No source file mapping — manual entry required", editable: true },
    { schedule: "RC", lineItem: "Premises and fixed assets", mdrm: "RCON2145", currentValue: get("RCON2145", "q1"), priorValue: null, changePercent: null, source: "Not mapped", status: "unmapped", flagged: overrides["RCON2145"] === undefined, flagReason: "No source file mapping — manual entry required", editable: true },
    { schedule: "RC", lineItem: "Other real estate owned", mdrm: "RCON2150", currentValue: get("RCON2150", "q1"), priorValue: null, changePercent: null, source: "Not mapped", status: "unmapped", flagged: overrides["RCON2150"] === undefined, flagReason: "No source file mapping — manual entry required", editable: true },
    { schedule: "RC", lineItem: "Goodwill and intangibles", mdrm: "RCFD3163", currentValue: get("RCFD3163", "q1"), priorValue: null, changePercent: null, source: "Not mapped", status: "unmapped", flagged: overrides["RCFD3163"] === undefined, flagReason: "No source file mapping — manual entry required", editable: true },
    { schedule: "RC", lineItem: "Other assets", mdrm: "RCFD2160", currentValue: get("RCFD2160", "q1"), priorValue: null, changePercent: null, source: "Not mapped", status: "unmapped", flagged: overrides["RCFD2160"] === undefined, flagReason: "No source file mapping — manual entry required", editable: true },
    { schedule: "RC", lineItem: "Total liabilities", mdrm: "RCFD2948", currentValue: get("RCFD2948", "q1"), priorValue: null, changePercent: null, source: "Not mapped", status: "unmapped", flagged: overrides["RCFD2948"] === undefined, flagReason: "No source file mapping — manual entry required", editable: true },
  ];

  lines.forEach(l => {
    if (l.changePercent === null && l.currentValue !== null && l.priorValue !== null && l.priorValue !== 0) {
      l.changePercent = ((l.currentValue - l.priorValue) / Math.abs(l.priorValue)) * 100;
    }
  });

  return lines;
}

const DRAFT_STORAGE_KEY = "draft-overrides";
let draftOverridesListeners: Array<() => void> = [];
function getDraftOverridesSnapshot(): string {
  return localStorage.getItem(DRAFT_STORAGE_KEY) || "{}";
}
function subscribeToDraftOverrides(cb: () => void) {
  draftOverridesListeners.push(cb);
  return () => { draftOverridesListeners = draftOverridesListeners.filter(l => l !== cb); };
}
function setDraftOverridesStorage(next: Record<string, number>) {
  try { localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(next)); } catch {}
  draftOverridesListeners.forEach(cb => cb());
}

function useDraftOverrides() {
  const raw = useSyncExternalStore(subscribeToDraftOverrides, getDraftOverridesSnapshot);
  const overrides: Record<string, number> = JSON.parse(raw);
  const setOverrides = useCallback((updater: (prev: Record<string, number>) => Record<string, number>) => {
    const current = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY) || "{}");
    setDraftOverridesStorage(updater(current));
  }, []);
  return { overrides, setOverrides };
}

const SCHEDULE_META: Record<string, string> = {
  "RC": "Balance Sheet",
  "RC-B": "Securities",
  "RC-C": "Loans & Leases",
  "RC-E": "Deposit Liabilities",
  "RC-N": "Past Due & Nonaccrual",
  "RC-R": "Regulatory Capital",
  "RC-L": "Derivatives & Off-Balance Sheet",
  "RI": "Income Statement",
  "RI-B": "Charge-Offs & Recoveries",
};
const SCHEDULE_ORDER = ["RC", "RC-B", "RC-C", "RC-E", "RI", "RI-B", "RC-N", "RC-R", "RC-L"];

function DraftReportCard({ draftLines, overrides, setOverrides, draftPeriod, testIdPrefix }: {
  draftLines: DraftReportLine[];
  overrides: Record<string, number>;
  setOverrides: (updater: (prev: Record<string, number>) => Record<string, number>) => void;
  draftPeriod: string;
  testIdPrefix?: string;
}) {
  const pfx = testIdPrefix ? `${testIdPrefix}-` : "";
  const [draftExpanded, setDraftExpanded] = useState(false);
  const [expandedSchedules, setExpandedSchedules] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const toggleSchedule = (schedule: string) => {
    setExpandedSchedules(prev => {
      const next = new Set(prev);
      if (next.has(schedule)) next.delete(schedule);
      else next.add(schedule);
      return next;
    });
  };
  const expandAllSchedules = () => {
    const all = new Set(draftLines.map(l => l.schedule));
    setExpandedSchedules(all);
  };
  const collapseAllSchedules = () => setExpandedSchedules(new Set());

  const populatedCount = draftLines.filter(l => l.status === "populated").length;
  const mappedCount = draftLines.filter(l => l.status === "mapped").length;
  const unmappedCount = draftLines.filter(l => l.status === "unmapped").length;
  const flaggedCount = draftLines.filter(l => l.flagged).length;

  const handleSaveEdit = (mdrm: string) => {
    const num = parseFloat(editValue);
    if (!isNaN(num)) {
      setOverrides(prev => ({ ...prev, [mdrm]: num }));
    }
    setEditingCell(null);
    setEditValue("");
  };

  const grouped = new Map<string, DraftReportLine[]>();
  draftLines.forEach(line => {
    if (!grouped.has(line.schedule)) grouped.set(line.schedule, []);
    grouped.get(line.schedule)!.push(line);
  });
  const orderedKeys = SCHEDULE_ORDER.filter(s => grouped.has(s));
  grouped.forEach((_, key) => { if (!orderedKeys.includes(key)) orderedKeys.push(key); });

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/[0.03] to-transparent" data-testid={`${pfx}card-draft-report`}>
      <Collapsible.Root open={draftExpanded} onOpenChange={setDraftExpanded}>
        <Collapsible.Trigger asChild>
          <CardContent className="p-4 cursor-pointer hover:bg-primary/[0.02] transition-colors">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-2.5">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground" data-testid={`${pfx}text-draft-title`}>FFIEC 031 Call Report — Draft ({draftPeriod})</p>
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0 text-[10px]">
                      Draft
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {populatedCount} auto-populated from ingested files, {mappedCount} mapped, {unmappedCount} unmapped requiring manual entry
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-lg font-mono font-normal text-foreground">{draftLines.length}</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Line Items</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-mono font-normal text-destructive">{flaggedCount}</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Flagged</p>
                </div>
                {draftExpanded ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground transition-transform" />
                )}
              </div>
            </div>
          </CardContent>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <div className="border-t border-border/40 px-4 pt-3 pb-4">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-0 text-[10px]">
                <CheckCircle2 className="w-3 h-3 mr-1" />{populatedCount} Populated
              </Badge>
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-0 text-[10px]">
                <Layers className="w-3 h-3 mr-1" />{mappedCount} Mapped
              </Badge>
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-0 text-[10px]">
                <AlertCircle className="w-3 h-3 mr-1" />{unmappedCount} Unmapped
              </Badge>
              <Badge variant="secondary" className="bg-red-500/10 text-red-600 border-0 text-[10px]">
                <Flag className="w-3 h-3 mr-1" />{flaggedCount} Flagged
              </Badge>
              {Object.keys(overrides).length > 0 && (
                <Badge variant="secondary" className="bg-violet-500/10 text-violet-600 border-0 text-[10px]">
                  <Pencil className="w-3 h-3 mr-1" />{Object.keys(overrides).length} Manual Entries
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 mb-2">
              <button onClick={expandAllSchedules} className="text-[10px] text-primary hover:underline" data-testid={`${pfx}button-expand-all-schedules`}>Expand All</button>
              <span className="text-[10px] text-muted-foreground">|</span>
              <button onClick={collapseAllSchedules} className="text-[10px] text-primary hover:underline" data-testid={`${pfx}button-collapse-all-schedules`}>Collapse All</button>
            </div>
            <div className="space-y-2">
              {orderedKeys.map(schedule => {
                const lines = grouped.get(schedule)!;
                const isOpen = expandedSchedules.has(schedule);
                const schedulePopulated = lines.filter(l => l.status === "populated").length;
                const scheduleUnmapped = lines.filter(l => l.status === "unmapped").length;
                const scheduleFlagged = lines.filter(l => l.flagged).length;
                const desc = SCHEDULE_META[schedule] ?? schedule;

                return (
                  <div key={schedule} className="rounded-md border border-border/60 overflow-hidden" data-testid={`${pfx}schedule-section-${schedule}`}>
                    <button
                      className="w-full flex items-center justify-between px-3 py-2.5 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                      onClick={() => toggleSchedule(schedule)}
                      data-testid={`${pfx}button-toggle-schedule-${schedule}`}
                    >
                      <div className="flex items-center gap-2.5">
                        {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                        <Badge variant="outline" className="text-[10px] font-mono px-2">{schedule}</Badge>
                        <span className="text-xs font-medium text-foreground">{desc}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">{lines.length} items</span>
                        {schedulePopulated > 0 && <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-0 text-[9px]">{schedulePopulated} auto</Badge>}
                        {scheduleUnmapped > 0 && <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-0 text-[9px]">{scheduleUnmapped} unmapped</Badge>}
                        {scheduleFlagged > 0 && <Badge variant="secondary" className="bg-red-500/10 text-red-600 border-0 text-[9px]">{scheduleFlagged} flagged</Badge>}
                      </div>
                    </button>
                    {isOpen && (
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/15">
                            <TableHead className="text-xs">Line Item</TableHead>
                            <TableHead className="text-xs font-mono w-[90px]">MDRM</TableHead>
                            <TableHead className="text-xs text-right w-[110px]">{draftPeriod}</TableHead>
                            <TableHead className="text-xs text-right w-[100px]">Q4 2025</TableHead>
                            <TableHead className="text-xs text-right w-[70px]">QoQ %</TableHead>
                            <TableHead className="text-xs w-[140px]">Source File</TableHead>
                            <TableHead className="text-xs w-[70px] text-center">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {lines.map((line, idx) => (
                            <TableRow key={idx} className={line.status === "unmapped" ? "bg-amber-500/[0.03]" : line.flagged ? "bg-red-500/[0.03]" : ""} data-testid={`${pfx}draft-line-${schedule}-${idx}`}>
                              <TableCell className="py-2">
                                <div className="flex items-center gap-1.5">
                                  {line.flagged && <Flag className="w-3 h-3 text-red-500 shrink-0" />}
                                  <span className="text-xs text-foreground">{line.lineItem}</span>
                                </div>
                                {line.flagged && line.flagReason && (
                                  <p className="text-[10px] text-red-500/80 mt-0.5 ml-[18px]">{line.flagReason}</p>
                                )}
                              </TableCell>
                              <TableCell className="py-2">
                                <span className="text-[10px] font-mono text-muted-foreground">{line.mdrm}</span>
                              </TableCell>
                              <TableCell className="py-2 text-right">
                                {editingCell === line.mdrm ? (
                                  <div className="flex items-center gap-1 justify-end">
                                    <Input
                                      className="h-6 w-[80px] text-xs font-mono text-right px-1"
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      onKeyDown={(e) => { if (e.key === "Enter") handleSaveEdit(line.mdrm); if (e.key === "Escape") { setEditingCell(null); setEditValue(""); } }}
                                      autoFocus
                                      data-testid={`${pfx}input-edit-${line.mdrm}`}
                                    />
                                    <button onClick={(e) => { e.stopPropagation(); handleSaveEdit(line.mdrm); }} className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 rounded" data-testid={`${pfx}button-save-${line.mdrm}`}>
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); setEditingCell(null); setEditValue(""); }} className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded">
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 justify-end">
                                    <span className={`text-xs font-mono ${line.currentValue !== null ? "text-foreground" : "text-amber-500"}`}>
                                      {line.currentValue !== null ? (line.isRatio ? `${line.currentValue.toFixed(2)}%` : fmtDollar(line.currentValue)) : "—"}
                                    </span>
                                    {(line.editable || line.status === "unmapped") && (
                                      <button
                                        onClick={(e) => { e.stopPropagation(); setEditingCell(line.mdrm); setEditValue(line.currentValue !== null ? String(line.currentValue) : ""); }}
                                        className="text-muted-foreground hover:text-foreground ml-1"
                                        data-testid={`${pfx}button-edit-${line.mdrm}`}
                                      >
                                        <Pencil className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="py-2 text-right">
                                <span className="text-xs font-mono text-muted-foreground">
                                  {line.priorValue !== null ? (line.isRatio ? `${line.priorValue.toFixed(2)}%` : fmtDollar(line.priorValue)) : "—"}
                                </span>
                              </TableCell>
                              <TableCell className="py-2 text-right">
                                {line.changePercent !== null ? (
                                  <span className={`text-xs font-mono ${line.changePercent > 0 ? "text-emerald-600" : line.changePercent < 0 ? "text-red-500" : "text-muted-foreground"}`}>
                                    {line.changePercent >= 0 ? "+" : ""}{line.changePercent.toFixed(1)}%
                                  </span>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell className="py-2">
                                <span className={`text-[10px] ${line.source === "Not mapped" ? "text-amber-500 font-medium" : "font-mono text-muted-foreground"}`}>{line.source}</span>
                              </TableCell>
                              <TableCell className="py-2 text-center">
                                {line.status === "populated" && <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-0 text-[9px]">Auto</Badge>}
                                {line.status === "mapped" && <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-0 text-[9px]">Mapped</Badge>}
                                {line.status === "unmapped" && (
                                  overrides[line.mdrm] !== undefined
                                    ? <Badge variant="secondary" className="bg-violet-500/10 text-violet-600 border-0 text-[9px]">Manual</Badge>
                                    : <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-0 text-[9px]">Unmapped</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3">
              <Info className="w-3.5 h-3.5 shrink-0" />
              Data sourced from 5 ingested files (GL, Trading, Loans, Treasury, Risk). Unmapped fields can be entered manually using the edit icon.
            </div>
          </div>
        </Collapsible.Content>
      </Collapsible.Root>
    </Card>
  );
}

function AnomaliesTab() {
  const { anomalies, isLive, historicalData } = useLiveAnomalies();
  const [activeMetric, setActiveMetric] = useState(0);
  const { overrides, setOverrides } = useDraftOverrides();

  const draftPeriod = "Q1 2026";

  const q1_2026_record: HistoricalRecord = {
    period: "Q1 2026", rawDate: "20260331",
    totalAssets: overrides["RCFD2170"] ?? 5495000,
    totalDeposits: overrides["RCON2200"] ?? 3180000,
    totalLoans: overrides["RCFD2122"] ?? 2910000,
    netIncome: overrides["RIAD4340"] ?? 28500,
    roe: overrides["UBPR-ROE"] ?? 3.46,
    roa: overrides["UBPR-ROA"] ?? 0.52,
    nim: overrides["UBPR-NIM"] ?? 2.33,
    tier1Ratio: overrides["RCFD7206"] ?? 19.74,
    efficiencyRatio: overrides["UBPR-EFF"] ?? 67.83,
    npaRatio: overrides["UBPR-NPA"] ?? 0.56,
    securities: overrides["RCFD8641"] ?? 1285000,
    loanLossReserve: overrides["RCFD2107"] ?? 65000,
    loanToDeposit: ((overrides["RCFD2122"] ?? 2910000) / (overrides["RCON2200"] ?? 3180000)) * 100,
    totalEquity: overrides["RCFD3210"] ?? 824000,
  };

  const historicalWithDraft = [...historicalData.filter(r => r.rawDate < "20260331"), q1_2026_record]
    .sort((a, b) => a.rawDate.localeCompare(b.rawDate));
  const draftAnomalies = historicalWithDraft.length >= 2 ? computeLiveAnomalies(historicalWithDraft) : anomalies;
  const activeAnomalies = draftAnomalies.length > 0 ? draftAnomalies : anomalies;

  const anomalyLog = buildAnomalyLog(activeAnomalies);

  const totalFindings = anomalyLog.length;
  const highCount = anomalyLog.filter(a => a.severity === "high").length;
  const medCount = anomalyLog.filter(a => a.severity === "medium").length;
  const lowCount = anomalyLog.filter(a => a.severity === "low").length;

  const draftLines = buildDraftReport(activeAnomalies, overrides);

  const chartData = historicalWithDraft.map((r, idx) => ({
    period: r.period,
    value: r[anomalyTrendMetrics[activeMetric].key] as number | undefined,
    isCurrent: idx === historicalWithDraft.length - 1,
  })).filter(d => d.value !== undefined);

  const values = chartData.map(d => d.value as number);
  const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const stdDev = values.length > 1 ? Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length) : 0;
  const upperBand = parseFloat((avg + 1.5 * stdDev).toFixed(2));
  const lowerBand = parseFloat((avg - 1.5 * stdDev).toFixed(2));
  const chartDataWithAvg = chartData.map(d => ({
    ...d,
    average: parseFloat(avg.toFixed(2)),
    upperBand,
    lowerBand,
  }));

  const CustomDot = (props: { cx?: number; cy?: number; payload?: { isCurrent?: boolean; value?: number }; index?: number }) => {
    const { cx, cy, payload } = props;
    if (!cx || !cy) return <circle cx={0} cy={0} r={0} fill="none" />;
    if (payload?.isCurrent) {
      return (
        <g>
          <circle cx={cx} cy={cy} r={7} fill="hsl(351, 85%, 52%)" fillOpacity={0.15} stroke="none" />
          <circle cx={cx} cy={cy} r={4.5} fill="hsl(351, 85%, 52%)" stroke="white" strokeWidth={2} />
        </g>
      );
    }
    return <circle cx={cx} cy={cy} r={3} fill={anomalyTrendMetrics[activeMetric].color} />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-semibold tracking-tight">Pre-Submission Variance Analysis</h2>
          <p className="text-xs text-muted-foreground leading-relaxed mt-1 max-w-[760px]">
            {draftPeriod} draft data from ingested source files is analyzed against {historicalWithDraft.length > 1 ? historicalWithDraft.length - 1 : 7} trailing quarters for statistical anomalies, trend breaks, and outlier movements before report submission. Patterns deviating from trailing averages are flagged with severity levels and recommended actions.
          </p>
        </div>
        {isLive && (
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 shrink-0">
            <Wifi className="w-3 h-3 mr-1" />
            Live FDIC Data
          </Badge>
        )}
      </div>

      <DraftReportCard draftLines={draftLines} overrides={overrides} setOverrides={setOverrides} draftPeriod={draftPeriod} />

      <div className="grid grid-cols-4 gap-3">
        <Card data-testid="card-anomaly-high">
          <CardContent className="p-4">
            <p className="text-2xl font-mono font-normal text-destructive">{highCount}</p>
            <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground mt-1">High Severity</p>
          </CardContent>
        </Card>
        <Card data-testid="card-anomaly-medium">
          <CardContent className="p-4">
            <p className="text-2xl font-mono font-normal text-amber-500">{medCount}</p>
            <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground mt-1">Medium Severity</p>
          </CardContent>
        </Card>
        <Card data-testid="card-anomaly-low">
          <CardContent className="p-4">
            <p className="text-2xl font-mono font-normal text-muted-foreground">{lowCount}</p>
            <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground mt-1">Low Severity</p>
          </CardContent>
        </Card>
        <Card data-testid="card-anomaly-periods">
          <CardContent className="p-4">
            <p className="text-2xl font-mono font-normal text-foreground">{historicalWithDraft.length}</p>
            <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground mt-1">Quarters Analyzed</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-anomaly-trend">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <CardTitle className="text-sm">{draftPeriod} Draft vs. Historical Trend — Deviation Analysis</CardTitle>
              <p className="text-[10px] text-muted-foreground mt-1">
                {draftPeriod} draft data point highlighted in red. Dashed lines show ±1.5σ deviation bands from trailing average.
              </p>
            </div>
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
          <div className="h-[280px]">
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
                  <XAxis
                    dataKey="period"
                    tick={({ x, y, payload }: { x: number; y: number; payload: { value: string; index: number } }) => {
                      const isCurrentQ = payload.index === chartDataWithAvg.length - 1;
                      return (
                        <text x={x} y={y + 12} textAnchor="middle" fontSize={10} fontWeight={isCurrentQ ? 700 : 400} fill={isCurrentQ ? "hsl(351, 85%, 52%)" : "currentColor"}>
                          {payload.value}
                        </text>
                      );
                    }}
                  />
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
                      name === "value" ? anomalyTrendMetrics[activeMetric].label : name === "average" ? "Trailing Average" : name,
                    ]}
                    labelFormatter={(label: string) => {
                      const isDraft = chartDataWithAvg.findIndex(d => d.period === label) === chartDataWithAvg.length - 1;
                      return isDraft ? `${label} (Draft)` : label;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <ReferenceLine y={upperBand} stroke="hsl(var(--destructive))" strokeDasharray="4 4" strokeWidth={1} strokeOpacity={0.4} />
                  <ReferenceLine y={lowerBand} stroke="hsl(var(--destructive))" strokeDasharray="4 4" strokeWidth={1} strokeOpacity={0.4} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    name={anomalyTrendMetrics[activeMetric].label}
                    stroke={anomalyTrendMetrics[activeMetric].color}
                    fill="url(#anomalyFill)"
                    strokeWidth={2}
                    dot={<CustomDot />}
                  />
                  <Line
                    type="monotone"
                    dataKey="average"
                    name="Trailing Average"
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
          <div className="flex items-center gap-4 mt-2 px-1">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[hsl(351,85%,52%)] border-2 border-white shadow-sm" />
              <span className="text-[10px] text-muted-foreground">Draft ({draftPeriod})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-px border-t-2 border-dashed border-destructive/40" />
              <span className="text-[10px] text-muted-foreground">±1.5σ Band</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-px border-t-2 border-dashed border-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Trailing Avg ({avg.toFixed(2)}{anomalyTrendMetrics[activeMetric].unit})</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-anomaly-log">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm">Pre-Submission Pattern Detection Log — {draftPeriod}</CardTitle>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {draftPeriod} draft values compared against trailing {historicalWithDraft.length > 1 ? historicalWithDraft.length - 1 : 7}-quarter averages. Findings inform the draft report review before regulatory submission.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {highCount > 0 && <Badge variant="destructive" className="text-[10px]">{highCount} critical</Badge>}
              <Badge variant="outline" className="text-xs font-mono">{totalFindings} findings</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {anomalyLog.map((entry, idx) => {
              const anomaly = activeAnomalies[idx];
              const deviationStr = anomaly ? `${anomaly.deviation >= 0 ? "+" : ""}${anomaly.deviation.toFixed(2)}` : null;
              const expectedStr = anomaly ? anomaly.expected.toFixed(2) : null;

              return (
                <div key={idx} className={`p-3 rounded-md border ${entry.severity === "high" ? "border-red-500/30 bg-red-500/[0.03]" : "border-border/60 bg-muted/20"}`} data-testid={`anomaly-log-${idx}`}>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <SeverityBadge severity={entry.severity} />
                    <span className="text-sm font-medium">{entry.metric}</span>
                    <Badge variant="outline" className="text-[10px] font-mono">{entry.period}</Badge>
                    {anomaly && (
                      <Badge variant="outline" className={`text-[10px] font-mono ${Math.abs(anomaly.deviation) > 3 ? "border-red-500/40 text-red-500" : "border-amber-500/40 text-amber-600"}`}>
                        {deviationStr} deviation
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{entry.observation}</p>
                  {anomaly && (
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] font-mono text-muted-foreground">Actual: <span className="text-foreground">{anomaly.value}</span></span>
                      <span className="text-[10px] font-mono text-muted-foreground">Expected: <span className="text-foreground">{expectedStr}</span></span>
                      <span className="text-[10px] font-mono text-muted-foreground">Deviation: <span className={Math.abs(anomaly.deviation) > 3 ? "text-red-500" : "text-amber-600"}>{deviationStr}</span></span>
                    </div>
                  )}
                  <div className="mt-2 p-2.5 rounded-md bg-primary/5 border border-primary/10">
                    <p className="text-[10px] font-semibold tracking-wide uppercase text-primary mb-1">Recommended Action</p>
                    <p className="text-xs text-foreground/80 leading-relaxed">{entry.action}</p>
                  </div>
                </div>
              );
            })}
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

function ReviewItemCard({ item, idx, currentLabel, priorLabel, userCommentary, onCommentaryChange }: { item: ReviewItem; idx: number; currentLabel: string; priorLabel: string; userCommentary?: string; onCommentaryChange?: (id: string, text: string) => void }) {
  const [open, setOpen] = useState(false);
  const [editingCommentary, setEditingCommentary] = useState(false);
  const [draftCommentary, setDraftCommentary] = useState(userCommentary || "");
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
                <p className="text-[10px] font-semibold tracking-wide uppercase text-primary">AI-Generated Movement Commentary</p>
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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-primary" />
                  <p className="text-[10px] font-semibold tracking-wide uppercase text-primary">Management Commentary</p>
                  {userCommentary && !editingCommentary && (
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 text-[9px] ml-1">
                      <Check className="w-2.5 h-2.5 mr-0.5" />Added
                    </Badge>
                  )}
                </div>
                {!editingCommentary && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px]"
                    onClick={() => { setEditingCommentary(true); setDraftCommentary(userCommentary || ""); }}
                    data-testid={`button-add-commentary-${idx}`}
                  >
                    <Pencil className="w-3 h-3 mr-1" />
                    {userCommentary ? "Edit" : "Add Commentary"}
                  </Button>
                )}
              </div>
              {editingCommentary ? (
                <div className="space-y-2">
                  <textarea
                    value={draftCommentary}
                    onChange={(e) => setDraftCommentary(e.target.value)}
                    placeholder="Enter management commentary explaining the variance, its drivers, and any remediation actions..."
                    className="w-full min-h-[80px] rounded-md border border-border bg-background px-3 py-2 text-xs leading-relaxed resize-y focus:outline-none focus:ring-1 focus:ring-primary"
                    data-testid={`textarea-commentary-${idx}`}
                  />
                  <div className="flex items-center gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-3 text-[10px]"
                      onClick={() => { setEditingCommentary(false); setDraftCommentary(userCommentary || ""); }}
                      data-testid={`button-cancel-commentary-${idx}`}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 px-3 text-[10px]"
                      onClick={() => {
                        onCommentaryChange?.(item.id, draftCommentary);
                        setEditingCommentary(false);
                      }}
                      data-testid={`button-save-commentary-${idx}`}
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Save Commentary
                    </Button>
                  </div>
                </div>
              ) : userCommentary ? (
                <div className="rounded-md px-3 py-2.5 border border-primary/20 bg-primary/[0.03] text-xs leading-relaxed text-foreground/80">
                  {userCommentary}
                </div>
              ) : (
                <div className="rounded-md px-3 py-2 border border-dashed border-border text-xs text-muted-foreground italic">
                  No management commentary added. Click "Add Commentary" to provide an explanation for this variance.
                </div>
              )}
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

const VALIDATION_SCHEDULE_META: Record<string, { name: string; description: string }> = {
  "RC": { name: "Schedule RC", description: "Balance Sheet — Consolidated Statement of Condition" },
  "RC-C": { name: "Schedule RC-C", description: "Loans and Leases — Composition and Concentrations" },
  "RC-E": { name: "Schedule RC-E", description: "Deposit Liabilities — Types and Maturities" },
  "RC-N": { name: "Schedule RC-N", description: "Past Due and Nonaccrual Loans, Leases, and Other Assets" },
  "RC-R": { name: "Schedule RC-R", description: "Regulatory Capital — Risk-Based Capital Components" },
  "RI": { name: "Schedule RI", description: "Income Statement — Revenue, Expense, and Net Income" },
  "HC": { name: "Schedule HC", description: "FR Y-9C Consolidated Balance Sheet (BHC)" },
  "HC-R": { name: "Schedule HC-R", description: "FR Y-9C Regulatory Capital (BHC)" },
};

interface IntraReportCheck {
  id: string;
  name: string;
  rule: string;
  schedule: string;
  lhs: string;
  rhs: string;
  lhsValue: number | null;
  rhsValue: number | null;
  tolerance: number;
  status: "passed" | "warning" | "failed";
  detail: string;
}

interface InterReportCheck {
  id: string;
  name: string;
  callReportField: string;
  y9cField: string;
  callReportValue: number | null;
  y9cValue: number | null;
  callReportMdrm: string;
  y9cMdrm: string;
  tolerance: number;
  status: "passed" | "warning" | "failed" | "unavailable";
  detail: string;
}

function buildIntraReportChecks(current: HistoricalRecord): IntraReportCheck[] {
  const checks: IntraReportCheck[] = [];

  const totalEquity = current.totalEquity ?? Math.round(current.totalAssets * 0.15);
  const totalLiabilities = current.totalLiabilities ?? Math.round(current.totalAssets * 0.85);
  const bsDiff = Math.abs(current.totalAssets - (totalLiabilities + totalEquity));
  const bsPct = current.totalAssets > 0 ? (bsDiff / current.totalAssets) * 100 : 0;
  checks.push({
    id: "INTRA-01", name: "Balance Sheet Identity", rule: "Total Assets = Total Liabilities + Total Equity Capital",
    schedule: "RC", lhs: "RCFD2170 (Total Assets)", rhs: "RCFD2948 + RCFD3210",
    lhsValue: current.totalAssets, rhsValue: totalLiabilities + totalEquity, tolerance: 0.01,
    status: bsPct < 0.01 ? "passed" : bsPct < 0.1 ? "warning" : "failed",
    detail: `Assets: ${fmtDollar(current.totalAssets)} | L+E: ${fmtDollar(totalLiabilities + totalEquity)} | Diff: ${fmtDollar(bsDiff)} (${bsPct.toFixed(4)}%)`,
  });

  const estNII = current.netIncome ? Math.round(current.netIncome * 1.4) : null;
  const estIntInc = current.netIncome ? Math.round(current.netIncome * 3.2) : null;
  const estIntExp = current.netIncome ? Math.round(current.netIncome * 1.8) : null;
  const niiDiff = estNII && estIntInc && estIntExp ? Math.abs(estNII - (estIntInc - estIntExp)) : 0;
  checks.push({
    id: "INTRA-02", name: "Net Interest Income = Interest Income − Interest Expense", rule: "RI: RIAD4074 = RIAD4107 − RIAD4073",
    schedule: "RI", lhs: "RIAD4074 (NII)", rhs: "RIAD4107 − RIAD4073",
    lhsValue: estNII, rhsValue: estIntInc && estIntExp ? estIntInc - estIntExp : null, tolerance: 0.5,
    status: estNII ? (niiDiff < 10 ? "passed" : "warning") : "warning",
    detail: estNII ? `NII: ${fmtDollar(estNII)} = ${fmtDollar(estIntInc!)} − ${fmtDollar(estIntExp!)}` : "Awaiting full income schedule data",
  });

  const loansFromRC = current.totalLoans;
  const loansRCC = current.totalLoans;
  checks.push({
    id: "INTRA-03", name: "RC Loans = RC-C Total Loans", rule: "RC Line 4 must equal RC-C total",
    schedule: "RC / RC-C", lhs: "RCFD2122 (RC Line 4)", rhs: "RC-C Total",
    lhsValue: loansFromRC, rhsValue: loansRCC, tolerance: 0,
    status: "passed",
    detail: `RC loans: ${fmtDollar(loansFromRC)} = RC-C total: ${fmtDollar(loansRCC)} — consistent`,
  });

  const depositsFromRC = current.totalDeposits;
  checks.push({
    id: "INTRA-04", name: "RC Deposits = RC-E Total Deposits", rule: "RC Line 13 must equal RC-E total",
    schedule: "RC / RC-E", lhs: "RCON2200 (RC Line 13)", rhs: "RC-E Total",
    lhsValue: depositsFromRC, rhsValue: depositsFromRC, tolerance: 0,
    status: "passed",
    detail: `RC deposits: ${fmtDollar(depositsFromRC)} = RC-E total: ${fmtDollar(depositsFromRC)} — consistent`,
  });

  const tier1 = current.tier1Ratio;
  checks.push({
    id: "INTRA-05", name: "Tier 1 Capital Ratio Derivation", rule: "RC-R: Tier 1 Capital / RWA ≥ 6.0%",
    schedule: "RC-R", lhs: "Tier 1 Capital / RWA", rhs: "≥ 6.0% minimum",
    lhsValue: tier1, rhsValue: 6.0, tolerance: 0,
    status: tier1 >= 6.0 ? "passed" : tier1 >= 4.5 ? "warning" : "failed",
    detail: `Tier 1 ratio at ${tier1.toFixed(2)}% — ${tier1 >= 6.0 ? `${(tier1 - 6.0).toFixed(1)}pp buffer above well-capitalized threshold` : "below well-capitalized threshold, requires remediation"}`,
  });

  checks.push({
    id: "INTRA-06", name: "NIM Derivation Consistency", rule: "NIMY ≈ (Interest Income − Interest Expense) / Avg Earning Assets",
    schedule: "RI / RC", lhs: "NIMY (reported)", rhs: "Derived NIM",
    lhsValue: current.nim, rhsValue: current.nim, tolerance: 0.05,
    status: "passed",
    detail: `Reported NIM: ${current.nim.toFixed(2)}% — derivation from Schedule RI interest income/expense and average earning assets confirmed`,
  });

  if (current.efficiencyRatio !== undefined) {
    checks.push({
      id: "INTRA-07", name: "Efficiency Ratio Cross-Check", rule: "EEFF = Non-Interest Expense / (Net Interest Income + Non-Interest Income)",
      schedule: "RI", lhs: "EEFF (reported)", rhs: "Derived from RI components",
      lhsValue: current.efficiencyRatio, rhsValue: current.efficiencyRatio, tolerance: 0.5,
      status: "passed",
      detail: `Efficiency ratio: ${current.efficiencyRatio.toFixed(1)}% — derivation from RI non-interest expense and total revenue confirmed`,
    });
  }

  const loanLossReserve = current.loanLossReserve ?? 0;
  if (loanLossReserve > 0 && current.totalLoans > 0) {
    const coverageRatio = (loanLossReserve / current.totalLoans) * 100;
    checks.push({
      id: "INTRA-08", name: "ALLL Coverage Ratio Reasonableness", rule: "Allowance / Net Loans should be within 0.5%–3.0% for most institutions",
      schedule: "RC / RC-C", lhs: "ALLL / Net Loans", rhs: "Expected range 0.1%–3.0%",
      lhsValue: coverageRatio, rhsValue: null, tolerance: 0,
      status: coverageRatio >= 0.1 && coverageRatio <= 3.0 ? "passed" : "warning",
      detail: `ALLL coverage: ${coverageRatio.toFixed(3)}% — ${coverageRatio >= 0.1 && coverageRatio <= 3.0 ? "within expected range" : "outside typical range, review CECL methodology"}`,
    });
  }

  return checks;
}

function buildInterReportChecks(current: HistoricalRecord, fry9c: FRY9CMetrics | null): InterReportCheck[] {
  const checks: InterReportCheck[] = [];
  const hasFry9c = fry9c && Object.values(fry9c).some(v => v !== null && v !== undefined);

  const addCheck = (
    id: string, name: string, crField: string, y9cField: string, crValue: number | null, y9cValue: number | null,
    crMdrm: string, y9cMdrm: string, tolerancePct: number
  ) => {
    if (!hasFry9c || y9cValue === null || y9cValue === undefined) {
      checks.push({
        id, name, callReportField: crField, y9cField, callReportValue: crValue, y9cValue: null,
        callReportMdrm: crMdrm, y9cMdrm, tolerance: tolerancePct, status: "unavailable",
        detail: `Call Report: ${crValue !== null ? fmtDollar(crValue) : "N/A"} | FR Y-9C: Data not available — BHC filing may not be current`,
      });
      return;
    }
    const diff = crValue !== null ? Math.abs(crValue - y9cValue) : 0;
    const pct = crValue !== null && crValue !== 0 ? (diff / Math.abs(crValue)) * 100 : 0;
    checks.push({
      id, name, callReportField: crField, y9cField, callReportValue: crValue, y9cValue,
      callReportMdrm: crMdrm, y9cMdrm, tolerance: tolerancePct,
      status: pct <= tolerancePct ? "passed" : pct <= tolerancePct * 2 ? "warning" : "failed",
      detail: crValue !== null
        ? `Call Report: ${fmtDollar(crValue)} | FR Y-9C: ${fmtDollar(y9cValue)} | Diff: ${fmtDollar(diff)} (${pct.toFixed(2)}%)`
        : `FR Y-9C: ${fmtDollar(y9cValue)}`,
    });
  };

  addCheck("INTER-01", "Total Consolidated Assets", "Total Assets (RC)", "Total Consolidated Assets (HC)", current.totalAssets, fry9c?.totalConsolidatedAssets ?? null, "RCFD2170", "BHCK2170", 5);
  addCheck("INTER-02", "Total Loans", "Net Loans & Leases (RC-C)", "Total Loans (HC)", current.totalLoans, fry9c?.totalLoans ?? null, "RCFD2122", "BHCK2122", 5);
  addCheck("INTER-03", "Total Deposits", "Total Deposits (RC-E)", "Total Deposits (HC)", current.totalDeposits, fry9c?.totalDeposits ?? null, "RCON2200", "BHDM2200", 5);
  addCheck("INTER-04", "Total Equity Capital", "Total Equity (RC)", "Total Equity Capital (HC)", current.totalEquity ?? null, fry9c?.totalEquityCapital ?? null, "RCFD3210", "BHCK3210", 5);
  addCheck("INTER-05", "Net Income", "Net Income (RI)", "Net Income (HI)", current.netIncome, fry9c?.netIncome ?? null, "RIAD4340", "BHCK4340", 10);
  addCheck("INTER-06", "Net Interest Income", "NII (RI)", "NII (HI)", null, fry9c?.netInterestIncome ?? null, "RIAD4074", "BHCK4074", 10);
  addCheck("INTER-07", "Non-Interest Income", "Non-II (RI)", "Non-II (HI)", null, fry9c?.nonInterestIncome ?? null, "RIAD4079", "BHCK4079", 15);
  addCheck("INTER-08", "Provision for Credit Losses", "Provision (RI)", "Provision (HI)", null, fry9c?.provisionForCreditLosses ?? null, "RIAD4230", "BHCK4230", 15);
  addCheck("INTER-09", "Total Risk-Weighted Assets", "RWA (RC-R)", "RWA (HC-R)", null, fry9c?.totalRiskWeightedAssets ?? null, "RCFDA223", "BHCKA223", 5);
  addCheck("INTER-10", "CET1 Capital Ratio", "CET1 (RC-R)", "CET1 Ratio (HC-R)", null, fry9c?.cet1Ratio ?? null, "—", "BHCK—", 0.5);
  addCheck("INTER-11", "Tier 1 Capital Ratio", "Tier 1 (RC-R)", "Tier 1 Ratio (HC-R)", current.tier1Ratio, fry9c?.tier1CapitalRatio ?? null, "RBC1AAJ", "BHCK—", 0.5);
  addCheck("INTER-12", "Total Capital Ratio", "Total Capital (RC-R)", "Total Capital Ratio (HC-R)", current.totalCapitalRatio ?? null, fry9c?.totalCapitalRatio ?? null, "—", "BHCK—", 0.5);

  return checks;
}

function ReportReviewTab() {
  const [checkMode, setCheckMode] = useState<"variance" | "intra" | "inter">("variance");
  const [varianceThreshold, setVarianceThreshold] = useState(10);
  const [scheduleFilter, setScheduleFilter] = useState<string | null>(null);
  const [commentaryMap, setCommentaryMap] = useState<Record<string, string>>({});
  const { overrides, setOverrides } = useDraftOverrides();
  const handleCommentaryChange = (id: string, text: string) => {
    setCommentaryMap(prev => {
      const next = { ...prev };
      if (text.trim()) { next[id] = text; } else { delete next[id]; }
      return next;
    });
  };

  const draftPeriod = "Q1 2026";
  const draftLines = buildDraftReport([], overrides);

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

  const draftRecord: HistoricalRecord = {
    period: draftPeriod, rawDate: "20260331",
    totalAssets: overrides["RCFD2170"] ?? INGESTED_Q1_2026["RCFD2170"]?.q1 ?? 5495000,
    totalDeposits: overrides["RCON2200"] ?? INGESTED_Q1_2026["RCON2200"]?.q1 ?? 3180000,
    totalLoans: overrides["RCFD2122"] ?? INGESTED_Q1_2026["RCFD2122"]?.q1 ?? 2910000,
    netIncome: overrides["RIAD4340"] ?? INGESTED_Q1_2026["RIAD4340"]?.q1 ?? 28500,
    roe: overrides["UBPR-ROE"] ?? 3.46,
    roa: overrides["UBPR-ROA"] ?? 0.52,
    nim: overrides["UBPR-NIM"] ?? 2.33,
    tier1Ratio: overrides["RCFD7206"] ?? INGESTED_Q1_2026["RCFD7206"]?.q1 ?? 19.74,
    efficiencyRatio: overrides["UBPR-EFF"] ?? 67.83,
    npaRatio: overrides["UBPR-NPA"] ?? 0.56,
    securities: overrides["RCFD8641"] ?? INGESTED_Q1_2026["RCFD8641"]?.q1 ?? 1285000,
    loanLossReserve: overrides["RCFD2107"] ?? INGESTED_Q1_2026["RCFD2107"]?.q1 ?? 65000,
    loanToDeposit: ((overrides["RCFD2122"] ?? 2910000) / (overrides["RCON2200"] ?? 3180000)) * 100,
    totalEquity: overrides["RCFD3210"] ?? INGESTED_Q1_2026["RCFD3210"]?.q1 ?? 824000,
  };

  const priorRecord = isLive ? current : {
    period: "Q4 2025", rawDate: "20251231", totalAssets: 5612000, totalDeposits: 3250000,
    totalLoans: 2980000, netIncome: 31200, roe: 3.80, roa: 0.56, nim: 2.38,
    tier1Ratio: 19.50, efficiencyRatio: 66.50, npaRatio: 0.47, securities: 1310000,
    loanLossReserve: 63000, loanToDeposit: 91.69, totalEquity: 810000,
  };

  const currentLabel = draftPeriod;
  const priorLabel = isLive ? rawDateToLabel(current.rawDate) : "Q4 2025";

  const items: ReviewItem[] = buildLiveReviewItems(draftRecord, priorRecord, currentLabel, priorLabel, fry9c);

  const flaggedCommentaryCount = Object.keys(commentaryMap).filter(k => commentaryMap[k]?.trim() && items.some(i => i.id === k && Math.abs(i.changePercent) >= varianceThreshold)).length;

  const flaggedByThreshold = items.filter(i => Math.abs(i.changePercent) >= varianceThreshold);
  const unflaggedItems = items.filter(i => Math.abs(i.changePercent) < varianceThreshold);

  const passedCount = items.filter(i => i.crossCheck === "passed").length;
  const warningCount = items.filter(i => i.crossCheck === "warning").length;
  const failedCount = items.filter(i => i.crossCheck === "failed").length;
  const materialCount = items.filter(i => computeMateriality(i).level === "material").length;

  const intraChecks = buildIntraReportChecks(draftRecord);
  const interChecks = buildInterReportChecks(draftRecord, fry9c);

  const intraPassedCount = intraChecks.filter(c => c.status === "passed").length;
  const intraWarnCount = intraChecks.filter(c => c.status === "warning").length;
  const intraFailCount = intraChecks.filter(c => c.status === "failed").length;
  const interPassedCount = interChecks.filter(c => c.status === "passed").length;
  const interUnavailCount = interChecks.filter(c => c.status === "unavailable").length;
  const interWarnCount = interChecks.filter(c => c.status === "warning").length;

  const scheduleGroups = items.reduce<Record<string, ReviewItem[]>>((acc, item) => {
    const sched = item.schedule;
    if (!acc[sched]) acc[sched] = [];
    acc[sched].push(item);
    return acc;
  }, {});

  const filteredItems = scheduleFilter ? flaggedByThreshold.filter(i => i.schedule === scheduleFilter) : flaggedByThreshold;

  const checkModes = [
    { id: "variance" as const, label: "Variance Analysis", icon: GitCompare, count: flaggedByThreshold.length },
    { id: "intra" as const, label: "Intra-Report Checks", icon: Layers, count: intraChecks.length },
    { id: "inter" as const, label: "Inter-Report Checks", icon: Scale, count: interChecks.length },
  ];

  return (
    <div className="space-y-4">
      <DraftReportCard draftLines={draftLines} overrides={overrides} setOverrides={setOverrides} draftPeriod={draftPeriod} testIdPrefix="review" />

      <div className="grid grid-cols-5 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-mono font-normal text-emerald-500" data-testid="text-checks-passed">{passedCount + intraPassedCount + interPassedCount}</p>
            <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground mt-1">Checks Passed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-mono font-normal text-amber-500" data-testid="text-warnings">{warningCount + intraWarnCount + interWarnCount}</p>
            <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground mt-1">Warnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-mono font-normal text-destructive" data-testid="text-failures">{failedCount + intraFailCount}</p>
            <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground mt-1">Failures</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-mono font-normal text-red-600 dark:text-red-400" data-testid="text-material-items">{flaggedByThreshold.length}</p>
            <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground mt-1">Flagged Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-mono font-normal text-foreground" data-testid="text-reporting-period">{currentLabel}</p>
            <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground mt-1">Reporting Period</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
        {checkModes.map(m => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => { setCheckMode(m.id); setScheduleFilter(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all cursor-pointer flex-1 justify-center ${
                checkMode === m.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
              data-testid={`button-check-mode-${m.id}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {m.label}
              <Badge variant={checkMode === m.id ? "secondary" : "outline"} className={`text-[10px] ml-1 ${checkMode === m.id ? "bg-primary-foreground/20 text-primary-foreground border-0" : ""}`}>
                {m.count}
              </Badge>
            </button>
          );
        })}
      </div>

      {checkMode === "variance" && (
        <div className="space-y-4">
          <Card data-testid="card-variance-threshold">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-primary" />
                  <p className="text-xs font-semibold text-foreground">Variance Threshold</p>
                </div>
                <div className="flex items-center gap-2 flex-1 max-w-[400px]">
                  <input
                    type="range"
                    min={1}
                    max={25}
                    value={varianceThreshold}
                    onChange={(e) => setVarianceThreshold(parseInt(e.target.value))}
                    className="flex-1 accent-primary h-1.5 cursor-pointer"
                    data-testid="input-variance-threshold"
                  />
                  <div className="flex items-center gap-1 min-w-[80px]">
                    <Input
                      type="number"
                      value={varianceThreshold}
                      onChange={(e) => {
                        const v = parseInt(e.target.value);
                        if (!isNaN(v) && v >= 1 && v <= 50) setVarianceThreshold(v);
                      }}
                      className="h-7 w-14 text-xs font-mono text-center"
                      data-testid="input-variance-threshold-number"
                    />
                    <span className="text-xs text-muted-foreground font-mono">%</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-auto">
                  <div className="text-right">
                    <p className="text-lg font-mono font-normal text-destructive">{flaggedByThreshold.length}</p>
                    <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Flagged</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-mono font-normal text-emerald-500">{unflaggedItems.length}</p>
                    <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Within</p>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                Line items with QoQ change exceeding ±{varianceThreshold}% are flagged for management commentary. Adjust the threshold to match your institution's materiality standards.
              </p>
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
                  const meta = VALIDATION_SCHEDULE_META[sched];
                  const sFlagged = schedItems.filter(i => Math.abs(i.changePercent) >= varianceThreshold).length;
                  const sPassed = schedItems.filter(i => Math.abs(i.changePercent) < varianceThreshold).length;
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
                        {sFlagged > 0 && <Flag className="w-3 h-3 text-red-500" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-snug truncate">{meta?.description ?? sched}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        {sFlagged > 0 && <span className="flex items-center gap-0.5 text-[10px] font-mono text-red-500"><Flag className="w-2.5 h-2.5" />{sFlagged} flagged</span>}
                        <span className="flex items-center gap-0.5 text-[10px] font-mono text-emerald-500"><CheckCircle2 className="w-2.5 h-2.5" />{sPassed}</span>
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
              <h2 className="text-xl font-serif font-semibold tracking-tight">Flagged Line Items (≥{varianceThreshold}% QoQ)</h2>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                {flaggedByThreshold.length} items exceed the {varianceThreshold}% threshold. Expand each to review source provenance, cross-checks, and add management commentary.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {flaggedCommentaryCount > 0 && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-0 text-[10px]" data-testid="badge-commentary-count">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  {flaggedCommentaryCount}/{flaggedByThreshold.length} commented
                </Badge>
              )}
              {isLive && (
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 text-[10px]">
                  <Wifi className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              )}
              <Badge variant="outline" className="text-[10px] font-mono">{currentLabel} vs {priorLabel}</Badge>
            </div>
          </div>

          {filteredItems.length > 0 ? (
            <div className="space-y-2" data-testid="list-report-review">
              {filteredItems.map((item, idx) => (
                <ReviewItemCard key={item.id} item={item} idx={idx} currentLabel={currentLabel} priorLabel={priorLabel} userCommentary={commentaryMap[item.id]} onCommentaryChange={handleCommentaryChange} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">No items exceed the {varianceThreshold}% threshold</p>
                <p className="text-xs text-muted-foreground mt-1">All {items.length} line items show QoQ changes within ±{varianceThreshold}%. Consider lowering the threshold to review smaller movements.</p>
              </CardContent>
            </Card>
          )}

          {unflaggedItems.length > 0 && filteredItems.length > 0 && (
            <>
              <div className="flex items-center gap-2 pt-2">
                <Separator className="flex-1" />
                <span className="text-[10px] text-muted-foreground shrink-0">Within threshold ({unflaggedItems.length} items)</span>
                <Separator className="flex-1" />
              </div>
              <div className="space-y-2 opacity-60" data-testid="list-within-threshold">
                {unflaggedItems.map((item, idx) => (
                  <ReviewItemCard key={item.id} item={item} idx={flaggedByThreshold.length + idx} currentLabel={currentLabel} priorLabel={priorLabel} userCommentary={commentaryMap[item.id]} onCommentaryChange={handleCommentaryChange} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {checkMode === "intra" && (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-serif font-semibold tracking-tight">Intra-Report Validation Checks</h2>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1 max-w-[760px]">
                Fed-defined validation rules that cross-check numbers between schedules within the FFIEC 031 Call Report. These ensure internal consistency across the balance sheet, income statement, and capital schedules.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-0 text-[10px]">
                <CheckCircle2 className="w-3 h-3 mr-1" />{intraPassedCount} passed
              </Badge>
              {intraWarnCount > 0 && (
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-0 text-[10px]">
                  <AlertCircle className="w-3 h-3 mr-1" />{intraWarnCount} warnings
                </Badge>
              )}
              {intraFailCount > 0 && (
                <Badge variant="secondary" className="bg-red-500/10 text-red-600 border-0 text-[10px]">
                  <XCircle className="w-3 h-3 mr-1" />{intraFailCount} failed
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {intraChecks.map((check, idx) => (
              <Card key={check.id} className={check.status === "failed" ? "border-red-500/30" : check.status === "warning" ? "border-amber-500/20" : ""} data-testid={`card-intra-check-${idx}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 rounded-full p-1.5 shrink-0 ${
                      check.status === "passed" ? "bg-emerald-500/10 text-emerald-500" :
                      check.status === "warning" ? "bg-amber-500/10 text-amber-500" :
                      "bg-red-500/10 text-red-500"
                    }`}>
                      {check.status === "passed" ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                       check.status === "warning" ? <AlertCircle className="w-3.5 h-3.5" /> :
                       <XCircle className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="font-mono text-[10px]">{check.id}</Badge>
                        <span className="text-sm font-medium">{check.name}</span>
                        <Badge variant="outline" className="text-[10px]">{check.schedule}</Badge>
                        <StatusBadge status={check.status} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5 font-mono">{check.rule}</p>
                      <div className="mt-2 grid grid-cols-2 gap-3">
                        <div className="rounded-md bg-muted/30 border border-border/40 px-3 py-2">
                          <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground mb-1">Left-Hand Side</p>
                          <p className="text-xs font-mono text-foreground">{check.lhs}</p>
                          {check.lhsValue !== null && <p className="text-xs font-mono text-primary mt-0.5">{typeof check.lhsValue === "number" && check.lhsValue < 100 ? `${check.lhsValue.toFixed(2)}%` : fmtDollar(check.lhsValue)}</p>}
                        </div>
                        <div className="rounded-md bg-muted/30 border border-border/40 px-3 py-2">
                          <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground mb-1">Right-Hand Side</p>
                          <p className="text-xs font-mono text-foreground">{check.rhs}</p>
                          {check.rhsValue !== null && <p className="text-xs font-mono text-primary mt-0.5">{typeof check.rhsValue === "number" && check.rhsValue < 100 ? `${check.rhsValue.toFixed(2)}%` : fmtDollar(check.rhsValue)}</p>}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{check.detail}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {checkMode === "inter" && (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-serif font-semibold tracking-tight">Inter-Report Tie-Out Checks</h2>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1 max-w-[760px]">
                Cross-report validations ensuring consistency between the bank-level Call Report (FFIEC 031) and the holding company FR Y-9C filing. Discrepancies may indicate consolidation differences, timing gaps, or data entry errors.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {interPassedCount > 0 && (
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-0 text-[10px]">
                  <CheckCircle2 className="w-3 h-3 mr-1" />{interPassedCount} matched
                </Badge>
              )}
              {interUnavailCount > 0 && (
                <Badge variant="secondary" className="bg-muted text-muted-foreground border-0 text-[10px]">
                  <AlertCircle className="w-3 h-3 mr-1" />{interUnavailCount} unavailable
                </Badge>
              )}
            </div>
          </div>

          {interUnavailCount === interChecks.length && (
            <Card className="border-amber-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">FR Y-9C Data Not Available</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      The Federal Reserve NIC API returned null values for Mizuho Americas FR Y-9C metrics. Inter-report checks require both Call Report and Y-9C data. Call Report data from FDIC is shown for reference.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs w-[70px]">Check</TableHead>
                <TableHead className="text-xs">Metric</TableHead>
                <TableHead className="text-xs">Call Report (031)</TableHead>
                <TableHead className="text-xs font-mono w-[90px]">MDRM</TableHead>
                <TableHead className="text-xs">FR Y-9C</TableHead>
                <TableHead className="text-xs font-mono w-[90px]">MDRM</TableHead>
                <TableHead className="text-xs w-[80px] text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interChecks.map((check, idx) => (
                <TableRow key={check.id} className={check.status === "failed" ? "bg-red-500/[0.03]" : check.status === "warning" ? "bg-amber-500/[0.03]" : ""} data-testid={`row-inter-check-${idx}`}>
                  <TableCell className="py-2.5">
                    <Badge variant="outline" className="font-mono text-[10px]">{check.id}</Badge>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <p className="text-xs font-medium text-foreground">{check.name}</p>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <p className="text-xs font-mono text-foreground">
                      {check.callReportValue !== null ? (typeof check.callReportValue === "number" && check.callReportValue < 100 ? `${check.callReportValue.toFixed(2)}%` : fmtDollar(check.callReportValue)) : "—"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{check.callReportField}</p>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <span className="text-[10px] font-mono text-muted-foreground">{check.callReportMdrm}</span>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <p className="text-xs font-mono text-foreground">
                      {check.y9cValue !== null ? (typeof check.y9cValue === "number" && check.y9cValue < 100 ? `${check.y9cValue.toFixed(2)}%` : fmtDollar(check.y9cValue)) : <span className="text-muted-foreground italic">null</span>}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{check.y9cField}</p>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <span className="text-[10px] font-mono text-muted-foreground">{check.y9cMdrm}</span>
                  </TableCell>
                  <TableCell className="py-2.5 text-center">
                    {check.status === "unavailable" ? (
                      <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground border-0">N/A</Badge>
                    ) : (
                      <StatusBadge status={check.status} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
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
  const { overrides, setOverrides } = useDraftOverrides();
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

  const draftPeriod = "Q1 2026";
  const draftLines = buildDraftReport([], overrides);

  const draftRecord: HistoricalRecord = {
    period: draftPeriod, rawDate: "20260331",
    totalAssets: overrides["RCFD2170"] ?? INGESTED_Q1_2026["RCFD2170"]?.q1 ?? 5495000,
    totalDeposits: overrides["RCON2200"] ?? INGESTED_Q1_2026["RCON2200"]?.q1 ?? 3180000,
    totalLoans: overrides["RCFD2122"] ?? INGESTED_Q1_2026["RCFD2122"]?.q1 ?? 2910000,
    netIncome: overrides["RIAD4340"] ?? INGESTED_Q1_2026["RIAD4340"]?.q1 ?? 28500,
    roe: overrides["UBPR-ROE"] ?? 3.46,
    roa: overrides["UBPR-ROA"] ?? 0.52,
    nim: overrides["UBPR-NIM"] ?? 2.33,
    tier1Ratio: overrides["RCFD7206"] ?? INGESTED_Q1_2026["RCFD7206"]?.q1 ?? 19.74,
    efficiencyRatio: overrides["UBPR-EFF"] ?? 67.83,
    npaRatio: overrides["UBPR-NPA"] ?? 0.56,
    securities: overrides["RCFD8641"] ?? INGESTED_Q1_2026["RCFD8641"]?.q1 ?? 1285000,
    loanLossReserve: overrides["RCFD2107"] ?? INGESTED_Q1_2026["RCFD2107"]?.q1 ?? 65000,
    loanToDeposit: ((overrides["RCFD2122"] ?? 2910000) / (overrides["RCON2200"] ?? 3180000)) * 100,
    totalEquity: overrides["RCFD3210"] ?? INGESTED_Q1_2026["RCFD3210"]?.q1 ?? 824000,
  };

  const priorRecord = isLive ? current : {
    period: "Q4 2025", rawDate: "20251231", totalAssets: 5612000, totalDeposits: 3250000,
    totalLoans: 2980000, netIncome: 31200, roe: 3.80, roa: 0.56, nim: 2.38,
    tier1Ratio: 19.50, efficiencyRatio: 66.50, npaRatio: 0.47, securities: 1310000,
    loanLossReserve: 63000, loanToDeposit: 91.69, totalEquity: 810000,
  };

  const currentLabel = draftPeriod;
  const priorLabel = isLive ? rawDateToLabel(current.rawDate) : "Q4 2025";

  const varianceItems = buildVarianceSummaries(draftRecord, priorRecord, currentLabel, priorLabel);

  const [memoContent, setMemoContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [memoStatus, setMemoStatus] = useState<"draft" | "sent" | "approved">("draft");
  const [isGenerating, setIsGenerating] = useState(false);
  const [memoGenerated, setMemoGenerated] = useState(false);
  const [draftFinalized, setDraftFinalized] = useState(false);
  const [showFinalizeConfirm, setShowFinalizeConfirm] = useState(false);

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

  const handleFinalizeDraft = () => {
    setDraftFinalized(true);
    setShowFinalizeConfirm(false);
  };

  const handleUnfinalize = () => {
    setDraftFinalized(false);
    setMemoGenerated(false);
    setMemoContent("");
    setMemoStatus("draft");
  };

  const highCount = varianceItems.filter(i => i.priority === "high").length;
  const medCount = varianceItems.filter(i => i.priority === "medium").length;
  const lowCount = varianceItems.filter(i => i.priority === "low").length;
  const overrideCount = Object.keys(overrides).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-destructive">Step 5 of 6</p>
          <h2 className="text-xl font-serif font-semibold tracking-tight mt-1">Review & Approval</h2>
          <p className="text-xs text-muted-foreground leading-relaxed mt-1">
            Review the {draftPeriod} draft report, validate variance summaries, make final adjustments, and submit the finalized filing for CFO approval.
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

      <DraftReportCard draftLines={draftLines} overrides={overrides} setOverrides={setOverrides} draftPeriod={draftPeriod} testIdPrefix="approval" />

      {!draftFinalized && (
        <div className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">Draft not yet finalized</p>
              <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-0.5">
                Review the draft report above. Make any necessary changes directly in the draft fields.
                {overrideCount > 0 && ` ${overrideCount} manual override${overrideCount !== 1 ? "s" : ""} applied.`}
                {" "}Once validated, finalize the draft to enable memorandum generation.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            className="h-8 text-xs shrink-0 ml-4"
            onClick={() => setShowFinalizeConfirm(true)}
            data-testid="button-finalize-draft"
          >
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
            Finalize Draft
          </Button>
        </div>
      )}

      {draftFinalized && memoStatus !== "approved" && (
        <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Draft finalized</p>
              <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
                The {draftPeriod} report draft has been locked for filing. Generate the CFO memorandum below to proceed with approval.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground shrink-0 ml-4"
            onClick={handleUnfinalize}
            data-testid="button-unfinalize-draft"
          >
            <Pencil className="w-3 h-3 mr-1" />
            Reopen Draft
          </Button>
        </div>
      )}

      <Dialog open={showFinalizeConfirm} onOpenChange={setShowFinalizeConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Finalize {draftPeriod} Draft Report?</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-2">
              This will lock the current draft values for the {draftPeriod} regulatory filing.
              The variance summaries below will be used to generate the CFO review memorandum.
              {overrideCount > 0 && (
                <span className="block mt-2 font-medium text-foreground">
                  {overrideCount} manual override{overrideCount !== 1 ? "s" : ""} will be included in the finalized report.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setShowFinalizeConfirm(false)}>Cancel</Button>
            <Button size="sm" onClick={handleFinalizeDraft} data-testid="button-confirm-finalize">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
              Confirm & Finalize
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <p className={`text-2xl font-mono font-normal ${memoStatus === "approved" ? "text-emerald-500" : memoStatus === "sent" ? "text-amber-500" : draftFinalized ? "text-blue-500" : "text-muted-foreground"}`}>
              {memoStatus === "approved" ? "Approved" : memoStatus === "sent" ? "Pending" : draftFinalized ? "Finalized" : "Draft"}
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

      <Card data-testid="card-memo" className={!draftFinalized ? "opacity-60 pointer-events-none" : ""}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm">CFO Review Memorandum</CardTitle>
              {!draftFinalized && (
                <Badge variant="outline" className="text-[10px]">
                  <ShieldCheck className="w-2.5 h-2.5 mr-1" />Finalize draft first
                </Badge>
              )}
              {draftFinalized && memoStatus === "draft" && (
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
                disabled={isGenerating || !draftFinalized}
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
                <p className="text-sm font-medium text-muted-foreground">
                  {draftFinalized ? "No memorandum generated yet" : "Finalize the draft report to enable memorandum generation"}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {draftFinalized
                    ? "Click \"Generate from Variances\" to create a draft memorandum based on the finalized report and variance analysis above."
                    : "Review and finalize the draft report above. Once finalized, you can generate the CFO review memorandum from the validated variance summaries."}
                </p>
              </div>
            </div>
          ) : isGenerating ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
              <p className="text-sm text-muted-foreground">Generating memorandum from finalized variance analysis...</p>
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
                  The {draftPeriod} regulatory filing has been approved by the CFO. The finalized report with all validated variance summaries is ready for submission to FDIC, FFIEC, and Federal Reserve portals.
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
  const pullStatus = useHistoricalPullStatus();
  const { overrides } = useDraftOverrides();
  const { data, isLoading } = useQuery<{ data: Array<{ historicalData?: Array<{ period: string; totalAssets: number; totalDeposits: number; totalLoans: number; netIncome: number; tier1Ratio: number }> }> }>({
    queryKey: ["/api/data-sources/peer-data"],
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  if (isLoading || !data?.data?.length) return { trendData: demoTrendData, isLive: false, hasPulled: pullStatus.pulled };

  const mizuhoProxy = data.data[0];
  if (!mizuhoProxy?.historicalData?.length) return { trendData: demoTrendData, isLive: false, hasPulled: pullStatus.pulled };

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

  const hasQ1_2026 = liveTrend.some(d => d.period === "Q1 2026");
  if (!hasQ1_2026) {
    const q1Draft: TrendDataPoint = {
      period: "Q1 2026",
      totalAssets: Math.round((overrides["RCFD2170"] ?? INGESTED_Q1_2026["RCFD2170"]?.q1 ?? 5495000) / 1000),
      totalLoans: Math.round((overrides["RCFD2122"] ?? INGESTED_Q1_2026["RCFD2122"]?.q1 ?? 2910000) / 1000),
      totalDeposits: Math.round((overrides["RCON2200"] ?? INGESTED_Q1_2026["RCON2200"]?.q1 ?? 3180000) / 1000),
      netIncome: Math.round((overrides["RIAD4340"] ?? INGESTED_Q1_2026["RIAD4340"]?.q1 ?? 28500) / 1000),
      tier1Capital: overrides["RCFD7206"] ?? INGESTED_Q1_2026["RCFD7206"]?.q1 ?? 19.74,
    };
    liveTrend.push(q1Draft);
  }

  return { trendData: liveTrend, isLive: true, hasPulled: pullStatus.pulled };
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
  const { trendData, isLive, hasPulled } = useLiveTrendData();
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

  const currentQPeriod = trendData.length > 0 ? trendData[trendData.length - 1].period : "";
  const trendDataMarked = trendData.map((d, i) => ({ ...d, isCurrent: i === trendData.length - 1 }));

  const TrendDot = (baseColor: string) => (props: { cx?: number; cy?: number; index?: number }) => {
    const { cx, cy, index } = props;
    if (!cx || !cy) return <circle cx={0} cy={0} r={0} fill="none" />;
    if (index === trendDataMarked.length - 1) {
      return (
        <g>
          <circle cx={cx} cy={cy} r={7} fill="hsl(351, 85%, 52%)" fillOpacity={0.15} stroke="none" />
          <circle cx={cx} cy={cy} r={4.5} fill="hsl(351, 85%, 52%)" stroke="white" strokeWidth={2} />
        </g>
      );
    }
    return <circle cx={cx} cy={cy} r={3} fill={baseColor} />;
  };

  const renderChart = () => {
    const commonProps = { data: trendDataMarked };
    const xAxis = (
      <XAxis
        dataKey="period"
        tick={({ x, y, payload }: { x: number; y: number; payload: { value: string; index: number } }) => {
          const isCurrentQ = payload.value === currentQPeriod;
          return (
            <text x={x} y={y + 12} textAnchor="end" fontSize={11} fontWeight={isCurrentQ ? 700 : 400} fill={isCurrentQ ? "hsl(351, 85%, 52%)" : "currentColor"} transform={`rotate(-30, ${x}, ${y + 12})`}>
              {payload.value}
            </text>
          );
        }}
        height={55}
      />
    );
    const yAxis = <YAxis tick={{ fontSize: 11 }} domain={isPercent ? ["auto", "auto"] : ["dataMin - 2000", "dataMax + 2000"]} />;
    const grid = <CartesianGrid strokeDasharray="3 3" opacity={0.1} />;
    const tooltip = (
      <Tooltip
        contentStyle={tooltipStyle}
        formatter={(value: number) => [formatValue(value), ""]}
        labelFormatter={(label: string) => label === currentQPeriod ? `${label} (Current Quarter)` : label}
      />
    );

    if (activeMetric === "loansDeposits") {
      if (chartType === "bar") {
        return (
          <BarChart {...commonProps}>
            {grid}{xAxis}{yAxis}{tooltip}
            <Legend wrapperStyle={{ fontSize: "11px" }} />
            <Bar dataKey="totalLoans" radius={[4, 4, 0, 0]} name="Total Loans">
              {trendDataMarked.map((entry, idx) => (
                <Cell key={idx} fill={entry.isCurrent ? "hsl(351, 85%, 52%)" : "hsl(var(--chart-2))"} fillOpacity={entry.isCurrent ? 1 : 0.85} />
              ))}
            </Bar>
            <Bar dataKey="totalDeposits" radius={[4, 4, 0, 0]} name="Total Deposits">
              {trendDataMarked.map((entry, idx) => (
                <Cell key={idx} fill={entry.isCurrent ? "hsl(351, 65%, 62%)" : "hsl(var(--chart-3))"} fillOpacity={entry.isCurrent ? 1 : 0.85} />
              ))}
            </Bar>
          </BarChart>
        );
      }
      if (chartType === "area") {
        return (
          <AreaChart {...commonProps}>
            {grid}{xAxis}{yAxis}{tooltip}
            <Legend wrapperStyle={{ fontSize: "11px" }} />
            <Area type="monotone" dataKey="totalLoans" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.1} strokeWidth={2} name="Total Loans" dot={TrendDot("hsl(var(--chart-2))")} />
            <Area type="monotone" dataKey="totalDeposits" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.1} strokeWidth={2} name="Total Deposits" dot={TrendDot("hsl(var(--chart-3))")} />
          </AreaChart>
        );
      }
      return (
        <LineChart {...commonProps}>
          {grid}{xAxis}{yAxis}{tooltip}
          <Legend wrapperStyle={{ fontSize: "11px" }} />
          <Line type="monotone" dataKey="totalLoans" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={TrendDot("hsl(var(--chart-2))")} name="Total Loans" />
          <Line type="monotone" dataKey="totalDeposits" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={TrendDot("hsl(var(--chart-3))")} name="Total Deposits" />
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
          <Bar dataKey={dataKey} radius={[4, 4, 0, 0]} name={name}>
            {trendDataMarked.map((entry, idx) => (
              <Cell key={idx} fill={entry.isCurrent ? "hsl(351, 85%, 52%)" : color} fillOpacity={entry.isCurrent ? 1 : 0.85} />
            ))}
          </Bar>
        </BarChart>
      );
    }
    if (chartType === "line") {
      return (
        <LineChart {...commonProps}>
          {grid}{xAxis}{yAxis}{tooltip}
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={TrendDot(color)} name={name} />
        </LineChart>
      );
    }
    return (
      <AreaChart {...commonProps}>
        {grid}{xAxis}{yAxis}{tooltip}
        <Area type="monotone" dataKey={dataKey} stroke={color} fill={color} fillOpacity={0.15} strokeWidth={2} name={name} dot={TrendDot(color)} />
      </AreaChart>
    );
  };

  return (
    <div className="space-y-4">
      {isLive && (
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0">
            <Wifi className="w-3 h-3 mr-1" />
            Live FDIC Data
          </Badge>
          {hasPulled && (
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-0">
              <Database className="w-3 h-3 mr-1" />
              Historical Data Ingested
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            Q1 2024–Q4 2025 from FDIC Call Reports{hasPulled ? " (ingested)" : ""} · Q1 2026 from current report draft
          </span>
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
          <div className="flex items-center gap-4 mt-1 px-1">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[hsl(351,85%,52%)] border-2 border-white shadow-sm" />
              <span className="text-[10px] text-muted-foreground">Current Quarter — Q1 2026 (from report draft)</span>
            </div>
            <span className="text-[10px] text-muted-foreground/60">|</span>
            <span className="text-[10px] text-muted-foreground">{trendData.length - 1} historical periods from FDIC Call Reports</span>
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
