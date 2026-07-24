<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useToast } from 'vue-toastification'
import * as adminApi from '@/api/adminApi'
import { apiErrorMessage } from '@/lib/apiError'
import PageHeader from '@/components/common/PageHeader.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const toast = useToast()

const newUser = reactive({ phoneNumber: '', role: 'Doctor' })
const creating = ref(false)

const roleFilter = ref('')
const filters = [
  { value: '', label: 'همه' },
  { value: 'Doctor', label: 'پزشک' },
  { value: 'Admin', label: 'مدیر' },
  { value: 'Customer', label: 'مشتری' },
]
const roleLabels = { Doctor: 'پزشک', Admin: 'مدیر', Customer: 'مشتری' }

const users = ref([])
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    users.value = (await adminApi.listUsers(roleFilter.value || undefined)) ?? []
  } catch (error) {
    toast.error(apiErrorMessage(error, 'دریافت فهرست کاربران با خطا مواجه شد'))
  } finally {
    loading.value = false
  }
}
onMounted(load)

function selectFilter(value) {
  roleFilter.value = value
  load()
}

async function createOrUpdate() {
  if (!newUser.phoneNumber.trim()) {
    toast.warning('شماره موبایل را وارد کنید')
    return
  }
  creating.value = true
  try {
    await adminApi.createOrUpdateStaffUser({ phoneNumber: newUser.phoneNumber.trim(), role: newUser.role })
    toast.success('نقش کاربر با موفقیت ثبت شد')
    newUser.phoneNumber = ''
    await load()
  } catch (error) {
    toast.error(apiErrorMessage(error, 'ثبت کاربر با خطا مواجه شد'))
  } finally {
    creating.value = false
  }
}
</script>

<template>
  <PageHeader title="مدیریت کاربران" subtitle="برای شماره‌ای که قبلاً ثبت‌نام کرده، نقش جدید جایگزین نقش قبلی می‌شود" />

  <div class="mb-6 rounded-2xl border border-ink-100 bg-surface p-4">
    <h2 class="mb-3 font-bold text-ink-900">افزودن پزشک یا مدیر</h2>
    <div class="grid gap-3 sm:grid-cols-3">
      <AppInput v-model="newUser.phoneNumber" label="شماره موبایل" dir="ltr" placeholder="09xxxxxxxxx" />
      <label class="block">
        <span class="mb-1.5 block text-sm font-medium text-ink-700">نقش</span>
        <select
          v-model="newUser.role"
          class="w-full rounded-xl border border-ink-100 bg-surface px-3.5 py-2.5 text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="Doctor">پزشک</option>
          <option value="Admin">مدیر</option>
        </select>
      </label>
    </div>
    <AppButton class="mt-4" :loading="creating" @click="createOrUpdate">ثبت کاربر</AppButton>
  </div>

  <div class="mb-4 flex gap-1.5 overflow-x-auto">
    <button
      v-for="f in filters"
      :key="f.value"
      type="button"
      class="shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors"
      :class="roleFilter === f.value ? 'bg-primary-600 text-white' : 'bg-ink-50 text-ink-600 hover:bg-ink-100'"
      @click="selectFilter(f.value)"
    >
      {{ f.label }}
    </button>
  </div>

  <div v-if="loading" class="space-y-3">
    <div v-for="i in 3" :key="i" class="h-16 animate-pulse rounded-2xl bg-ink-50" />
  </div>

  <EmptyState v-else-if="!users.length" title="کاربری یافت نشد" />

  <div v-else class="space-y-2">
    <div
      v-for="user in users"
      :key="user.id ?? user.phoneNumber"
      class="flex items-center justify-between rounded-2xl border border-ink-100 bg-surface p-4"
    >
      <div>
        <p class="font-data font-medium text-ink-900" dir="ltr">{{ user.phoneNumber }}</p>
        <p v-if="user.fullName" class="mt-0.5 text-sm text-ink-500">{{ user.fullName }}</p>
      </div>
      <span class="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
        {{ roleLabels[user.role] ?? user.role }}
      </span>
    </div>
  </div>
</template>
