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
const savingRefId = ref(null)
const viewingResultId = ref(null)
const referenceInputs = reactive({})
// Tracks which code is currently persisted per order, so the hint can confirm it stuck and
// complete() doesn't re-send an unchanged value. Seeded from the list, updated on save.
const savedRefs = reactive({})

onMounted(async () => {
  try {
    const [list] = await Promise.all([ordersApi.listInProgressOrders(), ensureLoaded()])
    orders.value = list ?? []
    for (const order of orders.value) {
      if (order.prescriptionReferenceNumber) {
        referenceInputs[order.id] = order.prescriptionReferenceNumber
        savedRefs[order.id] = order.prescriptionReferenceNumber
      }
    }
  } catch (error) {
    toast.error(apiErrorMessage(error, 'دریافت سفارش‌های در حال انجام با خطا مواجه شد'))
  } finally {
    loading.value = false
  }
})

/**
 * Registering the code stays separate from finishing the order: the customer needs it to go and
 * have the test done, which happens while the order is still here.
 */
async function saveReference(id) {
  const reference = referenceInputs[id]?.trim()
  if (!reference) {
    toast.warning('کد رهگیری را وارد کنید')
    return
  }
  savingRefId.value = id
  try {
    await ordersApi.attachPrescriptionReference(id, reference)
    savedRefs[id] = reference
    toast.success('کد رهگیری ثبت شد و از این پس برای مشتری نمایش داده می‌شود')
  } catch (error) {
    toast.error(apiErrorMessage(error, 'ثبت کد رهگیری با خطا مواجه شد'))
  } finally {
    savingRefId.value = null
  }
}

/**
 * The same endpoint ends the doctor's part either way — it closes a plain order outright, but
 * hands a consultation order to the customer to upload their result, so the wording differs.
 */
async function finishWork(order) {
  completingId.value = order.id
  try {
    const reference = referenceInputs[order.id]?.trim()
    if (reference && savedRefs[order.id] !== reference) await ordersApi.attachPrescriptionReference(order.id, reference)
    await ordersApi.completeOrder(order.id)
    orders.value = orders.value.filter((o) => o.id !== order.id)
    toast.success(
      order.requestsConsultation
        ? 'کار شما ثبت شد؛ سفارش برای بارگذاری نتیجه به مشتری منتقل شد'
        : 'سفارش تکمیل شد',
    )
  } catch (error) {
    toast.error(apiErrorMessage(error, 'ثبت پایان کار با خطا مواجه شد'))
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
      <p v-if="order.requestsConsultation" class="mt-2 text-xs text-primary-600">
        این سفارش درخواست مشاوره دارد؛ با ثبت پایان کار، نوبت بارگذاری نتیجه به مشتری می‌رسد.
      </p>
      <button
        v-if="order.hasResult"
        type="button"
        class="mt-2 block text-xs font-medium text-primary-600 hover:underline"
        :disabled="viewingResultId === order.id"
        @click="viewResult(order.id)"
      >
        مشاهده جواب آزمایش
      </button>

      <AppInput
        v-model="referenceInputs[order.id]"
        class="mt-3"
        label="کد رهگیری نسخه"
        placeholder="شماره ارجاع از سامانه نسخه‌نویسی"
        :hint="savedRefs[order.id] ? 'ثبت شد و برای مشتری نمایش داده می‌شود' : 'پس از ثبت، مشتری این کد را می‌بیند و می‌تواند آزمایش را انجام دهد'"
      />

      <div class="mt-3 flex flex-wrap gap-2">
        <AppButton variant="secondary" size="sm" :loading="savingRefId === order.id" @click="saveReference(order.id)">
          ثبت کد رهگیری
        </AppButton>
        <AppButton size="sm" :loading="completingId === order.id" @click="finishWork(order)">
          {{ order.requestsConsultation ? 'پایان کار پزشک' : 'تکمیل سفارش' }}
        </AppButton>
      </div>
    </div>
  </div>
</template>
