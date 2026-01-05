import { describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { prismaMock, resetPrismaMocks } from '../mocks/prisma'
import { POST as createPayment } from '@/app/api/payment/create/route'
import { POST as webhookHandler } from '@/app/api/payment/webhook/route'

describe('API: /api/payment', () => {
  beforeEach(() => {
    resetPrismaMocks()
  })

  describe('POST /api/payment/create', () => {
    const mockBooking = {
      id: 'booking-123',
      roomTypeId: 'room-1',
      guestName: 'Тест',
      guestPhone: '79991234567',
      guestEmail: 'test@example.com',
      totalPrice: 1200,
      nights: 2,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      roomType: { name: 'Стандарт' },
    }

    it('создаёт платёж для существующего бронирования', async () => {
      prismaMock.booking.findUnique.mockResolvedValue(mockBooking)
      prismaMock.booking.update.mockResolvedValue({
        ...mockBooking,
        paymentId: 'test-payment-id-123',
        paymentStatus: 'PROCESSING',
      })

      const request = new NextRequest('http://localhost:3000/api/payment/create', {
        method: 'POST',
        body: JSON.stringify({ bookingId: 'booking-123' }),
      })

      const response = await createPayment(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.paymentId).toBe('test-payment-id-123')
      expect(data.data.confirmationUrl).toContain('yookassa.ru')
    })

    it('возвращает ошибку для несуществующего бронирования', async () => {
      prismaMock.booking.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/payment/create', {
        method: 'POST',
        body: JSON.stringify({ bookingId: 'not-found' }),
      })

      const response = await createPayment(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Бронирование не найдено')
    })

    it('возвращает ошибку для уже оплаченного бронирования', async () => {
      prismaMock.booking.findUnique.mockResolvedValue({
        ...mockBooking,
        paymentStatus: 'SUCCEEDED',
      })

      const request = new NextRequest('http://localhost:3000/api/payment/create', {
        method: 'POST',
        body: JSON.stringify({ bookingId: 'booking-123' }),
      })

      const response = await createPayment(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Бронирование уже оплачено')
    })

    it('возвращает ошибку для отменённого бронирования', async () => {
      prismaMock.booking.findUnique.mockResolvedValue({
        ...mockBooking,
        status: 'CANCELLED',
      })

      const request = new NextRequest('http://localhost:3000/api/payment/create', {
        method: 'POST',
        body: JSON.stringify({ bookingId: 'booking-123' }),
      })

      const response = await createPayment(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Бронирование отменено')
    })

    it('возвращает ошибку без bookingId', async () => {
      const request = new NextRequest('http://localhost:3000/api/payment/create', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await createPayment(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Неверные данные')
    })
  })

  describe('POST /api/payment/webhook', () => {
    const mockBooking = {
      id: 'booking-123',
      guestName: 'Тест',
      guestPhone: '79991234567',
      guestEmail: 'test@example.com',
      totalPrice: 1200,
      checkIn: new Date('2026-02-01'),
      checkOut: new Date('2026-02-03'),
      nights: 2,
      guestsCount: 1,
      roomType: { name: 'Стандарт' },
    }

    it('обрабатывает payment.succeeded', async () => {
      prismaMock.booking.findUnique.mockResolvedValue(mockBooking)
      prismaMock.booking.update.mockResolvedValue({
        ...mockBooking,
        paymentStatus: 'SUCCEEDED',
        status: 'CONFIRMED',
      })

      const webhookPayload = {
        type: 'notification',
        event: 'payment.succeeded',
        object: {
          id: 'payment-123',
          status: 'succeeded',
          amount: { value: '1200.00' },
          metadata: { booking_id: 'booking-123' },
        },
      }

      const request = new NextRequest('http://localhost:3000/api/payment/webhook', {
        method: 'POST',
        body: JSON.stringify(webhookPayload),
      })

      const response = await webhookHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.received).toBe(true)
    })

    it('обрабатывает payment.canceled', async () => {
      prismaMock.booking.findUnique.mockResolvedValue(mockBooking)
      prismaMock.booking.update.mockResolvedValue({
        ...mockBooking,
        paymentStatus: 'CANCELED',
      })

      const webhookPayload = {
        type: 'notification',
        event: 'payment.canceled',
        object: {
          id: 'payment-123',
          status: 'canceled',
          metadata: { booking_id: 'booking-123' },
        },
      }

      const request = new NextRequest('http://localhost:3000/api/payment/webhook', {
        method: 'POST',
        body: JSON.stringify(webhookPayload),
      })

      const response = await webhookHandler(request)

      expect(response.status).toBe(200)
    })

    it('возвращает 400 для невалидного JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/payment/webhook', {
        method: 'POST',
        body: 'invalid json',
      })

      const response = await webhookHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid JSON')
    })

    it('игнорирует webhook без booking_id в metadata', async () => {
      const webhookPayload = {
        type: 'notification',
        event: 'payment.succeeded',
        object: {
          id: 'payment-123',
          status: 'succeeded',
          metadata: {},
        },
      }

      const request = new NextRequest('http://localhost:3000/api/payment/webhook', {
        method: 'POST',
        body: JSON.stringify(webhookPayload),
      })

      const response = await webhookHandler(request)

      expect(response.status).toBe(200)
      expect(prismaMock.booking.update).not.toHaveBeenCalled()
    })
  })
})
