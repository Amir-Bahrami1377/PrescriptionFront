<script setup>
import { onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import * as renewalsApi from '@/api/renewalsApi'
import { apiErrorMessage } from '@/lib/apiError'
import PageHeader from '@/components/common/PageHeader.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import AppButton from '@/components/common/AppButton.vue'
import { formatDate, formatRials, orderCreatedAt, orderTotal } from '@/lib/format'

const toast = useToast()
const renewals = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    renewals.value = (await renewalsApi.listMyRenewals()) ?? []
  } catch (error) {
    toast.error(apiErrorMessage(error, 'دریافت درخواست‌های تمدید با خطا مواجه شد'))
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <PageHeader title="تمدید نسخه" subtitle="درخواست‌های تمدید نسخه شما" />

  <router-link :to="{ name: 'new-renewal' }" class="mb-4 block">
    <AppButton block>درخواست تمدید جدید</AppButton>
  </router-link>

  <div v-if="loading" class="space-y-3">
    <div v-for="i in 3" :key="i" class="h-24 animate-pulse rounded-2xl bg-ink-50" />
  </div>

  <EmptyState v-else-if="!renewals.length" title="هنوز درخواست تمدیدی ثبت نکرده‌اید" />

  <div v-else class="space-y-3">
    <router-link
      v-for="renewal in renewals"
      :key="renewal.id"
      :to="{ name: 'renewal-detail', params: { id: renewal.id } }"
      class="block rounded-2xl border border-ink-100 bg-surface p-4 transition-colors hover:border-primary-200"
    >
      <div class="mb-2 flex items-start justify-between gap-3">
        <p class="font-data text-sm font-medium text-ink-900">{{ renewal.currentPrescriptionReferenceNumber }}</p>
        <StatusBadge :status="renewal.status" />
      </div>
      <p class="font-data text-xs text-ink-400">{{ formatDate(orderCreatedAt(renewal)) }}</p>
      <p v-if="renewal.priceInRials" class="font-data mt-1 text-sm text-ink-700">{{ formatRials(orderTotal(renewal)) }}</p>
      <p v-if="renewal.newPrescriptionReferenceNumber" class="mt-2 text-xs text-primary-600">
        نسخه جدید: <span class="font-data font-semibold">{{ renewal.newPrescriptionReferenceNumber }}</span>
      </p>
    </router-link>
  </div>
</template>
