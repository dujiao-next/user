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
          {{ t('auth.register.title') }}
        </span>
      </div>

      <div class="theme-auth-card">
        <div class="mb-8 text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.22em] theme-text-accent">Dujiao-Next · D&N</p>
          <h1 class="mt-3 text-3xl font-black theme-text-primary">{{ t('auth.register.title') }}</h1>
          <p class="mt-2 text-sm theme-text-muted">{{ t('auth.register.subtitle') }}</p>
        </div>

        <form class="theme-auth-form" @submit.prevent="handleRegister">
          <div>
            <label class="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] theme-text-muted">
              {{ t('auth.register.emailLabel') }}
            </label>
            <input
              v-model="email"
              type="email"
              required
              class="w-full form-input-lg"
              :placeholder="t('auth.register.emailPlaceholder')"
            />
          </div>

          <div>
            <label class="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] theme-text-muted">
              {{ t('auth.register.passwordLabel') }}
            </label>
            <input
              v-model="password"
              type="password"
              required
              class="w-full form-input-lg"
              :placeholder="t('auth.register.passwordPlaceholder')"
            />
          </div>

          <div v-if="sendCodeCaptchaEnabled">
            <label class="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] theme-text-muted">
              {{ t('auth.common.captchaLabel') }}
            </label>
            <ImageCaptcha
              v-if="captchaProvider === 'image'"
              ref="imageCaptchaRef"
              v-model="captchaPayload"
              :disabled="sending || countdown > 0"
              @config-stale="handleCaptchaConfigStale"
            />
            <TurnstileCaptcha
              v-else-if="captchaProvider === 'turnstile'"
              ref="turnstileRef"
              v-model="turnstileToken"
              :site-key="turnstileSiteKey"
            />
          </div>

          <div>
            <label class="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] theme-text-muted">
              {{ t('auth.register.codeLabel') }}
            </label>
            <div class="flex flex-col gap-2 sm:flex-row">
              <input
                v-model="code"
                type="text"
                required
                class="min-w-0 flex-1 form-input-lg"
                :placeholder="t('auth.register.codePlaceholder')"
              />
              <button
                type="button"
                @click="handleSendCode"
                :disabled="sending || countdown > 0"
                class="whitespace-nowrap rounded-xl border theme-btn-secondary px-4 py-3 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                {{ countdown > 0 ? t('auth.common.countdown', { seconds: countdown }) : t('auth.common.sendCode') }}
              </button>
            </div>
          </div>

          <label class="flex items-start gap-3 rounded-xl border theme-surface-soft px-4 py-3 text-sm theme-text-secondary transition-colors">
            <input
              v-model="agreed"
              type="checkbox"
              class="mt-0.5 h-4 w-4 rounded border-gray-300 theme-accent-checkbox dark:border-white/20 dark:bg-black/20"
            />
            <span class="leading-6">
              {{ t('auth.register.agreementPrefix') }}
              <router-link to="/privacy" target="_blank" rel="noopener noreferrer" class="font-semibold theme-link">
                {{ t('footer.privacy') }}
              </router-link>
              {{ t('auth.register.agreementAnd') }}
              <router-link to="/terms" target="_blank" rel="noopener noreferrer" class="font-semibold theme-link">
                {{ t('footer.terms') }}
              </router-link>
            </span>
          </label>

          <div
            v-if="error"
            class="rounded-xl border theme-alert-danger px-4 py-3 text-center text-sm"
          >
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="userAuthStore.loading || !agreed"
            class="inline-flex w-full items-center justify-center rounded-xl theme-btn-primary px-4 py-3 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {{ userAuthStore.loading ? t('auth.register.creating') : t('auth.register.create') }}
          </button>
        </form>
      </div>

      <div class="mt-4 text-center">
        <router-link
          to="/auth/login"
          class="theme-link-muted text-sm"
        >
          {{ t('auth.register.hasAccount') }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserAuthStore } from '../../stores/userAuth'
import { useI18n } from 'vue-i18n'
import { debounceAsync } from '../../utils/debounce'
import { useAppStore } from '../../stores/app'
import type { CaptchaPayload } from '../../api'
import ImageCaptcha from '../../components/captcha/ImageCaptcha.vue'
import TurnstileCaptcha from '../../components/captcha/TurnstileCaptcha.vue'

const router = useRouter()
const userAuthStore = useUserAuthStore()
const appStore = useAppStore()
const { t } = useI18n()

const email = ref('')
const password = ref('')
const code = ref('')
const agreed = ref(false)
const error = ref('')
const sending = ref(false)
const countdown = ref(0)
const captchaPayload = ref<CaptchaPayload>({})
const turnstileToken = ref('')
const imageCaptchaRef = ref<InstanceType<typeof ImageCaptcha> | null>(null)
const turnstileRef = ref<InstanceType<typeof TurnstileCaptcha> | null>(null)
let timer: number | undefined

const captchaConfig = computed(() => appStore.config?.captcha || null)
const captchaProvider = computed(() => String(captchaConfig.value?.provider || 'none'))
const sendCodeCaptchaEnabled = computed(() => !!captchaConfig.value?.scenes?.register_send_code && captchaProvider.value !== 'none')
const turnstileSiteKey = computed(() => String(captchaConfig.value?.turnstile?.site_key || ''))

const startCountdown = () => {
  countdown.value = 60
  timer = window.setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0 && timer) {
      clearInterval(timer)
      timer = undefined
    }
  }, 1000)
}

const getCaptchaPayload = (): CaptchaPayload | undefined => {
  if (!sendCodeCaptchaEnabled.value) return undefined
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

const performSendCode = async () => {
  error.value = ''
  if (!email.value) {
    error.value = t('auth.register.errors.emailRequired')
    return
  }
  if (countdown.value > 0) return

  if (sendCodeCaptchaEnabled.value && captchaProvider.value === 'image') {
    if (!captchaPayload.value.captcha_id || !captchaPayload.value.captcha_code) {
      error.value = t('auth.common.captchaRequired')
      return
    }
  }
  if (sendCodeCaptchaEnabled.value && captchaProvider.value === 'turnstile') {
    if (!turnstileToken.value) {
      error.value = t('auth.common.captchaRequired')
      return
    }
  }

  sending.value = true
  try {
    await userAuthStore.sendVerifyCode({
      email: email.value,
      purpose: 'register',
      captcha_payload: getCaptchaPayload(),
    })
    startCountdown()
  } catch (err: any) {
    error.value = err.message || t('auth.register.errors.sendCodeFailed')
    if (captchaProvider.value === 'image') {
      imageCaptchaRef.value?.refresh()
    }
    if (captchaProvider.value === 'turnstile') {
      turnstileRef.value?.reset()
      turnstileToken.value = ''
    }
  } finally {
    sending.value = false
  }
}

const performRegister = async () => {
  error.value = ''
  if (!email.value || !password.value || !code.value) return
  if (!agreed.value) {
    error.value = t('auth.register.errors.agreementRequired')
    return
  }
  try {
    await userAuthStore.register({
      email: email.value,
      password: password.value,
      code: code.value,
      agreement_accepted: agreed.value,
    })
    router.push('/me/orders')
  } catch (err: any) {
    error.value = err.message || t('auth.register.errors.registerFailed')
  }
}

const handleSendCode = debounceAsync(performSendCode, 200)
const handleRegister = debounceAsync(performRegister, 200)

onMounted(async () => {
  await appStore.loadConfig(true)
})
</script>
