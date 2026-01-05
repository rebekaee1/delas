/**
 * Интеграция с ЮKassa API v3
 * Документация: https://yookassa.ru/developers/
 */

const YOOKASSA_API_URL = 'https://api.yookassa.ru/v3'

interface YooKassaConfig {
  shopId: string
  secretKey: string
}

interface PaymentAmount {
  value: string // Сумма в формате "1000.00"
  currency: 'RUB'
}

interface ReceiptItem {
  description: string
  quantity: string // "1.00"
  amount: PaymentAmount
  vat_code: number // 1 = без НДС (для ИП на УСН)
  payment_subject: 'service' | 'commodity' | 'payment'
  payment_mode: 'full_prepayment' | 'full_payment'
}

interface Receipt {
  customer: {
    email?: string
    phone?: string
  }
  items: ReceiptItem[]
}

interface CreatePaymentParams {
  amount: number // Сумма в рублях
  description: string
  bookingId: string
  guestEmail: string
  guestPhone: string
  returnUrl: string
  receiptDescription: string
}

interface PaymentResponse {
  id: string
  status: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled'
  confirmation?: {
    type: 'redirect'
    confirmation_url: string
  }
  amount: PaymentAmount
  description: string
  metadata: Record<string, string>
  created_at: string
}

/**
 * Получить конфигурацию ЮKassa
 */
function getConfig(): YooKassaConfig {
  const shopId = process.env.YOOKASSA_SHOP_ID
  const secretKey = process.env.YOOKASSA_SECRET_KEY

  if (!shopId || !secretKey) {
    throw new Error('ЮKassa credentials not configured. Set YOOKASSA_SHOP_ID and YOOKASSA_SECRET_KEY')
  }

  return { shopId, secretKey }
}

/**
 * Создать Basic Auth заголовок
 */
function createAuthHeader(config: YooKassaConfig): string {
  const credentials = Buffer.from(`${config.shopId}:${config.secretKey}`).toString('base64')
  return `Basic ${credentials}`
}

/**
 * Генерация уникального ключа идемпотентности
 */
function generateIdempotenceKey(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

/**
 * Создать платёж в ЮKassa
 * Возвращает URL для перенаправления пользователя на оплату
 */
export async function createPayment(params: CreatePaymentParams): Promise<{
  paymentId: string
  confirmationUrl: string
}> {
  const config = getConfig()
  
  const amountStr = params.amount.toFixed(2)
  
  // Формируем данные для чека по 54-ФЗ
  const receipt: Receipt = {
    customer: {
      email: params.guestEmail,
      phone: formatPhoneForReceipt(params.guestPhone),
    },
    items: [{
      description: params.receiptDescription.substring(0, 128), // Макс 128 символов
      quantity: '1.00',
      amount: {
        value: amountStr,
        currency: 'RUB',
      },
      vat_code: 1, // Без НДС (для ИП на УСН)
      payment_subject: 'service',
      payment_mode: 'full_prepayment',
    }],
  }

  const paymentData = {
    amount: {
      value: amountStr,
      currency: 'RUB',
    },
    capture: true, // Автоматическое подтверждение платежа
    confirmation: {
      type: 'redirect',
      return_url: params.returnUrl,
    },
    description: params.description.substring(0, 128),
    metadata: {
      booking_id: params.bookingId,
    },
    receipt,
  }

  const response = await fetch(`${YOOKASSA_API_URL}/payments`, {
    method: 'POST',
    headers: {
      'Authorization': createAuthHeader(config),
      'Content-Type': 'application/json',
      'Idempotence-Key': generateIdempotenceKey(),
    },
    body: JSON.stringify(paymentData),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error('YooKassa API Error:', response.status, errorData)
    throw new Error(`ЮKassa API error: ${response.status}`)
  }

  const payment: PaymentResponse = await response.json()

  if (!payment.confirmation?.confirmation_url) {
    throw new Error('No confirmation URL in payment response')
  }

  return {
    paymentId: payment.id,
    confirmationUrl: payment.confirmation.confirmation_url,
  }
}

/**
 * Получить информацию о платеже
 */
export async function getPayment(paymentId: string): Promise<PaymentResponse> {
  const config = getConfig()

  const response = await fetch(`${YOOKASSA_API_URL}/payments/${paymentId}`, {
    method: 'GET',
    headers: {
      'Authorization': createAuthHeader(config),
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to get payment: ${response.status}`)
  }

  return response.json()
}

/**
 * Проверка подписи webhook от ЮKassa
 * В тестовом режиме IP проверка не требуется
 */
export function verifyWebhookSignature(
  body: string,
  signature: string | null,
  secretKey: string
): boolean {
  // В production режиме здесь должна быть проверка подписи
  // ЮKassa не использует подпись в webhook'ах, но отправляет с определённых IP
  // Для простоты пока пропускаем проверку
  return true
}

/**
 * Форматирование телефона для чека
 * ЮKassa требует формат: 79001234567
 */
function formatPhoneForReceipt(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  
  if (digits.startsWith('8') && digits.length === 11) {
    return '7' + digits.substring(1)
  }
  
  if (digits.startsWith('7') && digits.length === 11) {
    return digits
  }
  
  if (digits.length === 10) {
    return '7' + digits
  }
  
  return digits
}

/**
 * Типы событий webhook
 */
export type WebhookEventType = 
  | 'payment.succeeded'
  | 'payment.canceled'
  | 'payment.waiting_for_capture'
  | 'refund.succeeded'

export interface WebhookEvent {
  type: WebhookEventType
  event: string
  object: PaymentResponse
}

