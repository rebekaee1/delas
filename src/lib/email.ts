/**
 * Отправка email уведомлений через SMTP (TimeWeb Cloud)
 * Настройки SMTP:
 * - Host: smtp.timeweb.ru
 * - Port: 465 (SSL)
 * - User: info@hostel-delas.ru
 */

import nodemailer from 'nodemailer'
import { HOTEL } from '@/constants/hotel'

// Конфигурация SMTP
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.timeweb.ru'
const SMTP_PORT = Number(process.env.SMTP_PORT) || 465
const SMTP_USER = process.env.SMTP_USER || 'info@hostel-delas.ru'
const SMTP_PASSWORD = process.env.SMTP_PASSWORD

// Создаём транспорт для отправки
const transporter = SMTP_PASSWORD
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // SSL только для 465 порта, для 587 - STARTTLS
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
      tls: {
        // Для TimeWeb и других хостингов, которые могут иметь самоподписанные сертификаты
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000, // 10 секунд
      greetingTimeout: 5000,
      socketTimeout: 15000,
    })
  : null

// Логируем конфигурацию SMTP (без пароля)
if (transporter) {
  console.log('[Email] SMTP configured:', {
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    user: SMTP_USER,
  })
}

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Отправка email
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!transporter) {
    console.warn('[Email] SMTP не настроен. Установите SMTP_PASSWORD в .env')
    return false
  }

  try {
    console.log('[Email] Attempting to send email:', {
      to: options.to,
      subject: options.subject,
      from: `"Хостел DELAS" <${SMTP_USER}>`,
    })
    
    const result = await transporter.sendMail({
      from: `"Хостел DELAS" <${SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })
    
    console.log('[Email] ✅ Email sent successfully:', {
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected,
      response: result.response,
      to: options.to,
    })
    
    return true
  } catch (error) {
    console.error('[Email] ❌ Failed to send email:', {
      error: error instanceof Error ? error.message : String(error),
      code: (error as any)?.code,
      command: (error as any)?.command,
      to: options.to,
      subject: options.subject,
    })
    
    // Дополнительная информация для отладки
    if (error instanceof Error) {
      console.error('[Email] Error details:', {
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 3).join('\n'),
      })
    }
    
    return false
  }
}

/**
 * Тестовая функция для проверки SMTP подключения
 */
export async function testSMTPConnection(): Promise<{ success: boolean; message: string; details?: any }> {
  if (!transporter) {
    return {
      success: false,
      message: 'SMTP не настроен (SMTP_PASSWORD отсутствует)',
    }
  }

  try {
    console.log('[Email] Testing SMTP connection...')
    await transporter.verify()
    console.log('[Email] ✅ SMTP connection verified successfully')
    
    return {
      success: true,
      message: 'SMTP подключение успешно проверено',
      details: {
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        user: SMTP_USER,
      },
    }
  } catch (error) {
    console.error('[Email] ❌ SMTP connection failed:', error)
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Ошибка подключения к SMTP',
      details: {
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        user: SMTP_USER,
        error: error instanceof Error ? {
          message: error.message,
          code: (error as any)?.code,
          command: (error as any)?.command,
          errno: (error as any)?.errno,
        } : String(error),
      },
    }
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

  const cancelUrl = `https://${HOTEL.domain}/booking/cancel?id=${booking.id}`
  const whatsappUrl = `https://wa.me/${HOTEL.contacts.whatsapp.replace(/\D/g, '')}`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #2D2A26; margin: 0; padding: 0; background: #F5F0E8; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #C4704A 0%, #A85A3A 100%); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
    .header p { margin: 10px 0 0; opacity: 0.9; font-size: 16px; }
    .content { background: white; padding: 30px; }
    .greeting { font-size: 18px; margin-bottom: 20px; }
    .info-card { background: #F5F0E8; border-radius: 12px; padding: 24px; margin: 20px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #E8E2DA; }
    .info-row:last-child { border-bottom: none; }
    .label { color: #6B6560; font-size: 14px; }
    .value { font-weight: 600; color: #2D2A26; }
    .total-row { background: #C4704A; color: white; border-radius: 8px; padding: 16px 20px; margin-top: 20px; display: flex; justify-content: space-between; align-items: center; }
    .total-label { font-size: 16px; }
    .total-value { font-size: 24px; font-weight: 700; }
    .section-title { color: #C4704A; font-size: 18px; font-weight: 600; margin: 30px 0 15px; border-bottom: 2px solid #C4704A; padding-bottom: 8px; }
    .address-block { background: #F5F0E8; padding: 20px; border-radius: 12px; margin: 15px 0; }
    .checklist { list-style: none; padding: 0; margin: 0; }
    .checklist li { padding: 8px 0; padding-left: 28px; position: relative; }
    .checklist li::before { content: "✓"; position: absolute; left: 0; color: #4CAF50; font-weight: bold; }
    .button { display: inline-block; background: #C4704A; color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px 5px 10px 0; }
    .button-outline { background: transparent; border: 2px solid #C4704A; color: #C4704A !important; }
    .contacts { background: #F5F0E8; padding: 20px; border-radius: 12px; margin: 20px 0; }
    .contacts a { color: #C4704A; text-decoration: none; }
    .footer { text-align: center; padding: 30px; color: #6B6560; font-size: 14px; }
    .footer a { color: #C4704A; }
    .divider { height: 1px; background: #E8E2DA; margin: 30px 0; }
    @media (max-width: 600px) {
      .content { padding: 20px; }
      .info-row { flex-direction: column; gap: 4px; }
      .button { display: block; text-align: center; margin: 10px 0; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Бронирование подтверждено</h1>
      <p>Номер брони: ${booking.id}</p>
    </div>
    
    <div class="content">
      <p class="greeting">Здравствуйте, ${booking.guestName}!</p>
      <p>Ваше бронирование в хостеле <strong>DELAS</strong> успешно подтверждено и оплачено.</p>
      
      <div class="info-card">
        <div class="info-row">
          <span class="label">Номер</span>
          <span class="value">${booking.roomTypeName}</span>
        </div>
        <div class="info-row">
          <span class="label">Дата заезда</span>
          <span class="value">${checkInStr}, с 14:00</span>
        </div>
        <div class="info-row">
          <span class="label">Дата выезда</span>
          <span class="value">${checkOutStr}, до 12:00</span>
        </div>
        <div class="info-row">
          <span class="label">Ночей</span>
          <span class="value">${booking.nights}</span>
        </div>
        <div class="info-row">
          <span class="label">Гостей</span>
          <span class="value">${booking.guestsCount}</span>
        </div>
      </div>
      
      <div class="total-row">
        <span class="total-label">Оплачено</span>
        <span class="total-value">${booking.totalPrice.toLocaleString('ru-RU')} ₽</span>
      </div>
      
      <h3 class="section-title">📍 Адрес</h3>
      <div class="address-block">
        <strong>${HOTEL.address.full}</strong>
        <p style="margin: 10px 0 0; color: #6B6560; font-size: 14px;">
          ${HOTEL.distances.sea} до моря · ${HOTEL.distances.trainStation} до ж/д вокзала
        </p>
      </div>
      
      <h3 class="section-title">📋 Что взять с собой</h3>
      <ul class="checklist">
        <li>Паспорт или другой документ, удостоверяющий личность</li>
        <li>Тапочки (по желанию)</li>
        <li>Средства личной гигиены</li>
      </ul>
      <p style="color: #6B6560; font-size: 14px; margin-top: 10px;">
        Постельное бельё и полотенце выдаём при заселении
      </p>
      
      <div class="divider"></div>
      
      <h3 class="section-title">📞 Контакты</h3>
      <div class="contacts">
        <p style="margin: 0 0 10px;">
          <strong>Телефон:</strong> <a href="tel:${HOTEL.contacts.phoneRaw}">${HOTEL.contacts.phone}</a>
        </p>
        <p style="margin: 0 0 10px;">
          <strong>WhatsApp:</strong> <a href="${whatsappUrl}">${HOTEL.contacts.whatsapp}</a>
        </p>
        <p style="margin: 0;">
          <strong>Email:</strong> <a href="mailto:${HOTEL.contacts.email}">${HOTEL.contacts.email}</a>
        </p>
      </div>
      
      <p style="margin-top: 30px;">
        <a href="${whatsappUrl}" class="button">Написать в WhatsApp</a>
        <a href="${cancelUrl}" class="button button-outline">Отменить бронь</a>
      </p>
      
      <p style="margin-top: 30px; color: #6B6560; font-size: 14px;">
        Если у вас есть вопросы — звоните или пишите, мы всегда на связи!
      </p>
    </div>
    
    <div class="footer">
      <p><strong>Хостел DELAS</strong></p>
      <p>${HOTEL.address.full}</p>
      <p>
        <a href="https://${HOTEL.domain}">hostel-delas.ru</a>
      </p>
      <p style="margin-top: 20px; font-size: 12px; color: #999;">
        Это письмо отправлено автоматически. Отвечать на него не нужно.
      </p>
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
Оплачено: ${booking.totalPrice.toLocaleString('ru-RU')}₽

АДРЕС
-----
${HOTEL.address.full}
${HOTEL.distances.sea} до моря

ЧТО ВЗЯТЬ С СОБОЙ
-----------------
• Паспорт
• Тапочки (по желанию)
• Средства личной гигиены

Постельное бельё и полотенце выдаём при заселении.

КОНТАКТЫ
--------
Телефон: ${HOTEL.contacts.phone}
WhatsApp: ${HOTEL.contacts.whatsapp}
Email: ${HOTEL.contacts.email}

Если нужно отменить бронь: ${cancelUrl}

Ждём вас!

--
Хостел DELAS
${HOTEL.address.full}
https://${HOTEL.domain}
  `.trim()

  return sendEmail({
    to: booking.guestEmail,
    subject: `✓ Бронирование подтверждено — ${booking.roomTypeName}, ${checkInStr}`,
    html,
    text,
  })
}

/**
 * Email уведомление об отмене бронирования
 */
export async function sendBookingCancellation(booking: {
  guestEmail: string
  guestName: string
  id: string
  roomTypeName: string
  refundAmount: number
}): Promise<boolean> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #2D2A26; margin: 0; padding: 0; background: #F5F0E8; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: #6B6560; color: white; padding: 40px 30px; text-align: center; }
    .content { background: white; padding: 30px; }
    .refund-box { background: #E8F5E9; border: 1px solid #4CAF50; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center; }
    .refund-amount { font-size: 28px; font-weight: 700; color: #4CAF50; }
    .footer { text-align: center; padding: 30px; color: #6B6560; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Бронирование отменено</h1>
      <p>Номер брони: ${booking.id}</p>
    </div>
    
    <div class="content">
      <p>Здравствуйте, ${booking.guestName}!</p>
      <p>Ваше бронирование <strong>${booking.roomTypeName}</strong> успешно отменено.</p>
      
      ${booking.refundAmount > 0 ? `
      <div class="refund-box">
        <p style="margin: 0 0 10px; color: #6B6560;">Сумма возврата:</p>
        <p class="refund-amount">${booking.refundAmount.toLocaleString('ru-RU')} ₽</p>
        <p style="margin: 10px 0 0; font-size: 14px; color: #6B6560;">
          Средства поступят на карту в течение 3-5 рабочих дней
        </p>
      </div>
      ` : ''}
      
      <p>Будем рады видеть вас в следующий раз!</p>
      
      <p style="margin-top: 30px;">
        С уважением,<br>
        Команда хостела DELAS
      </p>
    </div>
    
    <div class="footer">
      <p><strong>Хостел DELAS</strong></p>
      <p>${HOTEL.address.full}</p>
    </div>
  </div>
</body>
</html>
  `.trim()

  return sendEmail({
    to: booking.guestEmail,
    subject: `Бронирование отменено — ${booking.roomTypeName}`,
    html,
  })
}
