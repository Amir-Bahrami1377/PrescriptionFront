<script setup>
import { onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import * as ordersApi from '@/api/ordersApi'
import { useTestCatalog } from '@/composables/useTestCatalog'
import { apiErrorMessage } from '@/lib/apiError'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { formatDate, formatRials, orderCreatedAt, orderTotal } from '@/lib/format'

const toast = useToast()
const { ensureLoaded, testNames } = useTestCatalog()
const orders = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const [list] = await Promise.all([ordersApi.listPaymentQueue(), ensureLoaded()])
    orders.value = list ?? []
  } catch (error) {
    toast.error(apiErrorMessage(error, 'دریافت لیست پرداخت با خطا مواجه شد'))
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <PageHeader title="لیست پرداخت" subtitle="سفارش‌های تاییدشده که در انتظار پرداخت مشتری هستند" />

  <div v-if="loading" class="space-y-3">
    <div v-for="i in 3" :key="i" class="h-20 animate-pulse rounded-2xl bg-ink-50" />
  </div>

  <EmptyState v-else-if="!orders.length" title="سفارشی در انتظار پرداخت نیست" />

  <div v-else class="space-y-3">
    <div v-for="order in orders" :key="order.id" class="rounded-2xl border border-ink-100 bg-surface p-4">
      <p class="truncate font-medium text-ink-900">{{ testNames(order.labTestIds) }}</p>
      <p class="font-data mt-1 text-xs text-ink-400">{{ formatDate(orderCreatedAt(order)) }}</p>
      <p class="font-data mt-3 text-sm font-medium text-ink-700">{{ formatRials(orderTotal(order)) }}</p>
    </div>
  </div>
</template>
