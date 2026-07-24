import { ref } from 'vue'

/** Wraps an upload call with progress + busy/error tracking for axios' onUploadProgress. */
export function useFileUpload() {
  const progress = ref(0)
  const uploading = ref(false)
  const error = ref(null)

  async function run(uploadFn) {
    uploading.value = true
    progress.value = 0
    error.value = null
    try {
      return await uploadFn((event) => {
        if (event.total) progress.value = Math.round((event.loaded / event.total) * 100)
      })
    } catch (err) {
      error.value = err
      throw err
    } finally {
      uploading.value = false
    }
  }

  return { progress, uploading, error, run }
}
