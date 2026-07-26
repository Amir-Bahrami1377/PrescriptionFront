<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Number, required: true }, // current page (1-based)
  totalPages: { type: Number, required: true },
})
const emit = defineEmits(['update:modelValue'])

const faNum = (n) => new Intl.NumberFormat('fa-IR').format(n)

function go(page) {
  const clamped = Math.min(Math.max(page, 1), props.totalPages)
  if (clamped !== props.modelValue) emit('update:modelValue', clamped)
}

// Windowed page list: show first, last, current ±1, with '…' gaps for anything longer than 7 pages.
const pages = computed(() => {
  const total = props.totalPages
  const current = props.modelValue
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const set = new Set([1, total, current, current - 1, current + 1])
  const sorted = [...set].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)

  const result = []
  let prev = 0
  for (const p of sorted) {
    if (p - prev > 1) result.push('…')
    result.push(p)
    prev = p
  }
  return result
})
</script>

<template>
  <nav v-if="totalPages > 1" class="flex items-center justify-center gap-1.5">
    <button
      type="button"
      class="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:text-ink-300"
      :disabled="modelValue === 1"
      @click="go(modelValue - 1)"
    >
      قبلی
    </button>

    <template v-for="(p, i) in pages" :key="i">
      <span v-if="p === '…'" class="px-1.5 text-sm text-ink-400">…</span>
      <button
        v-else
        type="button"
        class="font-data min-w-9 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors"
        :class="p === modelValue ? 'bg-primary-600 text-white' : 'text-ink-600 hover:bg-ink-50'"
        @click="go(p)"
      >
        {{ faNum(p) }}
      </button>
    </template>

    <button
      type="button"
      class="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:text-ink-300"
      :disabled="modelValue === totalPages"
      @click="go(modelValue + 1)"
    >
      بعدی
    </button>
  </nav>
</template>
