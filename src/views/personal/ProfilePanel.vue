<template>
  <div class="theme-personal-card">
    <div class="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 class="text-xl font-bold theme-text-primary">{{ t('personalCenter.profile.title') }}</h2>
        <p class="mt-1 text-sm theme-text-muted">{{ t('personalCenter.profile.subtitle') }}</p>
      </div>
      <span class="theme-badge theme-badge-accent px-3 py-1 text-xs font-semibold">
        {{ t('personalCenter.tabs.profile') }}
      </span>
    </div>

    <div v-if="profileAlert" class="mb-5 rounded-xl border px-4 py-3 text-sm shadow-sm" :class="pageAlertClass(profileAlert.level)">
      {{ profileAlert.message }}
    </div>

    <form class="space-y-6" @submit.prevent="handleSaveProfile">
      <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div class="md:col-span-2">
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">{{ t('personalCenter.profile.emailLabel') }}</label>
          <input
            :value="userProfileStore.profile?.email || ''"
            disabled
            class="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-gray-500 dark:border-white/10 dark:bg-white/5"
          />
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">{{ t('personalCenter.profile.nicknameLabel') }}</label>
          <input
            v-model="profileForm.nickname"
            :placeholder="t('personalCenter.profile.nicknamePlaceholder')"
            class="w-full form-input-lg"
          />
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">{{ t('personalCenter.profile.localeLabel') }}</label>
          <select
            v-model="profileForm.locale"
            class="w-full form-input-lg"
          >
            <option value="zh-CN">简体中文</option>
            <option value="zh-TW">繁體中文</option>
            <option value="en-US">English</option>
          </select>
        </div>
      </div>

      <div class="flex flex-col gap-3 border-t border-gray-200/70 pt-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-xs theme-text-muted">{{ t('personalCenter.profile.subtitle') }}</p>
        <button
          type="submit"
          :disabled="userProfileStore.savingProfile"
          class="inline-flex items-center justify-center rounded-xl theme-btn-primary px-6 py-3 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ userProfileStore.savingProfile ? t('personalCenter.profile.saving') : t('personalCenter.profile.save') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { pageAlertClass, type PageAlert } from '../../utils/alerts'
import { useUserProfileStore } from '../../stores/userProfile'

const { t } = useI18n()
const userProfileStore = useUserProfileStore()

const profileForm = reactive({
  nickname: '',
  locale: 'zh-CN',
})

const profileAlert = ref<PageAlert | null>(null)

const handleSaveProfile = async () => {
  profileAlert.value = null
  const payload = {
    nickname: profileForm.nickname.trim(),
    locale: profileForm.locale,
  }
  const ok = await userProfileStore.saveProfile(payload)
  if (!ok) {
    profileAlert.value = {
      level: 'error',
      message: userProfileStore.profileError || t('personalCenter.common.saveFailed'),
    }
    return
  }
  profileAlert.value = {
    level: 'success',
    message: t('personalCenter.profile.saveSuccess'),
  }
}

watch(
  () => userProfileStore.profile,
  (profile) => {
    if (!profile) return
    profileForm.nickname = profile.nickname || ''
    profileForm.locale = profile.locale || 'zh-CN'
  },
  { immediate: true }
)
</script>
