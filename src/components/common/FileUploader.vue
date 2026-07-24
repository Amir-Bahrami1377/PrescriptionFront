<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: { type: File, default: null },
  accept: { type: String, default: 'image/*,.pdf' },
  label: { type: String, default: 'فایل را بکشید و رها کنید یا انتخاب کنید' },
})
const emit = defineEmits(['update:modelValue'])

const isDragging = ref(false)
const inputEl = ref(null)

const previewUrl = computed(() =>
  props.modelValue && props.modelValue.type.startsWith('image/') ? URL.createObjectURL(props.modelValue) : null,
)

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} بایت`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} کیلوبایت`
  return `${(bytes / (1024 * 1024)).toFixed(1)} مگابایت`
}

function setFile(file) {
  if (file) emit('update:modelValue', file)
}

/**
 * The hidden <input> lives inside this clickable div. A programmatic inputEl.click() fires
 * a real 'click' event that bubbles right back up to this same handler — without this guard
 * it re-triggers inputEl.click() again on its own bubbled event, opening the file dialog
 * repeatedly (compounding with every real click) instead of once.
 */
function openPicker(event) {
  if (event.target === inputEl.value) return
  inputEl.value?.click()
}

function onDrop(event) {
  isDragging.value = false
  setFile(event.dataTransfer.files?.[0])
}

function onChange(event) {
  setFile(event.target.files?.[0])
}

function clear() {
  emit('update:modelValue', null)
  if (inputEl.value) inputEl.value.value = ''
}
</script>

<template>
  <div>
    <div
      v-if="!modelValue"
      class="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors"
      :class="isDragging ? 'border-primary-500 bg-primary-50' : 'border-ink-200 bg-ink-50'"
      @click="openPicker"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
    >
      <svg class="size-8 text-ink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 16V4m0 0L7 9m5-5l5 5M5 20h14" />
      </svg>
      <span class="text-sm text-ink-600">{{ label }}</span>
      <input ref="inputEl" type="file" :accept="accept" class="hidden" @change="onChange" />
    </div>

    <div v-else class="flex items-center gap-3 rounded-2xl border border-ink-100 bg-surface p-3">
      <img v-if="previewUrl" :src="previewUrl" class="size-12 shrink-0 rounded-lg object-cover" alt="" />
      <div v-else class="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
        <svg class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M7 21h10a2 2 0 002-2V9.5L14.5 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium text-ink-900">{{ modelValue.name }}</p>
        <p class="font-data text-xs text-ink-500">{{ formatSize(modelValue.size) }}</p>
      </div>
      <button type="button" class="shrink-0 text-sm text-brick-600 hover:text-brick-700" @click="clear">حذف</button>
    </div>
  </div>
</template>
