<script setup>
import { computed } from 'vue'
import { normalizeOrderStatus } from '@/composables/useOrderStatus'

const props = defineProps({ status: { type: [String, Number], required: true } })
const info = computed(() => normalizeOrderStatus(props.status))

const toneClasses = {
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  primary: 'bg-primary-50 text-primary-700 ring-primary-200',
  brick: 'bg-brick-50 text-brick-700 ring-brick-200',
  ink: 'bg-ink-50 text-ink-700 ring-ink-200',
}
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset"
    :class="toneClasses[info.tone]"
  >
    <span class="size-1.5 rounded-full bg-current" />
    {{ info.label }}
  </span>
</template>
