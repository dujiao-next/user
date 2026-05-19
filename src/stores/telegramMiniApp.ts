import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { TelegramWebAppThemeParams } from '../types/telegram-webapp'
import {
  applyTelegramMiniAppDataset,
  applyTelegramMiniAppTheme,
  applyTelegramMiniAppViewport,
  createTelegramMiniAppSnapshot,
  getTelegramWebApp,
  initializeTelegramWebApp,
  isTelegramUrlEnvironment,
  loadTelegramWebAppScript,
  openTelegramCompatibleLink,
  readTelegramMiniAppSnapshot,
} from '../utils/telegramMiniApp'

export const useTelegramMiniAppStore = defineStore('telegram-mini-app', () => {
  const initialized = ref(false)
  const isMiniApp = ref(false)
  const isReady = ref(false)
  const initData = ref('')
  const initDataUnsafe = ref<Record<string, unknown>>({})
  const platform = ref('')
  const version = ref('')
  const colorScheme = ref('')
  const viewportHeight = ref(0)
  const viewportStableHeight = ref(0)
  const themeParams = ref<TelegramWebAppThemeParams>({})

  let routeBackHandler: (() => void) | null = null
  let customBackHandler: (() => void) | null = null
  let activeBackHandler: (() => void) | null = null

  const syncSnapshot = () => {
    const snapshot = readTelegramMiniAppSnapshot()
    isMiniApp.value = snapshot.isMiniApp
    isReady.value = snapshot.isReady
    initData.value = snapshot.initData
    initDataUnsafe.value = snapshot.initDataUnsafe
    platform.value = snapshot.platform
    version.value = snapshot.version
    colorScheme.value = snapshot.colorScheme
    viewportHeight.value = snapshot.viewportHeight
    viewportStableHeight.value = snapshot.viewportStableHeight
    themeParams.value = snapshot.themeParams

    applyTelegramMiniAppDataset(snapshot)
    applyTelegramMiniAppTheme(snapshot.themeParams, snapshot.colorScheme)
    applyTelegramMiniAppViewport(snapshot.viewportHeight, snapshot.viewportStableHeight)
  }

  const detachBackHandler = () => {
    const webApp = getTelegramWebApp()
    if (!webApp?.BackButton || !activeBackHandler) return
    webApp.BackButton.offClick(activeBackHandler)
    activeBackHandler = null
  }

  const applyBackButtonState = () => {
    const webApp = getTelegramWebApp()
    if (!webApp?.BackButton || !isMiniApp.value) return

    const nextHandler = customBackHandler || routeBackHandler
    detachBackHandler()
    if (!nextHandler) {
      webApp.BackButton.hide()
      return
    }

    activeBackHandler = nextHandler
    webApp.BackButton.onClick(nextHandler)
    webApp.BackButton.show()
  }

  const init = async () => {
    if (initialized.value) {
      syncSnapshot()
      applyBackButtonState()
      return
    }

    initialized.value = true

    // Only load the Telegram SDK script if we detect Telegram environment in the URL
    if (isTelegramUrlEnvironment()) {
      try {
        await loadTelegramWebAppScript()
      } catch {
        // Script failed to load — continue without Telegram features
        return
      }
    }

    let snapshot = initializeTelegramWebApp()
    isMiniApp.value = snapshot.isMiniApp
    isReady.value = snapshot.isReady
    initData.value = snapshot.initData
    initDataUnsafe.value = snapshot.initDataUnsafe
    platform.value = snapshot.platform
    version.value = snapshot.version
    colorScheme.value = snapshot.colorScheme
    viewportHeight.value = snapshot.viewportHeight
    viewportStableHeight.value = snapshot.viewportStableHeight
    themeParams.value = snapshot.themeParams

    // Some Telegram clients expose initData slightly later after the SDK is ready.
    if (isTelegramUrlEnvironment() && snapshot.initData === '') {
      const deadline = Date.now() + 1500
      while (Date.now() < deadline && initData.value === '') {
        await new Promise((resolve) => window.setTimeout(resolve, 100))
        snapshot = readTelegramMiniAppSnapshot()
        isMiniApp.value = snapshot.isMiniApp
        isReady.value = snapshot.isReady
        initData.value = snapshot.initData
        initDataUnsafe.value = snapshot.initDataUnsafe
        platform.value = snapshot.platform
        version.value = snapshot.version
        colorScheme.value = snapshot.colorScheme
        viewportHeight.value = snapshot.viewportHeight
        viewportStableHeight.value = snapshot.viewportStableHeight
        themeParams.value = snapshot.themeParams
      }
    }

    const webApp = getTelegramWebApp()
    if (!webApp || !snapshot.isMiniApp) {
      return
    }

    const handleThemeChanged = () => {
      syncSnapshot()
      applyBackButtonState()
    }
    const handleViewportChanged = () => {
      syncSnapshot()
    }

    webApp.onEvent?.('themeChanged', handleThemeChanged)
    webApp.onEvent?.('viewportChanged', handleViewportChanged)
    applyBackButtonState()
  }

  const syncRouteBackButton = (path: string, onBack: () => void) => {
    routeBackHandler = path === '/' ? null : onBack
    applyBackButtonState()
  }

  const setCustomBackButtonHandler = (handler: (() => void) | null) => {
    customBackHandler = handler
    applyBackButtonState()
  }

  const clearCustomBackButtonHandler = () => {
    customBackHandler = null
    applyBackButtonState()
  }

  const openLink = (url: string, options: { tryInstantView?: boolean } = {}) => {
    openTelegramCompatibleLink(url, options)
  }

  const reset = () => {
    const snapshot = createTelegramMiniAppSnapshot()
    isMiniApp.value = snapshot.isMiniApp
    isReady.value = snapshot.isReady
    initData.value = snapshot.initData
    initDataUnsafe.value = snapshot.initDataUnsafe
    platform.value = snapshot.platform
    version.value = snapshot.version
    colorScheme.value = snapshot.colorScheme
    viewportHeight.value = snapshot.viewportHeight
    viewportStableHeight.value = snapshot.viewportStableHeight
    themeParams.value = snapshot.themeParams
    routeBackHandler = null
    customBackHandler = null
    detachBackHandler()
    applyTelegramMiniAppDataset(snapshot)
    applyTelegramMiniAppTheme(snapshot.themeParams, snapshot.colorScheme)
    applyTelegramMiniAppViewport(snapshot.viewportHeight, snapshot.viewportStableHeight)
  }

  return {
    initialized,
    isMiniApp,
    isReady,
    initData,
    initDataUnsafe,
    platform,
    version,
    colorScheme,
    viewportHeight,
    viewportStableHeight,
    themeParams,
    init,
    openLink,
    reset,
    setCustomBackButtonHandler,
    clearCustomBackButtonHandler,
    syncRouteBackButton,
  }
})
