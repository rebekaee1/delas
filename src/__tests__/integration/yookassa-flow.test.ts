/**
 * Интеграционные тесты для ЮKassa
 * Тестируем flow платежей: создание → webhook → статус
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prismaMock, resetPrismaMocks } from '../mocks/prisma'
import { yookassaMock, resetYookassaMocks } from '../mocks/yookassa'

// Мокаем модули
vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

vi.mock('@/lib/yookassa', () => yookassaMock)

vi.mock('@/lib/telegram', () => ({
  notifyNewBooking: vi.fn().mockResolvedValue(true),
  notifyPaymentSuccess: vi.fn().mockResolvedValue(true),
  notifyCorporateRequest: vi.fn().mockResolvedValue(true),
  sendTelegramNotification: vi.fn().mockResolvedValue(true),
}))

describe('ЮKassa Integration', () => {
  beforeEach(() => {
    resetPrismaMocks()
    resetYookassaMocks()
    vi.clearAllMocks()
  })

  describe('Создание платежа', () => {
    const mockBooking = {
      id: 'booking-123',
      totalPrice: 1200,
      guestEmail: 'test@test.ru',
      guestPhone: '79991234567',
      guestName: 'Тест',
      paymentStatus: 'PENDING',
      status: 'PENDING',
      nights: 2,
      roomType: { name: 'Стандарт' },
    }

    it('создаёт платёж для бронирования', async () => {
      prismaMock.booking.findUnique.mockResolvedValue(mockBooking as any)
      prismaMock.booking.update.mockResolvedValue({
        ...mockBooking,
        paymentId: 'pay-123',
        paymentStatus: 'PROCESSING',
      } as any)

      yookassaMock.createPayment.mockResolvedValue({
        paymentId: 'pay-123',
        confirmationUrl: 'https://yookassa.ru/pay',
      })

      const { POST } = await import('@/app/api/payment/create/route')
      
      const request = new Request('http://localhost/api/payment/create', {
        method: 'POST',
        body: JSON.stringify({ bookingId: 'booking-123' }),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data.paymentId).toBe('pay-123')
      expect(data.data.confirmationUrl).toBe('https://yookassa.ru/pay')
    })

    it('отклоняет платёж для оплаченного бронирования', async () => {
      prismaMock.booking.findUnique.mockResolvedValue({
        ...mockBooking,
        paymentStatus: 'SUCCEEDED',
      } as any)

      const { POST } = await import('@/app/api/payment/create/route')
      
      const request = new Request('http://localhost/api/payment/create', {
        method: 'POST',
        body: JSON.stringify({ bookingId: 'booking-123' }),
      })

      const response = await POST(request as any)
      expect(response.status).toBe(400)
    })

    it('отклоняет платёж для отменённого бронирования', async () => {
      prismaMock.booking.findUnique.mockResolvedValue({
        ...mockBooking,
        status: 'CANCELLED',
      } as any)

      const { POST } = await import('@/app/api/payment/create/route')
      
      const request = new Request('http://localhost/api/payment/create', {
        method: 'POST',
        body: JSON.stringify({ bookingId: 'booking-123' }),
      })

      const response = await POST(request as any)
      expect(response.status).toBe(400)
    })

    it('возвращает 404 для несуществующего бронирования', async () => {
      prismaMock.booking.findUnique.mockResolvedValue(null)

      const { POST } = await import('@/app/api/payment/create/route')
      
      const request = new Request('http://localhost/api/payment/create', {
        method: 'POST',
        body: JSON.stringify({ bookingId: 'non-existent' }),
      })

      const response = await POST(request as any)
      expect(response.status).toBe(404)
    })
  })

  describe('Webhook обработка', () => {
    const mockBooking = {
      id: 'booking-webhook',
      guestName: 'Webhook Тест',
      guestPhone: '79997654321',
      guestEmail: 'webhook@test.ru',
      totalPrice: 2400,
      checkIn: new Date('2026-02-01'),
      checkOut: new Date('2026-02-03'),
      nights: 2,
      roomType: { name: 'Комфорт' },
    }

    it('обрабатывает успешный платёж', async () => {
      prismaMock.booking.findFirst.mockResolvedValue(mockBooking as any)
      prismaMock.booking.update.mockResolvedValue({
        ...mockBooking,
        paymentStatus: 'SUCCEEDED',
        status: 'CONFIRMED',
      } as any)

      const { POST } = await import('@/app/api/payment/webhook/route')
      
      const request = new Request('http://localhost/api/payment/webhook', {
        method: 'POST',
        body: JSON.stringify({
          type: 'notification',
          event: 'payment.succeeded',
          object: {
            id: 'pay-success',
            status: 'succeeded',
            amount: { value: '2400.00', currency: 'RUB' },
            metadata: { booking_id: 'booking-webhook' },
          },
        }),
      })

      const response = await POST(request as any)
      expect(response.status).toBe(200)
    })

    it('обрабатывает отменённый платёж', async () => {
      prismaMock.booking.findFirst.mockResolvedValue(mockBooking as any)
      prismaMock.booking.update.mockResolvedValue({
        ...mockBooking,
        paymentStatus: 'CANCELLED',
        status: 'CANCELLED',
      } as any)

      const { POST } = await import('@/app/api/payment/webhook/route')
      
      const request = new Request('http://localhost/api/payment/webhook', {
        method: 'POST',
        body: JSON.stringify({
          type: 'notification',
          event: 'payment.canceled',
          object: {
            id: 'pay-canceled',
            status: 'canceled',
            amount: { value: '2400.00', currency: 'RUB' },
            metadata: { booking_id: 'booking-webhook' },
          },
        }),
      })

      const response = await POST(request as any)
      expect(response.status).toBe(200)
    })

    it('игнорирует webhook без booking_id', async () => {
      const { POST } = await import('@/app/api/payment/webhook/route')
      
      const request = new Request('http://localhost/api/payment/webhook', {
        method: 'POST',
        body: JSON.stringify({
          type: 'notification',
          event: 'payment.succeeded',
          object: {
            id: 'pay-no-booking',
            status: 'succeeded',
            metadata: {},
          },
        }),
      })

      const response = await POST(request as any)
      expect(response.status).toBe(200)
    })
  })

  describe('Проверка статуса', () => {
    it('возвращает статус платежа', async () => {
      prismaMock.booking.findUnique.mockResolvedValue({
        id: 'booking-status',
        paymentId: 'pay-status',
        paymentStatus: 'PROCESSING',
        status: 'PENDING',
        totalPrice: 1500,
      } as any)

      yookassaMock.getPayment.mockResolvedValue({
        id: 'pay-status',
        status: 'succeeded',
        amount: { value: '1500.00', currency: 'RUB' },
        metadata: { booking_id: 'booking-status' },
      })

      prismaMock.booking.update.mockResolvedValue({} as any)

      const { GET } = await import('@/app/api/payment/status/route')
      
      const request = new Request('http://localhost/api/payment/status?bookingId=booking-status')

      const response = await GET(request as any)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data.paymentStatus).toBe('SUCCEEDED')
    })

    it('возвращает ошибку без bookingId', async () => {
      const { GET } = await import('@/app/api/payment/status/route')
      
      const request = new Request('http://localhost/api/payment/status')

      const response = await GET(request as any)
      expect(response.status).toBe(400)
    })

    it('возвращает 404 для несуществующего бронирования', async () => {
      prismaMock.booking.findUnique.mockResolvedValue(null)

      const { GET } = await import('@/app/api/payment/status/route')
      
      const request = new Request('http://localhost/api/payment/status?bookingId=non-existent')

      const response = await GET(request as any)
      expect(response.status).toBe(404)
    })
  })

  describe('Валидация', () => {
    it('отклоняет запрос без bookingId', async () => {
      const { POST } = await import('@/app/api/payment/create/route')
      
      const request = new Request('http://localhost/api/payment/create', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request as any)
      expect(response.status).toBe(400)
    })

    it('отклоняет некорректный JSON', async () => {
      const { POST } = await import('@/app/api/payment/create/route')
      
      const request = new Request('http://localhost/api/payment/create', {
        method: 'POST',
        body: 'not json',
      })

      const response = await POST(request as any)
      expect(response.status).toBe(500)
    })
  })
})
