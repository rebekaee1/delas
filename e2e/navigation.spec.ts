import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('главная страница загружается', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/DELAS/i)
  })

  test('страница номеров доступна', async ({ page }) => {
    await page.goto('/rooms')
    await expect(page.locator('h1')).toContainText(/номера/i)
  })

  test('страница контактов доступна', async ({ page }) => {
    await page.goto('/contacts')
    await expect(page.locator('h1')).toContainText(/контакт/i)
  })

  test('страница бронирования доступна', async ({ page }) => {
    await page.goto('/booking')
    await expect(page.locator('h1')).toContainText(/бронирован/i)
  })

  test('страница для корпоративных клиентов доступна', async ({ page }) => {
    await page.goto('/corporate')
    await expect(page.locator('h1')).toContainText(/корпоратив/i)
  })

  test('политика конфиденциальности доступна', async ({ page }) => {
    await page.goto('/privacy')
    await expect(page.locator('h1')).toContainText(/конфиденциальност/i)
  })

  test('публичная оферта доступна', async ({ page }) => {
    await page.goto('/terms')
    await expect(page.locator('h1')).toContainText(/оферт/i)
  })

  test('страницы номеров открываются', async ({ page }) => {
    await page.goto('/rooms/standart')
    await expect(page.locator('h1')).toContainText(/стандарт/i)
  })

  test('навигация через меню работает', async ({ page }) => {
    await page.goto('/')
    
    // Клик по ссылке "Номера"
    await page.click('a:has-text("Номера")')
    await expect(page).toHaveURL(/\/rooms/)
  })
})

