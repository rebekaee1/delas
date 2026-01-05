/**
 * Sentry Client-side Configuration
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Включаем трассировку для мониторинга производительности
  tracesSampleRate: 0.1, // 10% запросов
  
  // Настройки для production
  environment: process.env.NODE_ENV,
  
  // Отключаем в development
  enabled: process.env.NODE_ENV === 'production',
  
  // Настройки интеграций
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      // Маскируем все текстовые поля
      maskAllText: true,
      // Блокируем всю медию
      blockAllMedia: true,
    }),
  ],
  
  // Session Replay - только для ошибок
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0, // 100% при ошибках
  
  // Игнорируем определённые ошибки
  ignoreErrors: [
    // Сетевые ошибки
    'Network request failed',
    'Failed to fetch',
    'NetworkError',
    // Расширения браузера
    'ResizeObserver loop',
    // Скрипты сторонних сервисов
    /^Script error\.?$/,
  ],
})

