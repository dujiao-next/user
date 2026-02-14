<template>
  <nav
    class="fixed top-0 left-0 right-0 z-50 theme-panel-soft border-b theme-border backdrop-blur-md transition-all duration-300">
    <div class="container mx-auto px-4 py-4 flex items-center justify-between">
      <!-- Logo -->
      <router-link to="/" class="flex items-center space-x-3 group relative">
        <div
          class="relative w-10 h-10 theme-btn-primary rounded-xl flex items-center justify-center transition-colors duration-300">
          <span class="text-white font-black text-xl tracking-tighter">{{ brandLogoText }}</span>
        </div>
        <span
          class="text-xl font-bold theme-text-primary tracking-wide hidden sm:block transition-colors">
          {{ brandSiteName }}
        </span>
      </router-link>

      <!-- Desktop Menu -->
      <div class="hidden md:flex items-center space-x-1">
        <router-link v-for="item in menuItems" :key="item.path" :to="item.path"
          class="theme-nav-link text-sm relative group overflow-hidden"
          active-class="theme-nav-link-active">
          <span class="relative z-10">{{ t(item.label) }}</span>
        </router-link>
      </div>

      <!-- Right Side Actions -->
      <div class="flex items-center space-x-2 md:space-x-4">
        <router-link to="/cart"
          class="theme-nav-link relative gap-2 px-2 md:px-3">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.3 2.6a1 1 0 00.9 1.4H19M7 13l.4 2M10 21a1 1 0 100-2 1 1 0 000 2zm8 1a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
          <span class="hidden sm:inline text-xs font-medium">{{ t('navbar.cart') }}</span>
          <span v-if="cartCount > 0"
            class="theme-nav-badge absolute -top-1 -right-1">
            {{ cartCount }}
          </span>
        </router-link>

        <router-link v-if="!userAuthStore.isAuthenticated" to="/guest/orders"
          class="hidden md:inline-flex theme-nav-link">
          {{ t('navbar.guestOrders') }}
        </router-link>
        <router-link v-if="!userAuthStore.isAuthenticated" to="/auth/login"
          class="hidden md:inline-flex theme-nav-link">
          {{ t('navbar.login') }}
        </router-link>
        <router-link v-if="userAuthStore.isAuthenticated" to="/me"
          class="hidden md:inline-flex theme-nav-link">
          {{ t('navbar.personalCenter') }}
        </router-link>
        <button v-if="userAuthStore.isAuthenticated" @click="userAuthStore.logout()"
          class="hidden md:inline-flex px-3 py-2 rounded-lg text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-white hover:bg-red-50 dark:hover:bg-red-500/10 transition-all border border-transparent hover:border-red-200 dark:hover:border-red-500/20 text-xs font-medium">
          {{ t('navbar.logout') }}
        </button>
        <!-- Theme Switcher -->
        <button @click="toggleTheme"
          class="theme-nav-link p-2">
          <SunIcon v-if="theme === 'dark'" class="w-4 h-4" />
          <MoonIcon v-else class="w-4 h-4" />
        </button>

        <!-- Language Switcher -->
        <div class="relative group/lang lang-switcher">
          <button @click="toggleLangMenu"
            class="theme-nav-link space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <span class="hidden md:inline text-xs font-medium uppercase tracking-wider">{{ currentLocale }}</span>
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

        <!-- Mobile Menu Button -->
        <button @click="toggleMobileMenu"
          class="md:hidden theme-nav-link p-2">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="!showMobileMenu" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <transition enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform -translate-y-4 opacity-0" enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in" leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-4 opacity-0">
      <div v-if="showMobileMenu"
        class="md:hidden border-t theme-border theme-panel-strong backdrop-blur-xl absolute left-0 right-0">
        <div class="container mx-auto px-4 py-4 space-y-1">
          <router-link v-for="item in menuItems" :key="item.path" :to="item.path" @click="showMobileMenu = false"
            class="w-full justify-start theme-nav-link text-sm"
            active-class="theme-nav-link-active">
            {{ t(item.label) }}
          </router-link>
          <router-link v-if="!userAuthStore.isAuthenticated" to="/guest/orders" @click="showMobileMenu = false"
            class="w-full justify-start theme-nav-link text-sm"
            active-class="theme-nav-link-active">
            {{ t('navbar.guestOrders') }}
          </router-link>
          <router-link v-if="!userAuthStore.isAuthenticated" to="/auth/login" @click="showMobileMenu = false"
            class="w-full justify-start theme-nav-link text-sm"
            active-class="theme-nav-link-active">
            {{ t('navbar.login') }}
          </router-link>
          <router-link v-if="userAuthStore.isAuthenticated" to="/me" @click="showMobileMenu = false"
            class="w-full justify-start theme-nav-link text-sm"
            active-class="theme-nav-link-active">
            {{ t('navbar.personalCenter') }}
          </router-link>
          <button v-if="userAuthStore.isAuthenticated" @click="userAuthStore.logout(); showMobileMenu = false"
            class="w-full text-left px-4 py-3 rounded-lg text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-white hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-medium border border-transparent hover:border-red-200 dark:hover:border-red-500/20">
            {{ t('navbar.logout') }}
          </button>
        </div>
      </div>
    </transition>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
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

const menuItems = [
  { path: '/', label: 'nav.home' },
  { path: '/products', label: 'nav.products' },
  { path: '/blog', label: 'nav.blog' },
  { path: '/notice', label: 'nav.notice' },
  { path: '/about', label: 'nav.about' },
]

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

const brandLogoText = computed(() => {
  const text = String(appStore.config?.brand?.logo_text || '').trim()
  return text !== '' ? text : 'D&N'
})

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

// Click outside to close menus
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.lang-switcher')) {
    showLangMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
