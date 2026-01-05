/**
 * Sentry Edge Configuration (для middleware)
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Включаем трассировку
  tracesSampleRate: 0.1,
  
  // Настройки для production
  environment: process.env.NODE_ENV,
  
  // Отключаем в development
  enabled: process.env.NODE_ENV === 'production',
})

