import { useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, Plus, Loader2, Search, Pencil, Trash2,
  X, ClipboardList, Upload, Download, AlertTriangle, CheckCircle2,
} from 'lucide-react'
import {
  fetchBOQItems, createBOQItem, updateBOQItem, deleteBOQItem, createBOQItems,
  fetchBoqCodeCatalog,
} from '@/api/boq'
import { fetchProject } from '@/api/projects'
import {
  parseBoqImportFile, validateBoqImportRow, generateBoqImportTemplate,
} from '@/lib/boqImport'
import type { BoqImportRawRow, BoqImportValidatedRow, BoqImportRowStatus } from '@/lib/boqImport'
import type { BOQItem, BOQStatus, BoqCodeCatalogEntry } from '@/types'
import { BoqCodePicker } from '@/components/BoqCodePicker'

const STATUS_COLOR: Record<BOQStatus, string> = {
  active:      'bg-green-100 text-green-700',
  omitted:     'bg-gray-100 text-gray-500',
  variation:   'bg-purple-100 text-purple-700',
  provisional: 'bg-yellow-100 text-yellow-700',
}

const fmt = new Intl.NumberFormat('en-NP', { maximumFractionDigits: 2 })
const fmtAmt = new Intl.NumberFormat('en-NP', { maximumFractionDigits: 0 })

type DialogMode = 'add' | 'edit' | null

export function BOQPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [search, setSearch]     = useState('')
  const [dialog, setDialog]     = useState<DialogMode>(null)
  const [editing, setEditing]   = useState<BOQItem | null>(null)
  const [bulkImportOpen, setBulkImportOpen] = useState(false)

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

  const { data: codeCatalog = [] } = useQuery({
    queryKey: ['boq-code-catalog'],
    queryFn: fetchBoqCodeCatalog,
    staleTime: Infinity,
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

  const filtered = items.filter((i) => {
    const q = search.toLowerCase()
    return !q || i.description.toLowerCase().includes(q) || (i.wbs_code ?? '').toLowerCase().includes(q)
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBulkImportOpen(true)}
              className="flex items-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors"
            >
              <Upload size={15} />
              Bulk Import
            </button>
            <button
              onClick={() => { setEditing(null); setDialog('add') }}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-colors"
            >
              <Plus size={15} />
              Add Item
            </button>
          </div>
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
                <td colSpan={5} className="px-4 py-2.5 text-xs font-medium text-gray-600">
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
          codeCatalog={codeCatalog}
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

      {/* Bulk Import Dialog */}
      {bulkImportOpen && (
        <BOQBulkImportDialog
          projectId={projectId!}
          codeCatalog={codeCatalog}
          onClose={() => setBulkImportOpen(false)}
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
  codeCatalog: BoqCodeCatalogEntry[]
  onClose: () => void
  onSubmit: (data: {
    wbs_code?: string
    description: string
    unit?: string
    quantity: number
    unit_rate: number
  }) => void
  loading: boolean
  error: string | null
}

function BOQDialog({ mode, initial, onClose, onSubmit, loading, error, codeCatalog }: BOQDialogProps) {
  const [wbsCode, setWbsCode] = useState<string | undefined>(initial?.wbs_code ?? undefined)
  const [qty, setQty]         = useState(String(initial?.quantity ?? ''))
  const [rate, setRate]       = useState(String(initial?.unit_rate ?? ''))

  // The picker only ever reports a code once it resolves to a line item, so
  // this lookup also doubles as the "is a valid selection made?" check.
  const selectedEntry = useMemo(
    () => (wbsCode ? codeCatalog.find((e) => e.code === wbsCode && e.level === 'line_item') : undefined),
    [wbsCode, codeCatalog]
  )

  const amount = (Number(qty) || 0) * (Number(rate) || 0)
  const canSubmit = !!selectedEntry && Number(qty) > 0 && Number(rate) > 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedEntry) return
    onSubmit({
      wbs_code: selectedEntry.code,
      description: selectedEntry.description,
      unit: selectedEntry.unit ?? undefined,
      quantity: Number(qty),
      unit_rate: Number(rate),
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
          <Field label="BOQ Code *">
            <BoqCodePicker catalog={codeCatalog} value={wbsCode} onSelect={setWbsCode} />
          </Field>

          <Field label="Description">
            <input
              className={`${inp} bg-gray-50 text-gray-600`}
              value={selectedEntry?.description ?? ''}
              readOnly
              placeholder="Select a line item above"
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
              <input
                className={`${inp} bg-gray-50 text-gray-600`}
                value={selectedEntry?.unit ?? ''}
                readOnly
                placeholder="—"
              />
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
              disabled={loading || !canSubmit}
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

// ---------------------------------------------------------------------------
// Bulk Import
// ---------------------------------------------------------------------------

type ImportStep = 'upload' | 'preview' | 'summary'

interface EditableImportRow extends BoqImportValidatedRow {
  excluded: boolean
}

interface ImportSummary {
  created: number
  skipped: { label: string; reason: string }[]
}

const IMPORT_STATUS_LABEL: Record<BoqImportRowStatus, string> = {
  matched: 'Matched',
  invalid: 'Invalid',
}

const IMPORT_STATUS_COLOR: Record<BoqImportRowStatus, string> = {
  matched: 'bg-green-100 text-green-700',
  invalid: 'bg-red-100 text-red-700',
}

interface BOQBulkImportDialogProps {
  projectId: string
  codeCatalog: BoqCodeCatalogEntry[]
  onClose: () => void
}

function BOQBulkImportDialog({ projectId, codeCatalog, onClose }: BOQBulkImportDialogProps) {
  const qc = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep]             = useState<ImportStep>('upload')
  const [parseError, setParseError] = useState<string | null>(null)
  const [rows, setRows]             = useState<EditableImportRow[]>([])
  const [summary, setSummary]       = useState<ImportSummary | null>(null)

  const commitMut = useMutation({
    mutationFn: (items: Parameters<typeof createBOQItems>[1]) => createBOQItems(projectId, items),
  })

  const counts = useMemo(() => {
    const matched    = rows.filter((r) => r.status === 'matched').length
    const invalid    = rows.filter((r) => r.status === 'invalid').length
    const importable = rows.filter((r) => !r.excluded && r.item).length
    return { matched, invalid, importable }
  }, [rows])

  function downloadTemplate() {
    const blob = generateBoqImportTemplate()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'boq-import-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setParseError(null)
    try {
      const rawRows = await parseBoqImportFile(file)
      if (rawRows.length === 0) {
        setParseError('No data rows found in the uploaded file.')
        return
      }
      setRows(rawRows.map((raw) => ({ ...validateBoqImportRow(raw, codeCatalog), excluded: false })))
      setStep('preview')
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Could not parse the uploaded file.')
    }
  }

  function updateRow(index: number, patch: Partial<BoqImportRawRow>) {
    setRows((prev) => prev.map((r, i) => {
      if (i !== index) return r
      const raw = { ...r.raw, ...patch }
      return { ...validateBoqImportRow(raw, codeCatalog), excluded: r.excluded }
    }))
  }

  function toggleExcluded(index: number) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, excluded: !r.excluded } : r)))
  }

  function handleCommit() {
    const importable = rows.filter((r) => !r.excluded && r.item)
    const skipped = rows
      .filter((r) => r.excluded || !r.item)
      .map((r) => ({
        label: r.raw.wbsCode || r.raw.description || 'Row',
        reason: r.excluded ? 'Excluded by user' : r.reasons.join('; '),
      }))
    commitMut.mutate(importable.map((r) => r.item!), {
      onSuccess: (created) => {
        qc.invalidateQueries({ queryKey: ['boq', projectId] })
        setSummary({ created: created.length, skipped })
        setStep('summary')
      },
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="font-semibold text-gray-900">Bulk Import BOQ Items</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 overflow-auto flex-1">
          {step === 'upload' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Upload a CSV or XLSX file of BOQ line items to add to this project.
              </p>
              <button
                type="button"
                onClick={downloadTemplate}
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Download size={14} />
                Download the CSV template
              </button>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl py-10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-300 hover:bg-blue-50/40 transition-colors"
              >
                <Upload size={24} className="text-gray-400" />
                <p className="text-sm text-gray-600">Click to select a CSV or XLSX file</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  className="hidden"
                  onChange={handleFile}
                />
              </div>

              {parseError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">{parseError}</p>
              )}
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs">
                <span className="text-green-700 font-medium">{counts.matched} matched</span>
                <span className="text-red-700 font-medium">{counts.invalid} invalid</span>
                <span className="text-gray-500">
                  &mdash; {counts.importable} row{counts.importable !== 1 ? 's' : ''} will be imported
                </span>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-auto max-h-96">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr className="text-gray-500 font-medium">
                      <th className="px-2 py-2 text-left w-8" />
                      <th className="px-2 py-2 text-left w-24">WBS Code</th>
                      <th className="px-2 py-2 text-left">Description</th>
                      <th className="px-2 py-2 text-right w-20">Qty</th>
                      <th className="px-2 py-2 text-left w-16">Unit</th>
                      <th className="px-2 py-2 text-right w-20">Rate</th>
                      <th className="px-2 py-2 text-left w-24">Status</th>
                      <th className="px-2 py-2 text-left w-40">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rows.map((row, i) => (
                      <tr key={i} className={row.excluded ? 'opacity-40' : ''}>
                        <td className="px-2 py-1.5">
                          <input
                            type="checkbox"
                            checked={!row.excluded}
                            onChange={() => toggleExcluded(i)}
                            title="Include this row"
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            className={cellInp}
                            value={row.raw.wbsCode}
                            onChange={(e) => updateRow(i, { wbsCode: e.target.value })}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            className={cellInp}
                            value={row.raw.description}
                            onChange={(e) => updateRow(i, { description: e.target.value })}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            className={`${cellInp} text-right`}
                            value={row.raw.quantity}
                            onChange={(e) => updateRow(i, { quantity: e.target.value })}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            className={cellInp}
                            value={row.raw.unit}
                            onChange={(e) => updateRow(i, { unit: e.target.value })}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            className={`${cellInp} text-right`}
                            value={row.raw.unitRate}
                            onChange={(e) => updateRow(i, { unitRate: e.target.value })}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <span className={`px-1.5 py-0.5 rounded-full font-medium ${IMPORT_STATUS_COLOR[row.status]}`}>
                            {IMPORT_STATUS_LABEL[row.status]}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 text-gray-500">{row.reasons.join('; ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {commitMut.error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
                  {commitMut.error.message}
                </p>
              )}
            </div>
          )}

          {step === 'summary' && summary && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 size={18} />
                <p className="text-sm font-medium">
                  {summary.created} row{summary.created !== 1 ? 's' : ''} created
                </p>
              </div>
              {summary.skipped.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-yellow-700">
                    <AlertTriangle size={16} />
                    <p className="text-sm font-medium">
                      {summary.skipped.length} row{summary.skipped.length !== 1 ? 's' : ''} skipped
                    </p>
                  </div>
                  <ul className="text-xs text-gray-600 space-y-1 max-h-48 overflow-auto border border-gray-100 rounded-lg p-3 bg-gray-50">
                    {summary.skipped.map((s, i) => (
                      <li key={i}>
                        <span className="font-medium text-gray-800">{s.label}</span>: {s.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 px-6 py-4 border-t border-gray-100 flex-shrink-0">
          {step === 'preview' && (
            <button
              type="button"
              onClick={() => { setStep('upload'); setRows([]) }}
              className="py-2 px-4 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          )}
          <div className="flex-1" />
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {step === 'summary' ? 'Close' : 'Cancel'}
          </button>
          {step === 'preview' && (
            <button
              type="button"
              onClick={handleCommit}
              disabled={commitMut.isPending || counts.importable === 0}
              className="py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-sm text-white font-medium flex items-center justify-center gap-2 transition-colors"
            >
              {commitMut.isPending && <Loader2 size={13} className="animate-spin" />}
              Import {counts.importable} Row{counts.importable !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const cellInp = 'w-full px-1.5 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white'
