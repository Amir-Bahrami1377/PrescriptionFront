/**
 * The backend doesn't publish an order-status enum/schema. Confirmed live against the API:
 * "PendingDoctorApproval", "Rejected", "AwaitingPayment", "AwaitingConsultationOpinion" (the
 * last from a 409 transition-error message). "AwaitingTestResultUpload" is not yet directly
 * observed (blocked by the sandboxed payment gateway) but is given verbatim in the backend's
 * own change description and follows the exact same naming convention as the confirmed ones.
 * The plain "paid, doctor doing the work" status for non-consultation orders was never
 * directly observed either — "InProgress" here is still a best-effort guess.
 * Unrecognized values still render — as a neutral badge showing the raw value — instead
 * of breaking the page.
 */
const STEPS = [
  { key: 'pendingDoctorReview', label: 'در انتظار تایید پزشک', tone: 'amber' },
  { key: 'rejected', label: 'رد شده توسط پزشک', tone: 'brick', terminal: true },
  { key: 'pendingPayment', label: 'در انتظار پرداخت', tone: 'amber' },
  { key: 'inProgress', label: 'پرداخت شده / در حال انجام', tone: 'primary' },
  { key: 'completed', label: 'تکمیل شده', tone: 'primary' },
  { key: 'awaitingTestResultUpload', label: 'در انتظار بارگذاری نتیجه', tone: 'amber' },
  { key: 'awaitingConsultationOpinion', label: 'در انتظار نظر پزشک', tone: 'amber' },
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
  awaitingtestresultupload: 'awaitingTestResultUpload',
  awaitingconsultationopinion: 'awaitingConsultationOpinion',
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
