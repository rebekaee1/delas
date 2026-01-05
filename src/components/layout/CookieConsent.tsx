'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Cookie, X } from 'lucide-react'

const COOKIE_CONSENT_KEY = 'delas_cookie_consent'

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    // Проверяем, давал ли пользователь согласие ранее
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      // Показываем баннер с небольшой задержкой
      const timer = setTimeout(() => setIsVisible(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = async () => {
    // Сохраняем согласие локально
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      accepted: true,
      timestamp: new Date().toISOString(),
    }))

    // Отправляем на сервер (для аналитики и 152-ФЗ)
    try {
      await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'COOKIES',
          accepted: true,
        }),
      })
    } catch (error) {
      // Не критично, если API недоступен
      console.error('Failed to save cookie consent:', error)
    }

    // Анимация закрытия
    setIsClosing(true)
    setTimeout(() => setIsVisible(false), 300)
  }

  const handleDecline = () => {
    // Сохраняем отказ (не блокируем сайт)
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      accepted: false,
      timestamp: new Date().toISOString(),
    }))
    setIsClosing(true)
    setTimeout(() => setIsVisible(false), 300)
  }

  if (!isVisible) return null

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-50 p-4 transition-all duration-300 ${
        isClosing ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'
      }`}
    >
      <div className="container max-w-4xl mx-auto">
        <div className="bg-coal text-sand-100 rounded-xl shadow-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Cookie className="w-8 h-8 text-terracotta flex-shrink-0 hidden sm:block" />
          
          <div className="flex-1">
            <p className="text-sm sm:text-base">
              Мы используем cookies для улучшения работы сайта и анализа посещаемости. 
              Продолжая использовать сайт, вы соглашаетесь с{' '}
              <Link href="/privacy" className="text-terracotta hover:underline">
                Политикой конфиденциальности
              </Link>.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDecline}
              className="text-sand-200 hover:text-sand hover:bg-coal-light flex-1 sm:flex-none"
            >
              Отклонить
            </Button>
            <Button
              onClick={handleAccept}
              size="sm"
              className="bg-terracotta hover:bg-terracotta-dark text-white flex-1 sm:flex-none"
            >
              Принять
            </Button>
          </div>

          <button
            onClick={handleDecline}
            className="absolute top-2 right-2 sm:static p-1 text-sand-300 hover:text-sand transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

