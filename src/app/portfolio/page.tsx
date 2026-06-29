'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useLang } from '../../lib/i18n/LanguageContext'
import { listPortfolio } from '../../lib/api/portfolio'
import type { PortfolioItem, PortfolioCategory } from '../../lib/api/portfolio'
import clsx from 'clsx'

type Filter = 'all' | PortfolioCategory

const FILTERS: Filter[] = ['all', 'profile', 'website', 'app', 'card', 'proposal']

export default function PortfolioPage() {
  const { t, locale } = useLang()
  const [active, setActive] = useState<Filter>('all')
  const [selected, setSelected] = useState<string | null>(null)
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    listPortfolio(active === 'all' ? undefined : active)
      .then(setItems)
      .catch(() => setError('Failed to load portfolio.'))
      .finally(() => setLoading(false))
  }, [active])

  // Lock body scroll when modal open
  useEffect(() => {
    if (selected) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [selected])

  // Close modal on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const selectedItem = items.find(p => p._id === selected)

  return (
    <>
      {/* ── HEADER ───────────────────────────────────────── */}
      <section className="pt-36 pb-16 border-b border-bss-border">
        <div className="container-site">
          <p className="eyebrow">{t.portfolio.eyebrow}</p>
          <h1 className="display-xl max-w-2xl mb-6">{t.portfolio.headline}</h1>
          <p className="body-lead">{t.portfolio.body}</p>
        </div>
      </section>

      {/* ── FILTER TABS ──────────────────────────────────── */}
      <section className="border-b border-bss-border sticky top-[72px] bg-bss-black z-30">
        <div className="container-site">
          <div className="flex gap-8 overflow-x-auto">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={clsx('tab-btn', active === f && 'active')}
              >
                {t.portfolio.filters[f]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── GRID ─────────────────────────────────────────── */}
      <section className="section-pad">
        <div className="container-site">
          {loading && (
            <p className="text-2xs tracking-widest uppercase text-bss-muted animate-pulse">
              Loading…
            </p>
          )}

          {error && (
            <p className="text-sm text-red-400" role="alert">{error}</p>
          )}

          {!loading && !error && items.length === 0 && (
            <p className="body-base text-bss-muted">No items found.</p>
          )}

          {!loading && !error && items.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-bss-border">
              {items.map((item) => (
                <button
                  key={item._id}
                  onClick={() => setSelected(item._id)}
                  className="group relative block aspect-[4/3] bg-bss-black overflow-hidden text-left"
                >
                  {item.coverUrl ? (
                    <Image
                      src={item.coverUrl}
                      alt={locale === 'sw' ? item.titleSw : item.title}
                      fill
                      className="object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-bss-surface">
                      <span className="text-2xs tracking-widest uppercase text-bss-muted">No cover</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-bss-black/90 via-transparent to-transparent" />

                  {/* EPUB badge */}
                  {item.epubKey && (
                    <span className="absolute top-3 right-3 text-2xs tracking-widest uppercase px-2 py-1 bg-bss-white text-bss-black font-medium">
                      EPUB
                    </span>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="text-2xs tracking-wider uppercase font-medium text-bss-muted mb-1">
                      {item.client} · {item.year}
                    </p>
                    <p className="font-display text-lg font-bold text-bss-white leading-tight">
                      {locale === 'sw' ? item.titleSw : item.title}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── DETAIL MODAL ─────────────────────────────────── */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-bss-black/90 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-bss-surface border border-bss-border w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedItem.coverUrl && (
              <div className="relative aspect-video">
                <Image
                  src={selectedItem.coverUrl}
                  alt={selectedItem.title}
                  fill
                  className="object-cover opacity-80"
                />
              </div>
            )}

            <div className="p-8">
              <p className="eyebrow mb-2">{selectedItem.client} · {selectedItem.year}</p>
              <h2 className="font-display text-2xl font-bold text-bss-white mb-4">
                {locale === 'sw' ? selectedItem.titleSw : selectedItem.title}
              </h2>
              <p className="body-base">
                {locale === 'sw' ? selectedItem.descriptionSw : selectedItem.description}
              </p>

              <div className="mt-8 flex items-center gap-4 flex-wrap">
                {selectedItem.epubKey && (
                  <Link
                    href={`/read/${selectedItem._id}`}
                    className="inline-flex items-center gap-2 text-xs tracking-wider uppercase font-medium
                               text-bss-black bg-bss-white px-5 py-2.5
                               hover:bg-bss-offwhite transition-colors duration-200"
                  >
                    Read online →
                  </Link>
                )}
                <button
                  onClick={() => setSelected(null)}
                  className="text-xs tracking-wider uppercase font-medium text-bss-muted hover:text-bss-white transition-colors"
                >
                  ← Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}