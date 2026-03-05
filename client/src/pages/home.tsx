import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  FileText,
  BarChart3,
  ArrowRight,
  Zap,
} from "lucide-react";

export default function Home() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="space-y-2">
          <p className="text-[10px] font-mono font-medium text-destructive tracking-[0.12em] uppercase" data-testid="badge-demo">Mizuho Financial Group</p>
          <h1 className="text-3xl font-serif font-semibold tracking-tight" data-testid="text-main-title">
            RegAssist AI Platform
          </h1>
          <p className="text-muted-foreground text-sm max-w-3xl leading-relaxed" data-testid="text-subtitle">
            Intelligent regulatory reporting and analytics platform demonstrating AI-powered capabilities
            across the full reporting lifecycle and peer analysis.
          </p>
          <Badge variant="outline" className="text-[10px] font-mono" data-testid="badge-date">March 2026</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="group" data-testid="card-use-case-1">
            <CardHeader className="flex flex-row items-start justify-between gap-2 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Regulatory Reporting Lifecycle</CardTitle>
                </div>
              </div>
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
                  <CardTitle className="text-base">Peer Analysis & Comparison</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Comprehensive peer benchmarking using Call Report data, comparing Mizuho Americas
                against selected US peer institutions.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-3.5 h-3.5 text-chart-2" />
                  <span>Call Report financial data comparison</span>
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

        <div className="border-t pt-6 pb-4">
          <p className="text-xs text-muted-foreground text-center" data-testid="text-footer">
            Mizuho Financial Group — RegAssist AI — Confidential
          </p>
        </div>
      </div>
    </div>
  );
}
