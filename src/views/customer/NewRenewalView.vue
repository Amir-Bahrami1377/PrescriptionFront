<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import * as renewalsApi from '@/api/renewalsApi'
import { apiErrorMessage } from '@/lib/apiError'
import { isValidNationalCode } from '@/lib/nationalCode'
import { useInsuranceTypes } from '@/composables/useInsuranceTypes'
import PageHeader from '@/components/common/PageHeader.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppSelect from '@/components/common/AppSelect.vue'
import AppButton from '@/components/common/AppButton.vue'

const router = useRouter()
const toast = useToast()
const { options: insuranceOptions, ensureLoaded } = useInsuranceTypes()

const currentPrescriptionReferenceNumber = ref('')
const nationalCode = ref('')
const basicInsurance = ref('None')
const submitting = ref(false)

onMounted(ensureLoaded)

async function submit() {
  if (!currentPrescriptionReferenceNumber.value.trim()) {
    toast.warning('کد رهگیری نسخه فعلی را وارد کنید')
    return
  }
  if (!isValidNationalCode(nationalCode.value)) {
    toast.warning('کد ملی معتبر نیست')
    return
  }
  submitting.value = true
  try {
    const { renewalId } = await renewalsApi.createRenewal({
      currentPrescriptionReferenceNumber: currentPrescriptionReferenceNumber.value.trim(),
      nationalCode: nationalCode.value.trim(),
      basicInsurance: basicInsurance.value,
    })
    toast.success('درخواست تمدید ثبت شد')
    router.push({ name: 'renewal-detail', params: { id: renewalId } })
  } catch (error) {
    toast.error(apiErrorMessage(error, 'ثبت درخواست تمدید با خطا مواجه شد'))
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <PageHeader title="درخواست تمدید نسخه" subtitle="کد نسخه فعلی خود را وارد کنید تا پزشک آن را بررسی و تمدید کند" back />

  <div class="space-y-6">
    <AppInput
      v-model="currentPrescriptionReferenceNumber"
      label="کد رهگیری نسخه فعلی"
      placeholder="کدی که هنگام تکمیل سفارش قبلی دریافت کرده‌اید"
    />

    <AppInput v-model="nationalCode" label="کد ملی بیمار" dir="ltr" inputmode="numeric" placeholder="۱۰ رقم" />

    <AppSelect v-model="basicInsurance" label="بیمه پایه" :options="insuranceOptions" />

    <div class="sticky bottom-20 rounded-2xl border border-ink-100 bg-surface p-4 shadow-sm shadow-ink-900/5">
      <p class="mb-3 text-xs text-ink-500">
        هزینه تمدید پس از بررسی و تایید پزشک مشخص می‌شود. در هر زمان حداکثر ۳ درخواست تمدید می‌توانید در انتظار بررسی داشته باشید.
      </p>
      <AppButton block :loading="submitting" @click="submit">ارسال برای بررسی پزشک</AppButton>
    </div>
  </div>
</template>
