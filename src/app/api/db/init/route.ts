import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

/**
 * API для инициализации базы данных
 * Вызывается один раз после деплоя, если нет доступа к консоли
 * 
 * GET /api/db/init?secret=YOUR_SECRET_KEY
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  
  // Проверка секретного ключа
  const expectedSecret = process.env.DB_INIT_SECRET || process.env.CRON_SECRET
  
  if (!expectedSecret) {
    return NextResponse.json(
      { error: 'DB_INIT_SECRET not configured' },
      { status: 500 }
    )
  }
  
  if (secret !== expectedSecret) {
    return NextResponse.json(
      { error: 'Invalid secret' },
      { status: 401 }
    )
  }

  try {
    const results: string[] = []
    
    // 1. Применяем схему к БД
    console.log('Running prisma db push...')
    const { stdout: pushOutput, stderr: pushError } = await execAsync('npx prisma db push --skip-generate')
    results.push(`db push: ${pushOutput || 'OK'}`)
    if (pushError) results.push(`db push stderr: ${pushError}`)
    
    // 2. Запускаем seed (если нужно)
    const shouldSeed = searchParams.get('seed') === 'true'
    if (shouldSeed) {
      console.log('Running prisma db seed...')
      try {
        const { stdout: seedOutput, stderr: seedError } = await execAsync('npx tsx prisma/seed.ts')
        results.push(`seed: ${seedOutput || 'OK'}`)
        if (seedError) results.push(`seed stderr: ${seedError}`)
      } catch (seedErr: any) {
        results.push(`seed error: ${seedErr.message}`)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      results,
      timestamp: new Date().toISOString(),
    })
    
  } catch (error: any) {
    console.error('DB init error:', error)
    return NextResponse.json(
      { 
        error: 'Database initialization failed',
        details: error.message,
        stderr: error.stderr,
      },
      { status: 500 }
    )
  }
}

