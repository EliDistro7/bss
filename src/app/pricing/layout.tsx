import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing | Bari Software Services',
  description:
    'Transparent pricing for company profiles, websites, mobile apps, business cards, and proposals — Bari Software Services, Dar es Salaam, Tanzania.',
  keywords: [
    'BSS pricing',
    'company profile price Tanzania',
    'website design cost Dar es Salaam',
    'mobile app price Tanzania',
    'affordable software services Tanzania',
  ],
  openGraph: {
    title: 'Pricing | Bari Software Services',
    description:
      'Clear, upfront pricing for company profiles, websites, mobile apps, business cards, and proposals — BSS, Dar es Salaam.',
    type: 'website',
    url: 'https://bari-software-services.online/pricing',
  },
  alternates: {
    canonical: 'https://bari-software-services.online/pricing',
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}