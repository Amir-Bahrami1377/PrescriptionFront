<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useOrdersStore } from '@/stores/ordersStore'
import { normalizeOrderStatus } from '@/composables/useOrderStatus'
import PageHeader from '@/components/common/PageHeader.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import AppButton from '@/components/common/AppButton.vue'

/**
 * The Zarinpal callback (GET /api/orders/{id}/payment/callback) is hit by the browser
 * directly on the backend, so this page only exists for wherever the backend redirects
 * the browser back to afterwards. Since that redirect contract isn't documented, this
 * reads the order id from a few likely query-param names and re-fetches the order from
 * the API as the source of truth rather than trusting the query string.
 */
const route = useRoute()
const ordersStore = useOrdersStore()

const orderId = computed(() => route.query.orderId ?? route.query.id ?? route.query.Id)
const order = ref(null)
const loading = ref(true)
const loadError = ref(false)

onMounted(async () => {
  if (!orderId.value) {
    loading.value = false
    loadError.value = true
    return
  }
  try {
    order.value = await ordersStore.fetchOrder(orderId.value)
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
})

const statusInfo = computed(() => (order.value ? normalizeOrderStatus(order.value.status) : null))
</script>

<template>
  <PageHeader title="نتیجه پرداخت" />

  <div v-if="loading" class="h-32 animate-pulse rounded-2xl bg-ink-50" />

  <div v-else-if="loadError" class="rounded-2xl border border-brick-100 bg-brick-50 p-4 text-sm text-brick-700">
    وضعیت سفارش قابل دریافت نبود. برای مشاهده جزئیات به فهرست سفارش‌ها مراجعه کنید.
  </div>

  <div v-else class="space-y-4 text-center">
    <div class="flex justify-center">
      <StatusBadge :status="order.status" />
    </div>
    <p class="text-ink-600">
      {{
        statusInfo?.key === 'inProgress' || statusInfo?.key === 'completed'
          ? 'پرداخت با موفقیت انجام شد.'
          : 'وضعیت پرداخت به‌روزرسانی شد.'
      }}
    </p>
  </div>

  <router-link :to="orderId ? { name: 'order-detail', params: { id: orderId } } : { name: 'order-tracking' }">
    <AppButton class="mt-6" block>مشاهده جزئیات سفارش</AppButton>
  </router-link>
</template>
