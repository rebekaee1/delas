import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Search, Phone } from 'lucide-react'
import { HOTEL } from '@/constants/hotel'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Иконка */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-terracotta/10">
            <Search className="w-12 h-12 text-terracotta" />
          </div>
        </div>
        
        {/* Заголовок */}
        <h1 className="text-h1 text-coal mb-4">
          404
        </h1>
        
        <h2 className="text-h3 text-coal mb-4">
          Страница не найдена
        </h2>
        
        <p className="text-body text-coal-light mb-8">
          Возможно, страница была перемещена или удалена. 
          Попробуйте начать с главной страницы.
        </p>
        
        {/* Кнопки */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-terracotta hover:bg-terracotta-dark">
            <Link href="/">
              <Home className="w-5 h-5 mr-2" />
              На главную
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg">
            <a href={`tel:${HOTEL.contacts.phoneRaw}`}>
              <Phone className="w-5 h-5 mr-2" />
              Позвонить
            </a>
          </Button>
        </div>
        
        {/* Ссылки */}
        <div className="mt-12 pt-8 border-t border-sand-200">
          <p className="text-small text-coal-muted mb-4">Возможно, вы искали:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/rooms" className="text-terracotta hover:underline text-small">
              Номера
            </Link>
            <span className="text-coal-muted">·</span>
            <Link href="/booking" className="text-terracotta hover:underline text-small">
              Бронирование
            </Link>
            <span className="text-coal-muted">·</span>
            <Link href="/contacts" className="text-terracotta hover:underline text-small">
              Контакты
            </Link>
            <span className="text-coal-muted">·</span>
            <Link href="/corporate" className="text-terracotta hover:underline text-small">
              Для организаций
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

