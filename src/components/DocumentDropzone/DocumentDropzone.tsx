import { useRef, useState, type DragEvent, type ChangeEvent } from 'react'
import { DocumentIcon, UploadIcon } from '../Icons'
import './DocumentDropzone.css'

interface DocumentDropzoneProps {
  acceptedFileTypes?: string[]
  maxSizeMB?: number
  onError?: (message: string) => void
  onSuccess?: (file: File) => void | Promise<void>
}

const DEFAULT_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
const EXT_LABEL = 'PDF, JPG, PNG'

export function DocumentDropzone({
  acceptedFileTypes = DEFAULT_TYPES,
  maxSizeMB = 5,
  onError,
  onSuccess,
}: DocumentDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [uploadedAt, setUploadedAt] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [pending, setPending] = useState(false)

  const reject = (message: string) => {
    setError(message)
    setFileName(null)
    setUploadedAt(null)
    onError?.(message)
  }

  const validate = async (file: File) => {
    if (!acceptedFileTypes.includes(file.type)) {
      reject(`File type not accepted. Upload ${EXT_LABEL} only.`)
      return
    }
    const maxBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxBytes) {
      reject(`File exceeds ${maxSizeMB}MB limit.`)
      return
    }
    setError(null)
    setPending(true)
    try {
      await onSuccess?.(file)
      setFileName(file.name)
      setUploadedAt(
        new Intl.DateTimeFormat('en-GB', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(new Date()),
      )
    } catch (err) {
      reject(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setPending(false)
    }
  }

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) void validate(file)
  }

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) void validate(file)
    event.target.value = ''
  }

  if (fileName && uploadedAt) {
    const kind = fileName.toLowerCase().endsWith('.pdf') ? 'PDF' : 'Image'
    return (
      <div className="vault-locked" role="status">
        <DocumentIcon />
        <div>
          <p className="vault-locked__title">{kind} receipt locked</p>
          <p className="vault-locked__meta">
            {fileName} · {uploadedAt}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="dropzone-wrap">
      <div
        className={`dropzone ${dragging ? 'is-dragging' : ''} ${error ? 'has-error' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        aria-label="Upload document dropzone"
      >
        <UploadIcon width={40} height={40} />
        <p className="dropzone__title">
          {pending ? 'Securing file…' : 'Drop file or click to upload'}
        </p>
        <p className="dropzone__hint">
          {EXT_LABEL} · max {maxSizeMB}MB
        </p>
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          onChange={onChange}
        />
      </div>
      {error ? (
        <p className="dropzone__error" aria-live="assertive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function EmptyDocumentVault() {
  return (
    <div className="empty-vault">
      <svg viewBox="0 0 24 24" width="36" height="36" fill="none" aria-hidden="true">
        <path
          d="M7 3.5h7l4 4V20.5H7V3.5Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <path d="M14 3.5v4h4" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
        <path d="M4 20 20 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
      <p className="empty-vault__title">No documents currently attached.</p>
      <p className="empty-vault__hint">Contact sales if documentation is required.</p>
    </div>
  )
}
