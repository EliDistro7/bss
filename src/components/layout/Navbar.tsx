'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useLang } from '../../lib/i18n/LanguageContext'
import clsx from 'clsx'

export default function Navbar() {
  const { t, locale, setLocale } = useLang()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { href: '/',          label: t.nav.home },
    { href: '/about',     label: t.nav.about },
    { href: '/services',  label: t.nav.services },
    { href: '/portfolio', label: t.nav.portfolio },
    { href: '/pricing',   label: t.nav.pricing },
    { href: '/contact',   label: t.nav.contact },
  ]

  return (
    <header
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-bss-black/95 backdrop-blur-sm border-b border-bss-border'
          : 'bg-transparent'
      )}
    >
      <nav className="container-site flex items-center justify-between h-18 md:h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image
            src="/bss-logo.png"
            alt="BSS — Bari Software Services"
            width={40}
            height={40}
            className="w-9 h-9 object-contain"
          />
          <span className="hidden sm:block font-body text-xs tracking-widest uppercase text-bss-subtle font-medium">
            Bari Software Services
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                'text-xs tracking-wider uppercase font-body font-medium transition-colors duration-200',
                pathname === href
                  ? 'text-bss-white'
                  : 'text-bss-muted hover:text-bss-white'
              )}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right: lang + CTA */}
        <div className="hidden md:flex items-center gap-6">
          {/* Language toggle */}
          <button
            onClick={() => setLocale(locale === 'en' ? 'sw' : 'en')}
            className="text-xs tracking-wider uppercase font-body font-medium text-bss-muted hover:text-bss-white transition-colors duration-200"
            aria-label="Switch language"
          >
            {locale === 'en' ? 'SW' : 'EN'}
          </button>

          <Link href="/contact" className="btn-primary text-xs py-3 px-6">
            {t.nav.getQuote}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <div className="flex md:hidden items-center gap-4">
          <button
            onClick={() => setLocale(locale === 'en' ? 'sw' : 'en')}
            className="text-xs tracking-wider uppercase font-body font-medium text-bss-muted"
          >
            {locale === 'en' ? 'SW' : 'EN'}
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex flex-col gap-1.5 p-1"
            aria-label="Toggle menu"
          >
            <span className={clsx('block w-6 h-px bg-bss-white transition-all duration-200', menuOpen && 'rotate-45 translate-y-2')} />
            <span className={clsx('block w-6 h-px bg-bss-white transition-all duration-200', menuOpen && 'opacity-0')} />
            <span className={clsx('block w-6 h-px bg-bss-white transition-all duration-200', menuOpen && '-rotate-45 -translate-y-2')} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={clsx(
        'md:hidden border-t border-bss-border bg-bss-black transition-all duration-300 overflow-hidden',
        menuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
      )}>
        <div className="container-site py-6 flex flex-col gap-6">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={clsx(
                'text-sm tracking-wider uppercase font-body font-medium transition-colors',
                pathname === href ? 'text-bss-white' : 'text-bss-muted'
              )}
            >
              {label}
            </Link>
          ))}
          <Link href="/contact" onClick={() => setMenuOpen(false)} className="btn-primary text-xs py-3 px-6 self-start mt-2">
            {t.nav.getQuote}
          </Link>
        </div>
      </div>
    </header>
  )
}