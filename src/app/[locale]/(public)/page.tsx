'use client'

import { ChallengeCarousel } from '@/components/challenge/ChallengeCaroussel'
import Hero from '@/components/Hero'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col dark:bg-black">
      <Hero />

      <div className="flex flex-col items-center gap-6 py-4 px-4">
        <ChallengeCarousel />
      </div>
    </main>
  )
}
