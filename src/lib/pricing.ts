// ============================================================================
// Shared pricing helpers for admin-configured weight/quantity options.
//
// A product's `weight_options` column (JSONB) holds an array of entries.
// Each entry is either:
//   - a plain number, e.g. 5            -> legacy shape, no special price
//   - an object, e.g. { weight: 5, price: 250 } -> admin-set special price
//
// `price: null` (or omitted) on an entry means "no special offer for this
// weight" -> fall back to the normal linear price (basePrice × weight).
//
// This file is the SINGLE source of truth for turning those raw values into
// an actual rupee amount, so the admin page, the product modal, the cart,
// and checkout all agree on what a customer is charged.
// ============================================================================

export interface WeightOption {
  weight: number;
  price: number | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeWeightOptions(raw: any): WeightOption[] {
  let wo = raw;
  if (typeof wo === 'string') {
    try { wo = JSON.parse(wo); } catch { wo = []; }
  }
  if (!Array.isArray(wo)) return [];
  return wo
    .map((entry: unknown): WeightOption | null => {
      if (entry && typeof entry === 'object') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const e = entry as any;
        const weight = Number(e.weight);
        if (isNaN(weight)) return null;
        const price = e.price === undefined || e.price === null || e.price === '' ? null : Number(e.price);
        return { weight, price: price !== null && !isNaN(price) ? price : null };
      }
      const weight = Number(entry);
      if (isNaN(weight)) return null;
      return { weight, price: null };
    })
    .filter((o): o is WeightOption => o !== null);
}

// Total rupee amount to charge for `quantity` (kg) of `product`, honoring
// any admin-configured special price for that exact weight. Range-mode
// products are always linear (basePrice × quantity) since there's no
// discrete list of weights to attach a special price to.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getEffectiveLineTotal(product: any, quantity: number): number {
  const basePrice = Number(product?.price) || 0;
  const qty = Number(quantity) || 0;
  if (!product || product.weight_mode !== 'fixed') {
    return basePrice * qty;
  }
  const options = normalizeWeightOptions(product.weight_options);
  const match = options.find(o => o.weight === qty);
  if (match && match.price !== null) return match.price;
  return basePrice * qty;
}

// Effective per-unit price implied by the line total (used when a per-unit
// price needs to be stored, e.g. order_items.unit_price).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getEffectiveUnitPrice(product: any, quantity: number): number {
  const qty = Number(quantity) || 1;
  return getEffectiveLineTotal(product, qty) / qty;
}

// Some products have their "Selling Unit" field typed as "1 kg" instead of
// just "kg" (the admin form's own placeholder suggests "e.g. 1 kg"). Display
// code that already shows a quantity next to the unit (e.g. "5 {unit}" or
// "1 {unit}") only wants the bare unit suffix, so strip any leading number
// before showing it -- otherwise it renders as "5 1 kg" / "1 1 kg".
export function cleanUnitLabel(unit: unknown): string {
  const s = String(unit ?? '').trim();
  const stripped = s.replace(/^\d+(\.\d+)?\s*/, '').trim();
  return stripped || 'kg';
}
