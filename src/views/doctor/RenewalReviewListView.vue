<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useToast } from 'vue-toastification'
import * as renewalsApi from '@/api/renewalsApi'
import { apiErrorMessage } from '@/lib/apiError'
import { basicInsuranceLabel } from '@/lib/insurance'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'
import { formatDate, orderCreatedAt, claimMinutesLeft } from '@/lib/format'

const toast = useToast()
const mine = ref([])
const general = ref([])
const loading = ref(true)
const claimingId = ref(null)
const decidingId = ref(null)
const decisions = reactive({})

async function load() {
  try {
    const [claimed, pending] = await Promise.all([
      renewalsApi.listMyPendingRenewals(),
      renewalsApi.listPendingRenewals(),
    ])
    mine.value = claimed ?? []
    // The shared queue also returns what this doctor already holds; hide those to avoid
    // offering "claim" on a renewal that's already in their own list.
    const mineIds = new Set(mine.value.map((r) => r.id))
    general.value = (pending ?? []).filter((r) => !mineIds.has(r.id))
  } catch (error) {
    toast.error(apiErrorMessage(error, 'دریافت صف تمدید با خطا مواجه شد'))
  } finally {
    loading.value = false
  }
}
onMounted(load)

async function claim(renewal) {
  claimingId.value = renewal.id
  try {
    await renewalsApi.claimRenewal(renewal.id)
    toast.success('درخواست برای بررسی شما رزرو شد')
    await load()
  } catch (error) {
    toast.error(apiErrorMessage(error, 'این درخواست هم‌زمان توسط پزشک دیگری برداشته شد'))
    await load()
  } finally {
    claimingId.value = null
  }
}

async function decide(renewal, approve) {
  const reason = decisions[renewal.id]?.trim()
  if (!approve && !reason) {
    toast.warning('دلیل رد درخواست را وارد کنید')
    return
  }
  decidingId.value = renewal.id
  try {
    await renewalsApi.reviewRenewal(renewal.id, { approve, rejectionReason: approve ? null : reason })
    toast.success(approve ? 'درخواست تمدید تایید شد' : 'درخواست تمدید رد شد')
    await load()
  } catch (error) {
    toast.error(apiErrorMessage(error, 'ثبت تصمیم با خطا مواجه شد'))
  } finally {
    decidingId.value = null
  }
}
</script>

<template>
  <PageHeader title="صف تمدید نسخه" subtitle="درخواست‌های تمدید را رزرو و بررسی کنید" />

  <div v-if="loading" class="space-y-3">
    <div v-for="i in 3" :key="i" class="h-24 animate-pulse rounded-2xl bg-ink-50" />
  </div>

  <template v-else>
    <section v-if="mine.length" class="mb-8">
      <h2 class="mb-3 font-bold text-ink-900">صف من</h2>
      <div class="space-y-3">
        <div v-for="renewal in mine" :key="renewal.id" class="rounded-2xl border border-primary-200 bg-primary-50 p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="font-data font-medium text-ink-900">{{ renewal.currentPrescriptionReferenceNumber }}</p>
              <p class="font-data mt-1 text-xs text-ink-500">کد ملی: {{ renewal.nationalCode }}</p>
              <p class="mt-1 text-xs text-ink-500">{{ basicInsuranceLabel(renewal.basicInsurance) }}</p>
              <p class="font-data mt-1 text-xs text-ink-400">{{ formatDate(orderCreatedAt(renewal)) }}</p>
            </div>
            <span
              v-if="claimMinutesLeft(renewal) !== null"
              class="font-data shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800"
            >
              {{ claimMinutesLeft(renewal) }} دقیقه دیگر
            </span>
          </div>

          <AppInput
            v-model="decisions[renewal.id]"
            class="mt-3"
            label="دلیل رد (فقط در صورت رد کردن)"
            placeholder="دلیل رد را برای بیمار توضیح دهید…"
          />
          <p class="mt-2 text-xs text-ink-500">با تایید، هزینه تمدید بر اساس تعرفه ثابت شما ثبت می‌شود.</p>
          <div class="mt-3 flex flex-wrap gap-2">
            <AppButton size="sm" :loading="decidingId === renewal.id" @click="decide(renewal, true)">تایید تمدید</AppButton>
            <AppButton variant="danger" size="sm" :loading="decidingId === renewal.id" @click="decide(renewal, false)">
              رد درخواست
            </AppButton>
          </div>
        </div>
      </div>
    </section>

    <section>
      <h2 class="mb-3 font-bold text-ink-900">صف عمومی</h2>
      <EmptyState v-if="!general.length" title="درخواستی در صف عمومی نیست" />
      <div v-else class="space-y-3">
        <div
          v-for="renewal in general"
          :key="renewal.id"
          class="flex items-center justify-between gap-3 rounded-2xl border border-ink-100 bg-surface p-4"
        >
          <div class="min-w-0">
            <p class="font-data font-medium text-ink-900">{{ renewal.currentPrescriptionReferenceNumber }}</p>
            <p class="font-data mt-1 text-xs text-ink-500">کد ملی: {{ renewal.nationalCode }}</p>
            <p class="mt-1 text-xs text-ink-500">{{ basicInsuranceLabel(renewal.basicInsurance) }}</p>
            <p class="font-data mt-1 text-xs text-ink-400">{{ formatDate(orderCreatedAt(renewal)) }}</p>
          </div>
          <AppButton size="sm" :loading="claimingId === renewal.id" @click="claim(renewal)">درخواست بررسی</AppButton>
        </div>
      </div>
    </section>
  </template>
</template>
