const calculatePit = (taxableIncome: number): number => {
  const brackets = [
    { limit: 5000000, rate: 0.05 },
    { limit: 10000000, rate: 0.10 },
    { limit: 18000000, rate: 0.15 },
    { limit: 32000000, rate: 0.20 },
    { limit: 52000000, rate: 0.25 },
    { limit: 80000000, rate: 0.30 },
    { limit: Infinity, rate: 0.35 }
  ];
  let tax = 0;
  let remaining = taxableIncome;
  let previousLimit = 0;
  for (const bracket of brackets) {
    const bracketAmount = Math.min(remaining, bracket.limit - previousLimit);
    if (bracketAmount <= 0) break;
    tax += bracketAmount * bracket.rate;
    remaining -= bracketAmount;
    previousLimit = bracket.limit;
  }
  return Math.round(tax);
};
const calculateInsurance = (baseSalary: number, rates: { si: number; hi: number; ui: number }) => {
  const maxSalaryForInsurance = 36000000;
  const base = Math.min(baseSalary, maxSalaryForInsurance);
  return {
    socialInsurance: Math.round(base * (rates.si / 100)),
    healthInsurance: Math.round(base * (rates.hi / 100)),
    unemploymentInsurance: Math.round(base * (rates.ui / 100)),
    total: Math.round(base * ((rates.si + rates.hi + rates.ui) / 100))
  };
};
export const calculateNetFromGross = (grossSalary: number, dependents: number = 0) => {
  const insurance = calculateInsurance(grossSalary, { si: 8, hi: 1.5, ui: 1 });
  const personalDeduction = 11000000;
  const dependentDeduction = dependents * 4400000;
  const taxableIncome = Math.max(0, grossSalary - insurance.total - personalDeduction - dependentDeduction);
  const pit = calculatePit(taxableIncome);
  return {
    grossSalary,
    socialInsurance: insurance.socialInsurance,
    healthInsurance: insurance.healthInsurance,
    unemploymentInsurance: insurance.unemploymentInsurance,
    totalInsurance: insurance.total,
    personalDeduction,
    dependentDeduction,
    taxableIncome,
    personalIncomeTax: pit,
    netSalary: grossSalary - insurance.total - pit
  };
};