<script setup>
import { nextTick, ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  length: { type: Number, default: 5 },
})
const emit = defineEmits(['update:modelValue', 'complete'])

const digits = ref(Array.from({ length: props.length }, (_, i) => props.modelValue[i] ?? ''))
const inputs = ref([])

watch(
  () => props.modelValue,
  (val) => {
    if (val === digits.value.join('')) return
    digits.value = Array.from({ length: props.length }, (_, i) => val[i] ?? '')
  },
)

function emitValue() {
  const value = digits.value.join('')
  emit('update:modelValue', value)
  if (value.length === props.length) emit('complete', value)
}

function onInput(index, event) {
  const raw = event.target.value.replace(/\D/g, '')
  if (!raw) {
    digits.value[index] = ''
    emitValue()
    return
  }
  digits.value[index] = raw[raw.length - 1]
  emitValue()
  if (index < props.length - 1) nextTick(() => inputs.value[index + 1]?.focus())
}

function onKeydown(index, event) {
  if (event.key === 'Backspace' && !digits.value[index] && index > 0) {
    inputs.value[index - 1]?.focus()
  }
}

function onPaste(event) {
  const text = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, props.length)
  if (!text) return
  event.preventDefault()
  digits.value = Array.from({ length: props.length }, (_, i) => text[i] ?? '')
  emitValue()
  nextTick(() => inputs.value[Math.min(text.length, props.length - 1)]?.focus())
}
</script>

<template>
  <div class="flex justify-center gap-2" dir="ltr">
    <input
      v-for="(digit, index) in digits"
      :key="index"
      :ref="(el) => (inputs[index] = el)"
      :value="digit"
      inputmode="numeric"
      autocomplete="one-time-code"
      maxlength="1"
      class="font-data size-12 rounded-xl border border-ink-100 bg-surface text-center text-xl font-semibold text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
      @input="onInput(index, $event)"
      @keydown="onKeydown(index, $event)"
      @paste="onPaste"
    />
  </div>
</template>
