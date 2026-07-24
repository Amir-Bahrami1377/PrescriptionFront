<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>

<template>
  <div class="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink-200 px-6 py-12 text-center">
    <div class="flex size-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
      <slot name="icon">
        <svg class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </slot>
    </div>
    <p class="font-medium text-ink-900">{{ title }}</p>
    <p v-if="description" class="max-w-sm text-sm text-ink-500">{{ description }}</p>
    <slot name="action" />
  </div>
</template>
