export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/cron/cleanup
 * Автоматическая очистка устаревших бронирований
 * 
 * Запускается по CRON (например, каждый час через Vercel Cron)
 * Или вручную через API
 * 
 * Логика:
 * 1. PENDING бронирования старше 30 минут без оплаты → CANCELLED
 * 2. CONFIRMED/CHECKED_IN с прошедшей датой выезда → CHECKED_OUT
 * 3. CONFIRMED с прошедшей датой заезда (>24ч) без заселения → NO_SHOW
 */
export async function GET() {
  try {
    const now = new Date()
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // 1. Отменяем неоплаченные бронирования старше 30 минут
    const cancelledPending = await prisma.booking.updateMany({
      where: {
        status: 'PENDING',
        paymentStatus: 'PENDING',
        createdAt: { lt: thirtyMinutesAgo },
      },
      data: {
        status: 'CANCELLED',
        adminNote: 'Автоматически отменено: не оплачено в течение 30 минут',
      },
    })

    // 2. Закрываем бронирования с прошедшей датой выезда
    const checkedOut = await prisma.booking.updateMany({
      where: {
        status: { in: ['CONFIRMED', 'CHECKED_IN'] },
        checkOut: { lt: now },
      },
      data: {
        status: 'CHECKED_OUT',
        adminNote: 'Автоматически закрыто: дата выезда прошла',
      },
    })

    // 3. Помечаем как NO_SHOW если прошло >24ч после заезда
    const noShow = await prisma.booking.updateMany({
      where: {
        status: 'CONFIRMED',
        checkIn: { lt: oneDayAgo },
        checkOut: { gt: now }, // Ещё не должен был выехать
      },
      data: {
        status: 'NO_SHOW',
        adminNote: 'Автоматически помечено: гость не заселился в течение 24ч',
      },
    })

    console.log(`[CRON Cleanup] Cancelled pending: ${cancelledPending.count}, Checked out: ${checkedOut.count}, No show: ${noShow.count}`)

    return NextResponse.json({
      success: true,
      data: {
        cancelledPending: cancelledPending.count,
        checkedOut: checkedOut.count,
        noShow: noShow.count,
        timestamp: now.toISOString(),
      },
    })
  } catch (error) {
    console.error('[CRON Cleanup] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка очистки' },
      { status: 500 }
    )
  }
}

