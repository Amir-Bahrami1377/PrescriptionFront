<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import * as ordersApi from '@/api/ordersApi'
import { useTestCatalog } from '@/composables/useTestCatalog'
import { apiErrorMessage } from '@/lib/apiError'
import { basicInsuranceLabel } from '@/lib/insurance'
import PageHeader from '@/components/common/PageHeader.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'
import { formatDate, orderCreatedAt, claimMinutesLeft } from '@/lib/format'

const { id } = defineProps({ id: { type: String, required: true } })
const router = useRouter()
const toast = useToast()
const { ensureLoaded, testNames } = useTestCatalog()

const order = ref(null)
const loading = ref(true)
const decision = ref('approve') // approve | reject
const rejectionReason = ref('')
const submitting = ref(false)

onMounted(async () => {
  try {
    // GetOrderStatus doesn't include the customer's note, attachment flag, or claim expiry —
    // those only come back on the "my claimed queue" list, so merge the two.
    const [fetchedOrder, mine] = await Promise.all([ordersApi.getOrder(id), ordersApi.listMyPendingReviews(), ensureLoaded()])
    const claimed = mine?.find((o) => o.id === id)
    order.value = { ...fetchedOrder, ...claimed }
  } catch {
    toast.error('دریافت اطلاعات سفارش با خطا مواجه شد')
  } finally {
    loading.value = false
  }
})

async function submit() {
  if (decision.value === 'reject' && !rejectionReason.value.trim()) {
    toast.warning('دلیل رد سفارش را وارد کنید')
    return
  }
  submitting.value = true
  try {
    await ordersApi.reviewOrder(id, {
      approve: decision.value === 'approve',
      rejectionReason: decision.value === 'reject' ? rejectionReason.value : null,
    })
    toast.success(decision.value === 'approve' ? 'سفارش تایید شد' : 'سفارش رد شد')
    router.push({ name: 'pending-review' })
  } catch (error) {
    toast.error(apiErrorMessage(error, 'ثبت تصمیم با خطا مواجه شد'))
    // 409 means the claim expired or was never held — nothing left to do on this page.
    if (error.response?.status === 409) router.push({ name: 'pending-review' })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <PageHeader title="بررسی سفارش" back />

  <div v-if="loading" class="h-64 animate-pulse rounded-2xl bg-ink-50" />

  <div v-else-if="order" class="space-y-6">
    <p v-if="claimMinutesLeft(order) !== null" class="rounded-xl bg-amber-50 px-3.5 py-2 text-sm text-amber-800">
      این سفارش تا {{ claimMinutesLeft(order) }} دقیقه دیگر در اختیار شماست.
    </p>

    <div class="rounded-2xl border border-ink-100 bg-surface p-4">
      <h2 class="mb-3 font-bold text-ink-900">آزمایش‌های درخواستی</h2>
      <p class="font-medium text-ink-900">{{ testNames(order.labTestIds) }}</p>
      <p class="font-data mt-3 text-xs text-ink-400">تاریخ ثبت: {{ formatDate(orderCreatedAt(order)) }}</p>
      <p v-if="order.customerNote" class="mt-3 rounded-xl bg-ink-50 p-3 text-sm text-ink-600">{{ order.customerNote }}</p>
      <p v-if="order.hasAttachment" class="mt-2 text-xs text-primary-600">مشتری فایلی پیوست کرده است.</p>
      <p v-if="order.requestsConsultation" class="mt-2 text-xs text-primary-600">مشتری درخواست مشاوره پزشک هم داده است.</p>
    </div>

    <div v-if="order.basicInsurance !== 'None'" class="rounded-2xl border border-ink-100 bg-surface p-4">
      <h2 class="mb-2 font-bold text-ink-900">اطلاعات بیمه</h2>
      <div class="flex items-center justify-between py-1 text-sm">
        <span class="text-ink-500">بیمه پایه</span>
        <span class="text-ink-900">{{ basicInsuranceLabel(order.basicInsurance) }}</span>
      </div>
    </div>

    <div v-if="order.isForThirdParty" class="rounded-2xl border border-primary-100 bg-primary-50 p-4">
      <p class="text-sm font-medium text-primary-800">این سفارش برای شخص دیگری ثبت شده است</p>
      <p class="font-data mt-1 text-sm text-primary-700">کد ملی: {{ order.thirdPartyNationalCode }}</p>
      <p class="font-data text-sm text-primary-700">موبایل: {{ order.thirdPartyPhoneNumber }}</p>
    </div>

    <div class="rounded-2xl border border-ink-100 bg-surface p-4">
      <h2 class="mb-3 font-bold text-ink-900">تصمیم پزشک</h2>
      <div class="mb-4 flex gap-2">
        <button
          type="button"
          class="flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors"
          :class="decision === 'approve' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-ink-100 text-ink-500'"
          @click="decision = 'approve'"
        >
          تایید سفارش
        </button>
        <button
          type="button"
          class="flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors"
          :class="decision === 'reject' ? 'border-brick-600 bg-brick-50 text-brick-700' : 'border-ink-100 text-ink-500'"
          @click="decision = 'reject'"
        >
          رد سفارش
        </button>
      </div>

      <p v-if="decision === 'approve'" class="mb-2 text-xs text-ink-500">
        با تایید، هزینه ویزیت بر اساس تعرفه ثابت شما برای این سفارش ثبت می‌شود{{
          order.requestsConsultation ? '؛ از آنجا که مشتری درخواست مشاوره داده، هزینه مشاوره ثابت شما نیز به آن اضافه خواهد شد.' : '.'
        }}
      </p>
      <AppInput v-else v-model="rejectionReason" as="textarea" label="دلیل رد سفارش" placeholder="دلیل رد را برای مشتری توضیح دهید…" />

      <AppButton class="mt-4" block :variant="decision === 'reject' ? 'danger' : 'primary'" :loading="submitting" @click="submit">
        {{ decision === 'approve' ? 'ثبت تایید' : 'ثبت رد سفارش' }}
      </AppButton>
    </div>
  </div>
</template>
