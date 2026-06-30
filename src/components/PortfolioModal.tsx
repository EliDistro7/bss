'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useLang } from '../lib/i18n/LanguageContext'
import type { PortfolioItem } from '../lib/api/portfolio'

interface PortfolioModalProps {
  item: PortfolioItem
  onClose: () => void
}

export default function PortfolioModal({ item, onClose }: PortfolioModalProps) {
  const { locale } = useLang()
  const modalRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement
    document.body.style.overflow = 'hidden'
    requestAnimationFrame(() => closeBtnRef.current?.focus())

    return () => {
      document.body.style.overflow = ''
      previousFocusRef.current?.focus()
    }
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
        if (focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const title = locale === 'sw' ? item.titleSw : item.title
  const description = locale === 'sw' ? item.descriptionSw : item.description

  return (
    <div
      className="fixed inset-0 z-50 bg-bss-black/90 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="portfolio-modal-title"
        className="relative bg-bss-surface border border-bss-border w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeBtnRef}
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center
                     bg-bss-black/60 text-bss-white text-lg leading-none
                     hover:bg-bss-black/80 transition-colors duration-150
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-bss-white"
        >
          ×
        </button>

        {item.coverUrl && (
          <div className="relative aspect-video">
            <Image src={item.coverUrl} alt={title} fill className="object-cover opacity-80" />
          </div>
        )}

        <div className="p-8">
          <p className="eyebrow mb-2">{item.client} · {item.year}</p>
          <h2 id="portfolio-modal-title" className="font-display text-2xl font-bold text-bss-white mb-4">
            {title}
          </h2>
          <p className="body-base">{description}</p>

          <div className="mt-8 flex items-center gap-4 flex-wrap">
            {item.epubKey && (
              <Link
                href={`/read/${item._id}`}
                className="inline-flex items-center gap-2 text-xs tracking-wider uppercase font-medium
                           text-bss-black bg-bss-white px-5 py-2.5
                           hover:bg-bss-offwhite transition-colors duration-200"
              >
                Read online →
              </Link>
            )}
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs tracking-wider uppercase font-medium
                           text-bss-white border border-bss-border px-5 py-2.5
                           hover:border-bss-subtle transition-colors duration-200"
              >
                Visit live site →
              </a>
            )}
            <button
              onClick={onClose}
              className="text-xs tracking-wider uppercase font-medium text-bss-muted hover:text-bss-white transition-colors"
            >
              ← Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}