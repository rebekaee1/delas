'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { format, addDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Calendar as CalendarIcon, Check, Loader2, AlertCircle, Copy, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { cn } from '@/lib/utils'
import { ROOM_TYPES } from '@/constants/hotel'

// Секретный ключ для доступа (добавьте в .env.local: ADMIN_SECRET=ваш_секрет)
const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || 'delas2024admin'

export default function QuickBookingPage() {
  const searchParams = useSearchParams()
  const secretKey = searchParams.get('key')
  
  // Проверка доступа
  if (secretKey !== ADMIN_SECRET) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold mb-2">Доступ запрещён</h1>
              <p className="text-coal-light">Неверный ключ доступа</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  const [formData, setFormData] = useState({
    roomType: '',
    checkIn: undefined as Date | undefined,
    checkOut: undefined as Date | undefined,
    guestName: '',
    guestPhone: '',
    guestsCount: 1,
    paymentMethod: 'cash', // cash, card, transfer
    comment: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; bookingId?: string } | null>(null)
  const [copied, setCopied] = useState(false)
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.roomType || !formData.checkIn || !formData.checkOut || !formData.guestName) {
      setResult({ success: false, message: 'Заполните все обязательные поля' })
      return
    }
    
    setIsSubmitting(true)
    setResult(null)
    
    try {
      const res = await fetch('/api/admin/quick-booking', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Admin-Secret': secretKey || '',
        },
        body: JSON.stringify({
          roomTypeId: formData.roomType,
          checkIn: formData.checkIn.toISOString(),
          checkOut: formData.checkOut.toISOString(),
          guestName: formData.guestName,
          guestPhone: formData.guestPhone || 'Не указан',
          guestEmail: 'offline@hostel-delas.ru',
          guestsCount: formData.guestsCount,
          comment: `[${formData.paymentMethod === 'cash' ? 'Наличные' : formData.paymentMethod === 'card' ? 'Карта' : 'Перевод'}] ${formData.comment}`.trim(),
          source: 'offline',
          status: 'CHECKED_IN', // Сразу заселён
          paymentStatus: 'SUCCEEDED', // Сразу оплачено
        }),
      })
      
      const data = await res.json()
      
      if (data.success) {
        setResult({ 
          success: true, 
          message: 'Гость добавлен в базу!', 
          bookingId: data.data.bookingId 
        })
        // Очищаем форму
        setFormData({
          roomType: '',
          checkIn: undefined,
          checkOut: undefined,
          guestName: '',
          guestPhone: '',
          guestsCount: 1,
          paymentMethod: 'cash',
          comment: '',
        })
      } else {
        setResult({ success: false, message: data.error || 'Ошибка' })
      }
    } catch (err) {
      setResult({ success: false, message: 'Ошибка сети' })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <div className="min-h-screen bg-sand p-4">
      <div className="max-w-lg mx-auto">
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              ⚡ Быстрое заселение
            </CardTitle>
            <CardDescription>
              Добавить гостя вручную (безнал, на месте)
            </CardDescription>
          </CardHeader>
        </Card>
        
        <form onSubmit={handleSubmit}>
          <Card className="mb-4">
            <CardContent className="pt-4 space-y-4">
              {/* Тип номера */}
              <div>
                <Label>Номер *</Label>
                <Select
                  value={formData.roomType}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, roomType: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите номер" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROOM_TYPES.map(room => (
                      <SelectItem key={room.slug} value={room.slug}>
                        {room.name} ({room.pricePerNight}₽)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Даты */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Заезд *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !formData.checkIn && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.checkIn ? format(formData.checkIn, 'dd.MM', { locale: ru }) : 'Дата'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.checkIn}
                        onSelect={(date) => {
                          setFormData(prev => ({ 
                            ...prev, 
                            checkIn: date,
                            checkOut: date && (!prev.checkOut || prev.checkOut <= date) 
                              ? addDays(date, 1) 
                              : prev.checkOut
                          }))
                        }}
                        locale={ru}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label>Выезд *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !formData.checkOut && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.checkOut ? format(formData.checkOut, 'dd.MM', { locale: ru }) : 'Дата'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.checkOut}
                        onSelect={(date) => setFormData(prev => ({ ...prev, checkOut: date }))}
                        disabled={(date) => formData.checkIn ? date <= formData.checkIn : false}
                        locale={ru}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              {/* Гость */}
              <div>
                <Label>Имя гостя *</Label>
                <Input
                  value={formData.guestName}
                  onChange={(e) => setFormData(prev => ({ ...prev, guestName: e.target.value }))}
                  placeholder="Иван Иванов"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Телефон</Label>
                  <Input
                    value={formData.guestPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, guestPhone: e.target.value }))}
                    placeholder="+7..."
                  />
                </div>
                <div>
                  <Label>Гостей</Label>
                  <Select
                    value={String(formData.guestsCount)}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, guestsCount: Number(v) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(n => (
                        <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Оплата */}
              <div>
                <Label>Оплата</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, paymentMethod: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">💵 Наличные</SelectItem>
                    <SelectItem value="card">💳 Карта (терминал)</SelectItem>
                    <SelectItem value="transfer">📱 Перевод</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Комментарий */}
              <div>
                <Label>Комментарий</Label>
                <Input
                  value={formData.comment}
                  onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Любые заметки..."
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Результат */}
          {result && (
            <Card className={cn('mb-4', result.success ? 'border-green-500' : 'border-red-500')}>
              <CardContent className="pt-4">
                <div className={cn(
                  'flex items-center gap-2',
                  result.success ? 'text-green-700' : 'text-red-700'
                )}>
                  {result.success ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                  <span className="font-medium">{result.message}</span>
                </div>
                {result.bookingId && (
                  <p className="text-sm text-coal-light mt-1">ID: {result.bookingId}</p>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Кнопка */}
          <Button
            type="submit"
            className="w-full bg-terracotta hover:bg-terracotta-dark"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Добавляем...
              </>
            ) : (
              '✓ Заселить гостя'
            )}
          </Button>
        </form>
        
        {/* Кнопка копирования ссылки */}
        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={copyLink}
            className="text-coal-light"
          >
            {copied ? (
              <>
                <CheckCheck className="mr-2 h-4 w-4 text-green-600" />
                Скопировано!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Скопировать ссылку
              </>
            )}
          </Button>
          <p className="text-xs text-coal-muted mt-2">
            Добавьте в закладки для быстрого доступа
          </p>
        </div>
      </div>
    </div>
  )
}

