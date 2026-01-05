import { http, HttpResponse } from 'msw'

// Тестовые данные
const mockRoomTypes = [
  {
    id: 'room-1',
    name: 'Стандарт',
    slug: 'standart',
    pricePerNight: 600,
    beds: 8,
    maxGuests: 8,
    totalUnits: 3,
    isActive: true,
    isWomenOnly: false,
  },
  {
    id: 'room-2',
    name: 'Комфорт',
    slug: 'komfort',
    pricePerNight: 800,
    beds: 6,
    maxGuests: 6,
    totalUnits: 2,
    isActive: true,
    isWomenOnly: false,
  },
]

const mockBooking = {
  id: 'booking-test-123',
  roomTypeId: 'room-1',
  checkIn: new Date('2026-02-01'),
  checkOut: new Date('2026-02-03'),
  nights: 2,
  guestName: 'Тест Тестов',
  guestPhone: '79001234567',
  guestEmail: 'test@example.com',
  guestsCount: 1,
  basePrice: 1200,
  discountPercent: 0,
  discountAmount: 0,
  totalPrice: 1200,
  status: 'PENDING',
  paymentStatus: 'PENDING',
  roomType: { name: 'Стандарт', slug: 'standart' },
}

// MSW handlers для тестирования
export const handlers = [
  // GET /api/rooms
  http.get('/api/rooms', () => {
    return HttpResponse.json({
      success: true,
      data: mockRoomTypes,
    })
  }),

  // POST /api/booking
  http.post('/api/booking', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    
    if (!body.roomTypeId || !body.checkIn || !body.checkOut) {
      return HttpResponse.json(
        { success: false, error: 'Неверные данные' },
        { status: 400 }
      )
    }

    return HttpResponse.json({
      success: true,
      data: {
        bookingId: mockBooking.id,
        status: 'PENDING',
        totalPrice: mockBooking.totalPrice,
        roomTypeName: 'Стандарт',
        checkIn: body.checkIn,
        checkOut: body.checkOut,
        nights: 2,
        discountPercent: 0,
      },
    })
  }),

  // GET /api/booking?id=xxx
  http.get('/api/booking', ({ request }) => {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return HttpResponse.json(
        { success: false, error: 'ID бронирования не указан' },
        { status: 400 }
      )
    }

    if (id === 'not-found') {
      return HttpResponse.json(
        { success: false, error: 'Бронирование не найдено' },
        { status: 404 }
      )
    }

    return HttpResponse.json({
      success: true,
      data: mockBooking,
    })
  }),

  // POST /api/payment/create
  http.post('/api/payment/create', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>

    if (!body.bookingId) {
      return HttpResponse.json(
        { success: false, error: 'ID бронирования не указан' },
        { status: 400 }
      )
    }

    return HttpResponse.json({
      success: true,
      data: {
        paymentId: 'payment-test-123',
        confirmationUrl: 'https://yookassa.ru/checkout/test',
      },
    })
  }),

  // POST /api/payment/webhook
  http.post('/api/payment/webhook', () => {
    return HttpResponse.json({ received: true })
  }),

  // GET /api/payment/status
  http.get('/api/payment/status', ({ request }) => {
    const url = new URL(request.url)
    const bookingId = url.searchParams.get('bookingId')

    if (!bookingId) {
      return HttpResponse.json(
        { success: false, error: 'ID бронирования не указан' },
        { status: 400 }
      )
    }

    return HttpResponse.json({
      success: true,
      data: {
        bookingId,
        paymentStatus: 'SUCCEEDED',
        bookingStatus: 'CONFIRMED',
        paymentId: 'payment-test-123',
      },
    })
  }),

  // POST /api/corporate
  http.post('/api/corporate', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>

    if (!body.companyName || !body.email) {
      return HttpResponse.json(
        { success: false, error: 'Неверные данные' },
        { status: 400 }
      )
    }

    return HttpResponse.json({
      success: true,
      data: {
        id: 'corp-request-123',
        status: 'NEW',
      },
    })
  }),

  // POST /api/consent
  http.post('/api/consent', () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: 'consent-123',
        type: 'COOKIES',
        accepted: true,
        acceptedAt: new Date().toISOString(),
      },
    })
  }),
]

