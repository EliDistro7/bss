// app/about/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us | Bari Software Services',
  description:
    'Learn about Bari Software Services (BSS) — a digital design and development studio in Dar es Salaam, Tanzania, building websites, mobile apps, and company profiles.',
  keywords: [
    'about BSS',
    'Bari Software Services team',
    'software company Dar es Salaam',
    'app development studio Tanzania',
  ],

  openGraph: {
  title: 'Bari Software Services',
  description: 'Digital design and development studio — Dar es Salaam, Tanzania.',
  type: 'website',
  url: 'https://bari-software-services.online',
},
alternates: {
  canonical: 'https://bari-software-services.online',
},
 
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}