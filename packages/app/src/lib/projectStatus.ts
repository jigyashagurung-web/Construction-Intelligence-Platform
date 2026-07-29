import type { ProjectStatus } from '@/types'

export const PROJECT_STATUS_COLOR: Record<ProjectStatus, { bg: string; text: string; dot: string }> = {
  planning:  { bg: 'bg-gray-100',    text: 'text-gray-700',  dot: 'bg-gray-400' },
  active:    { bg: 'bg-green-100',   text: 'text-green-700', dot: 'bg-green-500' },
  on_hold:   { bg: 'bg-yellow-100',  text: 'text-yellow-700',dot: 'bg-yellow-500' },
  complete:  { bg: 'bg-blue-100',    text: 'text-blue-700',  dot: 'bg-blue-500' },
  cancelled: { bg: 'bg-red-100',     text: 'text-red-600',   dot: 'bg-red-500' },
}
