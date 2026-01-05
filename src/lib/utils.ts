import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Объединяет классы Tailwind с поддержкой условий
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Форматирует цену в рублях
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

/**
 * Форматирует цену коротко (без символа валюты)
 */
export function formatPriceShort(price: number): string {
  return `${new Intl.NumberFormat('ru-RU').format(price)}₽`
}

/**
 * Форматирует дату на русском
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    ...options,
  })
}

/**
 * Форматирует дату коротко (15 янв)
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  })
}

/**
 * Вычисляет количество ночей между датами
 */
export function calculateNights(checkIn: Date, checkOut: Date): number {
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Склонение существительных (1 ночь, 2 ночи, 5 ночей)
 */
export function pluralize(count: number, forms: [string, string, string]): string {
  const cases = [2, 0, 1, 1, 1, 2]
  const index = count % 100 > 4 && count % 100 < 20 
    ? 2 
    : cases[Math.min(count % 10, 5)]
  return `${count} ${forms[index]}`
}

/**
 * Склонение для ночей
 */
export function pluralizeNights(count: number): string {
  return pluralize(count, ['ночь', 'ночи', 'ночей'])
}

/**
 * Склонение для гостей
 */
export function pluralizeGuests(count: number): string {
  return pluralize(count, ['гость', 'гостя', 'гостей'])
}

/**
 * Склонение для мест
 */
export function pluralizeBeds(count: number): string {
  return pluralize(count, ['место', 'места', 'мест'])
}

/**
 * Вычисляет скидку на основе количества ночей
 */
export function calculateDiscount(
  nights: number, 
  discount2Days: number = 5, 
  discount7Days: number = 10
): number {
  if (nights >= 7) return discount7Days
  if (nights >= 2) return discount2Days
  return 0
}

/**
 * Вычисляет итоговую цену с учётом скидки
 */
export function calculateTotalPrice(
  pricePerNight: number,
  nights: number,
  discountPercent: number
): { basePrice: number; discountAmount: number; totalPrice: number } {
  const basePrice = pricePerNight * nights
  const discountAmount = Math.round(basePrice * discountPercent / 100)
  const totalPrice = basePrice - discountAmount
  
  return { basePrice, discountAmount, totalPrice }
}

/**
 * Форматирует номер телефона
 */
export function formatPhone(phone: string): string {
  // Убираем всё кроме цифр
  const digits = phone.replace(/\D/g, '')
  
  // Форматируем как +7 (XXX) XXX-XX-XX
  if (digits.length === 11 && digits.startsWith('7')) {
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`
  }
  
  if (digits.length === 10) {
    return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`
  }
  
  return phone
}

/**
 * Проверяет, является ли дата прошлым
 */
export function isPastDate(date: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

/**
 * Генерирует slug из строки
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[а-яё]/g, (char) => {
      const map: Record<string, string> = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
      }
      return map[char] || char
    })
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

