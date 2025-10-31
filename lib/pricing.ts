import type { QuoteFormData } from "@/types";

export interface PricingBreakdown {
  paperCost: number;
  plateCost: number;
  unitCost: number;
  finishingCost: number;
  subtotal: number;
  margin: number;
  vat: number;
  total: number;
}

const MARGIN_RATE = 0.15;
const VAT_RATE = 0.05;

const toNumber = (value: unknown): number => {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
};

const withPrecision = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export function calculatePricing(form: QuoteFormData): PricingBreakdown {
  const paper = form.operational.papers?.[0];
  const fallbackPaperOption = form.products?.[0]?.papers?.[0];
  const pricePerSheet = (() => {
    const explicit = toNumber(paper?.pricePerSheet);
    if (explicit > 0) return explicit;
    return toNumber(fallbackPaperOption?.cost);
  })();
  const enteredSheets = (() => {
    const entered = toNumber(paper?.enteredSheets);
    if (entered > 0) return entered;
    return toNumber(paper?.recommendedSheets);
  })();

  const paperCost = withPrecision(pricePerSheet * enteredSheets);
  const plateCost = withPrecision(toNumber(form.operational.plates));
  const unitCost = withPrecision(toNumber(form.operational.units));
  const finishingCost = withPrecision(
    (form.operational.finishing ?? []).reduce(
      (sum, item) => sum + toNumber(item?.cost),
      0,
    ),
  );

  const subtotal = withPrecision(paperCost + plateCost + unitCost + finishingCost);
  const margin = withPrecision(subtotal * MARGIN_RATE);
  const vatBase = subtotal + margin;
  const vat = withPrecision(vatBase * VAT_RATE);
  const total = withPrecision(vatBase + vat);

  return {
    paperCost,
    plateCost,
    unitCost,
    finishingCost,
    subtotal,
    margin,
    vat,
    total,
  };
}
