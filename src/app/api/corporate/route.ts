import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { corporateRequestSchema } from '@/lib/validators'

/**
 * POST /api/corporate
 * Создание корпоративной заявки
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = corporateRequestSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Неверные данные',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const {
      companyName,
      contactName,
      phone,
      email,
      guestsCount,
      checkIn,
      checkOut,
      message,
    } = validation.data

    // Создаём заявку
    const corporateRequest = await prisma.corporateRequest.create({
      data: {
        companyName,
        contactName,
        phone: phone.replace(/\D/g, ''),
        email: email.toLowerCase(),
        guestsCount: guestsCount || null,
        checkIn: checkIn || null,
        checkOut: checkOut || null,
        message: message || null,
        status: 'NEW',
      },
    })

    // TODO: Отправить уведомление в Telegram
    // TODO: Отправить email подтверждение клиенту

    return NextResponse.json({
      success: true,
      data: {
        requestId: corporateRequest.id,
        status: corporateRequest.status,
        message: 'Заявка успешно отправлена. Мы свяжемся с вами в ближайшее время.',
      },
    })
  } catch (error) {
    console.error('Error creating corporate request:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка отправки заявки' },
      { status: 500 }
    )
  }
}


