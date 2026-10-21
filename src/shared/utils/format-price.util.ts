const VND_FORMAT = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 2 });

/** Amount (VND) → display text: `150.000 ₫`, `12.500,5 ₫`. Same output as web. */
export function formatPrice(amount: number): string {
  return VND_FORMAT.format(amount);
}
