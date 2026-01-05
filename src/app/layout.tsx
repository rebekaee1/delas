// Полностью динамический рендеринг (без SSG при сборке)
export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { Unbounded, Golos_Text } from 'next/font/google'
import './globals.css'
import { Header, Footer } from '@/components/layout'
import { CookieConsent } from '@/components/layout/CookieConsent'
import { YandexMetrika } from '@/components/analytics/YandexMetrika'
import { OrganizationJsonLd, LocalBusinessJsonLd } from '@/components/seo/JsonLd'
import { LoadingProvider } from '@/components/providers/LoadingProvider'

// Шрифты согласно DESIGN_GUIDELINES.md
const unbounded = Unbounded({
  subsets: ['cyrillic', 'latin'],
  variable: '--font-unbounded',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const golosText = Golos_Text({
  subsets: ['cyrillic', 'latin'],
  variable: '--font-golos',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

// SEO метаданные согласно BUSINESS_INFO.md
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://delas-sochi.ru'),
  title: {
    default: 'Хостел DELAS в Сочи — койко-место от 600₽ | Центр города',
    template: '%s | Хостел DELAS Сочи',
  },
  description: 'Уютный хостел DELAS на ул. Гагарина 53а в Сочи. Койко-места от 600₽/ночь. Женский номер, кухня 24/7, рядом с морем. Бронируйте онлайн!',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: '/logo.png',
  },
  keywords: [
    'хостел сочи',
    'хостел сочи недорого',
    'койко-место сочи',
    'хостел гагарина сочи',
    'женский хостел сочи',
    'жильё сочи от 600 рублей',
    'хостел для командировочных сочи',
    'хостел рядом с морем сочи',
    'где остановиться в сочи недорого',
  ],
  authors: [{ name: 'Хостел DELAS' }],
  creator: 'Хостел DELAS',
  publisher: 'Хостел DELAS',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: '/',
    siteName: 'Хостел DELAS',
    title: 'Хостел DELAS в Сочи — койко-место от 600₽',
    description: 'Уютный хостел в центре Сочи. Койко-места от 600₽/ночь. Женский номер, кухня 24/7, рядом с морем.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Хостел DELAS в Сочи',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Хостел DELAS в Сочи — койко-место от 600₽',
    description: 'Уютный хостел в центре Сочи. Койко-места от 600₽/ночь.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Добавить после регистрации в вебмастерах
    // google: 'google-site-verification-code',
    // yandex: 'yandex-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className={`${unbounded.variable} ${golosText.variable}`}>
      <head>
        <meta name="theme-color" content="#C4704A" />
        <OrganizationJsonLd />
        <LocalBusinessJsonLd />
      </head>
      <body className="min-h-screen bg-sand font-body antialiased flex flex-col">
        <LoadingProvider>
          <YandexMetrika />
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <CookieConsent />
        </LoadingProvider>
      </body>
    </html>
  )
}

