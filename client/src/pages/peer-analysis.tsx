import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  TrendingUp,
  Shield,
  DollarSign,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  type PeerBank,
  peerBanks,
  peerTrendROE,
  peerTrendNIM,
  peerTrendCET1,
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
  Legend,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const chartColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const bankColors: Record<string, string> = {
  "Mizuho Americas": "hsl(var(--chart-1))",
  "MUFG Americas": "hsl(var(--chart-2))",
  "SMBC Americas": "hsl(var(--chart-3))",
  "PNC Financial": "hsl(var(--chart-4))",
  "U.S. Bancorp": "hsl(var(--chart-5))",
  "Citizens Financial": "#7c3aed",
  "KeyCorp": "#0891b2",
  "M&T Bank": "#65a30d",
};

const radarData = [
  { metric: "ROE", "Mizuho Americas": 57, "Peer Avg": 72, fullMark: 100 },
  { metric: "ROA", "Mizuho Americas": 65, "Peer Avg": 74, fullMark: 100 },
  { metric: "NIM", "Mizuho Americas": 58, "Peer Avg": 72, fullMark: 100 },
  { metric: "CET1", "Mizuho Americas": 88, "Peer Avg": 72, fullMark: 100 },
  { metric: "Efficiency", "Mizuho Americas": 62, "Peer Avg": 70, fullMark: 100 },
  { metric: "Asset Quality", "Mizuho Americas": 68, "Peer Avg": 75, fullMark: 100 },
];

function MetricCard({ label, value, rank, total, positive }: { label: string; value: string; rank: number; total: number; positive?: boolean }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-xl font-bold">{value}</p>
        <div className="flex items-center gap-1 mt-1">
          <Badge variant="outline" className="text-xs">
            Rank {rank}/{total}
          </Badge>
          {positive !== undefined && (
            positive ?
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" /> :
              <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PeerComparisonTable() {
  const mizuho = peerBanks[0];

  const getRank = (bankName: string, metric: keyof PeerBank, higherIsBetter: boolean) => {
    const sorted = [...peerBanks].sort((a, b) =>
      higherIsBetter ? (b[metric] as number) - (a[metric] as number) : (a[metric] as number) - (b[metric] as number)
    );
    return sorted.findIndex((b) => b.name === bankName) + 1;
  };

  return (
    <Card data-testid="card-peer-comparison-table">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-sm">Comprehensive Peer Comparison - Q4 2024</CardTitle>
          <Badge variant="secondary">Source: FFIEC Call Reports / FR Y-9C</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs sticky left-0 bg-card z-10">Institution</TableHead>
                <TableHead className="text-xs text-right">Total Assets ($M)</TableHead>
                <TableHead className="text-xs text-right">Total Loans ($M)</TableHead>
                <TableHead className="text-xs text-right">Total Deposits ($M)</TableHead>
                <TableHead className="text-xs text-right">Net Income ($M)</TableHead>
                <TableHead className="text-xs text-right">ROE %</TableHead>
                <TableHead className="text-xs text-right">ROA %</TableHead>
                <TableHead className="text-xs text-right">NIM %</TableHead>
                <TableHead className="text-xs text-right">CET1 %</TableHead>
                <TableHead className="text-xs text-right">Efficiency %</TableHead>
                <TableHead className="text-xs text-right">NPA %</TableHead>
                <TableHead className="text-xs text-right">L/D Ratio %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {peerBanks.map((bank, idx) => (
                <TableRow
                  key={idx}
                  className={bank.name === "Mizuho Americas" ? "bg-primary/5" : ""}
                  data-testid={`row-peer-${idx}`}
                >
                  <TableCell className="text-xs py-2 font-medium sticky left-0 bg-card z-10">
                    <div className="flex items-center gap-2">
                      {bank.name === "Mizuho Americas" && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                      <span>{bank.name}</span>
                      <Badge variant="outline" className="text-xs font-mono">{bank.ticker}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs py-2 text-right font-mono">{bank.totalAssets.toLocaleString()}</TableCell>
                  <TableCell className="text-xs py-2 text-right font-mono">{bank.totalLoans.toLocaleString()}</TableCell>
                  <TableCell className="text-xs py-2 text-right font-mono">{bank.totalDeposits.toLocaleString()}</TableCell>
                  <TableCell className="text-xs py-2 text-right font-mono">{bank.netIncome.toLocaleString()}</TableCell>
                  <TableCell className="text-xs py-2 text-right font-mono">{formatPercent(bank.roe)}</TableCell>
                  <TableCell className="text-xs py-2 text-right font-mono">{formatPercent(bank.roa)}</TableCell>
                  <TableCell className="text-xs py-2 text-right font-mono">{formatPercent(bank.nim)}</TableCell>
                  <TableCell className="text-xs py-2 text-right font-mono">{formatPercent(bank.cet1Ratio)}</TableCell>
                  <TableCell className="text-xs py-2 text-right font-mono">{formatPercent(bank.efficiencyRatio)}</TableCell>
                  <TableCell className="text-xs py-2 text-right font-mono">{formatPercent(bank.npaRatio)}</TableCell>
                  <TableCell className="text-xs py-2 text-right font-mono">{formatPercent(bank.loanToDeposit)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function TrendCharts() {
  const [selectedMetric, setSelectedMetric] = useState("roe");

  const metricData = selectedMetric === "roe" ? peerTrendROE : selectedMetric === "nim" ? peerTrendNIM : peerTrendCET1;
  const metricLabel = selectedMetric === "roe" ? "Return on Equity (%)" : selectedMetric === "nim" ? "Net Interest Margin (%)" : "CET1 Capital Ratio (%)";

  const selectedBanks = ["Mizuho Americas", "MUFG Americas", "SMBC Americas", "PNC Financial", "U.S. Bancorp"];

  return (
    <Card data-testid="card-trend-charts">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-sm">Peer Trend Comparison</CardTitle>
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-[200px]" data-testid="select-trend-metric">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="roe">Return on Equity (ROE)</SelectItem>
              <SelectItem value="nim">Net Interest Margin (NIM)</SelectItem>
              <SelectItem value="cet1">CET1 Capital Ratio</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metricData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
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
              {selectedBanks.map((bank) => (
                <Line
                  key={bank}
                  type="monotone"
                  dataKey={bank}
                  stroke={bankColors[bank]}
                  strokeWidth={bank === "Mizuho Americas" ? 3 : 1.5}
                  dot={{ r: bank === "Mizuho Americas" ? 4 : 2 }}
                  name={bank}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function RadarComparison() {
  return (
    <Card data-testid="card-radar-comparison">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Mizuho vs Peer Average - Performance Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
              <Radar
                name="Mizuho Americas"
                dataKey="Mizuho Americas"
                stroke="hsl(var(--chart-1))"
                fill="hsl(var(--chart-1))"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Radar
                name="Peer Average"
                dataKey="Peer Avg"
                stroke="hsl(var(--chart-2))"
                fill="hsl(var(--chart-2))"
                fillOpacity={0.1}
                strokeWidth={2}
                strokeDasharray="5 5"
              />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function KeyMetricsBar() {
  const profitabilityData = peerBanks.map((bank) => ({
    name: bank.ticker,
    ROE: bank.roe,
    ROA: bank.roa,
  }));

  const capitalData = peerBanks.map((bank) => ({
    name: bank.ticker,
    CET1: bank.cet1Ratio,
    Leverage: bank.leverageRatio,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card data-testid="card-profitability-bar">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Profitability Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitabilityData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`${value}%`, ""]}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="ROE" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ROA" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-capital-bar">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Capital Adequacy Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={capitalData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`${value}%`, ""]}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="CET1" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Leverage" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PeerAnalysis() {
  const mizuho = peerBanks[0];
  const peerAvgROE = peerBanks.slice(1).reduce((sum, b) => sum + b.roe, 0) / (peerBanks.length - 1);
  const peerAvgNIM = peerBanks.slice(1).reduce((sum, b) => sum + b.nim, 0) / (peerBanks.length - 1);
  const peerAvgCET1 = peerBanks.slice(1).reduce((sum, b) => sum + b.cet1Ratio, 0) / (peerBanks.length - 1);
  const peerAvgEfficiency = peerBanks.slice(1).reduce((sum, b) => sum + b.efficiencyRatio, 0) / (peerBanks.length - 1);

  const roeRank = [...peerBanks].sort((a, b) => b.roe - a.roe).findIndex((b) => b.name === "Mizuho Americas") + 1;
  const nimRank = [...peerBanks].sort((a, b) => b.nim - a.nim).findIndex((b) => b.name === "Mizuho Americas") + 1;
  const cet1Rank = [...peerBanks].sort((a, b) => b.cet1Ratio - a.cet1Ratio).findIndex((b) => b.name === "Mizuho Americas") + 1;
  const effRank = [...peerBanks].sort((a, b) => a.efficiencyRatio - b.efficiencyRatio).findIndex((b) => b.name === "Mizuho Americas") + 1;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[1200px] mx-auto p-6 space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Use Case 2</Badge>
            <Badge variant="outline">FRB Dataset</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-peer-title">
            Peer Analysis & Comparison
          </h1>
          <p className="text-sm text-muted-foreground">
            Benchmarking Mizuho Americas against selected peer institutions using FFIEC Call Report and FR Y-9C data
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            label="Return on Equity"
            value={formatPercent(mizuho.roe)}
            rank={roeRank}
            total={peerBanks.length}
            positive={mizuho.roe > peerAvgROE}
          />
          <MetricCard
            label="Net Interest Margin"
            value={formatPercent(mizuho.nim)}
            rank={nimRank}
            total={peerBanks.length}
            positive={mizuho.nim > peerAvgNIM}
          />
          <MetricCard
            label="CET1 Capital Ratio"
            value={formatPercent(mizuho.cet1Ratio)}
            rank={cet1Rank}
            total={peerBanks.length}
            positive={true}
          />
          <MetricCard
            label="Efficiency Ratio"
            value={formatPercent(mizuho.efficiencyRatio)}
            rank={effRank}
            total={peerBanks.length}
            positive={mizuho.efficiencyRatio < peerAvgEfficiency}
          />
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList data-testid="tabs-peer-analysis">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed" data-testid="tab-detailed">Detailed Comparison</TabsTrigger>
            <TabsTrigger value="trends" data-testid="tab-trends">Trend Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <RadarComparison />
              <Card data-testid="card-peer-summary">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Peer Group Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {peerBanks.map((bank, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between gap-3 p-2.5 rounded-md ${
                          bank.name === "Mizuho Americas" ? "bg-primary/5 border border-primary/20" : "bg-muted/50"
                        }`}
                        data-testid={`peer-summary-${idx}`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate">{bank.name}</p>
                            <p className="text-xs text-muted-foreground">${bank.totalAssets.toLocaleString()}M assets</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 text-right">
                          <div>
                            <p className="text-xs font-mono font-medium">{formatPercent(bank.roe)}</p>
                            <p className="text-[10px] text-muted-foreground">ROE</p>
                          </div>
                          <div>
                            <p className="text-xs font-mono font-medium">{formatPercent(bank.cet1Ratio)}</p>
                            <p className="text-[10px] text-muted-foreground">CET1</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <KeyMetricsBar />
          </TabsContent>

          <TabsContent value="detailed" className="space-y-4">
            <PeerComparisonTable />
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <TrendCharts />
          </TabsContent>
        </Tabs>

        <div className="border-t pt-4 pb-2">
          <p className="text-xs text-muted-foreground">
            Data sourced from FFIEC Central Data Repository and Federal Reserve FR Y-9C filings. All figures as of Q4 2024 unless otherwise noted.
          </p>
        </div>
      </div>
    </div>
  );
}
