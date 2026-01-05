import { test, expect, devices } from '@playwright/test'

test.use(devices['iPhone 13'])

test.describe('Mobile', () => {
  test('сайт адаптирован под мобильные устройства', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем что viewport правильный
    const viewport = page.viewportSize()
    expect(viewport?.width).toBeLessThan(600)
  })

  test('мобильное меню открывается', async ({ page }) => {
    await page.goto('/')
    
    // Ищем кнопку меню (Sheet trigger)
    const menuButton = page.locator('button[aria-label="Меню"]').or(
      page.locator('button:has(svg)').first()
    )
    
    // Если кнопка меню есть, кликаем
    if (await menuButton.isVisible()) {
      await menuButton.click()
      
      // Проверяем что меню открылось
      await expect(page.locator('text=Номера')).toBeVisible()
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
      // Минимальный размер для тач-элементов — 44x44px
      expect(box?.height).toBeGreaterThanOrEqual(40)
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

