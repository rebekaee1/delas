# 📧 Настройка Email для TimeWeb Cloud

## ❌ Проблема: TimeWeb блокирует SMTP

TimeWeb Cloud **блокирует исходящие SMTP-подключения** (порты 25, 465, 587) для предотвращения спама. Поэтому письма через `smtp.timeweb.ru` или любой другой внешний SMTP-сервер **не работают**.

### Ошибка которую ты видишь:
```json
{
  "code": "ETIMEDOUT",
  "command": "CONN",
  "message": "Connection timeout"
}
```

---

## ✅ Решение: Использовать Email API (не SMTP)

Вместо SMTP используй **Email API сервисы**, которые работают через HTTP (не блокируется):

---

## 🎯 Рекомендуемые сервисы

### 1. **Resend** (рекомендуется) ⭐
- **Бесплатно**: 100 писем/день, 3000/месяц
- **Простой API**: один HTTP запрос
- **Домен**: можно использовать свой домен или их тестовый
- **Регистрация**: https://resend.com

#### Установка:
```bash
npm install resend
```

#### Настройка в коде:
```typescript
// src/lib/email-resend.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmailViaResend(options: EmailOptions): Promise<boolean> {
  try {
    await resend.emails.send({
      from: 'Хостел DELAS <noreply@hostel-delas.ru>', // Нужно верифицировать домен
      to: options.to,
      subject: options.subject,
      html: options.html,
    })
    return true
  } catch (error) {
    console.error('Resend error:', error)
    return false
  }
}
```

#### Переменные окружения (TimeWeb):
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_PROVIDER=resend
```

---

### 2. **SendGrid** (популярный)
- **Бесплатно**: 100 писем/день
- **Регистрация**: https://sendgrid.com

#### Установка:
```bash
npm install @sendgrid/mail
```

#### Код:
```typescript
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export async function sendEmailViaSendGrid(options: EmailOptions): Promise<boolean> {
  try {
    await sgMail.send({
      from: 'info@hostel-delas.ru',
      to: options.to,
      subject: options.subject,
      html: options.html,
    })
    return true
  } catch (error) {
    console.error('SendGrid error:', error)
    return false
  }
}
```

#### Переменные:
```
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
EMAIL_PROVIDER=sendgrid
```

---

### 3. **Mailgun**
- **Бесплатно**: 5,000 писем/месяц первые 3 месяца
- **Регистрация**: https://mailgun.com

---

### 4. **AWS SES** (самый дешёвый на больших объёмах)
- **Цена**: $0.10 за 1000 писем
- **Требует**: AWS аккаунт

---

## 🔧 Как интегрировать в проект

### Шаг 1: Установи пакет
```bash
npm install resend
```

### Шаг 2: Создай файл `src/lib/email-api.ts`

```typescript
import { Resend } from 'resend'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'smtp' // 'resend', 'sendgrid', 'smtp'

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmailViaAPI(options: EmailOptions): Promise<boolean> {
  if (!resend) {
    console.warn('[Email API] Resend not configured')
    return false
  }

  try {
    console.log('[Email API] Sending via Resend:', options.to)
    
    const result = await resend.emails.send({
      from: 'Хостел DELAS <onboarding@resend.dev>', // Замени на свой домен после верификации
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })

    console.log('[Email API] ✅ Sent successfully:', result.data?.id)
    return true
  } catch (error) {
    console.error('[Email API] ❌ Failed:', error)
    return false
  }
}
```

### Шаг 3: Обнови `src/lib/email.ts`

Добавь в начало файла:
```typescript
import { sendEmailViaAPI } from './email-api'

const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'smtp'

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // Если настроен API-провайдер - используем его вместо SMTP
  if (EMAIL_PROVIDER === 'resend') {
    return sendEmailViaAPI(options)
  }
  
  // Fallback на SMTP (если настроен)
  if (!transporter) {
    console.warn('[Email] SMTP не настроен и API-провайдер не выбран')
    return false
  }

  // ... остальной код SMTP
}
```

### Шаг 4: Добавь переменные в TimeWeb

В настройках контейнера TimeWeb добавь:
```
RESEND_API_KEY=re_ваш_ключ_здесь
EMAIL_PROVIDER=resend
```

### Шаг 5: Пересобери и задеплой
```bash
git add .
git commit -m "Add Resend email API support"
git push origin main
```

---

## 📊 Сравнение сервисов

| Сервис | Бесплатно | Простота | Домен | Рейтинг |
|--------|-----------|----------|-------|---------|
| **Resend** | 3000/мес | ⭐⭐⭐⭐⭐ | Нужен свой | ⭐⭐⭐⭐⭐ |
| **SendGrid** | 100/день | ⭐⭐⭐⭐ | Любой | ⭐⭐⭐⭐ |
| **Mailgun** | 5000/мес (3мес) | ⭐⭐⭐ | Нужен свой | ⭐⭐⭐⭐ |
| **AWS SES** | $0.10/1000 | ⭐⭐ | Нужна верификация | ⭐⭐⭐ |

---

## 🚀 Быстрый старт с Resend

1. **Регистрация**: https://resend.com → Sign Up
2. **API Key**: Dashboard → API Keys → Create API Key
3. **Скопируй ключ**: `re_xxxxxxxxxxxxx`
4. **Добавь в TimeWeb**:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   EMAIL_PROVIDER=resend
   ```
5. **Установи в проекте**:
   ```bash
   npm install resend
   git add package.json package-lock.json
   git commit -m "Add resend dependency"
   git push
   ```
6. **Тестируй**: `/api/test-email?to=твой@email.com`

---

## ⚠️ Временное решение (пока нет API)

Сейчас работает **Telegram fallback**: если email не отправляется, уведомление приходит тебе в Telegram с данными гостя. Ты можешь отправить письмо вручную.

---

## 🆘 Нужна помощь?

Если хочешь чтобы я сразу интегрировал Resend/SendGrid — скажи, и я добавлю код за тебя! 

Просто выбери сервис и зарегистрируйся, дай мне API ключ — и я всё настрою.

