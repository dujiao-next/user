<template>
  <div
    class="product-detail-page min-h-screen theme-page pt-24 pb-16">
    <div class="container mx-auto px-4">
      <!-- Loading State -->
      <div v-if="loading" class="animate-pulse space-y-8">
        <div class="h-8 theme-surface-muted rounded w-1/3"></div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div class="h-[500px] theme-surface-muted rounded-2xl"></div>
          <div class="space-y-6">
            <div class="h-10 theme-surface-muted rounded w-3/4"></div>
            <div class="h-6 theme-surface-muted rounded w-1/2"></div>
            <div class="h-32 theme-surface-muted rounded"></div>
          </div>
        </div>
      </div>

      <!-- Product Content -->
      <div v-else-if="product">
        <!-- Breadcrumb -->
        <nav class="mb-8 flex items-center space-x-2 text-sm theme-text-muted font-medium">
          <router-link to="/" class="theme-link-muted">{{ t('nav.home')
          }}</router-link>
          <span>/</span>
          <router-link to="/products" class="theme-link-muted">{{
            t('nav.products') }}</router-link>
          <span>/</span>
          <span class="theme-text-primary truncate max-w-[200px]">{{ getLocalizedText(product.title)
          }}</span>
        </nav>

        <!-- Main Info Card -->
        <div
          class="theme-panel backdrop-blur-xl border rounded-3xl overflow-hidden mb-8 shadow-2xl">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <!-- Product Images (Left) -->
            <div class="p-8 theme-surface-soft border-r theme-border">
              <div class="mb-6 relative group">
                <img v-if="currentImage" :src="currentImage" :alt="getLocalizedText(product.title)"
                  class="w-full h-[400px] lg:h-[500px] object-cover rounded-xl border theme-border relative z-10 shadow-lg" />
                <div v-else
                  class="w-full h-[400px] lg:h-[500px] theme-surface-muted rounded-xl border theme-border flex items-center justify-center relative z-10">
                  <svg class="w-24 h-24 theme-text-muted" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                      d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                      clip-rule="evenodd" />
                  </svg>
                </div>
              </div>

              <!-- Thumbnail Gallery -->
              <div v-if="images.length > 1" class="grid grid-cols-5 gap-3">
                <div v-for="(image, index) in images" :key="index" @click="currentImage = image"
                  class="cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-300 aspect-w-1 aspect-h-1"
                  :class="currentImage === image ? 'theme-thumb-selected opacity-100' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'">
                  <img :src="image" :alt="`Image ${index + 1}`" class="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            <!-- Product Info (Right) -->
            <div class="p-8 lg:p-12 flex flex-col justify-center">
              <div class="mb-6">
                <div v-if="categoryName" class="mb-3 text-xs uppercase tracking-wider theme-text-muted">
                  {{ t('productDetail.categoryLabel') }} · {{ categoryName }}
                </div>

                <div v-if="product.tags && product.tags.length > 0" class="mb-4 flex flex-wrap gap-2">
                  <span
                    v-for="(tag, index) in product.tags"
                    :key="index"
                    class="theme-badge theme-badge-neutral px-3 py-1 text-xs"
                  >
                    {{ tag }}
                  </span>
                </div>

                <h1 class="mb-4 text-3xl font-black leading-tight theme-text-primary md:text-5xl">
                  {{ getLocalizedText(product.title) }}
                </h1>

                <div class="mb-6 flex flex-wrap items-center gap-2">
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

                <div class="mb-8 border-b theme-border pb-8">
                  <div class="mb-3 flex flex-wrap items-center gap-2">
                    <span class="text-sm theme-text-muted">{{ t('products.price') }}</span>
                    <span v-if="hasPromotionPrice(product)" class="theme-badge theme-badge-danger">
                      {{ t('products.promotionTag') }}
                    </span>
                  </div>
                  <div v-if="hasPromotionPrice(product)" class="space-y-2">
                    <div class="flex flex-wrap items-end gap-4">
                      <span class="text-5xl font-mono font-bold text-rose-600 dark:text-rose-300">
                        {{ formatPrice(getPromotionPriceAmount(product), product.price_currency) }}
                      </span>
                      <span class="text-base font-medium theme-text-muted opacity-80 line-through">
                        {{ formatPrice(product.price_amount, product.price_currency) }}
                      </span>
                    </div>
                    <p class="text-sm font-medium text-rose-500 dark:text-rose-300">
                      {{ t('products.saveAmount') }} {{ formatPrice(getPromotionSaveAmount(product), product.price_currency) }}
                    </p>
                  </div>
                  <div v-else class="flex items-end gap-4">
                    <span
                      class="text-5xl font-mono font-bold theme-text-accent">
                      {{ formatPrice(product.price_amount, product.price_currency) }}
                    </span>
                  </div>
                </div>

                <div class="mb-8">
                  <h2 class="mb-3 text-sm font-bold uppercase tracking-widest theme-text-muted">
                    {{ t('productDetail.description') }}
                  </h2>
                  <p class="text-lg leading-relaxed theme-text-secondary">
                    {{ getLocalizedText(product.description) }}
                  </p>
                </div>
              </div>

              <!-- Purchase Actions -->
              <div class="mt-auto space-y-6">
                <p v-if="cannotPurchaseReason" class="rounded-xl border theme-alert-danger px-4 py-3 text-sm font-semibold">
                  {{ cannotPurchaseReason }}
                </p>

                <div class="space-y-3">
                  <button v-if="requiresLogin" @click="goLogin"
                    class="w-full px-6 py-4 theme-btn-primary font-bold rounded-xl transition-colors">
                    {{ t('productDetail.loginToBuy') }}
                  </button>
                  <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button @click="addToCart" :disabled="!canPurchase"
                      class="px-6 py-4 border theme-btn-secondary font-bold rounded-xl disabled:cursor-not-allowed disabled:opacity-50">
                      {{ t('productDetail.addToCart') }}
                    </button>
                    <button @click="buyNow" :disabled="!canPurchase"
                      class="px-6 py-4 theme-btn-primary font-bold rounded-xl transition-colors disabled:cursor-not-allowed disabled:opacity-50">
                      {{ t('productDetail.buyNow') }}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        <!-- Details Content Card -->
        <div v-if="product.content"
          class="theme-panel backdrop-blur-xl border rounded-3xl overflow-hidden mb-12 p-8 lg:p-12 relative">
          <h2
            class="text-2xl font-bold mb-8 theme-text-primary flex items-center gap-3 border-b theme-border pb-6">
            <span class="w-1.5 h-8 theme-accent-stick rounded-full"></span>
            {{ t('productDetail.details') }}
          </h2>
          <div v-html="processHtmlForDisplay(getLocalizedText(product.content))"
            class="prose prose-gray dark:prose-invert prose-lg max-w-none theme-prose">
          </div>
        </div>

        <!-- Back Button -->
        <div class="mb-12 text-center">
          <router-link to="/products"
            class="inline-flex items-center space-x-2 theme-link-muted transition-colors border-b border-transparent hover:border-current pb-1">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>{{ t('productDetail.backToProducts') }}</span>
          </router-link>
        </div>
      </div>

      <!-- Error State -->
      <div v-else
        class="text-center py-24 theme-panel rounded-3xl border backdrop-blur-sm">
        <svg class="w-20 h-20 mx-auto theme-text-muted mb-6" fill="none" stroke="currentColor"
          viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="theme-text-muted text-xl mb-8">
          {{ t('productDetail.notFound') }}
        </p>
        <router-link to="/products"
          class="inline-block theme-btn-primary px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform">
          {{ t('productDetail.backToProducts') }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '../stores/app'
import { productAPI } from '../api'
import { getImageUrl } from '../utils/image'
import { processHtmlForDisplay } from '../utils/content'
import { useCartStore } from '../stores/cart'
import { useUserAuthStore } from '../stores/userAuth'
import { debounceAsync } from '../utils/debounce'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const appStore = useAppStore()
const cartStore = useCartStore()
const userAuthStore = useUserAuthStore()

const loading = ref(true)
const product = ref<any>(null)
const currentImage = ref<string>('')

const purchaseType = computed(() => product.value?.purchase_type || 'member')
const requiresLogin = computed(() => purchaseType.value === 'member' && !userAuthStore.isAuthenticated)
const canPurchase = computed(() => {
  if (!product.value) return false
  if (product.value.is_sold_out) return false
  return product.value.stock_status !== 'out_of_stock'
})
const cannotPurchaseReason = computed(() => {
  if (!product.value) return ''
  if (requiresLogin.value) return ''
  if (canPurchase.value) return ''
  return t('productDetail.stockUnavailable')
})
const categoryName = computed(() => {
  const category = product.value?.category?.name
  return category ? getLocalizedText(category) : ''
})

const images = computed(() => {
  if (!product.value?.images) return []
  // 处理不同的数据格式
  let imageArray: string[] = []
  if (Array.isArray(product.value.images)) {
    imageArray = product.value.images
  } else if (product.value.images.images && Array.isArray(product.value.images.images)) {
    imageArray = product.value.images.images
  }
  // 将所有图片路径转换为完整 URL
  return imageArray.map(img => getImageUrl(img))
})

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

const getStockStatusLabel = (payload: any) => {
  const status = payload?.stock_status || ''
  if (status === 'unlimited') return t('products.stockStatus.unlimited')
  if (status === 'out_of_stock') return t('products.stockStatus.outOfStock')
  if (status === 'low_stock') {
    const count = Number(payload?.fulfillment_type === 'manual' ? payload?.manual_stock_available : payload?.auto_stock_available)
    if (Number.isFinite(count) && count > 0) {
      return t('products.stockStatus.lowStockCount', { count })
    }
    return t('products.stockStatus.lowStock')
  }
  return t('products.stockStatus.inStock')
}

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

const getPromotionPriceAmount = (payload: any) => payload?.promotion_price_amount

const hasPromotionPrice = (payload: any) => {
  if (!payload) return false
  const original = parsePriceAmount(payload.price_amount)
  const promotion = parsePriceAmount(payload.promotion_price_amount)
  if (original === null || promotion === null) return false
  return promotion >= 0 && promotion < original
}

const getPromotionSaveAmount = (payload: any) => {
  const original = parsePriceAmount(payload?.price_amount)
  const promotion = parsePriceAmount(payload?.promotion_price_amount)
  if (original === null || promotion === null || promotion >= original) {
    return '0.00'
  }
  return (original - promotion).toFixed(2)
}

const addToCart = () => {
  if (!product.value) return
  if (!canPurchase.value) return
  if (requiresLogin.value) {
    router.push(`/auth/login?redirect=${encodeURIComponent(route.fullPath)}`)
    return
  }
  cartStore.addItem({
    productId: product.value.id,
    slug: product.value.slug,
    title: product.value.title,
    priceAmount: product.value.price_amount,
    priceCurrency: product.value.price_currency,
    image: images.value[0],
    purchaseType: product.value.purchase_type,
    fulfillmentType: product.value.fulfillment_type,
    manualFormSchema: product.value.manual_form_schema || {},
    quantity: 1,
  })
}

const buyNow = () => {
  if (!canPurchase.value) return
  addToCart()
  router.push('/checkout')
}

const goLogin = () => {
  router.push(`/auth/login?redirect=${encodeURIComponent(route.fullPath)}`)
}

const loadProduct = async () => {
  loading.value = true
  try {
    const slug = route.params.slug as string
    const response = await productAPI.detail(slug)
    product.value = response.data.data || null
    if (images.value.length > 0) {
      currentImage.value = images.value[0] || ''
    }
  } catch (error) {
    console.error('Failed to load product:', error)
    product.value = null
  } finally {
    loading.value = false
  }
}

const debouncedLoadProduct = debounceAsync(loadProduct, 300)

onMounted(() => {
  debouncedLoadProduct()
})

onUnmounted(() => {
  debouncedLoadProduct.cancel()
})
</script>
