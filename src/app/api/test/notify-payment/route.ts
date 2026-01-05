import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { notifyPaymentSuccess } from '@/lib/telegram'

/**
 * POST /api/test/notify-payment
 * Тестовая отправка уведомления об оплате
 * ТОЛЬКО ДЛЯ РАЗРАБОТКИ
 */
export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json()

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'bookingId required' },
        { status: 400 }
      )
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        roomType: { select: { name: true } },
      },
    })

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    console.log('Sending payment notification for booking:', booking.id)

    const result = await notifyPaymentSuccess({
      id: booking.id,
      guestName: booking.guestName,
      guestPhone: booking.guestPhone,
      roomTypeName: booking.roomType.name,
      checkIn: booking.checkIn,
      totalPrice: booking.totalPrice,
    })

    return NextResponse.json({
      success: result,
      message: result ? 'Уведомление отправлено' : 'Ошибка отправки',
      booking: {
        id: booking.id,
        guestName: booking.guestName,
        totalPrice: booking.totalPrice,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
      },
    })

  } catch (error) {
    console.error('Error sending test notification:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка отправки уведомления' },
      { status: 500 }
    )
  }
}

