import React, { useState, useEffect } from 'react';
import { LoanOfferFacts, Language, ExplanationCardItem } from '../../types';
import { i18n } from '../../i18n';
import { formatPaiseToRupees, calculateCashFlowApr } from '../../utils/formatters';
import {
  Building2,
  Banknote,
  Calendar,
  Percent,
  AlertTriangle,
  CreditCard,
  ShieldCheck,
  LifeBuoy,
  Volume2,
  RotateCcw,
  Pause,
  Play,
  FileText,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2
} from 'lucide-react';
import { speechNarrator, SpeechAudioState } from '../../utils/speech';

interface Props {
  offer: LoanOfferFacts;
  language: Language;
}

export const Step2Understand: React.FC<Props> = ({ offer, language }) => {
  const t = i18n[language];
  const [activeCardAudio, setActiveCardAudio] = useState<{ id: string | null; state: SpeechAudioState }>({
    id: null,
    state: 'idle'
  });
  const [openSources, setOpenSources] = useState<Record<string, boolean>>({});
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    const unsubscribe = speechNarrator.subscribe((state, cardId) => {
      setActiveCardAudio({ id: cardId, state });
    });
    return () => {
      unsubscribe();
      speechNarrator.stop();
    };
  }, []);

  const totalInterestPaise = offer.totalScheduledRepaymentPaise - offer.sanctionedAmountPaise;
  const calculatedApr = calculateCashFlowApr(
    offer.netDisbursementPaise,
    offer.instalments.map(i => i.amountPaise),
    1
  );

  // 8 Versioned, Approved Explanation Cards matching all RBI KFS criteria
  const explanationCards: ExplanationCardItem[] = [
    {
      id: 'card-1-lender',
      category: 'lender',
      titleEn: '1. Who is lending to you?',
      titleHi: '1. आपको लोन कौन दे रहा है?',
      subtitleEn: 'Regulated Non-Banking Financial Company (NBFC) / Bank partner.',
      subtitleHi: 'आरबीआई द्वारा पंजीकृत नॉन-बैंकिंग फाइनेंस कंपनी (NBFC) या बैंक।',
      coreTermsEn: [
        `Lender Name: ${offer.lenderName}`,
        'RBI Registration: Registered Regulated Entity (RE)',
        'Lending Service Provider (LSP): Samajh Demo Tech Platform'
      ],
      coreTermsHi: [
        `लेंडर का नाम: ${offer.lenderName}`,
        'आरबीआई पंजीकरण: अधिकृत व पंजीकृत वित्तीय संस्था (RE)',
        'लेंडिंग सर्विस प्रोवाइडर: समझ डेमो टेक प्लेटफॉर्म'
      ],
      keyTakeawayEn: 'Always verify that your loan originates from an RBI-regulated bank or NBFC, not an unregistered or predatory application.',
      keyTakeawayHi: 'हमेशा सुनिश्चित करें कि लोन केवल आरबीआई द्वारा अधिकृत संस्था या बैंक से हो, किसी गैर-पंजीकृत या अवैध ऐप से नहीं।',
      speechTextEn: `Card 1: Who is lending to you. Your loan is provided by ${offer.lenderName}, a regulated financial entity. The app acts as an authorized technology interface.`,
      speechTextHi: `कार्ड 1: आपको लोन कौन दे रहा है। आपका लोन ${offer.lenderName} द्वारा दिया जा रहा है, जो कि आरबीआई द्वारा पंजीकृत अधिकृत संस्था है।`,
      sourceExcerpt: {
        field: 'Lender Identification',
        page: 1,
        sectionName: 'Section A: Sanctioning Entity',
        text: `The Loan is extended by ${offer.lenderName} (CIN: U65923DL2018PTC338421, RBI Reg No: B-14.03211) as the principal Regulated Entity under the Digital Lending Directions, 2022.`
      }
    },
    {
      id: 'card-2-amounts',
      category: 'net_vs_total',
      titleEn: '2. Money Received vs Total Repayment',
      titleHi: '2. खाते में आने वाली रकम बनाम कुल वापसी',
      subtitleEn: 'Understand the ₹1,700 total extra cost before signing.',
      subtitleHi: 'हस्ताक्षर करने से पहले कुल ₹1,700 की अतिरिक्त लागत को समझें।',
      coreTermsEn: [
        `Sanctioned Loan: ${formatPaiseToRupees(offer.sanctionedAmountPaise)}`,
        `Upfront Processing Fee: -${formatPaiseToRupees(offer.upfrontFeePaise)} (Deducted immediately)`,
        `Net Cash in Bank Today: ${formatPaiseToRupees(offer.netDisbursementPaise)}`,
        `Total Repaid Over 2 Months: ${formatPaiseToRupees(offer.totalScheduledRepaymentPaise)}`
      ],
      coreTermsHi: [
        `स्वीकृत लोन: ${formatPaiseToRupees(offer.sanctionedAmountPaise)}`,
        `शुरुआती प्रोसेसिंग शुल्क: -${formatPaiseToRupees(offer.upfrontFeePaise)} (तुरंत काटा जाता है)`,
        `आज बैंक में आने वाली राशि: ${formatPaiseToRupees(offer.netDisbursementPaise)}`,
        `2 महीने में कुल भुगतान: ${formatPaiseToRupees(offer.totalScheduledRepaymentPaise)}`
      ],
      keyTakeawayEn: `You only receive ₹9,500 in your bank, but you must repay ₹11,200. The net cost of borrowing ₹9,500 for two months is ₹1,700 (₹500 fee + ₹1,200 interest).`,
      keyTakeawayHi: `आपके खाते में केवल ₹9,500 आएंगे, लेकिन आपको ₹11,200 लौटाने होंगे। 2 महीने के लिए इस लोन की कुल अतिरिक्त लागत ₹1,700 (₹500 शुल्क + ₹1,200 ब्याज) है।`,
      speechTextEn: `Card 2: Money Received versus Total Repayment. You will receive exactly ₹9,500 in your bank account today after the ₹500 fee is deducted. You will repay a total of ₹11,200 across two monthly instalments. The total extra cost is ₹1,700.`,
      speechTextHi: `कार्ड 2: खाते में आने वाली रकम बनाम कुल वापसी। ₹500 शुल्क कटने के बाद आज आपके बैंक खाते में ठीक ₹9,500 जमा होंगे। आपको दो किस्तों में कुल ₹11,200 चुकाने होंगे। कुल अतिरिक्त लागत ₹1,700 है।`,
      sourceExcerpt: {
        field: 'Disbursement & Repayment Schedule',
        page: 1,
        sectionName: 'Section B: Key Financial Terms',
        text: `Sanctioned Amount: INR 10,000. Upfront Fee: INR 500. Net Disbursement: INR 9,500. Total Scheduled Repayment: INR 11,200. Total Cost of Credit: INR 1,700.`
      }
    },
    {
      id: 'card-3-schedule',
      category: 'schedule',
      titleEn: '3. Repayment Schedule & Due Dates',
      titleHi: '3. किस्तों की समय-सारणी और तारीखें',
      subtitleEn: '2 equal monthly instalments of ₹5,600.',
      subtitleHi: '₹5,600 की 2 समान मासिक किस्तें।',
      coreTermsEn: [
        `Instalment 1: ${formatPaiseToRupees(offer.instalments[0]?.amountPaise || 560000)} due on 30/09/2026`,
        `Instalment 2: ${formatPaiseToRupees(offer.instalments[1]?.amountPaise || 560000)} due on 30/10/2026`,
        `Each EMI breakdown: ${formatPaiseToRupees(offer.instalments[0]?.principalPartPaise || 485000)} principal + ${formatPaiseToRupees(offer.instalments[0]?.interestPartPaise || 75000)} interest`
      ],
      coreTermsHi: [
        `पहली किस्त: ${formatPaiseToRupees(offer.instalments[0]?.amountPaise || 560000)} देय तारीख 30/09/2026`,
        `दूसरी किस्त: ${formatPaiseToRupees(offer.instalments[1]?.amountPaise || 560000)} देय तारीख 30/10/2026`,
        `प्रत्येक EMI का विवरण: ${formatPaiseToRupees(offer.instalments[0]?.principalPartPaise || 485000)} मूलधन + ${formatPaiseToRupees(offer.instalments[0]?.interestPartPaise || 75000)} ब्याज`
      ],
      keyTakeawayEn: 'Ensure sufficient funds are deposited in your linked bank account by the evening of the 29th of each month.',
      keyTakeawayHi: 'हर महीने की 29 तारीख की शाम तक अपने बैंक खाते में आवश्यक राशि बनाए रखें।',
      speechTextEn: `Card 3: Repayment Schedule and Due Dates. Your loan is repaid in 2 instalments of ₹5,600 each. Instalment 1 is due on September 30th, and Instalment 2 is due on October 30th.`,
      speechTextHi: `कार्ड 3: किस्तों की समय-सारणी। आपको ₹5,600 की 2 किस्तें देनी हैं। पहली किस्त 30 सितंबर को और दूसरी 30 अक्टूबर को देय होगी।`,
      sourceExcerpt: {
        field: 'Instalment Schedule',
        page: 2,
        sectionName: 'Table 1: Repayment Breakdown',
        text: `Instalment 1: Due Date 30/09/2026, Principal: INR 4,850, Interest: INR 750, Total EMI: INR 5,600. Instalment 2: Due Date 30/10/2026, Principal: INR 5,150, Interest: INR 450, Total EMI: INR 5,600.`
      }
    },
    {
      id: 'card-4-interest-apr',
      category: 'interest_apr',
      titleEn: '4. Interest Rate vs Verified APR',
      titleHi: '4. ब्याज दर बनाम सत्यापित APR',
      subtitleEn: 'Stated 18.0% p.a. reducing vs effective APR of ~28.4% p.a.',
      subtitleHi: '18.0% वार्षिक घटती ब्याज दर बनाम प्रभावी वार्षिक लागत ~28.4%।',
      coreTermsEn: [
        `Disclosed Stated Rate: ${offer.interestRateDisclosed}`,
        `Annual Percentage Rate (APR): ${offer.aprDisclosed}`,
        `Cash-flow IRR with Upfront Fee: ~${calculatedApr.aprPercent}% p.a.`,
        `Interest Calculation: Reducing balance (charged only on outstanding principal)`
      ],
      coreTermsHi: [
        `घोषित ब्याज दर: ${offer.interestRateDisclosed}`,
        `वार्षिक प्रतिशत दर (APR): ${offer.aprDisclosed}`,
        `शुरुआती शुल्क सहित वास्तविक वार्षिक दर: ~${calculatedApr.aprPercent}% वार्षिक`,
        `गणना का तरीका: घटती हुई शेष राशि (केवल बची हुई मूल रकम पर ब्याज)`
      ],
      keyTakeawayEn: 'The APR is higher than the nominal rate because it factors in the ₹500 upfront processing fee over the short 2-month tenure.',
      keyTakeawayHi: 'APR सामान्य ब्याज दर से अधिक होता है क्योंकि इसमें ₹500 का शुरुआती शुल्क भी 2 महीने की छोटी अवधि में शामिल होता है।',
      speechTextEn: `Card 4: Interest Rate and Annual Percentage Rate. The stated reducing interest rate is 18.0% per annum. However, when the ₹500 upfront fee is included, the true annualized cost (APR) is approximately 28.4% per annum.`,
      speechTextHi: `कार्ड 4: ब्याज दर और APR। घोषित ब्याज दर 18% वार्षिक है। परंतु ₹500 के शुरुआती शुल्क को मिलाने पर प्रभावी वार्षिक लागत लगभग 28.4% होती है।`,
      sourceExcerpt: {
        field: 'APR & Rate Disclosure',
        page: 1,
        sectionName: 'Section C: Cost of Funds',
        text: `Nominal Interest Rate: 18.00% p.a. (Reducing Balance Method). Annualized Percentage Rate (APR) computed per RBI guidelines: 28.42% p.a., inclusive of all upfront charges and levies.`
      }
    },
    {
      id: 'card-5-late-fees',
      category: 'late_consequences',
      titleEn: '5. Late-Payment Consequences',
      titleHi: '5. देरी से भुगतान और जुर्माना (Late Fee)',
      subtitleEn: '3 days grace, ₹50/day fee (max ₹250 cap), and credit score reporting.',
      subtitleHi: '3 दिन की रियायत, ₹50 प्रतिदिन शुल्क (अधिकतम ₹250) और क्रेडिट स्कोर पर असर।',
      coreTermsEn: [
        `Grace Period: ${offer.gracePeriodDays} calendar days with no fee`,
        `Daily Late Fee: ${formatPaiseToRupees(offer.dailyLateFeePaise)} per day after grace`,
        `Maximum Cap: Penal charges capped at ₹250 for this tenure`,
        `Credit Bureau Reporting: Overdue status reported to CIBIL, Experian, CRIF if unpaid`
      ],
      coreTermsHi: [
        `छूट अवधि (Grace Period): ${offer.gracePeriodDays} दिन बिना किसी जुर्माने के`,
        `दैनिक विलंब शुल्क: छूट के बाद ${formatPaiseToRupees(offer.dailyLateFeePaise)} प्रतिदिन`,
        `अधिकतम सीमा (Cap): इस अवधि के लिए कुल विलंब शुल्क ₹250 पर सीमित`,
        `क्रेडिट ब्यूरो रिपोर्टिंग: भुगतान न होने पर CIBIL और Experian को सूचना भेजी जाती है`
      ],
      keyTakeawayEn: 'Never let an EMI stay unpaid. Late payments damage your credit score and make future loans more expensive or inaccessible.',
      keyTakeawayHi: 'किस्त कभी न छोड़ें। देरी से भुगतान आपके सिबिल स्कोर को खराब करता है और भविष्य में लोन मिलना कठिन हो जाता है।',
      speechTextEn: `Card 5: Late-Payment Consequences. You get a 3-day grace period. After that, a late fee of ₹50 per day applies, capped at ₹250. Delinquency is reported to credit bureaus.`,
      speechTextHi: `कार्ड 5: देरी से भुगतान के परिणाम। आपको 3 दिन की छूट मिलती है। उसके बाद ₹50 प्रतिदिन विलंब शुल्क लगता है, जो अधिकतम ₹250 तक सीमित है। देरी की सूचना सिबिल ब्यूरो को दी जाती है।`,
      sourceExcerpt: {
        field: 'Penal Charges & Default',
        page: 2,
        sectionName: 'Section E: Late Payment Clause',
        text: `Penal charges of INR 50/day shall be levied post expiration of the 3-day grace period, subject to an aggregate cap of INR 250. Default will be reported to Credit Information Companies (CIBIL/Experian).`
      }
    },
    {
      id: 'card-6-auto-debit',
      category: 'auto_debit',
      titleEn: '6. Auto-Debit (e-NACH / UPI Mandate)',
      titleHi: '6. ऑटो-डेबिट (e-NACH / UPI)',
      subtitleEn: 'Automatic deduction window 6:00 AM – 10:00 AM on due date.',
      subtitleHi: 'देय तारीख पर सुबह 6:00 बजे से 10:00 बजे के बीच स्वतः भुगतान।',
      coreTermsEn: [
        'Mandate Type: e-NACH / UPI AutoPay on registered bank account',
        'Debit Timing: Initiated between 6:00 AM and 10:00 AM on due date',
        `Bounce Penalty: ${formatPaiseToRupees(offer.bounceChargePaise)} lender charge + bank bounce fee (₹250-₹500)`,
        'Retry Timing: Re-attempted within 48 hours if initial debit fails'
      ],
      coreTermsHi: [
        'मैंडेट का प्रकार: पंजीकृत बैंक खाते पर e-NACH / UPI ऑटो-पे',
        'कटौती का समय: देय तारीख पर सुबह 6:00 से 10:00 बजे के बीच',
        `बाउंस शुल्क: ${formatPaiseToRupees(offer.bounceChargePaise)} लेंडर का शुल्क + बैंक का बाउंस चार्ज (₹250-₹500)`,
        'पुनः प्रयास: पहली बार असफल होने पर 48 घंटे में दोबारा प्रयास किया जाता है'
      ],
      keyTakeawayEn: 'An auto-debit bounce costs you double: you pay your bank a bounce fee AND the lender a failed debit charge.',
      keyTakeawayHi: 'ऑटो-डेबिट बाउंस होने पर दोहरा नुकसान होता है: आपका बैंक भी चार्ज काटता है और लेंडर भी बाउंस फीस लेता है।',
      speechTextEn: `Card 6: Auto-Debit rules. The payment is automatically debited between 6 AM and 10 AM on the 30th. If your account has insufficient balance, a bounce charge of ₹150 plus bank fees will apply.`,
      speechTextHi: `कार्ड 6: ऑटो-डेबिट नियम। 30 तारीख को सुबह 6 से 10 बजे के बीच किस्त अपने आप कट जाएगी। खाते में पैसे न होने पर ₹150 बाउंस शुल्क और बैंक चार्ज लगेगा।`,
      sourceExcerpt: {
        field: 'Auto-Debit Authorization',
        page: 2,
        sectionName: 'Section F: Payment Mechanism',
        text: `Borrower authorizes automated clearing via e-NACH/UPI. Failed presentation due to insufficient funds incurs an administrative charge of INR 150 plus applicable bank return fees.`
      }
    },
    {
      id: 'card-7-permissions',
      category: 'permissions',
      titleEn: '7. Data Permissions Requested',
      titleHi: '7. मांगी गई डेटा अनुमतियां',
      subtitleEn: 'SMS (financial only) & location. Contacts access is strictly prohibited.',
      subtitleHi: 'एसएमएस (केवल वित्तीय) और स्थान। फोन कॉन्टैक्ट्स मांगना पूर्णतः प्रतिबंधित है।',
      coreTermsEn: [
        'SMS Permission: Only 6-character bank/financial sender IDs are read',
        'Location: Approximate location to prevent geographical fraud',
        'FORBIDDEN ACCESS: Contact list, Photos, Media, Call Logs are NEVER accessed (Strict RBI Rule)',
        'Data Storage: Encrypted in Indian data centers. Revocable in profile settings.'
      ],
      coreTermsHi: [
        'एसएमएस अनुमति: केवल बैंक और वित्तीय मैसेज (6 अक्षरों वाले सेंडर ID) पढ़े जाते हैं',
        'स्थान (Location): धोखाधड़ी रोकने के लिए अनुमानित स्थान',
        'प्रतिबंधित डेटा: फोन कॉन्टैक्ट्स, फोटो, गैलरी, कॉल लॉग्स मांगना आरबीआई नियमों के तहत पूर्णतः गैर-कानूनी है',
        'डेटा सुरक्षा: भारतीय डेटा सेंटरों में एन्क्रिप्टेड। कभी भी अनुमति वापस ली जा सकती है।'
      ],
      keyTakeawayEn: 'Under RBI guidelines, no lending app is allowed to access your phone contacts or personal photo gallery. Reject any app that demands contact access.',
      keyTakeawayHi: 'आरबीआई के स्पष्ट नियमों के अनुसार, कोई भी लोन ऐप आपके कॉन्टैक्ट्स या निजी फोटो नहीं मांग सकती। ऐसी मांग करने वाले ऐप को तुरंत अस्वीकार करें।',
      speechTextEn: `Card 7: Data Permissions. The app only accesses financial SMS and approximate location. Access to your personal contacts, photos, and call logs is strictly prohibited by RBI guidelines.`,
      speechTextHi: `कार्ड 7: डेटा अनुमतियां। यह ऐप केवल बैंक एसएमएस और अनुमानित स्थान का उपयोग करता है। आपके फोन कॉन्टैक्ट्स या निजी फोटो मांगना आरबीआई द्वारा पूर्णतः प्रतिबंधित है।`,
      sourceExcerpt: {
        field: 'Data Privacy & Permissions',
        page: 3,
        sectionName: 'Section G: Privacy Statement',
        text: `In compliance with RBI Digital Lending Guidelines paragraph 6.1, mobile access is restricted to one-time KYC location and financial SMS parsing. No access to contacts list, media storage, or device telemetry is requested or permitted.`
      }
    },
    {
      id: 'card-8-cooling-off',
      category: 'cooling_off_redressal',
      titleEn: '8. Cancellation & Complaint Options',
      titleHi: '8. लोन रद्द करने और शिकायत के अधिकार',
      subtitleEn: '3 calendar days cooling-off window with zero penalty + RBI Ombudsman.',
      subtitleHi: 'बिना जुर्माने के 3 दिन की कूलिंग-ऑफ अवधि और आरबीआई लोकपाल का कानूनी अधिकार।',
      coreTermsEn: [
        `Cooling-Off Window: ${offer.coolingOffDays} calendar days to cancel after signing`,
        'Cancellation Cost: Principal + proportionate daily interest (Zero penalty, upfront fee refunded/adjusted)',
        `Principal Nodal Grievance Officer: ${offer.complaintOfficer?.name || 'Ms. Sunita Sharma'} (${offer.complaintOfficer?.email || 'grievance@demo-lender.in'})`,
        'RBI Escalation: RBI Banking Ombudsman Portal (cms.rbi.org.in) if complaint unresolved in 30 days'
      ],
      coreTermsHi: [
        `कूलिंग-ऑफ अवधि: हस्ताक्षर के बाद लोन रद्द करने के लिए ${offer.coolingOffDays} दिन का समय`,
        'रद्द करने का खर्च: केवल मूलधन और उन दिनों का ब्याज (कोई जुर्माना नहीं)',
        `मुख्य शिकायत अधिकारी: ${offer.complaintOfficer?.name || 'सुनीता शर्मा'} (${offer.complaintOfficer?.email || 'grievance@demo-lender.in'})`,
        'आरबीआई लोकपाल: 30 दिनों में समाधान न होने पर आरबीआई पोर्टल (cms.rbi.org.in) पर शिकायत का अधिकार'
      ],
      keyTakeawayEn: 'If you change your mind after signing, you can legally cancel within 3 days without any hidden exit penalty.',
      keyTakeawayHi: 'यदि लोन लेने के बाद आपका विचार बदल जाता है, तो आप 3 दिनों के भीतर बिना किसी जुर्माने के लोन रद्द कर सकते हैं।',
      speechTextEn: `Card 8: Cancellation and Complaint Options. You have a 3-day cooling-off window to cancel the loan with zero penalty. You also have direct access to the Grievance Officer and the RBI Banking Ombudsman.`,
      speechTextHi: `कार्ड 8: लोन रद्द करने और शिकायत के अधिकार। आपके पास बिना जुर्माने के लोन रद्द करने के लिए 3 दिन की कूलिंग-ऑफ अवधि है। आप सीधे शिकायत अधिकारी या आरबीआई लोकपाल से संपर्क कर सकते हैं।`,
      sourceExcerpt: {
        field: 'Cooling-off Period & Grievance Redressal',
        page: 3,
        sectionName: 'Section H: Borrower Redressal Rights',
        text: `Borrower has a statutory Cooling-Off / Look-Up period of 3 calendar days to exit the credit facility by repaying the principal along with proportionate APR without penalty. Grievance Officer: ${offer.complaintOfficer?.name}, Email: ${offer.complaintOfficer?.email}. Ombudsman Portal: https://cms.rbi.org.in.`
      }
    }
  ];

  const toggleSource = (cardId: string) => {
    setOpenSources(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const handleCardAudio = (card: ExplanationCardItem) => {
    const text = language === 'hi' ? card.speechTextHi : card.speechTextEn;
    if (activeCardAudio.id === card.id && activeCardAudio.state === 'playing') {
      speechNarrator.pause();
    } else if (activeCardAudio.id === card.id && activeCardAudio.state === 'paused') {
      speechNarrator.resume();
    } else {
      speechNarrator.play(card.id, text, language);
    }
  };

  const handleCardReplay = (card: ExplanationCardItem) => {
    const text = language === 'hi' ? card.speechTextHi : card.speechTextEn;
    speechNarrator.replay(card.id, text, language);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'lender':
        return <Building2 className="w-5 h-5 text-[#155E59]" />;
      case 'net_vs_total':
        return <Banknote className="w-5 h-5 text-[#D9A441]" />;
      case 'schedule':
        return <Calendar className="w-5 h-5 text-[#155E59]" />;
      case 'interest_apr':
        return <Percent className="w-5 h-5 text-[#D9A441]" />;
      case 'late_consequences':
        return <AlertTriangle className="w-5 h-5 text-[#8A2E14]" />;
      case 'auto_debit':
        return <CreditCard className="w-5 h-5 text-[#155E59]" />;
      case 'permissions':
        return <ShieldCheck className="w-5 h-5 text-[#155E59]" />;
      case 'cooling_off_redressal':
        return <LifeBuoy className="w-5 h-5 text-[#155E59]" />;
      default:
        return <Info className="w-5 h-5 text-[#155E59]" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Speech notice */}
      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-serif italic text-[#203331] tracking-tight">
          {t.step2Title}
        </h1>
        <p className="text-base md:text-lg text-[#203331]/80 max-w-3xl leading-relaxed">
          {t.step2Subtitle}
        </p>

        {/* Audio Privacy & Provider Disclosure */}
        <div className="p-3.5 rounded-xl bg-[#E8F3EC]/70 border border-[#155E59]/15 flex items-center gap-3 text-xs text-[#203331]/85">
          <Info className="w-4 h-4 text-[#155E59] shrink-0" />
          <span>{t.audioNotice}</span>
        </div>
      </div>

      {/* 8 Short, Verified Explanation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {explanationCards.map((card) => {
          const isPlaying = activeCardAudio.id === card.id && activeCardAudio.state === 'playing';
          const isPaused = activeCardAudio.id === card.id && activeCardAudio.state === 'paused';
          const isLoading = activeCardAudio.id === card.id && activeCardAudio.state === 'loading';
          const showSource = openSources[card.id];
          const terms = language === 'hi' ? card.coreTermsHi : card.coreTermsEn;
          const takeaway = language === 'hi' ? card.keyTakeawayHi : card.keyTakeawayEn;
          const title = language === 'hi' ? card.titleHi : card.titleEn;
          const subtitle = language === 'hi' ? card.subtitleHi : card.subtitleEn;

          return (
            <div
              key={card.id}
              id={card.id}
              className={`rounded-2xl border transition-all shadow-xs flex flex-col justify-between ${
                isPlaying
                  ? 'bg-white border-[#155E59] ring-2 ring-[#155E59]/20'
                  : 'bg-white border-[#E5E1D8] hover:border-[#155E59]/40'
              }`}
            >
              {/* Card Header & Category */}
              <div className="p-6 sm:p-7 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#FAF8F2] border border-[#E5E1D8]">
                      {getCategoryIcon(card.category)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-[#203331] tracking-tight">
                        {title}
                      </h3>
                      <p className="text-xs text-[#203331]/70 mt-0.5">
                        {subtitle}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Core Verified Terms List */}
                <div className="p-4 rounded-xl bg-[#FAF8F2] border border-[#E5E1D8] space-y-2 text-xs text-[#203331]/90">
                  {terms.map((term, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#155E59] mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{term}</span>
                    </div>
                  ))}
                </div>

                {/* Key Takeaway Banner */}
                <div className="p-3.5 rounded-xl bg-[#E8F3EC] border border-[#155E59]/10 text-xs text-[#155E59] leading-relaxed flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#155E59] shrink-0 mt-0.5" />
                  <div>
                    <strong>{language === 'hi' ? 'महत्वपूर्ण निष्कर्ष:' : 'Key Takeaway:'}</strong>{' '}
                    <span>{takeaway}</span>
                  </div>
                </div>

                {/* Document Source Toggle */}
                {showSource && (
                  <div className="p-4 rounded-xl bg-[#203331] text-[#FAF8F2] text-xs space-y-2 border border-[#203331]">
                    <div className="flex items-center justify-between text-[11px] text-[#D9A441] font-semibold uppercase tracking-wider">
                      <span>{card.sourceExcerpt.sectionName || 'KFS Document Citation'}</span>
                      <span>Page {card.sourceExcerpt.page}</span>
                    </div>
                    <p className="font-mono text-[11px] leading-relaxed text-[#FAF8F2]/90 italic">
                      "{card.sourceExcerpt.text}"
                    </p>
                    <div className="text-[10px] text-[#FAF8F2]/60 pt-1 border-t border-white/10">
                      Approved KFS Reference Code: <strong>{offer.offerCode}</strong> (Version {offer.documentVersion})
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Actions: Audio Controls & Source Inspector */}
              <div className="px-6 py-4 bg-[#FAF8F2]/80 border-t border-[#E5E1D8] rounded-b-2xl flex items-center justify-between gap-3">
                {/* Audio Controls (Listen, Pause, Replay) */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id={`btn-audio-${card.id}`}
                    onClick={() => handleCardAudio(card)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isPlaying
                        ? 'bg-[#155E59] text-white'
                        : isPaused
                        ? 'bg-[#D9A441] text-white'
                        : 'bg-white border border-[#E5E1D8] text-[#155E59] hover:bg-[#E8F3EC]'
                    }`}
                  >
                    {isLoading ? (
                      <span className="animate-spin text-xs">⏳</span>
                    ) : isPlaying ? (
                      <Pause className="w-3.5 h-3.5" />
                    ) : isPaused ? (
                      <Play className="w-3.5 h-3.5" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {isLoading
                        ? '...'
                        : isPlaying
                        ? t.btnPause
                        : isPaused
                        ? t.btnResumeAudio
                        : t.btnListen}
                    </span>
                  </button>

                  {(isPlaying || isPaused) && (
                    <button
                      type="button"
                      id={`btn-replay-${card.id}`}
                      onClick={() => handleCardReplay(card)}
                      title={t.btnReplay}
                      className="p-1.5 rounded-xl bg-white border border-[#E5E1D8] text-[#203331] hover:bg-[#E8F3EC] transition-all text-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Show Document Source Toggle */}
                <button
                  type="button"
                  id={`btn-source-${card.id}`}
                  onClick={() => toggleSource(card.id)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#155E59] hover:underline"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{showSource ? t.btnHideSource : t.btnShowSource}</span>
                  {showSource ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
