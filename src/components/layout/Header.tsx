'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'
import { HOTEL } from '@/constants/hotel'

const navigation = [
  { name: 'Номера', href: '/rooms' },
  { name: 'Для организаций', href: '/corporate' },
  { name: 'Контакты', href: '/contacts' },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-sand-200 bg-sand/95 backdrop-blur supports-[backdrop-filter]:bg-sand/80">
      <div className="container flex h-16 items-center justify-between">
        {/* Логотип */}
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/logo.png"
            alt={HOTEL.fullName}
            width={120}
            height={40}
            priority
            className="h-8 w-auto"
          />
        </Link>

        {/* Десктопная навигация */}
        <nav className="hidden md:flex items-center gap-6">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-body text-coal font-medium hover:text-terracotta transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* CTA + телефон (десктоп) */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href={`tel:${HOTEL.contacts.phoneRaw}`}
            className="flex items-center gap-2 text-body text-coal hover:text-terracotta transition-colors"
          >
            <Phone className="h-4 w-4" />
            <span className="font-medium">{HOTEL.contacts.phone}</span>
          </a>
          <Button asChild className="bg-terracotta hover:bg-terracotta-dark">
            <Link href="/rooms">Забронировать</Link>
          </Button>
        </div>

        {/* Мобильное меню */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Открыть меню</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] bg-sand">
            <div className="flex flex-col h-full">
              {/* Логотип в мобильном меню */}
              <div className="flex items-center justify-between py-4">
                <Image
                  src="/logo.png"
                  alt={HOTEL.fullName}
                  width={100}
                  height={32}
                  className="h-6 w-auto"
                />
              </div>

              {/* Навигация */}
              <nav className="flex flex-col gap-2 mt-6">
                {navigation.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center py-3 text-body-lg text-coal hover:text-terracotta transition-colors"
                    >
                      {item.name}
                    </Link>
                  </SheetClose>
                ))}
              </nav>

              {/* Контакты и CTA */}
              <div className="mt-auto pb-6 space-y-4">
                <a
                  href={`tel:${HOTEL.contacts.phoneRaw}`}
                  className="flex items-center gap-3 py-3 text-body-lg text-coal"
                >
                  <Phone className="h-5 w-5 text-terracotta" />
                  <span className="font-medium">{HOTEL.contacts.phone}</span>
                </a>
                
                <SheetClose asChild>
                  <Button asChild className="w-full bg-terracotta hover:bg-terracotta-dark">
                    <Link href="/rooms">Забронировать</Link>
                  </Button>
                </SheetClose>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

