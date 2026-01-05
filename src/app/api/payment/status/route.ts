import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPayment } from '@/lib/yookassa'

/**
 * GET /api/payment/status?bookingId=xxx
 * Проверка статуса платежа по ID бронирования
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'ID бронирования не указан' },
        { status: 400 }
      )
    }

    // Получаем бронирование
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        paymentId: true,
        paymentStatus: true,
        status: true,
        totalPrice: true,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Бронирование не найдено' },
        { status: 404 }
      )
    }

    // Если нет paymentId, платёж ещё не создавался
    if (!booking.paymentId) {
      return NextResponse.json({
        success: true,
        data: {
          bookingId: booking.id,
          paymentStatus: booking.paymentStatus,
          bookingStatus: booking.status,
          paymentId: null,
        },
      })
    }

    // Если платёж уже успешен, не запрашиваем у ЮKassa
    if (booking.paymentStatus === 'SUCCEEDED') {
      return NextResponse.json({
        success: true,
        data: {
          bookingId: booking.id,
          paymentStatus: booking.paymentStatus,
          bookingStatus: booking.status,
          paymentId: booking.paymentId,
        },
      })
    }

    // Запрашиваем актуальный статус у ЮKassa
    try {
      const payment = await getPayment(booking.paymentId)

      // Обновляем статус в БД если изменился
      if (payment.status === 'succeeded' && booking.paymentStatus !== 'SUCCEEDED') {
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            paymentStatus: 'SUCCEEDED',
            status: 'CONFIRMED',
            paidAt: new Date(),
          },
        })
      } else if (payment.status === 'canceled' && booking.paymentStatus !== 'CANCELED') {
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            paymentStatus: 'CANCELED',
          },
        })
      }

      return NextResponse.json({
        success: true,
        data: {
          bookingId: booking.id,
          paymentStatus: mapYooKassaStatus(payment.status),
          bookingStatus: payment.status === 'succeeded' ? 'CONFIRMED' : booking.status,
          paymentId: booking.paymentId,
        },
      })
    } catch (yookassaError) {
      // Если ЮKassa недоступна, возвращаем данные из БД
      console.error('YooKassa API error:', yookassaError)
      return NextResponse.json({
        success: true,
        data: {
          bookingId: booking.id,
          paymentStatus: booking.paymentStatus,
          bookingStatus: booking.status,
          paymentId: booking.paymentId,
        },
      })
    }
  } catch (error) {
    console.error('Error checking payment status:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка проверки статуса' },
      { status: 500 }
    )
  }
}

/**
 * Маппинг статуса ЮKassa на наш PaymentStatus
 */
function mapYooKassaStatus(yookassaStatus: string): string {
  const statusMap: Record<string, string> = {
    pending: 'PENDING',
    waiting_for_capture: 'PROCESSING',
    succeeded: 'SUCCEEDED',
    canceled: 'CANCELED',
  }
  return statusMap[yookassaStatus] || 'PENDING'
}

