import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/rooms/route'
import { GET as getAvailability } from '@/app/api/rooms/availability/route'
import { prismaMock, resetPrismaMocks } from '../mocks/prisma'

// Мокаем prisma
vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

describe('API: /api/rooms', () => {
  beforeEach(() => {
    resetPrismaMocks()
  })

  const mockRoomTypes = [
    {
      id: 'room-1',
      name: 'Стандарт',
      slug: 'standart',
      description: 'Описание стандарта',
      pricePerNight: 600,
      beds: 8,
      maxGuests: 8,
      totalUnits: 3,
      amenities: ['Wi-Fi', 'Кухня'],
      images: [],
      isActive: true,
      isWomenOnly: false,
      sortOrder: 0,
    },
    {
      id: 'room-2',
      name: 'Комфорт',
      slug: 'komfort',
      description: 'Описание комфорта',
      pricePerNight: 800,
      beds: 6,
      maxGuests: 6,
      totalUnits: 2,
      amenities: ['Wi-Fi', 'Кухня', 'Кондиционер'],
      images: [],
      isActive: true,
      isWomenOnly: false,
      sortOrder: 1,
    },
  ]

  describe('GET /api/rooms', () => {
    it('возвращает список активных номеров', async () => {
      prismaMock.roomType.findMany.mockResolvedValue(mockRoomTypes)

      const request = new NextRequest('http://localhost:3000/api/rooms')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
      expect(data.data[0].name).toBe('Стандарт')
    })

    it('возвращает пустой массив если нет номеров', async () => {
      prismaMock.roomType.findMany.mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/rooms')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(0)
    })
  })

  describe('GET /api/rooms/availability', () => {
    it('возвращает доступность для дат', async () => {
      prismaMock.roomType.findMany.mockResolvedValue(mockRoomTypes)
      prismaMock.booking.count.mockResolvedValue(1) // 1 номер занят

      const request = new NextRequest(
        'http://localhost:3000/api/rooms/availability?checkIn=2026-02-01&checkOut=2026-02-03'
      )
      const response = await getAvailability(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
      expect(data.data[0].availableUnits).toBeDefined()
    })

    it('возвращает ошибку без дат', async () => {
      const request = new NextRequest('http://localhost:3000/api/rooms/availability')
      const response = await getAvailability(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })
})

