<script setup>
import { computed } from 'vue'
import { formatDate } from '@/lib/format'

const props = defineProps({
  ticket: { type: Object, required: true },
  viewerRole: { type: String, required: true },
})

const messages = computed(() => props.ticket.messages ?? [])

function isOwnMessage(message) {
  return message.senderRole?.toLowerCase() === props.viewerRole.toLowerCase()
}

function senderLabel(message) {
  if (isOwnMessage(message)) return 'شما'
  return message.senderRole === 'Admin' ? 'پشتیبانی' : 'مشتری'
}
</script>

<template>
  <div v-if="messages.length" class="flex flex-col gap-3">
    <article
      v-for="(message, index) in messages"
      :key="`${message.senderId}-${message.createdAtUtc}-${index}`"
      class="w-fit max-w-[88%] rounded-2xl border p-3.5"
      :class="isOwnMessage(message)
        ? 'self-end border-primary-100 bg-primary-50'
        : 'self-start border-ink-100 bg-surface'"
    >
      <div class="mb-1.5 flex items-center justify-between gap-4">
        <span class="text-xs font-medium" :class="isOwnMessage(message) ? 'text-primary-700' : 'text-ink-500'">
          {{ senderLabel(message) }}
        </span>
        <time class="font-data text-[11px] text-ink-400">{{ formatDate(message.createdAtUtc) }}</time>
      </div>
      <p class="whitespace-pre-wrap break-words text-sm leading-7 text-ink-800">{{ message.body }}</p>
    </article>
  </div>

  <div v-else class="rounded-2xl border border-dashed border-ink-200 px-4 py-8 text-center text-sm text-ink-500">
    هنوز پیامی در این تیکت ثبت نشده است.
  </div>
</template>
