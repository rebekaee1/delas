import { Html, Head, Main, NextScript } from 'next/document'

// Minimal _document for Pages Router compatibility
export default function Document() {
  return (
    <Html lang="ru">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

