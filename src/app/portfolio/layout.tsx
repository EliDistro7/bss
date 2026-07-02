import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Portfolio | Bari Software Services',
  description:
    'Explore work by Bari Software Services (BSS) — company profiles, websites, mobile apps, business cards, and proposals delivered for clients in Dar es Salaam and across Tanzania.',
  keywords: [
    'BSS portfolio',
    'Bari Software Services work',
    'company profile design Tanzania',
    'website portfolio Dar es Salaam',
    'mobile app portfolio Tanzania',
  ],
  openGraph: {
    title: 'Portfolio | Bari Software Services',
    description:
      'A look at company profiles, websites, mobile apps, business cards, and proposals built by BSS for clients across Tanzania.',
    type: 'website',
    url: 'https://bari-software-services.online/portfolio',
  },
  alternates: {
    canonical: 'https://bari-software-services.online/portfolio',
  },
}

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}