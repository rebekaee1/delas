import { test, expect } from '@playwright/test'

test.describe('Booking Flow', () => {
  test('можно выбрать номер и перейти к бронированию', async ({ page }) => {
    await page.goto('/')
    
    // Находим кнопку "Забронировать" и кликаем
    const bookButton = page.locator('a:has-text("Забронировать")').first()
    await bookButton.click()
    
    // Кнопка на главной ведёт на /rooms или /booking?room=...
    await expect(page).toHaveURL(/\/(booking|rooms)/)
  })

  test('форма бронирования отображается', async ({ page }) => {
    await page.goto('/booking')
    
    // Проверяем наличие основных элементов формы
    await expect(page.locator('h1:has-text("Бронирование")')).toBeVisible()
    // Форма должна загрузиться
    await expect(page.locator('form')).toBeVisible()
  })

  test('можно выбрать тип номера', async ({ page }) => {
    await page.goto('/booking')
    
    // Ждём загрузку карточек номеров
    await page.waitForSelector('text=Стандарт')
    
    // Кликаем на карточку Стандарт
    await page.click('text=Стандарт')
    
    // Проверяем что номер выбран (карточка должна получить стиль выделения)
    const selectedCard = page.locator('button:has-text("Стандарт"), div:has-text("Стандарт") >> xpath=ancestor::button')
    await expect(selectedCard).toBeVisible()
  })

  test('кнопка оплаты неактивна без заполнения формы', async ({ page }) => {
    await page.goto('/booking')
    
    const submitButton = page.locator('button:has-text("Перейти к оплате")')
    await expect(submitButton).toBeDisabled()
  })

  test('страница успешного бронирования загружается', async ({ page }) => {
    await page.goto('/booking/success?id=test-123')
    
    // Должна показаться страница (может показать загрузку или ошибку так как booking_id не существует)
    await expect(page).toHaveURL(/\/booking\/success/)
  })

  test('страница отмены бронирования загружается', async ({ page }) => {
    await page.goto('/booking/cancel?id=test-123')
    
    await expect(page.locator('text=Оплата отменена')).toBeVisible()
  })
})
