import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/api/files/', // On autorise l'accès aux images pour le SEO
      ],
      disallow: [
        '/*/admin', // Bloque /fr/admin, /en/admin, etc.
        '/api/', // Bloque le reste de l'API (sauf /api/files/ déjà autorisé)
        '/*/connex!on', // Optionnel : bloque les pages de connexion
      ],
    },
    sitemap: 'https://pounce.app/sitemap.xml',
  }
}
