/**
 * Типы для бронирования
 */

export type PaymentStatus = 
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCEEDED'
  | 'CANCELED'
  | 'FAILED'
  | 'REFUNDED'

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED'
  | 'NO_SHOW'

export interface Booking {
  id: string
  roomTypeId: string
  roomType?: {
    name: string
    slug: string
  }
  checkIn: Date
  checkOut: Date
  nights: number
  guestName: string
  guestPhone: string
  guestEmail: string
  guestsCount: number
  basePrice: number
  discountPercent: number
  discountAmount: number
  totalPrice: number
  paymentStatus: PaymentStatus
  paymentId: string | null
  paidAt: Date | null
  status: BookingStatus
  comment: string | null
  createdAt: Date
}

export interface BookingFormData {
  roomTypeId: string
  checkIn: Date
  checkOut: Date
  guestName: string
  guestPhone: string
  guestEmail: string
  guestsCount: number
  comment?: string
}

export interface BookingResult {
  bookingId: string
  status: BookingStatus
  totalPrice: number
  paymentUrl?: string
}

export interface PriceCalculation {
  pricePerNight: number
  nights: number
  basePrice: number
  discountPercent: number
  discountAmount: number
  totalPrice: number
}


