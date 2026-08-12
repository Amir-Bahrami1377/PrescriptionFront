<script setup>
const problems = [
  {
    title: 'رفت‌وآمد و اتلاف وقت',
    desc: 'برای هر آزمایش باید به آزمایشگاه مراجعه کنید و در صف بمانید.',
    icon: 'clock',
  },
  {
    title: 'سردرگمی در انتخاب آزمایش',
    desc: 'بدون مشورت پزشک، مشخص نیست کدام آزمایش واقعاً لازم است.',
    icon: 'question',
  },
  {
    title: 'بی‌خبری از وضعیت سفارش',
    desc: 'برای دانستن نتیجه یا مرحله بعدی، باید بارها تماس بگیرید.',
    icon: 'phone',
  },
  {
    title: 'گم‌شدن نسخه و جواب آزمایش',
    desc: 'برگه‌های کاغذی نسخه و جواب آزمایش به‌راحتی گم می‌شوند.',
    icon: 'document',
  },
]

const benefits = [
  { title: 'ثبت آنلاین در چند دقیقه', desc: 'از خانه یا محل کار، آزمایش موردنیاز را انتخاب و ثبت کنید.', icon: 'bolt' },
  { title: 'تایید پزشک پیش از انجام', desc: 'پزشک متخصص درخواست شما را بررسی و تایید می‌کند.', icon: 'check-doc' },
  { title: 'پیگیری لحظه‌ای سفارش', desc: 'از ثبت تا تکمیل، مراحل سفارش را گام‌به‌گام ببینید.', icon: 'pulse' },
  { title: 'پرداخت آنلاین امن', desc: 'بدون مراجعه حضوری، پرداخت را از طریق درگاه امن انجام دهید.', icon: 'card' },
  { title: 'مشاوره با ارسال عکس نتیجه', desc: 'عکس جواب آزمایش را بفرستید و نظر تخصصی پزشک را بگیرید.', icon: 'chat' },
  { title: 'سوابق همیشه در دسترس', desc: 'به تاریخچه آزمایش‌ها و نتایج، هر زمان که بخواهید دسترسی دارید.', icon: 'archive' },
]

const steps = [
  { title: 'انتخاب آزمایش و ثبت درخواست', desc: 'آزمایش موردنیاز را انتخاب کنید و در صورت نیاز یادداشت یا فایلی پیوست کنید.' },
  { title: 'بررسی و تایید پزشک', desc: 'پزشک متخصص درخواست را بررسی می‌کند و تایید یا رد می‌کند.' },
  { title: 'پرداخت آنلاین', desc: 'پس از تایید، هزینه را به‌صورت آنلاین و امن پرداخت می‌کنید.' },
  { title: 'دریافت نتیجه و مشاوره', desc: 'نتیجه آزمایش را دریافت و در صورت نیاز درخواست مشاوره تخصصی بدهید.' },
]
</script>

<template>
  <div class="overflow-x-clip bg-paper">
    <header class="sticky top-0 z-20 border-b border-ink-100 bg-paper/90 backdrop-blur">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        <div class="flex items-center gap-2">
          <span class="flex size-8 items-center justify-center rounded-lg bg-primary-600 text-white">
            <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 12.5h3.5l1.5-4.5 2.5 8.5 2-6 1.5 2.5H21" />
            </svg>
          </span>
          <span class="font-bold text-ink-900">سامانه ثبت آزمایش</span>
        </div>
        <router-link :to="{ name: 'login' }">
          <button type="button" class="rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700">
            ورود / ثبت‌نام
          </button>
        </router-link>
      </div>
    </header>

    <!-- Hero -->
    <section class="relative px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20">
      <div class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] overflow-hidden">
        <div class="absolute -start-24 -top-24 size-96 rounded-full bg-primary-100 opacity-60 blur-3xl" />
        <div class="absolute -end-16 top-32 size-72 rounded-full bg-amber-100 opacity-60 blur-3xl" />
      </div>

      <div class="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div class="text-center lg:text-start">
          <span class="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 ring-1 ring-inset ring-primary-200">
            برای بیماران و پزشکان
          </span>
          <h1 class="mt-4 text-3xl font-bold leading-tight text-ink-900 sm:text-4xl lg:text-5xl">
            دیگر برای هر آزمایش<br class="hidden sm:block" />
            راهی درمانگاه نیستید
          </h1>
          <p class="mx-auto mt-4 max-w-md text-ink-600 lg:mx-0 lg:max-w-lg">
            از انتخاب آزمایش تا تایید پزشک، پرداخت آنلاین و دریافت نتیجه؛ همه‌چیز از یک‌جا و با پیگیری شفاف، آنلاین انجام می‌شود.
          </p>
          <div class="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <router-link :to="{ name: 'login' }" class="w-full sm:w-auto">
              <button type="button" class="w-full rounded-xl bg-primary-600 px-6 py-3 font-medium text-white transition-colors hover:bg-primary-700 sm:w-auto">
                شروع ثبت آزمایش
              </button>
            </router-link>
            <a href="#how-it-works" class="w-full sm:w-auto">
              <button type="button" class="w-full rounded-xl px-6 py-3 font-medium text-ink-700 transition-colors hover:bg-ink-50 sm:w-auto">
                چطور کار می‌کند؟
              </button>
            </a>
          </div>
        </div>

        <!-- Phone mockup: order timeline, echoing the product's own pulse-line status UI -->
        <div class="mx-auto w-full max-w-xs">
          <div class="rounded-[2rem] border border-ink-100 bg-surface p-3 shadow-xl shadow-ink-900/10">
            <div class="rounded-[1.5rem] bg-paper p-5">
              <p class="text-xs font-medium text-ink-400">وضعیت سفارش</p>
              <p class="mt-1 text-sm font-bold text-ink-900">آزمایش قند خون</p>

              <div class="mt-6 flex items-start" dir="ltr">
                <template v-for="(label, i) in ['ثبت', 'تایید', 'پرداخت', 'نتیجه']" :key="label">
                  <div class="flex flex-col items-center" style="width: 52px">
                    <span
                      class="flex size-7 items-center justify-center rounded-full text-xs font-bold text-white"
                      :class="i < 2 ? 'bg-primary-600' : i === 2 ? 'bg-amber-500' : 'bg-ink-100 !text-ink-400'"
                    >
                      <svg v-if="i < 2" class="size-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 9.5a1 1 0 111.4-1.4l3.6 3.6 6.7-6.7a1 1 0 011.4 0z" clip-rule="evenodd" />
                      </svg>
                      <span v-else>{{ i + 1 }}</span>
                    </span>
                    <span dir="rtl" class="mt-1.5 text-[10px] text-ink-500">{{ label }}</span>
                  </div>
                  <svg v-if="i < 3" class="mt-3.5 h-4 shrink-0" width="28" viewBox="0 0 56 24" fill="none">
                    <path
                      d="M0 12H16L20 3L27 21L32 5L36 12H56"
                      :class="i < 1 ? 'stroke-primary-500' : i === 1 ? 'stroke-amber-500' : 'stroke-ink-200'"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </template>
              </div>

              <div class="mt-6 rounded-xl bg-amber-50 p-3">
                <p class="text-xs font-medium text-amber-800">در انتظار پرداخت</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Problems -->
    <section class="px-4 py-16 sm:px-6">
      <div class="mx-auto max-w-6xl">
        <div class="mx-auto max-w-xl text-center">
          <h2 class="text-2xl font-bold text-ink-900 sm:text-3xl">مشکلاتی که هر بار با آن‌ها دست‌وپنجه نرم می‌کنید</h2>
        </div>
        <div class="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="p in problems" :key="p.title" class="rounded-2xl border border-ink-100 bg-surface p-5">
            <span class="flex size-10 items-center justify-center rounded-xl bg-brick-50 text-brick-600">
              <svg v-if="p.icon === 'clock'" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <circle cx="12" cy="12" r="9" stroke-linecap="round" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 7v5l3.5 2" />
              </svg>
              <svg v-else-if="p.icon === 'question'" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <circle cx="12" cy="12" r="9" stroke-linecap="round" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.5 9.3a2.5 2.5 0 114 2c-.7.6-1.5 1.1-1.5 2.2" />
                <circle cx="12" cy="16.5" r="0.75" fill="currentColor" stroke="none" />
              </svg>
              <svg v-else-if="p.icon === 'phone'" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 4h3l1.5 4-2 1.5a11 11 0 005 5l1.5-2 4 1.5v3a2 2 0 01-2.2 2A16 16 0 014 6.2 2 2 0 016 4z" />
              </svg>
              <svg v-else class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7 21h10a2 2 0 002-2V9.5L14.5 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 13h6m-6 4h6" />
              </svg>
            </span>
            <h3 class="mt-4 font-bold text-ink-900">{{ p.title }}</h3>
            <p class="mt-1.5 text-sm text-ink-500">{{ p.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Benefits -->
    <section class="bg-primary-900 px-4 py-16 sm:px-6">
      <div class="mx-auto max-w-6xl">
        <div class="mx-auto max-w-xl text-center">
          <h2 class="text-2xl font-bold text-white sm:text-3xl">همه این‌ها را سامانه ثبت آزمایش حل می‌کند</h2>
          <p class="mt-3 text-primary-200">یک مسیر ساده و شفاف، از ثبت درخواست تا دریافت نتیجه.</p>
        </div>
        <div class="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="b in benefits" :key="b.title" class="rounded-2xl bg-primary-800/60 p-5 ring-1 ring-inset ring-white/10">
            <span class="flex size-10 items-center justify-center rounded-xl bg-white/10 text-white">
              <svg v-if="b.icon === 'bolt'" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 3L5 13h5l-1 8 8-10h-5l1-8z" />
              </svg>
              <svg v-else-if="b.icon === 'check-doc'" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7 21h10a2 2 0 002-2V9.5L14.5 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.5 13l2 2 4-4.5" />
              </svg>
              <svg v-else-if="b.icon === 'pulse'" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2 12h4l2-6 3 12 2.5-9 1.5 3h7" />
              </svg>
              <svg v-else-if="b.icon === 'card'" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <rect x="3" y="6" width="18" height="13" rx="2" /><path stroke-linecap="round" d="M3 10h18" />
              </svg>
              <svg v-else-if="b.icon === 'chat'" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 19l2.5-3.5H17a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v8.5a2 2 0 002 2h1z" />
              </svg>
              <svg v-else class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M4 7v11a1 1 0 001 1h14a1 1 0 001-1V7M4 7l1.5-3h13L20 7M9 12h6" />
              </svg>
            </span>
            <h3 class="mt-4 font-bold text-white">{{ b.title }}</h3>
            <p class="mt-1.5 text-sm text-primary-200">{{ b.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section id="how-it-works" class="px-4 py-16 sm:px-6">
      <div class="mx-auto max-w-5xl">
        <div class="mx-auto max-w-xl text-center">
          <h2 class="text-2xl font-bold text-ink-900 sm:text-3xl">چهار قدم تا نتیجه</h2>
        </div>
        <div class="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="(s, i) in steps" :key="s.title" class="relative text-center">
            <div class="mx-auto flex size-12 items-center justify-center rounded-full bg-primary-600 font-data text-lg font-bold text-white">
              {{ i + 1 }}
            </div>
            <h3 class="mt-4 font-bold text-ink-900">{{ s.title }}</h3>
            <p class="mt-1.5 text-sm text-ink-500">{{ s.desc }}</p>
            <svg
              v-if="i < steps.length - 1"
              class="absolute top-6 hidden h-4 w-full text-ink-200 sm:block"
              style="right: -50%; left: 50%"
              viewBox="0 0 200 24"
              fill="none"
            >
              <path d="M0 12H60L66 3L76 21L84 5L90 12H200" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </section>

    <!-- Two-sided -->
    <section class="px-4 py-16 sm:px-6">
      <div class="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2">
        <div class="rounded-3xl border border-ink-100 bg-surface p-8">
          <span class="flex size-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
              <circle cx="12" cy="8" r="3.5" /><path stroke-linecap="round" d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" />
            </svg>
          </span>
          <h3 class="mt-4 text-lg font-bold text-ink-900">برای بیماران</h3>
          <p class="mt-2 text-ink-600">بدون مراجعه حضوری، آزمایش بدهید، پرداخت کنید و نتیجه را با خیال راحت دنبال کنید.</p>
        </div>
        <div class="rounded-3xl border border-ink-100 bg-surface p-8">
          <span class="flex size-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 3h6m-5 0v6.5L5.5 18a1.5 1.5 0 001.3 2.2h10.4a1.5 1.5 0 001.3-2.2L14 9.5V3" />
            </svg>
          </span>
          <h3 class="mt-4 text-lg font-bold text-ink-900">برای پزشکان</h3>
          <p class="mt-2 text-ink-600">درخواست‌ها را در یک پنل ساده بررسی، تایید و پیگیری کنید؛ بدون کاغذبازی اضافه.</p>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="px-4 pb-20 sm:px-6">
      <div class="mx-auto max-w-4xl rounded-3xl bg-primary-600 px-6 py-12 text-center text-white sm:px-12">
        <h2 class="text-2xl font-bold sm:text-3xl">همین امروز شروع کنید</h2>
        <p class="mt-2 text-primary-100">ثبت‌نام رایگان است و ثبت اولین آزمایش کمتر از چند دقیقه طول می‌کشد.</p>
        <router-link :to="{ name: 'login' }">
          <button type="button" class="mt-6 rounded-xl bg-white px-6 py-3 font-medium text-primary-700 transition-colors hover:bg-primary-50">
            ورود به سامانه
          </button>
        </router-link>
      </div>
    </section>

    <footer class="border-t border-ink-100 px-4 py-8 text-center text-sm text-ink-400 sm:px-6">
      <p>سامانه ثبت آزمایش</p>

      <!-- eNamad trust seal. The markup (including the non-standard `code` attribute) is
           supplied verbatim by eNamad and is what their verification looks for, so keep it
           as-is; only the wrapper below is ours. The image is served from enamad.ir. -->
      <div class="mt-6 flex justify-center">
        <a
          referrerpolicy="origin"
          target="_blank"
          href="https://trustseal.enamad.ir/?id=7292318&Code=AEsQZGdjdtDkjqgTYtRhk93ah03zWRLp"
        >
          <img
            referrerpolicy="origin"
            src="https://trustseal.enamad.ir/logo.aspx?id=7292318&Code=AEsQZGdjdtDkjqgTYtRhk93ah03zWRLp"
            alt="نماد اعتماد الکترونیکی"
            style="cursor: pointer"
            code="AEsQZGdjdtDkjqgTYtRhk93ah03zWRLp"
          />
        </a>
      </div>
    </footer>
  </div>
</template>
