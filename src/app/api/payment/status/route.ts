export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPayment } from '@/lib/yookassa'
import { notifyPaymentSuccess } from '@/lib/telegram'
import { sendBookingConfirmation } from '@/lib/email'

/**
 * GET /api/payment/status?bookingId=xxx
 * Проверка статуса платежа по ID бронирования
 */
export async function GET(request: NextRequest) {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/3268fec8-68c2-4f8e-b7bf-6c7b4c0e3927',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'payment/status/route.ts:15',message:'Payment status check initiated',data:{url:request.url},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'H1'})}).catch(()=>{});
  // #endregion
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
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/3268fec8-68c2-4f8e-b7bf-6c7b4c0e3927',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'payment/status/route.ts:78',message:'YooKassa payment status received',data:{paymentId:booking.paymentId,yookassaStatus:payment.status,currentDbStatus:booking.paymentStatus},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'H2'})}).catch(()=>{});
      // #endregion

      // Обновляем статус в БД если изменился
      // (booking.paymentStatus !== 'SUCCEEDED' уже проверено выше)
      if (payment.status === 'succeeded') {
        // Получаем полные данные бронирования для уведомлений
        const fullBooking = await prisma.booking.update({
          where: { id: bookingId },
          data: {
            paymentStatus: 'SUCCEEDED',
            status: 'CONFIRMED',
            paidAt: new Date(),
          },
          include: {
            roomType: true,
          },
        })

        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/3268fec8-68c2-4f8e-b7bf-6c7b4c0e3927',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'payment/status/route.ts:95',message:'Payment succeeded - updating DB and sending notifications',data:{bookingId:fullBooking.id,newStatus:'CONFIRMED'},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'H3'})}).catch(()=>{});
        // #endregion

        // Отправляем уведомление в Telegram (асинхронно)
        notifyPaymentSuccess({
          id: fullBooking.id,
          guestName: fullBooking.guestName,
          guestPhone: fullBooking.guestPhone,
          guestEmail: fullBooking.guestEmail,
          roomTypeName: fullBooking.roomType.name,
          checkIn: fullBooking.checkIn,
          checkOut: fullBooking.checkOut,
          nights: fullBooking.nights,
          totalPrice: fullBooking.totalPrice,
          guestsCount: fullBooking.guestsCount,
        }).catch(err => console.error('Telegram notification error:', err))

        // Отправляем email подтверждение (асинхронно)
        sendBookingConfirmation({
          id: fullBooking.id,
          guestEmail: fullBooking.guestEmail,
          guestName: fullBooking.guestName,
          roomTypeName: fullBooking.roomType.name,
          checkIn: fullBooking.checkIn,
          checkOut: fullBooking.checkOut,
          nights: fullBooking.nights,
          totalPrice: fullBooking.totalPrice,
          guestsCount: fullBooking.guestsCount,
        }).catch(err => console.error('Email notification error:', err))
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

