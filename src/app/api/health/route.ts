export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/health
 * Health check endpoint для мониторинга
 * 
 * Использование:
 * - Uptime мониторинг (UptimeRobot, Pingdom)
 * - Load balancer health checks
 * - CI/CD проверки
 */
export async function GET() {
  const startTime = Date.now()
  
  // #region agent log H1 H3
  fetch('http://127.0.0.1:7243/ingest/3268fec8-68c2-4f8e-b7bf-6c7b4c0e3927',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'health/route.ts:GET',message:'ENV_CHECK',data:{NEXT_PUBLIC_SITE_URL:process.env.NEXT_PUBLIC_SITE_URL,DATABASE_URL_EXISTS:!!process.env.DATABASE_URL,NODE_ENV:process.env.NODE_ENV},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1,H3'})}).catch(()=>{});
  // #endregion

  let databaseStatus: 'ok' | 'error' = 'error'
  let databaseLatency = 0
  let dbError: string | null = null
  let tablesExist = false
  
  try {
    const dbStart = Date.now()
    await prisma.$queryRaw`SELECT 1`
    databaseLatency = Date.now() - dbStart
    databaseStatus = 'ok'
    
    // #region agent log H2 - проверка существования таблиц
    try {
      const roomTypes = await prisma.roomType.count()
      tablesExist = true
      fetch('http://127.0.0.1:7243/ingest/3268fec8-68c2-4f8e-b7bf-6c7b4c0e3927',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'health/route.ts:tables',message:'TABLES_CHECK',data:{roomTypesCount:roomTypes,tablesExist:true},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
    } catch (tableErr: any) {
      fetch('http://127.0.0.1:7243/ingest/3268fec8-68c2-4f8e-b7bf-6c7b4c0e3927',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'health/route.ts:tables',message:'TABLES_MISSING',data:{error:tableErr.message,code:tableErr.code},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
    }
    // #endregion
  } catch (error: any) {
    console.error('Health check: Database error', error)
    dbError = error.message
    // #region agent log H3
    fetch('http://127.0.0.1:7243/ingest/3268fec8-68c2-4f8e-b7bf-6c7b4c0e3927',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'health/route.ts:dbError',message:'DB_CONNECTION_FAILED',data:{error:error.message,code:error.code},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3'})}).catch(()=>{});
    // #endregion
  }
  
  const totalLatency = Date.now() - startTime
  const isHealthy = databaseStatus === 'ok'
  
  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: {
          status: databaseStatus,
          latency: databaseLatency,
          error: dbError,
          tablesExist,
        },
      },
      latency: totalLatency,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
      // Debug info - все важные переменные
      debug: {
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
        DATABASE_URL_SET: !!process.env.DATABASE_URL,
        NODE_ENV: process.env.NODE_ENV,
        // Оплата
        YOOKASSA_SHOP_ID_SET: !!process.env.YOOKASSA_SHOP_ID,
        YOOKASSA_SECRET_KEY_SET: !!process.env.YOOKASSA_SECRET_KEY,
        // Telegram
        TELEGRAM_BOT_TOKEN_SET: !!process.env.TELEGRAM_BOT_TOKEN,
        TELEGRAM_CHAT_ID_SET: !!process.env.TELEGRAM_CHAT_ID,
        // Email
        SMTP_HOST_SET: !!process.env.SMTP_HOST,
        // DB Init
        DB_INIT_SECRET_SET: !!process.env.DB_INIT_SECRET,
      },
    },
    { 
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  )
}

