<template>
  <div
    class="products-page min-h-screen theme-page pt-20 pb-16">
    <div class="container mx-auto px-4">
      <!-- Page Header -->
      <div class="mb-12 mt-12 text-center">
        <h1 class="text-4xl md:text-5xl font-black mb-4 tracking-tight theme-text-primary">{{ t('nav.products') }}</h1>
        <p
          class="theme-text-secondary max-w-2xl mx-auto text-lg border-b theme-border pb-8">
          {{ t('products.subtitle') }}
        </p>
      </div>

      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Sidebar - Categories -->
        <aside class="lg:w-64 flex-shrink-0">
          <div
            class="theme-panel backdrop-blur-xl border rounded-2xl p-6 sticky top-24">
            <div class="mb-6">
              <label class="text-xs font-semibold uppercase tracking-wider theme-text-muted">
                {{ t('products.searchLabel') }}
              </label>
              <div class="mt-3 flex items-center gap-2">
                <input v-model="searchQuery" type="text"
                  class="min-w-0 flex-1 form-input"
                  :placeholder="t('products.searchPlaceholder')" />
                <button v-if="searchQuery" type="button" @click="clearSearch"
                  class="shrink-0 whitespace-nowrap px-3 py-2.5 rounded-xl border theme-btn-secondary text-xs">
                  {{ t('common.cancel') }}
                </button>
              </div>
            </div>
            <h2 class="text-lg font-bold mb-6 theme-text-primary flex items-center gap-2">
              <span class="w-1 h-5 theme-accent-stick rounded-full"></span>
              {{ t('products.categories') }}
            </h2>
            <ul class="space-y-2">
              <li>
                <button @click="selectedCategory = null"
                  class="w-full text-left px-4 py-3 rounded-xl transition-all duration-300 border"
                  :class="selectedCategory === null
                    ? 'theme-btn-primary border border-transparent'
                    : 'border-transparent theme-text-secondary hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'">
                  {{ t('products.allCategories') }}
                </button>
              </li>
              <li v-for="category in categories" :key="category.id">
                <button @click="selectedCategory = category.id"
                  class="w-full text-left px-4 py-3 rounded-xl transition-all duration-300 border"
                  :class="selectedCategory === category.id
                    ? 'theme-btn-primary border border-transparent'
                    : 'border-transparent theme-text-secondary hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'">
                  {{ getLocalizedText(category.name) }}
                </button>
              </li>
            </ul>
          </div>
        </aside>

        <!-- Main Content - Products Grid -->
        <main class="flex-1">
          <!-- Loading State -->
          <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="i in 6" :key="i"
              class="theme-surface-muted rounded-2xl h-[400px] animate-pulse border">
            </div>
          </div>

          <!-- Products Grid -->
          <div v-else-if="products.length > 0">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div v-for="product in products" :key="product.id"
                class="group relative theme-panel rounded-2xl border transition-all duration-500 overflow-hidden flex flex-col h-full"
                :class="isSoldOut(product)
                  ? 'opacity-85 grayscale-[0.25] saturate-50 border-rose-300/60 dark:border-rose-900/40 hover:-translate-y-0 hover:shadow-none hover:border-rose-300/60 dark:hover:border-rose-900/40'
                  : 'theme-card-interactive'"
                @click="goToProduct(product.slug)">
                <!-- Image Area -->
                <div class="h-56 overflow-hidden theme-surface-muted relative shrink-0">
                  <div
                    class="absolute inset-0 bg-black/15 z-10">
                  </div>
                  <img v-if="product.images && getFirstImageUrl(product.images)" :src="getFirstImageUrl(product.images)"
                    :alt="getLocalizedText(product.title)"
                    class="w-full h-full object-cover transform transition-transform duration-700 ease-out"
                    :class="isSoldOut(product) ? 'grayscale brightness-75' : 'group-hover:scale-110'" />
                  <div v-else class="w-full h-full flex items-center justify-center theme-text-muted">
                    <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>

                  <div v-if="isSoldOut(product)" class="absolute inset-0 z-20 bg-black/45"></div>
                  <div v-if="isSoldOut(product)"
                    class="absolute left-4 top-4 z-30 theme-badge theme-badge-solid-danger text-xs font-bold tracking-wider shadow-sm">
                    {{ t('products.stockStatus.outOfStock') }}
                  </div>

                  <!-- Tags -->
                  <div v-if="!isSoldOut(product) && product.tags && product.tags.length > 0"
                    class="absolute top-4 right-4 z-20 flex flex-wrap gap-2 justify-end">
                    <span v-for="(tag, index) in product.tags.slice(0, 2)" :key="index"
                      class="theme-badge theme-badge-inverse px-3 py-1 text-xs font-medium">
                      {{ tag }}
                    </span>
                  </div>
                </div>

                <!-- Content Area -->
                <div class="p-5 relative z-20 flex flex-col flex-1">
                  <div v-if="product.category?.name" class="text-xs theme-text-muted uppercase tracking-wider mb-2">
                    {{ t('products.categoryLabel') }} · {{ getLocalizedText(product.category.name) }}
                  </div>
                  <h3
                    class="text-lg font-bold theme-text-primary mb-2 transition-colors line-clamp-1">
                    {{ getLocalizedText(product.title) }}
                  </h3>

                  <div class="mb-3 flex flex-wrap items-center gap-2">
                    <span
                      class="theme-badge"
                      :class="product.purchase_type === 'guest'
                        ? 'theme-badge-warning'
                        : 'theme-badge-success'"
                    >
                      <svg v-if="product.purchase_type === 'guest'" class="mr-1 h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" />
                        <circle cx="9.5" cy="7" r="3" stroke-width="2" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 8l2 2-2 2" />
                      </svg>
                      <svg v-else class="mr-1 h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <rect x="3" y="11" width="18" height="10" rx="2" ry="2" stroke-width="2" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11V8a5 5 0 0110 0v3" />
                      </svg>
                      {{ getPurchaseTypeLabel(product.purchase_type) }}
                    </span>

                    <span
                      class="theme-badge"
                      :class="product.fulfillment_type === 'auto'
                        ? 'theme-badge-info'
                        : 'theme-badge-neutral'"
                    >
                      <svg v-if="product.fulfillment_type === 'auto'" class="mr-1 h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
                      </svg>
                      <svg v-else class="mr-1 h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.7 6.3l3 3m-9.4 9.4l-4 1 1-4 9.9-9.9a2.1 2.1 0 013 3L8.3 18.7z" />
                      </svg>
                      {{ getFulfillmentTypeLabel(product.fulfillment_type) }}
                    </span>

                    <span
                      class="theme-badge"
                      :class="getStockBadgeClass(product.stock_status)"
                    >
                      {{ getStockStatusLabel(product) }}
                    </span>
                  </div>

                  <p class="theme-text-secondary text-sm mb-6 line-clamp-2">
                    {{ getLocalizedText(product.description) }}
                  </p>

                  <div
                    class="flex items-center justify-between border-t theme-border pt-4 mt-auto">
                    <div class="flex flex-col">
                      <span class="text-xs theme-text-muted uppercase tracking-wider">{{ t('products.price', 'Price')
                      }}</span>
                      <span v-if="hasPromotionPrice(product)" class="text-lg font-bold text-rose-600 dark:text-rose-300 font-mono">
                        {{ formatPrice(getPromotionPriceAmount(product), product.price_currency) }}
                      </span>
                      <span v-else class="text-lg font-bold theme-text-primary font-mono">
                        {{ formatPrice(product.price_amount, product.price_currency) }}
                      </span>
                      <div v-if="hasPromotionPrice(product)" class="mt-0.5 flex flex-wrap items-center gap-1.5">
                        <span class="text-xs theme-text-muted opacity-80 line-through">{{ formatPrice(product.price_amount, product.price_currency) }}</span>
                        <span class="theme-badge theme-badge-danger theme-badge-xs">
                          {{ t('products.promotionTag') }}
                        </span>
                      </div>
                    </div>

                    <span
                      class="text-xs uppercase font-bold transition-colors flex items-center gap-1"
                      :class="isSoldOut(product)
                        ? 'text-rose-500/90 dark:text-rose-300/90'
                        : 'text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white'">
                      {{ t('common.viewDetails') }}
                      <svg class="w-4 h-4 transition-transform" :class="isSoldOut(product) ? '' : 'group-hover:translate-x-1'" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="mt-12 flex justify-center">
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
            class="text-center py-20 border theme-panel-soft rounded-2xl backdrop-blur-sm">
            <svg class="w-20 h-20 mx-auto theme-text-muted mb-6" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p class="theme-text-muted text-lg">
              {{ t('products.empty') }}
            </p>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '../stores/app'
import { productAPI, categoryAPI } from '../api'
import { getFirstImageUrl } from '../utils/image'
import { debounceAsync } from '../utils/debounce'

const router = useRouter()
const { t } = useI18n()
const appStore = useAppStore()

const loading = ref(true)
const products = ref<any[]>([])
const categories = ref<any[]>([])
const selectedCategory = ref<number | null>(null)
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)
const totalPages = ref(0)

const getLocalizedText = (jsonData: any) => {
  if (!jsonData) return ''
  const locale = appStore.locale
  return jsonData[locale] || jsonData['zh-CN'] || jsonData['en-US'] || ''
}

const getPurchaseTypeLabel = (purchaseType: string) => {
  return purchaseType === 'guest' ? t('productPurchase.guest') : t('productPurchase.member')
}

const getFulfillmentTypeLabel = (fulfillmentType: string) => {
  return fulfillmentType === 'auto' ? t('products.fulfillmentType.auto') : t('products.fulfillmentType.manual')
}

const getStockBadgeClass = (status: string) => {
  switch (status) {
    case 'unlimited':
      return 'theme-badge-info'
    case 'low_stock':
      return 'theme-badge-warning'
    case 'out_of_stock':
      return 'theme-badge-danger'
    default:
      return 'theme-badge-success'
  }
}

const getStockStatusLabel = (product: any) => {
  const status = product?.stock_status || ''
  if (status === 'unlimited') return t('products.stockStatus.unlimited')
  if (status === 'out_of_stock') return t('products.stockStatus.outOfStock')
  if (status === 'low_stock') {
    const count = Number(product?.fulfillment_type === 'manual' ? product?.manual_stock_available : product?.auto_stock_available)
    if (Number.isFinite(count) && count > 0) {
      return t('products.stockStatus.lowStockCount', { count })
    }
    return t('products.stockStatus.lowStock')
  }
  return t('products.stockStatus.inStock')
}

const isSoldOut = (product: any) => Boolean(product?.is_sold_out || product?.stock_status === 'out_of_stock')

const formatPrice = (amount: any, currency: any) => {
  if (amount === null || amount === undefined || amount === '') return '-'
  if (currency === null || currency === undefined || currency === '') {
    return String(amount)
  }
  return `${amount} ${currency}`
}

const parsePriceAmount = (amount: any) => {
  const numeric = Number(amount)
  if (!Number.isFinite(numeric)) return null
  return numeric
}

const getPromotionPriceAmount = (product: any) => product?.promotion_price_amount

const hasPromotionPrice = (product: any) => {
  if (!product) return false
  const original = parsePriceAmount(product.price_amount)
  const promotion = parsePriceAmount(product.promotion_price_amount)
  if (original === null || promotion === null) return false
  return promotion >= 0 && promotion < original
}

const loadProducts = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      page_size: pageSize.value,
    }
    if (selectedCategory.value) {
      params.category_id = selectedCategory.value
    }
    const keyword = searchQuery.value.trim()
    if (keyword) {
      params.search = keyword
    }
    const response = await productAPI.list(params)
    products.value = response.data.data || []
    if (response.data.pagination) {
      total.value = response.data.pagination.total || 0
      totalPages.value = response.data.pagination.total_page || 0
    }
  } catch (error) {
    console.error('Failed to load products:', error)
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const response = await categoryAPI.list()
    categories.value = response.data.data || []
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
}

const debouncedLoadProducts = debounceAsync(loadProducts, 300)
const debouncedLoadCategories = debounceAsync(loadCategories, 250)

const goToProduct = (slug: string) => {
  router.push(`/products/${slug}`)
}

const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  debouncedLoadProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const clearSearch = () => {
  if (!searchQuery.value) return
  searchQuery.value = ''
  currentPage.value = 1
  debouncedLoadProducts()
}

watch(selectedCategory, () => {
  currentPage.value = 1
  debouncedLoadProducts()
})

watch(searchQuery, () => {
  currentPage.value = 1
  debouncedLoadProducts()
})

onMounted(async () => {
  await Promise.all([
    debouncedLoadCategories(),
    debouncedLoadProducts(),
  ])
})

onUnmounted(() => {
  debouncedLoadProducts.cancel()
  debouncedLoadCategories.cancel()
})
</script>

<style scoped>
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}
</style>
