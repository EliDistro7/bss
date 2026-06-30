'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useLang } from '../lib/i18n/LanguageContext'
import { listPortfolio } from '../lib/api/portfolio'
import type { PortfolioItem } from '../lib/api/portfolio'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Stat {
  value: string
  labelKey: 'statsLabel1' | 'statsLabel2' | 'statsLabel3'
}

const STATS: Stat[] = [
  { value: '30+', labelKey: 'statsLabel1' },
  { value: '20+', labelKey: 'statsLabel2' },
  { value: '3+',  labelKey: 'statsLabel3' },
]

const SERVICES_OVERVIEW = [
  { key: 'profile',  href: '/services' },
  { key: 'website',  href: '/services' },
  { key: 'app',      href: '/services' },
  { key: 'card',     href: '/services' },
  { key: 'proposal', href: '/services' },
] as const

// ---------------------------------------------------------------------------
// Portfolio teaser — fetches live data, falls back gracefully
// ---------------------------------------------------------------------------

function PortfolioTeaser() {
  const { t, locale } = useLang()
  const [items, setItems]   = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listPortfolio()
      .then(all => setItems(all.slice(0, 3)))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="section-pad border-t border-bss-border">
      <div className="container-site">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="eyebrow">{t.nav.portfolio}</p>
            <h2 className="display-md">{t.portfolio.headline}</h2>
          </div>
          <Link
            href="/portfolio"
            className="link-underline text-sm tracking-wider uppercase font-medium text-bss-muted hover:text-bss-white shrink-0"
          >
            {t.common.viewWork} →
          </Link>
        </div>

        {/* Grid */}
        {loading ? (
          // Skeleton — same 3-cell grid so layout doesn't shift
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-bss-border">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="aspect-[4/3] bg-bss-surface animate-pulse"
              />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-bss-border">
            {items.map(item => (
              <Link
                key={item._id}
                href={`/portfolio#${item._id}`}
                className="group relative block aspect-[4/3] bg-bss-black overflow-hidden"
              >
                {item.coverUrl ? (
                  <Image
                    src={item.coverUrl}
                    alt={locale === 'sw' ? item.titleSw : item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 bg-bss-surface flex items-center justify-center">
                    <span className="text-2xs tracking-widest uppercase text-bss-muted">No cover</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-bss-black/80 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-2xs tracking-wider uppercase text-bss-muted mb-1">
                    {item.client} · {item.year}
                  </p>
                  <span className="text-sm font-display font-bold text-bss-white leading-tight line-clamp-2">
                    {locale === 'sw' ? item.titleSw : item.title}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          // Fallback: no items returned — show a plain CTA so the section isn't empty
          <div className="border border-bss-border py-16 flex flex-col items-center gap-4">
            <p className="body-base text-bss-muted">Browse our full portfolio</p>
            <Link href="/portfolio" className="btn-ghost text-sm">
              View work →
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function HomePage() {
  const { t } = useLang()

  const serviceNames = {
    profile:  t.services.tabs.profile,
    website:  t.services.tabs.website,
    app:      t.services.tabs.app,
    card:     t.services.tabs.card,
    proposal: t.services.tabs.proposal,
  }

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-end pb-20 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/skrapers/dar.png"
            alt="Modern architecture — hero background"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bss-black via-bss-black/30 to-bss-black/10" />
        </div>

        <div className="container-site relative z-10 pt-40">
          <p className="eyebrow mb-6">{t.home.heroEyebrow}</p>
          <h1 className="display-xl max-w-4xl mb-8">{t.home.heroHeadline}</h1>
          <p className="body-lead max-w-prose mb-12">{t.home.heroSub}</p>

          <div className="flex flex-wrap gap-4">
            <Link href="/portfolio" className="btn-primary">{t.home.heroCta}</Link>
            <Link href="/contact"   className="btn-ghost">{t.home.heroCtaSecond}</Link>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────── */}
      <section className="border-t border-bss-border">
        <div className="container-site">
          <div className="grid grid-cols-3 divide-x divide-bss-border">
            {STATS.map(({ value, labelKey }) => (
              <div key={labelKey} className="py-10 md:py-14 px-6 md:px-10 first:pl-0 last:pr-0">
                <p className="font-display text-4xl md:text-5xl font-bold text-bss-white mb-1">{value}</p>
                <p className="text-xs tracking-wider uppercase font-body font-medium text-bss-muted">
                  {t.home[labelKey]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES OVERVIEW ────────────────────────────── */}
      <section className="section-pad border-t border-bss-border">
        <div className="container-site">
          <div className="grid md:grid-cols-2 gap-6 md:gap-0 mb-16">
            <div>
              <p className="eyebrow">{t.home.servicesEyebrow}</p>
              <h2 className="display-lg max-w-sm">{t.home.servicesHeadline}</h2>
            </div>
            <div className="md:flex md:items-end">
              <Link
                href="/services"
                className="link-underline text-sm tracking-wider uppercase font-medium text-bss-muted hover:text-bss-white"
              >
                {t.common.learnMore} →
              </Link>
            </div>
          </div>

          <div>
            {SERVICES_OVERVIEW.map(({ key, href }, i) => (
              <Link key={key} href={href} className="group block">
                <div className="flex items-center justify-between py-6 border-t border-bss-border group-hover:border-bss-subtle transition-colors duration-200">
                  <div className="flex items-baseline gap-6">
                    <span className="text-xs font-body text-bss-muted w-6">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="font-display text-2xl md:text-3xl font-bold text-bss-white group-hover:translate-x-1 transition-transform duration-200">
                      {serviceNames[key]}
                    </span>
                  </div>
                  <span className="text-bss-muted group-hover:text-bss-white group-hover:translate-x-1 transition-all duration-200 text-lg">
                    →
                  </span>
                </div>
              </Link>
            ))}
            <div className="border-t border-bss-border" />
          </div>
        </div>
      </section>

      {/* ── WHY BSS ──────────────────────────────────────── */}
      <section className="section-pad border-t border-bss-border">
        <div className="container-site">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="eyebrow">{t.home.whyEyebrow}</p>
              <h2 className="display-lg mb-6">{t.home.whyHeadline}</h2>
              <p className="body-lead mb-8">{t.home.whyBody}</p>
              <Link href="/about" className="btn-ghost">{t.common.learnMore}</Link>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src="/industries/smart_link.png"
                alt="BSS — construction and real estate focus"
                fill
                className="object-cover opacity-80"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── PORTFOLIO TEASER (live data) ─────────────────── */}
      <PortfolioTeaser />

      {/* ── CTA BANNER ───────────────────────────────────── */}
      <section className="border-t border-bss-border">
        <div className="container-site py-20 md:py-28 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h2 className="display-md mb-3">{t.home.ctaHeadline}</h2>
            <p className="body-lead">{t.home.ctaBody}</p>
          </div>
          <Link href="/contact" className="btn-primary shrink-0">
            {t.home.ctaButton}
          </Link>
        </div>
      </section>
    </>
  )
}