import { NextRequest, NextResponse } from 'next/server'

/**
 * Rate limiting configuration
 * Key: path prefix, Value: { requests per minute, window in ms }
 */
const RATE_LIMITS: Record<string, { limit: number; window: number }> = {
  '/api/booking': { limit: 5, window: 60000 },      // 5 req/min
  '/api/corporate': { limit: 3, window: 60000 },    // 3 req/min
  '/api/payment': { limit: 10, window: 60000 },     // 10 req/min
  '/api/consent': { limit: 5, window: 60000 },      // 5 req/min
}

// In-memory store for rate limiting
// В production рекомендуется использовать Redis
const requestCounts = new Map<string, { count: number; resetAt: number }>()

/**
 * Получить IP клиента из заголовков
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

/**
 * Проверить rate limit для запроса
 */
function checkRateLimit(ip: string, path: string): { allowed: boolean; remaining: number; resetIn: number } {
  // Находим подходящий rate limit
  let rateLimit = null
  for (const [prefix, config] of Object.entries(RATE_LIMITS)) {
    if (path.startsWith(prefix)) {
      rateLimit = config
      break
    }
  }

  // Если нет rate limit для этого пути - пропускаем
  if (!rateLimit) {
    return { allowed: true, remaining: -1, resetIn: 0 }
  }

  const now = Date.now()
  const key = `${ip}:${path.split('/').slice(0, 3).join('/')}`
  const record = requestCounts.get(key)

  // Если записи нет или время сброса прошло - создаём новую
  if (!record || now >= record.resetAt) {
    requestCounts.set(key, { count: 1, resetAt: now + rateLimit.window })
    return { allowed: true, remaining: rateLimit.limit - 1, resetIn: rateLimit.window }
  }

  // Увеличиваем счётчик
  record.count++

  // Проверяем лимит
  if (record.count > rateLimit.limit) {
    return { 
      allowed: false, 
      remaining: 0, 
      resetIn: record.resetAt - now 
    }
  }

  return { 
    allowed: true, 
    remaining: rateLimit.limit - record.count, 
    resetIn: record.resetAt - now 
  }
}

/**
 * Очистка старых записей (запускается периодически)
 */
function cleanupOldRecords() {
  const now = Date.now()
  const entries = Array.from(requestCounts.entries())
  for (const [key, record] of entries) {
    if (now >= record.resetAt) {
      requestCounts.delete(key)
    }
  }
}

// Периодическая очистка каждые 5 минут
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupOldRecords, 5 * 60 * 1000)
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rate limiting только для API
  if (pathname.startsWith('/api/')) {
    const ip = getClientIP(request)
    const { allowed, remaining, resetIn } = checkRateLimit(ip, pathname)

    if (!allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Слишком много запросов. Попробуйте позже.',
          retryAfter: Math.ceil(resetIn / 1000),
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(resetIn / 1000)),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(resetIn / 1000)),
          },
        }
      )
    }

    // Добавляем заголовки rate limit в ответ
    const response = NextResponse.next()
    if (remaining >= 0) {
      response.headers.set('X-RateLimit-Remaining', String(remaining))
      response.headers.set('X-RateLimit-Reset', String(Math.ceil(resetIn / 1000)))
    }
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Применяем middleware к API роутам
    '/api/:path*',
  ],
}

