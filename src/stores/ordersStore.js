import { ref } from 'vue'
import { defineStore } from 'pinia'
import * as ordersApi from '@/api/ordersApi'

const RECENT_ORDERS_KEY = 'prescription_recent_order_ids'

function readRecentIds() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_ORDERS_KEY)) ?? []
  } catch {
    return []
  }
}

/**
 * The API has no "list my orders" endpoint yet, only GET /api/orders/{id}. As a stand-in
 * until the backend adds one, order ids the customer creates in this browser are cached
 * here so the dashboard can list and re-track them.
 */
export const useOrdersStore = defineStore('orders', () => {
  const recentOrderIds = ref(readRecentIds())
  const cache = ref({})

  function rememberOrderId(id) {
    if (recentOrderIds.value.includes(id)) return
    recentOrderIds.value = [id, ...recentOrderIds.value].slice(0, 50)
    localStorage.setItem(RECENT_ORDERS_KEY, JSON.stringify(recentOrderIds.value))
  }

  /** The create response is just { orderId, status } — fetch the full order to populate the cache. */
  async function createOrder(payload, onUploadProgress) {
    const { orderId } = await ordersApi.createOrder(payload, onUploadProgress)
    return fetchOrder(orderId)
  }

  async function fetchOrder(id) {
    const order = await ordersApi.getOrder(id)
    cache.value[id] = order
    rememberOrderId(id)
    return order
  }

  async function fetchRecentOrders() {
    const results = await Promise.allSettled(recentOrderIds.value.map((id) => fetchOrder(id)))
    return results.filter((r) => r.status === 'fulfilled').map((r) => r.value)
  }

  return { recentOrderIds, cache, createOrder, fetchOrder, fetchRecentOrders }
})
