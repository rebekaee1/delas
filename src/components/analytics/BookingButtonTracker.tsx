'use client'

import Link from 'next/link'
import { trackBookingStarted } from '@/lib/metrika'

interface BookingButtonTrackerProps {
  roomSlug: string
  roomName: string
  children: React.ReactNode
  className?: string
}

/**
 * Обёртка для кнопки "Забронировать" с трекингом
 */
export function BookingButtonTracker({ 
  roomSlug, 
  roomName, 
  children, 
  className 
}: BookingButtonTrackerProps) {
  const handleClick = () => {
    // Яндекс.Метрика: клик на "Забронировать"
    trackBookingStarted(roomName)
  }

  return (
    <Link
      href={`/booking?room=${roomSlug}`}
      onClick={handleClick}
      className={className}
    >
      {children}
    </Link>
  )
}

