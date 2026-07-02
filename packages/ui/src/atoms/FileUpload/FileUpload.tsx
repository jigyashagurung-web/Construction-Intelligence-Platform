import * as React from 'react'
import { Upload, X, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Button } from '../Button'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FileEntry {
  id:       string
  file:     File
  preview?: string    // objectURL for images
  error?:   string    // validation error message
}

export interface FileUploadProps {
  /** Accepted MIME types / extensions, e.g. ".pdf,image/*" */
  accept?:         string
  multiple?:       boolean
  /** Max file size in bytes. Default: 10 MB */
  maxSize?:        number
  /** Max total files when multiple=true. Default: unlimited */
  maxFiles?:       number
  files?:          FileEntry[]
  onFilesChange?:  (files: FileEntry[]) => void
  label?:          string
  hint?:           string
  /** External validation error shown below the drop zone */
  error?:          string
  disabled?:       boolean
  /** Render a compact button instead of the full drop zone */
  compact?:        boolean
  className?:      string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024)         return `${bytes} B`
  if (bytes < 1024 * 1024)  return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isImage(file: File): boolean {
  return file.type.startsWith('image/')
}

function validateFile(file: File, accept: string | undefined, maxSize: number): string | undefined {
  if (file.size > maxSize) return `File too large (max ${formatBytes(maxSize)})`
  if (accept) {
    const types = accept.split(',').map((t) => t.trim().toLowerCase())
    const matches = types.some((t) => {
      if (t.startsWith('.')) return file.name.toLowerCase().endsWith(t)
      if (t.endsWith('/*')) return file.type.startsWith(t.slice(0, -1))
      return file.type === t
    })
    if (!matches) return `File type not accepted`
  }
  return undefined
}

function buildEntries(files: File[], accept: string | undefined, maxSize: number): FileEntry[] {
  return files.map((file) => {
    const error   = validateFile(file, accept, maxSize)
    const preview = !error && isImage(file) ? URL.createObjectURL(file) : undefined
    return { id: `${file.name}-${file.size}-${file.lastModified}`, file, preview, error }
  })
}

// ── File row ──────────────────────────────────────────────────────────────────

function FileRow({ entry, onRemove }: { entry: FileEntry; onRemove: () => void }) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border px-3 py-2',
        entry.error ? 'border-[--color-danger-border] bg-[--color-danger-surface]' : 'border-[--border-default] bg-[--surface-input]',
      )}
    >
      {/* Thumbnail or icon */}
      <div className="h-9 w-9 shrink-0 rounded overflow-hidden flex items-center justify-center bg-[--surface-hover]">
        {entry.preview ? (
          <img src={entry.preview} alt={entry.file.name} className="h-full w-full object-cover" />
        ) : entry.error ? (
          <AlertCircle className="h-4 w-4 text-[--color-danger-icon]" aria-hidden />
        ) : isImage(entry.file) ? (
          <ImageIcon className="h-4 w-4 text-[--text-tertiary]" aria-hidden />
        ) : (
          <FileText className="h-4 w-4 text-[--text-tertiary]" aria-hidden />
        )}
      </div>

      {/* Name + meta */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[--text-primary]">{entry.file.name}</p>
        {entry.error ? (
          <p className="text-xs text-[--color-danger-text]">{entry.error}</p>
        ) : (
          <p className="text-xs text-[--text-secondary]">{formatBytes(entry.file.size)}</p>
        )}
      </div>

      {/* Remove */}
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded p-1 text-[--text-tertiary] hover:bg-[--surface-hover] hover:text-[--text-primary] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[--action-primary-bg]"
        aria-label={`Remove ${entry.file.name}`}
      >
        <X className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
  ({
    accept, multiple = false, maxSize = 10 * 1024 * 1024, maxFiles,
    files: controlledFiles, onFilesChange,
    label, hint, error, disabled = false, compact = false, className,
  }, ref) => {
    const inputRef  = React.useRef<HTMLInputElement>(null)
    const [dragging, setDragging] = React.useState(false)

    const isControlled = controlledFiles !== undefined
    const [internalFiles, setInternalFiles] = React.useState<FileEntry[]>([])
    const files = isControlled ? controlledFiles : internalFiles

    function setFiles(next: FileEntry[]) {
      if (!isControlled) setInternalFiles(next)
      onFilesChange?.(next)
    }

    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)

    function addFiles(rawFiles: FileList | null) {
      if (!rawFiles || disabled) return
      const incoming = Array.from(rawFiles)
      const limit    = maxFiles ?? Infinity
      const slots    = limit - files.filter((f) => !f.error).length
      const toAdd    = multiple ? incoming.slice(0, Math.max(0, slots)) : incoming.slice(0, 1)
      const entries  = buildEntries(toAdd, accept, maxSize)
      setFiles(multiple ? [...files, ...entries] : entries)
    }

    function removeFile(id: string) {
      const next = files.filter((f) => f.id !== id)
      // Revoke objectURLs for removed images
      const removed = files.find((f) => f.id === id)
      if (removed?.preview) URL.revokeObjectURL(removed.preview)
      setFiles(next)
    }

    const hasError  = Boolean(error)
    const limitHit  = maxFiles !== undefined && files.filter((f) => !f.error).length >= maxFiles

    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        {label && (
          <span className="text-sm font-medium text-[--text-label]">{label}</span>
        )}

        {compact ? (
          /* Compact mode: just a button */
          <Button
            type="button"
            variant="secondary"
            size="sm"
            iconLeft={<Upload className="h-3.5 w-3.5" />}
            disabled={disabled || limitHit}
            onClick={() => inputRef.current?.click()}
          >
            {multiple ? 'Upload files' : 'Upload file'}
          </Button>
        ) : (
          /* Drop zone */
          <div
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-label={`${label ?? 'File upload'} — drag and drop or click to browse`}
            aria-disabled={disabled}
            onClick={() => !disabled && !limitHit && inputRef.current?.click()}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); !disabled && !limitHit && inputRef.current?.click() } }}
            onDragOver={(e)  => { e.preventDefault(); if (!disabled && !limitHit) setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
            className={cn(
              'flex flex-col items-center justify-center gap-2 rounded-[--card-radius]',
              'border-2 border-dashed transition-[border-color,background] cursor-pointer',
              'py-8 px-6 text-center select-none focus:outline-none',
              'focus-visible:ring-2 focus-visible:ring-[--action-primary-bg] focus-visible:ring-offset-2',
              dragging
                ? 'border-[--action-primary-bg] bg-[--surface-hover]'
                : hasError
                  ? 'border-[--color-danger-border]'
                  : limitHit
                    ? 'border-[--border-subtle] cursor-default opacity-50'
                    : 'border-[--border-default] hover:border-[--action-primary-bg] hover:bg-[--surface-hover]',
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            <Upload className="h-7 w-7 text-[--text-tertiary]" aria-hidden />
            <div>
              <p className="text-sm font-medium text-[--text-primary]">
                {dragging ? 'Drop to upload' : limitHit ? 'File limit reached' : 'Drag & drop or click to browse'}
              </p>
              {!limitHit && (
                <p className="mt-0.5 text-xs text-[--text-secondary]">
                  {[
                    accept && `Accepted: ${accept}`,
                    `Max ${formatBytes(maxSize)}`,
                    maxFiles && `Up to ${maxFiles} file${maxFiles > 1 ? 's' : ''}`,
                  ].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          style={{ display: 'none' }}
          onChange={(e) => addFiles(e.target.files)}
          aria-hidden
        />

        {/* File list */}
        {files.length > 0 && (
          <div className="flex flex-col gap-2 mt-1">
            {files.map((entry) => (
              <FileRow key={entry.id} entry={entry} onRemove={() => removeFile(entry.id)} />
            ))}
          </div>
        )}

        {(hint || error) && (
          <p className={cn('text-xs', error ? 'text-[--color-danger-text]' : 'text-[--text-secondary]')}>
            {error ?? hint}
          </p>
        )}
      </div>
    )
  }
)
FileUpload.displayName = 'FileUpload'

export { FileUpload }
