import axios from 'axios'
import i18n from '../i18n'

const t = (key: string, params?: Record<string, any>) =>
    (params ? i18n.global.t(key, params) : i18n.global.t(key)) as string

// 统一响应接口
export interface ApiResponse<T = any> {
    status_code: number
    msg: string
    data: T
    pagination?: {
        page: number
        page_size: number
        total: number
        total_page: number
    }
}

// API 基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
// const API_BASE_URL = 'http://localhost:8080' // Original backup
const API_PREFIX = '/api/v1'

const api = axios.create({
    baseURL: `${API_BASE_URL}${API_PREFIX}`,
    timeout: 10000,
})

const userApi = axios.create({
    baseURL: `${API_BASE_URL}${API_PREFIX}`,
    timeout: 10000,
})

// 请求拦截器
api.interceptors.request.use(
    (config) => config,
    (error) => {
        return Promise.reject(error)
    }
)

// 响应拦截器
api.interceptors.response.use(
    (response) => {
        const data: ApiResponse = response.data

        // 检查响应数据是否存在
        if (!data) {
            console.error('API Error: No response data')
            return Promise.reject(new Error(t('common.api.responseMissing')))
        }

        // 检查是否是新的统一响应格式
        if (typeof data.status_code !== 'undefined') {
            // 检查业务状态码
            if (data.status_code !== 0) {
                // 业务错误，显示错误消息
                const fallbackMessage = t('common.api.requestFailed')
                const errorMessage = data.msg || fallbackMessage
                const silentBusinessError = Boolean((response.config as any)?.silentBusinessError)
                if (!silentBusinessError) {
                    console.error('API Error:', errorMessage)
                }
                const businessError = new Error(errorMessage) as Error & { silentBusinessError?: boolean }
                businessError.silentBusinessError = silentBusinessError
                return Promise.reject(businessError)
            }
        }

        // 返回完整的 AxiosResponse 对象
        return response
    },
    (error) => {
        // HTTP错误处理
        if (error.response) {
            const status = error.response.status
            let message = t('common.api.requestFailed')

            switch (status) {
                case 401:
                    message = t('common.api.unauthorized')
                    break
                case 403:
                    message = t('common.api.forbidden')
                    break
                case 404:
                    message = t('common.api.notFound')
                    break
                case 500:
                    message = t('common.api.serverError')
                    break
                case 502:
                    message = t('common.api.badGateway')
                    break
                case 503:
                    message = t('common.api.serviceUnavailable')
                    break
                default:
                    message = t('common.api.requestFailedStatus', { status })
            }

            console.error('HTTP Error:', message)
            // ElMessage.error(message)

            return Promise.reject(new Error(message))
        } else if (error.request) {
            const message = t('common.api.networkError')
            console.error('Network Error:', message)
            // ElMessage.error('网络连接失败，请检查您的网络')
            return Promise.reject(new Error(message))
        } else {
            if (!(error as any)?.silentBusinessError) {
                console.error('Request Error:', error.message)
            }
            return Promise.reject(error)
        }
    }
)

userApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('user_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

userApi.interceptors.response.use(
    (response) => {
        const data: ApiResponse = response.data

        if (!data) {
            console.error('API Error: No response data')
            return Promise.reject(new Error(t('common.api.responseMissing')))
        }

        if (typeof data.status_code !== 'undefined') {
            if (data.status_code !== 0) {
                const fallbackMessage = t('common.api.requestFailed')
                const errorMessage = data.msg || fallbackMessage
                const silentBusinessError = Boolean((response.config as any)?.silentBusinessError)
                if (!silentBusinessError) {
                    console.error('API Error:', errorMessage)
                }
                const businessError = new Error(errorMessage) as Error & { silentBusinessError?: boolean }
                businessError.silentBusinessError = silentBusinessError
                return Promise.reject(businessError)
            }
        }

        return response
    },
    (error) => {
        if (error.response) {
            const status = error.response.status
            let message = t('common.api.requestFailed')

            switch (status) {
                case 401:
                    message = t('common.api.unauthorized')
                    localStorage.removeItem('user_token')
                    localStorage.removeItem('user_profile')
                    window.location.href = '/auth/login'
                    break
                case 403:
                    message = t('common.api.forbidden')
                    break
                case 404:
                    message = t('common.api.notFound')
                    break
                case 500:
                    message = t('common.api.serverError')
                    break
                case 502:
                    message = t('common.api.badGateway')
                    break
                case 503:
                    message = t('common.api.serviceUnavailable')
                    break
                default:
                    message = t('common.api.requestFailedStatus', { status })
            }

            console.error('HTTP Error:', message)
            return Promise.reject(new Error(message))
        } else if (error.request) {
            const message = t('common.api.networkError')
            console.error('Network Error:', message)
            return Promise.reject(new Error(message))
        } else {
            if (!(error as any)?.silentBusinessError) {
                console.error('Request Error:', error.message)
            }
            return Promise.reject(error)
        }
    }
)

export interface UserProfileData {
    id: number
    email: string
    nickname: string
    email_verified_at?: string | null
    locale: string
}

export interface UpdateUserProfilePayload {
    nickname?: string
    locale?: string
}

export interface UserLoginLogItem {
    id: number
    user_id: number
    email: string
    status: string
    fail_reason?: string
    client_ip?: string
    user_agent?: string
    login_source?: string
    created_at?: string
}

export interface SendChangeEmailCodePayload {
    kind: 'old' | 'new'
    new_email?: string
}

export interface ChangeEmailPayload {
    new_email: string
    old_code: string
    new_code: string
}

export interface ChangeUserPasswordPayload {
    old_password: string
    new_password: string
}

export interface WalletAccountData {
    id: number
    user_id: number
    balance: string
    created_at: string
    updated_at: string
}

export interface WalletTransactionData {
    id: number
    user_id: number
    order_id?: number | null
    type: string
    direction: string
    amount: string
    balance_before: string
    balance_after: string
    currency: string
    reference: string
    remark: string
    created_at: string
    updated_at: string
}

export interface WalletRechargePayload {
    amount: string
    channel_id: number
    currency?: string
    remark?: string
}

export interface WalletRechargeOrderData {
    id: number
    recharge_no: string
    user_id: number
    payment_id: number
    channel_id: number
    provider_type: string
    channel_type: string
    interaction_mode: string
    amount: string
    payable_amount: string
    fee_rate: string
    fee_amount: string
    currency: string
    status: string
    remark: string
    paid_at?: string
    created_at: string
    updated_at: string
}

export interface WalletRechargePaymentData {
    id: number
    order_id: number
    channel_id: number
    provider_type: string
    channel_type: string
    interaction_mode: string
    amount: string
    fee_rate: string
    fee_amount: string
    currency: string
    status: string
    pay_url?: string
    qr_code?: string
    expires_at?: string
    created_at: string
    updated_at: string
}

export interface WalletRechargeResult {
    recharge: WalletRechargeOrderData
    payment: WalletRechargePaymentData
    account?: WalletAccountData
    payment_id?: number
    provider_type?: string
    channel_type?: string
    interaction_mode?: string
    pay_url?: string
    qr_code?: string
    expires_at?: string
    recharge_no?: string
    recharge_status?: string
}

export interface CreatePaymentPayload {
    order_id: number
    channel_id?: number
    use_balance?: boolean
}

export interface PaymentCreateResult {
    order_paid?: boolean
    wallet_paid_amount?: string
    online_pay_amount?: string
    payment_id?: number
    order_id?: number
    channel_id?: number
    provider_type?: string
    channel_type?: string
    interaction_mode?: string
    pay_url?: string
    qr_code?: string
    expires_at?: string
}

export interface CaptchaPayload {
    captcha_id?: string
    captcha_code?: string
    turnstile_token?: string
}

export default api

// API 方法
export const productAPI = {
    list: (params?: any) => api.get<ApiResponse>('/public/products', { params }),
    detail: (slug: string) => api.get<ApiResponse>(`/public/products/${slug}`),
}

export const postAPI = {
    list: (params?: any) => api.get<ApiResponse>('/public/posts', { params }),
    detail: (slug: string) => api.get<ApiResponse>(`/public/posts/${slug}`),
}

export const bannerAPI = {
    list: (params?: any) => api.get<ApiResponse>('/public/banners', { params }),
}

export const categoryAPI = {
    list: (params?: any) => api.get<ApiResponse>('/public/categories', { params }),
}

export const configAPI = {
    get: () => api.get<ApiResponse>('/public/config'),
}

export const captchaAPI = {
    image: () => api.get<ApiResponse>('/public/captcha/image'),
}

export const userProfileAPI = {
    current: () => userApi.get<ApiResponse<UserProfileData>>('/me'),
    loginLogs: (params?: any) => userApi.get<ApiResponse<UserLoginLogItem[]>>('/me/login-logs', { params }),
    updateProfile: (data: UpdateUserProfilePayload) => userApi.put<ApiResponse<UserProfileData>>('/me/profile', data),
    sendChangeEmailCode: (data: SendChangeEmailCodePayload) => userApi.post<ApiResponse<{ sent: boolean }>>('/me/email/send-verify-code', data),
    changeEmail: (data: ChangeEmailPayload) => userApi.post<ApiResponse<UserProfileData>>('/me/email/change', data),
    changePassword: (data: ChangeUserPasswordPayload) => userApi.put<ApiResponse<{ updated: boolean }>>('/me/password', data),
}

export const userAuthAPI = {
    sendVerifyCode: (data: any) => userApi.post<ApiResponse>('/auth/send-verify-code', data),
    register: (data: any) => userApi.post<ApiResponse>('/auth/register', data),
    login: (data: any) => userApi.post<ApiResponse>('/auth/login', data),
    forgotPassword: (data: any) => userApi.post<ApiResponse>('/auth/forgot-password', data),
}

export const userOrderAPI = {
    preview: (data: any) => userApi.post<ApiResponse>('/orders/preview', data),
    create: (data: any) => userApi.post<ApiResponse>('/orders', data),
    list: (params?: any) => userApi.get<ApiResponse>('/orders', { params }),
    detail: (id: number) => userApi.get<ApiResponse>(`/orders/${id}`),
    detailByOrderNo: (orderNo: string, options?: any) => userApi.get<ApiResponse>(`/orders/by-order-no/${encodeURIComponent(orderNo)}`, options as any),
    cancel: (id: number) => userApi.post<ApiResponse>(`/orders/${id}/cancel`),
}

export const guestOrderAPI = {
    preview: (data: any) => userApi.post<ApiResponse>('/guest/orders/preview', data),
    create: (data: any) => userApi.post<ApiResponse>('/guest/orders', data),
    list: (params: any) => userApi.get<ApiResponse>('/guest/orders', { params }),
    detail: (id: number, params: any) => userApi.get<ApiResponse>(`/guest/orders/${id}`, { params }),
    detailByOrderNo: (orderNo: string, params: any, options?: any) => userApi.get<ApiResponse>(`/guest/orders/by-order-no/${encodeURIComponent(orderNo)}`, { params, ...(options || {}) } as any),
    createPayment: (data: any) => userApi.post<ApiResponse>('/guest/payments', data),
    capturePayment: (id: number, data: any) => userApi.post<ApiResponse>(`/guest/payments/${id}/capture`, data),
    latestPayment: (params: any) => userApi.get<ApiResponse>('/guest/payments/latest', { params, silentBusinessError: true } as any),
}

export const paymentAPI = {
    create: (data: CreatePaymentPayload) => userApi.post<ApiResponse<PaymentCreateResult>>('/payments', data),
    capture: (id: number) => userApi.post<ApiResponse>(`/payments/${id}/capture`),
    latest: (params: any) => userApi.get<ApiResponse<PaymentCreateResult>>('/payments/latest', { params, silentBusinessError: true } as any),
}

export const walletAPI = {
    account: () => userApi.get<ApiResponse<WalletAccountData>>('/wallet'),
    transactions: (params?: any) => userApi.get<ApiResponse<WalletTransactionData[]>>('/wallet/transactions', { params }),
    recharge: (data: WalletRechargePayload) => userApi.post<ApiResponse<WalletRechargeResult>>('/wallet/recharge', data),
    rechargeDetail: (rechargeNo: string) =>
        userApi.get<ApiResponse<WalletRechargeResult>>(`/wallet/recharges/${encodeURIComponent(rechargeNo)}`),
    captureRechargePayment: (paymentID: number) =>
        userApi.post<ApiResponse<WalletRechargeResult>>(`/wallet/recharge/payments/${paymentID}/capture`),
}
