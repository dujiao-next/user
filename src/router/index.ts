import { createRouter, createWebHistory } from 'vue-router'
import { useUserAuthStore } from '../stores/userAuth'
import { useAppStore } from '../stores/app'
import { useTelegramMiniAppStore } from '../stores/telegramMiniApp'
import { captureAffiliateFromRoute } from '../utils/affiliate'

type RouteComponentLoader = () => Promise<unknown>

const homeViewLoader: RouteComponentLoader = () => import('../views/Home.vue')
const productsViewLoader: RouteComponentLoader = () => import('../views/Products.vue')
const productDetailViewLoader: RouteComponentLoader = () => import('../views/ProductDetail.vue')
const cartViewLoader: RouteComponentLoader = () => import('../views/Cart.vue')
const checkoutViewLoader: RouteComponentLoader = () => import('../views/Checkout.vue')
const paymentViewLoader: RouteComponentLoader = () => import('../views/Payment.vue')
const blogViewLoader: RouteComponentLoader = () => import('../views/Blog.vue')
const noticeViewLoader: RouteComponentLoader = () => import('../views/Notice.vue')
const loginViewLoader: RouteComponentLoader = () => import('../views/auth/Login.vue')
const pluginsViewLoader: RouteComponentLoader = () => import('../views/Plugins.vue')

const routeWarmupLoaders: RouteComponentLoader[] = [
    productsViewLoader,
    productDetailViewLoader,
    cartViewLoader,
    checkoutViewLoader,
    paymentViewLoader,
    blogViewLoader,
    noticeViewLoader,
    loginViewLoader,
    pluginsViewLoader,
]

let hasScheduledRouteWarmup = false

const shouldWarmupRoutes = () => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        return false
    }

    const connection = (navigator as Navigator & {
        connection?: {
            saveData?: boolean
            effectiveType?: string
        }
    }).connection

    if (connection?.saveData) {
        return false
    }

    return connection?.effectiveType !== 'slow-2g' && connection?.effectiveType !== '2g'
}

const scheduleIdleTask = (task: () => void) => {
    if (typeof window === 'undefined') {
        return
    }

    if ('requestIdleCallback' in window && typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(task, { timeout: 1500 })
        return
    }

    window.setTimeout(task, 600)
}

const runRouteWarmupQueue = (loaders: RouteComponentLoader[]) => {
    const nextLoader = loaders.shift()
    if (!nextLoader || typeof window === 'undefined') {
        return
    }

    void nextLoader()
        .catch(() => undefined)
        .finally(() => {
            window.setTimeout(() => {
                scheduleIdleTask(() => runRouteWarmupQueue(loaders))
            }, 400)
        })
}

export const warmupCommonRoutes = () => {
    if (hasScheduledRouteWarmup || !shouldWarmupRoutes()) {
        return
    }

    hasScheduledRouteWarmup = true

    const startWarmup = () => {
        window.setTimeout(() => {
            scheduleIdleTask(() => runRouteWarmupQueue([...routeWarmupLoaders]))
        }, 1200)
    }

    if (document.readyState === 'complete') {
        startWarmup()
        return
    }

    window.addEventListener('load', startWarmup, { once: true })
}

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    scrollBehavior(to, _from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        }
        if (to.hash) {
            return { el: to.hash, top: 80 }
        }
        return { top: 0 }
    },
    routes: [
        {
            path: '/',
            name: 'home',
            component: homeViewLoader,
        },
        {
            path: '/products',
            name: 'products',
            component: () => {
                const appStore = useAppStore()
                return appStore.config?.template_mode === 'list'
                    ? homeViewLoader()
                    : productsViewLoader()
            },
        },
        {
            path: '/categories/:slug',
            name: 'category-products',
            component: () => {
                const appStore = useAppStore()
                return appStore.config?.template_mode === 'list'
                    ? homeViewLoader()
                    : productsViewLoader()
            },
        },
        {
            path: '/products/:slug',
            name: 'product-detail',
            component: productDetailViewLoader,
        },
        {
            path: '/cart',
            name: 'cart',
            component: cartViewLoader,
        },
        {
            path: '/checkout',
            name: 'checkout',
            component: checkoutViewLoader,
        },
        {
            path: '/pay',
            name: 'payment',
            component: paymentViewLoader,
        },
        {
            path: '/me',
            name: 'personal-center',
            component: () => import('../views/PersonalCenter.vue'),
            props: { section: 'overview' },
            meta: { requiresUserAuth: true }
        },
        {
            path: '/me/profile',
            name: 'personal-center-profile',
            component: () => import('../views/PersonalCenter.vue'),
            props: { section: 'profile' },
            meta: { requiresUserAuth: true }
        },
        {
            path: '/me/security',
            name: 'personal-center-security',
            component: () => import('../views/PersonalCenter.vue'),
            props: { section: 'security' },
            meta: { requiresUserAuth: true }
        },
        {
            path: '/me/orders',
            name: 'personal-center-orders',
            component: () => import('../views/PersonalCenter.vue'),
            props: { section: 'orders' },
            meta: { requiresUserAuth: true }
        },
        {
            path: '/me/wallet',
            name: 'personal-center-wallet',
            component: () => import('../views/PersonalCenter.vue'),
            props: { section: 'wallet' },
            meta: { requiresUserAuth: true }
        },
        {
            path: '/me/gift-cards',
            name: 'personal-center-gift-cards',
            component: () => import('../views/PersonalCenter.vue'),
            props: { section: 'giftCard' },
            meta: { requiresUserAuth: true }
        },
        {
            path: '/me/api',
            name: 'personal-center-api',
            component: () => import('../views/PersonalCenter.vue'),
            props: { section: 'api' },
            meta: { requiresUserAuth: true }
        },
        {
            path: '/me/affiliate',
            name: 'personal-center-affiliate',
            component: () => import('../views/PersonalCenter.vue'),
            props: { section: 'affiliate' },
            meta: { requiresUserAuth: true }
        },
        {
            path: '/orders/:order_no',
            name: 'order-detail',
            component: () => import('../views/OrderDetail.vue'),
            meta: { requiresUserAuth: true }
        },
        {
            path: '/recharge-orders/:recharge_no',
            name: 'recharge-order-detail',
            component: () => import('../views/RechargeOrderDetail.vue'),
            meta: { requiresUserAuth: true }
        },
        {
            path: '/guest/orders',
            name: 'guest-orders',
            component: () => import('../views/GuestOrders.vue'),
        },
        {
            path: '/guest/orders/:order_no',
            name: 'guest-order-detail',
            component: () => import('../views/GuestOrderDetail.vue'),
        },
        {
            path: '/blog',
            name: 'blog',
            component: blogViewLoader,
        },
        {
            path: '/blog/:slug',
            name: 'blog-detail',
            component: () => import('../views/BlogDetail.vue'),
        },
        {
            path: '/notice',
            name: 'notice',
            component: noticeViewLoader,
        },
        {
            path: '/about',
            name: 'about',
            component: () => import('../views/About.vue'),
        },
        {
            path: '/plugins/:pluginId?',
            name: 'plugins',
            component: pluginsViewLoader,
        },
        {
            path: '/terms',
            name: 'terms',
            component: () => import('../views/Legal.vue'),
            props: { type: 'terms' }
        },
        {
            path: '/privacy',
            name: 'privacy',
            component: () => import('../views/Legal.vue'),
            props: { type: 'privacy' }
        },
        {
            path: '/auth/login',
            name: 'user-login',
            component: loginViewLoader,
            meta: { userGuest: true }
        },
        {
            path: '/auth/register',
            name: 'user-register',
            component: () => import('../views/auth/Register.vue'),
            meta: { userGuest: true }
        },
        {
            path: '/auth/forgot',
            name: 'user-forgot',
            component: () => import('../views/auth/Forgot.vue'),
            meta: { userGuest: true }
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'not-found',
            component: () => import('../views/NotFound.vue'),
        },
    ],
})

// Navigation Guard
router.beforeEach(async (to, _from, next) => {
    const userAuthStore = useUserAuthStore()
    const appStore = useAppStore()
    void captureAffiliateFromRoute(to)

    // Ensure config is loaded before checking template mode
    if (!appStore.config) {
        await appStore.loadConfig()
    }

    if (to.meta.requiresUserAuth) {
        if (!userAuthStore.isAuthenticated) {
            const redirect = encodeURIComponent(to.fullPath)
            next(`/auth/login?redirect=${redirect}`)
        } else {
            next()
        }
    }
    else if (to.meta.userGuest) {
        if (userAuthStore.isAuthenticated) {
            next('/me/orders')
        } else {
            next()
        }
    }
    else {
        next()
    }
})

// Update SEO on route change
router.afterEach(() => {
    const appStore = useAppStore()
    const telegramMiniAppStore = useTelegramMiniAppStore()
    appStore.applySEO()
    telegramMiniAppStore.syncRouteBackButton(router.currentRoute.value.path, () => {
        if (window.history.length > 1) {
            router.back()
            return
        }
        void router.push('/')
    })
})

export default router
