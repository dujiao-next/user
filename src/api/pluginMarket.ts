import { api } from './client'

export interface PluginMarketPublisher {
    id: number
    publisher_code: string
    name: string
    contact_email: string
    status: string
    is_official: boolean
    meta?: Record<string, any>
    created_at: string
    updated_at: string
}

export interface PluginMarketCatalogPlugin {
    id: number
    plugin_id: string
    slug: string
    publisher_id: number
    name: string
    summary: string
    description: string
    plugin_type: string
    billing_mode: string
    license_mode: string
    status: string
    is_official: boolean
    is_public: boolean
    icon_url: string
    cover_url: string
    homepage_url: string
    source_url: string
    tags: string[]
    meta?: Record<string, any>
    created_at: string
    updated_at: string
}

export interface PluginMarketVersion {
    id: number
    plugin_id: string
    version: string
    release_channel: string
    package_storage_key: string
    package_download_url: string
    checksum_sha256: string
    package_size_bytes: number
    host_api_version: string
    build_target: string
    go_version: string
    permissions: string[]
    config_schema?: Record<string, any>
    changelog_md: string
    review_status: string
    published_at: string
    meta?: Record<string, any>
    created_at: string
    updated_at: string
}

export interface PluginMarketPlan {
    id: number
    plugin_id: string
    plan_code: string
    plan_name: string
    billing_mode: string
    license_mode: string
    price_amount: string
    price_currency: string
    duration_days: number | null
    max_sites: number
    max_activations: number
    feature_flags?: Record<string, any>
    status: string
    sort_order: number
    meta?: Record<string, any>
    created_at: string
    updated_at: string
}

export interface PluginMarketPluginSummary {
    plugin: PluginMarketCatalogPlugin
    publisher?: PluginMarketPublisher
    latest_version?: PluginMarketVersion
}

export interface PluginMarketPluginDetail {
    plugin: PluginMarketCatalogPlugin
    publisher?: PluginMarketPublisher
    versions: PluginMarketVersion[]
    plans: PluginMarketPlan[]
    latest_version?: PluginMarketVersion
}

export const pluginMarketAPI = {
    listOfficialPlugins(params?: { page?: number; page_size?: number; q?: string }) {
        return api.get('/public/plugin-market/plugins', {
            params: {
                scope: 'official',
                page: params?.page ?? 1,
                page_size: params?.page_size ?? 24,
                q: params?.q ?? '',
            },
        })
    },
    getPluginDetail(pluginID: string) {
        return api.get(`/public/plugin-market/plugins/${pluginID}`)
    },
}
