import { Resend } from 'resend'
import { getSupabaseServer } from '../lib/supabase'
import type { RfqSubmitRequest, RfqSubmitSuccess } from '../types/rfqSubmit'

const ADMIN_RFQ_URL = 'https://blank-slate-dashboard-plum.vercel.app/rfqs'

function generateReference(): string {
  const d = new Date()
  const y = d.getFullYear().toString().slice(2)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `LC-RFQ-${y}${m}${day}-${rand}`
}

function chemicalList(items: RfqSubmitRequest['items']): string {
  return items.map((i) => `${i.name} (CAS ${i.casNumber})`).join(', ')
}

function validatePayload(body: unknown): { ok: true; data: RfqSubmitRequest } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid JSON body.' }
  const b = body as Record<string, unknown>

  const contactName = String(b.contactName ?? '').trim()
  const companyName = String(b.companyName ?? '').trim()
  const email = String(b.email ?? '').trim()
  const phone = String(b.phone ?? '').trim()
  const volume = Number(b.volume)
  const unit = String(b.unit ?? '').trim()
  const packaging = String(b.packaging ?? '').trim()
  const incoterms = String(b.incoterms ?? '').trim()
  const targetDeliveryDate = String(b.targetDeliveryDate ?? '').trim()
  const items = Array.isArray(b.items) ? b.items : []

  if (!contactName) return { ok: false, error: 'Name is required.' }
  if (!companyName) return { ok: false, error: 'Company is required.' }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'A valid email is required.' }
  }
  if (!phone) return { ok: false, error: 'Phone is required.' }
  if (!Number.isFinite(volume) || volume <= 0) {
    return { ok: false, error: 'Volume must be greater than zero.' }
  }
  if (!unit) return { ok: false, error: 'Unit is required.' }
  if (!packaging) return { ok: false, error: 'Packaging is required.' }
  if (!incoterms) return { ok: false, error: 'Incoterms are required.' }
  if (!targetDeliveryDate) return { ok: false, error: 'Target delivery date is required.' }
  if (items.length === 0) return { ok: false, error: 'Cart must include at least one chemical.' }

  const normalizedItems = items.map((raw) => {
    const item = raw as Record<string, unknown>
    return {
      productId: String(item.productId ?? ''),
      slug: String(item.slug ?? ''),
      name: String(item.name ?? ''),
      casNumber: String(item.casNumber ?? ''),
      quantity: item.quantity != null ? String(item.quantity) : undefined,
      packaging: item.packaging != null ? String(item.packaging) : undefined,
      notes: item.notes != null ? String(item.notes) : undefined,
    }
  })

  if (normalizedItems.some((i) => !i.name || !i.casNumber)) {
    return { ok: false, error: 'Each cart item needs a name and CAS number.' }
  }

  return {
    ok: true,
    data: {
      contactName,
      companyName,
      email,
      phone,
      volume,
      unit,
      packaging,
      incoterms,
      targetDeliveryDate,
      items: normalizedItems,
    },
  }
}

async function sendBuyerConfirmationEmail(
  data: RfqSubmitRequest,
  reference: string,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[rfq/submit] RESEND_API_KEY missing — skipping buyer email.')
    return
  }

  const from = process.env.RESEND_FROM_EMAIL || 'LeanChem <onboarding@resend.dev>'
  const resend = new Resend(apiKey)
  const chemicals = chemicalList(data.items)

  const html = `
    <div style="font-family:Montserrat,Arial,sans-serif;color:#222235;line-height:1.5">
      <h2 style="color:#1E5897;margin:0 0 12px">RFQ received</h2>
      <p>Dear ${escapeHtml(data.contactName)},</p>
      <p>
        Thank you for your request. We confirm receipt of RFQ
        <strong>${escapeHtml(reference)}</strong> for
        <strong>${escapeHtml(data.companyName)}</strong>.
      </p>
      <p><strong>Chemicals:</strong> ${escapeHtml(chemicals)}</p>
      <p><strong>Total volume:</strong> ${escapeHtml(String(data.volume))} ${escapeHtml(data.unit)}</p>
      <p><strong>Packaging:</strong> ${escapeHtml(data.packaging)}</p>
      <p><strong>Incoterms:</strong> ${escapeHtml(data.incoterms)}</p>
      <p><strong>Target delivery:</strong> ${escapeHtml(data.targetDeliveryDate)}</p>
      <p>
        Technical sourcing is underway. A LeanChem specialist will follow up with
        availability, documentation, and commercial options.
      </p>
      <p style="color:#7B8DC6;font-size:13px">— LeanChem Commercial Desk</p>
    </div>
  `

  const { error } = await resend.emails.send({
    from,
    to: data.email,
    subject: `LeanChem RFQ Confirmation — Reference #${reference}`,
    html,
  })

  if (error) {
    console.error('[rfq/submit] Resend error:', error)
  }
}

async function sendTelegramAlert(
  data: RfqSubmitRequest,
  reference: string,
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) {
    console.warn('[rfq/submit] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID missing — skipping alert.')
    return
  }

  const items = data.items.map((i) => `• ${i.name} (CAS ${i.casNumber})`).join('\n')
  const text = [
    '🚨 *New Inbound RFQ Received*',
    `*Ref:* \`${reference}\``,
    `*Company:* ${escapeMarkdown(data.companyName)} (${escapeMarkdown(data.contactName)})`,
    `*Email:* ${escapeMarkdown(data.email)}`,
    `*Phone:* ${escapeMarkdown(data.phone)}`,
    `*Volume:* ${data.volume} ${escapeMarkdown(data.unit)}`,
    `*Incoterms:* ${escapeMarkdown(data.incoterms)} | *Packaging:* ${escapeMarkdown(data.packaging)}`,
    `*Target delivery:* ${escapeMarkdown(data.targetDeliveryDate)}`,
    `*Items:*\n${items}`,
    `👉 [View in Admin Dashboard](${ADMIN_RFQ_URL})`,
  ].join('\n')

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    console.error('[rfq/submit] Telegram error:', res.status, body)
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escapeMarkdown(value: string): string {
  return value.replace(/([_*`\[\]])/g, '\\$1')
}

/** Core Loop A submit: validate → insert `rfqs` → email + Telegram. */
export async function processRfqSubmit(body: unknown): Promise<
  | { status: 200; payload: RfqSubmitSuccess }
  | { status: 400 | 500; payload: { success: false; error: string } }
> {
  const parsed = validatePayload(body)
  if (!parsed.ok) {
    return { status: 400, payload: { success: false, error: parsed.error } }
  }

  const data = parsed.data
  const supabase = getSupabaseServer()
  if (!supabase) {
    return {
      status: 500,
      payload: { success: false, error: 'Supabase is not configured on the server.' },
    }
  }

  const reference = generateReference()
  const { data: row, error } = await supabase
    .from('rfqs')
    .insert({
      reference,
      contact_name: data.contactName,
      company_name: data.companyName,
      email: data.email,
      phone: data.phone,
      volume: data.volume,
      unit: data.unit,
      packaging: data.packaging,
      incoterms: data.incoterms,
      target_delivery_date: data.targetDeliveryDate,
      items: data.items,
      status: 'pending',
    })
    .select('id, reference')
    .single()

  if (error || !row) {
    console.error('[rfq/submit] Supabase insert failed:', error)
    return {
      status: 500,
      payload: {
        success: false,
        error: error?.message || 'Unable to save RFQ. Please try again.',
      },
    }
  }

  // Notifications — do not fail the request if they error after a successful insert.
  await Promise.allSettled([
    sendBuyerConfirmationEmail(data, row.reference ?? reference),
    sendTelegramAlert(data, row.reference ?? reference),
  ])

  return {
    status: 200,
    payload: {
      success: true,
      rfqId: String(row.id),
      reference: String(row.reference ?? reference),
    },
  }
}
