/**
 * The backend doesn't publish an order-status enum/schema. "PendingDoctorApproval" is
 * confirmed against the live API (a freshly created order returns exactly that string);
 * the rest (rejected/payment/in-progress/completed) are still best-effort guesses pending
 * a doctor account to verify the approve/reject/pay/complete transitions end to end.
 * Unrecognized values still render — as a neutral badge showing the raw value — instead
 * of breaking the page.
 */
const STEPS = [
  { key: 'pendingDoctorReview', label: 'در انتظار تایید پزشک', tone: 'amber' },
  { key: 'rejected', label: 'رد شده توسط پزشک', tone: 'brick', terminal: true },
  { key: 'pendingPayment', label: 'در انتظار پرداخت', tone: 'amber' },
  { key: 'inProgress', label: 'پرداخت شده / در حال انجام', tone: 'primary' },
  { key: 'completed', label: 'تکمیل شده', tone: 'primary' },
]

const SYNONYMS = {
  pending: 'pendingDoctorReview',
  pendingdoctorreview: 'pendingDoctorReview',
  pendingdoctorapproval: 'pendingDoctorReview',
  awaitingreview: 'pendingDoctorReview',
  awaitingapproval: 'pendingDoctorReview',
  submitted: 'pendingDoctorReview',
  rejected: 'rejected',
  rejectedbydoctor: 'rejected',
  declined: 'rejected',
  pendingpayment: 'pendingPayment',
  awaitingpayment: 'pendingPayment',
  paid: 'inProgress',
  inprogress: 'inProgress',
  processing: 'inProgress',
  completed: 'completed',
  done: 'completed',
  finished: 'completed',
}

export function normalizeOrderStatus(status) {
  if (typeof status === 'number' && STEPS[status]) {
    return { ...STEPS[status], index: status }
  }
  const key = SYNONYMS[String(status ?? '').toLowerCase().replace(/[\s_-]/g, '')]
  const index = STEPS.findIndex((s) => s.key === key)
  if (index >= 0) return { ...STEPS[index], index }
  return { key: 'unknown', label: String(status ?? 'نامشخص'), tone: 'ink', index: -1 }
}

export function useOrderStatus() {
  return { STEPS, normalizeOrderStatus }
}
