
'use client'

import Link from 'next/link'
import { useRef, useState, useCallback } from 'react'
import { useLang } from '../lib/i18n/LanguageContext'

// ── SVG mask shapes — bolder strokes, more presence ──────────────────────────

function MaskCircles() {
  return (
    <svg
      viewBox="0 0 300 220"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <circle cx="270" cy="20"  r="160" fill="none" stroke="#242424" strokeWidth="80" />
      <circle cx="270" cy="20"  r="90"  fill="none" stroke="#1c1c1c" strokeWidth="50" />
      <circle cx="270" cy="20"  r="40"  fill="none" stroke="#282828" strokeWidth="25" />
    </svg>
  )
}

function MaskRects() {
  return (
    <svg
      viewBox="0 0 300 220"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <rect x="120" y="-60" width="260" height="260" fill="none" stroke="#242424" strokeWidth="70" transform="rotate(20 260 60)" />
      <rect x="160" y="-30" width="190" height="190" fill="none" stroke="#1c1c1c" strokeWidth="45" transform="rotate(20 260 60)" />
      <rect x="195" y="0"   width="130" height="130" fill="none" stroke="#282828" strokeWidth="28" transform="rotate(20 260 60)" />
    </svg>
  )
}

function MaskTriangle() {
  return (
    <svg
      viewBox="0 0 300 220"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <polygon points="310,-10 310,230 50,230"  fill="none" stroke="#242424" strokeWidth="70" />
      <polygon points="310,30  310,230 110,230" fill="none" stroke="#1c1c1c" strokeWidth="45" />
      <polygon points="310,80  310,230 165,230" fill="none" stroke="#282828" strokeWidth="28" />
    </svg>
  )
}

function MaskEllipse() {
  return (
    <svg
      viewBox="0 0 300 220"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <ellipse cx="290" cy="110" rx="180" ry="110" fill="none" stroke="#242424" strokeWidth="70" />
      <ellipse cx="290" cy="110" rx="120" ry="75"  fill="none" stroke="#1c1c1c" strokeWidth="45" />
      <ellipse cx="290" cy="110" rx="65"  ry="45"  fill="none" stroke="#282828" strokeWidth="28" />
    </svg>
  )
}

function MaskLines() {
  return (
    <svg
      viewBox="0 0 300 220"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <line x1="320" y1="-10" x2="-20" y2="230" stroke="#242424" strokeWidth="80" />
      <line x1="320" y1="55"  x2="40"  y2="230" stroke="#1c1c1c" strokeWidth="55" />
      <line x1="320" y1="115" x2="100" y2="230" stroke="#282828" strokeWidth="35" />
      <line x1="320" y1="165" x2="160" y2="230" stroke="#202020" strokeWidth="20" />
    </svg>
  )
}

// ── Service data ──────────────────────────────────────────────────────────────

type ServiceKey = 'profile' | 'website' | 'app' | 'card' | 'proposal'

interface ServiceSlide {
  key: ServiceKey
  num: string
  mask: React.ReactNode
  descKey: keyof ReturnType<typeof buildDescs>
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
  { key: 'profile',  num: '01', mask: <MaskCircles />,  descKey: 'profileDesc'  },
  { key: 'website',  num: '02', mask: <MaskRects />,    descKey: 'websiteDesc'  },
  { key: 'app',      num: '03', mask: <MaskTriangle />, descKey: 'appDesc'      },
  { key: 'card',     num: '04', mask: <MaskEllipse />,  descKey: 'cardDesc'     },
  { key: 'proposal', num: '05', mask: <MaskLines />,    descKey: 'proposalDesc' },
]

// ── Marquee ticker items ──────────────────────────────────────────────────────

const TICKER = [
  'Company Profiles', 'Web Development', 'Mobile Apps',
  'Business Cards', 'Proposals & Tenders', 'Dar es Salaam',
  'Bari Software Services', 'Tanzania',
]

// ── Main component ────────────────────────────────────────────────────────────

export default function ServicesCarousel() {
  const { t } = useLang()
  const descs = buildDescs(t)

  const trackRef  = useRef<HTMLDivElement>(null)
  const [cur, setCur] = useState(0)
  const VISIBLE = 2
  const MAX     = SLIDES.length - VISIBLE

  const go = useCallback((next: number) => {
    const clamped = Math.max(0, Math.min(next, MAX))
    setCur(clamped)
    const track = trackRef.current
    if (!track) return
    const slide = track.querySelector<HTMLElement>('[data-slide]')
    if (!slide) return
    const gap  = 1
    const step = slide.offsetWidth + gap
    track.style.transform = `translateX(-${clamped * step}px)`
  }, [MAX])

  const serviceNames: Record<ServiceKey, string> = {
    profile:  t.services.tabs.profile,
    website:  t.services.tabs.website,
    app:      t.services.tabs.app,
    card:     t.services.tabs.card,
    proposal: t.services.tabs.proposal,
  }

  return (
    <section className="border-t border-bss-border">

      {/* ── Marquee ticker ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-bss-border py-4">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-bss-black to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-bss-black to-transparent" />

        <div className="flex w-max animate-[marquee_30s_linear_infinite]">
          {[...TICKER, ...TICKER].map((label, i) => (
            <span
              key={i}
              className="flex items-center gap-6 px-8 font-body text-sm font-semibold tracking-[0.08em] uppercase text-bss-subtle"
            >
              {label}
              {/* Diamond separator — more graphic than a dot */}
              <svg width="6" height="6" viewBox="0 0 6 6" className="shrink-0 fill-bss-border" aria-hidden="true">
                <rect x="3" y="0" width="4.24" height="4.24" transform="rotate(45 3 3)" />
              </svg>
            </span>
          ))}
        </div>
      </div>

      {/* ── Section header ─────────────────────────────────────────────── */}
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

        {/* ── Carousel ───────────────────────────────────────────────────── */}
        <div className="overflow-hidden pb-16">
          <div
            ref={trackRef}
            className="flex gap-px bg-bss-border transition-transform duration-[400ms] [cubic-bezier(0.25,0.46,0.45,0.94)]"
            style={{ willChange: 'transform' }}
          >
            {SLIDES.map((slide) => (
              <Link
                key={slide.key}
                href="/services"
                data-slide
                className="group relative flex-[0_0_calc(50%-0.5px)] min-w-0 overflow-hidden
                           bg-bss-card
                           transition-colors duration-250 hover:bg-[#181818]"
              >
                <div className="absolute inset-0 z-0">
                  {slide.mask}
                </div>

                <div className="absolute inset-x-0 top-0 h-px bg-bss-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 z-20" />

                <span className="absolute top-6 right-6 z-10 font-body text-xl text-bss-white opacity-20 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  →
                </span>

                <div className="relative z-10 flex h-[280px] flex-col justify-between p-7">
                  <span className="font-display text-5xl font-bold text-bss-white opacity-10 leading-none select-none">
                    {slide.num}
                  </span>
                  <div>
                    <p className="font-display text-2xl font-bold leading-tight text-bss-white mb-2">
                      {serviceNames[slide.key]}
                    </p>
                    <p className="font-body text-sm leading-relaxed text-bss-subtle">
                      {descs[slide.descKey]}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* controls */}
          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={() => go(cur - 1)}
              disabled={cur === 0}
              className="flex h-9 w-9 items-center justify-center border border-bss-border
                         font-body text-base text-bss-white bg-transparent
                         transition-colors duration-200 hover:border-bss-muted
                         disabled:opacity-25 disabled:cursor-default"
              aria-label="Previous"
            >
              ←
            </button>
            <button
              onClick={() => go(cur + 1)}
              disabled={cur >= MAX}
              className="flex h-9 w-9 items-center justify-center border border-bss-border
                         font-body text-base text-bss-white bg-transparent
                         transition-colors duration-200 hover:border-bss-muted
                         disabled:opacity-25 disabled:cursor-default"
              aria-label="Next"
            >
              →
            </button>

            <div className="ml-auto flex gap-1.5 items-center">
              {Array.from({ length: MAX + 1 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-px transition-all duration-200 bg-bss-border
                    ${i === cur ? 'w-10 !bg-bss-white' : 'w-6'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
