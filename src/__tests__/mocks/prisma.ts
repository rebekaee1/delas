import { vi } from 'vitest'

// Мок Prisma Client для тестов
export const prismaMock = {
  roomType: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  booking: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
  },
  hotelSettings: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
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
  $queryRaw: vi.fn().mockResolvedValue([{ 1: 1 }]),
  $transaction: vi.fn((callback) => callback(prismaMock)),
}

export function resetPrismaMocks() {
  // Сбрасываем все моки
  prismaMock.roomType.findUnique.mockReset()
  prismaMock.roomType.findFirst.mockReset()
  prismaMock.roomType.findMany.mockReset()
  prismaMock.roomType.create.mockReset()
  prismaMock.roomType.update.mockReset()
  prismaMock.roomType.delete.mockReset()
  
  prismaMock.booking.findUnique.mockReset()
  prismaMock.booking.findFirst.mockReset()
  prismaMock.booking.findMany.mockReset()
  prismaMock.booking.create.mockReset()
  prismaMock.booking.update.mockReset()
  prismaMock.booking.delete.mockReset()
  prismaMock.booking.count.mockReset()
  prismaMock.booking.aggregate.mockReset()
  
  prismaMock.hotelSettings.findUnique.mockReset()
  prismaMock.hotelSettings.findFirst.mockReset()
  
  prismaMock.consent.create.mockReset()
  prismaMock.consent.findMany.mockReset()
  
  prismaMock.corporateRequest.create.mockReset()
  prismaMock.corporateRequest.findMany.mockReset()
  
  prismaMock.blockedDate.findMany.mockReset()
  prismaMock.blockedDate.create.mockReset()
  prismaMock.blockedDate.count.mockReset()
}
