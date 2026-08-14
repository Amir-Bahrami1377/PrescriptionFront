<script setup>
import { computed } from 'vue'
import { ticketStatusInfo } from '@/lib/ticket'

const props = defineProps({ status: { type: String, required: true } })
const info = computed(() => ticketStatusInfo(props.status))

const toneClasses = {
  primary: 'bg-primary-50 text-primary-700 ring-primary-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  ink: 'bg-ink-50 text-ink-600 ring-ink-200',
}
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset"
    :class="toneClasses[info.tone]"
  >
    <span class="size-1.5 rounded-full bg-current" />
    {{ info.label }}
  </span>
</template>
