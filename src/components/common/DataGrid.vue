<script setup>
import { computed, ref, watch } from 'vue'
import AppPagination from './AppPagination.vue'
import EmptyState from './EmptyState.vue'

const props = defineProps({
  // [{ key, label, thClass?, tdClass? }]
  columns: { type: Array, required: true },
  rows: { type: Array, default: () => [] },
  rowKey: { type: String, default: 'id' },
  loading: { type: Boolean, default: false },
  pageSize: { type: Number, default: 10 },
  emptyText: { type: String, default: 'موردی یافت نشد' },
})

const slots = defineSlots()

const page = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(props.rows.length / props.pageSize)))

// A new filtered/reloaded set should always start from the first page.
watch(
  () => props.rows,
  () => {
    page.value = 1
  },
)

const pagedRows = computed(() => {
  const start = (page.value - 1) * props.pageSize
  return props.rows.slice(start, start + props.pageSize)
})

const faNum = (n) => new Intl.NumberFormat('fa-IR').format(n)
const hasActions = computed(() => !!slots.actions)
const colspan = computed(() => props.columns.length + (hasActions.value ? 1 : 0))
</script>

<template>
  <div class="space-y-4">
    <slot name="toolbar" />

    <div class="overflow-hidden rounded-2xl border border-ink-100 bg-surface">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[32rem] border-collapse text-start">
          <thead>
            <tr class="border-b border-ink-100 bg-ink-50/60">
              <th
                v-for="col in columns"
                :key="col.key"
                class="px-4 py-3 text-start text-xs font-semibold text-ink-500"
                :class="col.thClass"
              >
                {{ col.label }}
              </th>
              <th v-if="hasActions" class="px-4 py-3 text-end text-xs font-semibold text-ink-500">عملیات</th>
            </tr>
          </thead>
          <tbody>
            <!-- Loading skeleton rows -->
            <template v-if="loading">
              <tr v-for="i in 5" :key="`sk-${i}`" class="border-b border-ink-50 last:border-0">
                <td v-for="col in columns" :key="col.key" class="px-4 py-3.5">
                  <div class="h-4 w-3/4 animate-pulse rounded bg-ink-100" />
                </td>
                <td v-if="hasActions" class="px-4 py-3.5">
                  <div class="ms-auto h-4 w-16 animate-pulse rounded bg-ink-100" />
                </td>
              </tr>
            </template>

            <tr v-else-if="!rows.length">
              <td :colspan="colspan" class="px-4 py-10">
                <EmptyState :title="emptyText" />
              </td>
            </tr>

            <template v-else>
              <tr
                v-for="row in pagedRows"
                :key="row[rowKey]"
                class="border-b border-ink-50 transition-colors last:border-0 hover:bg-ink-50/40"
              >
                <td v-for="col in columns" :key="col.key" class="px-4 py-3.5 text-sm text-ink-800" :class="col.tdClass">
                  <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">{{ row[col.key] }}</slot>
                </td>
                <td v-if="hasActions" class="px-4 py-3.5">
                  <div class="flex items-center justify-end gap-1.5">
                    <slot name="actions" :row="row" />
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="!loading && rows.length" class="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <p class="font-data text-xs text-ink-400">{{ faNum(rows.length) }} مورد</p>
      <AppPagination v-model="page" :total-pages="totalPages" />
    </div>
  </div>
</template>
