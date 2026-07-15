## 1. Phase 1 — Core Platform

- [x] 1.1 Project Setup — projects list/detail, org scoping, auth & signup (`001_initial_schema.sql`, `003_fix_onboarding.sql`; `ProjectListPage`, `ProjectDetailPage`)
- [x] 1.2 BOQ Management — manual BOQ entry, WBS codes, unit/quantity, project scoping (`BOQPage`, `api/boq.ts`)
- [x] 1.3 Activity Schedule — Gantt + table views, CRUD, critical path flag, BOQ-item linking, role-gated create/update/delete, progress auto-derived from linked BOQ item's consumed quantity (`004_activities.sql`, `007_quantity_consumed.sql`, `008_...sql`; `ActivitySchedulePage`)
- [x] 1.4 Daily Progress — site diary CRUD, mandatory activity link + quantity consumed, unit display, feeds Activity Schedule progress trigger (`005_daily_progress.sql`, `007_quantity_consumed.sql`; `DailyProgressPage`)
- [x] 1.5 Materials Management — material catalogue, current stock, GRN and issue/return transactions, low-stock / reorder-point alerts (`002_stock_rpc.sql`; `MaterialsPage`, `api/materials.ts`)
- [ ] 1.6 Inventory Management — stock levels, GRN and low-stock alerts are covered by 1.5; still missing: variance tracking (planned/BOQ quantity vs. actual issued/consumed)
- [ ] 1.7 Document Management — drawings, RFIs, submittals, revision history (not started)
- [ ] 1.8 Reporting — daily/weekly/monthly reports, S-curve, progress photos (not started)
- [x] 1.9 User & Permission Management — role-based access (admin, project_manager, qty_surveyor, site_engineer, viewer), Team page for admin-driven promotion, RLS policies, self-privilege-escalation fix (`006_user_management.sql`, `008_...sql`; `TeamPage`, `api/team.ts`)

## 2. Phase 2 — Forecasting

- [ ] 2.1 Delay Prediction — EVA (PV/EV/AC/SPI/CPI), Monte Carlo schedule risk, criticality heatmap, root-cause tagging, scenario modelling
- [ ] 2.2 Inventory Optimization — demand forecasting, reorder point automation, ABC analysis
- [ ] 2.3 Labour Productivity — crew output tracking, productivity benchmarking, forecasted labour needs
- [ ] 2.4 Equipment Utilization — utilization rate tracking, idle-time analysis, maintenance scheduling
- [ ] 2.5 Cost Analysis — budget vs. actual, cost variance, cash flow forecasting
- [ ] 2.6 Material Forecast — consumption forecasting, procurement lead-time planning

## 3. Phase 3 — AI Assistant

- [ ] 3.1 Voice Input — voice-logged site diary entries
- [ ] 3.2 Computer Vision — general CV pipeline for site imagery
- [ ] 3.3 Drone Integration — drone flight/imagery ingestion
- [ ] 3.4 Progress Detection — vision-based progress % from photos/drone imagery
- [ ] 3.5 Drawing Recognition — parse drawings for quantities/elements
- [ ] 3.6 Automatic Quantity Estimation — derive BOQ quantities from drawings/imagery
- [ ] 3.7 Material Detection — vision-based material/stockpile identification
- [ ] 3.8 Site Risk Detection — vision-based safety/hazard detection
- [ ] 3.9 Chat Assistant — conversational assistant over project data
