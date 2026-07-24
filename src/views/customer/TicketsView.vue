<script setup>
import { onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import * as ticketingApi from '@/api/ticketingApi'
import { useTicketStore } from '@/stores/ticketStore'
import PageHeader from '@/components/common/PageHeader.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { formatDate } from '@/lib/format'

const toast = useToast()
const ticketStore = useTicketStore()
const loading = ref(true)
const showNewForm = ref(false)
const creating = ref(false)
const subject = ref('')
const message = ref('')

const selectedId = ref(null)
const selectedTicket = ref(null)
const loadingDetail = ref(false)
const replyMessage = ref('')
const replying = ref(false)

onMounted(async () => {
  try {
    await ticketStore.fetchMyTickets()
  } catch {
    toast.error('دریافت تیکت‌ها با خطا مواجه شد')
  } finally {
    loading.value = false
  }
})

async function createTicket() {
  if (!subject.value.trim() || !message.value.trim()) {
    toast.warning('موضوع و پیام را وارد کنید')
    return
  }
  creating.value = true
  try {
    await ticketStore.createTicket({ subject: subject.value, message: message.value })
    subject.value = ''
    message.value = ''
    showNewForm.value = false
    toast.success('تیکت ثبت شد')
  } catch {
    toast.error('ثبت تیکت با خطا مواجه شد')
  } finally {
    creating.value = false
  }
}

async function openTicket(id) {
  selectedId.value = id
  loadingDetail.value = true
  try {
    selectedTicket.value = await ticketingApi.getTicket(id)
  } catch {
    toast.error('دریافت جزئیات تیکت با خطا مواجه شد')
  } finally {
    loadingDetail.value = false
  }
}

async function sendReply() {
  if (!replyMessage.value.trim()) return
  replying.value = true
  try {
    await ticketingApi.replyTicket(selectedId.value, replyMessage.value)
    replyMessage.value = ''
    await openTicket(selectedId.value)
  } catch {
    toast.error('ارسال پاسخ با خطا مواجه شد')
  } finally {
    replying.value = false
  }
}

async function close() {
  try {
    await ticketingApi.closeTicket(selectedId.value)
    toast.success('تیکت بسته شد')
    await Promise.all([openTicket(selectedId.value), ticketStore.fetchMyTickets()])
  } catch {
    toast.error('بستن تیکت با خطا مواجه شد')
  }
}
</script>

<template>
  <div v-if="!selectedId">
    <PageHeader title="پشتیبانی">
      <template #action>
        <AppButton size="sm" @click="showNewForm = !showNewForm">{{ showNewForm ? 'انصراف' : 'تیکت جدید' }}</AppButton>
      </template>
    </PageHeader>

    <div v-if="showNewForm" class="mb-6 space-y-3 rounded-2xl border border-ink-100 bg-surface p-4">
      <AppInput v-model="subject" label="موضوع" />
      <AppInput v-model="message" as="textarea" label="پیام" />
      <AppButton block :loading="creating" @click="createTicket">ارسال تیکت</AppButton>
    </div>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="h-16 animate-pulse rounded-2xl bg-ink-50" />
    </div>

    <EmptyState v-else-if="!ticketStore.myTickets.length" title="تیکتی ثبت نشده" description="در صورت نیاز به راهنمایی، تیکت جدید ایجاد کنید." />

    <div v-else class="space-y-3">
      <button
        v-for="ticket in ticketStore.myTickets"
        :key="ticket.id"
        type="button"
        class="block w-full rounded-2xl border border-ink-100 bg-surface p-4 text-start transition-colors hover:border-primary-200"
        @click="openTicket(ticket.id)"
      >
        <div class="flex items-center justify-between gap-3">
          <p class="font-medium text-ink-900">{{ ticket.subject }}</p>
          <span
            class="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium"
            :class="ticket.status === 'closed' || ticket.isClosed ? 'bg-ink-100 text-ink-500' : 'bg-primary-50 text-primary-700'"
          >
            {{ ticket.status === 'closed' || ticket.isClosed ? 'بسته شده' : 'باز' }}
          </span>
        </div>
        <p class="font-data mt-1 text-xs text-ink-400">{{ formatDate(ticket.createdAt) }}</p>
      </button>
    </div>
  </div>

  <div v-else>
    <button type="button" class="mb-4 text-sm font-medium text-primary-600" @click="selectedId = null">← بازگشت به فهرست تیکت‌ها</button>
    <PageHeader :title="selectedTicket?.subject ?? 'تیکت'" />

    <div v-if="loadingDetail" class="h-40 animate-pulse rounded-2xl bg-ink-50" />

    <div v-else-if="selectedTicket" class="space-y-4">
      <div class="space-y-3">
        <div
          v-for="(msg, i) in selectedTicket.messages ?? selectedTicket.replies ?? []"
          :key="i"
          class="rounded-2xl border border-ink-100 bg-surface p-3.5"
        >
          <p class="text-sm text-ink-800">{{ msg.message ?? msg.text }}</p>
          <p class="font-data mt-1.5 text-xs text-ink-400">{{ formatDate(msg.createdAt) }}</p>
        </div>
        <div v-if="!(selectedTicket.messages ?? selectedTicket.replies ?? []).length" class="rounded-2xl border border-ink-100 bg-surface p-3.5">
          <p class="text-sm text-ink-800">{{ selectedTicket.message }}</p>
        </div>
      </div>

      <div v-if="!(selectedTicket.status === 'closed' || selectedTicket.isClosed)" class="space-y-2">
        <AppInput v-model="replyMessage" as="textarea" placeholder="پاسخ خود را بنویسید…" />
        <div class="flex gap-2">
          <AppButton :loading="replying" @click="sendReply">ارسال پاسخ</AppButton>
          <AppButton variant="ghost" @click="close">بستن تیکت</AppButton>
        </div>
      </div>
    </div>
  </div>
</template>
