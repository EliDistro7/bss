'use client'

import { useState, useEffect } from 'react'
import { useLang } from '../lib/i18n/LanguageContext'
import { listPortfolio } from '../lib/api/portfolio'
import type { PortfolioItem, PortfolioCategory } from '../lib/api/portfolio'
import PortfolioCard from './PortfolioCard'
import PortfolioModal from './PortfolioModal'
import clsx from 'clsx'

type Filter = 'all' | PortfolioCategory

const FILTERS: Filter[] = ['all', 'profile', 'website', 'app', 'card', 'proposal']

interface Props {
  initialItems: PortfolioItem[]
}

export default function PortfolioClientShell({ initialItems }: Props) {
  const { t, locale } = useLang()
  const [active, setActive] = useState<Filter>('all')
  const [selected, setSelected] = useState<string | null>(null)
  const [items, setItems] = useState<PortfolioItem[]>(initialItems)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Only re-fetch when filter changes (initial load is server-rendered)
  useEffect(() => {
    if (active === 'all' && items === initialItems) return
    setLoading(true)
    setError('')
    listPortfolio(active === 'all' ? undefined : active)
      .then(setItems)
      .catch(() => setError('Failed to load portfolio.'))
      .finally(() => setLoading(false))
  }, [active])

  const selectedItem = items.find(p => p._id === selected)

  return (
    <>
      {/* ── HEADER ────────────────────────────────────────── */}
      <section className="pt-36 pb-16 border-b border-bss-border">
        <div className="container-site">
          <p className="eyebrow">{t.portfolio.eyebrow}</p>
          <h1 className="display-xl max-w-2xl mb-6">{t.portfolio.headline}</h1>
          <p className="body-lead">{t.portfolio.body}</p>
        </div>
      </section>

      {/* ── FILTERS ───────────────────────────────────────── */}
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

      {/* ── GRID ──────────────────────────────────────────── */}
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
                <PortfolioCard
                  key={item._id}
                  item={item}
                  title={locale === 'sw' ? item.titleSw : item.title}
                  onClick={() => setSelected(item._id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedItem && (
        <PortfolioModal item={selectedItem} onClose={() => setSelected(null)} />
      )}
    </>
  )
}