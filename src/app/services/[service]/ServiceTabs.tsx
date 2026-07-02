'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useLang } from '../../../lib/i18n/LanguageContext'
import clsx from 'clsx'

type ServiceKey = 'profile' | 'website' | 'app' | 'card' | 'proposal'

const SERVICE_IMAGES: Record<ServiceKey, string> = {
  profile:  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&q=80',
  website:  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=900&q=80',
  app:      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=900&q=80',
  card:     'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=900&q=80',
  proposal: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=900&q=80',
}

const TAB_KEYS: ServiceKey[] = ['profile', 'website', 'app', 'card', 'proposal']

export default function ServiceTabs({ activeService }: { activeService: ServiceKey }) {
  const { t } = useLang()
  const router = useRouter()
  const svc = t.services[activeService]

  return (
    <>
      {/* ── HEADER ───────────────────────────────────────── */}
      <section className="pt-36 pb-16 border-b border-bss-border">
        <div className="container-site">
          <p className="eyebrow">{t.services.eyebrow}</p>
          <h1 className="display-xl max-w-2xl mb-6">{t.services.headline}</h1>
          <p className="body-lead">{t.services.body}</p>
        </div>
      </section>

      {/* ── TABS ─────────────────────────────────────────── */}
      <section className="border-b border-bss-border sticky top-[72px] bg-bss-black z-30">
        <div className="container-site">
          <div className="flex gap-8 overflow-x-auto scrollbar-none">
            {TAB_KEYS.map((key) => (
              <button
                key={key}
                onClick={() => router.push(`/services/${key}`)}
                className={clsx('tab-btn', activeService === key && 'active')}
              >
                {t.services.tabs[key]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICE DETAIL ───────────────────────────────── */}
      <section className="section-pad">
        <div className="container-site">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="display-md mb-6">{svc.headline}</h2>
              <p className="body-lead mb-10">{svc.body}</p>

              <p className="eyebrow mb-4">{t.common.includes}</p>
              <ul className="flex flex-col gap-3 mb-10">
                {svc.includes.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm font-body text-bss-subtle">
                    <span className="mt-1 w-1 h-1 rounded-full bg-bss-muted shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex gap-4">
                <Link href="/pricing" className="btn-primary">
                  {t.pricing.ctaButton}
                </Link>
                <Link href="/contact" className="btn-ghost">
                  {t.common.contactUs}
                </Link>
              </div>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                key={activeService}
                src={SERVICE_IMAGES[activeService]}
                alt={svc.headline}
                fill
                className="object-cover opacity-70"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}