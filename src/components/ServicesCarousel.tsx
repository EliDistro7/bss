'use client'

import Link from 'next/link'
import { useRef, useState, useCallback } from 'react'
import { useLang } from '../lib/i18n/LanguageContext'

// ── SVG mask shapes ───────────────────────────────────────────────────────────

function MaskCircles() {
  return (
    <svg viewBox="0 0 300 220" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <circle cx="270" cy="20" r="160" fill="none" stroke="#242424" strokeWidth="80" />
      <circle cx="270" cy="20" r="90"  fill="none" stroke="#1c1c1c" strokeWidth="50" />
      <circle cx="270" cy="20" r="40"  fill="none" stroke="#282828" strokeWidth="25" />
    </svg>
  )
}

function MaskRects() {
  return (
    <svg viewBox="0 0 300 220" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <rect x="120" y="-60" width="260" height="260" fill="none" stroke="#242424" strokeWidth="70" transform="rotate(20 260 60)" />
      <rect x="160" y="-30" width="190" height="190" fill="none" stroke="#1c1c1c" strokeWidth="45" transform="rotate(20 260 60)" />
      <rect x="195" y="0"   width="130" height="130" fill="none" stroke="#282828" strokeWidth="28" transform="rotate(20 260 60)" />
    </svg>
  )
}

function MaskTriangle() {
  return (
    <svg viewBox="0 0 300 220" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <polygon points="310,-10 310,230 50,230"  fill="none" stroke="#242424" strokeWidth="70" />
      <polygon points="310,30  310,230 110,230" fill="none" stroke="#1c1c1c" strokeWidth="45" />
      <polygon points="310,80  310,230 165,230" fill="none" stroke="#282828" strokeWidth="28" />
    </svg>
  )
}

function MaskEllipse() {
  return (
    <svg viewBox="0 0 300 220" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <ellipse cx="290" cy="110" rx="180" ry="110" fill="none" stroke="#242424" strokeWidth="70" />
      <ellipse cx="290" cy="110" rx="120" ry="75"  fill="none" stroke="#1c1c1c" strokeWidth="45" />
      <ellipse cx="290" cy="110" rx="65"  ry="45"  fill="none" stroke="#282828" strokeWidth="28" />
    </svg>
  )
}

function MaskLines() {
  return (
    <svg viewBox="0 0 300 220" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <line x1="320" y1="-10" x2="-20" y2="230" stroke="#242424" strokeWidth="80" />
      <line x1="320" y1="55"  x2="40"  y2="230" stroke="#1c1c1c" strokeWidth="55" />
      <line x1="320" y1="115" x2="100" y2="230" stroke="#282828" strokeWidth="35" />
      <line x1="320" y1="165" x2="160" y2="230" stroke="#202020" strokeWidth="20" />
    </svg>
  )
}

// ── Types & data ──────────────────────────────────────────────────────────────

type ServiceKey = 'profile' | 'website' | 'app' | 'card' | 'proposal'

interface ServiceSlide {
  key: ServiceKey
  num: string
  mask: React.ReactNode
  descKey: keyof ReturnType<typeof buildDescs>
  marqueeDuration: string
}

function buildDescs(t: ReturnType<typeof useLang>['t']) {
  return {
    profileDesc:  t.services?.tabs?.profile  ?? 'Branded docs that open doors',
    websiteDesc:  t.services?.tabs?.website  ?? 'Clean, fast sites that convert',
    appDesc:      t.services?.tabs?.app      ?? 'iOS and Android, built to scale',
    cardDesc:     t.services?.tabs?.card     ?? 'First impressions that last',
    proposalDesc: t.services?.tabs?.proposal ?? 'Win more pitches, close more deals',
  }
}

const SLIDES: ServiceSlide[] = [
  { key: 'profile',  num: '01', mask: <MaskCircles />,  descKey: 'profileDesc',  marqueeDuration: '22s' },
  { key: 'website',  num: '02', mask: <MaskRects />,    descKey: 'websiteDesc',  marqueeDuration: '26s' },
  { key: 'app',      num: '03', mask: <MaskTriangle />, descKey: 'appDesc',      marqueeDuration: '19s' },
  { key: 'card',     num: '04', mask: <MaskEllipse />,  descKey: 'cardDesc',     marqueeDuration: '24s' },
  { key: 'proposal', num: '05', mask: <MaskLines />,    descKey: 'proposalDesc', marqueeDuration: '21s' },
]

const TICKER = [
  'Company Profiles', 'Web Development', 'Mobile Apps',
  'Business Cards', 'Proposals & Tenders', 'Dar es Salaam',
  'Bari Software Services', 'Tanzania',
]

// ── Card ──────────────────────────────────────────────────────────────────────

function ServiceCard({
  slide,
  serviceName,
  desc,
  index,
}: {
  slide: ServiceSlide
  serviceName: string
  desc: string
  index: number
}) {
  return (
    <Link
      href="/services"
      style={{ animationDelay: `${index * 90}ms` }}
      className="group relative flex-shrink-0 w-[45vw] max-w-[420px] min-w-[280px] overflow-hidden
                 bg-bss-card
                 opacity-0 animate-[card-in_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards]
                 transition-[background-color,transform,box-shadow] duration-300 ease-out
                 hover:bg-[#181818] hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)]
                 will-change-transform"
    >
      {/* SVG mask */}
      <div className="absolute inset-0 z-0 transition-transform duration-500 ease-out group-hover:scale-[1.04]">
        {slide.mask}
      </div>

      {/* inner marquee — service name drifting behind content */}
      <div
        className="absolute inset-x-0 top-1/2 z-[1] -translate-y-1/2 overflow-hidden opacity-[0.07] pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="flex w-max animate-[marquee_linear_infinite] whitespace-nowrap"
          style={{ animationDuration: slide.marqueeDuration }}
        >
          {Array.from({ length: 4 }).map((_, j) => (
            <span key={j} className="font-display text-7xl font-bold uppercase leading-none text-bss-white px-5">
              {serviceName}
            </span>
          ))}
        </div>
      </div>

      {/* top-edge highlight on hover */}
      <div className="absolute inset-x-0 top-0 h-px bg-bss-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 z-20" />

      {/* arrow */}
      <span className="absolute top-6 right-6 z-10 font-body text-xl text-bss-white opacity-20 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
        →
      </span>

      {/* content */}
      <div className="relative z-10 flex h-[280px] flex-col justify-between p-7">
        <span className="font-display text-5xl font-bold text-bss-white opacity-10 leading-none select-none">
          {slide.num}
        </span>
        <div>
          <p className="font-display text-2xl font-bold leading-tight text-bss-white mb-2">
            {serviceName}
          </p>
          <p className="font-body text-sm leading-relaxed text-bss-subtle">
            {desc}
          </p>
        </div>
      </div>
    </Link>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ServicesCarousel() {
  const { t } = useLang()
  const descs = buildDescs(t)
  const [paused, setPaused] = useState(false)

  const serviceNames: Record<ServiceKey, string> = {
    profile:  t.services.tabs.profile,
    website:  t.services.tabs.website,
    app:      t.services.tabs.app,
    card:     t.services.tabs.card,
    proposal: t.services.tabs.proposal,
  }

  // duplicate slides so the seam is invisible
  const track = [...SLIDES, ...SLIDES]

  return (
    <section className="border-t border-bss-border">

      {/* ── Ticker ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-bss-border py-4">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-bss-black to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-bss-black to-transparent" />
        <div className="flex w-max animate-[marquee_30s_linear_infinite]">
          {[...TICKER, ...TICKER].map((label, i) => (
            <span key={i} className="flex items-center gap-6 px-8 font-body text-sm font-semibold tracking-[0.08em] uppercase text-bss-subtle">
              {label}
              <svg width="6" height="6" viewBox="0 0 6 6" className="shrink-0 fill-bss-border" aria-hidden="true">
                <rect x="3" y="0" width="4.24" height="4.24" transform="rotate(45 3 3)" />
              </svg>
            </span>
          ))}
        </div>
      </div>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="container-site">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-16 pb-10">
          <div>
            <p className="eyebrow">{t.home.servicesEyebrow}</p>
            <h2 className="display-lg max-w-sm">{t.home.servicesHeadline}</h2>
          </div>
          <Link
            href="/services"
            className="shrink-0 font-body text-[11px] tracking-[0.18em] uppercase text-bss-muted
                       border-b border-bss-border pb-0.5
                       transition-colors duration-200 hover:text-bss-white hover:border-bss-white"
          >
            {t.common.learnMore} →
          </Link>
        </div>
      </div>

      {/* ── Card marquee track ─────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden pb-16"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-bss-black to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-bss-black to-transparent" />

        <div
          className="flex gap-px"
          style={{
            animation: 'marquee 20s linear infinite',
            animationPlayState: paused ? 'paused' : 'running',
            width: 'max-content',
          }}
        >
          {track.map((slide, i) => (
            <ServiceCard
              key={`${slide.key}-${i}`}
              slide={slide}
              serviceName={serviceNames[slide.key]}
              desc={descs[slide.descKey]}
              index={i % SLIDES.length}
            />
          ))}
        </div>
      </div>

    </section>
  )
}