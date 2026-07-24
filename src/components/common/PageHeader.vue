<script setup>
import { useRouter } from 'vue-router'

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  back: { type: Boolean, default: false },
})
const router = useRouter()
</script>

<template>
  <div class="mb-6 flex items-start justify-between gap-4">
    <div class="flex items-start gap-3">
      <button
        v-if="back"
        type="button"
        class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full text-ink-500 hover:bg-ink-50"
        aria-label="بازگشت"
        @click="router.back()"
      >
        <svg class="size-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12.5 15L7.5 10l5-5" />
        </svg>
      </button>
      <div>
        <h1 class="text-xl font-bold text-ink-900">{{ title }}</h1>
        <p v-if="subtitle" class="mt-0.5 text-sm text-ink-500">{{ subtitle }}</p>
      </div>
    </div>
    <div v-if="$slots.action" class="shrink-0">
      <slot name="action" />
    </div>
  </div>
</template>
