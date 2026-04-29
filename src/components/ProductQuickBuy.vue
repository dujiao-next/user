<template>
  <Teleport to="body">
    <!-- Overlay -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        class="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
        @click="close"
      />
    </Transition>

    <!--
      Responsive panel:
      - Mobile (<md): bottom sheet, slides up
      - Desktop (md+): centered modal, fades + scales in
    -->
    <Transition
      enter-active-class="quick-buy-enter-active"
      enter-from-class="quick-buy-enter-from"
      enter-to-class="quick-buy-enter-to"
      leave-active-class="quick-buy-leave-active"
      leave-from-class="quick-buy-leave-from"
      leave-to-class="quick-buy-leave-to"
    >
      <div
        v-if="visible"
        class="fixed z-50 inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center md:p-6"
        @click.self="close"
      >
        <div
          role="dialog"
          aria-modal="true"
          class="
            w-full max-h-[85vh] flex flex-col
            rounded-t-2xl md:rounded-2xl
            theme-panel-strong border-t md:border theme-border
            shadow-2xl
            md:max-w-md md:max-h-[75vh]
          "
          @click.stop
        >
          <!-- Mobile drag handle -->
          <div class="md:hidden flex justify-center pt-2.5 pb-1 shrink-0">
            <div class="w-8 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
          </div>

          <!-- Desktop header bar -->
          <div class="hidden md:flex items-center justify-between px-5 pt-4 pb-0 shrink-0">
            <h2 class="text-sm font-semibold theme-text-primary">{{ t('quickBuy.title') }}</h2>
            <button
              type="button"
              class="p-1.5 -mr-1 rounded-lg theme-text-muted hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              @click="close"
            >
              <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Scrollable content area -->
          <div class="overflow-y-auto overscroll-contain flex-1 px-4 md:px-5 md:pt-4">
            <!-- Product header -->
            <div class="flex gap-3.5 mb-4">
              <!-- Image -->
              <div
                class="w-[90px] h-[90px] md:w-[100px] md:h-[100px] rounded-xl md:rounded-2xl overflow-hidden shrink-0 border theme-border cursor-pointer"
                @click="goToDetail"
              >
                <img
                  v-if="productImage"
                  :src="productImage"
                  :alt="productTitle"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center theme-surface-muted">
                  <svg class="w-7 h-7 theme-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0 flex flex-col">
                <h3
                  class="text-sm md:text-[15px] font-semibold theme-text-primary line-clamp-2 leading-snug cursor-pointer hover:underline decoration-gray-300 dark:decoration-gray-600 underline-offset-2"
                  @click="goToDetail"
                >
                  {{ productTitle }}
                </h3>

                <div class="mt-1.5 flex flex-wrap items-center gap-1">
                  <span
                    class="theme-badge text-[10px] px-1.5 py-px"
                    :class="product.fulfillment_type === 'auto' ? 'theme-badge-info' : 'theme-badge-neutral'"
                  >
                    {{ getFulfillmentTypeLabel(product.fulfillment_type) }}
                  </span>
                  <span
                    class="theme-badge text-[10px] px-1.5 py-px"
                    :class="getStockBadgeClass(product.stock_status)"
                  >
                    {{ getStockStatusLabel(product) }}
                  </span>
                </div>

                <!-- Price -->
                <div class="mt-auto pt-1">
                  <template v-if="selectedSku && hasSkuPromotionPrice(selectedSku)">
                    <span class="text-lg md:text-xl font-bold text-rose-600 dark:text-rose-400">
                      {{ formatPrice(getSkuPromotionPriceAmount(selectedSku), siteCurrency) }}
                    </span>
                    <span class="ml-1.5 text-xs theme-text-muted line-through">
                      {{ formatPrice(selectedSku.price_amount, siteCurrency) }}
                    </span>
                  </template>
                  <template v-else-if="selectedSku">
                    <span class="text-lg md:text-xl font-bold theme-text-accent">
                      {{ formatPrice(selectedSku.price_amount, siteCurrency) }}
                    </span>
                  </template>
                  <template v-else-if="hasPromotionPrice(product)">
                    <span class="text-lg md:text-xl font-bold text-rose-600 dark:text-rose-400">
                      {{ formatPrice(getPromotionPriceAmount(product), siteCurrency) }}
                    </span>
                    <span class="ml-1.5 text-xs theme-text-muted line-through">
                      {{ formatPrice(product.price_amount, siteCurrency) }}
                    </span>
                  </template>
                  <template v-else>
                    <span class="text-lg md:text-xl font-bold theme-text-accent">
                      {{ formatPrice(product.price_amount, siteCurrency) }}
                    </span>
                  </template>
                </div>
              </div>

              <!-- Mobile close -->
              <button
                type="button"
                class="md:hidden self-start -mr-1 p-1.5 rounded-lg theme-text-muted hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                @click="close"
              >
                <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Divider -->
            <div class="h-px bg-gray-100 dark:bg-white/[0.06] -mx-4 md:-mx-5 mb-4" />

            <!-- Product description -->
            <p v-if="productDescription" class="mb-4 text-xs leading-relaxed theme-text-secondary line-clamp-3">
              {{ productDescription }}
            </p>

            <!-- Promotion rules -->
            <div v-if="hasPromotionRules(product)" class="mb-4 rounded-lg border border-orange-200 dark:border-orange-800/50 bg-orange-50/50 dark:bg-orange-950/20 px-3 py-2">
              <div class="flex items-center gap-1 mb-1">
                <svg class="w-3.5 h-3.5 text-orange-500 dark:text-orange-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span class="text-[11px] font-semibold text-orange-700 dark:text-orange-300">
                  {{ t('products.promotionRulesTitle') }}
                </span>
              </div>
              <ul class="space-y-0.5">
                <li v-for="rule in getPromotionRules(product)" :key="rule.id" class="text-[11px] text-orange-600 dark:text-orange-300/90 flex items-center gap-1">
                  <span class="w-1 h-1 rounded-full bg-orange-400 dark:bg-orange-500 shrink-0"></span>
                  <span>{{ formatPromotionRule(rule) }}</span>
                </li>
              </ul>
            </div>

            <!-- SKU Selection -->
            <div v-if="activeSkus.length > 1" class="mb-4">
              <div class="mb-2 text-xs font-medium theme-text-muted">
                {{ t('quickBuy.selectSku') }}
              </div>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="sku in activeSkus"
                  :key="sku.id"
                  type="button"
                  class="rounded-lg border px-3 py-1.5 text-[13px] transition-all"
                  :class="[
                    normalizeSkuId(sku.id) === selectedSkuId
                      ? 'theme-selected-surface ring-1 ring-primary/30 font-semibold'
                      : 'theme-btn-secondary font-medium',
                    isSkuPurchasable(sku) ? 'cursor-pointer' : 'cursor-not-allowed opacity-45 border-dashed',
                  ]"
                  :disabled="!isSkuPurchasable(sku)"
                  @click="selectedSkuId = normalizeSkuId(sku.id)"
                >
                  <span>{{ skuDisplayText(sku) }}</span>
                  <span
                    v-if="!isSkuPurchasable(sku)"
                    class="ml-1 text-[10px] opacity-70"
                  >({{ t('productDetail.skuStockOut') }})</span>
                </button>
              </div>
            </div>

            <!-- Selected SKU stock info -->
            <div v-if="selectedSku" class="mb-4 flex items-center gap-2 text-xs">
              <span class="theme-text-muted">{{ t('quickBuy.stock') }}:</span>
              <span
                class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium"
                :class="skuStockBadgeClass(selectedSku)"
              >
                <span
                  class="w-1.5 h-1.5 rounded-full"
                  :class="skuStockDotClass(selectedSku)"
                />
                {{ skuStockText(selectedSku) }}
              </span>
            </div>

            <!-- Quantity -->
            <div class="mb-4 flex items-center gap-3">
              <span class="text-xs font-medium theme-text-muted">{{ t('quickBuy.quantity') }}</span>
              <div class="flex items-center rounded-lg border theme-border overflow-hidden">
                <button
                  type="button"
                  class="w-9 h-9 flex items-center justify-center theme-text-secondary hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
                  :disabled="quantity <= effectiveMin"
                  @click="quantity = Math.max(effectiveMin, quantity - 1)"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                    <path stroke-linecap="round" d="M20 12H4" />
                  </svg>
                </button>
                <input
                  type="text"
                  inputmode="numeric"
                  class="w-12 h-9 text-center text-sm font-semibold theme-text-primary border-x theme-border bg-transparent outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  :value="quantity"
                  @change="handleQuantityInput($event)"
                  @keydown.enter.prevent="($event.target as HTMLInputElement)?.blur()"
                />
                <button
                  type="button"
                  class="w-9 h-9 flex items-center justify-center theme-text-secondary hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
                  :disabled="effectiveLimit !== null && quantity >= effectiveLimit"
                  @click="quantity = quantity + 1"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                    <path stroke-linecap="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Warning -->
            <p v-if="stockBelowMinPurchase" class="mb-4 rounded-lg theme-alert-warning px-3 py-2 text-xs font-medium">
              {{ t('productDetail.stockBelowMinPurchase', { count: effectiveMin }) }}
            </p>
            <p v-else-if="purchaseWarning" class="mb-4 rounded-lg theme-alert-warning px-3 py-2 text-xs font-medium">
              {{ purchaseWarning }}
            </p>
          </div>

          <!-- Actions (sticky bottom) -->
          <div class="shrink-0 px-4 md:px-5 pt-3 pb-3 md:pb-5 border-t theme-border theme-safe-bottom">
            <button
              v-if="requiresLogin"
              @click="goLogin"
              class="w-full py-3 theme-btn-primary font-semibold rounded-xl min-h-[44px] text-sm cursor-pointer"
            >
              {{ t('quickBuy.loginToBuy') }}
            </button>
            <div v-else-if="isSoldOut(product)" class="flex gap-3">
              <button
                @click="goToDetail"
                class="flex-1 py-3 border theme-btn-secondary font-semibold rounded-xl min-h-[44px] text-sm cursor-pointer"
              >
                {{ t('quickBuy.viewDetail') }}
              </button>
            </div>
            <div v-else class="flex gap-3">
              <button
                @click="handleAddToCart"
                :disabled="!canPurchase"
                class="flex-1 py-3 border theme-btn-secondary font-semibold rounded-xl cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 min-h-[44px] text-sm flex items-center justify-center gap-1.5"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                {{ t('quickBuy.addToCart') }}
              </button>
              <button
                @click="handleBuyNow"
                :disabled="!canPurchase"
                class="flex-1 py-3 theme-btn-primary font-semibold rounded-xl cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 min-h-[44px] text-sm"
              >
                {{ t('quickBuy.buyNow') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>


<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '../stores/app'
import { useCartStore } from '../stores/cart'
import { useBuyNowStore } from '../stores/buyNow'
import { useUserAuthStore } from '../stores/userAuth'
import { getFirstImageUrl, getImageUrl } from '../utils/image'
import { normalizeSkuId, buildSkuDisplayText } from '../utils/sku'
import { useLocalized, useProductLabels } from '../composables/useProduct'
import { toast } from '../composables/useToast'

const props = defineProps<{
  product: any
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const appStore = useAppStore()
const cartStore = useCartStore()
const buyNowStore = useBuyNowStore()
const userAuthStore = useUserAuthStore()

const { getLocalizedText, siteCurrency, formatPrice } = useLocalized()
const {
  getFulfillmentTypeLabel,
  getStockBadgeClass,
  getStockStatusLabel,
  isSoldOut,
  hasPromotionPrice,
  getPromotionPriceAmount,
  hasSkuPromotionPrice,
  getSkuPromotionPriceAmount,
  hasPromotionRules,
  getPromotionRules,
} = useProductLabels()

const selectedSkuId = ref(0)
const quantity = ref(1)
const purchaseWarning = ref('')

const productTitle = computed(() => getLocalizedText(props.product?.title))
const productDescription = computed(() => getLocalizedText(props.product?.description))

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

const productImage = computed(() => {
  const p = props.product
  if (!p) return ''
  if (p.images) {
    const url = getFirstImageUrl(p.images)
    if (url) return url
  }
  if (p.category?.icon) return getImageUrl(p.category.icon)
  return ''
})

const activeSkus = computed(() => {
  const rows = Array.isArray(props.product?.skus) ? props.product.skus : []
  return rows.filter((sku: any) => Boolean(sku?.is_active))
})

const selectedSku = computed(() => {
  if (selectedSkuId.value <= 0) return null
  return activeSkus.value.find((sku: any) => normalizeSkuId(sku?.id) === selectedSkuId.value) || null
})

// Stock helpers (same logic as ProductDetail)
const normalizeStockNumber = (value: unknown) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.max(Math.floor(n), 0)
}

const normalizeManualStockTotal = (value: unknown) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  const i = Math.floor(n)
  if (i === -1) return -1
  return Math.max(i, 0)
}

const normalizeOptionalLimitNumber = (value: unknown) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  const i = Math.floor(n)
  if (i <= 0) return null
  return i
}

const shouldEnforceSkuStock = (sku: any) => {
  if (!sku) return false
  if (props.product?.fulfillment_type === 'auto') return true
  if (props.product?.fulfillment_type === 'upstream') return true
  if (props.product?.fulfillment_type !== 'manual') return false
  const total = normalizeManualStockTotal(sku?.manual_stock_total)
  return total !== -1
}

const skuAvailableStock = (sku: any) => {
  if (!shouldEnforceSkuStock(sku)) return null
  if (props.product?.fulfillment_type === 'upstream') {
    const s = Number(sku?.upstream_stock ?? 0)
    if (s === -1) return null
    return Math.max(s, 0)
  }
  if (props.product?.fulfillment_type === 'auto') {
    const s = Number(sku?.auto_stock_available ?? 0)
    if (s < 0) return null
    return normalizeStockNumber(s)
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

const syncSelectedSku = () => {
  const rows = activeSkus.value
  if (rows.length === 0) { selectedSkuId.value = 0; return }
  if (rows.length === 1) { selectedSkuId.value = normalizeSkuId(rows[0]?.id); return }
  const firstAvailable = rows.find((sku: any) => isSkuPurchasable(sku))
  if (firstAvailable) { selectedSkuId.value = normalizeSkuId(firstAvailable?.id); return }
  selectedSkuId.value = normalizeSkuId(rows[0]?.id)
}

// Reset state when product changes or drawer opens
watch(() => [props.product, props.visible], () => {
  if (props.visible && props.product) {
    purchaseWarning.value = ''
    quantity.value = effectiveMin.value
    syncSelectedSku()
  }
}, { immediate: true })

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

const skuStockDotClass = (sku: any) => {
  const available = skuAvailableStock(sku)
  if (available === null) return 'bg-slate-400 dark:bg-slate-500'
  if (available <= 0) return 'bg-rose-500 dark:bg-rose-400'
  if (available <= 5) return 'bg-amber-500 dark:bg-amber-400'
  return 'bg-emerald-500 dark:bg-emerald-400'
}

const skuDisplayText = (sku: any) => buildSkuDisplayText({
  skuCode: sku?.sku_code,
  specValues: sku?.spec_values,
  fallback: t('productDetail.skuFallback'),
  locale: appStore.locale,
})

const effectiveLimit = computed(() => {
  const sku = selectedSku.value
  const available = skuAvailableStock(sku)
  const productLimit = normalizeOptionalLimitNumber(props.product?.max_purchase_quantity)
  let limit: number | null = productLimit
  if (available !== null) {
    limit = limit === null ? available : Math.min(limit, available)
  }
  return limit
})

const effectiveMin = computed(() => {
  const productMin = normalizeOptionalLimitNumber(props.product?.min_purchase_quantity)
  return productMin && productMin > 0 ? productMin : 1
})

const purchaseType = computed(() => props.product?.purchase_type || 'member')
const requiresLogin = computed(() => purchaseType.value === 'member' && !userAuthStore.isAuthenticated)
const requiresSKUSelection = computed(() => activeSkus.value.length > 1 && !selectedSku.value)
const stockBelowMinPurchase = computed(() => {
  const limit = effectiveLimit.value
  if (limit === null) return false
  return limit < effectiveMin.value
})
const canPurchase = computed(() => {
  if (!props.product) return false
  if (activeSkus.value.length === 0) return false
  if (props.product.is_sold_out) return false
  if (requiresSKUSelection.value) return false
  if (props.product.stock_status === 'out_of_stock') return false
  if (selectedSku.value && !isSkuPurchasable(selectedSku.value)) return false
  if (stockBelowMinPurchase.value) return false
  return true
})

const selectedCartQuantity = () => {
  if (!props.product || !selectedSku.value) return 0
  const productId = Number(props.product.id || 0)
  const skuId = normalizeSkuId(selectedSku.value?.id)
  if (productId <= 0 || skuId <= 0) return 0
  const matched = cartStore.items.find((item) => item.productId === productId && normalizeSkuId(item.skuId) === skuId)
  return Number(matched?.quantity || 0)
}

const handleQuantityInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  const parsed = Math.floor(Number(input.value))
  const minimum = effectiveMin.value
  if (!Number.isFinite(parsed) || parsed < minimum) {
    quantity.value = minimum
    input.value = String(minimum)
    return
  }
  const limit = effectiveLimit.value
  if (limit !== null && parsed > limit) {
    quantity.value = limit
    input.value = String(limit)
    return
  }
  quantity.value = parsed
}

const close = () => {
  emit('update:visible', false)
}

const handleAddToCart = () => {
  if (!props.product || !canPurchase.value) return
  purchaseWarning.value = ''

  const sku = selectedSku.value
  const available = skuAvailableStock(sku)
  const cartQty = selectedCartQuantity()
  const nextQuantity = cartQty + quantity.value
  const productLimit = normalizeOptionalLimitNumber(props.product?.max_purchase_quantity)
  let limit: number | null = productLimit
  if (available !== null) {
    limit = limit === null ? available : Math.min(limit, available)
  }
  if (limit !== null && nextQuantity > limit) {
    if (available !== null && limit === available && (productLimit === null || available <= productLimit)) {
      purchaseWarning.value = available > 0
        ? (cartQty > 0
            ? t('productDetail.addCartStockExceededWithCart', { count: available, cartCount: cartQty })
            : t('productDetail.addCartStockExceeded', { count: available }))
        : t('productDetail.stockUnavailable')
      return
    }
    purchaseWarning.value = cartQty > 0
      ? t('productDetail.addCartLimitExceededWithCart', { count: limit, cartCount: cartQty })
      : t('productDetail.addCartLimitExceeded', { count: limit })
    return
  }

  const images = getProductImages()
  cartStore.addItem({
    productId: props.product.id,
    skuId: normalizeSkuId(sku?.id),
    skuCode: String(sku?.sku_code || ''),
    skuSpecValues: (sku?.spec_values && typeof sku.spec_values === 'object') ? sku.spec_values : undefined,
    skuManualStockTotal: normalizeManualStockTotal(sku?.manual_stock_total),
    skuManualStockLocked: normalizeStockNumber(sku?.manual_stock_locked),
    skuManualStockSold: normalizeStockNumber(sku?.manual_stock_sold),
    skuAutoStockAvailable: normalizeStockNumber(sku?.auto_stock_available),
    skuUpstreamStock: normalizeManualStockTotal(sku?.upstream_stock),
    skuStockEnforced: shouldEnforceSkuStock(sku),
    slug: props.product.slug,
    title: props.product.title,
    priceAmount: String(sku?.price_amount || props.product.price_amount || '0.00'),
    image: images[0] || '',
    minPurchaseQuantity: normalizeOptionalLimitNumber(props.product.min_purchase_quantity) ?? undefined,
    maxPurchaseQuantity: normalizeOptionalLimitNumber(props.product.max_purchase_quantity) ?? undefined,
    purchaseType: props.product.purchase_type,
    fulfillmentType: props.product.fulfillment_type,
    manualFormSchema: props.product.manual_form_schema || {},
    paymentChannelIds: Array.isArray(props.product.payment_channel_ids) && props.product.payment_channel_ids.length > 0 ? props.product.payment_channel_ids : undefined,
    quantity: 1,
  }, quantity.value)
  toast.success(t('toast.addedToCart'))
  close()
}

const handleBuyNow = () => {
  purchaseWarning.value = ''
  if (!canPurchase.value) return
  if (!props.product) return

  const sku = selectedSku.value
  const available = skuAvailableStock(sku)
  const productLimit = normalizeOptionalLimitNumber(props.product?.max_purchase_quantity)
  let limit: number | null = productLimit
  if (available !== null) {
    limit = limit === null ? available : Math.min(limit, available)
  }
  if (limit !== null && quantity.value > limit) {
    purchaseWarning.value = available !== null && limit === available && (productLimit === null || available <= productLimit)
      ? (available > 0 ? t('productDetail.addCartStockExceeded', { count: available }) : t('productDetail.stockUnavailable'))
      : t('productDetail.addCartLimitExceeded', { count: limit })
    return
  }

  const images = getProductImages()
  buyNowStore.setItem({
    productId: props.product.id,
    skuId: normalizeSkuId(sku?.id),
    skuCode: String(sku?.sku_code || ''),
    skuSpecValues: (sku?.spec_values && typeof sku.spec_values === 'object') ? sku.spec_values : undefined,
    skuManualStockTotal: normalizeManualStockTotal(sku?.manual_stock_total),
    skuManualStockLocked: normalizeStockNumber(sku?.manual_stock_locked),
    skuManualStockSold: normalizeStockNumber(sku?.manual_stock_sold),
    skuAutoStockAvailable: normalizeStockNumber(sku?.auto_stock_available),
    skuUpstreamStock: normalizeManualStockTotal(sku?.upstream_stock),
    skuStockEnforced: shouldEnforceSkuStock(sku),
    slug: props.product.slug,
    title: props.product.title,
    priceAmount: String(sku?.price_amount || props.product.price_amount || '0.00'),
    image: images[0] || '',
    minPurchaseQuantity: normalizeOptionalLimitNumber(props.product.min_purchase_quantity) ?? undefined,
    maxPurchaseQuantity: normalizeOptionalLimitNumber(props.product.max_purchase_quantity) ?? undefined,
    purchaseType: props.product.purchase_type,
    fulfillmentType: props.product.fulfillment_type,
    manualFormSchema: props.product.manual_form_schema || {},
    paymentChannelIds: Array.isArray(props.product.payment_channel_ids) && props.product.payment_channel_ids.length > 0 ? props.product.payment_channel_ids : undefined,
    quantity: quantity.value,
  })
  close()
  router.push('/checkout?mode=buynow')
}

const goLogin = () => {
  close()
  router.push(`/auth/login?redirect=${encodeURIComponent(route.fullPath)}`)
}

const goToDetail = () => {
  close()
  router.push(`/products/${props.product?.slug}`)
}

const getProductImages = () => {
  if (!props.product?.images) return []
  let imageArray: string[] = []
  if (Array.isArray(props.product.images)) {
    imageArray = props.product.images
  } else if (props.product.images.images && Array.isArray(props.product.images.images)) {
    imageArray = props.product.images.images
  }
  return imageArray.map((img: string) => getImageUrl(img))
}
</script>

<style scoped>
/* Mobile: slide up from bottom */
.quick-buy-enter-active {
  transition: transform 280ms cubic-bezier(0.32, 0.72, 0, 1), opacity 280ms ease-out;
}
.quick-buy-leave-active {
  transition: transform 200ms ease-in, opacity 200ms ease-in;
}
.quick-buy-enter-from {
  transform: translateY(100%);
  opacity: 1;
}
.quick-buy-enter-to {
  transform: translateY(0);
  opacity: 1;
}
.quick-buy-leave-from {
  transform: translateY(0);
  opacity: 1;
}
.quick-buy-leave-to {
  transform: translateY(100%);
  opacity: 1;
}

/* Desktop: centered scale + fade */
@media (min-width: 768px) {
  .quick-buy-enter-active {
    transition: transform 200ms ease-out, opacity 200ms ease-out;
  }
  .quick-buy-leave-active {
    transition: transform 150ms ease-in, opacity 150ms ease-in;
  }
  .quick-buy-enter-from {
    transform: scale(0.96);
    opacity: 0;
  }
  .quick-buy-enter-to {
    transform: scale(1);
    opacity: 1;
  }
  .quick-buy-leave-from {
    transform: scale(1);
    opacity: 1;
  }
  .quick-buy-leave-to {
    transform: scale(0.96);
    opacity: 0;
  }
}
</style>
