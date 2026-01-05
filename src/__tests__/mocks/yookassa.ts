import { vi } from 'vitest'

// Мок ЮKassa API
export const yookassaMock = {
  createPayment: vi.fn().mockResolvedValue({
    paymentId: 'test-payment-id-123',
    confirmationUrl: 'https://yookassa.ru/checkout/test-payment',
  }),
  getPayment: vi.fn().mockResolvedValue({
    id: 'test-payment-id-123',
    status: 'succeeded',
    amount: { value: '1200.00', currency: 'RUB' },
    description: 'Бронирование #TEST1234',
    metadata: { booking_id: 'test-booking-id' },
    created_at: new Date().toISOString(),
  }),
}

export function resetYookassaMocks() {
  yookassaMock.createPayment.mockReset()
  yookassaMock.getPayment.mockReset()
  
  // Восстанавливаем дефолтное поведение
  yookassaMock.createPayment.mockResolvedValue({
    paymentId: 'test-payment-id-123',
    confirmationUrl: 'https://yookassa.ru/checkout/test-payment',
  })
  yookassaMock.getPayment.mockResolvedValue({
    id: 'test-payment-id-123',
    status: 'succeeded',
    amount: { value: '1200.00', currency: 'RUB' },
    description: 'Бронирование #TEST1234',
    metadata: { booking_id: 'test-booking-id' },
    created_at: new Date().toISOString(),
  })
}

// Мокаем модуль yookassa
vi.mock('@/lib/yookassa', () => ({
  createPayment: yookassaMock.createPayment,
  getPayment: yookassaMock.getPayment,
}))
