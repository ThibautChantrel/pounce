import { MetadataRoute } from 'next'
import { fetchChallengesForUser } from '@/actions/challenge/challenge.action'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://pounce.app'

  // On récupère tous les challenges pour les mettre dans le sitemap
  const response = await fetchChallengesForUser(0, 100)
  const challenges = response?.data || []

  const challengeUrls = challenges.map((c) => ({
    url: `${baseUrl}/fr/challenges/${c.id}`, // Version FR par défaut
    lastModified: new Date(c.updatedAt),
    priority: 0.8,
  }))

  return [
    { url: `${baseUrl}/fr`, lastModified: new Date(), priority: 1 },
    { url: `${baseUrl}/fr/about`, lastModified: new Date(), priority: 0.7 },
    { url: `${baseUrl}/fr/feedbacks`, lastModified: new Date(), priority: 0.5 },
    ...challengeUrls,
  ]
}
