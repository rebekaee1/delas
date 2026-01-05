import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HOTEL, ROOM_TYPES, RoomType } from '@/constants/hotel'
import { Users, Check, ArrowLeft, Calendar } from 'lucide-react'

interface RoomPageProps {
  params: Promise<{ slug: string }>
}

// Генерация статических путей для всех номеров
export async function generateStaticParams() {
  return ROOM_TYPES.map((room) => ({
    slug: room.slug,
  }))
}

// Генерация метаданных для SEO
export async function generateMetadata({ params }: RoomPageProps): Promise<Metadata> {
  const { slug } = await params
  const room = ROOM_TYPES.find((r) => r.slug === slug)
  
  if (!room) {
    return {
      title: 'Номер не найден',
    }
  }

  return {
    title: `${room.name} — от ${room.pricePerNight}₽/ночь`,
    description: `${room.description} ${room.beds} мест, ${room.amenities.join(', ')}. Бронируйте онлайн!`,
  }
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { slug } = await params
  const room = ROOM_TYPES.find((r) => r.slug === slug)

  if (!room) {
    notFound()
  }

  return (
    <>
      {/* Навигация назад */}
      <section className="bg-sand py-4">
        <div className="container">
          <Link 
            href="/rooms" 
            className="inline-flex items-center gap-2 text-body text-coal-light hover:text-coal transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Все номера
          </Link>
        </div>
      </section>

      {/* Hero номера */}
      <section className="bg-sand pb-12">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Фото заглушка */}
            <div className="aspect-[4/3] bg-sand-200 rounded-xl flex items-center justify-center overflow-hidden animate-fade-in-up">
              <span className="text-coal-muted text-lg">Фото номера</span>
            </div>

            {/* Информация */}
            <div className="animate-fade-in-up delay-100">
              <div className="flex items-start gap-3 mb-4">
                <h1 className="text-h1 text-coal">{room.name}</h1>
                {room.isWomenOnly && (
                  <Badge variant="sea" className="mt-2">Только для женщин</Badge>
                )}
              </div>

              <div className="flex items-center gap-2 text-coal-light mb-6">
                <Users className="h-5 w-5" />
                <span className="text-body-lg">{room.beds} спальных мест</span>
              </div>

              <p className="text-body-lg text-coal-light mb-6">
                {room.description}
              </p>

              {/* Цена */}
              <div className="bg-sand-50 rounded-xl p-6 mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-h1 text-terracotta font-bold">
                    от {room.pricePerNight}₽
                  </span>
                  <span className="text-body text-coal-light">/ ночь</span>
                </div>
                <p className="text-small text-coal-light mt-2">
                  Скидка {HOTEL.discounts.days7}% от 7 дней, {HOTEL.discounts.days30}% от 30 дней
                </p>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-terracotta hover:bg-terracotta-dark btn-hover flex-1">
                  <Link href={`/booking?room=${room.slug}`}>
                    <Calendar className="h-5 w-5 mr-2" />
                    Забронировать
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-coal text-coal hover:bg-coal hover:text-white flex-1">
                  <a href={`tel:${HOTEL.contacts.phoneRaw}`}>
                    Позвонить
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Удобства номера */}
      <section className="section bg-sand-50">
        <div className="container">
          <h2 className="section-title animate-fade-in-up">Удобства в номере</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
            {room.amenities.map((amenity, index) => (
              <div
                key={amenity}
                className="flex items-center gap-3 p-4 bg-sand rounded-lg animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Check className="h-5 w-5 text-success flex-shrink-0" />
                <span className="text-body text-coal">{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Общие удобства */}
      <section className="section">
        <div className="container">
          <h2 className="section-title animate-fade-in-up">Что включено в проживание</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
            {HOTEL.amenities.map((item, index) => (
              <div
                key={item.id}
                className="flex flex-col items-center p-4 bg-sand-50 rounded-lg text-center card-hover animate-fade-in-up"
                style={{ animationDelay: `${100 + index * 50}ms` }}
              >
                <span className="text-3xl mb-2">{item.icon}</span>
                <span className="text-body font-medium text-coal">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Другие номера */}
      <section className="section bg-sand-50">
        <div className="container">
          <h2 className="section-title animate-fade-in-up">Другие номера</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {ROOM_TYPES.filter((r) => r.slug !== room.slug).map((otherRoom, index) => (
              <Link
                key={otherRoom.slug}
                href={`/rooms/${otherRoom.slug}`}
                className="bg-sand rounded-xl p-6 card-hover animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <h3 className="text-h3 text-coal mb-2">{otherRoom.name}</h3>
                <p className="text-small text-coal-light mb-3">{otherRoom.beds} мест</p>
                <span className="text-body-lg font-semibold text-terracotta">
                  от {otherRoom.pricePerNight}₽
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA внизу */}
      <section className="section">
        <div className="container">
          <div className="text-center animate-fade-in-up">
            <h2 className="text-h2 text-coal mb-4">Готовы забронировать {room.name}?</h2>
            <p className="text-body-lg text-coal-light mb-8 max-w-xl mx-auto">
              Выберите даты заезда и выезда, оплатите онлайн — подтверждение придёт на почту
            </p>
            <Button asChild size="lg" className="bg-terracotta hover:bg-terracotta-dark text-lg px-8 btn-hover">
              <Link href={`/booking?room=${room.slug}`}>Забронировать сейчас</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}

