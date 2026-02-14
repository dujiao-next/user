<template>
  <div class="min-h-screen theme-page pt-24 pb-16">
    <div class="container mx-auto px-4">
      <div class="mb-8">
        <h1 class="text-3xl font-black theme-text-primary mb-2">{{ t('guestOrders.title') }}</h1>
        <p class="theme-text-muted text-sm">{{ t('guestOrders.subtitle') }}</p>
      </div>

      <div class="theme-panel rounded-2xl p-6 mb-8">
        <div v-if="hasSavedAuth"
          class="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs theme-text-muted theme-surface-soft border rounded-xl px-4 py-3">
          <span>{{ t('guestOrders.savedHint', { email: savedAuth.email || '-' }) }}</span>
          <button type="button" @click="clearSaved"
            class="theme-link-muted text-xs underline decoration-gray-300 dark:decoration-white/20">
            {{ t('guestOrders.clearSaved') }}
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input v-model="email" type="email"
            class="form-input-lg"
            :placeholder="t('guestOrders.emailPlaceholder')" />
          <input v-model="orderPassword" type="password"
            class="form-input-lg"
            :placeholder="t('guestOrders.passwordPlaceholder')" />
          <input v-model="orderNo" type="text"
            class="form-input-lg"
            :placeholder="t('guestOrders.orderNoPlaceholder')" />
          <button @click="handleSearch" :disabled="loading"
            class="theme-btn-primary rounded-xl font-bold px-6 py-3 transition-colors disabled:opacity-50">
            {{ loading ? t('guestOrders.searching') : t('guestOrders.search') }}
          </button>
        </div>
        <p class="text-xs theme-text-muted mt-3">{{ t('guestOrders.tip') }}</p>
        <div v-if="error" class="text-red-400 text-sm mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          {{ error }}
        </div>
      </div>

      <div v-if="orders.length === 0 && !loading"
        class="theme-panel rounded-2xl p-12 text-center">
        <p class="theme-text-muted">{{ emptyMessage }}</p>
      </div>

      <div v-else class="space-y-4">
        <div v-for="order in orders" :key="order.order_no || order.id"
          class="theme-panel rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div class="text-xs uppercase tracking-wider theme-text-muted">{{ t('orders.orderNo') }}：{{ order.order_no }}</div>
            <div class="text-lg font-bold theme-text-primary mt-1">{{ formatMoney(order.total_amount,
              order.currency) }}</div>
            <div v-if="hasDiscount(order)" class="text-xs theme-text-muted mt-1">
              <span v-if="hasDiscountAmount(order.discount_amount)">
                {{ t('orderDetail.couponDiscountLabel') }}：{{ formatMoney(order.discount_amount, order.currency) }}
              </span>
              <span v-if="hasDiscountAmount(order.promotion_discount_amount)" class="ml-2">
                {{ t('orderDetail.promotionDiscountLabel') }}：{{ formatMoney(order.promotion_discount_amount,
                  order.currency) }}
              </span>
            </div>
            <div class="text-xs theme-text-muted mt-1">{{ formatDate(order.created_at) }}</div>
          </div>
          <div class="flex items-center gap-3">
            <span class="theme-badge px-3 py-1 text-xs font-medium" :class="statusClass(order.status)">
              {{ statusLabel(order.status) }}
            </span>
            <router-link :to="`/guest/orders/${order.order_no}`"
              class="px-4 py-2 rounded-lg border theme-btn-secondary text-sm">
              {{ t('guestOrders.viewDetails') }}
            </router-link>
            <router-link v-if="order.status === 'pending_payment'" :to="`/pay?guest=1&order_no=${order.order_no}`"
              class="px-4 py-2 rounded-lg theme-btn-primary font-bold text-sm">
              {{ t('guestOrders.payNow') }}
            </router-link>
          </div>
        </div>
      </div>

      <div v-if="pagination.total_page > 1" class="flex items-center justify-center gap-4 mt-10">
        <button @click="changePage(pagination.page - 1)" :disabled="pagination.page <= 1"
          class="px-4 py-2 rounded-lg border theme-btn-secondary text-sm disabled:opacity-40">
          {{ t('guestOrders.prevPage') }}
        </button>
        <span class="text-sm theme-text-muted">{{ t('guestOrders.pageInfo', {
          page: pagination.page, total:
            pagination.total_page
        }) }}</span>
        <button @click="changePage(pagination.page + 1)" :disabled="pagination.page >= pagination.total_page"
          class="px-4 py-2 rounded-lg border theme-btn-secondary text-sm disabled:opacity-40">
          {{ t('guestOrders.nextPage') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { guestOrderAPI } from '../api'
import { useI18n } from 'vue-i18n'
import { orderStatusClass, orderStatusLabel } from '../utils/status'
import { debounceAsync } from '../utils/debounce'

const savedAuth = ref<{ email: string; order_password: string }>({ email: '', order_password: '' })
const email = ref('')
const orderPassword = ref('')
const orderNo = ref('')
const loading = ref(false)
const error = ref('')
const orders = ref<any[]>([])
const pagination = ref({
  page: 1,
  page_size: 20,
  total: 0,
  total_page: 1,
})
const { t } = useI18n()

const loadSavedAuth = () => {
  const saved = localStorage.getItem('guest_order_auth')
  const parsed = saved ? JSON.parse(saved) : {}
  savedAuth.value = {
    email: parsed.email || '',
    order_password: parsed.order_password || '',
  }
  email.value = savedAuth.value.email
  orderPassword.value = savedAuth.value.order_password
}

const hasSavedAuth = computed(() => Boolean(savedAuth.value.email || savedAuth.value.order_password))

const persistAuth = () => {
  const payload = {
    email: email.value,
    order_password: orderPassword.value,
  }
  localStorage.setItem('guest_order_auth', JSON.stringify(payload))
  savedAuth.value = payload
}

const clearSaved = () => {
  localStorage.removeItem('guest_order_auth')
  savedAuth.value = { email: '', order_password: '' }
  email.value = ''
  orderPassword.value = ''
  orderNo.value = ''
  orders.value = []
  pagination.value = {
    page: 1,
    page_size: 20,
    total: 0,
    total_page: 1,
  }
  error.value = ''
}

const handleSearch = async () => {
  error.value = ''
  if (!email.value || !orderPassword.value) {
    error.value = t('guestOrders.errors.missing')
    return
  }
  persistAuth()
  await debouncedLoadOrders(1)
}

const loadOrders = async (page: number) => {
  loading.value = true
  try {
    const response = await guestOrderAPI.list({
      email: email.value,
      order_password: orderPassword.value,
      order_no: orderNo.value || undefined,
      page,
      page_size: pagination.value.page_size,
    })
    orders.value = response.data.data || []
    pagination.value = response.data.pagination || pagination.value
    if (orderNo.value && orders.value.length === 0) {
      error.value = t('guestOrders.errors.notFound')
    }
  } catch (err: any) {
    orders.value = []
    error.value = err.message || t('guestOrders.errors.searchFailed')
  } finally {
    loading.value = false
  }
}

const debouncedLoadOrders = debounceAsync(loadOrders, 300)

const emptyMessage = computed(() => {
  if (orderNo.value) {
    return t('guestOrders.emptyOrderNo')
  }
  return t('guestOrders.empty')
})

const changePage = (page: number) => {
  if (page < 1 || page > pagination.value.total_page) return
  debouncedLoadOrders(page)
}

const statusLabel = (status: string) => orderStatusLabel(t, status)

const formatMoney = (amount?: string, currency?: string) => {
  if (amount === null || amount === undefined || amount === '') return '-'
  if (currency === null || currency === undefined || currency === '') {
    return String(amount)
  }
  return `${amount} ${currency}`
}

const hasDiscountAmount = (amount?: string) => {
  if (amount === null || amount === undefined || amount === '') return false
  const value = Number(amount)
  return !Number.isNaN(value) && value > 0
}

const hasDiscount = (order: any) => {
  if (!order) return false
  return hasDiscountAmount(order.discount_amount) || hasDiscountAmount(order.promotion_discount_amount)
}

const statusClass = (status: string) => orderStatusClass(status)

const formatDate = (raw?: string) => {
  if (!raw) return ''
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return raw
  return date.toLocaleString()
}

onMounted(() => {
  loadSavedAuth()
  if (hasSavedAuth.value) {
    debouncedLoadOrders(1)
  }
})

onUnmounted(() => {
  debouncedLoadOrders.cancel()
})
</script>
