# RegAssist AI - Regulatory Intelligence Platform

## Overview
Demo application for Mizuho Financial Group CFO presentation (March 2026). Showcases AI-powered regulatory reporting and peer analysis capabilities with real-time data ingestion from federal portals.

## Architecture
- **Frontend**: React + TypeScript + Vite, Tailwind CSS, Shadcn UI, Recharts
- **Backend**: Express.js with API integrations to federal data portals
- **Data Sources**:
  - FDIC BankFind Suite API (Call Reports - FFIEC 031/041)
  - FFIEC Central Data Repository (UBPR)
  - Federal Reserve NIC (FR Y-9C)
- **FDIC Ratio Fields** (matched to FDIC portal):
  - NIM: `NIMY` (annualized net interest margin %)
  - Tier 1: `RBC1AAJ` (Tier 1 capital / adjusted average assets)
  - Efficiency: `EEFF / (INTINC + NONII) * 100` (non-interest expense / total revenue)
- **Routing**: Wouter for client-side routing
- **Caching**: In-memory cache with 30-minute TTL for API responses

## Pages
1. **Home** (`/`) - Overview of all capabilities with data ingestion card
2. **Data Ingestion** (`/data-ingestion`) - Live API connections to FDIC, FFIEC, Federal Reserve
   - Connection status for 3 federal portals
   - Call Report data browser (8 quarterly periods)
   - Peer institution comparison (6 banks, live data)
   - Architecture diagram showing data flow
   - Refresh button for real-time data updates
3. **Regulatory Reporting** (`/regulatory-reporting`) - Use Case 1 with 6 tabs:
   - Instructions Analysis (with AI chat panel)
   - Data & Dictionary
   - Pattern Detection / Anomalies
   - Report Review & Validation (balance sheet tie-out, schedule drill-down, source provenance trails, materiality thresholds, cross-checks)
   - Review & Approval (QoQ variance summaries, CFO memorandum generation & approval workflow)
   - Trend Analysis (multi-period charts)
4. **Peer Analysis** (`/peer-analysis`) - Use Case 2 with dynamic peer configuration:
   - Peer Bank Configuration panel (add/remove peers by CERT number, auto-validates via FDIC)
   - Overview (radar chart, peer summary, profitability/capital bars)
   - Detailed Comparison (full peer table with live FDIC data)
   - Trend Analysis (ROE, NIM, CET1 time-series)

## Key Files
- `server/lib/fdic-api.ts` - FDIC BankFind Suite API integration
- `server/lib/ffiec-api.ts` - FFIEC CDR integration (UBPR data)
- `server/lib/fed-api.ts` - Federal Reserve NIC integration (FR Y-9C)
- `server/routes.ts` - API endpoints for data ingestion
- `client/src/pages/data-ingestion.tsx` - Data Ingestion dashboard
- `client/src/lib/demo-data.ts` - Static demo data and types
- `client/src/pages/home.tsx` - Landing page
- `client/src/pages/regulatory-reporting.tsx` - Use Case 1
- `client/src/pages/peer-analysis.tsx` - Use Case 2
- `client/src/components/app-sidebar.tsx` - Navigation sidebar
- `client/src/components/theme-provider.tsx` - Dark/light mode

## API Endpoints
- `GET /api/data-sources/status` - Connection status for all 3 portals
- `GET /api/data-sources/call-reports?cert=X&periods=N` - Fetch Call Report data
- `GET /api/data-sources/ubpr?rssd=X` - Fetch UBPR data
- `GET /api/data-sources/fry9c?rssd=X` - Fetch FR Y-9C data
- `GET /api/data-sources/peer-data?certs=X,Y` - All peer bank data (optional extra CERTs)
- `GET /api/data-sources/peer-single?cert=X` - Single peer bank data by CERT
- `GET /api/data-sources/validate-cert?cert=X` - Validate CERT and get institution name/RSSD
- `POST /api/data-sources/refresh` - Clear cache and re-fetch all data

## Peer Bank Identifiers (FDIC)
- Mizuho Bank (USA): CERT 21843, RSSD 229913
- PNC Bank, N.A.: CERT 6384, RSSD 817824
- U.S. Bank N.A.: CERT 6548, RSSD 504713
- Citizens Bank, N.A.: CERT 57957, RSSD 3303298
- KeyBank N.A.: CERT 17534, RSSD 280110
- M&T Bank: CERT 57803, RSSD 3284070

## Theme — Mizuho Brand
- Light mode by default (Mizuho corporate identity)
- Navy primary (#183181), Mizuho Red accent (#ED1A3A)
- EB Garamond serif for page titles, Inter sans for UI, JetBrains Mono for data/code
- Red eyebrow labels (font-mono, uppercase, tracking-wide) above serif page titles
- Dark navy sidebar with red gradient accent bar under logo
- Dark mode still supported via toggle (adapts brand to dark palette)
- Chart colors: Navy, Red, Green (#0d7c4d), Amber (#b55a00), Navy Light

## Running
- `npm run dev` starts the Express + Vite dev server on port 5000
