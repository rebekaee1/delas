'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format, addDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import Link from 'next/link'
import { Calendar as CalendarIcon, Users, Loader2, AlertCircle, Check, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

import { cn } from '@/lib/utils'
import { guestFormSchema, type GuestFormInput } from '@/lib/validators'
import { 
  formatPriceShort, 
  calculateNights, 
  calculateDiscount, 
  calculateTotalPrice,
  pluralizeNights,
} from '@/lib/utils'
import { HOTEL, ROOM_TYPES } from '@/constants/hotel'

export function BookingForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const roomFromUrl = searchParams.get('room')

  // Состояние выбора
  const [selectedRoom, setSelectedRoom] = useState<string>(roomFromUrl || '')
  const [checkIn, setCheckIn] = useState<Date | undefined>(undefined)
  const [checkOut, setCheckOut] = useState<Date | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [consentPD, setConsentPD] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Состояние доступности мест
  const [availability, setAvailability] = useState<Record<string, { available: number; total: number; loading: boolean }>>({})
  
  // Загружаем доступность при изменении дат
  useEffect(() => {
    if (!checkIn || !checkOut) {
      setAvailability({})
      return
    }
    
    // Загружаем для всех типов номеров
    ROOM_TYPES.forEach(async (room) => {
      setAvailability(prev => ({
        ...prev,
        [room.slug]: { ...prev[room.slug], loading: true, available: 0, total: room.beds }
      }))
      
      try {
        const res = await fetch('/api/rooms/availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomTypeId: room.slug,
            checkIn: checkIn.toISOString(),
            checkOut: checkOut.toISOString(),
            guests: 1,
          }),
        })
        
        const data = await res.json()
        
        if (data.success) {
          setAvailability(prev => ({
            ...prev,
            [room.slug]: {
              available: data.data.availableBeds || 0,
              total: data.data.totalBeds || room.beds,
              loading: false,
            }
          }))
        }
      } catch (err) {
        console.error('Error fetching availability:', err)
        setAvailability(prev => ({
          ...prev,
          [room.slug]: { available: 0, total: room.beds, loading: false }
        }))
      }
    })
  }, [checkIn, checkOut])

  // Форма гостя
  const form = useForm<GuestFormInput>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: {
      guestName: '',
      guestPhone: '',
      guestEmail: '',
      guestsCount: 1,
      comment: '',
    },
  })

  // Расчёт цены
  const selectedRoomData = ROOM_TYPES.find(r => r.slug === selectedRoom)
  const nights = checkIn && checkOut ? calculateNights(checkIn, checkOut) : 0
  const discountPercent = calculateDiscount(nights, HOTEL.discounts.days7, HOTEL.discounts.days30)
  const pricePerNight = selectedRoomData?.pricePerNight || 0
  const { basePrice, discountAmount, totalPrice } = calculateTotalPrice(pricePerNight, nights, discountPercent)

  // Минимальная дата - сегодня
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Обработка отправки
  const onSubmit = async (data: GuestFormInput) => {
    if (!selectedRoom || !checkIn || !checkOut || !consentPD) return

    setIsSubmitting(true)
    setError(null)
    
    try {
      // 1. Создаём бронирование (используем slug как roomTypeId)
      const bookingRes = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomTypeId: selectedRoom, // Передаём slug, API принимает и ID, и slug
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
          guestName: data.guestName,
          guestPhone: data.guestPhone,
          guestEmail: data.guestEmail,
          guestsCount: data.guestsCount,
          comment: data.comment || '',
        }),
      })

      const bookingResult = await bookingRes.json()

      if (!bookingResult.success) {
        throw new Error(bookingResult.error || 'Ошибка создания бронирования')
      }

      const bookingId = bookingResult.data.bookingId

      // 2. Создаём платёж
      const paymentRes = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      })

      const paymentResult = await paymentRes.json()

      if (!paymentResult.success) {
        // Если ЮKassa не настроена, перенаправляем на страницу успеха без оплаты
        if (paymentResult.error === 'Платёжная система не настроена') {
          router.push(`/booking/success?id=${bookingId}`)
          return
        }
        throw new Error(paymentResult.error || 'Ошибка создания платежа')
      }

      // 3. Перенаправляем на ЮKassa
      window.location.href = paymentResult.data.confirmationUrl

    } catch (err) {
      console.error('Booking error:', err)
      setError(err instanceof Error ? err.message : 'Ошибка при создании бронирования')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = selectedRoom && checkIn && checkOut && nights > 0 && consentPD

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Форма */}
      <div className="lg:col-span-2 space-y-6">
        {/* Шаг 1: Выбор номера */}
        <Card className="bg-sand-50 border-sand-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-terracotta text-white text-small font-bold">
                1
              </span>
              Выберите тип номера
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              {ROOM_TYPES.map((room) => {
                const roomAvail = availability[room.slug]
                const hasAvailability = checkIn && checkOut && roomAvail && !roomAvail.loading
                const isAvailable = !hasAvailability || roomAvail.available > 0
                const occupancyPercent = hasAvailability 
                  ? Math.round(((roomAvail.total - roomAvail.available) / roomAvail.total) * 100)
                  : 0
                
                return (
                  <button
                    key={room.slug}
                    type="button"
                    onClick={() => isAvailable && setSelectedRoom(room.slug)}
                    disabled={!isAvailable}
                    className={cn(
                      'text-left p-4 rounded-lg border-2 transition-all',
                      !isAvailable && 'opacity-50 cursor-not-allowed',
                      selectedRoom === room.slug
                        ? 'border-terracotta bg-terracotta/5'
                        : 'border-sand-200 bg-sand hover:border-terracotta/50'
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-medium text-coal">{room.name}</span>
                      <div className="flex gap-1">
                        {room.isWomenOnly && (
                          <Badge variant="sea" className="text-xs">Жен</Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Показываем доступность если выбраны даты */}
                    {hasAvailability ? (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-small mb-1">
                          <span className="text-coal-light">
                            {roomAvail.available > 0 ? (
                              <span className="flex items-center gap-1">
                                <Check className="h-3 w-3 text-green-600" />
                                <span className="text-green-700 font-medium">
                                  {roomAvail.available} из {roomAvail.total} мест
                                </span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-red-600">
                                <X className="h-3 w-3" />
                                <span>Нет мест</span>
                              </span>
                            )}
                          </span>
                        </div>
                        {/* Прогресс-бар заполненности */}
                        <div className="h-1.5 bg-sand-200 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              'h-full rounded-full transition-all duration-300',
                              occupancyPercent >= 80 ? 'bg-red-400' :
                              occupancyPercent >= 50 ? 'bg-amber-400' : 'bg-green-400'
                            )}
                            style={{ width: `${occupancyPercent}%` }}
                          />
                        </div>
                      </div>
                    ) : roomAvail?.loading ? (
                      <div className="flex items-center gap-2 text-small text-coal-light mb-3">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Проверяем...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-small text-coal-light mb-3">
                        <Users className="h-4 w-4" />
                        <span>{room.beds} мест</span>
                      </div>
                    )}
                    
                    <span className="text-body font-semibold text-terracotta">
                      от {room.pricePerNight}₽/ночь
                    </span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Шаг 2: Выбор дат */}
        <Card className="bg-sand-50 border-sand-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-terracotta text-white text-small font-bold">
                2
              </span>
              Выберите даты
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Дата заезда */}
              <div className="space-y-2">
                <Label>Дата заезда</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal bg-sand border-sand-200',
                        !checkIn && 'text-coal-muted'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkIn ? format(checkIn, 'dd MMMM yyyy', { locale: ru }) : 'Выберите дату'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={checkIn}
                      onSelect={(date) => {
                        setCheckIn(date)
                        if (date && (!checkOut || checkOut <= date)) {
                          setCheckOut(addDays(date, 1))
                        }
                      }}
                      disabled={(date) => date < today}
                      initialFocus
                      locale={ru}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Дата выезда */}
              <div className="space-y-2">
                <Label>Дата выезда</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal bg-sand border-sand-200',
                        !checkOut && 'text-coal-muted'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkOut ? format(checkOut, 'dd MMMM yyyy', { locale: ru }) : 'Выберите дату'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={checkOut}
                      onSelect={setCheckOut}
                      disabled={(date) => date <= (checkIn || today)}
                      initialFocus
                      locale={ru}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {nights > 0 && (
              <div className="mt-4 p-3 bg-sand rounded-lg flex items-center justify-between">
                <span className="text-body text-coal">Продолжительность:</span>
                <span className="text-body font-medium text-coal">
                  {pluralizeNights(nights)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Шаг 3: Данные гостя */}
        <Card className="bg-sand-50 border-sand-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-terracotta text-white text-small font-bold">
                3
              </span>
              Ваши данные
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form id="booking-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Имя */}
              <div className="space-y-2">
                <Label htmlFor="guestName">Имя *</Label>
                <Input
                  id="guestName"
                  placeholder="Иван Иванов"
                  className="bg-sand border-sand-200"
                  {...form.register('guestName')}
                />
                {form.formState.errors.guestName && (
                  <p className="text-small text-error">{form.formState.errors.guestName.message}</p>
                )}
              </div>

              {/* Телефон и Email */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guestPhone">Телефон *</Label>
                  <Input
                    id="guestPhone"
                    type="tel"
                    placeholder="+7 (XXX) XXX-XX-XX"
                    className="bg-sand border-sand-200"
                    {...form.register('guestPhone')}
                  />
                  {form.formState.errors.guestPhone && (
                    <p className="text-small text-error">{form.formState.errors.guestPhone.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guestEmail">Email *</Label>
                  <Input
                    id="guestEmail"
                    type="email"
                    placeholder="email@example.ru"
                    className="bg-sand border-sand-200"
                    {...form.register('guestEmail')}
                  />
                  {form.formState.errors.guestEmail && (
                    <p className="text-small text-error">{form.formState.errors.guestEmail.message}</p>
                  )}
                </div>
              </div>

              {/* Количество гостей */}
              <div className="space-y-2">
                <Label htmlFor="guestsCount">Количество гостей</Label>
                <Select
                  value={String(form.watch('guestsCount'))}
                  onValueChange={(value) => form.setValue('guestsCount', parseInt(value))}
                >
                  <SelectTrigger className="bg-sand border-sand-200">
                    <SelectValue placeholder="Выберите" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <SelectItem key={num} value={String(num)}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Комментарий */}
              <div className="space-y-2">
                <Label htmlFor="comment">Комментарий (необязательно)</Label>
                <textarea
                  id="comment"
                  rows={3}
                  placeholder="Особые пожелания, время прибытия..."
                  className="w-full px-3 py-2 text-body rounded-md border border-sand-200 bg-sand focus:outline-none focus:ring-2 focus:ring-terracotta"
                  {...form.register('comment')}
                />
              </div>

              {/* Honeypot - скрытое поле против ботов */}
              <input
                type="text"
                name="website"
                autoComplete="off"
                tabIndex={-1}
                aria-hidden="true"
                className="absolute -left-[9999px] opacity-0 pointer-events-none"
                onChange={(e) => {
                  if (e.target.value) {
                    // Бот заполнил скрытое поле
                    setError('Ошибка валидации формы')
                  }
                }}
              />

              {/* Согласие на обработку персональных данных */}
              <div className="space-y-2 pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentPD}
                    onChange={(e) => setConsentPD(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-sand-300 text-terracotta focus:ring-terracotta"
                  />
                  <span className="text-sm text-coal-light">
                    Я даю согласие на обработку моих персональных данных в соответствии с{' '}
                    <Link href="/privacy" className="text-terracotta hover:underline" target="_blank">
                      Политикой конфиденциальности
                    </Link>
                    {' '}и принимаю условия{' '}
                    <Link href="/terms" className="text-terracotta hover:underline" target="_blank">
                      Публичной оферты
                    </Link>
                  </span>
                </label>
              </div>

              {/* Ошибка */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Сайдбар с расчётом */}
      <div className="lg:col-span-1">
        <div className="sticky top-24">
          <Card className="bg-sand-50 border-sand-200">
            <CardHeader>
              <CardTitle>Ваше бронирование</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedRoomData ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-coal-light">Номер:</span>
                    <span className="font-medium text-coal">{selectedRoomData.name}</span>
                  </div>
                  
                  {checkIn && checkOut && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-coal-light">Заезд:</span>
                        <span className="font-medium text-coal">
                          {format(checkIn, 'dd.MM.yyyy')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-coal-light">Выезд:</span>
                        <span className="font-medium text-coal">
                          {format(checkOut, 'dd.MM.yyyy')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-coal-light">Ночей:</span>
                        <span className="font-medium text-coal">{nights}</span>
                      </div>
                    </>
                  )}

                  <div className="border-t border-sand-200 pt-4 space-y-2">
                    <div className="flex justify-between text-small">
                      <span className="text-coal-light">
                        {formatPriceShort(pricePerNight)} × {nights} ночей
                      </span>
                      <span className="text-coal">{formatPriceShort(basePrice)}</span>
                    </div>
                    
                    {discountPercent > 0 && (
                      <div className="flex justify-between text-small text-success">
                        <span>Скидка {discountPercent}%</span>
                        <span>-{formatPriceShort(discountAmount)}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-sand-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-body font-medium text-coal">Итого:</span>
                      <span className="text-h3 font-bold text-terracotta">
                        {formatPriceShort(totalPrice)}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-coal-light text-center py-4">
                  Выберите номер и даты
                </p>
              )}
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button
                type="submit"
                form="booking-form"
                size="lg"
                className="w-full bg-terracotta hover:bg-terracotta-dark"
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Обработка...
                  </>
                ) : (
                  'Перейти к оплате'
                )}
              </Button>
              {!consentPD && selectedRoomData && checkIn && checkOut && (
                <p className="text-caption text-amber-600 text-center">
                  Для продолжения необходимо дать согласие на обработку персональных данных
                </p>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

