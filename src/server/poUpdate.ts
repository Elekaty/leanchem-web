import { Resend } from 'resend'
import { getSupabaseServer } from '../lib/supabase'

export const LOGISTICS_STAGES = [
  'Origin Port',
  'Ocean Transit',
  'Djibouti Customs',
  'Modjo Dry Port',
  'Addis Delivery',
] as const

export type LogisticsStage = (typeof LOGISTICS_STAGES)[number]

export interface PoUpdateSuccess {
  success: true
  poId: string
  poNumber: string | null
  currentStage: string
  lastUpdated: string
  buyerEmail: string
}

function isValidStage(value: string): value is LogisticsStage {
  return (LOGISTICS_STAGES as readonly string[]).includes(value)
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Loop C: update PO stage + email buyer via Resend. */
export async function processPoUpdate(body: unknown): Promise<
  | { status: 200; payload: PoUpdateSuccess }
  | { status: 400 | 404 | 500; payload: { success: false; error: string } }
> {
  if (!body || typeof body !== 'object') {
    return { status: 400, payload: { success: false, error: 'Invalid JSON body.' } }
  }

  const record = body as Record<string, unknown>
  const poId = String(record.poId ?? record.id ?? '').trim()
  const stage = String(record.stage ?? record.current_stage ?? '').trim()

  if (!poId) {
    return { status: 400, payload: { success: false, error: 'poId is required.' } }
  }
  if (!stage || !isValidStage(stage)) {
    return {
      status: 400,
      payload: {
        success: false,
        error: `stage must be one of: ${LOGISTICS_STAGES.join(', ')}`,
      },
    }
  }

  const supabase = getSupabaseServer()
  if (!supabase) {
    return {
      status: 500,
      payload: { success: false, error: 'Supabase is not configured on the server.' },
    }
  }

  const { data: existing, error: fetchError } = await supabase
    .from('purchase_orders')
    .select('id, po_number, buyer_email, current_stage')
    .eq('id', poId)
    .maybeSingle()

  if (fetchError) {
    console.error('[po/update] fetch failed:', fetchError)
    return {
      status: 500,
      payload: { success: false, error: fetchError.message || 'Failed to load purchase order.' },
    }
  }
  if (!existing) {
    return { status: 404, payload: { success: false, error: 'Purchase order not found.' } }
  }

  const lastUpdated = new Date().toISOString()
  const { data: updated, error: updateError } = await supabase
    .from('purchase_orders')
    .update({ current_stage: stage, last_updated: lastUpdated })
    .eq('id', poId)
    .select('id, po_number, buyer_email, current_stage, last_updated')
    .single()

  if (updateError || !updated) {
    console.error('[po/update] update failed:', updateError)
    return {
      status: 500,
      payload: {
        success: false,
        error: updateError?.message || 'Failed to update purchase order stage.',
      },
    }
  }

  const displayId = updated.po_number || updated.id
  const buyerEmail = String(updated.buyer_email ?? '').trim()
  const apiKey = process.env.RESEND_API_KEY

  if (buyerEmail && apiKey) {
    const from = process.env.RESEND_FROM_EMAIL || 'LeanChem <onboarding@resend.dev>'
    const subject = `LeanChem Logistics Update: PO #${displayId}`
    const bodyText = [
      `Your purchase order has moved to a new stage: ${stage}.`,
      'You can track this live in your client portal.',
    ].join(' ')
    const html = `
      <div style="font-family:Montserrat,Arial,sans-serif;color:#222235;line-height:1.55">
        <p>Your purchase order <strong>#${escapeHtml(String(displayId))}</strong> has moved to a new stage:</p>
        <p style="font-size:18px;font-weight:700;color:#1E5897">${escapeHtml(stage)}</p>
        <p>You can track this live in your client portal.</p>
      </div>
    `

    try {
      const resend = new Resend(apiKey)
      const { error: emailError } = await resend.emails.send({
        from,
        to: buyerEmail,
        subject,
        html,
        text: bodyText,
      })
      if (emailError) {
        console.error('[po/update] Resend error:', emailError)
        // Stage already saved — return success with warning-style note in logs only.
      }
    } catch (err) {
      console.error('[po/update] Resend exception:', err)
    }
  } else if (!apiKey) {
    console.warn('[po/update] RESEND_API_KEY missing — stage updated without email.')
  }

  return {
    status: 200,
    payload: {
      success: true,
      poId: updated.id,
      poNumber: updated.po_number ?? null,
      currentStage: updated.current_stage,
      lastUpdated: updated.last_updated,
      buyerEmail,
    },
  }
}
