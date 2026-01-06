export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

/**
 * GET /yandex_f1726b349ff47f88.html
 * Яндекс.Вебмастер верификация
 */
export async function GET() {
  const html = `<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    </head>
    <body>Verification: f1726b349ff47f88</body>
</html>`

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}

