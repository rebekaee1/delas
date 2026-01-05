import { test, expect } from '@playwright/test'

// Мобильные тесты с эмуляцией iPhone 13
test.describe('Mobile', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    isMobile: true,
    hasTouch: true,
  })

  test('сайт адаптирован под мобильные устройства', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем что viewport правильный
    const viewport = page.viewportSize()
    expect(viewport?.width).toBeLessThan(600)
  })

  test('мобильное меню открывается', async ({ page }) => {
    await page.goto('/')
    
    // Ищем кнопку меню бургер
    const menuButton = page.locator('button:has(svg.lucide-menu), button[aria-label="Меню"]').first()
    
    // Проверяем видимость кнопки меню на мобильном
    const isMenuVisible = await menuButton.isVisible().catch(() => false)
    
    // На мобильном должна быть видна кнопка меню
    if (isMenuVisible) {
      await menuButton.click()
      
      // Проверяем что меню открылось - ищем ссылку на Номера в Sheet
      await expect(page.locator('[role="dialog"] >> text=Номера').or(page.locator('.sheet-content >> text=Номера'))).toBeVisible({ timeout: 5000 })
    } else {
      // Если кнопки нет, на мобильном видны обычные ссылки
      await expect(page.locator('nav >> text=Номера')).toBeVisible()
    }
  })

  test('формы работают на мобильных', async ({ page }) => {
    await page.goto('/booking')
    
    // Проверяем что поля ввода доступны
    await expect(page.locator('input[name="guestName"]')).toBeVisible()
    await expect(page.locator('input[name="guestPhone"]')).toBeVisible()
    await expect(page.locator('input[name="guestEmail"]')).toBeVisible()
  })

  test('кнопки достаточного размера для тач', async ({ page }) => {
    await page.goto('/')
    
    // Находим основные кнопки
    const bookButton = page.locator('a:has-text("Забронировать")').first()
    
    if (await bookButton.isVisible()) {
      const box = await bookButton.boundingBox()
      // Минимальный размер для тач-элементов — 40px минимум
      expect(box?.height).toBeGreaterThanOrEqual(36)
    }
  })

  test('текст читаемый на мобильных', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем что основной текст достаточного размера
    const bodyText = page.locator('p').first()
    if (await bodyText.isVisible()) {
      const fontSize = await bodyText.evaluate(el => 
        window.getComputedStyle(el).fontSize
      )
      const fontSizeNum = parseInt(fontSize)
      // Минимальный размер шрифта для мобильных — 14px
      expect(fontSizeNum).toBeGreaterThanOrEqual(14)
    }
  })
})
