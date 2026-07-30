<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import * as catalogApi from '@/api/catalogApi'
import { useOrdersStore } from '@/stores/ordersStore'
import { useFileUpload } from '@/composables/useFileUpload'
import { apiErrorMessage } from '@/lib/apiError'
import { isValidNationalCode } from '@/lib/nationalCode'
import { useInsuranceTypes } from '@/composables/useInsuranceTypes'
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
const { options: insuranceOptions, ensureLoaded: ensureInsuranceTypesLoaded } = useInsuranceTypes()

const tests = ref([])
const loadingTests = ref(true)
const selectedIds = ref([])
const note = ref('')
const file = ref(null)
const submitting = ref(false)

const basicInsurance = ref('None')
const isForThirdParty = ref(false)
const thirdPartyNationalCode = ref('')
const thirdPartyPhoneNumber = ref('')
const requestsConsultation = ref(false)

// The cap is enforced by the backend; it also reports how much is left, so the form can say so
// up front instead of letting someone fill everything in and get rejected on submit.
const capacity = computed(() => ordersStore.capacity)
const atCapacity = computed(() => capacity.value?.remaining === 0)

onMounted(async () => {
  try {
    const [testList] = await Promise.all([
      catalogApi.listTests(),
      ensureInsuranceTypesLoaded(),
      ordersStore.fetchMyOrders().catch(() => null),
    ])
    tests.value = testList ?? []
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

    <AppSelect v-model="basicInsurance" label="بیمه پایه" :options="insuranceOptions" />

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
      <p v-if="atCapacity" class="mb-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
        در حال حاضر {{ capacity.used }} سفارش در انتظار بررسی پزشک دارید و به سقف {{ capacity.limit }} سفارش رسیده‌اید. تا
        بررسی یکی از آن‌ها امکان ثبت سفارش جدید نیست.
        <router-link :to="{ name: 'order-tracking' }" class="font-medium underline">مشاهده سفارش‌ها</router-link>
      </p>
      <p v-else class="mb-3 text-xs text-ink-500">
        هزینه ویزیت پس از بررسی و تایید پزشک مشخص می‌شود.<template v-if="capacity">
          می‌توانید {{ capacity.remaining }} سفارش دیگر در انتظار بررسی داشته باشید.</template>
      </p>
      <AppButton block :disabled="atCapacity" :loading="submitting" @click="submit">ارسال برای بررسی پزشک</AppButton>
    </div>
  </div>
</template>
