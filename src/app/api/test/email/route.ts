import { NextRequest, NextResponse } from 'next/server'
import { sendBookingConfirmation } from '@/lib/email'

/**
 * GET /api/test/email?to=your@email.com
 * Тестовая отправка email
 * 
 * УДАЛИТЬ ПЕРЕД PRODUCTION!
 */
export async function GET(request: NextRequest) {
  // Только в development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Недоступно в production' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const to = searchParams.get('to')

  if (!to) {
    return NextResponse.json({ 
      error: 'Укажите email: /api/test/email?to=your@email.com' 
    }, { status: 400 })
  }

  // Тестовые данные бронирования
  const testBooking = {
    id: 'TEST-' + Date.now(),
    guestName: 'Тестовый Гость',
    guestEmail: to,
    roomTypeName: 'Комфорт',
    checkIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // через неделю
    checkOut: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // через 10 дней
    nights: 3,
    totalPrice: 2400,
    guestsCount: 1,
  }

  try {
    const success = await sendBookingConfirmation(testBooking)

    if (success) {
      return NextResponse.json({
        success: true,
        message: `Тестовое письмо отправлено на ${to}`,
        booking: testBooking,
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Не удалось отправить письмо. Проверьте SMTP настройки в .env.local',
        hint: 'Убедитесь что SMTP_PASSWORD заполнен',
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Email test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка отправки',
    }, { status: 500 })
  }
}

