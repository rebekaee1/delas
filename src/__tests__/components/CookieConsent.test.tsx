import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CookieConsent } from '@/components/layout/CookieConsent'

// Мок fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('CookieConsent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Очищаем localStorage мок
    localStorage.getItem = vi.fn().mockReturnValue(null)
    localStorage.setItem = vi.fn()
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    })
  })

  it('показывается при первом визите', async () => {
    render(<CookieConsent />)
    
    // Ждём появления баннера (с задержкой 1.5с)
    await waitFor(() => {
      expect(screen.getByText(/используем cookies/i)).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('скрывается при клике "Принять"', async () => {
    render(<CookieConsent />)
    
    await waitFor(() => {
      expect(screen.getByText(/используем cookies/i)).toBeInTheDocument()
    }, { timeout: 2000 })

    fireEvent.click(screen.getByText('Принять'))

    await waitFor(() => {
      expect(screen.queryByText(/используем cookies/i)).not.toBeInTheDocument()
    }, { timeout: 500 })
  })

  it('сохраняет согласие в localStorage при принятии', async () => {
    render(<CookieConsent />)
    
    await waitFor(() => {
      expect(screen.getByText('Принять')).toBeInTheDocument()
    }, { timeout: 2000 })

    fireEvent.click(screen.getByText('Принять'))

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'delas_cookie_consent',
        expect.stringContaining('"accepted":true')
      )
    })
  })

  it('не показывается если согласие уже дано', async () => {
    localStorage.getItem = vi.fn().mockReturnValue(
      JSON.stringify({ accepted: true, timestamp: new Date().toISOString() })
    )

    render(<CookieConsent />)
    
    // Ждём и проверяем что баннер НЕ появился
    await new Promise(resolve => setTimeout(resolve, 2000))
    expect(screen.queryByText(/используем cookies/i)).not.toBeInTheDocument()
  })

  it('содержит ссылку на политику конфиденциальности', async () => {
    render(<CookieConsent />)
    
    await waitFor(() => {
      expect(screen.getByText('Политикой конфиденциальности')).toBeInTheDocument()
    }, { timeout: 2000 })

    const link = screen.getByText('Политикой конфиденциальности')
    expect(link.closest('a')).toHaveAttribute('href', '/privacy')
  })

  it('скрывается при клике "Отклонить"', async () => {
    render(<CookieConsent />)
    
    await waitFor(() => {
      expect(screen.getByText('Отклонить')).toBeInTheDocument()
    }, { timeout: 2000 })

    fireEvent.click(screen.getByText('Отклонить'))

    await waitFor(() => {
      expect(screen.queryByText(/используем cookies/i)).not.toBeInTheDocument()
    }, { timeout: 500 })
  })
})

