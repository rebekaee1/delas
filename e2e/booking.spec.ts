import { test, expect } from '@playwright/test'

test.describe('Booking Flow', () => {
  test('можно выбрать номер и перейти к бронированию', async ({ page }) => {
    await page.goto('/')
    
    // Находим карточку номера и кликаем "Забронировать"
    const bookButton = page.locator('a:has-text("Забронировать")').first()
    await bookButton.click()
    
    await expect(page).toHaveURL(/\/booking/)
  })

  test('форма бронирования отображается', async ({ page }) => {
    await page.goto('/booking')
    
    // Проверяем наличие основных элементов формы
    await expect(page.locator('text=Выберите тип номера')).toBeVisible()
    await expect(page.locator('text=Выберите даты')).toBeVisible()
    await expect(page.locator('text=Ваши данные')).toBeVisible()
  })

  test('можно выбрать тип номера', async ({ page }) => {
    await page.goto('/booking')
    
    // Кликаем на карточку Стандарт
    await page.click('text=Стандарт')
    
    // Проверяем что номер выбран (карточка должна получить border-terracotta)
    const selectedCard = page.locator('button:has-text("Стандарт")')
    await expect(selectedCard).toHaveClass(/border-terracotta/)
  })

  test('кнопка оплаты неактивна без заполнения формы', async ({ page }) => {
    await page.goto('/booking')
    
    const submitButton = page.locator('button:has-text("Перейти к оплате")')
    await expect(submitButton).toBeDisabled()
  })

  test('показывается предупреждение о согласии ПД', async ({ page }) => {
    await page.goto('/booking?room=standart')
    
    // Выбираем номер
    await page.click('text=Стандарт')
    
    // Выбираем даты (кликаем на календарь)
    await page.click('text=Дата заезда')
    // Выбираем завтрашний день
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    await page.click(`[aria-label="${tomorrow.getDate()}"]`)
    
    // Закрываем попап и открываем второй
    await page.click('text=Дата выезда')
    const dayAfter = new Date()
    dayAfter.setDate(dayAfter.getDate() + 3)
    await page.click(`[aria-label="${dayAfter.getDate()}"]`)

    // Заполняем данные
    await page.fill('input[name="guestName"]', 'Тест Тестов')
    await page.fill('input[name="guestPhone"]', '+79991234567')
    await page.fill('input[name="guestEmail"]', 'test@example.com')

    // Проверяем что есть предупреждение о согласии
    await expect(page.locator('text=необходимо дать согласие')).toBeVisible()
  })

  test('страница успешного бронирования загружается', async ({ page }) => {
    await page.goto('/booking/success?id=test-123')
    
    // Должна показаться страница с информацией
    await expect(page.locator('text=Загрузка')).toBeVisible()
  })

  test('страница отмены бронирования загружается', async ({ page }) => {
    await page.goto('/booking/cancel?id=test-123')
    
    await expect(page.locator('text=Оплата отменена')).toBeVisible()
  })
})

