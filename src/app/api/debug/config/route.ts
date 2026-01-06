export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/debug/config
 * Диагностика конфигурации (только для отладки!)
 * ВАЖНО: Удалить перед production или закрыть авторизацией
 */
export async function GET() {
  try {
    // Проверяем DATABASE_URL (скрываем пароль)
    const dbUrl = process.env.DATABASE_URL
    const dbUrlSafe = dbUrl
      ? dbUrl.replace(/:([^:@]+)@/, ':***@') // Скрываем пароль
      : 'NOT SET'

    // Проверяем SMTP
    const smtpConfig = {
      host: process.env.SMTP_HOST || 'NOT SET',
      port: process.env.SMTP_PORT || 'NOT SET',
      user: process.env.SMTP_USER || 'NOT SET',
      passwordSet: !!process.env.SMTP_PASSWORD,
    }

    // Пытаемся подключиться к БД и получить список таблиц
    let tables: string[] = []
    let dbError: string | null = null
    
    try {
      // Запрос для получения списка таблиц из public схемы
      const result = await prisma.$queryRaw<Array<{ tablename: string }>>`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename
      `
      tables = result.map(r => r.tablename)
    } catch (err) {
      dbError = err instanceof Error ? err.message : String(err)
    }

    // Проверяем YooKassa
    const yookassaConfig = {
      shopIdSet: !!process.env.YOOKASSA_SHOP_ID,
      secretKeySet: !!process.env.YOOKASSA_SECRET_KEY,
    }

    // Проверяем Telegram
    const telegramConfig = {
      botTokenSet: !!process.env.TELEGRAM_BOT_TOKEN,
      chatIdSet: !!process.env.TELEGRAM_CHAT_ID,
    }

    return NextResponse.json({
      success: true,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        nextPublicSiteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'NOT SET',
      },
      database: {
        url: dbUrlSafe,
        connected: !dbError,
        error: dbError,
        tablesFound: tables.length,
        tables: tables,
      },
      smtp: smtpConfig,
      yookassa: yookassaConfig,
      telegram: telegramConfig,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

