<template>
  <div class="relative flex min-h-screen items-center justify-center theme-page px-4 py-16 sm:px-6">
    <div class="relative z-10 w-full max-w-lg">
      <div class="mb-4 flex items-center justify-between px-1">
        <router-link
          to="/"
          class="theme-nav-link rounded-full gap-1"
        >
          ← {{ t('auth.login.backHome') }}
        </router-link>
        <span class="rounded-full border theme-pill-neutral px-3 py-1 text-xs font-semibold">
          {{ t('navbar.personalCenter') }}
        </span>
      </div>

      <div class="theme-auth-card">
        <div class="mb-8 text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.22em] theme-text-accent">Dujiao-Next · D&N</p>
          <h1 class="mt-3 text-3xl font-black theme-text-primary">{{ t('auth.login.title') }}</h1>
          <p class="mt-2 text-sm theme-text-muted">{{ t('auth.login.subtitle') }}</p>
        </div>

        <form class="theme-auth-form" @submit.prevent="handleLogin">
          <div>
            <label class="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] theme-text-muted">
              {{ t('auth.login.emailLabel') }}
            </label>
            <input
              v-model="email"
              type="email"
              required
              class="w-full form-input-lg"
              :placeholder="t('auth.login.emailPlaceholder')"
            />
          </div>

          <div>
            <label class="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] theme-text-muted">
              {{ t('auth.login.passwordLabel') }}
            </label>
            <input
              v-model="password"
              type="password"
              required
              class="w-full form-input-lg"
              :placeholder="t('auth.login.passwordPlaceholder')"
            />
          </div>

          <div v-if="loginCaptchaEnabled">
            <label class="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] theme-text-muted">
              {{ t('auth.common.captchaLabel') }}
            </label>
            <ImageCaptcha
              v-if="captchaProvider === 'image'"
              ref="imageCaptchaRef"
              v-model="captchaPayload"
              :disabled="userAuthStore.loading"
              @config-stale="handleCaptchaConfigStale"
            />
            <TurnstileCaptcha
              v-else-if="captchaProvider === 'turnstile'"
              ref="turnstileRef"
              v-model="turnstileToken"
              :site-key="turnstileSiteKey"
            />
          </div>

          <div class="flex flex-wrap items-center justify-between gap-2 text-xs theme-text-muted">
            <label class="inline-flex items-center gap-2">
              <input v-model="rememberMe" type="checkbox" class="h-4 w-4 theme-accent-checkbox" />
              {{ t('auth.login.rememberMe') }}
            </label>
            <router-link
              to="/auth/forgot"
              class="font-medium theme-link-muted"
            >
              {{ t('auth.login.forgot') }}
            </router-link>
          </div>

          <div
            v-if="info"
            class="rounded-xl border theme-alert-success px-4 py-3 text-center text-sm"
          >
            {{ info }}
          </div>

          <div
            v-if="error"
            class="rounded-xl border theme-alert-danger px-4 py-3 text-center text-sm"
          >
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="userAuthStore.loading"
            class="inline-flex w-full items-center justify-center rounded-xl theme-btn-primary px-4 py-3 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {{ userAuthStore.loading ? t('auth.login.submitting') : t('auth.login.submit') }}
          </button>

          <div v-if="telegramEnabled" class="space-y-3 pt-1">
            <div class="flex items-center gap-3 text-[11px] uppercase tracking-[0.12em] theme-text-muted">
              <span class="h-px flex-1 border-t border-gray-200/80 dark:border-white/10"></span>
              <span>{{ t('auth.login.telegramOr') }}</span>
              <span class="h-px flex-1 border-t border-gray-200/80 dark:border-white/10"></span>
            </div>
            <div ref="telegramWidgetRef" class="flex justify-center"></div>
            <p class="text-center text-xs theme-text-muted">
              {{ t('auth.login.telegramHint') }}
            </p>
          </div>
        </form>
      </div>

      <div v-if="appStore.userRegistration" class="mt-4 text-center">
        <router-link
          to="/auth/register"
          class="theme-link-muted text-sm"
        >
          {{ t('auth.login.noAccount') }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserAuthStore } from '../../stores/userAuth'
import { useI18n } from 'vue-i18n'
import { debounceAsync } from '../../utils/debounce'
import { useAppStore } from '../../stores/app'
import type { CaptchaPayload, TelegramAuthPayload } from '../../api'
import ImageCaptcha from '../../components/captcha/ImageCaptcha.vue'
import TurnstileCaptcha from '../../components/captcha/TurnstileCaptcha.vue'

const router = useRouter()
const route = useRoute()
const userAuthStore = useUserAuthStore()
const appStore = useAppStore()
const { t } = useI18n()

const email = ref('')
const password = ref('')
const rememberMe = ref(true)
const error = ref('')
const info = ref('')
const captchaPayload = ref<CaptchaPayload>({})
const turnstileToken = ref('')
const imageCaptchaRef = ref<InstanceType<typeof ImageCaptcha> | null>(null)
const turnstileRef = ref<InstanceType<typeof TurnstileCaptcha> | null>(null)
const telegramWidgetRef = ref<HTMLDivElement | null>(null)

const captchaConfig = computed(() => appStore.config?.captcha || null)
const captchaProvider = computed(() => String(captchaConfig.value?.provider || 'none'))
const loginCaptchaEnabled = computed(() => !!captchaConfig.value?.scenes?.login && captchaProvider.value !== 'none')
const turnstileSiteKey = computed(() => String(captchaConfig.value?.turnstile?.site_key || ''))
const telegramConfig = computed(() => appStore.config?.telegram_auth || null)
const telegramBotUsername = computed(() => String(telegramConfig.value?.bot_username || '').trim())
const telegramEnabled = computed(() => !!telegramConfig.value?.enabled && telegramBotUsername.value !== '')
const telegramCallbackName = '__dujiaoUserTelegramLogin'

const getCaptchaPayload = (): CaptchaPayload | undefined => {
  if (!loginCaptchaEnabled.value) return undefined
  if (captchaProvider.value === 'image') {
    return {
      captcha_id: captchaPayload.value.captcha_id || '',
      captcha_code: captchaPayload.value.captcha_code || '',
    }
  }
  if (captchaProvider.value === 'turnstile') {
    return {
      turnstile_token: turnstileToken.value,
    }
  }
  return undefined
}

const handleCaptchaConfigStale = async () => {
  await appStore.loadConfig(true)
  captchaPayload.value = {}
  turnstileToken.value = ''
}

const performLogin = async () => {
  error.value = ''
  if (!email.value || !password.value) return

  if (loginCaptchaEnabled.value && captchaProvider.value === 'image') {
    if (!captchaPayload.value.captcha_id || !captchaPayload.value.captcha_code) {
      error.value = t('auth.common.captchaRequired')
      return
    }
  }

  if (loginCaptchaEnabled.value && captchaProvider.value === 'turnstile') {
    if (!turnstileToken.value) {
      error.value = t('auth.common.captchaRequired')
      return
    }
  }

  try {
    await userAuthStore.login({
      email: email.value,
      password: password.value,
      remember_me: rememberMe.value,
      captcha_payload: getCaptchaPayload(),
    })
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/me/orders'
    router.push(redirect)
  } catch (err: any) {
    error.value = err.message || t('auth.login.error')
    if (captchaProvider.value === 'image') {
      imageCaptchaRef.value?.refresh()
    }
    if (captchaProvider.value === 'turnstile') {
      turnstileRef.value?.reset()
      turnstileToken.value = ''
    }
  }
}

const handleLogin = debounceAsync(performLogin, 200)

const buildTelegramPayload = (raw: any): TelegramAuthPayload | null => {
  const id = Number(raw?.id)
  const authDate = Number(raw?.auth_date)
  const hash = String(raw?.hash || '').trim()
  if (!Number.isFinite(id) || id <= 0 || !Number.isFinite(authDate) || authDate <= 0 || hash === '') {
    return null
  }
  return {
    id,
    first_name: String(raw?.first_name || '').trim(),
    last_name: String(raw?.last_name || '').trim(),
    username: String(raw?.username || '').trim(),
    photo_url: String(raw?.photo_url || '').trim(),
    auth_date: authDate,
    hash,
  }
}

const handleTelegramAuth = async (raw: any) => {
  error.value = ''
  const payload = buildTelegramPayload(raw)
  if (!payload) {
    error.value = t('auth.login.telegramInvalidPayload')
    return
  }
  try {
    await userAuthStore.telegramLogin(payload)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/me/orders'
    router.push(redirect)
  } catch (err: any) {
    error.value = err.message || t('auth.login.telegramLoginFailed')
  }
}

const clearTelegramWidget = () => {
  if (telegramWidgetRef.value) {
    telegramWidgetRef.value.innerHTML = ''
  }
}

const renderTelegramWidget = () => {
  if (!telegramEnabled.value || !telegramWidgetRef.value) {
    clearTelegramWidget()
    return
  }
  clearTelegramWidget()
  const script = document.createElement('script')
  script.async = true
  script.src = 'https://telegram.org/js/telegram-widget.js?22'
  script.setAttribute('data-telegram-login', telegramBotUsername.value)
  script.setAttribute('data-size', 'large')
  script.setAttribute('data-userpic', 'false')
  script.setAttribute('data-request-access', 'write')
  script.setAttribute('data-onauth', `${telegramCallbackName}(user)`)
  script.onerror = () => {
    error.value = t('auth.login.telegramWidgetLoadFailed')
  }
  telegramWidgetRef.value.appendChild(script)
}

onMounted(async () => {
  await appStore.loadConfig(true)
  const win = window as Window & Record<string, any>
  win[telegramCallbackName] = handleTelegramAuth
  renderTelegramWidget()

  const reason = typeof route.query.reason === 'string' ? route.query.reason : ''
  if (reason === 'password_changed') {
    info.value = t('auth.login.passwordChangedTip')
    const nextQuery = { ...route.query }
    delete nextQuery.reason
    router.replace({ path: route.path, query: nextQuery })
  }
})

watch([telegramEnabled, telegramBotUsername], () => {
  renderTelegramWidget()
})

onUnmounted(() => {
  const win = window as Window & Record<string, any>
  delete win[telegramCallbackName]
  clearTelegramWidget()
})
</script>
