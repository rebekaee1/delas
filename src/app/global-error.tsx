'use client'

import { useEffect } from 'react'

/**
 * Global Error Boundary
 * Обрабатывает ошибки в root layout
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="ru">
      <body style={{ 
        fontFamily: 'system-ui, sans-serif',
        backgroundColor: '#F5F0E8',
        color: '#2D2A26',
        margin: 0,
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}>
        <div style={{ textAlign: 'center', padding: '20px', maxWidth: '400px' }}>
          <h1 style={{ fontSize: '48px', margin: '0 0 16px' }}>😕</h1>
          <h2 style={{ fontSize: '24px', margin: '0 0 16px' }}>
            Критическая ошибка
          </h2>
          <p style={{ color: '#6B6560', marginBottom: '24px' }}>
            Произошла серьёзная ошибка. Пожалуйста, попробуйте обновить страницу.
          </p>
          {error.digest && (
            <p style={{ fontSize: '12px', color: '#999', marginBottom: '24px' }}>
              Код: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              backgroundColor: '#C4704A',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              marginRight: '12px',
            }}
          >
            Попробовать снова
          </button>
          <a
            href="/"
            style={{
              display: 'inline-block',
              backgroundColor: 'transparent',
              color: '#C4704A',
              border: '2px solid #C4704A',
              padding: '10px 22px',
              borderRadius: '8px',
              fontSize: '16px',
              textDecoration: 'none',
            }}
          >
            На главную
          </a>
        </div>
      </body>
    </html>
  )
}

