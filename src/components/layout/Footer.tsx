'use client'

import Link from 'next/link'
import Image from 'next/image'
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
    <footer className="border-t border-bss-border mt-0">
      <div className="container-site py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">

          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <Image src="/bss-logo.png" alt="BSS" width={36} height={36} className="w-8 h-8 object-contain" />
              <span className="font-display text-lg font-bold text-bss-white">BSS</span>
            </Link>
            <p className="body-base max-w-xs mb-6">
              Digital design and development for businesses that want to stand apart. Dar es Salaam, Tanzania.
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs tracking-wider uppercase font-medium text-bss-white hover:text-bss-subtle transition-colors duration-200"
            >
              {t.contact.whatsappLabel} →
            </a>
          </div>

          {/* Nav col 1 */}
          <div>
            <p className="eyebrow mb-5">Navigate</p>
            <ul className="flex flex-col gap-3">
              {col1.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm font-body text-bss-muted hover:text-bss-white transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Nav col 2 */}
          <div>
            <p className="eyebrow mb-5">&nbsp;</p>
            <ul className="flex flex-col gap-3">
              {col2.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm font-body text-bss-muted hover:text-bss-white transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="rule mt-14 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs font-body text-bss-muted">
            © {year} Bari Software Services. All rights reserved.
          </p>
          <p className="text-xs font-body text-bss-muted">
            {t.contact.officeLabel}: {t.contact.officeNumber}
          </p>
        </div>
      </div>
    </footer>
  )
}