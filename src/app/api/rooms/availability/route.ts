export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAvailabilitySchema } from '@/lib/validators'
import { calculateDiscount, calculateTotalPrice, calculateNights } from '@/lib/utils'

/**
 * POST /api/rooms/availability
 * Проверка доступности номеров на указанные даты
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = checkAvailabilitySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Неверные параметры',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { roomTypeId, checkIn, checkOut, guests } = validation.data

    // Получаем тип номера (поиск по ID или по slug)
    let roomType = await prisma.roomType.findUnique({
      where: { id: roomTypeId, isActive: true },
    })
    
    // Если не нашли по ID, пробуем по slug
    if (!roomType) {
      roomType = await prisma.roomType.findFirst({
        where: { slug: roomTypeId, isActive: true },
      })
    }

    if (!roomType) {
      return NextResponse.json(
        { success: false, error: 'Номер не найден' },
        { status: 404 }
      )
    }

    // Проверяем вместимость
    if (guests > roomType.maxGuests) {
      return NextResponse.json({
        success: true,
        data: {
          available: false,
          reason: `Максимум ${roomType.maxGuests} гостей в этом номере`,
        },
      })
    }

    // Общее количество койко-мест = кроватей в номере * количество номеров
    const totalBeds = roomType.beds * roomType.totalUnits
    
    // Считаем сколько гостей уже забронировано на эти даты
    const bookedGuests = await prisma.booking.aggregate({
      where: {
        roomTypeId: roomType.id,
        status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] },
        OR: [
          // Бронирование начинается в период
          { checkIn: { gte: checkIn, lt: checkOut } },
          // Бронирование заканчивается в период
          { checkOut: { gt: checkIn, lte: checkOut } },
          // Бронирование охватывает весь период
          { checkIn: { lte: checkIn }, checkOut: { gte: checkOut } },
        ],
      },
      _sum: { guestsCount: true },
    })

    const occupiedBeds = bookedGuests._sum.guestsCount || 0
    const availableBeds = totalBeds - occupiedBeds

    // Проверяем заблокированные даты (используем реальный ID)
    const blockedDates = await prisma.blockedDate.count({
      where: {
        OR: [
          { roomTypeId: roomType.id },
          { roomTypeId: null }, // Глобальные блокировки
        ],
        date: { gte: checkIn, lt: checkOut },
      },
    })

    // Рассчитываем цену
    const nights = calculateNights(checkIn, checkOut)
    const settings = await prisma.hotelSettings.findUnique({ where: { id: 'main' } })
    const discountPercent = calculateDiscount(
      nights,
      settings?.discount2Days || 5,
      settings?.discount7Days || 10
    )
    const { basePrice, discountAmount, totalPrice } = calculateTotalPrice(
      roomType.pricePerNight,
      nights,
      discountPercent
    )

    return NextResponse.json({
      success: true,
      data: {
        roomTypeId,
        roomTypeName: roomType.name,
        available: availableBeds >= guests && blockedDates === 0,
        availableBeds: Math.max(0, availableBeds),
        totalBeds,
        blockedDates: blockedDates > 0,
        pricePerNight: roomType.pricePerNight,
        nights,
        basePrice,
        discountPercent,
        discountAmount,
        totalPrice,
      },
    })
  } catch (error) {
    console.error('Error checking availability:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка проверки доступности' },
      { status: 500 }
    )
  }
}



