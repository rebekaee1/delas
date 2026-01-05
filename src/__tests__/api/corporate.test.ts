import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { prismaMock, resetPrismaMocks } from '../mocks/prisma'
// Важно: мок prisma уже настроен в mocks/prisma.ts

// Мокаем telegram отдельно
vi.mock('@/lib/telegram', () => ({
  notifyCorporateRequest: vi.fn().mockResolvedValue(true),
}))

// Импортируем после моков
import { POST } from '@/app/api/corporate/route'

describe('API: /api/corporate', () => {
  beforeEach(() => {
    resetPrismaMocks()
  })

  describe('POST /api/corporate', () => {
    const validRequest = {
      companyName: 'ООО Тест',
      contactName: 'Иван Иванов',
      phone: '+79991234567',
      email: 'corp@example.com',
      guestsCount: 10,
      message: 'Нужно разместить сотрудников',
    }

    it('создаёт корпоративную заявку', async () => {
      prismaMock.corporateRequest.create.mockResolvedValue({
        id: 'corp-123',
        ...validRequest,
        status: 'NEW',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const request = new NextRequest('http://localhost:3000/api/corporate', {
        method: 'POST',
        body: JSON.stringify(validRequest),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.requestId).toBe('corp-123')
    })

    it('возвращает ошибку при некорректном email', async () => {
      const request = new NextRequest('http://localhost:3000/api/corporate', {
        method: 'POST',
        body: JSON.stringify({
          ...validRequest,
          email: 'invalid-email',
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
          ...validRequest,
          companyName: '',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('создаёт заявку без опциональных полей', async () => {
      const minimalRequest = {
        companyName: 'ООО Минимум',
        contactName: 'Тест',
        phone: '+79991234567',
        email: 'test@example.com',
      }

      prismaMock.corporateRequest.create.mockResolvedValue({
        id: 'corp-124',
        ...minimalRequest,
        guestsCount: null,
        message: null,
        status: 'NEW',
        createdAt: new Date(),
        updatedAt: new Date(),
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
  })
})
