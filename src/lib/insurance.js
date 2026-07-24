/** Enum member names verified against the live backend — not published in its OpenAPI spec. */
export const BASIC_INSURANCE_OPTIONS = [
  { value: 'None', label: 'فاقد بیمه پایه' },
  { value: 'SocialSecurity', label: 'تامین اجتماعی' },
  { value: 'HealthServices', label: 'بیمه سلامت' },
  { value: 'ArmedForces', label: 'نیروهای مسلح' },
  { value: 'Other', label: 'سایر' },
]

export const SUPPLEMENTARY_INSURANCE_OPTIONS = [
  { value: 'None', label: 'بدون بیمه تکمیلی' },
  { value: 'Iran', label: 'بیمه ایران' },
  { value: 'Asia', label: 'بیمه آسیا' },
  { value: 'Alborz', label: 'بیمه البرز' },
  { value: 'Dana', label: 'بیمه دانا' },
  { value: 'Parsian', label: 'بیمه پارسیان' },
  { value: 'Razi', label: 'بیمه رازی' },
  { value: 'Sina', label: 'بیمه سینا' },
  { value: 'Melat', label: 'بیمه ملت' },
  { value: 'Other', label: 'سایر' },
]

function labelFor(options, value) {
  return options.find((o) => o.value === value)?.label ?? value
}

export function basicInsuranceLabel(value) {
  return labelFor(BASIC_INSURANCE_OPTIONS, value)
}

export function supplementaryInsuranceLabel(value) {
  return labelFor(SUPPLEMENTARY_INSURANCE_OPTIONS, value)
}
