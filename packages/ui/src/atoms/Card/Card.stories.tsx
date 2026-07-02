import type { Meta, StoryObj } from '@storybook/react'
import { TrendingUp, AlertTriangle, MapPin, Calendar, Users } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from './Card'
import { Badge }       from '../Badge'
import { Button }      from '../Button'
import { ProgressRing } from '../ProgressRing'
import { MetricCard }  from '../../molecules/MetricCard'

const meta = {
  title:     'Atoms/Card',
  component:  Card,
  tags:      ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

// ── Stories ───────────────────────────────────────────────────────────────────

export const Variants: Story = {
  name: 'Variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
      {(['default', 'flat', 'elevated'] as const).map((variant) => (
        <Card key={variant} variant={variant}>
          <CardBody>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              variant="{variant}"
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {variant === 'default'  && 'Border outline — standard card'}
              {variant === 'flat'     && 'No border, no shadow — inline content'}
              {variant === 'elevated' && 'Shadow only — floating surface'}
            </p>
          </CardBody>
        </Card>
      ))}
    </div>
  ),
}

export const WithHeaderFooter: Story = {
  name: 'With header + footer',
  render: () => (
    <Card style={{ maxWidth: '420px' }}>
      <CardHeader bordered>
        <CardTitle>Material alert</CardTitle>
        <Badge variant="danger" dot size="sm">Critical</Badge>
      </CardHeader>
      <CardBody>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          TMT Rebar 16mm stock has dropped to <strong style={{ color: 'var(--color-danger-text)' }}>180 kg</strong>,
          below the reorder point of 500 kg. Scheduled pour on 2081-03-20 requires approximately 420 kg.
        </p>
      </CardBody>
      <CardFooter>
        <Button size="sm">Raise PO</Button>
        <Button size="sm" variant="ghost">Dismiss</Button>
      </CardFooter>
    </Card>
  ),
}

export const ProjectCard: Story = {
  name: 'Project card (CIP)',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
      {[
        { name: 'Baneshwor Commercial Complex', code: 'BCC-2081', location: 'Baneshwor, Kathmandu', progress: 68, status: 'on-track' as const,  type: 'Commercial',   budget: '₨ 9.16 Cr', team: 12 },
        { name: 'Thankot Highway Upgrade',       code: 'THU-2081', location: 'Thankot, Kathmandu',   progress: 34, status: 'at-risk' as const,   type: 'Infrastructure',budget: '₨ 4.80 Cr', team: 8  },
        { name: 'Pokhara Airport Annex',          code: 'PAA-2080', location: 'Pokhara-12',           progress: 91, status: 'complete' as const,  type: 'Government',   budget: '₨ 2.20 Cr', team: 6  },
      ].map((p) => (
        <Card key={p.code} asButton variant="default" style={{ cursor: 'pointer' }}>
          <CardBody>
            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.name}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-tertiary)' }}>{p.code}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>·</span>
                  <Badge variant="default" size="sm">{p.type}</Badge>
                </div>
              </div>
              <ProgressRing value={p.progress} size="sm" description={`${p.progress}% complete`} />
            </div>

            {/* Meta */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--text-tertiary)' }} aria-hidden />
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{p.location}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--text-tertiary)' }} aria-hidden />
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{p.budget} contract value</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--text-tertiary)' }} aria-hidden />
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{p.team} team members</span>
              </div>
            </div>
          </CardBody>
          <CardFooter>
            <Badge
              variant={p.status === 'complete' ? 'success' : p.status === 'on-track' ? 'primary' : 'warning'}
              dot
              size="sm"
            >
              {p.status === 'on-track' ? 'On track' : p.status === 'at-risk' ? 'At risk' : 'Completed'}
            </Badge>
          </CardFooter>
        </Card>
      ))}
    </div>
  ),
}

export const KPIGrid: Story = {
  name: 'KPI grid inside cards',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', maxWidth: '600px' }}>
      <Card>
        <CardHeader bordered>
          <CardTitle>Schedule</CardTitle>
          <AlertTriangle className="h-4 w-4" style={{ color: 'var(--color-warning-icon)' }} aria-hidden />
        </CardHeader>
        <CardBody>
          <MetricCard label="SPI" value="0.87" trend={-0.03} trendLabel="vs baseline" status="warning" trendPositiveIsGood />
        </CardBody>
      </Card>
      <Card>
        <CardHeader bordered>
          <CardTitle>Cost</CardTitle>
        </CardHeader>
        <CardBody>
          <MetricCard label="CPI" value="0.92" trend={0.01} trendLabel="vs last week" status="ok" trendPositiveIsGood />
        </CardBody>
      </Card>
    </div>
  ),
}
