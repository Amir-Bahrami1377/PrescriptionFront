<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useToast } from 'vue-toastification'
import * as adminApi from '@/api/adminApi'
import { apiErrorMessage } from '@/lib/apiError'
import { formatDate, formatRials, orderCreatedAt, orderTotal } from '@/lib/format'
import PageHeader from '@/components/common/PageHeader.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppModal from '@/components/common/AppModal.vue'
import DataGrid from '@/components/common/DataGrid.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'

const toast = useToast()
const faNumberFormatter = new Intl.NumberFormat('fa-IR')

const roleLabels = { Doctor: 'پزشک', Admin: 'مدیر', Customer: 'مشتری' }
const roleClass = {
  Admin: 'bg-amber-50 text-amber-700',
  Doctor: 'bg-primary-50 text-primary-700',
  Customer: 'bg-ink-100 text-ink-600',
}
const filters = [
  { value: '', label: 'همه' },
  { value: 'Doctor', label: 'پزشک' },
  { value: 'Admin', label: 'مدیر' },
  { value: 'Customer', label: 'مشتری' },
]

const columns = [
  { key: 'phoneNumber', label: 'شماره موبایل' },
  { key: 'fullName', label: 'نام و نام خانوادگی' },
  { key: 'role', label: 'نقش' },
  { key: 'isSpecialPatient', label: 'بیمار ویژه' },
]

const users = ref([])
const loading = ref(true)
const roleFilter = ref('')
const search = ref('')

const filteredUsers = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return users.value
  return users.value.filter(
    (u) => u.phoneNumber?.includes(q) || u.fullName?.toLowerCase().includes(q),
  )
})

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

// --- order history ---
const orderHistoryOpen = ref(false)
const orderHistoryUser = ref(null)
const orderHistory = ref([])
const orderHistoryLoading = ref(false)
const orderHistoryError = ref('')

const orderHistoryTitle = computed(() => {
  const user = orderHistoryUser.value
  if (!user) return 'تاریخچه سفارشات'
  return `تاریخچه سفارشات ${user.fullName || user.phoneNumber}`
})

function orderTestsLabel(order) {
  const count = order.labTestIds?.length ?? 0
  return count ? `${faNumberFormatter.format(count)} آزمایش` : 'آزمایش'
}

async function fetchOrderHistory() {
  if (!orderHistoryUser.value) return
  orderHistoryLoading.value = true
  orderHistoryError.value = ''
  try {
    orderHistory.value = (await adminApi.listUserOrders(orderHistoryUser.value.id)) ?? []
  } catch (error) {
    orderHistory.value = []
    orderHistoryError.value = apiErrorMessage(error, 'دریافت تاریخچه سفارشات با خطا مواجه شد')
    toast.error(orderHistoryError.value)
  } finally {
    orderHistoryLoading.value = false
  }
}

function openOrderHistory(row) {
  orderHistoryUser.value = row
  orderHistory.value = []
  orderHistoryOpen.value = true
  fetchOrderHistory()
}

// --- add / edit modal (backend upserts staff role by phone number) ---
const modalOpen = ref(false)
const modalMode = ref('create') // create | edit
const saving = ref(false)
const form = reactive({ phoneNumber: '', role: 'Doctor' })

function openCreate() {
  modalMode.value = 'create'
  form.phoneNumber = ''
  form.role = 'Doctor'
  modalOpen.value = true
}

function openEdit(row) {
  modalMode.value = 'edit'
  form.phoneNumber = row.phoneNumber
  // Editing means promoting/switching staff role; default staff picks when the current role is Customer.
  form.role = row.role === 'Admin' ? 'Admin' : 'Doctor'
  modalOpen.value = true
}

async function save() {
  if (modalMode.value === 'create' && !/^09\d{9}$/.test(form.phoneNumber.trim())) {
    toast.warning('شماره موبایل معتبر نیست')
    return
  }
  saving.value = true
  try {
    await adminApi.createOrUpdateStaffUser({ phoneNumber: form.phoneNumber.trim(), role: form.role })
    toast.success('نقش کاربر با موفقیت ثبت شد')
    modalOpen.value = false
    await load()
  } catch (error) {
    toast.error(apiErrorMessage(error, 'ثبت کاربر با خطا مواجه شد'))
  } finally {
    saving.value = false
  }
}

/**
 * Opening renewals takes effect straight away — the backend authorizes each renewal call against
 * the database, so the patient doesn't have to sign in again for the change to apply.
 */
const togglingId = ref(null)

async function toggleSpecialPatient(row) {
  togglingId.value = row.id
  const next = !row.isSpecialPatient
  try {
    await adminApi.setSpecialPatient(row.id, next)
    row.isSpecialPatient = next
    toast.success(next ? 'دسترسی تمدید نسخه فعال شد' : 'دسترسی تمدید نسخه لغو شد')
  } catch (error) {
    toast.error(apiErrorMessage(error, 'تغییر دسترسی تمدید نسخه با خطا مواجه شد'))
  } finally {
    togglingId.value = null
  }
}

// --- delete confirm ---
const deleteTarget = ref(null)
const deleting = ref(false)

async function doDelete() {
  deleting.value = true
  try {
    await adminApi.deleteUser(deleteTarget.value.id)
    toast.success('کاربر حذف شد')
    deleteTarget.value = null
    await load()
  } catch (error) {
    toast.error(apiErrorMessage(error, 'حذف کاربر با خطا مواجه شد'))
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <PageHeader title="مدیریت کاربران" subtitle="برای شماره‌ای که قبلاً ثبت‌نام کرده، نقش جدید جایگزین نقش قبلی می‌شود" />

  <DataGrid :columns="columns" :rows="filteredUsers" :loading="loading" empty-text="کاربری یافت نشد">
    <template #toolbar>
      <div class="space-y-3">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="sm:w-72">
            <AppInput v-model="search" placeholder="جستجوی شماره یا نام…" dir="rtl" />
          </div>
          <AppButton @click="openCreate">افزودن پزشک یا مدیر</AppButton>
        </div>

        <div class="flex gap-1.5 overflow-x-auto">
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
      </div>
    </template>

    <template #cell-phoneNumber="{ value }">
      <span class="font-data" dir="ltr">{{ value }}</span>
    </template>

    <template #cell-fullName="{ value }">
      <span :class="value ? 'text-ink-800' : 'text-ink-300'">{{ value || '—' }}</span>
    </template>

    <template #cell-role="{ value }">
      <span class="rounded-full px-3 py-1 text-xs font-medium" :class="roleClass[value] ?? 'bg-ink-100 text-ink-600'">
        {{ roleLabels[value] ?? value }}
      </span>
    </template>

    <template #cell-isSpecialPatient="{ row }">
      <span v-if="row.role !== 'Customer'" class="text-ink-300">—</span>
      <button
        v-else
        type="button"
        class="rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50"
        :class="row.isSpecialPatient ? 'bg-primary-50 text-primary-700 hover:bg-primary-100' : 'bg-ink-100 text-ink-500 hover:bg-ink-200'"
        :disabled="togglingId === row.id"
        @click="toggleSpecialPatient(row)"
      >
        {{ row.isSpecialPatient ? 'فعال' : 'غیرفعال' }}
      </button>
    </template>

    <template #actions="{ row }">
      <AppButton
        variant="secondary"
        size="sm"
        :loading="orderHistoryLoading && orderHistoryUser?.id === row.id"
        :disabled="orderHistoryLoading"
        @click="openOrderHistory(row)"
      >
        تاریخچه سفارشات
      </AppButton>
      <AppButton variant="ghost" size="sm" @click="openEdit(row)">ویرایش نقش</AppButton>
      <AppButton variant="ghost" size="sm" class="!text-brick-600 hover:!bg-brick-50" @click="deleteTarget = row">حذف</AppButton>
    </template>
  </DataGrid>

  <!-- order history -->
  <AppModal v-model="orderHistoryOpen" :title="orderHistoryTitle">
    <div class="max-h-[65vh] overflow-y-auto pe-1">
      <div v-if="orderHistoryLoading" class="space-y-3" aria-label="در حال دریافت تاریخچه سفارشات">
        <div v-for="i in 3" :key="i" class="h-28 animate-pulse rounded-2xl bg-ink-50" />
      </div>

      <div v-else-if="orderHistoryError" class="rounded-2xl border border-brick-100 bg-brick-50 p-4">
        <p class="text-sm text-brick-700">{{ orderHistoryError }}</p>
        <AppButton variant="ghost" size="sm" class="mt-3 !text-brick-700 hover:!bg-brick-100" @click="fetchOrderHistory">
          تلاش دوباره
        </AppButton>
      </div>

      <EmptyState
        v-else-if="!orderHistory.length"
        title="سفارشی ثبت نشده"
        description="این کاربر هنوز هیچ سفارشی ثبت نکرده است."
      />

      <div v-else class="space-y-3">
        <article
          v-for="order in orderHistory"
          :key="order.id"
          class="rounded-2xl border border-ink-100 bg-paper p-4"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="truncate font-medium text-ink-900">{{ orderTestsLabel(order) }}</p>
              <p class="font-data mt-1 text-xs text-ink-400">{{ formatDate(orderCreatedAt(order)) }}</p>
            </div>
            <StatusBadge :status="order.status" />
          </div>

          <div class="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-ink-100 pt-3">
            <p class="font-data text-sm font-medium text-ink-700">{{ formatRials(orderTotal(order)) }}</p>
            <div v-if="order.isForThirdParty || order.requestsConsultation || order.hasResult" class="flex flex-wrap gap-1.5">
              <span v-if="order.isForThirdParty" class="rounded-full bg-ink-100 px-2.5 py-1 text-xs text-ink-600">برای شخص دیگر</span>
              <span v-if="order.requestsConsultation" class="rounded-full bg-primary-50 px-2.5 py-1 text-xs text-primary-700">با مشاوره</span>
              <span v-if="order.hasResult" class="rounded-full bg-primary-50 px-2.5 py-1 text-xs text-primary-700">نتیجه ثبت شده</span>
            </div>
          </div>
        </article>
      </div>
    </div>

    <template #footer>
      <AppButton variant="ghost" @click="orderHistoryOpen = false">بستن</AppButton>
    </template>
  </AppModal>

  <!-- add / edit -->
  <AppModal v-model="modalOpen" :title="modalMode === 'create' ? 'افزودن پزشک یا مدیر' : 'ویرایش نقش کاربر'">
    <div class="space-y-4">
      <AppInput
        v-model="form.phoneNumber"
        label="شماره موبایل"
        dir="ltr"
        numeric
        placeholder="09xxxxxxxxx"
        :disabled="modalMode === 'edit'"
        :hint="modalMode === 'edit' ? 'شماره موبایل قابل تغییر نیست' : ''"
      />
      <label class="block">
        <span class="mb-1.5 block text-sm font-medium text-ink-700">نقش</span>
        <select
          v-model="form.role"
          class="w-full rounded-xl border border-ink-100 bg-surface px-3.5 py-2.5 text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="Doctor">پزشک</option>
          <option value="Admin">مدیر</option>
        </select>
      </label>
    </div>
    <template #footer>
      <AppButton variant="ghost" @click="modalOpen = false">انصراف</AppButton>
      <AppButton :loading="saving" @click="save">{{ modalMode === 'create' ? 'ثبت کاربر' : 'ذخیره نقش' }}</AppButton>
    </template>
  </AppModal>

  <!-- delete confirm -->
  <AppModal :model-value="!!deleteTarget" title="حذف کاربر" @update:model-value="deleteTarget = null">
    <p class="text-sm text-ink-600">
      آیا از حذف کاربر با شماره
      <span class="font-data font-medium text-ink-900" dir="ltr">{{ deleteTarget?.phoneNumber }}</span>
      مطمئن هستید؟ این عمل قابل بازگشت نیست.
    </p>
    <template #footer>
      <AppButton variant="ghost" @click="deleteTarget = null">انصراف</AppButton>
      <AppButton variant="danger" :loading="deleting" @click="doDelete">حذف</AppButton>
    </template>
  </AppModal>
</template>
