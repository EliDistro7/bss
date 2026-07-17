'use client'

import { useRef, useEffect, useState } from 'react'

interface AppCard {
  id: string
  name: string
  tagline: string
  videoSrc: string
  accent: string        // Tailwind arbitrary color for the subtle glow
  offset: string        // vertical translate class
}

const APPS: AppCard[] = [
  {
    id: 'events',
    name: 'Events',
    tagline: 'Registration & card scanning',
    videoSrc: '/videos/events.mp4',
    accent: '#6C63FF',  // indigo — for events/ticketing feel
    offset: 'translate-y-0',
  },
  {
    id: 'bizlink',
    name: 'BizLink',
    tagline: 'Multi-branch accounting',
    videoSrc: '/videos/bizlink.mp4',
    accent: '#10B981',  // emerald — finance/growth
    offset: '-translate-y-8',
  },
  {
    id: 'manereja',
    name: 'Manereja',
    tagline: 'Attendance, tasks & finance',
    videoSrc: '/videos/manereja.mp4',
    accent: '#F59E0B',  // amber — operations/management
    offset: 'translate-y-4',
  },
  {
    id: 'construction',
    name: 'ConstructLink',
    tagline: 'Construction & real estate',
    videoSrc: '/videos/construction.mp4',
    accent: '#EF4444',  // red — construction/site feel
    offset: '-translate-y-12',
  },
]

function PhoneCard({ app, index }: { app: AppCard; index: number }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.load()
  }, [])

  return (
    <div
      className={`relative flex-shrink-0 w-[200px] sm:w-[220px] ${app.offset} transition-transform duration-700`}
      style={{ animationDelay: `${index * 120}ms` }}
    >
      {/* Phone shell */}
      <div className="relative rounded-[2.4rem] bg-[#111] border border-white/10 shadow-2xl overflow-hidden"
           style={{ aspectRatio: '9/19.5' }}>

        {/* Subtle color glow behind screen */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 30%, ${app.accent}55 0%, transparent 70%)` }}
        />

        {/* Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 w-[72px] h-[22px] bg-[#111] rounded-full border border-white/10" />

        {/* Screen / video area */}
        <div className="absolute inset-0 z-10 overflow-hidden rounded-[2.4rem]">
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
          {/* Placeholder when video hasn't loaded */}
          {!videoLoaded && (
            <div className="absolute inset-0 bg-[#1a1a1a] flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white/40 animate-spin" />
            </div>
          )}
        </div>

        {/* App name badge — bottom overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-30 px-4 pb-5 pt-10 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
          <p className="text-[10px] uppercase tracking-[0.15em] font-medium mb-0.5"
             style={{ color: app.accent }}>
            BSS ·
          </p>
          <p className="text-white font-display font-bold text-base leading-tight">
            {app.name}
          </p>
        </div>

        {/* Subtle screen glare */}
        <div className="absolute top-0 left-0 right-0 h-1/3 z-20 pointer-events-none"
             style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.06) 0%, transparent 60%)' }} />
      </div>

      {/* Tagline below phone */}
      <div className="mt-5 px-1">
        <p className="text-xs text-[#666] tracking-wide leading-snug">{app.tagline}</p>
      </div>
    </div>
  )
}

export default function MobileShowcase() {
  return (
    <section className="border-t border-bss-border overflow-hidden">
      <div className="container-site section-pad">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-16 md:mb-20">
          <div>
            <p className="eyebrow mb-3">Our apps</p>
            <h2 className="display-md max-w-xs">
              Built for the field.<br />
              <span className="text-bss-muted">Designed for clarity.</span>
            </h2>
          </div>
          <p className="body-base text-bss-muted max-w-[28ch] sm:text-right">
            Every app we ship runs on real hardware, in real conditions — events floors, branch offices, and construction sites.
          </p>
        </div>
      </div>

      {/* Phone strip — breaks out of container for immersive feel */}
      <div className="relative">
        {/* Edge fade — left */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 z-10 pointer-events-none"
             style={{ background: 'linear-gradient(to right, var(--color-bss-black, #0a0a0a), transparent)' }} />
        {/* Edge fade — right */}
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 z-10 pointer-events-none"
             style={{ background: 'linear-gradient(to left, var(--color-bss-black, #0a0a0a), transparent)' }} />

        <div className="flex justify-center items-start gap-5 sm:gap-8 px-8 pb-20 overflow-x-auto no-scrollbar">
          {APPS.map((app, i) => (
            <PhoneCard key={app.id} app={app} index={i} />
          ))}
        </div>
      </div>

      {/* Hairline + micro-copy closer */}
      <div className="container-site">
        <div className="border-t border-bss-border pt-6 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-bss-muted tracking-wider uppercase">4 production apps · Flutter & Node.js</p>
          <p className="text-xs text-bss-muted">Custom-built by BSS · Dar es Salaam</p>
        </div>
      </div>
    </section>
  )
}