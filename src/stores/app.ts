import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { configAPI } from '../api'
import { applyCustomScripts } from '../utils/customScripts'
import { useHead } from '@unhead/vue'

export const useAppStore = defineStore('app', () => {
    const locale = ref(localStorage.getItem('locale') || 'zh-CN')
    const config = ref<any>(null)
    const loading = ref(false)

    // 设置语言
    const setLocale = (newLocale: string) => {
        locale.value = newLocale
        localStorage.setItem('locale', newLocale)
    }

    // 全局响应式 SEO 配置
    useHead({
        title: () => {
            const seo = config.value?.seo
            if (!seo) return undefined
            const lang = locale.value
            return seo.title && seo.title[lang] ? seo.title[lang] : undefined
        },
        meta: () => {
            const seo = config.value?.seo
            if (!seo) return []
            const lang = locale.value
            const tags = []

            // 基础 SEO 标签
            if (seo.keywords && seo.keywords[lang]) {
                tags.push({ name: 'keywords', content: seo.keywords[lang] })
            }
            if (seo.description && seo.description[lang]) {
                tags.push({ name: 'description', content: seo.description[lang] })
            }

            // Open Graph 标签
            tags.push({ property: 'og:type', content: 'website' })
            if (seo.title && seo.title[lang]) {
                tags.push({ property: 'og:title', content: seo.title[lang] })
            }
            if (seo.description && seo.description[lang]) {
                tags.push({ property: 'og:description', content: seo.description[lang] })
            }
            tags.push({ property: 'og:url', content: window.location.href })
            // 注意：全局设置通常可以设置一个通用的 default_og_image

            // Twitter Card 标签
            tags.push({ name: 'twitter:card', content: 'summary_large_image' })
            if (seo.title && seo.title[lang]) {
                tags.push({ name: 'twitter:title', content: seo.title[lang] })
            }
            if (seo.description && seo.description[lang]) {
                tags.push({ name: 'twitter:description', content: seo.description[lang] })
            }

            return tags
        }
    })

    // 更新SEO信息 (向后兼容的方法)
    const applySEO = () => {
        // 由于 useHead 已经是响应式的，这里不再需要显式调用
        // 留空函数以防其他组件出错
    }

    const userRegistration = computed(() => config.value?.user_registration?.enabled !== false)
    const requireEmailVerify = computed(() => config.value?.user_registration?.require_email_verify !== false)

    // 加载全局配置
    const loadConfig = async (force = false) => {
        if (config.value && !force) {
            applySEO()
            applyCustomScripts(config.value?.scripts)
            return
        }
        loading.value = true
        try {
            const response = await configAPI.get()
            config.value = response.data.data
            applySEO()
            applyCustomScripts(config.value?.scripts)
        } catch (error) {
            console.error('Failed to load config:', error)
        } finally {
            loading.value = false
        }
    }

    return {
        locale,
        config,
        loading,
        setLocale,
        loadConfig,
        applySEO,
        userRegistration,
        requireEmailVerify,
    }
})
