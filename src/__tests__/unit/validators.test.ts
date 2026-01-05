import { describe, it, expect } from 'vitest'
import { 
  guestFormSchema, 
  createBookingSchema, 
  corporateRequestSchema 
} from '@/lib/validators'

describe('Validators', () => {
  describe('validatePhone (через guestFormSchema)', () => {
    it('принимает корректный формат +7 (XXX) XXX-XX-XX', () => {
      const result = guestFormSchema.safeParse({
        guestName: 'Тест',
        guestPhone: '+7 (999) 123-45-67',
        guestEmail: 'test@example.com',
        guestsCount: 1,
      })
      expect(result.success).toBe(true)
    })

    it('принимает корректный формат 8XXXXXXXXXX', () => {
      const result = guestFormSchema.safeParse({
        guestName: 'Тест',
        guestPhone: '89991234567',
        guestEmail: 'test@example.com',
        guestsCount: 1,
      })
      expect(result.success).toBe(true)
    })

    it('принимает формат +7XXXXXXXXXX', () => {
      const result = guestFormSchema.safeParse({
        guestName: 'Тест',
        guestPhone: '+79991234567',
        guestEmail: 'test@example.com',
        guestsCount: 1,
      })
      expect(result.success).toBe(true)
    })

    it('отклоняет слишком короткий номер', () => {
      const result = guestFormSchema.safeParse({
        guestName: 'Тест',
        guestPhone: '12345',
        guestEmail: 'test@example.com',
        guestsCount: 1,
      })
      expect(result.success).toBe(false)
    })

    it('отклоняет пустой телефон', () => {
      const result = guestFormSchema.safeParse({
        guestName: 'Тест',
        guestPhone: '',
        guestEmail: 'test@example.com',
        guestsCount: 1,
      })
      expect(result.success).toBe(false)
    })
  })

  describe('validateEmail (через guestFormSchema)', () => {
    it('принимает корректный email', () => {
      const result = guestFormSchema.safeParse({
        guestName: 'Тест',
        guestPhone: '+79991234567',
        guestEmail: 'user@example.com',
        guestsCount: 1,
      })
      expect(result.success).toBe(true)
    })

    it('принимает email с поддоменом', () => {
      const result = guestFormSchema.safeParse({
        guestName: 'Тест',
        guestPhone: '+79991234567',
        guestEmail: 'user@mail.example.com',
        guestsCount: 1,
      })
      expect(result.success).toBe(true)
    })

    it('отклоняет email без @', () => {
      const result = guestFormSchema.safeParse({
        guestName: 'Тест',
        guestPhone: '+79991234567',
        guestEmail: 'userexample.com',
        guestsCount: 1,
      })
      expect(result.success).toBe(false)
    })

    it('отклоняет email без домена', () => {
      const result = guestFormSchema.safeParse({
        guestName: 'Тест',
        guestPhone: '+79991234567',
        guestEmail: 'user@',
        guestsCount: 1,
      })
      expect(result.success).toBe(false)
    })

    it('отклоняет пустой email', () => {
      const result = guestFormSchema.safeParse({
        guestName: 'Тест',
        guestPhone: '+79991234567',
        guestEmail: '',
        guestsCount: 1,
      })
      expect(result.success).toBe(false)
    })
  })

  describe('createBookingSchema', () => {
    const validBooking = {
      roomTypeId: 'room-123',
      checkIn: new Date('2026-02-01'),
      checkOut: new Date('2026-02-03'),
      guestName: 'Иван Иванов',
      guestPhone: '+79991234567',
      guestEmail: 'ivan@example.com',
      guestsCount: 2,
    }

    it('принимает валидные данные бронирования', () => {
      const result = createBookingSchema.safeParse(validBooking)
      expect(result.success).toBe(true)
    })

    it('отклоняет без roomTypeId', () => {
      const result = createBookingSchema.safeParse({
        ...validBooking,
        roomTypeId: '',
      })
      expect(result.success).toBe(false)
    })

    it('отклоняет без дат', () => {
      const result = createBookingSchema.safeParse({
        ...validBooking,
        checkIn: undefined,
      })
      expect(result.success).toBe(false)
    })

    it('отклоняет guestsCount < 1', () => {
      const result = createBookingSchema.safeParse({
        ...validBooking,
        guestsCount: 0,
      })
      expect(result.success).toBe(false)
    })

    it('отклоняет guestsCount > 20', () => {
      const result = createBookingSchema.safeParse({
        ...validBooking,
        guestsCount: 25,
      })
      expect(result.success).toBe(false)
    })

    it('принимает опциональный комментарий', () => {
      const result = createBookingSchema.safeParse({
        ...validBooking,
        comment: 'Прибуду поздно вечером',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('corporateRequestSchema', () => {
    const validRequest = {
      companyName: 'ООО Тест',
      contactName: 'Иван Иванов',
      phone: '+79991234567',
      email: 'corp@example.com',
    }

    it('принимает валидную корп. заявку', () => {
      const result = corporateRequestSchema.safeParse(validRequest)
      expect(result.success).toBe(true)
    })

    it('принимает заявку с guestsCount', () => {
      const result = corporateRequestSchema.safeParse({
        ...validRequest,
        guestsCount: 10,
      })
      expect(result.success).toBe(true)
    })

    it('отклоняет без companyName', () => {
      const result = corporateRequestSchema.safeParse({
        ...validRequest,
        companyName: '',
      })
      expect(result.success).toBe(false)
    })

    it('отклоняет без contactName', () => {
      const result = corporateRequestSchema.safeParse({
        ...validRequest,
        contactName: '',
      })
      expect(result.success).toBe(false)
    })
  })
})

