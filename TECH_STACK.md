# Технический стек проекта DELAS

## О проекте

**Хостел DELAS** — сайт для бронирования и оплаты койко-мест в хостеле в Сочи.

| Параметр | Значение |
|----------|----------|
| **Адрес** | г. Сочи, ул. Гагарина, 53а |
| **Тип** | Fullstack веб-приложение |
| **Хостинг** | TimeWeb Cloud (Россия) |
| **Сегмент** | Эконом, бюджетный туризм |

### Связанные документы

- 📋 `BUSINESS_INFO.md` — бизнес-информация, аудитория, SEO
- 🎨 `DESIGN_GUIDELINES.md` — дизайн-система, цвета, шрифты, UX

---

## Технологии

### Frontend + Backend (Fullstack)

| Технология | Версия | Назначение |
|------------|--------|------------|
| Next.js | 14.x (App Router) | Fullstack фреймворк |
| TypeScript | 5.x | Типизация |
| Tailwind CSS | 3.x | Стилизация |
| Shadcn/ui | latest | UI компоненты |
| React Hook Form | 7.x | Формы |
| Zod | 3.x | Валидация |
| date-fns | 3.x | Работа с датами |
| Lucide React | - | Иконки |

### База данных

| Технология | Назначение |
|------------|------------|
| TimeWeb Cloud PostgreSQL | Основная БД (сервера в РФ) |
| Prisma ORM | Работа с БД, миграции |
| Приватная сеть TimeWeb | Безопасное подключение |

### Хранилище файлов

| Технология | Назначение |
|------------|------------|
| TimeWeb Cloud S3 | Фото номеров, медиа |

> ⚠️ **ВАЖНО:** Docker-контейнер App Platform НЕ сохраняет файлы между деплоями. Все медиа ОБЯЗАТЕЛЬНО хранить в S3!

### Платежи

| Технология | Назначение |
|------------|------------|
| ЮKassa (YooKassa) | Приём платежей (карты, СБП) |
| Webhook `/api/payment/webhook` | Подтверждение оплаты |

### Уведомления

| Технология | Назначение |
|------------|------------|
| Telegram Bot API | Уведомления менеджерам |
| Resend / SMTP | Email клиентам |

### Хостинг

| Сервис | Назначение |
|--------|------------|
| TimeWeb App Platform | Деплой приложения |
| TimeWeb PostgreSQL | База данных |
| TimeWeb S3 | Хранилище медиа |

---

## Архитектура

### Структура проекта

```
delas/
├── prisma/
│   ├── schema.prisma        # Схема БД
│   ├── migrations/          # Миграции
│   └── seed.ts              # Начальные данные (номера)
├── public/
│   ├── favicon.ico
│   ├── og-image.jpg         # OpenGraph изображение (1200x630)
│   └── images/              # Статичные изображения
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Корневой layout + SEO
│   │   ├── page.tsx         # Главная страница
│   │   ├── globals.css      # Глобальные стили + CSS variables
│   │   ├── rooms/
│   │   │   ├── page.tsx     # Список номеров
│   │   │   └── [slug]/
│   │   │       └── page.tsx # Детали номера
│   │   ├── booking/
│   │   │   ├── page.tsx     # Форма бронирования
│   │   │   └── success/
│   │   │       └── page.tsx # Успешное бронирование
│   │   ├── contacts/
│   │   │   └── page.tsx     # Контакты + карта
│   │   ├── corporate/
│   │   │   └── page.tsx     # Для организаций (B2B)
│   │   └── api/
│   │       ├── rooms/
│   │       │   └── route.ts
│   │       ├── booking/
│   │       │   ├── route.ts
│   │       │   └── check/
│   │       │       └── route.ts
│   │       └── payment/
│   │           ├── create/
│   │           │   └── route.ts
│   │           └── webhook/
│   │               └── route.ts
│   ├── components/
│   │   ├── ui/              # Shadcn компоненты
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── MobileNav.tsx
│   │   ├── rooms/
│   │   │   ├── RoomCard.tsx
│   │   │   ├── RoomGallery.tsx
│   │   │   └── RoomList.tsx
│   │   ├── booking/
│   │   │   ├── BookingForm.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   ├── GuestForm.tsx
│   │   │   └── PriceCalculator.tsx
│   │   └── shared/
│   │       ├── Container.tsx
│   │       ├── Badge.tsx
│   │       └── PhoneButton.tsx
│   ├── lib/
│   │   ├── prisma.ts        # Prisma client singleton
│   │   ├── yookassa.ts      # ЮKassa интеграция
│   │   ├── telegram.ts      # Telegram уведомления
│   │   ├── email.ts         # Email отправка (Resend)
│   │   ├── s3.ts            # TimeWeb S3 клиент
│   │   ├── utils.ts         # Утилиты (cn, formatPrice)
│   │   └── validators.ts    # Zod схемы валидации
│   ├── types/
│   │   ├── booking.ts
│   │   └── room.ts
│   └── constants/
│       ├── seo.ts           # SEO мета-теги
│       └── hotel.ts         # Данные хостела
├── TECH_STACK.md            # Этот файл
├── BUSINESS_INFO.md         # Бизнес-информация
├── DESIGN_GUIDELINES.md     # Дизайн-система
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### Схема БД

```
┌─────────────────┐     ┌─────────────────┐
│     RoomType    │     │    Booking      │
├─────────────────┤     ├─────────────────┤
│ id              │     │ id              │
│ name            │────<│ roomTypeId      │
│ slug            │     │ guestName       │
│ description     │     │ guestPhone      │
│ beds            │     │ guestEmail      │
│ pricePerNight   │     │ checkIn         │
│ amenities[]     │     │ checkOut        │
│ images[]        │     │ nights          │
│ maxGuests       │     │ totalPrice      │
│ totalUnits      │     │ paymentStatus   │
│ isActive        │     │ paymentId       │
└─────────────────┘     │ status          │
                        │ comment         │
┌─────────────────┐     └─────────────────┘
│  HotelSettings  │
├─────────────────┤     ┌─────────────────┐
│ id (singleton)  │     │   BlockedDate   │
│ name            │     ├─────────────────┤
│ address         │     │ id              │
│ phone           │     │ roomTypeId      │
│ email           │     │ date            │
│ telegramChatId  │     │ reason          │
│ checkInTime     │     └─────────────────┘
│ checkOutTime    │
└─────────────────┘
```

---

## API Endpoints

### Публичные

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/rooms` | Список типов номеров |
| GET | `/api/rooms/[slug]` | Детали номера |
| POST | `/api/booking/check` | Проверка доступности |
| POST | `/api/booking` | Создание бронирования |
| POST | `/api/payment/create` | Создание платежа |
| POST | `/api/payment/webhook` | Webhook ЮKassa |
| GET | `/api/booking/[id]` | Статус бронирования |

---

## Флоу бронирования

```
1. Клиент выбирает даты и тип размещения
           ↓
2. Система проверяет доступность (POST /api/booking/check)
           ↓
3. Клиент заполняет форму (имя, телефон, email)
           ↓
4. Создаётся бронирование (POST /api/booking)
           ↓
5. Создаётся платёж в ЮKassa (POST /api/payment/create)
           ↓
6. Редирект на страницу оплаты ЮKassa
           ↓
7. После оплаты ЮKassa отправляет webhook
           ↓
8. Система обновляет статус бронирования
           ↓
9. Отправляются уведомления:
   • Email клиенту с подтверждением
   • Telegram менеджерам
           ↓
10. Менеджер может перезвонить по телефону
```

---

## Переменные окружения

```env
# База данных (приватная сеть TimeWeb)
DATABASE_URL="postgresql://user:pass@10.0.X.X:5432/delas_db"

# ЮKassa
YOOKASSA_SHOP_ID="123456"
YOOKASSA_SECRET_KEY="live_xxxxx"
YOOKASSA_WEBHOOK_SECRET="whsec_xxxxx"

# Telegram
TELEGRAM_BOT_TOKEN="123456:ABC-xxxxx"
TELEGRAM_CHAT_ID="-1001234567890"

# Email
RESEND_API_KEY="re_xxxxx"
# или SMTP
SMTP_HOST="smtp.timeweb.ru"
SMTP_PORT="465"
SMTP_USER="noreply@delas-sochi.ru"
SMTP_PASS="xxxxx"

# S3
S3_ENDPOINT="https://s3.timeweb.cloud"
S3_BUCKET="delas-media"
S3_ACCESS_KEY="xxxxx"
S3_SECRET_KEY="xxxxx"

# Приложение
NEXT_PUBLIC_SITE_URL="https://delas-sochi.ru"
NODE_ENV="production"
```

---

## Деплой (TimeWeb App Platform)

### Команды

| Параметр | Значение |
|----------|----------|
| Фреймворк | Node.js / Next.js |
| Команда сборки | `npm run build` |
| Команда запуска | `npm run start` |
| Порт | 3000 |

### package.json scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && prisma migrate deploy && next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### Настройка приватной сети

1. Создать PostgreSQL в TimeWeb Cloud
2. Создать приватную сеть
3. Добавить PostgreSQL и App в одну сеть
4. Использовать приватный IP в DATABASE_URL

---

## SEO и маршруты

> Полная SEO-стратегия в `BUSINESS_INFO.md`

### Маршруты приложения

| Путь | Страница | Приоритет SEO |
|------|----------|---------------|
| `/` | Главная | Высокий |
| `/rooms` | Номера и цены | Высокий |
| `/rooms/[slug]` | Детали номера | Средний |
| `/booking` | Форма бронирования | Низкий (noindex) |
| `/booking/success` | Успешное бронирование | Низкий (noindex) |
| `/contacts` | Контакты + карта | Средний |
| `/corporate` | Для организаций (B2B) | Средний |

---

## Особенности проекта

1. **Нет личного кабинета** — клиент просто оплачивает, информация приходит на email
2. **Менеджеры перезванивают** — телефон клиента доступен для связи
3. **Уведомления дублируются** — email клиенту + Telegram менеджерам
4. **Данные в РФ** — TimeWeb Cloud, сервера в России
5. **Автодеплой** — при push в репозиторий

---

## Чек-лист перед продакшеном

- [ ] PostgreSQL создан в TimeWeb Cloud
- [ ] Приватная сеть настроена
- [ ] S3 бакет создан
- [ ] Домен привязан, SSL работает
- [ ] ЮKassa аккаунт активирован
- [ ] Telegram бот создан
- [ ] Email настроен
- [ ] Все env переменные в App Platform
- [ ] Миграции применены
- [ ] Начальные данные загружены
- [ ] Webhook ЮKassa настроен
- [ ] Тестовое бронирование успешно

