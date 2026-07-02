import type { Meta, StoryObj } from '@storybook/react'
import { CheckCircle2, AlertTriangle, XCircle, Info, Bell, Wifi } from 'lucide-react'
import { ToastProvider, useToast, type ToastVariant } from './Toast'
import { Button } from '../../atoms/Button'
import { Badge }  from '../../atoms/Badge'

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title:     'Molecules/Toast',
  component:  ToastProvider,
  tags:      ['autodocs'],
  decorators: [
    (Story: any) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Context-based notification system. Wrap your app once with \`ToastProvider\`, then call
\`useToast()\` anywhere to push notifications.

\`\`\`tsx
// 1 · Wrap your app (in AppShell or _app.tsx)
<ToastProvider>
  <App />
</ToastProvider>

// 2 · Trigger from any component
const { toast } = useToast()
toast({ title: 'Saved', variant: 'success' })
toast({ title: 'Error', description: 'Could not sync', variant: 'danger', duration: Infinity })
\`\`\`

Toasts auto-dismiss after 4.5 s by default. Pass \`duration: Infinity\` for persistent ones.
Stack size is capped at 5 — oldest is bumped when exceeded.
        `.trim(),
      },
    },
  },
} satisfies Meta<any>

export default meta
type Story = StoryObj<any>

// ── Helper ────────────────────────────────────────────────────────────────────

const ICON: Record<ToastVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  danger:  XCircle,
  info:    Info,
  default: Bell,
}

// ── 1 · All variants ──────────────────────────────────────────────────────────

export const AllVariants: Story = {
  name: 'All variants',
  render: () => {
    const { toast } = useToast()

    const SAMPLES: Array<{ variant: ToastVariant; title: string; description: string }> = [
      { variant: 'success', title: 'Changes saved',        description: 'BOQ item 2.03 updated successfully.' },
      { variant: 'warning', title: 'Low stock alert',      description: 'TMT Rebar 16mm below reorder point.' },
      { variant: 'danger',  title: 'Sync failed',          description: 'Could not connect to server. Retrying…' },
      { variant: 'info',    title: 'Forecast updated',     description: 'Completion date revised to 2081-08-15.' },
      { variant: 'default', title: 'Daily report due',     description: 'Submit progress report before 18:00 today.' },
    ]

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {SAMPLES.map(({ variant, title, description }) => {
          const Icon = ICON[variant]
          return (
            <Button
              key={variant}
              variant="secondary"
              size="sm"
              iconLeft={<Icon className="h-4 w-4" />}
              onClick={() => toast({ title, description, variant })}
            >
              {variant}
            </Button>
          )
        })}
      </div>
    )
  },
}

// ── 2 · Construction scenarios ────────────────────────────────────────────────

export const ConstructionScenarios: Story = {
  name: 'Construction scenarios',
  render: () => {
    const { toast } = useToast()

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '380px' }}>
        <Button
          variant="secondary"
          size="sm"
          iconLeft={<CheckCircle2 className="h-4 w-4" />}
          onClick={() =>
            toast({
              title: 'Daily report submitted',
              description: 'Bikash Karki · G+1 slab — 72 sqm poured',
              variant: 'success',
            })
          }
        >
          Submit daily report
        </Button>

        <Button
          variant="secondary"
          size="sm"
          iconLeft={<AlertTriangle className="h-4 w-4" />}
          onClick={() =>
            toast({
              title: 'Material below reorder point',
              description: 'Cement stock: 42 bags remaining (reorder at 200)',
              variant: 'warning',
              action: { label: 'Raise PO', onClick: () => alert('Opening PO form…') },
              duration: 8000,
            })
          }
        >
          Stock alert (with action)
        </Button>

        <Button
          variant="secondary"
          size="sm"
          iconLeft={<XCircle className="h-4 w-4" />}
          onClick={() =>
            toast({
              title: 'PO approval failed',
              description: 'PO-0048 was rejected by Anita Tamang — budget exceeded.',
              variant: 'danger',
              duration: Infinity,
            })
          }
        >
          PO rejected (persistent)
        </Button>

        <Button
          variant="secondary"
          size="sm"
          iconLeft={<Info className="h-4 w-4" />}
          onClick={() =>
            toast({
              title: 'AI forecast ready',
              description: 'Project completion risk updated to 68% on-time.',
              variant: 'info',
              action: { label: 'View forecast', onClick: () => alert('Opening forecast…') },
            })
          }
        >
          AI forecast (with action)
        </Button>

        <Button
          variant="secondary"
          size="sm"
          iconLeft={<Wifi className="h-4 w-4" />}
          onClick={() =>
            toast({
              title: 'Back online',
              description: '3 daily reports and 1 material request synced.',
              variant: 'success',
            })
          }
        >
          Reconnected (offline sync)
        </Button>
      </div>
    )
  },
}

// ── 3 · Stack test ────────────────────────────────────────────────────────────

export const StackTest: Story = {
  name: 'Stack — fire 6 quickly',
  render: () => {
    const { toast } = useToast()
    const variants: ToastVariant[] = ['success', 'warning', 'danger', 'info', 'default', 'success']

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
        <Button
          onClick={() => {
            variants.forEach((v, i) =>
              setTimeout(() =>
                toast({
                  title: `Notification ${i + 1}`,
                  description: `This is toast #${i + 1} — variant: ${v}`,
                  variant: v,
                }),
                i * 300,
              ),
            )
          }}
        >
          Fire 6 toasts
        </Button>
        <Badge variant="info" size="sm">Cap is 5 — oldest disappears</Badge>
      </div>
    )
  },
}
