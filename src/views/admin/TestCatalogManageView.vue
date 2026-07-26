<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useToast } from 'vue-toastification'
import * as catalogApi from '@/api/catalogApi'
import { apiErrorMessage } from '@/lib/apiError'
import PageHeader from '@/components/common/PageHeader.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppModal from '@/components/common/AppModal.vue'
import DataGrid from '@/components/common/DataGrid.vue'

const toast = useToast()
const tests = ref([])
const loading = ref(true)
const search = ref('')

const columns = [
  { key: 'name', label: 'نام آزمایش' },
  { key: 'description', label: 'توضیحات' },
]

const filteredTests = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return tests.value
  return tests.value.filter(
    (t) => t.name?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q),
  )
})

async function load() {
  loading.value = true
  try {
    tests.value = (await catalogApi.listTests()) ?? []
  } catch {
    toast.error('دریافت فهرست آزمایش‌ها با خطا مواجه شد')
  } finally {
    loading.value = false
  }
}
onMounted(load)

// --- add / edit modal ---
const modalOpen = ref(false)
const modalMode = ref('create') // create | edit
const saving = ref(false)
const form = reactive({ id: null, name: '', description: '' })

function openCreate() {
  modalMode.value = 'create'
  form.id = null
  form.name = ''
  form.description = ''
  modalOpen.value = true
}

function openEdit(row) {
  modalMode.value = 'edit'
  form.id = row.id
  form.name = row.name
  form.description = row.description ?? ''
  modalOpen.value = true
}

async function save() {
  if (!form.name.trim()) {
    toast.warning('نام آزمایش را وارد کنید')
    return
  }
  saving.value = true
  try {
    const payload = { name: form.name.trim(), description: form.description.trim() || null }
    if (modalMode.value === 'create') {
      await catalogApi.createTest(payload)
      toast.success('آزمایش جدید ثبت شد')
    } else {
      // The list only ever returns active tests, so any row we edit here is active.
      await catalogApi.updateTest(form.id, { ...payload, isActive: true })
      toast.success('تغییرات ذخیره شد')
    }
    modalOpen.value = false
    await load()
  } catch (error) {
    toast.error(apiErrorMessage(error, 'ذخیره آزمایش با خطا مواجه شد'))
  } finally {
    saving.value = false
  }
}

// --- delete confirm ---
const deleteTarget = ref(null)
const deleting = ref(false)

async function doDelete() {
  deleting.value = true
  try {
    await catalogApi.deleteTest(deleteTarget.value.id)
    toast.success('آزمایش حذف شد')
    deleteTarget.value = null
    await load()
  } catch (error) {
    toast.error(apiErrorMessage(error, 'حذف آزمایش با خطا مواجه شد'))
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <PageHeader
    title="مدیریت کاتالوگ آزمایش‌ها"
    subtitle="کاتالوگ فقط برای انتخاب نوع آزمایش است؛ هزینه ویزیت را هر پزشک از پنل خودش تنظیم می‌کند."
  />

  <DataGrid
    :columns="columns"
    :rows="filteredTests"
    :loading="loading"
    empty-text="آزمایشی یافت نشد"
  >
    <template #toolbar>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="sm:w-72">
          <AppInput v-model="search" placeholder="جستجوی نام یا توضیحات…" />
        </div>
        <AppButton @click="openCreate">افزودن آزمایش</AppButton>
      </div>
    </template>

    <template #cell-description="{ value }">
      <span :class="value ? 'text-ink-600' : 'text-ink-300'">{{ value || '—' }}</span>
    </template>

    <template #actions="{ row }">
      <AppButton variant="ghost" size="sm" @click="openEdit(row)">ویرایش</AppButton>
      <AppButton variant="ghost" size="sm" class="!text-brick-600 hover:!bg-brick-50" @click="deleteTarget = row">حذف</AppButton>
    </template>
  </DataGrid>

  <!-- add / edit -->
  <AppModal v-model="modalOpen" :title="modalMode === 'create' ? 'افزودن آزمایش جدید' : 'ویرایش آزمایش'">
    <div class="space-y-4">
      <AppInput v-model="form.name" label="نام آزمایش" />
      <AppInput v-model="form.description" as="textarea" :rows="3" label="توضیحات (اختیاری)" />
    </div>
    <template #footer>
      <AppButton variant="ghost" @click="modalOpen = false">انصراف</AppButton>
      <AppButton :loading="saving" @click="save">{{ modalMode === 'create' ? 'افزودن' : 'ذخیره تغییرات' }}</AppButton>
    </template>
  </AppModal>

  <!-- delete confirm -->
  <AppModal :model-value="!!deleteTarget" title="حذف آزمایش" @update:model-value="deleteTarget = null">
    <p class="text-sm text-ink-600">
      آیا از حذف «<span class="font-medium text-ink-900">{{ deleteTarget?.name }}</span>» مطمئن هستید؟ این عمل قابل بازگشت نیست.
    </p>
    <template #footer>
      <AppButton variant="ghost" @click="deleteTarget = null">انصراف</AppButton>
      <AppButton variant="danger" :loading="deleting" @click="doDelete">حذف</AppButton>
    </template>
  </AppModal>
</template>
