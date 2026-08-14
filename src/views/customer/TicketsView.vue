<script setup>
import { computed, onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import * as ticketingApi from '@/api/ticketingApi'
import { useTicketStore } from '@/stores/ticketStore'
import { useTicketDeadlineRefresh } from '@/composables/useTicketDeadlineRefresh'
import { apiErrorMessage } from '@/lib/apiError'
import { formatDate } from '@/lib/format'
import { isTicketStatus, ticketLastActivityAt } from '@/lib/ticket'
import PageHeader from '@/components/common/PageHeader.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import TicketConversation from '@/components/common/TicketConversation.vue'
import TicketStatusBadge from '@/components/common/TicketStatusBadge.vue'

const SUBJECT_MAX_LENGTH = 300
const MESSAGE_MAX_LENGTH = 4000
const faNumberFormatter = new Intl.NumberFormat('fa-IR')

const toast = useToast()
const ticketStore = useTicketStore()
const loading = ref(true)
const listError = ref('')
const showNewForm = ref(false)
const creating = ref(false)
const subject = ref('')
const message = ref('')

const selectedId = ref(null)
const selectedTicket = ref(null)
const loadingDetail = ref(false)
const detailError = ref('')
const replyMessage = ref('')
const replying = ref(false)
const closing = ref(false)
const reopening = ref(false)

const isClosed = computed(() => isTicketStatus(selectedTicket.value, 'Closed'))
const isPendingClosure = computed(() => isTicketStatus(selectedTicket.value, 'PendingClosure'))
const ticketsForDeadlineRefresh = computed(() => ticketStore.myTickets)

async function loadTickets({ quiet = false } = {}) {
  listError.value = ''
  try {
    await ticketStore.fetchMyTickets()
  } catch (error) {
    listError.value = apiErrorMessage(error, 'دریافت تیکت‌ها با خطا مواجه شد')
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

async function retryTicketList() {
  loading.value = true
  try {
    await loadTickets()
  } catch {
    // loadTickets already presents the actionable error.
  } finally {
    loading.value = false
  }
}

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

async function createTicket() {
  const cleanSubject = subject.value.trim()
  const cleanMessage = message.value.trim()
  if (!cleanSubject || !cleanMessage) {
    toast.warning('موضوع و پیام را وارد کنید')
    return
  }
  if (cleanSubject.length > SUBJECT_MAX_LENGTH || cleanMessage.length > MESSAGE_MAX_LENGTH) {
    toast.warning('موضوع یا پیام از حد مجاز طولانی‌تر است')
    return
  }

  creating.value = true
  try {
    await ticketStore.createTicket({ subject: cleanSubject, message: cleanMessage })
    subject.value = ''
    message.value = ''
    showNewForm.value = false
    toast.success('تیکت ثبت شد')
  } catch (error) {
    toast.error(apiErrorMessage(error, 'ثبت تیکت با خطا مواجه شد'))
  } finally {
    creating.value = false
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
    toast.success('پاسخ ارسال شد')
  } catch (error) {
    toast.error(apiErrorMessage(error, 'ارسال پاسخ با خطا مواجه شد'))
  } finally {
    replying.value = false
  }
}

async function closeTicket() {
  closing.value = true
  try {
    await ticketingApi.closeTicket(selectedId.value)
    await refreshTicketState()
    toast.success('تیکت بسته شد')
  } catch (error) {
    toast.error(apiErrorMessage(error, 'بستن تیکت با خطا مواجه شد'))
  } finally {
    closing.value = false
  }
}

async function reopenTicket() {
  reopening.value = true
  try {
    await ticketingApi.reopenTicket(selectedId.value)
    await refreshTicketState()
    toast.success('تیکت دوباره باز شد')
  } catch (error) {
    toast.error(apiErrorMessage(error, 'بازکردن مجدد تیکت با خطا مواجه شد'))
  } finally {
    reopening.value = false
  }
}
</script>

<template>
  <div v-if="!selectedId">
    <PageHeader title="پشتیبانی" subtitle="درخواست خود را ثبت کنید و پاسخ پشتیبانی را همین‌جا پیگیری کنید.">
      <template #action>
        <AppButton size="sm" @click="showNewForm = !showNewForm">{{ showNewForm ? 'انصراف' : 'تیکت جدید' }}</AppButton>
      </template>
    </PageHeader>

    <form v-if="showNewForm" class="mb-6 space-y-3 rounded-2xl border border-ink-100 bg-surface p-4" @submit.prevent="createTicket">
      <AppInput v-model="subject" label="موضوع" :max-length="SUBJECT_MAX_LENGTH" />
      <div>
        <AppInput v-model="message" as="textarea" :rows="5" label="پیام" :max-length="MESSAGE_MAX_LENGTH" />
        <p class="font-data mt-1 text-xs text-ink-400">{{ faNumberFormatter.format(message.length) }} / ۴٬۰۰۰</p>
      </div>
      <AppButton type="submit" block :loading="creating">ارسال تیکت</AppButton>
    </form>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="h-24 animate-pulse rounded-2xl bg-ink-50" />
    </div>

    <div v-else-if="listError" class="rounded-2xl border border-brick-100 bg-brick-50 p-4">
      <p class="text-sm text-brick-700">{{ listError }}</p>
      <AppButton variant="ghost" size="sm" class="mt-3 !text-brick-700 hover:!bg-brick-100" @click="retryTicketList">
        تلاش دوباره
      </AppButton>
    </div>

    <EmptyState
      v-else-if="!ticketStore.myTickets.length"
      title="تیکتی ثبت نشده"
      description="در صورت نیاز به راهنمایی، تیکت جدید ایجاد کنید."
    />

    <div v-else class="space-y-3">
      <button
        v-for="ticket in ticketStore.myTickets"
        :key="ticket.id"
        type="button"
        class="block w-full rounded-2xl border border-ink-100 bg-surface p-4 text-start transition-colors hover:border-primary-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        @click="openTicket(ticket.id)"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="truncate font-medium text-ink-900">{{ ticket.subject }}</p>
            <p class="font-data mt-1 text-xs text-ink-400">آخرین تغییر: {{ formatDate(ticketLastActivityAt(ticket)) }}</p>
          </div>
          <TicketStatusBadge :status="ticket.status" />
        </div>
        <div class="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-ink-50 pt-3 text-xs text-ink-500">
          <span>{{ faNumberFormatter.format(ticket.messageCount ?? 0) }} پیام</span>
          <span v-if="isTicketStatus(ticket, 'PendingClosure') && ticket.autoCloseAtUtc" class="text-amber-700">
            مهلت پاسخ: {{ formatDate(ticket.autoCloseAtUtc) }}
          </span>
        </div>
      </button>
    </div>
  </div>

  <div v-else>
    <button type="button" class="mb-4 text-sm font-medium text-primary-600 hover:text-primary-700" @click="returnToList">
      ← بازگشت به فهرست تیکت‌ها
    </button>

    <PageHeader :title="selectedTicket?.subject ?? 'تیکت'">
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

    <div v-else-if="selectedTicket" class="space-y-5">
      <div v-if="isPendingClosure" class="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <p class="font-medium">این تیکت در انتظار بسته‌شدن است.</p>
        <p class="mt-1">
          تا {{ formatDate(selectedTicket.autoCloseAtUtc) }} فرصت دارید پاسخ دهید؛ با ارسال پاسخ، تیکت دوباره باز می‌شود.
        </p>
      </div>

      <div v-else-if="isClosed" class="rounded-2xl border border-ink-100 bg-ink-50 p-4 text-sm text-ink-600">
        این گفتگو بسته شده است. برای ادامه، تیکت را دوباره باز کنید.
      </div>

      <TicketConversation :ticket="selectedTicket" viewer-role="Customer" />

      <form v-if="!isClosed" class="space-y-2 border-t border-ink-100 pt-5" @submit.prevent="sendReply">
        <AppInput
          v-model="replyMessage"
          as="textarea"
          :rows="4"
          :max-length="MESSAGE_MAX_LENGTH"
          label="پاسخ شما"
          placeholder="پاسخ خود را بنویسید…"
        />
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="font-data text-xs text-ink-400">{{ faNumberFormatter.format(replyMessage.length) }} / ۴٬۰۰۰</span>
          <div class="flex gap-2">
            <AppButton variant="ghost" class="!text-brick-600 hover:!bg-brick-50" :loading="closing" @click="closeTicket">
              بستن تیکت
            </AppButton>
            <AppButton type="submit" :loading="replying">ارسال پاسخ</AppButton>
          </div>
        </div>
      </form>

      <div v-else class="flex justify-end border-t border-ink-100 pt-5">
        <AppButton :loading="reopening" @click="reopenTicket">بازکردن مجدد تیکت</AppButton>
      </div>
    </div>
  </div>
</template>
