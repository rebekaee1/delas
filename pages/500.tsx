import Link from 'next/link'

export default function Custom500() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: '#F5F0E8',
      color: '#2D2A26',
    }}>
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h1 style={{ fontSize: '72px', margin: '0', color: '#C4704A' }}>500</h1>
        <h2 style={{ fontSize: '24px', margin: '16px 0' }}>Ошибка сервера</h2>
        <p style={{ color: '#6B6560', marginBottom: '24px' }}>
          Что-то пошло не так. Попробуйте обновить страницу.
        </p>
        <Link 
          href="/"
          style={{
            display: 'inline-block',
            backgroundColor: '#C4704A',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '16px',
          }}
        >
          На главную
        </Link>
      </div>
    </div>
  )
}

