<script setup>
import { useAuth } from '@/composables/useAuth'

const { phoneNumber, logout } = useAuth()

const tabs = [
  { to: { name: 'customer-dashboard' }, label: 'خانه', icon: 'home' },
  { to: { name: 'order-tracking' }, label: 'سفارش‌ها', icon: 'flask' },
  { to: { name: 'tickets' }, label: 'پشتیبانی', icon: 'chat' },
]
</script>

<template>
  <div class="flex min-h-screen flex-col bg-paper">
    <header class="sticky top-0 z-10 flex items-center justify-between border-b border-ink-100 bg-surface/90 px-4 py-3 backdrop-blur">
      <router-link :to="{ name: 'customer-dashboard' }" class="flex items-center gap-2">
        <span class="flex size-8 items-center justify-center rounded-lg bg-primary-600 text-white">
          <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 12.5h3.5l1.5-4.5 2.5 8.5 2-6 1.5 2.5H21" />
          </svg>
        </span>
        <span class="font-bold text-ink-900">سامانه ثبت آزمایش</span>
      </router-link>
      <div class="flex items-center gap-3">
        <span class="font-data hidden text-sm text-ink-500 sm:inline">{{ phoneNumber }}</span>
        <button type="button" class="text-sm font-medium text-ink-500 hover:text-brick-600" @click="logout">خروج</button>
      </div>
    </header>

    <main class="mx-auto w-full max-w-2xl flex-1 px-4 pb-24 pt-5">
      <router-view />
    </main>

    <nav class="fixed inset-x-0 bottom-0 z-10 border-t border-ink-100 bg-surface/95 backdrop-blur">
      <div class="mx-auto flex max-w-2xl">
        <router-link
          v-for="tab in tabs"
          :key="tab.label"
          :to="tab.to"
          class="flex flex-1 flex-col items-center gap-1 py-2.5 text-xs"
          active-class="text-primary-600"
          :class="$route.name !== tab.to.name && 'text-ink-400'"
        >
          <svg v-if="tab.icon === 'home'" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 11.5L12 4l9 7.5M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
          </svg>
          <svg v-else-if="tab.icon === 'flask'" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 3h6m-5 0v6.5L5.5 18a1.5 1.5 0 001.3 2.2h10.4a1.5 1.5 0 001.3-2.2L14 9.5V3" />
          </svg>
          <svg v-else class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h8m-8-4h5m-9 12l2.5-3.5H17a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v8.5a2 2 0 002 2h1z" />
          </svg>
          {{ tab.label }}
        </router-link>
      </div>
    </nav>
  </div>
</template>
