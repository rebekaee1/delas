'use client'

import { useEffect } from 'react'
import type React from 'react'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CookieConsent } from '@/components/layout/CookieConsent'
import { YandexMetrika } from '@/components/analytics/YandexMetrika'
import { initAttribution } from '@/lib/attribution'

/**
 * Клиентская "оболочка" для компонентов, которые используют хуки/контекст.
 * Нужна, чтобы build (static prerender) не падал с:
 * "TypeError: Cannot read properties of null (reading 'useContext')"
 */
export function ClientShell({ children }: { children: React.ReactNode }) {
  // Инициализируем attribution трекинг при первом визите
  useEffect(() => {
    initAttribution()
  }, [])

  return (
    <>
      <YandexMetrika />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CookieConsent />
    </>
  )
}


