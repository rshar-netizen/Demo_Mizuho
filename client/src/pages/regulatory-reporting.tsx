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
          <div className="grid grid-cols-5 gap-3">
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-center" data-testid="quality-score">
              <p className={`text-lg font-bold ${q.qualityScore >= 95 ? "text-emerald-500" : q.qualityScore >= 90 ? "text-amber-500" : "text-red-500"}`}>{q.qualityScore}%</p>
              <p className="text-[10px] text-muted-foreground">Quality Score</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-center" data-testid="quality-auto-mapped">
              <p className="text-lg font-bold text-emerald-500">{autoMappedPct}%</p>
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
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card data-testid="card-anomaly-high">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-2xl font-bold text-red-500">2</p>
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
                <p className="text-2xl font-bold text-amber-500">2</p>
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
                <p className="text-2xl font-bold text-muted-foreground">2</p>
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

function PeriodComparisonTab() {
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

function TrendAnalysisTab() {
  const { trendData, isLive } = useLiveTrendData();

  return (
    <div className="space-y-4">
      {isLive && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0">
            <Wifi className="w-3 h-3 mr-1" />
            Live FDIC Data
          </Badge>
          <span className="text-xs text-muted-foreground">Trends from ingested Call Report data (MUFG Americas proxy)</span>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card data-testid="card-trend-assets">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Assets Trend ($M)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="period" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 11 }} domain={["dataMin - 5000", "dataMax + 5000"]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}M`, ""]}
                  />
                  <Area type="monotone" dataKey="totalAssets" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.15} strokeWidth={2} name="Total Assets" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-trend-loans-deposits">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Loans vs Deposits ($M)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="period" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}M`, ""]}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Line type="monotone" dataKey="totalLoans" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 3 }} name="Total Loans" />
                  <Line type="monotone" dataKey="totalDeposits" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ r: 3 }} name="Total Deposits" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card data-testid="card-trend-income">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Net Income Trend ($M)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="period" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}M`, ""]}
                  />
                  <Bar dataKey="netIncome" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} name="Net Income" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-trend-capital">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tier 1 Capital Ratio (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="period" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [`${value}%`, ""]}
                  />
                  <Area type="monotone" dataKey="tier1Capital" stroke="hsl(var(--chart-5))" fill="hsl(var(--chart-5))" fillOpacity={0.15} strokeWidth={2} name="Tier 1 Ratio" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
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
