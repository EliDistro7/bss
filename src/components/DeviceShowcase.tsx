'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useLang } from '../lib/i18n/LanguageContext'
import { listPortfolio } from '../lib/api/portfolio'
import type { PortfolioItem } from '../lib/api/portfolio'

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function LaptopDevice({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="laptop-wrap">
      {/* Lid */}
      <div className="laptop-lid">
        <div className="laptop-inner">
          {src ? (
            <Image
              src={src}
              alt={alt}
              fill
              className="object-cover"
              sizes="252px"
              priority={false}
            />
          ) : (
            <SkeletonScreen />
          )}
          {/* top-edge glint */}
          <div className="lid-shine" aria-hidden="true" />
        </div>
      </div>
      {/* Base / keyboard tray */}
      <div className="laptop-base">
        <div className="laptop-notch" />
      </div>
      <span className="device-label" style={{ bottom: '-26px', left: '72px' }}>
        Web · Desktop
      </span>
    </div>
  )
}

function PhoneDevice({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="phone-wrap">
      <div className="phone-body">
        <div className="phone-btn" aria-hidden="true" />
        <div className="phone-pill" aria-hidden="true" />
        <div className="phone-screen">
          {src ? (
            <Image
              src={src}
              alt={alt}
              fill
              className="object-cover"
              sizes="80px"
              priority={false}
            />
          ) : (
            <SkeletonScreen />
          )}
          <div className="phone-shine" aria-hidden="true" />
        </div>
      </div>
      <span className="device-label" style={{ bottom: '-24px', left: '4px' }}>
        App · Mobile
      </span>
    </div>
  )
}

function SkeletonScreen() {
  return (
    <div
      className="absolute inset-0 animate-pulse"
      style={{ background: '#111' }}
    />
  )
}

function DotNav({
  count,
  current,
  onSelect,
}: {
  count: number
  current: number
  onSelect: (i: number) => void
}) {
  return (
    <div className="flex gap-[6px] mt-5" role="tablist" aria-label="Portfolio items">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          role="tab"
          aria-selected={i === current}
          aria-label={`Item ${i + 1}`}
          onClick={() => onSelect(i)}
          className="dot-btn"
          style={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            background: i === current ? '#ffffff' : '#2a2a2a',
            transform: i === current ? 'scale(1.35)' : 'scale(1)',
            transition: 'background 0.3s, transform 0.3s',
          }}
        />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

const ROTATE_INTERVAL_MS = 4000

export default function DeviceShowcase() {
  const { t, locale } = useLang()

  const [items, setItems]     = useState<PortfolioItem[]>([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const timerRef              = useRef<ReturnType<typeof setInterval> | null>(null)

  // Fetch portfolio on mount
  useEffect(() => {
    listPortfolio()
      .then(all => {
        const published = all.filter(p => p.published && p.coverUrl)
        setItems(published)
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % (items.length || 1))
    }, ROTATE_INTERVAL_MS)
  }, [items.length])

  // Auto-rotate once we have items
  useEffect(() => {
    if (!items.length) return
    startTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [items.length, startTimer])

  const handleDotSelect = useCallback((i: number) => {
    setCurrent(i)
    startTimer()           // reset the interval so selection doesn't immediately skip
  }, [startTimer])

  const active = items[current]

  return (
    <>
      {/* ── Scoped styles ────────────────────────────────────────────── */}
      <style>{`
        /* Device animation keyframes */
        @keyframes bss-float {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }
        @keyframes bss-laptop-rock {
          0%,100% { transform: rotateY(-20deg) rotateX(4deg); }
          40%     { transform: rotateY(-10deg) rotateX(2deg); }
          70%     { transform: rotateY(-24deg) rotateX(5deg); }
        }
        @keyframes bss-phone-rock {
          0%,100% { transform: rotateY(18deg) rotateX(-4deg); }
          35%     { transform: rotateY(10deg) rotateX(-2deg); }
          65%     { transform: rotateY(22deg) rotateX(-6deg); }
        }

        /* Float group */
        .bss-float-group {
          animation: bss-float 6s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .bss-float-group,
          .laptop-wrap,
          .phone-wrap { animation: none !important; }
        }

        /* Laptop */
        .laptop-wrap {
          position: absolute;
          left: 28px; top: 24px;
          transform-style: preserve-3d;
          animation: bss-laptop-rock 14s ease-in-out infinite;
        }
        .laptop-lid {
          width: 270px; height: 172px;
          background: #181818;
          border: 1.5px solid #2e2e2e;
          border-radius: 8px 8px 0 0;
          position: relative;
          transform: rotateX(-8deg);
          transform-origin: bottom center;
          box-shadow: 0 -4px 30px rgba(0,0,0,.7);
        }
        .laptop-inner {
          position: absolute;
          inset: 9px;
          background: #0a0a0a;
          border-radius: 3px;
          overflow: hidden;
        }
        .lid-shine {
          position: absolute;
          inset: 0;
          background: linear-gradient(160deg,rgba(255,255,255,.05) 0%,transparent 55%);
          border-radius: 3px;
          pointer-events: none;
          z-index: 2;
        }
        .laptop-base {
          width: 278px; height: 16px;
          background: #141414;
          border: 1px solid #2a2a2a;
          border-top: none;
          border-radius: 0 0 5px 5px;
          position: relative;
        }
        .laptop-notch {
          position: absolute;
          bottom: 0; left: 50%;
          transform: translateX(-50%);
          width: 44px; height: 5px;
          background: #0a0a0a;
          border-radius: 0 0 4px 4px;
        }

        /* Phone */
        .phone-wrap {
          position: absolute;
          right: 54px; top: 8px;
          transform-style: preserve-3d;
          animation: bss-phone-rock 11s ease-in-out infinite;
          animation-delay: -4s;
        }
        .phone-body {
          width: 92px; height: 190px;
          background: #181818;
          border: 1.5px solid #2e2e2e;
          border-radius: 22px;
          position: relative;
          box-shadow: 0 8px 40px rgba(0,0,0,.8);
        }
        .phone-btn {
          position: absolute;
          right: -3px; top: 52px;
          width: 3px; height: 28px;
          background: #252525;
          border-radius: 0 2px 2px 0;
        }
        .phone-pill {
          position: absolute;
          top: 10px; left: 50%;
          transform: translateX(-50%);
          width: 32px; height: 5px;
          background: #0a0a0a;
          border-radius: 3px;
          z-index: 2;
        }
        .phone-screen {
          position: absolute;
          top: 8px; left: 6px; right: 6px; bottom: 8px;
          background: #0a0a0a;
          border-radius: 16px;
          overflow: hidden;
        }
        .phone-shine {
          position: absolute;
          inset: 0;
          background: linear-gradient(160deg,rgba(255,255,255,.04) 0%,transparent 50%);
          border-radius: 16px;
          pointer-events: none;
          z-index: 2;
        }

        /* Shared device label */
        .device-label {
          position: absolute;
          font-family: var(--font-body);
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #3a3a3a;
          white-space: nowrap;
        }

        /* Ground shadow */
        .bss-ground {
          position: absolute;
          bottom: -18px; left: 50%;
          transform: translateX(-50%);
          width: 380px; height: 24px;
          background: radial-gradient(ellipse,rgba(255,255,255,.05) 0%,transparent 70%);
          border-radius: 50%;
        }
      `}</style>

      {/* ── Section ──────────────────────────────────────────────────── */}
      <section className="border-t border-bss-border overflow-hidden">
        <div className="container-site">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-16 pb-14">
            <div>
              <p className="eyebrow">Built for every screen</p>
              <h2 className="display-lg max-w-xs">
                Web &amp; mobile,<br />delivered.
              </h2>
            </div>
            <Link
              href="/portfolio"
              className="shrink-0 font-body text-[11px] tracking-[0.18em] uppercase
                         text-bss-muted border-b border-bss-border pb-0.5
                         transition-colors duration-200
                         hover:text-bss-white hover:border-bss-white"
            >
              View all work →
            </Link>
          </div>

          {/* 3-D scene */}
          <div className="flex flex-col items-center pb-20">
            <div
              className="relative"
              style={{
                width: 560,
                height: 300,
                perspective: '1100px',
                perspectiveOrigin: '50% 38%',
              }}
            >
              {/* Ambient glow */}
              <div
                aria-hidden="true"
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 140, height: 140,
                  background: 'rgba(255,255,255,.03)',
                  top: -10, left: 60,
                  filter: 'blur(50px)',
                }}
              />
              <div
                aria-hidden="true"
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 100, height: 100,
                  background: 'rgba(255,255,255,.025)',
                  bottom: 20, right: 80,
                  filter: 'blur(50px)',
                }}
              />

              <div
                className="bss-float-group absolute inset-0"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Laptop */}
                {loading ? (
                  <div className="laptop-wrap">
                    <div className="laptop-lid">
                      <div className="laptop-inner"><SkeletonScreen /></div>
                    </div>
                    <div className="laptop-base"><div className="laptop-notch" /></div>
                  </div>
                ) : (
                  <LaptopDevice
                    src={active?.coverUrl ?? ''}
                    alt={active ? `${active.client} — ${active.title}` : ''}
                  />
                )}

                {/* Phone */}
                {loading ? (
                  <div className="phone-wrap">
                    <div className="phone-body">
                      <div className="phone-btn" />
                      <div className="phone-pill" />
                      <div className="phone-screen"><SkeletonScreen /></div>
                    </div>
                  </div>
                ) : (
                  <PhoneDevice
                    src={active?.coverUrl ?? ''}
                    alt={active ? `${active.client} — ${active.title}` : ''}
                  />
                )}

                <div className="bss-ground" aria-hidden="true" />
              </div>
            </div>

            {/* Info strip */}
            {active && (
              <div className="flex items-center gap-4 mt-10 min-h-6">
                <span className="font-display text-base font-bold text-bss-white tracking-tight">
                  {active.client || (locale === 'sw' ? active.titleSw : active.title)}
                </span>
                <div className="w-px h-4 bg-bss-border" />
                <span className="font-body text-[10px] font-medium tracking-[0.14em] uppercase text-bss-muted">
                  {active.category}
                </span>
                <div className="w-px h-4 bg-bss-border" />
                <span className="font-body text-[10px] text-[#333]">
                  {active.year}
                </span>
              </div>
            )}

            {/* Dot nav */}
            {items.length > 1 && (
              <DotNav
                count={items.length}
                current={current}
                onSelect={handleDotSelect}
              />
            )}
          </div>
        </div>
      </section>
    </>
  )
}