import _ from "lodash";

const STOCK = new Map();

export function restock(sku, qty) {
  if (qty <= 0) throw new Error("qty must be positive");
  STOCK.set(sku, (STOCK.get(sku) || 0) + qty);
  return STOCK.get(sku);
}

export function reserve(sku, qty) {
  const cur = STOCK.get(sku) || 0;
  if (cur < qty) return false;
  STOCK.set(sku, cur - qty);
  return true;
}

export function level(sku) {
  return STOCK.get(sku) || 0;
}

export function snapshot() {
  return _.cloneDeep(Object.fromEntries(STOCK));
}

export function lowStock(threshold = 5) {
  const out = [];
  for (const [sku, qty] of STOCK.entries()) {
    if (qty < threshold) out.push({ sku, qty });
  }
  return out;
}

export function reset() {
  STOCK.clear();
}
