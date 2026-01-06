'use client'

import { trackPhoneClick, trackWhatsAppClick } from '@/lib/metrika'

interface ContactLinkProps {
  href: string
  children: React.ReactNode
  type: 'phone' | 'whatsapp'
  source: string
  className?: string
}

/**
 * Обёртка для ссылок контактов с трекингом кликов
 */
export function ContactLink({ href, children, type, source, className }: ContactLinkProps) {
  const handleClick = () => {
    if (type === 'phone') {
      trackPhoneClick(source)
    } else if (type === 'whatsapp') {
      trackWhatsAppClick(source)
    }
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      className={className}
      target={type === 'whatsapp' ? '_blank' : undefined}
      rel={type === 'whatsapp' ? 'noopener noreferrer' : undefined}
    >
      {children}
    </a>
  )
}

