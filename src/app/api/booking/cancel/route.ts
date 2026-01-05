export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createRefund } from '@/lib/yookassa'
import { sendTelegramMessage } from '@/lib/telegram'
import { sendBookingCancellation } from '@/lib/email'
import { z } from 'zod'

const cancelBookingSchema = z.object({
  bookingId: z.string().min(1, 'ID бронирования обязателен'),
  reason: z.string().optional(),
})

/**
 * POST /api/booking/cancel
 * Отмена бронирования с возвратом денег
 * 
 * Правила отмены:
 * - За 24+ часов до заезда = 100% возврат
 * - Менее 24 часов = возврат минус 1 сутки
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = cancelBookingSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Неверные данные', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { bookingId, reason } = validation.data

    // Получаем бронирование
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        roomType: { select: { name: true, pricePerNight: true } },
      },
    })

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Бронирование не найдено' },
        { status: 404 }
      )
    }

    // Проверяем, можно ли отменить
    if (booking.status === 'CANCELLED') {
      return NextResponse.json(
        { success: false, error: 'Бронирование уже отменено' },
        { status: 400 }
      )
    }

    if (booking.status === 'CHECKED_OUT') {
      return NextResponse.json(
        { success: false, error: 'Нельзя отменить завершённое бронирование' },
        { status: 400 }
      )
    }

    // Рассчитываем сумму возврата
    const now = new Date()
    const checkIn = new Date(booking.checkIn)
    const hoursUntilCheckIn = (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60)

    let refundAmount = booking.totalPrice
    let refundPercent = 100

    // Если менее 24 часов до заезда - удерживаем стоимость 1 суток
    if (hoursUntilCheckIn < 24 && hoursUntilCheckIn > 0) {
      const oneDayCost = booking.roomType.pricePerNight
      refundAmount = Math.max(0, booking.totalPrice - oneDayCost)
      refundPercent = Math.round((refundAmount / booking.totalPrice) * 100)
    }

    // Если заезд уже был - возврат невозможен
    if (hoursUntilCheckIn <= 0 && booking.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: 'Возврат невозможен после даты заезда' },
        { status: 400 }
      )
    }

    let refundResult = null

    // Делаем возврат через ЮKassa если есть платёж и сумма возврата > 0
    if (booking.paymentId && booking.paymentStatus === 'SUCCEEDED' && refundAmount > 0) {
      try {
        refundResult = await createRefund({
          paymentId: booking.paymentId,
          amount: refundAmount,
          description: reason || `Отмена бронирования #${bookingId}`,
          receiptDescription: `Возврат: ${booking.roomType.name}, ${booking.nights} ночей`,
          customerEmail: booking.guestEmail,
          customerPhone: booking.guestPhone,
        })
      } catch (error) {
        console.error('Refund error:', error)
        return NextResponse.json(
          { success: false, error: 'Ошибка возврата средств. Обратитесь к администратору.' },
          { status: 500 }
        )
      }
    }

    // Обновляем статус бронирования
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        paymentStatus: refundAmount > 0 ? 'REFUNDED' : booking.paymentStatus,
        adminNote: [
          booking.adminNote,
          `Отменено: ${new Date().toISOString()}`,
          reason ? `Причина: ${reason}` : null,
          refundResult ? `Возврат: ${refundAmount}₽ (${refundPercent}%), ID: ${refundResult.refundId}` : null,
        ].filter(Boolean).join('\n'),
      },
    })

    // Отправляем уведомление в Telegram
    const message = `
❌ <b>Бронирование отменено</b>

📋 <b>ID:</b> ${booking.id}
👤 <b>Гость:</b> ${booking.guestName}
📞 <b>Телефон:</b> ${booking.guestPhone}
🛏 <b>Номер:</b> ${booking.roomType.name}

📅 <b>Даты:</b> ${booking.checkIn.toLocaleDateString('ru-RU')} - ${booking.checkOut.toLocaleDateString('ru-RU')}
${reason ? `💬 <b>Причина:</b> ${reason}` : ''}

💰 <b>Возврат:</b> ${refundAmount}₽ (${refundPercent}%)
${refundResult ? `🔄 <b>ID возврата:</b> ${refundResult.refundId}` : ''}
`.trim()

    sendTelegramMessage({ text: message }).catch(console.error)

    // Отправляем email об отмене
    sendBookingCancellation({
      guestEmail: booking.guestEmail,
      guestName: booking.guestName,
      id: booking.id,
      roomTypeName: booking.roomType.name,
      refundAmount,
    }).catch(console.error)

    return NextResponse.json({
      success: true,
      data: {
        bookingId: updatedBooking.id,
        status: updatedBooking.status,
        refundAmount,
        refundPercent,
        refundId: refundResult?.refundId || null,
      },
    })
  } catch (error) {
    console.error('Error canceling booking:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка отмены бронирования' },
      { status: 500 }
    )
  }
}

