<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useToast } from 'vue-toastification'
import * as ordersApi from '@/api/ordersApi'
import { useTestCatalog } from '@/composables/useTestCatalog'
import { apiErrorMessage } from '@/lib/apiError'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'
import { formatDate, formatRials, orderCreatedAt, orderTotal } from '@/lib/format'

const toast = useToast()
const { ensureLoaded, testNames } = useTestCatalog()
const orders = ref([])
const loading = ref(true)
const completingId = ref(null)
const viewingResultId = ref(null)
const referenceInputs = reactive({})

onMounted(async () => {
  try {
    const [list] = await Promise.all([ordersApi.listInProgressOrders(), ensureLoaded()])
    orders.value = list ?? []
  } catch (error) {
    toast.error(apiErrorMessage(error, 'دریافت سفارش‌های در حال انجام با خطا مواجه شد'))
  } finally {
    loading.value = false
  }
})

async function complete(id) {
  completingId.value = id
  try {
    const reference = referenceInputs[id]?.trim()
    if (reference) await ordersApi.attachPrescriptionReference(id, reference)
    await ordersApi.completeOrder(id)
    orders.value = orders.value.filter((o) => o.id !== id)
    toast.success('سفارش تکمیل شد')
  } catch (error) {
    toast.error(apiErrorMessage(error, 'تکمیل سفارش با خطا مواجه شد'))
  } finally {
    completingId.value = null
  }
}

async function viewResult(id) {
  viewingResultId.value = id
  try {
    const { url } = await ordersApi.getResultFileUrl(id)
    window.open(url, '_blank', 'noopener')
  } catch (error) {
    toast.error(apiErrorMessage(error, 'دریافت فایل جواب آزمایش با خطا مواجه شد'))
  } finally {
    viewingResultId.value = null
  }
}
</script>

<template>
  <PageHeader title="در حال انجام" subtitle="سفارش‌های پرداخت‌شده که در حال انجام هستند" />

  <div v-if="loading" class="space-y-3">
    <div v-for="i in 3" :key="i" class="h-20 animate-pulse rounded-2xl bg-ink-50" />
  </div>

  <EmptyState v-else-if="!orders.length" title="سفارشی در حال انجام نیست" />

  <div v-else class="space-y-3">
    <div v-for="order in orders" :key="order.id" class="rounded-2xl border border-ink-100 bg-surface p-4">
      <p class="truncate font-medium text-ink-900">{{ testNames(order.labTestIds) }}</p>
      <p class="font-data mt-1 text-xs text-ink-400">{{ formatDate(orderCreatedAt(order)) }}</p>
      <p class="font-data mt-1 text-sm font-medium text-ink-700">{{ formatRials(orderTotal(order)) }}</p>
      <p v-if="order.hasResult === false" class="mt-2 text-xs text-amber-700">
        تا زمانی که مشتری جواب آزمایش را بارگذاری نکند، این سفارش قابل تکمیل نیست.
      </p>
      <button
        v-else-if="order.hasResult"
        type="button"
        class="mt-2 text-xs font-medium text-primary-600 hover:underline"
        :disabled="viewingResultId === order.id"
        @click="viewResult(order.id)"
      >
        مشاهده جواب آزمایش
      </button>

      <AppInput
        v-model="referenceInputs[order.id]"
        class="mt-3"
        label="شماره ارجاع / لینک نسخه (اختیاری)"
        placeholder="شماره ارجاع از سامانه نسخه‌نویسی"
      />
      <AppButton class="mt-3" size="sm" :loading="completingId === order.id" @click="complete(order.id)">تکمیل سفارش</AppButton>
    </div>
  </div>
</template>
