/**
 * Attribution трекинг - отслеживание пути пользователя от первого визита до покупки
 */

const FIRST_VISIT_KEY = 'delas_first_visit'
const ATTRIBUTION_KEY = 'delas_attribution'

interface AttributionData {
  firstVisit: number // timestamp первого визита
  source: string // источник трафика (UTM или referrer)
  landingPage: string // первая страница
  visits: number // количество визитов
}

/**
 * Инициализация attribution при первом визите
 */
export function initAttribution(): void {
  if (typeof window === 'undefined') return

  try {
    const existing = localStorage.getItem(ATTRIBUTION_KEY)
    
    if (!existing) {
      // Первый визит - сохраняем данные
      const attributionData: AttributionData = {
        firstVisit: Date.now(),
        source: getTrafficSource(),
        landingPage: window.location.pathname,
        visits: 1,
      }
      
      localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attributionData))
      console.log('[Attribution] First visit tracked:', attributionData)
    } else {
      // Повторный визит - увеличиваем счётчик
      const data: AttributionData = JSON.parse(existing)
      data.visits += 1
      localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(data))
      console.log('[Attribution] Return visit:', data.visits)
    }
  } catch (error) {
    console.error('[Attribution] Error:', error)
  }
}

/**
 * Получить данные attribution
 */
export function getAttributionData(): AttributionData | null {
  if (typeof window === 'undefined') return null

  try {
    const data = localStorage.getItem(ATTRIBUTION_KEY)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('[Attribution] Error reading data:', error)
    return null
  }
}

/**
 * Получить время от первого визита до покупки (в часах)
 */
export function getTimeToPurchase(): number | null {
  const data = getAttributionData()
  if (!data) return null

  const now = Date.now()
  const hours = (now - data.firstVisit) / (1000 * 60 * 60)
  return Math.round(hours * 10) / 10 // округляем до 1 знака
}

/**
 * Получить количество визитов до покупки
 */
export function getVisitsBeforePurchase(): number {
  const data = getAttributionData()
  return data?.visits || 0
}

/**
 * Определить источник трафика
 */
function getTrafficSource(): string {
  if (typeof window === 'undefined') return 'unknown'

  const params = new URLSearchParams(window.location.search)
  
  // UTM метки (если есть)
  const utmSource = params.get('utm_source')
  const utmMedium = params.get('utm_medium')
  const utmCampaign = params.get('utm_campaign')
  
  if (utmSource) {
    return `${utmSource}${utmMedium ? `/${utmMedium}` : ''}${utmCampaign ? `/${utmCampaign}` : ''}`
  }

  // Referrer (откуда пришёл)
  const referrer = document.referrer
  if (referrer) {
    try {
      const domain = new URL(referrer).hostname
      // Определяем известные источники
      if (domain.includes('google')) return 'google/organic'
      if (domain.includes('yandex')) return 'yandex/organic'
      if (domain.includes('vk.com')) return 'vk/social'
      if (domain.includes('facebook')) return 'facebook/social'
      if (domain.includes('instagram')) return 'instagram/social'
      return `referral/${domain}`
    } catch {
      return 'referral/unknown'
    }
  }

  // Прямой заход
  return 'direct'
}

/**
 * Очистить attribution после покупки (опционально)
 */
export function resetAttribution(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(ATTRIBUTION_KEY)
    console.log('[Attribution] Reset after purchase')
  } catch (error) {
    console.error('[Attribution] Error resetting:', error)
  }
}

/**
 * Получить полные данные attribution для отправки в Метрику
 */
export function getAttributionParams(): Record<string, any> {
  const data = getAttributionData()
  if (!data) return {}

  return {
    first_visit_source: data.source,
    first_visit_page: data.landingPage,
    visits_count: data.visits,
    time_to_purchase_hours: getTimeToPurchase(),
    days_to_purchase: Math.floor((Date.now() - data.firstVisit) / (1000 * 60 * 60 * 24)),
  }
}

