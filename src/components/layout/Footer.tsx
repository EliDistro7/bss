'use client'

import Link from 'next/link'
import { useLang } from '../../lib/i18n/LanguageContext'

const WHATSAPP_NUMBER = '255617833806'

export default function Footer() {
  const { t } = useLang()
  const year = new Date().getFullYear()

  const col1 = [
    { href: '/',          label: t.nav.home },
    { href: '/about',     label: t.nav.about },
    { href: '/services',  label: t.nav.services },
  ]
  const col2 = [
    { href: '/portfolio', label: t.nav.portfolio },
    { href: '/pricing',   label: t.nav.pricing },
    { href: '/contact',   label: t.nav.contact },
  ]

  return (
    <footer className="border-t border-bss-border bg-bss-surface">

      {/* ── Big wordmark ─────────────────────────────────────────────── */}
      <div className="border-b border-bss-border overflow-hidden">
        <div className="container-site py-10 md:py-14">
          <h2 className="font-display font-bold leading-none tracking-tightest
                         text-[18vw] md:text-[14vw] lg:text-[11vw]
                         text-bss-white opacity-[0.06] select-none">
            BSS
          </h2>
        </div>
      </div>

      {/* ── Main footer grid ─────────────────────────────────────────── */}
      <div className="container-site pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">

          {/* Brand — takes up half */}
          <div className="md:col-span-6">
            <Link href="/" className="inline-block mb-8">
              <span className="font-display text-4xl md:text-5xl font-bold text-bss-white tracking-tightest">
                Bari Software Services
              </span>
            </Link>
            <p className="body-lead max-w-sm mb-10">
              Digital design and development for businesses that want to stand apart.
              Dar es Salaam, Tanzania.
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary self-start"
            >
              {t.contact.whatsappLabel} →
            </a>
          </div>

          {/* Spacer */}
          <div className="hidden md:block md:col-span-2" />

          {/* Nav col 1 */}
          <div className="md:col-span-2">
            <p className="eyebrow mb-8">Navigate</p>
            <ul className="flex flex-col gap-5">
              {col1.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="font-display text-2xl font-bold text-bss-muted
                               hover:text-bss-white transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Nav col 2 */}
          <div className="md:col-span-2">
            <p className="eyebrow mb-8">&nbsp;</p>
            <ul className="flex flex-col gap-5">
              {col2.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="font-display text-2xl font-bold text-bss-muted
                               hover:text-bss-white transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ───────────────────────────────────────────────── */}
        <div className="rule mt-16 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="font-body text-xs tracking-wider uppercase text-bss-muted">
            © {year} Bari Software Services. All rights reserved.
          </p>
          <p className="font-body text-xs tracking-wider uppercase text-bss-muted">
            {t.contact.officeLabel}: {t.contact.officeNumber}
          </p>
        </div>
      </div>

    </footer>
  )
}