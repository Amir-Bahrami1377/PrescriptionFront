import { ref } from 'vue'
import { defineStore } from 'pinia'
import * as ordersApi from '@/api/ordersApi'

export const useOrdersStore = defineStore('orders', () => {
  const cache = ref({})
  /** { used, limit, remaining } for pending-approval orders — server-owned, refreshed by fetchMyOrders. */
  const capacity = ref(null)

  /** The create response is just { orderId, status } — fetch the full order to populate the cache. */
  async function createOrder(payload, onUploadProgress) {
    const { orderId } = await ordersApi.createOrder(payload, onUploadProgress)
    return fetchOrder(orderId)
  }

  async function fetchOrder(id) {
    const order = await ordersApi.getOrder(id)
    cache.value[id] = order
    return order
  }

  async function fetchMyOrders() {
    const { orders, pendingApprovalCapacity } = await ordersApi.listMyOrders()
    capacity.value = pendingApprovalCapacity ?? null
    for (const order of orders ?? []) cache.value[order.id] = order
    return orders ?? []
  }

  return { cache, capacity, createOrder, fetchOrder, fetchMyOrders }
})
