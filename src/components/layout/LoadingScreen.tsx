'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface LoadingScreenProps {
  /** Минимальное время показа (мс) для плавности */
  minDuration?: number
  /** Контент загружен? */
  isReady?: boolean
}

export function LoadingScreen({ minDuration = 800, isReady = false }: LoadingScreenProps) {
  const [show, setShow] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)
  const [minTimeElapsed, setMinTimeElapsed] = useState(false)

  // Минимальное время показа для плавности
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true)
    }, minDuration)
    return () => clearTimeout(timer)
  }, [minDuration])

  // Скрываем когда и контент готов, и прошло минимальное время
  useEffect(() => {
    if (isReady && minTimeElapsed) {
      setFadeOut(true)
      const timer = setTimeout(() => {
        setShow(false)
      }, 500) // Длительность fade out анимации
      return () => clearTimeout(timer)
    }
  }, [isReady, minTimeElapsed])

  if (!show) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        background: 'linear-gradient(135deg, #2D2A26 0%, #3D3A36 50%, #2D2A26 100%)',
      }}
    >
      {/* Фоновый паттерн */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C4704A' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Анимированные круги на фоне */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-terracotta/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-terracotta/5 rounded-full blur-3xl animate-pulse delay-300" />
      </div>

      {/* Контент */}
      <div className="relative flex flex-col items-center gap-8">
        {/* Логотип с анимацией */}
        <div className="relative">
          {/* Свечение за логотипом */}
          <div className="absolute inset-0 bg-terracotta/20 blur-2xl rounded-full scale-150 animate-pulse" />
          
          {/* Логотип */}
          <div className="relative animate-fade-in-up">
            <Image
              src="/logo.png"
              alt="DELAS"
              width={180}
              height={60}
              priority
              className="h-16 w-auto drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Анимированный индикатор загрузки */}
        <div className="flex flex-col items-center gap-4">
          {/* Три точки */}
          <div className="flex gap-2">
            <div 
              className="w-3 h-3 bg-terracotta rounded-full animate-bounce"
              style={{ animationDelay: '0ms' }}
            />
            <div 
              className="w-3 h-3 bg-terracotta rounded-full animate-bounce"
              style={{ animationDelay: '150ms' }}
            />
            <div 
              className="w-3 h-3 bg-terracotta rounded-full animate-bounce"
              style={{ animationDelay: '300ms' }}
            />
          </div>
          
          {/* Текст */}
          <p className="text-sand-200 text-sm animate-pulse">
            Загружаем уют...
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Компактный лоадер для использования внутри страниц
 */
export function PageLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-terracotta border-t-transparent rounded-full animate-spin" />
        <p className="text-coal-light text-sm">Загрузка...</p>
      </div>
    </div>
  )
}

/**
 * Скелетон для карточек
 */
export function CardSkeleton() {
  return (
    <div className="card p-6 animate-pulse">
      <div className="aspect-[4/3] bg-sand-200 rounded-lg mb-4" />
      <div className="h-6 bg-sand-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-sand-200 rounded w-1/2 mb-4" />
      <div className="h-10 bg-sand-200 rounded" />
    </div>
  )
}

