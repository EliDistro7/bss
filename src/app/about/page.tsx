'use client'

import Image from 'next/image'
import { useLang } from '../../lib/i18n/LanguageContext'

const TEAM = [
  {
    name: 'Bari Kaneno',
    role: 'Founder & Lead Developer',
    img: '/team/bari.png',
  },
  {
    name: 'Merryness Melchiory',
    role: 'Secretary',
    img: '/team/merry.png',
  },
  {
    name: 'Nyakato Gaudentia',
    role: 'Advisor',
    img: '/team/nayakat.png',
  },
]

export default function AboutPage() {
  const { t } = useLang()

  return (
    <>
      {/* ── HEADER ───────────────────────────────────────── */}
      <section className="pt-36 pb-20 border-b border-bss-border">
        <div className="container-site">
          <p className="eyebrow">{t.about.eyebrow}</p>
          <h1 className="display-xl max-w-2xl mb-8">{t.about.headline}</h1>
          <p className="body-lead max-w-prose">{t.about.body}</p>
        </div>
      </section>

      {/* ── IMAGE ────────────────────────────────────────── */}
      <section>
        <div className="container-site py-0">
          <div className="relative w-full aspect-[16/6] overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=80"
              alt="BSS studio"
              fill
              className="object-cover opacity-60"
            />
          </div>
        </div>
      </section>

      {/* ── MISSION / VISION ─────────────────────────────── */}
      <section className="section-pad border-b border-bss-border">
        <div className="container-site">
          <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-bss-border">
            <div className="pb-10 md:pb-0 md:pr-16">
              <p className="eyebrow mb-3">{t.about.missionLabel}</p>
              <p className="font-display text-2xl md:text-3xl font-bold text-bss-white leading-snug">
                {t.about.missionText}
              </p>
            </div>
            <div className="pt-10 md:pt-0 md:pl-16">
              <p className="eyebrow mb-3">{t.about.visionLabel}</p>
              <p className="font-display text-2xl md:text-3xl font-bold text-bss-white leading-snug">
                {t.about.visionText}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TEAM ─────────────────────────────────────────── */}
      <section className="section-pad">
        <div className="container-site">
          <p className="eyebrow">{t.about.teamHeadline}</p>
          <h2 className="display-md mb-14">{t.about.teamHeadline}</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-bss-border">
            {TEAM.map(({ name, role, img }) => (
              <div key={name} className="bg-bss-black p-8 group">
                <div className="relative w-full aspect-square mb-6 overflow-hidden">
                  <Image
                    src={img}
                    alt={name}
                    fill
                    className="object-cover grayscale opacity-70 group-hover:opacity-90 group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                <p className="font-display text-xl font-bold text-bss-white mb-1">{name}</p>
                <p className="text-xs tracking-wider uppercase font-body font-medium text-bss-muted">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}