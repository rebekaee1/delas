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
  
  let databaseStatus: 'ok' | 'error' = 'error'
  let databaseLatency = 0
  
  try {
    const dbStart = Date.now()
    await prisma.$queryRaw`SELECT 1`
    databaseLatency = Date.now() - dbStart
    databaseStatus = 'ok'
  } catch (error) {
    console.error('Health check: Database error', error)
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
        },
      },
      latency: totalLatency,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
    },
    { 
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  )
}

