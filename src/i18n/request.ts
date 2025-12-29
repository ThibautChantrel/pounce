import { getRequestConfig } from 'next-intl/server'

const locales = ['en', 'fr']

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  if (!locale || !locales.includes(locale as string)) {
    locale = 'fr'
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
