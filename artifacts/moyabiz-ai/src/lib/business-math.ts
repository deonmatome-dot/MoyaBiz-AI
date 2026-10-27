export type ProfitSummary = {
  revenue: number;
  totalCost: number;
  grossProfit: number;
  profitMargin: number;
};

export type QuoteLineAmount = {
  quantity: string;
  unitPrice: string;
};

function toCents(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100);
}

function fromCents(cents: number): number {
  return cents / 100;
}

export function parseCurrencyInput(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+(?:\.\d{0,2})?$/.test(trimmed)) return null;
  const amount = Number(trimmed);
  if (!Number.isFinite(amount)) return null;
  const cents = toCents(amount);
  return Number.isSafeInteger(cents) ? fromCents(cents) : null;
}

export function parsePositiveQuantity(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const quantity = Number(trimmed);
  return Number.isSafeInteger(quantity) && quantity > 0 ? quantity : null;
}

export function calculateProfitSummary(
  totalCost: number,
  sellingPricePerItem: number,
  quantity: number,
): ProfitSummary | null {
  if (
    !Number.isFinite(totalCost) ||
    !Number.isFinite(sellingPricePerItem) ||
    !Number.isSafeInteger(quantity) ||
    totalCost < 0 ||
    sellingPricePerItem <= 0 ||
    quantity < 1
  ) {
    return null;
  }

  const totalCostCents = toCents(totalCost);
  const revenueCents = toCents(sellingPricePerItem) * quantity;
  if (
    !Number.isSafeInteger(totalCostCents) ||
    !Number.isSafeInteger(revenueCents)
  ) {
    return null;
  }

  const grossProfitCents = revenueCents - totalCostCents;
  return {
    revenue: fromCents(revenueCents),
    totalCost: fromCents(totalCostCents),
    grossProfit: fromCents(grossProfitCents),
    profitMargin: (grossProfitCents / revenueCents) * 100,
  };
}

export function calculateQuoteLineTotal(
  quantityInput: string,
  unitPriceInput: string,
): number | null {
  const quantity = parsePositiveQuantity(quantityInput);
  const unitPrice = parseCurrencyInput(unitPriceInput);
  if (quantity === null || unitPrice === null) return null;

  const totalCents = toCents(unitPrice) * quantity;
  return Number.isSafeInteger(totalCents) ? fromCents(totalCents) : null;
}

export function calculateQuoteTotal(
  lines: QuoteLineAmount[],
): number | null {
  if (lines.length === 0) return null;

  let totalCents = 0;
  for (const line of lines) {
    const lineTotal = calculateQuoteLineTotal(
      line.quantity,
      line.unitPrice,
    );
    if (lineTotal === null) return null;
    totalCents += toCents(lineTotal);
    if (!Number.isSafeInteger(totalCents)) return null;
  }

  return fromCents(totalCents);
}
