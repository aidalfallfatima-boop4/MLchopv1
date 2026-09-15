export function formatPrice(price: number): string {
  const safe = Number.isFinite(price) ? Math.round(price) : 0;
  const formatted = String(safe).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${formatted} FCFA`;
}
