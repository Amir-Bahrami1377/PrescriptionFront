# پلن اجرایی فرانت‌اند — سامانه ثبت آزمایش آنلاین

**نام پروژه: Prescription**

این فایل برای Claude Code در VS Code است. هدف: راه‌اندازی کامل فرانت‌اند با Vue.js و Tailwind CSS.

## نام‌گذاری (Naming Convention)
- نام پکیج (`package.json` → `name`): `prescription-frontend`
- نام پوشه ریشه پروژه: `prescription-frontend`
- عنوان صفحه (`index.html` → `<title>`): `Prescription`
- نام Container در Docker Compose: `prescription-frontend`
- Environment Variable پیشوند: `VITE_PRESCRIPTION_API_BASE_URL`

## استک فنی
- Vue 3 (Composition API) + Vite
- Vue Router (با Route Guard بر اساس نقش: Customer / Doctor / Admin)
- Pinia (State Management)
- Tailwind CSS
- Axios (با Interceptor برای JWT و Refresh Token)
- VeeValidate + Zod/Yup برای اعتبارسنجی فرم‌ها
- vue-toastification یا مشابه برای نوتیفیکیشن UI

## ساختار پیشنهادی پروژه
```
src/
  api/
    axiosClient.js            (Interceptor: Auth Header, Refresh Token, Error Handling)
    authApi.js
    ordersApi.js
    catalogApi.js
    consultationApi.js
    ticketingApi.js
    paymentApi.js
  stores/                     (Pinia)
    authStore.js
    ordersStore.js
    ticketStore.js
  router/
    index.js
    guards.js                 (roleGuard: customer/doctor/admin)
  layouts/
    AuthLayout.vue
    CustomerLayout.vue
    DoctorLayout.vue
  views/
    auth/
      LoginRegisterView.vue    (ورود با شماره همراه + OTP)
      CompleteProfileView.vue  (کد ملی، نام، سن، جنسیت - کاربر جدید)
    customer/
      DashboardView.vue
      NewOrderView.vue         (انتخاب آزمایش + آپلود فایل + یادداشت)
      OrderTrackingView.vue    (Timeline وضعیت سفارش)
      OrderDetailView.vue
      UploadResultView.vue     (بارگذاری جواب آزمایش)
      ConsultationRequestView.vue (آپلود عکس نتیجه برای مشاوره)
      TicketsView.vue
      PaymentView.vue          (Redirect به زرین‌پال + صفحه بازگشت)
    doctor/
      DoctorDashboardView.vue
      PendingReviewListView.vue
      OrderReviewDetailView.vue (تایید/رد + ثبت ارجاع نسخه)
      PaymentListView.vue
      InProgressListView.vue    (لیست انجام + تکمیل سفارش)
      ConsultationQueueView.vue (بررسی عکس و ثبت نظر تخصصی)
    admin/
      TestCatalogManageView.vue
  components/
    common/
      FileUploader.vue
      OtpInput.vue
      StatusBadge.vue          (نمایش وضعیت سفارش)
      OrderTimeline.vue
    forms/
      IdentityForm.vue
  composables/
    useAuth.js
    useFileUpload.js
    useOrderStatus.js
  assets/
    tailwind.css
```

## جریان صفحات کاربر (Customer)
1. ورود/ثبت‌نام با شماره همراه → دریافت و تایید OTP
2. اگر کاربر جدید → فرم تکمیل اطلاعات هویتی (کد ملی، نام، سن، جنسیت)
3. داشبورد → دکمه «ثبت آزمایش جدید»
4. انتخاب آزمایش از کاتالوگ + آپلود فایل + نوشتن یادداشت → ارسال برای بررسی پزشک
5. پیگیری سفارش با Timeline وضعیت (در انتظار تایید پزشک → در انتظار پرداخت → پرداخت شده/در حال انجام → تکمیل شده)
6. پرداخت آنلاین از طریق زرین‌پال هنگام قرارگیری در لیست پرداخت
7. بارگذاری جواب آزمایش (در صورت نیاز به آپلود توسط مشتری)
8. پس از دریافت نتیجه: امکان درخواست مشاوره با آپلود عکس نتیجه و مشاهده نظر پزشک
9. بخش تیکتینگ برای پشتیبانی

## جریان صفحات پزشک (Doctor)
1. لیست درخواست‌های در انتظار بررسی
2. مشاهده جزئیات سفارش (آزمایش، فایل، یادداشت مشتری)
3. تایید (+ ثبت ارجاع/لینک نسخه از سامانه خارجی) یا رد سفارش
4. مشاهده لیست پرداخت‌شده/در حال انجام
5. تکمیل سفارش
6. صف مشاوره‌ها: مشاهده عکس نتیجه آپلودشده توسط مشتری و ثبت نظر تخصصی

## طراحی UI (Tailwind)
- طراحی موبایل-فرست (اکثر مشتریان از موبایل استفاده می‌کنند)
- پشتیبانی از راست‌چین (RTL) — فعال‌سازی `dir="rtl"` و پیکربندی Tailwind برای RTL
- پالت رنگی آرام و پزشکی (آبی/سبز ملایم)، Status Badge رنگی برای وضعیت‌های سفارش
- کامپوننت Timeline برای نمایش بصری مراحل سفارش

## اتصال به بک‌اند
- Base URL از Environment Variable (`VITE_API_BASE_URL`)
- Axios Interceptor: افزودن JWT، مدیریت خودکار Refresh Token، مدیریت خطای 401
- WebSocket/Polling (اختیاری) برای بروزرسانی لحظه‌ای وضعیت سفارش و تیکت

## Docker
- `Dockerfile` چند مرحله‌ای: مرحله build (Vite build) + مرحله serve (Nginx)
- تنظیم Nginx برای SPA fallback (`try_files $uri /index.html`)
- در `docker-compose.yml` سرویس frontend با پورت expose شده و وابستگی به backend

## ترتیب اجرا برای Claude Code
1. ساخت پروژه Vue 3 + Vite + نصب Tailwind CSS، پیکربندی RTL
2. راه‌اندازی Router + Pinia + axiosClient با Interceptor
3. پیاده‌سازی صفحات Auth (OTP + تکمیل پروفایل) و اتصال به API
4. پیاده‌سازی Layout ها و Route Guard بر اساس نقش
5. پیاده‌سازی پنل مشتری (ثبت آزمایش، پیگیری، آپلود جواب، مشاوره، تیکت)
6. پیاده‌سازی پنل پزشک (بررسی، تایید/رد، لیست‌ها، تکمیل سفارش، مشاوره)
7. پیاده‌سازی جریان پرداخت (Redirect + صفحه بازگشت از زرین‌پال)
8. تنظیم Dockerfile و docker-compose برای سرو نهایی با Nginx
9. تست دستی End-to-End جریان کامل سفارش
