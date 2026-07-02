import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FileUpload } from './FileUpload'
import type { FileEntry } from './FileUpload'

const meta = {
  title:      'Atoms/FileUpload',
  component:   FileUpload,
  tags:       ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof FileUpload>

export default meta
type Story = StoryObj<typeof meta>

// ── Stories ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  name: 'Drop zone (uncontrolled)',
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <FileUpload
        multiple
        accept="image/*,.pdf"
        maxSize={5 * 1024 * 1024}
        maxFiles={5}
        label="Site photos / documents"
        hint="Images or PDFs, up to 5 MB each, max 5 files"
      />
    </div>
  ),
}

export const ImageOnly: Story = {
  name: 'Images only',
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <FileUpload
        multiple
        accept="image/*"
        maxSize={10 * 1024 * 1024}
        label="Progress photos"
        hint="JPG, PNG, WEBP — up to 10 MB each"
      />
    </div>
  ),
}

export const SinglePDF: Story = {
  name: 'Single PDF upload',
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <FileUpload
        accept=".pdf"
        label="Signed contract"
        hint="PDF only"
      />
    </div>
  ),
}

export const Compact: Story = {
  name: 'Compact button mode',
  render: () => (
    <div style={{ display:'flex', flexDirection:'column', gap:16, maxWidth:320 }}>
      <FileUpload compact accept=".pdf" label="Attach drawing" hint="PDF only" />
      <FileUpload compact multiple accept="image/*,.pdf" label="Attach files" />
    </div>
  ),
}

export const WithError: Story = {
  name: 'External error state',
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <FileUpload
        accept=".pdf"
        label="Payment certificate"
        error="Please upload a signed payment certificate before submitting"
      />
    </div>
  ),
}

export const Disabled: Story = {
  name: 'Disabled',
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <FileUpload
        multiple
        disabled
        label="Attachments"
        hint="Upload is disabled while the form is locked"
      />
    </div>
  ),
}

export const Controlled: Story = {
  name: 'Controlled — pre-loaded files',
  render: () => {
    const [files, setFiles] = useState<FileEntry[]>([
      {
        id:      'mock-pdf',
        file:    new File([''], 'BOQ-Revision-3.pdf', { type:'application/pdf' }),
        error:   undefined,
      },
      {
        id:      'mock-img',
        file:    new File([''], 'site-photo-2081-03-15.jpg', { type:'image/jpeg' }),
        error:   undefined,
      },
      {
        id:      'mock-err',
        file:    new File([new Uint8Array(12 * 1024 * 1024)], 'huge-scan.png', { type:'image/png' }),
        error:   'File too large (max 5.0 MB)',
      },
    ])

    return (
      <div style={{ maxWidth: 480 }}>
        <FileUpload
          multiple
          accept="image/*,.pdf"
          maxSize={5 * 1024 * 1024}
          label="Controlled file list"
          hint="Pre-populated with 2 valid + 1 oversized file"
          files={files}
          onFilesChange={setFiles}
        />
      </div>
    )
  },
}
