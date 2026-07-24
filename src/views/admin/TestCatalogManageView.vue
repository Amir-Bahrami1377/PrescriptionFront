<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useToast } from 'vue-toastification'
import * as catalogApi from '@/api/catalogApi'
import { apiErrorMessage } from '@/lib/apiError'
import PageHeader from '@/components/common/PageHeader.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const toast = useToast()
const tests = ref([])
const loading = ref(true)
const creating = ref(false)
const savingId = ref(null)
const edits = reactive({})

const newTest = reactive({ name: '', description: '' })

async function load() {
  loading.value = true
  try {
    tests.value = (await catalogApi.listTests()) ?? []
    for (const t of tests.value) {
      edits[t.id] = { name: t.name, description: t.description ?? '', isActive: t.isActive ?? true }
    }
  } catch {
    toast.error('دریافت فهرست آزمایش‌ها با خطا مواجه شد')
  } finally {
    loading.value = false
  }
}
onMounted(load)

async function createTest() {
  if (!newTest.name.trim()) {
    toast.warning('نام آزمایش را وارد کنید')
    return
  }
  creating.value = true
  try {
    await catalogApi.createTest({ name: newTest.name.trim(), description: newTest.description.trim() || null })
    newTest.name = ''
    newTest.description = ''
    toast.success('آزمایش جدید ثبت شد')
    await load()
  } catch (error) {
    toast.error(apiErrorMessage(error, 'ثبت آزمایش با خطا مواجه شد'))
  } finally {
    creating.value = false
  }
}

async function saveTest(id) {
  savingId.value = id
  try {
    const payload = edits[id]
    await catalogApi.updateTest(id, { name: payload.name, description: payload.description || null, isActive: payload.isActive })
    toast.success('تغییرات ذخیره شد')
  } catch (error) {
    toast.error(apiErrorMessage(error, 'ذخیره تغییرات با خطا مواجه شد'))
  } finally {
    savingId.value = null
  }
}
</script>

<template>
  <PageHeader title="مدیریت کاتالوگ آزمایش‌ها" subtitle="کاتالوگ فقط برای انتخاب نوع آزمایش است؛ هزینه ویزیت را هر پزشک از پنل خودش تنظیم می‌کند." />

  <div class="mb-6 rounded-2xl border border-ink-100 bg-surface p-4">
    <h2 class="mb-3 font-bold text-ink-900">افزودن آزمایش جدید</h2>
    <div class="grid gap-3 sm:grid-cols-2">
      <AppInput v-model="newTest.name" label="نام آزمایش" />
      <AppInput v-model="newTest.description" label="توضیحات (اختیاری)" />
    </div>
    <AppButton class="mt-4" :loading="creating" @click="createTest">افزودن آزمایش</AppButton>
  </div>

  <div v-if="loading" class="space-y-3">
    <div v-for="i in 3" :key="i" class="h-24 animate-pulse rounded-2xl bg-ink-50" />
  </div>

  <EmptyState v-else-if="!tests.length" title="آزمایشی در کاتالوگ ثبت نشده" />

  <div v-else class="space-y-3">
    <div v-for="test in tests" :key="test.id" class="rounded-2xl border border-ink-100 bg-surface p-4">
      <div class="grid gap-3 sm:grid-cols-2">
        <AppInput v-model="edits[test.id].name" label="نام" />
        <AppInput v-model="edits[test.id].description" label="توضیحات" />
      </div>
      <div class="mt-3 flex items-center justify-between">
        <label class="flex items-center gap-2 text-sm text-ink-600">
          <input v-model="edits[test.id].isActive" type="checkbox" class="size-4 rounded border-ink-300 text-primary-600 focus:ring-primary-500" />
          فعال در کاتالوگ
        </label>
        <AppButton size="sm" :loading="savingId === test.id" @click="saveTest(test.id)">ذخیره تغییرات</AppButton>
      </div>
    </div>
  </div>
</template>
