import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import { HOTEL } from '@/constants/hotel'

const navigation = {
  main: [
    { name: 'Номера', href: '/rooms' },
    { name: 'Для организаций', href: '/corporate' },
    { name: 'Контакты', href: '/contacts' },
  ],
  legal: [
    { name: 'Политика конфиденциальности', href: '/privacy' },
    { name: 'Оферта', href: '/terms' },
  ],
}

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-coal text-sand-200">
      {/* Основной блок */}
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Лого и описание */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/logo.png"
                alt={HOTEL.fullName}
                width={140}
                height={48}
                className="h-10 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-body text-sand-300 max-w-md mb-4">
              Уютный хостел в центре Сочи. Комфортные койко-места от 600₽/ночь.
              Рядом с морем, кухня 24/7, женские номера.
            </p>
            <div className="flex items-center gap-2 text-small text-sand-300">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>{HOTEL.address.full}</span>
            </div>
          </div>

          {/* Контакты */}
          <div>
            <h3 className="text-body font-semibold text-white mb-4">Контакты</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href={`tel:${HOTEL.contacts.phoneRaw}`}
                  className="flex items-center gap-2 text-body text-sand-200 hover:text-white transition-colors"
                >
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span>{HOTEL.contacts.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${HOTEL.contacts.email}`}
                  className="flex items-center gap-2 text-body text-sand-200 hover:text-white transition-colors"
                >
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span>{HOTEL.contacts.email}</span>
                </a>
              </li>
              <li className="flex items-center gap-2 text-body text-sand-200">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span>Круглосуточно</span>
              </li>
            </ul>
          </div>

          {/* Навигация */}
          <div>
            <h3 className="text-body font-semibold text-white mb-4">Навигация</h3>
            <ul className="space-y-2">
              {navigation.main.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-body text-sand-200 hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Нижний блок */}
      <div className="border-t border-coal-light/20">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-small text-sand-300">
              © {currentYear} {HOTEL.fullName}. Все права защищены.
            </p>
            <div className="flex items-center gap-4">
              {navigation.legal.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-small text-sand-300 hover:text-white transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}


