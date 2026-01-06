'use client'

import { useEffect } from 'react'
import { trackRoomView } from '@/lib/metrika'

interface RoomViewTrackerProps {
  roomType: string
  pricePerNight: number
}

/**
 * Клиентский компонент для трекинга просмотра страницы номера
 * Добавляется на серверную страницу /rooms/[slug]
 */
export function RoomViewTracker({ roomType, pricePerNight }: RoomViewTrackerProps) {
  useEffect(() => {
    // Отправляем событие просмотра номера
    trackRoomView(roomType, pricePerNight)
  }, [roomType, pricePerNight])

  return null
}

