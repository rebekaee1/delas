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

  const canAnimate = slides.length > 1 && intervalMs > 0

  useEffect(() => {
    if (!canAnimate) return
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length)
    }, intervalMs)
    return () => clearInterval(timer)
  }, [canAnimate, slides.length, intervalMs])

  if (!slides.length) return null

  return (
    <div className="absolute inset-0 overflow-hidden">
      {slides.map((slide, i) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fill
          priority={i === 0}
          className={`object-cover transition-opacity duration-700 ease-in-out ${
            i === index ? 'opacity-100' : 'opacity-0'
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

