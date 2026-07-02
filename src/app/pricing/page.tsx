'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLang } from '../../lib/i18n/LanguageContext'
import clsx from 'clsx'

type PriceRow = {
  service: string
  scope: string
  price: string
  note?: string
}

export default function PricingPage() {
  const { t, locale } = useLang()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  function s(en: string, sw: string) {
    return locale === 'sw' ? sw : en
  }

  const rows: PriceRow[] = [
    { service: t.services.tabs.profile,  scope: s('Up to 20 pages',          'Hadi kurasa 20'),              price: 'TZS 100,000' },
    { service: t.services.tabs.profile,  scope: s('21 – 30 pages',           'Kurasa 21 – 30'),              price: 'TZS 150,000' },
    { service: t.services.tabs.profile,  scope: s('31 – 40 pages',           'Kurasa 31 – 40'),              price: 'TZS 200,000' },
    { service: t.services.tabs.profile,  scope: s('41 – 50 pages',           'Kurasa 41 – 50'),              price: 'TZS 250,000' },
    { service: t.services.tabs.profile,  scope: s('51+ pages',               'Kurasa 51+'),                  price: 'TZS 300,000+', note: '+50k / 10 pages' },
    { service: t.services.tabs.website,  scope: s('Static site',             'Tovuti ya kimya'),             price: 'TZS 100,000' },
    { service: t.services.tabs.website,  scope: s('Dynamic system',          'Mfumo wa nguvu'),              price: 'TZS 150,000+' },
    { service: t.services.tabs.app,      scope: s('Android / iOS',           'Android / iOS'),               price: t.common.quoteOnRequest },
    { service: t.services.tabs.card,     scope: s('Standard / premium',      'Kawaida / ya hali ya juu'),    price: t.common.quoteOnRequest },
    { service: t.services.tabs.proposal, scope: s('Writing & design',        'Uandishi & muundo'),           price: t.common.quoteOnRequest },
  ]

  return (
    <>
      {/* ── HEADER ───────────────────────────────────────── */}
      <section className="pt-36 pb-16 border-b border-bss-border">
        <div className="container-site">
          <p className="eyebrow">{t.pricing.eyebrow}</p>
          <h1 className="display-xl max-w-2xl mb-6">{t.pricing.headline}</h1>
          <p className="body-lead max-w-prose">{t.pricing.body}</p>
        </div>
      </section>

      {/* ── PRICE TABLE ──────────────────────────────────── */}
      <section className="section-pad border-b border-bss-border">
        <div className="container-site">
          {/* Table header */}
          <div className="grid grid-cols-3 pb-4 border-b border-bss-border mb-2">
            <p className="eyebrow">{s('Service', 'Huduma')}</p>
            <p className="eyebrow">{s('Scope', 'Upeo')}</p>
            <p className="eyebrow text-right">{s('Price (TZS)', 'Bei (TZS)')}</p>
          </div>

          {/* Rows */}
          {rows.map((row, i) => (
            <div key={i} className="price-row grid grid-cols-3 gap-4">
              <p className="text-sm font-body font-medium text-bss-white">{row.service}</p>
              <p className="text-sm font-body text-bss-subtle">
                {row.scope}
                {row.note && (
                  <span className="ml-2 text-2xs text-bss-muted">({row.note})</span>
                )}
              </p>
              <p className="text-sm font-body font-medium text-bss-white text-right">{row.price}</p>
            </div>
          ))}

          {/* Note */}
          <p className="mt-8 text-xs font-body text-bss-muted italic max-w-prose">
            {t.pricing.note}
          </p>

          {/* CTA */}
          <div className="mt-12">
            <Link href="/contact" className="btn-primary">
              {t.pricing.ctaButton}
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section className="section-pad">
        <div className="container-site max-w-prose">
          <p className="eyebrow">{t.pricing.faqEyebrow}</p>
          <h2 className="display-md mb-10">{t.pricing.faqHeadline}</h2>

          <div>
            {t.pricing.faqs.map((faq, i) => (
              <div key={i} className="faq-item">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between py-5 text-left gap-4"
                >
                  <span className="font-body text-base font-medium text-bss-white">
                    {faq.q}
                  </span>
                  <span className={clsx(
                    'text-bss-muted text-lg transition-transform duration-200 shrink-0',
                    openFaq === i && 'rotate-45'
                  )}>
                    +
                  </span>
                </button>
                <div className={clsx(
                  'overflow-hidden transition-all duration-300',
                  openFaq === i ? 'max-h-48 pb-5' : 'max-h-0'
                )}>
                  <p className="body-base">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}