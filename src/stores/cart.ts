import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface CartItem {
    productId: number
    slug: string
    title: any
    priceAmount: string
    image?: string
    quantity: number
    purchaseType?: string
    fulfillmentType?: string
    manualFormSchema?: any
    auto_stock_available?: number
    manual_stock_available?: number
}

const loadCartItems = (): CartItem[] => {
    const raw = localStorage.getItem('cart_items')
    if (!raw) return []
    try {
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) return []
        return parsed as CartItem[]
    } catch (error) {
        console.error('Failed to parse cart items', error)
        return []
    }
}

export const useCartStore = defineStore('cart', () => {
    const items = ref<CartItem[]>(loadCartItems())

    const totalItems = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))

    const persist = () => {
        localStorage.setItem('cart_items', JSON.stringify(items.value))
    }

    const addItem = (item: CartItem, quantity = 1) => {
        let maxLimit = Number.MAX_SAFE_INTEGER
        if (item.fulfillmentType === 'auto' && item.auto_stock_available !== undefined) {
            maxLimit = item.auto_stock_available
        } else if (item.fulfillmentType === 'manual' && item.manual_stock_available !== undefined) {
            if (item.manual_stock_available > 0) {
                maxLimit = item.manual_stock_available
            }
        }

        const existing = items.value.find((entry) => entry.productId === item.productId)
        if (existing) {
            existing.quantity = Math.max(1, Math.min(existing.quantity + quantity, maxLimit))
            existing.slug = item.slug
            existing.title = item.title
            existing.priceAmount = item.priceAmount
            existing.image = item.image
            existing.purchaseType = item.purchaseType
            existing.fulfillmentType = item.fulfillmentType
            existing.manualFormSchema = item.manualFormSchema
            existing.auto_stock_available = item.auto_stock_available
            existing.manual_stock_available = item.manual_stock_available
        } else {
            const qty = Math.max(1, Math.min(quantity, maxLimit))
            items.value.push({
                ...item,
                quantity: qty,
            })
        }
        persist()
    }

    const updateQuantity = (productId: number, quantity: number) => {
        const target = items.value.find((entry) => entry.productId === productId)
        if (!target) return

        let maxLimit = Number.MAX_SAFE_INTEGER
        if (target.fulfillmentType === 'auto' && target.auto_stock_available !== undefined) {
            maxLimit = target.auto_stock_available
        } else if (target.fulfillmentType === 'manual' && target.manual_stock_available !== undefined) {
            if (target.manual_stock_available > 0) {
                maxLimit = target.manual_stock_available
            }
        }

        const qty = Math.max(1, Math.min(quantity, maxLimit))
        target.quantity = qty
        persist()
    }

    const removeItem = (productId: number) => {
        items.value = items.value.filter((entry) => entry.productId !== productId)
        persist()
    }

    const clear = () => {
        items.value = []
        persist()
    }

    return {
        items,
        totalItems,
        addItem,
        updateQuantity,
        removeItem,
        clear,
    }
})
