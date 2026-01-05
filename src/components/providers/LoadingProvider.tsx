'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { LoadingScreen } from '@/components/layout/LoadingScreen'

interface LoadingContextType {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: true,
  setIsLoading: () => {},
})

export function useLoading() {
  return useContext(LoadingContext)
}

interface LoadingProviderProps {
  children: ReactNode
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Проверяем, загружена ли страница полностью
    const handleLoad = () => {
      setIsReady(true)
    }

    // Если страница уже загружена
    if (document.readyState === 'complete') {
      // Небольшая задержка для загрузки изображений
      setTimeout(() => setIsReady(true), 100)
    } else {
      window.addEventListener('load', handleLoad)
    }

    // Также отслеживаем загрузку всех изображений
    const images = document.querySelectorAll('img')
    let loadedImages = 0
    const totalImages = images.length

    if (totalImages === 0) {
      setTimeout(() => setIsReady(true), 100)
    } else {
      images.forEach((img) => {
        if (img.complete) {
          loadedImages++
          if (loadedImages === totalImages) {
            setIsReady(true)
          }
        } else {
          img.addEventListener('load', () => {
            loadedImages++
            if (loadedImages === totalImages) {
              setIsReady(true)
            }
          })
          img.addEventListener('error', () => {
            loadedImages++
            if (loadedImages === totalImages) {
              setIsReady(true)
            }
          })
        }
      })
    }

    // Fallback: максимум 3 секунды ожидания
    const fallbackTimer = setTimeout(() => {
      setIsReady(true)
    }, 3000)

    return () => {
      window.removeEventListener('load', handleLoad)
      clearTimeout(fallbackTimer)
    }
  }, [])

  // После первой загрузки отключаем splash screen
  useEffect(() => {
    if (isReady && isInitialLoad) {
      const timer = setTimeout(() => {
        setIsInitialLoad(false)
        setIsLoading(false)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isReady, isInitialLoad])

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {/* Splash screen только при первой загрузке */}
      {isInitialLoad && <LoadingScreen isReady={isReady} minDuration={1000} />}
      {children}
    </LoadingContext.Provider>
  )
}

