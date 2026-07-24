<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: { type: Array, required: true }, // array of selected ids
  options: { type: Array, required: true }, // [{ id, name, description }]
  loading: { type: Boolean, default: false },
  placeholder: { type: String, default: 'جستجو…' },
  emptyText: { type: String, default: 'موردی یافت نشد' },
})
const emit = defineEmits(['update:modelValue'])

const query = ref('')
const open = ref(false)

const selectedOptions = computed(() => props.options.filter((o) => props.modelValue.includes(o.id)))

const filteredOptions = computed(() => {
  const notSelected = props.options.filter((o) => !props.modelValue.includes(o.id))
  const q = query.value.trim()
  if (!q) return notSelected
  return notSelected.filter((o) => o.name.includes(q) || o.description?.includes(q))
})

function select(id) {
  emit('update:modelValue', [...props.modelValue, id])
  query.value = ''
}

function remove(id) {
  emit('update:modelValue', props.modelValue.filter((x) => x !== id))
}
</script>

<template>
  <div>
    <div v-if="selectedOptions.length" class="mb-2 flex flex-wrap gap-1.5">
      <span
        v-for="opt in selectedOptions"
        :key="opt.id"
        class="inline-flex items-center gap-1 rounded-full bg-primary-50 py-1 pe-1.5 ps-2.5 text-xs font-medium text-primary-700"
      >
        {{ opt.name }}
        <button
          type="button"
          class="flex size-4 items-center justify-center rounded-full text-primary-500 hover:bg-primary-100 hover:text-primary-800"
          :aria-label="`حذف ${opt.name}`"
          @click="remove(opt.id)"
        >
          <svg class="size-2.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" d="M2 2l8 8M10 2l-8 8" />
          </svg>
        </button>
      </span>
    </div>

    <div class="relative">
      <input
        v-model="query"
        type="text"
        :placeholder="placeholder"
        class="w-full rounded-xl border border-ink-100 bg-surface px-3.5 py-2.5 text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
        @focus="open = true"
        @keydown.esc="open = false"
        @blur="open = false"
      />

      <div
        v-if="open"
        class="absolute inset-x-0 top-full z-10 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-ink-100 bg-surface py-1 shadow-lg shadow-ink-900/10"
      >
        <p v-if="loading" class="px-3.5 py-2.5 text-sm text-ink-400">در حال بارگذاری…</p>
        <p v-else-if="!filteredOptions.length" class="px-3.5 py-2.5 text-sm text-ink-400">{{ emptyText }}</p>
        <button
          v-for="opt in filteredOptions"
          :key="opt.id"
          type="button"
          class="block w-full px-3.5 py-2.5 text-start hover:bg-ink-50"
          @mousedown.prevent="select(opt.id)"
        >
          <span class="block text-sm font-medium text-ink-900">{{ opt.name }}</span>
          <span v-if="opt.description" class="block text-xs text-ink-500">{{ opt.description }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
