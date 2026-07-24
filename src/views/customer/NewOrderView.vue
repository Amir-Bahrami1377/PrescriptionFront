<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import * as catalogApi from '@/api/catalogApi'
import { useOrdersStore } from '@/stores/ordersStore'
import { useFileUpload } from '@/composables/useFileUpload'
import { apiErrorMessage } from '@/lib/apiError'
import { isValidNationalCode } from '@/lib/nationalCode'
import { BASIC_INSURANCE_OPTIONS, SUPPLEMENTARY_INSURANCE_OPTIONS } from '@/lib/insurance'
import PageHeader from '@/components/common/PageHeader.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppSelect from '@/components/common/AppSelect.vue'
import AppButton from '@/components/common/AppButton.vue'
import FileUploader from '@/components/common/FileUploader.vue'
import MultiSelectDropdown from '@/components/common/MultiSelectDropdown.vue'

const router = useRouter()
const toast = useToast()
const ordersStore = useOrdersStore()
const { uploading, progress, run } = useFileUpload()

const tests = ref([])
const loadingTests = ref(true)
const selectedIds = ref([])
const note = ref('')
const file = ref(null)
const submitting = ref(false)

const basicInsurance = ref('None')
const supplementaryInsurance = ref('None')
const isForThirdParty = ref(false)
const thirdPartyNationalCode = ref('')
const thirdPartyPhoneNumber = ref('')
const requestsConsultation = ref(false)

onMounted(async () => {
  try {
    tests.value = (await catalogApi.listTests()) ?? []
  } catch {
    toast.error('دریافت فهرست آزمایش‌ها با خطا مواجه شد')
  } finally {
    loadingTests.value = false
  }
})

async function submit() {
  if (!selectedIds.value.length) {
    toast.warning('حداقل یک آزمایش را انتخاب کنید')
    return
  }
  if (isForThirdParty.value) {
    if (!isValidNationalCode(thirdPartyNationalCode.value)) {
      toast.warning('کد ملی فرد موردنظر معتبر نیست')
      return
    }
    if (!/^09\d{9}$/.test(thirdPartyPhoneNumber.value)) {
      toast.warning('شماره موبایل فرد موردنظر معتبر نیست')
      return
    }
  }
  submitting.value = true
  try {
    const order = await run((onUploadProgress) =>
      ordersStore.createOrder(
        {
          labTestIds: selectedIds.value,
          note: note.value,
          file: file.value,
          basicInsurance: basicInsurance.value,
          supplementaryInsurance: supplementaryInsurance.value,
          thirdParty: isForThirdParty.value
            ? { nationalCode: thirdPartyNationalCode.value, phoneNumber: thirdPartyPhoneNumber.value }
            : null,
          requestsConsultation: requestsConsultation.value,
        },
        onUploadProgress,
      ),
    )
    toast.success('سفارش با موفقیت ثبت شد')
    router.push({ name: 'order-detail', params: { id: order.id } })
  } catch (error) {
    toast.error(apiErrorMessage(error, 'ثبت سفارش با خطا مواجه شد'))
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <PageHeader title="ثبت آزمایش جدید" subtitle="آزمایش موردنیاز را انتخاب و برای بررسی پزشک ارسال کنید" back />

  <div class="space-y-6">
    <div>
      <span class="mb-1.5 block text-sm font-medium text-ink-700">آزمایش‌ها</span>
      <MultiSelectDropdown
        v-model="selectedIds"
        :options="tests"
        :loading="loadingTests"
        placeholder="جستجو و انتخاب آزمایش…"
        empty-text="آزمایشی یافت نشد"
      />
    </div>

    <div class="grid gap-3 sm:grid-cols-2">
      <AppSelect v-model="basicInsurance" label="بیمه پایه" :options="BASIC_INSURANCE_OPTIONS" />
      <AppSelect v-model="supplementaryInsurance" label="بیمه تکمیلی" :options="SUPPLEMENTARY_INSURANCE_OPTIONS" />
    </div>

    <div class="rounded-2xl border border-ink-100 bg-surface p-4">
      <label class="flex cursor-pointer items-center gap-2.5">
        <input
          v-model="isForThirdParty"
          type="checkbox"
          class="size-4 rounded border-ink-300 text-primary-600 focus:ring-primary-500"
        />
        <span class="text-sm font-medium text-ink-800">این سفارش برای شخص دیگری است</span>
      </label>

      <div v-if="isForThirdParty" class="mt-4 grid gap-3 sm:grid-cols-2">
        <AppInput v-model="thirdPartyNationalCode" label="کد ملی فرد" dir="ltr" inputmode="numeric" placeholder="۱۰ رقم" />
        <AppInput v-model="thirdPartyPhoneNumber" label="شماره موبایل فرد" dir="ltr" placeholder="09xxxxxxxxx" />
      </div>
    </div>

    <div class="rounded-2xl border border-ink-100 bg-surface p-4">
      <label class="flex cursor-pointer items-center gap-2.5">
        <input
          v-model="requestsConsultation"
          type="checkbox"
          class="size-4 rounded border-ink-300 text-primary-600 focus:ring-primary-500"
        />
        <span class="text-sm font-medium text-ink-800">درخواست مشاوره پزشک برای نتیجه آزمایش</span>
      </label>
      <p class="mt-2 text-xs text-ink-500">
        در صورت انتخاب، پس از دریافت نتیجه آزمایش آن را برای پزشک بارگذاری می‌کنید و نظر تخصصی او را دریافت می‌کنید. هزینه ثابت مشاوره پزشک به هزینه ویزیت این سفارش اضافه می‌شود.
      </p>
    </div>

    <AppInput v-model="note" as="textarea" label="یادداشت برای پزشک (اختیاری)" placeholder="توضیح علائم یا نکات لازم…" />

    <div>
      <span class="mb-1.5 block text-sm font-medium text-ink-700">پیوست تصویر یا فایل نسخه/درخواست (اختیاری)</span>
      <FileUploader v-model="file" accept="image/jpeg,image/png,application/pdf" />
      <p class="mt-1.5 text-xs text-ink-400">در صورت پیوست فایل، فرمت مجاز: JPEG، PNG یا PDF</p>
      <p v-if="uploading" class="font-data mt-2 text-xs text-primary-600">در حال ارسال… {{ progress }}٪</p>
    </div>

    <div class="sticky bottom-20 rounded-2xl border border-ink-100 bg-surface p-4 shadow-sm shadow-ink-900/5">
      <p class="mb-3 text-xs text-ink-500">هزینه ویزیت پس از بررسی و تایید پزشک مشخص می‌شود.</p>
      <AppButton block :loading="submitting" @click="submit">ارسال برای بررسی پزشک</AppButton>
    </div>
  </div>
</template>
