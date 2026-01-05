import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Header } from '@/components/layout/Header'

// Мок next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

describe('Header', () => {
  it('рендерится корректно', () => {
    render(<Header />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('содержит ссылку на главную (логотип)', () => {
    render(<Header />)
    const logo = screen.getByRole('link', { name: /delas/i })
    expect(logo).toHaveAttribute('href', '/')
  })

  it('содержит все навигационные ссылки', () => {
    render(<Header />)
    
    expect(screen.getByRole('link', { name: /номера/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /контакты/i })).toBeInTheDocument()
  })

  it('содержит кликабельный номер телефона', () => {
    render(<Header />)
    const phoneLink = screen.getByRole('link', { name: /\+7/i })
    expect(phoneLink).toHaveAttribute('href', expect.stringContaining('tel:'))
  })

  it('содержит кнопку бронирования', () => {
    render(<Header />)
    const bookingLink = screen.getByRole('link', { name: /забронировать/i })
    expect(bookingLink).toHaveAttribute('href', '/booking')
  })

  it('мобильное меню закрыто по умолчанию', () => {
    render(<Header />)
    // Sheet компонент от shadcn/ui
    const menuContent = screen.queryByRole('dialog')
    expect(menuContent).not.toBeInTheDocument()
  })
})

