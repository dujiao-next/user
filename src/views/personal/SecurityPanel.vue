<template>
  <div class="space-y-6">
    <div class="theme-personal-card">
      <div class="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 class="text-xl font-bold theme-text-primary">{{ t('personalCenter.security.title') }}</h2>
          <p class="mt-1 text-sm theme-text-muted">{{ t('personalCenter.security.subtitle') }}</p>
        </div>
        <span class="theme-badge theme-badge-accent px-3 py-1 text-xs font-semibold">
          {{ t('personalCenter.tabs.security') }}
        </span>
      </div>

      <div v-if="securityAlert" class="mb-5 rounded-xl border px-4 py-3 text-sm shadow-sm" :class="pageAlertClass(securityAlert.level)">
        {{ securityAlert.message }}
      </div>

      <form class="space-y-6" @submit.prevent="handleChangeEmail">
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">{{ t('personalCenter.security.currentEmailLabel') }}</label>
          <input
            :value="userProfileStore.profile?.email || ''"
            disabled
            class="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-gray-500 dark:border-white/10 dark:bg-white/5"
          />
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">{{ t('personalCenter.security.newEmailLabel') }}</label>
          <input
            v-model="securityForm.newEmail"
            type="email"
            :placeholder="t('personalCenter.security.newEmailPlaceholder')"
            class="w-full form-input-lg"
          />
        </div>

        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">{{ t('personalCenter.security.oldCodeLabel') }}</label>
            <div class="flex flex-col gap-2 sm:flex-row">
              <input
                v-model="securityForm.oldCode"
                :placeholder="t('personalCenter.security.codePlaceholder')"
                class="min-w-0 flex-1 form-input-lg"
              />
              <button
                type="button"
                @click="handleSendOldCode"
                :disabled="userProfileStore.sendingCode || oldCodeCooldown > 0"
                class="whitespace-nowrap rounded-xl border theme-btn-secondary px-4 py-3 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {{ oldCodeCooldown > 0 ? t('personalCenter.security.countdown', { seconds: oldCodeCooldown }) : t('personalCenter.security.sendOldCode') }}
              </button>
            </div>
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">{{ t('personalCenter.security.newCodeLabel') }}</label>
            <div class="flex flex-col gap-2 sm:flex-row">
              <input
                v-model="securityForm.newCode"
                :placeholder="t('personalCenter.security.codePlaceholder')"
                class="min-w-0 flex-1 form-input-lg"
              />
              <button
                type="button"
                @click="handleSendNewCode"
                :disabled="userProfileStore.sendingCode || newCodeCooldown > 0"
                class="whitespace-nowrap rounded-xl border theme-btn-secondary px-4 py-3 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {{ newCodeCooldown > 0 ? t('personalCenter.security.countdown', { seconds: newCodeCooldown }) : t('personalCenter.security.sendNewCode') }}
              </button>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-200/70 pt-5 dark:border-white/10">
          <button
            type="submit"
            :disabled="userProfileStore.changingEmail"
            class="inline-flex items-center justify-center rounded-xl theme-btn-primary px-6 py-3 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ userProfileStore.changingEmail ? t('personalCenter.security.submitting') : t('personalCenter.security.submit') }}
          </button>
        </div>
      </form>
    </div>

    <div class="theme-personal-card">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-lg font-bold theme-text-primary">{{ t('personalCenter.security.loginLogsTitle') }}</h3>
        <span class="text-xs theme-text-muted">{{ t('personalCenter.security.loginLogsTip') }}</span>
      </div>
      <div v-if="userProfileStore.loadingLoginLogs" class="rounded-xl border border-gray-200/70 px-4 py-6 text-center text-sm text-gray-500 dark:border-white/10 dark:text-gray-400">
        {{ t('personalCenter.security.loginLogsLoading') }}
      </div>
      <div v-else-if="userProfileStore.recentLoginLogs.length === 0" class="rounded-xl border border-dashed border-gray-200/80 px-4 py-6 text-center text-sm text-gray-500 dark:border-white/10 dark:text-gray-400">
        {{ t('personalCenter.security.loginLogsEmpty') }}
      </div>
      <div v-else class="overflow-x-auto rounded-xl border border-gray-200/70 dark:border-white/10">
        <table class="min-w-full divide-y divide-gray-200 text-left text-sm dark:divide-white/10">
          <thead class="bg-gray-50/80 text-xs uppercase tracking-wide text-gray-500 dark:bg-white/5 dark:text-gray-400">
            <tr>
              <th class="px-4 py-3 font-semibold">{{ t('personalCenter.security.loginLogsTime') }}</th>
              <th class="px-4 py-3 font-semibold">{{ t('personalCenter.security.loginLogsStatus') }}</th>
              <th class="px-4 py-3 font-semibold">{{ t('personalCenter.security.loginLogsIp') }}</th>
              <th class="px-4 py-3 font-semibold">{{ t('personalCenter.security.loginLogsReason') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-white/10">
            <tr v-for="item in userProfileStore.recentLoginLogs" :key="item.id">
              <td class="px-4 py-3 text-gray-600 dark:text-gray-300">{{ formatDate(item.created_at) }}</td>
              <td class="px-4 py-3">
                <span class="theme-badge px-2.5 py-1 text-xs font-semibold" :class="loginStatusClass(item.status)">
                  {{ loginStatusLabel(item.status) }}
                </span>
              </td>
              <td class="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-300">{{ item.client_ip || '-' }}</td>
              <td class="px-4 py-3 text-xs theme-text-muted">{{ loginReasonLabel(item.fail_reason) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="theme-personal-card">
      <h3 class="text-lg font-bold theme-text-primary">{{ t('personalCenter.security.passwordTitle') }}</h3>
      <p class="mt-1 text-sm theme-text-muted">{{ t('personalCenter.security.passwordSubtitle') }}</p>

      <form class="mt-6 space-y-6" @submit.prevent="handleChangePassword">
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">{{ t('personalCenter.security.currentPasswordLabel') }}</label>
          <input
            v-model="passwordForm.oldPassword"
            type="password"
            :placeholder="t('personalCenter.security.passwordPlaceholder')"
            class="w-full form-input-lg"
          />
        </div>

        <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">{{ t('personalCenter.security.newPasswordLabel') }}</label>
            <input
              v-model="passwordForm.newPassword"
              type="password"
              :placeholder="t('personalCenter.security.passwordPlaceholder')"
              class="w-full form-input-lg"
            />
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">{{ t('personalCenter.security.confirmPasswordLabel') }}</label>
            <input
              v-model="passwordForm.confirmPassword"
              type="password"
              :placeholder="t('personalCenter.security.passwordPlaceholder')"
              class="w-full form-input-lg"
            />
          </div>
        </div>

        <div class="border-t border-gray-200/70 pt-5 dark:border-white/10">
          <button
            type="submit"
            :disabled="userProfileStore.changingPassword"
            class="inline-flex items-center justify-center rounded-xl border theme-btn-secondary px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ userProfileStore.changingPassword ? t('personalCenter.security.changePasswordSubmitting') : t('personalCenter.security.changePassword') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { pageAlertClass, type PageAlert } from '../../utils/alerts'
import { useUserProfileStore } from '../../stores/userProfile'
import { useUserAuthStore } from '../../stores/userAuth'

const { t } = useI18n()
const userProfileStore = useUserProfileStore()
const userAuthStore = useUserAuthStore()

const securityForm = reactive({
  newEmail: '',
  oldCode: '',
  newCode: '',
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const securityAlert = ref<PageAlert | null>(null)
const oldCodeCooldown = ref(0)
const newCodeCooldown = ref(0)
let cooldownTimer: number | null = null

const startCooldown = (kind: 'old' | 'new') => {
  if (kind === 'old') {
    oldCodeCooldown.value = 60
  } else {
    newCodeCooldown.value = 60
  }
  if (cooldownTimer !== null) return
  cooldownTimer = window.setInterval(() => {
    if (oldCodeCooldown.value > 0) {
      oldCodeCooldown.value -= 1
    }
    if (newCodeCooldown.value > 0) {
      newCodeCooldown.value -= 1
    }
    if (oldCodeCooldown.value === 0 && newCodeCooldown.value === 0 && cooldownTimer !== null) {
      window.clearInterval(cooldownTimer)
      cooldownTimer = null
    }
  }, 1000)
}

const handleSendOldCode = async () => {
  securityAlert.value = null
  const ok = await userProfileStore.sendChangeEmailCode({ kind: 'old' })
  if (!ok) {
    securityAlert.value = {
      level: 'error',
      message: userProfileStore.securityError || t('personalCenter.security.sendCodeFailed'),
    }
    return
  }
  startCooldown('old')
  securityAlert.value = {
    level: 'success',
    message: t('personalCenter.security.sendOldCodeSuccess'),
  }
}

const handleSendNewCode = async () => {
  securityAlert.value = null
  const newEmail = securityForm.newEmail.trim()
  if (!newEmail) {
    securityAlert.value = {
      level: 'warning',
      message: t('personalCenter.security.newEmailRequired'),
    }
    return
  }
  const ok = await userProfileStore.sendChangeEmailCode({ kind: 'new', new_email: newEmail })
  if (!ok) {
    securityAlert.value = {
      level: 'error',
      message: userProfileStore.securityError || t('personalCenter.security.sendCodeFailed'),
    }
    return
  }
  startCooldown('new')
  securityAlert.value = {
    level: 'success',
    message: t('personalCenter.security.sendNewCodeSuccess'),
  }
}

const handleChangeEmail = async () => {
  securityAlert.value = null
  const payload = {
    new_email: securityForm.newEmail.trim(),
    old_code: securityForm.oldCode.trim(),
    new_code: securityForm.newCode.trim(),
  }
  if (!payload.new_email || !payload.old_code || !payload.new_code) {
    securityAlert.value = {
      level: 'warning',
      message: t('personalCenter.security.changeEmailRequired'),
    }
    return
  }

  const ok = await userProfileStore.changeEmail(payload)
  if (!ok) {
    securityAlert.value = {
      level: 'error',
      message: userProfileStore.securityError || t('personalCenter.security.changeEmailFailed'),
    }
    return
  }

  securityForm.newEmail = ''
  securityForm.oldCode = ''
  securityForm.newCode = ''
  oldCodeCooldown.value = 0
  newCodeCooldown.value = 0
  securityAlert.value = {
    level: 'success',
    message: t('personalCenter.security.changeEmailSuccess'),
  }
}

const handleChangePassword = async () => {
  securityAlert.value = null
  const oldPassword = passwordForm.oldPassword.trim()
  const newPassword = passwordForm.newPassword.trim()
  const confirmPassword = passwordForm.confirmPassword.trim()

  if (!oldPassword || !newPassword || !confirmPassword) {
    securityAlert.value = {
      level: 'warning',
      message: t('personalCenter.security.changePasswordRequired'),
    }
    return
  }

  if (newPassword !== confirmPassword) {
    securityAlert.value = {
      level: 'warning',
      message: t('personalCenter.security.passwordMismatch'),
    }
    return
  }

  const ok = await userProfileStore.changePassword({
    old_password: oldPassword,
    new_password: newPassword,
  })

  if (!ok) {
    securityAlert.value = {
      level: 'error',
      message: userProfileStore.securityError || t('personalCenter.security.changePasswordFailed'),
    }
    return
  }

  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  securityAlert.value = {
    level: 'success',
    message: t('personalCenter.security.changePasswordSuccess'),
  }

  userAuthStore.logout('/auth/login?reason=password_changed')
}

const loginStatusLabel = (status?: string) => {
  const normalized = (status || '').trim() || 'failed'
  return t(`personalCenter.security.loginLogsStatusMap.${normalized}`)
}

const loginStatusClass = (status?: string) => {
  if ((status || '').trim() === 'success') {
    return 'theme-badge-success'
  }
  return 'theme-badge-danger'
}

const loginReasonLabel = (reason?: string) => {
  const normalized = (reason || '').trim()
  if (!normalized) return '-'
  const key = `personalCenter.security.loginLogsReasonMap.${normalized}`
  const translated = t(key)
  return translated === key ? normalized : translated
}

const formatDate = (raw?: string) => {
  if (!raw) return ''
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return raw
  return date.toLocaleString()
}

onMounted(() => {
  userProfileStore.loadRecentLoginLogs(10)
})

onUnmounted(() => {
  if (cooldownTimer !== null) {
    window.clearInterval(cooldownTimer)
    cooldownTimer = null
  }
})
</script>
