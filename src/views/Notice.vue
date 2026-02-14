<template>
  <div
    class="notice-page min-h-screen theme-page pt-20 pb-16">
    <div class="container mx-auto px-4">
      <!-- Page Header -->
      <div class="mb-16 mt-12 text-center">
        <h1 class="text-4xl md:text-6xl font-black mb-6 tracking-tight theme-text-primary">{{ t('nav.notice') }}</h1>
        <p
          class="theme-text-secondary max-w-2xl mx-auto text-lg leading-relaxed border-b theme-border pb-8">
          {{ t('notice.subtitle') }}
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="space-y-4 max-w-4xl mx-auto">
        <div v-for="i in 6" :key="i"
          class="theme-surface-muted rounded-2xl h-32 animate-pulse border">
        </div>
      </div>

      <!-- Notices List -->
      <div v-else-if="notices.length > 0" class="max-w-4xl mx-auto space-y-4">
        <article v-for="notice in notices" :key="notice.id"
          class="group theme-panel backdrop-blur-xl border rounded-2xl p-6 md:p-8 transition-all duration-300 hover:-translate-x-1 hover:shadow-md cursor-pointer flex items-center gap-6"
          @click="goToNotice(notice.slug)">
          <!-- Icon Column -->
          <div
            class="hidden sm:flex flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden theme-surface-soft border theme-border items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
            <img v-if="notice.thumbnail" :src="getImageUrl(notice.thumbnail)" :alt="getLocalizedText(notice.title)"
              class="w-full h-full object-cover">
            <svg v-else class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-2">
              <span
                class="text-xs font-bold px-2 py-0.5 rounded text-blue-600 dark:text-blue-400 theme-surface-soft border theme-border uppercase tracking-wider">
                {{ t('nav.notice') }}
              </span>
              <time class="text-xs theme-text-muted font-mono">
                {{ formatDate(notice.created_at) }}
              </time>
            </div>

            <h2
              class="text-xl font-bold theme-text-primary group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate mb-1">
              {{ getLocalizedText(notice.title) }}
            </h2>

            <p class="theme-text-secondary text-sm line-clamp-1">
              {{ getLocalizedText(notice.summary) }}
            </p>
          </div>

          <!-- Arrow -->
          <div
            class="flex-shrink-0 theme-text-muted group-hover:text-gray-900 dark:group-hover:text-white transition-colors group-hover:translate-x-1 duration-300">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </article>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-16 flex justify-center">
          <nav
            class="flex items-center space-x-2 theme-panel-soft backdrop-blur-md p-2 rounded-2xl border">
            <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1"
              class="w-10 h-10 flex items-center justify-center rounded-xl border theme-btn-secondary transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <span class="px-4 py-2 font-mono theme-text-muted">
              <span class="theme-text-primary font-bold">{{ currentPage }}</span>
              <span class="mx-2 opacity-50">/</span>
              <span>{{ totalPages }}</span>
            </span>

            <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages"
              class="w-10 h-10 flex items-center justify-center rounded-xl border theme-btn-secondary transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </nav>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else
        class="text-center py-20 border theme-panel-soft rounded-2xl backdrop-blur-sm max-w-4xl mx-auto">
        <svg class="w-20 h-20 mx-auto theme-text-muted mb-6" fill="none" stroke="currentColor"
          viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <p class="theme-text-muted text-lg">
          {{ t('notice.empty') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '../stores/app'
import { postAPI } from '../api'
import { getImageUrl } from '../utils/image'
import { debounceAsync } from '../utils/debounce'

const router = useRouter()
const { t } = useI18n()
const appStore = useAppStore()

const loading = ref(true)
const notices = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)
const totalPages = ref(0)

const getLocalizedText = (jsonData: any) => {
  if (!jsonData) return ''
  const locale = appStore.locale
  return jsonData[locale] || jsonData['zh-CN'] || jsonData['en-US'] || ''
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString(appStore.locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const loadNotices = async () => {
  loading.value = true
  try {
    const response = await postAPI.list({
      type: 'notice',
      page: currentPage.value,
      page_size: pageSize.value,
    })
    notices.value = response.data.data || []
    if (response.data.pagination) {
      total.value = response.data.pagination.total || 0
      totalPages.value = response.data.pagination.total_page || 0
    }
  } catch (error) {
    console.error('Failed to load notices:', error)
  } finally {
    loading.value = false
  }
}

const debouncedLoadNotices = debounceAsync(loadNotices, 300)

const goToNotice = (slug: string) => {
  router.push(`/blog/${slug}`) // 使用同一个详情页
}

const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  debouncedLoadNotices()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  debouncedLoadNotices()
})

onUnmounted(() => {
  debouncedLoadNotices.cancel()
})
</script>

<style scoped>
.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  line-clamp: 1;
}
</style>
