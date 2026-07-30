import axiosClient from './axiosClient'

/**
 * Prescription renewals are only open to customers an admin has flagged as special patients —
 * the backend checks that flag against the database on every call, not against the JWT, so a
 * newly granted (or revoked) patient does not need to sign in again. Verified live: 403 with
 * "تمدید نسخه فقط برای بیماران ویژه فعال است." until the flag is set.
 *
 * The lifecycle mirrors orders: PendingDoctorApproval → AwaitingPayment → InProgress → Completed,
 * with the same 30-minute doctor claim window.
 */

/** Body verified against the schema — all three fields are required. Response is { renewalId, status }. */
export function createRenewal({ currentPrescriptionReferenceNumber, nationalCode, basicInsurance }) {
  return axiosClient
    .post('/api/renewals', { currentPrescriptionReferenceNumber, nationalCode, basicInsurance })
    .then((res) => res.data)
}

/**
 * Customer's own renewals: { id, currentPrescriptionReferenceNumber, basicInsurance, status,
 * priceInRials, rejectionReason, newPrescriptionReferenceNumber, createdAtUtc, completedAtUtc }.
 */
export function listMyRenewals() {
  return axiosClient.get('/api/renewals/mine').then((res) => res.data)
}

/** Adds nationalCode and paymentReferenceId on top of the list shape. */
export function getRenewal(id) {
  return axiosClient.get(`/api/renewals/${id}`).then((res) => res.data)
}

export function initiateRenewalPayment(id) {
  return axiosClient.post(`/api/renewals/${id}/payment/initiate`).then((res) => res.data)
}

/** Shared queue of unclaimed renewals: { id, customerId, currentPrescriptionReferenceNumber, nationalCode, basicInsurance, createdAtUtc }. */
export function listPendingRenewals() {
  return axiosClient.get('/api/renewals/pending').then((res) => res.data)
}

/** This doctor's claimed renewals — same shape plus claimExpiresAtUtc. */
export function listMyPendingRenewals() {
  return axiosClient.get('/api/renewals/pending/mine').then((res) => res.data)
}

export function claimRenewal(id) {
  return axiosClient.post(`/api/renewals/${id}/claim`).then((res) => res.data)
}

export function reviewRenewal(id, { approve, rejectionReason = null }) {
  return axiosClient.post(`/api/renewals/${id}/review`, { approve, rejectionReason }).then((res) => res.data)
}

/** Paid renewals waiting for this doctor to issue the new prescription — adds priceInRials. */
export function listInProgressRenewals() {
  return axiosClient.get('/api/renewals/mine/in-progress').then((res) => res.data)
}

/**
 * Completing and handing over the new prescription code is one atomic call — the backend
 * rejects an empty code, so a renewal can never finish without something for the patient.
 */
export function completeRenewal(id, newPrescriptionReferenceNumber) {
  return axiosClient
    .post(`/api/renewals/${id}/complete`, { newPrescriptionReferenceNumber })
    .then((res) => res.data)
}
