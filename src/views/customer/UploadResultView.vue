<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import * as ordersApi from '@/api/ordersApi'
import { useFileUpload } from '@/composables/useFileUpload'
import PageHeader from '@/components/common/PageHeader.vue'
import FileUploader from '@/components/common/FileUploader.vue'
import AppButton from '@/components/common/AppButton.vue'

const { id } = defineProps({ id: { type: String, required: true } })
const router = useRouter()
const toast = useToast()
const { uploading, progress, run } = useFileUpload()

const file = ref(null)

async function submit() {
  if (!file.value) {
    toast.warning('یک فایل انتخاب کنید')
    return
  }
  try {
    await run((onUploadProgress) => ordersApi.uploadTestResult(id, file.value, onUploadProgress))
    toast.success('جواب آزمایش با موفقیت بارگذاری شد')
    router.push({ name: 'order-detail', params: { id } })
  } catch {
    toast.error('بارگذاری فایل با خطا مواجه شد')
  }
}
</script>

<template>
  <PageHeader title="بارگذاری جواب آزمایش" subtitle="فایل جواب آزمایش خود را برای پزشک ارسال کنید" back />

  <div class="space-y-6">
    <FileUploader v-model="file" />
    <p v-if="uploading" class="font-data text-xs text-primary-600">در حال ارسال… {{ progress }}٪</p>
    <AppButton block :loading="uploading" @click="submit">ارسال جواب آزمایش</AppButton>
  </div>
</template>
