import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Breadcrumbs } from '../components/Breadcrumbs/Breadcrumbs'
import { ApiClientError } from '../api/client'
import { fetchProduct, submitRfq } from '../api/leanchem'
import { SITE } from '../data/marketing'
import { MOCK_PRODUCTS } from '../data/mockProducts'
import './ContactPage.css'

export function ContactPage() {
  const [params] = useSearchParams()
  const productParam = params.get('product') ?? ''
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resolvedSlug, setResolvedSlug] = useState(productParam)
  const [form, setForm] = useState({
    company: '',
    contactName: '',
    email: '',
    phone: '',
    product: productParam,
    cas: params.get('cas') ?? '',
    volume: '',
    deliveryTerms: 'CIF Djibouti',
    market: params.get('market') ?? '',
    intent: (params.get('intent') as 'quote' | 'sample' | null) ?? 'quote',
    notes: '',
  })

  useEffect(() => {
    if (!productParam) return
    let cancelled = false
    ;(async () => {
      try {
        const detail = await fetchProduct(productParam)
        if (cancelled) return
        setResolvedSlug(detail.slug ?? productParam)
        setForm((prev) => ({
          ...prev,
          product: detail.name,
          cas: detail.cas_number ?? prev.cas,
        }))
      } catch {
        const mock = MOCK_PRODUCTS.find(
          (p) => p.slug === productParam || p.id === productParam,
        )
        if (!cancelled && mock) {
          setResolvedSlug(mock.slug)
          setForm((prev) => ({
            ...prev,
            product: mock.name,
            cas: mock.casNumber,
          }))
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [productParam])

  const title = useMemo(
    () => (form.intent === 'sample' ? 'Request a sample' : 'Request a quote'),
    [form.intent],
  )

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await submitRfq({
        company_name: form.company,
        contact_name: form.contactName,
        email: form.email,
        phone: form.phone || undefined,
        product_slug: resolvedSlug || undefined,
        product_name: form.product || undefined,
        cas_number: form.cas || undefined,
        volume_text: form.volume,
        delivery_terms: form.deliveryTerms,
        market: form.market || undefined,
        intent: form.intent === 'sample' ? 'sample' : 'quote',
        notes: form.notes || undefined,
      })
      setSubmitted(true)
    } catch (err) {
      // Still confirm locally if API is offline so the marketing funnel is not blocked.
      if (err instanceof ApiClientError) {
        setError(err.message)
      } else {
        setSubmitted(true)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="contact-page">
      <div className="contact-page__wrap">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Contact' }]} />
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">
          Public RFQ route — no modal. Company, product, volume, and delivery terms. Or email{' '}
          <a href={`mailto:${SITE.emails.commercial}`}>{SITE.emails.commercial}</a>.
        </p>

        {submitted ? (
          <div className="contact-success" role="status">
            <h2>RFQ received</h2>
            <p>
              Thanks — a LeanChem commercial specialist will follow up on{' '}
              {form.product || 'your request'} shortly. Status: request_submitted.
            </p>
          </div>
        ) : (
          <form className="contact-form" onSubmit={(e) => void onSubmit(e)}>
            <div className="contact-form__grid">
              <label>
                Company
                <input
                  required
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                />
              </label>
              <label>
                Contact name
                <input
                  required
                  value={form.contactName}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                />
              </label>
              <label>
                Work email
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </label>
              <label>
                Phone
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </label>
              <label>
                Product / grade
                <input
                  required
                  value={form.product}
                  onChange={(e) => setForm({ ...form, product: e.target.value })}
                />
              </label>
              <label>
                CAS number
                <input
                  value={form.cas}
                  onChange={(e) => setForm({ ...form, cas: e.target.value })}
                />
              </label>
              <label>
                Volume / MOQ target
                <input
                  required
                  value={form.volume}
                  onChange={(e) => setForm({ ...form, volume: e.target.value })}
                  placeholder="e.g. 4 × 200 L drums / month"
                />
              </label>
              <label>
                Delivery terms
                <select
                  value={form.deliveryTerms}
                  onChange={(e) => setForm({ ...form, deliveryTerms: e.target.value })}
                >
                  <option>CIF Djibouti</option>
                  <option>CFR Djibouti</option>
                  <option>DAP Addis Ababa</option>
                  <option>Ex Works</option>
                  <option>Other / to discuss</option>
                </select>
              </label>
            </div>
            <label className="contact-form__notes">
              Notes for technical / commercial review
              <textarea
                rows={5}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Application, packaging constraints, required documents…"
              />
            </label>
            {error ? (
              <p className="contact-form__error" role="alert">
                {error}
              </p>
            ) : null}
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit RFQ'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
