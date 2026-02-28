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

export const metadata = {
  metadataBase: new URL('https://pounce.app'),
  openGraph: {
    siteName: 'Pounce',
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@pounce_app',
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
