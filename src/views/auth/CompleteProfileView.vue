<script setup>
import { ref } from 'vue'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useToast } from 'vue-toastification'
import { useAuth } from '@/composables/useAuth'
import { apiErrorMessage } from '@/lib/apiError'
import { isValidNationalCode } from '@/lib/nationalCode'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'

const toast = useToast()
const { completeProfileAndRoute } = useAuth()
const submitting = ref(false)

const schema = toTypedSchema(
  z.object({
    fullName: z.string().min(3, 'نام و نام خانوادگی را کامل وارد کنید'),
    nationalCode: z.string().refine(isValidNationalCode, 'کد ملی معتبر نیست'),
    age: z.coerce.number({ invalid_type_error: 'سن را وارد کنید' }).int().min(1, 'سن نامعتبر است').max(120, 'سن نامعتبر است'),
    gender: z.enum(['Male', 'Female'], { required_error: 'جنسیت را انتخاب کنید', invalid_type_error: 'جنسیت را انتخاب کنید' }),
  }),
)
const { handleSubmit } = useForm({ validationSchema: schema, initialValues: { gender: '' } })
const { value: fullName, errorMessage: fullNameError } = useField('fullName')
const { value: nationalCode, errorMessage: nationalCodeError } = useField('nationalCode')
const { value: age, errorMessage: ageError } = useField('age')
const { value: gender, errorMessage: genderError } = useField('gender')

const onSubmit = handleSubmit(async (values) => {
  submitting.value = true
  try {
    await completeProfileAndRoute(values)
  } catch (error) {
    toast.error(apiErrorMessage(error, 'ثبت اطلاعات با خطا مواجه شد. دوباره تلاش کنید.'))
  } finally {
    submitting.value = false
  }
})
</script>

<template>
  <h2 class="text-lg font-bold text-ink-900">تکمیل اطلاعات هویتی</h2>
  <p class="mt-1 text-sm text-ink-500">برای ثبت اولین سفارش، این اطلاعات لازم است.</p>

  <form class="mt-6 space-y-4" @submit="onSubmit">
    <AppInput v-model="fullName" label="نام و نام خانوادگی" :error="fullNameError" />
    <AppInput v-model="nationalCode" label="کد ملی" dir="ltr" inputmode="numeric" :error="nationalCodeError" />
    <AppInput v-model="age" label="سن" type="number" dir="ltr" :error="ageError" />
    <label class="block">
      <span class="mb-1.5 block text-sm font-medium text-ink-700">جنسیت</span>
      <select
        v-model="gender"
        class="w-full rounded-xl border bg-surface px-3.5 py-2.5 text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
        :class="genderError ? 'border-brick-400' : 'border-ink-100'"
      >
        <option value="" disabled>انتخاب کنید</option>
        <option value="Male">مرد</option>
        <option value="Female">زن</option>
      </select>
      <span v-if="genderError" class="mt-1.5 block text-sm text-brick-600">{{ genderError }}</span>
    </label>
    <AppButton type="submit" block :loading="submitting">ثبت و ادامه</AppButton>
  </form>
</template>
