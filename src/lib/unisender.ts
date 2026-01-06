/**
 * UniSender API Integration
 * https://www.unisender.com/ru/support/api/
 * 
 * Российский сервис email-рассылок
 * Бесплатно: 1500 писем/месяц
 */

const UNISENDER_API_KEY = process.env.UNISENDER_API_KEY
const UNISENDER_API_URL = 'https://api.unisender.com/ru/api'
const SENDER_EMAIL = process.env.SMTP_USER || 'info@hostel-delas.ru'
const SENDER_NAME = 'Хостел DELAS'

interface UniSenderEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Отправка email через UniSender API
 */
export async function sendEmailViaUniSender(options: UniSenderEmailOptions): Promise<boolean> {
  if (!UNISENDER_API_KEY) {
    console.warn('[UniSender] API key not configured')
    return false
  }

  try {
    console.log('[UniSender] Sending email to:', options.to)

    // Используем метод sendEmail для транзакционных писем
    const response = await fetch(`${UNISENDER_API_URL}/sendEmail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        format: 'json',
        api_key: UNISENDER_API_KEY,
        email: options.to,
        sender_name: SENDER_NAME,
        sender_email: SENDER_EMAIL,
        subject: options.subject,
        body: options.html,
        list_id: '', // Для транзакционных писем можно оставить пустым
      }),
    })

    const result = await response.json()

    if (result.error) {
      console.error('[UniSender] API Error:', result.error, result.code)
      return false
    }

    if (result.result) {
      console.log('[UniSender] ✅ Email sent successfully:', {
        email_id: result.result.email_id,
        to: options.to,
      })
      return true
    }

    console.error('[UniSender] Unexpected response:', result)
    return false
  } catch (error) {
    console.error('[UniSender] ❌ Failed to send email:', {
      error: error instanceof Error ? error.message : String(error),
      to: options.to,
    })
    return false
  }
}

/**
 * Тестовая функция для проверки UniSender подключения
 */
export async function testUniSenderConnection(): Promise<{
  success: boolean
  message: string
  details?: any
}> {
  if (!UNISENDER_API_KEY) {
    return {
      success: false,
      message: 'UniSender API key не настроен (UNISENDER_API_KEY отсутствует)',
    }
  }

  try {
    console.log('[UniSender] Testing API connection...')

    // Проверяем API key через метод getLists
    const response = await fetch(`${UNISENDER_API_URL}/getLists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        format: 'json',
        api_key: UNISENDER_API_KEY,
      }),
    })

    const result = await response.json()

    if (result.error) {
      console.error('[UniSender] API Error:', result.error)
      return {
        success: false,
        message: result.error,
        details: {
          code: result.code,
        },
      }
    }

    console.log('[UniSender] ✅ API connection successful')
    return {
      success: true,
      message: 'UniSender API подключение успешно',
      details: {
        lists_count: result.result?.length || 0,
        sender_email: SENDER_EMAIL,
      },
    }
  } catch (error) {
    console.error('[UniSender] Connection test failed:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Ошибка подключения к UniSender API',
      details: {
        error: error instanceof Error ? error.message : String(error),
      },
    }
  }
}

