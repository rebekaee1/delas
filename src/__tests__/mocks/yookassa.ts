import { vi } from 'vitest'

// Мок ЮKassa API
export const yookassaMock = {
  createPayment: vi.fn().mockResolvedValue({
    id: 'test-payment-id-123',
    status: 'pending',
    confirmation: {
      confirmation_url: 'https://yookassa.ru/test-payment',
    },
  }),
  getPayment: vi.fn().mockResolvedValue({
    id: 'test-payment-id-123',
    status: 'succeeded',
    amount: { value: '1200.00', currency: 'RUB' },
    description: 'Бронирование #TEST1234',
    metadata: { booking_id: 'test-booking-id' },
    created_at: new Date().toISOString(),
  }),
  createRefund: vi.fn().mockResolvedValue({
    id: 'refund-123',
    status: 'succeeded',
    amount: { value: '1200.00', currency: 'RUB' },
  }),
  verifyWebhookSignature: vi.fn().mockReturnValue(true),
}

export function resetYookassaMocks() {
  yookassaMock.createPayment.mockReset()
  yookassaMock.getPayment.mockReset()
  yookassaMock.createRefund.mockReset()
  yookassaMock.verifyWebhookSignature.mockReset()
  
  // Восстанавливаем дефолтное поведение
  yookassaMock.createPayment.mockResolvedValue({
    id: 'test-payment-id-123',
    status: 'pending',
    confirmation: {
      confirmation_url: 'https://yookassa.ru/test-payment',
    },
  })
  yookassaMock.getPayment.mockResolvedValue({
    id: 'test-payment-id-123',
    status: 'succeeded',
    amount: { value: '1200.00', currency: 'RUB' },
    description: 'Бронирование #TEST1234',
    metadata: { booking_id: 'test-booking-id' },
    created_at: new Date().toISOString(),
  })
  yookassaMock.createRefund.mockResolvedValue({
    id: 'refund-123',
    status: 'succeeded',
    amount: { value: '1200.00', currency: 'RUB' },
  })
  yookassaMock.verifyWebhookSignature.mockReturnValue(true)
}
