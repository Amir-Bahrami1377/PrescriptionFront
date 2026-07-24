/** Persian labels for basic insurance types — the values themselves come from GET /api/orders/basic-insurance-types. */
const LABELS = {
  None: 'فاقد بیمه پایه',
  SocialSecurity: 'تامین اجتماعی',
  HealthServices: 'بیمه سلامت',
  ArmedForces: 'نیروهای مسلح',
  Other: 'سایر',
}

export function basicInsuranceLabel(value) {
  return LABELS[value] ?? value
}
