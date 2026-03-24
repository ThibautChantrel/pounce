// src/app/[locale]/layout.tsx
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import '../globals.css' // Assurez-vous que le chemin vers globals.css est bon
import { Toaster } from '@/components/ui/sonner'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const BASE_URL =
  process.env.NEXTAUTH_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  'https://pounce-app.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Pounce — Marque ton empreinte',
    template: '%s | Pounce',
  },
  description:
    'Pounce explore une nouvelle façon de pratiquer le sport : des défis communautaires certifiés, sans logique de réseau social.',
  openGraph: {
    siteName: 'Pounce',
    type: 'website',
    locale: 'fr_FR',
    title: 'Pounce — Marque ton empreinte',
    description:
      'Des défis sportifs communautaires certifiés, sans réseau social. Rejoins Pounce et marque ton empreinte.',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@pounce_app',
    title: 'Pounce — Marque ton empreinte',
    description:
      'Des défis sportifs communautaires certifiés, sans réseau social.',
  },
  verification: {
    google: '1lN6IVYcZqNbKIS3R4yMt50t4Ly27oCSDX56cu_2z68',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }> // Promise obligatoire en Next.js 15
}) {
  const { locale } = await params

  if (!['en', 'fr'].includes(locale)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <NextIntlClientProvider messages={messages}>
          <main className="grow">{children}</main>
          <Toaster position="top-center" />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
