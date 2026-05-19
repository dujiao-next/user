import type { TelegramWebApp, TelegramWebAppThemeParams } from '../types/telegram-webapp'

const TELEGRAM_WEB_APP_SCRIPT_URL = 'https://telegram.org/js/telegram-web-app.js?61'
const TELEGRAM_ROOT_DATASET_KEY = 'telegramMiniApp'
const TELEGRAM_COLOR_SCHEME_DATASET_KEY = 'telegramColorScheme'
const TELEGRAM_PLATFORM_DATASET_KEY = 'telegramPlatform'

const TELEGRAM_THEME_VAR_MAP: Record<keyof TelegramWebAppThemeParams, string> = {
  bg_color: '--tg-theme-bg-color',
  secondary_bg_color: '--tg-theme-secondary-bg-color',
  text_color: '--tg-theme-text-color',
  hint_color: '--tg-theme-hint-color',
  link_color: '--tg-theme-link-color',
  button_color: '--tg-theme-button-color',
  button_text_color: '--tg-theme-button-text-color',
  header_bg_color: '--tg-theme-header-bg-color',
  accent_text_color: '--tg-theme-accent-text-color',
  section_bg_color: '--tg-theme-section-bg-color',
  section_header_text_color: '--tg-theme-section-header-text-color',
  subtitle_text_color: '--tg-theme-subtitle-text-color',
  destructive_text_color: '--tg-theme-destructive-text-color',
}

export interface TelegramMiniAppSnapshot {
  isMiniApp: boolean
  isReady: boolean
  initData: string
  initDataUnsafe: Record<string, unknown>
  platform: string
  version: string
  colorScheme: string
  viewportHeight: number
  viewportStableHeight: number
  themeParams: TelegramWebAppThemeParams
}

export const createTelegramMiniAppSnapshot = (): TelegramMiniAppSnapshot => ({
  isMiniApp: false,
  isReady: false,
  initData: '',
  initDataUnsafe: {},
  platform: '',
  version: '',
  colorScheme: '',
  viewportHeight: 0,
  viewportStableHeight: 0,
  themeParams: {},
})

export const getTelegramWebApp = (): TelegramWebApp | null => {
  if (typeof window === 'undefined') return null
  return window.Telegram?.WebApp ?? null
}

export const isTelegramMiniAppEnvironment = (): boolean => {
  const webApp = getTelegramWebApp()
  if (!webApp) return false
  return String(webApp.initData || '').trim() !== ''
}

export const readTelegramMiniAppSnapshot = (): TelegramMiniAppSnapshot => {
  const webApp = getTelegramWebApp()
  if (!webApp) {
    return createTelegramMiniAppSnapshot()
  }
  return {
    isMiniApp: isTelegramMiniAppEnvironment(),
    isReady: true,
    initData: String(webApp.initData || '').trim(),
    initDataUnsafe: (webApp.initDataUnsafe || {}) as Record<string, unknown>,
    platform: String(webApp.platform || '').trim(),
    version: String(webApp.version || '').trim(),
    colorScheme: String(webApp.colorScheme || '').trim(),
    viewportHeight: Number(webApp.viewportHeight || 0),
    viewportStableHeight: Number(webApp.viewportStableHeight || 0),
    themeParams: { ...(webApp.themeParams || {}) },
  }
}

export const applyTelegramMiniAppTheme = (themeParams: TelegramWebAppThemeParams, colorScheme = '') => {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.dataset[TELEGRAM_COLOR_SCHEME_DATASET_KEY] = colorScheme || ''

  Object.entries(TELEGRAM_THEME_VAR_MAP).forEach(([key, cssVarName]) => {
    const value = themeParams[key as keyof TelegramWebAppThemeParams]
    if (typeof value === 'string' && value.trim() !== '') {
      root.style.setProperty(cssVarName, value.trim())
      return
    }
    root.style.removeProperty(cssVarName)
  })
}

export const applyTelegramMiniAppViewport = (viewportHeight = 0, viewportStableHeight = 0) => {
  if (typeof document === 'undefined') return
  const root = document.documentElement

  if (viewportHeight > 0) {
    root.style.setProperty('--tg-viewport-height', `${viewportHeight}px`)
  } else {
    root.style.setProperty('--tg-viewport-height', '100vh')
  }

  if (viewportStableHeight > 0) {
    root.style.setProperty('--tg-viewport-stable-height', `${viewportStableHeight}px`)
  } else {
    root.style.setProperty('--tg-viewport-stable-height', '100vh')
  }
}

export const applyTelegramMiniAppDataset = (snapshot: TelegramMiniAppSnapshot) => {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.dataset[TELEGRAM_ROOT_DATASET_KEY] = snapshot.isMiniApp ? 'true' : 'false'
  root.dataset[TELEGRAM_PLATFORM_DATASET_KEY] = snapshot.platform || ''
  root.dataset[TELEGRAM_COLOR_SCHEME_DATASET_KEY] = snapshot.colorScheme || ''
}

export const initializeTelegramWebApp = (): TelegramMiniAppSnapshot => {
  const initialSnapshot = readTelegramMiniAppSnapshot()
  applyTelegramMiniAppDataset(initialSnapshot)
  applyTelegramMiniAppTheme(initialSnapshot.themeParams, initialSnapshot.colorScheme)
  applyTelegramMiniAppViewport(initialSnapshot.viewportHeight, initialSnapshot.viewportStableHeight)

  const webApp = getTelegramWebApp()
  if (!webApp) {
    return initialSnapshot
  }

  // Always call ready() when webApp exists — on some Telegram platforms,
  // initData is not populated until after ready() is invoked.
  webApp.ready()
  webApp.expand?.()

  const finalSnapshot = readTelegramMiniAppSnapshot()
  applyTelegramMiniAppDataset(finalSnapshot)
  applyTelegramMiniAppTheme(finalSnapshot.themeParams, finalSnapshot.colorScheme)
  applyTelegramMiniAppViewport(finalSnapshot.viewportHeight, finalSnapshot.viewportStableHeight)
  return finalSnapshot
}

export const openTelegramCompatibleLink = (url: string, options: { tryInstantView?: boolean } = {}) => {
  const target = String(url || '').trim()
  if (!target) return

  const webApp = getTelegramWebApp()
  if (webApp?.openLink) {
    webApp.openLink(target, { try_instant_view: options.tryInstantView === true })
    return
  }

  if (typeof window !== 'undefined') {
    window.open(target, '_blank', 'noopener')
  }
}


export const isTelegramUrlEnvironment = (): boolean => {
  if (typeof window === 'undefined') return false
  // Telegram may append WebApp parameters to either the query string or hash.
  const url = `${window.location.search || ''}${window.location.hash || ''}`
  return url.includes('tgWebAppData') || url.includes('tgWebAppVersion') || url.includes('tgWebAppPlatform')
}

let scriptLoadPromise: Promise<void> | null = null


const TELEGRAM_SCRIPT_TIMEOUT_MS = 3000

export const loadTelegramWebAppScript = (): Promise<void> => {
  if (getTelegramWebApp()) return Promise.resolve()
  if (scriptLoadPromise) return scriptLoadPromise

  scriptLoadPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = TELEGRAM_WEB_APP_SCRIPT_URL

    let settled = false
    const settle = (fn: () => void) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      fn()
    }

    const timer = setTimeout(() => {
      settle(() => {
        scriptLoadPromise = null
        reject(new Error('Telegram Web App script load timed out'))
      })
    }, TELEGRAM_SCRIPT_TIMEOUT_MS)

    script.onload = () => settle(resolve)
    script.onerror = () => {
      settle(() => {
        scriptLoadPromise = null
        reject(new Error('Failed to load Telegram Web App script'))
      })
    }
    document.head.appendChild(script)
  })

  return scriptLoadPromise
}

export const buildTelegramMiniAppEntryLink = (botUsername: string, miniAppURL: string) => {
  const normalizedBotUsername = String(botUsername || '').trim().replace(/^@+/, '')
  const normalizedMiniAppURL = String(miniAppURL || '').trim()
  if (normalizedBotUsername === '' || normalizedMiniAppURL === '') {
    return ''
  }
  return `https://t.me/${normalizedBotUsername}/webapp`
}
