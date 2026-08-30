import { LoanOfferFacts, Language } from '../types';
import { formatPaiseToRupees } from './formatters';

export interface FieldDifference {
  fieldKey: string;
  fieldLabelEn: string;
  fieldLabelHi: string;
  category: 'lender' | 'disbursement' | 'interest_apr' | 'repayment' | 'late_consequences' | 'auto_debit' | 'permissions' | 'cooling_off_redressal';
  oldValue: string;
  newValue: string;
  isMaterial: boolean;
  deltaRupees?: number;
  explanationEn: string;
  explanationHi: string;
  affectedTopicIds: string[];
}

export interface TermComparisonResult {
  isMatch: boolean;
  isUnparseable: boolean;
  unparseableReason?: string;
  explainedVersion: string;
  proposedVersion: string;
  explainedHash: string;
  proposedHash: string;
  differences: FieldDifference[];
  materialDifferenceCount: number;
  totalCostChangePaise: number;
  affectedComprehensionTopics: string[];
  reassessmentRequired: boolean;
}

/**
 * Generates a deterministic hash / fingerprint for a LoanOfferFacts object.
 * Note: A hash identifies a document version; it does not establish authenticity or anonymity.
 */
export function generateDocumentHash(offer?: Partial<LoanOfferFacts> | null): string {
  if (!offer) return 'HASH_UNDEFINED';

  const normalized = [
    (offer.lenderName || '').trim().toLowerCase(),
    offer.sanctionedAmountPaise || 0,
    offer.upfrontFeePaise || 0,
    offer.netDisbursementPaise || 0,
    offer.totalScheduledRepaymentPaise || 0,
    (offer.aprDisclosed || '').trim(),
    (offer.interestRateDisclosed || '').trim(),
    offer.coolingOffDays || 0,
    offer.dailyLateFeePaise || 0,
    offer.gracePeriodDays || 0,
    offer.bounceChargePaise || 0,
    (offer.instalments || [])
      .map(i => `${i.instalmentNumber}:${i.dueDate}:${i.amountPaise}`)
      .join('|'),
    (offer.dataPermissions || [])
      .map(p => `${p.id}:${p.isMandatory}`)
      .join('|')
  ].join(':::');

  // Deterministic 32-character hex hash from string
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  
  const hashPart1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hashPart2 = (h2 >>> 0).toString(16).padStart(8, '0');
  
  // Create 32-character sha-like string
  return `sha256_${hashPart1}${hashPart2}${(h1 ^ h2 >>> 0).toString(16).padStart(8, '0')}${(h2 ^ 0xa5a5a5a5 >>> 0).toString(16).padStart(8, '0')}`.substring(0, 40);
}

/**
 * Compares the explained version of a loan with the final proposed contract terms.
 * Distinguishes material financial and legal changes from harmless formatting differences.
 */
export function compareDocumentTerms(
  explained: LoanOfferFacts | null | undefined,
  proposed: LoanOfferFacts | null | undefined
): TermComparisonResult {
  // Check for unparseable / missing document
  if (!explained || !proposed) {
    return {
      isMatch: false,
      isUnparseable: true,
      unparseableReason: 'Final contract document facts could not be parsed or are missing from server buffer.',
      explainedVersion: explained?.documentVersion || 'unknown',
      proposedVersion: proposed?.documentVersion || 'unknown',
      explainedHash: generateDocumentHash(explained),
      proposedHash: generateDocumentHash(proposed),
      differences: [],
      materialDifferenceCount: 1,
      totalCostChangePaise: 0,
      affectedComprehensionTopics: ['lender', 'net_vs_total', 'schedule'],
      reassessmentRequired: true
    };
  }

  // Validate structural integrity of proposed document
  if (
    typeof proposed.sanctionedAmountPaise !== 'number' ||
    typeof proposed.totalScheduledRepaymentPaise !== 'number' ||
    !Array.isArray(proposed.instalments) ||
    proposed.instalments.length === 0
  ) {
    return {
      isMatch: false,
      isUnparseable: true,
      unparseableReason: 'Contract schema invalid: missing numerical amounts or instalment schedule array.',
      explainedVersion: explained.documentVersion,
      proposedVersion: proposed.documentVersion || 'unversioned_corrupted',
      explainedHash: generateDocumentHash(explained),
      proposedHash: generateDocumentHash(proposed),
      differences: [],
      materialDifferenceCount: 1,
      totalCostChangePaise: 0,
      affectedComprehensionTopics: ['net_vs_total', 'schedule'],
      reassessmentRequired: true
    };
  }

  const differences: FieldDifference[] = [];
  const affectedTopicsSet = new Set<string>();
  let totalCostChangePaise = 0;

  // 1. Lender Name
  if (explained.lenderName.trim().toLowerCase() !== proposed.lenderName.trim().toLowerCase()) {
    differences.push({
      fieldKey: 'lenderName',
      fieldLabelEn: 'Lender Entity Name',
      fieldLabelHi: 'लेंडर संस्था का नाम',
      category: 'lender',
      oldValue: explained.lenderName,
      newValue: proposed.lenderName,
      isMaterial: true,
      explanationEn: `The lending institution changed from "${explained.lenderName}" to "${proposed.lenderName}".`,
      explanationHi: `लोन देने वाली संस्था "${explained.lenderName}" से बदलकर "${proposed.lenderName}" हो गई है।`,
      affectedTopicIds: ['card_1_lender']
    });
    affectedTopicsSet.add('card_1_lender');
  }

  // 2. Sanctioned Loan Amount
  if (explained.sanctionedAmountPaise !== proposed.sanctionedAmountPaise) {
    const diff = (proposed.sanctionedAmountPaise - explained.sanctionedAmountPaise) / 100;
    differences.push({
      fieldKey: 'sanctionedAmountPaise',
      fieldLabelEn: 'Sanctioned Loan Amount',
      fieldLabelHi: 'स्वीकृत लोन राशि',
      category: 'disbursement',
      oldValue: formatPaiseToRupees(explained.sanctionedAmountPaise),
      newValue: formatPaiseToRupees(proposed.sanctionedAmountPaise),
      isMaterial: true,
      deltaRupees: diff,
      explanationEn: `Sanctioned loan changed by ${diff > 0 ? '+' : ''}₹${Math.abs(diff)}.`,
      explanationHi: `स्वीकृत लोन राशि में ₹${Math.abs(diff)} का बदलाव हुआ है।`,
      affectedTopicIds: ['card_2_net_vs_total', 'net_vs_total_calculation']
    });
    affectedTopicsSet.add('card_2_net_vs_total');
    affectedTopicsSet.add('net_vs_total_calculation');
  }

  // 3. Upfront Processing Fee
  if (explained.upfrontFeePaise !== proposed.upfrontFeePaise) {
    const diff = (proposed.upfrontFeePaise - explained.upfrontFeePaise) / 100;
    differences.push({
      fieldKey: 'upfrontFeePaise',
      fieldLabelEn: 'Upfront Deducted Fee',
      fieldLabelHi: 'शुरुआती काटा गया शुल्क',
      category: 'disbursement',
      oldValue: formatPaiseToRupees(explained.upfrontFeePaise),
      newValue: formatPaiseToRupees(proposed.upfrontFeePaise),
      isMaterial: true,
      deltaRupees: diff,
      explanationEn: `Upfront fee changed by ${diff > 0 ? '+' : ''}₹${Math.abs(diff)}.`,
      explanationHi: `शुरुआती शुल्क में ₹${Math.abs(diff)} का बदलाव हुआ है।`,
      affectedTopicIds: ['card_2_net_vs_total', 'net_vs_total_calculation']
    });
    affectedTopicsSet.add('card_2_net_vs_total');
    affectedTopicsSet.add('net_vs_total_calculation');
  }

  // 4. Net Disbursed Cash
  if (explained.netDisbursementPaise !== proposed.netDisbursementPaise) {
    const diff = (proposed.netDisbursementPaise - explained.netDisbursementPaise) / 100;
    differences.push({
      fieldKey: 'netDisbursementPaise',
      fieldLabelEn: 'Net Cash Disbursed to Bank',
      fieldLabelHi: 'बैंक खाते में जमा राशि',
      category: 'disbursement',
      oldValue: formatPaiseToRupees(explained.netDisbursementPaise),
      newValue: formatPaiseToRupees(proposed.netDisbursementPaise),
      isMaterial: true,
      deltaRupees: diff,
      explanationEn: `The cash reaching your bank changed from ${formatPaiseToRupees(explained.netDisbursementPaise)} to ${formatPaiseToRupees(proposed.netDisbursementPaise)}.`,
      explanationHi: `आपके खाते में आने वाली राशि ${formatPaiseToRupees(explained.netDisbursementPaise)} से बदलकर ${formatPaiseToRupees(proposed.netDisbursementPaise)} हो गई है।`,
      affectedTopicIds: ['card_2_net_vs_total', 'net_vs_total_calculation']
    });
    affectedTopicsSet.add('card_2_net_vs_total');
    affectedTopicsSet.add('net_vs_total_calculation');
  }

  // 5. Total Scheduled Repayment (CRITICAL CHECK)
  if (explained.totalScheduledRepaymentPaise !== proposed.totalScheduledRepaymentPaise) {
    const diffPaise = proposed.totalScheduledRepaymentPaise - explained.totalScheduledRepaymentPaise;
    const diffRupees = diffPaise / 100;
    totalCostChangePaise += diffPaise;

    differences.push({
      fieldKey: 'totalScheduledRepaymentPaise',
      fieldLabelEn: 'Total Scheduled Repayment',
      fieldLabelHi: 'कुल निर्धारित भुगतान',
      category: 'repayment',
      oldValue: formatPaiseToRupees(explained.totalScheduledRepaymentPaise),
      newValue: formatPaiseToRupees(proposed.totalScheduledRepaymentPaise),
      isMaterial: true,
      deltaRupees: diffRupees,
      explanationEn: `Total repayment rose from ${formatPaiseToRupees(explained.totalScheduledRepaymentPaise)} to ${formatPaiseToRupees(proposed.totalScheduledRepaymentPaise)} (an increase of ${formatPaiseToRupees(diffPaise)}).`,
      explanationHi: `कुल वापसी ${formatPaiseToRupees(explained.totalScheduledRepaymentPaise)} से बढ़कर ${formatPaiseToRupees(proposed.totalScheduledRepaymentPaise)} हो गई है (कुल ${formatPaiseToRupees(diffPaise)} की बढ़ोतरी)।`,
      affectedTopicIds: ['card_2_net_vs_total', 'card_3_schedule', 'net_vs_total_calculation', 'schedule_dates']
    });
    affectedTopicsSet.add('card_2_net_vs_total');
    affectedTopicsSet.add('card_3_schedule');
    affectedTopicsSet.add('net_vs_total_calculation');
    affectedTopicsSet.add('schedule_dates');
  }

  // 6. Instalments Schedule Check
  const countOld = explained.instalments.length;
  const countNew = proposed.instalments.length;
  if (countOld !== countNew) {
    differences.push({
      fieldKey: 'instalmentCount',
      fieldLabelEn: 'Number of Instalments',
      fieldLabelHi: 'किस्तों की संख्या',
      category: 'repayment',
      oldValue: `${countOld} instalments`,
      newValue: `${countNew} instalments`,
      isMaterial: true,
      explanationEn: `Number of instalments changed from ${countOld} to ${countNew}.`,
      explanationHi: `किस्तों की संख्या ${countOld} से बदलकर ${countNew} हो गई है।`,
      affectedTopicIds: ['card_3_schedule', 'schedule_dates']
    });
    affectedTopicsSet.add('card_3_schedule');
    affectedTopicsSet.add('schedule_dates');
  }

  // Compare each instalment
  for (let idx = 0; idx < Math.max(countOld, countNew); idx++) {
    const instOld = explained.instalments[idx];
    const instNew = proposed.instalments[idx];

    if (instOld && instNew) {
      if (instOld.amountPaise !== instNew.amountPaise) {
        const diffRupees = (instNew.amountPaise - instOld.amountPaise) / 100;
        differences.push({
          fieldKey: `instalment_${idx + 1}_amount`,
          fieldLabelEn: `Instalment #${idx + 1} Amount`,
          fieldLabelHi: `किस्त संख्या #${idx + 1} की राशि`,
          category: 'repayment',
          oldValue: formatPaiseToRupees(instOld.amountPaise),
          newValue: formatPaiseToRupees(instNew.amountPaise),
          isMaterial: true,
          deltaRupees: diffRupees,
          explanationEn: `Instalment ${idx + 1} changed from ${formatPaiseToRupees(instOld.amountPaise)} to ${formatPaiseToRupees(instNew.amountPaise)} (${diffRupees > 0 ? '+' : ''}₹${diffRupees}).`,
          explanationHi: `किस्त ${idx + 1} की राशि ${formatPaiseToRupees(instOld.amountPaise)} से बदलकर ${formatPaiseToRupees(instNew.amountPaise)} हो गई है (${diffRupees > 0 ? '+' : ''}₹${diffRupees})।`,
          affectedTopicIds: ['card_3_schedule', 'schedule_dates']
        });
        affectedTopicsSet.add('card_3_schedule');
        affectedTopicsSet.add('schedule_dates');
      }

      if (instOld.dueDate.trim() !== instNew.dueDate.trim()) {
        differences.push({
          fieldKey: `instalment_${idx + 1}_date`,
          fieldLabelEn: `Instalment #${idx + 1} Due Date`,
          fieldLabelHi: `किस्त संख्या #${idx + 1} की देय तिथि`,
          category: 'repayment',
          oldValue: instOld.dueDate,
          newValue: instNew.dueDate,
          isMaterial: true,
          explanationEn: `Due date for Instalment ${idx + 1} shifted from ${instOld.dueDate} to ${instNew.dueDate}.`,
          explanationHi: `किस्त ${idx + 1} की देय तिथि ${instOld.dueDate} से बदलकर ${instNew.dueDate} हो गई है।`,
          affectedTopicIds: ['card_3_schedule', 'schedule_dates']
        });
        affectedTopicsSet.add('card_3_schedule');
        affectedTopicsSet.add('schedule_dates');
      }
    }
  }

  // 7. Interest / APR
  if (explained.aprDisclosed.trim() !== proposed.aprDisclosed.trim()) {
    differences.push({
      fieldKey: 'aprDisclosed',
      fieldLabelEn: 'Annual Percentage Rate (APR)',
      fieldLabelHi: 'वार्षिक लागत दर (APR)',
      category: 'interest_apr',
      oldValue: explained.aprDisclosed,
      newValue: proposed.aprDisclosed,
      isMaterial: true,
      explanationEn: `Disclosed APR changed from ${explained.aprDisclosed} to ${proposed.aprDisclosed}.`,
      explanationHi: `दर्शाई गई APR दर ${explained.aprDisclosed} से बदलकर ${proposed.aprDisclosed} हो गई है।`,
      affectedTopicIds: ['card_4_interest_apr']
    });
    affectedTopicsSet.add('card_4_interest_apr');
  }

  // 8. Late Payment Terms
  if (
    explained.dailyLateFeePaise !== proposed.dailyLateFeePaise ||
    explained.gracePeriodDays !== proposed.gracePeriodDays
  ) {
    differences.push({
      fieldKey: 'latePaymentTerms',
      fieldLabelEn: 'Late Payment Fee / Grace Window',
      fieldLabelHi: 'विलंब शुल्क और छूट अवधि',
      category: 'late_consequences',
      oldValue: `₹${explained.dailyLateFeePaise / 100}/day (${explained.gracePeriodDays} days grace)`,
      newValue: `₹${proposed.dailyLateFeePaise / 100}/day (${proposed.gracePeriodDays} days grace)`,
      isMaterial: true,
      explanationEn: `Late fee or grace period terms were modified.`,
      explanationHi: `विलंब शुल्क या छूट अवधि की शर्तों में बदलाव किया गया है।`,
      affectedTopicIds: ['card_5_late_consequences', 'late_consequences_grace']
    });
    affectedTopicsSet.add('card_5_late_consequences');
    affectedTopicsSet.add('late_consequences_grace');
  }

  // 9. Auto-debit & Bounce Charge
  if (explained.bounceChargePaise !== proposed.bounceChargePaise) {
    differences.push({
      fieldKey: 'bounceChargePaise',
      fieldLabelEn: 'Auto-Debit Bounce Charge',
      fieldLabelHi: 'ऑटो-डेबिट बाउंस शुल्क',
      category: 'auto_debit',
      oldValue: formatPaiseToRupees(explained.bounceChargePaise),
      newValue: formatPaiseToRupees(proposed.bounceChargePaise),
      isMaterial: true,
      explanationEn: `Bank auto-debit bounce penalty changed from ${formatPaiseToRupees(explained.bounceChargePaise)} to ${formatPaiseToRupees(proposed.bounceChargePaise)}.`,
      explanationHi: `ऑटो-डेबिट बाउंस शुल्क ${formatPaiseToRupees(explained.bounceChargePaise)} से बदलकर ${formatPaiseToRupees(proposed.bounceChargePaise)} हो गया है।`,
      affectedTopicIds: ['card_6_auto_debit']
    });
    affectedTopicsSet.add('card_6_auto_debit');
  }

  // 10. Cooling-off Window
  if (explained.coolingOffDays !== proposed.coolingOffDays) {
    differences.push({
      fieldKey: 'coolingOffDays',
      fieldLabelEn: 'Cooling-Off Exit Window',
      fieldLabelHi: 'कूलिंग-ऑफ रद्दीकरण अवधि',
      category: 'cooling_off_redressal',
      oldValue: `${explained.coolingOffDays} Days`,
      newValue: `${proposed.coolingOffDays} Days`,
      isMaterial: true,
      explanationEn: `Cooling off cancellation period changed from ${explained.coolingOffDays} to ${proposed.coolingOffDays} days.`,
      explanationHi: `कूलिंग-ऑफ अवधि ${explained.coolingOffDays} दिन से बदलकर ${proposed.coolingOffDays} दिन हो गई है।`,
      affectedTopicIds: ['card_8_cooling_off_redressal']
    });
    affectedTopicsSet.add('card_8_cooling_off_redressal');
  }

  // 11. Data Permissions
  const oldPerms = (explained.dataPermissions || []).map(p => `${p.id}:${p.isMandatory}`).sort().join(';');
  const newPerms = (proposed.dataPermissions || []).map(p => `${p.id}:${p.isMandatory}`).sort().join(';');
  if (oldPerms !== newPerms) {
    differences.push({
      fieldKey: 'dataPermissions',
      fieldLabelEn: 'Data Permissions Requested',
      fieldLabelHi: 'मांगी गई डेटा अनुमतियां',
      category: 'permissions',
      oldValue: `${explained.dataPermissions.length} permissions`,
      newValue: `${proposed.dataPermissions.length} permissions`,
      isMaterial: true,
      explanationEn: `Requested mobile device permissions changed.`,
      explanationHi: `मांगी गई मोबाइल डेटा अनुमतियों में बदलाव हुआ है।`,
      affectedTopicIds: ['card_7_permissions', 'permissions_contacts_ban']
    });
    affectedTopicsSet.add('card_7_permissions');
    affectedTopicsSet.add('permissions_contacts_ban');
  }

  const isMatch = differences.length === 0;

  return {
    isMatch,
    isUnparseable: false,
    explainedVersion: explained.documentVersion,
    proposedVersion: proposed.documentVersion,
    explainedHash: generateDocumentHash(explained),
    proposedHash: generateDocumentHash(proposed),
    differences,
    materialDifferenceCount: differences.filter(d => d.isMaterial).length,
    totalCostChangePaise,
    affectedComprehensionTopics: Array.from(affectedTopicsSet),
    reassessmentRequired: differences.length > 0
  };
}
