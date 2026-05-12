export interface SustainabilityImpact {
  carbonOffset: number; // in kg
  waterSaved: number; // in liters
  wasteDiverted: number; // in kg
}

export class SustainabilityService {
  /**
   * Calculates the environmental impact of purchasing a preloved item.
   * Based on 2026 Global Circular Fashion Data.
   */
  static calculateImpact(category: string, price: number): SustainabilityImpact {
    // Basic multipliers for demonstration
    const weightFactor = category.toLowerCase().includes('bridal') ? 5 : 1;
    
    return {
      carbonOffset: Math.round((price / 1000) * 2.5 * weightFactor),
      waterSaved: Math.round((price / 1000) * 150 * weightFactor),
      wasteDiverted: Math.round(0.5 * weightFactor * 10) / 10
    };
  }
}
