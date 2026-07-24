<script setup>
import { computed } from 'vue'
import { normalizeOrderStatus } from '@/composables/useOrderStatus'

const props = defineProps({ status: { type: [String, Number], required: true } })

const LINEAR_STEPS = [
  { key: 'pendingDoctorReview', label: 'ثبت سفارش' },
  { key: 'pendingPayment', label: 'تایید پزشک' },
  { key: 'inProgress', label: 'پرداخت' },
  { key: 'completed', label: 'انجام آزمایش' },
]

const info = computed(() => normalizeOrderStatus(props.status))
const isRejected = computed(() => info.value.key === 'rejected')
const currentIndex = computed(() => {
  const idx = LINEAR_STEPS.findIndex((s) => s.key === info.value.key)
  return idx >= 0 ? idx : 0
})

function segmentTone(fromIndex) {
  if (isRejected.value) return fromIndex === 0 ? 'brick' : 'idle'
  if (fromIndex < currentIndex.value) return 'done'
  if (fromIndex === currentIndex.value) return 'active'
  return 'idle'
}
function nodeTone(index) {
  if (isRejected.value) return index === 0 ? 'done' : index === 1 ? 'brick' : 'idle'
  if (index < currentIndex.value) return 'done'
  if (index === currentIndex.value) return 'active'
  return 'idle'
}
</script>

<template>
  <div class="overflow-x-auto">
    <div class="flex min-w-max items-start" dir="ltr">
      <template v-for="(step, index) in isRejected ? LINEAR_STEPS.slice(0, 2) : LINEAR_STEPS" :key="step.key">
        <div class="flex flex-col items-center" style="width: 84px">
          <span
            class="flex size-8 items-center justify-center rounded-full ring-4 ring-paper"
            :class="{
              'bg-primary-600 text-white': nodeTone(index) === 'done',
              'bg-amber-500 text-white': nodeTone(index) === 'active',
              'bg-brick-600 text-white': nodeTone(index) === 'brick',
              'bg-ink-100 text-ink-400': nodeTone(index) === 'idle',
            }"
          >
            <svg v-if="nodeTone(index) === 'done'" class="size-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 9.5a1 1 0 111.4-1.4l3.6 3.6 6.7-6.7a1 1 0 011.4 0z" clip-rule="evenodd" />
            </svg>
            <span v-else-if="nodeTone(index) === 'brick'" class="text-sm font-bold">×</span>
            <span v-else class="text-sm font-bold">{{ index + 1 }}</span>
          </span>
          <span
            dir="rtl"
            class="mt-2 text-center text-xs"
            :class="nodeTone(index) === 'idle' ? 'text-ink-400' : 'text-ink-700 font-medium'"
          >
            {{ index === 1 && isRejected ? 'رد شده توسط پزشک' : step.label }}
          </span>
        </div>

        <svg
          v-if="index < (isRejected ? 1 : LINEAR_STEPS.length - 1)"
          class="mt-4 h-6 shrink-0"
          width="56"
          viewBox="0 0 56 24"
          fill="none"
        >
          <path
            d="M0 12H16L20 3L27 21L32 5L36 12H56"
            :class="{
              'stroke-primary-500': segmentTone(index) === 'done',
              'stroke-amber-500': segmentTone(index) === 'active',
              'stroke-brick-500': segmentTone(index) === 'brick',
              'stroke-ink-200': segmentTone(index) === 'idle',
            }"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </template>
    </div>
  </div>
</template>
