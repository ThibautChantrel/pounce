/**
 * Validates that a file request originates from the application.
 * Prevents hotlinking and embedding assets on external sites.
 *
 * Uses Referer and Origin headers:
 * - Allow: request from our app domain
 * - Reject: request from another domain (e.g. embedding our images elsewhere)
 * - Allow when missing: direct links, downloads, some browsers (configurable via STRICT_FILE_REFERER)
 */

function getAllowedOrigins(): string[] {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    'https://pounce.app'

  const origins: string[] = []
  try {
    const url = new URL(appUrl)
    origins.push(`${url.protocol}//${url.host}`)
  } catch {
    origins.push('https://pounce.app')
  }

  // Allow localhost in development
  if (process.env.NODE_ENV === 'development') {
    origins.push('http://localhost:3000', 'http://127.0.0.1:3000')
    origins.push('http://localhost:3001', 'http://127.0.0.1:3001')
  }

  return origins
}

function getOriginFromReferer(referer: string | null): string | null {
  if (!referer) return null
  try {
    const url = new URL(referer)
    return `${url.protocol}//${url.host}`
  } catch {
    return null
  }
}

export function isFileRequestFromApp(request: Request): boolean {
  const strictMode = process.env.STRICT_FILE_REFERER === 'true'
  const allowedOrigins = getAllowedOrigins()

  const referer = request.headers.get('referer')
  const origin = request.headers.get('origin')

  const requestOrigin = origin || getOriginFromReferer(referer)

  if (!requestOrigin) {
    // No Referer/Origin: direct link, bookmark, download, or privacy tools
    return !strictMode
  }

  return allowedOrigins.some(
    (allowed) =>
      requestOrigin === allowed || requestOrigin.startsWith(`${allowed}/`)
  )
}
