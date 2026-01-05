/**
 * Скрипт для генерации OG-изображения
 * 
 * Требования:
 * 1. Запущенный dev-сервер: npm run dev
 * 2. Запуск скрипта: npx tsx scripts/generate-og-image.ts
 */

import { chromium } from 'playwright'
import path from 'path'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

async function generateOgImage() {
  console.log('🖼️  Генерация OG-изображения...')
  console.log(`📡 Подключение к ${BASE_URL}...`)

  const browser = await chromium.launch()
  const page = await browser.newPage()

  // Устанавливаем размер viewport для OG-изображения (1200x630)
  await page.setViewportSize({ width: 1200, height: 630 })

  try {
    // Открываем HTML страницу через dev-сервер
    await page.goto(`${BASE_URL}/og-image.html`, { waitUntil: 'networkidle' })
  } catch (error) {
    console.error('❌ Не удалось подключиться к серверу.')
    console.error('   Убедитесь, что dev-сервер запущен: npm run dev')
    await browser.close()
    process.exit(1)
  }

  // Ждём полной загрузки изображений
  await page.waitForTimeout(2000)

  // Путь для сохранения изображения
  const outputPath = path.join(process.cwd(), 'public', 'og-image.jpg')

  // Делаем скриншот
  await page.screenshot({
    path: outputPath,
    type: 'jpeg',
    quality: 90,
    clip: {
      x: 0,
      y: 0,
      width: 1200,
      height: 630,
    },
  })

  await browser.close()

  console.log('')
  console.log(`✅ OG-изображение успешно создано!`)
  console.log(`📁 Путь: ${outputPath}`)
  console.log('📐 Размер: 1200x630 пикселей')
  console.log('')
  console.log('Теперь это изображение будет отображаться при шаринге ссылки на сайт!')
}

generateOgImage().catch((error) => {
  console.error('Ошибка генерации:', error)
  process.exit(1)
})

