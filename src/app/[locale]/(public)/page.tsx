import { Metadata } from 'next'
import Hero from '@/components/Hero'
import { HomeTabs } from '@/components/HomeTabs'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  if (locale === 'fr') {
    return {
      title: 'Pounce — Marque ton empreinte',
      description:
        'Pounce explore une nouvelle façon de pratiquer le sport : des défis communautaires certifiés, sans logique de réseau social.',
      alternates: {
        canonical: '/fr',
        languages: { en: '/en' },
      },
    }
  }

  return {
    title: 'Pounce — Make Your Mark',
    description:
      'Pounce explores a new way to play sports: certified community challenges, without social network logic.',
    alternates: {
      canonical: '/en',
      languages: { fr: '/fr' },
    },
  }
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col dark:bg-black">
      <Hero />

      <div className="flex flex-col items-center py-4 px-4 w-full">
        <HomeTabs />
      </div>
    </main>
  )
}
