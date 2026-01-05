import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { prismaMock, resetPrismaMocks } from '../mocks/prisma'
import { POST } from '@/app/api/booking/cancel/route'

describe('API: /api/booking/cancel', () => {
  beforeEach(() => {
    resetPrismaMocks()
  })

  const mockBooking = {
    id: 'booking-123',
    guestName: 'Тест Тестов',
    guestPhone: '+79991234567',
    guestEmail: 'test@example.com',
    totalPrice: 1200,
    basePrice: 1200,
    nights: 2,
    checkIn: new Date('2026-02-10'),
    checkOut: new Date('2026-02-12'),
    status: 'CONFIRMED',
    paymentStatus: 'SUCCEEDED',
    paymentId: 'pay-123',
    adminNote: null,
    roomType: { name: 'Стандарт', pricePerNight: 600 },
  }

  it('отменяет бронирование и создаёт возврат', async () => {
    prismaMock.booking.findUnique.mockResolvedValue(mockBooking)
    prismaMock.booking.update.mockResolvedValue({
      ...mockBooking,
      status: 'CANCELLED',
      paymentStatus: 'REFUNDED',
    })

    const request = new NextRequest('http://localhost:3000/api/booking/cancel', {
      method: 'POST',
      body: JSON.stringify({ bookingId: 'booking-123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.bookingId).toBe('booking-123')
    expect(data.data.refundAmount).toBeDefined()
  })

  it('возвращает ошибку без bookingId', async () => {
    const request = new NextRequest('http://localhost:3000/api/booking/cancel', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Неверные данные')
  })

  it('возвращает ошибку для несуществующего бронирования', async () => {
    prismaMock.booking.findUnique.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/booking/cancel', {
      method: 'POST',
      body: JSON.stringify({ bookingId: 'not-found' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Бронирование не найдено')
  })

  it('возвращает ошибку для уже отменённого бронирования', async () => {
    prismaMock.booking.findUnique.mockResolvedValue({
      ...mockBooking,
      status: 'CANCELLED',
    })

    const request = new NextRequest('http://localhost:3000/api/booking/cancel', {
      method: 'POST',
      body: JSON.stringify({ bookingId: 'booking-123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Бронирование уже отменено')
  })

  it('позволяет указать причину отмены', async () => {
    prismaMock.booking.findUnique.mockResolvedValue(mockBooking)
    prismaMock.booking.update.mockResolvedValue({
      ...mockBooking,
      status: 'CANCELLED',
    })

    const request = new NextRequest('http://localhost:3000/api/booking/cancel', {
      method: 'POST',
      body: JSON.stringify({ 
        bookingId: 'booking-123',
        reason: 'Изменились планы'
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })
})
