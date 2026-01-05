import type { AppProps } from 'next/app'

// Minimal _app for Pages Router compatibility
export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

