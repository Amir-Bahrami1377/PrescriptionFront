import { ref } from 'vue'
import * as catalogApi from '@/api/catalogApi'

/**
 * An order only carries labTestIds (verified against the backend — no embedded test
 * name/description). This is a module-level cache of the catalog so any view can resolve
 * a test's display name without re-fetching the whole list every time.
 */
const tests = ref([])
const loaded = ref(false)
let loadingPromise = null

async function ensureLoaded() {
  if (loaded.value) return
  loadingPromise ??= catalogApi.listTests().then((data) => {
    tests.value = data ?? []
    loaded.value = true
  })
  await loadingPromise
}

export function useTestCatalog() {
  function testName(labTestId) {
    return tests.value.find((t) => t.id === labTestId)?.name ?? 'آزمایش'
  }

  function testNames(labTestIds) {
    const names = (labTestIds ?? []).map(testName)
    return names.length ? names.join('، ') : 'آزمایش'
  }

  return { tests, loaded, ensureLoaded, testName, testNames }
}
