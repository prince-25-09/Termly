import { LoanOfferFacts } from '../types';

/**
 * Format paise (integer) to formatted Indian Rupee string (e.g. ₹10,000)
 */
export function formatPaiseToRupees(paise: number, includeDecimals = false): string {
  if (isNaN(paise)) return '₹0';
  const rupees = paise / 100;
  
  // Format according to Indian currency system (en-IN)
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeDecimals && rupees % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(rupees);
}

/**
 * Format plain number in Indian numbering system
 */
export function formatIndianNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}

/**
 * Exact arithmetic validation of loan facts using integer paise
 */
export function validateLoanArithmetic(offer: Partial<LoanOfferFacts>): {
  isValid: boolean;
  netDisbursementMatches: boolean;
  repaymentMatches: boolean;
  expectedNetPaise: number;
  expectedRepaymentPaise: number;
  notes: string[];
} {
  const sanctioned = offer.sanctionedAmountPaise || 0;
  const upfrontFee = offer.upfrontFeePaise || 0;
  const statedNet = offer.netDisbursementPaise || 0;
  const statedRepayment = offer.totalScheduledRepaymentPaise || 0;
  
  const expectedNetPaise = sanctioned - upfrontFee;
  const netDisbursementMatches = statedNet === expectedNetPaise;
  
  let calculatedInstalmentSum = 0;
  if (offer.instalments && offer.instalments.length > 0) {
    calculatedInstalmentSum = offer.instalments.reduce((sum, inst) => sum + (inst.amountPaise || 0), 0);
  } else {
    calculatedInstalmentSum = statedRepayment;
  }
  
  const repaymentMatches = statedRepayment === calculatedInstalmentSum;
  const notes: string[] = [];
  
  if (netDisbursementMatches) {
    notes.push(`Net disbursement exact match: ${formatPaiseToRupees(sanctioned)} - ${formatPaiseToRupees(upfrontFee)} = ${formatPaiseToRupees(statedNet)}`);
  } else {
    notes.push(`Discrepancy in Net Payout: Expected ${formatPaiseToRupees(expectedNetPaise)} (${formatPaiseToRupees(sanctioned)} - ${formatPaiseToRupees(upfrontFee)}), but document stated ${formatPaiseToRupees(statedNet)}`);
  }
  
  if (repaymentMatches) {
    notes.push(`Repayment schedule exact match: Sum of ${offer.instalments?.length || 0} instalments = ${formatPaiseToRupees(statedRepayment)}`);
  } else {
    notes.push(`Discrepancy in Scheduled Repayment: Sum of instalments is ${formatPaiseToRupees(calculatedInstalmentSum)}, but total stated is ${formatPaiseToRupees(statedRepayment)}`);
  }
  
  return {
    isValid: netDisbursementMatches && repaymentMatches,
    netDisbursementMatches,
    repaymentMatches,
    expectedNetPaise,
    expectedRepaymentPaise: calculatedInstalmentSum,
    notes
  };
}

/**
 * Accurate Cash-Flow IRR based Annual Percentage Rate (APR) calculation
 * Calculates monthly internal rate of return using Newton-Raphson approximation
 * on actual cash flow: [-NetDisbursed, Instalment 1, Instalment 2, ...]
 */
export function calculateCashFlowApr(
  netDisbursedPaise: number,
  instalmentAmountsPaise: number[],
  monthlyIntervals = 1
): { aprPercent: number; isApproximate: boolean; explanation: string } {
  if (netDisbursedPaise <= 0 || instalmentAmountsPaise.length === 0) {
    return { aprPercent: 0, isApproximate: true, explanation: 'Insufficient data' };
  }
  
  const c0 = -netDisbursedPaise;
  const cashFlows = [c0, ...instalmentAmountsPaise];
  
  // Newton-Raphson for monthly IRR
  let rate = 0.05; // 5% per period initial guess
  const maxIterations = 100;
  const tolerance = 1e-7;
  
  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dNpv = 0;
    
    for (let t = 0; t < cashFlows.length; t++) {
      const discountFactor = Math.pow(1 + rate, t);
      npv += cashFlows[t] / discountFactor;
      if (t > 0) {
        dNpv -= (t * cashFlows[t]) / Math.pow(1 + rate, t + 1);
      }
    }
    
    if (Math.abs(npv) < tolerance) break;
    if (Math.abs(dNpv) < 1e-12) break;
    
    const nextRate = rate - npv / dNpv;
    if (isNaN(nextRate) || nextRate <= -1) break;
    rate = nextRate;
  }
  
  // Annualize: ( (1 + monthlyRate)^(12/interval) - 1 ) * 100
  const periodsPerYear = 12 / monthlyIntervals;
  const annualizedRate = (Math.pow(1 + Math.max(0, rate), periodsPerYear) - 1) * 100;
  
  return {
    aprPercent: Math.round(annualizedRate * 10) / 10,
    isApproximate: false,
    explanation: `Calculated using cash-flow IRR across net cash received (${formatPaiseToRupees(netDisbursedPaise)}) and scheduled EMIs, annualized compounding.`
  };
}
