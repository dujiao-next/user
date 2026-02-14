<template>
  <div class="min-h-screen theme-page pt-24 pb-16">
    <div class="container mx-auto px-4">
      <div class="mb-8">
        <h1 class="mb-2 text-3xl font-black theme-text-primary">{{ t('cart.title') }}</h1>
        <p class="text-sm theme-text-secondary">{{ t('cart.subtitle') }}</p>
      </div>

      <div class="mb-8 rounded-2xl border border-gray-200 theme-panel-soft p-4 backdrop-blur">
        <div class="grid grid-cols-3 gap-3">
          <div
            v-for="step in flowSteps"
            :key="step.key"
            class="theme-step-chip"
            :class="step.active
              ? 'theme-step-chip-active'
              : 'theme-step-chip-inactive'"
          >
            {{ step.label }}
          </div>
        </div>
      </div>

      <div
        v-if="cartItems.length === 0"
        class="rounded-2xl border theme-panel p-12 text-center"
      >
        <p class="mb-6 theme-text-muted">{{ t('cart.empty') }}</p>
        <router-link
          to="/products"
          class="theme-btn-inline-md theme-btn-primary gap-2 font-semibold transition-colors"
        >
          {{ t('cart.emptyAction') }}
        </router-link>
      </div>

      <div v-else class="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div class="space-y-4 lg:col-span-2">
          <article
            v-for="item in cartItems"
            :key="item.productId"
            class="rounded-2xl border theme-panel p-5"
          >
            <div class="flex gap-5">
              <div
                class="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border theme-surface-muted"
              >
                <img v-if="item.image" :src="item.image" class="h-full w-full object-cover" />
                <div v-else class="flex h-full w-full items-center justify-center theme-text-muted">
                  <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>

              <div class="flex-1">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <router-link
                      :to="`/products/${item.slug}`"
                      class="text-lg font-bold theme-link"
                    >
                      {{ getLocalizedText(item.title) }}
                    </router-link>
                    <p class="mt-1 text-sm theme-text-muted">{{ t('cart.priceLabel') }}：{{ formatPrice(item.priceAmount, item.priceCurrency) }}</p>
                    <div class="mt-3 flex flex-wrap gap-2">
                      <span
                        class="theme-badge text-xs uppercase tracking-wider"
                        :class="item.purchaseType === 'guest'
                          ? 'theme-badge-warning'
                          : 'theme-badge-success'"
                      >
                        {{ item.purchaseType === 'guest' ? t('productPurchase.guest') : t('productPurchase.member') }}
                      </span>
                      <span
                        class="theme-badge text-xs uppercase tracking-wider"
                        :class="item.fulfillmentType === 'auto'
                          ? 'theme-badge-info'
                          : 'theme-badge-neutral'"
                      >
                        {{ item.fulfillmentType === 'auto' ? t('products.fulfillmentType.auto') : t('products.fulfillmentType.manual') }}
                      </span>
                    </div>
                  </div>
                  <button
                    @click="cartStore.removeItem(item.productId)"
                    class="text-sm theme-link-muted transition-colors hover:text-red-500"
                  >
                    {{ t('cart.remove') }}
                  </button>
                </div>

                <div class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-white/5">
                  <div class="flex items-center gap-2">
                    <button
                      @click="updateQty(item, item.quantity - 1)"
                      :disabled="item.quantity <= 1"
                      class="h-8 w-8 rounded-lg border theme-btn-secondary disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      -
                    </button>
                    <span class="min-w-[32px] text-center text-sm font-mono theme-text-primary">{{ item.quantity }}</span>
                    <button
                      @click="updateQty(item, item.quantity + 1)"
                      :disabled="item.quantity >= 99"
                      class="h-8 w-8 rounded-lg border theme-btn-secondary disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                  <div class="text-right">
                    <p class="text-xs uppercase tracking-wider theme-text-muted">{{ t('checkout.previewTotal') }}</p>
                    <p class="text-sm font-semibold theme-text-primary">{{ itemSubtotal(item) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div class="h-fit rounded-2xl border theme-panel p-6 lg:sticky lg:top-24">
          <h2 class="mb-4 text-lg font-bold theme-text-primary">{{ t('cart.summaryTitle') }}</h2>
          <div class="space-y-3 text-sm theme-text-muted">
            <div class="flex items-center justify-between">
              <span>{{ t('cart.itemsCount') }}</span>
              <span class="font-mono theme-text-primary">{{ totalItems }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span>{{ t('cart.totalLabel') }}</span>
              <span class="font-mono text-lg font-bold theme-text-primary">{{ formatPrice(totalAmount.toFixed(2), totalCurrency) }}</span>
            </div>
            <div class="rounded-lg border theme-surface-soft p-3 text-xs theme-text-muted">
              {{ t('cart.disclaimer') }}
            </div>
          </div>

          <div class="mt-6 space-y-2">
            <router-link
              to="/checkout"
              class="theme-btn-block-md theme-btn-primary gap-2 font-semibold transition-colors"
            >
              {{ t('cart.checkout') }}
            </router-link>
            <router-link
              to="/products"
              class="theme-btn-block-md border theme-btn-secondary gap-2 font-semibold transition-colors"
            >
              {{ t('cart.emptyAction') }}
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCartStore, type CartItem } from '../stores/cart'
import { useAppStore } from '../stores/app'

const cartStore = useCartStore()
const appStore = useAppStore()
const { t } = useI18n()

const cartItems = computed(() => cartStore.items)
const totalItems = computed(() => cartStore.totalItems)
const totalAmount = computed(() => cartItems.value.reduce((sum, item) => {
  const amount = Number(item.priceAmount || 0)
  const qty = Number(item.quantity || 0)
  if (Number.isNaN(amount) || Number.isNaN(qty)) return sum
  return sum + amount * qty
}, 0))
const totalCurrency = computed(() => {
  const currencies = cartItems.value.map(item => item.priceCurrency).filter(Boolean)
  const unique = Array.from(new Set(currencies))
  return unique.length === 1 ? unique[0] : ''
})

const flowSteps = computed(() => ([
  { key: 'cart', label: t('cart.title'), active: true },
  { key: 'checkout', label: t('checkout.title'), active: false },
  { key: 'payment', label: t('payment.title'), active: false },
]))

const getLocalizedText = (jsonData: any) => {
  if (!jsonData) return ''
  const locale = appStore.locale
  return jsonData[locale] || jsonData['zh-CN'] || jsonData['en-US'] || ''
}

const formatPrice = (amount: any, currency: any) => {
  if (amount === null || amount === undefined || amount === '') return '-'
  if (currency === null || currency === undefined || currency === '') {
    return String(amount)
  }
  return `${amount} ${currency}`
}

const itemSubtotal = (item: CartItem) => {
  const amount = Number(item.priceAmount || 0)
  const qty = Number(item.quantity || 0)
  if (Number.isNaN(amount) || Number.isNaN(qty)) {
    return formatPrice('-', item.priceCurrency)
  }
  return formatPrice((amount * qty).toFixed(2), item.priceCurrency)
}

const updateQty = (item: CartItem, qty: number) => {
  cartStore.updateQuantity(item.productId, qty)
}
</script>
