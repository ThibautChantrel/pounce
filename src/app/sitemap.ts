import { MetadataRoute } from 'next'
import { fetchChallengesForUser } from '@/actions/challenge/challenge.action'
import { trackRepository } from '@/server/modules/track/repositories/track.repository'

const BASE_URL = 'https://pounce.app'
const LOCALES = ['fr', 'en'] as const

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  // Pages statiques pour chaque locale
  const staticPages = [
    { path: '', priority: 1 },
    { path: 'about', priority: 0.7 },
    { path: 'feedbacks', priority: 0.5 },
  ]

  for (const locale of LOCALES) {
    for (const page of staticPages) {
      entries.push({
        url: `${BASE_URL}/${locale}${page.path ? `/${page.path}` : ''}`,
        lastModified: new Date(),
        priority: page.priority,
      })
    }
  }

  // Challenges (pagination pour tout récupérer)
  let skip = 0
  const take = 100
  let hasMore = true

  while (hasMore) {
    const { data: challenges, total } = await fetchChallengesForUser(skip, take)

    for (const challenge of challenges || []) {
      for (const locale of LOCALES) {
        entries.push({
          url: `${BASE_URL}/${locale}/challenges/${challenge.id}`,
          lastModified: new Date(challenge.updatedAt),
          priority: 0.8,
        })
      }
    }

    skip += take
    hasMore = (challenges?.length ?? 0) === take && skip < total
  }

  // Parcours (tracks) visibles
  const tracks = await trackRepository.findVisibleForSitemap()

  for (const track of tracks) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE_URL}/${locale}/tracks/${track.id}`,
        lastModified: new Date(track.updatedAt),
        priority: 0.8,
      })
    }
  }

  return entries
}
