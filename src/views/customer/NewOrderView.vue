<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import * as catalogApi from '@/api/catalogApi'
import { useOrdersStore } from '@/stores/ordersStore'
import { useFileUpload } from '@/composables/useFileUpload'
import { apiErrorMessage } from '@/lib/apiError'
import PageHeader from '@/components/common/PageHeader.vue'
import AppInput from '@/components/common/AppInput.vue'
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
  submitting.value = true
  try {
    const order = await run((onUploadProgress) =>
      ordersStore.createOrder({ labTestIds: selectedIds.value, note: note.value, file: file.value }, onUploadProgress),
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
