export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

/**
 * POST /api/consent
 * Сохранение согласия пользователя (cookies, ПД)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, accepted, email, phone, bookingId } = body

    // Получаем IP и User-Agent
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 
               headersList.get('x-real-ip') || 
               'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'

    // Валидация типа согласия
    const validTypes = ['PERSONAL_DATA', 'MARKETING', 'COOKIES']
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Неверный тип согласия' },
        { status: 400 }
      )
    }

    // Создаём запись о согласии
    const consent = await prisma.consent.create({
      data: {
        type: type as 'PERSONAL_DATA' | 'MARKETING' | 'COOKIES',
        accepted: accepted === true,
        email: email || null,
        phone: phone || null,
        ip,
        userAgent,
        bookingId: bookingId || null,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: consent.id,
        type: consent.type,
        accepted: consent.accepted,
        acceptedAt: consent.acceptedAt,
      },
    })
  } catch (error) {
    console.error('Error saving consent:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка сохранения согласия' },
      { status: 500 }
    )
  }
}

