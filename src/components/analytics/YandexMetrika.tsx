'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'

const YM_ID = process.env.NEXT_PUBLIC_YM_ID || '106156010'

/**
 * Яндекс.Метрика - компонент для аналитики
 * Добавьте YM_ID в .env.local:
 * NEXT_PUBLIC_YM_ID=12345678
 */

function YandexMetrikaTracking() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    if (YM_ID && typeof window !== 'undefined' && window.ym) {
      // Отправляем событие просмотра страницы
      const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
      window.ym(Number(YM_ID), 'hit', url)
    }
  }, [pathname, searchParams])
  
  return null
}

export function YandexMetrika() {
  if (!YM_ID) {
    return null // Не рендерим если нет ID
  }

  return (
    <>
      <Script id="yandex-metrika" strategy="afterInteractive">
        {`
          (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
          (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

          ym(${YM_ID}, "init", {
            clickmap:true,
            trackLinks:true,
            accurateTrackBounce:true,
            webvisor:true,
            ecommerce:"dataLayer",
            trackHash:true
          });
        `}
      </Script>
      <noscript>
        <div>
          <img 
            src={`https://mc.yandex.ru/watch/${YM_ID}`} 
            style={{ position: 'absolute', left: '-9999px' }} 
            alt="" 
          />
        </div>
      </noscript>
      <Suspense fallback={null}>
        <YandexMetrikaTracking />
      </Suspense>
    </>
  )
}

// Типизация для глобального объекта window
declare global {
  interface Window {
    ym: (
      id: number,
      method: string,
      ...args: unknown[]
    ) => void
  }
}

