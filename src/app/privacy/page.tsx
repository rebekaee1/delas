import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { HOTEL } from '@/constants/hotel'

export const metadata: Metadata = {
  title: 'Политика конфиденциальности',
  description: 'Политика обработки персональных данных хостела DELAS в Сочи',
  robots: {
    index: false,
    follow: true,
  },
}

export default function PrivacyPage() {
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
              Политика конфиденциальности
            </h1>
            
            <div className="prose prose-coal max-w-none space-y-6 animate-fade-in-up delay-100">
              <p className="text-body-lg text-coal-light">
                Настоящая Политика конфиденциальности определяет порядок обработки 
                и защиты персональных данных пользователей сайта {HOTEL.fullName}.
              </p>

              <h2 className="text-h3 text-coal mt-8 mb-4">1. Сбор информации</h2>
              <p className="text-body text-coal-light">
                Мы собираем информацию, которую вы предоставляете при бронировании:
              </p>
              <ul className="list-disc list-inside text-body text-coal-light space-y-2 ml-4">
                <li>Имя и фамилия</li>
                <li>Номер телефона</li>
                <li>Адрес электронной почты</li>
                <li>Даты заезда и выезда</li>
              </ul>

              <h2 className="text-h3 text-coal mt-8 mb-4">2. Использование информации</h2>
              <p className="text-body text-coal-light">
                Собранная информация используется исключительно для:
              </p>
              <ul className="list-disc list-inside text-body text-coal-light space-y-2 ml-4">
                <li>Обработки вашего бронирования</li>
                <li>Связи с вами по вопросам заселения</li>
                <li>Отправки подтверждений и чеков</li>
                <li>Улучшения качества обслуживания</li>
              </ul>

              <h2 className="text-h3 text-coal mt-8 mb-4">3. Защита данных</h2>
              <p className="text-body text-coal-light">
                Мы принимаем все необходимые меры для защиты ваших персональных данных:
              </p>
              <ul className="list-disc list-inside text-body text-coal-light space-y-2 ml-4">
                <li>Данные хранятся на защищённых серверах в России</li>
                <li>Используется шифрование при передаче данных (SSL)</li>
                <li>Доступ к данным имеют только уполномоченные сотрудники</li>
              </ul>

              <h2 className="text-h3 text-coal mt-8 mb-4">4. Передача данных третьим лицам</h2>
              <p className="text-body text-coal-light">
                Мы не передаём ваши персональные данные третьим лицам, за исключением 
                случаев, предусмотренных законодательством РФ, или с вашего согласия.
              </p>

              <h2 className="text-h3 text-coal mt-8 mb-4">5. Права пользователя</h2>
              <p className="text-body text-coal-light">
                Вы имеете право:
              </p>
              <ul className="list-disc list-inside text-body text-coal-light space-y-2 ml-4">
                <li>Запросить информацию о хранящихся данных</li>
                <li>Потребовать удаления ваших персональных данных</li>
                <li>Отозвать согласие на обработку данных</li>
              </ul>

              <h2 className="text-h3 text-coal mt-8 mb-4">6. Контактная информация</h2>
              <p className="text-body text-coal-light">
                По вопросам обработки персональных данных обращайтесь:
              </p>
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


