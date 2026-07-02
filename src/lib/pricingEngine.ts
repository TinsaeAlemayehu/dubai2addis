export interface PricingSettings {
  exchangeRates: Record<string, number>; // e.g. { AED: 31, USD: 115 }
  shippingPercentage: number;          // e.g. 20 (meaning 20%)
  handlingPercentage: number;          // e.g. 5 (meaning 5%)
  riskBufferPercentage: number;        // e.g. 3 (meaning 3%)
  profitPercentage: number;            // e.g. 15 (meaning 15%)
  fixedFeeETB: number;                 // e.g. 200 (optional fixed fee in ETB)
  roundingRule: string;                // 'None' | 'nearest_10' | 'nearest_25' | 'nearest_50' | 'nearest_100'
}

export interface PricingBreakdown {
  supplierPrice: number;
  supplierCurrency: string;
  exchangeRateUsed: number;
  basePriceETB: number;
  shippingCostETB: number;
  handlingCostETB: number;
  riskBufferCostETB: number;
  profitAmountETB: number;
  fixedFeeETB: number;
  unroundedTotalETB: number;
  roundedTotalETB: number;
  roundingRule: string;
}

export const DEFAULT_PRICING_SETTINGS: PricingSettings = {
  exchangeRates: { AED: 31.0, USD: 115.0 },
  shippingPercentage: 20.0,
  handlingPercentage: 5.0,
  riskBufferPercentage: 3.0,
  profitPercentage: 15.0,
  fixedFeeETB: 0,
  roundingRule: 'None',
};

/**
 * Apply the selected rounding rule to an ETB value.
 */
export function applyRounding(value: number, rule: string): number {
  switch (rule) {
    case 'nearest_10':
    case 'nearest 10':
      return Math.round(value / 10) * 10;
    case 'nearest_25':
    case 'nearest 25':
      return Math.round(value / 25) * 25;
    case 'nearest_50':
    case 'nearest 50':
      return Math.round(value / 50) * 50;
    case 'nearest_100':
    case 'nearest 100':
      return Math.round(value / 100) * 100;
    case 'None':
    default:
      return Math.round(value); // Default to integer rounding
  }
}

/**
 * Calculate customer-facing ETB price from supplier price and currency.
 */
export function calculateSellingPrice(
  supplierPrice: number,
  currency: string = 'AED',
  settings: Partial<PricingSettings> = {}
): PricingBreakdown {
  const mergedSettings: PricingSettings = {
    ...DEFAULT_PRICING_SETTINGS,
    ...settings,
    exchangeRates: {
      ...DEFAULT_PRICING_SETTINGS.exchangeRates,
      ...(settings.exchangeRates || {}),
    },
  };

  const rate = mergedSettings.exchangeRates[currency.toUpperCase()] || 1.0;
  const basePriceETB = supplierPrice * rate;

  const shippingCostETB = basePriceETB * (mergedSettings.shippingPercentage / 100);
  const handlingCostETB = basePriceETB * (mergedSettings.handlingPercentage / 100);
  const riskBufferCostETB = basePriceETB * (mergedSettings.riskBufferPercentage / 100);
  const profitAmountETB = basePriceETB * (mergedSettings.profitPercentage / 100);

  const unroundedTotalETB =
    basePriceETB +
    shippingCostETB +
    handlingCostETB +
    riskBufferCostETB +
    profitAmountETB +
    mergedSettings.fixedFeeETB;

  const roundedTotalETB = applyRounding(unroundedTotalETB, mergedSettings.roundingRule);

  return {
    supplierPrice,
    supplierCurrency: currency.toUpperCase(),
    exchangeRateUsed: rate,
    basePriceETB,
    shippingCostETB,
    handlingCostETB,
    riskBufferCostETB,
    profitAmountETB,
    fixedFeeETB: mergedSettings.fixedFeeETB,
    unroundedTotalETB,
    roundedTotalETB,
    roundingRule: mergedSettings.roundingRule,
  };
}
