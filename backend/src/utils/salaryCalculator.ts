export interface SalaryComponent {
  name: string;
  computationType: 'fixed' | 'percent';
  value: number; // percentage or fixed value input
  computedAmount: number;
}

export interface SalaryCalculationResult {
  components: SalaryComponent[];
  isValid: boolean;
  error?: string;
}

/**
 * Calculates salary components from a given wage.
 * All calculations are converted to monthly values for components computation.
 * If wagePeriod is 'yearly', wageAmount is divided by 12.
 */
export function calculateSalaryComponents(
  wageAmount: number,
  wagePeriod: 'monthly' | 'yearly',
  performanceBonusPercent: number = 8.33 // Default from spec: 8.33% of Basic
): SalaryCalculationResult {
  // Convert to monthly wage for calculation
  const monthlyWage = wagePeriod === 'yearly' ? wageAmount / 12 : wageAmount;

  // 1. Basic Salary: 50% of Wage
  const basicSalary = 0.5 * monthlyWage;

  // 2. House Rent Allowance (HRA): 50% of Basic
  const hra = 0.5 * basicSalary;

  // 3. Standard Allowance: Fixed ₹4,167/month
  const standardAllowance = 4167;

  // 4. Performance Bonus: default 8.33% of Basic (company defined %)
  const performanceBonus = (performanceBonusPercent / 100) * basicSalary;

  // 5. Leave Travel Allowance (LTA): 8.333% of Basic
  const lta = (8.333 / 100) * basicSalary;

  // Sum of computed components so far
  const sumOtherComponents = basicSalary + hra + standardAllowance + performanceBonus + lta;

  // Validation: sum of components must not exceed monthly wage
  if (sumOtherComponents > monthlyWage) {
    return {
      components: [],
      isValid: false,
      error: `Sum of components (Basic: ${basicSalary.toFixed(2)}, HRA: ${hra.toFixed(2)}, Standard Allowance: ${standardAllowance}, Performance Bonus: ${performanceBonus.toFixed(2)}, LTA: ${lta.toFixed(2)}) is ${sumOtherComponents.toFixed(2)}, which exceeds the monthly wage of ${monthlyWage.toFixed(2)}. Please increase the Wage.`,
    };
  }

  // 6. Fixed Allowance: Wage - sum of all other components
  const fixedAllowance = monthlyWage - sumOtherComponents;

  const components: SalaryComponent[] = [
    {
      name: 'Basic Salary',
      computationType: 'percent',
      value: 50.0,
      computedAmount: basicSalary,
    },
    {
      name: 'House Rent Allowance (HRA)',
      computationType: 'percent',
      value: 50.0, // 50% of basic
      computedAmount: hra,
    },
    {
      name: 'Standard Allowance',
      computationType: 'fixed',
      value: standardAllowance,
      computedAmount: standardAllowance,
    },
    {
      name: 'Performance Bonus',
      computationType: 'percent',
      value: performanceBonusPercent,
      computedAmount: performanceBonus,
    },
    {
      name: 'Leave Travel Allowance (LTA)',
      computationType: 'percent',
      value: 8.333,
      computedAmount: lta,
    },
    {
      name: 'Fixed Allowance',
      computationType: 'fixed',
      value: fixedAllowance,
      computedAmount: fixedAllowance,
    },
  ];

  return {
    components,
    isValid: true,
  };
}
