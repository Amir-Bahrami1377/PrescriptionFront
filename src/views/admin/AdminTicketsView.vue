<script setup>
import { computed, onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import * as ticketingApi from '@/api/ticketingApi'
import { useTicketDeadlineRefresh } from '@/composables/useTicketDeadlineRefresh'
import { apiErrorMessage } from '@/lib/apiError'
import { formatDate } from '@/lib/format'
import { isTicketStatus, ticketLastActivityAt } from '@/lib/ticket'
import PageHeader from '@/components/common/PageHeader.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppInput from '@/components/common/AppInput.vue'
import DataGrid from '@/components/common/DataGrid.vue'
import TicketConversation from '@/components/common/TicketConversation.vue'
import TicketStatusBadge from '@/components/common/TicketStatusBadge.vue'

const MESSAGE_MAX_LENGTH = 4000
const faNumberFormatter = new Intl.NumberFormat('fa-IR')

const filters = [
  { value: '', label: 'همه' },
  { value: 'Open', label: 'باز' },
  { value: 'PendingClosure', label: 'در انتظار بسته‌شدن' },
  { value: 'Closed', label: 'بسته‌شده' },
]

const columns = [
  { key: 'subject', label: 'موضوع' },
  { key: 'customerId', label: 'شناسه مشتری' },
  { key: 'status', label: 'وضعیت' },
  { key: 'messageCount', label: 'پیام‌ها' },
  { key: 'updatedAtUtc', label: 'آخرین تغییر' },
]

const toast = useToast()
const tickets = ref([])
const loading = ref(true)
const listError = ref('')
const statusFilter = ref('')
const search = ref('')

const selectedId = ref(null)
const selectedTicket = ref(null)
const loadingDetail = ref(false)
const detailError = ref('')
const replyMessage = ref('')
const replying = ref(false)
const queueingClosure = ref(false)

const isClosed = computed(() => isTicketStatus(selectedTicket.value, 'Closed'))
const isOpen = computed(() => isTicketStatus(selectedTicket.value, 'Open'))
const isPendingClosure = computed(() => isTicketStatus(selectedTicket.value, 'PendingClosure'))

const filteredTickets = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return tickets.value
  return tickets.value.filter(
    (ticket) => ticket.subject?.toLowerCase().includes(query) || ticket.customerId?.toLowerCase().includes(query),
  )
})

const ticketsForDeadlineRefresh = computed(() => {
  if (!selectedTicket.value || tickets.value.some((ticket) => ticket.id === selectedTicket.value.id)) return tickets.value
  return [...tickets.value, selectedTicket.value]
})

async function loadTickets({ quiet = false } = {}) {
  listError.value = ''
  try {
    tickets.value = (await ticketingApi.listAdminTickets(statusFilter.value || undefined)) ?? []
  } catch (error) {
    listError.value = apiErrorMessage(error, 'دریافت فهرست تیکت‌ها با خطا مواجه شد')
    if (!quiet) toast.error(listError.value)
    throw error
  }
}

onMounted(async () => {
  try {
    await loadTickets()
  } catch {
    // loadTickets already presents the actionable error.
  } finally {
    loading.value = false
  }
})

async function loadSelectedTicket({ quiet = false } = {}) {
  if (!selectedId.value) return
  loadingDetail.value = true
  detailError.value = ''
  try {
    selectedTicket.value = await ticketingApi.getTicket(selectedId.value)
  } catch (error) {
    detailError.value = apiErrorMessage(error, 'دریافت جزئیات تیکت با خطا مواجه شد')
    if (!quiet) toast.error(detailError.value)
    throw error
  } finally {
    loadingDetail.value = false
  }
}

useTicketDeadlineRefresh(ticketsForDeadlineRefresh, async () => {
  await loadTickets({ quiet: true })
  if (selectedId.value) await loadSelectedTicket({ quiet: true })
})

async function selectFilter(value) {
  statusFilter.value = value
  loading.value = true
  try {
    await loadTickets()
  } catch {
    // loadTickets already presents the actionable error.
  } finally {
    loading.value = false
  }
}

function openTicket(id) {
  selectedId.value = id
  selectedTicket.value = null
  replyMessage.value = ''
  loadSelectedTicket().catch(() => {})
}

function returnToList() {
  selectedId.value = null
  selectedTicket.value = null
  detailError.value = ''
  replyMessage.value = ''
}

async function refreshTicketState() {
  await Promise.all([loadSelectedTicket({ quiet: true }), loadTickets({ quiet: true })])
}

async function sendReply() {
  const cleanMessage = replyMessage.value.trim()
  if (!cleanMessage) {
    toast.warning('متن پاسخ را وارد کنید')
    return
  }
  if (cleanMessage.length > MESSAGE_MAX_LENGTH) {
    toast.warning('پاسخ نمی‌تواند بیشتر از ۴۰۰۰ کاراکتر باشد')
    return
  }

  replying.value = true
  try {
    await ticketingApi.replyTicket(selectedId.value, cleanMessage)
    replyMessage.value = ''
    await refreshTicketState()
    toast.success('پاسخ برای مشتری ارسال شد')
  } catch (error) {
    toast.error(apiErrorMessage(error, 'ارسال پاسخ با خطا مواجه شد'))
  } finally {
    replying.value = false
  }
}

async function queueClosure() {
  queueingClosure.value = true
  try {
    await ticketingApi.queueTicketClosure(selectedId.value)
    await refreshTicketState()
    toast.success('تیکت در صف بسته‌شدن قرار گرفت')
  } catch (error) {
    toast.error(apiErrorMessage(error, 'قرار دادن تیکت در صف بسته‌شدن با خطا مواجه شد'))
  } finally {
    queueingClosure.value = false
  }
}
</script>

<template>
  <div v-if="!selectedId">
    <PageHeader title="تیکت‌های پشتیبانی" subtitle="درخواست‌های مشتریان را پاسخ دهید و پس از حل‌شدن در صف بسته‌شدن قرار دهید." />

    <div v-if="listError && !loading" class="mb-4 rounded-2xl border border-brick-100 bg-brick-50 p-4">
      <p class="text-sm text-brick-700">{{ listError }}</p>
      <AppButton variant="ghost" size="sm" class="mt-3 !text-brick-700 hover:!bg-brick-100" @click="selectFilter(statusFilter)">
        تلاش دوباره
      </AppButton>
    </div>

    <DataGrid v-else :columns="columns" :rows="filteredTickets" :loading="loading" empty-text="تیکتی یافت نشد">
      <template #toolbar>
        <div class="space-y-3">
          <div class="sm:w-80">
            <AppInput v-model="search" placeholder="جست‌وجوی موضوع یا شناسه مشتری…" />
          </div>
          <div class="flex gap-1.5 overflow-x-auto">
            <button
              v-for="filter in filters"
              :key="filter.value"
              type="button"
              class="shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors"
              :class="statusFilter === filter.value ? 'bg-primary-600 text-white' : 'bg-ink-50 text-ink-600 hover:bg-ink-100'"
              @click="selectFilter(filter.value)"
            >
              {{ filter.label }}
            </button>
          </div>
        </div>
      </template>

      <template #cell-subject="{ value }">
        <span class="font-medium text-ink-900">{{ value }}</span>
      </template>

      <template #cell-customerId="{ value }">
        <span class="font-data text-xs" dir="ltr">{{ value }}</span>
      </template>

      <template #cell-status="{ row }">
        <div class="space-y-1.5">
          <TicketStatusBadge :status="row.status" />
          <p v-if="isTicketStatus(row, 'PendingClosure') && row.autoCloseAtUtc" class="text-xs text-amber-700">
            تا {{ formatDate(row.autoCloseAtUtc) }}
          </p>
        </div>
      </template>

      <template #cell-messageCount="{ value }">
        <span class="font-data">{{ faNumberFormatter.format(value ?? 0) }}</span>
      </template>

      <template #cell-updatedAtUtc="{ row }">
        <span class="font-data whitespace-nowrap text-xs">{{ formatDate(ticketLastActivityAt(row)) }}</span>
      </template>

      <template #actions="{ row }">
        <AppButton variant="secondary" size="sm" @click="openTicket(row.id)">مشاهده و پاسخ</AppButton>
      </template>
    </DataGrid>
  </div>

  <div v-else>
    <button type="button" class="mb-4 text-sm font-medium text-primary-600 hover:text-primary-700" @click="returnToList">
      ← بازگشت به صف تیکت‌ها
    </button>

    <PageHeader
      :title="selectedTicket?.subject ?? 'تیکت پشتیبانی'"
      :subtitle="selectedTicket ? `شناسه مشتری: ${selectedTicket.customerId}` : ''"
    >
      <template v-if="selectedTicket" #action>
        <TicketStatusBadge :status="selectedTicket.status" />
      </template>
    </PageHeader>

    <div v-if="loadingDetail" class="space-y-3">
      <div v-for="i in 3" :key="i" class="h-24 animate-pulse rounded-2xl bg-ink-50" />
    </div>

    <div v-else-if="detailError" class="rounded-2xl border border-brick-100 bg-brick-50 p-4">
      <p class="text-sm text-brick-700">{{ detailError }}</p>
      <AppButton variant="ghost" size="sm" class="mt-3 !text-brick-700 hover:!bg-brick-100" @click="loadSelectedTicket().catch(() => {})">
        تلاش دوباره
      </AppButton>
    </div>

    <div v-else-if="selectedTicket" class="mx-auto max-w-3xl space-y-5">
      <div v-if="isPendingClosure" class="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <p class="font-medium">تیکت در صف بسته‌شدن است.</p>
        <p class="mt-1">
          اگر مشتری پاسخ ندهد، پس از {{ formatDate(selectedTicket.autoCloseAtUtc) }} خودکار بسته می‌شود. پاسخ مدیر این مهلت را تغییر نمی‌دهد.
        </p>
      </div>

      <div v-else-if="isClosed" class="rounded-2xl border border-ink-100 bg-ink-50 p-4 text-sm text-ink-600">
        این تیکت بسته شده و تا زمانی که مشتری آن را باز نکند امکان ارسال پاسخ وجود ندارد.
      </div>

      <TicketConversation :ticket="selectedTicket" viewer-role="Admin" />

      <form v-if="!isClosed" class="space-y-2 border-t border-ink-100 pt-5" @submit.prevent="sendReply">
        <AppInput
          v-model="replyMessage"
          as="textarea"
          :rows="5"
          :max-length="MESSAGE_MAX_LENGTH"
          label="پاسخ پشتیبانی"
          placeholder="پاسخ روشن و قابل‌اقدام برای مشتری بنویسید…"
        />
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="font-data text-xs text-ink-400">{{ faNumberFormatter.format(replyMessage.length) }} / ۴٬۰۰۰</span>
          <div class="flex flex-wrap gap-2">
            <AppButton v-if="isOpen" variant="secondary" :loading="queueingClosure" @click="queueClosure">
              قرار دادن در صف بسته‌شدن
            </AppButton>
            <AppButton type="submit" :loading="replying">ارسال پاسخ</AppButton>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
