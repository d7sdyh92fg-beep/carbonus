// Centralized pricing configuration
export const PRICING = {
  // Car-specific pricing overrides (bypasses tiered pricing)
  carSpecificRates: {} as Record<string, number>,
  
  // Tiered daily rates based on rental duration
  dailyRates: {
    tier1: { minDays: 1, maxDays: 3, rate: 50, labelKey: 'pricing.tier1' },
    tier2: { minDays: 3, maxDays: 7, rate: 40, labelKey: 'pricing.tier2' },
    tier3: { minDays: 7, maxDays: Infinity, rate: 30, labelKey: 'pricing.tier3' }
  },
  
  // Get daily rate based on number of days and optional car ID
  getDailyRate: (days: number, carId?: string | number): number => {
    // Check for car-specific pricing override first
    if (carId && PRICING.carSpecificRates[carId.toString()]) {
      return PRICING.carSpecificRates[carId.toString()];
    }
    
    // Fall back to tiered pricing
    if (days >= 7) return 30;
    if (days >= 3) return 40;
    return 50;
  },
  
  // Get pricing tier information
  getPricingTier: (days: number, carId?: string | number): { rate: number, labelKey: string } => {
    // Check for car-specific pricing override first
    if (carId && PRICING.carSpecificRates[carId.toString()]) {
      const rate = PRICING.carSpecificRates[carId.toString()];
      return { rate, labelKey: 'pricing.fixedRate' };
    }
    
    // Fall back to tiered pricing
    if (days >= 7) return { rate: 30, labelKey: 'pricing.tier3' };
    if (days >= 3) return { rate: 40, labelKey: 'pricing.tier2' };
    return { rate: 50, labelKey: 'pricing.tier1' };
  },
  
  // Check if a car has custom pricing
  hasCustomPricing: (carId: string | number): boolean => {
    return !!PRICING.carSpecificRates[carId.toString()];
  },
  
  // Price range display (for car listings)
  priceRange: '€30-€50',
  priceFrom: 'nuo 30 EUR',
};
