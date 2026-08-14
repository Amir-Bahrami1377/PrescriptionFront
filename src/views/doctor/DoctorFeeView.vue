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
const loading = ref(true)

const currentFee = ref(null)
const feeInput = ref('')
const saving = ref(false)

const currentConsultationFee = ref(null)
const consultationFeeInput = ref('')
const savingConsultationFee = ref(false)

const currentRenewalFee = ref(null)
const renewalFeeInput = ref('')
const savingRenewalFee = ref(false)

/** Response shape isn't documented — accept either { feeInRials } or a bare number. */
function readFee(res) {
  if (res && typeof res === 'object') return res.feeInRials ?? null
  return res ?? null
}

async function load() {
  loading.value = true
  try {
    const [fee, consultationFee, renewalFee] = await Promise.all([
      doctorApi.getMyFee(),
      doctorApi.getMyConsultationFee(),
      doctorApi.getMyRenewalFee(),
    ])
    currentFee.value = readFee(fee)
    if (currentFee.value !== null) feeInput.value = String(currentFee.value)
    currentConsultationFee.value = readFee(consultationFee)
    if (currentConsultationFee.value !== null) consultationFeeInput.value = String(currentConsultationFee.value)
    currentRenewalFee.value = readFee(renewalFee)
    if (currentRenewalFee.value !== null) renewalFeeInput.value = String(currentRenewalFee.value)
  } catch (error) {
    toast.error(apiErrorMessage(error, 'دریافت هزینه‌ها با خطا مواجه شد'))
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

async function saveConsultationFee() {
  const value = Number(consultationFeeInput.value)
  if (!consultationFeeInput.value || Number.isNaN(value) || value <= 0) {
    toast.warning('مبلغ معتبر وارد کنید')
    return
  }
  savingConsultationFee.value = true
  try {
    await doctorApi.setMyConsultationFee(value)
    currentConsultationFee.value = value
    toast.success('هزینه مشاوره به‌روزرسانی شد')
  } catch (error) {
    toast.error(apiErrorMessage(error, 'ذخیره هزینه مشاوره با خطا مواجه شد'))
  } finally {
    savingConsultationFee.value = false
  }
}

async function saveRenewalFee() {
  const value = Number(renewalFeeInput.value)
  if (!renewalFeeInput.value || Number.isNaN(value) || value <= 0) {
    toast.warning('مبلغ معتبر وارد کنید')
    return
  }
  savingRenewalFee.value = true
  try {
    await doctorApi.setMyRenewalFee(value)
    currentRenewalFee.value = value
    toast.success('هزینه تمدید نسخه به‌روزرسانی شد')
  } catch (error) {
    toast.error(apiErrorMessage(error, 'ذخیره هزینه تمدید با خطا مواجه شد'))
  } finally {
    savingRenewalFee.value = false
  }
}
</script>

<template>
  <PageHeader title="تعرفه‌های شما" subtitle="این مبالغ، هزینه ثابت هر سفارش یا درخواستی است که تایید می‌کنید" />

  <div v-if="loading" class="space-y-4">
    <div v-for="i in 3" :key="i" class="h-40 animate-pulse rounded-2xl bg-ink-50" />
  </div>

  <div v-else class="space-y-8">
    <section class="space-y-4">
      <h2 class="font-bold text-ink-900">هزینه ویزیت</h2>
      <div v-if="currentFee === null" class="rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
        هنوز هزینه ویزیتی تنظیم نکرده‌اید. تا زمانی که این مبلغ را مشخص نکنید، امکان تایید سفارش‌ها وجود ندارد.
      </div>
      <div v-else class="rounded-2xl border border-ink-100 bg-surface p-4">
        <p class="text-sm text-ink-500">هزینه فعلی</p>
        <p class="font-data mt-1 text-xl font-bold text-ink-900">{{ formatRials(currentFee) }}</p>
      </div>

      <div class="rounded-2xl border border-ink-100 bg-surface p-4">
        <AppInput v-model="feeInput" numeric dir="ltr" label="هزینه ویزیت جدید (ریال)" placeholder="مثلاً ۵۰۰۰۰۰" />
        <AppButton class="mt-4" block :loading="saving" @click="save">ذخیره هزینه ویزیت</AppButton>
      </div>
    </section>

    <section class="space-y-4">
      <h2 class="font-bold text-ink-900">هزینه مشاوره</h2>
      <p class="-mt-2 text-xs text-ink-500">هنگامی که مشتری هنگام ثبت سفارش، مشاوره درخواست کند، این مبلغ به هزینه ویزیت اضافه می‌شود.</p>
      <div v-if="currentConsultationFee === null" class="rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
        هنوز هزینه مشاوره‌ای تنظیم نکرده‌اید. تا زمانی که این مبلغ را مشخص نکنید، امکان تایید سفارش‌های با درخواست مشاوره وجود ندارد.
      </div>
      <div v-else class="rounded-2xl border border-ink-100 bg-surface p-4">
        <p class="text-sm text-ink-500">هزینه فعلی</p>
        <p class="font-data mt-1 text-xl font-bold text-ink-900">{{ formatRials(currentConsultationFee) }}</p>
      </div>

      <div class="rounded-2xl border border-ink-100 bg-surface p-4">
        <AppInput v-model="consultationFeeInput" numeric dir="ltr" label="هزینه مشاوره جدید (ریال)" placeholder="مثلاً ۲۰۰۰۰۰" />
        <AppButton class="mt-4" block :loading="savingConsultationFee" @click="saveConsultationFee">ذخیره هزینه مشاوره</AppButton>
      </div>
    </section>

    <section class="space-y-4">
      <h2 class="font-bold text-ink-900">هزینه تمدید نسخه</h2>
      <p class="-mt-2 text-xs text-ink-500">هزینه‌ای که برای هر درخواست تمدید نسخه بیماران ویژه ثبت می‌شود.</p>
      <div v-if="currentRenewalFee === null" class="rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
        هنوز هزینه تمدیدی تنظیم نکرده‌اید. تا زمانی که این مبلغ را مشخص نکنید، امکان تایید درخواست‌های تمدید وجود ندارد.
      </div>
      <div v-else class="rounded-2xl border border-ink-100 bg-surface p-4">
        <p class="text-sm text-ink-500">هزینه فعلی</p>
        <p class="font-data mt-1 text-xl font-bold text-ink-900">{{ formatRials(currentRenewalFee) }}</p>
      </div>

      <div class="rounded-2xl border border-ink-100 bg-surface p-4">
        <AppInput v-model="renewalFeeInput" numeric dir="ltr" label="هزینه تمدید جدید (ریال)" placeholder="مثلاً ۳۰۰۰۰۰" />
        <AppButton class="mt-4" block :loading="savingRenewalFee" @click="saveRenewalFee">ذخیره هزینه تمدید</AppButton>
      </div>
    </section>
  </div>
</template>
