import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HOTEL } from '@/constants/hotel'
import { SEO } from '@/constants/seo'
import { YandexMapStatic } from '@/components/ui/YandexMap'
import { MapPin, Phone, Mail, Clock, MessageCircle, Train, Building2 } from 'lucide-react'

export const metadata: Metadata = {
  title: SEO.contacts.title,
  description: SEO.contacts.description,
}

export default function ContactsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-sand py-12 md:py-16 overflow-hidden">
        <div className="container">
          <h1 className="text-h1 text-coal mb-4 animate-fade-in-up">Контакты</h1>
          <p className="text-body-lg text-coal-light max-w-2xl animate-fade-in-up delay-100">
            Мы всегда на связи и рады помочь с выбором номера или ответить на любые вопросы.
          </p>
        </div>
      </section>

      {/* Контактная информация + карта */}
      <section className="section">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Карта */}
            <div className="order-2 lg:order-1 animate-slide-in-left">
              <YandexMapStatic className="aspect-square lg:aspect-auto lg:h-full min-h-[400px]" />
            </div>

            {/* Контакты */}
            <div className="order-1 lg:order-2 space-y-6 animate-slide-in-right">
              {/* Адрес */}
              <Card className="bg-sand-50 border-sand-200">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-3 text-h3">
                    <div className="p-2 bg-terracotta/10 rounded-lg">
                      <MapPin className="h-5 w-5 text-terracotta" />
                    </div>
                    Адрес
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-body-lg text-coal">{HOTEL.address.full}</p>
                  <p className="text-body text-coal-light mt-1">
                    Рядом с центром города, {HOTEL.distances.busStop} до остановки
                  </p>
                </CardContent>
              </Card>

              {/* Телефон */}
              <Card className="bg-sand-50 border-sand-200">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-3 text-h3">
                    <div className="p-2 bg-terracotta/10 rounded-lg">
                      <Phone className="h-5 w-5 text-terracotta" />
                    </div>
                    Телефон
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <a 
                    href={`tel:${HOTEL.contacts.phoneRaw}`}
                    className="text-body-lg text-terracotta hover:text-terracotta-dark transition-colors font-medium"
                  >
                    {HOTEL.contacts.phone}
                  </a>
                  <p className="text-body text-coal-light mt-1">
                    Звоните в любое время — мы работаем круглосуточно
                  </p>
                </CardContent>
              </Card>

              {/* Email */}
              <Card className="bg-sand-50 border-sand-200">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-3 text-h3">
                    <div className="p-2 bg-terracotta/10 rounded-lg">
                      <Mail className="h-5 w-5 text-terracotta" />
                    </div>
                    Email
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <a 
                    href={`mailto:${HOTEL.contacts.email}`}
                    className="text-body-lg text-terracotta hover:text-terracotta-dark transition-colors font-medium"
                  >
                    {HOTEL.contacts.email}
                  </a>
                  <p className="text-body text-coal-light mt-1">
                    Ответим в течение нескольких часов
                  </p>
                </CardContent>
              </Card>

              {/* Режим работы */}
              <Card className="bg-sand-50 border-sand-200">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-3 text-h3">
                    <div className="p-2 bg-terracotta/10 rounded-lg">
                      <Clock className="h-5 w-5 text-terracotta" />
                    </div>
                    Режим работы
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-body-lg text-coal font-medium">Круглосуточно</p>
                  <div className="text-body text-coal-light mt-2 space-y-1">
                    <p>Заселение: с {HOTEL.schedule.checkIn}</p>
                    <p>Выселение: до {HOTEL.schedule.checkOut}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Кнопки действий */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild size="lg" className="flex-1 bg-terracotta hover:bg-terracotta-dark btn-hover">
                  <a href={`tel:${HOTEL.contacts.phoneRaw}`}>
                    <Phone className="h-5 w-5 mr-2" />
                    Позвонить
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="flex-1 border-terracotta text-terracotta hover:bg-terracotta hover:text-white btn-hover">
                  <a href={`https://wa.me/${HOTEL.contacts.whatsapp?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Как добраться */}
      <section className="section bg-sand-50">
        <div className="container">
          <h2 className="section-title text-center animate-fade-in-up">Как до нас добраться</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mt-8">
            <div className="bg-sand rounded-xl p-6 text-center card-hover animate-fade-in-up delay-100">
              <span className="text-3xl mb-4 block">🌊</span>
              <h3 className="text-h3 text-coal mb-2">До моря</h3>
              <p className="text-body text-coal-light">
                {HOTEL.distances.sea}
              </p>
            </div>
            
            <div className="bg-sand rounded-xl p-6 text-center card-hover animate-fade-in-up delay-150">
              <Train className="h-8 w-8 mx-auto mb-4 text-terracotta" />
              <h3 className="text-h3 text-coal mb-2">Ж/Д вокзал</h3>
              <p className="text-body text-coal-light">
                {HOTEL.distances.trainStation}
              </p>
            </div>
            
            <div className="bg-sand rounded-xl p-6 text-center card-hover animate-fade-in-up delay-200">
              <span className="text-3xl mb-4 block">🛍️</span>
              <h3 className="text-h3 text-coal mb-2">ТРЦ Моремолл</h3>
              <p className="text-body text-coal-light">
                {HOTEL.distances.mallMoremoll}
              </p>
            </div>
            
            <div className="bg-sand rounded-xl p-6 text-center card-hover animate-fade-in-up delay-250">
              <Building2 className="h-8 w-8 mx-auto mb-4 text-terracotta" />
              <h3 className="text-h3 text-coal mb-2">Деловой центр</h3>
              <p className="text-body text-coal-light">
                {HOTEL.distances.businessCenter}
              </p>
            </div>
          </div>

          {/* Транспорт */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-8">
            <div className="bg-sand rounded-xl p-6 text-center card-hover animate-fade-in-up delay-300">
              <span className="text-3xl mb-4 block">🚌</span>
              <h3 className="text-h3 text-coal mb-2">Остановка рядом</h3>
              <p className="text-body text-coal-light">
                {HOTEL.distances.busStop}, автобус до пляжа {HOTEL.distances.busToBeach}
              </p>
            </div>
            
            <div className="bg-sand rounded-xl p-6 text-center card-hover animate-fade-in-up delay-350">
              <span className="text-3xl mb-4 block">🚕</span>
              <h3 className="text-h3 text-coal mb-2">Такси</h3>
              <p className="text-body text-coal-light">
                Яндекс.Такси, Uber — укажите адрес: {HOTEL.address.street}, {HOTEL.address.building}
              </p>
            </div>
            
            <div className="bg-sand rounded-xl p-6 text-center card-hover animate-fade-in-up delay-400">
              <span className="text-3xl mb-4 block">🚗</span>
              <h3 className="text-h3 text-coal mb-2">На машине</h3>
              <p className="text-body text-coal-light">
                Парковка рядом с хостелом
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Для организаций */}
      <section className="section">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="section-title animate-fade-in-up">Для организаций</h2>
            <p className="text-body-lg text-coal-light mt-4 animate-fade-in-up delay-100">
              Индивидуальные условия для корпоративных клиентов. Заключаем договоры, предоставляем закрывающие документы.
            </p>
            <div className="mt-6 animate-fade-in-up delay-200">
              <a 
                href={`tel:${HOTEL.contacts.phoneCorporateRaw}`}
                className="text-h3 text-terracotta hover:text-terracotta-dark transition-colors font-medium"
              >
                {HOTEL.contacts.phoneCorporate}
              </a>
              <p className="text-small text-coal-light mt-1">Телефон для корпоративных клиентов</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
