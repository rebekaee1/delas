import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createBookingSchema } from '@/lib/validators'
import { calculateDiscount, calculateTotalPrice, calculateNights } from '@/lib/utils'
import { notifyNewBooking } from '@/lib/telegram'

/**
 * POST /api/booking
 * Создание нового бронирования
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = createBookingSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Неверные данные',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const {
      roomTypeId,
      checkIn,
      checkOut,
      guestName,
      guestPhone,
      guestEmail,
      guestsCount,
      comment,
    } = validation.data

    // Проверяем, существует ли тип номера (поиск по ID или по slug)
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
        { success: false, error: 'Тип номера не найден' },
        { status: 404 }
      )
    }

    // Проверяем вместимость
    if (guestsCount > roomType.maxGuests) {
      return NextResponse.json(
        { success: false, error: `Максимум ${roomType.maxGuests} гостей` },
        { status: 400 }
      )
    }

    // Проверяем доступность (используем реальный ID из базы)
    const overlappingBookings = await prisma.booking.count({
      where: {
        roomTypeId: roomType.id,
        status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] },
        OR: [
          { checkIn: { gte: checkIn, lt: checkOut } },
          { checkOut: { gt: checkIn, lte: checkOut } },
          { checkIn: { lte: checkIn }, checkOut: { gte: checkOut } },
        ],
      },
    })

    if (overlappingBookings >= roomType.totalUnits) {
      return NextResponse.json(
        { success: false, error: 'Нет свободных мест на выбранные даты' },
        { status: 409 }
      )
    }

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

    // Создаём бронирование (используем реальный ID из базы)
    const booking = await prisma.booking.create({
      data: {
        roomTypeId: roomType.id,
        checkIn,
        checkOut,
        nights,
        guestName,
        guestPhone: guestPhone.replace(/\D/g, ''), // Только цифры
        guestEmail: guestEmail.toLowerCase(),
        guestsCount,
        basePrice,
        discountPercent,
        discountAmount,
        totalPrice,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        comment: comment || null,
        source: 'website',
      },
      include: {
        roomType: {
          select: { name: true, slug: true },
        },
      },
    })

    // Отправляем уведомление в Telegram (асинхронно, не блокируем ответ)
    notifyNewBooking({
      id: booking.id,
      guestName: booking.guestName,
      guestPhone: booking.guestPhone,
      guestEmail: booking.guestEmail,
      roomTypeName: booking.roomType.name,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      nights: booking.nights,
      totalPrice: booking.totalPrice,
      guestsCount: booking.guestsCount,
    }).catch(err => console.error('Failed to send Telegram notification:', err))

    return NextResponse.json({
      success: true,
      data: {
        bookingId: booking.id,
        status: booking.status,
        totalPrice: booking.totalPrice,
        roomTypeName: booking.roomType.name,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        nights: booking.nights,
        discountPercent: booking.discountPercent,
        // paymentUrl: '...', // URL для перенаправления на оплату
      },
    })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка создания бронирования' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/booking?id=xxx
 * Получение информации о бронировании
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('id')

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'ID бронирования не указан' },
        { status: 400 }
      )
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        roomType: {
          select: { name: true, slug: true, images: true },
        },
      },
    })

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Бронирование не найдено' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: booking.id,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        roomType: booking.roomType,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        nights: booking.nights,
        guestName: booking.guestName,
        guestsCount: booking.guestsCount,
        basePrice: booking.basePrice,
        discountPercent: booking.discountPercent,
        discountAmount: booking.discountAmount,
        totalPrice: booking.totalPrice,
        createdAt: booking.createdAt,
      },
    })
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка получения бронирования' },
      { status: 500 }
    )
  }
}



