<template>
  <div class="relative min-h-screen overflow-hidden theme-page pt-24 pb-16">
    <div class="container relative z-10 mx-auto px-4">
      <header class="mb-8 rounded-3xl border theme-panel-soft p-6 shadow-xl backdrop-blur-sm lg:p-8">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.24em] theme-text-accent">
              {{ t('personalCenter.title') }}
            </p>
            <h1 class="mt-3 text-3xl font-black theme-text-primary lg:text-[2.1rem]">{{ userProfileStore.displayName }}</h1>
            <p class="mt-2 text-sm theme-text-muted">{{ t('personalCenter.subtitle') }}</p>
          </div>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:w-auto">
            <div class="rounded-2xl border theme-surface-soft px-4 py-3">
              <p class="text-[11px] uppercase tracking-[0.16em] text-gray-400">{{ t('personalCenter.tabs.overview') }}</p>
              <p class="mt-2 text-sm font-semibold theme-text-secondary">{{ currentSectionLabel }}</p>
            </div>
            <div class="rounded-2xl border theme-surface-soft px-4 py-3">
              <p class="text-[11px] uppercase tracking-[0.16em] text-gray-400">{{ t('personalCenter.tabs.orders') }}</p>
              <p class="mt-2 text-sm font-semibold theme-text-secondary">
                {{ userProfileStore.loadingOrders ? '-' : userProfileStore.recentOrders.length }}
              </p>
            </div>
            <div class="rounded-2xl border theme-surface-soft px-4 py-3">
              <p class="text-[11px] uppercase tracking-[0.16em] text-gray-400">{{ t('personalCenter.overview.accountLabel') }}</p>
              <span class="mt-2 theme-badge px-2.5 py-1 text-xs font-semibold" :class="emailVerifiedClass">
                {{ emailVerifiedLabel }}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <aside class="lg:col-span-3">
          <div class="rounded-2xl border theme-panel-soft p-4 shadow-sm backdrop-blur-sm lg:sticky lg:top-24">
            <div class="hidden flex-col gap-2 lg:flex">
              <button
                v-for="item in sectionItems"
                :key="item.key"
                type="button"
                @click="switchSection(item.key)"
                class="group w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all"
                :class="currentSection === item.key
                  ? 'theme-selected-surface theme-text-primary'
                  : 'border theme-btn-secondary'"
              >
                <span class="flex items-center justify-between gap-3">
                  <span>{{ t(item.label) }}</span>
                  <span
                    class="h-1.5 w-1.5 rounded-full transition-colors"
                    :class="currentSection === item.key ? 'theme-accent-stick' : 'bg-gray-300 dark:bg-gray-600 group-hover:bg-gray-400 dark:group-hover:bg-gray-500'"
                  ></span>
                </span>
              </button>
            </div>

            <div class="lg:hidden">
              <div class="flex gap-2 overflow-x-auto pb-1">
                <button
                  v-for="item in sectionItems"
                  :key="item.key"
                  type="button"
                  @click="switchSection(item.key)"
                  class="shrink-0 rounded-lg border px-4 py-2 text-xs font-semibold transition-colors"
                  :class="currentSection === item.key
                    ? 'theme-selected-surface theme-text-primary'
                    : 'border theme-btn-secondary'"
                >
                  {{ t(item.label) }}
                </button>
              </div>
            </div>
          </div>
        </aside>

        <section class="space-y-6 lg:col-span-9">
          <div
            v-if="globalAlert"
            class="rounded-2xl border px-4 py-3 text-sm shadow-sm"
            :class="pageAlertClass(globalAlert.level)"
          >
            {{ globalAlert.message }}
          </div>

          <template v-if="currentSection === 'overview'">
            <div class="rounded-2xl border theme-panel-soft p-6 shadow-sm">
              <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div class="flex items-center gap-4">
                  <div class="flex h-14 w-14 items-center justify-center rounded-2xl theme-selected-surface text-lg font-black theme-text-accent">
                    {{ displayInitial }}
                  </div>
                  <div>
                    <p class="text-xs uppercase tracking-[0.18em] text-gray-500">{{ t('personalCenter.overview.accountLabel') }}</p>
                    <h2 class="mt-1 text-xl font-black theme-text-primary">{{ userProfileStore.displayName }}</h2>
                    <p class="mt-1 text-sm theme-text-muted">{{ userProfileStore.profile?.email || '-' }}</p>
                  </div>
                </div>
                <span class="theme-badge px-3 py-1 text-xs font-semibold" :class="emailVerifiedClass">
                  {{ emailVerifiedLabel }}
                </span>
              </div>
            </div>

            <div class="rounded-2xl border theme-panel-soft p-6 shadow-sm">
              <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h3 class="text-lg font-bold theme-text-primary">{{ t('personalCenter.overview.recentOrdersTitle') }}</h3>
                <router-link
                  to="/me/orders"
                  class="inline-flex items-center rounded-full border theme-btn-ghost px-3 py-1 text-xs font-semibold"
                >
                  {{ t('personalCenter.overview.viewAllOrders') }}
                </router-link>
              </div>

              <div v-if="userProfileStore.loadingOrders" class="space-y-3">
                <div
                  v-for="idx in 3"
                  :key="idx"
                  class="h-16 animate-pulse rounded-xl border theme-surface-muted"
                ></div>
              </div>

              <div v-else-if="userProfileStore.recentOrders.length === 0" class="rounded-xl border border-dashed theme-surface-soft px-4 py-5 text-sm theme-text-muted">
                {{ t('personalCenter.overview.emptyOrders') }}
              </div>

              <div v-else class="space-y-3">
                <div
                  v-for="order in userProfileStore.recentOrders"
                  :key="order.order_no || order.id"
                  class="rounded-xl border theme-surface-soft px-4 py-3 transition-all theme-card-interactive"
                >
                  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div class="text-xs theme-text-muted">{{ t('orders.orderNo') }}：{{ order.order_no }}</div>
                      <div class="mt-1 text-sm font-semibold theme-text-primary">
                        {{ formatMoney(order.total_amount, order.currency) }}
                      </div>
                      <div class="mt-1 text-xs theme-text-muted">{{ formatDate(order.created_at) }}</div>
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="theme-badge px-3 py-1 text-xs font-medium" :class="statusClass(order.status)">
                        {{ statusLabel(order.status) }}
                      </span>
                      <router-link
                        :to="`/orders/${order.order_no}`"
                        class="rounded-lg border theme-btn-secondary px-3 py-1.5 text-xs font-medium"
                      >
                        {{ t('orders.viewDetails') }}
                      </router-link>
                      <router-link
                        v-if="order.status === 'pending_payment'"
                        :to="`/pay?order_no=${order.order_no}`"
                        class="rounded-lg theme-btn-primary px-3 py-1.5 text-xs font-bold transition-colors"
                      >
                        {{ t('orders.payNow') }}
                      </router-link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <ProfilePanel v-else-if="currentSection === 'profile'" />
          <SecurityPanel v-else-if="currentSection === 'security'" />
          <OrdersPanel v-else />
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { orderStatusClass, orderStatusLabel } from '../utils/status'
import { pageAlertClass, type PageAlert } from '../utils/alerts'
import { useUserProfileStore } from '../stores/userProfile'
import ProfilePanel from './personal/ProfilePanel.vue'
import SecurityPanel from './personal/SecurityPanel.vue'
import OrdersPanel from './personal/OrdersPanel.vue'

type PersonalSection = 'overview' | 'profile' | 'security' | 'orders'

const props = withDefaults(defineProps<{ section?: PersonalSection }>(), {
  section: 'overview',
})

const router = useRouter()
const { t } = useI18n()
const userProfileStore = useUserProfileStore()

const sectionItems: Array<{ key: PersonalSection; label: string }> = [
  { key: 'overview', label: 'personalCenter.tabs.overview' },
  { key: 'profile', label: 'personalCenter.tabs.profile' },
  { key: 'security', label: 'personalCenter.tabs.security' },
  { key: 'orders', label: 'personalCenter.tabs.orders' },
]

const sectionRouteMap: Record<PersonalSection, string> = {
  overview: '/me',
  profile: '/me/profile',
  security: '/me/security',
  orders: '/me/orders',
}

const currentSection = computed<PersonalSection>(() => props.section)
const globalAlert = ref<PageAlert | null>(null)

const currentSectionLabel = computed(() => {
  const current = sectionItems.find((item) => item.key === currentSection.value)
  return current ? t(current.label) : t('personalCenter.title')
})

const displayInitial = computed(() => {
  const name = userProfileStore.displayName || ''
  const normalized = name.trim()
  if (!normalized) return 'U'
  return normalized.slice(0, 1).toUpperCase()
})

const switchSection = (section: PersonalSection) => {
  router.push(sectionRouteMap[section])
}

const statusLabel = (status?: string) => orderStatusLabel(t, status)
const statusClass = (status?: string) => orderStatusClass(status)

const formatMoney = (amount?: string, currency?: string) => {
  if (!amount) return '-'
  if (!currency) return amount
  return `${amount} ${currency}`
}

const formatDate = (raw?: string) => {
  if (!raw) return '-'
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return raw
  return date.toLocaleString()
}

const emailVerifiedLabel = computed(() => {
  if (userProfileStore.profile?.email_verified_at) {
    return t('personalCenter.overview.emailVerified')
  }
  return t('personalCenter.overview.emailUnverified')
})

const emailVerifiedClass = computed(() => {
  if (userProfileStore.profile?.email_verified_at) {
    return 'theme-badge-success'
  }
  return 'theme-badge-warning'
})

const initialize = async () => {
  globalAlert.value = null
  const [profileOk] = await Promise.all([
    userProfileStore.loadProfile(),
    userProfileStore.loadRecentOrders(5),
  ])
  if (!profileOk) {
    globalAlert.value = {
      level: 'error',
      message: userProfileStore.profileError || t('personalCenter.common.loadFailed'),
    }
  }
}

onMounted(() => {
  initialize()
})
</script>
