import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { HOTEL, ROOM_TYPES } from '@/constants/hotel'
import { SEO } from '@/constants/seo'
import { Users, Wifi, Plug, Lamp, Check } from 'lucide-react'

export const metadata: Metadata = {
  title: SEO.rooms.title,
  description: SEO.rooms.description,
}

export default function RoomsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-sand py-12 md:py-16 overflow-hidden">
        <div className="container">
          <h1 className="text-h1 text-coal mb-4 animate-fade-in-up">Номера и цены</h1>
          <p className="text-body-lg text-coal-light max-w-2xl animate-fade-in-up delay-100">
            Выберите подходящий тип размещения. Все номера оборудованы 
            всем необходимым для комфортного проживания.
          </p>
        </div>
      </section>

      {/* Карточки номеров */}
      <section className="section">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8">
            {ROOM_TYPES.map((room, index) => (
              <Card 
                key={room.slug} 
                className="bg-sand-50 border-sand-200 overflow-hidden card-hover animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Изображение-заглушка */}
                <div className="aspect-[16/9] bg-sand-200 flex items-center justify-center overflow-hidden group">
                  <span className="text-coal-muted text-lg group-hover:scale-110 transition-transform duration-300">Фото номера</span>
                </div>
                
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-h3 text-coal">{room.name}</h2>
                      <div className="flex items-center gap-2 mt-1 text-coal-light">
                        <Users className="h-4 w-4" />
                        <span className="text-body">{room.beds} мест</span>
                      </div>
                    </div>
                    {room.isWomenOnly && (
                      <Badge variant="sea">Только для женщин</Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-body text-coal-light">
                    {room.description}
                  </p>
                  
                  {/* Удобства */}
                  <div className="flex flex-wrap gap-2">
                    {room.amenities.map((amenity) => (
                      <div 
                        key={amenity} 
                        className="flex items-center gap-1 text-small text-coal-light bg-sand px-2 py-1 rounded"
                      >
                        <Check className="h-3 w-3 text-success" />
                        {amenity}
                      </div>
                    ))}
                  </div>
                </CardContent>
                
                <CardFooter className="flex items-center justify-between pt-4 border-t border-sand-200">
                  <div>
                    <span className="text-h3 text-terracotta font-bold">
                      от {room.pricePerNight}₽
                    </span>
                    <span className="text-small text-coal-light ml-1">/ ночь</span>
                  </div>
                  <Button asChild className="bg-terracotta hover:bg-terracotta-dark btn-hover">
                    <Link href={`/booking?room=${room.slug}`}>Забронировать</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Что включено */}
      <section className="section bg-sand-50">
        <div className="container">
          <h2 className="section-title text-center animate-fade-in-up">Во всех номерах</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
            {HOTEL.amenities.map((item, index) => (
              <div
                key={item.id}
                className="flex flex-col items-center p-4 bg-sand rounded-lg text-center card-hover animate-fade-in-up"
                style={{ animationDelay: `${100 + index * 50}ms` }}
              >
                <span className="text-3xl mb-2">{item.icon}</span>
                <span className="text-body font-medium text-coal">{item.name}</span>
                <span className="text-small text-coal-light">{item.description}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Скидки */}
      <section className="section">
        <div className="container">
          <div className="bg-terracotta/10 rounded-2xl p-8 md:p-12 text-center animate-fade-in-up">
            <h2 className="text-h2 text-coal mb-4">
              Скидки при длительном проживании
            </h2>
            <p className="text-body-lg text-coal-light mb-8 max-w-xl mx-auto">
              Чем дольше вы остаётесь — тем выгоднее. 
              Скидка применяется автоматически при бронировании.
            </p>
            
            <div className="flex flex-col md:flex-row gap-6 justify-center">
              <div className="bg-sand-50 rounded-xl p-6 text-center flex-1 max-w-xs mx-auto md:mx-0 card-hover animate-scale-in delay-200">
                <span className="text-4xl font-heading font-bold text-terracotta">{HOTEL.discounts.days7}%</span>
                <p className="text-body text-coal mt-2">при проживании от 7 дней</p>
              </div>
              <div className="bg-sand-50 rounded-xl p-6 text-center flex-1 max-w-xs mx-auto md:mx-0 card-hover animate-scale-in delay-300">
                <span className="text-4xl font-heading font-bold text-terracotta">{HOTEL.discounts.days30}%</span>
                <p className="text-body text-coal mt-2">при проживании от 30 дней</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Дополнительные услуги */}
      <section className="section bg-sand-50">
        <div className="container">
          <h2 className="section-title text-center animate-fade-in-up">Дополнительные услуги</h2>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mt-8">
            <div className="bg-sand rounded-xl p-6 card-hover animate-slide-in-left delay-100">
              <h3 className="text-h3 text-coal mb-2">{HOTEL.services.laundry.name}</h3>
              <p className="text-body text-coal-light mb-4">
                Стирка и сушка ваших вещей
              </p>
              <span className="text-body-lg font-semibold text-terracotta">
                {HOTEL.services.laundry.price}₽
              </span>
            </div>
            
            <div className="bg-sand rounded-xl p-6 card-hover animate-slide-in-right delay-100">
              <h3 className="text-h3 text-coal mb-2">{HOTEL.services.storage.name}</h3>
              <p className="text-body text-coal-light mb-4">
                Безопасное хранение багажа
              </p>
              <span className="text-body-lg font-semibold text-terracotta">
                {HOTEL.services.storage.price}₽ / {HOTEL.services.storage.unit}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container">
          <div className="text-center animate-fade-in-up">
            <h2 className="text-h2 text-coal mb-4">Готовы забронировать?</h2>
            <p className="text-body-lg text-coal-light mb-8 max-w-xl mx-auto">
              Выберите даты заезда и выезда, и мы покажем доступные места
            </p>
            <Button asChild size="lg" className="bg-terracotta hover:bg-terracotta-dark text-lg px-8 btn-hover">
              <Link href="/booking">Проверить доступность</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}

