import type { Metadata } from 'next'
// @ts-ignore: allow global CSS import without module declarations
import './globals.css'
import { LangProvider } from '../lib/i18n/LanguageContext'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import WhatsAppButton from '../components/ui/WhatsappButton'

export const metadata: Metadata = {
  title: 'Bari Software Services | BSS',
  description: 'Company profiles, websites, mobile apps, business cards and proposals — Dar es Salaam, Tanzania.',
  keywords: ['BSS', 'Bari Software Services', 'company profile Tanzania', 'website design Dar es Salaam', 'mobile app Tanzania'],
  openGraph: {
    title: 'Bari Software Services',
    description: 'Digital design and development studio — Dar es Salaam, Tanzania.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <LangProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          <WhatsAppButton />
        </LangProvider>
      </body>
    </html>
  )
}