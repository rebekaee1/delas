'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Calendar, Users, MapPin, Phone, Mail, Loader2, AlertCircle } from 'lucide-react'

interface BookingData {
  id: string
  status: string
  paymentStatus: string
  roomType: {
    name: string
  }
  checkIn: string
  checkOut: string
  nights: number
  guestName: string
  guestsCount: number
  totalPrice: number
  discountPercent: number
}

function BookingSuccessContent() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('id')
  
  const [booking, setBooking] = useState<BookingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBooking() {
      if (!bookingId) {
        setError('ID бронирования не указан')
        setLoading(false)
        return
      }

      try {
        // Сначала проверяем статус платежа
        const statusRes = await fetch(`/api/payment/status?bookingId=${bookingId}`)
        const statusData = await statusRes.json()

        // Получаем полные данные бронирования
        const res = await fetch(`/api/booking?id=${bookingId}`)
        const data = await res.json()

        if (!data.success) {
          setError(data.error || 'Бронирование не найдено')
          return
        }

        setBooking({
          ...data.data,
          paymentStatus: statusData.data?.paymentStatus || data.data.paymentStatus,
        })
      } catch (err) {
        console.error('Error fetching booking:', err)
        setError('Ошибка загрузки данных')
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId])

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-terracotta animate-spin mx-auto mb-4" />
          <p className="text-coal-light">Загрузка данных бронирования...</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-sand-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-heading font-bold text-coal mb-2">
              Ошибка
            </h1>
            <p className="text-coal-light mb-6">{error || 'Бронирование не найдено'}</p>
            <Button asChild className="bg-terracotta hover:bg-terracotta-dark">
              <Link href="/">На главную</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isConfirmed = booking.paymentStatus === 'SUCCEEDED' || booking.status === 'CONFIRMED'
  const checkInDate = new Date(booking.checkIn).toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const checkOutDate = new Date(booking.checkOut).toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-sand-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center border-b">
            <div className="mx-auto mb-4">
              {isConfirmed ? (
                <CheckCircle className="w-20 h-20 text-green-500" />
              ) : (
                <Loader2 className="w-20 h-20 text-terracotta animate-spin" />
              )}
            </div>
            <CardTitle className="text-3xl font-heading">
              {isConfirmed ? 'Бронирование подтверждено!' : 'Обработка платежа...'}
            </CardTitle>
            <p className="text-coal-light mt-2">
              {isConfirmed 
                ? 'Спасибо! Ваше бронирование успешно оплачено.' 
                : 'Пожалуйста, подождите. Платёж обрабатывается.'}
            </p>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* Номер бронирования */}
            <div className="bg-sand-200 rounded-lg p-4 text-center">
              <p className="text-sm text-coal-light mb-1">Номер бронирования</p>
              <p className="text-2xl font-mono font-bold text-coal">
                #{booking.id.slice(-8).toUpperCase()}
              </p>
            </div>

            {/* Детали */}
            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-terracotta mt-0.5" />
                <div>
                  <p className="font-medium text-coal">Тип номера</p>
                  <p className="text-coal-light">{booking.roomType.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-terracotta mt-0.5" />
                <div>
                  <p className="font-medium text-coal">Даты проживания</p>
                  <p className="text-coal-light">
                    {checkInDate} — {checkOutDate}
                  </p>
                  <p className="text-sm text-coal-light">
                    {booking.nights} {pluralizeNights(booking.nights)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-terracotta mt-0.5" />
                <div>
                  <p className="font-medium text-coal">Гости</p>
                  <p className="text-coal-light">
                    {booking.guestName}, {booking.guestsCount} {pluralizeGuests(booking.guestsCount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Сумма */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-coal-light">Итого оплачено</span>
                <span className="text-2xl font-bold text-coal">
                  {booking.totalPrice.toLocaleString('ru-RU')} ₽
                </span>
              </div>
              {booking.discountPercent > 0 && (
                <p className="text-sm text-green-600 text-right">
                  Скидка {booking.discountPercent}% применена
                </p>
              )}
            </div>

            {/* Контакты */}
            <div className="bg-terracotta/10 rounded-lg p-4">
              <h3 className="font-medium text-coal mb-3">Важная информация</h3>
              <ul className="space-y-2 text-sm text-coal-light">
                <li>• Заезд с 14:00, выезд до 12:00</li>
                <li>• При себе иметь паспорт</li>
                <li>• Подтверждение отправлено на email</li>
              </ul>
            </div>

            {/* Контакты хостела */}
            <div className="border-t pt-4">
              <h3 className="font-medium text-coal mb-3">Наши контакты</h3>
              <div className="space-y-2">
                <a href="tel:+79881814777" className="flex items-center gap-2 text-coal-light hover:text-terracotta">
                  <Phone className="w-4 h-4" />
                  +7 (988) 181-47-77
                </a>
                <a href="mailto:info@hostel-delas.ru" className="flex items-center gap-2 text-coal-light hover:text-terracotta">
                  <Mail className="w-4 h-4" />
                  info@hostel-delas.ru
                </a>
              </div>
            </div>

            {/* Кнопки */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button asChild className="flex-1 bg-terracotta hover:bg-terracotta-dark">
                <Link href="/">На главную</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/contacts">Как добраться</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function pluralizeNights(n: number): string {
  const lastTwo = n % 100
  const lastOne = n % 10
  if (lastTwo >= 11 && lastTwo <= 14) return 'ночей'
  if (lastOne === 1) return 'ночь'
  if (lastOne >= 2 && lastOne <= 4) return 'ночи'
  return 'ночей'
}

function pluralizeGuests(n: number): string {
  const lastTwo = n % 100
  const lastOne = n % 10
  if (lastTwo >= 11 && lastTwo <= 14) return 'гостей'
  if (lastOne === 1) return 'гость'
  if (lastOne >= 2 && lastOne <= 4) return 'гостя'
  return 'гостей'
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-sand-100 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-terracotta animate-spin" />
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  )
}

