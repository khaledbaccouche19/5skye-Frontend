# 5SKYE Frontend (Next.js)

Next.js 14 + TypeScript UI for the 5SKYE Digital Twin Platform.

## Highlights

- Cesium globe with status‑colored tower markers and click‑through
- Filters: status, region, search; metric cards double as filters
- Tower detail page with 3D tower viewer (GLB/GLTF) + fallbacks
- Hardware and maintenance modules with rich forms and filtering
- Live telemetry section (manual/auto refresh) and history fetch
- AI analytics page (chat with system/tower context)
- Translation context (EN/FR/AR) without external i18n libs

## Run

```bash
pnpm install # or npm install
pnpm dev     # or npm run dev
```

Default: `http://localhost:3000`

## Environment

Create `.env.local` with at least:

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8088
NEXT_PUBLIC_CESIUM_ACCESS_TOKEN=REPLACE_ME_OPTIONALLY
```

If using SiteBoss integration, also set `NEXT_PUBLIC_SITEBOSS_*` variables as needed.

## Key Pages

- `/` — Dashboard (metrics, globe, filters)
- `/towers` — Tower list and filters
- `/towers/[id]` — Tower detail (3D viewer, live metrics, hardware/maintenance tabs)
- `/maintenance` — Maintenance console
- `/ai-analytics` — System‑wide AI chat
- `/monitoring` — Page to embed Grafana dashboards (configure Grafana to allow embedding)

## 3D Models

- Upload GLB/GLTF via backend upload endpoint; save model path on a tower
- Viewer provides loading/error overlays and simple transform controls

## Auth

- Uses JWT from backend auth endpoints; stored in localStorage
- ProtectedRoute guards private pages

## Telemetry

- Frontend fetches live telemetry through backend proxy: `/api/towers/{id}/telemetry/live`
- History queries available for charts (see ApiClient)

## Thesis Tips

- Capture screenshots for: dashboard/globe, tower detail with 3D model, hardware and maintenance dialogs, AI chat, live telemetry refresh, monitoring page with embedded Grafana
- See `docs/THESIS_GUIDE.md` for a chapter‑by‑chapter checklist

