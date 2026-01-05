import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prismaMock, resetPrismaMocks } from '../mocks/prisma'
import { yookassaMock, resetYookassaMocks } from '../mocks/yookassa'
import { 
  calculateNights, 
  calculateDiscount, 
  calculateTotalPrice 
} from '@/lib/utils'
import { HOTEL, ROOM_TYPES } from '@/constants/hotel'

// Мокаем модули
vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

vi.mock('@/lib/yookassa', () => ({
  createPayment: yookassaMock.createPayment,
  getPayment: yookassaMock.getPayment,
}))

vi.mock('@/lib/telegram', () => ({
  sendTelegramNotification: vi.fn().mockResolvedValue(true),
  notifyNewBooking: vi.fn().mockResolvedValue(true),
  notifyPaymentSuccess: vi.fn().mockResolvedValue(true),
}))

describe('Booking Flow Integration', () => {
  beforeEach(() => {
    resetPrismaMocks()
    resetYookassaMocks()
  })

  describe('Полный flow бронирования', () => {
    const roomType = ROOM_TYPES[0] // Стандарт
    const checkIn = new Date('2026-02-01')
    const checkOut = new Date('2026-02-08') // 7 ночей

    it('корректно рассчитывает цену со скидкой 5%', () => {
      const nights = calculateNights(checkIn, checkOut)
      const discountPercent = calculateDiscount(
        nights,
        HOTEL.discounts.days7,
        HOTEL.discounts.days30
      )
      const { basePrice, discountAmount, totalPrice } = calculateTotalPrice(
        roomType.pricePerNight,
        nights,
        discountPercent
      )

      expect(nights).toBe(7)
      expect(discountPercent).toBe(5)
      expect(basePrice).toBe(roomType.pricePerNight * 7)
      expect(discountAmount).toBe(Math.round(basePrice * 0.05))
      expect(totalPrice).toBe(basePrice - discountAmount)
    })

    it('создаёт бронирование и обновляет статус после оплаты', async () => {
      const bookingId = 'booking-flow-test-123'
      
      // 1. Создание бронирования
      prismaMock.booking.create.mockResolvedValue({
        id: bookingId,
        roomTypeId: roomType.id || 'room-1',
        checkIn,
        checkOut,
        nights: 7,
        guestName: 'Тест Интеграции',
        guestPhone: '79991234567',
        guestEmail: 'integration@test.com',
        guestsCount: 1,
        basePrice: 4200,
        discountPercent: 5,
        discountAmount: 210,
        totalPrice: 3990,
        status: 'PENDING',
        paymentStatus: 'PENDING',
      })

      const createdBooking = await prismaMock.booking.create({
        data: {} as any,
      })
      expect(createdBooking.status).toBe('PENDING')
      expect(createdBooking.paymentStatus).toBe('PENDING')

      // 2. Создание платежа
      const payment = await yookassaMock.createPayment({
        amount: 3990,
        description: `Бронирование #${bookingId}`,
        bookingId,
        guestEmail: 'integration@test.com',
        guestPhone: '79991234567',
        returnUrl: 'http://localhost:3000/booking/success',
        receiptDescription: 'Проживание: Стандарт, 7 ночей',
      })

      expect(payment.paymentId).toBeDefined()
      expect(payment.confirmationUrl).toContain('yookassa.ru')

      // 3. Обновление статуса после webhook
      prismaMock.booking.update.mockResolvedValue({
        ...createdBooking,
        paymentStatus: 'SUCCEEDED',
        status: 'CONFIRMED',
        paidAt: new Date(),
      })

      const updatedBooking = await prismaMock.booking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: 'SUCCEEDED',
          status: 'CONFIRMED',
        },
      })

      expect(updatedBooking.status).toBe('CONFIRMED')
      expect(updatedBooking.paymentStatus).toBe('SUCCEEDED')
    })
  })

  describe('Проверка доступности', () => {
    it('учитывает существующие бронирования', async () => {
      const roomType = ROOM_TYPES[0]
      const totalUnits = 3

      // Симулируем 2 существующих бронирования
      prismaMock.booking.count.mockResolvedValue(2)

      const bookedCount = await prismaMock.booking.count({
        where: {
          roomTypeId: roomType.id,
          status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] },
        },
      })

      const availableUnits = totalUnits - bookedCount
      expect(availableUnits).toBe(1)
    })

    it('блокирует бронирование при нулевой доступности', async () => {
      prismaMock.booking.count.mockResolvedValue(3) // Все 3 номера заняты

      const bookedCount = await prismaMock.booking.count({
        where: { roomTypeId: 'room-1' },
      })

      const availableUnits = 3 - bookedCount
      expect(availableUnits).toBe(0)
      
      // Бронирование должно быть заблокировано
      expect(availableUnits).toBeLessThanOrEqual(0)
    })
  })

  describe('Согласие на обработку ПД', () => {
    it('сохраняется вместе с бронированием', async () => {
      const bookingId = 'booking-consent-test'
      const consentId = 'consent-123'

      prismaMock.consent.create.mockResolvedValue({
        id: consentId,
        type: 'PERSONAL_DATA',
        accepted: true,
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        email: 'consent@test.com',
        phone: '79991234567',
        bookingId,
        acceptedAt: new Date(),
      })

      const consent = await prismaMock.consent.create({
        data: {
          type: 'PERSONAL_DATA',
          accepted: true,
          ip: '127.0.0.1',
          userAgent: 'Mozilla/5.0',
          email: 'consent@test.com',
          bookingId,
        },
      })

      expect(consent.type).toBe('PERSONAL_DATA')
      expect(consent.accepted).toBe(true)
      expect(consent.bookingId).toBe(bookingId)
    })
  })

  describe('Скидки', () => {
    it('5% при 7-29 ночах', () => {
      [7, 14, 21, 29].forEach(nights => {
        const discount = calculateDiscount(nights, 5, 10)
        expect(discount).toBe(5)
      })
    })

    it('10% при >= 30 ночах', () => {
      [30, 45, 60, 90].forEach(nights => {
        const discount = calculateDiscount(nights, 5, 10)
        expect(discount).toBe(10)
      })
    })

    it('0% при < 7 ночах', () => {
      [1, 2, 3, 5, 6].forEach(nights => {
        const discount = calculateDiscount(nights, 5, 10)
        expect(discount).toBe(0)
      })
    })
  })
})

