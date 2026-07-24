import { createRouter, createWebHistory } from 'vue-router'
import { roleGuard } from './guards'
import { ROLES } from '@/stores/authStore'

const routes = [
  {
    path: '/',
    name: 'landing',
    component: () => import('@/views/LandingView.vue'),
  },
  {
    path: '/',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      { path: 'login', name: 'login', component: () => import('@/views/auth/LoginRegisterView.vue') },
      {
        path: 'complete-profile',
        name: 'complete-profile',
        component: () => import('@/views/auth/CompleteProfileView.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: '/payment/return',
    name: 'payment-return',
    component: () => import('@/views/customer/PaymentReturnView.vue'),
    meta: { requiresAuth: true, roles: [ROLES.CUSTOMER] },
  },
  {
    path: '/customer',
    component: () => import('@/layouts/CustomerLayout.vue'),
    meta: { requiresAuth: true, roles: [ROLES.CUSTOMER] },
    children: [
      { path: '', name: 'customer-dashboard', component: () => import('@/views/customer/DashboardView.vue') },
      { path: 'orders/new', name: 'new-order', component: () => import('@/views/customer/NewOrderView.vue') },
      { path: 'orders', name: 'order-tracking', component: () => import('@/views/customer/OrderTrackingView.vue') },
      { path: 'orders/:id', name: 'order-detail', component: () => import('@/views/customer/OrderDetailView.vue'), props: true },
      { path: 'orders/:id/upload-result', name: 'upload-result', component: () => import('@/views/customer/UploadResultView.vue'), props: true },
      {
        path: 'orders/:id/consultation-result',
        name: 'upload-consultation-result',
        component: () => import('@/views/customer/UploadConsultationResultView.vue'),
        props: true,
      },
      { path: 'tickets', name: 'tickets', component: () => import('@/views/customer/TicketsView.vue') },
    ],
  },
  {
    path: '/doctor',
    component: () => import('@/layouts/DoctorLayout.vue'),
    meta: { requiresAuth: true, roles: [ROLES.DOCTOR] },
    children: [
      { path: '', name: 'doctor-dashboard', component: () => import('@/views/doctor/DoctorDashboardView.vue') },
      { path: 'pending-review', name: 'pending-review', component: () => import('@/views/doctor/PendingReviewListView.vue') },
      { path: 'orders/:id/review', name: 'order-review-detail', component: () => import('@/views/doctor/OrderReviewDetailView.vue'), props: true },
      { path: 'payment-list', name: 'payment-list', component: () => import('@/views/doctor/PaymentListView.vue') },
      { path: 'in-progress', name: 'in-progress-list', component: () => import('@/views/doctor/InProgressListView.vue') },
      {
        path: 'consultation-opinions',
        name: 'consultation-opinion-queue',
        component: () => import('@/views/doctor/ConsultationOpinionQueueView.vue'),
      },
      { path: 'fee', name: 'doctor-fee', component: () => import('@/views/doctor/DoctorFeeView.vue') },
    ],
  },
  {
    path: '/admin',
    component: () => import('@/layouts/DoctorLayout.vue'),
    meta: { requiresAuth: true, roles: [ROLES.ADMIN] },
    children: [
      { path: '', name: 'admin-catalog', component: () => import('@/views/admin/TestCatalogManageView.vue') },
      { path: 'users', name: 'admin-users', component: () => import('@/views/admin/UserManagementView.vue') },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(roleGuard)

export default router
