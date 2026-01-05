import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { HOTEL } from '@/constants/hotel'

export const metadata: Metadata = {
  title: 'Публичная оферта',
  description: 'Условия бронирования и проживания в хостеле DELAS в Сочи',
  robots: {
    index: false,
    follow: true,
  },
}

export default function TermsPage() {
  return (
    <>
      {/* Навигация назад */}
      <section className="bg-sand py-4">
        <div className="container">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-body text-coal-light hover:text-coal transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            На главную
          </Link>
        </div>
      </section>

      {/* Контент */}
      <section className="section bg-sand">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-h1 text-coal mb-8 animate-fade-in-up">
              Публичная оферта
            </h1>
            
            <div className="prose prose-coal max-w-none space-y-6 animate-fade-in-up delay-100">
              <p className="text-body-lg text-coal-light">
                Настоящий документ является публичной офертой {HOTEL.fullName} 
                на оказание услуг по временному размещению.
              </p>

              <h2 className="text-h3 text-coal mt-8 mb-4">1. Общие положения</h2>
              <p className="text-body text-coal-light">
                Бронирование и оплата на сайте означает полное принятие условий 
                настоящей оферты. Договор считается заключённым с момента оплаты.
              </p>

              <h2 className="text-h3 text-coal mt-8 mb-4">2. Правила проживания</h2>
              
              <h3 className="text-body font-semibold text-coal mt-6 mb-2">2.1. Заезд и выезд</h3>
              <ul className="list-disc list-inside text-body text-coal-light space-y-2 ml-4">
                <li>Заселение: после {HOTEL.checkIn}</li>
                <li>Выезд: до {HOTEL.checkOut}</li>
                <li>Ранний заезд / поздний выезд — по согласованию</li>
              </ul>

              <h3 className="text-body font-semibold text-coal mt-6 mb-2">2.2. При заселении необходимо</h3>
              <ul className="list-disc list-inside text-body text-coal-light space-y-2 ml-4">
                <li>Предъявить документ, удостоверяющий личность</li>
                <li>Подтверждение бронирования (email или SMS)</li>
              </ul>

              <h3 className="text-body font-semibold text-coal mt-6 mb-2">2.3. В хостеле запрещено</h3>
              <ul className="list-disc list-inside text-body text-coal-light space-y-2 ml-4">
                <li>Курение в номерах и общих зонах (кроме выделенной зоны)</li>
                <li>Шум после 23:00</li>
                <li>Проживание с домашними животными</li>
                <li>Приём гостей в номерах</li>
              </ul>

              <h2 className="text-h3 text-coal mt-8 mb-4">3. Оплата и скидки</h2>
              <ul className="list-disc list-inside text-body text-coal-light space-y-2 ml-4">
                <li>Оплата производится онлайн при бронировании</li>
                <li>Скидка {HOTEL.discounts.days7}% при проживании от 7 дней</li>
                <li>Скидка {HOTEL.discounts.days30}% при проживании от 30 дней</li>
                <li>Скидки применяются автоматически</li>
              </ul>

              <h2 className="text-h3 text-coal mt-8 mb-4">4. Отмена бронирования</h2>
              <ul className="list-disc list-inside text-body text-coal-light space-y-2 ml-4">
                <li>Бесплатная отмена за 24 часа до заезда</li>
                <li>При отмене менее чем за 24 часа — удерживается стоимость первых суток</li>
                <li>Неявка без предупреждения — полная оплата</li>
              </ul>

              <h2 className="text-h3 text-coal mt-8 mb-4">5. Дополнительные услуги</h2>
              <ul className="list-disc list-inside text-body text-coal-light space-y-2 ml-4">
                <li>{HOTEL.services.laundry.name}: {HOTEL.services.laundry.price}₽</li>
                <li>{HOTEL.services.storage.name}: {HOTEL.services.storage.price}₽/{HOTEL.services.storage.unit}</li>
              </ul>

              <h2 className="text-h3 text-coal mt-8 mb-4">6. Ответственность</h2>
              <p className="text-body text-coal-light">
                Хостел не несёт ответственности за ценные вещи, оставленные без присмотра. 
                Гость несёт материальную ответственность за порчу имущества хостела.
              </p>

              <h2 className="text-h3 text-coal mt-8 mb-4">7. Контакты</h2>
              <ul className="list-none text-body text-coal-light space-y-2 ml-4">
                <li>📧 Email: {HOTEL.contacts.email}</li>
                <li>📞 Телефон: {HOTEL.contacts.phone}</li>
                <li>📍 Адрес: {HOTEL.address.full}</li>
              </ul>

              <p className="text-small text-coal-muted mt-8 pt-8 border-t border-sand-200">
                Дата последнего обновления: январь 2026
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

