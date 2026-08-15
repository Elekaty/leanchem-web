import { Resend } from 'resend'
import { getSupabaseServer } from '../lib/supabase'

export interface SourcingRequestBody {
  rfqId: string
}

export interface SourcingSuccess {
  success: true
  rfqId: string
  status: string
  supplierCount: number
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatItemsList(
  items: Array<{ name?: string; casNumber?: string; quantity?: string }>,
): string {
  if (!items.length) return 'No chemical lines listed.'
  return items
    .map((item) => {
      const cas = item.casNumber ? ` (CAS ${item.casNumber})` : ''
      const qty = item.quantity ? ` — ${item.quantity}` : ''
      return `${item.name ?? 'Unknown chemical'}${cas}${qty}`
    })
    .join('; ')
}

/** Loop B: blast anonymized RFQ to suppliers via Resend BCC. */
export async function processSourcingRequest(body: unknown): Promise<
  | { status: 200; payload: SourcingSuccess }
  | { status: 400 | 404 | 500; payload: { success: false; error: string } }
> {
  if (!body || typeof body !== 'object') {
    return { status: 400, payload: { success: false, error: 'Invalid JSON body.' } }
  }

  const rfqId = String((body as Record<string, unknown>).rfqId ?? '').trim()
  if (!rfqId) {
    return { status: 400, payload: { success: false, error: 'rfqId is required.' } }
  }

  const supabase = getSupabaseServer()
  if (!supabase) {
    return {
      status: 500,
      payload: { success: false, error: 'Supabase is not configured on the server.' },
    }
  }

  const { data: rfq, error: rfqError } = await supabase
    .from('rfqs')
    .select(
      'id, reference, volume, unit, packaging, incoterms, target_delivery_date, items, status',
    )
    .eq('id', rfqId)
    .maybeSingle()

  if (rfqError) {
    console.error('[sourcing/request] RFQ fetch failed:', rfqError)
    return {
      status: 500,
      payload: { success: false, error: rfqError.message || 'Failed to load RFQ.' },
    }
  }

  if (!rfq) {
    return { status: 404, payload: { success: false, error: 'RFQ not found.' } }
  }

  // Explicitly strip buyer fields — never include contact/company/email/phone.
  const items = Array.isArray(rfq.items) ? rfq.items : []
  const volume = `${rfq.volume} ${rfq.unit}`
  const packaging = String(rfq.packaging ?? '')
  const targetDelivery = rfq.target_delivery_date
    ? String(rfq.target_delivery_date)
    : 'Not specified'
  const itemList = formatItemsList(items)

  const { data: suppliers, error: suppliersError } = await supabase
    .from('suppliers')
    .select('email, name')
    .eq('active', true)

  if (suppliersError) {
    console.error('[sourcing/request] Suppliers fetch failed:', suppliersError)
    return {
      status: 500,
      payload: {
        success: false,
        error: suppliersError.message || 'Failed to load suppliers.',
      },
    }
  }

  const emails = (suppliers ?? [])
    .map((s) => String(s.email ?? '').trim())
    .filter(Boolean)

  if (emails.length === 0) {
    return {
      status: 400,
      payload: {
        success: false,
        error: 'No active supplier emails found in the suppliers table.',
      },
    }
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return {
      status: 500,
      payload: { success: false, error: 'RESEND_API_KEY is not configured.' },
    }
  }

  const from = process.env.RESEND_FROM_EMAIL || 'LeanChem <onboarding@resend.dev>'
  const replyTo = process.env.RESEND_REPLY_TO || process.env.SOURCING_REPLY_TO
  const subject = `LeanChem RFQ: Pricing Request for ${volume} of Chemical Items`
  const bodyText = [
    'Please provide CIF Djibouti pricing for the following items:',
    itemList,
    '',
    `Required packaging: ${packaging}`,
    `Target delivery: ${targetDelivery}`,
    `Incoterms preference: ${rfq.incoterms ?? '—'}`,
    '',
    'Please reply directly to this email with your quote.',
    '',
    'Note: Buyer identity is confidential and has been withheld from this request.',
  ].join('\n')

  const html = `
    <div style="font-family:Montserrat,Arial,sans-serif;color:#222235;line-height:1.55">
      <p>Please provide <strong>CIF Djibouti</strong> pricing for the following items:</p>
      <p><strong>${escapeHtml(itemList)}</strong></p>
      <ul>
        <li><strong>Required packaging:</strong> ${escapeHtml(packaging)}</li>
        <li><strong>Target delivery:</strong> ${escapeHtml(targetDelivery)}</li>
        <li><strong>Incoterms preference:</strong> ${escapeHtml(String(rfq.incoterms ?? '—'))}</li>
      </ul>
      <p>Please reply directly to this email with your quote.</p>
      <p style="color:#7B8DC6;font-size:13px">
        Buyer details are confidential and have been withheld from this request.
      </p>
    </div>
  `

  const resend = new Resend(apiKey)
  const { error: emailError } = await resend.emails.send({
    from,
    to: from.includes('<') ? from.replace(/^.*<([^>]+)>.*$/, '$1') : from,
    bcc: emails,
    subject,
    html,
    text: bodyText,
    ...(replyTo ? { replyTo } : {}),
  })

  if (emailError) {
    console.error('[sourcing/request] Resend error:', emailError)
    return {
      status: 500,
      payload: {
        success: false,
        error: emailError.message || 'Failed to send supplier pricing email.',
      },
    }
  }

  const { error: updateError } = await supabase
    .from('rfqs')
    .update({ status: 'under_review' })
    .eq('id', rfqId)

  if (updateError) {
    console.error('[sourcing/request] Status update failed:', updateError)
    return {
      status: 500,
      payload: {
        success: false,
        error:
          'Supplier email sent, but RFQ status update failed: ' + updateError.message,
      },
    }
  }

  return {
    status: 200,
    payload: {
      success: true,
      rfqId,
      status: 'under_review',
      supplierCount: emails.length,
    },
  }
}
