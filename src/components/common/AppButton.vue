<script setup>
defineProps({
  variant: { type: String, default: 'primary' }, // primary | secondary | ghost | danger
  size: { type: String, default: 'md' }, // sm | md
  type: { type: String, default: 'button' },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
})

const variants = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:outline-primary-700 disabled:bg-primary-300',
  secondary: 'bg-primary-50 text-primary-700 hover:bg-primary-100 focus-visible:outline-primary-600 disabled:text-primary-300',
  ghost: 'bg-transparent text-ink-700 hover:bg-ink-50 focus-visible:outline-ink-500 disabled:text-ink-300',
  danger: 'bg-brick-600 text-white hover:bg-brick-700 focus-visible:outline-brick-700 disabled:bg-brick-300',
}
const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2.5 text-sm' }
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed"
    :class="[variants[variant], sizes[size], block && 'w-full']"
  >
    <svg v-if="loading" class="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
    <slot />
  </button>
</template>
