/**
 * Типы для номеров
 */

export interface RoomType {
  id: string
  name: string
  slug: string
  description: string
  beds: number
  pricePerNight: number
  amenities: string[]
  images: string[]
  maxGuests: number
  totalUnits: number
  isActive: boolean
  isWomenOnly: boolean
  sortOrder: number
}

export interface RoomAvailability {
  roomTypeId: string
  available: boolean
  availableUnits: number
  pricePerNight: number
  totalPrice: number
  nights: number
  discountPercent: number
  discountAmount: number
}

export interface RoomCardProps {
  room: RoomType
  checkIn?: Date
  checkOut?: Date
  className?: string
}


