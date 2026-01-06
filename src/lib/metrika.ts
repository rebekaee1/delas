/**
 * Яндекс.Метрика - хелперы для отправки событий
 * Документация: https://yandex.ru/support/metrica/
 */

// Типы для Яндекс.Метрики
declare global {
  interface Window {
    ym?: (
      counterId: number,
      method: string,
      ...params: any[]
    ) => void
  }
}

const YANDEX_METRIKA_ID = 106156010

/**
 * Проверка что Метрика загружена
 */
function isMetrikaReady(): boolean {
  return typeof window !== 'undefined' && typeof window.ym === 'function'
}

/**
 * Отправка кастомного события в Яндекс.Метрику
 */
export function sendMetrikaEvent(eventName: string, params?: Record<string, any>) {
  if (!isMetrikaReady()) {
    console.warn('[Metrika] Not ready:', eventName)
    return
  }

  try {
    window.ym!(YANDEX_METRIKA_ID, 'reachGoal', eventName, params)
    console.log('[Metrika] Event sent:', eventName, params)
  } catch (error) {
    console.error('[Metrika] Error sending event:', error)
  }
}

/**
 * Отправка параметров визита (для сегментации)
 */
export function sendMetrikaParams(params: Record<string, any>) {
  if (!isMetrikaReady()) return

  try {
    window.ym!(YANDEX_METRIKA_ID, 'params', params)
  } catch (error) {
    console.error('[Metrika] Error sending params:', error)
  }
}

/**
 * Hit (просмотр страницы) - для SPA навигации
 */
export function sendMetrikaHit(url?: string) {
  if (!isMetrikaReady()) return

  try {
    window.ym!(YANDEX_METRIKA_ID, 'hit', url || window.location.href)
  } catch (error) {
    console.error('[Metrika] Error sending hit:', error)
  }
}

// ============================================
// ГОТОВЫЕ СОБЫТИЯ ДЛЯ БИЗНЕС-ЛОГИКИ
// ============================================

/**
 * Просмотр конкретного номера
 */
export function trackRoomView(roomType: string, pricePerNight: number) {
  sendMetrikaEvent('room_view', {
    room_type: roomType,
    price: pricePerNight,
  })
}

/**
 * Клик "Забронировать" на странице номера
 */
export function trackBookingStarted(roomType: string) {
  sendMetrikaEvent('booking_started', {
    room_type: roomType,
  })
}

/**
 * Выбор дат в календаре
 */
export function trackDatesSelected(checkIn: Date, checkOut: Date, nights: number) {
  sendMetrikaEvent('dates_selected', {
    check_in: checkIn.toISOString().split('T')[0],
    check_out: checkOut.toISOString().split('T')[0],
    nights,
  })
}

/**
 * Заполнение формы бронирования (начало)
 */
export function trackBookingFormStarted() {
  sendMetrikaEvent('booking_form_started')
}

/**
 * Отправка формы бронирования (успешно создано бронирование)
 */
export function trackBookingCreated(data: {
  bookingId: string
  roomType: string
  totalPrice: number
  nights: number
  guestsCount: number
}) {
  sendMetrikaEvent('booking_created', {
    booking_id: data.bookingId,
    room_type: data.roomType,
    value: data.totalPrice, // Для отчётов по выручке
    nights: data.nights,
    guests: data.guestsCount,
  })

  // Для Ecommerce (электронная торговля)
  if (isMetrikaReady()) {
    window.ym!(YANDEX_METRIKA_ID, 'ecommerce', 'purchase', {
      id: data.bookingId,
      revenue: data.totalPrice,
      currency: 'RUB',
      products: [
        {
          id: data.roomType,
          name: data.roomType,
          price: data.totalPrice,
          quantity: data.nights,
        },
      ],
    })
  }
}

/**
 * Переход к оплате (создан платёж в ЮKassa)
 */
export function trackPaymentStarted(data: {
  bookingId: string
  totalPrice: number
  paymentUrl: string
}) {
  sendMetrikaEvent('payment_started', {
    booking_id: data.bookingId,
    value: data.totalPrice,
  })
}

/**
 * Успешная оплата (webhook от ЮKassa)
 */
export function trackPaymentSuccess(data: {
  bookingId: string
  totalPrice: number
  roomType: string
}) {
  sendMetrikaEvent('payment_success', {
    booking_id: data.bookingId,
    room_type: data.roomType,
    value: data.totalPrice,
  })

  // Конверсионная цель
  sendMetrikaEvent('purchase', {
    value: data.totalPrice,
    currency: 'RUB',
  })
}

/**
 * Отмена бронирования
 */
export function trackBookingCancelled(data: {
  bookingId: string
  refundAmount: number
}) {
  sendMetrikaEvent('booking_cancelled', {
    booking_id: data.bookingId,
    refund: data.refundAmount,
  })
}

/**
 * Клик на телефон
 */
export function trackPhoneClick(source: string) {
  sendMetrikaEvent('phone_click', {
    source, // 'header', 'footer', 'contacts', 'room_page'
  })
}

/**
 * Клик на WhatsApp
 */
export function trackWhatsAppClick(source: string) {
  sendMetrikaEvent('whatsapp_click', {
    source,
  })
}

/**
 * Отправка корпоративной заявки
 */
export function trackCorporateRequest(data: {
  companyName: string
  guestsCount?: number
}) {
  sendMetrikaEvent('corporate_request', {
    company: data.companyName,
    guests: data.guestsCount,
  })
}

/**
 * Проверка доступности номера
 */
export function trackAvailabilityCheck(roomType: string, nights: number) {
  sendMetrikaEvent('availability_check', {
    room_type: roomType,
    nights,
  })
}

/**
 * Ошибка при бронировании
 */
export function trackBookingError(errorType: string, errorMessage: string) {
  sendMetrikaEvent('booking_error', {
    error_type: errorType,
    error_message: errorMessage,
  })
}

/**
 * Просмотр страницы контактов
 */
export function trackContactsView() {
  sendMetrikaEvent('contacts_view')
}

/**
 * Просмотр корпоративных услуг
 */
export function trackCorporateView() {
  sendMetrikaEvent('corporate_view')
}

