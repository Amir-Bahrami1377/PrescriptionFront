<script setup>
defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  as: { type: String, default: 'input' }, // input | textarea
  rows: { type: Number, default: 3 },
  dir: { type: String, default: undefined },
})
defineEmits(['update:modelValue'])
</script>

<template>
  <label class="block">
    <span v-if="label" class="mb-1.5 block text-sm font-medium text-ink-700">{{ label }}</span>
    <textarea
      v-if="as === 'textarea'"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      :dir="dir"
      class="w-full rounded-xl border bg-surface px-3.5 py-2.5 text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
      :class="error ? 'border-brick-400' : 'border-ink-100'"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <input
      v-else
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :dir="dir"
      class="w-full rounded-xl border bg-surface px-3.5 py-2.5 text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
      :class="error ? 'border-brick-400' : 'border-ink-100'"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <span v-if="error" class="mt-1.5 block text-sm text-brick-600">{{ error }}</span>
    <span v-else-if="hint" class="mt-1.5 block text-sm text-ink-500">{{ hint }}</span>
  </label>
</template>
