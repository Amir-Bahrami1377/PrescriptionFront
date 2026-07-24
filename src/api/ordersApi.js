import axiosClient from './axiosClient'

/**
 * Verified against the running backend: an order can carry multiple lab tests via the
 * repeated `labTestIds` field (at least one required), and the referral file is optional —
 * when one is attached it must be JPEG/PNG/PDF, but it can be omitted entirely.
 * Response is { orderId, status }.
 */
export function createOrder({ labTestIds, note, file }, onUploadProgress) {
  const form = new FormData()
  for (const id of labTestIds) form.append('labTestIds', id)
  if (note) form.append('note', note)
  if (file) form.append('file', file)
  return axiosClient
    .post('/api/orders', form, { headers: { 'Content-Type': 'multipart/form-data' }, onUploadProgress })
    .then((res) => res.data)
}

/** Response shape verified against the backend: { id, labTestIds, priceInRials, status, rejectionReason, prescriptionReferenceNumber, paymentReferenceId, hasResult, createdAtUtc, completedAtUtc }. */
export function getOrder(id) {
  return axiosClient.get(`/api/orders/${id}`).then((res) => res.data)
}

export function reviewOrder(id, { approve, rejectionReason = null }) {
  return axiosClient.post(`/api/orders/${id}/review`, { approve, rejectionReason }).then((res) => res.data)
}

export function attachPrescriptionReference(id, prescriptionReferenceNumber) {
  return axiosClient
    .post(`/api/orders/${id}/prescription-reference`, { prescriptionReferenceNumber })
    .then((res) => res.data)
}

export function uploadTestResult(id, file, onUploadProgress) {
  const form = new FormData()
  form.append('file', file)
  return axiosClient
    .post(`/api/orders/${id}/result`, form, { headers: { 'Content-Type': 'multipart/form-data' }, onUploadProgress })
    .then((res) => res.data)
}

export function initiatePayment(id) {
  return axiosClient.post(`/api/orders/${id}/payment/initiate`).then((res) => res.data)
}

/** Orders this doctor approved that are awaiting the customer's payment. */
export function listPaymentQueue() {
  return axiosClient.get('/api/orders/mine/awaiting-payment').then((res) => res.data)
}

export function completeOrder(id) {
  return axiosClient.post(`/api/orders/${id}/complete`).then((res) => res.data)
}

/**
 * The general/public review queue: orders awaiting doctor approval that are unclaimed or
 * whose claim has expired. A doctor must claim an order (see claimOrder) before they can
 * review it — reviewOrder now 409s without an active claim.
 */
export function listPendingReviewOrders() {
  return axiosClient.get('/api/orders/pending').then((res) => res.data)
}

/** This doctor's private queue — orders they've claimed that are still inside the claim window. */
export function listMyPendingReviews() {
  return axiosClient.get('/api/orders/pending/mine').then((res) => res.data)
}

/**
 * Reserves the order for this doctor's review for a 30-minute window (server-enforced, no
 * background job — expiry is just a live timestamp comparison). Rejects with 409 if another
 * doctor already holds the claim.
 */
export function claimOrder(id) {
  return axiosClient.post(`/api/orders/${id}/claim`).then((res) => res.data)
}

/** Orders this doctor completed review on, now paid and awaiting completion. */
export function listInProgressOrders() {
  return axiosClient.get('/api/orders/mine/in-progress').then((res) => res.data)
}
