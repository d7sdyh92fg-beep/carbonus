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

  // Mercedes-Benz SLK premium pricing
  mercedesPricing: {
    weekday: [
      { minDays: 7, maxDays: Infinity, rate: 90 },
      { minDays: 3, maxDays: 7, rate: 100 },
      { minDays: 1, maxDays: 3, rate: 110 },
    ],
    weekend: 120,
    summerPeak: { min: 130, max: 160 },
    packages: {
      romantic: { duration: '4-5 val.', price: '70-90' },
      wedding: { duration: '1 diena', price: '150-200' },
    }
  },
  
  // Get daily rate based on number of days and optional car ID
  getDailyRate: (days: number, carId?: string | number): number => {
    // Check for car-specific pricing override first
    if (carId && PRICING.carSpecificRates[carId.toString()]) {
      return PRICING.carSpecificRates[carId.toString()];
    }

    // Mercedes SLK special pricing
    if (carId && carId.toString() === '6') {
      if (days >= 7) return 90;
      if (days >= 3) return 100;
      return 110;
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

    // Mercedes SLK special pricing
    if (carId && carId.toString() === '6') {
      if (days >= 7) return { rate: 90, labelKey: 'pricing.tier3' };
      if (days >= 3) return { rate: 100, labelKey: 'pricing.tier2' };
      return { rate: 110, labelKey: 'pricing.tier1' };
    }
    
    // Fall back to tiered pricing
    if (days >= 7) return { rate: 30, labelKey: 'pricing.tier3' };
    if (days >= 3) return { rate: 40, labelKey: 'pricing.tier2' };
    return { rate: 50, labelKey: 'pricing.tier1' };
  },
  
  // Check if a car has custom pricing
  hasCustomPricing: (carId: string | number): boolean => {
    return !!PRICING.carSpecificRates[carId.toString()] || carId.toString() === '6';
  },
  
  // Price range display (for car listings)
  priceRange: '€30-€50',
  priceFrom: 'nuo 30 EUR',
  mercedesPriceRange: '€90-€160',
};
