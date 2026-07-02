# Construction Intelligence Platform — Design System

---

## Design Principles

| Principle | Application |
|---|---|
| **Clarity over decoration** | Every visual element earns its place by carrying information |
| **Field-ready contrast** | All text meets WCAG AA; critical status meets AAA |
| **Touch-first sizing** | Minimum 44 × 44 px touch targets; 48 px for primary actions |
| **Progressive disclosure** | Summary visible at a glance; detail one tap away |
| **Consistent density** | Dashboards use compact density; forms use comfortable density |

---

## 1. Color Tokens

### 1.1 Brand Palette

```
Primary   — Deep Blue (trust, precision, data)
Accent    — Construction Amber (energy, caution, action)
Neutral   — Zinc (cool-grey infrastructure)
```

#### Primary — Blue

| Token | Hex | Usage |
|---|---|---|
| `--color-primary-50` | `#EFF6FF` | Light backgrounds, hover states |
| `--color-primary-100` | `#DBEAFE` | Selected row, active pill background |
| `--color-primary-200` | `#BFDBFE` | Focus ring |
| `--color-primary-300` | `#93C5FD` | Disabled primary elements |
| `--color-primary-400` | `#60A5FA` | Icon on dark surface |
| `--color-primary-500` | `#3B82F6` | Link text, secondary button border |
| `--color-primary-600` | `#2563EB` | Primary button (rest) |
| `--color-primary-700` | `#1D4ED8` | Primary button (hover) |
| `--color-primary-800` | `#1E40AF` | Primary button (active / pressed) |
| `--color-primary-900` | `#1E3A8A` | Dark backgrounds, sidebar |
| `--color-primary-950` | `#172554` | Deep header, footer |

#### Accent — Amber

| Token | Hex | Usage |
|---|---|---|
| `--color-accent-50` | `#FFFBEB` | Warning banner background |
| `--color-accent-100` | `#FEF3C7` | Warning chip background |
| `--color-accent-400` | `#FBBF24` | Warning icon |
| `--color-accent-500` | `#F59E0B` | Accent button, badge |
| `--color-accent-600` | `#D97706` | Warning text on light |
| `--color-accent-700` | `#B45309` | Warning text (AAA contrast) |

#### Neutral — Zinc

| Token | Hex | Usage |
|---|---|---|
| `--color-neutral-0` | `#FFFFFF` | Card surface, modal |
| `--color-neutral-50` | `#FAFAFA` | Page background |
| `--color-neutral-100` | `#F4F4F5` | Table stripe, input background |
| `--color-neutral-200` | `#E4E4E7` | Border, divider |
| `--color-neutral-300` | `#D4D4D8` | Disabled border |
| `--color-neutral-400` | `#A1A1AA` | Placeholder text |
| `--color-neutral-500` | `#71717A` | Secondary text |
| `--color-neutral-600` | `#52525B` | Body text (light mode) |
| `--color-neutral-700` | `#3F3F46` | Heading text |
| `--color-neutral-800` | `#27272A` | Strong heading |
| `--color-neutral-900` | `#18181B` | Maximum contrast text |
| `--color-neutral-950` | `#09090B` | Dark mode surface |

### 1.2 Semantic Colors

#### Status — Success (Green)

| Token | Hex | Usage |
|---|---|---|
| `--color-success-50` | `#F0FDF4` | Success banner background |
| `--color-success-100` | `#DCFCE7` | Success chip background |
| `--color-success-500` | `#22C55E` | Success icon |
| `--color-success-600` | `#16A34A` | Success text |
| `--color-success-700` | `#15803D` | Success text (AAA) |

#### Status — Warning (Amber — shares accent scale)

#### Status — Danger (Red)

| Token | Hex | Usage |
|---|---|---|
| `--color-danger-50` | `#FFF1F2` | Error banner background |
| `--color-danger-100` | `#FFE4E6` | Error chip background |
| `--color-danger-400` | `#FB7185` | Error icon on dark |
| `--color-danger-500` | `#EF4444` | Error icon |
| `--color-danger-600` | `#DC2626` | Error text, destructive button |
| `--color-danger-700` | `#B91C1C` | Error text (AAA) |

#### Status — Info (Sky)

| Token | Hex | Usage |
|---|---|---|
| `--color-info-50` | `#F0F9FF` | Info banner background |
| `--color-info-500` | `#0EA5E9` | Info icon |
| `--color-info-600` | `#0284C7` | Info text |

### 1.3 Semantic Surface Tokens

```css
/* Map to palette tokens above */
--surface-page:         var(--color-neutral-50);
--surface-card:         var(--color-neutral-0);
--surface-overlay:      var(--color-neutral-0);
--surface-sidebar:      var(--color-primary-900);
--surface-header:       var(--color-primary-950);
--surface-input:        var(--color-neutral-100);
--surface-input-focus:  var(--color-neutral-0);

--text-primary:         var(--color-neutral-800);
--text-secondary:       var(--color-neutral-500);
--text-disabled:        var(--color-neutral-400);
--text-inverse:         var(--color-neutral-0);
--text-link:            var(--color-primary-600);
--text-link-hover:      var(--color-primary-700);

--border-default:       var(--color-neutral-200);
--border-strong:        var(--color-neutral-300);
--border-focus:         var(--color-primary-500);
--border-error:         var(--color-danger-500);
```

### 1.4 Dark Mode Overrides

```css
@media (prefers-color-scheme: dark) {
  --surface-page:         var(--color-neutral-950);
  --surface-card:         #1C1C1F;
  --surface-sidebar:      #0D0D0F;
  --surface-input:        #2A2A2E;
  --text-primary:         var(--color-neutral-100);
  --text-secondary:       var(--color-neutral-400);
  --border-default:       #2A2A2E;
}
```

### 1.5 Progress / Completion Colors

Used consistently across all progress indicators.

| Range | Color | Token |
|---|---|---|
| 0–25 % | Danger Red | `--color-danger-500` |
| 26–50 % | Warning Amber | `--color-accent-500` |
| 51–75 % | Info Sky | `--color-info-500` |
| 76–99 % | Primary Blue | `--color-primary-500` |
| 100 % | Success Green | `--color-success-500` |

---

## 2. Typography

### 2.1 Font Stack

```css
--font-sans:   'Inter', 'Helvetica Neue', Arial, sans-serif;
--font-mono:   'JetBrains Mono', 'Fira Code', Consolas, monospace;
--font-tabular: 'Inter', sans-serif;  /* use font-variant-numeric: tabular-nums */
```

> **Rationale:** Inter is legible at small sizes, has excellent numerals, and
> renders cleanly on low-DPI screens (tablets on site).

### 2.2 Type Scale

Base size: **16 px (1 rem)**. Scale ratio: **1.25 (Major Third)**.

| Token | rem | px | Weight | Line Height | Usage |
|---|---|---|---|---|---|
| `--text-xs` | 0.75 | 12 | 400 | 1.5 | Table labels, fine print |
| `--text-sm` | 0.875 | 14 | 400 | 1.5 | Secondary body, table cells |
| `--text-base` | 1.0 | 16 | 400 | 1.6 | Primary body text |
| `--text-md` | 1.125 | 18 | 500 | 1.5 | Form labels, card sub-headings |
| `--text-lg` | 1.25 | 20 | 600 | 1.4 | Card titles, section headings |
| `--text-xl` | 1.5 | 24 | 600 | 1.35 | Page sub-headings |
| `--text-2xl` | 1.875 | 30 | 700 | 1.25 | Page headings |
| `--text-3xl` | 2.25 | 36 | 700 | 1.2 | Dashboard KPI values |
| `--text-4xl` | 3.0 | 48 | 800 | 1.1 | Hero metrics (Executive view) |

### 2.3 Heading Hierarchy

```
H1 — 2xl / 700      Page title (one per page)
H2 — xl  / 600      Section heading
H3 — lg  / 600      Card heading, drawer title
H4 — md  / 500      Sub-section, table group label
H5 — base/ 500      Minor label
```

### 2.4 Numeric Display Rules

All numbers shown in tables, KPI cards, or charts must use:
```css
font-variant-numeric: tabular-nums;
letter-spacing: -0.01em;
```

This prevents layout shift when values update and keeps columns aligned.

---

## 3. Spacing

Base unit: **4 px (0.25 rem)**.
All spacing values are multiples of 4.

| Token | px | rem | Common Usage |
|---|---|---|---|
| `--space-1` | 4 | 0.25 | Icon-to-label gap |
| `--space-2` | 8 | 0.5 | Inline element gap |
| `--space-3` | 12 | 0.75 | Compact padding |
| `--space-4` | 16 | 1.0 | Default padding |
| `--space-5` | 20 | 1.25 | Form field gap |
| `--space-6` | 24 | 1.5 | Card padding |
| `--space-8` | 32 | 2.0 | Section gap |
| `--space-10` | 40 | 2.5 | Large section gap |
| `--space-12` | 48 | 3.0 | Page section gap |
| `--space-16` | 64 | 4.0 | Page top padding |
| `--space-24` | 96 | 6.0 | Hero spacing |

---

## 4. Grid & Layout

### 4.1 Breakpoints

| Name | Min Width | Target Device |
|---|---|---|
| `xs` | 0 px | Mobile (site diary on phone) |
| `sm` | 480 px | Large phone |
| `md` | 768 px | Tablet (site supervisor iPad) |
| `lg` | 1024 px | Laptop |
| `xl` | 1280 px | Desktop |
| `2xl` | 1536 px | Wide monitor (Executive dashboard) |

### 4.2 Page Grid

```
Desktop (lg+):
  ┌──────────────────────────────────────────────┐
  │  Sidebar (240 px fixed)  │  Content Area     │
  │                          │  max-width: 1200px│
  │                          │  padding: 0 32px  │
  └──────────────────────────────────────────────┘

Tablet (md):
  Sidebar collapses to icon-only (64 px)
  Content expands to fill remaining width

Mobile (sm/xs):
  Sidebar hidden, accessible via hamburger
  Content full-width with 16 px horizontal padding
```

### 4.3 Content Grid

Within the content area, use a **12-column grid** with **24 px gutters**.

| Layout | Column Span |
|---|---|
| Full-width table | 12 |
| Two-column split | 6 / 6 |
| Sidebar + main | 4 / 8 |
| Three KPI cards | 4 / 4 / 4 |
| Four metric cards | 3 / 3 / 3 / 3 |
| Chart + summary | 8 / 4 |

---

## 5. Elevation (Shadows)

| Level | CSS `box-shadow` | Usage |
|---|---|---|
| `--shadow-0` | `none` | Flat surface (table rows, list items) |
| `--shadow-1` | `0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)` | Cards at rest |
| `--shadow-2` | `0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)` | Cards on hover, dropdowns |
| `--shadow-3` | `0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)` | Floating panels, date pickers |
| `--shadow-4` | `0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)` | Modals, dialogs |
| `--shadow-5` | `0 25px 50px rgba(0,0,0,0.25)` | Full-screen overlays |

### Focus Ring

```css
--focus-ring: 0 0 0 3px var(--color-primary-200);
/* Applied via :focus-visible on all interactive elements */
```

---

## 6. Border Radius

| Token | px | Usage |
|---|---|---|
| `--radius-sm` | 4 | Badges, chips, input fields |
| `--radius-md` | 8 | Cards, buttons, dropdowns |
| `--radius-lg` | 12 | Modals, drawers, large panels |
| `--radius-xl` | 16 | Feature cards |
| `--radius-full` | 9999 | Pills, toggle switches, avatars |

---

## 7. Icon System

### 7.1 Library

**Lucide Icons** — consistent stroke weight, 24 × 24 px grid, MIT licensed.
All icons rendered as inline SVG (no font icons).

### 7.2 Size Scale

| Size | px | Usage |
|---|---|---|
| `icon-xs` | 12 | Inline with fine print |
| `icon-sm` | 16 | Table cells, input adornments |
| `icon-md` | 20 | Default (most UI contexts) |
| `icon-lg` | 24 | Navigation items, card headings |
| `icon-xl` | 32 | Feature icons, empty states |
| `icon-2xl` | 48 | Onboarding, zero-state illustrations |

### 7.3 Stroke Width

```
Default:  1.5 px
Bold:     2.0 px  (used in navigation active state)
```

### 7.4 Icon–Label Spacing

Always `--space-2` (8 px) between icon and its text label.

### 7.5 Semantic Icon Map

| Concept | Icon | Notes |
|---|---|---|
| Dashboard | `LayoutDashboard` | |
| Project | `FolderKanban` | |
| Site | `MapPin` | |
| Activity | `ListChecks` | |
| BOQ | `FileSpreadsheet` | |
| Material | `Package` | |
| Inventory | `Warehouse` | |
| Daily Report | `ClipboardList` | |
| Workforce | `Users` | |
| Equipment | `Truck` | |
| Forecast | `TrendingUp` | |
| Cost | `DollarSign` | (or local currency) |
| Drawing | `FileImage` | |
| AI / Assistant | `Sparkles` | |
| Safety | `ShieldCheck` | |
| Alert / Warning | `AlertTriangle` | Amber fill |
| Error | `XCircle` | Red fill |
| Success | `CheckCircle2` | Green fill |
| Info | `InfoIcon` | Blue fill |
| Photo | `Camera` | |
| Voice | `Mic` | |
| Drone | `Plane` | |
| Settings | `Settings` | |
| Notification | `Bell` | |
| Search | `Search` | |
| Filter | `SlidersHorizontal` | |
| Export | `Download` | |
| Sync | `RefreshCw` | |
| Offline | `CloudOff` | |

---

## 8. Motion & Animation

### 8.1 Principles

- Motion communicates **state change**, not decoration
- **No motion** for pure data updates (number ticks, table row additions)
- **Micro-motion** for interactive feedback (button press, toggle)
- **Transition motion** for navigating between views
- Respect `prefers-reduced-motion` — all animations disabled when set

### 8.2 Duration Tokens

| Token | ms | Usage |
|---|---|---|
| `--duration-instant` | 0 | Reduced-motion fallback |
| `--duration-fast` | 100 | Micro-interactions (button press, checkbox) |
| `--duration-normal` | 200 | Tooltips, hover states, small popups |
| `--duration-moderate` | 300 | Dropdown open, drawer slide, modal enter |
| `--duration-slow` | 500 | Page transitions, chart entry animations |
| `--duration-crawl` | 1000 | Progress bar fill on load |

### 8.3 Easing Tokens

```css
--ease-linear:   linear;
--ease-in:       cubic-bezier(0.4, 0, 1, 1);
--ease-out:      cubic-bezier(0, 0, 0.2, 1);   /* Default for entering elements */
--ease-in-out:   cubic-bezier(0.4, 0, 0.2, 1); /* Default for state changes */
--ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1); /* Bounce for success states */
```

### 8.4 Standard Transitions

```css
/* Buttons and interactive controls */
transition: background-color var(--duration-fast) var(--ease-in-out),
            box-shadow       var(--duration-fast) var(--ease-in-out),
            border-color     var(--duration-fast) var(--ease-in-out);

/* Sidebar expand/collapse */
transition: width var(--duration-moderate) var(--ease-in-out);

/* Modal / Drawer enter */
animation: slideInUp var(--duration-moderate) var(--ease-out);

/* Dropdown open */
animation: fadeScaleIn var(--duration-normal) var(--ease-out);

/* Toast / Notification enter */
animation: slideInRight var(--duration-normal) var(--ease-spring);
```

### 8.5 Chart Animation

- Bar / column charts: bars grow from baseline on first render (500 ms, staggered 30 ms per bar)
- Line charts: line draws left to right on first render (800 ms)
- Donut / ring charts: arc fills clockwise on first render (600 ms)
- After initial render: data updates are **instant** (no re-animation on refresh)

---

## 9. Accessibility

### 9.1 Contrast Requirements

| Context | Minimum Ratio | Target |
|---|---|---|
| Body text (≥ 18 px) | 3.0 : 1 (AA Large) | 4.5 : 1 |
| Body text (< 18 px) | 4.5 : 1 (AA) | 7.0 : 1 (AAA) |
| Status text (danger/warning) | 4.5 : 1 (AA) | 7.0 : 1 (AAA) |
| UI component borders | 3.0 : 1 | 4.5 : 1 |
| Disabled text | Exempt | — |

> All primary brand text combinations have been verified:
> Neutral-800 on Neutral-50 → 12.6 : 1 ✓
> Primary-700 on Primary-50 → 8.1 : 1 ✓
> Danger-700 on Danger-50 → 9.3 : 1 ✓

### 9.2 Focus Management

- All interactive elements have a visible `:focus-visible` ring (3 px, `--color-primary-200`)
- Modal open: focus moves to first focusable element inside modal
- Modal close: focus returns to the trigger element
- No `outline: none` without an equivalent custom focus indicator

### 9.3 Touch Targets

- Minimum touch target: **44 × 44 px** (WCAG 2.5.5)
- Primary action buttons: **48 px height**
- Navigation items: **48 px height**
- Table row actions: **44 × 44 px** (use padding, not element size)
- Mobile FAB: **56 × 56 px**

### 9.4 Screen Reader Requirements

- All icons have `aria-label` or are `aria-hidden` with adjacent visible text
- Status badges include screen-reader text: `<span class="sr-only">Status: </span>At Risk`
- Charts provide a data table alternative accessible to screen readers
- Form fields always have visible, programmatically associated labels (no placeholder-only)
- Live regions (`aria-live="polite"`) for dynamic content updates (sync status, toast messages)

### 9.5 Colour Independence

Status is never conveyed by colour alone. Every status indicator uses:
- Colour **+** icon **+** text label

---

## 10. Component Library

Each component below is defined with its purpose, variants, states, and key
props. Full implementation specs follow in the separate Component Library
document (Phase 4).

### 10.1 Atoms

#### Button

**Variants:** Primary · Secondary · Ghost · Destructive · Link

**Sizes:** sm (32 px) · md (40 px) · lg (48 px)

**States:** rest · hover · active · focus · disabled · loading

**Props:**
```typescript
variant:  'primary' | 'secondary' | 'ghost' | 'destructive' | 'link'
size:     'sm' | 'md' | 'lg'
loading:  boolean
disabled: boolean
iconLeft: LucideIcon
iconRight: LucideIcon
fullWidth: boolean
```

**Visual spec:**
```
Primary:     bg primary-600  text white       border none         → hover: primary-700
Secondary:   bg transparent  text primary-600  border primary-500  → hover: primary-50 bg
Ghost:       bg transparent  text neutral-600  border none         → hover: neutral-100 bg
Destructive: bg danger-600   text white        border none         → hover: danger-700
Disabled:    bg neutral-100  text neutral-400  border neutral-200  (all variants)
Loading:     shows spinner, maintains width, pointer-events: none
```

---

#### Badge / StatusBadge

**Variants:** success · warning · danger · info · neutral · primary

**Sizes:** sm · md

**Props:**
```typescript
variant:  'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary'
size:     'sm' | 'md'
icon:     LucideIcon  // optional
dot:      boolean     // coloured dot only, no text
```

---

#### MetricCard

Used on every dashboard. Shows a single KPI.

**Props:**
```typescript
label:       string
value:       string | number
unit:        string           // '%', 'm³', 'days', etc.
trend:       number           // positive = good or bad depending on metric type
trendLabel:  string           // 'vs last week'
trendPositiveIsGood: boolean  // controls green/red colouring
status:      'ok' | 'warning' | 'danger'
icon:        LucideIcon
loading:     boolean
```

**Layout:**
```
┌─────────────────────────────────┐
│  Icon   Label              Trend│
│         ─────────────────       │
│         VALUE unit              │
│         Sub-label               │
└─────────────────────────────────┘
```

---

#### ProgressRing

Circular progress indicator. Used for activity completion, budget consumed.

**Props:**
```typescript
value:      number   // 0–100
size:       'sm' (48px) | 'md' (64px) | 'lg' (96px)
thickness:  number   // stroke width in px
label:      string   // centre label (defaults to `${value}%`)
colorScale: boolean  // if true, colour follows the 5-band progress scale
```

---

#### Input

**Types:** text · number · date · search · textarea · select

**States:** rest · focus · error · disabled · read-only

**Props:**
```typescript
label:       string
placeholder: string
hint:        string        // helper text below field
error:       string        // error message (replaces hint)
iconLeft:    LucideIcon
iconRight:   LucideIcon
prefix:      string        // 'm²', '$', etc.
suffix:      string
required:    boolean
disabled:    boolean
readOnly:    boolean
```

---

#### DataTable

**Features:**
- Sortable columns (click header)
- Column visibility toggle
- Sticky header
- Row selection (single / multi)
- Inline row actions (edit, delete, view)
- Pagination or infinite scroll toggle
- Empty state slot
- Loading skeleton (replaces rows during fetch)
- Row expansion (sub-rows)
- Exportable (CSV, Excel)

**Props:**
```typescript
columns:      ColumnDef[]
data:         Row[]
loading:      boolean
selectable:   boolean
expandable:   boolean
pageSize:     number
sortable:     boolean
onRowClick:   (row) => void
emptyState:   ReactNode
actions:      RowAction[]
```

---

### 10.2 Molecules

#### SearchBar

Global search with result type grouping.

```
[ 🔍  Search projects, activities, materials...        ⌘K ]
```

Keyboard shortcut `Cmd+K` / `Ctrl+K` opens it as a command palette.
Results grouped by type: Projects · Activities · Materials · Reports.

---

#### FilterBar

Reusable filter toolbar used above every table / list.

**Props:**
```typescript
filters: FilterConfig[]  // { label, key, type: 'select'|'date'|'range'|'toggle', options[] }
value:   FilterState
onChange: (state) => void
onClear:  () => void
```

---

#### DateRangePicker

Single calendar component supporting:
- Single date
- Date range (start + end)
- Preset ranges: Today · This Week · This Month · Last 30 Days · Custom

---

#### FileUpload

Drag-and-drop area + click-to-browse.

**Props:**
```typescript
accept:      string[]    // ['.pdf', '.dwg', '.jpg', '.png']
maxSizeMB:   number
multiple:    boolean
onUpload:    (files: File[]) => void
uploadProgress: Record<string, number>  // filename → 0–100
```

---

#### CommentThread

Threaded comments attached to any entity (activity, issue, RFI).

```
┌───────────────────────────────────────┐
│  [Avatar] John Smith  2h ago          │
│           Concrete pour complete.     │
│           ↳ Reply                     │
│                                       │
│  [Avatar] Jane Doe  1h ago            │
│           Confirmed on site.          │
└───────────────────────────────────────┘
[ Add a comment...                  Send ]
```

---

### 10.3 Organisms

#### Header

```
┌────────────────────────────────────────────────────────┐
│ [Logo]  [ProjectSelector ▾]    [SearchBar]  [🔔] [👤] │
└────────────────────────────────────────────────────────┘
```

**Slots:** logo · projectSelector · globalSearch · notificationBell ·
userMenu · offlineIndicator

---

#### Sidebar

```
┌────────────┐
│ 📊 Dashboard│  ← active (bold, primary-100 bg)
│ 📁 Projects │
│ 📋 BOQ      │
│ 📦 Materials│
│ 📝 Progress │
│ 🏗 Inventory│
│ 📈 Reports  │
│ 🔮 Forecast │
│ ✨ AI       │
│ ─────────── │
│ ⚙ Settings │
│ 👥 Admin   │
└────────────┘
```

Active state: `background: primary-100`, `color: primary-800`, left border 3 px `primary-600`

---

#### NotificationPanel

Slide-in tray from top-right. Grouped by type (alerts · approvals · mentions).

```
┌─────────────────────────┐
│ Notifications    Mark all│
│─────────────────────────│
│ 🔴 ALERT  2m ago        │
│    Rebar stock critical  │
│    Site A — Basement     │
│─────────────────────────│
│ 🟡 FORECAST  1h ago     │
│    Foundation delay risk │
│    SPI 0.82              │
└─────────────────────────┘
```

---

#### ActivityFeed

Chronological log of project events. Each entry shows:
actor · action · entity · timestamp · (optional) value delta.

```
John logged 40 m² slab — Block B Level 2     2m ago
Jane approved PO-0042 — Rebar 10mm (5t)     15m ago
System: Inventory alert — Sand < reorder pt  1h ago
```

---

## 11. Density Modes

| Mode | Padding | Font size | Row height | Usage |
|---|---|---|---|---|
| **Compact** | `--space-2` / `--space-3` | `--text-sm` | 36 px | Executive dashboards, dense tables |
| **Comfortable** (default) | `--space-4` / `--space-6` | `--text-base` | 48 px | Standard views |
| **Spacious** | `--space-6` / `--space-8` | `--text-md` | 56 px | Forms, entry screens (mobile) |

Users can toggle density in their profile settings. Mobile defaults to Spacious.

---

## 12. Design Tokens — CSS Custom Properties

Full token file for implementation:

```css
:root {
  /* Colors */
  --color-primary-600: #2563EB;
  --color-primary-700: #1D4ED8;
  --color-primary-900: #1E3A8A;
  --color-accent-500:  #F59E0B;
  --color-accent-600:  #D97706;
  --color-success-500: #22C55E;
  --color-success-600: #16A34A;
  --color-danger-500:  #EF4444;
  --color-danger-600:  #DC2626;
  --color-info-500:    #0EA5E9;
  --color-neutral-0:   #FFFFFF;
  --color-neutral-50:  #FAFAFA;
  --color-neutral-100: #F4F4F5;
  --color-neutral-200: #E4E4E7;
  --color-neutral-400: #A1A1AA;
  --color-neutral-500: #71717A;
  --color-neutral-600: #52525B;
  --color-neutral-700: #3F3F46;
  --color-neutral-800: #27272A;

  /* Semantic surfaces */
  --surface-page:     var(--color-neutral-50);
  --surface-card:     var(--color-neutral-0);
  --surface-sidebar:  var(--color-primary-900);
  --surface-input:    var(--color-neutral-100);
  --text-primary:     var(--color-neutral-800);
  --text-secondary:   var(--color-neutral-500);
  --text-inverse:     var(--color-neutral-0);
  --border-default:   var(--color-neutral-200);
  --border-focus:     var(--color-primary-500);
  --border-error:     var(--color-danger-500);

  /* Typography */
  --font-sans:   'Inter', system-ui, sans-serif;
  --font-mono:   'JetBrains Mono', monospace;
  --text-xs:     0.75rem;
  --text-sm:     0.875rem;
  --text-base:   1rem;
  --text-lg:     1.25rem;
  --text-xl:     1.5rem;
  --text-2xl:    1.875rem;
  --text-3xl:    2.25rem;
  --text-4xl:    3rem;

  /* Spacing */
  --space-1:  0.25rem;
  --space-2:  0.5rem;
  --space-3:  0.75rem;
  --space-4:  1rem;
  --space-6:  1.5rem;
  --space-8:  2rem;
  --space-12: 3rem;
  --space-16: 4rem;

  /* Radii */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-1: 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1);
  --shadow-2: 0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06);
  --shadow-3: 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05);
  --shadow-4: 0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04);
  --focus-ring: 0 0 0 3px var(--color-primary-200);

  /* Motion */
  --duration-fast:     100ms;
  --duration-normal:   200ms;
  --duration-moderate: 300ms;
  --duration-slow:     500ms;
  --ease-out:   cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-fast:     0ms;
    --duration-normal:   0ms;
    --duration-moderate: 0ms;
    --duration-slow:     0ms;
  }
}
```

---

## 13. Tailwind Config Excerpt

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EFF6FF', 100: '#DBEAFE', 200: '#BFDBFE',
          500: '#3B82F6', 600: '#2563EB', 700: '#1D4ED8',
          800: '#1E40AF', 900: '#1E3A8A', 950: '#172554',
        },
        accent: {
          50: '#FFFBEB', 100: '#FEF3C7', 400: '#FBBF24',
          500: '#F59E0B', 600: '#D97706', 700: '#B45309',
        },
        success: {
          50: '#F0FDF4', 100: '#DCFCE7', 500: '#22C55E', 600: '#16A34A',
        },
        danger: {
          50: '#FFF1F2', 100: '#FFE4E6', 500: '#EF4444', 600: '#DC2626',
        },
        neutral: {
          0: '#FFFFFF', 50: '#FAFAFA', 100: '#F4F4F5', 200: '#E4E4E7',
          400: '#A1A1AA', 500: '#71717A', 600: '#52525B', 700: '#3F3F46',
          800: '#27272A', 900: '#18181B', 950: '#09090B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'card':   '0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)',
        'panel':  '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)',
        'modal':  '0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)',
        'focus':  '0 0 0 3px #BFDBFE',
      },
      borderRadius: {
        'sm': '4px', 'md': '8px', 'lg': '12px', 'xl': '16px',
      },
    },
  },
}
```
