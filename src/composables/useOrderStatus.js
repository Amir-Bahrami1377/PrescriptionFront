/**
 * The backend doesn't publish an order-status enum/schema, but every value below has now been
 * observed directly on a live order: PendingDoctorApproval, Rejected, AwaitingPayment,
 * InProgress, AwaitingTestResultUpload, AwaitingConsultationOpinion and Completed — walked
 * end to end for both a plain and a consultation order.
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
