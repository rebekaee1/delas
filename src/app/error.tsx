'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, RefreshCw, AlertTriangle, Phone } from 'lucide-react'
import { HOTEL } from '@/constants/hotel'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Логируем ошибку в консоль (и в Sentry если настроен)
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Иконка */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
        </div>
        
        {/* Заголовок */}
        <h1 className="text-h2 text-coal mb-4">
          Что-то пошло не так
        </h1>
        
        <p className="text-body text-coal-light mb-8">
          Произошла непредвиденная ошибка. Попробуйте обновить страницу 
          или вернитесь на главную.
        </p>
        
        {/* Код ошибки (для отладки) */}
        {error.digest && (
          <p className="text-small text-coal-muted mb-8">
            Код ошибки: {error.digest}
          </p>
        )}
        
        {/* Кнопки */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={reset}
            size="lg" 
            className="bg-terracotta hover:bg-terracotta-dark"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Попробовать снова
          </Button>
          
          <Button asChild variant="outline" size="lg">
            <Link href="/">
              <Home className="w-5 h-5 mr-2" />
              На главную
            </Link>
          </Button>
        </div>
        
        {/* Контакты для помощи */}
        <div className="mt-12 pt-8 border-t border-sand-200">
          <p className="text-small text-coal-muted mb-4">
            Если проблема повторяется, свяжитесь с нами:
          </p>
          <Button asChild variant="ghost" size="sm">
            <a href={`tel:${HOTEL.contacts.phoneRaw}`}>
              <Phone className="w-4 h-4 mr-2" />
              {HOTEL.contacts.phone}
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}

