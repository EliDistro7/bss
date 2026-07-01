'use client'

import Image from 'next/image'
import clsx from 'clsx'
import type { PortfolioItem, PortfolioCategory } from '../lib/api/portfolio'

interface PortfolioCardProps {
  item: PortfolioItem
  title: string
  onClick: () => void
}

const DOCUMENT_CATEGORIES: PortfolioCategory[] = ['profile', 'card', 'proposal']

export default function PortfolioCard({ item, title, onClick }: PortfolioCardProps) {
  const isDocument = DOCUMENT_CATEGORIES.includes(item.category)

  return (
    <button
      onClick={onClick}
      className="card overflow-hidden flex flex-col text-left w-full
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-bss-white focus-visible:ring-inset"
    >
      <div
        className={clsx(
          'group relative bg-bss-surface overflow-hidden',
          isDocument ? 'sm:aspect-[4/3]' : 'aspect-[4/3]'
        )}
      >
        {item.coverUrl ? (
          isDocument ? (
            <>
              {/* Mobile: natural size, normal flow — image itself sets the box's height */}
              <Image
                src={item.coverUrl}
                alt={title}
                width={800}
                height={1131}
                sizes="100vw"
                className="block sm:hidden w-full h-auto group-hover:opacity-90 transition-opacity duration-500"
              />
              {/* sm+: cropped fill, same as every other card */}
              <Image
                src={item.coverUrl}
                alt={title}
                fill
                sizes="(max-width: 1024px) 50vw, 33vw"
                className="hidden sm:block object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </>
          ) : (
            <Image
              src={item.coverUrl}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )
        ) : (
          <div
            className={clsx(
              isDocument ? 'aspect-[4/3] sm:absolute sm:inset-0 sm:aspect-auto' : 'absolute inset-0',
              'flex items-center justify-center'
            )}
          >
            <span className="text-2xs tracking-widest uppercase text-bss-muted">No cover</span>
          </div>
        )}

        {item.epubKey && (
          <span className="absolute top-3 right-3 text-2xs tracking-widest uppercase px-2 py-1 bg-bss-white text-bss-black font-medium">
            PDF
          </span>
        )}
      </div>

      <div className="p-5">
        {/* <p className="text-2xs tracking-wider uppercase font-medium text-bss-muted mb-1">
          {item.client} · {item.year}
        </p> */}
        <p className="font-display text-lg font-bold text-bss-white leading-tight line-clamp-2">
          {title}
        </p>
      </div>
    </button>
  )
}