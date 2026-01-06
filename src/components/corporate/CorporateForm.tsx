'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar as CalendarIcon, Loader2, Check } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { corporateRequestSchema, type CorporateRequestInput } from '@/lib/validators'
import { trackCorporateRequest } from '@/lib/metrika'

export function CorporateForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkIn, setCheckIn] = useState<Date | undefined>(undefined)
  const [checkOut, setCheckOut] = useState<Date | undefined>(undefined)

  const form = useForm<CorporateRequestInput>({
    resolver: zodResolver(corporateRequestSchema),
    defaultValues: {
      companyName: '',
      contactName: '',
      phone: '',
      email: '',
      message: '',
    },
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const onSubmit = async (data: CorporateRequestInput) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/corporate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          checkIn: checkIn?.toISOString(),
          checkOut: checkOut?.toISOString(),
        }),
      })

      const result = await res.json()

      if (!result.success) {
        throw new Error(result.error || 'Ошибка отправки заявки')
      }

      setSuccess(true)
      form.reset()
      setCheckIn(undefined)
      setCheckOut(undefined)

      // Яндекс.Метрика: корпоративная заявка отправлена
      trackCorporateRequest({
        companyName: data.companyName,
        guestsCount: data.guestsCount,
      })

    } catch (err) {
      console.error('Corporate form error:', err)
      setError(err instanceof Error ? err.message : 'Ошибка отправки заявки')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <Card className="bg-sand-50 border-sand-200 mt-8">
        <CardContent className="pt-12 pb-12 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-h3 text-coal mb-2">Заявка отправлена!</h3>
          <p className="text-body text-coal-light mb-6">
            Мы свяжемся с вами в течение рабочего дня
          </p>
          <Button
            onClick={() => setSuccess(false)}
            variant="outline"
            className="border-terracotta text-terracotta hover:bg-terracotta hover:text-white"
          >
            Отправить ещё одну заявку
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-sand-50 border-sand-200 mt-8">
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Название организации */}
          <div className="space-y-2">
            <Label htmlFor="companyName">Название организации *</Label>
            <Input
              id="companyName"
              {...form.register('companyName')}
              placeholder="ООО «Компания»"
              className="bg-sand border-sand-200"
            />
            {form.formState.errors.companyName && (
              <p className="text-sm text-red-600">{form.formState.errors.companyName.message}</p>
            )}
          </div>

          {/* Контактное лицо */}
          <div className="space-y-2">
            <Label htmlFor="contactName">Контактное лицо *</Label>
            <Input
              id="contactName"
              {...form.register('contactName')}
              placeholder="Иван Иванов"
              className="bg-sand border-sand-200"
            />
            {form.formState.errors.contactName && (
              <p className="text-sm text-red-600">{form.formState.errors.contactName.message}</p>
            )}
          </div>

          {/* Телефон и Email */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон *</Label>
              <Input
                id="phone"
                type="tel"
                {...form.register('phone')}
                placeholder="+7 (___) ___-__-__"
                className="bg-sand border-sand-200"
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-red-600">{form.formState.errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                placeholder="company@example.com"
                className="bg-sand border-sand-200"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Количество гостей */}
          <div className="space-y-2">
            <Label htmlFor="guestsCount">Количество человек (примерно)</Label>
            <Input
              id="guestsCount"
              type="number"
              {...form.register('guestsCount', { valueAsNumber: true })}
              placeholder="10"
              min="1"
              className="bg-sand border-sand-200"
            />
          </div>

          {/* Даты (опционально) */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Предполагаемая дата заезда</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal bg-sand border-sand-200',
                      !checkIn && 'text-coal-light'
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
                    onSelect={setCheckIn}
                    disabled={(date) => date < today}
                    locale={ru}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Предполагаемая дата выезда</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal bg-sand border-sand-200',
                      !checkOut && 'text-coal-light'
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
                    disabled={(date) => date < today}
                    locale={ru}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Сообщение */}
          <div className="space-y-2">
            <Label htmlFor="message">Комментарий или пожелания</Label>
            <Textarea
              id="message"
              {...form.register('message')}
              placeholder="Укажите особые пожелания или вопросы..."
              rows={4}
              className="bg-sand border-sand-200 resize-none"
            />
          </div>

          {/* Ошибка */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Кнопка отправки */}
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full bg-terracotta hover:bg-terracotta-dark btn-hover"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Отправка...
              </>
            ) : (
              'Отправить заявку'
            )}
          </Button>

          <p className="text-small text-coal-light text-center">
            Нажимая кнопку, вы соглашаетесь с{' '}
            <a href="/privacy" className="text-terracotta hover:underline">
              политикой обработки персональных данных
            </a>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

