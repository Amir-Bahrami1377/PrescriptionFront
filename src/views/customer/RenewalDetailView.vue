<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import * as renewalsApi from '@/api/renewalsApi'
import { normalizeOrderStatus } from '@/composables/useOrderStatus'
import { apiErrorMessage } from '@/lib/apiError'
import { basicInsuranceLabel } from '@/lib/insurance'
import PageHeader from '@/components/common/PageHeader.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import AppButton from '@/components/common/AppButton.vue'
import { formatDate, formatRials, orderCreatedAt, orderTotal } from '@/lib/format'

const props = defineProps({ id: { type: String, required: true } })
const router = useRouter()
const toast = useToast()

const renewal = ref(null)
const loading = ref(true)
const paying = ref(false)

const statusInfo = computed(() => (renewal.value ? normalizeOrderStatus(renewal.value.status) : null))

async function load() {
  try {
    renewal.value = await renewalsApi.getRenewal(props.id)
  } catch {
    toast.error('دریافت اطلاعات درخواست تمدید با خطا مواجه شد')
  } finally {
    loading.value = false
  }
}

// Same background refresh the order page uses — no push channel exists, so poll until the
// renewal reaches a state where nothing further will change on its own.
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
      renewal.value = await renewalsApi.getRenewal(props.id)
    } catch {
      // keep showing the last known state on a failed background refresh
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
    const result = await renewalsApi.initiateRenewalPayment(props.id)
    const url = result?.paymentRedirectUrl ?? result?.paymentUrl ?? result?.url ?? result?.redirectUrl
    if (!url) {
      toast.error('لینک پرداخت دریافت نشد')
      return
    }

    // TEMPORARY — same local payment bypass the order page handles: the returned URL is this
    // API's own callback, which answers with JSON rather than redirecting. Call it in the
    // background and refresh instead of stranding the patient on raw JSON. A real gateway URL
    // has no /payment/callback path and still gets a full browser redirect.
    // Remove once the backend redirects to the frontend after confirming payment.
    if (url.includes('/payment/callback')) {
      const { pathname, search } = new URL(url, window.location.origin)
      await fetch(pathname + search)
      renewal.value = await renewalsApi.getRenewal(props.id)
      toast.success('پرداخت با موفقیت انجام شد')
      return
    }

    window.location.href = url
  } catch (error) {
    toast.error(apiErrorMessage(error, 'شروع فرآیند پرداخت با خطا مواجه شد'))
  } finally {
    paying.value = false
  }
}
</script>

<template>
  <PageHeader title="جزئیات تمدید نسخه" back />

  <div v-if="loading" class="space-y-4">
    <div class="h-24 animate-pulse rounded-2xl bg-ink-50" />
    <div class="h-40 animate-pulse rounded-2xl bg-ink-50" />
  </div>

  <div v-else-if="renewal" class="space-y-6">
    <div class="rounded-2xl border border-ink-100 bg-surface p-4">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="font-bold text-ink-900">وضعیت درخواست</h2>
        <StatusBadge :status="renewal.status" />
      </div>
      <p v-if="statusInfo?.key === 'rejected' && renewal.rejectionReason" class="mb-2 rounded-xl bg-brick-50 p-3 text-sm text-brick-700">
        دلیل رد درخواست: {{ renewal.rejectionReason }}
      </p>
      <p class="font-data text-xs text-ink-400">تاریخ ثبت: {{ formatDate(orderCreatedAt(renewal)) }}</p>
    </div>

    <!-- The whole point of the request: the renewed prescription code. -->
    <div v-if="renewal.newPrescriptionReferenceNumber" class="rounded-2xl border border-primary-200 bg-primary-50 p-4">
      <h2 class="mb-1 font-bold text-primary-800">کد رهگیری نسخه تمدیدشده</h2>
      <p class="font-data text-lg font-bold text-primary-900">{{ renewal.newPrescriptionReferenceNumber }}</p>
      <p class="mt-1 text-xs text-primary-700">با این کد می‌توانید نسخه تمدیدشده خود را دریافت کنید.</p>
    </div>

    <div class="rounded-2xl border border-ink-100 bg-surface p-4">
      <h2 class="mb-2 font-bold text-ink-900">اطلاعات درخواست</h2>
      <div class="flex items-center justify-between py-1 text-sm">
        <span class="text-ink-500">کد نسخه فعلی</span>
        <span class="font-data text-ink-900">{{ renewal.currentPrescriptionReferenceNumber }}</span>
      </div>
      <div v-if="renewal.nationalCode" class="flex items-center justify-between py-1 text-sm">
        <span class="text-ink-500">کد ملی</span>
        <span class="font-data text-ink-900">{{ renewal.nationalCode }}</span>
      </div>
      <div class="flex items-center justify-between py-1 text-sm">
        <span class="text-ink-500">بیمه پایه</span>
        <span class="text-ink-900">{{ basicInsuranceLabel(renewal.basicInsurance) }}</span>
      </div>
      <div class="mt-2 flex items-center justify-between border-t border-ink-100 pt-2 text-sm font-semibold">
        <span class="text-ink-900">هزینه تمدید</span>
        <span class="font-data text-ink-900">{{ formatRials(orderTotal(renewal)) }}</span>
      </div>
    </div>

    <p v-if="statusInfo?.key === 'inProgress'" class="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
      پرداخت شما ثبت شد و پزشک در حال صدور نسخه تمدیدشده است.
    </p>

    <AppButton v-if="statusInfo?.key === 'pendingPayment'" block :loading="paying" @click="payNow">
      پرداخت آنلاین ({{ formatRials(orderTotal(renewal)) }})
    </AppButton>
  </div>
</template>
