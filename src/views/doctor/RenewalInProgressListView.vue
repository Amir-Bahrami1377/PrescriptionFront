<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useToast } from 'vue-toastification'
import * as renewalsApi from '@/api/renewalsApi'
import { apiErrorMessage } from '@/lib/apiError'
import { basicInsuranceLabel } from '@/lib/insurance'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'
import { formatDate, formatRials, orderCreatedAt, orderTotal } from '@/lib/format'

const toast = useToast()
const renewals = ref([])
const loading = ref(true)
const completingId = ref(null)
const newCodes = reactive({})

onMounted(async () => {
  try {
    renewals.value = (await renewalsApi.listInProgressRenewals()) ?? []
  } catch (error) {
    toast.error(apiErrorMessage(error, 'دریافت تمدیدهای در حال انجام با خطا مواجه شد'))
  } finally {
    loading.value = false
  }
})

/**
 * Issuing the new code and closing the renewal is a single backend call — it refuses an empty
 * code, so the patient can never end up with a completed renewal and nothing to show for it.
 */
async function complete(id) {
  const code = newCodes[id]?.trim()
  if (!code) {
    toast.warning('کد رهگیری نسخه جدید را وارد کنید')
    return
  }
  completingId.value = id
  try {
    await renewalsApi.completeRenewal(id, code)
    renewals.value = renewals.value.filter((r) => r.id !== id)
    toast.success('نسخه تمدید شد و کد جدید برای بیمار ثبت شد')
  } catch (error) {
    toast.error(apiErrorMessage(error, 'تکمیل تمدید با خطا مواجه شد'))
  } finally {
    completingId.value = null
  }
}
</script>

<template>
  <PageHeader title="تمدیدهای در حال انجام" subtitle="درخواست‌های پرداخت‌شده که منتظر صدور نسخه جدید هستند" />

  <div v-if="loading" class="space-y-3">
    <div v-for="i in 3" :key="i" class="h-24 animate-pulse rounded-2xl bg-ink-50" />
  </div>

  <EmptyState v-else-if="!renewals.length" title="تمدیدی در حال انجام نیست" />

  <div v-else class="space-y-3">
    <div v-for="renewal in renewals" :key="renewal.id" class="rounded-2xl border border-ink-100 bg-surface p-4">
      <p class="font-data font-medium text-ink-900">{{ renewal.currentPrescriptionReferenceNumber }}</p>
      <p class="font-data mt-1 text-xs text-ink-500">کد ملی: {{ renewal.nationalCode }}</p>
      <p class="mt-1 text-xs text-ink-500">{{ basicInsuranceLabel(renewal.basicInsurance) }}</p>
      <p class="font-data mt-1 text-xs text-ink-400">{{ formatDate(orderCreatedAt(renewal)) }}</p>
      <p class="font-data mt-1 text-sm font-medium text-ink-700">{{ formatRials(orderTotal(renewal)) }}</p>

      <AppInput
        v-model="newCodes[renewal.id]"
        class="mt-3"
        label="کد رهگیری نسخه جدید"
        placeholder="کد نسخه تمدیدشده"
        hint="با ثبت این کد، تمدید تکمیل می‌شود و بیمار کد را می‌بیند"
      />
      <AppButton class="mt-3" size="sm" :loading="completingId === renewal.id" @click="complete(renewal.id)">
        ثبت نسخه جدید و تکمیل
      </AppButton>
    </div>
  </div>
</template>
