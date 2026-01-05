import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createPayment } from '@/lib/yookassa'
import { z } from 'zod'

const createPaymentSchema = z.object({
  bookingId: z.string().min(1, 'ID бронирования обязателен'),
})

/**
 * POST /api/payment/create
 * Создание платежа в ЮKassa для бронирования
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = createPaymentSchema.safeParse(body)

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

    const { bookingId } = validation.data

    // Получаем бронирование
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        roomType: {
          select: { name: true },
        },
      },
    })

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Бронирование не найдено' },
        { status: 404 }
      )
    }

    // Проверяем, что бронирование ещё не оплачено
    if (booking.paymentStatus === 'SUCCEEDED') {
      return NextResponse.json(
        { success: false, error: 'Бронирование уже оплачено' },
        { status: 400 }
      )
    }

    // Проверяем, что бронирование не отменено
    if (booking.status === 'CANCELLED') {
      return NextResponse.json(
        { success: false, error: 'Бронирование отменено' },
        { status: 400 }
      )
    }

    // Формируем URL возврата
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const returnUrl = `${siteUrl}/booking/success?id=${bookingId}`

    // Создаём платёж в ЮKassa
    const { paymentId, confirmationUrl } = await createPayment({
      amount: booking.totalPrice,
      description: `Бронирование #${bookingId.slice(-8).toUpperCase()}`,
      bookingId,
      guestEmail: booking.guestEmail,
      guestPhone: booking.guestPhone,
      returnUrl,
      receiptDescription: `Проживание: ${booking.roomType.name}, ${booking.nights} ${pluralizeNights(booking.nights)}`,
    })

    // Обновляем бронирование с ID платежа
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentId,
        paymentStatus: 'PROCESSING',
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        paymentId,
        confirmationUrl,
      },
    })
  } catch (error) {
    console.error('Error creating payment:', error)
    
    // Проверяем, что это ошибка конфигурации ЮKassa
    if (error instanceof Error && error.message.includes('credentials not configured')) {
      return NextResponse.json(
        { success: false, error: 'Платёжная система не настроена' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Ошибка создания платежа' },
      { status: 500 }
    )
  }
}

/**
 * Склонение слова "ночь"
 */
function pluralizeNights(n: number): string {
  const lastTwo = n % 100
  const lastOne = n % 10

  if (lastTwo >= 11 && lastTwo <= 14) {
    return 'ночей'
  }

  if (lastOne === 1) {
    return 'ночь'
  }

  if (lastOne >= 2 && lastOne <= 4) {
    return 'ночи'
  }

  return 'ночей'
}

