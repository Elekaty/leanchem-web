import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { DocumentIcon, UploadIcon } from './Icons'

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
      <div
        className="flex items-center gap-3 rounded-lg border-2 border-success bg-success/5 px-4 py-3"
        role="status"
      >
        <DocumentIcon className="text-success" />
        <div>
          <p className="text-sm font-bold text-success">{kind} receipt locked</p>
          <p className="text-xs text-velvet/65">
            {fileName} · {uploadedAt}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div
        className={`cursor-pointer rounded-lg border-2 border-dashed bg-[#F1F5F9] px-4 py-8 text-center transition ${
          dragging ? 'border-adamantine bg-adamantine/10' : 'border-organza/60'
        } ${error ? 'border-error' : ''}`}
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
        <UploadIcon className="mx-auto text-lapis" width={40} height={40} />
        <p className="mt-2 text-sm font-semibold text-velvet">
          {pending ? 'Securing file…' : 'Drop file or click to upload'}
        </p>
        <p className="mt-1 text-xs text-velvet/55">
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
        <p className="mt-2 text-sm font-semibold text-error" aria-live="assertive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
