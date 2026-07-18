'use client'

import { useRef, useEffect, useState } from 'react'

interface AppCard {
  id: string
  name: string
  swahiliTagline: string       // Hook in Swahili
  englishTagline: string       // English sub-line
  problem: string              // The pain it solves (Swahili)
  solution: string             // What it does (Swahili)
  audience: string             // Who it's for (Swahili)
  videoSrc: string
  accent: string
  offset: string
  icon: string                 // Emoji icon for quick recognition
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
    swahiliTagline: 'Simamia matawi yako yote mahali pamoja',
    englishTagline: 'Multi-branch accounting & management',
    problem: 'Una matawi mengi lakini hesabu zinakusanyika ovyo ovyo?',
    solution: 'BizLink inaunganisha matawi yote — hesabu, mauzo, na ripoti — kwenye simu moja.',
    audience: 'Kwa wafanyabiashara wenye maduka au ofisi zaidi ya moja.',
    videoSrc: '/videos/bizlink.mp4',
    accent: '#10B981',
    offset: '-translate-y-8',
    icon: '🏢',
  },
  {
    id: 'events',
    name: 'Events',
    swahiliTagline: 'Usimamie matukio yako bila msongo',
    englishTagline: 'Registration, ticketing & card scanning',
    problem: 'Wasiwasi wa usajili, tiketi bandia, na foleni ndefu mlangoni?',
    solution: 'Scan kadi, thibitisha tiketi, na fuatilia wasajiliwa — yote kwa wakati halisi.',
    audience: 'Kwa waandaaji wa conferences, mafunzo, na matukio ya biashara.',
    videoSrc: '/videos/events.mp4',
    accent: '#6C63FF',
    offset: 'translate-y-0',
    icon: '🎟️',
  },
  {
    id: 'manereja',
    name: 'Manereja',
    swahiliTagline: 'Wafanyakazi, kazi, na fedha — app moja',
    englishTagline: 'Attendance, task management & finance',
    problem: 'Unafuatilia mahudhurio kwa karatasi? Mishahara inachukua muda mwingi?',
    solution: 'Manereja inarekodia mahudhurio, inagawanya kazi, na inakokotoa mishahara kiotomatiki.',
    audience: 'Kwa maofisi, warsha, na biashara zenye wafanyakazi 5 hadi 200.',
    videoSrc: '/videos/manereja.mp4',
    accent: '#F59E0B',
    offset: 'translate-y-4',
    icon: '👥',
  },
  {
    id: 'construction',
    name: 'ConstructLink',
    swahiliTagline: 'Miradi ya ujenzi chini ya udhibiti wako',
    englishTagline: 'Construction & real estate management',
    problem: 'Miradi inachelewa? Gharama zinapanda bila wewe kujua?',
    solution: 'Fuatilia kila hatua ya ujenzi, gharama, na wafanyakazi — eneo kwa eneo.',
    audience: 'Kwa wakandarasi, wasanifu, na wakuza mali.',
    videoSrc: '/videos/construction.mp4',
    accent: '#EF4444',
    offset: '-translate-y-12',
    icon: '🏗️',
  },
]

function PhoneCard({ app, index }: { app: AppCard; index: number }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.load()
  }, [])

  return (
    <div
      className={`relative flex-shrink-0 w-[200px] sm:w-[220px] ${app.offset} transition-transform duration-700 group`}
      style={{ animationDelay: `${index * 120}ms` }}
    >
      {/* Phone shell */}
      <div
        className="relative rounded-[2.4rem] bg-[#111] border border-white/10 shadow-2xl overflow-hidden cursor-pointer"
        style={{ aspectRatio: '9/19.5' }}
        onClick={() => setExpanded(!expanded)}
      >
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
          {!videoLoaded && (
            <div className="absolute inset-0 bg-[#1a1a1a] flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white/40 animate-spin" />
            </div>
          )}
        </div>

        {/* Bottom overlay with app name */}
        <div className="absolute bottom-0 left-0 right-0 z-30 px-4 pb-5 pt-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px]">{app.icon}</span>
            <p className="text-[9px] uppercase tracking-[0.15em] font-medium" style={{ color: app.accent }}>
              BSS ·
            </p>
          </div>
          <p className="text-white font-bold text-sm leading-tight mb-1">{app.name}</p>
          <p className="text-white/60 text-[9px] leading-tight">{app.englishTagline}</p>
        </div>

        {/* Screen glare */}
        <div
          className="absolute top-0 left-0 right-0 h-1/3 z-20 pointer-events-none"
          style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.06) 0%, transparent 60%)' }}
        />
      </div>

      {/* Sales pitch card below phone */}
      <div className="mt-5 space-y-3">
        {/* Swahili hook */}
        <p className="text-sm font-semibold text-white leading-snug">
          {app.swahiliTagline}
        </p>

        {/* Problem line */}
        <div className="border-l-2 pl-3" style={{ borderColor: app.accent }}>
          <p className="text-[11px] text-[#999] leading-relaxed italic">
            {app.problem}
          </p>
        </div>

        {/* Solution */}
        <p className="text-[11px] text-[#bbb] leading-relaxed">
          {app.solution}
        </p>

        {/* Audience pill */}
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium"
          style={{
            backgroundColor: `${app.accent}18`,
            color: app.accent,
            border: `1px solid ${app.accent}30`
          }}
        >
          <span className="w-1 h-1 rounded-full inline-block" style={{ backgroundColor: app.accent }} />
          {app.audience}
        </div>

        {/* CTA — WhatsApp */}
        <a
          href={whatsappLink(app.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-[11px] font-semibold py-2.5 border transition-all duration-200 hover:opacity-80 tracking-wide uppercase"
          style={{
            color: app.accent,
            borderColor: `${app.accent}40`,
            background: `${app.accent}10`,
          }}
        >
          {/* WhatsApp icon — matches site's inline SVG pattern */}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Omba demo ya {app.name}
        </a>
      </div>
    </div>
  )
}

export default function MobileShowcase() {
  return (
    <section className="border-t border-bss-border overflow-hidden">
      <div className="container-site section-pad">
        {/* Section header — bilingual */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16 md:mb-20">
          <div>
            <p className="eyebrow mb-3">Programu zetu · Our apps</p>
            <h2 className="display-md max-w-sm">
              Tuntengeneza Apps<br />
              <span className="text-bss-muted">zinazofanya kazi kwenye ubora wa hali ya juu.</span>
            </h2>
            <p className="mt-4 text-sm text-bss-muted max-w-[32ch] leading-relaxed">
              We don't sell templates. Every app is custom-built for your exact business — from scratch, in Dar es Salaam.
            </p>
          </div>

          {/* Trust signal block */}
          <div className="flex flex-col gap-3 sm:items-end">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">4</p>
                <p className="text-[10px] text-bss-muted uppercase tracking-wider">Apps zilizotumwa</p>
              </div>
              <div className="w-px h-8 bg-bss-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-white">100+</p>
                <p className="text-[10px] text-bss-muted uppercase tracking-wider">Watumiaji hai</p>
              </div>
              <div className="w-px h-8 bg-bss-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-white">Dar</p>
                <p className="text-[10px] text-bss-muted uppercase tracking-wider">Ilipoundwa</p>
              </div>
            </div>
            <p className="text-xs text-bss-muted sm:text-right max-w-[28ch] leading-relaxed">
              Programu zetu zinatumiwa siku hadi siku — kwenye maeneo ya ujenzi, ofisi za matawi, na mikutano ya biashara.
            </p>
          </div>
        </div>
      </div>

      {/* Phone strip — full bleed */}
      <div className="relative">
        {/* Edge fades */}
        <div
          className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, var(--color-bss-black, #0a0a0a), transparent)' }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, var(--color-bss-black, #0a0a0a), transparent)' }}
        />

        <div className="flex justify-start sm:justify-center items-start gap-6 sm:gap-10 px-10 pb-24 overflow-x-auto no-scrollbar">
          {APPS.map((app, i) => (
            <PhoneCard key={app.id} app={app} index={i} />
          ))}
        </div>
      </div>

      {/* Bottom CTA band */}
      <div className="container-site">
        <div className="border border-bss-border rounded-2xl p-6 sm:p-8 mb-8 bg-white/[0.02] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <p className="text-white font-semibold text-base mb-1">
              Una wazo la programu yako mwenyewe?
            </p>
            <p className="text-bss-muted text-sm">
              We build custom software for any business — not just the four above. Let's talk.
            </p>
          </div>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Habari BSS, nina wazo la programu ya biashara yangu. Tunaweza kuzungumza?')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost flex-shrink-0 flex items-center gap-2"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Zungumza nasi leo
          </a>
        </div>

        {/* Hairline footer */}
        <div className="border-t border-bss-border pt-5 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p className="text-xs text-bss-muted tracking-wider uppercase">Flutter & Node.js · 4 production apps</p>
          <p className="text-xs text-bss-muted">Imetengenezwa na BSS · Dar es Salaam, Tanzania</p>
        </div>
      </div>
    </section>
  )
}