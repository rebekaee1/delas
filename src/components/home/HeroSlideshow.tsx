'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'

type HeroSlide = {
  src: string
  alt: string
}

interface HeroSlideshowProps {
  images: HeroSlide[]
  intervalMs?: number
}

const FADE_DURATION = 700

export function HeroSlideshow({ images, intervalMs = 4000 }: HeroSlideshowProps) {
  const slides = useMemo(() => images.filter(Boolean), [images])
  const [index, setIndex] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadedCount, setLoadedCount] = useState(0)

  const canAnimate = slides.length > 1 && intervalMs > 0

  // Начинаем слайдшоу только когда первое изображение загружено
  useEffect(() => {
    if (!canAnimate || !isLoaded) return
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length)
    }, intervalMs)
    return () => clearInterval(timer)
  }, [canAnimate, slides.length, intervalMs, isLoaded])

  const handleImageLoad = () => {
    setLoadedCount((prev) => {
      const newCount = prev + 1
      // Показываем контент когда загружено первое изображение
      if (newCount >= 1) {
        setIsLoaded(true)
      }
      return newCount
    })
  }

  if (!slides.length) return null

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Skeleton пока изображения загружаются */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-coal animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-tr from-coal from-20% via-coal-light via-50% to-coal-light to-90%" />
          {/* Индикатор загрузки */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-terracotta border-t-transparent rounded-full animate-spin" />
              <span className="text-sand-200 text-sm animate-pulse">Загрузка...</span>
            </div>
          </div>
        </div>
      )}

      {slides.map((slide, i) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fill
          priority={i === 0}
          onLoad={handleImageLoad}
          className={`object-cover transition-opacity duration-700 ease-in-out ${
            i === index && isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          sizes="100vw"
          style={{ transitionDuration: `${FADE_DURATION}ms` }}
        />
      ))}

      {/* Градиент для читаемости текста — сильное затемнение снизу-слева */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/90 from-20% via-black/50 via-50% to-transparent to-90%" />
    </div>
  )
}

