import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPayment } from '@/lib/yookassa'
import { notifyPaymentSuccess } from '@/lib/telegram'

/**
 * POST /api/payment/sync
 * Синхронизация статуса платежей с ЮKassa (для localhost, где webhook не работает)
 * 
 * Используйте когда webhook недоступен (localhost разработка)
 */
export async function POST(request: NextRequest) {
  try {
    // Находим все бронирования со статусом PROCESSING (ожидают оплаты)
    const pendingBookings = await prisma.booking.findMany({
      where: {
        paymentStatus: 'PROCESSING',
        paymentId: { not: null },
      },
      include: {
        roomType: {
          select: { name: true },
        },
      },
    })

    if (pendingBookings.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Нет платежей для проверки',
        checked: 0,
        updated: 0,
      })
    }

    const results: Array<{
      bookingId: string
      paymentId: string
      oldStatus: string
      newStatus: string
      updated: boolean
    }> = []

    for (const booking of pendingBookings) {
      if (!booking.paymentId) continue

      try {
        // Получаем статус платежа из ЮKassa
        const payment = await getPayment(booking.paymentId)
        
        let updated = false
        let newPaymentStatus = booking.paymentStatus
        let newBookingStatus = booking.status

        if (payment.status === 'succeeded') {
          newPaymentStatus = 'SUCCEEDED'
          newBookingStatus = 'CONFIRMED'
          updated = true

          // Обновляем бронирование
          await prisma.booking.update({
            where: { id: booking.id },
            data: {
              paymentStatus: 'SUCCEEDED',
              status: 'CONFIRMED',
              paidAt: new Date(),
              receiptId: payment.id,
              receiptStatus: 'succeeded',
            },
          })

          // Отправляем уведомление
          await notifyPaymentSuccess({
            id: booking.id,
            guestName: booking.guestName,
            guestPhone: booking.guestPhone,
            roomTypeName: booking.roomType.name,
            checkIn: booking.checkIn,
            totalPrice: booking.totalPrice,
          })

        } else if (payment.status === 'canceled') {
          newPaymentStatus = 'CANCELLED'
          newBookingStatus = 'CANCELLED'
          updated = true

          await prisma.booking.update({
            where: { id: booking.id },
            data: {
              paymentStatus: 'CANCELLED',
              status: 'CANCELLED',
            },
          })
        }
        // pending - ничего не делаем, ждём

        results.push({
          bookingId: booking.id,
          paymentId: booking.paymentId,
          oldStatus: booking.paymentStatus,
          newStatus: newPaymentStatus,
          updated,
        })

      } catch (err) {
        console.error(`Error checking payment ${booking.paymentId}:`, err)
        results.push({
          bookingId: booking.id,
          paymentId: booking.paymentId,
          oldStatus: booking.paymentStatus,
          newStatus: 'ERROR',
          updated: false,
        })
      }
    }

    const updatedCount = results.filter(r => r.updated).length

    return NextResponse.json({
      success: true,
      message: `Проверено ${results.length} платежей, обновлено ${updatedCount}`,
      checked: results.length,
      updated: updatedCount,
      results,
    })

  } catch (error) {
    console.error('Error syncing payments:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка синхронизации платежей' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/payment/sync
 * Информация о pending платежах
 */
export async function GET() {
  try {
    const pendingBookings = await prisma.booking.findMany({
      where: {
        paymentStatus: 'PROCESSING',
      },
      select: {
        id: true,
        paymentId: true,
        paymentStatus: true,
        status: true,
        guestName: true,
        totalPrice: true,
        createdAt: true,
        roomType: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      count: pendingBookings.length,
      bookings: pendingBookings,
    })

  } catch (error) {
    console.error('Error fetching pending payments:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка получения платежей' },
      { status: 500 }
    )
  }
}

