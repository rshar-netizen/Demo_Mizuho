# RegAssist AI - Regulatory Intelligence Platform

## Overview
Demo application for Mizuho Financial Group CFO presentation (March 2025). Showcases AI-powered regulatory reporting and peer analysis capabilities with real-time data ingestion from federal portals.

## Architecture
- **Frontend**: React + TypeScript + Vite, Tailwind CSS, Shadcn UI, Recharts
- **Backend**: Express.js with API integrations to federal data portals
- **Data Sources**:
  - FDIC BankFind Suite API (Call Reports - FFIEC 031/041)
  - FFIEC Central Data Repository (UBPR)
  - Federal Reserve NIC (FR Y-9C)
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
   - Report Review (cross-checks, tie-outs)
   - Period Comparison with AI commentary
   - Trend Analysis (multi-period charts)
4. **Peer Analysis** (`/peer-analysis`) - Use Case 2 with 3 tabs:
   - Overview (radar chart, peer summary, profitability/capital bars)
   - Detailed Comparison (full peer table)
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
- `GET /api/data-sources/peer-data` - All peer bank data from all sources
- `POST /api/data-sources/refresh` - Clear cache and re-fetch all data

## Peer Bank CERT Numbers (FDIC)
- MUFG Bank, N.A.: 29950
- PNC Bank, N.A.: 6384
- U.S. Bank N.A.: 6548
- Citizens Bank, N.A.: 57957
- KeyBank N.A.: 17534
- M&T Bank: 57803

## Theme
- Dark mode by default (professional financial look)
- Inter font for UI, JetBrains Mono for data/code
- Blue primary color scheme

## Running
- `npm run dev` starts the Express + Vite dev server on port 5000
