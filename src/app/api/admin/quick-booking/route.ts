export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateNights, calculateDiscount, calculateTotalPrice } from '@/lib/utils'
import { z } from 'zod'

// Секретный ключ (должен совпадать с клиентом)
const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || 'delas2024admin'

const quickBookingSchema = z.object({
  roomTypeId: z.string().min(1),
  checkIn: z.string().transform(val => new Date(val)),
  checkOut: z.string().transform(val => new Date(val)),
  guestName: z.string().min(1),
  guestPhone: z.string().default('Не указан'),
  guestEmail: z.string().email().default('offline@hostel-delas.ru'),
  guestsCount: z.number().int().min(1).default(1),
  comment: z.string().optional(),
  source: z.string().default('offline'),
  status: z.enum(['PENDING', 'CONFIRMED', 'CHECKED_IN']).default('CHECKED_IN'),
  paymentStatus: z.enum(['PENDING', 'PROCESSING', 'SUCCEEDED']).default('SUCCEEDED'),
})

/**
 * POST /api/admin/quick-booking
 * Быстрое добавление гостя в базу (для offline бронирований)
 * Требует заголовок X-Admin-Secret
 */
export async function POST(request: NextRequest) {
  try {
    // Проверка секретного ключа
    const adminSecret = request.headers.get('X-Admin-Secret')
    if (adminSecret !== ADMIN_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Доступ запрещён' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const validation = quickBookingSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Неверные данные', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }
    
    const data = validation.data
    
    // Находим тип номера
    let roomType = await prisma.roomType.findUnique({
      where: { id: data.roomTypeId, isActive: true },
    })
    
    if (!roomType) {
      roomType = await prisma.roomType.findFirst({
        where: { slug: data.roomTypeId, isActive: true },
      })
    }
    
    if (!roomType) {
      return NextResponse.json(
        { success: false, error: 'Тип номера не найден' },
        { status: 404 }
      )
    }
    
    // Рассчитываем цену
    const nights = calculateNights(data.checkIn, data.checkOut)
    const discountPercent = calculateDiscount(nights, 5, 10)
    const { basePrice, discountAmount, totalPrice } = calculateTotalPrice(
      roomType.pricePerNight,
      nights,
      discountPercent
    )
    
    // Создаём бронирование
    const booking = await prisma.booking.create({
      data: {
        roomTypeId: roomType.id,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        nights,
        guestName: data.guestName,
        guestPhone: data.guestPhone.replace(/\D/g, '') || '0000000000',
        guestEmail: data.guestEmail,
        guestsCount: data.guestsCount,
        basePrice,
        discountPercent,
        discountAmount,
        totalPrice,
        status: data.status,
        paymentStatus: data.paymentStatus,
        paidAt: data.paymentStatus === 'SUCCEEDED' ? new Date() : null,
        comment: data.comment || null,
        source: data.source,
        adminNote: `Добавлено вручную: ${new Date().toLocaleString('ru-RU')}`,
      },
      include: {
        roomType: { select: { name: true, slug: true } },
      },
    })
    
    console.log(`[Quick Booking] Created: ${booking.id} - ${data.guestName} - ${roomType.name}`)
    
    return NextResponse.json({
      success: true,
      data: {
        bookingId: booking.id,
        guestName: booking.guestName,
        roomTypeName: booking.roomType.name,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        nights: booking.nights,
        totalPrice: booking.totalPrice,
      },
    })
  } catch (error) {
    console.error('[Quick Booking] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка создания бронирования' },
      { status: 500 }
    )
  }
}

