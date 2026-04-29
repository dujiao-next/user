<template>
  <div
    class="product-detail-page min-h-screen theme-page pt-24 pb-16">
    <div class="container mx-auto px-4">
      <!-- Loading Skeleton -->
      <div v-if="loading" class="space-y-8">
        <div class="h-5 w-48 rounded theme-skeleton"></div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-0 theme-panel border rounded-3xl overflow-hidden">
          <div class="p-4 md:p-8 theme-surface-soft border-r theme-border">
            <div class="h-[300px] md:h-[500px] rounded-xl theme-skeleton"></div>
            <div class="mt-4 flex gap-3 overflow-hidden">
              <div v-for="i in 4" :key="i" class="w-16 h-16 rounded-lg theme-skeleton shrink-0"></div>
            </div>
          </div>
          <div class="p-6 md:p-12 space-y-6">
            <div class="h-3 w-24 rounded theme-skeleton"></div>
            <div class="h-10 w-3/4 rounded theme-skeleton"></div>
            <div class="flex gap-2">
              <div class="h-6 w-16 rounded-full theme-skeleton"></div>
              <div class="h-6 w-16 rounded-full theme-skeleton"></div>
              <div class="h-6 w-16 rounded-full theme-skeleton"></div>
            </div>
            <div class="h-14 w-48 rounded theme-skeleton"></div>
            <div class="h-4 w-full rounded theme-skeleton"></div>
            <div class="h-4 w-2/3 rounded theme-skeleton"></div>
            <div class="flex gap-4 mt-8">
              <div class="h-14 flex-1 rounded-xl theme-skeleton"></div>
              <div class="h-14 flex-1 rounded-xl theme-skeleton"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Product Content -->
      <div v-else-if="product">
        <BreadcrumbNav
          class="mb-8"
          :items="[
            { label: t('nav.home'), to: '/' },
            { label: t('nav.products'), to: '/products' },
            { label: getLocalizedText(product.title) },
          ]"
        />

        <!-- Main Info Card -->
        <div
          class="theme-panel backdrop-blur-xl border rounded-3xl overflow-hidden mb-8 shadow-2xl">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <!-- Product Images (Left) -->
            <ProductImageGallery
              :images="images"
              :current-image="currentImage"
              :product-title="getLocalizedText(product.title)"
              @update:current-image="currentImage = $event"
            />

            <!-- Product Info (Right) -->
            <div class="p-6 md:p-8 lg:p-12 flex flex-col justify-center">
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

                <h1 class="mb-4 text-2xl md:text-3xl lg:text-5xl font-black leading-tight theme-text-primary">
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

                <div class="mb-8 border-b theme-border pb-8" ref="priceSection">
                  <div class="mb-3 flex flex-wrap items-center gap-2">
                    <span class="text-sm theme-text-muted">{{ t('products.price') }}</span>
                    <span v-if="(selectedSku && hasSkuPromotionPrice(selectedSku)) || (!selectedSku && hasPromotionPrice(product))" class="theme-badge theme-badge-danger">
                      {{ t('products.promotionTag') }}
                    </span>
                    <span v-if="hasMemberPrice" class="theme-badge bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                      {{ t('products.memberPriceTag') }}
                    </span>
                  </div>
                  <!-- 选中 SKU 且有促销价 -->
                  <div v-if="selectedSku && hasSkuPromotionPrice(selectedSku)" class="space-y-2">
                    <div class="flex flex-wrap items-end gap-4">
                      <span v-if="hasMemberPrice && selectedSkuMemberPrice! < Number(getSkuPromotionPriceAmount(selectedSku))" class="theme-price-lg text-amber-600 dark:text-amber-300">
                        {{ formatPrice(selectedSkuMemberPrice!, siteCurrency) }}
                      </span>
                      <span v-else class="theme-price-lg text-rose-600 dark:text-rose-300">
                        {{ formatPrice(getSkuPromotionPriceAmount(selectedSku), siteCurrency) }}
                      </span>
                      <span class="theme-price-original">
                        {{ formatPrice(selectedSku.price_amount, siteCurrency) }}
                      </span>
                    </div>
                    <p v-if="hasMemberPrice && selectedSkuMemberPrice! < Number(getSkuPromotionPriceAmount(selectedSku))" class="text-sm font-medium text-amber-600 dark:text-amber-300">
                      {{ t('products.memberPriceTag') }} · {{ t('products.saveAmount') }} {{ formatPrice(Number(selectedSku.price_amount) - selectedSkuMemberPrice!, siteCurrency) }}
                    </p>
                    <p v-else class="text-sm font-medium text-rose-500 dark:text-rose-300">
                      {{ t('products.saveAmount') }} {{ formatPrice(getSkuPromotionSaveAmount(selectedSku), siteCurrency) }}
                    </p>
                  </div>
                  <!-- 选中 SKU 有会员价但无促销价 -->
                  <div v-else-if="selectedSku && hasMemberPrice" class="space-y-2">
                    <div class="flex flex-wrap items-end gap-4">
                      <span class="theme-price-lg text-amber-600 dark:text-amber-300">
                        {{ formatPrice(selectedSkuMemberPrice!, siteCurrency) }}
                      </span>
                      <span class="theme-price-original">
                        {{ formatPrice(selectedSku.price_amount, siteCurrency) }}
                      </span>
                    </div>
                    <p class="text-sm font-medium text-amber-600 dark:text-amber-300">
                      {{ t('products.memberPriceTag') }} · {{ t('products.saveAmount') }} {{ formatPrice(Number(selectedSku.price_amount) - selectedSkuMemberPrice!, siteCurrency) }}
                    </p>
                  </div>
                  <!-- 选中 SKU 但无促销价也无会员价 -->
                  <div v-else-if="selectedSku" class="flex items-end gap-4">
                    <span class="theme-price-lg theme-text-accent">
                      {{ formatPrice(selectedSku.price_amount, siteCurrency) }}
                    </span>
                  </div>
                  <!-- 未选 SKU，产品级有促销价 -->
                  <div v-else-if="hasPromotionPrice(product)" class="space-y-2">
                    <div class="flex flex-wrap items-end gap-4">
                      <span class="theme-price-lg text-rose-600 dark:text-rose-300">
                        {{ formatPrice(getPromotionPriceAmount(product), siteCurrency) }}
                      </span>
                      <span class="theme-price-original">
                        {{ formatPrice(product.price_amount, siteCurrency) }}
                      </span>
                    </div>
                    <p class="text-sm font-medium text-rose-500 dark:text-rose-300">
                      {{ t('products.saveAmount') }} {{ formatPrice(getPromotionSaveAmount(product), siteCurrency) }}
                    </p>
                  </div>
                  <!-- 未选 SKU，无促销 -->
                  <div v-else class="flex items-end gap-4">
                    <span class="theme-price-lg theme-text-accent">
                      {{ formatPrice(product.price_amount, siteCurrency) }}
                    </span>
                  </div>
                </div>

                <!-- 活动规则展示 -->
                <div v-if="hasPromotionRules(product)" class="mb-8 rounded-xl border border-orange-200 dark:border-orange-800/50 bg-orange-50/50 dark:bg-orange-950/20 px-4 py-3">
                  <h2 class="mb-2 text-sm font-bold text-orange-700 dark:text-orange-300 flex items-center gap-1.5">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {{ t('products.promotionRulesTitle') }}
                  </h2>
                  <ul class="space-y-1">
                    <li v-for="rule in getPromotionRules(product)" :key="rule.id" class="text-sm text-orange-600 dark:text-orange-300/90 flex items-center gap-1.5">
                      <span class="w-1 h-1 rounded-full bg-orange-400 dark:bg-orange-500 shrink-0"></span>
                      <span>{{ formatPromotionRule(rule) }}</span>
                    </li>
                  </ul>
                </div>

                <div v-if="activeSkus.length" class="mb-8">
                  <h2 class="mb-3 text-sm font-bold uppercase tracking-widest theme-text-muted">
                    {{ t('productDetail.skuTitle') }}
                  </h2>
                  <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button
                      v-for="sku in activeSkus"
                      :key="sku.id"
                      type="button"
                      class="flex flex-col items-start rounded-xl border px-3 py-2 text-sm transition-all min-h-[44px]"
                      :class="[
                        normalizeSkuId(sku.id) === selectedSkuId ? 'theme-selected-surface ring-1 ring-primary/30' : 'theme-btn-secondary',
                        isSkuPurchasable(sku) ? 'hover:-translate-y-0.5' : 'cursor-not-allowed opacity-55 border-dashed',
                      ]"
                      :disabled="!isSkuPurchasable(sku)"
                      @click="selectedSkuId = normalizeSkuId(sku.id)"
                    >
                      <span class="font-semibold leading-tight">{{ skuDisplayText(sku) }}</span>
                      <span
                        class="mt-1 rounded-full border px-2 py-0.5 text-[11px]"
                        :class="skuStockBadgeClass(sku)"
                      >
                        {{ skuStockText(sku) }}
                      </span>
                    </button>
                  </div>
                  <p v-if="requiresSKUSelection" class="mt-2 text-xs text-amber-500">
                    {{ t('productDetail.skuRequired') }}
                  </p>
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

              <!-- Quantity Selector -->
                <div class="mb-8">
                  <h2 class="mb-3 text-sm font-bold uppercase tracking-widest theme-text-muted">
                    {{ t('productDetail.quantity') }}
                  </h2>
                  <div class="flex items-center rounded-lg border theme-border overflow-hidden w-fit">
                    <button
                      type="button"
                      class="w-10 h-10 flex items-center justify-center theme-text-secondary hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-30"
                      :disabled="quantity <= quantityEffectiveMin"
                      @click="quantity = Math.max(quantityEffectiveMin, quantity - 1)"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                        <path stroke-linecap="round" d="M20 12H4" />
                      </svg>
                    </button>
                    <input
                      type="text"
                      inputmode="numeric"
                      class="w-14 h-10 text-center text-sm font-semibold theme-text-primary border-x theme-border bg-transparent outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      :value="quantity"
                      @change="handleQuantityInput($event)"
                      @keydown.enter.prevent="($event.target as HTMLInputElement)?.blur()"
                    />
                    <button
                      type="button"
                      class="w-10 h-10 flex items-center justify-center theme-text-secondary hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-30"
                      :disabled="quantityEffectiveLimit !== null && quantity >= quantityEffectiveLimit"
                      @click="quantity = quantity + 1"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                        <path stroke-linecap="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>

              <!-- Purchase Actions (Desktop + original position) -->
              <div ref="purchaseActionsRef" class="mt-auto space-y-6">
                <p v-if="cannotPurchaseReason" class="rounded-xl border theme-alert-danger px-4 py-3 text-sm font-semibold">
                  {{ cannotPurchaseReason }}
                </p>
                <p v-if="purchaseWarning" class="rounded-xl border theme-alert-warning px-4 py-3 text-sm font-semibold">
                  {{ purchaseWarning }}
                </p>

                <div class="space-y-3">
                  <button v-if="requiresLogin" @click="goLogin"
                    class="w-full px-6 py-4 theme-btn-primary font-bold rounded-xl transition-colors min-h-[48px]">
                    {{ t('productDetail.loginToBuy') }}
                  </button>
                  <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button @click="addToCart" :disabled="!canPurchase"
                      class="px-6 py-4 border theme-btn-secondary font-bold rounded-xl cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 min-h-[48px]">
                      {{ t('productDetail.addToCart') }}
                    </button>
                    <button @click="buyNow" :disabled="!canPurchase"
                      class="px-6 py-4 theme-btn-primary font-bold rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 min-h-[48px]">
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
          class="theme-panel backdrop-blur-xl border rounded-3xl overflow-hidden mb-12 p-6 md:p-8 lg:p-12 relative">
          <h2
            class="text-2xl font-bold mb-8 theme-text-primary flex items-center gap-3 border-b theme-border pb-6">
            <span class="w-1.5 h-8 theme-accent-stick rounded-full"></span>
            {{ t('productDetail.details') }}
          </h2>
          <div v-html="processHtmlForDisplay(getLocalizedText(product.content))"
            class="prose prose-gray dark:prose-invert prose-lg max-w-none theme-prose">
          </div>
        </div>

        <!-- Related Posts -->
        <section v-if="relatedPosts.length"
          class="theme-panel backdrop-blur-xl border rounded-3xl overflow-hidden mb-12 p-6 md:p-8 lg:p-12 relative">
          <h2 class="text-2xl font-bold theme-text-primary mb-8 flex items-center gap-3 border-b theme-border pb-6">
            <span class="w-1.5 h-8 theme-accent-stick rounded-full"></span>
            {{ t('productDetail.relatedPosts') }}
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <router-link
              v-for="rp in relatedPosts"
              :key="rp.id"
              :to="`/blog/${rp.slug}`"
              class="group theme-panel-soft backdrop-blur-md border rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all flex flex-col"
            >
              <div v-if="rp.thumbnail" class="h-32 overflow-hidden relative">
                <img :src="getImageUrl(rp.thumbnail)" :alt="getLocalizedText(rp.title)" loading="lazy"
                  class="h-full w-full object-cover transition-transform group-hover:scale-110" />
              </div>
              <div class="p-5 flex flex-col flex-1">
                <h3 class="font-semibold theme-text-primary line-clamp-2 mb-2">{{ getLocalizedText(rp.title) }}</h3>
                <p v-if="rp.summary" class="text-sm theme-text-secondary line-clamp-2 leading-relaxed mb-3">
                  {{ getLocalizedText(rp.summary) }}
                </p>
                <time class="mt-auto text-xs theme-text-muted font-mono">
                  {{ formatRelatedPostDate(rp.published_at) }}
                </time>
              </div>
            </router-link>
          </div>
        </section>

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

        <!-- Mobile Fixed Purchase Bar -->
        <ProductMobileBar
          :visible="showMobileBar && !!product && !loading"
          :requires-login="requiresLogin"
          :can-purchase="canPurchase"
          :show-member-price="mobileBarShowMemberPrice"
          :member-price-display="mobileBarMemberPriceDisplay"
          :show-sku-promotion-price="mobileBarShowSkuPromotionPrice"
          :sku-promotion-price-display="mobileBarSkuPromotionPriceDisplay"
          :show-sku-price="mobileBarShowSkuPrice"
          :sku-price-display="mobileBarSkuPriceDisplay"
          :show-product-promotion-price="mobileBarShowProductPromotionPrice"
          :product-promotion-price-display="mobileBarProductPromotionPriceDisplay"
          :product-price-display="mobileBarProductPriceDisplay"
          @add-to-cart="addToCart"
          @buy-now="buyNow"
          @go-login="goLogin"
        />
      </div>

      <!-- Error State -->
      <EmptyState
        v-else
        size="lg"
        icon="alert"
        :title="t('productDetail.notFound')"
      >
        <template #action>
          <button
            @click="loadProduct"
            class="inline-flex items-center gap-2 theme-btn-primary px-6 py-2.5 rounded-full font-semibold transition-transform hover:scale-105"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ t('errorBoundary.retry') }}
          </button>
          <router-link
            to="/products"
            class="inline-flex items-center border theme-btn-secondary px-6 py-2.5 rounded-full font-semibold transition-transform hover:scale-105"
          >
            {{ t('productDetail.backToProducts') }}
          </router-link>
        </template>
      </EmptyState>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '../stores/app'
import { productAPI } from '../api'
import { getImageUrl } from '../utils/image'
import { processHtmlForDisplay } from '../utils/content'
import { useCartStore } from '../stores/cart'
import { useBuyNowStore } from '../stores/buyNow'
import { useUserAuthStore } from '../stores/userAuth'
import { debounceAsync } from '../utils/debounce'
import { useHead } from '@unhead/vue'
// centsToAmount used internally by composable
import { buildSkuDisplayText, normalizeSkuId } from '../utils/sku'
import { useLocalized, useProductLabels } from '../composables/useProduct'
import { toast } from '../composables/useToast'
import ProductImageGallery from '../components/product/ProductImageGallery.vue'
import ProductMobileBar from '../components/product/ProductMobileBar.vue'
import BreadcrumbNav from '../components/BreadcrumbNav.vue'
import EmptyState from '../components/EmptyState.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const appStore = useAppStore()
const cartStore = useCartStore()
const buyNowStore = useBuyNowStore()
const userAuthStore = useUserAuthStore()

const { getLocalizedText, siteCurrency, formatPrice } = useLocalized()
const { getPurchaseTypeLabel, getFulfillmentTypeLabel, getStockBadgeClass, getStockStatusLabel, hasPromotionPrice, getPromotionPriceAmount, getPromotionSaveAmount, hasSkuPromotionPrice, getSkuPromotionPriceAmount, getSkuPromotionSaveAmount, hasPromotionRules, getPromotionRules } = useProductLabels()

const formatPromotionRule = (rule: any) => {
  const amount = formatPrice(rule.min_amount, siteCurrency.value)
  const value = rule.type === 'percent' ? String(rule.value) : formatPrice(rule.value, siteCurrency.value)
  const hasMin = Number(rule.min_amount) > 0
  switch (rule.type) {
    case 'percent':
      return hasMin ? t('products.promotionHintPercent', { amount, value }) : t('products.promotionHintPercentNoMin', { value })
    case 'fixed':
      return hasMin ? t('products.promotionHintFixed', { amount, value }) : t('products.promotionHintFixedNoMin', { value })
    case 'special_price':
      return hasMin ? t('products.promotionHintSpecial', { amount, value }) : t('products.promotionHintSpecialNoMin', { value })
    default:
      return rule.name || ''
  }
}

const loading = ref(true)
const product = ref<any>(null)
const relatedPosts = computed<any[]>(() => product.value?.related_posts || [])
const formatRelatedPostDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString(appStore.locale, { year: 'numeric', month: 'long', day: 'numeric' })
}
const currentImage = ref<string>('')
const selectedSkuId = ref(0)
const quantity = ref(1)
const purchaseWarning = ref('')
const purchaseActionsRef = ref<HTMLElement | null>(null)
const showMobileBar = ref(false)
let observer: IntersectionObserver | null = null

const activeSkus = computed(() => {
  const rows = Array.isArray(product.value?.skus) ? product.value.skus : []
  return rows.filter((sku: any) => Boolean(sku?.is_active))
})

const selectedSku = computed(() => {
  if (selectedSkuId.value <= 0) return null
  return activeSkus.value.find((sku: any) => normalizeSkuId(sku?.id) === selectedSkuId.value) || null
})

// 会员价相关
const userMemberLevelId = computed(() => {
  return Number(userAuthStore.user?.member_level_id || 0)
})

const getMemberPriceForSku = (skuId: number): number | null => {
  if (!product.value?.member_prices || !userMemberLevelId.value) return null
  const prices = product.value.member_prices as Array<{ member_level_id: number; sku_id: number; price_amount: number | string }>
  // SKU-level override
  const skuPrice = prices.find((p) => p.member_level_id === userMemberLevelId.value && p.sku_id === skuId)
  if (skuPrice) return Number(skuPrice.price_amount)
  // Product-level override (sku_id = 0)
  const productPrice = prices.find((p) => p.member_level_id === userMemberLevelId.value && p.sku_id === 0)
  if (productPrice) return Number(productPrice.price_amount)
  return null
}

const selectedSkuMemberPrice = computed(() => {
  if (!selectedSku.value) return null
  const skuId = normalizeSkuId(selectedSku.value.id)
  return getMemberPriceForSku(skuId)
})

const hasMemberPrice = computed(() => {
  if (!selectedSkuMemberPrice.value) return false
  const basePrice = Number(selectedSku.value?.price_amount || 0)
  return selectedSkuMemberPrice.value < basePrice
})

const normalizeStockNumber = (value: unknown) => {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return 0
  return Math.max(Math.floor(numberValue), 0)
}

const normalizeManualStockTotal = (value: unknown) => {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return 0
  const integerValue = Math.floor(numberValue)
  if (integerValue === -1) return -1
  return Math.max(integerValue, 0)
}

const normalizeOptionalLimitNumber = (value: unknown) => {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return null
  const integerValue = Math.floor(numberValue)
  if (integerValue <= 0) return null
  return integerValue
}

const shouldEnforceSkuStock = (sku: any) => {
  if (!sku) return false
  if (product.value?.fulfillment_type === 'auto') return true
  if (product.value?.fulfillment_type === 'upstream') return true
  if (product.value?.fulfillment_type !== 'manual') return false
  const total = normalizeManualStockTotal(sku?.manual_stock_total)
  if (total === -1) return false
  return true
}

const skuAvailableStock = (sku: any) => {
  if (!shouldEnforceSkuStock(sku)) return null
  if (product.value?.fulfillment_type === 'upstream') {
    const upstreamStock = Number(sku?.upstream_stock ?? 0)
    if (upstreamStock === -1) return null
    return Math.max(upstreamStock, 0)
  }
  if (product.value?.fulfillment_type === 'auto') {
    const autoStock = Number(sku?.auto_stock_available ?? 0)
    if (autoStock < 0) return null
    return normalizeStockNumber(autoStock)
  }
  const total = normalizeManualStockTotal(sku?.manual_stock_total)
  if (total === -1) return null
  return total
}

const isSkuPurchasable = (sku: any) => {
  const available = skuAvailableStock(sku)
  if (available === null) return true
  return available > 0
}

const skuStockText = (sku: any) => {
  const available = skuAvailableStock(sku)
  if (available === null) return t('productDetail.skuStockUnlimited')
  if (available <= 0) return t('productDetail.skuStockOut')
  return t('productDetail.skuStockRemaining', { count: available })
}

const skuStockBadgeClass = (sku: any) => {
  const available = skuAvailableStock(sku)
  if (available === null) return 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'
  if (available <= 0) return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-700 dark:bg-rose-950/30 dark:text-rose-300'
  if (available <= 5) return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-300'
  return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
}

const quantityEffectiveLimit = computed(() => {
  const sku = selectedSku.value
  const available = skuAvailableStock(sku)
  const productLimit = normalizeOptionalLimitNumber(product.value?.max_purchase_quantity)
  let limit: number | null = productLimit
  if (available !== null) {
    limit = limit === null ? available : Math.min(limit, available)
  }
  return limit
})

const quantityEffectiveMin = computed(() => {
  const productMin = normalizeOptionalLimitNumber(product.value?.min_purchase_quantity)
  return productMin && productMin > 0 ? productMin : 1
})

const handleQuantityInput = (event: Event) => {
  const val = parseInt((event.target as HTMLInputElement).value, 10)
  const minimum = quantityEffectiveMin.value
  if (isNaN(val) || val < minimum) {
    quantity.value = minimum
  } else if (quantityEffectiveLimit.value !== null && val > quantityEffectiveLimit.value) {
    quantity.value = quantityEffectiveLimit.value
  } else {
    quantity.value = val
  }
}

const purchaseType = computed(() => product.value?.purchase_type || 'member')
const requiresLogin = computed(() => purchaseType.value === 'member' && !userAuthStore.isAuthenticated)
const requiresSKUSelection = computed(() => activeSkus.value.length > 1 && !selectedSku.value)
const stockBelowMinPurchase = computed(() => {
  const limit = quantityEffectiveLimit.value
  if (limit === null) return false
  return limit < quantityEffectiveMin.value
})
const canPurchase = computed(() => {
  if (!product.value) return false
  if (activeSkus.value.length === 0) return false
  if (product.value.is_sold_out) return false
  if (requiresSKUSelection.value) return false
  if (product.value.stock_status === 'out_of_stock') return false
  if (selectedSku.value && !isSkuPurchasable(selectedSku.value)) return false
  if (stockBelowMinPurchase.value) return false
  return true
})
const cannotPurchaseReason = computed(() => {
  if (!product.value) return ''
  if (requiresLogin.value) return ''
  if (requiresSKUSelection.value) return t('productDetail.skuRequired')
  if (stockBelowMinPurchase.value) return t('productDetail.stockBelowMinPurchase', { count: quantityEffectiveMin.value })
  if (canPurchase.value) return ''
  return t('productDetail.stockUnavailable')
})
const categoryName = computed(() => {
  const category = product.value?.category?.name
  return category ? getLocalizedText(category) : ''
})

const images = computed(() => {
  if (!product.value?.images) return []
  let imageArray: string[] = []
  if (Array.isArray(product.value.images)) {
    imageArray = product.value.images
  } else if (product.value.images.images && Array.isArray(product.value.images.images)) {
    imageArray = product.value.images.images
  }
  return imageArray.map(img => getImageUrl(img))
})

const skuDisplayText = (sku: any) => {
  return buildSkuDisplayText({
    skuCode: sku?.sku_code,
    specValues: sku?.spec_values,
    fallback: t('productDetail.skuFallback'),
    locale: appStore.locale,
  })
}

const syncSelectedSku = () => {
  const rows = activeSkus.value
  if (rows.length === 0) {
    selectedSkuId.value = 0
    return
  }
  if (rows.length === 1) {
    selectedSkuId.value = normalizeSkuId(rows[0]?.id)
    return
  }
  if (rows.some((sku: any) => normalizeSkuId(sku?.id) === selectedSkuId.value)) {
    return
  }
  const firstAvailable = rows.find((sku: any) => isSkuPurchasable(sku))
  if (firstAvailable) {
    selectedSkuId.value = normalizeSkuId(firstAvailable?.id)
    return
  }
  selectedSkuId.value = normalizeSkuId(rows[0]?.id)
}

const selectedCartQuantity = () => {
  if (!product.value || !selectedSku.value) return 0
  const productId = Number(product.value.id || 0)
  const skuId = normalizeSkuId(selectedSku.value?.id)
  if (productId <= 0 || skuId <= 0) return 0
  const matched = cartStore.items.find((item) => item.productId === productId && normalizeSkuId(item.skuId) === skuId)
  return Number(matched?.quantity || 0)
}

const addToCart = () => {
  if (!product.value) return
  if (!canPurchase.value) return
  purchaseWarning.value = ''
  if (requiresLogin.value) {
    router.push(`/auth/login?redirect=${encodeURIComponent(route.fullPath)}`)
    return
  }
  const sku = selectedSku.value
  const available = skuAvailableStock(sku)
  const cartQty = selectedCartQuantity()
  const nextQuantity = cartQty + quantity.value
  const productLimit = normalizeOptionalLimitNumber(product.value?.max_purchase_quantity)
  let effectiveLimit: number | null = productLimit
  if (available !== null) {
    effectiveLimit = effectiveLimit === null ? available : Math.min(effectiveLimit, available)
  }
  if (effectiveLimit !== null && nextQuantity > effectiveLimit) {
    if (available !== null && effectiveLimit === available && (productLimit === null || available <= productLimit)) {
      purchaseWarning.value = available > 0
        ? (cartQty > 0
            ? t('productDetail.addCartStockExceededWithCart', { count: available, cartCount: cartQty })
            : t('productDetail.addCartStockExceeded', { count: available }))
        : t('productDetail.stockUnavailable')
      return
    }
    purchaseWarning.value = cartQty > 0
      ? t('productDetail.addCartLimitExceededWithCart', { count: effectiveLimit, cartCount: cartQty })
      : t('productDetail.addCartLimitExceeded', { count: effectiveLimit })
    return
  }
  cartStore.addItem({
    productId: product.value.id,
    skuId: normalizeSkuId(sku?.id),
    skuCode: String(sku?.sku_code || ''),
    skuSpecValues: (sku?.spec_values && typeof sku.spec_values === 'object') ? sku.spec_values : undefined,
    skuManualStockTotal: normalizeManualStockTotal(sku?.manual_stock_total),
    skuManualStockLocked: normalizeStockNumber(sku?.manual_stock_locked),
    skuManualStockSold: normalizeStockNumber(sku?.manual_stock_sold),
    skuAutoStockAvailable: normalizeStockNumber(sku?.auto_stock_available),
    skuUpstreamStock: normalizeManualStockTotal(sku?.upstream_stock),
    skuStockEnforced: shouldEnforceSkuStock(sku),
    slug: product.value.slug,
    title: product.value.title,
    priceAmount: String(sku?.price_amount || product.value.price_amount || '0.00'),
    image: images.value[0],
    minPurchaseQuantity: normalizeOptionalLimitNumber(product.value.min_purchase_quantity) ?? undefined,
    maxPurchaseQuantity: normalizeOptionalLimitNumber(product.value.max_purchase_quantity) ?? undefined,
    purchaseType: product.value.purchase_type,
    fulfillmentType: product.value.fulfillment_type,
    manualFormSchema: product.value.manual_form_schema || {},
    paymentChannelIds: Array.isArray(product.value.payment_channel_ids) && product.value.payment_channel_ids.length > 0 ? product.value.payment_channel_ids : undefined,
    quantity: quantity.value,
  }, quantity.value)
  toast.success(t('toast.addedToCart'))
}

const buyNow = () => {
  purchaseWarning.value = ''
  if (!canPurchase.value) return
  if (!product.value) return
  if (requiresLogin.value) {
    router.push(`/auth/login?redirect=${encodeURIComponent(route.fullPath)}`)
    return
  }

  const sku = selectedSku.value
  const available = skuAvailableStock(sku)
  const productLimit = normalizeOptionalLimitNumber(product.value?.max_purchase_quantity)
  let limit: number | null = productLimit
  if (available !== null) {
    limit = limit === null ? available : Math.min(limit, available)
  }
  if (limit !== null && quantity.value > limit) {
    purchaseWarning.value = available !== null && limit === available
      ? (available > 0 ? t('productDetail.addCartStockExceeded', { count: available }) : t('productDetail.stockUnavailable'))
      : t('productDetail.addCartLimitExceeded', { count: limit })
    return
  }

  buyNowStore.setItem({
    productId: product.value.id,
    skuId: normalizeSkuId(sku?.id),
    skuCode: String(sku?.sku_code || ''),
    skuSpecValues: (sku?.spec_values && typeof sku.spec_values === 'object') ? sku.spec_values : undefined,
    skuManualStockTotal: normalizeManualStockTotal(sku?.manual_stock_total),
    skuManualStockLocked: normalizeStockNumber(sku?.manual_stock_locked),
    skuManualStockSold: normalizeStockNumber(sku?.manual_stock_sold),
    skuAutoStockAvailable: normalizeStockNumber(sku?.auto_stock_available),
    skuUpstreamStock: normalizeManualStockTotal(sku?.upstream_stock),
    skuStockEnforced: shouldEnforceSkuStock(sku),
    slug: product.value.slug,
    title: product.value.title,
    priceAmount: String(sku?.price_amount || product.value.price_amount || '0.00'),
    image: images.value[0],
    minPurchaseQuantity: normalizeOptionalLimitNumber(product.value.min_purchase_quantity) ?? undefined,
    maxPurchaseQuantity: normalizeOptionalLimitNumber(product.value.max_purchase_quantity) ?? undefined,
    purchaseType: product.value.purchase_type,
    fulfillmentType: product.value.fulfillment_type,
    manualFormSchema: product.value.manual_form_schema || {},
    paymentChannelIds: Array.isArray(product.value.payment_channel_ids) && product.value.payment_channel_ids.length > 0 ? product.value.payment_channel_ids : undefined,
    quantity: quantity.value,
  })
  router.push('/checkout?mode=buynow')
}

// Mobile bar price display computed properties
const mobileBarShowMemberPrice = computed(() => {
  if (!selectedSku.value || !hasMemberPrice.value) return false
  const promoPrice = hasSkuPromotionPrice(selectedSku.value) ? getSkuPromotionPriceAmount(selectedSku.value) : selectedSku.value.price_amount
  return selectedSkuMemberPrice.value! < Number(promoPrice)
})
const mobileBarMemberPriceDisplay = computed(() => {
  if (!selectedSkuMemberPrice.value) return ''
  return formatPrice(selectedSkuMemberPrice.value, siteCurrency.value)
})
const mobileBarShowSkuPromotionPrice = computed(() => {
  if (mobileBarShowMemberPrice.value) return false
  return !!selectedSku.value && hasSkuPromotionPrice(selectedSku.value)
})
const mobileBarSkuPromotionPriceDisplay = computed(() => {
  if (!selectedSku.value) return ''
  return formatPrice(getSkuPromotionPriceAmount(selectedSku.value), siteCurrency.value)
})
const mobileBarShowSkuPrice = computed(() => {
  if (mobileBarShowMemberPrice.value || mobileBarShowSkuPromotionPrice.value) return false
  return !!selectedSku.value
})
const mobileBarSkuPriceDisplay = computed(() => {
  if (!selectedSku.value) return ''
  return formatPrice(selectedSku.value.price_amount, siteCurrency.value)
})
const mobileBarShowProductPromotionPrice = computed(() => {
  if (selectedSku.value) return false
  return product.value ? hasPromotionPrice(product.value) : false
})
const mobileBarProductPromotionPriceDisplay = computed(() => {
  if (!product.value) return ''
  return formatPrice(getPromotionPriceAmount(product.value), siteCurrency.value)
})
const mobileBarProductPriceDisplay = computed(() => {
  if (!product.value) return ''
  return formatPrice(product.value.price_amount, siteCurrency.value)
})

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
    syncSelectedSku()
    // Setup IntersectionObserver after product loads
    await nextTick()
    setupMobileBarObserver()
  } catch (error) {
    console.error('Failed to load product:', error)
    product.value = null
    selectedSkuId.value = 0
  } finally {
    loading.value = false
  }
}

const setupMobileBarObserver = () => {
  if (observer) observer.disconnect()
  if (!purchaseActionsRef.value) return
  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (entry) {
        showMobileBar.value = !entry.isIntersecting
      }
    },
    { threshold: 0.1 }
  )
  observer.observe(purchaseActionsRef.value)
}

const debouncedLoadProduct = debounceAsync(loadProduct, 300)

const canonicalUrl = computed(() => {
  if (!product.value?.slug) return ''
  return `${window.location.origin}/products/${product.value.slug}`
})

useHead({
  title: () => product.value ? getLocalizedText(product.value.title) : '',
  link: () => {
    if (!canonicalUrl.value) return []
    return [{ rel: 'canonical', href: canonicalUrl.value }]
  },
  meta: () => {
    if (!product.value) return []
    const seoMeta = product.value.seo_meta || {}
    const seoKeywords = getLocalizedText(seoMeta.keywords) || (typeof seoMeta.keywords === 'string' ? seoMeta.keywords : '')
    const seoDescription = getLocalizedText(seoMeta.description) || (typeof seoMeta.description === 'string' ? seoMeta.description : '')
    const tags = []

    if (seoKeywords) tags.push({ name: 'keywords', content: seoKeywords })
    if (seoDescription) tags.push({ name: 'description', content: seoDescription })

    tags.push({ property: 'og:type', content: 'product' })
    if (product.value.title) {
      tags.push({ property: 'og:title', content: getLocalizedText(product.value.title) })
    }
    if (seoDescription) {
      tags.push({ property: 'og:description', content: seoDescription })
    }
    if (images.value && images.value.length > 0) {
      tags.push({ property: 'og:image', content: images.value[0] })
    }
    if (canonicalUrl.value) {
      tags.push({ property: 'og:url', content: canonicalUrl.value })
    }

    tags.push({ name: 'twitter:card', content: 'summary_large_image' })
    if (product.value.title) {
      tags.push({ name: 'twitter:title', content: getLocalizedText(product.value.title) })
    }
    if (seoDescription) {
      tags.push({ name: 'twitter:description', content: seoDescription })
    }
    if (images.value && images.value.length > 0) {
      tags.push({ name: 'twitter:image', content: images.value[0] })
    }

    return tags
  },
  script: () => {
    if (!product.value) return []
    const title = getLocalizedText(product.value.title)
    const seoMeta = product.value.seo_meta || {}
    const description = getLocalizedText(seoMeta.description) || (typeof seoMeta.description === 'string' ? seoMeta.description : '')
    const priceAmount = product.value.price_amount || '0'
    const currency = siteCurrency.value || 'CNY'

    const jsonLd: Record<string, any> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: title,
      url: canonicalUrl.value || window.location.href,
      offers: {
        '@type': 'Offer',
        price: priceAmount,
        priceCurrency: currency,
        availability: product.value.stock_status === 'out_of_stock'
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
      },
    }
    if (description) jsonLd.description = description
    if (images.value.length > 0) jsonLd.image = images.value
    if (product.value.category?.name) {
      jsonLd.category = getLocalizedText(product.value.category.name)
    }

    return [{
      type: 'application/ld+json',
      innerHTML: JSON.stringify(jsonLd),
    }]
  },
})

onMounted(() => {
  loadProduct()
})

watch(
  () => selectedSkuId.value,
  () => {
    purchaseWarning.value = ''
    quantity.value = quantityEffectiveMin.value
  }
)

watch(quantityEffectiveMin, (minimum) => {
  if (minimum > quantity.value) {
    quantity.value = minimum
  }
})

watch(quantityEffectiveLimit, (limit) => {
  if (limit !== null && quantity.value > limit) {
    quantity.value = Math.max(quantityEffectiveMin.value, limit)
  }
})

onUnmounted(() => {
  debouncedLoadProduct.cancel()
  if (observer) {
    observer.disconnect()
    observer = null
  }
})
</script>
