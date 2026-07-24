<script setup>
import { onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import * as consultationApi from '@/api/consultationApi'
import PageHeader from '@/components/common/PageHeader.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { formatDate } from '@/lib/format'

const toast = useToast()
const consultations = ref([])
const loading = ref(true)
const selected = ref(null)
const opinion = ref('')
const submitting = ref(false)

async function load() {
  loading.value = true
  try {
    consultations.value = (await consultationApi.listPendingConsultations()) ?? []
  } catch {
    toast.error('دریافت صف مشاوره با خطا مواجه شد')
  } finally {
    loading.value = false
  }
}
onMounted(load)

function open(item) {
  selected.value = item
  opinion.value = ''
}

async function submit() {
  if (!opinion.value.trim()) {
    toast.warning('نظر تخصصی را بنویسید')
    return
  }
  submitting.value = true
  try {
    await consultationApi.submitDoctorOpinion(selected.value.id, opinion.value.trim())
    toast.success('نظر شما ثبت شد')
    selected.value = null
    await load()
  } catch {
    toast.error('ثبت نظر با خطا مواجه شد')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div v-if="!selected">
    <PageHeader title="صف مشاوره" subtitle="درخواست‌های مشاوره در انتظار نظر تخصصی شما" />

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="h-20 animate-pulse rounded-2xl bg-ink-50" />
    </div>

    <EmptyState v-else-if="!consultations.length" title="درخواست مشاوره‌ای در صف نیست" />

    <div v-else class="space-y-3">
      <button
        v-for="item in consultations"
        :key="item.id"
        type="button"
        class="flex w-full items-center gap-3 rounded-2xl border border-ink-100 bg-surface p-4 text-start transition-colors hover:border-primary-200"
        @click="open(item)"
      >
        <img
          v-if="item.photoUrl ?? item.fileUrl"
          :src="item.photoUrl ?? item.fileUrl"
          class="size-14 shrink-0 rounded-xl object-cover"
          alt=""
        />
        <div class="min-w-0 flex-1">
          <p class="truncate font-medium text-ink-900">{{ item.note || 'بدون یادداشت' }}</p>
          <p class="font-data mt-1 text-xs text-ink-400">{{ formatDate(item.createdAt) }}</p>
        </div>
      </button>
    </div>
  </div>

  <div v-else>
    <button type="button" class="mb-4 text-sm font-medium text-primary-600" @click="selected = null">← بازگشت به صف مشاوره</button>
    <PageHeader title="بررسی درخواست مشاوره" />

    <div class="space-y-4">
      <img
        v-if="selected.photoUrl ?? selected.fileUrl"
        :src="selected.photoUrl ?? selected.fileUrl"
        class="max-h-96 w-full rounded-2xl border border-ink-100 object-contain"
        alt=""
      />
      <p v-if="selected.note" class="rounded-xl bg-ink-50 p-3 text-sm text-ink-600">{{ selected.note }}</p>

      <AppInput v-model="opinion" as="textarea" :rows="5" label="نظر تخصصی شما" placeholder="نظر خود را برای مشتری بنویسید…" />
      <AppButton block :loading="submitting" @click="submit">ثبت نظر</AppButton>
    </div>
  </div>
</template>
