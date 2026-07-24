import { computed, ref } from 'vue'
import * as ordersApi from '@/api/ordersApi'
import { basicInsuranceLabel } from '@/lib/insurance'

/** Module-level cache — the type list is anonymous, static, and shared across every view. */
const types = ref([])
const loaded = ref(false)
let loadingPromise = null

async function ensureLoaded() {
  if (loaded.value) return
  loadingPromise ??= ordersApi.listBasicInsuranceTypes().then((data) => {
    types.value = data ?? []
    loaded.value = true
  })
  await loadingPromise
}

export function useInsuranceTypes() {
  const options = computed(() => types.value.map((value) => ({ value, label: basicInsuranceLabel(value) })))
  return { options, loaded, ensureLoaded, basicInsuranceLabel }
}
