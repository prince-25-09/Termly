import { LoanOfferFacts } from '../types';

export const SAMPLE_OFFERS: LoanOfferFacts[] = [
  {
    id: 'offer-kfs-001',
    offerCode: 'KFS-2026-STD-001',
    documentTitle: 'Key Fact Statement (KFS) — Standard Starter Loan',
    documentVersion: 'v1.0 (Standard Offer)',
    lenderName: 'Demo Lender — not a real institution',
    isFictional: true,
    sanctionedAmountPaise: 1000000, // ₹10,000
    upfrontFeePaise: 50000,         // ₹500 (5%)
    netDisbursementPaise: 950000,   // ₹9,500
    totalScheduledRepaymentPaise: 1120000, // ₹11,200 (2 x ₹5,600)
    interestRateDisclosed: '18.0% p.a. (Reducing balance basis)',
    aprDisclosed: 'Pending verified calculation',
    isAprVerified: false,
    disbursementDate: '30 August 2026',
    tenureMonths: 2,
    instalments: [
      {
        instalmentNumber: 1,
        dueDate: '30 September 2026',
        amountPaise: 560000, // ₹5,600
        principalPartPaise: 490000, // ₹4,900
        interestPartPaise: 70000,   // ₹700
      },
      {
        instalmentNumber: 2,
        dueDate: '30 October 2026',
        amountPaise: 560000, // ₹5,600
        principalPartPaise: 510000, // ₹5,100
        interestPartPaise: 50000,   // ₹500
      }
    ],
    latePaymentTerms: '₹50 per day late penalty up to a maximum cap of ₹250. 3-day grace period where no penalty is charged.',
    latePaymentTermsHi: 'विलंब पर ₹50 प्रतिदिन का जुर्माना (अधिकतम सीमा ₹250)। 3 दिन की छूट अवधि जिसमें कोई अतिरिक्त शुल्क नहीं लगेगा।',
    dailyLateFeePaise: 5000, // ₹50
    gracePeriodDays: 3,
    autoDebitTerms: 'e-NACH / UPI mandate debited between 6:00 AM – 10:00 AM on the due date. Failed auto-debit triggers ₹150 bank bounce charge.',
    autoDebitTermsHi: 'देय तिथि पर सुबह 6:00 से 10:00 बजे के बीच e-NACH/UPI ऑटो-डेबिट। बाउंस होने पर बैंक द्वारा ₹150 का चार्ज लिया जा सकता है।',
    bounceChargePaise: 15000, // ₹150
    coolingOffDays: 3,
    coolingOffDetails: '3 calendar days cooling-off window. Cancel without penalty by returning principal (₹9,500) plus proportionate daily interest (approx ₹14/day). Upfront fee refunded.',
    coolingOffDetailsHi: '3 कैलेंडर दिनों की कूलिंग-ऑफ विंडो। मूलधन (₹9,500) और दैनिक आनुपातिक ब्याज (लगभग ₹14/दिन) लौटाकर बिना जुर्माने के रद्द करें। शुरुआती शुल्क वापस होगा।',
    dataPermissions: [
      {
        id: 'perm-sms',
        name: 'SMS Access for Financial Transactions',
        nameHi: 'वित्तीय लेन-देन के लिए SMS अनुमति',
        purpose: 'Verify income credits and EMI debit reminders only. Personal chat messages are never read or stored.',
        purposeHi: 'केवल आय जमा और ईएमआई रिमाइंडर सत्यापित करने के लिए। व्यक्तिगत चैट संदेश कभी नहीं पढ़े जाते।',
        isMandatory: true,
        userRevocable: false,
        category: 'financial'
      },
      {
        id: 'perm-location',
        name: 'Approximate Location (Coarse)',
        nameHi: 'अनुमानित स्थान (मोटा-मोटा)',
        purpose: 'Verify borrower onboarding from supported Indian state jurisdictions for regulatory compliance.',
        purposeHi: 'नियामक अनुपालन के लिए समर्थित भारतीय राज्यों से उधारकर्ता की पुष्टि करना।',
        isMandatory: true,
        userRevocable: false,
        category: 'device'
      },
      {
        id: 'perm-contacts',
        name: 'Contact List Access',
        nameHi: 'संपर्क सूची (कॉन्टैक्ट्स)',
        purpose: 'NOT REQUIRED. In accordance with RBI Digital Lending Guidelines, contact book harvesting is strictly prohibited.',
        purposeHi: 'आवश्यक नहीं है। आरबीआई डिजिटल लेंडिंग दिशानिर्देशों के तहत पूरी कॉन्टैक्ट बुक लेना सख्त प्रतिबंधित है।',
        isMandatory: false,
        userRevocable: true,
        category: 'contact'
      }
    ],
    complaintOfficer: {
      name: 'Ms. Sunita Sharma',
      designation: 'Principal Nodal Grievance Officer',
      email: 'nodal.officer@demolender.fictional.in',
      phone: '1800-000-DEMO (10:00 AM - 6:00 PM Mon-Fri)',
      ombudsmanPortal: 'https://cms.rbi.org.in (RBI Complaints Management System)',
      address: 'Tower B, 4th Floor, FinTech Park, Demo City, India 110001'
    },
    excerpts: [
      { field: 'Sanctioned Amount', page: 1, text: 'Sanctioned Loan Principal: INR 10,000.00 (Rupees Ten Thousand only)' },
      { field: 'Processing Fee', page: 1, text: 'Upfront Documentation & Processing Fee: INR 500.00 (Inclusive of 18% GST)' },
      { field: 'Net Payout', page: 1, text: 'Net Disbursed Amount to Borrower Account: INR 9,500.00' },
      { field: 'Repayment Schedule', page: 2, text: 'Instalment 1 due on 30/09/2026: INR 5,600.00; Instalment 2 due on 30/10/2026: INR 5,600.00. Total: INR 11,200.00' },
      { field: 'Cooling-off Period', page: 2, text: 'Borrower is entitled to a 3-day cooling-off / look-up period from the date of disbursement to exit without penalty.' }
    ],
    validationStatus: 'approved',
    validationNotes: [
      'Verified: Net disbursement (₹9,500) = Sanctioned (₹10,000) - Upfront Fee (₹500)',
      'Verified: Total Repayment (₹11,200) = Sum of 2 instalments of ₹5,600',
      'All regulatory disclosures (KFS, Grievance contact, Cooling-off) conform to RBI Digital Lending Directions'
    ]
  },
  {
    id: 'offer-kfs-002',
    offerCode: 'KFS-2026-REV-002',
    documentTitle: 'Key Fact Statement (KFS) — Revised 3-Month Loan',
    documentVersion: 'v1.1 (Revised Offer)',
    lenderName: 'Demo Lender — not a real institution',
    isFictional: true,
    sanctionedAmountPaise: 1500000, // ₹15,000
    upfrontFeePaise: 60000,         // ₹600 (4%)
    netDisbursementPaise: 1440000,   // ₹14,400
    totalScheduledRepaymentPaise: 1635000, // ₹16,350 (3 x ₹5,450)
    interestRateDisclosed: '16.5% p.a. (Reducing balance basis)',
    aprDisclosed: 'Pending verified calculation',
    isAprVerified: false,
    disbursementDate: '30 August 2026',
    tenureMonths: 3,
    instalments: [
      {
        instalmentNumber: 1,
        dueDate: '30 September 2026',
        amountPaise: 545000, // ₹5,450
        principalPartPaise: 480000,
        interestPartPaise: 65000,
      },
      {
        instalmentNumber: 2,
        dueDate: '30 October 2026',
        amountPaise: 545000, // ₹5,450
        principalPartPaise: 500000,
        interestPartPaise: 45000,
      },
      {
        instalmentNumber: 3,
        dueDate: '30 November 2026',
        amountPaise: 545000, // ₹5,450
        principalPartPaise: 520000,
        interestPartPaise: 25000,
      }
    ],
    latePaymentTerms: '₹60 per day late penalty up to a maximum cap of ₹300. 3-day grace period.',
    latePaymentTermsHi: 'विलंब पर ₹60 प्रतिदिन का जुर्माना (अधिकतम ₹300)। 3 दिन की छूट अवधि।',
    dailyLateFeePaise: 6000,
    gracePeriodDays: 3,
    autoDebitTerms: 'e-NACH / UPI mandate debited between 6:00 AM – 10:00 AM. Failed debit triggers ₹150 bank charge.',
    autoDebitTermsHi: 'देय तिथि पर सुबह 6:00 से 10:00 बजे के बीच e-NACH/UPI ऑटो-डेबिट। बाउंस पर ₹150 बैंक शुल्क।',
    bounceChargePaise: 15000,
    coolingOffDays: 3,
    coolingOffDetails: '3 calendar days cooling-off period to exit with zero cancellation fees.',
    coolingOffDetailsHi: 'बिना किसी रद्दीकरण शुल्क के बाहर निकलने के लिए 3 कैलेंडर दिनों की कूलिंग-ऑफ अवधि।',
    dataPermissions: [
      {
        id: 'perm-sms',
        name: 'SMS Access for Financial Transactions',
        nameHi: 'वित्तीय लेन-देन के लिए SMS अनुमति',
        purpose: 'Verify income credits and EMI debit reminders only.',
        purposeHi: 'केवल आय और ईएमआई रिमाइंडर की पुष्टि के लिए।',
        isMandatory: true,
        userRevocable: false,
        category: 'financial'
      }
    ],
    complaintOfficer: {
      name: 'Ms. Sunita Sharma',
      designation: 'Principal Nodal Grievance Officer',
      email: 'nodal.officer@demolender.fictional.in',
      phone: '1800-000-DEMO',
      ombudsmanPortal: 'https://cms.rbi.org.in',
      address: 'Tower B, 4th Floor, FinTech Park, Demo City, India 110001'
    },
    excerpts: [
      { field: 'Sanctioned Amount', page: 1, text: 'Sanctioned Principal: INR 15,000.00' },
      { field: 'Processing Fee', page: 1, text: 'Upfront Processing Fee: INR 600.00' },
      { field: 'Net Payout', page: 1, text: 'Net Disbursed: INR 14,400.00' },
      { field: 'Repayment Schedule', page: 2, text: '3 instalments of INR 5,450.00 each on 30/09, 30/10, 30/11. Total: INR 16,350.00' }
    ],
    validationStatus: 'approved',
    validationNotes: [
      'Verified: Net disbursement (₹14,400) = Sanctioned (₹15,000) - Upfront Fee (₹600)',
      'Verified: Total Repayment (₹16,350) = 3 x ₹5,450'
    ]
  },
  {
    id: 'offer-kfs-003-conflict',
    offerCode: 'KFS-2026-FLAGGED-003',
    documentTitle: 'Key Fact Statement (KFS) — Cautionary Offer with Conflicting Terms',
    documentVersion: 'v1.2 (Needs Review - Discrepancy Found)',
    lenderName: 'Demo Unverified Lender — fictional flagged sample',
    isFictional: true,
    sanctionedAmountPaise: 1000000, // ₹10,000
    upfrontFeePaise: 75000,         // ₹750 stated on page 1
    netDisbursementPaise: 900000,   // ₹9,000 stated on page 2 (Discrepancy: ₹10,000 - ₹750 = ₹9,250, but shows ₹9,000!)
    totalScheduledRepaymentPaise: 1240000, // ₹12,400 (2 x ₹6,200)
    interestRateDisclosed: '18% p.a. on Page 1 / 28% p.a. on Page 3 (Conflicting disclosures)',
    aprDisclosed: 'Not Disclosed (Violation of KFS norms)',
    isAprVerified: false,
    disbursementDate: '30 August 2026',
    tenureMonths: 2,
    instalments: [
      {
        instalmentNumber: 1,
        dueDate: '30 September 2026',
        amountPaise: 620000, // ₹6,200
        principalPartPaise: 500000,
        interestPartPaise: 120000,
      },
      {
        instalmentNumber: 2,
        dueDate: '30 October 2026',
        amountPaise: 620000, // ₹6,200
        principalPartPaise: 500000,
        interestPartPaise: 120000,
      }
    ],
    latePaymentTerms: 'Daily penalty ₹150 with immediate penal compounding.',
    latePaymentTermsHi: 'प्रतिदिन ₹150 का जुर्माना और तत्काल दंडात्मक ब्याज।',
    dailyLateFeePaise: 15000,
    gracePeriodDays: 0,
    autoDebitTerms: 'Auto-debit with ₹450 penalty for failure.',
    autoDebitTermsHi: 'ऑटो-डेबिट बाउंस पर ₹450 का जुर्माना।',
    bounceChargePaise: 45000,
    coolingOffDays: 0,
    coolingOffDetails: 'No cooling-off window provided in draft.',
    coolingOffDetailsHi: 'ड्राफ्ट में कोई कूलिंग-ऑफ विंडो नहीं दी गई है।',
    dataPermissions: [
      {
        id: 'perm-contacts',
        name: 'Full Phone Contacts Book',
        nameHi: 'पूरी फोन कॉन्टैक्ट बुक',
        purpose: 'Recovery and verification (VIOLATION: Prohibited under RBI DL directions).',
        purposeHi: 'रिकवरी और सत्यापन (आरबीआई नियमों के विरुद्ध)।',
        isMandatory: true,
        userRevocable: false,
        category: 'contact'
      }
    ],
    complaintOfficer: {
      name: 'Missing from draft',
      designation: 'Unspecified',
      email: 'support@unverified-demo.com',
      phone: 'Unlisted',
      ombudsmanPortal: 'Not mentioned',
      address: 'Not provided'
    },
    excerpts: [
      { field: 'Sanctioned Amount', page: 1, text: 'Sanctioned: INR 10,000.00' },
      { field: 'Processing Fee', page: 1, text: 'Processing Fee stated: INR 750.00' },
      { field: 'Net Payout Discrepancy', page: 2, text: 'Net Disbursed: INR 9,000.00 (Should be INR 9,250.00 — ₹250 unaccounted deduction)' },
      { field: 'Interest Rate Conflict', page: 3, text: 'Page 1 stated 18% p.a.; Schedule on Page 3 lists interest charges corresponding to ~28% p.a.' }
    ],
    validationStatus: 'needs_review',
    validationNotes: [
      'CRITICAL: Arithmetic mismatch detected: Sanctioned (₹10,000) - Stated Fee (₹750) = ₹9,250, but Net Disbursed stated is ₹9,000 (₹250 hidden deduction).',
      'CRITICAL: Conflicting interest rate clauses between Page 1 and Page 3.',
      'CRITICAL: Prohibited permission requested (Full Contact Book).',
      'WARNING: Missing statutory cooling-off clause and Nodal Grievance Officer address.'
    ]
  },
  {
    id: 'offer-kfs-001-modified-demo',
    offerCode: 'KFS-2026-STD-001-MOD',
    documentTitle: 'Final Proposed Loan Agreement (Changed Terms Demo)',
    documentVersion: 'v1.1 (Changed Final Terms — ₹500 Total Increase)',
    lenderName: 'Demo Lender — not a real institution',
    isFictional: true,
    sanctionedAmountPaise: 1000000, // ₹10,000
    upfrontFeePaise: 50000,         // ₹500 (5%)
    netDisbursementPaise: 950000,   // ₹9,500
    totalScheduledRepaymentPaise: 1170000, // ₹11,700 (2 x ₹5,850 - was ₹11,200, +₹500 increase!)
    interestRateDisclosed: '22.5% p.a. (Modified reducing rate)',
    aprDisclosed: 'Pending verified calculation (~34.2% p.a.)',
    isAprVerified: false,
    disbursementDate: '30 August 2026',
    tenureMonths: 2,
    instalments: [
      {
        instalmentNumber: 1,
        dueDate: '30 September 2026',
        amountPaise: 585000, // ₹5,850 (was ₹5,600, +₹250)
        principalPartPaise: 490000,
        interestPartPaise: 95000,
      },
      {
        instalmentNumber: 2,
        dueDate: '30 October 2026',
        amountPaise: 585000, // ₹5,850 (was ₹5,600, +₹250)
        principalPartPaise: 510000,
        interestPartPaise: 75000,
      }
    ],
    latePaymentTerms: '₹50 per day late penalty up to a maximum cap of ₹250. 3-day grace period where no penalty is charged.',
    latePaymentTermsHi: 'विलंब पर ₹50 प्रतिदिन का जुर्माना (अधिकतम सीमा ₹250)। 3 दिन की छूट अवधि।',
    dailyLateFeePaise: 5000,
    gracePeriodDays: 3,
    autoDebitTerms: 'e-NACH / UPI mandate debited between 6:00 AM – 10:00 AM on the due date. Failed auto-debit triggers ₹150 bank bounce charge.',
    autoDebitTermsHi: 'देय तिथि पर सुबह 6:00 से 10:00 बजे के बीच e-NACH/UPI ऑटो-डेबिट। बाउंस होने पर ₹150 बैंक चार्ज।',
    bounceChargePaise: 15000,
    coolingOffDays: 3,
    coolingOffDetails: '3 calendar days cooling-off window. Cancel without penalty by returning principal (₹9,500) plus proportionate daily interest. Upfront fee refunded.',
    coolingOffDetailsHi: '3 कैलेंडर दिनों की कूलिंग-ऑफ विंडो।',
    dataPermissions: [
      {
        id: 'perm-sms',
        name: 'SMS Access for Financial Transactions',
        nameHi: 'वित्तीय लेन-देन के लिए SMS अनुमति',
        purpose: 'Verify income credits and EMI debit reminders only.',
        purposeHi: 'केवल आय और ईएमआई रिमाइंडर की पुष्टि के लिए।',
        isMandatory: true,
        userRevocable: false,
        category: 'financial'
      },
      {
        id: 'perm-location',
        name: 'Approximate Location (Coarse)',
        nameHi: 'अनुमानित स्थान (मोटा-मोटा)',
        purpose: 'Verify borrower onboarding from supported Indian state jurisdictions.',
        purposeHi: 'समर्थित भारतीय राज्यों से पुष्टि हेतु।',
        isMandatory: true,
        userRevocable: false,
        category: 'device'
      },
      {
        id: 'perm-contacts',
        name: 'Contact List Access',
        nameHi: 'संपर्क सूची (कॉन्टैक्ट्स)',
        purpose: 'NOT REQUIRED. Contact book harvesting is strictly prohibited.',
        purposeHi: 'आरबीआई द्वारा पूर्णतः प्रतिबंधित।',
        isMandatory: false,
        userRevocable: true,
        category: 'contact'
      }
    ],
    complaintOfficer: {
      name: 'Ms. Sunita Sharma',
      designation: 'Principal Nodal Grievance Officer',
      email: 'nodal.officer@demolender.fictional.in',
      phone: '1800-000-DEMO (10:00 AM - 6:00 PM Mon-Fri)',
      ombudsmanPortal: 'https://cms.rbi.org.in (RBI Complaints Management System)',
      address: 'Tower B, 4th Floor, FinTech Park, Demo City, India 110001'
    },
    excerpts: [
      { field: 'Sanctioned Amount', page: 1, text: 'Sanctioned Loan Principal: INR 10,000.00' },
      { field: 'Processing Fee', page: 1, text: 'Upfront Fee: INR 500.00' },
      { field: 'Net Payout', page: 1, text: 'Net Disbursed: INR 9,500.00' },
      { field: 'Repayment Schedule', page: 2, text: 'Instalment 1: INR 5,850.00 on 30/09/2026; Instalment 2: INR 5,850.00 on 30/10/2026. Total: INR 11,700.00' }
    ],
    validationStatus: 'approved',
    validationNotes: [
      'MODIFIED CONTRACT DRAFT: Two instalments increased to ₹5,850 each (+₹250 each).',
      'Total scheduled repayment increased to ₹11,700 (+₹500 increase over original ₹11,200).'
    ]
  }
];

export const FICTIONAL_DOCUMENTS_RAW = {
  kfs001: `
DEMO LENDER (NBFC-P2P) — FICTIONAL DEMO INSTITUTION
KEY FACT STATEMENT (KFS) FOR PERSONAL MICRO-LOAN
Document ID: KFS-2026-STD-001 | Version: v1.0 | Date: 30 August 2026

1. LOAN SUMMARY & DISBURSEMENT
- Borrower Name: Demo Borrower
- Sanctioned Loan Amount: INR 10,000.00 (Ten Thousand Rupees)
- Upfront Processing Fee (including GST): INR 500.00
- Net Disbursed Amount (Credited to Bank Account): INR 9,500.00
- Disbursement Date: 30 August 2026

2. REPAYMENT SCHEDULE & CHARGES
- Disclosed Nominal Interest Rate: 18.0% p.a. (Reducing balance)
- Total Tenure: 2 Months
- Number of Instalments: 2 (Monthly)
- Instalment 1 (Due 30/09/2026): INR 5,600.00 (Principal INR 4,900 + Interest INR 700)
- Instalment 2 (Due 30/10/2026): INR 5,600.00 (Principal INR 5,100 + Interest INR 500)
- Total Scheduled Repayment: INR 11,200.00
- Total Extra Cost (Fee + Interest): INR 1,700.00
- APR: Pending verified calculation

3. CONTINGENT CHARGES & LATE PAYMENT POLICY
- Grace Period: 3 Calendar Days from due date.
- Late Payment Fee: INR 50.00 per day after grace period, capped at maximum INR 250.00.
- Auto-debit Bounce Charge: INR 150.00 (levied by borrower bank/lender for NACH failure).

4. BORROWER RIGHTS & COMPLIANCE
- Cooling-Off Period: 3 Calendar Days. Borrower may exit by repaying principal plus proportionate daily interest with full refund of processing fee.
- Privacy & Permissions: SMS financial transaction verification only. Contact book access is NOT requested.
- Grievance Redressal Officer: Ms. Sunita Sharma, nodal.officer@demolender.fictional.in, 1800-000-DEMO.
- Escalation: RBI CMS Portal at https://cms.rbi.org.in
`,
  kfs002: `
DEMO LENDER (NBFC-P2P) — FICTIONAL DEMO INSTITUTION
KEY FACT STATEMENT (KFS) FOR REVISED 3-MONTH LOAN
Document ID: KFS-2026-REV-002 | Version: v1.1 | Date: 30 August 2026

1. LOAN SUMMARY
- Sanctioned Loan Amount: INR 15,000.00
- Upfront Processing Fee: INR 600.00
- Net Disbursed Amount: INR 14,400.00
- Disclosed Interest Rate: 16.5% p.a.
- Number of Instalments: 3 monthly instalments of INR 5,450.00
- Repayment Dates: 30/09/2026, 30/10/2026, 30/11/2026
- Total Scheduled Repayment: INR 16,350.00
- Cooling-Off: 3 Days
- Grievance Officer: Ms. Sunita Sharma (nodal.officer@demolender.fictional.in)
`,
  kfs003: `
DEMO UNVERIFIED LENDER — CAUTIONARY FLAGGED SAMPLE
KEY FACT STATEMENT DRAFT (KFS)
Document ID: KFS-2026-FLAGGED-003 | Version: v1.2-FLAGGED

1. LOAN SUMMARY
- Sanctioned Amount: INR 10,000.00
- Processing Fee: INR 750.00 (Stated on Page 1)
- Net Amount to be Credited: INR 9,000.00 (Discrepancy: should be INR 9,250.00)
- Interest Rate: 18% p.a. (Page 1) / Schedule shows ~28% p.a. (Page 3)
- Instalments: 2 x INR 6,200.00 = INR 12,400.00
- Late Fee: INR 150/day with immediate compounding. No grace period.
- Permissions: Full phone contact book for debt recovery.
- Cooling-off: None specified.
- Nodal Officer: Unspecified.
`
};
