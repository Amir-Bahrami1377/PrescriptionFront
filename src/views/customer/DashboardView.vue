<script setup>
import { onMounted, ref } from 'vue'
import { useOrdersStore } from '@/stores/ordersStore'
import { useAuth } from '@/composables/useAuth'
import { useTestCatalog } from '@/composables/useTestCatalog'
import StatusBadge from '@/components/common/StatusBadge.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import AppButton from '@/components/common/AppButton.vue'
import { formatDate, orderCreatedAt } from '@/lib/format'

const ordersStore = useOrdersStore()
const { isSpecialPatient } = useAuth()
const { ensureLoaded, testNames } = useTestCatalog()
const orders = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const [myOrders] = await Promise.all([ordersStore.fetchMyOrders(), ensureLoaded()])
    orders.value = myOrders
  } catch {
    // the dashboard degrades to its empty state rather than blocking on a failed list
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section>
    <div class="rounded-3xl bg-primary-600 p-6 text-white">
      <p class="text-sm text-primary-100">به سامانه ثبت آزمایش خوش آمدید</p>
      <h1 class="mt-1 text-xl font-bold">آزمایش جدید ثبت می‌کنید؟</h1>
      <p class="mt-1 text-sm text-primary-100">آزمایش را انتخاب کنید، جواب یا یادداشت را بارگذاری کنید و برای بررسی پزشک ارسال کنید.</p>
      <router-link :to="{ name: 'new-order' }">
        <AppButton class="mt-4 !bg-white !text-primary-700 hover:!bg-primary-50">ثبت آزمایش جدید</AppButton>
      </router-link>
    </div>

    <router-link
      v-if="isSpecialPatient"
      :to="{ name: 'renewal-list' }"
      class="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-primary-100 bg-primary-50 p-4 transition-colors hover:bg-primary-100"
    >
      <div>
        <p class="text-sm font-bold text-primary-800">تمدید نسخه</p>
        <p class="mt-0.5 text-xs text-primary-700">به‌عنوان بیمار ویژه می‌توانید نسخه فعلی خود را تمدید کنید.</p>
      </div>
      <span class="shrink-0 text-sm font-medium text-primary-700">مشاهده ←</span>
    </router-link>

    <div class="mt-8">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="font-bold text-ink-900">سفارش‌های اخیر</h2>
        <router-link
          v-if="orders.length"
          :to="{ name: 'order-tracking' }"
          class="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          مشاهده همه
        </router-link>
      </div>

      <div v-if="loading" class="space-y-3">
        <div v-for="i in 2" :key="i" class="h-20 animate-pulse rounded-2xl bg-ink-50" />
      </div>

      <EmptyState
        v-else-if="!orders.length"
        title="هنوز سفارشی ثبت نکرده‌اید"
        description="با ثبت اولین آزمایش، روند بررسی و پیگیری آن را همین‌جا ببینید."
      />

      <div v-else class="space-y-3">
        <router-link
          v-for="order in orders.slice(0, 5)"
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
        </router-link>
      </div>
    </div>
  </section>
</template>
