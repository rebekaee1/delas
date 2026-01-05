/**
 * SEO константы согласно BUSINESS_INFO.md
 */

import { HOTEL } from './hotel'

export const SEO = {
  siteName: 'Хостел DELAS',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://delas-sochi.ru',
  
  // Главная страница
  home: {
    title: 'Хостел DELAS в Сочи — койко-место от 600₽ | Центр города',
    description: `Уютный хостел DELAS на ${HOTEL.address.street} ${HOTEL.address.building} в Сочи. Койко-места от 600₽/ночь. Женский номер, кухня 24/7, рядом с морем. Бронируйте онлайн!`,
  },
  
  // Страница номеров
  rooms: {
    title: 'Номера и цены',
    description: 'Выберите подходящий номер в хостеле DELAS. Стандарт от 600₽, Комфорт от 800₽, Женский номер от 1000₽. Бронирование онлайн.',
  },
  
  // Страница контактов
  contacts: {
    title: 'Контакты',
    description: `Хостел DELAS: ${HOTEL.address.full}. Работаем круглосуточно. Звоните ${HOTEL.contacts.phone}`,
  },
  
  // Страница для организаций
  corporate: {
    title: 'Для организаций',
    description: 'Размещение бригад и командировочных в Сочи. Безналичный расчёт, закрывающие документы. Индивидуальные условия.',
  },
  
  // Страница бронирования (noindex)
  booking: {
    title: 'Бронирование',
    description: 'Забронируйте койко-место в хостеле DELAS онлайн.',
    noindex: true,
  },
  
  // Ключевые слова
  keywords: {
    primary: [
      'хостел сочи',
      'хостел сочи недорого',
      'койко-место сочи',
    ],
    secondary: [
      'хостел гагарина сочи',
      'женский хостел сочи',
      'хостел сочи центр',
      'хостел сочи круглосуточно',
    ],
    longtail: [
      'жильё сочи от 600 рублей',
      'хостел для командировочных сочи',
      'хостел рядом с морем сочи',
      'где остановиться в сочи недорого',
    ],
  },
  
  // Schema.org разметка для локального бизнеса
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'Hostel',
    name: HOTEL.fullName,
    description: 'Уютный хостел в центре Сочи с койко-местами от 600₽/ночь',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://delas-sochi.ru',
    telephone: HOTEL.contacts.phone,
    email: HOTEL.contacts.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${HOTEL.address.street}, ${HOTEL.address.building}`,
      addressLocality: HOTEL.address.city,
      addressRegion: 'Краснодарский край',
      postalCode: '354000',
      addressCountry: 'RU',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: HOTEL.address.coordinates.lat,
      longitude: HOTEL.address.coordinates.lng,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59',
    },
    priceRange: '₽',
    currenciesAccepted: 'RUB',
    paymentAccepted: 'Cash, Credit Card',
    amenityFeature: [
      { '@type': 'LocationFeatureSpecification', name: 'Wi-Fi', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Kitchen', value: true },
      { '@type': 'LocationFeatureSpecification', name: '24-hour front desk', value: true },
    ],
  },
} as const



