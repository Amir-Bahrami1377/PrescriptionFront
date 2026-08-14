<script setup>
import { toEnglishDigits } from '@/lib/digits'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  as: { type: String, default: 'input' }, // input | textarea
  rows: { type: Number, default: 3 },
  dir: { type: String, default: undefined },
  disabled: { type: Boolean, default: false },
  /**
   * Digits-only field. Sets inputmode on the input itself (a bare `inputmode` attribute would
   * fall through to the wrapping <label> and never reach the control) and rewrites Persian and
   * Arabic-Indic digits to ASCII as they are typed, so a Persian keyboard layout doesn't
   * produce values that fail validation.
   */
  numeric: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

function onInput(event) {
  if (!props.numeric) {
    emit('update:modelValue', event.target.value)
    return
  }
  const normalized = toEnglishDigits(event.target.value)
  // Keep the field showing what we emitted; without this the element can hold on to the
  // original characters when the normalized string matches the current model value.
  if (event.target.value !== normalized) event.target.value = normalized
  emit('update:modelValue', normalized)
}
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
      :disabled="disabled"
      class="w-full rounded-xl border bg-surface px-3.5 py-2.5 text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-400"
      :class="error ? 'border-brick-400' : 'border-ink-100'"
      @input="onInput"
    />
    <input
      v-else
      :type="type"
      :inputmode="numeric ? 'numeric' : undefined"
      :value="modelValue"
      :placeholder="placeholder"
      :dir="dir"
      :disabled="disabled"
      class="w-full rounded-xl border bg-surface px-3.5 py-2.5 text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-400"
      :class="error ? 'border-brick-400' : 'border-ink-100'"
      @input="onInput"
    />
    <span v-if="error" class="mt-1.5 block text-sm text-brick-600">{{ error }}</span>
    <span v-else-if="hint" class="mt-1.5 block text-sm text-ink-500">{{ hint }}</span>
  </label>
</template>
