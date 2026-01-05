import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ROOM_TYPES } from '@/constants/hotel'

// Тестируем карточки номеров из главной страницы
// Поскольку RoomCard может быть inline в page.tsx, тестируем через ROOM_TYPES данные

describe('RoomCard Data', () => {
  const standardRoom = ROOM_TYPES.find(r => r.slug === 'standart')!
  const womenRoom = ROOM_TYPES.find(r => r.isWomenOnly)!

  it('Стандарт имеет все необходимые данные', () => {
    expect(standardRoom).toBeDefined()
    expect(standardRoom.name).toBe('Стандарт')
    expect(standardRoom.pricePerNight).toBeGreaterThan(0)
    expect(standardRoom.beds).toBeGreaterThan(0)
    expect(standardRoom.amenities).toBeDefined()
    expect(standardRoom.amenities.length).toBeGreaterThan(0)
  })

  it('Женский номер имеет флаг isWomenOnly', () => {
    expect(womenRoom).toBeDefined()
    expect(womenRoom.isWomenOnly).toBe(true)
    expect(womenRoom.name).toContain('Женский')
  })

  it('Все номера имеют slug для URL', () => {
    ROOM_TYPES.forEach(room => {
      expect(room.slug).toMatch(/^[a-z-]+$/)
      expect(room.slug.length).toBeGreaterThan(0)
    })
  })

  it('Все номера имеют изображения', () => {
    ROOM_TYPES.forEach(room => {
      // Проверяем наличие хотя бы image4x3
      expect(room.image4x3 || room.image16x9).toBeDefined()
    })
  })

  it('Цены номеров в разумных пределах', () => {
    ROOM_TYPES.forEach(room => {
      expect(room.pricePerNight).toBeGreaterThanOrEqual(500)
      expect(room.pricePerNight).toBeLessThanOrEqual(3000)
    })
  })

  it('Количество мест положительное', () => {
    ROOM_TYPES.forEach(room => {
      expect(room.beds).toBeGreaterThanOrEqual(1)
      expect(room.beds).toBeLessThanOrEqual(20)
    })
  })
})

