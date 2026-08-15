import { useState } from 'react'
import type { ActionTaskType } from '../types/catalog'
import { DocumentDropzone } from './DocumentDropzone'

interface ActionHubCardProps {
  taskType: ActionTaskType
  orderId: string
  onAnnounce?: (message: string) => void
}

const TASK_COPY: Record<ActionTaskType, { title: string; body: string }> = {
  Upload_Receipt: {
    title: 'Upload proof of delivery receipt',
    body: 'Attach the carrier receipt to continue fulfillment.',
  },
  Sign_Doc: {
    title: 'Sign compliance acknowledgement',
    body: 'Review and confirm the destination handling declaration.',
  },
}

export function ActionHubCard({ taskType, orderId, onAnnounce }: ActionHubCardProps) {
  const copy = TASK_COPY[taskType]
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="rounded-lg border border-organza/35 bg-canvas p-4">
      <h3 className="text-sm font-bold text-velvet">{copy.title}</h3>
      <p className="mt-1 text-sm text-velvet/65">{copy.body}</p>
      {taskType === 'Upload_Receipt' ? (
        <div className="mt-3">
          <DocumentDropzone
            acceptedFileTypes={['application/pdf', 'image/jpeg', 'image/png']}
            maxSizeMB={5}
            onError={(message) => {
              setError(message)
              onAnnounce?.(message)
            }}
            onSuccess={async () => {
              setError(null)
              onAnnounce?.(`Receipt uploaded for ${orderId}`)
              await new Promise((r) => setTimeout(r, 200))
            }}
          />
        </div>
      ) : (
        <button type="button" className="btn btn-primary mt-3">
          Open Document to Sign
        </button>
      )}
      {error ? <p className="mt-2 text-sm text-error">{error}</p> : null}
    </div>
  )
}
