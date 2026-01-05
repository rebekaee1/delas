import { vi } from 'vitest'

// Мок Prisma Client для тестов
export const prismaMock = {
  roomType: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  booking: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  hotelSettings: {
    findUnique: vi.fn(),
  },
  consent: {
    create: vi.fn(),
    findMany: vi.fn(),
  },
  corporateRequest: {
    create: vi.fn(),
    findMany: vi.fn(),
  },
  blockedDate: {
    findMany: vi.fn(),
    create: vi.fn(),
    count: vi.fn(),
  },
}

export function resetPrismaMocks() {
  Object.values(prismaMock).forEach(model => {
    Object.values(model).forEach(method => {
      if (typeof method === 'function') {
        method.mockReset()
      }
    })
  })
}

// Мокаем модуль prisma
vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))
