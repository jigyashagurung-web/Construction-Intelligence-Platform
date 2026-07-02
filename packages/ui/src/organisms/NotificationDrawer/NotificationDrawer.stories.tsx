import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { NotificationDrawer } from './NotificationDrawer'
import type { CIPNotification } from './NotificationDrawer'

const meta = {
  title:      'Organisms/NotificationDrawer',
  component:   NotificationDrawer,
  tags:       ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<any>

export default meta
type Story = StoryObj<any>

// ── Sample data ───────────────────────────────────────────────────────────────

const SAMPLE: CIPNotification[] = [
  {
    id: 'n1', type:'danger', title:'BOQ item overspent',
    body:'Concrete works (G+1 slab) is 18% over approved budget. Immediate review required.',
    timestamp:'Today 14:23', read:false, module:'BOQ',
    action:{ label:'View BOQ item' },
  },
  {
    id: 'n2', type:'warning', title:'Daily progress report pending',
    body:'Site engineer Bikash Karki has not submitted the DPR for today (2081-04-02).',
    timestamp:'Today 13:00', read:false, module:'DPR',
    action:{ label:'Send reminder' },
  },
  {
    id: 'n3', type:'success', title:'Payment certificate approved',
    body:'Payment certificate #PC-2081-012 for Thankot Highway Upgrade has been approved by the client.',
    timestamp:'Today 10:15', read:false, module:'Finance',
    action:{ label:'Download certificate' },
  },
  {
    id: 'n4', type:'warning', title:'Safety inspection due',
    body:'Monthly safety inspection for Baneshwor Commercial Complex is due in 2 days.',
    timestamp:'Yesterday 17:00', read:true, module:'Safety',
  },
  {
    id: 'n5', type:'info', title:'New drawing revision uploaded',
    body:'Structural drawings Rev-C for Column Grid A-D have been uploaded by the consultant.',
    timestamp:'Yesterday 09:30', read:true, module:'Documents',
    action:{ label:'View drawings' },
  },
  {
    id: 'n6', type:'danger', title:'Schedule milestone missed',
    body:'G+2 slab casting milestone (2081-03-30) was not achieved. Programme delay: 5 days.',
    timestamp:'2 days ago', read:true, module:'Schedule',
  },
  {
    id: 'n7', type:'info', title:'Material delivery confirmed',
    body:'32 tonnes of TMT Fe-500 rebar scheduled for delivery on 2081-04-05.',
    timestamp:'3 days ago', read:true, module:'Materials',
  },
]

// ── Stories ───────────────────────────────────────────────────────────────────

export const Interactive: Story = {
  name: 'Interactive — full notification list',
  render: () => {
    const [notes, setNotes]   = useState<CIPNotification[]>(SAMPLE)
    const [open, setOpen]     = useState(false)

    function markRead(id: string) {
      setNotes((prev) => prev.map((n) => n.id === id ? { ...n, read:true } : n))
    }
    function dismiss(id: string) {
      setNotes((prev) => prev.filter((n) => n.id !== id))
    }
    function markAllRead() {
      setNotes((prev) => prev.map((n) => ({ ...n, read:true })))
    }

    const unread = notes.filter((n) => !n.read).length

    return (
      <div style={{ height:'100vh', display:'flex', flexDirection:'column', background:'var(--surface-base)', padding:24 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <p style={{ fontSize:14, color:'var(--text-secondary)' }}>
            Click the bell to open the drawer. Unread: <strong>{unread}</strong>
          </p>
          <NotificationDrawer
            notifications={notes}
            open={open}
            onOpenChange={setOpen}
            onMarkRead={markRead}
            onDismiss={dismiss}
            onMarkAllRead={markAllRead}
          />
        </div>
        <p style={{ fontSize:12, color:'var(--text-tertiary)' }}>
          Hover over a notification row to see the mark-read / dismiss actions.
        </p>
      </div>
    )
  },
}

export const Empty: Story = {
  name: 'Empty state',
  render: () => (
    <div style={{ height:'100vh', display:'flex', alignItems:'flex-start', justifyContent:'flex-end', padding:24, background:'var(--surface-base)' }}>
      <NotificationDrawer
        notifications={[]}
        open
        onOpenChange={() => {}}
      />
    </div>
  ),
}

export const AllRead: Story = {
  name: 'All read — no badge',
  render: () => {
    const [open, setOpen] = useState(false)
    const allRead = SAMPLE.map((n) => ({ ...n, read:true }))
    return (
      <div style={{ height:'100vh', display:'flex', alignItems:'flex-start', justifyContent:'flex-end', padding:24, background:'var(--surface-base)' }}>
        <NotificationDrawer
          notifications={allRead}
          open={open}
          onOpenChange={setOpen}
        />
      </div>
    )
  },
}
