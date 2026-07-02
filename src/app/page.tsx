'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useLang } from '../lib/i18n/LanguageContext'
import { listPortfolio } from '../lib/api/portfolio'
import type { PortfolioItem } from '../lib/api/portfolio'
import PortfolioCard from '../components/PortfolioCard'
import PortfolioModal from '../components/PortfolioModal'
import TeamSection from '../components/TeamSection'
import ServicesCarousel from '../components/ServicesCarousel'


interface Stat {
  value: string
  labelKey: 'statsLabel1' | 'statsLabel2' | 'statsLabel3'
}

const STATS: Stat[] = [
  { value: '30+', labelKey: 'statsLabel1' },
  { value: '20+', labelKey: 'statsLabel2' },
  { value: '3+',  labelKey: 'statsLabel3' },
]

function PortfolioTeaser() {
  const { t, locale } = useLang()
  const [items, setItems]     = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    listPortfolio()
      .then(all => setItems(all.slice(0, 10)))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  const selectedItem = items.find(p => p._id === selected)

return (
  <section className="section-pad border-t border-bss-border">
    {/* Header stays contained */}
    <div className="container-site">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <h2 className="display-md">{t.portfolio.headline}</h2>
        </div>
        <Link
          href="/portfolio"
          className="link-underline text-sm tracking-wider uppercase font-medium text-bss-muted hover:text-bss-white shrink-0"
        >
          {t.common.viewWork} →
        </Link>
      </div>
    </div>

    {/* Grid breaks out of container — full bleed on all screens below sm */}
    {loading ? (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-bss-border">
        {[0, 1, 2].map(i => (
          <div key={i} className="aspect-[4/3] bg-bss-surface animate-pulse" />
        ))}
      </div>
    ) : items.length > 0 ? (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-bss-border">
        {items.map(item => (
          <PortfolioCard
            key={item._id}
            item={item}
            title={locale === 'sw' ? item.titleSw : item.title}
            onClick={() => setSelected(item._id)}
          />
        ))}
      </div>
    ) : (
      <div className="container-site">
        <div className="border border-bss-border py-16 flex flex-col items-center gap-4">
          <p className="body-base text-bss-muted">Browse our full portfolio</p>
          <Link href="/portfolio" className="btn-ghost text-sm">
            View work →
          </Link>
        </div>
      </div>
    )}

    {selectedItem && (
      <PortfolioModal item={selectedItem} onClose={() => setSelected(null)} />
    )}
  </section>
)
}

export default function HomePage() {
  const { t } = useLang()

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
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

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
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

      {/* ── Portfolio teaser ─────────────────────────────────────────────── */}
      <PortfolioTeaser />

   

      {/* ── Services carousel ────────────────────────────────────────────── */}
      <ServicesCarousel />

      {/* ── Why BSS ──────────────────────────────────────────────────────── */}
      <section className="border-t border-bss-border overflow-hidden">
        {/* Full-bleed image strip */}
        <div className="relative h-[55vh] min-h-[340px] w-full">
          <Image
            src="/industries/smart_link.png"
            alt="BSS — construction and real estate focus"
            fill
            className="object-cover opacity-60"
          />
          {/* Strong bottom fade so text block reads cleanly below */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bss-black/20 to-bss-black" />
          {/* Left-side eyebrow floating on image */}
          <div className="absolute bottom-8 left-0 right-0">
            <div className="container-site">
              <p className="eyebrow">{t.home.whyEyebrow}</p>
            </div>
          </div>
        </div>

        {/* Text block flush below the image */}
        <div className="container-site">
          <div className="grid md:grid-cols-2 gap-px bg-bss-border">
            {/* Headline cell */}
            <div className="bg-bss-black py-12 md:py-16 pr-12">
              <h2 className="display-lg">{t.home.whyHeadline}</h2>
            </div>
            {/* Body + CTA cell */}
            <div className="bg-bss-black py-12 md:py-16 pl-12 flex flex-col justify-between gap-8">
              <p className="body-lead text-bss-subtle">{t.home.whyBody}</p>
              <Link href="/about" className="btn-ghost self-start">{t.common.learnMore}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────────────────────────── */}
      <TeamSection />

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
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