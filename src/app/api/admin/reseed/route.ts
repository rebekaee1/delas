export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/admin/reseed
 * Обновляет totalUnits для всех номеров (исправляет на 1 номер)
 * ВРЕМЕННЫЙ ENDPOINT - удалить после использования!
 */
export async function POST(request: NextRequest) {
  try {
    // Простая защита - секретный ключ в query параметрах
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')
    
    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Обновляем totalUnits для всех номеров на 1
    const updates = await Promise.all([
      prisma.roomType.updateMany({
        where: { slug: 'standart' },
        data: { totalUnits: 1 },
      }),
      prisma.roomType.updateMany({
        where: { slug: 'komfort' },
        data: { totalUnits: 1 },
      }),
      prisma.roomType.updateMany({
        where: { slug: 'komfort-plus' },
        data: { totalUnits: 1 },
      }),
      prisma.roomType.updateMany({
        where: { slug: 'zhenskiy-komfort-plus' },
        data: { totalUnits: 1 },
      }),
    ])

    // Получаем обновлённые данные
    const rooms = await prisma.roomType.findMany({
      select: {
        name: true,
        beds: true,
        totalUnits: true,
      },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({
      success: true,
      message: 'База данных обновлена',
      updated: updates.reduce((sum, u) => sum + u.count, 0),
      rooms,
    })
  } catch (error) {
    console.error('Error reseeding:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка обновления БД' },
      { status: 500 }
    )
  }
}

