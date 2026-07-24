<script setup>
import { onMounted, reactive, ref } from 'vue'
import * as ordersApi from '@/api/ordersApi'
import * as consultationApi from '@/api/consultationApi'
import * as doctorApi from '@/api/doctorApi'
import PageHeader from '@/components/common/PageHeader.vue'

const counts = reactive({ myPending: null, payment: null, consultation: null })
const feeMissing = ref(false)

onMounted(async () => {
  const [myPending, payments, consultations, fee] = await Promise.allSettled([
    ordersApi.listMyPendingReviews(),
    ordersApi.listPaymentQueue(),
    consultationApi.listPendingConsultations(),
    doctorApi.getMyFee(),
  ])
  if (myPending.status === 'fulfilled') counts.myPending = (myPending.value ?? []).length
  if (payments.status === 'fulfilled') counts.payment = (payments.value ?? []).length
  if (consultations.status === 'fulfilled') counts.consultation = (consultations.value ?? []).length
  if (fee.status === 'fulfilled') {
    const feeInRials = fee.value && typeof fee.value === 'object' ? fee.value.feeInRials : fee.value
    feeMissing.value = feeInRials === null || feeInRials === undefined
  }
})

const cards = [
  {
    to: { name: 'pending-review' },
    label: 'در انتظار بررسی',
    desc: 'سفارش جدید را برای بررسی رزرو کنید یا سفارش‌های رزروشده خود را تکمیل کنید',
    countKey: 'myPending',
  },
  { to: { name: 'payment-list' }, label: 'لیست پرداخت', desc: 'سفارش‌های تاییدشده در انتظار پرداخت مشتری', countKey: 'payment' },
  { to: { name: 'in-progress-list' }, label: 'در حال انجام', desc: 'سفارش‌های پرداخت‌شده برای تکمیل' },
  { to: { name: 'consultation-queue' }, label: 'صف مشاوره', desc: 'درخواست‌های مشاوره در انتظار نظر شما', countKey: 'consultation' },
]
</script>

<template>
  <PageHeader title="داشبورد پزشک" />

  <router-link
    v-if="feeMissing"
    :to="{ name: 'doctor-fee' }"
    class="mb-6 flex items-center justify-between gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800 ring-1 ring-inset ring-amber-200 transition-colors hover:bg-amber-100"
  >
    <span>هنوز هزینه ویزیت خود را تنظیم نکرده‌اید — تا آن زمان نمی‌توانید سفارشی را تایید کنید.</span>
    <span class="shrink-0 font-medium">تنظیم هزینه ←</span>
  </router-link>

  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <router-link
      v-for="card in cards"
      :key="card.label"
      :to="card.to"
      class="block rounded-2xl border border-ink-100 bg-surface p-5 transition-colors hover:border-primary-200"
    >
      <div class="flex items-start justify-between">
        <p class="font-bold text-ink-900">{{ card.label }}</p>
        <span
          v-if="card.countKey && counts[card.countKey] !== null"
          class="font-data rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700"
        >
          {{ counts[card.countKey] }}
        </span>
      </div>
      <p class="mt-1 text-sm text-ink-500">{{ card.desc }}</p>
    </router-link>
  </div>
</template>
