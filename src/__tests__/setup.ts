import '@testing-library/jest-dom'
import { vi, afterEach, beforeEach } from 'vitest'
import { prismaMock, resetPrismaMocks } from './mocks/prisma'

// Мокаем Prisma модуль ПЕРЕД любым импортом
vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
  default: prismaMock,
}))

// Мокаем YooKassa
vi.mock('@/lib/yookassa', () => ({
  createPayment: vi.fn().mockResolvedValue({
    paymentId: 'test-payment-id-123',
    confirmationUrl: 'https://yookassa.ru/test-payment',
  }),
  getPayment: vi.fn().mockResolvedValue({
    id: 'test-payment-id-123',
    status: 'succeeded',
    amount: { value: '1200.00', currency: 'RUB' },
    metadata: { booking_id: 'test-booking-id' },
  }),
  createRefund: vi.fn().mockResolvedValue({
    refundId: 'refund-123',
    status: 'succeeded',
    amount: { value: '1200.00', currency: 'RUB' },
  }),
  verifyWebhookSignature: vi.fn().mockReturnValue(true),
}))

// Мокаем Telegram
vi.mock('@/lib/telegram', () => ({
  sendTelegramNotification: vi.fn().mockResolvedValue(true),
  sendTelegramMessage: vi.fn().mockResolvedValue(true),
  notifyNewBooking: vi.fn().mockResolvedValue(true),
  notifyCorporateRequest: vi.fn().mockResolvedValue(true),
  notifyPaymentSuccess: vi.fn().mockResolvedValue(true),
  notifyBookingCancellation: vi.fn().mockResolvedValue(true),
}))

// Мокаем Email
vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue(true),
  sendBookingConfirmation: vi.fn().mockResolvedValue(true),
  sendBookingCancellation: vi.fn().mockResolvedValue(true),
}))

// Мокаем next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
  headers: vi.fn(() => new Map([
    ['x-forwarded-for', '127.0.0.1'],
    ['user-agent', 'test-agent'],
  ])),
}))

// Мокаем window.matchMedia для тестов компонентов
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  // Мокаем localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  }
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  })

  // Мокаем IntersectionObserver
  class IntersectionObserverMock {
    observe = vi.fn()
    disconnect = vi.fn()
    unobserve = vi.fn()
  }
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: IntersectionObserverMock,
  })

  // Мокаем scrollTo
  window.scrollTo = vi.fn()
}

// Сброс моков перед каждым тестом
beforeEach(() => {
  resetPrismaMocks()
})

// Сброс моков после каждого теста
afterEach(() => {
  vi.clearAllMocks()
})
