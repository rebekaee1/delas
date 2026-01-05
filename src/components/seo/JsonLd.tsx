import { HOTEL, ROOM_TYPES } from '@/constants/hotel'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://delas-sochi.ru'

/**
 * JSON-LD структурированные данные для SEO
 * Помогает Google понять контент сайта
 */

// Данные об организации
export function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Hostel',
    '@id': BASE_URL,
    name: 'Хостел DELAS',
    alternateName: ['DELAS Hostel', 'Хостел Делас'],
    description: 'Уютный хостел в центре Сочи. Койко-места от 600₽/ночь. Кухня 24/7, женский номер, рядом с морем.',
    url: BASE_URL,
    telephone: HOTEL.contacts.phone,
    email: HOTEL.contacts.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: HOTEL.address.street,
      addressLocality: 'Сочи',
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
    priceRange: '₽₽',
    starRating: {
      '@type': 'Rating',
      ratingValue: '4.5',
    },
    amenityFeature: HOTEL.amenities.map(a => ({
      '@type': 'LocationFeatureSpecification',
      name: a.name,
      value: true,
    })),
    image: `${BASE_URL}/images/reception_16x9.webp`,
    logo: `${BASE_URL}/logo.png`,
    sameAs: [
      HOTEL.contacts.telegram ? `https://t.me/${HOTEL.contacts.telegram.replace('@', '')}` : '',
      HOTEL.contacts.whatsapp ? `https://wa.me/${HOTEL.contacts.whatsapp.replace(/\D/g, '')}` : '',
    ].filter(Boolean),
    potentialAction: {
      '@type': 'ReserveAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/rooms`,
        actionPlatform: ['http://schema.org/DesktopWebPlatform', 'http://schema.org/MobileWebPlatform'],
      },
      result: {
        '@type': 'LodgingReservation',
        name: 'Бронирование койко-места',
      },
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// Данные о хлебных крошках
export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// Данные о типе номера
export function RoomJsonLd({ roomSlug }: { roomSlug: string }) {
  const room = ROOM_TYPES.find(r => r.slug === roomSlug)
  if (!room) return null

  const data = {
    '@context': 'https://schema.org',
    '@type': 'HotelRoom',
    name: room.name,
    description: room.description,
    occupancy: {
      '@type': 'QuantitativeValue',
      value: room.beds,
      unitText: 'мест',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'RUB',
      price: room.pricePerNight,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: 'https://schema.org/InStock',
      url: `${BASE_URL}/rooms/${room.slug}`,
    },
    amenityFeature: room.amenities.map(a => ({
      '@type': 'LocationFeatureSpecification',
      name: a,
      value: true,
    })),
    image: `${BASE_URL}${room.image4x3}`,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// FAQ для страницы
export function FAQJsonLd({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// Локальный бизнес (для Google Maps)
export function LocalBusinessJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: 'Хостел DELAS',
    image: `${BASE_URL}/images/reception_16x9.webp`,
    '@id': BASE_URL,
    url: BASE_URL,
    telephone: HOTEL.contacts.phone,
    priceRange: '₽₽',
    address: {
      '@type': 'PostalAddress',
      streetAddress: HOTEL.address.street,
      addressLocality: 'Сочи',
      addressRegion: 'Краснодарский край',
      postalCode: '354000',
      addressCountry: 'RU',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: HOTEL.address.coordinates.lat,
      longitude: HOTEL.address.coordinates.lng,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.5',
      reviewCount: '50',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

