import type { ActionTaskType } from '../../types'
import { DocumentDropzone } from '../DocumentDropzone/DocumentDropzone'
import { uploadDocument } from '../../api/leanchem'
import { ApiClientError } from '../../api/client'
import { useState } from 'react'
import './ActionHubCard.css'

interface ActionHubCardProps {
  taskType: ActionTaskType
  isExpanded: boolean
  orderId?: string
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

export function ActionHubCard({ taskType, isExpanded, orderId }: ActionHubCardProps) {
  const copy = TASK_COPY[taskType]
  const [error, setError] = useState<string | null>(null)

  return (
    <div className={`action-hub ${isExpanded ? 'is-expanded' : ''}`} aria-hidden={!isExpanded}>
      <div className="action-hub__inner">
        <h3 className="action-hub__title">{copy.title}</h3>
        <p className="action-hub__body">{copy.body}</p>
        {taskType === 'Upload_Receipt' ? (
          <DocumentDropzone
            acceptedFileTypes={['application/pdf', 'image/jpeg', 'image/png']}
            maxSizeMB={5}
            onError={setError}
            onSuccess={async (file) => {
              if (!orderId) {
                throw new Error('Order context missing.')
              }
              const form = new FormData()
              form.append('file', file)
              form.append('entity_type', 'order')
              form.append('entity_id', orderId)
              form.append('document_type', 'payment_receipt')
              try {
                await uploadDocument(form)
              } catch (err) {
                throw new Error(err instanceof ApiClientError ? err.message : 'Upload failed.')
              }
            }}
          />
        ) : (
          <button type="button" className="btn btn-primary">
            Open Document to Sign
          </button>
        )}
        {error ? <p className="action-hub__status">{error}</p> : null}
      </div>
    </div>
  )
}
