import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Настройки хостела
  await prisma.hotelSettings.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: 'main',
      name: 'DELAS',
      address: 'г. Сочи, ул. Гагарина, 53а',
      phone: '+7 (XXX) XXX-XX-XX', // TODO: Заменить на реальный
      email: 'info@delas-sochi.ru',
      telegramChatId: '', // TODO: Добавить после настройки бота
      checkInTime: '14:00',
      checkOutTime: '12:00',
      discount2Days: 5,
      discount7Days: 10,
      laundryPrice: 200,
      storagePrice: 100,
    },
  })
  console.log('✅ Hotel settings created')

  // Типы номеров
  const roomTypes = [
    {
      name: 'Стандарт',
      slug: 'standart',
      description: 'Базовое размещение в общем номере. Всё необходимое для комфортного отдыха. 10 койко-мест.',
      beds: 10,
      pricePerNight: 600,
      amenities: ['Wi-Fi', 'Постельное бельё', 'Доступ на кухню', 'Душ'],
      images: [],
      maxGuests: 10,
      totalUnits: 1, // 1 номер с 10 койко-местами (ХОСТЕЛ!)
      isActive: true,
      isWomenOnly: false,
      sortOrder: 1,
    },
    {
      name: 'Комфорт',
      slug: 'komfort',
      description: 'Повышенный комфорт: кровать с деревянной обшивкой, индивидуальная розетка, USB-зарядка и личный светильник. 8 койко-мест.',
      beds: 8,
      pricePerNight: 800,
      amenities: ['Wi-Fi', 'Постельное бельё', 'Личная розетка', 'USB-зарядка', 'Светильник', 'Доступ на кухню', 'Душ'],
      images: [],
      maxGuests: 8,
      totalUnits: 1, // 1 номер с 8 койко-местами (ХОСТЕЛ!)
      isActive: true,
      isWomenOnly: false,
      sortOrder: 2,
    },
    {
      name: 'Комфорт+',
      slug: 'komfort-plus',
      description: 'Меньше людей в номере — больше пространства и тишины. Все удобства номера Комфорт. 6 койко-мест.',
      beds: 6,
      pricePerNight: 900,
      amenities: ['Wi-Fi', 'Постельное бельё', 'Личная розетка', 'USB-зарядка', 'Светильник', 'Доступ на кухню', 'Душ'],
      images: [],
      maxGuests: 6,
      totalUnits: 1, // 1 номер с 6 койко-местами (ХОСТЕЛ!)
      isActive: true,
      isWomenOnly: false,
      sortOrder: 3,
    },
    {
      name: 'Женский Комфорт+',
      slug: 'zhenskiy-komfort-plus',
      description: 'Только для женщин. Максимальная приватность, всего 4 койко-места в номере. Все удобства номера Комфорт.',
      beds: 4,
      pricePerNight: 800,
      amenities: ['Wi-Fi', 'Постельное бельё', 'Личная розетка', 'USB-зарядка', 'Светильник', 'Доступ на кухню', 'Душ', 'Только для женщин'],
      images: [],
      maxGuests: 4,
      totalUnits: 1, // 1 номер с 4 койко-местами (ХОСТЕЛ, только для женщин!)
      isActive: true,
      isWomenOnly: true,
      sortOrder: 4,
    },
  ]

  for (const roomType of roomTypes) {
    await prisma.roomType.upsert({
      where: { slug: roomType.slug },
      update: roomType,
      create: roomType,
    })
  }
  console.log(`✅ Created ${roomTypes.length} room types`)

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })



