import * as React from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
  type VisibilityState,
  type ColumnFiltersState,
  type PaginationState,
  type Row,
} from '@tanstack/react-table'
import {
  ChevronUp, ChevronDown, ChevronsUpDown,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Settings2, Search, X, CheckSquare,
} from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as Checkbox from '@radix-ui/react-checkbox'
import { cn } from '../../utils/cn'
import { Button } from '../../atoms/Button'

// ── Public types ──────────────────────────────────────────────────────────────

export type { ColumnDef, Row }

export interface DataTableAction<TData> {
  label: string
  icon?: React.ReactNode
  variant?: 'default' | 'destructive'
  onClick: (row: Row<TData>) => void
  hidden?: (row: Row<TData>) => boolean
}

export interface DataTableBulkAction<TData> {
  label: string
  icon?: React.ReactNode
  variant?: 'default' | 'destructive'
  onClick: (rows: Row<TData>[]) => void
}

export interface DataTableProps<TData> {
  /** Column definitions. Use `createColumnHelper` from @tanstack/react-table */
  columns:          ColumnDef<TData, any>[]
  data:             TData[]
  /** Per-row action menu items */
  rowActions?:      DataTableAction<TData>[]
  /** Bulk actions shown when rows are selected */
  bulkActions?:     DataTableBulkAction<TData>[]
  /** Show a global search/filter input */
  searchable?:      boolean
  searchPlaceholder?: string
  /** Enable column visibility toggle panel */
  columnToggle?:    boolean
  /** Initial page size */
  pageSize?:        number
  /** Show pagination controls */
  pagination?:      boolean
  /** Loading state — shows skeleton rows */
  loading?:         boolean
  /** Empty state content */
  emptyState?:      React.ReactNode
  /** Sticky header */
  stickyHeader?:    boolean
  /** Callback when row is clicked */
  onRowClick?:      (row: Row<TData>) => void
  className?:       string
  'aria-label'?:    string
}

// ── Checkbox cell helper ──────────────────────────────────────────────────────

export function selectionColumn<TData>(): ColumnDef<TData, unknown> {
  return {
    id: '__select__',
    size: 40,
    enableSorting: false,
    enableHiding: false,
    header: ({ table }) => (
      <SelectionCheckbox
        checked={
          table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomePageRowsSelected()
            ? 'indeterminate'
            : false
        }
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label="Select all rows"
      />
    ),
    cell: ({ row }) => (
      <SelectionCheckbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        aria-label={`Select row ${row.index + 1}`}
      />
    ),
  }
}

// ── Internal checkbox ─────────────────────────────────────────────────────────

function SelectionCheckbox({
  checked,
  onCheckedChange,
  'aria-label': ariaLabel,
}: {
  checked: boolean | 'indeterminate'
  onCheckedChange: (v: boolean | 'indeterminate') => void
  'aria-label': string
}) {
  return (
    <Checkbox.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      aria-label={ariaLabel}
      className={cn(
        'flex h-4 w-4 items-center justify-center rounded',
        'border border-[--border-default] bg-[--surface-input]',
        'transition-colors',
        'data-[state=checked]:bg-[--action-primary-bg] data-[state=checked]:border-[--action-primary-bg]',
        'data-[state=indeterminate]:bg-[--action-primary-bg] data-[state=indeterminate]:border-[--action-primary-bg]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--focus-ring] focus-visible:ring-offset-1',
      )}
    >
      <Checkbox.Indicator>
        {checked === 'indeterminate' ? (
          <span className="block h-0.5 w-2 rounded-full bg-white" />
        ) : (
          <svg viewBox="0 0 10 8" className="h-2.5 w-2.5 fill-none stroke-white stroke-2">
            <polyline points="1,4 4,7 9,1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </Checkbox.Indicator>
    </Checkbox.Root>
  )
}

// ── Sort icon ─────────────────────────────────────────────────────────────────

function SortIcon({ direction }: { direction: false | 'asc' | 'desc' }) {
  if (direction === 'asc')  return <ChevronUp   className="h-3.5 w-3.5 text-[--action-primary-bg]" aria-hidden />
  if (direction === 'desc') return <ChevronDown className="h-3.5 w-3.5 text-[--action-primary-bg]" aria-hidden />
  return <ChevronsUpDown className="h-3.5 w-3.5 opacity-30" aria-hidden />
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function SkeletonRows({ cols, rows = 6 }: { cols: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, ri) => (
        <tr key={ri} className="border-b border-[--border-subtle]" aria-hidden>
          {Array.from({ length: cols }).map((_, ci) => (
            <td key={ci} className="px-3 py-[--row-height,0.75rem]">
              <div
                className="h-3.5 animate-pulse rounded bg-[--border-subtle]"
                style={{ width: `${50 + ((ci + ri * 3) % 5) * 10}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

// ── Row action menu ───────────────────────────────────────────────────────────

function RowActionsMenu<TData>({
  row,
  actions,
}: {
  row: Row<TData>
  actions: DataTableAction<TData>[]
}) {
  const visible = actions.filter((a) => !a.hidden?.(row))
  if (visible.length === 0) return null

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded',
            'text-[--text-tertiary] hover:text-[--text-primary] hover:bg-[--surface-hover]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--focus-ring]',
            'transition-colors',
          )}
          aria-label="Row actions"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current" aria-hidden>
            <circle cx="8" cy="3"  r="1.2" />
            <circle cx="8" cy="8"  r="1.2" />
            <circle cx="8" cy="13" r="1.2" />
          </svg>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className={cn(
            'z-50 min-w-[160px] overflow-hidden rounded-lg',
            'border border-[--border-default] bg-[--surface-overlay]',
            'shadow-[--shadow-lg]',
            'p-1',
            'animate-in fade-in-0 zoom-in-95',
          )}
        >
          {visible.map((action, i) => (
            <DropdownMenu.Item
              key={i}
              onSelect={() => action.onClick(row)}
              className={cn(
                'flex cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2',
                'text-sm font-medium outline-none transition-colors',
                action.variant === 'destructive'
                  ? 'text-[--color-danger-text] focus:bg-[--color-danger-bg-subtle]'
                  : 'text-[--text-primary] focus:bg-[--surface-hover]',
              )}
            >
              {action.icon && (
                <span className="h-4 w-4 opacity-70" aria-hidden>{action.icon}</span>
              )}
              {action.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

// ── Column visibility toggle ───────────────────────────────────────────────────

function ColumnToggle({
  columns,
}: {
  columns: Array<{ id: string; toggleVisibility: (v: boolean) => void; getIsVisible: () => boolean; columnDef: { header?: unknown } }>
}) {
  const toggleable = columns.filter((c) => c.id !== '__select__' && c.id !== '__actions__')

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" size="sm" iconLeft={<Settings2 className="h-4 w-4" />}>
          Columns
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className={cn(
            'z-50 min-w-[180px] overflow-hidden rounded-lg',
            'border border-[--border-default] bg-[--surface-overlay]',
            'shadow-[--shadow-lg] p-1',
            'animate-in fade-in-0 zoom-in-95',
          )}
        >
          <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[--text-tertiary]">
            Toggle columns
          </p>
          {toggleable.map((col) => {
            const label = typeof col.columnDef.header === 'string'
              ? col.columnDef.header
              : col.id
            return (
              <DropdownMenu.CheckboxItem
                key={col.id}
                checked={col.getIsVisible()}
                onCheckedChange={(v) => col.toggleVisibility(v)}
                className={cn(
                  'flex cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2',
                  'text-sm text-[--text-primary] outline-none transition-colors',
                  'focus:bg-[--surface-hover]',
                )}
              >
                <DropdownMenu.ItemIndicator>
                  <CheckSquare className="h-3.5 w-3.5 text-[--action-primary-bg]" aria-hidden />
                </DropdownMenu.ItemIndicator>
                <span className={cn(!col.getIsVisible() && 'opacity-40')}>{label}</span>
              </DropdownMenu.CheckboxItem>
            )
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

// ── Pagination controls ────────────────────────────────────────────────────────

function PaginationBar({
  table,
  totalRows,
}: {
  table: ReturnType<typeof useReactTable<any>>
  totalRows: number
}) {
  const { pageIndex, pageSize } = table.getState().pagination
  const start = pageIndex * pageSize + 1
  const end   = Math.min((pageIndex + 1) * pageSize, totalRows)

  return (
    <div className="flex items-center justify-between border-t border-[--border-subtle] px-4 py-2.5 text-sm text-[--text-secondary]">
      <span className="tabular-nums">
        {start}–{end} of {totalRows}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => table.firstPage()}
          disabled={!table.getCanPreviousPage()}
          aria-label="First page"
          className="flex h-7 w-7 items-center justify-center rounded text-[--text-tertiary] hover:bg-[--surface-hover] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronsLeft className="h-4 w-4" aria-hidden />
        </button>
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          aria-label="Previous page"
          className="flex h-7 w-7 items-center justify-center rounded text-[--text-tertiary] hover:bg-[--surface-hover] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>

        <span className="px-2 font-medium text-[--text-primary] tabular-nums">
          {pageIndex + 1} / {table.getPageCount()}
        </span>

        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          aria-label="Next page"
          className="flex h-7 w-7 items-center justify-center rounded text-[--text-tertiary] hover:bg-[--surface-hover] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
        <button
          onClick={() => table.lastPage()}
          disabled={!table.getCanNextPage()}
          aria-label="Last page"
          className="flex h-7 w-7 items-center justify-center rounded text-[--text-tertiary] hover:bg-[--surface-hover] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronsRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

function DataTableInner<TData>(
  {
    columns: columnDefs,
    data,
    rowActions,
    bulkActions,
    searchable  = false,
    searchPlaceholder = 'Search…',
    columnToggle = false,
    pageSize: initialPageSize = 20,
    pagination = true,
    loading    = false,
    emptyState,
    stickyHeader = true,
    onRowClick,
    className,
    'aria-label': ariaLabel,
  }: DataTableProps<TData>,
  ref: React.Ref<HTMLDivElement>,
) {
  const [sorting,       setSorting]       = React.useState<SortingState>([])
  const [rowSelection,  setRowSelection]  = React.useState<RowSelectionState>({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter,  setGlobalFilter]  = React.useState('')
  const [{ pageIndex, pageSize }, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize:  initialPageSize,
  })

  // Inject actions column when rowActions is provided
  const columns = React.useMemo<ColumnDef<TData, any>[]>(() => {
    if (!rowActions?.length) return columnDefs
    return [
      ...columnDefs,
      {
        id: '__actions__',
        size: 52,
        enableSorting: false,
        enableHiding: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <div className="flex justify-end pr-1">
            <RowActionsMenu row={row} actions={rowActions} />
          </div>
        ),
      },
    ]
  }, [columnDefs, rowActions])

  const table = useReactTable<TData>({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
      columnVisibility,
      columnFilters,
      globalFilter,
      pagination: { pageIndex, pageSize },
    },
    enableRowSelection:    true,
    onSortingChange:       setSorting,
    onRowSelectionChange:  setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange:  setGlobalFilter,
    onPaginationChange:    setPagination,
    getCoreRowModel:       getCoreRowModel(),
    getSortedRowModel:     getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel:   getFilteredRowModel(),
  })

  const selectedRows     = table.getSelectedRowModel().rows
  const hasSelection     = selectedRows.length > 0
  const visibleColCount  = table.getVisibleLeafColumns().length

  return (
    <div ref={ref} className={cn('flex flex-col rounded-xl border border-[--border-default] bg-[--surface-card] overflow-hidden', className)}>

      {/* ── Toolbar ── */}
      {(searchable || columnToggle || (hasSelection && bulkActions?.length)) && (
        <div className="flex items-center justify-between gap-3 border-b border-[--border-subtle] px-4 py-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {searchable && !hasSelection && (
              <div className="relative w-full max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[--text-tertiary]" aria-hidden />
                <input
                  type="search"
                  value={globalFilter}
                  onChange={(e) => { setGlobalFilter(e.target.value); setPagination((p) => ({ ...p, pageIndex: 0 })) }}
                  placeholder={searchPlaceholder}
                  className={cn(
                    'h-8 w-full rounded-lg border border-[--border-default] bg-[--surface-input]',
                    'pl-8 pr-8 text-sm text-[--text-primary] placeholder:text-[--text-placeholder]',
                    'focus:outline-none focus:ring-2 focus:ring-[--focus-ring]',
                    'transition-colors',
                  )}
                  aria-label="Search rows"
                />
                {globalFilter && (
                  <button
                    onClick={() => setGlobalFilter('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[--text-tertiary] hover:text-[--text-primary]"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                  </button>
                )}
              </div>
            )}

            {/* Bulk action bar */}
            {hasSelection && bulkActions?.length && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[--text-primary] tabular-nums">
                  {selectedRows.length} selected
                </span>
                {bulkActions.map((action, i) => (
                  <Button
                    key={i}
                    size="sm"
                    variant={action.variant === 'destructive' ? 'destructive' : 'secondary'}
                    iconLeft={action.icon ? <span className="h-4 w-4">{action.icon}</span> : undefined}
                    onClick={() => action.onClick(selectedRows)}
                  >
                    {action.label}
                  </Button>
                ))}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => table.resetRowSelection()}
                >
                  Clear
                </Button>
              </div>
            )}
          </div>

          {columnToggle && !hasSelection && (
            <ColumnToggle columns={table.getAllLeafColumns() as any} />
          )}
        </div>
      )}

      {/* ── Table scroll wrapper ── */}
      <div className="flex-1 overflow-x-auto">
        <table
          className="w-full border-collapse text-sm"
          aria-label={ariaLabel ?? 'Data table'}
          aria-rowcount={data.length + 1}
          aria-busy={loading}
        >
          <thead className={cn(stickyHeader && 'sticky top-0 z-10 bg-[--surface-card]')}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-[--border-default]">
                {headerGroup.headers.map((header) => {
                  const sortable = header.column.getCanSort()
                  const sorted   = header.column.getIsSorted()

                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                      className={cn(
                        'px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-[--text-tertiary]',
                        'whitespace-nowrap select-none',
                        sortable && 'cursor-pointer hover:text-[--text-primary] transition-colors',
                      )}
                      onClick={sortable ? header.column.getToggleSortingHandler() : undefined}
                      aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : sortable ? 'none' : undefined}
                    >
                      <div className="flex items-center gap-1.5">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        {sortable && <SortIcon direction={sorted} />}
                      </div>
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>

          <tbody>
            {loading ? (
              <SkeletonRows cols={visibleColCount} />
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={visibleColCount} className="px-4 py-16 text-center">
                  {emptyState ?? (
                    <div className="flex flex-col items-center gap-2 text-[--text-tertiary]">
                      <svg viewBox="0 0 64 64" className="h-12 w-12 opacity-30" fill="none" aria-hidden>
                        <rect x="8" y="16" width="48" height="36" rx="4" stroke="currentColor" strokeWidth="2"/>
                        <path d="M8 24h48" stroke="currentColor" strokeWidth="2"/>
                        <path d="M20 32h24M20 40h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <p className="text-sm font-medium">No results found</p>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    'border-b border-[--border-subtle] transition-colors',
                    'hover:bg-[--surface-hover]',
                    row.getIsSelected() && 'bg-[color-mix(in_srgb,var(--action-primary-bg)_6%,transparent)]',
                    onRowClick && 'cursor-pointer',
                  )}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  aria-selected={row.getIsSelected() || undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-3 py-[calc(var(--row-height,3rem)/2_-_0.875rem)] align-middle text-[--text-primary]"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {pagination && !loading && data.length > 0 && (
        <PaginationBar table={table} totalRows={table.getFilteredRowModel().rows.length} />
      )}
    </div>
  )
}

// Generic forwardRef wrapper (TypeScript requires this dance for generic components)
export const DataTable = React.forwardRef(DataTableInner) as <TData>(
  props: DataTableProps<TData> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement
