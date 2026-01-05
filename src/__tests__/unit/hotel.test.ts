import { describe, it, expect } from 'vitest'
import { HOTEL, ROOM_TYPES } from '@/constants/hotel'

describe('Hotel Constants', () => {
  describe('ROOM_TYPES', () => {
    it('содержит 4 типа номеров', () => {
      expect(ROOM_TYPES).toHaveLength(4)
    })

    it('каждый номер имеет обязательные поля', () => {
      ROOM_TYPES.forEach(room => {
        expect(room).toHaveProperty('slug')
        expect(room).toHaveProperty('name')
        expect(room).toHaveProperty('pricePerNight')
        expect(room).toHaveProperty('beds')
        expect(room).toHaveProperty('amenities')
      })
    })

    it('slug уникален для каждого номера', () => {
      const slugs = ROOM_TYPES.map(r => r.slug)
      const uniqueSlugs = new Set(slugs)
      expect(uniqueSlugs.size).toBe(slugs.length)
    })

    it('pricePerNight положительное число', () => {
      ROOM_TYPES.forEach(room => {
        expect(room.pricePerNight).toBeGreaterThan(0)
      })
    })

    it('beds >= 1', () => {
      ROOM_TYPES.forEach(room => {
        expect(room.beds).toBeGreaterThanOrEqual(1)
      })
    })

    it('содержит Стандарт', () => {
      const standard = ROOM_TYPES.find(r => r.slug === 'standart')
      expect(standard).toBeDefined()
      expect(standard?.name).toBe('Стандарт')
    })

    it('содержит Комфорт', () => {
      const comfort = ROOM_TYPES.find(r => r.slug === 'komfort')
      expect(comfort).toBeDefined()
      expect(comfort?.name).toBe('Комфорт')
    })

    it('содержит женский номер', () => {
      const womenRoom = ROOM_TYPES.find(r => r.isWomenOnly === true)
      expect(womenRoom).toBeDefined()
    })
  })

  describe('HOTEL.contacts', () => {
    it('телефон в формате +7', () => {
      expect(HOTEL.contacts.phone).toMatch(/^\+7/)
    })

    it('email содержит @', () => {
      expect(HOTEL.contacts.email).toContain('@')
    })

    it('есть WhatsApp или Telegram контакт', () => {
      expect(HOTEL.contacts.whatsapp || HOTEL.contacts.telegram).toBeTruthy()
    })
  })

  describe('HOTEL.discounts', () => {
    it('days7 = 5%', () => {
      expect(HOTEL.discounts.days7).toBe(5)
    })

    it('days30 = 10%', () => {
      expect(HOTEL.discounts.days30).toBe(10)
    })

    it('days30 > days7', () => {
      expect(HOTEL.discounts.days30).toBeGreaterThan(HOTEL.discounts.days7)
    })
  })

  describe('HOTEL.address', () => {
    it('содержит полный адрес', () => {
      expect(HOTEL.address.full).toBeTruthy()
      expect(HOTEL.address.full.length).toBeGreaterThan(10)
    })

    it('содержит координаты', () => {
      expect(HOTEL.address.coordinates).toBeDefined()
      expect(HOTEL.address.coordinates.lat).toBeGreaterThan(0)
      expect(HOTEL.address.coordinates.lng).toBeGreaterThan(0)
    })

    it('координаты в пределах Сочи', () => {
      // Сочи примерно 43.5°N, 39.7°E
      expect(HOTEL.address.coordinates.lat).toBeGreaterThan(43)
      expect(HOTEL.address.coordinates.lat).toBeLessThan(44)
      expect(HOTEL.address.coordinates.lng).toBeGreaterThan(39)
      expect(HOTEL.address.coordinates.lng).toBeLessThan(40)
    })
  })

  describe('HOTEL.schedule', () => {
    it('checkIn в формате HH:MM', () => {
      expect(HOTEL.schedule.checkIn).toMatch(/^\d{2}:\d{2}$/)
    })

    it('checkOut в формате HH:MM', () => {
      expect(HOTEL.schedule.checkOut).toMatch(/^\d{2}:\d{2}$/)
    })

    it('checkIn = 14:00', () => {
      expect(HOTEL.schedule.checkIn).toBe('14:00')
    })

    it('checkOut = 12:00', () => {
      expect(HOTEL.schedule.checkOut).toBe('12:00')
    })
  })
})

