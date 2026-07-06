import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, Plus, Loader2, Search, Pencil, Trash2,
  X, ClipboardList, ChevronDown,
} from 'lucide-react'
import { fetchBOQItems, createBOQItem, updateBOQItem, deleteBOQItem } from '@/api/boq'
import { fetchProject } from '@/api/projects'
import type { BOQItem, BOQStatus } from '@/types'

const STATUS_OPTS: BOQStatus[] = ['active', 'omitted', 'variation', 'provisional']
const STATUS_COLOR: Record<BOQStatus, string> = {
  active:      'bg-green-100 text-green-700',
  omitted:     'bg-gray-100 text-gray-500',
  variation:   'bg-purple-100 text-purple-700',
  provisional: 'bg-yellow-100 text-yellow-700',
}

const TRADES = [
  'Civil Works', 'Structural Steel', 'MEP', 'Finishing',
  'Earthworks', 'Roads & Pavements', 'Plumbing', 'Electrical',
]

const UNITS = ['m', 'm²', 'm³', 'kg', 'tonne', 'no.', 'LS', 'hr', 'pcs']

const fmt = new Intl.NumberFormat('en-NP', { maximumFractionDigits: 2 })
const fmtAmt = new Intl.NumberFormat('en-NP', { maximumFractionDigits: 0 })

type DialogMode = 'add' | 'edit' | null

export function BOQPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [search, setSearch]     = useState('')
  const [tradeFilter, setTrade] = useState<string>('All')
  const [dialog, setDialog]     = useState<DialogMode>(null)
  const [editing, setEditing]   = useState<BOQItem | null>(null)

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => fetchProject(projectId!),
    enabled: !!projectId,
  })

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['boq', projectId],
    queryFn: () => fetchBOQItems(projectId!),
    enabled: !!projectId,
  })

  const createMut = useMutation({
    mutationFn: createBOQItem,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['boq', projectId] }); setDialog(null) },
  })

  const updateMut = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Parameters<typeof updateBOQItem>[1] }) =>
      updateBOQItem(id, patch),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['boq', projectId] }); setDialog(null) },
  })

  const deleteMut = useMutation({
    mutationFn: deleteBOQItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['boq', projectId] }),
  })

  const trades = ['All', ...Array.from(new Set(items.map((i) => i.trade).filter(Boolean)))]
  const filtered = items.filter((i) => {
    const q = search.toLowerCase()
    const matchSearch = !q || i.description.toLowerCase().includes(q) || (i.wbs_code ?? '').toLowerCase().includes(q)
    const matchTrade  = tradeFilter === 'All' || i.trade === tradeFilter
    return matchSearch && matchTrade
  })

  const totalActive = items
    .filter((i) => i.status === 'active')
    .reduce((s, i) => s + (i.amount ?? 0), 0)

  const totalFiltered = filtered.reduce((s, i) => s + (i.amount ?? 0), 0)

  function openEdit(item: BOQItem) {
    setEditing(item)
    setDialog('edit')
  }

  function handleDelete(id: string) {
    if (confirm('Delete this BOQ item?')) deleteMut.mutate(id)
  }

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

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ClipboardList size={18} className="text-blue-600" />
              Bill of Quantities
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {items.length} item{items.length !== 1 ? 's' : ''} &mdash; total contract value{' '}
              <span className="font-medium text-gray-700">NPR {fmtAmt.format(totalActive)}</span>
            </p>
          </div>
          <button
            onClick={() => { setEditing(null); setDialog('add') }}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-colors"
          >
            <Plus size={15} />
            Add Item
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mt-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search description or WBS…"
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <select
              value={tradeFilter}
              onChange={(e) => setTrade(e.target.value)}
              className="appearance-none pl-3 pr-7 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {trades.map((t) => <option key={t}>{t}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={22} className="animate-spin text-gray-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <ClipboardList size={36} className="text-gray-200 mb-3" />
            <p className="text-sm text-gray-500">
              {items.length === 0 ? 'No BOQ items yet.' : 'No items match your filters.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr className="text-xs text-gray-500 font-medium">
                <th className="px-4 py-2.5 text-left w-24">WBS</th>
                <th className="px-4 py-2.5 text-left">Description</th>
                <th className="px-4 py-2.5 text-left w-28">Trade</th>
                <th className="px-4 py-2.5 text-right w-20">Qty</th>
                <th className="px-4 py-2.5 text-right w-16">Unit</th>
                <th className="px-4 py-2.5 text-right w-28">Rate (NPR)</th>
                <th className="px-4 py-2.5 text-right w-32">Amount (NPR)</th>
                <th className="px-4 py-2.5 text-center w-24">Status</th>
                <th className="px-4 py-2.5 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 group">
                  <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{item.wbs_code ?? '—'}</td>
                  <td className="px-4 py-2.5 text-gray-800">{item.description}</td>
                  <td className="px-4 py-2.5 text-gray-500 text-xs">{item.trade ?? '—'}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{fmt.format(item.quantity)}</td>
                  <td className="px-4 py-2.5 text-right text-gray-500 text-xs">{item.unit ?? '—'}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{fmt.format(item.unit_rate)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium">{fmtAmt.format(item.amount ?? 0)}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[item.status]}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(item)}
                        className="p-1 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 sticky bottom-0 border-t-2 border-gray-200">
              <tr>
                <td colSpan={6} className="px-4 py-2.5 text-xs font-medium text-gray-600">
                  {filtered.length < items.length
                    ? `Filtered total (${filtered.length} items)`
                    : 'Total'}
                </td>
                <td className="px-4 py-2.5 text-right font-semibold text-gray-900 tabular-nums">
                  {fmtAmt.format(totalFiltered)}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {/* Add / Edit Dialog */}
      {dialog && (
        <BOQDialog
          mode={dialog}
          initial={editing}
          projectId={projectId!}
          onClose={() => { setDialog(null); setEditing(null) }}
          onSubmit={(data) => {
            if (dialog === 'edit' && editing) {
              updateMut.mutate({ id: editing.id, patch: data })
            } else {
              createMut.mutate({ project_id: projectId!, ...data })
            }
          }}
          loading={createMut.isPending || updateMut.isPending}
          error={createMut.error?.message ?? updateMut.error?.message ?? null}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------

interface BOQDialogProps {
  mode: 'add' | 'edit'
  initial: BOQItem | null
  projectId: string
  onClose: () => void
  onSubmit: (data: {
    wbs_code?: string
    description: string
    unit?: string
    quantity: number
    unit_rate: number
    trade?: string
    status?: BOQStatus
  }) => void
  loading: boolean
  error: string | null
}

function BOQDialog({ mode, initial, onClose, onSubmit, loading, error }: BOQDialogProps) {
  const [wbs, setWbs]         = useState(initial?.wbs_code ?? '')
  const [desc, setDesc]       = useState(initial?.description ?? '')
  const [unit, setUnit]       = useState(initial?.unit ?? '')
  const [qty, setQty]         = useState(String(initial?.quantity ?? ''))
  const [rate, setRate]       = useState(String(initial?.unit_rate ?? ''))
  const [trade, setTrade]     = useState(initial?.trade ?? '')
  const [status, setStatus]   = useState<BOQStatus>(initial?.status ?? 'active')

  const amount = (Number(qty) || 0) * (Number(rate) || 0)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      wbs_code: wbs || undefined,
      description: desc,
      unit: unit || undefined,
      quantity: Number(qty),
      unit_rate: Number(rate),
      trade: trade || undefined,
      status,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{mode === 'add' ? 'Add BOQ Item' : 'Edit BOQ Item'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Field label="WBS Code">
              <input className={inp} value={wbs} onChange={(e) => setWbs(e.target.value)} placeholder="1.1.2" />
            </Field>
            <Field label="Trade">
              <select className={inp} value={trade} onChange={(e) => setTrade(e.target.value)}>
                <option value="">— None —</option>
                {TRADES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select className={inp} value={status} onChange={(e) => setStatus(e.target.value as BOQStatus)}>
                {STATUS_OPTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Description *">
            <input
              className={inp}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Excavation in hard rock"
              required
            />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Quantity *">
              <input
                type="number"
                className={inp}
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="0"
                min="0"
                step="any"
                required
              />
            </Field>
            <Field label="Unit">
              <select className={inp} value={unit} onChange={(e) => setUnit(e.target.value)}>
                <option value="">—</option>
                {UNITS.map((u) => <option key={u}>{u}</option>)}
              </select>
            </Field>
            <Field label="Unit Rate (NPR) *">
              <input
                type="number"
                className={inp}
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="0.00"
                min="0"
                step="any"
                required
              />
            </Field>
          </div>

          {/* Live amount preview */}
          <div className="bg-blue-50 rounded-lg px-4 py-2.5 flex items-center justify-between">
            <span className="text-xs text-blue-700 font-medium">Amount</span>
            <span className="text-sm font-semibold text-blue-800 tabular-nums">
              NPR {new Intl.NumberFormat('en-NP', { maximumFractionDigits: 0 }).format(amount)}
            </span>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-sm text-white font-medium flex items-center justify-center gap-2 transition-colors"
            >
              {loading && <Loader2 size={13} className="animate-spin" />}
              {mode === 'add' ? 'Add Item' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const inp = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  )
}
