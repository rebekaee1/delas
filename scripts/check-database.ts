/**
 * Скрипт проверки целостности базы данных
 * Запуск: npx tsx scripts/check-database.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface Issue {
  type: 'warning' | 'error'
  table: string
  id: string
  message: string
}

async function checkDatabase() {
  console.log('\n🔍 Проверка базы данных...\n')
  
  const issues: Issue[] = []

  // 1. Проверка бронирований
  console.log('📋 Проверка бронирований...')
  const bookings = await prisma.booking.findMany({
    include: { roomType: true },
  })

  for (const booking of bookings) {
    // Проверка связи с типом номера
    if (!booking.roomType) {
      issues.push({
        type: 'error',
        table: 'Booking',
        id: booking.id,
        message: 'Отсутствует связь с типом номера',
      })
    }

    // Проверка дат
    if (booking.checkOut <= booking.checkIn) {
      issues.push({
        type: 'error',
        table: 'Booking',
        id: booking.id,
        message: 'Дата выезда раньше или равна дате заезда',
      })
    }

    // Проверка количества ночей
    const expectedNights = Math.ceil(
      (booking.checkOut.getTime() - booking.checkIn.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (booking.nights !== expectedNights) {
      issues.push({
        type: 'warning',
        table: 'Booking',
        id: booking.id,
        message: `Неверное количество ночей: ${booking.nights}, ожидается: ${expectedNights}`,
      })
    }

    // Проверка цены
    if (booking.totalPrice <= 0) {
      issues.push({
        type: 'error',
        table: 'Booking',
        id: booking.id,
        message: `Некорректная цена: ${booking.totalPrice}`,
      })
    }

    // Проверка согласованности статусов
    if (booking.paymentStatus === 'SUCCEEDED' && booking.status === 'PENDING') {
      issues.push({
        type: 'warning',
        table: 'Booking',
        id: booking.id,
        message: 'Платёж успешен, но статус брони всё ещё PENDING',
      })
    }

    if (booking.paymentStatus === 'CANCELLED' && booking.status === 'CONFIRMED') {
      issues.push({
        type: 'error',
        table: 'Booking',
        id: booking.id,
        message: 'Платёж отменён, но бронь подтверждена',
      })
    }

    // Проверка PROCESSING статуса
    if (booking.paymentStatus === 'PROCESSING' && !booking.paymentId) {
      issues.push({
        type: 'error',
        table: 'Booking',
        id: booking.id,
        message: 'Статус PROCESSING, но отсутствует paymentId',
      })
    }

    // Проверка email
    if (!booking.guestEmail.includes('@')) {
      issues.push({
        type: 'error',
        table: 'Booking',
        id: booking.id,
        message: `Некорректный email: ${booking.guestEmail}`,
      })
    }

    // Проверка телефона
    if (booking.guestPhone.length < 10) {
      issues.push({
        type: 'warning',
        table: 'Booking',
        id: booking.id,
        message: `Короткий номер телефона: ${booking.guestPhone}`,
      })
    }
  }

  console.log(`   Проверено: ${bookings.length} бронирований`)

  // 2. Проверка типов номеров
  console.log('🛏️  Проверка типов номеров...')
  const roomTypes = await prisma.roomType.findMany()

  for (const room of roomTypes) {
    if (room.pricePerNight <= 0) {
      issues.push({
        type: 'error',
        table: 'RoomType',
        id: room.id,
        message: `Некорректная цена: ${room.pricePerNight}`,
      })
    }

    if (room.totalUnits <= 0) {
      issues.push({
        type: 'error',
        table: 'RoomType',
        id: room.id,
        message: `Некорректное количество мест: ${room.totalUnits}`,
      })
    }

    if (room.maxGuests <= 0) {
      issues.push({
        type: 'error',
        table: 'RoomType',
        id: room.id,
        message: `Некорректная вместимость: ${room.maxGuests}`,
      })
    }
  }

  console.log(`   Проверено: ${roomTypes.length} типов номеров`)

  // 3. Проверка корпоративных заявок
  console.log('🏢 Проверка корпоративных заявок...')
  const corporateRequests = await prisma.corporateRequest.findMany()

  for (const request of corporateRequests) {
    if (!request.email.includes('@')) {
      issues.push({
        type: 'warning',
        table: 'CorporateRequest',
        id: request.id,
        message: `Некорректный email: ${request.email}`,
      })
    }
  }

  console.log(`   Проверено: ${corporateRequests.length} заявок`)

  // 4. Проверка настроек
  console.log('⚙️  Проверка настроек...')
  const settings = await prisma.hotelSettings.findUnique({ where: { id: 'main' } })

  if (!settings) {
    issues.push({
      type: 'error',
      table: 'HotelSettings',
      id: 'main',
      message: 'Отсутствуют настройки отеля',
    })
  }

  // Отчёт
  console.log('\n' + '='.repeat(60))
  
  if (issues.length === 0) {
    console.log('✅ База данных в порядке! Проблем не обнаружено.')
  } else {
    const errors = issues.filter(i => i.type === 'error')
    const warnings = issues.filter(i => i.type === 'warning')

    console.log(`\n❌ Найдено проблем: ${issues.length}`)
    console.log(`   Ошибок: ${errors.length}`)
    console.log(`   Предупреждений: ${warnings.length}`)

    if (errors.length > 0) {
      console.log('\n🔴 ОШИБКИ:')
      for (const error of errors) {
        console.log(`   [${error.table}] ${error.id.slice(-8)}: ${error.message}`)
      }
    }

    if (warnings.length > 0) {
      console.log('\n🟡 ПРЕДУПРЕЖДЕНИЯ:')
      for (const warning of warnings) {
        console.log(`   [${warning.table}] ${warning.id.slice(-8)}: ${warning.message}`)
      }
    }
  }

  // Статистика
  console.log('\n📊 Статистика:')
  
  const stats = {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === 'PENDING').length,
    confirmedBookings: bookings.filter(b => b.status === 'CONFIRMED').length,
    cancelledBookings: bookings.filter(b => b.status === 'CANCELLED').length,
    pendingPayments: bookings.filter(b => b.paymentStatus === 'PENDING').length,
    processingPayments: bookings.filter(b => b.paymentStatus === 'PROCESSING').length,
    succeededPayments: bookings.filter(b => b.paymentStatus === 'SUCCEEDED').length,
    totalRevenue: bookings
      .filter(b => b.paymentStatus === 'SUCCEEDED')
      .reduce((sum, b) => sum + b.totalPrice, 0),
  }

  console.log(`   Всего бронирований: ${stats.totalBookings}`)
  console.log(`   - Ожидают: ${stats.pendingBookings}`)
  console.log(`   - Подтверждены: ${stats.confirmedBookings}`)
  console.log(`   - Отменены: ${stats.cancelledBookings}`)
  console.log(`   Платежи:`)
  console.log(`   - Ожидают: ${stats.pendingPayments}`)
  console.log(`   - В обработке: ${stats.processingPayments}`)
  console.log(`   - Успешные: ${stats.succeededPayments}`)
  console.log(`   Выручка: ${stats.totalRevenue.toLocaleString('ru-RU')}₽`)

  console.log('\n' + '='.repeat(60) + '\n')

  return issues
}

// Запуск
checkDatabase()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

