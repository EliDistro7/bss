'use client'

import { useRef, useEffect, useState } from 'react'

interface AppCard {
  id: string
  name: string
  description: string
  videoSrc: string
  accent: string
  offset: string
}

const WHATSAPP_NUMBER = '255617833806'

function whatsappLink(appName: string) {
  const message = `Habari BSS, ningependa kuona demo ya *${appName}*. Mnaweza kunisaidia?`
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

const APPS: AppCard[] = [
  {
    id: 'bizlink',
    name: 'BizLink',
    description: 'Multi-branch accounting & management',
    videoSrc: '/videos/bizlink.mp4',
    accent: '#10B981',
    offset: '-translate-y-8',
  },
  {
    id: 'events',
    name: 'Events',
    description: 'Registration, ticketing & card scanning',
    videoSrc: '/videos/events.mp4',
    accent: '#6C63FF',
    offset: 'translate-y-0',
  },
  {
    id: 'manereja',
    name: 'Manereja',
    description: 'Attendance, task management & payroll',
    videoSrc: '/videos/manereja.mp4',
    accent: '#F59E0B',
    offset: 'translate-y-4',
  },
  {
    id: 'construction',
    name: 'ConstructLink',
    description: 'Construction & real estate management',
    videoSrc: '/videos/construction.mp4',
    accent: '#EF4444',
    offset: '-translate-y-12',
  },
]

function PhoneCard({ app, index }: { app: AppCard; index: number }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)

  useEffect(() => {
    videoRef.current?.load()
  }, [])

  return (
    <div
      className={`flex-shrink-0 w-[180px] sm:w-[200px] ${app.offset}`}
      style={{ animationDelay: `${index * 120}ms` }}
    >
      {/* Phone shell */}
      <div
        className="relative rounded-[2.2rem] bg-[#1a1a1a] border border-[#3a3a3a] overflow-hidden"
        style={{ aspectRatio: '9/19.5' }}
      >
        {/* Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 w-[64px] h-[20px] bg-[#1a1a1a] rounded-full border border-[#2a2a2a]" />

        {/* Video */}
        <div className="absolute inset-0 z-10 overflow-hidden rounded-[2.2rem]">
          <video
            ref={videoRef}
            src={app.videoSrc}
            autoPlay
            muted
            loop
            playsInline
            onCanPlay={() => setVideoLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-500 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
          {!videoLoaded && (
            <div className="absolute inset-0 bg-[#1a1a1a] flex items-center justify-center">
              <div className="w-6 h-6 rounded-full border border-[#3a3a3a] border-t-[#666] animate-spin" />
            </div>
          )}
        </div>

        {/* Bottom label */}
        <div className="absolute bottom-0 left-0 right-0 z-30 px-4 pb-5 pt-12 bg-gradient-to-t from-black/80 to-transparent">
          <p
            className="text-[10px] font-medium tracking-wider mb-0.5"
            style={{ color: app.accent, fontFamily: 'var(--font-body)' }}
          >
            BSS
          </p>
          <p className="text-white text-sm font-semibold" style={{ fontFamily: 'var(--font-body)' }}>
            {app.name}
          </p>
        </div>
      </div>

      {/* Caption below phone */}
      <div className="mt-5 space-y-4">
        <p
          className="text-xs leading-relaxed"
          style={{ color: '#888888', fontFamily: 'var(--font-body)', fontWeight: 300 }}
        >
          {app.description}
        </p>

        <a
          href={whatsappLink(app.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2 text-[11px] transition-colors duration-200"
          style={{ color: '#666666', fontFamily: 'var(--font-body)' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0 group-hover:opacity-80" style={{ color: app.accent }}>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <span className="group-hover:text-white transition-colors duration-200">Request demo</span>
        </a>
      </div>
    </div>
  )
}

export default function MobileShowcase() {
  return (
    <section className="border-t border-[#3a3a3a] overflow-hidden">
      {/* Header */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 py-24 md:py-36">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-10">
          <div>
            <h2
              className="text-3xl md:text-4xl font-bold leading-snug text-white"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
            >
              Four apps.<br />
              <span style={{ color: '#666666' }}>Built in Dar es Salaam.</span>
            </h2>
          </div>

          <p
            className="text-sm max-w-[30ch] leading-relaxed sm:text-right"
            style={{ color: '#888888', fontFamily: 'var(--font-body)', fontWeight: 300 }}
          >
            Custom software for Tanzanian businesses — not templates, not off-the-shelf.
          </p>
        </div>
      </div>

      {/* Phone strip — full bleed */}
      <div className="relative">
        {/* Edge fades */}
        <div
          className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #222222, transparent)' }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #222222, transparent)' }}
        />

        <div
          className="flex justify-start sm:justify-center items-start gap-8 sm:gap-12 px-12 pb-28 overflow-x-auto"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {APPS.map((app, i) => (
            <PhoneCard key={app.id} app={app} index={i} />
          ))}
        </div>
      </div>

      {/* Footer band */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 pb-20">
        <div className="border-t border-[#3a3a3a] pt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <p
            className="text-xs"
            style={{ color: '#666666', fontFamily: 'var(--font-body)', fontWeight: 300 }}
          >
            Flutter · Node.js · Dar es Salaam
          </p>

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Habari BSS, nina wazo la programu ya biashara yangu. Tunaweza kuzungumza?')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 border border-[#3a3a3a] text-white text-sm font-medium tracking-wide transition-all duration-200 hover:border-white"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Build your app
          </a>
        </div>
      </div>
    </section>
  )
}