import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendTelegramNotification } from '@/lib/telegram'
import { WebhookEvent } from '@/lib/yookassa'

/**
 * POST /api/payment/webhook
 * Обработка webhook уведомлений от ЮKassa
 * 
 * События:
 * - payment.succeeded - платёж успешно завершён
 * - payment.canceled - платёж отменён
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    let event: WebhookEvent

    try {
      event = JSON.parse(body)
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400 }
      )
    }

    // Проверяем тип события
    const eventType = event.type || event.event
    const payment = event.object

    if (!payment?.id) {
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      )
    }

    console.log(`[YooKassa Webhook] Event: ${eventType}, Payment ID: ${payment.id}`)

    // Получаем booking_id из metadata
    const bookingId = payment.metadata?.booking_id

    if (!bookingId) {
      console.error('[YooKassa Webhook] No booking_id in metadata')
      return NextResponse.json({ received: true })
    }

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
      console.error(`[YooKassa Webhook] Booking not found: ${bookingId}`)
      return NextResponse.json({ received: true })
    }

    // Обрабатываем события
    switch (eventType) {
      case 'payment.succeeded':
        await handlePaymentSucceeded(booking, payment)
        break

      case 'payment.canceled':
        await handlePaymentCanceled(booking, payment)
        break

      case 'payment.waiting_for_capture':
        // Для capture: true этот статус пропускается
        console.log(`[YooKassa Webhook] Payment waiting for capture: ${payment.id}`)
        break

      default:
        console.log(`[YooKassa Webhook] Unknown event type: ${eventType}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[YooKassa Webhook] Error:', error)
    // Возвращаем 200, чтобы ЮKassa не повторяла запрос
    return NextResponse.json({ received: true, error: 'Internal error' })
  }
}

/**
 * Обработка успешного платежа
 */
async function handlePaymentSucceeded(
  booking: {
    id: string
    guestName: string
    guestPhone: string
    guestEmail: string
    totalPrice: number
    checkIn: Date
    checkOut: Date
    nights: number
    roomType: { name: string }
  },
  payment: { id: string; amount: { value: string } }
) {
  // Обновляем статус бронирования
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

  console.log(`[YooKassa Webhook] Payment succeeded for booking: ${booking.id}`)

  // Отправляем уведомление в Telegram
  const message = formatTelegramNotification(booking, payment)
  await sendTelegramNotification(message)

  // TODO: Отправить email подтверждение гостю
  // await sendConfirmationEmail(booking)
}

/**
 * Обработка отменённого платежа
 */
async function handlePaymentCanceled(
  booking: { id: string },
  payment: { id: string }
) {
  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      paymentStatus: 'CANCELED',
      receiptStatus: 'canceled',
    },
  })

  console.log(`[YooKassa Webhook] Payment canceled for booking: ${booking.id}`)
}

/**
 * Форматирование уведомления для Telegram
 */
function formatTelegramNotification(
  booking: {
    id: string
    guestName: string
    guestPhone: string
    guestEmail: string
    totalPrice: number
    checkIn: Date
    checkOut: Date
    nights: number
    roomType: { name: string }
  },
  payment: { amount: { value: string } }
): string {
  const checkInDate = new Date(booking.checkIn).toLocaleDateString('ru-RU')
  const checkOutDate = new Date(booking.checkOut).toLocaleDateString('ru-RU')

  return `✅ *Новое бронирование оплачено!*

📋 *Бронирование #${booking.id.slice(-8).toUpperCase()}*

👤 *Гость:* ${escapeMarkdown(booking.guestName)}
📱 *Телефон:* ${formatPhone(booking.guestPhone)}
📧 *Email:* ${escapeMarkdown(booking.guestEmail)}

🏠 *Номер:* ${escapeMarkdown(booking.roomType.name)}
📅 *Заезд:* ${checkInDate}
📅 *Выезд:* ${checkOutDate}
🌙 *Ночей:* ${booking.nights}

💰 *Оплачено:* ${payment.amount.value} ₽`
}

/**
 * Экранирование специальных символов для Telegram Markdown
 */
function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&')
}

/**
 * Форматирование телефона
 */
function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11) {
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`
  }
  return phone
}

