import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  FileText,
  BarChart3,
  ArrowRight,
  TrendingUp,
  Shield,
  Zap,
  Database,
  Search,
  GitCompare,
} from "lucide-react";

const capabilities = [
  {
    icon: Search,
    title: "Reporting Instructions Analysis",
    description: "AI-powered review and interpretation of complex regulatory filing requirements",
  },
  {
    icon: Database,
    title: "Data Ingestion & Dictionary",
    description: "Automated data profiling, linkage discovery, and schema mapping across source systems",
  },
  {
    icon: Shield,
    title: "Anomaly Detection",
    description: "Pattern recognition across multiple reporting periods to flag data quality issues",
  },
  {
    icon: GitCompare,
    title: "Interactive Report Review",
    description: "Drill-down analysis of balance derivations, cross-checks, and tie-outs",
  },
  {
    icon: TrendingUp,
    title: "Period Comparison & Commentary",
    description: "Automated variance analysis with AI-generated commentary for review and approval",
  },
  {
    icon: BarChart3,
    title: "Trend Analysis & Peer Comparison",
    description: "Multi-period trend visualization and benchmarking against FRB peer data",
  },
];

export default function Home() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" data-testid="badge-demo">Demo</Badge>
            <Badge variant="outline" data-testid="badge-date">March 2025</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-main-title">
            RegAssist AI Platform
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl" data-testid="text-subtitle">
            Intelligent regulatory reporting and analytics platform demonstrating AI-powered capabilities
            across the full reporting lifecycle and peer analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="group" data-testid="card-use-case-1">
            <CardHeader className="flex flex-row items-start justify-between gap-2 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Use Case 1</CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">Regulatory Reporting Lifecycle</p>
                </div>
              </div>
              <Badge variant="secondary">6 Capabilities</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                End-to-end demonstration of AI capabilities supporting the regulatory reporting lifecycle,
                from instruction analysis through trend reporting.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-3.5 h-3.5 text-chart-3" />
                  <span>Interactive query & instruction analysis</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-3.5 h-3.5 text-chart-3" />
                  <span>Data profiling, joins & anomaly detection</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-3.5 h-3.5 text-chart-3" />
                  <span>Report review, commentary & trend analysis</span>
                </div>
              </div>
              <Link href="/regulatory-reporting">
                <Button className="w-full mt-2" data-testid="button-explore-reporting">
                  Explore Reporting Lifecycle
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="group" data-testid="card-use-case-2">
            <CardHeader className="flex flex-row items-start justify-between gap-2 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-chart-2/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-chart-2" />
                </div>
                <div>
                  <CardTitle className="text-base">Use Case 2</CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">Peer Analysis & Comparison</p>
                </div>
              </div>
              <Badge variant="secondary">FRB Data</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Comprehensive peer benchmarking using Federal Reserve Board data, comparing Mizuho Americas
                against selected US bank holding companies.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-3.5 h-3.5 text-chart-2" />
                  <span>FFIEC Call Report & FR Y-9C data</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-3.5 h-3.5 text-chart-2" />
                  <span>Capital, profitability & asset quality metrics</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-3.5 h-3.5 text-chart-2" />
                  <span>Time-series trend comparison across peers</span>
                </div>
              </div>
              <Link href="/peer-analysis">
                <Button variant="secondary" className="w-full mt-2" data-testid="button-explore-peer">
                  Explore Peer Analysis
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4" data-testid="text-capabilities-title">Platform Capabilities</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {capabilities.map((cap, idx) => (
              <Card key={idx} className="hover-elevate" data-testid={`card-capability-${idx}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0 mt-0.5">
                      <cap.icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">{cap.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{cap.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="border-t pt-6 pb-4">
          <p className="text-xs text-muted-foreground text-center" data-testid="text-footer">
            RegAssist AI - Prepared for Mizuho Financial Group - Confidential Demo
          </p>
        </div>
      </div>
    </div>
  );
}
