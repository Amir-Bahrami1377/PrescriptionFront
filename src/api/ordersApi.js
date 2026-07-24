import axiosClient from './axiosClient'

/**
 * Verified against the running backend: an order can carry multiple lab tests via the
 * repeated `labTestIds` field (at least one required), and the referral file is optional —
 * when one is attached it must be JPEG/PNG/PDF, but it can be omitted entirely.
 * `thirdParty` is only sent when the order is on behalf of someone else — the backend
 * rejects isForThirdParty=true without both a valid national code and phone number.
 * Response is { orderId, status }.
 */
export function createOrder({ labTestIds, note, file, basicInsurance, thirdParty, requestsConsultation }, onUploadProgress) {
  const form = new FormData()
  for (const id of labTestIds) form.append('labTestIds', id)
  if (note) form.append('note', note)
  if (file) form.append('file', file)
  if (basicInsurance) form.append('basicInsurance', basicInsurance)
  if (thirdParty) {
    form.append('isForThirdParty', 'true')
    form.append('thirdPartyNationalCode', thirdParty.nationalCode)
    form.append('thirdPartyPhoneNumber', thirdParty.phoneNumber)
  }
  if (requestsConsultation) form.append('requestsConsultation', 'true')
  return axiosClient
    .post('/api/orders', form, { headers: { 'Content-Type': 'multipart/form-data' }, onUploadProgress })
    .then((res) => res.data)
}

/** The exact basic-insurance enum member names, straight from the backend. Anonymous endpoint. */
export function listBasicInsuranceTypes() {
  return axiosClient.get('/api/orders/basic-insurance-types').then((res) => res.data)
}

/**
 * Response shape verified against the backend: { id, labTestIds, priceInRials, status,
 * rejectionReason, prescriptionReferenceNumber, paymentReferenceId, hasResult, basicInsurance,
 * isForThirdParty, thirdPartyNationalCode, thirdPartyPhoneNumber, requestsConsultation,
 * consultationOpinion, createdAtUtc, completedAtUtc }. The third-party fields are only
 * populated when the caller is authorized to see them (the customer who created the order,
 * or a reviewing doctor). When requestsConsultation is true, price includes the doctor's
 * consultation fee on top of their visit fee, and the order's post-payment path is
 * AwaitingPayment -> AwaitingTestResultUpload -> AwaitingConsultationOpinion -> Completed
 * instead of the normal AwaitingPayment -> InProgress -> Completed.
 */
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

/**
 * Customer uploads their test result for a consultation order (ownership-checked).
 * Transitions the order from AwaitingTestResultUpload to AwaitingConsultationOpinion.
 */
export function uploadConsultationResult(id, file, onUploadProgress) {
  const form = new FormData()
  form.append('file', file)
  return axiosClient
    .post(`/api/orders/${id}/consultation-result`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    })
    .then((res) => res.data)
}

/** Doctor submits their opinion on a consultation order — this completes the order. */
export function submitConsultationOpinion(id, opinion) {
  return axiosClient.post(`/api/orders/${id}/consultation-opinion`, { opinion }).then((res) => res.data)
}

/** Shared queue: consultation orders whose test result was uploaded, awaiting a doctor's opinion. */
export function listAwaitingConsultationOpinion() {
  return axiosClient.get('/api/orders/awaiting-consultation-opinion').then((res) => res.data)
}

/**
 * A short-lived presigned URL for the order's uploaded result file — covers both the plain
 * doctor-upload flow and the consultation-result flow, since both populate the same file key.
 * Response is { url, expiresInSeconds }. 404s if no result has been uploaded yet.
 */
export function getResultFileUrl(id) {
  return axiosClient.get(`/api/orders/${id}/result-file`).then((res) => res.data)
}
