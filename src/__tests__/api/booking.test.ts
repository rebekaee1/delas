import { describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { prismaMock, resetPrismaMocks } from '../mocks/prisma'
// Важно: мок prisma уже настроен в mocks/prisma.ts
import { POST, GET } from '@/app/api/booking/route'

describe('API: /api/booking', () => {
  beforeEach(() => {
    resetPrismaMocks()
  })

  describe('POST /api/booking', () => {
    const validBookingData = {
      roomTypeId: 'room-123',
      checkIn: '2026-02-01T00:00:00.000Z',
      checkOut: '2026-02-03T00:00:00.000Z',
      guestName: 'Иван Иванов',
      guestPhone: '+79991234567',
      guestEmail: 'ivan@example.com',
      guestsCount: 1,
    }

    const mockRoomType = {
      id: 'room-123',
      name: 'Стандарт',
      slug: 'standart',
      pricePerNight: 600,
      beds: 8,
      maxGuests: 8,
      totalUnits: 3,
      isActive: true,
    }

    it('создаёт бронирование с валидными данными', async () => {
      prismaMock.roomType.findUnique.mockResolvedValue(mockRoomType)
      prismaMock.booking.count.mockResolvedValue(0)
      prismaMock.hotelSettings.findUnique.mockResolvedValue({
        id: 'main',
        discount2Days: 5,
        discount7Days: 10,
      })
      prismaMock.booking.create.mockResolvedValue({
        id: 'booking-new-123',
        ...validBookingData,
        nights: 2,
        basePrice: 1200,
        discountPercent: 0,
        discountAmount: 0,
        totalPrice: 1200,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        roomType: { name: 'Стандарт', slug: 'standart' },
      })

      const request = new NextRequest('http://localhost:3000/api/booking', {
        method: 'POST',
        body: JSON.stringify(validBookingData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.bookingId).toBe('booking-new-123')
      expect(data.data.totalPrice).toBe(1200)
    })

    it('возвращает ошибку при пустых полях', async () => {
      const request = new NextRequest('http://localhost:3000/api/booking', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Неверные данные')
    })

    it('возвращает ошибку при несуществующем roomTypeId', async () => {
      prismaMock.roomType.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/booking', {
        method: 'POST',
        body: JSON.stringify(validBookingData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Тип номера не найден')
    })

    it('возвращает ошибку при превышении вместимости', async () => {
      prismaMock.roomType.findUnique.mockResolvedValue({
        ...mockRoomType,
        maxGuests: 2,
      })

      const request = new NextRequest('http://localhost:3000/api/booking', {
        method: 'POST',
        body: JSON.stringify({
          ...validBookingData,
          guestsCount: 5,
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Максимум')
    })

    it('возвращает ошибку при отсутствии свободных мест', async () => {
      prismaMock.roomType.findUnique.mockResolvedValue(mockRoomType)
      prismaMock.booking.count.mockResolvedValue(3) // Все 3 номера заняты

      const request = new NextRequest('http://localhost:3000/api/booking', {
        method: 'POST',
        body: JSON.stringify(validBookingData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toBe('Нет свободных мест на выбранные даты')
    })
  })

  describe('GET /api/booking', () => {
    it('возвращает бронирование по ID', async () => {
      const mockBooking = {
        id: 'booking-123',
        roomTypeId: 'room-1',
        checkIn: new Date('2026-02-01'),
        checkOut: new Date('2026-02-03'),
        nights: 2,
        guestName: 'Тест',
        guestsCount: 1,
        basePrice: 1200,
        discountPercent: 0,
        discountAmount: 0,
        totalPrice: 1200,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        createdAt: new Date(),
        roomType: { name: 'Стандарт', slug: 'standart', images: [] },
      }
      prismaMock.booking.findUnique.mockResolvedValue(mockBooking)

      const request = new NextRequest('http://localhost:3000/api/booking?id=booking-123')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.id).toBe('booking-123')
    })

    it('возвращает ошибку без ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/booking')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('ID бронирования не указан')
    })

    it('возвращает 404 для несуществующего ID', async () => {
      prismaMock.booking.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/booking?id=not-found')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Бронирование не найдено')
    })
  })
})
