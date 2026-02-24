# RegAssist AI - Regulatory Intelligence Platform

## Overview
Demo application for Mizuho Financial Group CFO presentation (March 2025). Showcases AI-powered regulatory reporting and peer analysis capabilities.

## Architecture
- **Frontend**: React + TypeScript + Vite, Tailwind CSS, Shadcn UI, Recharts
- **Backend**: Express.js (minimal - serves static content)
- **Data**: Static demo data in `client/src/lib/demo-data.ts` (no database needed for demo)
- **Routing**: Wouter for client-side routing

## Pages
1. **Home** (`/`) - Overview of both use cases with capability cards
2. **Regulatory Reporting** (`/regulatory-reporting`) - Use Case 1 with 6 tabs:
   - Instructions Analysis (with AI chat panel)
   - Data & Dictionary
   - Pattern Detection / Anomalies
   - Report Review (cross-checks, tie-outs)
   - Period Comparison with AI commentary
   - Trend Analysis (multi-period charts)
3. **Peer Analysis** (`/peer-analysis`) - Use Case 2 with 3 tabs:
   - Overview (radar chart, peer summary, profitability/capital bars)
   - Detailed Comparison (full peer table)
   - Trend Analysis (ROE, NIM, CET1 time-series)

## Key Files
- `client/src/lib/demo-data.ts` - All demo data and types
- `client/src/pages/home.tsx` - Landing page
- `client/src/pages/regulatory-reporting.tsx` - Use Case 1
- `client/src/pages/peer-analysis.tsx` - Use Case 2
- `client/src/components/app-sidebar.tsx` - Navigation sidebar
- `client/src/components/theme-provider.tsx` - Dark/light mode

## Theme
- Dark mode by default (professional financial look)
- Inter font for UI, JetBrains Mono for data/code
- Blue primary color scheme

## Running
- `npm run dev` starts the Express + Vite dev server on port 5000
