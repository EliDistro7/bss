'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLang } from '../../lib/i18n/LanguageContext'
import clsx from 'clsx'

const TOOLS = [
  {
    href:  '/clip',
    icon:  (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <polygon points="23 7 16 12 23 17 23 7"/>
        <rect x="1" y="5" width="15" height="14" rx="2"/>
      </svg>
    ),
    label:    'Clip Trimmer',
    sublabel: 'Trim YouTube videos',
  },
  {
    href:  '/qr',
    icon:  (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
        <path d="M14 14h3v3M17 20h3M20 17v3"/>
      </svg>
    ),
    label:    'QR Generator',
    sublabel: 'Create QR codes',
  },
  {
    href:  '/sign',
    icon:  (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <path d="M10 13l2 2 4-4"/>
      </svg>
    ),
    label:    'Sign Document',
    sublabel: 'Sign PDFs in-browser',
  },
  {
    href:  '/currency',
    icon:  (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="9"/>
        <path d="M14.8 9A2 2 0 0 0 12 7a2 2 0 0 0 0 4c1.1 0 2 .9 2 2a2 2 0 0 1-2 2 2 2 0 0 1-2.8-1"/>
        <path d="M12 6v2M12 16v2"/>
      </svg>
    ),
    label:    'Currency Converter',
    sublabel: 'Live exchange rates',
  },
]

export default function Navbar() {
  const { t, locale, setLocale } = useLang()
  const pathname = usePathname()
  const [scrolled,   setScrolled]   = useState(false)
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [toolsOpen,  setToolsOpen]  = useState(false)
  const toolsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close tools dropdown on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setToolsOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  // Close dropdown on route change
  useEffect(() => { setToolsOpen(false); setMenuOpen(false) }, [pathname])

  const isToolPath = TOOLS.some(t => pathname === t.href)

  const links = [
    { href: '/',                  label: t.nav.home },
    { href: '/about',             label: t.nav.about },
    { href: '/services/profile',  label: t.nav.services },
    { href: '/portfolio',         label: t.nav.portfolio },
    { href: '/pricing',           label: t.nav.pricing },
    { href: '/contact',           label: t.nav.contact },
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
        <Link href="/" className="group flex items-center gap-3 shrink-0">
          <span className="font-display font-black uppercase leading-none tracking-tighter text-2xl md:text-3xl text-bss-white inline-block transition-transform duration-300">
            BSS
          </span>
          <span className="hidden sm:block font-body text-2xs md:text-xs tracking-widest uppercase text-bss-subtle font-medium border-l border-bss-border pl-3 leading-tight max-w-[7rem]">
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

          {/* Tools dropdown */}
          <div ref={toolsRef} className="relative">
            <button
              onClick={() => setToolsOpen(o => !o)}
              className={clsx(
                'flex items-center gap-1.5 text-xs tracking-wider uppercase font-body font-medium transition-colors duration-200',
                isToolPath || toolsOpen ? 'text-bss-white' : 'text-bss-muted hover:text-bss-white'
              )}
            >
              Tools
              <svg
                width="10" height="10" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                className={clsx('transition-transform duration-200', toolsOpen && 'rotate-180')}
              >
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>

            {/* Dropdown panel */}
            <div className={clsx(
              'absolute top-full right-0 mt-3 w-56 bg-bss-black border border-bss-border',
              'transition-all duration-200 origin-top-right',
              toolsOpen
                ? 'opacity-100 scale-100 pointer-events-auto'
                : 'opacity-0 scale-95 pointer-events-none'
            )}>
              {/* Header */}
              <div className="px-4 py-2.5 border-b border-bss-border">
                <p className="font-body text-[9px] text-bss-muted tracking-[0.16em] font-medium">
                  FREE ONLINE TOOLS
                </p>
              </div>

              {TOOLS.map(tool => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-3 border-b border-bss-border last:border-b-0 transition-colors duration-150 group',
                    pathname === tool.href
                      ? 'bg-bss-card text-bss-white'
                      : 'text-bss-muted hover:bg-bss-card hover:text-bss-white'
                  )}
                >
                  <span className={clsx(
                    'flex-shrink-0 transition-colors duration-150',
                    pathname === tool.href ? 'text-bss-white' : 'text-bss-muted group-hover:text-bss-subtle'
                  )}>
                    {tool.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="font-body text-[12px] font-medium leading-tight">
                      {tool.label}
                    </p>
                    <p className="font-body text-[10px] text-bss-muted leading-tight mt-0.5">
                      {tool.sublabel}
                    </p>
                  </div>
                  {pathname === tool.href && (
                    <div className="ml-auto w-1 h-1 rounded-full bg-bss-white flex-shrink-0" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right: lang + CTA */}
        <div className="hidden md:flex items-center gap-6">
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

          {/* Mobile tools section */}
          <div>
            <p className="font-body text-[9px] text-bss-muted tracking-[0.16em] font-medium mb-3">
              FREE ONLINE TOOLS
            </p>
            <div className="flex flex-col gap-1 border-l border-bss-border pl-4">
              {TOOLS.map(tool => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  onClick={() => setMenuOpen(false)}
                  className={clsx(
                    'flex items-center gap-3 py-2 transition-colors',
                    pathname === tool.href ? 'text-bss-white' : 'text-bss-muted'
                  )}
                >
                  <span className="flex-shrink-0">{tool.icon}</span>
                  <span className="font-body text-sm font-medium">{tool.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <Link href="/contact" onClick={() => setMenuOpen(false)} className="btn-primary text-xs py-3 px-6 self-start mt-2">
            {t.nav.getQuote}
          </Link>
        </div>
      </div>
    </header>
  )
}