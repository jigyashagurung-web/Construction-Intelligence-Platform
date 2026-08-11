export interface Organisation {
  id: string
  name: string
  slug: string
  plan: string
  created_at: string
}

export interface Profile {
  id: string
  org_id: string | null
  full_name: string | null
  email: string | null
  role: 'admin' | 'project_manager' | 'site_engineer' | 'qty_surveyor' | 'viewer'
  avatar_url: string | null
  created_at: string
}

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'complete' | 'cancelled'

export interface Project {
  id: string
  org_id: string
  name: string
  code: string
  status: ProjectStatus
  start_date: string | null
  end_date: string | null
  budget: number | null
  currency: string
  location: string | null
  description: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type BOQStatus = 'active' | 'omitted' | 'variation' | 'provisional'

export interface BOQItem {
  id: string
  project_id: string
  /** References BoqCodeCatalogEntry.code (line_item level) for items created after the taxonomy rollout; may still hold legacy free text for older rows. */
  wbs_code: string | null
  description: string
  unit: string | null
  quantity: number
  unit_rate: number
  amount: number
  /** Denormalized from boq_code_catalog by a DB trigger whenever wbs_code is set; null if wbs_code is absent or doesn't resolve to a line item. */
  chapter: string | null
  section: string | null
  revit_category: string | null
  family_type: string | null
  status: BOQStatus
  created_by: string | null
  created_at: string
  updated_at: string
}

export type BoqCodeLevel = 'chapter' | 'sub_chapter' | 'section' | 'line_item'

export interface BoqCodeCatalogEntry {
  code: string
  parent_code: string | null
  level: BoqCodeLevel
  description: string
  unit: string | null
  revit_category: string | null
  family_type: string | null
  created_at: string
  updated_at: string
}

export type ActivityStatus = 'not_started' | 'on_track' | 'at_risk' | 'delayed' | 'complete'

export type ActualEndSource = 'derived' | 'manual'

export interface Activity {
  id: string
  project_id: string
  boq_item_id: string
  name: string
  planned_start: string
  planned_end: string
  /** Read-only — derived from Daily Log entries (earliest entry_date). Not settable via create/update. */
  actual_start: string | null
  /** Read-only — derived from Daily Log entries, or stamped on manual completion. Not settable via create/update. */
  actual_end: string | null
  /** Present only when actual_end is set: 'derived' from diary quantity math, or 'manual' from a completion stamp. */
  actual_end_source: ActualEndSource | null
  progress: number
  status: ActivityStatus
  is_critical: boolean
  assignee: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type Weather = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'foggy'

export interface DailyProgressPhoto {
  id: string
  entry_id: string
  project_id: string
  storage_path: string
  caption: string | null
  created_by: string | null
  created_at: string
}

export interface DailyProgressEntry {
  id: string
  project_id: string
  activity_id: string
  entry_date: string
  weather: Weather | null
  labour_count: number
  equipment_count: number
  quantity_consumed: number
  work_done: string
  issues: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  activity?: Activity
  photos?: DailyProgressPhoto[]
}

export interface DailyProgressRollup {
  project_id: string
  entry_date: string
  quantity_consumed: number
  labour_count: number
  equipment_count: number
  entries: number
}

export interface ProgressCurvePoint {
  project_id: string
  entry_date: string
  planned_pct: number | null
  actual_pct: number | null
}

/** Raw EVM aggregates for a project, as of the current date. Derived ratios
 * (SV/SPI/CV/CPI/EAC/VAC) are computed client-side — see computeEvmMetrics. */
export interface ProjectEvm {
  project_id: string
  bac: number
  total_active_boq_amount: number
  pv: number
  ev: number
  ac: number
  unlinked_activity_count: number
}

export interface Material {
  id: string
  org_id: string
  name: string
  unit: string
  category: string | null
  spec: string | null
  created_at: string
}

export interface ProjectMaterial {
  id: string
  project_id: string
  material_id: string
  on_hand: number
  reorder_point: number
  unit_cost: number | null
  updated_at: string
  material?: Material
}

export type TransactionType = 'grn' | 'issue' | 'return' | 'adjustment'

export interface MaterialTransaction {
  id: string
  project_id: string
  material_id: string
  txn_type: TransactionType
  quantity: number
  unit_cost: number | null
  reference: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  material?: Material
}
