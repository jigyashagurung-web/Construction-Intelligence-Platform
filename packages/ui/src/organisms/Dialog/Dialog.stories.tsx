import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Trash2, AlertTriangle, Plus, FileUp } from 'lucide-react'
import {
  Dialog, DialogTrigger, DialogContent,
  DialogHeader, DialogBody, DialogFooter,
  DialogTitle, DialogDescription, DialogClose,
} from './Dialog'
import { Button }  from '../../atoms/Button'
import { Input }   from '../../atoms/Input'
import { Select }  from '../../atoms/Select'
import { Badge }   from '../../atoms/Badge'

const meta = {
  title:     'Organisms/Dialog',
  component:  DialogContent,
  tags:      ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Accessible modal + drawer built on **Radix UI Dialog**.

- \`variant="modal"\` — centred overlay with size prop (sm/md/lg/xl/full)
- \`variant="drawer"\` — right-side panel, full height

\`\`\`tsx
<Dialog>
  <DialogTrigger asChild><Button>Open</Button></DialogTrigger>
  <DialogContent variant="modal" size="md">
    <DialogHeader bordered>
      <DialogTitle>Confirm delete</DialogTitle>
      <DialogDescription>This action cannot be undone.</DialogDescription>
    </DialogHeader>
    <DialogBody>…</DialogBody>
    <DialogFooter>
      <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
      <Button variant="destructive">Delete</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
\`\`\`
      `.trim(),
      },
    },
  },
} satisfies Meta<any>

export default meta
type Story = StoryObj<any>

// ── 1 · Confirm delete ────────────────────────────────────────────────────────

export const ConfirmDelete: Story = {
  name: 'Confirm delete',
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive" iconLeft={<Trash2 className="h-4 w-4" />}>
          Delete item
        </Button>
      </DialogTrigger>
      <DialogContent variant="modal" size="sm">
        <DialogHeader>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[--color-danger-bg-subtle] mb-3">
            <AlertTriangle className="h-5 w-5 text-[--color-danger-icon]" aria-hidden />
          </div>
          <DialogTitle>Delete BOQ item?</DialogTitle>
          <DialogDescription>
            BOQ line <strong className="text-[--text-primary]">2.03 — RCC M30 columns G+1</strong> will be
            permanently removed. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button variant="destructive">Delete item</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

// ── 2 · Edit form (modal) ─────────────────────────────────────────────────────

const UNITS = [
  { value: 'cum', label: 'cum — Cubic metre'  },
  { value: 'sqm', label: 'sqm — Square metre' },
  { value: 'kg',  label: 'kg  — Kilogram'     },
  { value: 'MT',  label: 'MT  — Metric tonne' },
  { value: 'nos', label: 'nos — Numbers'      },
  { value: 'lot', label: 'lot — Lump sum'     },
]

export const EditItemModal: Story = {
  name: 'Edit BOQ item (modal)',
  render: () => {
    const [open, setOpen] = useState(false)
    const [saved, setSaved] = useState(false)

    return (
      <div className="flex flex-col items-center gap-4">
        <Button iconLeft={<Plus className="h-4 w-4" />} onClick={() => { setOpen(true); setSaved(false) }}>
          Edit item
        </Button>
        {saved && <Badge variant="success" dot>Changes saved</Badge>}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent variant="modal" size="md">
            <DialogHeader bordered>
              <DialogTitle>Edit BOQ line item</DialogTitle>
              <DialogDescription>
                Update quantity, rate, or unit for this line.
              </DialogDescription>
            </DialogHeader>

            <DialogBody>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Input
                  label="Item code"
                  defaultValue="2.03"
                  disabled
                  hint="Auto-generated code — cannot be changed"
                />
                <Input
                  label="Description"
                  defaultValue="RCC M30 — columns G+1"
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Input
                    label="Quantity"
                    type="number"
                    defaultValue="58"
                    hint="Measured quantity"
                  />
                  <Select
                    label="Unit"
                    options={UNITS}
                    defaultValue="cum"
                  />
                </div>
                <Input
                  label="Rate (NPR)"
                  type="number"
                  defaultValue="11200"
                  hint="Rate per unit, excl. VAT"
                />
              </div>
            </DialogBody>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Discard</Button>
              </DialogClose>
              <Button onClick={() => { setOpen(false); setSaved(true) }}>
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  },
}

// ── 3 · Drawer (right panel) ──────────────────────────────────────────────────

export const DrawerPanel: Story = {
  name: 'Drawer panel (import wizard)',
  render: () => {
    const [step, setStep] = useState(1)

    return (
      <Dialog onOpenChange={() => setStep(1)}>
        <DialogTrigger asChild>
          <Button iconLeft={<FileUp className="h-4 w-4" />} variant="secondary">
            Import BOQ from Excel
          </Button>
        </DialogTrigger>
        <DialogContent variant="drawer">
          <div className="flex h-full flex-col">
            <DialogHeader bordered>
              <DialogTitle>Import BOQ from Excel</DialogTitle>
              <DialogDescription>
                Step {step} of 3 — {step === 1 ? 'Upload file' : step === 2 ? 'Map columns' : 'Review & import'}
              </DialogDescription>
            </DialogHeader>

            <DialogBody>
              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    border: '2px dashed var(--border-default)',
                    borderRadius: '12px',
                    padding: '40px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    color: 'var(--text-secondary)',
                  }}>
                    <FileUp className="h-8 w-8 opacity-40" aria-hidden />
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>
                      Drop your BOQ Excel file here
                    </p>
                    <p style={{ fontSize: '12px' }}>XLSX, XLS — max 25 MB</p>
                    <Button variant="secondary" size="sm">Browse files</Button>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                    Use our template for best results. Download →
                  </p>
                </div>
              )}
              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Match your spreadsheet columns to CIP fields.
                  </p>
                  {['Code', 'Description', 'Unit', 'Quantity', 'Rate'].map((field) => (
                    <Select
                      key={field}
                      label={`CIP field: ${field}`}
                      options={[
                        { value: 'col_a', label: 'Column A' },
                        { value: 'col_b', label: 'Column B' },
                        { value: 'col_c', label: 'Column C' },
                        { value: 'col_d', label: 'Column D' },
                      ]}
                      defaultValue={`col_${String.fromCharCode(96 + ['Code','Description','Unit','Quantity','Rate'].indexOf(field) + 1)}`}
                    />
                  ))}
                </div>
              )}
              {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    background: 'var(--color-success-bg-subtle)',
                    border: '1px solid var(--color-success-border)',
                    borderRadius: '10px',
                    padding: '16px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start',
                  }}>
                    <div style={{ fontSize: '13px', color: 'var(--color-success-text)' }}>
                      <strong>142 line items</strong> ready to import.
                      <br />3 rows with missing data will be skipped.
                    </div>
                  </div>
                  <Badge variant="warning" dot>3 rows skipped — missing unit or rate</Badge>
                </div>
              )}
            </DialogBody>

            <DialogFooter>
              {step > 1 && (
                <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>Back</Button>
              )}
              {step < 3 ? (
                <Button onClick={() => setStep((s) => s + 1)}>Continue</Button>
              ) : (
                <DialogClose asChild>
                  <Button>Import 142 items</Button>
                </DialogClose>
              )}
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    )
  },
}

// ── 4 · Sizes ─────────────────────────────────────────────────────────────────

export const ModalSizes: Story = {
  name: 'Modal sizes',
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Dialog key={size}>
          <DialogTrigger asChild>
            <Button variant="secondary" size="sm">{size.toUpperCase()}</Button>
          </DialogTrigger>
          <DialogContent variant="modal" size={size}>
            <DialogHeader bordered>
              <DialogTitle>Dialog — size: {size}</DialogTitle>
              <DialogDescription>
                Max width: {size === 'sm' ? '24rem' : size === 'md' ? '32rem' : size === 'lg' ? '42rem' : '64rem'}
              </DialogDescription>
            </DialogHeader>
            <DialogBody>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                This is the body content area. It scrolls independently when content exceeds the
                viewport height. Use <code>DialogHeader</code>, <code>DialogBody</code>, and{' '}
                <code>DialogFooter</code> for consistent layout structure across all dialogs in CIP.
              </p>
            </DialogBody>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Close</Button>
              </DialogClose>
              <Button>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  ),
}
