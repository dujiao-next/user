<template>
  <div class="min-h-screen theme-page pt-24 pb-16">
    <section class="relative z-10 overflow-hidden border-b theme-border">
      <div class="absolute inset-0 opacity-90" style="background:
        radial-gradient(circle at top left, rgba(14,165,233,0.16), transparent 40%),
        radial-gradient(circle at top right, rgba(16,185,129,0.14), transparent 34%),
        linear-gradient(180deg, rgba(15,23,42,0.04), rgba(15,23,42,0));"></div>
      <div class="container relative mx-auto px-4 py-10 sm:py-14">
        <div class="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_22rem] lg:items-end">
          <div class="space-y-5">
            <div class="inline-flex items-center gap-2 rounded-full border theme-border theme-panel-soft px-3 py-1 text-xs font-semibold tracking-[0.18em] theme-text-muted">
              <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
              {{ t('pluginMarket.heroBadge') }}
            </div>
            <div class="space-y-3">
              <h1 class="max-w-4xl text-3xl font-black tracking-[-0.03em] theme-text-primary sm:text-4xl lg:text-5xl">
                {{ t('pluginMarket.title') }}
              </h1>
              <p class="max-w-3xl text-sm leading-7 theme-text-secondary sm:text-base">
                {{ t('pluginMarket.subtitle') }}
              </p>
            </div>
            <div class="flex flex-wrap gap-3">
              <router-link
                to="/plugins"
                class="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.01] hover:bg-slate-800"
              >
                {{ t('pluginMarket.ctaBrowse') }}
              </router-link>
              <a
                href="https://api.vipmax.shop/api/v1/public/plugin-market/feed?scope=official"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex min-h-[44px] items-center justify-center rounded-xl border theme-border theme-panel-soft px-5 py-3 text-sm font-semibold theme-text-primary transition hover:opacity-90"
              >
                {{ t('pluginMarket.ctaFeed') }}
              </a>
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div class="rounded-2xl border theme-border theme-panel p-5">
              <div class="text-xs uppercase tracking-[0.2em] theme-text-muted">{{ t('pluginMarket.stats.published') }}</div>
              <div class="mt-2 text-3xl font-black theme-text-primary">{{ filteredPlugins.length }}</div>
              <p class="mt-2 text-xs leading-6 theme-text-secondary">{{ t('pluginMarket.stats.publishedHint') }}</p>
            </div>
            <div class="rounded-2xl border theme-border theme-panel p-5">
              <div class="text-xs uppercase tracking-[0.2em] theme-text-muted">{{ t('pluginMarket.stats.license') }}</div>
              <div class="mt-2 text-lg font-bold theme-text-primary">{{ t('pluginMarket.stats.licenseValue') }}</div>
              <p class="mt-2 text-xs leading-6 theme-text-secondary">{{ t('pluginMarket.stats.licenseHint') }}</p>
            </div>
            <div class="rounded-2xl border theme-border theme-panel p-5">
              <div class="text-xs uppercase tracking-[0.2em] theme-text-muted">{{ t('pluginMarket.stats.scope') }}</div>
              <div class="mt-2 text-lg font-bold theme-text-primary">{{ t('pluginMarket.stats.scopeValue') }}</div>
              <p class="mt-2 text-xs leading-6 theme-text-secondary">{{ t('pluginMarket.stats.scopeHint') }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="container mx-auto px-4 pt-8">
      <div class="mb-6 grid gap-4 rounded-3xl border theme-border theme-panel p-5 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-center">
        <div class="space-y-2">
          <h2 class="text-lg font-bold theme-text-primary">{{ t('pluginMarket.filterTitle') }}</h2>
          <p class="text-sm theme-text-secondary">{{ t('pluginMarket.filterSubtitle') }}</p>
        </div>
        <label class="block">
          <span class="sr-only">{{ t('pluginMarket.searchPlaceholder') }}</span>
          <input
            v-model.trim="searchKeyword"
            type="text"
            class="h-11 w-full rounded-2xl border theme-border theme-panel-soft px-4 text-sm theme-text-primary outline-none transition focus:ring-2 focus:ring-sky-500/25"
            :placeholder="t('pluginMarket.searchPlaceholder')"
          />
        </label>
      </div>

      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)] lg:items-start">
        <div class="space-y-4">
          <div v-if="loading" class="grid gap-4 md:grid-cols-2">
            <div
              v-for="index in 4"
              :key="`plugin-skeleton-${index}`"
              class="rounded-3xl border theme-border theme-panel p-6"
            >
              <div class="h-5 w-28 rounded-full theme-skeleton"></div>
              <div class="mt-4 h-8 w-3/4 rounded-xl theme-skeleton"></div>
              <div class="mt-3 h-4 w-full rounded theme-skeleton"></div>
              <div class="mt-2 h-4 w-5/6 rounded theme-skeleton"></div>
              <div class="mt-6 flex gap-2">
                <div class="h-8 w-20 rounded-full theme-skeleton"></div>
                <div class="h-8 w-20 rounded-full theme-skeleton"></div>
              </div>
            </div>
          </div>

          <div v-else-if="filteredPlugins.length === 0" class="rounded-3xl border theme-border theme-panel p-10 text-center">
            <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/15">
              <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9.75 3.104v5.714m0 0-2.572-2.571M9.75 8.818l2.572-2.571M6.75 12.75V18a2.25 2.25 0 002.25 2.25h8.25A2.25 2.25 0 0019.5 18v-5.25m-15 0h15" />
              </svg>
            </div>
            <h3 class="mt-5 text-xl font-bold theme-text-primary">{{ t('pluginMarket.emptyTitle') }}</h3>
            <p class="mt-3 text-sm leading-7 theme-text-secondary">{{ t('pluginMarket.emptyDescription') }}</p>
          </div>

          <div v-else class="grid gap-4 md:grid-cols-2">
            <button
              v-for="item in filteredPlugins"
              :key="item.plugin.plugin_id"
              type="button"
              class="group rounded-3xl border p-6 text-left transition-all"
              :class="activePluginID === item.plugin.plugin_id
                ? 'border-sky-500/60 bg-sky-500/5 shadow-lg shadow-sky-500/10'
                : 'theme-border theme-panel hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-600'"
              @click="selectPlugin(item.plugin.plugin_id)"
            >
              <div class="flex flex-wrap items-center gap-2">
                <span class="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-white">
                  {{ t('pluginMarket.card.official') }}
                </span>
                <span class="inline-flex items-center rounded-full border theme-border px-3 py-1 text-[11px] font-semibold tracking-[0.16em] theme-text-muted">
                  {{ formatPluginType(item.plugin.plugin_type) }}
                </span>
                <span
                  v-for="mode in resolveBillingModes(item.plugin)"
                  :key="`${item.plugin.plugin_id}-${mode}`"
                  class="inline-flex items-center rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-emerald-600"
                >
                  {{ formatBillingMode(mode) }}
                </span>
              </div>

              <div class="mt-5 flex items-start justify-between gap-3">
                <div>
                  <h3 class="text-xl font-bold theme-text-primary">{{ item.plugin.name }}</h3>
                  <p class="mt-2 text-sm theme-text-muted">{{ item.publisher?.name || t('pluginMarket.card.officialPublisher') }}</p>
                </div>
                <div class="rounded-2xl border theme-border px-3 py-2 text-right">
                  <div class="text-[11px] uppercase tracking-[0.16em] theme-text-muted">{{ t('pluginMarket.card.version') }}</div>
                  <div class="mt-1 text-sm font-semibold theme-text-primary">{{ item.latest_version?.version || '--' }}</div>
                </div>
              </div>

              <p class="plugin-summary mt-4 text-sm leading-7 theme-text-secondary">{{ item.plugin.summary }}</p>

              <div class="mt-5 flex flex-wrap items-center gap-2">
                <span
                  v-for="tag in item.plugin.tags?.slice(0, 3) || []"
                  :key="`${item.plugin.plugin_id}-tag-${tag}`"
                  class="inline-flex items-center rounded-full border theme-border px-3 py-1 text-xs theme-text-muted"
                >
                  #{{ tag }}
                </span>
              </div>

              <div class="mt-6 flex items-center justify-between gap-3">
                <div>
                  <div class="text-[11px] uppercase tracking-[0.16em] theme-text-muted">{{ t('pluginMarket.card.delivery') }}</div>
                  <div class="mt-1 text-sm font-semibold theme-text-primary">
                    {{ item.latest_version?.build_target || t('pluginMarket.card.notReady') }}
                  </div>
                </div>
                <span class="inline-flex items-center gap-2 text-sm font-semibold text-sky-600 transition group-hover:translate-x-0.5">
                  {{ t('pluginMarket.card.viewDetail') }}
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </button>
          </div>
        </div>

        <aside class="lg:sticky lg:top-24">
          <div class="overflow-hidden rounded-[2rem] border theme-border theme-panel">
            <div class="border-b theme-border px-6 py-5">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <div class="text-xs uppercase tracking-[0.2em] theme-text-muted">{{ t('pluginMarket.detail.title') }}</div>
                  <h2 class="mt-2 text-2xl font-black tracking-[-0.02em] theme-text-primary">
                    {{ currentPluginName }}
                  </h2>
                </div>
                <span class="rounded-full border theme-border px-3 py-1 text-xs font-semibold theme-text-muted">
                  {{ currentVersionLabel }}
                </span>
              </div>
            </div>

            <div v-if="detailLoading" class="space-y-4 px-6 py-6">
              <div class="h-6 w-1/2 rounded-xl theme-skeleton"></div>
              <div class="h-4 w-full rounded theme-skeleton"></div>
              <div class="h-4 w-4/5 rounded theme-skeleton"></div>
              <div class="grid gap-3">
                <div class="h-28 rounded-2xl theme-skeleton"></div>
                <div class="h-28 rounded-2xl theme-skeleton"></div>
              </div>
            </div>

            <div v-else-if="detailError" class="px-6 py-8">
              <div class="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-5">
                <div class="text-base font-semibold text-rose-600">{{ t('pluginMarket.detail.loadFailed') }}</div>
                <p class="mt-2 text-sm leading-7 theme-text-secondary">{{ detailError }}</p>
              </div>
            </div>

            <div v-else-if="currentDetail" class="space-y-6 px-6 py-6">
              <p class="text-sm leading-7 theme-text-secondary">
                {{ currentDetail.plugin.description || currentDetail.plugin.summary }}
              </p>

              <div class="grid gap-3 sm:grid-cols-2">
                <div class="rounded-2xl border theme-border theme-panel-soft p-4">
                  <div class="text-xs uppercase tracking-[0.18em] theme-text-muted">{{ t('pluginMarket.detail.publisher') }}</div>
                  <div class="mt-2 text-sm font-semibold theme-text-primary">{{ currentDetail.publisher?.name || '--' }}</div>
                </div>
                <div class="rounded-2xl border theme-border theme-panel-soft p-4">
                  <div class="text-xs uppercase tracking-[0.18em] theme-text-muted">{{ t('pluginMarket.detail.target') }}</div>
                  <div class="mt-2 text-sm font-semibold theme-text-primary">{{ currentDetail.latest_version?.build_target || '--' }}</div>
                </div>
                <div class="rounded-2xl border theme-border theme-panel-soft p-4">
                  <div class="text-xs uppercase tracking-[0.18em] theme-text-muted">{{ t('pluginMarket.detail.hostApi') }}</div>
                  <div class="mt-2 text-sm font-semibold theme-text-primary">{{ currentDetail.latest_version?.host_api_version || '--' }}</div>
                </div>
                <div class="rounded-2xl border theme-border theme-panel-soft p-4">
                  <div class="text-xs uppercase tracking-[0.18em] theme-text-muted">{{ t('pluginMarket.detail.packageSize') }}</div>
                  <div class="mt-2 text-sm font-semibold theme-text-primary">{{ formatSize(currentDetail.latest_version?.package_size_bytes) }}</div>
                </div>
              </div>

              <div class="space-y-3">
                <div class="flex items-center justify-between gap-3">
                  <h3 class="text-base font-bold theme-text-primary">{{ t('pluginMarket.detail.plans') }}</h3>
                  <span class="text-xs theme-text-muted">{{ t('pluginMarket.detail.bindingHint') }}</span>
                </div>
                <div class="grid gap-3">
                  <div
                    v-for="plan in sortedPlans"
                    :key="plan.id"
                    class="rounded-3xl border theme-border theme-panel-soft p-4"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <div class="flex flex-wrap items-center gap-2">
                          <h4 class="text-base font-bold theme-text-primary">{{ plan.plan_name }}</h4>
                          <span
                            v-if="resolvePlanBadge(plan)"
                            class="rounded-full bg-amber-500/12 px-2.5 py-1 text-[11px] font-semibold text-amber-600"
                          >
                            {{ resolvePlanBadge(plan) }}
                          </span>
                        </div>
                        <p class="mt-2 text-xs leading-6 theme-text-secondary">
                          {{ describePlan(plan) }}
                        </p>
                      </div>
                      <div class="text-right">
                        <div class="text-xl font-black tracking-[-0.02em] theme-text-primary">{{ formatPrice(plan.price_amount, plan.price_currency) }}</div>
                        <div class="mt-1 text-[11px] uppercase tracking-[0.16em] theme-text-muted">{{ formatBillingMode(plan.billing_mode) }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="permissionList.length > 0" class="space-y-3">
                <h3 class="text-base font-bold theme-text-primary">{{ t('pluginMarket.detail.permissions') }}</h3>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="permission in permissionList"
                    :key="permission"
                    class="rounded-full border theme-border px-3 py-1.5 text-xs font-medium theme-text-secondary"
                  >
                    {{ permission }}
                  </span>
                </div>
              </div>

              <div v-if="changelogItems.length > 0" class="space-y-3">
                <h3 class="text-base font-bold theme-text-primary">{{ t('pluginMarket.detail.changelog') }}</h3>
                <ul class="space-y-2">
                  <li
                    v-for="item in changelogItems"
                    :key="item"
                    class="flex items-start gap-3 text-sm leading-7 theme-text-secondary"
                  >
                    <span class="mt-2 h-1.5 w-1.5 rounded-full bg-sky-500"></span>
                    <span>{{ item }}</span>
                  </li>
                </ul>
              </div>

              <div class="space-y-3 rounded-3xl border border-sky-500/20 bg-sky-500/5 p-5">
                <div class="text-sm font-semibold text-sky-700">{{ t('pluginMarket.detail.purchaseNoteTitle') }}</div>
                <p class="text-sm leading-7 theme-text-secondary">{{ t('pluginMarket.detail.purchaseNoteText') }}</p>
              </div>

              <div class="flex flex-wrap gap-3">
                <a
                  v-if="currentDetail.latest_version?.package_download_url"
                  :href="currentDetail.latest_version.package_download_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  {{ t('pluginMarket.detail.download') }}
                </a>
                <a
                  v-if="currentDetail.plugin.homepage_url"
                  :href="currentDetail.plugin.homepage_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex min-h-[44px] items-center justify-center rounded-xl border theme-border px-5 py-3 text-sm font-semibold theme-text-primary transition hover:opacity-90"
                >
                  {{ t('pluginMarket.detail.homepage') }}
                </a>
              </div>
            </div>

            <div v-else class="px-6 py-8 text-sm leading-7 theme-text-secondary">
              {{ t('pluginMarket.detail.empty') }}
            </div>
          </div>
        </aside>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import {
  pluginMarketAPI,
  type PluginMarketCatalogPlugin,
  type PluginMarketPlan,
  type PluginMarketPluginDetail,
  type PluginMarketPluginSummary,
} from '../api/pluginMarket'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const loading = ref(false)
const detailLoading = ref(false)
const loadError = ref('')
const detailError = ref('')
const searchKeyword = ref('')
const plugins = ref<PluginMarketPluginSummary[]>([])
const detailMap = ref<Record<string, PluginMarketPluginDetail>>({})

const routePluginID = computed(() => String(route.params.pluginId || '').trim())

const normalizedKeyword = computed(() => searchKeyword.value.trim().toLowerCase())

const filteredPlugins = computed(() => {
  if (!normalizedKeyword.value) {
    return plugins.value
  }
  return plugins.value.filter((item) => {
    const targets = [
      item.plugin.name,
      item.plugin.plugin_id,
      item.plugin.summary,
      item.publisher?.name || '',
      ...(item.plugin.tags || []),
    ]
    return targets.some((field) => field.toLowerCase().includes(normalizedKeyword.value))
  })
})

const activePluginID = computed(() => {
  if (routePluginID.value) {
    return routePluginID.value
  }
  return filteredPlugins.value[0]?.plugin.plugin_id || plugins.value[0]?.plugin.plugin_id || ''
})

const currentDetail = computed(() => detailMap.value[activePluginID.value] || null)

const currentPluginName = computed(() => {
  return currentDetail.value?.plugin.name
    || filteredPlugins.value.find((item) => item.plugin.plugin_id === activePluginID.value)?.plugin.name
    || t('pluginMarket.detail.placeholder')
})

const currentVersionLabel = computed(() => currentDetail.value?.latest_version?.version || '--')

const sortedPlans = computed(() => {
  return [...(currentDetail.value?.plans || [])]
    .filter((item) => item.status === 'active')
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
})

const permissionList = computed(() => currentDetail.value?.latest_version?.permissions || [])

const changelogItems = computed(() => {
  const raw = currentDetail.value?.latest_version?.changelog_md || ''
  return raw
    .split('\n')
    .map((item) => item.replace(/^[-*\s]+/, '').trim())
    .filter((item) => item !== '')
})

const formatPluginType = (value: string) => {
  const normalized = String(value || '').trim().toLowerCase()
  if (normalized === 'feature') return t('pluginMarket.types.feature')
  if (normalized === 'payment') return t('pluginMarket.types.payment')
  if (normalized === 'theme') return t('pluginMarket.types.theme')
  return normalized || '--'
}

const formatBillingMode = (value: string) => {
  const normalized = String(value || '').trim().toLowerCase()
  if (normalized === 'annual') return t('pluginMarket.billing.annual')
  if (normalized === 'perpetual') return t('pluginMarket.billing.perpetual')
  if (normalized === 'monthly') return t('pluginMarket.billing.monthly')
  return normalized || '--'
}

const resolveBillingModes = (plugin: PluginMarketCatalogPlugin) => {
  const modes = Array.isArray(plugin.meta?.available_billing_modes)
    ? plugin.meta?.available_billing_modes
    : []
  if (modes.length > 0) {
    return modes
  }
  return plugin.billing_mode ? [plugin.billing_mode] : []
}

const formatPrice = (amount: string, currency: string) => {
  const numeric = Number(amount)
  const value = Number.isFinite(numeric) ? numeric : 0
  const symbol = String(currency || '').toUpperCase() === 'CNY' ? '¥' : `${currency || ''} `
  return `${symbol}${value.toFixed(0)}`
}

const formatSize = (bytes?: number) => {
  if (!bytes || !Number.isFinite(bytes)) return '--'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

const resolvePlanBadge = (plan: PluginMarketPlan) => {
  return String(plan.meta?.display_badge || '').trim()
}

const describePlan = (plan: PluginMarketPlan) => {
  if (plan.billing_mode === 'annual' && plan.duration_days) {
    return t('pluginMarket.planDescriptionAnnual', { days: plan.duration_days })
  }
  if (plan.billing_mode === 'perpetual') {
    return t('pluginMarket.planDescriptionPerpetual')
  }
  return t('pluginMarket.planDescriptionGeneric')
}

const selectPlugin = async (pluginID: string) => {
  if (!pluginID) return
  if (routePluginID.value !== pluginID) {
    await router.push({ name: 'plugins', params: { pluginId: pluginID } })
    return
  }
  await ensureDetailLoaded(pluginID)
}

const loadPlugins = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const response = await pluginMarketAPI.listOfficialPlugins({ page: 1, page_size: 24 })
    plugins.value = response.data.data || []
  } catch (error: any) {
    loadError.value = error?.message || t('pluginMarket.loadFailed')
    plugins.value = []
  } finally {
    loading.value = false
  }
}

const ensureDetailLoaded = async (pluginID: string) => {
  if (!pluginID) return
  if (detailMap.value[pluginID]) {
    detailError.value = ''
    return
  }
  detailLoading.value = true
  detailError.value = ''
  try {
    const response = await pluginMarketAPI.getPluginDetail(pluginID)
    detailMap.value = {
      ...detailMap.value,
      [pluginID]: response.data.data,
    }
  } catch (error: any) {
    detailError.value = error?.message || t('pluginMarket.detail.loadFailed')
  } finally {
    detailLoading.value = false
  }
}

watch(activePluginID, async (pluginID) => {
  await ensureDetailLoaded(pluginID)
}, { immediate: false })

watch(filteredPlugins, async (items) => {
  if (items.length === 0) {
    return
  }
  if (!activePluginID.value) {
    const firstItem = items[0]
    if (firstItem) {
      await ensureDetailLoaded(firstItem.plugin.plugin_id)
    }
  }
})

onMounted(async () => {
  await loadPlugins()
  if (activePluginID.value) {
    await ensureDetailLoaded(activePluginID.value)
  }
})
</script>

<style scoped>
.plugin-summary {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
