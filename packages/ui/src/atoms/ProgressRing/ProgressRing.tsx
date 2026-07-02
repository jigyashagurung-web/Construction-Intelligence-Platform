import * as React from 'react'
import { cn } from '../../utils/cn'

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns the semantic colour token for a given progress percentage */
function progressColour(value: number): string {
  if (value >= 100) return 'var(--progress-100)'
  if (value >= 76)  return 'var(--progress-76-99)'
  if (value >= 51)  return 'var(--progress-51-75)'
  if (value >= 26)  return 'var(--progress-26-50)'
  return                    'var(--progress-0-25)'
}

// ── Size map ─────────────────────────────────────────────────────────────────
const SIZE_MAP = {
  sm: { px: 48,  stroke: 4,  fontSize: '11px' },
  md: { px: 64,  stroke: 5,  fontSize: '14px' },
  lg: { px: 96,  stroke: 6,  fontSize: '20px' },
} as const

// ── Props ─────────────────────────────────────────────────────────────────────
export interface ProgressRingProps extends React.SVGAttributes<SVGSVGElement> {
  /** 0–100 */
  value: number
  /** Visual size */
  size?: keyof typeof SIZE_MAP
  /** Override fill colour. Defaults to the 5-band scale. */
  colour?: string
  /** Centre label. Defaults to "{value}%". Pass null to hide. */
  label?: React.ReactNode | null
  /** Accessible description of what the ring represents */
  description?: string
  /** Additional class on the SVG element */
  className?: string
}

// ── Component ─────────────────────────────────────────────────────────────────
const ProgressRing = React.forwardRef<SVGSVGElement, ProgressRingProps>(
  (
    {
      value,
      size  = 'md',
      colour,
      label,
      description,
      className,
      ...props
    },
    ref
  ) => {
    const clamped   = Math.min(100, Math.max(0, value))
    const { px, stroke, fontSize } = SIZE_MAP[size]
    const radius    = (px - stroke * 2) / 2
    const circumference = 2 * Math.PI * radius
    const offset    = circumference - (clamped / 100) * circumference
    const fill      = colour ?? progressColour(clamped)
    const centreLabel = label === null ? null : label ?? `${Math.round(clamped)}%`
    const titleId   = React.useId()

    return (
      <svg
        ref={ref}
        width={px}
        height={px}
        viewBox={`0 0 ${px} ${px}`}
        role="img"
        aria-labelledby={description ? titleId : undefined}
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn('shrink-0', className)}
        {...props}
      >
        {description && <title id={titleId}>{description}: {clamped}%</title>}

        {/* Track */}
        <circle
          cx={px / 2}
          cy={px / 2}
          r={radius}
          fill="none"
          stroke="var(--progress-ring-track, var(--primitive-zinc-200))"
          strokeWidth={stroke}
        />

        {/* Fill arc — starts at 12 o'clock */}
        <circle
          cx={px / 2}
          cy={px / 2}
          r={radius}
          fill="none"
          stroke={fill}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${px / 2} ${px / 2})`}
          style={{
            transition: 'stroke-dashoffset var(--duration-slow, 500ms) var(--ease-out, ease)',
          }}
        />

        {/* Centre label */}
        {centreLabel !== null && (
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={fontSize}
            fontWeight="600"
            fontFamily="var(--font-sans)"
            fill="var(--text-primary)"
          >
            {centreLabel}
          </text>
        )}
      </svg>
    )
  }
)
ProgressRing.displayName = 'ProgressRing'

export { ProgressRing }
