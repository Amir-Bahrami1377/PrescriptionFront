<script setup>
import { onMounted, ref } from 'vue'
import { useOrdersStore } from '@/stores/ordersStore'
import { useTestCatalog } from '@/composables/useTestCatalog'
import PageHeader from '@/components/common/PageHeader.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import AppButton from '@/components/common/AppButton.vue'
import { formatDate, formatRials, orderCreatedAt, orderTotal } from '@/lib/format'

const ordersStore = useOrdersStore()
const { ensureLoaded, testNames } = useTestCatalog()
const orders = ref([])
const loading = ref(true)

onMounted(async () => {
  const [recentOrders] = await Promise.all([ordersStore.fetchRecentOrders(), ensureLoaded()])
  orders.value = recentOrders
  loading.value = false
})
</script>

<template>
  <PageHeader title="سفارش‌های من" />

  <div v-if="loading" class="space-y-3">
    <div v-for="i in 3" :key="i" class="h-24 animate-pulse rounded-2xl bg-ink-50" />
  </div>

  <EmptyState v-else-if="!orders.length" title="سفارشی ثبت نشده" description="اولین آزمایش خود را همین حالا ثبت کنید.">
    <template #action>
      <router-link :to="{ name: 'new-order' }">
        <AppButton class="mt-2">ثبت آزمایش جدید</AppButton>
      </router-link>
    </template>
  </EmptyState>

  <div v-else class="space-y-3">
    <router-link
      v-for="order in orders"
      :key="order.id"
      :to="{ name: 'order-detail', params: { id: order.id } }"
      class="block rounded-2xl border border-ink-100 bg-surface p-4 transition-colors hover:border-primary-200"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="truncate font-medium text-ink-900">{{ testNames(order.labTestIds) }}</p>
          <p class="font-data mt-1 text-xs text-ink-400">{{ formatDate(orderCreatedAt(order)) }}</p>
        </div>
        <StatusBadge :status="order.status" />
      </div>
      <p class="font-data mt-3 text-sm font-medium text-ink-700">{{ formatRials(orderTotal(order)) }}</p>
    </router-link>
  </div>
</template>
