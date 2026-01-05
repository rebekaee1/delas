import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * API для инициализации базы данных
 * Вызывается один раз после деплоя, если нет доступа к консоли
 * 
 * GET /api/db/init?secret=YOUR_SECRET_KEY
 * GET /api/db/init?secret=YOUR_SECRET_KEY&seed=true
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  
  // Проверка секретного ключа
  const expectedSecret = process.env.DB_INIT_SECRET || process.env.CRON_SECRET
  
  if (!expectedSecret) {
    return NextResponse.json(
      { error: 'DB_INIT_SECRET not configured. Add DB_INIT_SECRET env variable.' },
      { status: 500 }
    )
  }
  
  if (secret !== expectedSecret) {
    return NextResponse.json(
      { error: 'Invalid secret' },
      { status: 401 }
    )
  }

  const results: string[] = []
  const shouldSeed = searchParams.get('seed') === 'true'

  try {
    // 1. Создаём enum'ы если не существуют
    results.push('Creating enums...')
    
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'CANCELED', 'FAILED', 'REFUNDED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$
    `)
    
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'NO_SHOW');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$
    `)
    
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "RequestStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'COMPLETED', 'REJECTED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$
    `)
    
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "ConsentType" AS ENUM ('PERSONAL_DATA', 'MARKETING', 'COOKIES');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$
    `)
    
    results.push('Enums created')

    // 2. Создаём таблицу RoomType
    results.push('Creating RoomType table...')
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "RoomType" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "beds" INTEGER NOT NULL,
        "pricePerNight" INTEGER NOT NULL,
        "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
        "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
        "maxGuests" INTEGER NOT NULL,
        "totalUnits" INTEGER NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "isWomenOnly" BOOLEAN NOT NULL DEFAULT false,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "RoomType_pkey" PRIMARY KEY ("id")
      )
    `)
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "RoomType_slug_key" ON "RoomType"("slug")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "RoomType_slug_idx" ON "RoomType"("slug")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "RoomType_isActive_idx" ON "RoomType"("isActive")`)
    results.push('RoomType table created')

    // 3. Создаём таблицу Booking
    results.push('Creating Booking table...')
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Booking" (
        "id" TEXT NOT NULL,
        "roomTypeId" TEXT NOT NULL,
        "checkIn" TIMESTAMP(3) NOT NULL,
        "checkOut" TIMESTAMP(3) NOT NULL,
        "nights" INTEGER NOT NULL,
        "guestName" TEXT NOT NULL,
        "guestPhone" TEXT NOT NULL,
        "guestEmail" TEXT NOT NULL,
        "guestsCount" INTEGER NOT NULL DEFAULT 1,
        "basePrice" INTEGER NOT NULL,
        "discountPercent" INTEGER NOT NULL DEFAULT 0,
        "discountAmount" INTEGER NOT NULL DEFAULT 0,
        "totalPrice" INTEGER NOT NULL,
        "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
        "paymentId" TEXT,
        "paidAt" TIMESTAMP(3),
        "receiptId" TEXT,
        "receiptStatus" TEXT,
        "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
        "comment" TEXT,
        "adminNote" TEXT,
        "source" TEXT NOT NULL DEFAULT 'website',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Booking_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "Booking_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Booking_checkIn_checkOut_idx" ON "Booking"("checkIn", "checkOut")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Booking_roomTypeId_idx" ON "Booking"("roomTypeId")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Booking_paymentStatus_idx" ON "Booking"("paymentStatus")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Booking_status_idx" ON "Booking"("status")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Booking_guestEmail_idx" ON "Booking"("guestEmail")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Booking_guestPhone_idx" ON "Booking"("guestPhone")`)
    results.push('Booking table created')

    // 4. Создаём таблицу HotelSettings
    results.push('Creating HotelSettings table...')
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "HotelSettings" (
        "id" TEXT NOT NULL DEFAULT 'main',
        "name" TEXT NOT NULL DEFAULT 'DELAS',
        "address" TEXT NOT NULL DEFAULT 'г. Сочи, ул. Гагарина, 53а',
        "phone" TEXT NOT NULL DEFAULT '',
        "email" TEXT NOT NULL DEFAULT '',
        "telegramChatId" TEXT NOT NULL DEFAULT '',
        "checkInTime" TEXT NOT NULL DEFAULT '14:00',
        "checkOutTime" TEXT NOT NULL DEFAULT '12:00',
        "discount2Days" INTEGER NOT NULL DEFAULT 5,
        "discount7Days" INTEGER NOT NULL DEFAULT 10,
        "laundryPrice" INTEGER NOT NULL DEFAULT 200,
        "storagePrice" INTEGER NOT NULL DEFAULT 100,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "HotelSettings_pkey" PRIMARY KEY ("id")
      )
    `)
    results.push('HotelSettings table created')

    // 5. Создаём таблицу BlockedDate
    results.push('Creating BlockedDate table...')
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "BlockedDate" (
        "id" TEXT NOT NULL,
        "roomTypeId" TEXT,
        "date" TIMESTAMP(3) NOT NULL,
        "reason" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "BlockedDate_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "BlockedDate_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE SET NULL ON UPDATE CASCADE
      )
    `)
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "BlockedDate_roomTypeId_date_key" ON "BlockedDate"("roomTypeId", "date")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "BlockedDate_date_idx" ON "BlockedDate"("date")`)
    results.push('BlockedDate table created')

    // 6. Создаём таблицу CorporateRequest
    results.push('Creating CorporateRequest table...')
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "CorporateRequest" (
        "id" TEXT NOT NULL,
        "companyName" TEXT NOT NULL,
        "contactName" TEXT NOT NULL,
        "phone" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "guestsCount" INTEGER,
        "checkIn" TIMESTAMP(3),
        "checkOut" TIMESTAMP(3),
        "message" TEXT,
        "status" "RequestStatus" NOT NULL DEFAULT 'NEW',
        "adminNote" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "CorporateRequest_pkey" PRIMARY KEY ("id")
      )
    `)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "CorporateRequest_status_idx" ON "CorporateRequest"("status")`)
    results.push('CorporateRequest table created')

    // 7. Создаём таблицу Consent
    results.push('Creating Consent table...')
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Consent" (
        "id" TEXT NOT NULL,
        "type" "ConsentType" NOT NULL,
        "email" TEXT,
        "phone" TEXT,
        "ip" TEXT NOT NULL,
        "userAgent" TEXT NOT NULL,
        "accepted" BOOLEAN NOT NULL,
        "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "bookingId" TEXT,
        CONSTRAINT "Consent_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "Consent_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE
      )
    `)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Consent_email_idx" ON "Consent"("email")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Consent_phone_idx" ON "Consent"("phone")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Consent_type_idx" ON "Consent"("type")`)
    results.push('Consent table created')

    // 8. Заполняем начальные данные если нужно
    if (shouldSeed) {
      results.push('Seeding data...')
      
      // Проверяем, есть ли уже данные
      const existingRooms = await prisma.roomType.count()
      
      if (existingRooms === 0) {
        // Создаём типы номеров
        await prisma.roomType.createMany({
          data: [
            {
              id: 'standard',
              name: 'Стандарт',
              slug: 'standart',
              description: 'Уютный номер с удобными кроватями и всем необходимым для комфортного отдыха. Идеально подходит для путешественников, ценящих соотношение цены и качества.',
              beds: 8,
              pricePerNight: 600,
              amenities: ['Wi-Fi', 'Кондиционер', 'Личный шкафчик', 'Розетка у кровати', 'Постельное бельё', 'Полотенце'],
              images: ['/images/standard_4x3.webp', '/images/standard_16x9.webp'],
              maxGuests: 8,
              totalUnits: 2,
              isActive: true,
              isWomenOnly: false,
              sortOrder: 1,
            },
            {
              id: 'comfort',
              name: 'Комфорт',
              slug: 'komfort',
              description: 'Просторный номер повышенной комфортности с улучшенной звукоизоляцией. Для тех, кто ценит дополнительное пространство и тишину.',
              beds: 6,
              pricePerNight: 800,
              amenities: ['Wi-Fi', 'Кондиционер', 'Личный шкафчик', 'Розетка у кровати', 'Постельное бельё', 'Полотенце', 'Шторки на кровати', 'Увеличенное место'],
              images: ['/images/comfort_4x3.webp'],
              maxGuests: 6,
              totalUnits: 2,
              isActive: true,
              isWomenOnly: false,
              sortOrder: 2,
            },
            {
              id: 'comfort-plus',
              name: 'Комфорт+',
              slug: 'komfort-plus',
              description: 'Премиальный номер с максимальным уровнем комфорта. Просторные кровати, шторки для приватности и расширенный набор удобств.',
              beds: 4,
              pricePerNight: 1000,
              amenities: ['Wi-Fi', 'Кондиционер', 'Личный шкафчик', 'Розетка у кровати', 'Постельное бельё', 'Полотенце', 'Шторки на кровати', 'Увеличенное место', 'USB-зарядка', 'Лампа для чтения'],
              images: ['/images/comfort+_4x3.webp'],
              maxGuests: 4,
              totalUnits: 1,
              isActive: true,
              isWomenOnly: false,
              sortOrder: 3,
            },
            {
              id: 'women-comfort-plus',
              name: 'Женский Комфорт+',
              slug: 'zhenskiy-komfort-plus',
              description: 'Эксклюзивный номер только для женщин. Максимальный комфорт и приватность в безопасной атмосфере.',
              beds: 4,
              pricePerNight: 1000,
              amenities: ['Wi-Fi', 'Кондиционер', 'Личный шкафчик', 'Розетка у кровати', 'Постельное бельё', 'Полотенце', 'Шторки на кровати', 'Увеличенное место', 'USB-зарядка', 'Лампа для чтения', 'Фен', 'Зеркало'],
              images: ['/images/women_4x3.webp'],
              maxGuests: 4,
              totalUnits: 1,
              isActive: true,
              isWomenOnly: true,
              sortOrder: 4,
            },
          ],
        })
        results.push('Room types seeded')
        
        // Создаём настройки
        await prisma.hotelSettings.upsert({
          where: { id: 'main' },
          update: {},
          create: {
            id: 'main',
            name: 'DELAS',
            address: 'г. Сочи, ул. Гагарина, 53а',
            phone: '+7 (938) 440-40-09',
            email: 'info@delas-hostel.ru',
            checkInTime: '14:00',
            checkOutTime: '12:00',
            discount2Days: 5,
            discount7Days: 10,
          },
        })
        results.push('Hotel settings seeded')
      } else {
        results.push(`Skipped seeding - ${existingRooms} room types already exist`)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      results,
      timestamp: new Date().toISOString(),
    })
    
  } catch (error: any) {
    console.error('DB init error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Database initialization failed',
        details: error.message,
        results,
      },
      { status: 500 }
    )
  }
}
