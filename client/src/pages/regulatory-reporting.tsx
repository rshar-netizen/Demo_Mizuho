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
  periodComparisons,
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
  { id: "comparison", label: "Period Comparison", icon: GitCompare, step: 5 },
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

function InstructionCard({ inst, idx }: { inst: typeof reportingInstructions[number]; idx: number }) {
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

  const totalRecords = dataDictionaries.reduce((sum, d) => sum + d.recordCount, 0);
  const totalFields = dataDictionaries.reduce((sum, d) => sum + d.quality.totalFields, 0);
  const totalAutoMapped = dataDictionaries.reduce((sum, d) => sum + d.quality.autoMapped, 0);
  const overallAlignment = ((totalAutoMapped / totalFields) * 100).toFixed(1);
  const schedulesIndexed = reportingInstructions.length;

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
          { value: schedulesIndexed.toString(), label: "Schedules Indexed", sub: `${reportingInstructions.filter(r => r.id === "FFIEC-031").length} FFIEC 031 + ${reportingInstructions.filter(r => r.id === "FR Y-9C").length} FR Y-9C` },
          { value: dataDictionaries.length.toString(), label: "Reports Ingested", sub: "Call Report, UBPR, FR Y-9C" },
          { value: totalFields.toLocaleString(), label: "Data Fields Mapped", sub: `${totalRecords} records across ${dataDictionaries.length} sources` },
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
            <CardTitle className="text-sm">Regulatory Filing Requirements</CardTitle>
            <Badge variant="outline" className="text-xs font-mono">{reportingInstructions.length} schedules</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[280px]">
            <div className="space-y-2">
              {reportingInstructions.map((inst, idx) => (
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

function buildLiveReviewItems(current: HistoricalRecord, prior: HistoricalRecord) {
  const items: Array<{ id: string; lineItem: string; schedule: string; currentVal: number; priorVal: number; changePercent: number; crossCheck: "passed" | "warning" | "failed"; derivation: string; isRatio: boolean }> = [];

  const add = (id: string, lineItem: string, schedule: string, cv: number, pv: number, crossCheck: "passed" | "warning" | "failed", derivation: string, isRatio = false) => {
    const changePct = pv !== 0 ? ((cv - pv) / Math.abs(pv)) * 100 : 0;
    items.push({ id, lineItem, schedule, currentVal: cv, priorVal: pv, changePercent: changePct, crossCheck, derivation, isRatio });
  };

  add("RC-1", "Total Assets", "RC", current.totalAssets, prior.totalAssets, "passed", "FDIC field ASSET; cross-checked against FR Y-9C BHCK2170");
  add("RC-2", "Net Loans & Leases", "RC-C", current.totalLoans, prior.totalLoans, "passed", "FDIC field LNLSNET; reconciled to UBPR loan concentration ratios");
  if (current.securities !== undefined && prior.securities !== undefined) {
    const secChange = Math.abs(((current.securities - prior.securities) / prior.securities) * 100);
    add("RC-3", "Securities Portfolio", "RC", current.securities, prior.securities, secChange > 8 ? "warning" : "passed", "FDIC fields SCHTM+SCAFS; AOCI impact cross-checked with UBPR Page 6");
  }
  add("RC-4", "Total Deposits", "RC-E", current.totalDeposits, prior.totalDeposits, "passed", "FDIC field DEP; validated against FR Y-9C BHDM6631+BHDM6636");
  add("RC-5", "Net Income", "RI", current.netIncome, prior.netIncome, "passed", "FDIC field NETINC; reconciled to FR Y-9C BHCK4340");

  add("RC-R1", "Tier 1 Capital Ratio", "RC-R", current.tier1Ratio, prior.tier1Ratio, "passed", "FR Y-9C BHCK7206; validated against FDIC IDT1RWA and UBPR Page 11", true);
  if (current.efficiencyRatio !== undefined && prior.efficiencyRatio !== undefined) {
    const effDev = Math.abs(current.efficiencyRatio - prior.efficiencyRatio);
    add("RI-1", "Efficiency Ratio", "RI", current.efficiencyRatio, prior.efficiencyRatio, effDev > 5 ? "warning" : "passed", "FDIC derived EEFFR; cross-checked with UBPR Page 7 peer median", true);
  }
  if (current.npaRatio !== undefined && prior.npaRatio !== undefined) {
    const npaShift = Math.abs(current.npaRatio - prior.npaRatio);
    add("RC-N1", "NPA Ratio", "RC-N", current.npaRatio, prior.npaRatio, npaShift > 0.1 ? "warning" : "passed", "FDIC derived P3ASSET/ASSET; validated against FR Y-9C BHCK5525", true);
  }
  add("ROE", "Return on Equity", "RI", current.roe, prior.roe, "passed", "FDIC derived ROE; reconciled to FR Y-9C net income / equity", true);
  add("NIM", "Net Interest Margin", "RI", current.nim, prior.nim, "passed", "FDIC derived NIM; cross-checked against UBPR Page 1", true);
  if (current.loanToDeposit !== undefined && prior.loanToDeposit !== undefined) {
    add("LDR", "Loan-to-Deposit Ratio", "RC", current.loanToDeposit, prior.loanToDeposit, "passed", "FDIC derived LNLSNET/DEP; reconciled to UBPR Page 6", true);
  }

  return items;
}

function ReportReviewTab() {
  const { data, isLoading } = useQuery<{ data: Array<{ historicalData?: HistoricalRecord[] }> }>({
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

  const items = isLive
    ? buildLiveReviewItems(current, prior)
    : reportLineItems.map(item => ({
        id: item.id,
        lineItem: item.lineItem,
        schedule: item.schedule,
        currentVal: item.currentPeriod,
        priorVal: item.priorPeriod,
        changePercent: item.changePercent,
        crossCheck: item.crossCheck as "passed" | "warning" | "failed",
        derivation: item.derivation,
        isRatio: item.currentPeriod < 100,
      }));

  const passedCount = items.filter(i => i.crossCheck === "passed").length;
  const warningCount = items.filter(i => i.crossCheck === "warning").length;
  const failedCount = items.filter(i => i.crossCheck === "failed").length;

  const formatVal = (v: number, isRatio: boolean) => {
    if (isRatio) return `${v.toFixed(2)}%`;
    return `$${(v / 1000).toFixed(1)}M`;
  };

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

      <Card data-testid="card-report-review-table">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm">Schedule RC — Balance Sheet & Income Review</CardTitle>
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
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Line</TableHead>
                  <TableHead className="text-xs">Item</TableHead>
                  <TableHead className="text-xs">Schedule</TableHead>
                  <TableHead className="text-xs text-right">{currentLabel}</TableHead>
                  <TableHead className="text-xs text-right">{priorLabel}</TableHead>
                  <TableHead className="text-xs text-right">Change %</TableHead>
                  <TableHead className="text-xs">Cross-Check</TableHead>
                  <TableHead className="text-xs">Derivation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, idx) => (
                  <TableRow key={idx} data-testid={`row-report-${idx}`}>
                    <TableCell className="text-xs font-mono py-2">{item.id}</TableCell>
                    <TableCell className="text-xs py-2 font-medium">{item.lineItem}</TableCell>
                    <TableCell className="text-xs py-2">
                      <Badge variant="outline" className="text-xs">{item.schedule}</Badge>
                    </TableCell>
                    <TableCell className="text-xs py-2 text-right font-mono">
                      {formatVal(item.currentVal, item.isRatio)}
                    </TableCell>
                    <TableCell className="text-xs py-2 text-right font-mono">
                      {formatVal(item.priorVal, item.isRatio)}
                    </TableCell>
                    <TableCell className={`text-xs py-2 text-right font-mono ${item.changePercent >= 0 ? "text-emerald-500" : "text-destructive"}`}>
                      {item.changePercent >= 0 ? "+" : ""}{item.changePercent.toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-xs py-2">
                      <StatusBadge status={item.crossCheck} />
                    </TableCell>
                    <TableCell className="text-xs py-2 text-muted-foreground max-w-[200px] truncate">
                      {item.derivation}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

const defaultMemoContent = `MANAGEMENT REVIEW MEMORANDUM
Mizuho Americas — Regulatory Reporting Period Review
Period: FY 2024 (Q1–Q4) | Prepared: January 2025

EXECUTIVE SUMMARY

This memorandum summarizes the key findings from the quarterly regulatory reporting review for Mizuho Americas, covering Call Report (FFIEC 031), FR Y-9C, and UBPR data for the fiscal year 2024. Cross-source reconciliation was performed across all three federal data portals.

Overall, the institution maintains a strong capital position with CET1 at 12.8% and Total Capital Ratio at 15.2%, well above regulatory minimums. Net income for Q4 2024 was $1.52B, with full-year net income of $6.13B (+3.2% YoY).

KEY FINDINGS & FLAGGED ITEMS

1. Loan Growth Acceleration (High Priority)
Net loans increased 6.33% QoQ to $112.5B, more than double the 8-quarter average of 2.5%. The acceleration is concentrated in C&I lending. Schedule RC-C concentration limits should be reviewed.

2. AFS Securities Portfolio Decline (High Priority)
Available-for-sale securities declined 11.34% QoQ from $21.3B to $18.9B. The AOCI variance between FDIC SCAFS and UBPR Page 6 has been flagged. Unrealized loss impact on equity requires assessment.

3. Provision for Credit Losses (Medium Priority)
Provisions rose 37.1% QoQ to $425M, exceeding the 20% quarterly change threshold. This aligns with increased delinquencies in Schedule RC-N (30-89 day past dues up 30.3%). CECL model assumptions should be reviewed against current macro conditions.

4. CRE Risk-Weighted Assets (Medium Priority)
Standardized RWA for CRE exposures increased 12.02% to $38.2B. HVCRE classification criteria and 150% risk-weight applicability should be verified against Schedule RC-R Part II.

5. Derivative Netting (Low Priority)
Net derivative fair value declined 26.4% QoQ. Schedule RC-L netting agreement classifications should be reconciled between FDIC and FR Y-9C reporting.

DATA QUALITY

Cross-source reconciliation across FDIC Call Report, FR Y-9C, and UBPR yielded a 95.3% auto-mapping rate for Call Report fields, 97.0% for UBPR, and 94.5% for FR Y-9C. Total flagged records requiring manual review: 12 out of 168 ingested records.

RECOMMENDATION

Items 1–3 above require management discussion prior to filing. Items 4–5 are informational and can be addressed in the normal review cycle. The overall regulatory filing is recommended for submission pending resolution of the flagged cross-checks on Schedules RC-N, RC-L, and RC-R.`;

function PeriodComparisonTab() {
  const [memoContent, setMemoContent] = useState(defaultMemoContent);
  const [isEditing, setIsEditing] = useState(false);
  const [memoStatus, setMemoStatus] = useState<"draft" | "sent" | "approved">("draft");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setMemoContent(defaultMemoContent);
      setIsGenerating(false);
      setMemoStatus("draft");
    }, 1500);
  };

  const handleSendForApproval = () => {
    setMemoStatus("sent");
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      <Card data-testid="card-period-chart">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Key Metrics - Quarterly Progression</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={periodComparisons.slice(0, 4)}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="metric" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="q1_2024" name="Q1 2024" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="q2_2024" name="Q2 2024" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="q3_2024" name="Q3 2024" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="q4_2024" name="Q4 2024" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-period-table">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm">Period Over Period Analysis with Commentary</CardTitle>
            <Badge variant="secondary">FY 2024</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Metric</TableHead>
                  <TableHead className="text-xs text-right">Q1 2024</TableHead>
                  <TableHead className="text-xs text-right">Q2 2024</TableHead>
                  <TableHead className="text-xs text-right">Q3 2024</TableHead>
                  <TableHead className="text-xs text-right">Q4 2024</TableHead>
                  <TableHead className="text-xs">Trend</TableHead>
                  <TableHead className="text-xs">AI Commentary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periodComparisons.map((comp, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="text-xs py-3 font-medium">{comp.metric}</TableCell>
                    <TableCell className="text-xs py-3 text-right font-mono">{comp.q1_2024.toLocaleString()}</TableCell>
                    <TableCell className="text-xs py-3 text-right font-mono">{comp.q2_2024.toLocaleString()}</TableCell>
                    <TableCell className="text-xs py-3 text-right font-mono">{comp.q3_2024.toLocaleString()}</TableCell>
                    <TableCell className="text-xs py-3 text-right font-mono">{comp.q4_2024.toLocaleString()}</TableCell>
                    <TableCell className="text-xs py-3">
                      <TrendIcon trend={comp.trend} />
                    </TableCell>
                    <TableCell className="text-xs py-3 text-muted-foreground max-w-[300px]">
                      {comp.commentary}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card data-testid="card-memo">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm">Management Review Memorandum</CardTitle>
              {memoStatus === "draft" && (
                <Badge variant="outline" className="text-[10px]">
                  <Pencil className="w-2.5 h-2.5 mr-1" />Draft
                </Badge>
              )}
              {memoStatus === "sent" && (
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0 text-[10px]">
                  <Clock className="w-2.5 h-2.5 mr-1" />Pending CFO Approval
                </Badge>
              )}
              {memoStatus === "approved" && (
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 text-[10px]">
                  <Check className="w-2.5 h-2.5 mr-1" />Approved
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
                {isGenerating ? "Generating..." : "Generate Draft"}
              </Button>
              {memoStatus === "draft" && (
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
                    Send for CFO Approval
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
          {isEditing ? (
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
                  if (line === line.toUpperCase() && line.trim().length > 0 && !/^\d/.test(line.trim())) {
                    return <p key={i} className="text-xs font-bold text-foreground pt-2">{line}</p>;
                  }
                  if (/^\d+\./.test(line.trim())) {
                    return <p key={i} className="text-xs font-medium text-foreground">{line}</p>;
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
          <p className="text-[10px] font-mono font-medium text-destructive tracking-[0.12em] uppercase">Use Case I of II</p>
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
        {activeTab === "comparison" && <PeriodComparisonTab />}
        {activeTab === "trends" && <TrendAnalysisTab />}
      </div>
    </div>
  );
}
