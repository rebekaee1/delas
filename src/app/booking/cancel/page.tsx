'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { XCircle, Phone, ArrowLeft, RefreshCw, Loader2 } from 'lucide-react'

function BookingCancelContent() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('id')

  return (
    <div className="min-h-screen bg-sand-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-lg">
        <CardContent className="pt-8 pb-6 text-center">
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          
          <h1 className="text-2xl font-heading font-bold text-coal mb-2">
            Оплата отменена
          </h1>
          
          <p className="text-coal-light mb-6">
            Платёж не был завершён. Бронирование не подтверждено.
          </p>

          {bookingId && (
            <div className="bg-sand-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-coal-light">Номер бронирования</p>
              <p className="font-mono font-bold text-coal">
                #{bookingId.slice(-8).toUpperCase()}
              </p>
            </div>
          )}

          <div className="space-y-3">
            {bookingId && (
              <Button 
                asChild 
                className="w-full bg-terracotta hover:bg-terracotta-dark"
              >
                <Link href={`/booking?retry=${bookingId}`}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Попробовать снова
                </Link>
              </Button>
            )}

            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                На главную
              </Link>
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-coal-light mb-3">
              Возникли проблемы с оплатой?
            </p>
            <a 
              href="tel:+79881814777" 
              className="inline-flex items-center gap-2 text-terracotta hover:text-terracotta-dark font-medium"
            >
              <Phone className="w-4 h-4" />
              Позвоните нам: +7 (988) 181-47-77
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function BookingCancelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-sand-100 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-terracotta animate-spin" />
      </div>
    }>
      <BookingCancelContent />
    </Suspense>
  )
}

