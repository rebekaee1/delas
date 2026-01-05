import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/rooms
 * Получение списка активных типов номеров
 */
export async function GET(request: NextRequest) {
  try {
    const roomTypes = await prisma.roomType.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        beds: true,
        pricePerNight: true,
        amenities: true,
        images: true,
        maxGuests: true,
        totalUnits: true,
        isWomenOnly: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: roomTypes,
    })
  } catch (error) {
    console.error('Error fetching room types:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка загрузки номеров' },
      { status: 500 }
    )
  }
}



