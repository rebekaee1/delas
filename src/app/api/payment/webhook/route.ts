export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { notifyPaymentSuccess } from '@/lib/telegram'
import { sendBookingConfirmation } from '@/lib/email'
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
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/3268fec8-68c2-4f8e-b7bf-6c7b4c0e3927',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'webhook/route.ts:18',message:'Webhook received',data:{headers:Object.fromEntries(request.headers)},timestamp:Date.now(),sessionId:'debug-session',runId:'webhook-debug',hypothesisId:'H1'})}).catch(()=>{});
  // #endregion
  console.log('[YooKassa Webhook] Request received at:', new Date().toISOString())
  
  try {
    const body = await request.text()
    console.log('[YooKassa Webhook] Body:', body.substring(0, 500))
    
    let event: WebhookEvent

    try {
      event = JSON.parse(body)
    } catch {
      console.error('[YooKassa Webhook] Invalid JSON:', body.substring(0, 200))
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
    guestsCount: number
    roomType: { name: string }
  },
  payment: { id: string; amount: { value: string } }
) {
  console.log(`[YooKassa Webhook] handlePaymentSucceeded called for booking: ${booking.id}`)
  
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
  await notifyPaymentSuccess({
    id: booking.id,
    guestName: booking.guestName,
    guestPhone: booking.guestPhone,
    roomTypeName: booking.roomType.name,
    checkIn: booking.checkIn,
    totalPrice: booking.totalPrice,
  })

  // Отправляем email подтверждение гостю
  sendBookingConfirmation({
    id: booking.id,
    guestName: booking.guestName,
    guestEmail: booking.guestEmail,
    roomTypeName: booking.roomType.name,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    nights: booking.nights,
    totalPrice: booking.totalPrice,
    guestsCount: booking.guestsCount,
  }).catch(err => console.error('Failed to send confirmation email:', err))
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


