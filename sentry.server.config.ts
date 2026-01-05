/**
 * Sentry Server-side Configuration
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Включаем трассировку
  tracesSampleRate: 0.1, // 10% запросов
  
  // Настройки для production
  environment: process.env.NODE_ENV,
  
  // Отключаем в development
  enabled: process.env.NODE_ENV === 'production',
  
  // Интеграции для Node.js
  integrations: [
    Sentry.prismaIntegration(), // Мониторинг Prisma запросов
  ],
  
  // Игнорируем определённые ошибки
  ignoreErrors: [
    // Ошибки валидации (ожидаемые)
    'Неверные данные',
    'Тип номера не найден',
    // Rate limit
    'Слишком много запросов',
  ],
})

