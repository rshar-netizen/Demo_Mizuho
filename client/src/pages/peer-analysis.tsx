import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  ArrowUpRight,
  ArrowDownRight,
  Wifi,
  Plus,
  Trash2,
  Loader2,
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

interface PeerConfig {
  name: string;
  rssd: string;
  cert: number;
}

const DEFAULT_PEERS: PeerConfig[] = [
  { name: "Mizuho Americas", rssd: "229913", cert: 21843 },
  { name: "PNC Bank, N.A.", rssd: "817824", cert: 6384 },
  { name: "U.S. Bank N.A.", rssd: "504713", cert: 6548 },
  { name: "Citizens Bank, N.A.", rssd: "3303298", cert: 57957 },
  { name: "KeyBank N.A.", rssd: "280110", cert: 17534 },
  { name: "M&T Bank", rssd: "3284070", cert: 57803 },
];

const PEER_DISPLAY_MAP: Record<number, string> = {
  21843: "Mizuho Americas",
  6384: "PNC Financial",
  6548: "U.S. Bancorp",
  57957: "Citizens Financial",
  17534: "KeyCorp",
  57803: "M&T Bank",
};

const tickerMap: Record<string, string> = {
  "Mizuho Americas": "MFG",
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
    tier1LeverageRatio: number | null;
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
    ticker: tickerMap[entry.name] || entry.name.slice(0, 4).toUpperCase(),
    totalAssets: Math.round(cr.totalAssets / 1000),
    totalLoans: Math.round(cr.totalLoans / 1000),
    totalDeposits: Math.round(cr.totalDeposits / 1000),
    netIncome: Math.round(cr.netIncome / 1000),
    roe: cr.roe,
    roa: cr.roa,
    nim: cr.nim,
    tier1Ratio: cr.tier1Ratio,
    cet1Ratio: cr.tier1Ratio,
    leverageRatio: cr.tier1LeverageRatio ?? 0,
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

const chartColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "#7c3aed",
  "#0891b2",
  "#65a30d",
  "#dc2626",
  "#d97706",
];

function getBankColor(name: string, idx: number): string {
  const fixed: Record<string, string> = {
    "Mizuho Americas": "hsl(var(--chart-1))",
    "PNC Financial": "hsl(var(--chart-4))",
    "U.S. Bancorp": "hsl(var(--chart-5))",
    "Citizens Financial": "#7c3aed",
    "KeyCorp": "#0891b2",
    "M&T Bank": "#65a30d",
  };
  return fixed[name] || chartColors[idx % chartColors.length];
}

function buildRadarData(banks: PeerBank[]) {
  const mizuho = banks.find(b => b.name === "Mizuho Americas") || banks[0];
  const peers = banks.filter(b => b.name !== "Mizuho Americas");
  const avg = (fn: (b: PeerBank) => number) => peers.reduce((s, b) => s + fn(b), 0) / (peers.length || 1);
  const norm = (val: number, max: number) => Math.min(100, Math.round((val / max) * 100));
  return [
    { metric: "ROE", "Mizuho Americas": norm(mizuho.roe, 20), "Peer Avg": norm(avg(b => b.roe), 20), fullMark: 100 },
    { metric: "ROA", "Mizuho Americas": norm(mizuho.roa, 2), "Peer Avg": norm(avg(b => b.roa), 2), fullMark: 100 },
    { metric: "NIM", "Mizuho Americas": norm(mizuho.nim, 5), "Peer Avg": norm(avg(b => b.nim), 5), fullMark: 100 },
    { metric: "Tier 1", "Mizuho Americas": norm(mizuho.cet1Ratio, 25), "Peer Avg": norm(avg(b => b.cet1Ratio), 25), fullMark: 100 },
    { metric: "Efficiency", "Mizuho Americas": norm(100 - mizuho.efficiencyRatio, 50), "Peer Avg": norm(100 - avg(b => b.efficiencyRatio), 50), fullMark: 100 },
    { metric: "Asset Quality", "Mizuho Americas": norm(2 - mizuho.npaRatio, 2), "Peer Avg": norm(2 - avg(b => b.npaRatio), 2), fullMark: 100 },
  ];
}

function PeerBankConfig({ peers, onAdd, onRemove }: {
  peers: PeerConfig[];
  onAdd: (peer: PeerConfig) => void;
  onRemove: (cert: number) => void;
}) {
  const [name, setName] = useState("");
  const [rssd, setRssd] = useState("");
  const [cert, setCert] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationMsg, setValidationMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const handleCertBlur = async () => {
    const certNum = parseInt(cert);
    if (!certNum || isNaN(certNum)) return;
    if (peers.some(p => p.cert === certNum)) {
      setValidationMsg({ text: "This institution is already in the peer group.", isError: true });
      return;
    }
    setIsValidating(true);
    setValidationMsg(null);
    try {
      const res = await fetch(`/api/data-sources/validate-cert?cert=${certNum}`);
      const json = await res.json();
      if (json.valid) {
        if (!name.trim()) setName(json.name);
        if (!rssd.trim() && json.rssd) setRssd(String(json.rssd));
        setValidationMsg({ text: `Found: ${json.name} — $${(json.totalAssets / 1000).toFixed(0)}M assets (${json.reportDate})`, isError: false });
      } else {
        setValidationMsg({ text: `No institution found for CERT ${certNum}`, isError: true });
      }
    } catch {
      setValidationMsg({ text: "Could not validate CERT number", isError: true });
    } finally {
      setIsValidating(false);
    }
  };

  const handleAdd = () => {
    const certNum = parseInt(cert);
    if (!certNum || isNaN(certNum)) return;
    if (peers.some(p => p.cert === certNum)) return;
    const peerName = name.trim() || `CERT ${certNum}`;
    onAdd({ name: peerName, rssd: rssd.trim(), cert: certNum });
    setName("");
    setRssd("");
    setCert("");
    setValidationMsg(null);
  };

  return (
    <Card data-testid="card-peer-config">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Peer Bank Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground mb-1 block">Institution name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Institution name"
              className="h-9 text-sm"
              data-testid="input-peer-name"
            />
          </div>
          <div className="w-[140px]">
            <label className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground mb-1 block">RSSD ID</label>
            <Input
              value={rssd}
              onChange={(e) => setRssd(e.target.value)}
              placeholder="RSSD ID"
              className="h-9 text-sm font-mono"
              data-testid="input-peer-rssd"
            />
          </div>
          <div className="w-[120px]">
            <label className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground mb-1 block">CERT</label>
            <Input
              value={cert}
              onChange={(e) => setCert(e.target.value)}
              onBlur={handleCertBlur}
              onKeyDown={(e) => e.key === "Enter" && handleCertBlur()}
              placeholder="CERT"
              className="h-9 text-sm font-mono"
              data-testid="input-peer-cert"
            />
          </div>
          <Button
            onClick={handleAdd}
            disabled={!cert.trim() || isValidating}
            className="h-9 shrink-0"
            data-testid="button-add-peer"
          >
            {isValidating ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5 mr-1.5" />
            )}
            Add Peer
          </Button>
        </div>

        {validationMsg && (
          <p className={`text-xs ${validationMsg.isError ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`} data-testid="text-validation-msg">
            {validationMsg.text}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5" data-testid="list-configured-peers">
          {peers.map((peer) => (
            <div
              key={peer.cert}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/40 border border-border/40 text-xs"
              data-testid={`peer-config-${peer.cert}`}
            >
              <span className="font-medium">{PEER_DISPLAY_MAP[peer.cert] || peer.name}</span>
              <span className="text-[10px] text-muted-foreground font-mono">({peer.cert})</span>
              <button
                className="ml-0.5 rounded-full p-0.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                onClick={() => onRemove(peer.cert)}
                data-testid={`button-remove-peer-${peer.cert}`}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function MetricCard({ label, value, rank, total, positive }: { label: string; value: string; rank: number; total: number; positive?: boolean }) {
  return (
    <Card>
      <CardContent className="px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground truncate">{label}</p>
            <p className="text-lg font-bold leading-tight">{value}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {rank}/{total}
            </Badge>
            {positive !== undefined && (
              positive ?
                <ArrowUpRight className="w-3 h-3 text-emerald-500" /> :
                <ArrowDownRight className="w-3 h-3 text-red-500" />
            )}
          </div>
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
          <Badge variant="secondary">Source: FDIC Call Reports</Badge>
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
                <TableHead className="text-xs text-right">Tier 1 %</TableHead>
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

function TrendCharts({ trendROE, trendNIM, trendCET1, bankNames }: { trendROE: PeerTrendData[]; trendNIM: PeerTrendData[]; trendCET1: PeerTrendData[]; bankNames: string[] }) {
  const [selectedMetric, setSelectedMetric] = useState("roe");

  const metricData = selectedMetric === "roe" ? trendROE : selectedMetric === "nim" ? trendNIM : trendCET1;
  const allBankNames = metricData.length > 0 ? Object.keys(metricData[0]).filter(k => k !== "period") : bankNames;

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
              <SelectItem value="cet1">Tier 1 Capital Ratio</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[260px]">
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
              {allBankNames.map((bank, i) => (
                <Line
                  key={bank}
                  type="monotone"
                  dataKey={bank}
                  stroke={getBankColor(bank, i)}
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
        <div className="h-[240px]">
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
    "Tier 1 Ratio": bank.cet1Ratio,
    "Leverage": bank.leverageRatio,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <Card data-testid="card-profitability-bar">
        <CardHeader className="pb-1">
          <CardTitle className="text-sm">Profitability Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
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
        <CardHeader className="pb-1">
          <CardTitle className="text-sm">Capital Adequacy Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
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
                <Bar dataKey="Tier 1 Ratio" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
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
  const queryClient = useQueryClient();
  const [peers, setPeers] = useState<PeerConfig[]>(DEFAULT_PEERS);

  const extraCerts = peers
    .filter(p => !DEFAULT_PEERS.some(d => d.cert === p.cert))
    .map(p => p.cert);

  const certsParam = extraCerts.length > 0 ? `?certs=${extraCerts.join(",")}` : "";

  const { data, isLoading, isError } = useQuery<{ data: LivePeerEntry[] }>({
    queryKey: ["/api/data-sources/peer-data", certsParam],
    queryFn: async () => {
      const res = await fetch(`/api/data-sources/peer-data${certsParam}`);
      if (!res.ok) throw new Error("Failed to fetch peer data");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const isLive = !isLoading && !isError && (data?.data?.length ?? 0) > 0;

  const activeCerts = new Set(peers.map(p => p.cert));
  const liveEntries = (data?.data || []).filter(e => activeCerts.has(e.cert));

  const peerBanks: PeerBank[] = (() => {
    if (!isLive) return demoPeerBanks;
    const mapped = liveEntries.map(mapLiveToPeerBank).filter((b): b is PeerBank => b !== null);
    if (mapped.length < 2) return demoPeerBanks;
    return mapped;
  })();

  const peerTrendROE = isLive ? buildLiveTrend(liveEntries, "roe") : demoPeerTrendROE;
  const peerTrendNIM = isLive ? buildLiveTrend(liveEntries, "nim") : demoPeerTrendNIM;
  const peerTrendCET1 = isLive ? buildLiveTrend(liveEntries, "tier1Ratio") : demoPeerTrendCET1;
  const reportDate = isLive && liveEntries[0]?.callReport?.reportDate ? liveEntries[0].callReport.reportDate : "Latest";

  const handleAddPeer = useCallback((peer: PeerConfig) => {
    setPeers(prev => [...prev, peer]);
    queryClient.invalidateQueries({ queryKey: ["/api/data-sources/peer-data"] });
  }, [queryClient]);

  const handleRemovePeer = useCallback((cert: number) => {
    setPeers(prev => prev.filter(p => p.cert !== cert));
  }, []);

  const mizuho = peerBanks.find(b => b.name === "Mizuho Americas") || peerBanks[0];
  const peerAvgROE = peerBanks.filter(b => b.name !== "Mizuho Americas").reduce((sum, b) => sum + b.roe, 0) / Math.max(1, peerBanks.filter(b => b.name !== "Mizuho Americas").length);
  const peerAvgNIM = peerBanks.filter(b => b.name !== "Mizuho Americas").reduce((sum, b) => sum + b.nim, 0) / Math.max(1, peerBanks.filter(b => b.name !== "Mizuho Americas").length);
  const peerAvgCET1 = peerBanks.filter(b => b.name !== "Mizuho Americas").reduce((sum, b) => sum + b.cet1Ratio, 0) / Math.max(1, peerBanks.filter(b => b.name !== "Mizuho Americas").length);
  const peerAvgEfficiency = peerBanks.filter(b => b.name !== "Mizuho Americas").reduce((sum, b) => sum + b.efficiencyRatio, 0) / Math.max(1, peerBanks.filter(b => b.name !== "Mizuho Americas").length);

  const roeRank = [...peerBanks].sort((a, b) => b.roe - a.roe).findIndex((b) => b.name === "Mizuho Americas") + 1;
  const nimRank = [...peerBanks].sort((a, b) => b.nim - a.nim).findIndex((b) => b.name === "Mizuho Americas") + 1;
  const cet1Rank = [...peerBanks].sort((a, b) => b.cet1Ratio - a.cet1Ratio).findIndex((b) => b.name === "Mizuho Americas") + 1;
  const effRank = [...peerBanks].sort((a, b) => a.efficiencyRatio - b.efficiencyRatio).findIndex((b) => b.name === "Mizuho Americas") + 1;

  const dateLabel = reportDate || "Q4 2024";
  const bankNames = peerBanks.map(b => b.name);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[1200px] mx-auto p-6 space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-mono font-medium text-destructive tracking-[0.12em] uppercase">Peer Analysis</p>
            <Badge variant="outline" className="text-[10px] font-mono">FDIC Dataset</Badge>
            {isLive && (
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0">
                <Wifi className="w-3 h-3 mr-1" />
                Live Data
              </Badge>
            )}
            {isLoading && (
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Loading live data...
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-serif font-semibold tracking-tight" data-testid="text-peer-title">
            Peer Analysis & Comparison
          </h1>
          <p className="text-sm text-muted-foreground">
            Benchmarking Mizuho Bank USA against selected peer institutions using FDIC Call Report data
            {isLive && ` (as of ${dateLabel})`}
          </p>
        </div>

        <PeerBankConfig peers={peers} onAdd={handleAddPeer} onRemove={handleRemovePeer} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
            label="Tier 1 Capital Ratio"
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

        <Tabs defaultValue="overview" className="space-y-3">
          <TabsList data-testid="tabs-peer-analysis">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed" data-testid="tab-detailed">Detailed Comparison</TabsTrigger>
            <TabsTrigger value="trends" data-testid="tab-trends">Trend Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <RadarComparison banks={peerBanks} />
              <Card data-testid="card-peer-summary">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Peer Group Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-1">
                      {peerBanks.map((bank, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md ${
                            bank.name === "Mizuho Americas" ? "bg-primary/5 border border-primary/20" : "bg-muted/50"
                          }`}
                          data-testid={`peer-summary-${idx}`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-medium truncate">{bank.name}</p>
                              <p className="text-[10px] text-muted-foreground">${bank.totalAssets.toLocaleString()}M</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 text-right">
                            <div>
                              <p className="text-[11px] font-mono font-medium">{formatPercent(bank.roe)}</p>
                              <p className="text-[9px] text-muted-foreground">ROE</p>
                            </div>
                            <div>
                              <p className="text-[11px] font-mono font-medium">{formatPercent(bank.cet1Ratio)}</p>
                              <p className="text-[9px] text-muted-foreground">Tier 1</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
            <KeyMetricsBar banks={peerBanks} />
          </TabsContent>

          <TabsContent value="detailed" className="space-y-4">
            <PeerComparisonTable banks={peerBanks} reportDate={dateLabel} />
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <TrendCharts trendROE={peerTrendROE} trendNIM={peerTrendNIM} trendCET1={peerTrendCET1} bankNames={bankNames} />
          </TabsContent>
        </Tabs>

        <div className="border-t pt-4 pb-2">
          <p className="text-xs text-muted-foreground">
            Data sourced from FDIC BankFind Suite API (Call Reports).
            {isLive ? ` Live data as of ${dateLabel}.` : " All figures as of Q4 2024 unless otherwise noted."}
            {" "}Peer group contains {peerBanks.length} institution{peerBanks.length !== 1 ? "s" : ""}.
          </p>
        </div>
      </div>
    </div>
  );
}
