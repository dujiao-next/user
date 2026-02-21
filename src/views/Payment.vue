<template>
  <div class="min-h-screen theme-page pt-24 pb-16">
    <div class="container mx-auto px-4">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-black theme-text-primary mb-2">{{ t('payment.title') }}</h1>
          <p class="theme-text-secondary text-sm">{{ t('payment.subtitle') }}</p>
        </div>
        <router-link :to="backLink"
          class="theme-link-muted text-sm">{{
            t('payment.backToOrders') }}</router-link>
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

      <div v-if="loading"
        class="h-40 border theme-surface-muted rounded-2xl animate-pulse">
      </div>

      <div v-else-if="showGuestAuthForm"
        class="theme-panel rounded-2xl p-6">
        <h2 class="text-lg font-bold mb-2">{{ t('payment.guestAuthTitle') }}</h2>
        <p class="text-xs theme-text-muted mb-4">{{ t('payment.guestAuthHint') }}</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input v-model="guestAuth.email" type="email"
            class="form-input-lg"
            :placeholder="t('guestOrders.emailPlaceholder')" />
          <input v-model="guestAuth.order_password" type="password"
            class="form-input-lg"
            :placeholder="t('guestOrders.passwordPlaceholder')" />
        </div>
        <div v-if="guestAuthError"
          class="text-red-400 text-sm mt-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-3">
          {{ guestAuthError }}
        </div>
        <button @click="handleGuestAuthSubmit"
          class="theme-btn-inline-md mt-4 border theme-btn-secondary font-semibold">
          {{ t('payment.guestAuthSubmit') }}
        </button>
      </div>

      <div v-else-if="!order"
        class="theme-panel rounded-2xl p-12 text-center">
        <p class="theme-text-muted">{{ t('payment.orderNotFound') }}</p>
      </div>

      <div v-else-if="showResultView" class="space-y-6">
        <div class="theme-panel rounded-2xl p-6">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 class="text-xl font-bold theme-text-primary">{{ t('payment.resultTitle') }}</h2>
              <p class="text-sm theme-text-muted mt-1">{{ t('payment.qrTip') }}</p>
              <div class="mt-2 text-xs theme-text-muted">
                {{ t('payment.methodLabel') }}：{{ resultChannelName }}<span v-if="resultChannelType"> ({{ resultChannelType }})</span>
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <button @click="handleRefresh" :disabled="loading"
                class="theme-btn-inline-md border theme-btn-secondary disabled:opacity-60">
                {{ t('payment.refreshStatus') }}
              </button>
              <button @click="resetPayment"
                class="theme-btn-inline-md border theme-btn-secondary">
                {{ t('payment.changeMethod') }}
              </button>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 space-y-4">
              <div v-if="showQRCode"
                class="theme-surface-soft border rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                <div class="text-sm theme-text-muted mb-4">{{ t('payment.qrTitle') }}</div>
                <img :src="qrImageUrl" alt="QR Code" class="w-56 h-56 object-contain" />
              </div>

              <div v-else class="theme-surface-soft border rounded-2xl p-6">
                <div class="text-sm theme-text-muted mb-3">{{ t('payment.openPayLink') }}</div>
                <a :href="paymentResult.pay_url" target="_blank"
                  class="theme-btn-inline-md border theme-btn-secondary font-semibold">
                  {{ t('payment.openPayLink') }}
                </a>
                <div v-if="openedPayWindow" class="mt-3 text-xs text-emerald-500">
                  {{ t('payment.redirectOpened') }}
                </div>
                <div class="mt-3 flex flex-wrap items-center gap-2">
                  <button @click="handleCopyPayLink"
                    class="px-3 py-1.5 rounded-lg border theme-btn-secondary text-xs">
                    {{ t('payment.copyPayLink') }}
                  </button>
                  <span v-if="copied" class="text-xs text-emerald-500">{{ t('payment.copied') }}</span>
                </div>
                <div class="mt-3 text-xs theme-text-muted break-all">
                  {{ t('payment.payLinkLabel') }}：{{ paymentResult.pay_url }}
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <div class="theme-surface-soft border rounded-2xl p-4">
                <div class="text-xs theme-text-muted">{{ t('payment.orderNo') }}</div>
                <div class="text-sm font-semibold theme-text-primary mt-1">{{ order.order_no }}</div>
                <div class="mt-3 text-xs theme-text-muted">{{ t('payment.orderStatus') }}：{{ statusLabel(order.status) }}</div>
                <div class="mt-2 text-xs theme-text-muted">
                  {{ t('payment.methodLabel') }}：{{ resultChannelName }}<span v-if="resultChannelType"> ({{ resultChannelType }})</span>
                </div>
              </div>
              <div class="theme-surface-soft border rounded-2xl p-4">
              <div class="text-xs theme-text-muted">{{ t('orderDetail.amountTotal') }}</div>
              <div class="text-lg font-bold theme-text-primary mt-1">{{ formatMoney(order.total_amount,
                order.currency) }}</div>
              <div class="mt-2 text-xs theme-text-muted">
                {{ t('payment.feeRateLabel') }}：{{ feeRateDisplay }}
              </div>
              <div class="mt-1 text-xs theme-text-muted">
                {{ t('payment.feeAmountLabel') }}：{{ feeAmountDisplay }}
              </div>
            <div class="mt-1 text-sm font-semibold theme-text-primary">
                {{ t('payment.payableAmountLabel') }}：{{ payableAmountDisplay }}
              </div>
              <div v-if="paymentResult.wallet_paid_amount !== undefined" class="mt-1 text-xs theme-text-muted">
                {{ t('payment.walletDeductLabel') }}：{{ paymentWalletPaidDisplay }}
              </div>
              <div v-if="paymentResult.online_pay_amount !== undefined" class="mt-1 text-xs theme-text-muted">
                {{ t('payment.onlinePayLabel') }}：{{ paymentOnlinePayDisplay }}
              </div>
              <div v-if="showCountdown" class="mt-2 text-xs theme-text-muted">
                {{ t('payment.countdownLabel') }}：<span class="font-mono">{{ countdownText }}</span>
              </div>
              <div v-if="pollingActive" class="mt-2 text-xs theme-text-muted">{{ t('payment.pollingHint') }}</div>
            </div>
              <div v-if="paymentResult.expires_at"
                class="theme-surface-soft border rounded-2xl p-4 text-xs theme-text-muted">
                {{ t('payment.expiresAt') }}：{{ formatDate(paymentResult.expires_at) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-6">
          <div class="theme-panel rounded-2xl p-6">
            <h2 class="text-lg font-bold mb-4 theme-text-primary">{{ t('payment.orderInfo') }}</h2>
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div class="text-xs uppercase tracking-wider theme-text-muted">{{ t('payment.orderNo') }}</div>
                <div class="text-sm font-semibold theme-text-primary mt-1">{{ order.order_no }}</div>
              <div class="text-xs theme-text-muted mt-2">{{ t('orderDetail.createdAtLabel') }}：{{
                  formatDate(order.created_at) }}</div>
            </div>
            <div class="flex flex-col items-start md:items-end gap-2">
              <div class="text-xs uppercase tracking-wider theme-text-muted">{{ t('orderDetail.amountTotal') }}</div>
              <div class="text-lg font-bold theme-text-primary">{{ formatMoney(order.total_amount,
                order.currency) }}</div>
              <span class="text-xs theme-text-muted">{{ t('payment.feeRateLabel') }}：{{ feeRateDisplay }}</span>
              <span class="text-xs theme-text-muted">{{ t('payment.feeAmountLabel') }}：{{ feeAmountDisplay }}</span>
              <span class="text-sm font-semibold theme-text-primary">{{ t('payment.payableAmountLabel') }}：{{ payableAmountDisplay }}</span>
              <span v-if="showBalanceOption && useBalance" class="text-xs theme-text-muted">
                {{ t('payment.walletDeductLabel') }}：{{ expectedWalletPaidDisplay }}
              </span>
              <span v-if="showBalanceOption && useBalance" class="text-xs theme-text-muted">
                {{ t('payment.onlinePayLabel') }}：{{ expectedOnlinePayDisplay }}
              </span>
              <span class="text-xs theme-text-muted">{{ t('payment.orderStatus') }}：{{
                  statusLabel(order.status) }}</span>
            </div>
            </div>
            <div class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div class="theme-surface-soft border rounded-xl p-3">
                <div class="text-xs theme-text-muted">{{ t('orderDetail.amountOriginal') }}</div>
                <div class="theme-text-primary font-mono mt-1">{{ formatMoney(order.original_amount,
                  order.currency) }}</div>
              </div>
              <div class="theme-surface-soft border rounded-xl p-3">
                <div class="text-xs theme-text-muted">{{ t('orderDetail.amountDiscount') }}</div>
                <div class="theme-text-primary font-mono mt-1">{{ formatMoney(order.discount_amount,
                  order.currency) }}</div>
              </div>
              <div class="theme-surface-soft border rounded-xl p-3">
                <div class="text-xs theme-text-muted">{{ t('orderDetail.promotionDiscountLabel') }}</div>
                <div class="theme-text-primary font-mono mt-1">{{ formatMoney(order.promotion_discount_amount,
                  order.currency) }}</div>
              </div>
            </div>
            <div class="mt-3 text-sm theme-text-muted">
              <span v-if="order.expires_at">{{ t('payment.expiresAt') }}：{{ formatDate(order.expires_at) }}</span>
            </div>
            <div v-if="showCountdown"
              class="mt-3 theme-badge items-center gap-2 px-3 py-1.5 text-xs font-semibold"
              :class="countdownExpired
                ? 'theme-badge-danger'
                : 'theme-badge-success'">
              <span>{{ t('payment.countdownLabel') }}</span>
              <span class="font-mono">{{ countdownText }}</span>
            </div>
            <div v-if="pollingActive" class="mt-3 text-xs theme-text-muted">{{ t('payment.pollingHint') }}</div>
          </div>

          <div v-if="orderItems.length"
            class="theme-panel rounded-2xl p-6">
            <h2 class="text-lg font-bold mb-4 theme-text-primary">{{ t('payment.itemsTitle') }}</h2>
            <div class="space-y-3 text-sm theme-text-muted">
              <div v-for="item in orderItems" :key="item.id"
                class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b border-gray-100 dark:border-white/5 pb-3">
                <div>
                  <div class="theme-text-primary font-medium">{{ getLocalizedText(item.title) }}</div>
                  <div class="text-xs theme-text-muted mt-1">
                    {{ t('orderDetail.quantityLabel') }}：{{ item.quantity }} · {{ t('orderDetail.itemFulfillmentLabel') }}：{{
                      fulfillmentTypeLabelText(item.fulfillment_type) }}
                  </div>
                </div>
                <div class="text-xs theme-text-muted">
                  {{ t('orderDetail.totalPriceLabel') }}：{{ formatMoney(item.total_price, order.currency) }}
                </div>
              </div>
            </div>
          </div>

          <div class="theme-panel rounded-2xl p-6">
            <h2 class="text-lg font-bold mb-4 theme-text-primary">{{ t('payment.channelTitle') }}</h2>
            <div v-if="!configReady" class="text-sm theme-text-muted">
              {{ t('common.loading') }}
            </div>
            <div v-else-if="channels.length === 0" class="text-sm theme-text-muted">
              {{ t('payment.channelEmpty') }}
            </div>
            <div v-else>
              <div
                v-if="showBalanceOption"
                class="mb-4 rounded-xl border p-4 theme-surface-soft"
              >
                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div class="text-xs theme-text-muted">{{ t('payment.walletBalanceLabel') }}</div>
                    <div class="mt-1 text-sm font-semibold theme-text-primary">
                      {{ walletLoading ? t('common.loading') : walletBalanceDisplay }}
                    </div>
                  </div>
                  <label class="inline-flex items-center gap-2 text-xs theme-text-secondary">
                    <input v-model="useBalance" type="checkbox" class="h-4 w-4 accent-primary" />
                    <span>{{ t('payment.useBalance') }}</span>
                  </label>
                </div>
                <div v-if="useBalance" class="mt-3 space-y-1 text-xs theme-text-muted">
                  <div>{{ t('payment.walletDeductLabel') }}：{{ expectedWalletPaidDisplay }}</div>
                  <div>{{ t('payment.onlinePayLabel') }}：{{ expectedOnlinePayDisplay }}</div>
                </div>
              </div>
              <div v-if="cachedPayment"
                class="mb-4 rounded-xl border p-4 text-sm space-y-2 theme-alert-warning">
                <div class="font-semibold">{{ t('payment.cachedTitle') }}</div>
                <div>
                  {{ t('payment.cachedHint', {
                    channel: cachedChannelName,
                    type: cachedChannelType,
                  }) }}
                </div>
                <div class="flex flex-wrap items-center gap-2">
                  <button @click="restoreCachedPayment"
                    class="px-3 py-1.5 rounded-lg border theme-btn-secondary font-bold text-xs">
                    {{ t('payment.useCached') }}
                  </button>
                  <span class="text-xs opacity-80">
                    {{ t('payment.cachedCreateHint') }}
                  </span>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button v-for="channel in channels" :key="channel.id" @click="selectedChannelId = channel.id"
                  class="text-left border rounded-xl p-4 transition-colors"
                  :class="selectedChannelId === channel.id ? 'theme-selected-surface' : 'theme-interactive-surface'">
                  <div class="flex items-center justify-between gap-2">
                    <div class="theme-text-primary font-medium">{{ channel.name }}</div>
                    <span v-if="selectedChannelId === channel.id"
                      class="theme-badge theme-badge-accent theme-badge-xs px-2 py-0.5">
                      {{ t('payment.selected') }}
                    </span>
                  </div>
                  <div class="text-xs theme-text-muted mt-1">{{ providerTypeLabel(channel.provider_type) }} / {{
                    channelTypeLabel(channel.channel_type) }}</div>
              </button>
              </div>
            </div>
          </div>

          <div v-if="paymentResult"
            class="theme-panel rounded-2xl p-6">
            <h2 class="text-lg font-bold mb-4 theme-text-primary">{{ t('payment.infoTitle') }}</h2>
            <div class="text-sm theme-text-secondary space-y-2">
              <div>{{ t('payment.methodLabel') }}：{{ channelTypeLabel(paymentResult.channel_type) }} ({{
                providerTypeLabel(paymentResult.provider_type) }})</div>
              <div>{{ t('payment.interactionLabel') }}：{{ interactionLabel }}</div>
              <div v-if="paymentResult.expires_at">{{ t('payment.expiresAt') }}：{{ formatDate(paymentResult.expires_at)
                }}</div>
            </div>

            <div v-if="showQRCode" class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div
                class="theme-surface-soft border rounded-xl p-4 flex items-center justify-center">
                <img :src="qrImageUrl" alt="QR Code" class="w-48 h-48 object-contain" />
              </div>
              <div class="text-sm theme-text-secondary space-y-3">
                <div class="theme-text-primary font-semibold">{{ t('payment.qrTitle') }}</div>
                <div>{{ t('payment.qrTip') }}</div>
                <div v-if="paymentResult.pay_url" class="pt-2 flex flex-wrap items-center gap-2">
                  <button @click="handleCopyPayLink"
                    class="px-3 py-1.5 rounded-lg border theme-btn-secondary font-bold text-xs">
                    {{ t('payment.copyPayLink') }}
                  </button>
                  <span v-if="copied" class="text-xs text-emerald-500">{{ t('payment.copied') }}</span>
                </div>
              </div>
            </div>

            <div v-if="showPayLink" class="mt-6 flex flex-col md:flex-row md:items-center gap-3">
              <a :href="paymentResult.pay_url" target="_blank"
                class="theme-btn-inline-md border theme-btn-secondary font-semibold text-center">
                {{ t('payment.openPayLink') }}
              </a>
              <button @click="handleCopyPayLink"
                class="theme-btn-inline-md border theme-btn-secondary">
                {{ t('payment.copyPayLink') }}
              </button>
              <div class="text-xs theme-text-muted break-all">
                {{ t('payment.payLinkLabel') }}：{{ paymentResult.pay_url }}
              </div>
            </div>
          </div>
        </div>

        <div class="h-fit rounded-2xl border theme-panel p-6 lg:sticky lg:top-24">
          <h2 class="text-lg font-bold mb-4 theme-text-primary">{{ t('payment.actionTitle') }}</h2>
          <div v-if="showCountdown" class="text-xs theme-text-muted mb-3">
            {{ t('payment.countdownLabel') }}：<span class="font-mono">{{ countdownText }}</span>
          </div>
          <div
            v-if="paymentAlert"
            class="mb-4 rounded-lg border p-3 text-sm"
            :class="pageAlertClass(paymentAlert.level)"
          >
            {{ paymentAlert.message }}
          </div>

          <div
            v-if="selectedChannel"
            class="mb-4 rounded-lg border p-3 text-xs theme-alert-success"
          >
            <div class="font-semibold">{{ t('payment.methodLabel') }}：{{ selectedChannel.name }}</div>
            <div class="mt-1">{{ providerTypeLabel(selectedChannel.provider_type) }} / {{ channelTypeLabel(selectedChannel.channel_type) }}</div>
          </div>
          <div
            v-else-if="requiresOnlineChannel && !orderExpired && !orderCanceled"
            class="mb-4 rounded-lg border p-3 text-xs theme-alert-warning"
          >
            {{ t('payment.selectChannelError') }}
          </div>

          <button @click="handlePayment" :disabled="!canSubmitPayment"
            class="theme-btn-block-md theme-btn-primary font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50">
            {{ submitting ? t('payment.submitting') : t('payment.submitButton') }}
          </button>
          <button @click="handleRefresh" :disabled="loading"
            class="theme-btn-block-md mt-3 border theme-btn-secondary font-semibold disabled:opacity-60">
            {{ t('payment.refreshStatus') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { guestOrderAPI, paymentAPI, userOrderAPI, walletAPI } from '../api'
import { useAppStore } from '../stores/app'
import { orderStatusLabel } from '../utils/status'
import { fulfillmentTypeLabel } from '../utils/fulfillment'
import { debounceAsync } from '../utils/debounce'
import { copyText } from '../utils/clipboard'
import QRCode from 'qrcode'
import { pageAlertClass, type PageAlert } from '../utils/alerts'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const { t } = useI18n()

const loading = ref(true)
const submitting = ref(false)
const order = ref<any>(null)
const paymentResult = ref<any>(null)
const error = ref('')
const selectedChannelId = ref<number | null>(null)
const copied = ref(false)
const capturing = ref(false)
const redirecting = ref(false)
const redirected = ref(false)
const openedPayWindow = ref(false)
const latestLoaded = ref(false)
const cachedPayment = ref<any>(null)
const guestAuth = ref({
  email: '',
  order_password: '',
})
const guestAuthError = ref('')
const pollTimer = ref<number | null>(null)
const countdownTimer = ref<number | null>(null)
const now = ref(Date.now())
const copiedTimer = ref<number | null>(null)
const walletLoading = ref(false)
const walletBalance = ref('0')
const useBalance = ref(false)

const isGuest = computed(() => route.query.guest === '1' || route.query.guest === 'true')
const orderNoQuery = computed(() => String(route.query.order_no || '').trim())
const orderId = computed(() => {
  const fromOrder = Number(order.value?.id || 0)
  if (Number.isFinite(fromOrder) && fromOrder > 0) return fromOrder
  return 0
})
const backLink = computed(() => (isGuest.value ? '/guest/orders' : '/me/orders'))
const hasGuestAuth = computed(() => Boolean(guestAuth.value.email && guestAuth.value.order_password))
const showGuestAuthForm = computed(() => isGuest.value && (!hasGuestAuth.value || guestAuthError.value))
const showBalanceOption = computed(() => !isGuest.value)

const flowSteps = computed(() => ([
  { key: 'cart', label: t('cart.title'), active: false },
  { key: 'checkout', label: t('checkout.title'), active: false },
  { key: 'payment', label: t('payment.title'), active: true },
]))

const configReady = computed(() => !appStore.loading && !!appStore.config)
const channels = computed(() => {
  const list = appStore.config?.payment_channels
  if (!Array.isArray(list)) return []
  return list.filter((channel: any) => {
    const providerType = String(channel?.provider_type || '').toLowerCase()
    const channelType = String(channel?.channel_type || '').toLowerCase()
    if (providerType === 'epay') {
      return ['wechat', 'wxpay', 'alipay', 'qqpay'].includes(channelType)
    }
    return true
  })
})

const normalizeID = (value: unknown) => String(value ?? '').trim()

const findChannelByID = (channelID: unknown) => {
  const target = normalizeID(channelID)
  if (target === '') return null
  return channels.value.find((item: any) => normalizeID(item?.id) === target) || null
}

const selectedChannel = computed(() => findChannelByID(selectedChannelId.value))

const cachedChannel = computed(() => findChannelByID(cachedPayment.value?.channel_id))

const cachedChannelType = computed(() => {
  if (cachedChannel.value?.channel_type) {
    return channelTypeLabel(cachedChannel.value.channel_type)
  }
  if (cachedPayment.value?.channel_type) {
    return channelTypeLabel(cachedPayment.value.channel_type)
  }
  return '-'
})

const cachedChannelName = computed(() => {
  if (cachedChannel.value?.name) return cachedChannel.value.name
  if (cachedPayment.value?.channel_type) return channelTypeLabel(cachedPayment.value.channel_type)
  return '-'
})

const resultChannel = computed(() => findChannelByID(paymentResult.value?.channel_id))

const resultChannelName = computed(() => {
  if (resultChannel.value?.name) return resultChannel.value.name
  if (paymentResult.value?.channel_type) return channelTypeLabel(paymentResult.value.channel_type)
  return '-'
})

const resultChannelType = computed(() => {
  if (paymentResult.value?.channel_type) return channelTypeLabel(paymentResult.value.channel_type)
  return ''
})

const interactionLabel = computed(() => {
  if (!paymentResult.value?.interaction_mode) return '-'
  const mode = String(paymentResult.value.interaction_mode).toLowerCase()
  if (mode === 'qr') return t('payment.modeQr')
  if (mode === 'redirect') return t('payment.modeRedirect')
  return mode
})

const showQRCode = computed(() => {
  const mode = String(paymentResult.value?.interaction_mode || '').toLowerCase()
  return mode === 'qr' && Boolean(paymentResult.value?.qr_code)
})

const showPayLink = computed(() => {
  const mode = String(paymentResult.value?.interaction_mode || '').toLowerCase()
  return mode === 'redirect' || Boolean(paymentResult.value?.pay_url)
})

const payLink = computed(() => String(paymentResult.value?.pay_url || '').trim())

const qrImageUrl = ref('')
const qrRenderVersion = ref(0)

const renderQRCodeImage = async () => {
  const qr = String(paymentResult.value?.qr_code || '').trim()
  const currentVersion = qrRenderVersion.value + 1
  qrRenderVersion.value = currentVersion
  if (!qr) {
    qrImageUrl.value = ''
    return
  }
  if (qr.startsWith('data:image/')) {
    qrImageUrl.value = qr
    return
  }
  const isImageURL = /^https?:\/\/.+\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(qr)
  if (isImageURL) {
    qrImageUrl.value = qr
    return
  }
  try {
    const dataURL = await QRCode.toDataURL(qr, {
      width: 220,
      margin: 1,
      errorCorrectionLevel: 'M',
    })
    if (currentVersion !== qrRenderVersion.value) return
    qrImageUrl.value = dataURL
  } catch (err) {
    if (currentVersion !== qrRenderVersion.value) return
    qrImageUrl.value = ''
  }
}

watch(
  () => paymentResult.value?.qr_code,
  () => {
    void renderQRCodeImage()
  },
  { immediate: true }
)

const expiresAtMs = computed(() => {
  const raw = paymentResult.value?.expires_at || order.value?.expires_at
  if (!raw) return null
  const ts = new Date(raw).getTime()
  if (Number.isNaN(ts)) return null
  return ts
})

const orderExpired = computed(() => {
  if (!order.value?.expires_at) return false
  const ts = new Date(order.value.expires_at).getTime()
  if (Number.isNaN(ts)) return false
  return ts <= Date.now()
})
const orderCanceled = computed(() => order.value?.status === 'canceled')
const paymentAlert = computed<PageAlert | null>(() => {
  if (redirecting.value) {
    return {
      level: 'success' as const,
      message: t('payment.redirecting'),
    }
  }
  if (orderCanceled.value) {
    return {
      level: 'error' as const,
      message: t('payment.orderCanceled'),
    }
  }
  if (orderExpired.value) {
    return {
      level: 'error' as const,
      message: t('payment.orderExpired'),
    }
  }
  if (error.value) {
    return {
      level: 'error' as const,
      message: error.value,
    }
  }
  return null
})
const remainingMs = computed(() => {
  if (!expiresAtMs.value) return null
  return expiresAtMs.value - now.value
})

const countdownExpired = computed(() => remainingMs.value !== null && remainingMs.value <= 0)

const countdownText = computed(() => {
  if (remainingMs.value === null) return '-'
  if (remainingMs.value <= 0) return t('payment.countdownExpired')
  const totalSeconds = Math.max(0, Math.floor(remainingMs.value / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const showCountdown = computed(() => Boolean(expiresAtMs.value && order.value?.status === 'pending_payment'))
const showResultView = computed(() => Boolean(paymentResult.value && order.value && order.value.status === 'pending_payment' && !orderExpired.value && !orderCanceled.value))
const pollingActive = computed(() => pollTimer.value !== null)
const orderItems = computed(() => (Array.isArray(order.value?.items) ? order.value.items : []))
const feeRateValue = computed(() => {
  if (paymentResult.value?.fee_rate !== undefined) {
    return parseAmount(paymentResult.value.fee_rate)
  }
  if (selectedChannel.value?.fee_rate !== undefined) {
    return parseAmount(selectedChannel.value.fee_rate)
  }
  return null
})
const feeRateDisplay = computed(() => {
  const rate = feeRateValue.value
  if (rate === null) return '-'
  if (rate <= 0) return t('payment.feeFree')
  return `${rate.toFixed(2)}%`
})
const feeAmountValue = computed(() => {
  if (paymentResult.value?.fee_amount !== undefined && paymentResult.value?.fee_amount !== null && paymentResult.value?.fee_amount !== '') {
    return parseAmount(paymentResult.value.fee_amount)
  }
  const rate = feeRateValue.value
  const base = parseAmount(order.value?.total_amount)
  if (rate === null || base === null) return null
  if (rate <= 0) return 0
  return Number((base * rate / 100).toFixed(2))
})
const feeAmountDisplay = computed(() => {
  const value = feeAmountValue.value
  if (value === null) return '-'
  return formatMoney(value.toFixed(2), order.value?.currency)
})
const payableAmountDisplay = computed(() => {
  if (paymentResult.value?.amount !== undefined && paymentResult.value?.amount !== null && paymentResult.value?.amount !== '') {
    return formatMoney(String(paymentResult.value.amount), order.value?.currency)
  }
  const base = parseAmount(order.value?.total_amount)
  const fee = feeAmountValue.value
  if (base === null || fee === null) return '-'
  const total = Number((base + fee).toFixed(2))
  return formatMoney(total.toFixed(2), order.value?.currency)
})
const walletBalanceDisplay = computed(() => formatMoney(walletBalance.value, order.value?.currency))
const expectedWalletPaidValue = computed(() => {
  if (!showBalanceOption.value || !useBalance.value) return 0
  const balance = parseAmount(walletBalance.value)
  const total = parseAmount(order.value?.total_amount)
  if (balance === null || total === null) return 0
  const value = Math.min(balance, total)
  return Number(value.toFixed(2))
})
const expectedOnlinePayValue = computed(() => {
  const total = parseAmount(order.value?.total_amount)
  if (total === null) return 0
  const value = total - expectedWalletPaidValue.value
  return Number(Math.max(value, 0).toFixed(2))
})
const expectedWalletPaidDisplay = computed(() => formatMoney(expectedWalletPaidValue.value.toFixed(2), order.value?.currency))
const expectedOnlinePayDisplay = computed(() => formatMoney(expectedOnlinePayValue.value.toFixed(2), order.value?.currency))
const requiresOnlineChannel = computed(() => {
  if (isGuest.value) return true
  if (!useBalance.value) return true
  return expectedOnlinePayValue.value > 0
})
const canSubmitPayment = computed(() => {
  if (submitting.value) return false
  if (requiresOnlineChannel.value && !selectedChannelId.value) return false
  if (orderExpired.value || orderCanceled.value) return false
  return true
})
const paymentWalletPaidDisplay = computed(() => {
  if (paymentResult.value?.wallet_paid_amount === undefined || paymentResult.value?.wallet_paid_amount === null || paymentResult.value?.wallet_paid_amount === '') {
    return '-'
  }
  return formatMoney(String(paymentResult.value.wallet_paid_amount), order.value?.currency)
})
const paymentOnlinePayDisplay = computed(() => {
  if (paymentResult.value?.online_pay_amount === undefined || paymentResult.value?.online_pay_amount === null || paymentResult.value?.online_pay_amount === '') {
    return '-'
  }
  return formatMoney(String(paymentResult.value.online_pay_amount), order.value?.currency)
})

const loadWallet = async () => {
  if (isGuest.value) return
  walletLoading.value = true
  try {
    const response = await walletAPI.account()
    walletBalance.value = String(response.data.data?.balance || '0')
  } catch {
    walletBalance.value = '0'
  } finally {
    walletLoading.value = false
  }
}

const loadOrder = async (options?: { silent?: boolean }) => {
  const silent = options?.silent && !!order.value
  if (!silent) {
    loading.value = true
  }
  try {
    if (isGuest.value) {
      if (!hasGuestAuth.value) {
        order.value = null
        guestAuthError.value = t('payment.guestAuthRequired')
        return
      }
      if (!orderNoQuery.value) {
        order.value = null
        return
      }
      const response = await guestOrderAPI.detailByOrderNo(orderNoQuery.value, {
        email: guestAuth.value.email,
        order_password: guestAuth.value.order_password,
      }, { silentBusinessError: true })
      order.value = response.data.data
      guestAuthError.value = ''
    } else {
      if (!orderNoQuery.value) {
        order.value = null
        return
      }
      const response = await userOrderAPI.detailByOrderNo(orderNoQuery.value, { silentBusinessError: true })
      order.value = response.data.data
    }
  } catch (err) {
    if (!silent) {
      order.value = null
      if (isGuest.value) {
        guestAuthError.value = t('payment.guestAuthInvalid')
      }
    }
  } finally {
    if (!silent) {
      loading.value = false
    }
    if (!silent && order.value) {
      if (orderCanceled.value) {
        error.value = t('payment.orderCanceled')
        cachedPayment.value = null
        return
      }
      if (orderExpired.value) {
        error.value = t('payment.orderExpired')
        cachedPayment.value = null
        return
      }
      if (!latestLoaded.value && order.value.status === 'pending_payment') {
        latestLoaded.value = true
        await loadLatestPayment()
      }
    }
  }
}

const debouncedLoadOrder = debounceAsync(loadOrder, 250)

const startCountdown = () => {
  if (!expiresAtMs.value || countdownTimer.value) return
  if (order.value?.status !== 'pending_payment') return
  now.value = Date.now()
  countdownTimer.value = window.setInterval(() => {
    now.value = Date.now()
  }, 1000)
}

const stopCountdown = () => {
  if (!countdownTimer.value) return
  window.clearInterval(countdownTimer.value)
  countdownTimer.value = null
}

const startPolling = () => {
  if (pollTimer.value) return
  pollTimer.value = window.setInterval(async () => {
    await debouncedLoadOrder({ silent: true })
  }, 5000)
}

const stopPolling = () => {
  if (!pollTimer.value) return
  window.clearInterval(pollTimer.value)
  pollTimer.value = null
}

const handleCopyPayLink = async () => {
  if (!payLink.value) return
  try {
    await copyText(payLink.value)
    copied.value = true
    if (copiedTimer.value) {
      window.clearTimeout(copiedTimer.value)
    }
    copiedTimer.value = window.setTimeout(() => {
      copied.value = false
      copiedTimer.value = null
    }, 1500)
  } catch (err: any) {
    error.value = err?.message || t('payment.copyFailed')
  }
}

const loadLatestPayment = async () => {
  if (!order.value || order.value.status !== 'pending_payment') return
  if (paymentResult.value) return
  if (isGuest.value && !hasGuestAuth.value) return
  if (!orderId.value) return
  try {
    let response
    if (isGuest.value) {
      response = await guestOrderAPI.latestPayment({
        order_id: orderId.value,
        email: guestAuth.value.email,
        order_password: guestAuth.value.order_password,
      })
    } else {
      response = await paymentAPI.latest({ order_id: orderId.value })
    }
    const data = response.data.data
    if (data && (data.pay_url || data.qr_code)) {
      cachedPayment.value = data
      paymentResult.value = data
      selectedChannelId.value = data.channel_id || null
      startPolling()
      startCountdown()
    }
  } catch (err) {
    // 没有历史支付记录时忽略错误
  }
}

const buildPayRouteQuery = () => {
  const query: Record<string, string> = {}
  const resolvedOrderNo = String(order.value?.order_no || orderNoQuery.value || '').trim()
  if (resolvedOrderNo !== '') {
    query.order_no = resolvedOrderNo
  }
  if (isGuest.value) {
    query.guest = '1'
  }
  return query
}

const capturePaypalIfNeeded = async () => {
  if (capturing.value) return
  if (!paymentResult.value?.payment_id) return
  const providerType = String(paymentResult.value?.provider_type || '').toLowerCase()
  const channelType = String(paymentResult.value?.channel_type || '').toLowerCase()
  if (!(providerType === 'official' && channelType === 'paypal')) return
  const returnFlag = String(route.query.pp_return || '').toLowerCase()
  const token = String(route.query.token || '').trim()
  const payerId = String(route.query.payer_id || route.query.PayerID || '').trim()
  if (returnFlag !== '1' && token === '' && payerId === '') return
  if (!orderId.value || !order.value || order.value.status !== 'pending_payment') return

  capturing.value = true
  error.value = ''
  try {
    if (isGuest.value) {
      if (!hasGuestAuth.value) {
        guestAuthError.value = t('payment.guestAuthRequired')
        return
      }
      await guestOrderAPI.capturePayment(Number(paymentResult.value.payment_id), {
        email: guestAuth.value.email,
        order_password: guestAuth.value.order_password,
      })
    } else {
      await paymentAPI.capture(Number(paymentResult.value.payment_id))
    }
    await debouncedLoadOrder({ silent: true })
    await router.replace({
      path: route.path,
      query: buildPayRouteQuery(),
    })
  } catch (err: any) {
    error.value = err?.message || t('payment.captureFailed')
  } finally {
    capturing.value = false
  }
}

const captureStripeIfNeeded = async () => {
  if (capturing.value) return
  if (!paymentResult.value?.payment_id) return
  const providerType = String(paymentResult.value?.provider_type || '').toLowerCase()
  const channelType = String(paymentResult.value?.channel_type || '').toLowerCase()
  if (!(providerType === 'official' && channelType === 'stripe')) return
  const returnFlag = String(route.query.stripe_return || '').toLowerCase()
  const sessionID = String(route.query.session_id || '').trim()
  if (returnFlag !== '1' && sessionID === '') return
  if (!orderId.value || !order.value || order.value.status !== 'pending_payment') return

  capturing.value = true
  error.value = ''
  try {
    if (isGuest.value) {
      if (!hasGuestAuth.value) {
        guestAuthError.value = t('payment.guestAuthRequired')
        return
      }
      await guestOrderAPI.capturePayment(Number(paymentResult.value.payment_id), {
        email: guestAuth.value.email,
        order_password: guestAuth.value.order_password,
      })
    } else {
      await paymentAPI.capture(Number(paymentResult.value.payment_id))
    }
    await debouncedLoadOrder({ silent: true })
    await router.replace({
      path: route.path,
      query: buildPayRouteQuery(),
    })
  } catch (err: any) {
    error.value = err?.message || t('payment.captureFailed')
  } finally {
    capturing.value = false
  }
}

const syncEpayReturnIfNeeded = async () => {
  const epayReturn = String(route.query.epay_return || '').toLowerCase()
  
  if (epayReturn !== '1') return
  if (!orderNoQuery.value) return

  try {
    await debouncedLoadOrder({ silent: true })
    await loadLatestPayment()
  } finally {
    await router.replace({
      path: route.path,
      query: buildPayRouteQuery(),
    })
  }
}

const performPayment = async () => {
  error.value = ''
  if (!orderId.value) {
    error.value = t('payment.orderNotFound')
    return
  }
  if (requiresOnlineChannel.value && !selectedChannelId.value) {
    error.value = t('payment.selectChannelError')
    return
  }
  if (orderCanceled.value) {
    error.value = t('payment.orderCanceled')
    return
  }
  if (orderExpired.value) {
    error.value = t('payment.orderExpired')
    return
  }
  if (requiresOnlineChannel.value && cachedPayment.value && selectedChannelId.value && selectedChannelId.value === cachedPayment.value.channel_id) {
    paymentResult.value = cachedPayment.value
    openedPayWindow.value = false
    startPolling()
    startCountdown()
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  submitting.value = true
  try {
    if (isGuest.value) {
      if (!hasGuestAuth.value) {
        error.value = t('payment.guestAuthRequired')
        return
      }
      const response = await guestOrderAPI.createPayment({
        email: guestAuth.value.email,
        order_password: guestAuth.value.order_password,
        order_id: orderId.value,
        channel_id: selectedChannelId.value,
      })
      paymentResult.value = response.data.data
      if (paymentResult.value?.pay_url || paymentResult.value?.qr_code) {
        cachedPayment.value = paymentResult.value
      }
      openedPayWindow.value = false
      startPolling()
    } else {
      const payload: any = {
        order_id: orderId.value,
        use_balance: useBalance.value,
      }
      if (requiresOnlineChannel.value && selectedChannelId.value) {
        payload.channel_id = selectedChannelId.value
      }
      const response = await paymentAPI.create(payload)
      const created = response.data.data || {}
      if (created.order_paid && !created.payment_id) {
        paymentResult.value = null
        cachedPayment.value = null
        selectedChannelId.value = null
        useBalance.value = false
        stopPolling()
        stopCountdown()
        await Promise.all([
          debouncedLoadOrder({ silent: true }),
          loadWallet(),
        ])
        redirectToOrderDetail()
        return
      }
      paymentResult.value = created
      if (paymentResult.value?.pay_url || paymentResult.value?.qr_code) {
        cachedPayment.value = paymentResult.value
      }
      openedPayWindow.value = false
      startPolling()
      await loadWallet()
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
    const mode = String(paymentResult.value?.interaction_mode || '').toLowerCase()
    if (mode === 'redirect' && payLink.value) {
      window.open(payLink.value, '_blank', 'noopener')
      openedPayWindow.value = true
    }
  } catch (err: any) {
    error.value = err.message || t('payment.createFailed')
  } finally {
    submitting.value = false
  }
}

const handlePayment = debounceAsync(performPayment, 200)

const shouldRedirect = (status?: string) => {
  if (!status) return false
  return ['paid', 'fulfilling', 'partially_delivered', 'delivered', 'completed'].includes(status)
}

const redirectToOrderDetail = () => {
  if (redirected.value) return
  const resolvedOrderNo = String(order.value?.order_no || orderNoQuery.value || '').trim()
  if (!resolvedOrderNo) return
  redirected.value = true
  redirecting.value = true
  const target = isGuest.value ? `/guest/orders/${resolvedOrderNo}` : `/orders/${resolvedOrderNo}`
  window.setTimeout(() => {
    router.push(target)
  }, 600)
}

const resetPayment = () => {
  paymentResult.value = null
  error.value = ''
  openedPayWindow.value = false
  redirecting.value = false
  redirected.value = false
  latestLoaded.value = false
}

const restoreCachedPayment = () => {
  if (!cachedPayment.value) return
  paymentResult.value = cachedPayment.value
  selectedChannelId.value = cachedPayment.value.channel_id || null
  openedPayWindow.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const formatDate = (raw?: string) => {
  if (!raw) return ''
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return raw
  return date.toLocaleString()
}

const statusLabel = (status: string) => orderStatusLabel(t, status)

const formatMoney = (amount?: string, currency?: string) => {
  if (amount === null || amount === undefined || amount === '') return '-'
  if (currency === null || currency === undefined || currency === '') {
    return String(amount)
  }
  return `${amount} ${currency}`
}

const parseAmount = (value?: any) => {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  if (Number.isNaN(parsed)) return null
  return parsed
}

const getLocalizedText = (jsonData: any) => {
  if (!jsonData) return ''
  const locale = appStore.locale
  return jsonData[locale] || jsonData['zh-CN'] || jsonData['en-US'] || ''
}

const fulfillmentTypeLabelText = (type: string) => fulfillmentTypeLabel(t, type, 'orderDetail')

const providerTypeLabel = (value?: string) => {
  const map: Record<string, string> = {
    official: t('payment.providerTypes.official'),
    epay: t('payment.providerTypes.epay'),
  }
  if (!value) return '-'
  return map[value] || value
}

const channelTypeLabel = (value?: string) => {
  const map: Record<string, string> = {
    wechat: t('payment.channelTypes.wechat'),
    wxpay: t('payment.channelTypes.wxpay'),
    alipay: t('payment.channelTypes.alipay'),
    qqpay: t('payment.channelTypes.qqpay'),
    paypal: t('payment.channelTypes.paypal'),
    stripe: t('payment.channelTypes.stripe'),
  }
  if (!value) return '-'
  return map[value] || value
}

onMounted(() => {
  if (!orderNoQuery.value) return
  const saved = localStorage.getItem('guest_order_auth')
  const savedAuth = saved ? JSON.parse(saved) : {}
  guestAuth.value = {
    email: savedAuth.email || '',
    order_password: savedAuth.order_password || '',
  }
  debouncedLoadOrder()
  void loadWallet()
  if (!appStore.config || !Array.isArray(appStore.config?.payment_channels)) {
    appStore.loadConfig(true)
  }
})

watch(
  () => order.value?.status,
  (status) => {
    if (!status) return
    if (status === 'canceled') {
      error.value = t('payment.orderCanceled')
      stopPolling()
      stopCountdown()
      return
    }
    if (status === 'pending_payment') {
      startPolling()
      startCountdown()
      return
    }
    stopPolling()
    stopCountdown()
    if (shouldRedirect(status)) {
      redirectToOrderDetail()
    }
  }
)

watch(
  () => [paymentResult.value?.payment_id, route.query.pp_return, route.query.token, route.query.payer_id, route.query.PayerID, route.query.stripe_return, route.query.session_id, route.query.epay_return, order.value?.status],
  () => {
    void capturePaypalIfNeeded()
    void captureStripeIfNeeded()
    void syncEpayReturnIfNeeded()
  },
  { immediate: true }
)

watch(expiresAtMs, (value) => {
  stopCountdown()
  if (!value) return
  if (order.value?.status !== 'pending_payment') return
  startCountdown()
})

watch(remainingMs, (value) => {
  if (value === null) return
  if (value <= 0) {
    stopCountdown()
  }
})

onUnmounted(() => {
  stopPolling()
  stopCountdown()
  if (copiedTimer.value) {
    window.clearTimeout(copiedTimer.value)
    copiedTimer.value = null
  }
  debouncedLoadOrder.cancel()
})

const handleGuestAuthSubmit = async () => {
  guestAuthError.value = ''
  if (!hasGuestAuth.value) {
    guestAuthError.value = t('payment.guestAuthRequired')
    return
  }
  localStorage.setItem('guest_order_auth', JSON.stringify({
    email: guestAuth.value.email,
    order_password: guestAuth.value.order_password,
  }))
  await debouncedLoadOrder()
}

const handleRefresh = async () => {
  await Promise.all([
    debouncedLoadOrder(),
    loadWallet(),
  ])
}
</script>
