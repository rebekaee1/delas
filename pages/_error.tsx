import { NextPageContext } from 'next'

interface ErrorProps {
  statusCode?: number
}

// Custom error page for Pages Router
function Error({ statusCode }: ErrorProps) {
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
        <h1 style={{ fontSize: '72px', margin: '0', color: '#C4704A' }}>
          {statusCode || 'Ошибка'}
        </h1>
        <h2 style={{ fontSize: '24px', margin: '16px 0' }}>
          {statusCode === 404 ? 'Страница не найдена' : 'Произошла ошибка'}
        </h2>
        <p style={{ color: '#6B6560', marginBottom: '24px' }}>
          {statusCode === 404
            ? 'Возможно, страница была удалена или вы ввели неверный адрес.'
            : 'Что-то пошло не так. Попробуйте обновить страницу.'}
        </p>
        <a 
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
        </a>
      </div>
    </div>
  )
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error

