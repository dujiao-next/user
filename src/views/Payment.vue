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

      <CheckoutSteps class="mb-8" current-step="payment" />

      <!-- Loading Skeleton -->
      <div v-if="loading" class="space-y-6">
        <div class="theme-panel rounded-2xl p-6 space-y-4">
          <div class="flex items-center justify-between gap-4">
            <div class="space-y-2">
              <div class="h-5 w-40 rounded theme-skeleton"></div>
              <div class="h-3 w-56 rounded theme-skeleton"></div>
            </div>
            <div class="h-7 w-20 rounded-full theme-skeleton"></div>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 border-t theme-border">
            <div class="lg:col-span-2 space-y-3">
              <div class="w-full max-w-[260px] aspect-square rounded-xl theme-skeleton mx-auto lg:mx-0"></div>
              <div class="h-3 w-48 rounded theme-skeleton"></div>
            </div>
            <div class="space-y-3">
              <div class="h-4 w-24 rounded theme-skeleton"></div>
              <div class="h-4 w-32 rounded theme-skeleton"></div>
              <div class="h-4 w-28 rounded theme-skeleton"></div>
            </div>
          </div>
        </div>
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

      <EmptyState
        v-else-if="!order"
        icon="alert"
        :title="t('payment.orderNotFound')"
        :action-label="t('payment.backToOrders')"
        :action-to="backLink"
      />

      <div v-else-if="showResultView" class="space-y-6">
        <div class="theme-panel rounded-2xl p-6">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 class="text-xl font-bold theme-text-primary">{{ paymentResultTitle }}</h2>
              <p class="text-sm theme-text-muted mt-1">{{ paymentGuideTip }}</p>
              <div class="mt-2 text-xs theme-text-muted">
                {{ t('payment.methodLabel') }}：{{ resultChannelName }}
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
                class="theme-surface-soft border rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center text-center">
                <div class="text-sm theme-text-muted mb-4">{{ paymentGuideTitle }}</div>
                <div class="w-full max-w-[280px] sm:max-w-[240px] aspect-square rounded-xl overflow-hidden bg-white p-2">
                  <img :src="qrImageUrl" alt="QR Code" class="w-full h-full object-contain" />
                </div>
                <div v-if="qrUsingPayLinkFallback" class="mt-3 text-xs theme-text-muted">
                  {{ t('payment.qrFallbackHint') }}
                </div>
              </div>

              <div v-else class="theme-surface-soft border rounded-2xl p-6">
                <div class="text-sm theme-text-muted mb-3">{{ t('payment.openPayLink') }}</div>
                <button
                  type="button"
                  @click="handleOpenPayLink"
                  class="theme-btn-inline-md border theme-btn-secondary font-semibold">
                  {{ t('payment.openPayLink') }}
                </button>
                <div v-if="openedPayWindow" class="mt-3 text-xs text-emerald-500">
                  {{ payLinkOpenedTip }}
                </div>
                <div v-if="showTelegramPayHint" class="mt-3 text-xs theme-text-muted">
                  {{ t('payment.telegramExternalHint') }}
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
                  {{ t('payment.methodLabel') }}：{{ resultChannelName }}
                </div>
              </div>
              <PaymentAmountBreakdown
                :order="order"
                :payment-result="paymentResult"
                :fee-rate-display="feeRateDisplay"
                :fixed-fee-display="fixedFeeDisplay"
                :fee-amount-display="feeAmountDisplay"
                :payable-amount-display="payableAmountDisplay"
                :wallet-paid-display="paymentWalletPaidDisplay"
                :online-pay-display="paymentOnlinePayDisplay"
                :show-countdown="showCountdown"
                :countdown-text="countdownText"
                :polling-active="pollingActive"
                :format-money="formatMoney"
              />
              <div v-if="paymentResult.expires_at"
                class="theme-surface-soft border rounded-2xl p-4 text-xs theme-text-muted">
                {{ t('payment.expiresAt') }}：{{ formatDate(paymentResult.expires_at) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="orderExpired || orderCanceled" class="space-y-6">
        <div class="theme-panel rounded-2xl p-6">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 class="text-xl font-bold theme-text-primary">
                {{ orderCanceled ? t('payment.orderCanceled') : t('payment.orderExpired') }}
              </h2>
              <p class="text-sm theme-text-muted mt-1">{{ order.order_no }}</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <router-link :to="backLink"
                class="theme-btn-inline-md border theme-btn-secondary font-semibold">
                {{ t('payment.backToOrders') }}
              </router-link>
            </div>
          </div>
          <div class="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div class="theme-surface-soft border rounded-xl p-3">
              <div class="text-xs theme-text-muted">{{ t('payment.orderNo') }}</div>
              <div class="theme-text-primary font-mono mt-1">{{ order.order_no }}</div>
            </div>
            <div class="theme-surface-soft border rounded-xl p-3">
              <div class="text-xs theme-text-muted">{{ t('payment.orderStatus') }}</div>
              <div class="theme-text-primary font-mono mt-1">{{ statusLabel(order.status) }}</div>
            </div>
            <div class="theme-surface-soft border rounded-xl p-3">
              <div class="text-xs theme-text-muted">{{ t('orderDetail.amountTotal') }}</div>
              <div class="theme-text-primary font-mono mt-1">{{ formatMoney(order.total_amount, order.currency) }}</div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-6">
          <div class="theme-panel rounded-2xl p-6">
            <h2 class="text-lg font-bold mb-4 theme-text-primary">{{ t('payment.orderInfo') }}</h2>
            <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <div class="text-xs uppercase tracking-wider theme-text-muted">{{ t('payment.orderNo') }}</div>
                <div class="text-sm font-semibold theme-text-primary mt-1">{{ order.order_no }}</div>
              <div class="text-xs theme-text-muted mt-2">{{ t('orderDetail.createdAtLabel') }}：{{
                  formatDate(order.created_at) }}</div>
            </div>
            <div class="w-full md:w-auto md:min-w-[280px] theme-surface-soft border rounded-2xl p-4">
              <div class="text-xs uppercase tracking-wider theme-text-muted md:text-right">{{ t('payment.payableAmountLabel') }}</div>
              <div class="mt-1 text-2xl font-bold theme-text-primary md:text-right">{{ payableAmountDisplay }}</div>
              <div class="mt-4 space-y-2 text-xs">
                <div class="flex items-center justify-between gap-4">
                  <span class="theme-text-muted">{{ t('orderDetail.amountTotal') }}</span>
                  <span class="font-semibold theme-text-primary">{{ formatMoney(order.total_amount, order.currency) }}</span>
                </div>
                <div class="flex items-center justify-between gap-4">
                  <span class="theme-text-muted">{{ t('payment.feeRateLabel') }}</span>
                  <span class="font-medium theme-text-primary">{{ feeRateDisplay }}</span>
                </div>
                <div class="flex items-center justify-between gap-4">
                  <span class="theme-text-muted">{{ t('payment.fixedFeeLabel') }}</span>
                  <span class="font-medium theme-text-primary">{{ fixedFeeDisplay }}</span>
                </div>
                <div class="flex items-center justify-between gap-4">
                  <span class="theme-text-muted">{{ t('payment.feeAmountLabel') }}</span>
                  <span class="font-medium theme-text-primary">{{ feeAmountDisplay }}</span>
                </div>
                <div v-if="showBalanceOption && useBalance" class="flex items-center justify-between gap-4">
                  <span class="theme-text-muted">{{ t('payment.walletDeductLabel') }}</span>
                  <span class="font-medium theme-text-primary">{{ expectedWalletPaidDisplay }}</span>
                </div>
                <div v-if="showBalanceOption && useBalance" class="flex items-center justify-between gap-4">
                  <span class="theme-text-muted">{{ t('payment.onlinePayLabel') }}</span>
                  <span class="font-medium theme-text-primary">{{ expectedOnlinePayDisplay }}</span>
                </div>
              </div>
              <div class="mt-4 border-t border-gray-100 pt-3 text-xs dark:border-white/5">
                <div class="flex items-center justify-between gap-4">
                  <span class="theme-text-muted">{{ t('payment.orderStatus') }}</span>
                  <span class="font-medium theme-text-primary">{{ statusLabel(order.status) }}</span>
                </div>
              </div>
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
                <div
                  class="font-mono mt-1"
                  :class="hasDiscountAmount(order.discount_amount) ? 'text-rose-600 dark:text-rose-300' : 'theme-text-primary'"
                >
                  {{ formatDiscountMoney(order.discount_amount, order.currency) }}
                </div>
              </div>
              <div class="theme-surface-soft border rounded-xl p-3">
                <div class="text-xs theme-text-muted">{{ t('orderDetail.promotionDiscountLabel') }}</div>
                <div
                  class="font-mono mt-1"
                  :class="hasDiscountAmount(order.promotion_discount_amount) ? 'text-rose-600 dark:text-rose-300' : 'theme-text-primary'"
                >
                  {{ formatDiscountMoney(order.promotion_discount_amount, order.currency) }}
                </div>
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
              <div v-for="(item, idx) in orderItems" :key="idx"
                class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b border-gray-100 dark:border-white/5 pb-3">
                <div>
                  <div class="theme-text-primary font-medium">{{ getLocalizedText(item.title) }}</div>
                  <div class="text-xs theme-text-muted mt-1">
                    {{ t('orderDetail.quantityLabel') }}：{{ item.quantity }} · {{ t('orderDetail.itemFulfillmentLabel') }}：{{
                      fulfillmentTypeLabelText(item.fulfillment_type) }}
                  </div>
                  <div v-if="orderItemSkuText(item)" class="text-xs theme-text-muted mt-1">
                    {{ t('orderDetail.itemSkuLabel') }}：{{ orderItemSkuText(item) }}
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
            <template v-else>
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
                    <input v-model="useBalance" type="checkbox" class="h-4 w-4 accent-primary" :disabled="walletOnlyPayment" />
                    <span>{{ t('payment.useBalance') }}</span>
                  </label>
                </div>
                <div v-if="walletOnlyPayment" class="mt-3 text-xs text-amber-600 dark:text-amber-400">
                  {{ t('payment.walletOnlyHint') }}
                </div>
                <div v-if="useBalance" class="mt-3 space-y-1 text-xs theme-text-muted">
                  <div>{{ t('payment.walletDeductLabel') }}：{{ expectedWalletPaidDisplay }}</div>
                  <div v-if="!walletOnlyPayment">{{ t('payment.onlinePayLabel') }}：{{ expectedOnlinePayDisplay }}</div>
                  <div v-if="walletOnlyPayment && expectedOnlinePayCents > 0" class="text-amber-600 dark:text-amber-400">
                    {{ t('payment.walletInsufficientHint') }}
                  </div>
                </div>
              </div>
              <div v-if="cachedPayment"
                class="mb-4 rounded-xl border p-4 text-sm space-y-2 theme-alert-warning">
                <div class="font-semibold">{{ t('payment.cachedTitle') }}</div>
                <div>
                  {{ t('payment.cachedHint', {
                    channel: cachedChannelName,
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
              <PaymentChannelSelector
                v-if="!walletOnlyPayment"
                :channels="channels"
                :model-value="selectedChannelId"
                :show-balance-option="showBalanceOption"
                :format-channel-fee-rate="formatChannelFeeRate"
                :format-channel-fixed-fee="formatChannelFixedFee"
                :is-channel-disabled-for-amount="isChannelDisabledForAmount"
                :channel-amount-limit-hint="channelAmountLimitHint"
                @update:model-value="selectedChannelId = $event"
              />
            </template>
          </div>

          <div v-if="paymentResult"
            class="theme-panel rounded-2xl p-6">
            <h2 class="text-lg font-bold mb-4 theme-text-primary">{{ t('payment.infoTitle') }}</h2>
            <div class="text-sm theme-text-secondary space-y-2">
              <div>{{ t('payment.methodLabel') }}：{{ resultChannelName }}</div>
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
                <div class="theme-text-primary font-semibold">{{ paymentGuideTitle }}</div>
                <div>{{ paymentGuideTip }}</div>
                <div v-if="qrUsingPayLinkFallback" class="text-xs theme-text-muted">
                  {{ t('payment.qrFallbackHint') }}
                </div>
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
              <button
                type="button"
                @click="handleOpenPayLink"
                class="theme-btn-inline-md border theme-btn-secondary font-semibold text-center">
                {{ t('payment.openPayLink') }}
              </button>
              <button @click="handleCopyPayLink"
                class="theme-btn-inline-md border theme-btn-secondary">
                {{ t('payment.copyPayLink') }}
              </button>
              <div v-if="showTelegramPayHint" class="text-xs theme-text-muted">
                {{ t('payment.telegramExternalHint') }}
              </div>
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
            <div class="font-semibold">{{ t('payment.methodLabel') }}：{{ selectedChannelName }}</div>
          </div>
          <div
            v-else-if="!requiresOnlineChannel && !orderExpired && !orderCanceled"
            class="mb-4 rounded-lg border p-3 text-xs theme-alert-success"
          >
            {{ t('payment.walletPayOnly') }}
          </div>
          <div
            v-else-if="walletOnlyPayment && expectedOnlinePayCents > 0 && !orderExpired && !orderCanceled"
            class="mb-4 rounded-lg border p-3 text-xs theme-alert-warning"
          >
            {{ t('payment.walletInsufficientHint') }}
          </div>
          <div
            v-else-if="!walletOnlyPayment && requiresOnlineChannel && !orderExpired && !orderCanceled"
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
import { NavigationFailureType, isNavigationFailure, useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { guestOrderAPI, paymentAPI, userOrderAPI, walletAPI } from '../api'
import { useAppStore } from '../stores/app'
import { useTelegramMiniAppStore } from '../stores/telegramMiniApp'
import { orderStatusLabel } from '../utils/status'
import { fulfillmentTypeLabel } from '../utils/fulfillment'
import { debounceAsync } from '../utils/debounce'
import { copyText } from '../utils/clipboard'
import { amountToCents, basisPointsToPercent, calculateFeeCents, centsToAmount, rateToBasisPoints } from '../utils/money'
import { buildSkuDisplayTextFromSnapshot } from '../utils/sku'
import PaymentAmountBreakdown from '../components/payment/PaymentAmountBreakdown.vue'
import PaymentChannelSelector from '../components/payment/PaymentChannelSelector.vue'
import EmptyState from '../components/EmptyState.vue'
import CheckoutSteps from '../components/checkout/CheckoutSteps.vue'
import QRCode from 'qrcode'
import { pageAlertClass, type PageAlert } from '../utils/alerts'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const telegramMiniAppStore = useTelegramMiniAppStore()
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
const now = ref(appStore.getServerTime())
const copiedTimer = ref<number | null>(null)
const redirectTimer = ref<number | null>(null)
const walletLoading = ref(false)
const walletBalance = ref('0')
const useBalance = ref(false)
const orderPaymentChannels = ref<any[]>([])
const orderPaymentChannelsLoaded = ref(false)
const orderPaymentChannelsRequestId = ref(0)

const routeQueryValueToString = (value: unknown): string => {
  if (Array.isArray(value)) {
    for (const item of value) {
      const text = String(item ?? '').trim()
      if (text !== '') return text
    }
    return ''
  }
  return String(value ?? '').trim()
}

const readRouteQueryValue = (key: string): string => {
  const normalizedKey = String(key || '').trim().toLowerCase()
  if (normalizedKey === '') return ''

  const query = route.query as Record<string, unknown>
  const candidates = [key, normalizedKey, `amp;${key}`, `amp;${normalizedKey}`]
  for (const candidate of candidates) {
    const value = routeQueryValueToString(query[candidate])
    if (value !== '') return value
  }

  for (const [rawKey, rawValue] of Object.entries(query)) {
    const cleanedKey = String(rawKey || '').trim().toLowerCase().replace(/^(amp;)+/, '')
    if (cleanedKey !== normalizedKey) continue
    const value = routeQueryValueToString(rawValue)
    if (value !== '') return value
  }
  return ''
}

const readRouteQueryFlag = (key: string): boolean => {
  const value = readRouteQueryValue(key).toLowerCase()
  return value === '1' || value === 'true' || value === 'yes'
}

const paymentReturnMarkers = ['epay_return', 'alipay_return', 'wechat_return', 'epusdt_return', 'bepusdt_return', 'tokenpay_return', 'okpay_return', 'pp_return', 'stripe_return']
const rechargeBizType = computed(() => readRouteQueryValue('biz_type').toLowerCase())
const rechargeNoQuery = computed(() => {
  const rechargeNo = readRouteQueryValue('recharge_no')
  if (rechargeNo !== '') return rechargeNo
  const orderNo = readRouteQueryValue('order_no')
  if (/^WR/i.test(orderNo)) return orderNo
  return ''
})
const isRechargeReturn = computed(() => rechargeBizType.value === 'recharge' || /^WR/i.test(rechargeNoQuery.value))
const isGuest = computed(() => readRouteQueryFlag('guest'))
const orderNoQuery = computed(() => {
  const orderNo = readRouteQueryValue('order_no')
  if (orderNo !== '') return orderNo
  return readRouteQueryValue('out_trade_no')
})
const orderNoResolved = computed(() => {
  return order.value?.order_no || orderNoQuery.value || ''
})
const backLink = computed(() => (isGuest.value ? '/guest/orders' : '/me/orders'))
const hasGuestAuth = computed(() => Boolean(guestAuth.value.email && guestAuth.value.order_password))
const showGuestAuthForm = computed(() => isGuest.value && (!hasGuestAuth.value || guestAuthError.value))
const walletOnlyPayment = computed(() => !!appStore.config?.wallet_only_payment)
const showBalanceOption = computed(() => !isGuest.value)

const filterChannelsByOrder = (list: any[]) => {
  if (!Array.isArray(list)) return []
  let filtered = list.filter((channel: any) => {
    const providerType = String(channel?.provider_type || '').toLowerCase()
    const channelType = String(channel?.channel_type || '').toLowerCase()
    if (providerType === 'epay') {
      return ['wechat', 'wxpay', 'alipay', 'qqpay'].includes(channelType)
    }
    return true
  })
  // 按订单中商品允许的支付渠道过滤
  const allowedIds = order.value?.allowed_payment_channel_ids
  if (Array.isArray(allowedIds) && allowedIds.length > 0) {
    const allowedSet = new Set(allowedIds.map(Number))
    filtered = filtered.filter((ch: any) => allowedSet.has(Number(ch?.id)))
  }
  return filtered
}

const configReady = computed(() => !appStore.loading && (!!appStore.config || (!isGuest.value && orderPaymentChannelsLoaded.value)))
const channels = computed(() => {
  if (!isGuest.value && orderPaymentChannelsLoaded.value) {
    return filterChannelsByOrder(orderPaymentChannels.value)
  }
  const fallback = appStore.config?.payment_channels
  return filterChannelsByOrder(Array.isArray(fallback) ? fallback : [])
})

const normalizeID = (value: unknown) => String(value ?? '').trim()

const findChannelByID = (channelID: unknown) => {
  const target = normalizeID(channelID)
  if (target === '') return null
  return channels.value.find((item: any) => normalizeID(item?.id) === target) || null
}

const selectedChannel = computed(() => findChannelByID(selectedChannelId.value))

const cachedChannel = computed(() => findChannelByID(cachedPayment.value?.channel_id))

const selectedChannelName = computed(() => resolveChannelName(selectedChannel.value, selectedChannel.value?.channel_type))

const cachedChannelName = computed(() => resolveChannelName(cachedChannel.value, cachedPayment.value?.channel_type, cachedPayment.value?.channel_name))

const resultChannel = computed(() => findChannelByID(paymentResult.value?.channel_id))

const resultChannelName = computed(() => resolveChannelName(resultChannel.value, paymentResult.value?.channel_type, paymentResult.value?.channel_name))

const currentPaymentID = () => {
  const paymentID = Number(paymentResult.value?.payment_id || paymentResult.value?.id || 0)
  return Number.isFinite(paymentID) && paymentID > 0 ? paymentID : 0
}

const paymentProviderType = computed(() => String(paymentResult.value?.provider_type || resultChannel.value?.provider_type || '').toLowerCase())

const paymentChannelType = computed(() => String(paymentResult.value?.channel_type || resultChannel.value?.channel_type || '').toLowerCase())

const interactionLabel = computed(() => {
  if (!paymentResult.value?.interaction_mode) return '-'
  const mode = String(paymentResult.value.interaction_mode).toLowerCase()
  if (mode === 'qr') return t('payment.modeQr')
  if (mode === 'redirect') return t('payment.modeRedirect')
  return mode
})

const interactionMode = computed(() => String(paymentResult.value?.interaction_mode || '').toLowerCase())
const paymentResultTitle = computed(() => interactionMode.value === 'redirect' ? t('payment.resultRedirectTitle') : t('payment.resultTitle'))
const paymentGuideTitle = computed(() => interactionMode.value === 'redirect' ? t('payment.redirectTitle') : t('payment.qrTitle'))
const paymentGuideTip = computed(() => interactionMode.value === 'redirect' ? t('payment.redirectTip') : t('payment.qrTip'))

const showPayLink = computed(() => {
  return interactionMode.value === 'redirect' || Boolean(payLink.value)
})
const isTelegramMiniApp = computed(() => telegramMiniAppStore.isMiniApp && telegramMiniAppStore.isReady)
const showTelegramPayHint = computed(() => isTelegramMiniApp.value && Boolean(payLink.value))
const payLinkOpenedTip = computed(() => (
  isTelegramMiniApp.value ? t('payment.redirectOpenedTelegram') : t('payment.redirectOpened')
))

const payLink = computed(() => String(paymentResult.value?.pay_url || '').trim())
const qrCodeContent = computed(() => String(paymentResult.value?.qr_code || '').trim())
const qrFallbackContent = computed(() => {
  if (interactionMode.value !== 'qr') return ''
  if (qrCodeContent.value) return ''
  return payLink.value
})
const qrDisplayContent = computed(() => qrCodeContent.value || qrFallbackContent.value)
const qrUsingPayLinkFallback = computed(() => Boolean(!qrCodeContent.value && qrFallbackContent.value))
const showQRCode = computed(() => interactionMode.value === 'qr' && Boolean(qrDisplayContent.value))

const qrImageUrl = ref('')
const qrRenderVersion = ref(0)

const renderQRCodeImage = async () => {
  const qr = qrDisplayContent.value
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
  () => qrDisplayContent.value,
  () => {
    void renderQRCodeImage()
  },
  { immediate: true }
)

watch(walletOnlyPayment, (v) => {
  if (v) useBalance.value = true
}, { immediate: true })

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
  return ts <= appStore.getServerTime()
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
const feeRateBasisPoints = computed(() => {
  if (paymentResult.value?.fee_rate !== undefined) {
    return rateToBasisPoints(paymentResult.value.fee_rate)
  }
  if (selectedChannel.value?.fee_rate !== undefined) {
    return rateToBasisPoints(selectedChannel.value.fee_rate)
  }
  return null
})
const feeRateDisplay = computed(() => {
  const rate = feeRateBasisPoints.value
  const fixed = paymentResult.value?.fixed_fee !== undefined ? paymentResult.value.fixed_fee : selectedChannel.value?.fixed_fee

  let display = ''
  if (rate !== null && rate > 0) {
    display += `${basisPointsToPercent(rate)}%`
  }
  if (fixed !== undefined && Number(fixed) > 0) {
    if (display) display += ' + '
    display += formatMoney(String(fixed), order.value?.currency)
  }

  if (!display) return t('payment.feeFree')
  return display
})
const feeAmountCents = computed(() => {
  if (paymentResult.value?.fee_amount !== undefined && paymentResult.value?.fee_amount !== null && paymentResult.value?.fee_amount !== '') {
    return amountToCents(paymentResult.value.fee_amount)
  }
  const rate = feeRateBasisPoints.value
  const base = amountToCents(order.value?.total_amount)

  let fixedFeeCents = 0
  if (paymentResult.value?.fixed_fee !== undefined) {
    fixedFeeCents = amountToCents(paymentResult.value.fixed_fee) || 0
  } else if (selectedChannel.value?.fixed_fee !== undefined) {
    fixedFeeCents = amountToCents(selectedChannel.value.fixed_fee) || 0
  }

  if (rate === null || base === null) return null
  let totalFee = fixedFeeCents
  if (rate > 0 && base !== null) {
    const fee = calculateFeeCents(base, rate)
    if (fee !== null) {
      totalFee += fee
    }
  }
  return totalFee
})
const feeAmountDisplay = computed(() => {
  const value = feeAmountCents.value
  if (value === null) return '-'
  return formatMoney(centsToAmount(value), order.value?.currency)
})
const fixedFeeDisplay = computed(() => {
  const fixed = paymentResult.value?.fixed_fee !== undefined ? paymentResult.value.fixed_fee : selectedChannel.value?.fixed_fee
  if (fixed === undefined || fixed === null || fixed === '') {
    return formatMoney('0.00', order.value?.currency)
  }
  return formatMoney(String(fixed), order.value?.currency)
})
const payableAmountDisplay = computed(() => {
  if (paymentResult.value?.amount !== undefined && paymentResult.value?.amount !== null && paymentResult.value?.amount !== '') {
    return formatMoney(String(paymentResult.value.amount), order.value?.currency)
  }
  const base = amountToCents(order.value?.total_amount)
  const fee = feeAmountCents.value
  if (base === null || fee === null) return '-'
  return formatMoney(centsToAmount(base + fee), order.value?.currency)
})
const walletBalanceDisplay = computed(() => formatMoney(walletBalance.value, order.value?.currency))
const expectedWalletPaidCents = computed(() => {
  if (!showBalanceOption.value || !useBalance.value) return 0
  const balance = amountToCents(walletBalance.value)
  const total = amountToCents(order.value?.total_amount)
  if (balance === null || total === null) return 0
  return Math.min(balance, total)
})
const expectedOnlinePayCents = computed(() => {
  const total = amountToCents(order.value?.total_amount)
  if (total === null) return 0
  return Math.max(total - expectedWalletPaidCents.value, 0)
})
const expectedWalletPaidDisplay = computed(() => formatMoney(centsToAmount(expectedWalletPaidCents.value), order.value?.currency))
const expectedOnlinePayDisplay = computed(() => formatMoney(centsToAmount(expectedOnlinePayCents.value), order.value?.currency))
const requiresOnlineChannel = computed(() => {
  if (isGuest.value) return true
  if (!useBalance.value) return true
  return expectedOnlinePayCents.value > 0
})
const channelLimitMeta = (channel?: any) => {
  const minCents = amountToCents(String(channel?.min_amount ?? ''))
  const maxCents = amountToCents(String(channel?.max_amount ?? ''))
  return {
    minCents,
    maxCents,
    hasMin: minCents !== null && minCents > 0,
    hasMax: maxCents !== null && maxCents > 0,
    hideAmountOutRange: Boolean(channel?.hide_amount_out_range),
  }
}
const isChannelDisabledForAmount = (channel?: any) => {
  if (!requiresOnlineChannel.value) return false
  const targetAmount = expectedOnlinePayCents.value
  if (targetAmount <= 0) return false

  const meta = channelLimitMeta(channel)
  if (!meta.hasMin && !meta.hasMax) return false

  const lessThanMin = meta.hasMin && meta.minCents !== null && targetAmount < meta.minCents
  const greaterThanMax = meta.hasMax && meta.maxCents !== null && targetAmount > meta.maxCents
  if (!lessThanMin && !greaterThanMax) return false

  return !meta.hideAmountOutRange
}
const channelAmountLimitHint = (channel?: any) => {
  const meta = channelLimitMeta(channel)
  if (meta.hasMin && meta.hasMax && meta.minCents !== null && meta.maxCents !== null) {
    return t('payment.channelAmountLimitHint', {
      min: formatMoney(centsToAmount(meta.minCents), order.value?.currency),
      max: formatMoney(centsToAmount(meta.maxCents), order.value?.currency),
    })
  }
  if (meta.hasMin && meta.minCents !== null) {
    return t('payment.channelAmountMinHint', {
      min: formatMoney(centsToAmount(meta.minCents), order.value?.currency),
    })
  }
  if (meta.hasMax && meta.maxCents !== null) {
    return t('payment.channelAmountMaxHint', {
      max: formatMoney(centsToAmount(meta.maxCents), order.value?.currency),
    })
  }
  return ''
}
const selectedChannelAmountHint = computed(() => {
  const channel = findChannelByID(selectedChannelId.value)
  if (!channel) return ''
  if (!isChannelDisabledForAmount(channel)) return ''
  return channelAmountLimitHint(channel)
})
const canSubmitPayment = computed(() => {
  if (submitting.value) return false
  if (walletOnlyPayment.value && expectedOnlinePayCents.value > 0) return false
  if (!walletOnlyPayment.value && requiresOnlineChannel.value && !selectedChannelId.value) return false
  if (requiresOnlineChannel.value && selectedChannelAmountHint.value) return false
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

const loadOrderPaymentChannels = async () => {
  if (isGuest.value) {
    orderPaymentChannels.value = []
    orderPaymentChannelsLoaded.value = false
    return
  }
  if (!orderNoResolved.value) {
    orderPaymentChannels.value = []
    orderPaymentChannelsLoaded.value = false
    return
  }
  if (!requiresOnlineChannel.value) {
    orderPaymentChannels.value = []
    orderPaymentChannelsLoaded.value = true
    return
  }
  const amount = centsToAmount(expectedOnlinePayCents.value)
  const amountCents = amountToCents(amount)
  if (amountCents === null || amountCents <= 0) {
    orderPaymentChannels.value = []
    orderPaymentChannelsLoaded.value = true
    return
  }

  const requestID = ++orderPaymentChannelsRequestId.value
  try {
    const response = await userOrderAPI.getPaymentChannels({
      order_no: orderNoResolved.value,
      amount,
    })
    if (requestID !== orderPaymentChannelsRequestId.value) return
    const channels = response.data.data
    orderPaymentChannels.value = Array.isArray(channels) ? channels : []
    orderPaymentChannelsLoaded.value = true
  } catch {
    if (requestID !== orderPaymentChannelsRequestId.value) return
    orderPaymentChannels.value = []
    orderPaymentChannelsLoaded.value = false
  }
}

const debouncedLoadOrderPaymentChannels = debounceAsync(loadOrderPaymentChannels, 250)

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
        orderPaymentChannels.value = []
        orderPaymentChannelsLoaded.value = false
        return
      }
      const response = await guestOrderAPI.detail(orderNoQuery.value, {
        email: guestAuth.value.email,
        order_password: guestAuth.value.order_password,
      }, { silentBusinessError: true })
      order.value = response.data.data
      guestAuthError.value = ''
    } else {
      if (!orderNoQuery.value) {
        order.value = null
        orderPaymentChannels.value = []
        orderPaymentChannelsLoaded.value = false
        return
      }
      const response = await userOrderAPI.detail(orderNoQuery.value, { silentBusinessError: true })
      order.value = response.data.data
    }
  } catch (err) {
    if (!silent) {
      order.value = null
      orderPaymentChannels.value = []
      orderPaymentChannelsLoaded.value = false
      if (isGuest.value) {
        guestAuthError.value = t('payment.guestAuthInvalid')
      }
    }
  } finally {
    try {
      if (order.value) {
        if (orderCanceled.value) {
          if (!silent) {
            error.value = t('payment.orderCanceled')
          }
          cachedPayment.value = null
          return
        }
        if (orderExpired.value) {
          if (!silent) {
            error.value = t('payment.orderExpired')
          }
          cachedPayment.value = null
          return
        }
        if (!paymentResult.value && !latestLoaded.value && order.value.status === 'pending_payment') {
          latestLoaded.value = true
          await loadLatestPayment()
        }
      }
    } finally {
      if (!silent) {
        loading.value = false
      }
    }
  }
}

const debouncedLoadOrder = debounceAsync(loadOrder, 250)

const startCountdown = () => {
  if (!expiresAtMs.value || countdownTimer.value) return
  if (order.value?.status !== 'pending_payment') return
  now.value = appStore.getServerTime()
  countdownTimer.value = window.setInterval(() => {
    now.value = appStore.getServerTime()
  }, 1000)
}

const stopCountdown = () => {
  if (!countdownTimer.value) return
  window.clearInterval(countdownTimer.value)
  countdownTimer.value = null
}

const shouldCaptureCurrentPayment = () => {
  if (!currentPaymentID()) return false
  if (!order.value || order.value.status !== 'pending_payment') return false
  return paymentProviderType.value === 'official' && paymentChannelType.value === 'wechat'
}

const captureCurrentPayment = async (options?: { silent?: boolean }) => {
  if (capturing.value || !shouldCaptureCurrentPayment()) return
  capturing.value = true
  if (!options?.silent) {
    error.value = ''
  }
  try {
    const paymentID = currentPaymentID()
    if (!paymentID) return
    if (isGuest.value) {
      if (!hasGuestAuth.value) {
        if (!options?.silent) {
          guestAuthError.value = t('payment.guestAuthRequired')
        }
        return
      }
      await guestOrderAPI.capturePayment(paymentID, {
        email: guestAuth.value.email,
        order_password: guestAuth.value.order_password,
      })
    } else {
      await paymentAPI.capture(paymentID)
    }
  } catch (err: any) {
    if (!options?.silent) {
      error.value = err?.message || t('payment.captureFailed')
    }
  } finally {
    capturing.value = false
  }
}

const startPolling = () => {
  if (pollTimer.value) return
  pollTimer.value = window.setInterval(async () => {
    await captureCurrentPayment({ silent: true })
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

const openPayLinkInCompatibleWindow = () => {
  if (!payLink.value) return
  if (isTelegramMiniApp.value) {
    telegramMiniAppStore.openLink(payLink.value)
  } else {
    window.open(payLink.value, '_blank', 'noopener')
  }
  openedPayWindow.value = true
}

const handleOpenPayLink = () => {
  error.value = ''
  openPayLinkInCompatibleWindow()
}

const loadLatestPayment = async () => {
  if (!order.value || order.value.status !== 'pending_payment') return
  if (paymentResult.value) return
  if (isGuest.value && !hasGuestAuth.value) return
  if (!orderNoResolved.value) return
  try {
    let response
    if (isGuest.value) {
      response = await guestOrderAPI.latestPayment({
        order_no: orderNoResolved.value,
        email: guestAuth.value.email,
        order_password: guestAuth.value.order_password,
      })
    } else {
      response = await paymentAPI.latest({ order_no: orderNoResolved.value })
    }
    const data = response.data.data
    if (data && (data.pay_url || data.qr_code)) {
      cachedPayment.value = data
      paymentResult.value = data
      selectedChannelId.value = data.channel_id || null
      startPolling()
      void captureCurrentPayment({ silent: true })
      startCountdown()
      // 对 redirect 模式自动打开支付链接
      const mode = String(data.interaction_mode || '').toLowerCase()
      if (mode === 'redirect' && data.pay_url) {
        openPayLinkInCompatibleWindow()
      }
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

const buildRechargeReturnRouteQuery = () => {
  const query: Record<string, string> = {}
  const resolvedRechargeNo = String(rechargeNoQuery.value || '').trim()
  if (resolvedRechargeNo !== '') {
    query.recharge_no = resolvedRechargeNo
  }
  for (const marker of paymentReturnMarkers) {
    const value = readRouteQueryValue(marker)
    if (value !== '') {
      query[marker] = value
    }
  }
  for (const key of ['token', 'payer_id', 'PayerID', 'session_id']) {
    const value = readRouteQueryValue(key)
    if (value !== '') {
      query[key] = value
    }
  }
  return query
}

const redirectToWalletRecharge = async () => {
  const resolvedRechargeNo = String(rechargeNoQuery.value || '').trim()
  if (resolvedRechargeNo === '') return
  await router.replace({
    name: 'personal-center-wallet',
    query: buildRechargeReturnRouteQuery(),
  })
}

const capturePaypalIfNeeded = async () => {
  if (capturing.value) return
  const paymentID = currentPaymentID()
  if (!paymentID) return
  if (!(paymentProviderType.value === 'official' && paymentChannelType.value === 'paypal')) return
  const returnFlag = readRouteQueryValue('pp_return').toLowerCase()
  const token = readRouteQueryValue('token')
  const payerId = readRouteQueryValue('payer_id') || readRouteQueryValue('PayerID')
  if (returnFlag !== '1' && token === '' && payerId === '') return
  if (!orderNoResolved.value || !order.value || order.value.status !== 'pending_payment') return

  capturing.value = true
  error.value = ''
  try {
    if (isGuest.value) {
      if (!hasGuestAuth.value) {
        guestAuthError.value = t('payment.guestAuthRequired')
        return
      }
      await guestOrderAPI.capturePayment(paymentID, {
        email: guestAuth.value.email,
        order_password: guestAuth.value.order_password,
      })
    } else {
      await paymentAPI.capture(paymentID)
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
  const paymentID = currentPaymentID()
  if (!paymentID) return
  if (!(paymentProviderType.value === 'official' && paymentChannelType.value === 'stripe')) return
  const returnFlag = readRouteQueryValue('stripe_return').toLowerCase()
  const sessionID = readRouteQueryValue('session_id')
  if (returnFlag !== '1' && sessionID === '') return
  if (!orderNoResolved.value || !order.value || order.value.status !== 'pending_payment') return

  capturing.value = true
  error.value = ''
  try {
    if (isGuest.value) {
      if (!hasGuestAuth.value) {
        guestAuthError.value = t('payment.guestAuthRequired')
        return
      }
      await guestOrderAPI.capturePayment(paymentID, {
        email: guestAuth.value.email,
        order_password: guestAuth.value.order_password,
      })
    } else {
      await paymentAPI.capture(paymentID)
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

const syncPaymentReturnIfNeeded = async () => {
  // 支持所有支付方式的回调同步跳转
  const hasReturn = paymentReturnMarkers.some(marker => readRouteQueryValue(marker).toLowerCase() === '1')

  if (!hasReturn) return
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
  if (!orderNoResolved.value) {
    error.value = t('payment.orderNotFound')
    return
  }
  if (requiresOnlineChannel.value && !selectedChannelId.value) {
    error.value = t('payment.selectChannelError')
    return
  }
  if (requiresOnlineChannel.value && selectedChannelAmountHint.value) {
    error.value = selectedChannelAmountHint.value
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
    void captureCurrentPayment({ silent: true })
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
        order_no: orderNoResolved.value,
        channel_id: selectedChannelId.value,
      })
      paymentResult.value = response.data.data
      if (paymentResult.value?.pay_url || paymentResult.value?.qr_code) {
        cachedPayment.value = paymentResult.value
      }
      openedPayWindow.value = false
      startPolling()
      void captureCurrentPayment({ silent: true })
    } else {
      const payload: any = {
        order_no: orderNoResolved.value,
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
      void captureCurrentPayment({ silent: true })
      await loadWallet()
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
    const mode = String(paymentResult.value?.interaction_mode || '').toLowerCase()
    if (mode === 'redirect' && payLink.value) {
      openPayLinkInCompatibleWindow()
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

const resetRedirectState = () => {
  redirecting.value = false
  redirected.value = false
}

const redirectToOrderDetail = () => {
  if (redirected.value || redirecting.value) return
  const resolvedOrderNo = String(order.value?.order_no || orderNoQuery.value || '').trim()
  if (!resolvedOrderNo) return

  const target = isGuest.value
    ? { name: 'guest-order-detail', params: { order_no: resolvedOrderNo } }
    : { name: 'order-detail', params: { order_no: resolvedOrderNo } }
  const fallbackPath = isGuest.value
    ? `/guest/orders/${encodeURIComponent(resolvedOrderNo)}`
    : `/orders/${encodeURIComponent(resolvedOrderNo)}`
  const resolvedTarget = router.resolve(target)
  if (!resolvedTarget.matched.length) {
    window.location.assign(fallbackPath)
    return
  }

  redirected.value = true
  redirecting.value = true

  if (redirectTimer.value !== null) {
    window.clearTimeout(redirectTimer.value)
    redirectTimer.value = null
  }

  redirectTimer.value = window.setTimeout(async () => {
    try {
      const failure = await router.push(target)
      if (failure && !isNavigationFailure(failure, NavigationFailureType.duplicated)) {
        resetRedirectState()
        window.location.assign(fallbackPath)
      }
    } catch (_err) {
      resetRedirectState()
      window.location.assign(fallbackPath)
    } finally {
      if (redirectTimer.value !== null) {
        window.clearTimeout(redirectTimer.value)
        redirectTimer.value = null
      }
    }
  }, 600)
}

const resetPayment = () => {
  paymentResult.value = null
  error.value = ''
  openedPayWindow.value = false
  resetRedirectState()
  latestLoaded.value = false
}

const resetPaymentRouteState = () => {
  stopPolling()
  stopCountdown()
  resetPayment()
  cachedPayment.value = null
  selectedChannelId.value = null
  order.value = null
  orderPaymentChannels.value = []
  orderPaymentChannelsLoaded.value = false
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

const hasDiscountAmount = (amount?: string) => {
  if (amount === null || amount === undefined || amount === '') return false
  const valueCents = amountToCents(amount)
  return valueCents !== null && valueCents > 0
}

const formatDiscountMoney = (amount?: string, currency?: string) => {
  return hasDiscountAmount(amount) ? `-${formatMoney(amount, currency)}` : formatMoney(amount, currency)
}

const getLocalizedText = (jsonData: any) => {
  if (!jsonData) return ''
  const locale = appStore.locale
  return jsonData[locale] || jsonData['zh-CN'] || jsonData['en-US'] || ''
}

const orderItemSkuText = (item: any) => {
  return buildSkuDisplayTextFromSnapshot(item?.sku_snapshot, {
    locale: appStore.locale,
    fallback: t('productDetail.skuFallback'),
  })
}

const fulfillmentTypeLabelText = (type: string) => fulfillmentTypeLabel(t, type, 'orderDetail')

const channelTypeLabel = (value?: string) => {
  const map: Record<string, string> = {
    wechat: t('payment.channelTypes.wechat'),
    wxpay: t('payment.channelTypes.wxpay'),
    alipay: t('payment.channelTypes.alipay'),
    qqpay: t('payment.channelTypes.qqpay'),
    paypal: t('payment.channelTypes.paypal'),
    stripe: t('payment.channelTypes.stripe'),
    usdt: t('payment.channelTypes.usdt'),
    'usdt-trc20': t('payment.channelTypes.usdtTrc20'),
    'usdc-trc20': t('payment.channelTypes.usdcTrc20'),
    trx: t('payment.channelTypes.trx'),
  }
  if (!value) return '-'
  return map[value] || value
}

const resolveChannelName = (channel?: any, fallbackChannelType?: unknown, apiChannelName?: unknown) => {
  if (channel?.name) return channel.name
  const name = String(apiChannelName || '').trim()
  if (name) return name
  const channelType = String(fallbackChannelType || '').trim()
  if (channelType) return channelTypeLabel(channelType)
  return '-'
}

const formatChannelFeeRate = (channel?: any) => {
  const basisPoints = rateToBasisPoints(channel?.fee_rate)
  if (basisPoints === null) return '0.00%'
  return `${basisPointsToPercent(basisPoints)}%`
}

const formatChannelFixedFee = (channel?: any) => {
  const fixedFee = channel?.fixed_fee
  if (fixedFee === null || fixedFee === undefined || fixedFee === '') {
    return formatMoney('0.00', order.value?.currency)
  }
  return formatMoney(String(fixedFee), order.value?.currency)
}

onMounted(() => {
  if (isRechargeReturn.value && rechargeNoQuery.value) {
    void redirectToWalletRecharge()
    return
  }
  if (!orderNoQuery.value) return
  const saved = localStorage.getItem('guest_order_auth')
  const savedAuth = saved ? JSON.parse(saved) : {}
  guestAuth.value = {
    email: savedAuth.email || '',
    order_password: savedAuth.order_password || '',
  }
  loadOrder()
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
  () => [isGuest.value, orderNoQuery.value],
  async ([, orderNo], [, previousOrderNo]) => {
    if (!previousOrderNo || orderNo === previousOrderNo) return
    resetPaymentRouteState()
    if (!orderNo) return
    await loadOrder()
    void loadWallet()
  }
)

watch(
  () => [isGuest.value, orderNoResolved.value, requiresOnlineChannel.value, expectedOnlinePayCents.value, order.value?.status],
  () => {
    void debouncedLoadOrderPaymentChannels()
  },
  { immediate: true }
)

watch(
  () => [currentPaymentID(), paymentProviderType.value, paymentChannelType.value, route.fullPath, order.value?.status],
  () => {
    void capturePaypalIfNeeded()
    void captureStripeIfNeeded()
    void syncPaymentReturnIfNeeded()
  },
  { immediate: true }
)

watch(
  () => [channels.value, expectedOnlinePayCents.value, requiresOnlineChannel.value],
  () => {
    if (!selectedChannelId.value) return
    const selected = findChannelByID(selectedChannelId.value)
    if (!selected || isChannelDisabledForAmount(selected)) {
      selectedChannelId.value = null
    }
  },
  { deep: true }
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
  if (redirectTimer.value) {
    window.clearTimeout(redirectTimer.value)
    redirectTimer.value = null
  }
  if (copiedTimer.value) {
    window.clearTimeout(copiedTimer.value)
    copiedTimer.value = null
  }
  debouncedLoadOrder.cancel()
  debouncedLoadOrderPaymentChannels.cancel()
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
  await captureCurrentPayment()
  await Promise.all([
    debouncedLoadOrder(),
    loadWallet(),
    debouncedLoadOrderPaymentChannels(),
  ])
}
</script>
