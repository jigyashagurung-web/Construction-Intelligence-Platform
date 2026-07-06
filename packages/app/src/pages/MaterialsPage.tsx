import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, Plus, Loader2, Package, Search,
  AlertTriangle, X, ArrowDownToLine, ArrowUpFromLine,
} from 'lucide-react'
import {
  fetchProjectMaterials, fetchMaterials, fetchTransactions,
  createMaterial, upsertProjectMaterial, recordTransaction,
} from '@/api/materials'
import { fetchProject } from '@/api/projects'
import { useAuthStore } from '@/store/authStore'
import type { ProjectMaterial, MaterialTransaction, TransactionType } from '@/types'

const fmt = new Intl.NumberFormat('en-NP', { maximumFractionDigits: 2 })
const CATEGORIES = ['Aggregate', 'Steel', 'Cement', 'Timber', 'Electrical', 'Plumbing', 'Paint', 'Hardware', 'Other']
const UNITS = ['m', 'm²', 'm³', 'kg', 'tonne', 'bag', 'litre', 'no.', 'pcs', 'roll']
type ActiveTab = 'stock' | 'history'

export function MaterialsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const profile = useAuthStore((s) => s.profile)

  const [tab, setTab]               = useState<ActiveTab>('stock')
  const [search, setSearch]         = useState('')
  const [catFilter, setCatFilter]   = useState('All')
  const [showAddMaterial, setShowAddMaterial] = useState(false)
  const [showTransaction, setShowTransaction] = useState<TransactionType | null>(null)
  const [selectedPM, setSelectedPM] = useState<ProjectMaterial | null>(null)

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => fetchProject(projectId!),
    enabled: !!projectId,
  })

  const { data: projectMaterials = [], isLoading: loadingStock } = useQuery({
    queryKey: ['project_materials', projectId],
    queryFn: () => fetchProjectMaterials(projectId!),
    enabled: !!projectId,
  })

  const { data: catalogue = [], isLoading: loadingCat } = useQuery({
    queryKey: ['materials_catalogue', profile?.org_id],
    queryFn: () => fetchMaterials(profile!.org_id!),
    enabled: !!profile?.org_id,
  })

  const { data: transactions = [], isLoading: loadingTxn } = useQuery({
    queryKey: ['transactions', projectId],
    queryFn: () => fetchTransactions(projectId!),
    enabled: !!projectId && tab === 'history',
  })

  const createMatMut = useMutation({
    mutationFn: createMaterial,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['materials_catalogue'] }); setShowAddMaterial(false) },
  })

  const addToProjectMut = useMutation({
    mutationFn: upsertProjectMaterial,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project_materials', projectId] }),
  })

  const txnMut = useMutation({
    mutationFn: recordTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project_materials', projectId] })
      qc.invalidateQueries({ queryKey: ['transactions', projectId] })
      setShowTransaction(null)
      setSelectedPM(null)
    },
  })

  const categories = ['All', ...Array.from(new Set(projectMaterials.map((pm) => pm.material?.category ?? 'Other')))]
  const filtered = projectMaterials.filter((pm) => {
    const q = search.toLowerCase()
    const n = pm.material?.name.toLowerCase() ?? ''
    return (!q || n.includes(q)) && (catFilter === 'All' || pm.material?.category === catFilter)
  })

  const lowStockCount = projectMaterials.filter(
    (pm) => pm.on_hand > 0 && pm.on_hand <= pm.reorder_point
  ).length
  const outOfStockCount = projectMaterials.filter((pm) => pm.on_hand === 0).length

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <button
          onClick={() => navigate(`/projects/${projectId}`)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-2 transition-colors"
        >
          <ArrowLeft size={14} />
          {project?.name ?? 'Project'}
        </button>

        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Package size={18} className="text-green-600" />
              Materials
            </h1>
            <div className="flex items-center gap-4 mt-0.5 text-xs text-gray-500">
              <span>{projectMaterials.length} items tracked</span>
              {lowStockCount > 0 && (
                <span className="flex items-center gap-1 text-yellow-600">
                  <AlertTriangle size={11} />
                  {lowStockCount} low stock
                </span>
              )}
              {outOfStockCount > 0 && (
                <span className="flex items-center gap-1 text-red-500">
                  <AlertTriangle size={11} />
                  {outOfStockCount} out of stock
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowAddMaterial(true)}
              className="flex items-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus size={14} />
              Add Material
            </button>
          </div>
        </div>

        {/* Tabs + Filters */}
        <div className="flex items-center gap-4">
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            {(['stock', 'history'] as ActiveTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  tab === t ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {t === 'stock' ? 'Current Stock' : 'Transaction History'}
              </button>
            ))}
          </div>

          {tab === 'stock' && (
            <>
              <div className="relative flex-1 max-w-xs">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search materials…"
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={catFilter}
                onChange={(e) => setCatFilter(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto">
        {tab === 'stock' && (
          <>
            {loadingStock ? (
              <div className="flex justify-center py-16"><Loader2 size={22} className="animate-spin text-gray-400" /></div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <Package size={36} className="text-gray-200 mb-3" />
                <p className="text-sm text-gray-500">
                  {projectMaterials.length === 0
                    ? 'No materials tracked yet. Add materials from the catalogue.'
                    : 'No materials match your filter.'}
                </p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr className="text-xs text-gray-500 font-medium">
                    <th className="px-4 py-2.5 text-left">Material</th>
                    <th className="px-4 py-2.5 text-left w-24">Category</th>
                    <th className="px-4 py-2.5 text-right w-24">On Hand</th>
                    <th className="px-4 py-2.5 text-right w-24">Reorder At</th>
                    <th className="px-4 py-2.5 text-right w-28">Unit Cost (NPR)</th>
                    <th className="px-4 py-2.5 text-center w-20">Status</th>
                    <th className="px-4 py-2.5 w-28" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((pm) => {
                    const isLow = pm.on_hand > 0 && pm.on_hand <= pm.reorder_point
                    const isOut = pm.on_hand === 0
                    return (
                      <tr key={pm.id} className="hover:bg-gray-50 group">
                        <td className="px-4 py-2.5">
                          <div className="font-medium text-gray-800">{pm.material?.name}</div>
                          <div className="text-xs text-gray-500">{pm.material?.unit}</div>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-500">
                          {pm.material?.category ?? '—'}
                        </td>
                        <td className={`px-4 py-2.5 text-right tabular-nums font-medium ${isOut ? 'text-red-500' : isLow ? 'text-yellow-600' : 'text-gray-800'}`}>
                          {fmt.format(pm.on_hand)} {pm.material?.unit}
                        </td>
                        <td className="px-4 py-2.5 text-right text-xs text-gray-500 tabular-nums">
                          {fmt.format(pm.reorder_point)}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-gray-700">
                          {pm.unit_cost ? fmt.format(pm.unit_cost) : '—'}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          {isOut ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">Out</span>
                          ) : isLow ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">Low</span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">OK</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => { setSelectedPM(pm); setShowTransaction('grn') }}
                              title="Record GRN"
                              className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                            >
                              <ArrowDownToLine size={11} />
                              GRN
                            </button>
                            <button
                              onClick={() => { setSelectedPM(pm); setShowTransaction('issue') }}
                              title="Issue Material"
                              className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors"
                            >
                              <ArrowUpFromLine size={11} />
                              Issue
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </>
        )}

        {tab === 'history' && (
          <>
            {loadingTxn ? (
              <div className="flex justify-center py-16"><Loader2 size={22} className="animate-spin text-gray-400" /></div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <Package size={36} className="text-gray-200 mb-3" />
                <p className="text-sm text-gray-500">No transactions recorded yet.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr className="text-xs text-gray-500 font-medium">
                    <th className="px-4 py-2.5 text-left">Date</th>
                    <th className="px-4 py-2.5 text-left">Material</th>
                    <th className="px-4 py-2.5 text-center w-24">Type</th>
                    <th className="px-4 py-2.5 text-right w-28">Quantity</th>
                    <th className="px-4 py-2.5 text-right w-28">Unit Cost</th>
                    <th className="px-4 py-2.5 text-left">Reference</th>
                    <th className="px-4 py-2.5 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map((txn) => (
                    <TransactionRow key={txn.id} txn={txn} />
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>

      {/* Add Material dialog */}
      {showAddMaterial && (
        <AddMaterialDialog
          orgId={profile?.org_id ?? ''}
          catalogue={catalogue}
          existingIds={new Set(projectMaterials.map((pm) => pm.material_id))}
          onClose={() => setShowAddMaterial(false)}
          onCreateNew={(input) => createMatMut.mutate(input)}
          onAddExisting={(materialId) =>
            addToProjectMut.mutate({ project_id: projectId!, material_id: materialId })
          }
          loading={createMatMut.isPending || addToProjectMut.isPending}
          loadingCat={loadingCat}
        />
      )}

      {/* Transaction dialog */}
      {showTransaction && selectedPM && (
        <TransactionDialog
          type={showTransaction}
          pm={selectedPM}
          onClose={() => { setShowTransaction(null); setSelectedPM(null) }}
          onSubmit={(qty, unitCost, reference, notes) =>
            txnMut.mutate({
              project_id: projectId!,
              material_id: selectedPM.material_id,
              txn_type: showTransaction,
              quantity: qty,
              unit_cost: unitCost || undefined,
              reference: reference || undefined,
              notes: notes || undefined,
            })
          }
          loading={txnMut.isPending}
          error={txnMut.error?.message ?? null}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Transaction row

const TXN_COLOR: Record<TransactionType, string> = {
  grn:        'bg-green-100 text-green-700',
  issue:      'bg-orange-100 text-orange-700',
  return:     'bg-blue-100 text-blue-700',
  adjustment: 'bg-gray-100 text-gray-600',
}

function TransactionRow({ txn }: { txn: MaterialTransaction }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-2.5 text-xs text-gray-500">
        {new Date(txn.created_at).toLocaleDateString('en-NP')}
      </td>
      <td className="px-4 py-2.5 text-gray-800">{txn.material?.name}</td>
      <td className="px-4 py-2.5 text-center">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium uppercase ${TXN_COLOR[txn.txn_type]}`}>
          {txn.txn_type}
        </span>
      </td>
      <td className="px-4 py-2.5 text-right tabular-nums font-medium">
        {['grn', 'return'].includes(txn.txn_type) ? '+' : '-'}
        {new Intl.NumberFormat('en-NP', { maximumFractionDigits: 2 }).format(txn.quantity)}{' '}
        <span className="text-gray-400 text-xs">{txn.material?.unit}</span>
      </td>
      <td className="px-4 py-2.5 text-right text-gray-600 tabular-nums text-xs">
        {txn.unit_cost ? `NPR ${new Intl.NumberFormat('en-NP').format(txn.unit_cost)}` : '—'}
      </td>
      <td className="px-4 py-2.5 text-xs text-gray-500">{txn.reference ?? '—'}</td>
      <td className="px-4 py-2.5 text-xs text-gray-500">{txn.notes ?? '—'}</td>
    </tr>
  )
}

// ---------------------------------------------------------------------------
// Add Material dialog

function AddMaterialDialog({
  orgId, catalogue, existingIds, onClose,
  onCreateNew, onAddExisting, loading, loadingCat,
}: {
  orgId: string
  catalogue: ReturnType<typeof fetchMaterials> extends Promise<infer T> ? T : never
  existingIds: Set<string>
  onClose: () => void
  onCreateNew: (input: { org_id: string; name: string; unit: string; category?: string }) => void
  onAddExisting: (id: string) => void
  loading: boolean
  loadingCat: boolean
}) {
  const [mode, setMode] = useState<'existing' | 'new'>('existing')
  const [name, setName] = useState('')
  const [unit, setUnit] = useState('kg')
  const [cat, setCat]   = useState('')

  const available = catalogue.filter((m) => !existingIds.has(m.id))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Add Material to Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <div className="px-6 pt-4">
          <div className="flex border border-gray-200 rounded-lg overflow-hidden mb-4">
            {(['existing', 'new'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                  mode === m ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {m === 'existing' ? 'From Catalogue' : 'Create New'}
              </button>
            ))}
          </div>
        </div>

        {mode === 'existing' ? (
          <div className="px-6 pb-6">
            {loadingCat ? (
              <div className="flex justify-center py-8"><Loader2 size={18} className="animate-spin text-gray-400" /></div>
            ) : available.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">
                All catalogue materials are already in this project.
              </p>
            ) : (
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {available.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { onAddExisting(m.id); onClose() }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-blue-50 text-left transition-colors group"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800 group-hover:text-blue-700">{m.name}</p>
                      <p className="text-xs text-gray-500">{m.category ?? 'Other'} · {m.unit}</p>
                    </div>
                    <Plus size={14} className="text-gray-400 group-hover:text-blue-600" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); onCreateNew({ org_id: orgId, name, unit, category: cat || undefined }) }}
            className="px-6 pb-6 space-y-3"
          >
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Material name *</label>
              <input
                className={inp2}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ordinary Portland Cement"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Unit *</label>
                <select className={inp2} value={unit} onChange={(e) => setUnit(e.target.value)}>
                  {UNITS.map((u) => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                <select className={inp2} value={cat} onChange={(e) => setCat(e.target.value)}>
                  <option value="">—</option>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-sm text-white font-medium flex items-center justify-center gap-2 transition-colors"
              >
                {loading && <Loader2 size={13} className="animate-spin" />}
                Create & Add
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Transaction dialog

function TransactionDialog({
  type, pm, onClose, onSubmit, loading, error,
}: {
  type: TransactionType
  pm: ProjectMaterial
  onClose: () => void
  onSubmit: (qty: number, unitCost: number | undefined, reference: string, notes: string) => void
  loading: boolean
  error: string | null
}) {
  const [qty, setQty]         = useState('')
  const [unitCost, setUnitCost] = useState('')
  const [reference, setRef]   = useState('')
  const [notes, setNotes]     = useState('')

  const isGRN = type === 'grn'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            {isGRN ? 'Record GRN' : 'Issue Material'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit(Number(qty), unitCost ? Number(unitCost) : undefined, reference, notes)
          }}
          className="px-6 py-5 space-y-4"
        >
          <div className="bg-gray-50 rounded-lg px-4 py-2.5">
            <p className="text-xs text-gray-500">Material</p>
            <p className="font-medium text-gray-800 text-sm">{pm.material?.name}</p>
            <p className="text-xs text-gray-500">On hand: {fmt.format(pm.on_hand)} {pm.material?.unit}</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Quantity ({pm.material?.unit}) *
            </label>
            <input
              type="number"
              className={inp2}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="0"
              min="0.001"
              step="any"
              required
            />
          </div>

          {isGRN && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Unit Cost (NPR)</label>
              <input
                type="number"
                className={inp2}
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                placeholder="0.00"
                min="0"
                step="any"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {isGRN ? 'GRN / Delivery Note #' : 'Work Order / Reference'}
            </label>
            <input
              className={inp2}
              value={reference}
              onChange={(e) => setRef(e.target.value)}
              placeholder={isGRN ? 'GRN-2082-001' : 'WO-042'}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <input
              className={inp2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-2 rounded-lg ${isGRN ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-500 hover:bg-orange-600'} disabled:opacity-60 text-sm text-white font-medium flex items-center justify-center gap-2 transition-colors`}
            >
              {loading && <Loader2 size={13} className="animate-spin" />}
              {isGRN ? 'Record GRN' : 'Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const inp2 = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white'
