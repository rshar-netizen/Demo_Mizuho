import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  Database,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  FileText,
  BarChart3,
  Building2,
  Loader2,
  Activity,
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface DataSourceStatus {
  source: string;
  status: "connected" | "degraded" | "error";
  lastChecked: number;
  responseTimeMs: number;
  message: string;
  reportType: string;
  entity: string;
  identifier: string;
}

interface StatusResponse {
  sources: DataSourceStatus[];
  cache: { entries: number; oldestEntry: number | null };
  lastRefresh: number;
}

interface CallReportRecord {
  reportDate: string;
  rawDate: string;
  institutionName: string;
  cert: number;
  totalAssets: number;
  totalDeposits: number;
  netIncome: number;
  totalLoansAndLeases: number;
  roe: number;
  roa: number;
  nim: number;
  tier1Ratio: number;
  totalCapitalRatio: number;
  efficiencyRatio: number;
  npaRatio: number;
  chargeOffRate: number;
}

interface CallReportResponse {
  source: string;
  reportType: string;
  cert: number;
  recordCount: number;
  fetchedAt: string;
  data: CallReportRecord[];
}

interface PeerDataEntry {
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
    totalCapitalRatio: number;
    efficiencyRatio: number;
    npaRatio: number;
    chargeOffRate: number;
  } | null;
  historicalData: Array<{
    period: string;
    totalAssets: number;
    totalDeposits: number;
    netIncome: number;
    roe: number;
    nim: number;
    tier1Ratio: number;
  }>;
}

interface PeerDataResponse {
  sources: string[];
  fetchedAt: string;
  peerCount: number;
  data: PeerDataEntry[];
}

function StatusIcon({ status }: { status: string }) {
  if (status === "connected") return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
  if (status === "degraded") return <AlertCircle className="w-5 h-5 text-amber-500" />;
  return <XCircle className="w-5 h-5 text-red-500" />;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "connected") return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0">Connected</Badge>;
  if (status === "degraded") return <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0">Degraded</Badge>;
  return <Badge variant="destructive">Error</Badge>;
}

function SourceIcon({ source }: { source: string }) {
  if (source.includes("FDIC")) return <Database className="w-5 h-5" />;
  if (source.includes("FFIEC")) return <FileText className="w-5 h-5" />;
  return <Building2 className="w-5 h-5" />;
}

function formatNumber(val: number | null | undefined): string {
  if (val === null || val === undefined) return "N/A";
  if (Math.abs(val) >= 1000000) return `$${(val / 1000000).toFixed(1)}B`;
  if (Math.abs(val) >= 1000) return `$${(val / 1000).toFixed(1)}M`;
  return `$${val.toLocaleString()}K`;
}

function formatPct(val: number | null | undefined): string {
  if (val === null || val === undefined) return "N/A";
  return `${val.toFixed(2)}%`;
}

function DataSourceCards({ sources, isLoading }: { sources: DataSourceStatus[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-5">
              <div className="h-24 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {sources.map((src, idx) => (
        <Card key={idx} data-testid={`card-source-${idx}`}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <SourceIcon source={src.source} />
                </div>
                <div>
                  <p className="text-sm font-semibold">{src.source}</p>
                  <p className="text-xs text-muted-foreground">{src.reportType}</p>
                </div>
              </div>
              <StatusIcon status={src.status} />
            </div>

            <Separator className="my-3" />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Entity</span>
                <span className="text-xs font-medium">{src.entity}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Identifier</span>
                <Badge variant="outline" className="text-xs font-mono">{src.identifier}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Response Time</span>
                <span className="text-xs font-mono">{src.responseTimeMs}ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Status</span>
                <StatusBadge status={src.status} />
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">{src.message}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


function CallReportTab() {
  const { data, isLoading, error } = useQuery<CallReportResponse>({
    queryKey: ["/api/data-sources/call-reports"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Fetching Call Report data from FDIC...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-amber-500" />
          <p className="text-sm font-medium">Unable to fetch Call Report data</p>
          <p className="text-xs text-muted-foreground mt-1">The FDIC BankFind API may be temporarily unavailable</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{data.recordCount}</p>
            <p className="text-xs text-muted-foreground">Quarterly Reports</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold font-mono">{data.cert}</p>
            <p className="text-xs text-muted-foreground">FDIC CERT #</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{data.data[0]?.reportDate || "N/A"}</p>
            <p className="text-xs text-muted-foreground">Latest Period</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
            <p className="text-xs text-muted-foreground">Live Data</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-call-report-table">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-sm">Mizuho Bank, Ltd. - Call Report Financial Data</CardTitle>
            <Badge variant="secondary">Source: {data.source}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Period</TableHead>
                  <TableHead className="text-xs text-right">Total Assets</TableHead>
                  <TableHead className="text-xs text-right">Total Deposits</TableHead>
                  <TableHead className="text-xs text-right">Total Loans</TableHead>
                  <TableHead className="text-xs text-right">Net Income</TableHead>
                  <TableHead className="text-xs text-right">ROE %</TableHead>
                  <TableHead className="text-xs text-right">ROA %</TableHead>
                  <TableHead className="text-xs text-right">NIM %</TableHead>
                  <TableHead className="text-xs text-right">Tier 1 %</TableHead>
                  <TableHead className="text-xs text-right">Efficiency %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((record, idx) => (
                  <TableRow key={idx} data-testid={`row-call-report-${idx}`}>
                    <TableCell className="text-xs py-2 font-medium">
                      <Badge variant="outline" className="text-xs">{record.reportDate}</Badge>
                    </TableCell>
                    <TableCell className="text-xs py-2 text-right font-mono">{formatNumber(record.totalAssets)}</TableCell>
                    <TableCell className="text-xs py-2 text-right font-mono">{formatNumber(record.totalDeposits)}</TableCell>
                    <TableCell className="text-xs py-2 text-right font-mono">{formatNumber(record.totalLoansAndLeases)}</TableCell>
                    <TableCell className="text-xs py-2 text-right font-mono">{formatNumber(record.netIncome)}</TableCell>
                    <TableCell className="text-xs py-2 text-right font-mono">{formatPct(record.roe)}</TableCell>
                    <TableCell className="text-xs py-2 text-right font-mono">{formatPct(record.roa)}</TableCell>
                    <TableCell className="text-xs py-2 text-right font-mono">{formatPct(record.nim)}</TableCell>
                    <TableCell className="text-xs py-2 text-right font-mono">{formatPct(record.tier1Ratio)}</TableCell>
                    <TableCell className="text-xs py-2 text-right font-mono">{formatPct(record.efficiencyRatio)}</TableCell>
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

function PeerDataTab() {
  const { data, isLoading, error } = useQuery<PeerDataResponse>({
    queryKey: ["/api/data-sources/peer-data"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Fetching peer institution data from federal portals...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-amber-500" />
          <p className="text-sm font-medium">Unable to fetch peer data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{data.peerCount}</p>
            <p className="text-xs text-muted-foreground">Peer Institutions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{data.sources.length}</p>
            <p className="text-xs text-muted-foreground">Data Sources</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm font-bold">{new Date(data.fetchedAt).toLocaleTimeString()}</p>
            <p className="text-xs text-muted-foreground">Last Fetched</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-peer-data-table">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-sm">Peer Institution Financial Comparison (Live Data)</CardTitle>
            <div className="flex gap-1">
              {data.sources.map((s, i) => (
                <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Institution</TableHead>
                  <TableHead className="text-xs">CERT / RSSD</TableHead>
                  <TableHead className="text-xs">Period</TableHead>
                  <TableHead className="text-xs text-right">Total Assets</TableHead>
                  <TableHead className="text-xs text-right">Total Deposits</TableHead>
                  <TableHead className="text-xs text-right">Net Income</TableHead>
                  <TableHead className="text-xs text-right">ROE %</TableHead>
                  <TableHead className="text-xs text-right">NIM %</TableHead>
                  <TableHead className="text-xs text-right">Tier 1 %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((peer, idx) => (
                  <TableRow
                    key={idx}
                    className={peer.name === "Mizuho Americas" ? "bg-primary/5" : ""}
                    data-testid={`row-peer-live-${idx}`}
                  >
                    <TableCell className="text-xs py-2 font-medium">
                      <div className="flex items-center gap-2">
                        {peer.name === "Mizuho Americas" && (
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        )}
                        {peer.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs py-2">
                      <Badge variant="outline" className="text-xs font-mono">
                        {peer.cert}{peer.rssd ? ` / ${peer.rssd}` : ""}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs py-2">{peer.callReport?.reportDate || "N/A"}</TableCell>
                    <TableCell className="text-xs py-2 text-right font-mono">{formatNumber(peer.callReport?.totalAssets)}</TableCell>
                    <TableCell className="text-xs py-2 text-right font-mono">{formatNumber(peer.callReport?.totalDeposits)}</TableCell>
                    <TableCell className="text-xs py-2 text-right font-mono">{formatNumber(peer.callReport?.netIncome)}</TableCell>
                    <TableCell className="text-xs py-2 text-right font-mono">{formatPct(peer.callReport?.roe)}</TableCell>
                    <TableCell className="text-xs py-2 text-right font-mono">{formatPct(peer.callReport?.nim)}</TableCell>
                    <TableCell className="text-xs py-2 text-right font-mono">{formatPct(peer.callReport?.tier1Ratio)}</TableCell>
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

export function DataIngestionContent() {
  const statusQuery = useQuery<StatusResponse>({
    queryKey: ["/api/data-sources/status"],
    refetchInterval: 60000,
  });

  const refreshMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/data-sources/refresh"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/data-sources"] });
    },
  });

  const sources = statusQuery.data?.sources || [];
  const connectedCount = sources.filter((s) => s.status === "connected").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-mono font-medium text-destructive tracking-[0.12em] uppercase">Data Sources</p>
            <Badge variant="outline" className="text-[10px] font-mono">
              {connectedCount}/{sources.length} Active
            </Badge>
          </div>
          <h2 className="text-xl font-serif font-semibold tracking-tight" data-testid="text-ingestion-title">
            Federal Data Ingestion
          </h2>
          <p className="text-sm text-muted-foreground">
            Real-time API linkages to FDIC, FFIEC CDR, and Federal Reserve portals for Mizuho Americas LLC
          </p>
        </div>

        <Button
          onClick={() => refreshMutation.mutate()}
          disabled={refreshMutation.isPending}
          data-testid="button-refresh-all"
        >
          {refreshMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh All Sources
        </Button>
      </div>

      <DataSourceCards sources={sources} isLoading={statusQuery.isLoading} />

      {statusQuery.data?.cache && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Cache: {statusQuery.data.cache.entries} entries</span>
          </div>
          {statusQuery.data.cache.oldestEntry && (
            <span>Oldest: {new Date(statusQuery.data.cache.oldestEntry).toLocaleTimeString()}</span>
          )}
          <span>Auto-refresh: 30 min TTL</span>
        </div>
      )}

      <Tabs defaultValue="call-reports" className="space-y-4">
        <TabsList data-testid="tabs-data-ingestion">
          <TabsTrigger value="call-reports" data-testid="tab-call-reports">
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            Call Reports
          </TabsTrigger>
          <TabsTrigger value="peer-data" data-testid="tab-peer-data">
            <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
            Peer Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="call-reports" className="space-y-4">
          <CallReportTab />
        </TabsContent>

        <TabsContent value="peer-data" className="space-y-4">
          <PeerDataTab />
        </TabsContent>
      </Tabs>

      <div className="border-t pt-4 pb-2">
        <p className="text-xs text-muted-foreground">
          Data sourced in real-time from FDIC BankFind Suite API, FFIEC Central Data Repository, and Federal Reserve National Information Center.
          All data is publicly available regulatory filing information. Mizuho Bank (USA) (RSSD: 229913, CERT: 21843).
        </p>
      </div>
    </div>
  );
}
