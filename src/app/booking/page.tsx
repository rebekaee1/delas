import { Metadata } from 'next'
import { Suspense } from 'react'
import { BookingForm } from '@/components/booking/BookingForm'
import { SEO } from '@/constants/seo'

export const metadata: Metadata = {
  title: SEO.booking.title,
  description: SEO.booking.description,
  robots: {
    index: false,
    follow: false,
  },
}

export default function BookingPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-sand py-12 md:py-16 overflow-hidden">
        <div className="container">
          <h1 className="text-h1 text-coal mb-4 animate-fade-in-up">Бронирование</h1>
          <p className="text-body-lg text-coal-light max-w-2xl animate-fade-in-up delay-100">
            Выберите даты проживания и тип номера. Оплата онлайн — 
            подтверждение придёт на вашу почту.
          </p>
        </div>
      </section>

      {/* Форма бронирования */}
      <section className="section">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Suspense fallback={<BookingFormSkeleton />}>
              <BookingForm />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  )
}

function BookingFormSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-12 bg-sand-200 rounded-lg" />
      <div className="grid md:grid-cols-2 gap-4">
        <div className="h-12 bg-sand-200 rounded-lg" />
        <div className="h-12 bg-sand-200 rounded-lg" />
      </div>
      <div className="h-64 bg-sand-200 rounded-lg" />
      <div className="h-12 bg-sand-200 rounded-lg w-1/3" />
    </div>
  )
}

