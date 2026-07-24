<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-paper px-4 py-10">
    <router-link :to="{ name: 'landing' }" class="mb-8 flex items-center gap-2.5">
      <span class="flex size-10 items-center justify-center rounded-xl bg-primary-600 text-white">
        <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 12.5h3.5l1.5-4.5 2.5 8.5 2-6 1.5 2.5H21" />
        </svg>
      </span>
      <span class="text-lg font-bold text-ink-900">سامانه ثبت آزمایش</span>
    </router-link>
    <div class="w-full max-w-sm rounded-3xl border border-ink-100 bg-surface p-6 shadow-sm shadow-ink-900/5">
      <router-view />
    </div>
  </div>
</template>
