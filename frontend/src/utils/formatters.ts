export function formatCurrency(value: number | string, locale = 'pt-BR', currency = 'BRL'): string {
  const number = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(number);
}

export function formatDate(dateStr: string, locale = 'pt-BR'): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale);
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
