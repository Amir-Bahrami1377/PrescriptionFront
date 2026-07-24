<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  options: { type: Array, required: true }, // [{ value, label }]
  error: { type: String, default: '' },
})
defineEmits(['update:modelValue'])
</script>

<template>
  <label class="block">
    <span v-if="label" class="mb-1.5 block text-sm font-medium text-ink-700">{{ label }}</span>
    <select
      :value="modelValue"
      class="w-full rounded-xl border bg-surface px-3.5 py-2.5 text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
      :class="error ? 'border-brick-400' : 'border-ink-100'"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
    <span v-if="error" class="mt-1.5 block text-sm text-brick-600">{{ error }}</span>
  </label>
</template>
