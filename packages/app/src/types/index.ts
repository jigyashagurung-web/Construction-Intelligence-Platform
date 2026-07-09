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
  wbs_code: string | null
  description: string
  unit: string | null
  quantity: number
  unit_rate: number
  amount: number
  trade: string | null
  status: BOQStatus
  created_by: string | null
  created_at: string
  updated_at: string
}

export type ActivityStatus = 'not_started' | 'on_track' | 'at_risk' | 'delayed' | 'complete'

export interface Activity {
  id: string
  project_id: string
  boq_item_id: string | null
  wbs_code: string | null
  name: string
  trade: string | null
  planned_start: string
  planned_end: string
  actual_start: string | null
  actual_end: string | null
  progress: number
  status: ActivityStatus
  is_critical: boolean
  assignee: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type Weather = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'foggy'

export interface DailyProgressEntry {
  id: string
  project_id: string
  activity_id: string | null
  entry_date: string
  weather: Weather | null
  labour_count: number
  equipment_count: number
  work_done: string
  issues: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  activity?: Activity
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
