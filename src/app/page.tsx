import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HOTEL, ROOM_TYPES } from '@/constants/hotel'

export default function Home() {
  return (
    <>
      {/* Hero секция */}
      <section className="relative bg-sand py-20 md:py-32 overflow-hidden">
        <div className="container">
          <div className="flex flex-col items-center text-center">
            {/* Логотип */}
            <div className="mb-8 animate-fade-in-up">
              <Image
                src="/logo.png"
                alt={HOTEL.fullName}
                width={280}
                height={100}
                priority
                className="h-auto w-auto"
              />
            </div>
            
            {/* Заголовок */}
            <h1 className="text-h1 text-coal mb-4 animate-fade-in-up delay-100">
              Койко-место от 600₽ в центре Сочи
            </h1>
            
            {/* Подзаголовок */}
            <p className="text-body-lg text-coal-light mb-8 max-w-2xl animate-fade-in-up delay-200">
              {HOTEL.address.street} {HOTEL.address.building} • Рядом с морем • Круглосуточно
            </p>
            
            {/* CTA кнопка */}
            <Button asChild size="lg" className="bg-terracotta hover:bg-terracotta-dark text-lg px-8 py-6 btn-hover animate-fade-in-up delay-300">
              <Link href="/rooms">Проверить свободные места</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Что включено */}
      <section className="section bg-sand-50">
        <div className="container">
          <h2 className="section-title text-center animate-fade-in-up">Что включено</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
            {HOTEL.amenities.slice(0, 6).map((item, index) => (
              <div
                key={item.id}
                className="flex flex-col items-center p-4 bg-sand rounded-lg card-hover animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="text-3xl mb-2">{item.icon}</span>
                <span className="text-small text-coal-light text-center">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Номера */}
      <section className="section">
        <div className="container">
          <h2 className="section-title animate-fade-in-up">Наши номера</h2>
          <p className="section-subtitle animate-fade-in-up delay-100">
            Выберите подходящий вариант размещения
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ROOM_TYPES.map((room, index) => (
              <div 
                key={room.slug} 
                className="card p-6 card-hover animate-fade-in-up"
                style={{ animationDelay: `${200 + index * 100}ms` }}
              >
                {/* Заглушка для фото */}
                <div className="aspect-[4/3] bg-sand-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden group">
                  <span className="text-coal-muted group-hover:scale-110 transition-transform duration-300">Фото</span>
                </div>
                
                {room.isWomenOnly && (
                  <Badge variant="sea" className="mb-2">Только для женщин</Badge>
                )}
                
                <h3 className="text-h3 text-coal mb-1">{room.name}</h3>
                <p className="text-small text-coal-light mb-3">{room.beds} мест</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-body-lg font-semibold text-coal">
                    от {room.pricePerNight}₽
                  </span>
                  <Button variant="outline" size="sm" asChild className="border-terracotta text-terracotta hover:bg-terracotta hover:text-white btn-hover">
                    <Link href={`/rooms/${room.slug}`}>Подробнее</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Скидки */}
      <section className="section bg-terracotta/5">
        <div className="container">
          <h2 className="section-title text-center animate-fade-in-up">
            Скидки при длительном проживании
          </h2>
          
          <div className="flex flex-col md:flex-row gap-6 justify-center mt-8">
            <div className="bg-sand-50 rounded-xl p-6 text-center flex-1 max-w-xs mx-auto md:mx-0 card-hover animate-scale-in delay-100">
              <span className="text-3xl font-heading font-bold text-terracotta">{HOTEL.discounts.days7}%</span>
              <p className="text-body text-coal mt-2">от 7 дней</p>
            </div>
            <div className="bg-sand-50 rounded-xl p-6 text-center flex-1 max-w-xs mx-auto md:mx-0 card-hover animate-scale-in delay-200">
              <span className="text-3xl font-heading font-bold text-terracotta">{HOTEL.discounts.days30}%</span>
              <p className="text-body text-coal mt-2">от 30 дней</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Для организаций */}
      <section className="section">
        <div className="container">
          <div className="bg-coal rounded-2xl p-8 md:p-12 text-center animate-fade-in-up">
            <h2 className="text-h2 text-white mb-4">Для организаций</h2>
            <p className="text-body-lg text-sand-200 mb-6 max-w-2xl mx-auto">
              Размещение бригад, безналичный расчёт, закрывающие документы.
              Индивидуальные условия для корпоративных клиентов.
            </p>
            <Button asChild className="bg-terracotta hover:bg-terracotta-dark btn-hover">
              <Link href="/corporate">Оставить заявку</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Контакты */}
      <section className="section bg-sand-50">
        <div className="container">
          <h2 className="section-title animate-fade-in-up">Где мы находимся</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Карта - заглушка (TODO: добавить Яндекс.Карты) */}
            <div className="aspect-video bg-sand-200 rounded-xl flex items-center justify-center animate-slide-in-left">
              <span className="text-coal-muted">Карта</span>
            </div>
            
            {/* Контактная информация */}
            <div className="flex flex-col justify-center animate-slide-in-right">
              <h3 className="text-h3 text-coal mb-4">{HOTEL.fullName}</h3>
              
              <div className="space-y-4">
                <p className="text-body text-coal-light hover:text-coal transition-colors">
                  📍 {HOTEL.address.full}
                </p>
                <p className="text-body text-coal-light">
                  🕐 Круглосуточно
                </p>
                <p className="text-body text-coal-light hover:text-coal transition-colors">
                  📞 {HOTEL.contacts.phone}
                </p>
                <p className="text-body text-coal-light hover:text-coal transition-colors">
                  ✉️ {HOTEL.contacts.email}
                </p>
              </div>
              
              <div className="mt-6">
                <Button asChild className="bg-terracotta hover:bg-terracotta-dark btn-hover">
                  <a href={`tel:${HOTEL.contacts.phoneRaw}`}>Позвонить</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
