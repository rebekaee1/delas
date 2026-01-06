import { Metadata } from 'next'
import Link from 'next/link'
import { HOTEL } from '@/constants/hotel'
import { SEO } from '@/constants/seo'
import { Building2, FileText, Users, Percent, Phone, Check } from 'lucide-react'
import { CorporateForm } from '@/components/corporate/CorporateForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
            
            <CorporateForm />
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

