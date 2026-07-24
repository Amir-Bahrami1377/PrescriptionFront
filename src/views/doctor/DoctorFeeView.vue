<script setup>
import { onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import * as doctorApi from '@/api/doctorApi'
import { apiErrorMessage } from '@/lib/apiError'
import { formatRials } from '@/lib/format'
import PageHeader from '@/components/common/PageHeader.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'

const toast = useToast()
const currentFee = ref(null)
const feeInput = ref('')
const loading = ref(true)
const saving = ref(false)

/** Response shape isn't documented — accept either { feeInRials } or a bare number. */
function readFee(res) {
  if (res && typeof res === 'object') return res.feeInRials ?? null
  return res ?? null
}

async function load() {
  loading.value = true
  try {
    currentFee.value = readFee(await doctorApi.getMyFee())
    if (currentFee.value !== null) feeInput.value = String(currentFee.value)
  } catch (error) {
    toast.error(apiErrorMessage(error, 'دریافت هزینه ویزیت با خطا مواجه شد'))
  } finally {
    loading.value = false
  }
}
onMounted(load)

async function save() {
  const value = Number(feeInput.value)
  if (!feeInput.value || Number.isNaN(value) || value <= 0) {
    toast.warning('مبلغ معتبر وارد کنید')
    return
  }
  saving.value = true
  try {
    await doctorApi.setMyFee(value)
    currentFee.value = value
    toast.success('هزینه ویزیت به‌روزرسانی شد')
  } catch (error) {
    toast.error(apiErrorMessage(error, 'ذخیره هزینه ویزیت با خطا مواجه شد'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <PageHeader title="هزینه ویزیت" subtitle="این مبلغ، هزینه ثابت هر سفارشی است که تایید می‌کنید" />

  <div v-if="loading" class="h-40 animate-pulse rounded-2xl bg-ink-50" />

  <div v-else class="space-y-4">
    <div v-if="currentFee === null" class="rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
      هنوز هزینه ویزیتی تنظیم نکرده‌اید. تا زمانی که این مبلغ را مشخص نکنید، امکان تایید سفارش‌ها وجود ندارد.
    </div>
    <div v-else class="rounded-2xl border border-ink-100 bg-surface p-4">
      <p class="text-sm text-ink-500">هزینه فعلی</p>
      <p class="font-data mt-1 text-xl font-bold text-ink-900">{{ formatRials(currentFee) }}</p>
    </div>

    <div class="rounded-2xl border border-ink-100 bg-surface p-4">
      <AppInput v-model="feeInput" type="number" dir="ltr" label="هزینه ویزیت جدید (ریال)" placeholder="مثلاً ۵۰۰۰۰۰" />
      <AppButton class="mt-4" block :loading="saving" @click="save">ذخیره هزینه ویزیت</AppButton>
    </div>
  </div>
</template>
