'use client'
import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { cn } from '../../utils/cn'

// ── BS Calendar (2078–2090) ───────────────────────────────────────────────────
// Days per month for each BS year. Reference: BS 2078-01-01 ≈ AD 2021-04-14

const BS_DATA: Record<number, readonly number[]> = {
  2078: [31,31,32,32,31,30,30,29,30,29,30,30],
  2079: [31,32,31,32,31,30,30,30,29,29,30,30],
  2080: [31,32,31,32,31,30,30,30,29,30,29,31],
  2081: [31,31,32,31,31,31,30,29,30,29,30,30],
  2082: [31,31,32,32,31,30,30,29,30,29,30,30],
  2083: [31,32,31,32,31,30,30,30,29,29,30,30],
  2084: [31,31,32,31,31,30,30,30,29,30,30,30],
  2085: [31,31,32,31,31,31,30,29,30,30,29,31],
  2086: [31,31,31,32,31,31,30,29,30,29,30,30],
  2087: [31,32,31,32,31,30,30,29,29,30,30,30],
  2088: [30,32,31,32,31,30,30,30,29,30,30,30],
  2089: [31,31,32,31,31,31,30,30,29,30,29,31],
  2090: [31,31,32,31,31,30,30,30,29,30,30,30],
}

const BS_MONTHS = ['Baisakh','Jestha','Ashadh','Shrawan','Bhadra','Ashwin','Kartik','Mangsir','Poush','Magh','Falgun','Chaitra']
const AD_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const BS_EPOCH_AD_MS = Date.UTC(2021, 3, 14) // BS 2078-01-01

function bsToEpochDay(y: number, m: number, d: number): number {
  let n = 0
  for (let yr = 2078; yr < y; yr++) {
    const md = BS_DATA[yr]
    if (!md) return NaN
    n += md.reduce((a, b) => a + b, 0)
  }
  const md = BS_DATA[y]
  if (!md) return NaN
  for (let mo = 0; mo < m; mo++) n += md[mo]
  return n + d - 1
}

function epochDayToBS(n: number): { year: number; month: number; day: number } | null {
  if (n < 0) return null
  let y = 2078
  for (;;) {
    const md = BS_DATA[y]
    if (!md) return null
    const total = md.reduce((a, b) => a + b, 0)
    if (n < total) break
    n -= total
    y++
  }
  const md = BS_DATA[y]!
  let m = 0
  while (n >= md[m]) { n -= md[m]; m++ }
  return { year: y, month: m, day: n + 1 }
}

function bsToAD(y: number, m: number, d: number): Date {
  return new Date(BS_EPOCH_AD_MS + bsToEpochDay(y, m, d) * 86400000)
}

function adToBS(date: Date): { year: number; month: number; day: number } | null {
  const n = Math.round((date.getTime() - BS_EPOCH_AD_MS) / 86400000)
  return epochDayToBS(n)
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type DatePickerMode = 'ad' | 'bs'

export interface DatePickerProps {
  value?:       string             // YYYY-MM-DD in the mode's calendar
  onChange?:    (value: string) => void
  mode?:        DatePickerMode
  placeholder?: string
  label?:       string
  hint?:        string
  error?:       string
  disabled?:    boolean
  required?:    boolean
  min?:         string             // YYYY-MM-DD lower bound
  max?:         string             // YYYY-MM-DD upper bound
  size?:        'sm' | 'md' | 'lg'
  id?:          string
  name?:        string
  className?:   string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseISO(value: string | undefined): { year: number; month: number; day: number } | null {
  if (!value) return null
  const parts = value.split('-').map(Number)
  if (parts.length < 3 || parts.some(isNaN)) return null
  return { year: parts[0], month: parts[1] - 1, day: parts[2] }
}

function toISO(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function formatDisplay(year: number, month: number, day: number, mode: DatePickerMode): string {
  if (mode === 'bs') return `${year} ${BS_MONTHS[month]} ${String(day).padStart(2, '0')}`
  return new Date(year, month, day).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })
}

function getDaysInMonth(year: number, month: number, mode: DatePickerMode): number {
  if (mode === 'bs') return BS_DATA[year]?.[month] ?? 30
  return new Date(year, month + 1, 0).getDate()
}

function getFirstWeekday(year: number, month: number, mode: DatePickerMode): number {
  const ad = mode === 'bs' ? bsToAD(year, month, 1) : new Date(year, month, 1)
  return ad.getDay()
}

function getToday(mode: DatePickerMode): { year: number; month: number; day: number } {
  const now = new Date()
  if (mode === 'bs') return adToBS(now) ?? { year: 2081, month: 0, day: 1 }
  return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() }
}

const SIZES = {
  sm: { trigger: 'h-8  text-xs  px-2.5 pr-8',  icon: 'h-3.5 w-3.5 right-2'   },
  md: { trigger: 'h-9  text-sm  px-3   pr-9',   icon: 'h-4   w-4   right-2.5' },
  lg: { trigger: 'h-11 text-base px-3.5 pr-10', icon: 'h-5   w-5   right-3'   },
}

// ── Component ─────────────────────────────────────────────────────────────────

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({
    value, onChange, mode = 'bs', placeholder, label, hint, error,
    disabled = false, required = false, size = 'md', id, name, className,
  }, ref) => {
    const autoId = React.useId()
    const inputId = id ?? autoId
    const today   = React.useMemo(() => getToday(mode), [mode])
    const parsed  = React.useMemo(() => parseISO(value), [value])

    const [viewYear,  setViewYear]  = React.useState(() => parsed?.year  ?? today.year)
    const [viewMonth, setViewMonth] = React.useState(() => parsed?.month ?? today.month)
    const [open, setOpen] = React.useState(false)

    React.useEffect(() => {
      if (parsed) { setViewYear(parsed.year); setViewMonth(parsed.month) }
    }, [value])

    const daysInMonth  = getDaysInMonth(viewYear, viewMonth, mode)
    const firstWeekday = getFirstWeekday(viewYear, viewMonth, mode)
    const months       = mode === 'bs' ? BS_MONTHS : AD_MONTHS
    const yearRange    = mode === 'bs'
      ? Object.keys(BS_DATA).map(Number)
      : Array.from({ length: 25 }, (_, i) => today.year - 5 + i)

    function prevMonth() {
      if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
      else setViewMonth(m => m - 1)
    }
    function nextMonth() {
      if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
      else setViewMonth(m => m + 1)
    }

    function selectDay(day: number) {
      onChange?.(toISO(viewYear, viewMonth, day))
      setOpen(false)
    }

    function goToday() {
      setViewYear(today.year); setViewMonth(today.month)
      onChange?.(toISO(today.year, today.month, today.day))
      setOpen(false)
    }

    const displayValue = parsed ? formatDisplay(parsed.year, parsed.month, parsed.day, mode) : ''
    const hasError = Boolean(error)
    const s = SIZES[size]

    // Cross-calendar display for footer
    const crossCalLabel = parsed
      ? mode === 'bs'
          ? bsToAD(parsed.year, parsed.month, parsed.day).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
          : (() => { const bs = adToBS(new Date(parsed.year, parsed.month, parsed.day)); return bs ? `BS ${bs.year} ${BS_MONTHS[bs.month]} ${bs.day}` : '' })()
      : ''

    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[--text-label]">
            {label}
            {required && <span className="ml-0.5 text-[--color-danger-icon]" aria-hidden>*</span>}
          </label>
        )}

        <PopoverPrimitive.Root open={open} onOpenChange={disabled ? undefined : setOpen}>
          <PopoverPrimitive.Trigger asChild>
            <button
              id={inputId}
              type="button"
              disabled={disabled}
              className={cn(
                'relative flex w-full items-center rounded-[--input-radius]',
                'border text-left transition-[border-color,box-shadow]',
                'bg-[--surface-input] focus:outline-none',
                'focus:ring-2 focus:ring-offset-1',
                hasError
                  ? 'border-[--color-danger-border] focus:ring-[--color-danger-border]'
                  : 'border-[--border-default] hover:border-[--border-strong] focus:ring-[--action-primary-bg]',
                disabled && 'cursor-not-allowed opacity-50',
                s.trigger,
              )}
              aria-label={label ?? placeholder ?? `Select ${mode.toUpperCase()} date`}
            >
              <span className={cn('flex-1 truncate', !displayValue && 'text-[--text-placeholder]')}>
                {displayValue || (placeholder ?? `Select ${mode === 'bs' ? 'BS' : 'AD'} date`)}
              </span>
              <CalendarDays
                aria-hidden
                className={cn('absolute shrink-0 text-[--text-tertiary]', s.icon)}
              />
            </button>
          </PopoverPrimitive.Trigger>

          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
              align="start"
              sideOffset={6}
              className={cn(
                'z-50 rounded-[--card-radius] border border-[--card-border]',
                'bg-[--card-bg] shadow-[--shadow-popover] outline-none',
                'data-[state=open]:animate-in data-[state=closed]:animate-out',
                'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
              )}
            >
              <div style={{ width: 284, padding: 14 }}>

                {/* Month / year navigation */}
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
                  <button type="button" onClick={prevMonth} aria-label="Previous month"
                    style={{ width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:6, border:'1px solid var(--border-default)', background:'var(--surface-input)', cursor:'pointer', color:'var(--text-secondary)', flexShrink:0 }}>
                    <ChevronLeft className="h-4 w-4" aria-hidden />
                  </button>

                  <select value={viewMonth} onChange={(e) => setViewMonth(Number(e.target.value))} aria-label="Month"
                    style={{ flex:1, height:28, fontSize:13, fontWeight:600, color:'var(--text-primary)', background:'var(--surface-input)', border:'1px solid var(--border-default)', borderRadius:6, paddingLeft:8, cursor:'pointer' }}>
                    {months.map((mn, i) => <option key={i} value={i}>{mn}</option>)}
                  </select>

                  <select value={viewYear} onChange={(e) => setViewYear(Number(e.target.value))} aria-label="Year"
                    style={{ width:76, height:28, fontSize:13, fontWeight:600, color:'var(--text-primary)', background:'var(--surface-input)', border:'1px solid var(--border-default)', borderRadius:6, paddingLeft:8, cursor:'pointer' }}>
                    {yearRange.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>

                  <button type="button" onClick={nextMonth} aria-label="Next month"
                    style={{ width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:6, border:'1px solid var(--border-default)', background:'var(--surface-input)', cursor:'pointer', color:'var(--text-secondary)', flexShrink:0 }}>
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </button>
                </div>

                {/* Day-of-week header */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', marginBottom:4 }}>
                  {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => (
                    <div key={d} style={{ textAlign:'center', fontSize:11, fontWeight:600, color:'var(--text-tertiary)', padding:'2px 0' }}>{d}</div>
                  ))}
                </div>

                {/* Day grid */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:2 }}>
                  {Array.from({ length: firstWeekday }, (_, i) => <div key={`empty-${i}`} />)}
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1
                    const sel = parsed?.year === viewYear && parsed?.month === viewMonth && parsed?.day === day
                    const isToday = today.year === viewYear && today.month === viewMonth && today.day === day
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => selectDay(day)}
                        aria-pressed={sel}
                        aria-label={`${day} ${months[viewMonth]} ${viewYear}`}
                        style={{
                          height:32, borderRadius:6, border:'none',
                          fontSize:13, cursor:'pointer', transition:'background 0.1s',
                          fontWeight: sel ? 700 : isToday ? 600 : 400,
                          background: sel ? 'var(--action-primary-bg)' : isToday ? 'var(--surface-hover)' : 'transparent',
                          color: sel ? 'var(--action-primary-text)' : isToday ? 'var(--action-primary-bg)' : 'var(--text-primary)',
                          outline: 'none',
                        }}
                        onMouseEnter={(e) => { if (!sel) e.currentTarget.style.background = 'var(--surface-hover)' }}
                        onMouseLeave={(e) => { if (!sel) e.currentTarget.style.background = isToday ? 'var(--surface-hover)' : 'transparent' }}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>

                {/* Footer */}
                <div style={{ marginTop:12, paddingTop:10, borderTop:'1px solid var(--border-subtle)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <button type="button" onClick={goToday}
                    style={{ fontSize:12, fontWeight:600, color:'var(--action-primary-bg)', background:'none', border:'none', cursor:'pointer' }}>
                    Today
                  </button>
                  {crossCalLabel && (
                    <span style={{ fontSize:11, color:'var(--text-tertiary)' }}>{crossCalLabel}</span>
                  )}
                  <span style={{ fontSize:11, fontWeight:600, color:'var(--text-tertiary)', border:'1px solid var(--border-default)', borderRadius:4, padding:'1px 5px' }}>{mode.toUpperCase()}</span>
                </div>
              </div>
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>

        {/* Hidden input for form submission */}
        <input ref={ref} type="hidden" name={name} value={value ?? ''} aria-hidden />

        {(hint || error) && (
          <p className={cn('text-xs', error ? 'text-[--color-danger-text]' : 'text-[--text-secondary]')}>
            {error ?? hint}
          </p>
        )}
      </div>
    )
  }
)
DatePicker.displayName = 'DatePicker'

export { DatePicker, BS_MONTHS, adToBS, bsToAD }
