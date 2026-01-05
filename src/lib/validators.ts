import { z } from 'zod'

/**
 * Валидация телефона (российский формат)
 */
const phoneRegex = /^(\+7|7|8)?[\s\-]?\(?[0-9]{3}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/

/**
 * Схема проверки доступности
 */
export const checkAvailabilitySchema = z.object({
  roomTypeId: z.string().min(1, 'Выберите тип номера'),
  checkIn: z.string().or(z.date()).transform((val) => new Date(val)),
  checkOut: z.string().or(z.date()).transform((val) => new Date(val)),
  guests: z.number().int().min(1, 'Минимум 1 гость').max(10, 'Максимум 10 гостей'),
}).refine((data) => data.checkOut > data.checkIn, {
  message: 'Дата выезда должна быть позже даты заезда',
  path: ['checkOut'],
})

export type CheckAvailabilityInput = z.infer<typeof checkAvailabilitySchema>

/**
 * Схема создания бронирования
 */
export const createBookingSchema = z.object({
  roomTypeId: z.string().min(1, 'Выберите тип номера'),
  checkIn: z.string().or(z.date()).transform((val) => new Date(val)),
  checkOut: z.string().or(z.date()).transform((val) => new Date(val)),
  guestName: z
    .string()
    .min(2, 'Введите имя (минимум 2 символа)')
    .max(100, 'Имя слишком длинное'),
  guestPhone: z
    .string()
    .regex(phoneRegex, 'Введите корректный номер телефона'),
  guestEmail: z
    .string()
    .email('Введите корректный email'),
  guestsCount: z
    .number()
    .int()
    .min(1, 'Минимум 1 гость')
    .max(10, 'Максимум 10 гостей')
    .default(1),
  comment: z
    .string()
    .max(500, 'Комментарий слишком длинный')
    .optional(),
}).refine((data) => data.checkOut > data.checkIn, {
  message: 'Дата выезда должна быть позже даты заезда',
  path: ['checkOut'],
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>

/**
 * Схема формы гостя (клиентская)
 */
export const guestFormSchema = z.object({
  guestName: z
    .string()
    .min(2, 'Введите имя (минимум 2 символа)')
    .max(100, 'Имя слишком длинное'),
  guestPhone: z
    .string()
    .min(10, 'Введите номер телефона')
    .regex(phoneRegex, 'Введите корректный номер телефона'),
  guestEmail: z
    .string()
    .min(1, 'Введите email')
    .email('Введите корректный email'),
  guestsCount: z
    .number()
    .int()
    .min(1, 'Минимум 1 гость')
    .max(10, 'Максимум 10 гостей'),
  comment: z
    .string()
    .max(500, 'Комментарий слишком длинный')
    .optional(),
})

export type GuestFormInput = z.infer<typeof guestFormSchema>

/**
 * Схема корпоративной заявки
 */
export const corporateRequestSchema = z.object({
  companyName: z
    .string()
    .min(2, 'Введите название организации')
    .max(200, 'Название слишком длинное'),
  contactName: z
    .string()
    .min(2, 'Введите имя контактного лица')
    .max(100, 'Имя слишком длинное'),
  phone: z
    .string()
    .regex(phoneRegex, 'Введите корректный номер телефона'),
  email: z
    .string()
    .email('Введите корректный email'),
  guestsCount: z
    .number()
    .int()
    .min(1)
    .optional(),
  checkIn: z
    .string()
    .or(z.date())
    .transform((val) => val ? new Date(val) : undefined)
    .optional(),
  checkOut: z
    .string()
    .or(z.date())
    .transform((val) => val ? new Date(val) : undefined)
    .optional(),
  message: z
    .string()
    .max(1000, 'Сообщение слишком длинное')
    .optional(),
})

export type CorporateRequestInput = z.infer<typeof corporateRequestSchema>

/**
 * Схема для контактной формы
 */
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Введите имя')
    .max(100, 'Имя слишком длинное'),
  phone: z
    .string()
    .regex(phoneRegex, 'Введите корректный номер телефона'),
  message: z
    .string()
    .min(10, 'Сообщение слишком короткое')
    .max(1000, 'Сообщение слишком длинное'),
})

export type ContactFormInput = z.infer<typeof contactFormSchema>


