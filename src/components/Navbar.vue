<template>
  <nav
    class="fixed top-0 left-0 right-0 z-50 theme-panel-soft border-b theme-border backdrop-blur-md transition-all"
    :class="scrolled ? 'py-2 shadow-lg' : 'py-4'"
    :style="{ transitionDuration: 'var(--ui-duration-normal)' }">
    <div class="container mx-auto px-4 flex items-center justify-between gap-4">
      <!-- Logo -->
      <router-link to="/" class="theme-wordmark group relative" :title="brandSiteName">
        <span class="theme-wordmark-text">{{ brandSiteName }}</span>
      </router-link>

      <!-- Desktop Menu -->
      <div class="hidden lg:flex items-center space-x-1 min-w-0 overflow-x-auto scrollbar-hide">
        <template v-for="item in menuItems" :key="item.key">
          <router-link v-if="item.type === 'route'" :to="item.path"
            class="theme-nav-link text-sm relative group overflow-hidden flex items-center gap-1.5 whitespace-nowrap shrink-0"
            active-class="theme-nav-link-active">
            <svg class="w-4 h-4 shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" :d="item.icon" />
            </svg>
            <span class="relative z-10">{{ item.label.startsWith('nav.') ? t(item.label) : item.label }}</span>
          </router-link>
          <a v-else :href="item.path" :target="item.target" rel="noopener noreferrer"
            class="theme-nav-link text-sm relative group overflow-hidden flex items-center gap-1.5 whitespace-nowrap shrink-0">
            <svg class="w-4 h-4 shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" :d="item.icon" />
            </svg>
            <span class="relative z-10">{{ item.label }}</span>
          </a>
        </template>
      </div>

      <!-- Right Side Actions -->
      <div class="flex items-center shrink-0 space-x-2 lg:space-x-4">
        <!-- Cart (desktop only, mobile has bottom nav) -->
        <router-link to="/cart"
          class="hidden lg:flex theme-nav-link relative gap-2 px-3 min-w-[44px] min-h-[44px] items-center justify-center whitespace-nowrap">
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.3 2.6a1 1 0 00.9 1.4H19M7 13l.4 2M10 21a1 1 0 100-2 1 1 0 000 2zm8 1a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
          <span class="text-xs font-medium">{{ t('navbar.cart') }}</span>
          <span v-if="cartCount > 0"
            class="theme-nav-badge absolute -top-1 -right-1"
            :class="{ 'theme-bounce-in': cartBounce }">
            {{ cartCount }}
          </span>
        </router-link>

        <router-link v-if="!userAuthStore.isAuthenticated" to="/guest/orders"
          class="hidden lg:inline-flex theme-nav-link items-center gap-1.5 whitespace-nowrap">
          <svg class="w-4 h-4 shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          {{ t('navbar.guestOrders') }}
        </router-link>
        <router-link v-if="!userAuthStore.isAuthenticated" to="/auth/login"
          class="hidden lg:inline-flex theme-nav-link items-center gap-1.5 whitespace-nowrap">
          <svg class="w-4 h-4 shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          {{ t('navbar.login') }}
        </router-link>
        <router-link v-if="userAuthStore.isAuthenticated" to="/me"
          class="hidden lg:inline-flex theme-nav-link items-center gap-1.5 whitespace-nowrap">
          <svg class="w-4 h-4 shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {{ t('navbar.personalCenter') }}
        </router-link>
        <button v-if="userAuthStore.isAuthenticated" @click="userAuthStore.logout()"
          class="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-white hover:bg-red-50 dark:hover:bg-red-500/10 transition-all border border-transparent hover:border-red-200 dark:hover:border-red-500/20 text-xs font-medium whitespace-nowrap">
          <svg class="w-4 h-4 shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {{ t('navbar.logout') }}
        </button>
        <!-- Theme Switcher -->
        <button @click="toggleTheme"
          class="theme-nav-link p-2 min-w-[44px] min-h-[44px] flex items-center justify-center">
          <SunIcon v-if="theme === 'dark'" class="w-4 h-4" />
          <MoonIcon v-else class="w-4 h-4" />
        </button>

        <!-- Language Switcher (Desktop) -->
        <div class="relative group/lang lang-switcher hidden lg:block">
          <button @click="toggleLangMenu"
            class="theme-nav-link space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <span class="text-xs font-medium uppercase tracking-wider">{{ currentLocale }}</span>
          </button>

          <!-- Dropdown -->
          <div v-if="showLangMenu"
            class="absolute right-0 mt-2 w-40 theme-panel-strong border rounded-xl shadow-2xl py-2 z-50 overflow-hidden backdrop-blur-xl">
            <div class="px-2 pb-2 mb-2 border-b border-gray-100 dark:border-white/5">
              <span class="text-xs theme-text-muted font-mono px-2">{{ t('navbar.selectLanguage') }}</span>
            </div>
            <button v-for="lang in languages" :key="lang.code" @click="changeLanguage(lang.code)"
              class="w-full text-left px-4 py-2.5 text-sm theme-text-secondary hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-between group/item"
              :class="{ 'theme-text-accent': appStore.locale === lang.code }">
              {{ lang.name }}
              <span v-if="appStore.locale === lang.code"
                class="w-1.5 h-1.5 rounded-full theme-accent-stick"></span>
            </button>
          </div>
        </div>

        <!-- Mobile Menu Button (more menu, not main nav) -->
        <button @click="toggleMobileMenu"
          class="lg:hidden theme-nav-link p-2 min-w-[44px] min-h-[44px] flex items-center justify-center">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="1.5" fill="currentColor" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            <circle cx="12" cy="19" r="1.5" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>

  </nav>

  <!-- Teleport drawer outside nav to avoid backdrop-filter containing block bug -->
  <Teleport to="body">
    <!-- Mobile Drawer Overlay -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0">
      <div v-if="showMobileMenu" class="lg:hidden fixed inset-0 z-[60] bg-black/50" @click="showMobileMenu = false" style="overscroll-behavior: none;"></div>
    </Transition>

    <!-- Mobile Drawer (only items NOT in bottom nav) -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full">
      <div v-if="showMobileMenu"
        class="lg:hidden fixed right-0 top-0 bottom-0 z-[70] w-72 max-w-[80vw] theme-panel-strong backdrop-blur-xl border-l theme-border overflow-y-auto"
        style="overscroll-behavior: none;">
        <div class="p-5 space-y-1">
          <!-- Header -->
          <div class="flex items-center justify-between mb-4">
            <span class="text-xs font-semibold theme-text-muted uppercase tracking-wider">{{ t('navbar.more') }}</span>
            <button @click="showMobileMenu = false" class="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg theme-btn-neutral">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Navigation items not in bottom nav -->
          <template v-for="item in mobileDrawerItems" :key="item.key">
            <router-link v-if="item.type === 'route'" :to="item.path" @click="showMobileMenu = false"
              class="block w-full text-left px-4 py-3 rounded-xl theme-nav-link text-sm min-h-[44px] flex items-center gap-3"
              active-class="theme-nav-link-active">
              <svg class="w-5 h-5 shrink-0 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" :d="item.icon" />
              </svg>
              {{ item.label.startsWith('nav.') ? t(item.label) : item.label }}
            </router-link>
            <a v-else :href="item.path" :target="item.target" rel="noopener noreferrer" @click="showMobileMenu = false"
              class="block w-full text-left px-4 py-3 rounded-xl theme-nav-link text-sm min-h-[44px] flex items-center gap-3">
              <svg class="w-5 h-5 shrink-0 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" :d="item.icon" />
              </svg>
              {{ item.label }}
            </a>
          </template>

          <!-- Guest orders (not in bottom nav) -->
          <router-link v-if="!userAuthStore.isAuthenticated" to="/guest/orders" @click="showMobileMenu = false"
            class="block w-full text-left px-4 py-3 rounded-xl theme-nav-link text-sm min-h-[44px] flex items-center gap-3"
            active-class="theme-nav-link-active">
            <svg class="w-5 h-5 shrink-0 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            {{ t('navbar.guestOrders') }}
          </router-link>

          <!-- Logout (login/me already in bottom nav) -->
          <button v-if="userAuthStore.isAuthenticated" @click="userAuthStore.logout(); showMobileMenu = false"
            class="w-full text-left px-4 py-3 rounded-xl text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-medium min-h-[44px] flex items-center gap-3">
            <svg class="w-5 h-5 shrink-0 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {{ t('navbar.logout') }}
          </button>

          <!-- Language Switcher -->
          <div class="mt-4 pt-4 border-t theme-border">
            <span class="text-xs theme-text-muted font-semibold uppercase tracking-wider px-4">{{ t('navbar.selectLanguage') }}</span>
            <div class="mt-2 space-y-1">
              <button v-for="lang in languages" :key="lang.code" @click="changeLanguage(lang.code)"
                class="w-full text-left px-4 py-2.5 rounded-xl text-sm transition-colors min-h-[44px] flex items-center justify-between"
                :class="appStore.locale === lang.code
                  ? 'theme-text-accent font-semibold'
                  : 'theme-text-secondary hover:theme-text-primary'">
                {{ lang.name }}
                <span v-if="appStore.locale === lang.code"
                  class="w-1.5 h-1.5 rounded-full theme-accent-stick"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '../stores/app'
import { useCartStore } from '../stores/cart'
import { useUserAuthStore } from '../stores/userAuth'
import { useTheme } from '../utils/theme'
import { SunIcon, MoonIcon } from '@heroicons/vue/24/outline'

const { t, locale } = useI18n()
const appStore = useAppStore()
const cartStore = useCartStore()
const userAuthStore = useUserAuthStore()
const { theme, toggleTheme } = useTheme()

const showMobileMenu = ref(false)
const showLangMenu = ref(false)
const scrolled = ref(false)
const cartBounce = ref(false)

const isListMode = computed(() => appStore.config?.template_mode === 'list')

// 内置导航项定义
const builtinNavDefs: Record<string, { path: string; label: string; icon: string }> = {
  plugins: { path: '/plugins', label: 'nav.plugins', icon: 'M16 18l6-6-6-6M8 6l-6 6 6 6m7-14l-4 16' },
  blog: { path: '/blog', label: 'nav.blog', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2' },
  notice: { path: '/notice', label: 'nav.notice', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
  about: { path: '/about', label: 'nav.about', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
}

interface NavItem {
  key: string
  path: string
  label: string
  icon: string
  type: 'route' | 'link'
  target: string
}

const navConfig = computed(() => appStore.config?.nav_config as {
  builtin?: Record<string, boolean>
  custom_items?: Array<{
    id: number; title: Record<string, string>; link_type: string
    url: string; target: string; sort_order: number; enabled: boolean; icon?: string
  }>
} | undefined)

const getCustomItemTitle = (item: { title?: Record<string, string> }): string => {
  const titles = item.title || {}
  return titles[locale.value] || titles['zh-CN'] || titles['en-US'] || ''
}

const presetIcons: Record<string, string> = {
  link: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
  document: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  globe: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9',
  star: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
  heart: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  chat: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  gift: 'M12 8v13m0-13V6a4 4 0 00-4-4 4 4 0 00-4 4v2h8zm0 0V6a4 4 0 014-4 4 4 0 014 4v2h-8zM5 8h14a1 1 0 011 1v3H4V9a1 1 0 011-1zm0 4h14v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-7z',
  lightning: 'M13 10V3L4 14h7v7l9-11h-7z',
  shield: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  book: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  code: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
  phone: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
  map: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
  music: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3',
  camera: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z',
}
const defaultIcon = presetIcons.link

const buildCustomNavItems = (): NavItem[] => {
  const items = navConfig.value?.custom_items
  if (!Array.isArray(items)) return []
  return items
    .filter((item) => item.enabled)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .map((item) => {
      const icon = (presetIcons[item.icon as string] || defaultIcon) as string
      return {
        key: `custom-${item.id}`,
        path: item.url || '',
        label: getCustomItemTitle(item),
        icon,
        type: item.link_type === 'external' ? 'link' as const : 'route' as const,
        target: item.target || '_self',
      }
    })
    .filter((item) => item.label && item.path)
}

const buildBuiltinNavItems = (): NavItem[] => {
  const builtin = navConfig.value?.builtin
  const result: NavItem[] = []
  for (const [key, def] of Object.entries(builtinNavDefs)) {
    if (builtin && builtin[key] === false) continue
    result.push({ key, path: def.path, label: def.label, icon: def.icon, type: 'route', target: '_self' })
  }
  return result
}

const menuItems = computed<NavItem[]>(() => {
  const items: NavItem[] = [
    { key: 'home', path: '/', label: 'nav.home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1', type: 'route', target: '_self' },
  ]
  if (!isListMode.value) {
    items.push({ key: 'products', path: '/products', label: 'nav.products', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', type: 'route', target: '_self' })
  }
  items.push(...buildBuiltinNavItems())
  items.push(...buildCustomNavItems())
  return items
})

// Mobile drawer only shows items NOT in the bottom nav (Home, Products, Cart, Me are in bottom nav)
const mobileDrawerItems = computed<NavItem[]>(() => {
  const items: NavItem[] = [...buildBuiltinNavItems(), ...buildCustomNavItems()]
  return items
})

const languages = [
  { code: 'zh-CN', name: '简体中文' },
  { code: 'zh-TW', name: '繁體中文' },
  { code: 'en-US', name: 'English' },
]

const currentLocale = computed(() => {
  const lang = languages.find(l => l.code === appStore.locale)
  if (!lang) return 'CN'
  return lang.code === 'en-US' ? 'EN' : (lang.code === 'zh-CN' ? '简' : '繁')
})

const cartCount = computed(() => cartStore.totalItems)

const brandSiteName = computed(() => {
  const text = String(appStore.config?.brand?.site_name || '').trim()
  return text !== '' ? text : 'Dujiao-Next'
})

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
  if (showMobileMenu.value) showLangMenu.value = false
}

const toggleLangMenu = () => {
  showLangMenu.value = !showLangMenu.value
}

const changeLanguage = (langCode: string) => {
  appStore.setLocale(langCode)
  locale.value = langCode
  showLangMenu.value = false
}

const handleScroll = () => {
  scrolled.value = window.scrollY > 20
}

// Click outside to close menus
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.lang-switcher')) {
    showLangMenu.value = false
  }
}

// Cart badge bounce animation on count change
watch(cartCount, (newVal, oldVal) => {
  if (newVal > oldVal) {
    cartBounce.value = true
    setTimeout(() => { cartBounce.value = false }, 400)
  }
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
