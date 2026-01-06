'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft, Search } from 'lucide-react'
import { sendMetrikaEvent } from '@/lib/metrika'

/**
 * 404 страница с трекингом в Яндекс.Метрику
 */
export default function NotFound() {
  const pathname = usePathname()

  useEffect(() => {
    // Отправляем событие 404 в Метрику
    sendMetrikaEvent('page_404', {
      url: pathname || window.location.pathname,
      referer: document.referrer,
    })

    console.log('[404] Page not found:', pathname)
  }, [pathname])

  return (
    <div className="min-h-screen bg-sand-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 */}
        <div className="mb-8">
          <h1 className="text-9xl font-heading font-bold text-terracotta">404</h1>
          <div className="mt-4 space-y-2">
            <h2 className="text-h2 text-coal">Страница не найдена</h2>
            <p className="text-body text-coal-light">
              К сожалению, запрашиваемая страница не существует или была перемещена.
            </p>
          </div>
        </div>

        {/* Действия */}
        <div className="space-y-3">
          <Button 
            asChild 
            size="lg" 
            className="w-full bg-terracotta hover:bg-terracotta-dark"
          >
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              На главную
            </Link>
          </Button>

          <Button 
            asChild 
            variant="outline" 
            size="lg" 
            className="w-full border-terracotta text-terracotta hover:bg-terracotta hover:text-white"
          >
            <Link href="/rooms">
              <Search className="mr-2 h-5 w-5" />
              Посмотреть номера
            </Link>
          </Button>

          <Button 
            asChild 
            variant="ghost" 
            size="lg" 
            className="w-full"
            onClick={() => window.history.back()}
          >
            <button type="button">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Назад
            </button>
          </Button>
        </div>

        {/* Популярные ссылки */}
        <div className="mt-12 pt-8 border-t border-sand-200">
          <p className="text-small text-coal-light mb-4">Возможно, вы искали:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link 
              href="/rooms" 
              className="text-small text-terracotta hover:underline"
            >
              Номера
            </Link>
            <span className="text-coal-light">•</span>
            <Link 
              href="/booking" 
              className="text-small text-terracotta hover:underline"
            >
              Бронирование
            </Link>
            <span className="text-coal-light">•</span>
            <Link 
              href="/corporate" 
              className="text-small text-terracotta hover:underline"
            >
              Для организаций
            </Link>
            <span className="text-coal-light">•</span>
            <Link 
              href="/contacts" 
              className="text-small text-terracotta hover:underline"
            >
              Контакты
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
