import { useState, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DataIngestionContent } from "@/pages/data-ingestion";
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
  Check,
  Users,
  Info,
  TableIcon,
  BarChart3,
  Database,
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
  Cell,
  ReferenceLine,
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
  group?: string;
}

interface PeerGroup {
  id: string;
  label: string;
  description: string;
  peers: PeerConfig[];
}

const PEER_GROUPS: PeerGroup[] = [
  {
    id: "japanese",
    label: "Japanese FBOs",
    description: "Japanese bank US subsidiaries filing FFIEC Call Reports",
    peers: [
      { name: "Mizuho Americas", rssd: "229913", cert: 21843, group: "japanese" },
      { name: "MUFG Union Bank", rssd: "", cert: 32633, group: "japanese" },
      { name: "Manufacturers Bank", rssd: "", cert: 22538, group: "japanese" },
    ],
  },
  {
    id: "european",
    label: "European FBOs",
    description: "European bank US subsidiaries with FDIC-insured operations",
    peers: [
      { name: "Mizuho Americas", rssd: "229913", cert: 21843, group: "european" },
      { name: "Deutsche Bank Trust", rssd: "", cert: 623, group: "european" },
      { name: "Barclays Bank Delaware", rssd: "", cert: 57062, group: "european" },
    ],
  },
  {
    id: "gsib",
    label: "US G-SIBs",
    description: "US Global Systemically Important Banks (trading & sales focus)",
    peers: [
      { name: "Mizuho Americas", rssd: "229913", cert: 21843, group: "gsib" },
      { name: "JPMorgan Chase Bank", rssd: "", cert: 628, group: "gsib" },
      { name: "Citibank", rssd: "", cert: 7213, group: "gsib" },
      { name: "Goldman Sachs Bank", rssd: "", cert: 33124, group: "gsib" },
      { name: "Morgan Stanley Bank", rssd: "", cert: 32992, group: "gsib" },
      { name: "Bank of America", rssd: "", cert: 3510, group: "gsib" },
    ],
  },
  {
    id: "regional",
    label: "US Regional Banks",
    description: "US super-regional banks comparable in business mix",
    peers: [
      { name: "Mizuho Americas", rssd: "229913", cert: 21843, group: "regional" },
      { name: "PNC Bank, N.A.", rssd: "817824", cert: 6384, group: "regional" },
      { name: "U.S. Bank N.A.", rssd: "504713", cert: 6548, group: "regional" },
      { name: "Citizens Bank, N.A.", rssd: "3303298", cert: 57957, group: "regional" },
      { name: "KeyBank N.A.", rssd: "280110", cert: 17534, group: "regional" },
      { name: "M&T Bank", rssd: "3284070", cert: 57803, group: "regional" },
    ],
  },
];

const PEER_DISPLAY_MAP: Record<number, string> = {
  21843: "Mizuho Americas",
  6384: "PNC Financial",
  6548: "U.S. Bancorp",
  57957: "Citizens Financial",
  17534: "KeyCorp",
  57803: "M&T Bank",
  32633: "MUFG Americas",
  22538: "SMBC (Manufacturers)",
  623: "Deutsche Bank Americas",
  57062: "Barclays US",
  628: "JPMorgan Chase",
  7213: "Citibank",
  33124: "Goldman Sachs",
  32992: "Morgan Stanley",
  3510: "Bank of America",
};

const tickerMap: Record<string, string> = {
  "Mizuho Americas": "MFG",
  "PNC Financial": "PNC",
  "U.S. Bancorp": "USB",
  "Citizens Financial": "CFG",
  "KeyCorp": "KEY",
  "M&T Bank": "MTB",
  "MUFG Americas": "MUFG",
  "SMBC (Manufacturers)": "SMFG",
  "Deutsche Bank Americas": "DB",
  "Barclays US": "BCS",
  "JPMorgan Chase": "JPM",
  "Citibank": "C",
  "Goldman Sachs": "GS",
  "Morgan Stanley": "MS",
  "Bank of America": "BAC",
};

interface FFIEC102Quarter {
  period: string;
  tradingDays: number;
  profitableDays: number;
  unprofitableDays: number;
  profitableDaysPct: number;
  totalTradingRevenue: number;
  averageDailyPnL: number;
  maxDailyGain: number;
  maxDailyLoss: number;
  varBreaches: number;
}

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
    totalCapitalRatio: number;
    efficiencyRatio: number;
    npaRatio: number;
    chargeOffRate: number;
    loanToDeposit: number;
    securities: number;
    equity: number;
  } | null;
  ffiec102?: FFIEC102Quarter[] | null;
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
    securities: cr.securities ? Math.round(cr.securities / 1000) : undefined,
    equity: cr.equity ? Math.round(cr.equity / 1000) : undefined,
    totalCapitalRatio: cr.totalCapitalRatio ?? undefined,
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
  "#059669",
  "#6366f1",
  "#e11d48",
  "#0284c7",
  "#ca8a04",
];

function getBankColor(name: string, idx: number): string {
  if (name === "Mizuho Americas") return "hsl(var(--chart-1))";
  return chartColors[(idx + 1) % chartColors.length];
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

function PeerGroupSelector({ selectedGroup, onGroupChange, peers, onAddCustom, onRemovePeer }: {
  selectedGroup: string;
  onGroupChange: (groupId: string) => void;
  peers: PeerConfig[];
  onAddCustom: (peer: PeerConfig) => void;
  onRemovePeer: (cert: number) => void;
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
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
    onAddCustom({ name: peerName, rssd: "", cert: certNum, group: "custom" });
    setName("");
    setCert("");
    setValidationMsg(null);
    setShowAddForm(false);
  };

  const nonMizuhoPeers = peers.filter(p => p.cert !== 21843);
  const customPeers = nonMizuhoPeers.filter(p => p.group === "custom");
  const groupPeers = nonMizuhoPeers.filter(p => p.group !== "custom");

  return (
    <Card data-testid="card-peer-config">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <p className="text-xs font-semibold text-foreground">Peer Group Selection</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {PEER_GROUPS.map(group => {
            const isActive = selectedGroup === group.id;
            return (
              <button
                key={group.id}
                onClick={() => onGroupChange(group.id)}
                className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                  isActive
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border/50 hover:border-primary/30 hover:bg-muted/30"
                }`}
                data-testid={`button-group-${group.id}`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs font-semibold text-foreground">{group.label}</span>
                  {isActive && <Check className="w-3 h-3 text-primary ml-auto" />}
                </div>
                <p className="text-[10px] text-muted-foreground leading-snug">{group.description}</p>
                <p className="text-[10px] text-muted-foreground mt-1 font-mono">{group.peers.length} institutions</p>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground">Active Peers:</span>
          {peers.map(peer => (
            <div
              key={peer.cert}
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-[11px] ${
                peer.cert === 21843
                  ? "bg-primary/10 border-primary/30 text-primary font-medium"
                  : peer.group === "custom"
                    ? "bg-amber-500/10 border-amber-500/20 text-foreground"
                    : "bg-muted/40 border-border/40 text-foreground"
              }`}
              data-testid={`peer-chip-${peer.cert}`}
            >
              <span>{PEER_DISPLAY_MAP[peer.cert] || peer.name}</span>
              <span className="text-[9px] text-muted-foreground font-mono">({peer.cert})</span>
              {peer.cert !== 21843 && (
                <button
                  className="ml-0.5 rounded-full p-0.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                  onClick={() => onRemovePeer(peer.cert)}
                  data-testid={`button-remove-peer-${peer.cert}`}
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px]"
            onClick={() => setShowAddForm(!showAddForm)}
            data-testid="button-toggle-add-peer"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Custom Peer
          </Button>
        </div>

        {showAddForm && (
          <div className="border border-border/50 rounded-lg p-3 space-y-2 bg-muted/20">
            <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground">Add Institution by FDIC CERT Number</p>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground mb-1 block">Name (auto-fills on validation)</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Institution name" className="h-8 text-xs" data-testid="input-peer-name" />
              </div>
              <div className="w-[120px]">
                <label className="text-[10px] text-muted-foreground mb-1 block">CERT Number</label>
                <Input
                  value={cert}
                  onChange={(e) => setCert(e.target.value)}
                  onBlur={handleCertBlur}
                  onKeyDown={(e) => e.key === "Enter" && handleCertBlur()}
                  placeholder="e.g. 628"
                  className="h-8 text-xs font-mono"
                  data-testid="input-peer-cert"
                />
              </div>
              <Button onClick={handleAdd} disabled={!cert.trim() || isValidating} size="sm" className="h-8" data-testid="button-add-peer">
                {isValidating ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Plus className="w-3 h-3 mr-1" />}
                Add
              </Button>
            </div>
            {validationMsg && (
              <p className={`text-xs ${validationMsg.isError ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`} data-testid="text-validation-msg">
                {validationMsg.text}
              </p>
            )}
          </div>
        )}
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

function ViewToggle({ view, onViewChange, testId }: { view: "table" | "chart"; onViewChange: (v: "table" | "chart") => void; testId: string }) {
  return (
    <div className="inline-flex items-center rounded-md border border-border/60 p-0.5 bg-muted/30" data-testid={testId}>
      <button
        onClick={() => onViewChange("table")}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
          view === "table" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
        data-testid={`${testId}-table`}
      >
        <TableIcon className="w-3 h-3" />
        Table
      </button>
      <button
        onClick={() => onViewChange("chart")}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
          view === "chart" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
        data-testid={`${testId}-chart`}
      >
        <BarChart3 className="w-3 h-3" />
        Chart
      </button>
    </div>
  );
}

function BasicComparisonChart({ banks }: { banks: PeerBank[] }) {
  const [selectedMetric, setSelectedMetric] = useState("totalAssets");
  const metrics: { key: keyof PeerBank; label: string; unit: string }[] = [
    { key: "totalAssets", label: "Total Assets", unit: "$M" },
    { key: "totalLoans", label: "Total Loans", unit: "$M" },
    { key: "totalDeposits", label: "Total Deposits", unit: "$M" },
    { key: "netIncome", label: "Net Income", unit: "$M" },
    { key: "securities", label: "Securities", unit: "$M" },
    { key: "equity", label: "Equity", unit: "$M" },
  ];
  const active = metrics.find(m => m.key === selectedMetric) || metrics[0];
  const chartData = banks.map(b => ({
    name: b.ticker,
    value: (b[active.key] as number) ?? 0,
    isMizuho: b.name === "Mizuho Americas",
  }));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        {metrics.map(m => (
          <button
            key={m.key}
            onClick={() => setSelectedMetric(m.key)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer border ${
              selectedMetric === m.key
                ? "bg-primary/10 border-primary/30 text-primary"
                : "border-border/40 text-muted-foreground hover:text-foreground hover:border-border"
            }`}
            data-testid={`button-basic-metric-${m.key}`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v.toLocaleString()} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={48} />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "6px", fontSize: "12px" }}
              formatter={(value: number) => [`$${value.toLocaleString()}M`, active.label]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.isMizuho ? "hsl(var(--chart-1))" : "hsl(var(--chart-3))"} fillOpacity={entry.isMizuho ? 1 : 0.6} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function BasicComparison({ banks, reportDate }: { banks: PeerBank[]; reportDate?: string }) {
  const [view, setView] = useState<"table" | "chart">("table");
  return (
    <Card data-testid="card-basic-comparison">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="text-sm">Basic Comparison — Call Report Data</CardTitle>
            <p className="text-[10px] text-muted-foreground mt-0.5">Raw regulatory data directly from submitted FFIEC 031/041 filings</p>
          </div>
          <div className="flex items-center gap-2">
            <ViewToggle view={view} onViewChange={setView} testId="toggle-basic-view" />
            <Badge variant="secondary" className="text-[10px]">Source: FDIC Call Reports</Badge>
            <Badge variant="outline" className="text-[10px] font-mono">{reportDate || "Latest"}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {view === "table" ? (
          <>
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sticky left-0 bg-card z-10 min-w-[160px]">Institution</TableHead>
                    <TableHead className="text-xs text-right">Total Assets ($M)</TableHead>
                    <TableHead className="text-xs text-right">Total Loans ($M)</TableHead>
                    <TableHead className="text-xs text-right">Total Deposits ($M)</TableHead>
                    <TableHead className="text-xs text-right">Net Income ($M)</TableHead>
                    <TableHead className="text-xs text-right">Securities ($M)</TableHead>
                    <TableHead className="text-xs text-right">Equity ($M)</TableHead>
                    <TableHead className="text-xs text-right">Loan/Deposit %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banks.map((bank, idx) => (
                    <TableRow
                      key={idx}
                      className={bank.name === "Mizuho Americas" ? "bg-primary/5 font-medium" : ""}
                      data-testid={`row-basic-${idx}`}
                    >
                      <TableCell className="text-xs py-2.5 font-medium sticky left-0 bg-card z-10">
                        <div className="flex items-center gap-2">
                          {bank.name === "Mizuho Americas" && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                          <span className="truncate">{bank.name}</span>
                          <Badge variant="outline" className="text-[10px] font-mono shrink-0">{bank.ticker}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs py-2.5 text-right font-mono">{bank.totalAssets.toLocaleString()}</TableCell>
                      <TableCell className="text-xs py-2.5 text-right font-mono">{bank.totalLoans.toLocaleString()}</TableCell>
                      <TableCell className="text-xs py-2.5 text-right font-mono">{bank.totalDeposits.toLocaleString()}</TableCell>
                      <TableCell className="text-xs py-2.5 text-right font-mono">{bank.netIncome.toLocaleString()}</TableCell>
                      <TableCell className="text-xs py-2.5 text-right font-mono">{bank.securities != null ? bank.securities.toLocaleString() : "—"}</TableCell>
                      <TableCell className="text-xs py-2.5 text-right font-mono">{bank.equity != null ? bank.equity.toLocaleString() : "—"}</TableCell>
                      <TableCell className="text-xs py-2.5 text-right font-mono">{formatPercent(bank.loanToDeposit)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
            <p className="text-[10px] text-muted-foreground mt-2">
              MDRM Fields: ASSET (RCFD2170), LNLSNET (RCFD2122), DEP (RCON2200), NETINC (RIAD4340), SC (RCFD8641), EQ (RCFD3210)
            </p>
          </>
        ) : (
          <BasicComparisonChart banks={banks} />
        )}
      </CardContent>
    </Card>
  );
}

function MetricsComparisonChart({ banks }: { banks: PeerBank[] }) {
  const metricsConfig = [
    { key: "roe", label: "ROE %", accessor: (b: PeerBank) => b.roe },
    { key: "roa", label: "ROA %", accessor: (b: PeerBank) => b.roa },
    { key: "nim", label: "NIM %", accessor: (b: PeerBank) => b.nim },
    { key: "cet1Ratio", label: "Tier 1 %", accessor: (b: PeerBank) => b.cet1Ratio },
    { key: "efficiencyRatio", label: "Efficiency %", accessor: (b: PeerBank) => b.efficiencyRatio },
    { key: "npaRatio", label: "NPA %", accessor: (b: PeerBank) => b.npaRatio },
    { key: "chargeOffRate", label: "NCO Rate %", accessor: (b: PeerBank) => b.chargeOffRate },
  ];
  const [selectedMetric, setSelectedMetric] = useState("roe");
  const active = metricsConfig.find(m => m.key === selectedMetric) || metricsConfig[0];
  const chartData = banks.map(b => ({
    name: b.ticker,
    value: parseFloat(active.accessor(b).toFixed(2)),
    isMizuho: b.name === "Mizuho Americas",
  }));
  const peers = banks.filter(b => b.name !== "Mizuho Americas");
  const avg = peers.reduce((s, b) => s + active.accessor(b), 0) / Math.max(1, peers.length);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        {metricsConfig.map(m => (
          <button
            key={m.key}
            onClick={() => setSelectedMetric(m.key)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer border ${
              selectedMetric === m.key
                ? "bg-primary/10 border-primary/30 text-primary"
                : "border-border/40 text-muted-foreground hover:text-foreground hover:border-border"
            }`}
            data-testid={`button-metrics-metric-${m.key}`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ left: 0, right: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "6px", fontSize: "12px" }}
              formatter={(value: number) => [`${value.toFixed(2)}%`, active.label]}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.isMizuho ? "hsl(var(--chart-1))" : "hsl(var(--chart-3))"} fillOpacity={entry.isMizuho ? 1 : 0.6} />
              ))}
            </Bar>
            <ReferenceLine y={parseFloat(avg.toFixed(2))} stroke="hsl(var(--chart-2))" strokeDasharray="6 3" strokeWidth={2} label={{ value: `Avg: ${avg.toFixed(2)}%`, position: "right", fontSize: 10, fill: "hsl(var(--chart-2))" }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function MetricsComparison({ banks, reportDate }: { banks: PeerBank[]; reportDate?: string }) {
  const [view, setView] = useState<"table" | "chart">("table");

  const peerAvg = (fn: (b: PeerBank) => number) => {
    const peers = banks.filter(b => b.name !== "Mizuho Americas");
    return peers.reduce((s, b) => s + fn(b), 0) / (peers.length || 1);
  };

  return (
    <Card data-testid="card-metrics-comparison">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="text-sm">Standard Metrics & Ratios — UBPR / Fed Assessment</CardTitle>
            <p className="text-[10px] text-muted-foreground mt-0.5">Key performance ratios used by the Federal Reserve in supervisory assessments (UBPR Page 1 equivalent)</p>
          </div>
          <div className="flex items-center gap-2">
            <ViewToggle view={view} onViewChange={setView} testId="toggle-metrics-view" />
            <Badge variant="secondary" className="text-[10px]">Source: FDIC + Derived</Badge>
            <Badge variant="outline" className="text-[10px] font-mono">{reportDate || "Latest"}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {view === "table" ? (
          <>
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sticky left-0 bg-card z-10 min-w-[160px]">Institution</TableHead>
                    <TableHead className="text-xs text-right">ROE %</TableHead>
                    <TableHead className="text-xs text-right">ROA %</TableHead>
                    <TableHead className="text-xs text-right">NIM %</TableHead>
                    <TableHead className="text-xs text-right">Tier 1 %</TableHead>
                    <TableHead className="text-xs text-right">Total Cap %</TableHead>
                    <TableHead className="text-xs text-right">Efficiency %</TableHead>
                    <TableHead className="text-xs text-right">NPA %</TableHead>
                    <TableHead className="text-xs text-right">NCO Rate %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banks.map((bank, idx) => {
                    const isMizuho = bank.name === "Mizuho Americas";
                    return (
                      <TableRow
                        key={idx}
                        className={isMizuho ? "bg-primary/5 font-medium" : ""}
                        data-testid={`row-metrics-${idx}`}
                      >
                        <TableCell className="text-xs py-2.5 font-medium sticky left-0 bg-card z-10">
                          <div className="flex items-center gap-2">
                            {isMizuho && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                            <span className="truncate">{bank.name}</span>
                            <Badge variant="outline" className="text-[10px] font-mono shrink-0">{bank.ticker}</Badge>
                          </div>
                        </TableCell>
                        <TableCell className={`text-xs py-2.5 text-right font-mono ${isMizuho && bank.roe < peerAvg(b => b.roe) ? "text-amber-600 dark:text-amber-400" : ""}`}>
                          {formatPercent(bank.roe)}
                        </TableCell>
                        <TableCell className="text-xs py-2.5 text-right font-mono">{formatPercent(bank.roa)}</TableCell>
                        <TableCell className="text-xs py-2.5 text-right font-mono">{formatPercent(bank.nim)}</TableCell>
                        <TableCell className="text-xs py-2.5 text-right font-mono">{formatPercent(bank.cet1Ratio)}</TableCell>
                        <TableCell className="text-xs py-2.5 text-right font-mono">{bank.totalCapitalRatio != null ? formatPercent(bank.totalCapitalRatio) : "—"}</TableCell>
                        <TableCell className={`text-xs py-2.5 text-right font-mono ${bank.efficiencyRatio > 65 ? "text-amber-600 dark:text-amber-400" : ""}`}>
                          {formatPercent(bank.efficiencyRatio)}
                        </TableCell>
                        <TableCell className="text-xs py-2.5 text-right font-mono">{formatPercent(bank.npaRatio)}</TableCell>
                        <TableCell className="text-xs py-2.5 text-right font-mono">{formatPercent(bank.chargeOffRate)}</TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow className="border-t-2 border-primary/20 bg-muted/30">
                    <TableCell className="text-xs py-2 font-semibold sticky left-0 bg-muted/30 z-10">Peer Average</TableCell>
                    <TableCell className="text-xs py-2 text-right font-mono font-semibold">{formatPercent(peerAvg(b => b.roe))}</TableCell>
                    <TableCell className="text-xs py-2 text-right font-mono font-semibold">{formatPercent(peerAvg(b => b.roa))}</TableCell>
                    <TableCell className="text-xs py-2 text-right font-mono font-semibold">{formatPercent(peerAvg(b => b.nim))}</TableCell>
                    <TableCell className="text-xs py-2 text-right font-mono font-semibold">{formatPercent(peerAvg(b => b.cet1Ratio))}</TableCell>
                    <TableCell className="text-xs py-2 text-right font-mono font-semibold">{formatPercent(peerAvg(b => b.totalCapitalRatio ?? 0))}</TableCell>
                    <TableCell className="text-xs py-2 text-right font-mono font-semibold">{formatPercent(peerAvg(b => b.efficiencyRatio))}</TableCell>
                    <TableCell className="text-xs py-2 text-right font-mono font-semibold">{formatPercent(peerAvg(b => b.npaRatio))}</TableCell>
                    <TableCell className="text-xs py-2 text-right font-mono font-semibold">{formatPercent(peerAvg(b => b.chargeOffRate))}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </ScrollArea>
            <p className="text-[10px] text-muted-foreground mt-2">
              UBPR Fields: ROE, ROA, NIMY (NIM), RBC1AAJ (Tier 1), EEFF-derived (Efficiency), P3ASSET-derived (NPA), ELNANTR (NCO Rate)
            </p>
          </>
        ) : (
          <MetricsComparisonChart banks={banks} />
        )}
      </CardContent>
    </Card>
  );
}

function TrendCharts({ trendROE, trendNIM, trendCET1, bankNames }: { trendROE: PeerTrendData[]; trendNIM: PeerTrendData[]; trendCET1: PeerTrendData[]; bankNames: string[] }) {
  const [selectedMetric, setSelectedMetric] = useState("roe");
  const [view, setView] = useState<"table" | "chart">("chart");

  const metricData = selectedMetric === "roe" ? trendROE : selectedMetric === "nim" ? trendNIM : trendCET1;
  const allBankNames = metricData.length > 0 ? Object.keys(metricData[0]).filter(k => k !== "period") : bankNames;
  const metricLabel = selectedMetric === "roe" ? "ROE %" : selectedMetric === "nim" ? "NIM %" : "Tier 1 %";

  return (
    <Card data-testid="card-trend-charts">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-sm">Peer Trend Comparison</CardTitle>
          <div className="flex items-center gap-2">
            <ViewToggle view={view} onViewChange={setView} testId="toggle-trend-view" />
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
        </div>
      </CardHeader>
      <CardContent>
        {view === "chart" ? (
          <div className="h-[280px]">
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
        ) : (
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sticky left-0 bg-card z-10 min-w-[120px]">Period</TableHead>
                  {allBankNames.map(name => (
                    <TableHead key={name} className="text-xs text-right min-w-[100px]">
                      {PEER_DISPLAY_MAP[Object.entries(PEER_DISPLAY_MAP).find(([, v]) => v === name)?.[0] as unknown as number] || name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {metricData.map((row, idx) => (
                  <TableRow key={idx} data-testid={`row-trend-${idx}`}>
                    <TableCell className="text-xs py-2 font-medium sticky left-0 bg-card z-10 font-mono">{row.period}</TableCell>
                    {allBankNames.map(name => (
                      <TableCell
                        key={name}
                        className={`text-xs py-2 text-right font-mono ${name === "Mizuho Americas" ? "font-semibold text-primary" : ""}`}
                      >
                        {row[name] != null ? formatPercent(row[name] as number) : "—"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

function RadarComparison({ banks }: { banks: PeerBank[] }) {
  const radarData = buildRadarData(banks);
  return (
    <Card data-testid="card-radar-comparison">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Mizuho vs Peer Average — Performance Profile</CardTitle>
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
    ROE: parseFloat(bank.roe.toFixed(2)),
    ROA: parseFloat(bank.roa.toFixed(2)),
  }));

  const capitalData = banks.map((bank) => ({
    name: bank.ticker,
    "Tier 1 Ratio": parseFloat(bank.cet1Ratio.toFixed(2)),
    "Leverage": parseFloat(bank.leverageRatio.toFixed(2)),
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
                  formatter={(value: number) => [`${Number(value).toFixed(2)}%`, ""]}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="ROE" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ROA" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">Source: FDIC Call Reports (FFIEC 031/041) — ROE and ROA fields</p>
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
                  formatter={(value: number) => [`${Number(value).toFixed(2)}%`, ""]}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="Tier 1 Ratio" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Leverage" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">Source: FDIC Call Reports — RBC1AAJ (Tier 1), RBCT1J/ASSET (leverage)</p>
        </CardContent>
      </Card>
    </div>
  );
}

function MarketRiskComparison({ entries, bankNames }: { entries: LivePeerEntry[]; bankNames: string[] }) {
  const banksWithData = entries.filter(e => e.ffiec102 && e.ffiec102.length > 0);

  if (banksWithData.length === 0) {
    return (
      <Card data-testid="card-market-risk-empty">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground">No FFIEC 102 Market Risk data available for the selected peer group.</p>
        </CardContent>
      </Card>
    );
  }

  const latestQuarter = banksWithData[0].ffiec102![banksWithData[0].ffiec102!.length - 1].period;

  const profitableDaysData = banksWithData.map((e, idx) => {
    const latest = e.ffiec102![e.ffiec102!.length - 1];
    return {
      name: tickerMap[e.name] || e.name.slice(0, 4).toUpperCase(),
      fullName: e.name,
      profitableDays: latest.profitableDays,
      unprofitableDays: latest.unprofitableDays,
      tradingDays: latest.tradingDays,
      profitableDaysPct: latest.profitableDaysPct,
      isMizuho: e.name === "Mizuho Americas",
    };
  }).sort((a, b) => b.profitableDays - a.profitableDays);

  const trendPeriods = new Set<string>();
  banksWithData.forEach(e => e.ffiec102!.forEach(q => trendPeriods.add(q.period)));
  const sortedPeriods = Array.from(trendPeriods).sort((a, b) => {
    const [qa, ya] = a.replace("Q", "").split(" ");
    const [qb, yb] = b.replace("Q", "").split(" ");
    return (parseInt(ya) * 4 + parseInt(qa)) - (parseInt(yb) * 4 + parseInt(qb));
  });

  const trendData = sortedPeriods.map(period => {
    const point: Record<string, number | string> = { period };
    banksWithData.forEach(e => {
      const q = e.ffiec102!.find(q => q.period === period);
      if (q) point[e.name] = q.profitableDays;
    });
    return point;
  });

  const revenueData = banksWithData.map(e => {
    const latest = e.ffiec102![e.ffiec102!.length - 1];
    return {
      name: tickerMap[e.name] || e.name.slice(0, 4).toUpperCase(),
      fullName: e.name,
      totalRevenue: Math.round(latest.totalTradingRevenue * 100) / 100,
      avgDailyPnL: Math.round(latest.averageDailyPnL * 100) / 100,
      isMizuho: e.name === "Mizuho Americas",
    };
  }).sort((a, b) => b.totalRevenue - a.totalRevenue);

  return (
    <div className="space-y-4">
      <Card data-testid="card-profitable-days-bar">
        <CardHeader className="pb-1">
          <CardTitle className="text-sm">Profitable Trading Days — {latestQuarter}</CardTitle>
          <p className="text-[11px] text-muted-foreground">Number of profitable vs unprofitable trading days per institution (FFIEC 102 daily P&L)</p>
        </CardHeader>
        <CardContent>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitableDaysData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-md border bg-card p-2.5 text-xs shadow-md space-y-1">
                        <p className="font-medium">{d.fullName}</p>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                          <span>Profitable: {d.profitableDays} days ({d.profitableDaysPct}%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-sm bg-red-400 inline-block" />
                          <span>Unprofitable: {d.unprofitableDays} days</span>
                        </div>
                        <p className="text-muted-foreground">Total: {d.tradingDays} trading days</p>
                      </div>
                    );
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="profitableDays" name="Profitable Days" stackId="days" fill="#10b981" radius={[0, 0, 0, 0]}>
                  {profitableDaysData.map((d, i) => (
                    <Cell key={i} fill={d.isMizuho ? "hsl(226, 69%, 30%)" : "#10b981"} />
                  ))}
                </Bar>
                <Bar dataKey="unprofitableDays" name="Unprofitable Days" stackId="days" fill="#f87171" radius={[4, 4, 0, 0]}>
                  {profitableDaysData.map((d, i) => (
                    <Cell key={i} fill={d.isMizuho ? "hsl(351, 85%, 52%)" : "#f87171"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">Source: FFIEC 102 Market Risk Capital Rule — Daily Trading P&L ({latestQuarter})</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card data-testid="card-profitable-days-trend">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm">Profitable Days Trend (8 Quarters)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={[0, 'auto']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [`${value} days`, ""]}
                  />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                  {banksWithData.map((e, idx) => (
                    <Line
                      key={e.name}
                      type="monotone"
                      dataKey={e.name}
                      stroke={getBankColor(e.name, idx)}
                      strokeWidth={e.name === "Mizuho Americas" ? 2.5 : 1.5}
                      dot={(props: any) => {
                        const { cx, cy } = props;
                        if (typeof cx !== 'number' || typeof cy !== 'number') return <circle cx={0} cy={0} r={0} fill="none" />;
                        return <circle cx={cx} cy={cy} r={e.name === "Mizuho Americas" ? 3 : 2} fill={getBankColor(e.name, idx)} />;
                      }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Source: FFIEC 102 — Profitable trading days per quarter</p>
          </CardContent>
        </Card>

        <Card data-testid="card-trading-revenue-bar">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm">Trading Revenue — {latestQuarter}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
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
                    content={({ active, payload }) => {
                      if (!active || !payload || payload.length === 0) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="rounded-md border bg-card p-2.5 text-xs shadow-md space-y-1">
                          <p className="font-medium">{d.fullName}</p>
                          <p>Total Revenue: ${d.totalRevenue.toFixed(1)}M</p>
                          <p>Avg Daily P&L: ${d.avgDailyPnL.toFixed(2)}M</p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="totalRevenue" name="Total Trading Revenue ($M)" radius={[4, 4, 0, 0]}>
                    {revenueData.map((d, i) => (
                      <Cell key={i} fill={d.isMizuho ? "hsl(226, 69%, 30%)" : "hsl(var(--chart-3))"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Source: FFIEC 102 — Quarterly trading revenue ($M)</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-market-risk-table">
        <CardHeader className="pb-1">
          <CardTitle className="text-sm">FFIEC 102 Market Risk Summary — {latestQuarter}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[11px] font-medium">Institution</TableHead>
                  <TableHead className="text-[11px] font-medium text-right">Trading Days</TableHead>
                  <TableHead className="text-[11px] font-medium text-right">Profitable Days</TableHead>
                  <TableHead className="text-[11px] font-medium text-right">% Profitable</TableHead>
                  <TableHead className="text-[11px] font-medium text-right">Total Revenue ($M)</TableHead>
                  <TableHead className="text-[11px] font-medium text-right">Avg Daily P&L ($M)</TableHead>
                  <TableHead className="text-[11px] font-medium text-right">Max Gain ($M)</TableHead>
                  <TableHead className="text-[11px] font-medium text-right">Max Loss ($M)</TableHead>
                  <TableHead className="text-[11px] font-medium text-right">VaR Breaches</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banksWithData.map((e, idx) => {
                  const q = e.ffiec102![e.ffiec102!.length - 1];
                  const isMizuho = e.name === "Mizuho Americas";
                  return (
                    <TableRow
                      key={idx}
                      className={isMizuho ? "bg-primary/5 font-medium" : ""}
                      data-testid={`row-market-risk-${idx}`}
                    >
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3 h-3 text-muted-foreground" />
                          {e.name}
                          {isMizuho && <Badge variant="outline" className="text-[9px] px-1 py-0">Mizuho</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-right">{q.tradingDays}</TableCell>
                      <TableCell className="text-xs font-mono text-right">{q.profitableDays}</TableCell>
                      <TableCell className="text-xs font-mono text-right">
                        <span className={q.profitableDaysPct >= 70 ? "text-emerald-600 dark:text-emerald-400" : q.profitableDaysPct >= 50 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}>
                          {q.profitableDaysPct.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-right">{q.totalTradingRevenue.toFixed(1)}</TableCell>
                      <TableCell className="text-xs font-mono text-right">{q.averageDailyPnL.toFixed(2)}</TableCell>
                      <TableCell className="text-xs font-mono text-right text-emerald-600 dark:text-emerald-400">{q.maxDailyGain.toFixed(2)}</TableCell>
                      <TableCell className="text-xs font-mono text-right text-red-600 dark:text-red-400">{q.maxDailyLoss.toFixed(2)}</TableCell>
                      <TableCell className="text-xs font-mono text-right">
                        <Badge variant={q.varBreaches === 0 ? "secondary" : "destructive"} className="text-[10px] px-1.5">
                          {q.varBreaches}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            Source: FFIEC 102 Market Risk Capital Rule — Daily trading P&L, VaR backtesting. Revenue figures in millions ($M).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function PeerComparisonContent() {
  const queryClient = useQueryClient();
  const [selectedGroup, setSelectedGroup] = useState("japanese");
  const [customPeers, setCustomPeers] = useState<PeerConfig[]>([]);
  const [removedCerts, setRemovedCerts] = useState<Set<number>>(new Set());

  const activePeers = useMemo(() => {
    const group = PEER_GROUPS.find(g => g.id === selectedGroup);
    if (!group) return [];
    const groupPeers = group.peers.filter(p => !removedCerts.has(p.cert));
    return [...groupPeers, ...customPeers];
  }, [selectedGroup, customPeers, removedCerts]);

  const allCerts = activePeers.map(p => p.cert);
  const certsParam = allCerts.length > 0 ? `?certs=${allCerts.join(",")}` : "";

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

  const activeCertSet = new Set(allCerts);
  const liveEntries = (data?.data || []).filter(e => activeCertSet.has(e.cert));

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

  const handleGroupChange = useCallback((groupId: string) => {
    setSelectedGroup(groupId);
    setRemovedCerts(new Set());
    setCustomPeers([]);
    queryClient.invalidateQueries({ queryKey: ["/api/data-sources/peer-data"] });
  }, [queryClient]);

  const handleAddCustom = useCallback((peer: PeerConfig) => {
    setCustomPeers(prev => [...prev, peer]);
    queryClient.invalidateQueries({ queryKey: ["/api/data-sources/peer-data"] });
  }, [queryClient]);

  const handleRemovePeer = useCallback((cert: number) => {
    setCustomPeers(prev => prev.filter(p => p.cert !== cert));
    setRemovedCerts(prev => { const next = new Set(prev); next.add(cert); return next; });
  }, []);

  const mizuho = peerBanks.find(b => b.name === "Mizuho Americas") || peerBanks[0];
  const peersOnly = peerBanks.filter(b => b.name !== "Mizuho Americas");
  const peerAvg = (fn: (b: PeerBank) => number) => peersOnly.reduce((s, b) => s + fn(b), 0) / Math.max(1, peersOnly.length);

  const roeRank = [...peerBanks].sort((a, b) => b.roe - a.roe).findIndex((b) => b.name === "Mizuho Americas") + 1;
  const nimRank = [...peerBanks].sort((a, b) => b.nim - a.nim).findIndex((b) => b.name === "Mizuho Americas") + 1;
  const cet1Rank = [...peerBanks].sort((a, b) => b.cet1Ratio - a.cet1Ratio).findIndex((b) => b.name === "Mizuho Americas") + 1;
  const effRank = [...peerBanks].sort((a, b) => a.efficiencyRatio - b.efficiencyRatio).findIndex((b) => b.name === "Mizuho Americas") + 1;

  const activeGroupLabel = PEER_GROUPS.find(g => g.id === selectedGroup)?.label || selectedGroup;
  const bankNames = peerBanks.map(b => b.name);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-mono font-medium text-destructive tracking-[0.12em] uppercase">Peer Comparison</p>
          <Badge variant="outline" className="text-[10px] font-mono">{activeGroupLabel}</Badge>
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
        <h2 className="text-xl font-serif font-semibold tracking-tight" data-testid="text-peer-comparison-title">
          Peer Benchmarking
        </h2>
        <p className="text-sm text-muted-foreground max-w-[720px]">
          Benchmarking Mizuho Americas against {activeGroupLabel} using publicly available regulatory data from FDIC Call Reports (FFIEC 031/041) and derived UBPR-equivalent ratios.
          {isLive && ` Live data as of ${reportDate}.`}
        </p>
      </div>

      <PeerGroupSelector
          selectedGroup={selectedGroup}
          onGroupChange={handleGroupChange}
          peers={activePeers}
          onAddCustom={handleAddCustom}
          onRemovePeer={handleRemovePeer}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <MetricCard
            label="Return on Equity"
            value={formatPercent(mizuho.roe)}
            rank={roeRank}
            total={peerBanks.length}
            positive={mizuho.roe > peerAvg(b => b.roe)}
          />
          <MetricCard
            label="Net Interest Margin"
            value={formatPercent(mizuho.nim)}
            rank={nimRank}
            total={peerBanks.length}
            positive={mizuho.nim > peerAvg(b => b.nim)}
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
            positive={mizuho.efficiencyRatio < peerAvg(b => b.efficiencyRatio)}
          />
        </div>

        <Tabs defaultValue="overview" className="space-y-3">
          <TabsList data-testid="tabs-peer-analysis">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="basic" data-testid="tab-basic">Basic Comparison</TabsTrigger>
            <TabsTrigger value="metrics" data-testid="tab-metrics">Standard Metrics</TabsTrigger>
            <TabsTrigger value="trends" data-testid="tab-trends">Trend Analysis</TabsTrigger>
            <TabsTrigger value="market-risk" data-testid="tab-market-risk">Market Risk (FFIEC 102)</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <RadarComparison banks={peerBanks} />
              <Card data-testid="card-peer-summary">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Peer Group Summary — {activeGroupLabel}</CardTitle>
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

          <TabsContent value="basic" className="space-y-4">
            <BasicComparison banks={peerBanks} reportDate={reportDate} />
            <Card className="border-dashed border-primary/20 bg-primary/[0.02]" data-testid="card-expandability-note">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Extensible Data Model</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      Additional Call Report fields (repo volume, off-balance sheet items, trading assets, derivative notionals) can be added to this comparison. Use the "Add Custom Peer" button above to include any FDIC-insured institution by CERT number. The FDIC BankFind Suite API provides access to all FFIEC 031/041 line items.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <MetricsComparison banks={peerBanks} reportDate={reportDate} />
            <Card className="border-dashed border-primary/20 bg-primary/[0.02]" data-testid="card-ratio-extensibility">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Configurable Ratios</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      This view mirrors the UBPR (Uniform Bank Performance Report) metrics used by the Federal Reserve during supervisory assessments. Additional ratios such as Texas Ratio, Liquidity Coverage Ratio, and Net Stable Funding Ratio can be derived from the same Call Report data and added to this comparison as needed.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <TrendCharts trendROE={peerTrendROE} trendNIM={peerTrendNIM} trendCET1={peerTrendCET1} bankNames={bankNames} />
          </TabsContent>

          <TabsContent value="market-risk" className="space-y-4">
            <MarketRiskComparison entries={liveEntries} bankNames={bankNames} />
          </TabsContent>
        </Tabs>

      <div className="border-t pt-4 pb-2">
        <p className="text-xs text-muted-foreground">
          Data sourced from FDIC BankFind Suite API (Call Reports FFIEC 031/041), FFIEC 102 Market Risk reports, and derived UBPR-equivalent ratios.
          {isLive ? ` Live data as of ${reportDate}.` : " All figures as of latest available filing unless otherwise noted."}
          {" "}Peer group: {activeGroupLabel} — {peerBanks.length} institution{peerBanks.length !== 1 ? "s" : ""}.
          {" "}Additional peers and ratios can be added on demand.
        </p>
      </div>
    </div>
  );
}

export default function PeerAnalysis() {
  const [activeSection, setActiveSection] = useState<"ingestion" | "comparison">("ingestion");

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[1200px] mx-auto p-6 space-y-6">
        <div className="space-y-1">
          <p className="text-[10px] font-mono font-medium text-destructive tracking-[0.12em] uppercase">Use Case 2</p>
          <h1 className="text-2xl font-serif font-semibold tracking-tight" data-testid="text-peer-title">
            Peer Analysis & Comparison
          </h1>
          <p className="text-sm text-muted-foreground">
            Real-time data ingestion from federal regulatory portals and peer benchmarking against comparable institutions
          </p>
        </div>

        <div className="flex items-center gap-1 border-b">
          <button
            onClick={() => setActiveSection("ingestion")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeSection === "ingestion"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
            data-testid="tab-section-ingestion"
          >
            <Database className="w-4 h-4" />
            Data Ingestion
          </button>
          <button
            onClick={() => setActiveSection("comparison")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeSection === "comparison"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
            data-testid="tab-section-comparison"
          >
            <BarChart3 className="w-4 h-4" />
            Peer Comparison
          </button>
        </div>

        {activeSection === "ingestion" && <DataIngestionContent />}
        {activeSection === "comparison" && <PeerComparisonContent />}
      </div>
    </div>
  );
}
