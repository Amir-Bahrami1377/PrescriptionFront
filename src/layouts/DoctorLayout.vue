<script setup>
import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { ROLES } from '@/stores/authStore'

const { role, logout } = useAuth()

const doctorNav = [
  { to: { name: 'doctor-dashboard' }, label: 'داشبورد' },
  { to: { name: 'pending-review' }, label: 'در انتظار بررسی' },
  { to: { name: 'payment-list' }, label: 'لیست پرداخت' },
  { to: { name: 'in-progress-list' }, label: 'در حال انجام' },
  { to: { name: 'consultation-opinion-queue' }, label: 'صف نظر مشاوره' },
  { to: { name: 'renewal-review-queue' }, label: 'صف تمدید نسخه' },
  { to: { name: 'renewal-in-progress' }, label: 'تمدیدهای در حال انجام' },
  { to: { name: 'doctor-fee' }, label: 'تعرفه‌ها' },
]
const adminNav = [
  { to: { name: 'admin-catalog' }, label: 'مدیریت کاتالوگ آزمایش‌ها' },
  { to: { name: 'admin-users' }, label: 'مدیریت کاربران' },
]

const navItems = computed(() => (role.value === ROLES.ADMIN ? adminNav : doctorNav))
</script>

<template>
  <div class="min-h-screen bg-paper">
    <header class="border-b border-ink-100 bg-surface">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div class="flex items-center gap-2">
          <span class="flex size-8 items-center justify-center rounded-lg bg-primary-600 text-white">
            <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 12.5h3.5l1.5-4.5 2.5 8.5 2-6 1.5 2.5H21" />
            </svg>
          </span>
          <span class="font-bold text-ink-900">سامانه ثبت آزمایش <span class="font-normal text-ink-400">| پنل {{ role === 'admin' ? 'مدیریت' : 'پزشک' }}</span></span>
        </div>
        <button type="button" class="text-sm font-medium text-ink-500 hover:text-brick-600" @click="logout">خروج</button>
      </div>
      <nav class="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2">
        <router-link
          v-for="item in navItems"
          :key="item.label"
          :to="item.to"
          class="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-ink-500 hover:bg-ink-50 hover:text-ink-900"
          active-class="!bg-primary-50 !text-primary-700"
        >
          {{ item.label }}
        </router-link>
      </nav>
    </header>

    <main class="mx-auto max-w-6xl px-4 py-6">
      <router-view />
    </main>
  </div>
</template>
