<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import * as ordersApi from '@/api/ordersApi'
import { useTestCatalog } from '@/composables/useTestCatalog'
import { apiErrorMessage } from '@/lib/apiError'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import AppButton from '@/components/common/AppButton.vue'
import { formatDate, orderCreatedAt, claimMinutesLeft } from '@/lib/format'

const router = useRouter()
const toast = useToast()
const { ensureLoaded, testNames } = useTestCatalog()

const myOrders = ref([])
const generalOrders = ref([])
const loading = ref(true)
const claimingId = ref(null)

async function load() {
  try {
    const [mine, general] = await Promise.all([
      ordersApi.listMyPendingReviews(),
      ordersApi.listPendingReviewOrders(),
      ensureLoaded(),
    ])
    myOrders.value = mine ?? []
    generalOrders.value = general ?? []
  } catch (error) {
    toast.error(apiErrorMessage(error, 'دریافت صف بررسی با خطا مواجه شد'))
  } finally {
    loading.value = false
  }
}
onMounted(load)

async function claim(order) {
  claimingId.value = order.id
  try {
    await ordersApi.claimOrder(order.id)
    toast.success('سفارش برای بررسی شما رزرو شد')
    router.push({ name: 'order-review-detail', params: { id: order.id } })
  } catch (error) {
    toast.error(apiErrorMessage(error, 'این سفارش هم‌زمان توسط پزشک دیگری برداشته شد'))
    await load()
  } finally {
    claimingId.value = null
  }
}
</script>

<template>
  <PageHeader title="در انتظار بررسی" subtitle="سفارش‌های جدید را برای بررسی رزرو کنید یا سفارش‌های رزروشده خود را تکمیل کنید" />

  <div v-if="loading" class="space-y-3">
    <div v-for="i in 3" :key="i" class="h-20 animate-pulse rounded-2xl bg-ink-50" />
  </div>

  <template v-else>
    <section v-if="myOrders.length" class="mb-8">
      <h2 class="mb-3 font-bold text-ink-900">صف من</h2>
      <div class="space-y-3">
        <router-link
          v-for="order in myOrders"
          :key="order.id"
          :to="{ name: 'order-review-detail', params: { id: order.id } }"
          class="block rounded-2xl border border-primary-200 bg-primary-50 p-4 transition-colors hover:border-primary-300"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="truncate font-medium text-ink-900">{{ testNames(order.labTestIds) }}</p>
              <p class="font-data mt-1 text-xs text-ink-400">{{ formatDate(orderCreatedAt(order)) }}</p>
              <p v-if="order.customerNote" class="mt-1.5 truncate text-sm text-ink-600">{{ order.customerNote }}</p>
              <p v-if="order.hasAttachment" class="mt-1 text-xs text-primary-600">فایل پیوست دارد</p>
              <p v-if="order.isForThirdParty" class="mt-1 text-xs text-ink-500">برای شخص دیگری</p>
            </div>
            <span
              v-if="claimMinutesLeft(order) !== null"
              class="font-data shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800"
            >
              {{ claimMinutesLeft(order) }} دقیقه دیگر
            </span>
          </div>
        </router-link>
      </div>
    </section>

    <section>
      <h2 class="mb-3 font-bold text-ink-900">صف عمومی</h2>
      <EmptyState v-if="!generalOrders.length" title="سفارشی در صف عمومی نیست" />
      <div v-else class="space-y-3">
        <div
          v-for="order in generalOrders"
          :key="order.id"
          class="flex items-center justify-between gap-3 rounded-2xl border border-ink-100 bg-surface p-4"
        >
          <div class="min-w-0">
            <p class="truncate font-medium text-ink-900">{{ testNames(order.labTestIds) }}</p>
            <p class="font-data mt-1 text-xs text-ink-400">{{ formatDate(orderCreatedAt(order)) }}</p>
            <p v-if="order.customerNote" class="mt-1.5 truncate text-sm text-ink-600">{{ order.customerNote }}</p>
            <p v-if="order.hasAttachment" class="mt-1 text-xs text-primary-600">فایل پیوست دارد</p>
            <p v-if="order.isForThirdParty" class="mt-1 text-xs text-ink-500">برای شخص دیگری</p>
          </div>
          <AppButton size="sm" :loading="claimingId === order.id" @click="claim(order)">درخواست بررسی</AppButton>
        </div>
      </div>
    </section>
  </template>
</template>
