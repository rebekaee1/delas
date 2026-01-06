export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, testSMTPConnection } from '@/lib/email'

/**
 * GET /api/test-email?to=your@email.com
 * Тестовая отправка email для проверки SMTP настроек
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const toEmail = searchParams.get('to')
    const testConnection = searchParams.get('test') === 'true'

    // Если запрошена только проверка подключения
    if (testConnection) {
      const connectionTest = await testSMTPConnection()
      return NextResponse.json({
        ...connectionTest,
        timestamp: new Date().toISOString(),
      })
    }

    if (!toEmail) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Укажите email: /api/test-email?to=your@email.com или /api/test-email?test=true для проверки подключения',
          smtp: {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            user: process.env.SMTP_USER,
            passwordSet: !!process.env.SMTP_PASSWORD,
          }
        },
        { status: 400 }
      )
    }

    console.log('[Test Email] Testing email send to:', toEmail)
    
    // Сначала проверяем подключение
    const connectionTest = await testSMTPConnection()
    if (!connectionTest.success) {
      return NextResponse.json({
        success: false,
        error: 'SMTP подключение недоступно',
        connectionTest,
        timestamp: new Date().toISOString(),
      }, { status: 500 })
    }

    const success = await sendEmail({
      to: toEmail,
      subject: '✓ Тест email — Хостел DELAS',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 40px; background: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px;">
            <h1 style="color: #C4704A; margin: 0 0 20px;">✓ Email работает!</h1>
            <p>Это тестовое письмо с сервера хостела DELAS.</p>
            <p>Если вы его получили — значит SMTP настроен правильно.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #999; font-size: 14px;">
              Отправлено: ${new Date().toLocaleString('ru-RU')}
            </p>
          </div>
        </div>
      `,
      text: 'Email работает! SMTP настроен правильно.',
    })

    if (success) {
      return NextResponse.json({
        success: true,
        message: `Письмо успешно отправлено на ${toEmail}`,
        smtp: {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          user: process.env.SMTP_USER,
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Email не отправлен. Проверьте SMTP_PASSWORD в переменных окружения.',
        smtp: {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          user: process.env.SMTP_USER,
          passwordSet: !!process.env.SMTP_PASSWORD,
        }
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка отправки email',
        details: error instanceof Error ? error.message : String(error),
        smtp: {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          user: process.env.SMTP_USER,
          passwordSet: !!process.env.SMTP_PASSWORD,
        }
      },
      { status: 500 }
    )
  }
}

