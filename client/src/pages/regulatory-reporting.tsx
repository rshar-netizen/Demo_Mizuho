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
} from "recharts";

const steps = [
  { id: "instructions", label: "Instructions Analysis", icon: Search, step: 1 },
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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Regulatory Filing Requirements</CardTitle>
            <Badge variant="outline" className="text-xs">{reportingInstructions.length} schedules</Badge>
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
            <Badge variant="outline" className="text-xs">{aiQueries.length} queries available</Badge>
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
  const q = dict.quality;
  const autoMappedPct = ((q.autoMapped / q.totalFields) * 100).toFixed(1);
  const manualReviewPct = ((q.manualReview / q.totalFields) * 100).toFixed(1);

  return (
    <div className="space-y-4">
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
          <div className="grid grid-cols-4 gap-3">
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-center" data-testid="quality-auto-mapped">
              <p className={`text-lg font-bold ${parseFloat(autoMappedPct) >= 95 ? "text-emerald-500" : parseFloat(autoMappedPct) >= 90 ? "text-amber-500" : "text-red-500"}`}>{autoMappedPct}%</p>
              <p className="text-[10px] text-muted-foreground">Auto-Mapped</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-center" data-testid="quality-manual-review">
              <p className="text-lg font-bold text-amber-500">{manualReviewPct}%</p>
              <p className="text-[10px] text-muted-foreground">Manual Review</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-center" data-testid="quality-null-rate">
              <p className="text-lg font-bold text-muted-foreground">{q.nullRate}%</p>
              <p className="text-[10px] text-muted-foreground">Null Rate</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-center" data-testid="quality-flagged">
              <p className={`text-lg font-bold ${q.flaggedRecords > 0 ? "text-amber-500" : "text-emerald-500"}`}>{q.flaggedRecords}</p>
              <p className="text-[10px] text-muted-foreground">Flagged Records</p>
            </div>
          </div>

          <div className="w-full h-2 rounded-full bg-muted overflow-hidden" data-testid="quality-bar">
            <div className="h-full flex">
              <div className="bg-emerald-500 transition-all" style={{ width: `${autoMappedPct}%` }} />
              <div className="bg-amber-500 transition-all" style={{ width: `${manualReviewPct}%` }} />
            </div>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />{q.autoMapped} fields auto-mapped</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-amber-500" />{q.manualReview} fields require manual review</div>
          </div>

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

function AnomaliesTab() {
  const highCount = anomalyRecords.filter(a => a.severity === "high").length;
  const medCount = anomalyRecords.filter(a => a.severity === "medium").length;
  const lowCount = anomalyRecords.filter(a => a.severity === "low").length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card data-testid="card-anomaly-high">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-2xl font-bold text-red-500">{highCount}</p>
                <p className="text-xs text-muted-foreground">High Severity</p>
              </div>
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card data-testid="card-anomaly-medium">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-2xl font-bold text-amber-500">{medCount}</p>
                <p className="text-xs text-muted-foreground">Medium Severity</p>
              </div>
              <AlertCircle className="w-5 h-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card data-testid="card-anomaly-low">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-2xl font-bold text-muted-foreground">{lowCount}</p>
                <p className="text-xs text-muted-foreground">Low Severity</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-anomaly-chart">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Deviation Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={anomalyRecords} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  dataKey="metric"
                  type="category"
                  width={140}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="deviation" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-anomaly-list">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Detected Anomalies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {anomalyRecords.map((anomaly, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
                <SeverityBadge severity={anomaly.severity} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-medium">{anomaly.metric}</span>
                    <Badge variant="outline" className="text-xs">{anomaly.period}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{anomaly.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    <span>Actual: <span className="font-medium">{anomaly.value}</span></span>
                    <span>Expected: <span className="font-medium">{anomaly.expected}</span></span>
                    <span>Deviation: <span className={`font-medium ${anomaly.deviation > 0 ? "text-red-500" : "text-amber-500"}`}>{anomaly.deviation > 0 ? "+" : ""}{anomaly.deviation}</span></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ReportReviewTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-500">8</p>
            <p className="text-xs text-muted-foreground">Checks Passed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-500">1</p>
            <p className="text-xs text-muted-foreground">Warnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-500">0</p>
            <p className="text-xs text-muted-foreground">Failures</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">Q4 2024</p>
            <p className="text-xs text-muted-foreground">Reporting Period</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-report-review-table">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm">Schedule RC - Balance Sheet Review</CardTitle>
            <Badge variant="secondary">As of Dec 31, 2024</Badge>
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
                  <TableHead className="text-xs text-right">Current ($K)</TableHead>
                  <TableHead className="text-xs text-right">Prior ($K)</TableHead>
                  <TableHead className="text-xs text-right">Change %</TableHead>
                  <TableHead className="text-xs">Cross-Check</TableHead>
                  <TableHead className="text-xs">Derivation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportLineItems.map((item, idx) => (
                  <TableRow key={idx} data-testid={`row-report-${idx}`}>
                    <TableCell className="text-xs font-mono py-2">{item.id}</TableCell>
                    <TableCell className="text-xs py-2 font-medium">{item.lineItem}</TableCell>
                    <TableCell className="text-xs py-2">
                      <Badge variant="outline" className="text-xs">{item.schedule}</Badge>
                    </TableCell>
                    <TableCell className="text-xs py-2 text-right font-mono">
                      {item.currentPeriod > 100 ? item.currentPeriod.toLocaleString() : formatPercent(item.currentPeriod)}
                    </TableCell>
                    <TableCell className="text-xs py-2 text-right font-mono">
                      {item.priorPeriod > 100 ? item.priorPeriod.toLocaleString() : formatPercent(item.priorPeriod)}
                    </TableCell>
                    <TableCell className={`text-xs py-2 text-right font-mono ${item.changePercent >= 0 ? "text-emerald-500" : "text-red-500"}`}>
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
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Use Case 1</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-reporting-title">
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
                  : "bg-muted text-muted-foreground"
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
