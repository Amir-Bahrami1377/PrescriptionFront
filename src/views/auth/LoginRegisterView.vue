<script setup>
import { onUnmounted, ref } from 'vue'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useToast } from 'vue-toastification'
import { useAuth } from '@/composables/useAuth'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'
import OtpInput from '@/components/common/OtpInput.vue'

const toast = useToast()
const { requestOtp, verifyAndRoute } = useAuth()

const step = ref('phone') // phone | otp
const submitting = ref(false)
const otpCode = ref('')
const resendSeconds = ref(0)
let resendTimer = null

const phoneSchema = toTypedSchema(
  z.object({
    phoneNumber: z
      .string()
      .regex(/^09\d{9}$/, 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود'),
  }),
)
const { handleSubmit } = useForm({ validationSchema: phoneSchema })
const { value: phoneNumber, errorMessage: phoneError } = useField('phoneNumber')

function startResendTimer() {
  resendSeconds.value = 60
  clearInterval(resendTimer)
  resendTimer = setInterval(() => {
    if (resendSeconds.value > 0) resendSeconds.value -= 1
    else clearInterval(resendTimer)
  }, 1000)
}

const submitPhone = handleSubmit(async (values) => {
  submitting.value = true
  try {
    await requestOtp(values.phoneNumber)
    step.value = 'otp'
    startResendTimer()
  } catch {
    toast.error('ارسال کد تایید با خطا مواجه شد. دوباره تلاش کنید.')
  } finally {
    submitting.value = false
  }
})

async function resend() {
  if (resendSeconds.value > 0) return
  try {
    await requestOtp(phoneNumber.value)
    toast.success('کد تایید مجدداً ارسال شد')
    startResendTimer()
  } catch {
    toast.error('ارسال کد تایید با خطا مواجه شد')
  }
}

async function submitOtp() {
  submitting.value = true
  try {
    await verifyAndRoute(otpCode.value)
  } catch {
    toast.error('کد تایید نادرست است')
    otpCode.value = ''
  } finally {
    submitting.value = false
  }
}

function editPhone() {
  step.value = 'phone'
  otpCode.value = ''
  clearInterval(resendTimer)
}

onUnmounted(() => clearInterval(resendTimer))
</script>

<template>
  <div v-if="step === 'phone'">
    <h2 class="text-lg font-bold text-ink-900">ورود یا ثبت‌نام</h2>
    <p class="mt-1 text-sm text-ink-500">شماره موبایل خود را وارد کنید تا کد تایید برایتان پیامک شود.</p>
    <form class="mt-6 space-y-4" @submit="submitPhone">
      <AppInput
        v-model="phoneNumber"
        label="شماره موبایل"
        type="tel"
        dir="ltr"
        numeric
        placeholder="09xxxxxxxxx"
        :error="phoneError"
      />
      <AppButton type="submit" block :loading="submitting">دریافت کد تایید</AppButton>
    </form>
  </div>

  <div v-else>
    <h2 class="text-lg font-bold text-ink-900">کد تایید را وارد کنید</h2>
    <p class="mt-1 text-sm text-ink-500">
      کد ۵ رقمی ارسال شده به
      <span class="font-data text-ink-700" dir="ltr">{{ phoneNumber }}</span>
      را وارد کنید.
    </p>
    <div class="mt-6">
      <OtpInput v-model="otpCode" :length="5" @complete="submitOtp" />
    </div>
    <div class="mt-4 flex items-center justify-between text-sm">
      <button type="button" class="font-medium text-primary-600 hover:text-primary-700" @click="editPhone">
        ویرایش شماره
      </button>
      <button
        type="button"
        class="font-medium"
        :class="resendSeconds > 0 ? 'text-ink-300' : 'text-primary-600 hover:text-primary-700'"
        :disabled="resendSeconds > 0"
        @click="resend"
      >
        {{ resendSeconds > 0 ? `ارسال مجدد (${resendSeconds})` : 'ارسال مجدد کد' }}
      </button>
    </div>
    <AppButton class="mt-6" block :loading="submitting" :disabled="otpCode.length < 5" @click="submitOtp">
      تایید و ورود
    </AppButton>
  </div>
</template>
