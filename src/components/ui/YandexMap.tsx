'use client'

import { useEffect, useRef, useState } from 'react'
import { HOTEL } from '@/constants/hotel'

/**
 * ID организации в Яндекс.Картах
 * Источник: https://yandex.ru/maps/239/sochi/?poi[uri]=ymapsbm1://org?oid=125392534870
 */
const YANDEX_ORG_ID = '125392534870'

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
          balloonContentFooter: `<a href="${getYandexMapsOrgUrl()}" target="_blank">Открыть в Яндекс.Картах</a>`,
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
    // Fallback — ссылка на организацию в Яндекс.Картах
    return (
      <div className={`bg-sand-50 rounded-xl overflow-hidden ${className}`}>
        <a
          href={getYandexMapsOrgUrl()}
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
 * Получить URL организации в Яндекс.Картах
 */
export function getYandexMapsOrgUrl() {
  const { lat, lng } = HOTEL.address.coordinates
  return `https://yandex.ru/maps/239/sochi/?ll=${lng}%2C${lat}&mode=poi&poi%5Bpoint%5D=${lng}%2C${lat}&poi%5Buri%5D=ymapsbm1%3A%2F%2Forg%3Foid%3D${YANDEX_ORG_ID}&z=17`
}

/**
 * Статичная карта с привязкой к организации
 * Показывает карточку хостела с отзывами
 */
export function YandexMapStatic({ className = '' }: { className?: string }) {
  const { lat, lng } = HOTEL.address.coordinates
  
  // Используем карту с привязкой к организации (oid)
  const mapSrc = `https://yandex.ru/map-widget/v1/?ll=${lng}%2C${lat}&mode=search&oid=${YANDEX_ORG_ID}&ol=biz&z=17`
  
  return (
    <div className={`rounded-xl overflow-hidden ${className}`}>
      <iframe
        src={mapSrc}
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen
        style={{ minHeight: '300px', display: 'block' }}
        title="Хостел DELAS на Яндекс.Картах"
      />
    </div>
  )
}

/**
 * Компонент для отображения ссылки на отзывы
 */
export function YandexReviewsLink({ className = '' }: { className?: string }) {
  return (
    <a
      href={getYandexMapsOrgUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 text-terracotta hover:text-terracotta-dark transition-colors ${className}`}
    >
      <span>⭐</span>
      <span>Смотреть отзывы на Яндекс.Картах</span>
      <span>→</span>
    </a>
  )
}
