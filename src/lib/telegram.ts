/**
 * Отправка уведомлений в Telegram
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

interface TelegramMessage {
  text: string
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2'
  disable_notification?: boolean
}

/**
 * Отправка сообщения в Telegram чат
 */
export async function sendTelegramMessage(message: TelegramMessage): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('Telegram credentials not configured')
    return false
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message.text,
          parse_mode: message.parse_mode || 'HTML',
          disable_notification: message.disable_notification || false,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      console.error('Telegram API error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error sending Telegram message:', error)
    return false
  }
}

/**
 * Уведомление о новом бронировании
 */
export async function notifyNewBooking(booking: {
  id: string
  guestName: string
  guestPhone: string
  guestEmail: string
  roomTypeName: string
  checkIn: Date
  checkOut: Date
  nights: number
  totalPrice: number
  guestsCount: number
}): Promise<boolean> {
  const checkInStr = booking.checkIn.toLocaleDateString('ru-RU')
  const checkOutStr = booking.checkOut.toLocaleDateString('ru-RU')

  const message = `
🏨 <b>Новое бронирование!</b>

📋 <b>ID:</b> ${booking.id}
👤 <b>Гость:</b> ${booking.guestName}
📞 <b>Телефон:</b> <a href="tel:${booking.guestPhone}">${booking.guestPhone}</a>
✉️ <b>Email:</b> ${booking.guestEmail}

🛏 <b>Номер:</b> ${booking.roomTypeName}
👥 <b>Гостей:</b> ${booking.guestsCount}

📅 <b>Заезд:</b> ${checkInStr}
📅 <b>Выезд:</b> ${checkOutStr}
🌙 <b>Ночей:</b> ${booking.nights}

💰 <b>Сумма:</b> ${booking.totalPrice}₽

⏳ Ожидает оплаты
`.trim()

  return sendTelegramMessage({ text: message })
}

/**
 * Уведомление об оплате
 */
export async function notifyPaymentSuccess(booking: {
  id: string
  guestName: string
  guestPhone: string
  roomTypeName: string
  checkIn: Date
  totalPrice: number
}): Promise<boolean> {
  const checkInStr = booking.checkIn.toLocaleDateString('ru-RU')

  const message = `
✅ <b>Оплата получена!</b>

📋 <b>ID:</b> ${booking.id}
👤 <b>Гость:</b> ${booking.guestName}
📞 <b>Телефон:</b> <a href="tel:${booking.guestPhone}">${booking.guestPhone}</a>
🛏 <b>Номер:</b> ${booking.roomTypeName}
📅 <b>Заезд:</b> ${checkInStr}
💰 <b>Сумма:</b> ${booking.totalPrice}₽

🎉 Бронирование подтверждено!
`.trim()

  return sendTelegramMessage({ text: message })
}

/**
 * Уведомление о корпоративной заявке
 */
export async function notifyCorporateRequest(request: {
  id: string
  companyName: string
  contactName: string
  phone: string
  email: string
  guestsCount?: number | null
  message?: string | null
}): Promise<boolean> {
  const message = `
🏢 <b>Корпоративная заявка!</b>

📋 <b>ID:</b> ${request.id}
🏛 <b>Компания:</b> ${request.companyName}
👤 <b>Контакт:</b> ${request.contactName}
📞 <b>Телефон:</b> <a href="tel:${request.phone}">${request.phone}</a>
✉️ <b>Email:</b> ${request.email}
${request.guestsCount ? `👥 <b>Человек:</b> ${request.guestsCount}` : ''}
${request.message ? `\n💬 <b>Сообщение:</b>\n${request.message}` : ''}

📞 Нужно связаться с клиентом!
`.trim()

  return sendTelegramMessage({ text: message })
}

