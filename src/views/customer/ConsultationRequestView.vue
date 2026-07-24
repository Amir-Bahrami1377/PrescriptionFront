<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import * as consultationApi from '@/api/consultationApi'
import { useFileUpload } from '@/composables/useFileUpload'
import PageHeader from '@/components/common/PageHeader.vue'
import FileUploader from '@/components/common/FileUploader.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'

const { id } = defineProps({ id: { type: String, required: true } })
const router = useRouter()
const toast = useToast()
const { uploading, progress, run } = useFileUpload()

const file = ref(null)
const note = ref('')

async function submit() {
  if (!file.value) {
    toast.warning('عکس نتیجه آزمایش را بارگذاری کنید')
    return
  }
  try {
    await run((onUploadProgress) =>
      consultationApi.requestConsultation({ orderId: id, note: note.value, file: file.value }, onUploadProgress),
    )
    toast.success('درخواست مشاوره ثبت شد')
    router.push({ name: 'order-detail', params: { id } })
  } catch {
    toast.error('ثبت درخواست مشاوره با خطا مواجه شد')
  }
}
</script>

<template>
  <PageHeader title="درخواست مشاوره پزشک" subtitle="عکس نتیجه آزمایش را بارگذاری کنید تا پزشک نظر تخصصی خود را ثبت کند" back />

  <div class="space-y-6">
    <FileUploader v-model="file" accept="image/*" label="عکس جواب آزمایش را بکشید و رها کنید یا انتخاب کنید" />
    <p v-if="uploading" class="font-data text-xs text-primary-600">در حال ارسال… {{ progress }}٪</p>
    <AppInput v-model="note" as="textarea" label="یادداشت برای پزشک (اختیاری)" placeholder="سوال یا توضیح خود را بنویسید…" />
    <AppButton block :loading="uploading" @click="submit">ارسال درخواست مشاوره</AppButton>
  </div>
</template>
