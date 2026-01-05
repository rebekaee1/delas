import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { HOTEL } from '@/constants/hotel'
import { SEO } from '@/constants/seo'
import { Building2, FileText, Users, Percent, Phone, Check } from 'lucide-react'

export const metadata: Metadata = {
  title: SEO.corporate.title,
  description: SEO.corporate.description,
}

const benefits = [
  {
    icon: Building2,
    title: 'Размещение бригад',
    description: 'Удобное проживание для вахтовых бригад и рабочих коллективов любого размера',
  },
  {
    icon: FileText,
    title: 'Закрывающие документы',
    description: 'Предоставляем полный пакет документов для бухгалтерии: счета, акты, счета-фактуры',
  },
  {
    icon: Users,
    title: 'Безналичный расчёт',
    description: 'Работаем с юридическими лицами по договору, принимаем оплату на расчётный счёт',
  },
  {
    icon: Percent,
    title: 'Индивидуальные цены',
    description: 'Специальные тарифы для корпоративных клиентов при длительном проживании',
  },
]

export default function CorporatePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-coal py-16 md:py-24 overflow-hidden">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-h1 text-white mb-4 animate-fade-in-up">
              Для организаций и командировочных
            </h1>
            <p className="text-body-lg text-sand-200 mb-8 animate-fade-in-up delay-100">
              Размещаем бригады и сотрудников в командировках. 
              Работаем по договору с юридическими лицами, 
              предоставляем все необходимые документы.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-200">
              <Button asChild size="lg" className="bg-terracotta hover:bg-terracotta-dark btn-hover">
                <a href="#form">Оставить заявку</a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white hover:text-coal btn-hover"
              >
                <a href={`tel:${HOTEL.contacts.phoneCorporateRaw}`}>
                  <Phone className="h-5 w-5 mr-2" />
                  {HOTEL.contacts.phoneCorporate}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Преимущества */}
      <section className="section">
        <div className="container">
          <h2 className="section-title text-center animate-fade-in-up">Почему выбирают нас</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            {benefits.map((benefit, index) => (
              <Card 
                key={benefit.title} 
                className="bg-sand-50 border-sand-200 card-hover animate-fade-in-up"
                style={{ animationDelay: `${100 + index * 100}ms` }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-4">
                    <div className="p-3 bg-terracotta/10 rounded-xl">
                      <benefit.icon className="h-6 w-6 text-terracotta" />
                    </div>
                    <span className="text-h3">{benefit.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-body text-coal-light">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Условия */}
      <section className="section bg-sand-50">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="section-title text-center">Условия для организаций</h2>
            <p className="section-subtitle text-center">
              Гибкий подход к каждому клиенту
            </p>
            
            <div className="bg-sand rounded-2xl p-8 mt-8 space-y-4">
              {[
                'Заключение договора на размещение',
                'Оплата по безналичному расчёту',
                'Скидки при длительном проживании от 7 дней',
                'Специальные цены при размещении больших групп',
                'Выставление счетов, актов и счетов-фактур',
                'Возможность постоплаты для постоянных клиентов',
                'Круглосуточное заселение без доплат',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-body text-coal">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Форма заявки */}
      <section id="form" className="section">
        <div className="container">
          <div className="max-w-xl mx-auto">
            <h2 className="section-title text-center">Оставить заявку</h2>
            <p className="section-subtitle text-center">
              Заполните форму, и мы свяжемся с вами в течение рабочего дня
            </p>
            
            <Card className="bg-sand-50 border-sand-200 mt-8">
              <CardContent className="pt-6">
                <form className="space-y-6">
                  {/* Название организации */}
                  <div className="space-y-2">
                    <Label htmlFor="company">Название организации *</Label>
                    <Input
                      id="company"
                      name="company"
                      placeholder="ООО «Компания»"
                      required
                      className="bg-sand border-sand-200"
                    />
                  </div>
                  
                  {/* Контактное лицо */}
                  <div className="space-y-2">
                    <Label htmlFor="contact">Контактное лицо *</Label>
                    <Input
                      id="contact"
                      name="contact"
                      placeholder="Иван Иванов"
                      required
                      className="bg-sand border-sand-200"
                    />
                  </div>
                  
                  {/* Телефон и Email */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Телефон *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+7 (XXX) XXX-XX-XX"
                        required
                        className="bg-sand border-sand-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="company@example.ru"
                        required
                        className="bg-sand border-sand-200"
                      />
                    </div>
                  </div>
                  
                  {/* Количество человек */}
                  <div className="space-y-2">
                    <Label htmlFor="guests">Примерное количество человек</Label>
                    <Input
                      id="guests"
                      name="guests"
                      type="number"
                      min="1"
                      placeholder="10"
                      className="bg-sand border-sand-200"
                    />
                  </div>
                  
                  {/* Комментарий */}
                  <div className="space-y-2">
                    <Label htmlFor="message">Комментарий</Label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      placeholder="Примерные даты, особые пожелания..."
                      className="w-full px-3 py-2 text-body rounded-md border border-sand-200 bg-sand focus:outline-none focus:ring-2 focus:ring-terracotta"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    size="lg"
                    className="w-full bg-terracotta hover:bg-terracotta-dark"
                  >
                    Отправить заявку
                  </Button>
                  
                  <p className="text-small text-coal-light text-center">
                    Нажимая кнопку «Отправить заявку», вы соглашаетесь с{' '}
                    <Link href="/privacy" className="text-terracotta hover:underline">
                      политикой конфиденциальности
                    </Link>
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Контакты */}
      <section className="section bg-coal">
        <div className="container">
          <div className="text-center">
            <h2 className="text-h2 text-white mb-4">
              Предпочитаете позвонить?
            </h2>
            <p className="text-body-lg text-sand-200 mb-8">
              Наш менеджер ответит на все вопросы и поможет оформить бронирование
            </p>
            <Button asChild size="lg" className="bg-terracotta hover:bg-terracotta-dark">
              <a href={`tel:${HOTEL.contacts.phoneCorporateRaw}`}>
                <Phone className="h-5 w-5 mr-2" />
                {HOTEL.contacts.phoneCorporate}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}

