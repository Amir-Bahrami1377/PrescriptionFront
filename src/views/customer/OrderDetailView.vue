<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { useOrdersStore } from '@/stores/ordersStore'
import * as ordersApi from '@/api/ordersApi'
import { normalizeOrderStatus } from '@/composables/useOrderStatus'
import { useTestCatalog } from '@/composables/useTestCatalog'
import { apiErrorMessage } from '@/lib/apiError'
import { basicInsuranceLabel, supplementaryInsuranceLabel } from '@/lib/insurance'
import PageHeader from '@/components/common/PageHeader.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import OrderTimeline from '@/components/common/OrderTimeline.vue'
import AppButton from '@/components/common/AppButton.vue'
import { formatDate, formatRials, orderCreatedAt, orderTotal } from '@/lib/format'

const props = defineProps({ id: { type: String, required: true } })
const toast = useToast()
const ordersStore = useOrdersStore()
const { ensureLoaded, testName } = useTestCatalog()

const order = ref(null)
const loading = ref(true)
const paying = ref(false)
const orderTestIds = computed(() => order.value?.labTestIds ?? [])

async function load() {
  loading.value = true
  try {
    const [fetchedOrder] = await Promise.all([ordersStore.fetchOrder(props.id), ensureLoaded()])
    order.value = fetchedOrder
  } catch {
    toast.error('دریافت اطلاعات سفارش با خطا مواجه شد')
  } finally {
    loading.value = false
  }
}

const statusInfo = computed(() => (order.value ? normalizeOrderStatus(order.value.status) : null))

// No websocket/push from the backend — poll quietly in the background so status changes
// (doctor approval, payment, completion) show up without the customer having to refresh.
const POLL_INTERVAL_MS = 8000
let pollTimer = null

function stopPolling() {
  clearInterval(pollTimer)
  pollTimer = null
}

function startPolling() {
  stopPolling()
  pollTimer = setInterval(async () => {
    if (document.hidden || ['completed', 'rejected'].includes(statusInfo.value?.key)) return
    try {
      order.value = await ordersStore.fetchOrder(props.id)
    } catch {
      // stay quiet on background refresh failures — the last known state is still shown
    }
  }, POLL_INTERVAL_MS)
}

onMounted(async () => {
  await load()
  startPolling()
})
onUnmounted(stopPolling)

async function payNow() {
  paying.value = true
  try {
    const result = await ordersApi.initiatePayment(props.id)
    const url = result?.paymentUrl ?? result?.url ?? result?.redirectUrl
    if (url) window.location.href = url
    else toast.error('لینک پرداخت دریافت نشد')
  } catch (error) {
    toast.error(apiErrorMessage(error, 'شروع فرآیند پرداخت با خطا مواجه شد'))
  } finally {
    paying.value = false
  }
}
</script>

<template>
  <PageHeader title="جزئیات سفارش" back />

  <div v-if="loading" class="space-y-4">
    <div class="h-24 animate-pulse rounded-2xl bg-ink-50" />
    <div class="h-40 animate-pulse rounded-2xl bg-ink-50" />
  </div>

  <div v-else-if="order" class="space-y-6">
    <div class="rounded-2xl border border-ink-100 bg-surface p-4">
      <OrderTimeline :status="order.status" :requests-consultation="order.requestsConsultation" />
    </div>

    <div class="rounded-2xl border border-ink-100 bg-surface p-4">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="font-bold text-ink-900">وضعیت سفارش</h2>
        <StatusBadge :status="order.status" />
      </div>
      <p v-if="statusInfo?.key === 'rejected' && order.rejectionReason" class="rounded-xl bg-brick-50 p-3 text-sm text-brick-700">
        دلیل رد سفارش: {{ order.rejectionReason }}
      </p>
      <p class="font-data text-xs text-ink-400">تاریخ ثبت: {{ formatDate(orderCreatedAt(order)) }}</p>
    </div>

    <div class="rounded-2xl border border-ink-100 bg-surface p-4">
      <h2 class="mb-2 font-bold text-ink-900">آزمایش‌های سفارش</h2>
      <ul class="divide-y divide-ink-100">
        <li v-for="testId in orderTestIds" :key="testId" class="py-2 text-sm text-ink-700">{{ testName(testId) }}</li>
      </ul>
      <div class="mt-2 flex items-center justify-between border-t border-ink-100 pt-2 text-sm font-semibold">
        <span class="text-ink-900">هزینه ویزیت</span>
        <span class="font-data text-ink-900">{{ formatRials(orderTotal(order)) }}</span>
      </div>
      <p v-if="order.requestsConsultation" class="mt-1 text-xs text-ink-500">شامل هزینه مشاوره پزشک</p>
      <p v-if="order.hasResult" class="mt-3 rounded-xl bg-primary-50 p-3 text-sm text-primary-700">جواب آزمایش بارگذاری شده است.</p>
    </div>

    <div v-if="order.consultationOpinion" class="rounded-2xl border border-primary-100 bg-primary-50 p-4">
      <h2 class="mb-2 font-bold text-primary-800">نظر تخصصی پزشک</h2>
      <p class="text-sm text-primary-700">{{ order.consultationOpinion }}</p>
    </div>

    <div
      v-if="order.basicInsurance !== 'None' || order.supplementaryInsurance !== 'None'"
      class="rounded-2xl border border-ink-100 bg-surface p-4"
    >
      <h2 class="mb-2 font-bold text-ink-900">اطلاعات بیمه</h2>
      <div class="flex items-center justify-between py-1 text-sm">
        <span class="text-ink-500">بیمه پایه</span>
        <span class="text-ink-900">{{ basicInsuranceLabel(order.basicInsurance) }}</span>
      </div>
      <div class="flex items-center justify-between py-1 text-sm">
        <span class="text-ink-500">بیمه تکمیلی</span>
        <span class="text-ink-900">{{ supplementaryInsuranceLabel(order.supplementaryInsurance) }}</span>
      </div>
    </div>

    <div v-if="order.isForThirdParty" class="rounded-2xl border border-primary-100 bg-primary-50 p-4">
      <p class="text-sm font-medium text-primary-800">این سفارش برای شخص دیگری ثبت شده است</p>
      <p class="font-data mt-1 text-sm text-primary-700">کد ملی: {{ order.thirdPartyNationalCode }}</p>
      <p class="font-data text-sm text-primary-700">موبایل: {{ order.thirdPartyPhoneNumber }}</p>
    </div>

    <div v-if="order.prescriptionReferenceNumber" class="rounded-2xl border border-primary-100 bg-primary-50 p-4">
      <p class="text-sm text-primary-800">شماره ارجاع نسخه: <span class="font-data font-semibold">{{ order.prescriptionReferenceNumber }}</span></p>
    </div>

    <p v-if="statusInfo?.key === 'awaitingConsultationOpinion'" class="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
      نتیجه آزمایش شما دریافت شد و در انتظار نظر تخصصی پزشک است.
    </p>

    <div class="space-y-3">
      <AppButton v-if="statusInfo?.key === 'pendingPayment'" block :loading="paying" @click="payNow">
        پرداخت آنلاین ({{ formatRials(orderTotal(order)) }})
      </AppButton>

      <router-link v-if="statusInfo?.key === 'awaitingTestResultUpload'" :to="{ name: 'upload-consultation-result', params: { id: props.id } }">
        <AppButton block>بارگذاری نتیجه برای مشاوره</AppButton>
      </router-link>

      <router-link
        v-if="!order.requestsConsultation && ['inProgress', 'completed'].includes(statusInfo?.key)"
        :to="{ name: 'upload-result', params: { id: props.id } }"
      >
        <AppButton variant="secondary" block>{{ order.hasResult ? 'بارگذاری مجدد جواب آزمایش' : 'بارگذاری جواب آزمایش' }}</AppButton>
      </router-link>
    </div>
  </div>
</template>
