export type TranslateFn = (...args: any[]) => string

export const orderStatusLabel = (t: TranslateFn, status?: string) => {
  if (!status) return '-'
  const map: Record<string, string> = {
    pending_payment: t('order.status.pending_payment'),
    paid: t('order.status.paid'),
    fulfilling: t('order.status.fulfilling'),
    partially_delivered: t('order.status.partially_delivered'),
    delivered: t('order.status.delivered'),
    completed: t('order.status.completed'),
    expired: t('order.status.expired'),
    canceled: t('order.status.canceled'),
  }
  return map[status] || status
}

export const orderStatusClass = (status?: string) => {
  switch (status) {
    case 'pending_payment':
      return 'theme-badge-warning'
    case 'paid':
      return 'theme-badge-success'
    case 'partially_delivered':
      return 'theme-badge-info'
    case 'fulfilling':
      return 'theme-badge-accent'
    case 'delivered':
    case 'completed':
      return 'theme-badge-success'
    case 'expired':
      return 'theme-badge-danger'
    case 'canceled':
      return 'theme-badge-neutral'
    default:
      return 'theme-badge-neutral'
  }
}
