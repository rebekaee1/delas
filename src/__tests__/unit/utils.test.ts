import { describe, it, expect } from 'vitest'
import { 
  calculateNights, 
  calculateDiscount, 
  calculateTotalPrice,
  formatPriceShort,
  pluralizeNights,
  cn,
} from '@/lib/utils'

describe('Utils', () => {
  describe('calculateNights', () => {
    it('рассчитывает 1 ночь', () => {
      const checkIn = new Date('2026-02-01')
      const checkOut = new Date('2026-02-02')
      expect(calculateNights(checkIn, checkOut)).toBe(1)
    })

    it('рассчитывает 7 ночей', () => {
      const checkIn = new Date('2026-02-01')
      const checkOut = new Date('2026-02-08')
      expect(calculateNights(checkIn, checkOut)).toBe(7)
    })

    it('рассчитывает 30 ночей', () => {
      const checkIn = new Date('2026-02-01')
      const checkOut = new Date('2026-03-03')
      expect(calculateNights(checkIn, checkOut)).toBe(30)
    })

    it('возвращает 0 для одинаковых дат', () => {
      const date = new Date('2026-02-01')
      expect(calculateNights(date, date)).toBe(0)
    })

    it('возвращает абсолютное значение если checkOut раньше checkIn', () => {
      const checkIn = new Date('2026-02-05')
      const checkOut = new Date('2026-02-01')
      // Функция возвращает abs, так как используется differenceInDays
      const nights = calculateNights(checkIn, checkOut)
      expect(nights).toBeGreaterThanOrEqual(0)
    })
  })

  describe('calculateDiscount', () => {
    it('возвращает 0% при < 7 дней', () => {
      expect(calculateDiscount(1, 5, 10)).toBe(0)
      expect(calculateDiscount(3, 5, 10)).toBe(0)
      expect(calculateDiscount(6, 5, 10)).toBe(0)
    })

    it('возвращает 5% при 7-29 днях', () => {
      expect(calculateDiscount(7, 5, 10)).toBe(5)
      expect(calculateDiscount(14, 5, 10)).toBe(5)
      expect(calculateDiscount(29, 5, 10)).toBe(5)
    })

    it('возвращает 10% при >= 30 днях', () => {
      expect(calculateDiscount(30, 5, 10)).toBe(10)
      expect(calculateDiscount(60, 5, 10)).toBe(10)
      expect(calculateDiscount(90, 5, 10)).toBe(10)
    })

    it('использует переданные значения скидок', () => {
      expect(calculateDiscount(7, 7, 15)).toBe(7)
      expect(calculateDiscount(30, 7, 15)).toBe(15)
    })
  })

  describe('calculateTotalPrice', () => {
    it('рассчитывает базовую цену без скидки', () => {
      const result = calculateTotalPrice(600, 5, 0)
      expect(result.basePrice).toBe(3000)
      expect(result.discountAmount).toBe(0)
      expect(result.totalPrice).toBe(3000)
    })

    it('рассчитывает цену со скидкой 5%', () => {
      const result = calculateTotalPrice(600, 7, 5)
      expect(result.basePrice).toBe(4200)
      expect(result.discountAmount).toBe(210)
      expect(result.totalPrice).toBe(3990)
    })

    it('рассчитывает цену со скидкой 10%', () => {
      const result = calculateTotalPrice(600, 30, 10)
      expect(result.basePrice).toBe(18000)
      expect(result.discountAmount).toBe(1800)
      expect(result.totalPrice).toBe(16200)
    })

    it('возвращает 0 при 0 ночей', () => {
      const result = calculateTotalPrice(600, 0, 0)
      expect(result.totalPrice).toBe(0)
    })

    it('округляет до целых', () => {
      const result = calculateTotalPrice(599, 7, 5)
      expect(Number.isInteger(result.totalPrice)).toBe(true)
      expect(Number.isInteger(result.discountAmount)).toBe(true)
    })
  })

  describe('formatPriceShort', () => {
    it('форматирует 600 → "600₽"', () => {
      expect(formatPriceShort(600)).toBe('600₽')
    })

    it('форматирует 1200 с разделителем тысяч', () => {
      const result = formatPriceShort(1200)
      expect(result).toContain('1')
      expect(result).toContain('200')
      expect(result).toContain('₽')
    })

    it('форматирует 18000 с разделителем тысяч', () => {
      const result = formatPriceShort(18000)
      expect(result).toContain('18')
      expect(result).toContain('000')
      expect(result).toContain('₽')
    })

    it('форматирует 0 → "0₽"', () => {
      expect(formatPriceShort(0)).toBe('0₽')
    })
  })

  describe('pluralizeNights', () => {
    it('возвращает "1 ночь"', () => {
      expect(pluralizeNights(1)).toBe('1 ночь')
    })

    it('возвращает "2 ночи"', () => {
      expect(pluralizeNights(2)).toBe('2 ночи')
    })

    it('возвращает "3 ночи"', () => {
      expect(pluralizeNights(3)).toBe('3 ночи')
    })

    it('возвращает "4 ночи"', () => {
      expect(pluralizeNights(4)).toBe('4 ночи')
    })

    it('возвращает "5 ночей"', () => {
      expect(pluralizeNights(5)).toBe('5 ночей')
    })

    it('возвращает "11 ночей"', () => {
      expect(pluralizeNights(11)).toBe('11 ночей')
    })

    it('возвращает "21 ночь"', () => {
      expect(pluralizeNights(21)).toBe('21 ночь')
    })

    it('возвращает "25 ночей"', () => {
      expect(pluralizeNights(25)).toBe('25 ночей')
    })
  })

  describe('cn (classnames helper)', () => {
    it('объединяет классы', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('обрабатывает условные классы', () => {
      expect(cn('base', true && 'included', false && 'excluded')).toBe('base included')
    })

    it('обрабатывает undefined', () => {
      expect(cn('base', undefined, 'another')).toBe('base another')
    })
  })
})

