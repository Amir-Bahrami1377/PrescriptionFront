/** Reads the backend's ProblemDetails message (title/detail) off an axios error, if present. */
export function apiErrorMessage(error, fallback) {
  return error?.response?.data?.detail || error?.response?.data?.title || fallback
}
