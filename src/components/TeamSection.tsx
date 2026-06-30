'use client'

import Image from 'next/image'
import { useLang } from '../lib/i18n/LanguageContext'

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
    img: '/team/nyakato.png',
  },
]

export default function TeamSection() {
  const { t } = useLang()

  return (
    <section className="section-pad border-t border-bss-border">
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
  )
}