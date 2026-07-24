import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { resolveBoqCodeAncestry } from '@/api/boq'
import type { BoqCodeCatalogEntry, BoqCodeLevel } from '@/types'

const LEVEL_LABEL: Record<BoqCodeLevel, string> = {
  chapter: 'Chapter',
  sub_chapter: 'Sub Chapter',
  section: 'Section',
  line_item: 'Line Item',
}

interface BoqCodePickerProps {
  catalog: BoqCodeCatalogEntry[]
  /** Currently selected line-item code, if any (controlled by the parent form). */
  value?: string
  /** Fires with a line-item code once one is selected, or undefined while the selection is incomplete. */
  onSelect: (code: string | undefined) => void
}

/**
 * Walks boq_code_catalog one level at a time starting from Chapter. After
 * each selection, the next step is derived from that code's actual children
 * (some branches skip Section, some skip Sub Chapter entirely — see
 * migration 012) rather than assuming a fixed number of steps.
 */
export function BoqCodePicker({ catalog, value, onSelect }: BoqCodePickerProps) {
  const byCode = useMemo(() => new Map(catalog.map((e) => [e.code, e])), [catalog])

  const childrenOf = useMemo(() => {
    const map = new Map<string | null, BoqCodeCatalogEntry[]>()
    for (const e of catalog) {
      const list = map.get(e.parent_code)
      if (list) list.push(e)
      else map.set(e.parent_code, [e])
    }
    return map
  }, [catalog])

  const [path, setPath] = useState<string[]>(
    () => (value ? resolveBoqCodeAncestry(value, catalog).map((e) => e.code) : [])
  )

  // Re-hydrate the path if the controlled value changes from outside (e.g.
  // opening "Edit" once the catalog has finished loading).
  useEffect(() => {
    if (value) setPath(resolveBoqCodeAncestry(value, catalog).map((e) => e.code))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const leaf = path.length ? byCode.get(path[path.length - 1]) : undefined
  const isLeafLineItem = leaf?.level === 'line_item'
  const nextOptions = isLeafLineItem ? [] : childrenOf.get(path.length ? path[path.length - 1] : null) ?? []
  const nextLevel = nextOptions[0]?.level

  function selectAt(depth: number, code: string | undefined) {
    const nextPath = path.slice(0, depth)
    if (code) nextPath.push(code)
    setPath(nextPath)
    const nextLeaf = nextPath.length ? byCode.get(nextPath[nextPath.length - 1]) : undefined
    onSelect(nextLeaf?.level === 'line_item' ? nextLeaf.code : undefined)
  }

  return (
    <div className="border border-gray-200 rounded-lg bg-gray-50 p-3 space-y-2.5">
      <div className="flex flex-wrap gap-1.5">
        {path.length === 0 && <span className="text-xs text-gray-500">No code selected yet</span>}
        {path.map((code, i) => {
          const entry = byCode.get(code)
          if (!entry) return null
          return (
            <span
              key={code}
              className="inline-flex items-center gap-1.5 text-xs bg-blue-100 text-blue-800 rounded-full pl-2.5 pr-1.5 py-1 max-w-full"
            >
              <span className="text-[10px] font-semibold uppercase tracking-wide text-blue-800/60">
                {LEVEL_LABEL[entry.level]}
              </span>
              <span className="font-mono text-blue-800/70">{entry.code}</span>
              <span className="font-medium truncate">{entry.description}</span>
              <button
                type="button"
                onClick={() => selectAt(i, undefined)}
                className="text-blue-800/60 hover:text-blue-800 flex-shrink-0"
                aria-label={`Clear from ${LEVEL_LABEL[entry.level]}`}
              >
                <X size={11} />
              </button>
            </span>
          )
        })}
      </div>

      {!isLeafLineItem && nextOptions.length > 0 && (
        <PickerStep
          // Force a fresh mount (fresh `open`/`query` state) for every step —
          // otherwise React reuses the same instance across levels and a
          // later step inherits the prior step's closed-after-pick state.
          key={path.length}
          label={LEVEL_LABEL[nextLevel!]}
          options={nextOptions}
          onPick={(code) => selectAt(path.length, code)}
        />
      )}

      {isLeafLineItem && leaf && (
        <p className="text-xs text-gray-500">
          Selected code: <span className="font-mono text-gray-700">{leaf.code}</span>
        </p>
      )}
    </div>
  )
}

function PickerStep({
  label,
  options,
  onPick,
}: {
  label: string
  options: BoqCodeCatalogEntry[]
  onPick: (code: string) => void
}) {
  const [query, setQuery] = useState('')
  // Open by default so the full option list is already visible the moment
  // this step appears — no click-then-wait, no typing required to browse.
  const [open, setOpen] = useState(true)

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => `${o.code} ${o.description}`.toLowerCase().includes(q))
  }, [query, options])

  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          className={inp}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={`Search ${label.toLowerCase()}…`}
          autoComplete="off"
        />
        {open && matches.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full max-h-64 overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg text-xs">
            {matches.map((m) => (
              <li key={m.code}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-blue-50"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { onPick(m.code); setQuery(''); setOpen(false) }}
                >
                  <span className="font-mono text-gray-500">{m.code}</span>
                  <span className="text-gray-800"> — {m.description}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

const inp = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white'
