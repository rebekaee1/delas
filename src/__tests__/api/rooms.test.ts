import { describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { prismaMock, resetPrismaMocks } from '../mocks/prisma'
// Важно: мок prisma уже настроен в mocks/prisma.ts

// Импортируем после моков
import { GET } from '@/app/api/rooms/route'
import { POST as checkAvailability } from '@/app/api/rooms/availability/route'

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

  describe('POST /api/rooms/availability', () => {
    it('возвращает доступность для дат', async () => {
      prismaMock.roomType.findUnique.mockResolvedValue(mockRoomTypes[0])
      prismaMock.booking.count.mockResolvedValue(1) // 1 номер занят
      prismaMock.blockedDate.count.mockResolvedValue(0) // Нет заблокированных дат
      prismaMock.hotelSettings.findUnique.mockResolvedValue({
        id: 'main',
        discount2Days: 5,
        discount7Days: 10,
      })

      const request = new NextRequest(
        'http://localhost:3000/api/rooms/availability',
        {
          method: 'POST',
          body: JSON.stringify({
            roomTypeId: 'room-1',
            checkIn: '2026-02-01T00:00:00.000Z',
            checkOut: '2026-02-03T00:00:00.000Z',
            guests: 1,
          }),
        }
      )
      const response = await checkAvailability(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.availableUnits).toBeDefined()
    })

    it('возвращает ошибку без данных', async () => {
      const request = new NextRequest('http://localhost:3000/api/rooms/availability', {
        method: 'POST',
        body: JSON.stringify({}),
      })
      const response = await checkAvailability(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })
})
