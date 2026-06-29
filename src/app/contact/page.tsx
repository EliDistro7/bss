'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLang } from '../../lib/i18n/LanguageContext'

const WHATSAPP_NUMBER = '255617833806'

type FormData = {
  name: string
  email: string
  service: string
  message: string
}

const SERVICE_KEYS = ['profile', 'website', 'app', 'card', 'proposal'] as const

export default function ContactPage() {
  const { t } = useLang()
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    // TODO: wire up to Resend / EmailJS / your preferred email API
    // Example with Resend:
    // await fetch('/api/contact', { method: 'POST', body: JSON.stringify(data) })
    console.log('Form submission:', data)
    await new Promise(r => setTimeout(r, 800)) // simulate network
    setSent(true)
    reset()
  }

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello BSS, I would like to enquire about your services.')}`

  return (
    <>
      {/* ── HEADER ───────────────────────────────────────── */}
      <section className="pt-36 pb-16 border-b border-bss-border">
        <div className="container-site">
          <p className="eyebrow">{t.contact.eyebrow}</p>
          <h1 className="display-xl max-w-xl mb-6">{t.contact.headline}</h1>
          <p className="body-lead max-w-prose">{t.contact.body}</p>
        </div>
      </section>

      {/* ── MAIN CONTENT ─────────────────────────────────── */}
      <section className="section-pad">
        <div className="container-site">
          <div className="grid md:grid-cols-2 gap-16 lg:gap-24">

            {/* Form */}
            <div>
              {sent ? (
                <div className="py-12">
                  <p className="font-display text-2xl font-bold text-bss-white mb-3">{t.contact.formSuccess}</p>
                  <button
                    onClick={() => setSent(false)}
                    className="text-xs tracking-wider uppercase font-medium text-bss-muted hover:text-bss-white transition-colors"
                  >
                    ← Send another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
                  {/* Name */}
                  <div className="flex flex-col gap-2">
                    <label className="eyebrow">{t.contact.formName}</label>
                    <input
                      type="text"
                      placeholder="e.g. John Mwangi"
                      className={`
                        w-full bg-transparent border-b py-3 text-sm font-body text-bss-white placeholder-bss-muted
                        outline-none transition-colors duration-200
                        ${errors.name ? 'border-red-500' : 'border-bss-border focus:border-bss-subtle'}
                      `}
                      {...register('name', { required: true })}
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-2">
                    <label className="eyebrow">{t.contact.formEmail}</label>
                    <input
                      type="email"
                      placeholder="you@company.com"
                      className={`
                        w-full bg-transparent border-b py-3 text-sm font-body text-bss-white placeholder-bss-muted
                        outline-none transition-colors duration-200
                        ${errors.email ? 'border-red-500' : 'border-bss-border focus:border-bss-subtle'}
                      `}
                      {...register('email', { required: true, pattern: /^\S+@\S+\.\S+$/ })}
                    />
                  </div>

                  {/* Service dropdown */}
                  <div className="flex flex-col gap-2">
                    <label className="eyebrow">{t.contact.formService}</label>
                    <select
                      className={`
                        w-full bg-bss-black border-b py-3 text-sm font-body text-bss-white
                        outline-none transition-colors duration-200 cursor-pointer appearance-none
                        ${errors.service ? 'border-red-500' : 'border-bss-border focus:border-bss-subtle'}
                      `}
                      {...register('service', { required: true })}
                      defaultValue=""
                    >
                      <option value="" disabled className="text-bss-muted">Select a service</option>
                      {SERVICE_KEYS.map((key) => (
                        <option key={key} value={key} className="bg-bss-surface">
                          {t.services.tabs[key]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message */}
                  <div className="flex flex-col gap-2">
                    <label className="eyebrow">{t.contact.formMessage}</label>
                    <textarea
                      rows={5}
                      placeholder="Tell us what you need and when."
                      className={`
                        w-full bg-transparent border-b py-3 text-sm font-body text-bss-white placeholder-bss-muted
                        outline-none transition-colors duration-200 resize-none
                        ${errors.message ? 'border-red-500' : 'border-bss-border focus:border-bss-subtle'}
                      `}
                      {...register('message', { required: true })}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary self-start disabled:opacity-50 disabled:cursor-wait"
                  >
                    {isSubmitting ? 'Sending...' : t.contact.formSubmit}
                  </button>
                </form>
              )}
            </div>

            {/* Info panel */}
            <div className="flex flex-col gap-10">
              {/* WhatsApp CTA */}
              <div className="border border-bss-border p-8">
                <p className="eyebrow mb-3">{t.contact.whatsappLabel}</p>
                <p className="body-base mb-6">Prefer a quick chat? Message us directly and we'll reply fast.</p>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex"
                >
                  {t.contact.whatsappLabel} →
                </a>
              </div>

              {/* Office info */}
              <div className="border-t border-bss-border pt-8">
                <p className="eyebrow mb-3">{t.contact.officeLabel}</p>
                <a
                  href={`tel:${WHATSAPP_NUMBER}`}
                  className="font-display text-3xl font-bold text-bss-white hover:text-bss-offwhite transition-colors"
                >
                  {t.contact.officeNumber}
                </a>
                <p className="body-base mt-2">Dar es Salaam, Tanzania</p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  )
}
