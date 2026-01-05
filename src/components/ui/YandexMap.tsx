'use client'

import { useEffect, useRef, useState } from 'react'
import { HOTEL } from '@/constants/hotel'

interface YandexMapProps {
  className?: string
  zoom?: number
}

declare global {
  interface Window {
    ymaps: any
  }
}

export function YandexMap({ className = '', zoom = 16 }: YandexMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(false)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    // Проверяем, загружен ли уже API
    if (window.ymaps) {
      initMap()
      return
    }

    // Загружаем Яндекс.Карты API
    const script = document.createElement('script')
    script.src = 'https://api-maps.yandex.ru/2.1/?apikey=ваш_api_ключ&lang=ru_RU'
    script.async = true
    script.onload = () => {
      window.ymaps.ready(initMap)
    }
    script.onerror = () => {
      setError(true)
    }
    document.head.appendChild(script)

    return () => {
      // Cleanup при размонтировании
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy()
      }
    }
  }, [])

  function initMap() {
    if (!mapRef.current || mapInstanceRef.current) return

    try {
      const { lat, lng } = HOTEL.address.coordinates

      mapInstanceRef.current = new window.ymaps.Map(mapRef.current, {
        center: [lat, lng],
        zoom: zoom,
        controls: ['zoomControl', 'fullscreenControl'],
      })

      // Добавляем метку
      const placemark = new window.ymaps.Placemark(
        [lat, lng],
        {
          hintContent: HOTEL.fullName,
          balloonContentHeader: `<strong>${HOTEL.fullName}</strong>`,
          balloonContentBody: `
            <p>${HOTEL.address.full}</p>
            <p>📞 <a href="tel:${HOTEL.contacts.phoneRaw}">${HOTEL.contacts.phone}</a></p>
            <p>⏰ Ресепшен: ${HOTEL.schedule.reception}</p>
          `,
          balloonContentFooter: `<a href="https://yandex.ru/maps/?pt=${lng},${lat}&z=${zoom}&l=map" target="_blank">Открыть в Яндекс.Картах</a>`,
        },
        {
          preset: 'islands#redHotelIcon',
          iconColor: '#C4704A', // Терракотовый цвет бренда
        }
      )

      mapInstanceRef.current.geoObjects.add(placemark)
      setIsLoaded(true)
    } catch (e) {
      console.error('Ошибка инициализации карты:', e)
      setError(true)
    }
  }

  if (error) {
    // Fallback — ссылка на Яндекс.Карты
    return (
      <div className={`bg-sand-50 rounded-xl overflow-hidden ${className}`}>
        <a
          href={`https://yandex.ru/maps/?pt=${HOTEL.address.coordinates.lng},${HOTEL.address.coordinates.lat}&z=${zoom}&l=map`}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-8 text-center hover:bg-sand transition-colors"
        >
          <div className="text-4xl mb-4">🗺️</div>
          <p className="text-body font-medium text-coal">{HOTEL.address.full}</p>
          <p className="text-small text-terracotta mt-2">Открыть на Яндекс.Картах →</p>
        </a>
      </div>
    )
  }

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-sand-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-small text-coal-light">Загрузка карты...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full min-h-[300px]" />
    </div>
  )
}

/**
 * Статичная карта без API ключа — использует iframe
 * Не требует регистрации, работает сразу
 */
export function YandexMapStatic({ className = '' }: { className?: string }) {
  const { lat, lng } = HOTEL.address.coordinates
  
  return (
    <div className={`rounded-xl overflow-hidden ${className}`}>
      <iframe
        src={`https://yandex.ru/map-widget/v1/?ll=${lng}%2C${lat}&mode=whatshere&whatshere%5Bpoint%5D=${lng}%2C${lat}&whatshere%5Bzoom%5D=17&z=17`}
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen
        style={{ minHeight: '300px', display: 'block' }}
        title="Расположение хостела DELAS на карте"
      />
    </div>
  )
}

