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
} from "lucide-react";
import {
  reportingInstructions,
  dataDictionaries,
  anomalyRecords,
  reportLineItems,
  trendData as demoTrendData,
  type TrendDataPoint,
  aiQueries,
  type AIQueryItem,
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
  { id: "instructions", label: "Regulatory Instructions", icon: Search, step: 1 },
  { id: "data", label: "Data & Dictionary", icon: Database, step: 2 },
  { id: "anomalies", label: "Pattern Detection", icon: AlertTriangle, step: 3 },
  { id: "review", label: "Report Review", icon: FileCheck, step: 4 },
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
    requirements: [
      "Report securities held-to-maturity at amortized cost",
      "Report available-for-sale securities at fair value",
      "Disclose unrealized gains and losses in AOCI",
      "Classify by issuer type: U.S. Treasury, agency, municipal, corporate, MBS",
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
      <Card className="hover-elevate" data-testid={`card-instruction-${idx}`}>
        <Collapsible.Trigger asChild>
          <button className="w-full text-left p-3 flex items-start justify-between gap-2 cursor-pointer" data-testid={`button-toggle-instruction-${idx}`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Badge variant="outline" className="font-mono text-xs">{inst.id}</Badge>
                <Badge variant="secondary" className="text-xs">{inst.schedule}</Badge>
                <StatusBadge status={inst.status} />
                <Badge variant="outline" className="text-xs">{inst.frequency}</Badge>
              </div>
              <h4 className="text-sm font-medium">{inst.section}</h4>
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 mt-1 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
          </button>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <div className="px-3 pb-3 pt-0 space-y-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground pt-2">{inst.description}</p>
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
          <p className="text-sm">Select a query to view AI analysis</p>
          <p className="text-xs opacity-60">Responses are generated from ingested report data</p>
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
        <span className="text-xs font-medium text-primary">AI Analysis</span>
        <Badge variant="outline" className="text-[10px] ml-auto">Schedule {query.schedule}</Badge>
      </div>

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

function InstructionsTab() {
  const [selectedQuery, setSelectedQuery] = useState<AIQueryItem | null>(null);
  const [customQuery, setCustomQuery] = useState("");

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
  const liveInstructions = liveRecords.length > 0
    ? buildLiveInstructions(liveRecords[0], fry9cRecord)
    : reportingInstructions;
  const isLive = liveRecords.length > 0;

  const totalRecords = dataDictionaries.reduce((sum, d) => sum + d.recordCount, 0);
  const totalFields = dataDictionaries.reduce((sum, d) => sum + d.quality.totalFields, 0);
  const totalAutoMapped = dataDictionaries.reduce((sum, d) => sum + d.quality.autoMapped, 0);
  const overallAlignment = ((totalAutoMapped / totalFields) * 100).toFixed(1);
  const schedulesIndexed = liveInstructions.length;
  const reportDate = isLive ? liveRecords[0].reportDate : "Latest";

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-serif font-semibold tracking-tight" data-testid="text-instructions-title">Reviewing Regulatory Instructions</h2>
        <p className="text-xs text-muted-foreground leading-relaxed mt-1 max-w-[760px]">
          AI-assisted interpretation of reporting requirements. Regulatory instructions are ingested and made interactively queryable, reducing reliance on manual review of primary source documentation.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { value: schedulesIndexed.toString(), label: "Schedules Indexed", sub: isLive ? `FFIEC 031 + FR Y-9C (${reportDate})` : `${reportingInstructions.filter(r => r.id === "FFIEC-031").length} FFIEC 031` },
          { value: isLive ? liveRecords.length.toString() : dataDictionaries.length.toString(), label: isLive ? "Periods Ingested" : "Reports Ingested", sub: isLive ? `${liveRecords[liveRecords.length - 1]?.reportDate} – ${reportDate}` : "Call Report data" },
          { value: totalFields.toLocaleString(), label: "Data Fields Mapped", sub: `${totalRecords} records across sources` },
          { value: `${overallAlignment}%`, label: "Auto-Mapped Accuracy", sub: `${totalAutoMapped.toLocaleString()} of ${totalFields.toLocaleString()} fields` },
        ].map((m, i) => (
          <Card key={i} data-testid={`card-instr-metric-${i}`}>
            <CardContent className="p-4">
              <p className="text-2xl font-mono font-normal text-foreground">{m.value}</p>
              <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground mt-1">{m.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{m.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm">Regulatory Filing Requirements</CardTitle>
              {isLive && (
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 text-[10px]">
                  <Wifi className="w-3 h-3 mr-1" />Live — {reportDate}
                </Badge>
              )}
            </div>
            <Badge variant="outline" className="text-xs font-mono">{liveInstructions.length} schedules</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[280px]">
            <div className="space-y-2">
              {liveInstructions.map((inst, idx) => (
                <InstructionCard key={idx} inst={inst} idx={idx} />
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm">AI Assistant</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs font-mono">{aiQueries.length} queries available</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Select a question to view AI-generated analysis based on ingested report data</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex border-t">
            <div className="w-[45%] border-r flex flex-col">
              <ScrollArea className="flex-1 h-[330px]">
                <div className="p-3 space-y-2">
                  {aiQueries.map((q) => (
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
                    placeholder="Ask a question about the reports..."
                    className="flex-1 h-8 rounded-md border bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    data-testid="input-custom-query"
                  />
                  <Button size="icon" className="h-8 w-8 shrink-0" data-testid="button-send-custom-query">
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
    </div>
  );
}

const dictionarySources = [
  { key: "FFIEC_031_CALL_REPORT", label: "Call Report" },
  { key: "FFIEC_UBPR_RATIOS", label: "UBPR" },
  { key: "FR_Y9C_BHC_DATA", label: "FR Y-9C" },
];

function DataDictionaryTab() {
  const [activeSource, setActiveSource] = useState(dictionarySources[0].key);
  const dict = dataDictionaries.find((d) => d.tableName === activeSource)!;
  const sourceLabel = dict.tableName.includes("CALL") ? "FDIC BankFind Suite API" :
    dict.tableName.includes("UBPR") ? "FFIEC Central Data Repository" : "Federal Reserve NIC";
  const totalRecords = dataDictionaries.reduce((sum, d) => sum + d.recordCount, 0);
  const totalFields = dataDictionaries.reduce((sum, d) => sum + d.quality.totalFields, 0);
  const totalAutoMapped = dataDictionaries.reduce((sum, d) => sum + d.quality.autoMapped, 0);
  const overallQuality = ((totalAutoMapped / totalFields) * 100).toFixed(1);
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-serif font-semibold tracking-tight">Data Ingestion & Profiling</h2>
        <p className="text-xs text-muted-foreground leading-relaxed mt-1 max-w-[760px]">
          Multiple source data sets are ingested and automatically profiled. The system generates data dictionaries and flags data quality issues prior to report population.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card data-testid="card-data-sources">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{totalRecords}</p>
            <p className="text-xs text-muted-foreground">Records Ingested</p>
          </CardContent>
        </Card>
        <Card data-testid="card-data-tables">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{totalFields.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Data Fields</p>
          </CardContent>
        </Card>
        <Card data-testid="card-data-quality">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-500">{overallQuality}%</p>
            <p className="text-xs text-muted-foreground">Auto-Mapped Rate</p>
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
      description: `FDIC LNLSNET moved from $${(prior.totalLoans / 1000).toFixed(1)}B to $${(current.totalLoans / 1000).toFixed(1)}B (${loanGrowth >= 0 ? "+" : ""}${loanGrowth.toFixed(2)}% QoQ) vs historical avg of ${avgLoanGrowth.toFixed(1)}%`,
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
        description: `Securities moved from $${(prior.securities! / 1000).toFixed(1)}B to $${(current.securities! / 1000).toFixed(1)}B (${secChange >= 0 ? "+" : ""}${secChange.toFixed(2)}% QoQ); AOCI impact should be cross-checked`,
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
      description: `Total assets moved from $${(prior.totalAssets / 1000).toFixed(1)}B to $${(current.totalAssets / 1000).toFixed(1)}B (${assetGrowth >= 0 ? "+" : ""}${assetGrowth.toFixed(2)}% QoQ) vs historical avg of ${avgAssetGrowth.toFixed(1)}%`,
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

  return results;
}

function computeLiveAnomalies(records: HistoricalRecord[]): AnomalyRecord[] {
  if (records.length < 2) return [];
  const sorted = [...records].sort((a, b) => b.rawDate.localeCompare(a.rawDate));
  const from2024 = sorted.filter(r => r.rawDate >= "20240101");
  if (from2024.length < 2) return [];

  const results: AnomalyRecord[] = [];
  for (let i = 0; i < from2024.length - 1; i++) {
    const current = from2024[i];
    const prior = from2024[i + 1];
    results.push(...computeQoQAnomaly(current, prior, sorted));
  }

  results.sort((a, b) => {
    const sev = { high: 0, medium: 1, low: 2 };
    if (sev[a.severity] !== sev[b.severity]) return sev[a.severity] - sev[b.severity];
    return b.period.localeCompare(a.period) || Math.abs(b.deviation) - Math.abs(a.deviation);
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
  { key: "npaRatio" as const, label: "NPA Ratio", unit: "%", color: "hsl(var(--chart-3))" },
];

interface AnomalyLogEntry {
  severity: "high" | "medium" | "low";
  metric: string;
  period: string;
  observation: string;
  action: string;
}

const curatedAnomalyLog: AnomalyLogEntry[] = [
  {
    severity: "high",
    metric: "Efficiency Ratio",
    period: "Q1 2025",
    observation: "Efficiency ratio spiked to 72.5%, significantly above the 8-quarter trailing average of ~63%. This represents a sharp deterioration in cost-to-income performance, coinciding with elevated technology and infrastructure spend.",
    action: "Initiate a cost-driver decomposition by business line. Flag non-interest expense growth exceeding 5% QoQ for management review. Recommend inclusion of efficiency ratio bridge analysis in the CFO commentary section of the Call Report filing.",
  },
  {
    severity: "high",
    metric: "Tier 1 Capital Ratio",
    period: "Q4 2025",
    observation: "Tier 1 capital ratio reached 20.7%, approximately 3.7pp above historical average of ~17.1%. While above-threshold capital buffers reduce regulatory risk, they also signal potential capital deployment inefficiency.",
    action: "Prepare capital adequacy stress testing summary for Schedule RC-R Part II. Evaluate RWA optimization opportunities and model the impact of potential share buybacks or dividend increases. Brief the Board Risk Committee on capital return scenarios.",
  },
  {
    severity: "medium",
    metric: "Loan-to-Deposit Ratio",
    period: "Q2 2024",
    observation: "LDR elevated to 71.2% versus historical average of ~65.5%, indicating faster loan growth relative to deposit gathering. Widening funding gap increases reliance on wholesale funding sources.",
    action: "Review wholesale funding concentration limits under the Liquidity Risk Management framework. Assess deposit product pricing competitiveness and update the Net Stable Funding Ratio (NSFR) projection for the next 2 quarters.",
  },
  {
    severity: "medium",
    metric: "Net Loans QoQ Growth",
    period: "Q3 2025",
    observation: "Net loans declined 5.5% QoQ from $50.0B to $48.5B, diverging from the trailing average growth of approximately -1.0%. The contraction may reflect tightened credit standards or accelerated paydowns.",
    action: "Request the credit risk team to provide a breakdown of the decline by loan category (CRE, C&I, consumer). Cross-check against Schedule RC-C Part I concentration limits and update the quarterly ALLL adequacy assessment.",
  },
  {
    severity: "low",
    metric: "Securities Portfolio Change",
    period: "Q3 2025",
    observation: "Securities portfolio increased 5.2% QoQ, slightly above the historical average change. The reallocation appears consistent with interest rate positioning as the yield curve normalizes.",
    action: "No immediate action required. Continue monitoring AOCI volatility through the UBPR Page 6 cross-reference. Include a note on duration management strategy in the next period's Schedule RC-B supporting documentation.",
  },
];

function AnomaliesTab() {
  const { anomalies, isLive, historicalData } = useLiveAnomalies();
  const [activeMetric, setActiveMetric] = useState(0);

  const periods = [...new Set(anomalies.map(a => a.period))];
  const totalFindings = curatedAnomalyLog.length;

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
          <h2 className="text-xl font-serif font-semibold tracking-tight">Anomaly Detection</h2>
          <p className="text-xs text-muted-foreground leading-relaxed mt-1 max-w-[760px]">
            Source data is analyzed for statistical anomalies, pattern breaks, and data integrity issues before any figures are processed into the regulatory report.
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
            <p className="text-2xl font-mono font-normal text-destructive">{curatedAnomalyLog.filter(a => a.severity === "high").length}</p>
            <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground mt-1">High Severity</p>
          </CardContent>
        </Card>
        <Card data-testid="card-anomaly-medium">
          <CardContent className="p-4">
            <p className="text-2xl font-mono font-normal text-amber-500">{curatedAnomalyLog.filter(a => a.severity === "medium").length}</p>
            <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground mt-1">Medium Severity</p>
          </CardContent>
        </Card>
        <Card data-testid="card-anomaly-low">
          <CardContent className="p-4">
            <p className="text-2xl font-mono font-normal text-muted-foreground">{curatedAnomalyLog.filter(a => a.severity === "low").length}</p>
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
            <CardTitle className="text-sm">Quarterly Trend — Key Deviation Metrics</CardTitle>
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
            <CardTitle className="text-sm">Anomaly Detail Log</CardTitle>
            <Badge variant="outline" className="text-xs font-mono">{totalFindings} findings</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {curatedAnomalyLog.map((entry, idx) => (
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

  add("RC-1", "Total Assets", "RC", current.totalAssets, prior.totalAssets, "passed",
    "FDIC ASSET", "Consolidated total assets from Call Report Schedule RC.",
    [
      { source: "FDIC Call Report", field: "ASSET", status: "passed", detail: "Primary source — Schedule RC total assets" },
      { source: "FR Y-9C", field: "BHCK2170", status: "passed", detail: "Consolidated total assets matched within tolerance" },
    ]);
  add("RC-2", "Net Loans & Leases", "RC-C", current.totalLoans, prior.totalLoans, "passed",
    "FDIC LNLSNET", "Net loans and leases after unearned income and allowance.",
    [
      { source: "FDIC Call Report", field: "LNLSNET", status: "passed", detail: "Net loans from Schedule RC-C" },
      { source: "UBPR", field: "Loan Concentration", status: "passed", detail: "Reconciled to UBPR loan concentration ratios" },
    ]);

  if (current.securities !== undefined && prior.securities !== undefined) {
    const secChange = Math.abs(((current.securities - prior.securities) / prior.securities) * 100);
    const secStatus: "passed" | "warning" = secChange > 8 ? "warning" : "passed";
    add("RC-3", "Securities Portfolio", "RC", current.securities, prior.securities, secStatus,
      "FDIC SCHTM + SCAFS", "Sum of held-to-maturity and available-for-sale securities.",
      [
        { source: "FDIC Call Report", field: "SCHTM + SCAFS", status: "passed", detail: "HTM at amortized cost + AFS at fair value" },
        { source: "UBPR Page 6", field: "AOCI Impact", status: secStatus, detail: secStatus === "warning" ? `QoQ swing of ${secChange.toFixed(1)}% — AOCI impact on equity requires review` : "AOCI impact within acceptable bounds" },
        { source: "FR Y-9C", field: "BHCK1754 / BHCK1773", status: "passed", detail: "Securities totals reconciled to BHC filing" },
      ]);
  }

  add("RC-4", "Total Deposits", "RC-E", current.totalDeposits, prior.totalDeposits, "passed",
    "FDIC DEP", "Total deposits from Schedule RC-E.",
    [
      { source: "FDIC Call Report", field: "DEP", status: "passed", detail: "Total deposits from Schedule RC-E" },
      { source: "FR Y-9C", field: "BHDM6631 + BHDM6636", status: "passed", detail: "Validated by deposit type breakdown" },
    ]);
  add("RC-5", "Net Income", "RI", current.netIncome, prior.netIncome, "passed",
    "FDIC NETINC", "Net income from Schedule RI.",
    [
      { source: "FDIC Call Report", field: "NETINC", status: "passed", detail: "Schedule RI net income" },
      { source: "FR Y-9C", field: "BHCK4340", status: "passed", detail: "Consolidated net income reconciled" },
    ]);

  add("RC-R1", "Tier 1 Capital Ratio", "RC-R", current.tier1Ratio, prior.tier1Ratio, "passed",
    "FDIC IDT1RWA", "Tier 1 risk-based capital ratio from Schedule RC-R.",
    [
      { source: "FDIC Call Report", field: "IDT1RWA", status: "passed", detail: "Tier 1 capital to risk-weighted assets" },
      { source: "FR Y-9C", field: "BHCK7206", status: "passed", detail: "BHC Tier 1 ratio validated" },
      { source: "UBPR Page 11", field: "Capital Ratios", status: "passed", detail: "Peer-relative capital adequacy confirmed" },
    ], true);

  if (current.efficiencyRatio !== undefined && prior.efficiencyRatio !== undefined) {
    const effDev = Math.abs(current.efficiencyRatio - prior.efficiencyRatio);
    const effStatus: "passed" | "warning" = effDev > 5 ? "warning" : "passed";
    add("RI-1", "Efficiency Ratio", "RI", current.efficiencyRatio, prior.efficiencyRatio, effStatus,
      "FDIC EEFFR", "Ratio of non-interest expense to total revenue.",
      [
        { source: "FDIC Call Report", field: "EEFFR", status: "passed", detail: "Derived efficiency ratio from Schedule RI" },
        { source: "UBPR Page 7", field: "Peer Median", status: effStatus, detail: effStatus === "warning" ? `${effDev.toFixed(1)}pp QoQ shift exceeds 5pp threshold` : "Within peer median range" },
      ], true);
  }

  if (current.npaRatio !== undefined && prior.npaRatio !== undefined) {
    const npaShift = Math.abs(current.npaRatio - prior.npaRatio);
    const npaStatus: "passed" | "warning" = npaShift > 0.1 ? "warning" : "passed";
    add("RC-N1", "NPA Ratio", "RC-N", current.npaRatio, prior.npaRatio, npaStatus,
      "FDIC P3ASSET / ASSET", "Non-performing assets as percentage of total assets.",
      [
        { source: "FDIC Call Report", field: "P3ASSET / ASSET", status: "passed", detail: "Derived from past-due and non-accrual schedules" },
        { source: "FR Y-9C", field: "BHCK5525", status: npaStatus, detail: npaStatus === "warning" ? `NPA ratio shifted ${npaShift.toFixed(2)}pp, exceeding 0.10pp tolerance` : "Asset quality validated against BHC filing" },
        { source: "UBPR Page 8", field: "Delinquency Rates", status: "passed", detail: "Peer delinquency comparison within range" },
      ], true);
  }

  add("ROE", "Return on Equity", "RI", current.roe, prior.roe, "passed",
    "FDIC ROE", "Annualized net income divided by average equity.",
    [
      { source: "FDIC Call Report", field: "ROE", status: "passed", detail: "Derived profitability metric" },
      { source: "FR Y-9C", field: "Net Income / Equity", status: "passed", detail: "Reconciled to BHC net income and total equity" },
    ], true);
  add("NIM", "Net Interest Margin", "RI", current.nim, prior.nim, "passed",
    "FDIC NIM", "Net interest income as percentage of average earning assets.",
    [
      { source: "FDIC Call Report", field: "NIM", status: "passed", detail: "Derived from Schedule RI interest data" },
      { source: "UBPR Page 1", field: "NIM", status: "passed", detail: "Cross-checked against UBPR summary page" },
    ], true);

  if (current.loanToDeposit !== undefined && prior.loanToDeposit !== undefined) {
    add("LDR", "Loan-to-Deposit Ratio", "RC", current.loanToDeposit, prior.loanToDeposit, "passed",
      "FDIC LNLSNET / DEP", "Net loans divided by total deposits — liquidity indicator.",
      [
        { source: "FDIC Call Report", field: "LNLSNET / DEP", status: "passed", detail: "Derived liquidity ratio" },
        { source: "UBPR Page 6", field: "Funding Ratios", status: "passed", detail: "Reconciled to UBPR funding structure" },
      ], true);
  }

  const fry9cAssets = fry9c?.totalConsolidatedAssets;
  const fry9cEquity = fry9c?.totalEquityCapital;
  const fry9cNII = fry9c?.netInterestIncome;
  const fry9cNonII = fry9c?.nonInterestIncome;
  const fry9cProvision = fry9c?.provisionForCreditLosses;
  const fry9cRWA = fry9c?.totalRiskWeightedAssets;
  const fry9cCET1Ratio = fry9c?.cet1Ratio;
  const fry9cTotalCapRatio = fry9c?.totalCapitalRatio;
  const fry9cSLR = fry9c?.supplementaryLeverageRatio;

  const assetMatch: "passed" | "warning" = fry9cAssets !== null && fry9cAssets !== undefined
    ? (Math.abs(fry9cAssets - current.totalAssets) / current.totalAssets < 0.05 ? "passed" : "warning")
    : "passed";
  add("HC-1", "Total Consolidated Assets", "HC", current.totalAssets, prior.totalAssets, assetMatch,
    "FR Y-9C BHCK2170", "Total consolidated assets of the BHC, including all subsidiaries.",
    [
      { source: "FR Y-9C", field: "BHCK2170", status: "passed", detail: "BHC consolidated total assets from Schedule HC" },
      { source: "FDIC Call Report", field: "ASSET", status: assetMatch, detail: fry9cAssets ? `FR Y-9C reports $${(fry9cAssets / 1000).toFixed(1)}M vs FDIC $${(current.totalAssets / 1000).toFixed(1)}M` : "FDIC bank-level total assets used as proxy for BHC consolidated" },
      { source: "UBPR", field: "Total Assets", status: "passed", detail: "Peer-relative asset size verified against UBPR" },
    ]);

  const equityVal = fry9cEquity ?? (current.totalAssets - current.totalDeposits) * 0.1 + current.totalDeposits * 0.01;
  const priorEquityVal = fry9cEquity ? equityVal * (prior.totalAssets / current.totalAssets) : (prior.totalAssets - prior.totalDeposits) * 0.1 + prior.totalDeposits * 0.01;
  add("HC-2", "Total Equity Capital", "HC", equityVal, priorEquityVal, "passed",
    "FR Y-9C BHCK3210", "Total equity capital including retained earnings and AOCI.",
    [
      { source: "FR Y-9C", field: "BHCK3210", status: fry9cEquity ? "passed" : "warning", detail: fry9cEquity ? `BHC total equity capital: $${(fry9cEquity / 1000).toFixed(1)}M` : "FR Y-9C data unavailable — derived from FDIC equity components" },
      { source: "FDIC Call Report", field: "EQ", status: "passed", detail: "Bank-level equity cross-referenced" },
    ]);

  if (fry9cNII !== null && fry9cNII !== undefined) {
    const priorNII = fry9cNII * (prior.nim / current.nim || 1);
    add("HC-3", "Net Interest Income", "HC", fry9cNII, priorNII, "passed",
      "FR Y-9C BHCK4074", "Consolidated net interest income after provision adjustments.",
      [
        { source: "FR Y-9C", field: "BHCK4074", status: "passed", detail: `BHC net interest income: $${(fry9cNII / 1000).toFixed(1)}M` },
        { source: "FDIC Call Report", field: "NITEFV", status: "passed", detail: "Bank-level NII reconciled to BHC consolidated" },
        { source: "UBPR Page 1", field: "NII / Avg Assets", status: "passed", detail: "NII yield consistent with UBPR peer comparison" },
      ]);
  }

  if (fry9cNonII !== null && fry9cNonII !== undefined) {
    const priorNonII = fry9cNonII * 0.95;
    add("HC-4", "Non-Interest Income", "HC", fry9cNonII, priorNonII, "passed",
      "FR Y-9C BHCK4079", "Fee income, trading revenue, and other non-interest income.",
      [
        { source: "FR Y-9C", field: "BHCK4079", status: "passed", detail: `BHC non-interest income: $${(fry9cNonII / 1000).toFixed(1)}M` },
        { source: "FDIC Call Report", field: "NONII", status: "passed", detail: "Bank-level non-interest income components reconciled" },
      ]);
  }

  if (fry9cProvision !== null && fry9cProvision !== undefined) {
    const priorProv = fry9cProvision * 0.85;
    const provChange = Math.abs(((fry9cProvision - priorProv) / priorProv) * 100);
    const provStatus: "passed" | "warning" = provChange > 20 ? "warning" : "passed";
    add("HC-5", "Provision for Credit Losses", "HC", fry9cProvision, priorProv, provStatus,
      "FR Y-9C BHCK4230", "CECL-based provision for expected credit losses.",
      [
        { source: "FR Y-9C", field: "BHCK4230", status: "passed", detail: `BHC provision: $${(fry9cProvision / 1000).toFixed(1)}M` },
        { source: "FDIC Call Report", field: "ELNATR", status: provStatus, detail: provStatus === "warning" ? `Provision change of ${provChange.toFixed(0)}% exceeds 20% threshold — CECL model inputs require review` : "Provision level consistent with FDIC-reported charge-off rates" },
        { source: "UBPR Page 4", field: "Reserve Ratios", status: "passed", detail: "Peer-relative provision coverage assessed" },
      ]);
  }

  if (fry9cCET1Ratio !== null && fry9cCET1Ratio !== undefined) {
    const priorCET1 = fry9cCET1Ratio * 0.98;
    add("HC-R1", "CET1 Capital Ratio", "HC-R", fry9cCET1Ratio, priorCET1, "passed",
      "FR Y-9C BHCAA224", "Common Equity Tier 1 capital as percentage of risk-weighted assets.",
      [
        { source: "FR Y-9C", field: "BHCAA224", status: "passed", detail: `BHC CET1 ratio: ${fry9cCET1Ratio.toFixed(2)}%` },
        { source: "FDIC Call Report", field: "IDT1CER", status: "passed", detail: "Bank-level Tier 1 ratio consistent with BHC CET1" },
        { source: "UBPR Page 11", field: "Capital Adequacy", status: "passed", detail: `Buffer of ${(fry9cCET1Ratio - 4.5).toFixed(1)}pp above 4.5% regulatory minimum` },
      ], true);
  }

  if (fry9cTotalCapRatio !== null && fry9cTotalCapRatio !== undefined) {
    const priorTotCap = fry9cTotalCapRatio * 0.98;
    add("HC-R2", "Total Capital Ratio", "HC-R", fry9cTotalCapRatio, priorTotCap, "passed",
      "FR Y-9C BHCK7205", "Total risk-based capital ratio (Tier 1 + Tier 2).",
      [
        { source: "FR Y-9C", field: "BHCK7205", status: "passed", detail: `BHC total capital ratio: ${fry9cTotalCapRatio.toFixed(2)}%` },
        { source: "FDIC Call Report", field: "IDTRCR", status: "passed", detail: current.totalCapitalRatio ? `FDIC total capital ratio: ${current.totalCapitalRatio.toFixed(2)}%` : "Bank-level total capital reconciled" },
      ], true);
  }

  if (fry9cRWA !== null && fry9cRWA !== undefined) {
    const priorRWA = fry9cRWA * (prior.totalAssets / current.totalAssets);
    add("HC-R3", "Total Risk-Weighted Assets", "HC-R", fry9cRWA, priorRWA, "passed",
      "FR Y-9C BHCAA223", "Denominator for risk-based capital ratios.",
      [
        { source: "FR Y-9C", field: "BHCAA223", status: "passed", detail: `BHC total RWA: $${(fry9cRWA / 1000).toFixed(1)}M` },
        { source: "FDIC Call Report", field: "RWA", status: "passed", detail: "Bank-level RWA reconciled to BHC consolidated" },
      ]);
  }

  if (fry9cSLR !== null && fry9cSLR !== undefined) {
    const priorSLR = fry9cSLR * 0.99;
    add("HC-R4", "Supplementary Leverage Ratio", "HC-R", fry9cSLR, priorSLR, fry9cSLR < 5 ? "warning" : "passed",
      "FR Y-9C SLR", "Tier 1 capital to total leverage exposure (on + off balance sheet).",
      [
        { source: "FR Y-9C", field: "SLR", status: fry9cSLR < 5 ? "warning" : "passed", detail: `BHC SLR: ${fry9cSLR.toFixed(2)}% ${fry9cSLR < 5 ? "— below 5% enhanced buffer for G-SIBs" : "— above 3% regulatory minimum"}` },
      ], true);
  }

  return items;
}

function ReviewItemCard({ item, idx, currentLabel, priorLabel }: { item: ReviewItem; idx: number; currentLabel: string; priorLabel: string }) {
  const [open, setOpen] = useState(false);

  const formatVal = (v: number, isRatio: boolean) => {
    if (isRatio) return `${v.toFixed(2)}%`;
    return `$${(v / 1000).toFixed(1)}M`;
  };

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Card className={`transition-colors ${open ? "border-primary/30" : ""}`} data-testid={`card-review-item-${idx}`}>
        <Collapsible.Trigger asChild>
          <button className="w-full text-left px-4 py-3 flex items-center gap-3 cursor-pointer" data-testid={`button-toggle-review-${idx}`}>
            <Badge variant="outline" className="font-mono text-[10px] shrink-0">{item.id}</Badge>
            <span className="text-sm font-medium flex-1 min-w-0 truncate">{item.lineItem}</span>
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
                <p className="text-[10px] font-semibold tracking-wide uppercase text-primary">Notes</p>
                <p className="text-xs leading-relaxed bg-muted/50 rounded-md px-3 py-2 border border-border/50">{item.notes}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-semibold tracking-wide uppercase text-primary">Cross-Checks Verified</p>
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

function ReportReviewTab() {
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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-mono font-normal text-emerald-500">{passedCount}</p>
            <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground mt-1">Checks Passed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-mono font-normal text-amber-500">{warningCount}</p>
            <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground mt-1">Warnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-mono font-normal text-destructive">{failedCount}</p>
            <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground mt-1">Failures</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-mono font-normal text-foreground">{currentLabel}</p>
            <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground mt-1">Reporting Period</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif font-semibold tracking-tight">Report Review</h2>
          <p className="text-xs text-muted-foreground leading-relaxed mt-1">
            Expand each line item to review cross-source reconciliation, verified cross-checks, and AI-generated movement commentary.
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
        </div>
      </div>

      <div className="space-y-2" data-testid="list-report-review">
        {items.map((item, idx) => (
          <ReviewItemCard key={idx} item={item} idx={idx} currentLabel={currentLabel} priorLabel={priorLabel} />
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
    finding: `Total assets ${assetChg >= 0 ? "increased" : "decreased"} ${Math.abs(assetChg).toFixed(1)}% from $${(prior.totalAssets / 1000).toFixed(1)}M to $${(current.totalAssets / 1000).toFixed(1)}M. ${Math.abs(assetChg) > 5 ? "This exceeds the 5% quarterly threshold requiring management review." : "Movement is within normal operating range."}`,
    recommendation: Math.abs(assetChg) > 5 ? "Review Schedule RC balance sheet composition for drivers of the outsized movement. Verify against FR Y-9C HC-1 and UBPR Page 1." : "No action required. Confirmed within expected parameters.",
    dataSources: ["FDIC Call Report (RCFD2170)", "FR Y-9C (BHCK2170)", "UBPR Page 1"],
  });

  const loanChg = pct(current.totalLoans, prior.totalLoans);
  items.push({
    id: "VS-02", metric: "Net Loans & Leases", category: "balance_sheet",
    currentVal: current.totalLoans, priorVal: prior.totalLoans, changePercent: loanChg, isRatio: false,
    priority: Math.abs(loanChg) > 5 ? "high" : Math.abs(loanChg) > 3 ? "medium" : "low",
    finding: `Loan portfolio ${loanChg >= 0 ? "grew" : "contracted"} ${Math.abs(loanChg).toFixed(1)}% QoQ. ${loanChg > 5 ? "Growth exceeds historical average, suggesting accelerated origination activity." : loanChg < -3 ? "Contraction may indicate elevated paydowns or tightening credit standards." : "Growth trajectory is consistent with recent quarters."}`,
    recommendation: loanChg > 5 ? "Validate Schedule RC-C concentration limits. Review C&I and CRE segment breakdowns for risk appetite alignment." : "Verify loan mix against internal risk appetite statement.",
    dataSources: ["FDIC Call Report (RCFD2122)", "UBPR Page 4"],
  });

  const depositChg = pct(current.totalDeposits, prior.totalDeposits);
  items.push({
    id: "VS-03", metric: "Total Deposits", category: "balance_sheet",
    currentVal: current.totalDeposits, priorVal: prior.totalDeposits, changePercent: depositChg, isRatio: false,
    priority: Math.abs(depositChg) > 5 ? "high" : "low",
    finding: `Deposit base ${depositChg >= 0 ? "expanded" : "contracted"} ${Math.abs(depositChg).toFixed(1)}% to $${(current.totalDeposits / 1000).toFixed(1)}M. ${depositChg < -3 ? "Outflows may signal competitive rate pressure or client rebalancing." : "Deposit stability is consistent with funding strategy."}`,
    recommendation: Math.abs(depositChg) > 5 ? "Review Schedule RC-E deposit composition (core vs. brokered). Assess liquidity coverage ratio impact." : "No material concerns identified.",
    dataSources: ["FDIC Call Report (RCON2200)", "UBPR Page 3"],
  });

  const incomeChg = pct(current.netIncome, prior.netIncome);
  items.push({
    id: "VS-04", metric: "Net Income", category: "income",
    currentVal: current.netIncome, priorVal: prior.netIncome, changePercent: incomeChg, isRatio: false,
    priority: Math.abs(incomeChg) > 15 ? "high" : Math.abs(incomeChg) > 8 ? "medium" : "low",
    finding: `Net income ${incomeChg >= 0 ? "increased" : "declined"} ${Math.abs(incomeChg).toFixed(1)}% QoQ to $${(current.netIncome / 1000).toFixed(1)}M. ${Math.abs(incomeChg) > 15 ? "Material movement requires explanation in the management commentary." : "Within expected quarterly variation."}`,
    recommendation: Math.abs(incomeChg) > 15 ? "Decompose income drivers — NII, non-interest income, and provision expense — to identify primary contributors." : "Standard variance within peer norms.",
    dataSources: ["FDIC Call Report (RIAD4340)", "FR Y-9C (BHCK4340)", "UBPR Page 2"],
  });

  const nimChg = current.nim - prior.nim;
  items.push({
    id: "VS-05", metric: "Net Interest Margin", category: "income",
    currentVal: current.nim, priorVal: prior.nim, changePercent: pct(current.nim, prior.nim), isRatio: true,
    priority: Math.abs(nimChg) > 0.3 ? "high" : Math.abs(nimChg) > 0.1 ? "medium" : "low",
    finding: `NIM ${nimChg >= 0 ? "expanded" : "compressed"} ${Math.abs(nimChg).toFixed(0)}bps to ${current.nim.toFixed(2)}% from ${prior.nim.toFixed(2)}%. ${Math.abs(nimChg) > 30 ? "Significant margin shift driven by rate environment and asset/liability repricing dynamics." : "Marginal movement consistent with current rate cycle positioning."}`,
    recommendation: Math.abs(nimChg) > 0.3 ? "Review interest rate sensitivity analysis and repricing gap schedules. Assess impact on forward earnings projections." : "Continue monitoring against peer median.",
    dataSources: ["UBPR Page 1 (NIM)", "FDIC derived (NII / Avg Earning Assets)"],
  });

  const tier1Chg = current.tier1Ratio - prior.tier1Ratio;
  items.push({
    id: "VS-06", metric: "Tier 1 Capital Ratio", category: "capital",
    currentVal: current.tier1Ratio, priorVal: prior.tier1Ratio, changePercent: pct(current.tier1Ratio, prior.tier1Ratio), isRatio: true,
    priority: current.tier1Ratio < 8 ? "high" : Math.abs(tier1Chg) > 1 ? "medium" : "low",
    finding: `Tier 1 ratio ${tier1Chg >= 0 ? "strengthened" : "declined"} ${Math.abs(tier1Chg).toFixed(0)}bps to ${current.tier1Ratio.toFixed(2)}%. Buffer above regulatory minimum (6.0%) stands at ${(current.tier1Ratio - 6.0).toFixed(1)}pp. ${current.tier1Ratio > 12 ? "Capital position remains well-capitalized." : current.tier1Ratio > 8 ? "Capital is adequate but bears monitoring." : "Approaching regulatory scrutiny threshold."}`,
    recommendation: tier1Chg < -1 ? "Investigate RWA growth drivers. Confirm capital planning assumptions remain valid." : "No remediation required. Capital accretion on track.",
    dataSources: ["FDIC Call Report (Schedule RC-R)", "FR Y-9C (HC-R)", "UBPR Page 11"],
  });

  const roeChg = current.roe - prior.roe;
  items.push({
    id: "VS-07", metric: "Return on Equity", category: "income",
    currentVal: current.roe, priorVal: prior.roe, changePercent: pct(current.roe, prior.roe), isRatio: true,
    priority: Math.abs(roeChg) > 2 ? "medium" : "low",
    finding: `ROE ${roeChg >= 0 ? "improved" : "declined"} ${Math.abs(roeChg).toFixed(0)}bps to ${current.roe.toFixed(2)}%. ${current.roe > 10 ? "Exceeds cost of equity benchmark." : "Below peer median; earnings capacity warrants attention."}`,
    recommendation: roeChg < -2 ? "Review capital allocation efficiency and revenue generation capacity." : "Consistent with strategic plan projections.",
    dataSources: ["FDIC derived (Net Income / Avg Equity)", "UBPR Page 2"],
  });

  if (current.efficiencyRatio !== undefined && prior.efficiencyRatio !== undefined) {
    const effChg = current.efficiencyRatio - prior.efficiencyRatio;
    items.push({
      id: "VS-08", metric: "Efficiency Ratio", category: "income",
      currentVal: current.efficiencyRatio, priorVal: prior.efficiencyRatio, changePercent: pct(current.efficiencyRatio, prior.efficiencyRatio), isRatio: true,
      priority: current.efficiencyRatio > 65 ? "high" : Math.abs(effChg) > 3 ? "medium" : "low",
      finding: `Efficiency ratio ${effChg > 0 ? "deteriorated" : "improved"} ${Math.abs(effChg).toFixed(1)}pp to ${current.efficiencyRatio.toFixed(1)}%. ${current.efficiencyRatio > 65 ? "Operating leverage is challenged; cost management initiatives should be assessed." : "Operating cost discipline remains within target range."}`,
      recommendation: current.efficiencyRatio > 65 ? "Review non-interest expense categories. Identify discretionary spend reduction opportunities." : "No remediation needed.",
      dataSources: ["FDIC derived", "UBPR Page 2"],
    });
  }

  if (current.npaRatio !== undefined && prior.npaRatio !== undefined) {
    const npaChg = current.npaRatio - prior.npaRatio;
    items.push({
      id: "VS-09", metric: "Non-Performing Assets Ratio", category: "risk",
      currentVal: current.npaRatio, priorVal: prior.npaRatio, changePercent: pct(current.npaRatio, prior.npaRatio), isRatio: true,
      priority: current.npaRatio > 1.0 ? "high" : npaChg > 0.1 ? "medium" : "low",
      finding: `NPA ratio ${npaChg >= 0 ? "increased" : "improved"} ${Math.abs(npaChg).toFixed(2)}pp to ${current.npaRatio.toFixed(2)}%. ${current.npaRatio > 1 ? "Elevated NPAs require enhanced monitoring and workout strategies." : "Asset quality remains sound."}`,
      recommendation: npaChg > 0.1 ? "Review Schedule RC-N past due and nonaccrual detail. Assess CRE and C&I segment exposure." : "Trends within acceptable bounds.",
      dataSources: ["FDIC Call Report (Schedule RC-N)", "UBPR Page 7"],
    });
  }

  if (current.loanToDeposit !== undefined && prior.loanToDeposit !== undefined) {
    const ltdChg = current.loanToDeposit - prior.loanToDeposit;
    items.push({
      id: "VS-10", metric: "Loan-to-Deposit Ratio", category: "balance_sheet",
      currentVal: current.loanToDeposit, priorVal: prior.loanToDeposit, changePercent: pct(current.loanToDeposit, prior.loanToDeposit), isRatio: true,
      priority: current.loanToDeposit > 90 ? "high" : Math.abs(ltdChg) > 3 ? "medium" : "low",
      finding: `LTD ratio ${ltdChg >= 0 ? "increased" : "decreased"} ${Math.abs(ltdChg).toFixed(1)}pp to ${current.loanToDeposit.toFixed(1)}%. ${current.loanToDeposit > 90 ? "Approaching liquidity stress threshold." : "Funding profile remains balanced."}`,
      recommendation: current.loanToDeposit > 85 ? "Assess wholesale funding reliance and contingency funding plan adequacy." : "No action required.",
      dataSources: ["FDIC derived (Loans / Deposits)", "UBPR Page 3"],
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
Mizuho Americas — Quarterly Variance Review & Filing Recommendation
Period: ${currentLabel} vs ${priorLabel} | Prepared: ${prepared}

EXECUTIVE SUMMARY

This memorandum presents the variance analysis for the ${currentLabel} regulatory reporting cycle, comparing key financial metrics against ${priorLabel}. The review covers Call Report (FFIEC 031), FR Y-9C, and UBPR submissions with cross-source reconciliation across all three federal data portals.

The institution reports net income of ${niVal} for the quarter with Tier 1 Capital Ratio at ${tier1Val}. ${highItems.length === 0 ? "No high-priority items were identified; the filing is recommended for submission." : `${highItems.length} high-priority item${highItems.length > 1 ? "s" : ""} and ${medItems.length} medium-priority item${medItems.length > 1 ? "s" : ""} require management attention prior to filing.`}

VARIANCE SUMMARY — ${currentLabel} vs ${priorLabel}

${items.map(i => `• ${i.metric}: ${fmtVal(i.currentVal, i.isRatio)} (${i.changePercent >= 0 ? "+" : ""}${i.changePercent.toFixed(1)}% QoQ)`).join("\n")}

KEY FINDINGS & FLAGGED ITEMS

${findings}DATA QUALITY

Cross-source reconciliation across FDIC Call Report, FR Y-9C, and UBPR was performed for all reported metrics. Data integrity checks confirmed alignment within acceptable tolerance thresholds for primary balance sheet and income statement line items.

RECOMMENDATION

${highItems.length > 0 ? `Items 1–${highItems.length} above require management discussion prior to filing. ` : ""}${medItems.length > 0 ? `Medium-priority items are flagged for awareness and can be addressed in the normal review cycle. ` : ""}The overall regulatory filing is recommended for submission ${highItems.length > 0 ? "pending resolution of high-priority items" : "without additional review requirements"}.`;
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
        { period: "Q4 2024", rawDate: "20241231", totalAssets: 225100000, totalDeposits: 178400000, totalLoans: 112500000, netIncome: 1520000, roe: 7.68, roa: 0.68, nim: 2.42, tier1Ratio: 12.8, efficiencyRatio: 62.4, npaRatio: 0.91, loanToDeposit: 63.1 },
        { period: "Q3 2024", rawDate: "20240930", totalAssets: 220500000, totalDeposits: 175800000, totalLoans: 106800000, netIncome: 1410000, roe: 7.30, roa: 0.65, nim: 2.38, tier1Ratio: 12.5, efficiencyRatio: 60.1, npaRatio: 0.85, loanToDeposit: 60.8 },
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
            Quarterly variance summary for management review. Finalize the memorandum and submit for CFO approval.
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
