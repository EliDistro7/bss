'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useLang } from '../../lib/i18n/LanguageContext'
import { projects, ProjectCategory } from '../../lib/data/projects'
import clsx from 'clsx'

type Filter = 'all' | ProjectCategory

const FILTERS: Filter[] = ['all', 'profile', 'website', 'app', 'card', 'proposal']

export default function PortfolioPage() {
  const { t, locale } = useLang()
  const [active, setActive] = useState<Filter>('all')
  const [selected, setSelected] = useState<string | null>(null)

  const filtered = active === 'all' ? projects : projects.filter(p => p.category === active)
  const selectedProject = projects.find(p => p.id === selected)

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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-bss-border">
            {filtered.map((project) => (
              <button
                key={project.id}
                onClick={() => setSelected(project.id)}
                className="group relative block aspect-[4/3] bg-bss-black overflow-hidden text-left"
              >
                <Image
                  src={project.image}
                  alt={locale === 'sw' ? project.titleSw : project.title}
                  fill
                  className="object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bss-black/90 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-2xs tracking-wider uppercase font-medium text-bss-muted mb-1">{project.client} · {project.year}</p>
                  <p className="font-display text-lg font-bold text-bss-white leading-tight">
                    {locale === 'sw' ? project.titleSw : project.title}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── DETAIL MODAL ─────────────────────────────────── */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 bg-bss-black/90 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-bss-surface border border-bss-border w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video">
              <Image
                src={selectedProject.image}
                alt={selectedProject.title}
                fill
                className="object-cover opacity-80"
              />
            </div>
            <div className="p-8">
              <p className="eyebrow mb-2">{selectedProject.client} · {selectedProject.year}</p>
              <h2 className="font-display text-2xl font-bold text-bss-white mb-4">
                {locale === 'sw' ? selectedProject.titleSw : selectedProject.title}
              </h2>
              <p className="body-base">
                {locale === 'sw' ? selectedProject.descriptionSw : selectedProject.description}
              </p>
              <button
                onClick={() => setSelected(null)}
                className="mt-8 text-xs tracking-wider uppercase font-medium text-bss-muted hover:text-bss-white transition-colors"
              >
                ← Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}