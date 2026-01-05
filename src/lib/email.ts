/**
 * Отправка email уведомлений
 * Использует Resend API или SMTP
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@delas-sochi.ru'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Отправка email через Resend API
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn('Email credentials not configured')
    return false
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `Хостел DELAS <${FROM_EMAIL}>`,
        to: [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Resend API error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

/**
 * Email подтверждения бронирования (после оплаты)
 */
export async function sendBookingConfirmation(booking: {
  guestEmail: string
  guestName: string
  id: string
  roomTypeName: string
  checkIn: Date
  checkOut: Date
  nights: number
  totalPrice: number
  guestsCount: number
}): Promise<boolean> {
  const checkInStr = booking.checkIn.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const checkOutStr = booking.checkOut.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #2D2A26; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #C4704A; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #F5F0E8; padding: 30px; border-radius: 0 0 8px 8px; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #E8E2DA; }
    .label { color: #6B6560; }
    .value { font-weight: 600; }
    .total { font-size: 24px; color: #C4704A; font-weight: bold; }
    .footer { text-align: center; padding: 20px; color: #6B6560; font-size: 14px; }
    .button { display: inline-block; background: #C4704A; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 28px;">✓ Бронирование подтверждено</h1>
      <p style="margin: 10px 0 0; opacity: 0.9;">Номер бронирования: ${booking.id}</p>
    </div>
    
    <div class="content">
      <p>Здравствуйте, ${booking.guestName}!</p>
      <p>Ваше бронирование в хостеле DELAS успешно подтверждено.</p>
      
      <h3 style="color: #C4704A; margin-top: 30px;">Детали бронирования</h3>
      
      <div class="info-row">
        <span class="label">Номер:</span>
        <span class="value">${booking.roomTypeName}</span>
      </div>
      
      <div class="info-row">
        <span class="label">Дата заезда:</span>
        <span class="value">${checkInStr}, с 14:00</span>
      </div>
      
      <div class="info-row">
        <span class="label">Дата выезда:</span>
        <span class="value">${checkOutStr}, до 12:00</span>
      </div>
      
      <div class="info-row">
        <span class="label">Ночей:</span>
        <span class="value">${booking.nights}</span>
      </div>
      
      <div class="info-row">
        <span class="label">Гостей:</span>
        <span class="value">${booking.guestsCount}</span>
      </div>
      
      <div class="info-row" style="border: none; padding-top: 20px;">
        <span class="label" style="font-size: 18px;">Оплачено:</span>
        <span class="total">${booking.totalPrice.toLocaleString('ru-RU')}₽</span>
      </div>
      
      <h3 style="color: #C4704A; margin-top: 30px;">Адрес</h3>
      <p>г. Сочи, ул. Гагарина, 53а</p>
      
      <h3 style="color: #C4704A; margin-top: 30px;">Что взять с собой</h3>
      <ul>
        <li>Паспорт или другой документ, удостоверяющий личность</li>
        <li>Тапочки (по желанию)</li>
        <li>Полотенце (по желанию)</li>
      </ul>
      
      <p style="margin-top: 30px;">Если у вас есть вопросы — звоните или пишите:</p>
      <p>📞 +7 (XXX) XXX-XX-XX</p>
      <p>✉️ info@delas-sochi.ru</p>
      
      <p style="margin-top: 30px;">Ждём вас!</p>
    </div>
    
    <div class="footer">
      <p>Хостел DELAS, г. Сочи</p>
      <p>Это письмо отправлено автоматически, отвечать на него не нужно.</p>
    </div>
  </div>
</body>
</html>
  `.trim()

  const text = `
Бронирование подтверждено!

Номер бронирования: ${booking.id}

Здравствуйте, ${booking.guestName}!

Ваше бронирование в хостеле DELAS успешно подтверждено.

ДЕТАЛИ БРОНИРОВАНИЯ
-------------------
Номер: ${booking.roomTypeName}
Дата заезда: ${checkInStr}, с 14:00
Дата выезда: ${checkOutStr}, до 12:00
Ночей: ${booking.nights}
Гостей: ${booking.guestsCount}
Оплачено: ${booking.totalPrice}₽

АДРЕС
-----
г. Сочи, ул. Гагарина, 53а

Если у вас есть вопросы — звоните: +7 (XXX) XXX-XX-XX

Ждём вас!

--
Хостел DELAS, г. Сочи
  `.trim()

  return sendEmail({
    to: booking.guestEmail,
    subject: `✓ Бронирование подтверждено — ${booking.roomTypeName}, ${checkInStr}`,
    html,
    text,
  })
}



