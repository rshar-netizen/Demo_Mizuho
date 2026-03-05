import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Link2,
  Plug,
  Wifi,
  Plus,
  Trash2,
  Globe,
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

const FEDERAL_SYSTEMS = [
  {
    id: "fdic",
    name: "FDIC BankFind Suite",
    defaultUrl: "https://api.fdic.gov/api",
    description: "Call Reports (FFIEC 031/041)",
    idType: "CERT" as const,
    defaultId: "21843",
    icon: Database,
    color: "blue",
  },
  {
    id: "ffiec",
    name: "FFIEC Central Data Repository",
    defaultUrl: "https://cdr.ffiec.gov/api",
    description: "UBPR (Uniform Bank Performance Report)",
    idType: "RSSD" as const,
    defaultId: "229913",
    icon: FileText,
    color: "purple",
  },
  {
    id: "fed",
    name: "Federal Reserve NIC",
    defaultUrl: "https://www.ffiec.gov/nicpubweb/nicweb",
    description: "FR Y-9C (BHC Financial Statements)",
    idType: "RSSD" as const,
    defaultId: "229913",
    icon: Building2,
    color: "emerald",
  },
];



function ConnectionRow({
  id,
  name,
  description,
  url,
  identifier,
  idType,
  icon: Icon,
  colorClass,
  isConnected,
  isLoading,
  isRefreshing,
  statusDetail,
  isRemovable,
  onUrlChange,
  onIdChange,
  onConnect,
  onRemove,
}: {
  id: string;
  name: string;
  description: string;
  url: string;
  identifier: string;
  idType: string;
  icon: typeof Database;
  colorClass: string;
  isConnected: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  statusDetail?: DataSourceStatus;
  isRemovable: boolean;
  onUrlChange: (val: string) => void;
  onIdChange: (val: string) => void;
  onConnect: () => void;
  onRemove?: () => void;
}) {
  return (
    <div
      className={`rounded-lg border p-3 transition-colors ${
        isConnected ? "bg-card" : "bg-muted/30"
      }`}
      data-testid={`connection-row-${id}`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${colorClass}`}>
          <Icon className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium">{name}</p>
              <p className="text-[10px] text-muted-foreground">{description}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isLoading ? (
                <Badge variant="secondary" className="bg-muted text-muted-foreground border-0">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Connecting...
                </Badge>
              ) : isConnected ? (
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              ) : identifier ? (
                <Badge variant="secondary" className="text-muted-foreground border-0">
                  Ready
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-muted-foreground border-0">
                  Not Configured
                </Badge>
              )}
              {isRemovable && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  onClick={onRemove}
                  data-testid={`button-remove-${id}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 items-end">
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">API Endpoint</label>
              <div className="flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <Input
                  value={url}
                  onChange={(e) => onUrlChange(e.target.value)}
                  className="h-8 text-xs font-mono"
                  placeholder="https://api.example.gov"
                  data-testid={`input-url-${id}`}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{idType} ID</label>
              <Input
                value={identifier}
                onChange={(e) => onIdChange(e.target.value)}
                className="h-8 text-xs font-mono w-[100px]"
                placeholder={`${idType} #`}
                data-testid={`input-id-${id}`}
              />
            </div>

            <Button
              size="sm"
              variant={isConnected ? "outline" : "default"}
              className="h-8"
              onClick={onConnect}
              disabled={isRefreshing}
              data-testid={`button-connect-${id}`}
            >
              {isRefreshing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isConnected ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Reconnect
                </>
              ) : (
                <>
                  <Plug className="w-3.5 h-3.5 mr-1" />
                  Connect
                </>
              )}
            </Button>
          </div>

          {isConnected && statusDetail && (
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-1">
              <span className="font-medium text-foreground">{statusDetail.entity}</span>
              <span className="font-mono">{statusDetail.identifier}</span>
              <span>{statusDetail.responseTimeMs}ms</span>
              <span className="truncate">{statusDetail.message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ConnectionPanel({
  sources,
  isLoading,
  onRefresh,
  isRefreshing,
}: {
  sources: DataSourceStatus[];
  isLoading: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  const [connections, setConnections] = useState(
    FEDERAL_SYSTEMS.map((sys) => ({
      systemId: sys.id,
      url: sys.defaultUrl,
      identifier: sys.defaultId,
      idType: sys.idType,
      name: sys.name,
      description: sys.description,
      color: sys.color,
      icon: sys.icon,
      isBuiltIn: true,
    }))
  );

  const [showAddPanel, setShowAddPanel] = useState(false);
  const [customForm, setCustomForm] = useState({
    name: "",
    url: "",
    identifier: "",
    idType: "RSSD",
    description: "",
    authType: "none" as "none" | "api-key" | "oauth" | "basic",
    apiKey: "",
    username: "",
    password: "",
    clientId: "",
  });
  const getSourceStatus = (systemId: string) => {
    const mapping: Record<string, string> = {
      fdic: "FDIC",
      ffiec: "FFIEC",
      fed: "Federal Reserve",
    };
    return sources.find((s) => s.source.includes(mapping[systemId] || ""));
  };

  const handleFieldChange = (systemId: string, field: "url" | "identifier", value: string) => {
    setConnections((prev) =>
      prev.map((c) => (c.systemId === systemId ? { ...c, [field]: value } : c))
    );
  };

  const handleRemoveSystem = (systemId: string) => {
    setConnections((prev) => prev.filter((c) => c.systemId !== systemId));
  };

  const colorClasses: Record<string, string> = {
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
    purple: "bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400",
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
    slate: "bg-slate-500/10 border-slate-500/20 text-slate-600 dark:text-slate-400",
    teal: "bg-teal-500/10 border-teal-500/20 text-teal-600 dark:text-teal-400",
    rose: "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400",
    cyan: "bg-cyan-500/10 border-cyan-500/20 text-cyan-600 dark:text-cyan-400",
    indigo: "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400",
  };

  const allConnected = sources.length > 0 && sources.every((s) => s.status === "connected");

  return (
    <Card data-testid="card-connection-panel">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plug className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm">Source System Connections</CardTitle>
            <Badge variant="outline" className="text-[10px] font-mono">
              {connections.length} source{connections.length !== 1 ? "s" : ""}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {allConnected && (
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0">
                <Wifi className="w-3 h-3 mr-1" />
                All Connected
              </Badge>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={onRefresh}
              disabled={isRefreshing}
              data-testid="button-refresh-connections"
            >
              {isRefreshing ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              )}
              Reconnect All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {connections.map((conn) => {
          const status = getSourceStatus(conn.systemId);
          const isConnected = status?.status === "connected";

          return (
            <ConnectionRow
              key={conn.systemId}
              id={conn.systemId}
              name={conn.name}
              description={conn.description}
              url={conn.url}
              identifier={conn.identifier}
              idType={conn.idType}
              icon={conn.icon}
              colorClass={colorClasses[conn.color] || colorClasses.slate}
              isConnected={isConnected}
              isLoading={isLoading}
              isRefreshing={isRefreshing}
              statusDetail={status}
              isRemovable={!conn.isBuiltIn}
              onUrlChange={(val) => handleFieldChange(conn.systemId, "url", val)}
              onIdChange={(val) => handleFieldChange(conn.systemId, "identifier", val)}
              onConnect={onRefresh}
              onRemove={() => handleRemoveSystem(conn.systemId)}
            />
          );
        })}

        <Separator />

        {showAddPanel ? (
          <div className="rounded-lg border border-dashed border-primary/30 bg-primary/[0.02] p-4 space-y-3" data-testid="panel-add-source">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Add Source System</p>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => setShowAddPanel(false)}
                data-testid="button-cancel-add"
              >
                Cancel
              </Button>
            </div>

            <div className="rounded-lg border bg-muted/20 p-4 space-y-3" data-testid="form-custom-source">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Connection Details</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Source Name *</label>
                    <Input
                      value={customForm.name}
                      onChange={(e) => setCustomForm((f) => ({ ...f, name: e.target.value }))}
                      className="h-8 text-xs"
                      placeholder="e.g., Bloomberg Terminal API"
                      data-testid="input-custom-name"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Description</label>
                    <Input
                      value={customForm.description}
                      onChange={(e) => setCustomForm((f) => ({ ...f, description: e.target.value }))}
                      className="h-8 text-xs"
                      placeholder="e.g., Real-time market data feed"
                      data-testid="input-custom-description"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">API Endpoint URL *</label>
                  <div className="flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <Input
                      value={customForm.url}
                      onChange={(e) => setCustomForm((f) => ({ ...f, url: e.target.value }))}
                      className="h-8 text-xs font-mono"
                      placeholder="https://api.example.com/v2/data"
                      data-testid="input-custom-url"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Identifier Type</label>
                    <Select
                      value={customForm.idType}
                      onValueChange={(val) => setCustomForm((f) => ({ ...f, idType: val }))}
                    >
                      <SelectTrigger className="h-8 text-xs" data-testid="select-custom-idtype">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RSSD">RSSD ID</SelectItem>
                        <SelectItem value="CERT">CERT Number</SelectItem>
                        <SelectItem value="LEI">LEI Code</SelectItem>
                        <SelectItem value="CIK">CIK Number</SelectItem>
                        <SelectItem value="CRD">CRD Number</SelectItem>
                        <SelectItem value="EIN">EIN / Tax ID</SelectItem>
                        <SelectItem value="CUSIP">CUSIP</SelectItem>
                        <SelectItem value="Custom">Custom ID</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{customForm.idType} Value</label>
                    <Input
                      value={customForm.identifier}
                      onChange={(e) => setCustomForm((f) => ({ ...f, identifier: e.target.value }))}
                      className="h-8 text-xs font-mono"
                      placeholder={`Enter ${customForm.idType} identifier`}
                      data-testid="input-custom-identifier"
                    />
                  </div>
                </div>

                <Separator />

                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Authentication</p>

                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Auth Method</label>
                  <Select
                    value={customForm.authType}
                    onValueChange={(val: "none" | "api-key" | "oauth" | "basic") => setCustomForm((f) => ({ ...f, authType: val }))}
                  >
                    <SelectTrigger className="h-8 text-xs" data-testid="select-custom-auth">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Public API)</SelectItem>
                      <SelectItem value="api-key">API Key / Token</SelectItem>
                      <SelectItem value="basic">Basic Auth (Username / Password)</SelectItem>
                      <SelectItem value="oauth">OAuth 2.0 Client Credentials</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {customForm.authType === "api-key" && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">API Key / Bearer Token</label>
                    <Input
                      type="password"
                      value={customForm.apiKey}
                      onChange={(e) => setCustomForm((f) => ({ ...f, apiKey: e.target.value }))}
                      className="h-8 text-xs font-mono"
                      placeholder="sk-xxxx... or Bearer token"
                      data-testid="input-custom-apikey"
                    />
                  </div>
                )}

                {customForm.authType === "basic" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Username</label>
                      <Input
                        value={customForm.username}
                        onChange={(e) => setCustomForm((f) => ({ ...f, username: e.target.value }))}
                        className="h-8 text-xs"
                        placeholder="api_user"
                        data-testid="input-custom-username"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Password</label>
                      <Input
                        type="password"
                        value={customForm.password}
                        onChange={(e) => setCustomForm((f) => ({ ...f, password: e.target.value }))}
                        className="h-8 text-xs"
                        placeholder="********"
                        data-testid="input-custom-password"
                      />
                    </div>
                  </div>
                )}

                {customForm.authType === "oauth" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Client ID</label>
                      <Input
                        value={customForm.clientId}
                        onChange={(e) => setCustomForm((f) => ({ ...f, clientId: e.target.value }))}
                        className="h-8 text-xs font-mono"
                        placeholder="client_id_xxx"
                        data-testid="input-custom-clientid"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Client Secret</label>
                      <Input
                        type="password"
                        value={customForm.apiKey}
                        onChange={(e) => setCustomForm((f) => ({ ...f, apiKey: e.target.value }))}
                        className="h-8 text-xs font-mono"
                        placeholder="client_secret_xxx"
                        data-testid="input-custom-clientsecret"
                      />
                    </div>
                  </div>
                )}
            </div>

            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => {
                  if (!customForm.name || !customForm.url) return;
                  const id = `custom-${Date.now()}`;
                  setConnections((prev) => [
                    ...prev,
                    {
                      systemId: id,
                      url: customForm.url,
                      identifier: customForm.identifier,
                      idType: customForm.idType,
                      name: customForm.name,
                      description: customForm.description || "Custom data source",
                      color: "slate",
                      icon: Globe,
                      isBuiltIn: false,
                    },
                  ]);
                  setCustomForm({
                    name: "", url: "", identifier: "", idType: "RSSD",
                    description: "", authType: "none", apiKey: "", username: "",
                    password: "", clientId: "",
                  });
                  setShowAddPanel(false);
                }}
                disabled={!customForm.name || !customForm.url}
                data-testid="button-confirm-add"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Add Source
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full border-dashed"
            onClick={() => setShowAddPanel(true)}
            data-testid="button-add-source"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Source System
          </Button>
        )}
      </CardContent>
    </Card>
  );
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
          Connect to federal regulatory portals to ingest Call Report, UBPR, and FR Y-9C data for Mizuho Americas LLC
        </p>
      </div>

      <ConnectionPanel
        sources={sources}
        isLoading={statusQuery.isLoading}
        onRefresh={() => refreshMutation.mutate()}
        isRefreshing={refreshMutation.isPending}
      />

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
