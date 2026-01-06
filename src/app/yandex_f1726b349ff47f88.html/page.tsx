// Статическая страница для верификации Яндекс.Вебмастера
// Не использует SSR, генерируется статически

export const dynamic = 'force-static'
export const revalidate = false

export default function YandexVerificationPage() {
  return (
    <html>
      <head>
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
      </head>
      <body>Verification: f1726b349ff47f88</body>
    </html>
  )
}

