import * as XLSX from 'xlsx'
import type { BOQStatus, BoqCodeCatalogEntry } from '@/types'
import type { CreateBOQItemsInput } from '@/api/boq'

export interface BoqImportRawRow {
  wbsCode: string
  description: string
  quantity: string
  unit: string
  unitRate: string
  status: string
}

const TEMPLATE_COLUMNS: { header: string; key: keyof BoqImportRawRow }[] = [
  { header: 'WBS Code', key: 'wbsCode' },
  { header: 'Description', key: 'description' },
  { header: 'Quantity', key: 'quantity' },
  { header: 'Unit', key: 'unit' },
  { header: 'Unit Rate', key: 'unitRate' },
  { header: 'Status', key: 'status' },
]

export const BOQ_IMPORT_TEMPLATE_HEADERS = TEMPLATE_COLUMNS.map((c) => c.header)

const KEY_BY_NORMALIZED_HEADER = new Map(
  TEMPLATE_COLUMNS.map((c) => [c.header.toLowerCase(), c.key])
)

const STATUS_VALUES: BOQStatus[] = ['active', 'omitted', 'variation', 'provisional']

function emptyRawRow(): BoqImportRawRow {
  return { wbsCode: '', description: '', quantity: '', unit: '', unitRate: '', status: '' }
}

/**
 * XLSX.read auto-detects CSV vs. XLSX from the buffer contents, so both file
 * types are parsed through the same code path.
 */
export async function parseBoqImportFile(file: File): Promise<BoqImportRawRow[]> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) return []

  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, blankrows: false, defval: '' })
  if (rows.length === 0) return []

  const [headerRow, ...dataRows] = rows
  const keyByColumn = headerRow.map((cell) => KEY_BY_NORMALIZED_HEADER.get(String(cell ?? '').trim().toLowerCase()))

  return dataRows
    .filter((row) => row.some((cell) => String(cell ?? '').trim() !== ''))
    .map((row) => {
      const raw = emptyRawRow()
      keyByColumn.forEach((key, i) => {
        if (key) raw[key] = String(row[i] ?? '').trim()
      })
      return raw
    })
}

export function generateBoqImportTemplate(): Blob {
  const csv = BOQ_IMPORT_TEMPLATE_HEADERS.join(',') + '\n'
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' })
}

export type BoqImportRowStatus = 'matched' | 'invalid'

export interface BoqImportValidatedRow {
  raw: BoqImportRawRow
  status: BoqImportRowStatus
  reasons: string[]
  item: CreateBOQItemsInput | null
}

export function validateBoqImportRow(
  raw: BoqImportRawRow,
  catalog: BoqCodeCatalogEntry[]
): BoqImportValidatedRow {
  const reasons: string[] = []

  if (!raw.description.trim()) reasons.push('Description is required')

  const hasQuantity = raw.quantity.trim() !== ''
  const quantity = Number(raw.quantity)
  if (!hasQuantity) reasons.push('Quantity is required')
  else if (!Number.isFinite(quantity) || quantity < 0) reasons.push('Quantity must be a non-negative number')

  const hasUnitRate = raw.unitRate.trim() !== ''
  const unitRate = Number(raw.unitRate)
  if (!hasUnitRate) reasons.push('Unit Rate is required')
  else if (!Number.isFinite(unitRate) || unitRate < 0) reasons.push('Unit Rate must be a non-negative number')

  let status: BOQStatus = 'active'
  const rawStatus = raw.status.trim()
  if (rawStatus) {
    if ((STATUS_VALUES as string[]).includes(rawStatus)) {
      status = rawStatus as BOQStatus
    } else {
      reasons.push(`Status "${rawStatus}" is not one of: ${STATUS_VALUES.join(', ')}`)
    }
  }

  const wbsCode = raw.wbsCode.trim()
  let matchedEntry: BoqCodeCatalogEntry | undefined
  if (!wbsCode) {
    reasons.push('WBS Code is required')
  } else {
    const entry = catalog.find((e) => e.code === wbsCode)
    if (!entry) {
      reasons.push(`WBS Code "${wbsCode}" does not match any catalog entry`)
    } else if (entry.level !== 'line_item') {
      reasons.push(`WBS Code "${wbsCode}" is a ${entry.level} code; only line-item codes can be assigned`)
    } else {
      matchedEntry = entry
    }
  }

  if (reasons.length > 0) {
    return { raw, status: 'invalid', reasons, item: null }
  }

  return {
    raw,
    status: 'matched',
    reasons: [],
    item: {
      // A matched code's description always reflects the catalog, same as manual entry.
      wbs_code: matchedEntry!.code,
      description: matchedEntry!.description,
      unit: matchedEntry!.unit ?? undefined,
      quantity,
      unit_rate: unitRate,
      status,
    },
  }
}
