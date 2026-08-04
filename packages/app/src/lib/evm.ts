import type { ProjectEvm } from '@/types'

export interface EvmMetrics {
  sv: number
  spi: number | null
  cv: number
  cpi: number | null
  eac: number | null
  vac: number | null
  unscheduledAmount: number
}

export function computeEvmMetrics(evm: ProjectEvm): EvmMetrics {
  const { bac, total_active_boq_amount, pv, ev, ac } = evm

  const sv = ev - pv
  const spi = pv !== 0 ? ev / pv : null
  const cv = ev - ac
  const cpi = ac !== 0 ? ev / ac : null
  const eac = cpi !== null && cpi !== 0 ? bac / cpi : null
  const vac = eac !== null ? bac - eac : null
  const unscheduledAmount = total_active_boq_amount - bac

  return { sv, spi, cv, cpi, eac, vac, unscheduledAmount }
}
