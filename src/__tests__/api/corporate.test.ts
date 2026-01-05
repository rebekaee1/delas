import { describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { prismaMock, resetPrismaMocks } from '../mocks/prisma'
import { POST } from '@/app/api/corporate/route'

describe('API: /api/corporate', () => {
  beforeEach(() => {
    resetPrismaMocks()
  })

  describe('POST /api/corporate', () => {
    const validRequest = {
      companyName: 'ООО "Тест"',
      contactName: 'Иванов Иван',
      phone: '+79991234567',
      email: 'corp@example.com',
      guestsCount: 10,
      checkIn: '2026-02-01T00:00:00.000Z',
      checkOut: '2026-02-10T00:00:00.000Z',
      message: 'Нужно разместить команду',
    }

    it('создаёт корпоративную заявку', async () => {
      prismaMock.corporateRequest.create.mockResolvedValue({
        id: 'corp-123',
        ...validRequest,
        status: 'NEW',
        createdAt: new Date(),
      })

      const request = new NextRequest('http://localhost:3000/api/corporate', {
        method: 'POST',
        body: JSON.stringify(validRequest),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.requestId).toBeDefined()
    })

    it('возвращает ошибку при некорректном email', async () => {
      const request = new NextRequest('http://localhost:3000/api/corporate', {
        method: 'POST',
        body: JSON.stringify({
          ...validRequest,
          email: 'not-an-email',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('возвращает ошибку без companyName', async () => {
      const request = new NextRequest('http://localhost:3000/api/corporate', {
        method: 'POST',
        body: JSON.stringify({
          contactName: 'Иванов',
          phone: '+79991234567',
          email: 'test@test.com',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('создаёт заявку с минимальными обязательными полями', async () => {
      const minimalRequest = {
        companyName: 'ООО "Минимал"',
        contactName: 'Тест',
        phone: '+79991234567',
        email: 'test@example.com', // email обязателен
      }

      prismaMock.corporateRequest.create.mockResolvedValue({
        id: 'corp-456',
        ...minimalRequest,
        status: 'NEW',
        createdAt: new Date(),
      })

      const request = new NextRequest('http://localhost:3000/api/corporate', {
        method: 'POST',
        body: JSON.stringify(minimalRequest),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('отклоняет honeypot-ботов', async () => {
      const request = new NextRequest('http://localhost:3000/api/corporate', {
        method: 'POST',
        body: JSON.stringify({
          ...validRequest,
          website: 'http://spam.com', // honeypot field
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Ошибка валидации')
    })
  })
})
