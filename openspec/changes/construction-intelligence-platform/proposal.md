# Construction Intelligence Platform — Product Proposal

## Product Vision

A unified, cloud-based Construction Intelligence Platform that digitises every
layer of a construction project — from BOQ and site progress to forecasting and
AI-driven insights — reducing manual effort, eliminating data silos, and
enabling real-time, data-driven decision-making for every stakeholder from
site engineer to executive.

## Product Architecture

- Multi-tenant SaaS (organisation → project → site hierarchy)
- Domain-Driven Design with clear bounded contexts per module
- Event-driven microservice readiness (monorepo to start, split later)
- Role-Based Access Control (RBAC) across all modules
- Offline-first mobile support with sync on reconnect
- REST + WebSocket APIs; BIM / AutoCAD / Excel import adapters

## User Roles

| Role | Primary Goal |
|---|---|
| Site Engineer | Log daily progress quickly and accurately |
| Site Supervisor | Monitor site activities and workforce |
| Project Manager | Track schedule, cost, and risk in real time |
| Quantity Surveyor | Manage BOQ, materials, and cost |
| Procurement Officer | Manage inventory and purchase orders |
| Executive / Owner | Understand portfolio performance at a glance |
| System Administrator | Manage users, permissions, and configuration |

## Domain Model (Core Entities)

Project · Site · Activity · BOQ Item · BOM · Daily Progress Entry ·
Workforce · Equipment · Material · Inventory · Purchase Order · Vendor ·
Drawing · Document · User · Role · Organisation · Forecast · Report

---

## PHASE 1 — Core Platform

### Modules
- **Project Setup** — create projects, sites, milestones, WBS
- **BOQ Management** — import/manual BOQ, link items to activities
- **Activity Schedule** — Gantt, baseline vs actual, critical path
- **Daily Progress** — site diary, labour, equipment, material usage
- **Materials Management** — BOM, issue, return, variance tracking
- **Inventory Management** — stock levels, GRN, low-stock alerts
- **Document Management** — drawings, RFIs, submittals, revisions
- **Reporting** — daily, weekly, monthly; S-curve; progress photos
- **User & Permission Management** — roles, sites, project access

---

## PHASE 2 — Forecasting

### Delay Prediction

**Purpose**
Predict schedule delays before they occur by analysing activity progress
velocity, dependency chains, resource availability, and historical patterns.

**User Stories**
- As a Project Manager I want to see which activities are at risk of delay so
  that I can re-allocate resources proactively.
- As an Executive I want a single "delay risk score" per project so that I can
  prioritise my attention across the portfolio.
- As a Site Supervisor I want to receive an alert when my current productivity
  rate will cause a planned milestone to slip.

**Features**
- Earned Value Analysis (PV, EV, AC, SPI, CPI)
- Monte Carlo simulation for schedule risk
- Activity criticality heatmap
- Automated delay root-cause tagging (weather, resource, material, design)
- Push notifications for at-risk milestones
- What-if scenario modelling (add crew, extend hours, re-sequence)

**Database Entities**
`DelayPrediction { id, activityId, predictedDate, baselineDate, riskScore,
rootCause, confidence, createdAt }` ·
`RiskFactor { id, predictionId, type, impact, likelihood }` ·
`Scenario { id, projectId, changes[], outcomeDate, createdBy }`

**API Design**
```
GET  /projects/:id/delay-predictions
GET  /activities/:id/delay-risk
POST /projects/:id/scenarios
GET  /projects/:id/scenarios/:scenarioId/outcome
```

**UI Pages**
- Delay Risk Dashboard
- Activity Risk Detail
- Scenario Modelling Workspace
- Portfolio Delay Heatmap

**Components**
- RiskScoreBadge · CriticalPathGantt · DelayHeatmapChart ·
  MonteCarloDistributionChart · ScenarioComparison · RootCauseBreakdown ·
  MilestoneRiskTimeline · AlertBanner

**State Management**
`delayPredictions[]` · `activeScenario` · `riskFilters` · `selectedActivity`

**Permissions**
View: Project Manager, Executive, QS · Edit: Project Manager ·
Admin: System Administrator

**Future Expansion**
- ML model trained on completed projects within the organisation
- Integration with weather APIs for automatic weather-delay tagging
- BIM-linked critical path visualisation

---

### Inventory Optimization

**Purpose**
Ensure materials are available when needed without over-stocking, by
predicting future demand from the activity schedule and comparing it against
current stock levels and pending purchase orders.

**User Stories**
- As a Procurement Officer I want a reorder recommendation list generated
  automatically so that I never halt work due to stock-out.
- As a Project Manager I want to see projected stock levels for the next
  four weeks so that I can approve purchases in advance.
- As a QS I want variance between planned and actual material consumption
  highlighted so that I can investigate waste or theft.

**Features**
- Demand forecast from activity schedule × BOM
- Stock-out prediction with configurable lead-time buffer
- Automated purchase order drafting from reorder recommendations
- Consumption variance alerts (actual vs planned per activity)
- Supplier lead-time tracking
- FIFO / LIFO valuation toggle

**Database Entities**
`InventoryForecast { id, materialId, siteId, forecastDate, projectedQty,
currentStock, reorderPoint, recommendedOrderQty }` ·
`ConsumptionVariance { id, activityId, materialId, plannedQty, actualQty,
variance, reportedAt }`

**API Design**
```
GET  /sites/:id/inventory-forecast
GET  /materials/:id/demand-projection
POST /purchase-orders/draft-from-forecast
GET  /sites/:id/consumption-variances
```

**UI Pages**
- Inventory Forecast Dashboard
- Material Demand Timeline
- Reorder Recommendations (with approve/edit/send)
- Consumption Variance Report

**Components**
- StockLevelGauge · DemandVsSupplyChart · ReorderRecommendationCard ·
  ConsumptionVarianceTable · LeadTimeTracker · PODraftForm ·
  LowStockAlertBanner

**State Management**
`forecastItems[]` · `reorderList[]` · `varianceFilters` · `selectedMaterial`

**Permissions**
View: QS, Procurement Officer, Project Manager ·
Approve PO: Procurement Officer, Project Manager · Admin: System Administrator

**Future Expansion**
- Supplier portal for real-time lead-time updates
- Batch/lot tracking for perishable materials (e.g. cement bags by manufacture date)

---

### Labour Productivity

**Purpose**
Track, benchmark, and forecast workforce output — measuring productivity per
trade, crew, and activity so managers can identify bottlenecks and optimise
labour deployment.

**User Stories**
- As a Site Supervisor I want to see daily productivity per trade so that
  I know which crews are under-performing.
- As a Project Manager I want productivity trends over time so that I can
  forecast when an activity will complete at the current rate.
- As an Executive I want a cross-project labour efficiency index so that
  I can compare site performance.

**Features**
- Output per man-hour per activity (auto-calculated from daily reports)
- Productivity index vs planned norms
- Crew comparison leaderboard
- Overtime and absenteeism correlation analysis
- Completion forecast based on current productivity rate
- Skill matrix tracking per worker

**Database Entities**
`ProductivityRecord { id, activityId, crewId, date, manHours, outputQty,
unit, productivityIndex }` ·
`WorkerSkill { id, workerId, trade, certLevel, verifiedAt }` ·
`CrewAssignment { id, crewId, activityId, startDate, endDate }`

**API Design**
```
GET  /projects/:id/labour-productivity
GET  /activities/:id/productivity-trend
GET  /projects/:id/crew-comparison
GET  /workers/:id/skill-matrix
```

**UI Pages**
- Labour Productivity Dashboard
- Crew Performance Detail
- Activity Completion Forecast
- Worker Skill Matrix

**Components**
- ProductivityIndexCard · CrewComparisonTable · ProductivityTrendChart ·
  ManHourBreakdown · CompletionForecastBadge · OvertimeHeatmap ·
  SkillMatrixGrid

**State Management**
`productivityRecords[]` · `selectedCrew` · `dateRange` · `tradeFilter`

**Permissions**
View: Site Supervisor, Project Manager, HR · Edit: Site Supervisor ·
Admin: System Administrator

**Future Expansion**
- Biometric attendance integration for auto-calculated man-hours
- Wearable IoT safety compliance tracking per worker

---

### Equipment Utilization

**Purpose**
Monitor, schedule, and forecast the utilisation of construction equipment to
reduce idle time, prevent breakdowns, and optimise hire/own cost decisions.

**User Stories**
- As a Site Supervisor I want to log equipment hours daily so that
  utilisation is tracked without extra effort.
- As a Project Manager I want to see equipment idle-time percentage so that
  I can release hired plant early.
- As a Procurement Officer I want an equipment maintenance schedule so that
  breakdowns do not halt critical activities.

**Features**
- Daily equipment log (operating hours, idle hours, breakdown notes)
- Utilisation rate per equipment per site
- Maintenance schedule and alert system
- Hire vs own cost comparison
- Equipment demand forecast from upcoming activities
- Fleet availability calendar

**Database Entities**
`EquipmentLog { id, equipmentId, siteId, date, operatingHours, idleHours,
fuelConsumed, operatorId, breakdownNote }` ·
`MaintenanceSchedule { id, equipmentId, type, dueDate, completedDate, cost }` ·
`EquipmentForecast { id, equipmentId, requiredFrom, requiredTo, activityId }`

**API Design**
```
GET  /sites/:id/equipment-utilisation
POST /equipment/:id/daily-log
GET  /equipment/:id/maintenance-schedule
GET  /projects/:id/equipment-demand-forecast
```

**UI Pages**
- Equipment Utilisation Dashboard
- Fleet Calendar
- Maintenance Planner
- Hire vs Own Analysis

**Components**
- UtilisationDonutChart · FleetCalendar · MaintenanceAlertCard ·
  EquipmentLogForm · HireVsOwnTable · BreakdownTimeline ·
  FuelConsumptionChart

**State Management**
`equipmentLogs[]` · `maintenanceAlerts[]` · `selectedEquipment` ·
`fleetViewDate`

**Permissions**
View: Site Supervisor, Project Manager, Procurement Officer ·
Log: Site Supervisor, Operator · Admin: System Administrator

**Future Expansion**
- GPS telematics integration for auto-captured operating hours
- IoT engine-hour meter sync

---

### Cost Analysis

**Purpose**
Provide real-time visibility into project cost performance — comparing
budgeted, committed, and actual costs at every level (project, WBS, activity)
and forecasting final cost at completion.

**User Stories**
- As a QS I want to see cost variance by work package so that I can identify
  where the budget is being consumed beyond plan.
- As a Project Manager I want an Estimate at Completion (EAC) updated
  daily so that I can report accurately to the client.
- As an Executive I want a portfolio cost dashboard so that I can see which
  projects are over budget at a glance.

**Features**
- Budget vs Committed vs Actual Cost tracking
- CPI-based Estimate at Completion (EAC)
- Cost variance drill-down by WBS / trade / material
- Cash flow S-curve (planned vs actual vs forecast)
- Change order impact tracking
- Export to Excel / PDF for client reporting

**Database Entities**
`CostRecord { id, projectId, wbsCode, category, budgetedCost, committedCost,
actualCost, forecastCost, period }` ·
`ChangeOrder { id, projectId, description, amount, status, approvedBy,
approvedAt }`

**API Design**
```
GET  /projects/:id/cost-summary
GET  /projects/:id/cost-breakdown?wbs=:wbs
GET  /projects/:id/cashflow
POST /projects/:id/change-orders
GET  /projects/:id/eac
```

**UI Pages**
- Cost Control Dashboard
- WBS Cost Breakdown
- Cash Flow Chart
- Change Order Register

**Components**
- CostVarianceMeter · SCurveChart · WBSCostTable · EACBadge ·
  ChangeOrderStatusTag · CostDrilldownPanel · BudgetGauge ·
  CostExportButton

**State Management**
`costSummary` · `cashflowData[]` · `changeOrders[]` · `selectedWBS`

**Permissions**
View: QS, Project Manager, Executive · Edit: QS ·
Approve Change Orders: Project Manager, Executive · Admin: System Administrator

**Future Expansion**
- Integration with accounting systems (Xero, QuickBooks, SAP)
- Automated invoice matching to purchase orders

---

### Material Forecast

**Purpose**
Predict future material requirements by combining the activity schedule, BOM,
and current progress, giving procurement teams a rolling 4–12 week material
demand plan to ensure timely delivery and avoid work stoppages.

**User Stories**
- As a Procurement Officer I want a 4-week rolling material requirement
  schedule so that I can plan purchases and deliveries.
- As a QS I want to see planned vs actual material consumption curves so that
  I can detect variances early.
- As a Project Manager I want an alert when a critical material will be
  exhausted before its next scheduled delivery.

**Features**
- Rolling demand forecast from activity schedule × BOM
- Planned vs actual material consumption S-curve
- Critical material shortage alerts
- Delivery schedule calendar integration
- Waste factor and over-order factor configuration per material
- Material requirement export for procurement

**Database Entities**
`MaterialForecast { id, projectId, materialId, forecastPeriod, requiredQty,
scheduledDeliveryQty, availableQty, shortfallQty }` ·
`DeliverySchedule { id, materialId, siteId, expectedDate, qty, supplierId }`

**API Design**
```
GET  /projects/:id/material-forecast?weeks=8
GET  /materials/:id/consumption-curve
GET  /sites/:id/critical-material-alerts
POST /sites/:id/delivery-schedule
```

**UI Pages**
- Material Forecast Dashboard
- Material Consumption Curve
- Delivery Schedule Calendar
- Critical Shortage Alert List

**Components**
- MaterialForecastTable · ConsumptionSCurve · DeliveryCalendar ·
  ShortagePriorityList · WasteFactorConfig · ForecastExportButton ·
  MaterialSearchFilter

**State Management**
`materialForecasts[]` · `deliverySchedule[]` · `shortageAlerts[]` ·
`forecastHorizonWeeks`

**Permissions**
View: QS, Procurement Officer, Project Manager ·
Edit Delivery Schedule: Procurement Officer ·
Admin: System Administrator

**Future Expansion**
- Supplier API integration for real-time delivery ETAs
- AI-based waste factor learning from historical projects

---

## PHASE 3 — AI Assistant

### Voice Input

**Purpose**
Allow site engineers to dictate daily progress reports hands-free using
natural speech, reducing the time to complete a daily report and enabling
accurate logging in noisy, dusty, or PPE-heavy environments.

**User Stories**
- As a Site Engineer I want to speak my daily report instead of typing it so
  that I can complete it in under 3 minutes while still on site.
- As a Site Supervisor I want voice-captured attendance logs so that I do not
  need to handle a device with dirty hands.

**Features**
- Real-time speech-to-text transcription (on-device + cloud fallback)
- NLP parsing of voice input into structured form fields
- Confidence indicators with manual correction flow
- Noise-cancellation tuned for outdoor construction environments
- Multi-language support
- Voice command shortcuts ("new entry", "submit", "add material")

**Database Entities**
`VoiceLog { id, userId, rawTranscript, parsedFields{}, confidence, language,
createdAt }` · `VoiceCommand { id, phrase, action, locale }`

**API Design**
```
POST /voice/transcribe
POST /voice/parse-to-form
GET  /voice/commands
```

**UI Pages**
- Voice Input Overlay (modal)
- Transcription Review & Correction Screen
- Voice Command Settings

**Components**
- VoiceButton · TranscriptionPreview · ConfidenceIndicator ·
  FieldMappingReview · LanguageSelector · VoiceCommandList

**State Management**
`isRecording` · `transcript` · `parsedFields` · `confidence` · `locale`

**Permissions**
All authenticated users with the mobile app

**Future Expansion**
- Speaker identification for automatic worker attendance
- Offline voice processing for no-connectivity sites

---

### Computer Vision

**Purpose**
Use AI-powered image and video analysis to automate quantity estimation,
progress detection, material identification, and safety monitoring from site
photos and drone feeds.

**Sub-modules**
Progress Detection · Drawing Recognition · Automatic Quantity Estimation ·
Material Detection · Site Risk Detection

---

### Drone Integration

**Purpose**
Connect with drone platforms to ingest aerial imagery and point-cloud data
for automated site progress measurement, earthwork volume calculation, and
time-lapse project documentation.

**User Stories**
- As a Project Manager I want weekly drone surveys to automatically update
  earthwork progress percentages so that I do not rely solely on manual reports.
- As an Executive I want a time-lapse view of site progress so that I can
  share milestones with stakeholders.

**Features**
- Drone platform API connectors (DJI Terra, Pix4D, DroneDeploy)
- Orthophoto and point-cloud ingestion
- Automated earthwork volume calculation
- Progress comparison overlays (baseline vs current)
- Time-lapse generation
- No-fly zone and flight plan logging

**Database Entities**
`DroneSurvey { id, siteId, flightDate, platform, orthophotoUrl,
pointCloudUrl, volumeCalculated, areaScanned }` ·
`VolumeRecord { id, surveyId, zone, cut, fill, net }`

**API Design**
```
POST /sites/:id/drone-surveys
GET  /sites/:id/drone-surveys
GET  /drone-surveys/:id/volume-report
GET  /sites/:id/timelapse
```

**UI Pages**
- Drone Survey Dashboard
- Orthophoto Viewer with Overlay
- Volume Calculation Report
- Time-lapse Player

**Components**
- OrthoViewer · VolumeReport · ProgressOverlayToggle ·
  TimelapsePlayer · SurveyHistoryList · FlightLogCard

**State Management**
`surveys[]` · `activeSurvey` · `overlayMode` · `volumeFilters`

**Permissions**
Upload: Site Supervisor · View: Project Manager, Executive ·
Admin: System Administrator

**Future Expansion**
- Automated drone scheduling triggered by milestone dates
- BIM model alignment for 3D progress comparison

---

### Progress Detection

**Purpose**
Analyse site photos and drone imagery using computer vision to automatically
detect construction progress, classify completed work, and update activity
percentages without manual input.

**User Stories**
- As a Site Engineer I want to take a photo of completed brickwork and have
  the system estimate the area covered automatically.
- As a Project Manager I want photos tagged to activities so that I have
  visual evidence of progress alongside numbers.

**Features**
- Activity tagging of uploaded photos
- AI-based percentage completion estimation from images
- Before/after image comparison
- Progress photo timeline per activity
- Confidence score with manual override
- Batch photo upload from mobile

**Database Entities**
`ProgressPhoto { id, activityId, uploadedBy, takenAt, url, aiEstimate,
confirmedQty, confidence }` ·
`PhotoAnalysis { id, photoId, model, detectedElements[], estimatedCompletion,
processedAt }`

**API Design**
```
POST /activities/:id/progress-photos
GET  /activities/:id/progress-photos
POST /photos/:id/analyse
GET  /photos/:id/analysis-result
```

**UI Pages**
- Progress Photo Gallery (per activity)
- Photo Analysis Detail
- Before/After Comparison View

**Components**
- PhotoUploader · ProgressPhotoCard · BeforeAfterSlider ·
  AIEstimateTag · ConfidenceBadge · PhotoTimeline · BatchUploadModal

**State Management**
`photos[]` · `selectedPhoto` · `analysisResult` · `uploadQueue`

**Permissions**
Upload: Site Engineer, Site Supervisor · View: Project Manager ·
Admin: System Administrator

**Future Expansion**
- Video-based progress detection from CCTV feeds
- 3D reconstruction from multi-image photogrammetry

---

### Drawing Recognition

**Purpose**
Automatically extract information from uploaded engineering drawings (PDFs,
images, DWG exports) — including dimensions, quantities, room labels, and
revision marks — to pre-populate BOQ items and activity schedules.

**User Stories**
- As a QS I want to upload a floor-plan PDF and have the system suggest
  quantities for concrete, formwork, and reinforcement automatically.
- As a Project Manager I want revision clouds on drawings to generate
  change-order alerts automatically.

**Features**
- Drawing upload and OCR processing
- Dimension and quantity extraction
- Revision mark detection and change notification
- Drawing comparison (revision A vs revision B)
- Extracted data → BOQ pre-population workflow
- Drawing register with version control

**Database Entities**
`Drawing { id, projectId, title, revision, uploadedAt, fileUrl, status }` ·
`DrawingExtraction { id, drawingId, extractedEntities[], quantities[],
revisionsDetected[], confidence, processedAt }`

**API Design**
```
POST /projects/:id/drawings
POST /drawings/:id/extract
GET  /drawings/:id/extraction-result
GET  /projects/:id/drawing-register
POST /drawings/compare
```

**UI Pages**
- Drawing Register
- Drawing Viewer with Annotation Overlay
- Extraction Review & BOQ Mapping
- Revision Comparison View

**Components**
- DrawingViewer · AnnotationLayer · ExtractionResultPanel ·
  RevisionDiffHighlight · BOQMappingTable · DrawingVersionHistory

**State Management**
`drawings[]` · `activeDrawing` · `extractionResult` · `comparisonPair`

**Permissions**
Upload: QS, Project Manager · View: All project members ·
Approve Extraction: QS · Admin: System Administrator

**Future Expansion**
- Native DWG / BIM IFC parsing
- Automated RFI generation when extracted quantities conflict with BOQ

---

### Automatic Quantity Estimation

**Purpose**
Eliminate manual quantity take-off by calculating material and labour
quantities directly from drawing data, BIM models, or activity completions,
feeding those quantities into the BOQ, BOM, and cost models automatically.

**User Stories**
- As a QS I want quantities auto-calculated from drawings so that the take-off
  that previously took two days takes two hours.
- As a Site Engineer I want to report "40 m² brickwork completed" and have
  the system automatically calculate cement bags, sand, and water consumed
  against the BOM.

**Features**
- Quantity take-off from extracted drawing data
- Activity completion → BOM consumption auto-calculation
- Variance detection (estimated vs actual quantities)
- Quantity audit trail per activity
- BIM/IFC quantity import
- Re-calculation trigger on drawing revision

**Database Entities**
`QuantityEstimate { id, sourceType, sourceId, materialId, estimatedQty,
unit, method, confidence, createdAt }` ·
`BOQQuantityLink { id, boqItemId, estimateId, confirmedQty, confirmedBy }`

**API Design**
```
POST /activities/:id/auto-quantity
GET  /activities/:id/quantity-breakdown
POST /drawings/:id/quantity-takeoff
GET  /projects/:id/quantity-audit
```

**UI Pages**
- Quantity Estimation Workspace
- Activity Quantity Breakdown
- Quantity Audit Log
- BOM Auto-Consumption View

**Components**
- QuantityTakeoffTable · AutoConsumptionSummary · VarianceHighlight ·
  AuditTrailLog · ConfidenceScoreBar · BOQLinkMapper

**State Management**
`estimates[]` · `auditLog[]` · `selectedActivity` · `varianceThreshold`

**Permissions**
Calculate: QS, Site Engineer · Confirm: QS ·
View: Project Manager · Admin: System Administrator

**Future Expansion**
- Full BIM-to-BOQ automated pipeline
- ML refinement of quantity predictions from historical project data

---

### Material Detection

**Purpose**
Use image recognition to identify materials present on site from photos —
verifying delivered materials, detecting wrong material placement, and
updating inventory automatically from photographic evidence.

**User Stories**
- As a Procurement Officer I want to photograph a delivery and have the
  system identify materials, count units, and update stock automatically.
- As a Site Supervisor I want an alert if the wrong material is placed in a
  critical location detected from the site camera feed.

**Features**
- Material classification from photos (cement bags, rebar, blocks, pipes…)
- Quantity estimation from image (count, area, volume)
- Delivery verification photo workflow
- Wrong-material placement alert
- Inventory update from detection confirmation
- Material label / barcode scanning fallback

**Database Entities**
`MaterialDetection { id, photoId, materialType, detectedQty, confidence,
confirmedBy, usedForInventory }` ·
`DeliveryVerification { id, poId, photos[], detectedItems[], discrepancies[],
verifiedAt, verifiedBy }`

**API Design**
```
POST /photos/:id/detect-materials
POST /purchase-orders/:id/verify-delivery
GET  /sites/:id/material-detections
```

**UI Pages**
- Material Detection Camera Screen
- Delivery Verification Workflow
- Detection History Log

**Components**
- CameraCapture · DetectionResultOverlay · QuantityConfirmForm ·
  DeliveryVerificationCard · DiscrepancyAlert · BarcodeScanner

**State Management**
`detectionResults[]` · `pendingVerifications[]` · `capturedPhoto`

**Permissions**
Capture/Verify: Procurement Officer, Site Supervisor ·
View: QS, Project Manager · Admin: System Administrator

**Future Expansion**
- Real-time material detection from fixed site cameras
- NFC/RFID tag integration for high-value equipment tracking

---

### Site Risk Detection

**Purpose**
Continuously monitor site conditions from photos, drone feeds, and IoT
sensors to detect and alert on safety risks — unprotected edges, missing PPE,
unauthorised access, and structural anomalies — before incidents occur.

**User Stories**
- As a Site Supervisor I want an automatic alert when a worker is detected
  without a helmet so that I can intervene immediately.
- As a Project Manager I want a daily safety score so that I can compare
  safety compliance across sites.
- As an Executive I want near-miss trends so that I can identify systemic
  safety issues before a serious incident.

**Features**
- PPE compliance detection (helmet, vest, harness) from photos/CCTV
- Unprotected edge / fall-risk zone detection
- Unauthorised zone access alerts
- Structural crack / settlement anomaly flagging from imagery
- Daily safety score per site
- Incident and near-miss log with AI tagging
- Safety report generation

**Database Entities**
`SafetyAlert { id, siteId, type, severity, imageUrl, detectedAt,
resolvedAt, resolvedBy }` ·
`SafetyScore { id, siteId, date, score, violations[], observations[] }` ·
`Incident { id, siteId, type, description, aiTags[], reportedBy, occurredAt }`

**API Design**
```
POST /sites/:id/safety-scan
GET  /sites/:id/safety-alerts
GET  /sites/:id/safety-score
POST /sites/:id/incidents
GET  /projects/:id/safety-dashboard
```

**UI Pages**
- Site Safety Dashboard
- Live Alert Feed
- Safety Score Trend
- Incident Register
- PPE Compliance Report

**Components**
- SafetyScoreGauge · AlertFeedCard · PPEComplianceDonut ·
  IncidentTable · RiskZoneMapOverlay · SafetyTrendChart ·
  SeverityBadge · ResolveAlertButton

**State Management**
`alerts[]` · `safetyScore` · `incidents[]` · `alertFilters` ·
`selectedSite`

**Permissions**
View: Site Supervisor, Project Manager, HSE Officer ·
Resolve Alert: Site Supervisor, HSE Officer ·
Admin: System Administrator

**Future Expansion**
- Integration with wearable sensors (gas, heat, impact detection)
- Automated site access control triggered by safety alert

---

### Chat Assistant

**Purpose**
Provide a conversational AI interface that understands the full project
context — answering questions, generating reports, triggering actions, and
surfacing insights in plain language for every user role.

**User Stories**
- As a Project Manager I want to ask "What is the current CPI for the
  foundation package?" and get an instant answer without opening a report.
- As a Site Engineer I want to say "Log 30 m² slab completed today" and have
  the assistant create the daily progress entry for me.
- As an Executive I want to ask "Which projects are at risk this month?" and
  get a ranked list with reasons.

**Features**
- Context-aware RAG (Retrieval-Augmented Generation) over project data
- Natural language query over BOQ, progress, cost, and forecast data
- Action execution ("create entry", "approve PO", "generate report")
- Role-filtered responses (executives see portfolio summaries; engineers see
  site detail)
- Conversation history per user
- Suggested follow-up questions
- Export conversation to PDF / email

**Database Entities**
`ChatSession { id, userId, projectId, createdAt }` ·
`ChatMessage { id, sessionId, role, content, citations[], actionTaken,
createdAt }` ·
`AssistantAction { id, messageId, type, payload, status, executedAt }`

**API Design**
```
POST /chat/sessions
POST /chat/sessions/:id/messages
GET  /chat/sessions/:id/history
POST /chat/actions/:id/execute
```

**UI Pages**
- Chat Assistant Panel (slide-in overlay, available on all pages)
- Chat History View
- Action Confirmation Dialog

**Components**
- ChatPanel · MessageBubble · CitationLink · ActionConfirmDialog ·
  SuggestedQueries · ChatHistoryList · TypingIndicator · ExportChatButton

**State Management**
`sessions[]` · `activeSession` · `messages[]` · `isTyping` · `pendingAction`

**Permissions**
All authenticated users (responses filtered by role)

**Future Expansion**
- Multi-modal chat (attach photos, drawings, and ask questions about them)
- Proactive assistant alerts ("Your rebar stock will run out in 8 days")

---

## OUTPUT FORMAT

For every module produce:

1. **Purpose** — one-paragraph description of what the module does and why it exists
2. **User Stories** — 3–5 role-based stories in "As a … I want … so that …" format
3. **Features** — bulleted feature list
4. **Database Entities** — key entities with critical fields
5. **API Design** — REST endpoint signatures (method + path)
6. **UI Pages** — list of screens belonging to the module
7. **Components** — reusable components used on those pages
8. **State Management** — key state variables
9. **Permissions** — who can view / edit / administer
10. **Future Expansion** — 2–3 ideas for next iterations

---

## COMPONENTS

Every page uses exclusively the reusable component library. No one-off page
components unless documented here first.

### Dashboard — Reusable Components

| Component | Purpose |
|---|---|
| Header | Global top bar with search, notifications, user menu |
| Sidebar | Collapsible navigation with role-filtered menu items |
| ProjectSelector | Dropdown / search for switching active project |
| MetricCard | KPI tile — label, value, trend, colour state |
| ProgressRing | Circular progress indicator (0–100 %) |
| ForecastChart | Line chart — planned vs actual vs forecast |
| MaterialUsageChart | Bar/area chart for material consumption over time |
| ActivityFeed | Chronological event stream with actor + timestamp |
| NotificationPanel | Slide-in tray for unread alerts |
| QuickActionButton | Contextual FAB / action trigger |
| Filters | Reusable filter bar (date, site, trade, status) |
| Search | Global search with result type grouping |
| DataTable | Sortable, filterable, paginated table |
| Dialog | Accessible modal with header / body / footer slots |
| Form | Validated form shell with field error display |
| StatusBadge | Colour-coded status label |
| AvatarGroup | Stacked user avatars with overflow count |
| EmptyState | Zero-data placeholder with CTA |
| SkeletonLoader | Content placeholder during data fetch |
| ErrorBoundary | Graceful error display with retry action |
| Tooltip | Accessible hover/focus tooltip |
| Drawer | Side-panel for detail views without navigation |
| Timeline | Vertical chronological event list |
| Stepper | Multi-step form / workflow progress indicator |
| FileUpload | Drag-and-drop file input with preview |
| DateRangePicker | Calendar-based date range selector |
| CommentThread | Threaded comment component for any entity |
| MapView | Site location map with marker overlays |

---

## UX REQUIREMENTS

| Role | Maximum Time for Key Task |
|---|---|
| Site Engineer | Complete a Daily Report in **under 5 minutes** |
| Project Manager | Understand project health in **under 30 seconds** |
| Executive | Understand portfolio performance in **under 1 minute** |

Design principles to meet these requirements:
- One-tap log actions from the mobile home screen
- Progressive disclosure — summary first, detail on demand
- Voice-first data entry for site use
- Offline queue for poor connectivity zones
- Smart defaults pre-filled from schedule and BOM
- Zero-training onboarding: tooltip walkthroughs on first use

---

## ARCHITECTURE-FIRST APPROACH

Do not jump directly into UI. Build in the following sequence:

1. **Product Vision** — problem, users, value proposition
2. **Product Architecture** — bounded contexts, microservice readiness, multi-tenancy
3. **Module Breakdown** — features per module, dependencies
4. **Domain Model** — entity relationships, aggregates
5. **Navigation Structure** — primary / secondary / contextual nav hierarchy
6. **Information Architecture** — content grouping, labelling, hierarchy
7. **User Roles** — permissions matrix across all modules
8. **Design System** — tokens, typography, colour, elevation, motion
9. **Component Library** — all reusable components defined before page design
10. **Screen Hierarchy** — sitemap showing every page and its parent

Only after all architecture is complete should individual pages be designed.

---

## DEVELOPMENT PHASES (Iterative Design Approach)

### Phase 1 — Product Architecture
Design the complete product architecture.

Focus: bounded contexts · DDD module boundaries · entity relationships ·
event flow · folder structure · microservice readiness · multi-tenant SaaS

### Phase 2 — Design System
Create a complete enterprise design system.

Output: Colour Tokens · Typography · Icon System · Grid · Layout ·
Elevation · Component Library · Motion Guidelines · Accessibility ·
Design Tokens

Every component must be reusable.

### Phase 3 — Information Architecture
Design the navigation hierarchy.

Sections: Dashboard · Projects · BOQ · Materials · Daily Progress ·
Inventory · Reports · Forecast · AI · Administration · Settings

Show user flows between all screens.

### Phase 4 — Component Library
Create a reusable component inventory.

For every component define: Purpose · Props · States · Variants ·
Accessibility · Usage · Composition · Dependencies

Avoid page-specific components whenever possible.

### Phase 5 — Individual Screens
Design each screen using only components defined in Phase 4.

Do not create new components unless absolutely necessary.
Explain why each component exists on the screen.

---

## KEY DIFFERENTIATOR — Quantity-Aware Intelligence

The strongest competitive advantage is making the platform **quantity-aware**
end-to-end.

```
AutoCAD / BIM / BOQ
        ↓
Activity Schedule
        ↓
Daily Progress (engineer reports activity completion)
        ↓
Automatic Quantity Calculation (from BOM)
        ↓
Material Consumption (actual vs planned)
        ↓
Inventory Update
        ↓
Remaining Material
        ↓
Cost Forecast
        ↓
Project Completion Forecast
```

Instead of asking a Site Engineer to report "We used 50 bags of cement
today," they report "We completed 40 m² of brickwork." The platform then:

1. Looks up the BOM for brickwork → expected consumption per m²
2. Calculates expected cement, sand, and water for 40 m²
3. Compares expected vs actual inventory deductions
4. Flags any variance (waste, theft, measurement error)
5. Updates remaining stock levels
6. Recalculates material demand for remaining activities
7. Recalculates cost and schedule forecasts

This shift from **manual input reporting** to **intelligence-driven
construction management** is the core differentiator of the platform.
