/**
 * Full-page composition: Daily Progress Report (DPR)
 * Site engineer's primary data-entry screen — submitted once per working day.
 */
import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
  LayoutDashboard, FolderKanban, FileText, Settings2,
  ShieldCheck, Users, Plus, Trash2, CloudSun,
  Save, Send, CheckCircle2, AlertTriangle, HardHat, Truck,
} from 'lucide-react'
import { AppShell }       from '../organisms/AppShell'
import { PageHeader }     from '../molecules/PageHeader'
import { ToastProvider, useToast } from '../molecules/Toast'
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from '../atoms/Card'
import { Badge }          from '../atoms/Badge'
import { Button }         from '../atoms/Button'
import { Input }          from '../atoms/Input'
import { Select }         from '../atoms/Select'
import { Textarea }       from '../atoms/Textarea'
import { Checkbox }       from '../atoms/Checkbox'
import { Switch }         from '../atoms/Switch'
import { Avatar }         from '../atoms/Avatar'
import { DatePicker }     from '../atoms/DatePicker'
import { FileUpload }     from '../atoms/FileUpload'
import { MetricCard }     from '../molecules/MetricCard'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogBody, DialogFooter, DialogClose,
} from '../organisms/Dialog'
import type { NavSection } from '../organisms/Sidebar'

// ── Nav ───────────────────────────────────────────────────────────────────────

const NAV: NavSection[] = [
  {
    id: 'main',
    items: [
      { id: 'dashboard', label: 'Dashboard',       icon: LayoutDashboard, href: '#' },
      { id: 'projects',  label: 'Projects',        icon: FolderKanban,    href: '#' },
      { id: 'dpr',       label: 'Daily Reports',   icon: FileText,        href: '#' },
    ],
  },
  {
    id: 'system',
    label: 'System',
    items: [
      { id: 'safety',   label: 'Safety',         icon: ShieldCheck, href: '#' },
      { id: 'settings', label: 'Settings',       icon: Settings2,   href: '#' },
      { id: 'admin',    label: 'Administration', icon: Users,       href: '#' },
    ],
  },
]

const HEADER_PROJECT = { id: 'bcc', name: 'Baneshwor Commercial Complex', code: 'BCC-2081' }
const USER           = { name: 'Bikash Karki', role: 'Site Engineer' }

// ── Data types ────────────────────────────────────────────────────────────────

type ActivityStatus = 'completed' | 'in-progress' | 'not-started'
type IssueSeverity  = 'low' | 'medium' | 'high' | 'critical'

interface Activity {
  id:            string
  trade:         string
  description:   string
  unit:          string
  plannedToday:  number
  completedQty:  string
  status:        ActivityStatus
  remarks:       string
}

interface MaterialRow {
  id:       string
  material: string
  qty:      string
  unit:     string
}

interface LabourRow {
  id:    string
  trade: string
  count: string
  hours: string
}

interface EquipmentRow {
  id:        string
  equipment: string
  hours:     string
  remarks:   string
}

interface IssueRow {
  id:          string
  description: string
  severity:    IssueSeverity
}

// ── Seed data ─────────────────────────────────────────────────────────────────

const INITIAL_ACTIVITIES: Activity[] = [
  { id:'a1', trade:'Concrete', description:'G+2 Column casting (Grid A-C)',  unit:'m³', plannedToday:12, completedQty:'10', status:'in-progress', remarks:'' },
  { id:'a2', trade:'Concrete', description:'G+2 Beam bottom shuttering',     unit:'m²', plannedToday:80, completedQty:'80', status:'completed',   remarks:'Completed ahead of schedule' },
  { id:'a3', trade:'Steel',    description:'G+2 Rebar fabrication & tying',  unit:'MT', plannedToday:2.5, completedQty:'2', status:'in-progress', remarks:'Mild delay due to rebar delivery' },
  { id:'a4', trade:'Masonry',  description:'External wall brickwork (West)', unit:'m²', plannedToday:30, completedQty:'0', status:'not-started',  remarks:'Waiting for mortar mix approval' },
  { id:'a5', trade:'MEP',      description:'Electrical conduit 3rd floor',   unit:'m',  plannedToday:45, completedQty:'38', status:'in-progress', remarks:'' },
]

const INITIAL_MATERIALS: MaterialRow[] = [
  { id:'m1', material:'OPC 43 Grade Cement', qty:'28', unit:'bags'  },
  { id:'m2', material:'20mm Coarse aggregate', qty:'6.5', unit:'m³' },
  { id:'m3', material:'River sand (washed)', qty:'4',  unit:'m³'   },
]

const INITIAL_LABOUR: LabourRow[] = [
  { id:'l1', trade:'Carpenter',    count:'4', hours:'8'   },
  { id:'l2', trade:'Bar bender',   count:'6', hours:'9'   },
  { id:'l3', trade:'Mason',        count:'3', hours:'7.5' },
  { id:'l4', trade:'Electrician',  count:'2', hours:'8'   },
  { id:'l5', trade:'General labour', count:'12', hours:'8' },
]

const INITIAL_EQUIPMENT: EquipmentRow[] = [
  { id:'e1', equipment:'Concrete mixer (1 bag)',      hours:'7',   remarks:'' },
  { id:'e2', equipment:'Scaffolding jack (set of 20)', hours:'',   remarks:'Stationary — no hourly count' },
  { id:'e3', equipment:'Water pump',                  hours:'4.5', remarks:'Used for curing' },
]

const INITIAL_ISSUES: IssueRow[] = [
  { id:'i1', description:'Rebar delivery delayed by 3 hours — sub-contractor notified', severity:'medium' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

const WEATHER_OPTIONS = [
  { value:'sunny',        label:'☀️ Sunny'        },
  { value:'partly-cloudy',label:'⛅ Partly cloudy' },
  { value:'cloudy',       label:'☁️ Cloudy'        },
  { value:'light-rain',   label:'🌦 Light rain'    },
  { value:'heavy-rain',   label:'🌧 Heavy rain'    },
]

const SEVERITY_CONFIG: Record<IssueSeverity, { variant: any; label: string }> = {
  low:      { variant:'default', label:'Low'      },
  medium:   { variant:'warning', label:'Medium'   },
  high:     { variant:'danger',  label:'High'     },
  critical: { variant:'danger',  label:'Critical' },
}

const STATUS_CONFIG: Record<ActivityStatus, { variant: any; label: string }> = {
  'completed':   { variant:'success', label:'Completed'   },
  'in-progress': { variant:'primary', label:'In progress' },
  'not-started': { variant:'default', label:'Not started' },
}

function pct(completed: string, planned: number): number {
  const n = parseFloat(completed)
  if (!n || !planned) return 0
  return Math.min(100, Math.round((n / planned) * 100))
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ number, title, icon: Icon, children }: {
  number: number
  title:  string
  icon:   React.ElementType
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:'var(--action-primary-bg)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Icon className="h-4 w-4" style={{ color:'var(--action-primary-text)' }} aria-hidden />
          </div>
          <div>
            <p style={{ fontSize:10, fontWeight:700, color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Section {number}</p>
            <CardTitle>{title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardBody>{children}</CardBody>
    </Card>
  )
}

// ── Table helpers ─────────────────────────────────────────────────────────────

function THead({ cols }: { cols: string[] }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:`repeat(${cols.length}, 1fr) 36px`, gap:8, marginBottom:6 }}>
      {cols.map((c) => (
        <p key={c} style={{ fontSize:11, fontWeight:600, color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'0.05em' }}>{c}</p>
      ))}
      <div />
    </div>
  )
}

// ── Main page component ───────────────────────────────────────────────────────

function DPRContent() {
  const { toast } = useToast()

  // Report header state
  const [reportDate,  setReportDate]  = useState('2081-04-02')
  const [weather,     setWeather]     = useState('partly-cloudy')
  const [temperature, setTemperature] = useState('24')
  const [certified,   setCertified]   = useState(false)
  const [showSubmit,  setShowSubmit]  = useState(false)

  // Section data
  const [activities,  setActivities]  = useState<Activity[]>(INITIAL_ACTIVITIES)
  const [materials,   setMaterials]   = useState<MaterialRow[]>(INITIAL_MATERIALS)
  const [labour,      setLabour]      = useState<LabourRow[]>(INITIAL_LABOUR)
  const [equipment,   setEquipment]   = useState<EquipmentRow[]>(INITIAL_EQUIPMENT)
  const [issues,      setIssues]      = useState<IssueRow[]>(INITIAL_ISSUES)
  const [observations, setObservations] = useState('Concrete pour for columns A1–A3 went well. Vibrator compaction done in lifts of 300mm as per specification. Curing started immediately after pour. Formwork for G+3 level beam bottom being prepared.')
  const [safetyOk,    setSafetyOk]    = useState(true)

  // Derived KPIs
  const completedActivities = activities.filter((a) => a.status === 'completed').length
  const totalLabour         = labour.reduce((s, l) => s + (parseInt(l.count) || 0), 0)
  const openIssues          = issues.filter((i) => i.severity === 'high' || i.severity === 'critical').length
  const overallProgress     = activities.length
    ? Math.round(activities.reduce((s, a) => s + pct(a.completedQty, a.plannedToday), 0) / activities.length)
    : 0

  // ── Activity handlers ───────────────────────────────────────────────────────
  function updateActivity(id: string, patch: Partial<Activity>) {
    setActivities((prev) => prev.map((a) => a.id === id ? { ...a, ...patch } : a))
  }

  // ── Material handlers ───────────────────────────────────────────────────────
  function addMaterial() {
    setMaterials((prev) => [...prev, { id: `m${Date.now()}`, material:'', qty:'', unit:'' }])
  }
  function updateMaterial(id: string, patch: Partial<MaterialRow>) {
    setMaterials((prev) => prev.map((m) => m.id === id ? { ...m, ...patch } : m))
  }
  function removeMaterial(id: string) {
    setMaterials((prev) => prev.filter((m) => m.id !== id))
  }

  // ── Labour handlers ─────────────────────────────────────────────────────────
  function addLabour() {
    setLabour((prev) => [...prev, { id: `l${Date.now()}`, trade:'', count:'', hours:'' }])
  }
  function updateLabour(id: string, patch: Partial<LabourRow>) {
    setLabour((prev) => prev.map((l) => l.id === id ? { ...l, ...patch } : l))
  }
  function removeLabour(id: string) {
    setLabour((prev) => prev.filter((l) => l.id !== id))
  }

  // ── Equipment handlers ──────────────────────────────────────────────────────
  function addEquipment() {
    setEquipment((prev) => [...prev, { id: `e${Date.now()}`, equipment:'', hours:'', remarks:'' }])
  }
  function updateEquipment(id: string, patch: Partial<EquipmentRow>) {
    setEquipment((prev) => prev.map((e) => e.id === id ? { ...e, ...patch } : e))
  }
  function removeEquipment(id: string) {
    setEquipment((prev) => prev.filter((e) => e.id !== id))
  }

  // ── Issue handlers ──────────────────────────────────────────────────────────
  function addIssue() {
    setIssues((prev) => [...prev, { id: `i${Date.now()}`, description:'', severity:'low' }])
  }
  function updateIssue(id: string, patch: Partial<IssueRow>) {
    setIssues((prev) => prev.map((i) => i.id === id ? { ...i, ...patch } : i))
  }
  function removeIssue(id: string) {
    setIssues((prev) => prev.filter((i) => i.id !== id))
  }

  function saveDraft() {
    toast({ title:'Draft saved', description:`DPR ${reportDate} saved — not yet submitted`, variant:'success' })
  }

  function submitReport() {
    setShowSubmit(false)
    toast({
      title: 'Report submitted',
      description: `DPR for ${reportDate} has been submitted for review`,
      variant: 'success',
      duration: 6000,
    })
  }

  return (
    <div style={{ height:'100vh' }}>
      <AppShell
        sidebarProps={{
          navigation: NAV,
          activeId:   'dpr',
          footer: (
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'4px 8px' }}>
              <Avatar name={USER.name} size="sm" status="online" />
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:600, color:'white', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{USER.name}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)' }}>{USER.role}</div>
              </div>
            </div>
          ),
        }}
        headerProps={{
          projects:      [HEADER_PROJECT],
          activeProject: HEADER_PROJECT,
          user:          USER,
          notificationCount: openIssues,
        }}
      >
        <div style={{ maxWidth:1200, margin:'0 auto' }}>

          {/* Page header */}
          <PageHeader
            title="Daily Progress Report"
            description={`${HEADER_PROJECT.name} · ${HEADER_PROJECT.code}`}
            breadcrumb={[
              { label:'Projects', onClick:() => {} },
              { label:'Baneshwor Commercial Complex', onClick:() => {} },
              { label:'Daily Reports' },
            ]}
            actions={
              <div style={{ display:'flex', gap:8 }}>
                <Button variant="secondary" size="sm" iconLeft={<Save className="h-4 w-4" />} onClick={saveDraft}>
                  Save draft
                </Button>
                <Button
                  size="sm"
                  iconLeft={<Send className="h-4 w-4" />}
                  disabled={!certified}
                  onClick={() => setShowSubmit(true)}
                >
                  Submit report
                </Button>
              </div>
            }
          />

          {/* KPI strip */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(170px, 1fr))', gap:14, marginBottom:24 }}>
            <MetricCard label="Activities today"     value={activities.length}       status="ok"      icon={<CheckCircle2 className="h-5 w-5" />} />
            <MetricCard label="Completed"            value={completedActivities}     status="ok"      icon={<CheckCircle2 className="h-5 w-5" />} />
            <MetricCard label="Overall progress"     value={`${overallProgress}%`}   status={overallProgress >= 70 ? 'ok' : overallProgress >= 40 ? 'warning' : 'danger'} />
            <MetricCard label="Workforce on site"    value={totalLabour}             status="ok"      icon={<HardHat      className="h-5 w-5" />} />
            <MetricCard label="Open issues"          value={openIssues}              status={openIssues > 0 ? 'warning' : 'ok'} icon={<AlertTriangle className="h-5 w-5" />} trendPositiveIsGood={false} />
          </div>

          {/* Two-column layout */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:20, alignItems:'start' }}>

            {/* ── Main form column ──────────────────────────────────────────── */}
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

              {/* S1: Report details */}
              <Section number={1} title="Report Details" icon={FileText}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                  <DatePicker
                    mode="bs"
                    label="Report date (BS)"
                    value={reportDate}
                    onChange={setReportDate}
                    required
                  />
                  <Input
                    label="Site engineer"
                    value={USER.name}
                    disabled
                    hint="Auto-filled from your login"
                  />
                  <Select
                    label="Weather condition"
                    options={WEATHER_OPTIONS}
                    value={weather}
                    onValueChange={setWeather}
                  />
                  <Input
                    label="Temperature (°C)"
                    type="number"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    hint="Approximate midday temperature"
                  />
                </div>
                <div style={{ marginTop:14 }}>
                  <Switch
                    label="Safety toolbox talk conducted today"
                    checked={safetyOk}
                    onCheckedChange={(v) => setSafetyOk(Boolean(v))}
                  />
                </div>
              </Section>

              {/* S2: Work activities */}
              <Section number={2} title="Work Activities" icon={CheckCircle2}>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {activities.map((a) => (
                    <div key={a.id} style={{ border:'1px solid var(--border-default)', borderRadius:10, padding:14, background:'var(--surface-input)' }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <Badge variant="default" size="sm">{a.trade}</Badge>
                          <span style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{a.description}</span>
                        </div>
                        <Badge variant={STATUS_CONFIG[a.status].variant} dot size="sm">
                          {STATUS_CONFIG[a.status].label}
                        </Badge>
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'100px 100px 1fr', gap:12 }}>
                        <Input
                          label={`Completed (${a.unit})`}
                          type="number"
                          size="sm"
                          value={a.completedQty}
                          hint={`Planned: ${a.plannedToday} ${a.unit}`}
                          onChange={(e) => {
                            const v = e.target.value
                            const p = pct(v, a.plannedToday)
                            updateActivity(a.id, {
                              completedQty: v,
                              status: p >= 100 ? 'completed' : p > 0 ? 'in-progress' : 'not-started',
                            })
                          }}
                        />
                        <div style={{ paddingTop:22 }}>
                          <div style={{ height:4, borderRadius:2, background:'var(--surface-hover)', overflow:'hidden' }}>
                            <div style={{ height:'100%', borderRadius:2, background: pct(a.completedQty, a.plannedToday) >= 100 ? 'var(--color-success-icon)' : 'var(--action-primary-bg)', width:`${pct(a.completedQty, a.plannedToday)}%`, transition:'width 0.3s' }} />
                          </div>
                          <p style={{ fontSize:11, color:'var(--text-tertiary)', marginTop:4 }}>{pct(a.completedQty, a.plannedToday)}%</p>
                        </div>
                        <Input
                          label="Remarks"
                          size="sm"
                          value={a.remarks}
                          placeholder="Any notes for this activity…"
                          onChange={(e) => updateActivity(a.id, { remarks: e.target.value })}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              {/* S3: Materials */}
              <Section number={3} title="Materials Consumed" icon={Truck}>
                <THead cols={['Material / Item', 'Qty used', 'Unit']} />
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {materials.map((m) => (
                    <div key={m.id} style={{ display:'grid', gridTemplateColumns:'1fr 90px 90px 36px', gap:8, alignItems:'end' }}>
                      <Input
                        size="sm"
                        value={m.material}
                        placeholder="Material name…"
                        onChange={(e) => updateMaterial(m.id, { material: e.target.value })}
                        aria-label="Material name"
                      />
                      <Input
                        size="sm"
                        type="number"
                        value={m.qty}
                        placeholder="0"
                        onChange={(e) => updateMaterial(m.id, { qty: e.target.value })}
                        aria-label="Quantity"
                      />
                      <Input
                        size="sm"
                        value={m.unit}
                        placeholder="bags, m³…"
                        onChange={(e) => updateMaterial(m.id, { unit: e.target.value })}
                        aria-label="Unit"
                      />
                      <button type="button" onClick={() => removeMaterial(m.id)} style={{ height:32, width:32, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:6, border:'1px solid var(--border-default)', background:'none', cursor:'pointer', color:'var(--text-tertiary)' }} aria-label="Remove material">
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  iconLeft={<Plus className="h-3.5 w-3.5" />}
                  onClick={addMaterial}
                  style={{ marginTop:8 }}
                >
                  Add material
                </Button>
              </Section>

              {/* S4: Labour + Equipment side by side */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>

                {/* Labour */}
                <Section number={4} title="Labour Deployed" icon={HardHat}>
                  <THead cols={['Trade', 'No.', 'Hrs']} />
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {labour.map((l) => (
                      <div key={l.id} style={{ display:'grid', gridTemplateColumns:'1fr 52px 52px 36px', gap:6, alignItems:'end' }}>
                        <Input size="sm" value={l.trade} placeholder="Trade…" onChange={(e) => updateLabour(l.id, { trade: e.target.value })} aria-label="Trade" />
                        <Input size="sm" type="number" value={l.count} placeholder="0" onChange={(e) => updateLabour(l.id, { count: e.target.value })} aria-label="Count" />
                        <Input size="sm" type="number" value={l.hours} placeholder="8" onChange={(e) => updateLabour(l.id, { hours: e.target.value })} aria-label="Hours" />
                        <button type="button" onClick={() => removeLabour(l.id)} style={{ height:32, width:32, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:6, border:'1px solid var(--border-default)', background:'none', cursor:'pointer', color:'var(--text-tertiary)' }} aria-label="Remove">
                          <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      </div>
                    ))}
                  </div>
                  <Button variant="ghost" size="sm" iconLeft={<Plus className="h-3.5 w-3.5" />} onClick={addLabour} style={{ marginTop:8 }}>
                    Add trade
                  </Button>
                </Section>

                {/* Equipment */}
                <Section number={5} title="Equipment Used" icon={Truck}>
                  <THead cols={['Equipment', 'Hours', 'Note']} />
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {equipment.map((e) => (
                      <div key={e.id} style={{ display:'grid', gridTemplateColumns:'1fr 52px 1fr 36px', gap:6, alignItems:'end' }}>
                        <Input size="sm" value={e.equipment} placeholder="Equipment…" onChange={(ev) => updateEquipment(e.id, { equipment: ev.target.value })} aria-label="Equipment" />
                        <Input size="sm" type="number" value={e.hours} placeholder="0" onChange={(ev) => updateEquipment(e.id, { hours: ev.target.value })} aria-label="Hours" />
                        <Input size="sm" value={e.remarks} placeholder="Remarks…" onChange={(ev) => updateEquipment(e.id, { remarks: ev.target.value })} aria-label="Remarks" />
                        <button type="button" onClick={() => removeEquipment(e.id)} style={{ height:32, width:32, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:6, border:'1px solid var(--border-default)', background:'none', cursor:'pointer', color:'var(--text-tertiary)' }} aria-label="Remove">
                          <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      </div>
                    ))}
                  </div>
                  <Button variant="ghost" size="sm" iconLeft={<Plus className="h-3.5 w-3.5" />} onClick={addEquipment} style={{ marginTop:8 }}>
                    Add equipment
                  </Button>
                </Section>
              </div>

              {/* S6: Issues */}
              <Section number={6} title="Issues & Observations" icon={AlertTriangle}>
                <Textarea
                  label="General observations"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  rows={4}
                  hint="Describe site conditions, progress notes, and any coordination items"
                />

                {issues.length > 0 && (
                  <div style={{ marginTop:16 }}>
                    <p style={{ fontSize:12, fontWeight:600, color:'var(--text-label)', marginBottom:8 }}>Logged issues</p>
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                      {issues.map((issue) => (
                        <div key={issue.id} style={{ display:'grid', gridTemplateColumns:'1fr 130px 36px', gap:8, alignItems:'end' }}>
                          <Input
                            size="sm"
                            value={issue.description}
                            placeholder="Describe the issue…"
                            onChange={(e) => updateIssue(issue.id, { description: e.target.value })}
                            aria-label="Issue description"
                          />
                          <Select
                            size="sm"
                            options={[
                              { value:'low',      label:'Low'      },
                              { value:'medium',   label:'Medium'   },
                              { value:'high',     label:'High'     },
                              { value:'critical', label:'Critical' },
                            ]}
                            value={issue.severity}
                            onValueChange={(v) => updateIssue(issue.id, { severity: v as IssueSeverity })}
                          />
                          <button type="button" onClick={() => removeIssue(issue.id)} style={{ height:32, width:32, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:6, border:'1px solid var(--border-default)', background:'none', cursor:'pointer', color:'var(--text-tertiary)' }} aria-label="Remove issue">
                            <Trash2 className="h-3.5 w-3.5" aria-hidden />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  iconLeft={<Plus className="h-3.5 w-3.5" />}
                  onClick={addIssue}
                  style={{ marginTop:12 }}
                >
                  Log issue
                </Button>
              </Section>

              {/* S7: Photos */}
              <Section number={7} title="Site Photos" icon={CloudSun}>
                <FileUpload
                  multiple
                  accept="image/*"
                  maxSize={15 * 1024 * 1024}
                  maxFiles={10}
                  label="Progress photos"
                  hint="Upload photos of today's work. JPG/PNG/WEBP, max 15 MB each, up to 10 photos."
                />
              </Section>
            </div>

            {/* ── Summary sidebar ───────────────────────────────────────────── */}
            <div style={{ position:'sticky', top:24, display:'flex', flexDirection:'column', gap:16 }}>

              {/* Report status */}
              <Card>
                <CardBody>
                  <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-tertiary)', marginBottom:10 }}>Report status</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ fontSize:12, color:'var(--text-secondary)' }}>Report date</span>
                      <span style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)' }}>{reportDate}</span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ fontSize:12, color:'var(--text-secondary)' }}>Weather</span>
                      <span style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)' }}>
                        {WEATHER_OPTIONS.find((w) => w.value === weather)?.label ?? weather}
                      </span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ fontSize:12, color:'var(--text-secondary)' }}>Temperature</span>
                      <span style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)' }}>{temperature ? `${temperature}°C` : '—'}</span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ fontSize:12, color:'var(--text-secondary)' }}>Safety TBT</span>
                      <Badge variant={safetyOk ? 'success' : 'danger'} size="sm" dot>{safetyOk ? 'Done' : 'Pending'}</Badge>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Activity summary */}
              <Card>
                <CardHeader>
                  <CardTitle style={{ fontSize:13 }}>Activity progress</CardTitle>
                </CardHeader>
                <CardBody>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {activities.map((a) => {
                      const p = pct(a.completedQty, a.plannedToday)
                      return (
                        <div key={a.id}>
                          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                            <span style={{ fontSize:11, color:'var(--text-secondary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'70%' }}>{a.description}</span>
                            <span style={{ fontSize:11, fontVariantNumeric:'tabular-nums', color:'var(--text-tertiary)', flexShrink:0, marginLeft:4 }}>{p}%</span>
                          </div>
                          <div style={{ height:4, borderRadius:2, background:'var(--surface-hover)', overflow:'hidden' }}>
                            <div style={{ height:'100%', borderRadius:2, background: p >= 100 ? 'var(--color-success-icon)' : p > 0 ? 'var(--action-primary-bg)' : 'transparent', width:`${p}%`, transition:'width 0.3s' }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardBody>
              </Card>

              {/* Open issues */}
              {issues.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle style={{ fontSize:13 }}>Open issues</CardTitle>
                  </CardHeader>
                  <CardBody padding="none">
                    {issues.map((issue, i) => (
                      <div key={issue.id} style={{ padding:'10px 16px', borderTop: i > 0 ? '1px solid var(--border-subtle)' : 'none', display:'flex', alignItems:'flex-start', gap:8 }}>
                        <Badge variant={SEVERITY_CONFIG[issue.severity].variant} size="sm" style={{ flexShrink:0, marginTop:1 }}>
                          {SEVERITY_CONFIG[issue.severity].label}
                        </Badge>
                        <p style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.4 }}>{issue.description || '(no description)'}</p>
                      </div>
                    ))}
                  </CardBody>
                </Card>
              )}

              {/* Sign-off + submit */}
              <Card>
                <CardBody>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14, padding:12, borderRadius:8, background:'var(--surface-hover)' }}>
                    <Avatar name={USER.name} size="sm" status="online" />
                    <div>
                      <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{USER.name}</p>
                      <p style={{ fontSize:11, color:'var(--text-tertiary)' }}>{USER.role}</p>
                    </div>
                  </div>

                  <Checkbox
                    label="I certify that all information in this report is accurate and complete to the best of my knowledge."
                    checked={certified}
                    onCheckedChange={(v) => setCertified(Boolean(v))}
                    size="sm"
                  />
                </CardBody>
                <CardFooter>
                  <Button variant="secondary" size="sm" iconLeft={<Save className="h-3.5 w-3.5" />} onClick={saveDraft} style={{ flex:1 }}>
                    Save draft
                  </Button>
                  <Button
                    size="sm"
                    iconLeft={<Send className="h-3.5 w-3.5" />}
                    disabled={!certified}
                    onClick={() => setShowSubmit(true)}
                    style={{ flex:1 }}
                  >
                    Submit
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>

        {/* ── Submit confirmation dialog ─────────────────────────────────────── */}
        <Dialog open={showSubmit} onOpenChange={setShowSubmit}>
          <DialogContent size="sm">
            <DialogHeader>
              <DialogTitle>Submit daily report?</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <p style={{ fontSize:14, color:'var(--text-secondary)', marginBottom:16 }}>
                You are about to submit the DPR for <strong>{reportDate}</strong>. Once submitted, it will be sent to the project manager for review and cannot be edited.
              </p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, padding:14, borderRadius:10, background:'var(--surface-hover)', fontSize:12 }}>
                <div><span style={{ color:'var(--text-tertiary)' }}>Activities: </span><strong>{activities.length}</strong></div>
                <div><span style={{ color:'var(--text-tertiary)' }}>Completed: </span><strong>{completedActivities}</strong></div>
                <div><span style={{ color:'var(--text-tertiary)' }}>Workforce: </span><strong>{totalLabour}</strong></div>
                <div><span style={{ color:'var(--text-tertiary)' }}>Issues: </span><strong>{issues.length}</strong></div>
              </div>
            </DialogBody>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary" size="sm">Cancel</Button>
              </DialogClose>
              <Button size="sm" iconLeft={<Send className="h-4 w-4" />} onClick={submitReport}>
                Submit report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AppShell>
    </div>
  )
}

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title:      'Pages/Daily Progress Report',
  component:   DPRContent,
  tags:       ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: "Site engineer daily data-entry form — activities, materials, labour, equipment, issues, and sign-off.",
      },
    },
  },
  decorators: [(Story: any) => <ToastProvider><Story /></ToastProvider>],
} satisfies Meta<any>

export default meta

export const Default: StoryObj<any> = {
  name:   '📋 Daily Progress Report — full form',
  render: () => <DPRContent />,
}
