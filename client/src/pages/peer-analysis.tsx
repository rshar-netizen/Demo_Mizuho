import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  TrendingUp,
  Shield,
  DollarSign,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Wifi,
} from "lucide-react";
import {
  type PeerBank,
  type PeerTrendData,
  peerBanks as demoPeerBanks,
  peerTrendROE as demoPeerTrendROE,
  peerTrendNIM as demoPeerTrendNIM,
  peerTrendCET1 as demoPeerTrendCET1,
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

const tickerMap: Record<string, string> = {
  "Mizuho Americas": "MFG",
  "MUFG Americas": "MUFG",
  "SMBC Americas": "SMFG",
  "PNC Financial": "PNC",
  "U.S. Bancorp": "USB",
  "Citizens Financial": "CFG",
  "KeyCorp": "KEY",
  "M&T Bank": "MTB",
};

interface LivePeerEntry {
  name: string;
  cert: number;
  rssd: string | null;
  callReport: {
    reportDate: string;
    totalAssets: number;
    totalDeposits: number;
    totalLoans: number;
    netIncome: number;
    roe: number;
    roa: number;
    nim: number;
    tier1Ratio: number;
    efficiencyRatio: number;
    npaRatio: number;
    chargeOffRate: number;
    loanToDeposit: number;
  } | null;
  historicalData?: Array<{
    period: string;
    totalAssets: number;
    roe: number;
    nim: number;
    tier1Ratio: number;
  }>;
}

function mapLiveToPeerBank(entry: LivePeerEntry): PeerBank | null {
  const cr = entry.callReport;
  if (!cr) return null;
  return {
    name: entry.name,
    ticker: tickerMap[entry.name] || entry.name.slice(0, 3).toUpperCase(),
    totalAssets: Math.round(cr.totalAssets / 1000),
    totalLoans: Math.round(cr.totalLoans / 1000),
    totalDeposits: Math.round(cr.totalDeposits / 1000),
    netIncome: Math.round(cr.netIncome / 1000),
    roe: cr.roe,
    roa: cr.roa,
    nim: cr.nim,
    tier1Ratio: cr.tier1Ratio,
    cet1Ratio: cr.tier1Ratio,
    leverageRatio: cr.tier1Ratio * 0.65,
    efficiencyRatio: cr.efficiencyRatio,
    npaRatio: cr.npaRatio,
    loanToDeposit: cr.loanToDeposit,
    chargeOffRate: cr.chargeOffRate,
  };
}

function buildLiveTrend(entries: LivePeerEntry[], metric: "roe" | "nim" | "tier1Ratio"): PeerTrendData[] {
  const allPeriods = new Set<string>();
  entries.forEach(e => e.historicalData?.forEach(h => allPeriods.add(h.period)));
  const sortedPeriods = Array.from(allPeriods).sort((a, b) => {
    const [qa, ya] = a.replace("Q", "").split(" ");
    const [qb, yb] = b.replace("Q", "").split(" ");
    return (parseInt(ya) * 4 + parseInt(qa)) - (parseInt(yb) * 4 + parseInt(qb));
  });

  return sortedPeriods.map(period => {
    const point: PeerTrendData = { period };
    entries.forEach(e => {
      const h = e.historicalData?.find(d => d.period === period);
      if (h) point[e.name] = h[metric];
    });
    return point;
  });
}

function useLivePeerData() {
  const { data, isLoading, isError } = useQuery<{ data: LivePeerEntry[] }>({
    queryKey: ["/api/data-sources/peer-data"],
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  if (isLoading) return { peerBanks: demoPeerBanks, peerTrendROE: demoPeerTrendROE, peerTrendNIM: demoPeerTrendNIM, peerTrendCET1: demoPeerTrendCET1, isLive: false, isLoading: true };
  if (isError || !data?.data?.length) return { peerBanks: demoPeerBanks, peerTrendROE: demoPeerTrendROE, peerTrendNIM: demoPeerTrendNIM, peerTrendCET1: demoPeerTrendCET1, isLive: false, isLoading: false };

  const mapped = data.data.map(mapLiveToPeerBank).filter((b): b is PeerBank => b !== null);
  if (mapped.length < 3) return { peerBanks: demoPeerBanks, peerTrendROE: demoPeerTrendROE, peerTrendNIM: demoPeerTrendNIM, peerTrendCET1: demoPeerTrendCET1, isLive: false, isLoading: false };

  const mizuhoEntry = demoPeerBanks[0];
  const hasMizuho = mapped.some(b => b.name === "Mizuho Americas");
  const banks = hasMizuho ? mapped : [mizuhoEntry, ...mapped];

  return {
    peerBanks: banks,
    peerTrendROE: buildLiveTrend(data.data, "roe"),
    peerTrendNIM: buildLiveTrend(data.data, "nim"),
    peerTrendCET1: buildLiveTrend(data.data, "tier1Ratio"),
    isLive: true,
    isLoading: false,
    reportDate: data.data[0]?.callReport?.reportDate || "Latest",
  };
}

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

function buildRadarData(banks: PeerBank[]) {
  const mizuho = banks.find(b => b.name === "Mizuho Americas") || banks[0];
  const peers = banks.filter(b => b.name !== "Mizuho Americas");
  const avg = (fn: (b: PeerBank) => number) => peers.reduce((s, b) => s + fn(b), 0) / (peers.length || 1);
  const norm = (val: number, max: number) => Math.min(100, Math.round((val / max) * 100));
  return [
    { metric: "ROE", "Mizuho Americas": norm(mizuho.roe, 20), "Peer Avg": norm(avg(b => b.roe), 20), fullMark: 100 },
    { metric: "ROA", "Mizuho Americas": norm(mizuho.roa, 2), "Peer Avg": norm(avg(b => b.roa), 2), fullMark: 100 },
    { metric: "NIM", "Mizuho Americas": norm(mizuho.nim, 5), "Peer Avg": norm(avg(b => b.nim), 5), fullMark: 100 },
    { metric: "CET1", "Mizuho Americas": norm(mizuho.cet1Ratio, 25), "Peer Avg": norm(avg(b => b.cet1Ratio), 25), fullMark: 100 },
    { metric: "Efficiency", "Mizuho Americas": norm(100 - mizuho.efficiencyRatio, 50), "Peer Avg": norm(100 - avg(b => b.efficiencyRatio), 50), fullMark: 100 },
    { metric: "Asset Quality", "Mizuho Americas": norm(2 - mizuho.npaRatio, 2), "Peer Avg": norm(2 - avg(b => b.npaRatio), 2), fullMark: 100 },
  ];
}

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

function PeerComparisonTable({ banks, reportDate }: { banks: PeerBank[]; reportDate?: string }) {
  const getRank = (bankName: string, metric: keyof PeerBank, higherIsBetter: boolean) => {
    const sorted = [...banks].sort((a, b) =>
      higherIsBetter ? (b[metric] as number) - (a[metric] as number) : (a[metric] as number) - (b[metric] as number)
    );
    return sorted.findIndex((b) => b.name === bankName) + 1;
  };

  return (
    <Card data-testid="card-peer-comparison-table">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-sm">Comprehensive Peer Comparison - {reportDate || "Q4 2024"}</CardTitle>
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
              {banks.map((bank, idx) => (
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

function TrendCharts({ trendROE, trendNIM, trendCET1 }: { trendROE: PeerTrendData[]; trendNIM: PeerTrendData[]; trendCET1: PeerTrendData[] }) {
  const [selectedMetric, setSelectedMetric] = useState("roe");

  const metricData = selectedMetric === "roe" ? trendROE : selectedMetric === "nim" ? trendNIM : trendCET1;
  const metricLabel = selectedMetric === "roe" ? "Return on Equity (%)" : selectedMetric === "nim" ? "Net Interest Margin (%)" : "CET1 Capital Ratio (%)";

  const allBankNames = metricData.length > 0 ? Object.keys(metricData[0]).filter(k => k !== "period") : [];
  const selectedBanks = allBankNames.length > 0 ? allBankNames : ["Mizuho Americas", "MUFG Americas", "SMBC Americas", "PNC Financial", "U.S. Bancorp"];

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

function RadarComparison({ banks }: { banks: PeerBank[] }) {
  const radarData = buildRadarData(banks);
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

function KeyMetricsBar({ banks }: { banks: PeerBank[] }) {
  const profitabilityData = banks.map((bank) => ({
    name: bank.ticker,
    ROE: bank.roe,
    ROA: bank.roa,
  }));

  const capitalData = banks.map((bank) => ({
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
  const { peerBanks, peerTrendROE, peerTrendNIM, peerTrendCET1, isLive, isLoading, reportDate } = useLivePeerData();

  const mizuho = peerBanks.find(b => b.name === "Mizuho Americas") || peerBanks[0];
  const peerAvgROE = peerBanks.filter(b => b.name !== "Mizuho Americas").reduce((sum, b) => sum + b.roe, 0) / Math.max(1, peerBanks.filter(b => b.name !== "Mizuho Americas").length);
  const peerAvgNIM = peerBanks.filter(b => b.name !== "Mizuho Americas").reduce((sum, b) => sum + b.nim, 0) / Math.max(1, peerBanks.filter(b => b.name !== "Mizuho Americas").length);
  const peerAvgCET1 = peerBanks.filter(b => b.name !== "Mizuho Americas").reduce((sum, b) => sum + b.cet1Ratio, 0) / Math.max(1, peerBanks.filter(b => b.name !== "Mizuho Americas").length);
  const peerAvgEfficiency = peerBanks.filter(b => b.name !== "Mizuho Americas").reduce((sum, b) => sum + b.efficiencyRatio, 0) / Math.max(1, peerBanks.filter(b => b.name !== "Mizuho Americas").length);

  const roeRank = [...peerBanks].sort((a, b) => b.roe - a.roe).findIndex((b) => b.name === "Mizuho Americas") + 1;
  const nimRank = [...peerBanks].sort((a, b) => b.nim - a.nim).findIndex((b) => b.name === "Mizuho Americas") + 1;
  const cet1Rank = [...peerBanks].sort((a, b) => b.cet1Ratio - a.cet1Ratio).findIndex((b) => b.name === "Mizuho Americas") + 1;
  const effRank = [...peerBanks].sort((a, b) => a.efficiencyRatio - b.efficiencyRatio).findIndex((b) => b.name === "Mizuho Americas") + 1;

  const dateLabel = (reportDate as string) || "Q4 2024";

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[1200px] mx-auto p-6 space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-mono font-medium text-destructive tracking-[0.12em] uppercase">Use Case II of II</p>
            <Badge variant="outline" className="text-[10px] font-mono">FRB Dataset</Badge>
            {isLive && (
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0">
                <Wifi className="w-3 h-3 mr-1" />
                Live Data
              </Badge>
            )}
            {isLoading && (
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0">
                Loading live data...
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-serif font-semibold tracking-tight" data-testid="text-peer-title">
            Peer Analysis & Comparison
          </h1>
          <p className="text-sm text-muted-foreground">
            Benchmarking Mizuho Americas against selected peer institutions using FFIEC Call Report and FR Y-9C data
            {isLive && ` (as of ${dateLabel})`}
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
              <RadarComparison banks={peerBanks} />
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
            <KeyMetricsBar banks={peerBanks} />
          </TabsContent>

          <TabsContent value="detailed" className="space-y-4">
            <PeerComparisonTable banks={peerBanks} reportDate={dateLabel} />
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <TrendCharts trendROE={peerTrendROE} trendNIM={peerTrendNIM} trendCET1={peerTrendCET1} />
          </TabsContent>
        </Tabs>

        <div className="border-t pt-4 pb-2">
          <p className="text-xs text-muted-foreground">
            Data sourced from FFIEC Central Data Repository and Federal Reserve FR Y-9C filings.
            {isLive ? ` Live data as of ${dateLabel}.` : " All figures as of Q4 2024 unless otherwise noted."}
          </p>
        </div>
      </div>
    </div>
  );
}
