<script setup>
import { onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import * as ordersApi from '@/api/ordersApi'
import { useTestCatalog } from '@/composables/useTestCatalog'
import { apiErrorMessage } from '@/lib/apiError'
import PageHeader from '@/components/common/PageHeader.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { formatDate, orderCreatedAt } from '@/lib/format'

const toast = useToast()
const { ensureLoaded, testNames } = useTestCatalog()
const orders = ref([])
const loading = ref(true)
const selected = ref(null)
const opinion = ref('')
const submitting = ref(false)

async function load() {
  loading.value = true
  try {
    const [list] = await Promise.all([ordersApi.listAwaitingConsultationOpinion(), ensureLoaded()])
    orders.value = list ?? []
  } catch (error) {
    toast.error(apiErrorMessage(error, 'دریافت صف مشاوره با خطا مواجه شد'))
  } finally {
    loading.value = false
  }
}
onMounted(load)

function open(order) {
  selected.value = order
  opinion.value = ''
}

async function submit() {
  if (!opinion.value.trim()) {
    toast.warning('نظر تخصصی را بنویسید')
    return
  }
  submitting.value = true
  try {
    await ordersApi.submitConsultationOpinion(selected.value.id, opinion.value.trim())
    toast.success('نظر شما ثبت و سفارش تکمیل شد')
    selected.value = null
    await load()
  } catch (error) {
    toast.error(apiErrorMessage(error, 'ثبت نظر با خطا مواجه شد'))
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div v-if="!selected">
    <PageHeader title="صف نظر مشاوره" subtitle="نتیجه آزمایش این سفارش‌ها بارگذاری شده و منتظر نظر تخصصی شماست" />

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="h-20 animate-pulse rounded-2xl bg-ink-50" />
    </div>

    <EmptyState v-else-if="!orders.length" title="سفارشی در انتظار نظر مشاوره نیست" />

    <div v-else class="space-y-3">
      <button
        v-for="order in orders"
        :key="order.id"
        type="button"
        class="block w-full rounded-2xl border border-ink-100 bg-surface p-4 text-start transition-colors hover:border-primary-200"
        @click="open(order)"
      >
        <p class="truncate font-medium text-ink-900">{{ testNames(order.labTestIds) }}</p>
        <p class="font-data mt-1 text-xs text-ink-400">{{ formatDate(orderCreatedAt(order)) }}</p>
        <p v-if="order.customerNote" class="mt-1.5 truncate text-sm text-ink-600">{{ order.customerNote }}</p>
      </button>
    </div>
  </div>

  <div v-else>
    <button type="button" class="mb-4 text-sm font-medium text-primary-600" @click="selected = null">← بازگشت به صف مشاوره</button>
    <PageHeader :title="testNames(selected.labTestIds)" subtitle="بررسی نتیجه آزمایش و ثبت نظر تخصصی" />

    <div class="space-y-4">
      <p class="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
        بک‌اند فعلاً اندپوینتی برای مشاهده فایل نتیجه بارگذاری‌شده در اختیار نمی‌گذارد؛ فقط یادداشت مشتری قابل مشاهده است.
      </p>
      <p v-if="selected.customerNote" class="rounded-xl bg-ink-50 p-3 text-sm text-ink-600">{{ selected.customerNote }}</p>
      <p class="font-data text-xs text-ink-400">تاریخ ثبت سفارش: {{ formatDate(orderCreatedAt(selected)) }}</p>

      <AppInput v-model="opinion" as="textarea" :rows="5" label="نظر تخصصی شما" placeholder="نظر خود را برای مشتری بنویسید…" />
      <AppButton block :loading="submitting" @click="submit">ثبت نظر و تکمیل سفارش</AppButton>
    </div>
  </div>
</template>
