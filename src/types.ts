export type Language = 'en' | 'hi';

export interface DataPermission {
  id: string;
  name: string;
  nameHi: string;
  purpose: string;
  purposeHi: string;
  isMandatory: boolean;
  userRevocable: boolean;
  category: 'identity' | 'financial' | 'device' | 'contact';
}

export interface Instalment {
  instalmentNumber: number;
  dueDate: string;
  amountPaise: number;
  principalPartPaise: number;
  interestPartPaise: number;
}

export interface FactExcerpt {
  field: string;
  page: number;
  text: string;
  sectionName?: string;
}

export interface ComplaintOfficer {
  name: string;
  designation: string;
  email: string;
  phone: string;
  ombudsmanPortal: string;
  address: string;
}

export interface LoanOfferFacts {
  id: string;
  offerCode: string;
  documentTitle: string;
  documentVersion: string;
  lenderName: string;
  isFictional: boolean;
  
  // Financial numbers in paise (1 INR = 100 paise)
  sanctionedAmountPaise: number;
  upfrontFeePaise: number;
  netDisbursementPaise: number;
  totalScheduledRepaymentPaise: number;
  
  interestRateDisclosed: string;
  aprDisclosed: string;
  isAprVerified: boolean;
  
  disbursementDate: string;
  tenureMonths: number;
  instalments: Instalment[];
  
  latePaymentTerms: string;
  latePaymentTermsHi: string;
  dailyLateFeePaise: number;
  gracePeriodDays: number;
  
  autoDebitTerms: string;
  autoDebitTermsHi: string;
  bounceChargePaise: number;
  
  coolingOffDays: number;
  coolingOffDetails: string;
  coolingOffDetailsHi: string;
  
  dataPermissions: DataPermission[];
  complaintOfficer: ComplaintOfficer;
  excerpts: FactExcerpt[];
  
  validationStatus: 'valid' | 'needs_review' | 'approved';
  validationNotes: string[];
}

export interface ExplanationCardItem {
  id: string;
  titleEn: string;
  titleHi: string;
  subtitleEn: string;
  subtitleHi: string;
  coreTermsEn: string[];
  coreTermsHi: string[];
  keyTakeawayEn: string;
  keyTakeawayHi: string;
  speechTextEn: string;
  speechTextHi: string;
  sourceExcerpt: FactExcerpt;
  category: 'lender' | 'net_vs_total' | 'schedule' | 'interest_apr' | 'late_consequences' | 'auto_debit' | 'permissions' | 'cooling_off_redressal';
}

export type ComprehensionStatus = 'understood' | 'partly_understood' | 'misunderstood' | 'unable_to_assess';

export interface ComprehensionVisualExample {
  type: 'comparison' | 'timeline' | 'breakdown' | 'contacts';
  titleEn: string;
  titleHi: string;
  items: Array<{
    labelEn: string;
    labelHi: string;
    value: string;
    subtextEn?: string;
    subtextHi?: string;
    status?: 'correct' | 'warning' | 'info' | 'neutral';
  }>;
}

export interface ComprehensionEvaluation {
  status: ComprehensionStatus;
  concept: string;
  userTranscript: string;
  evidence: string;
  identifiedMismatch: string | null;
  suggestedCorrection: string;
  suggestedCorrectionHi: string;
  followUpQuestion: string;
  followUpQuestionHi: string;
  visualExample: ComprehensionVisualExample;
  attemptsCount: number;
  helplineRecommended: boolean;
}

export interface ComprehensionTopicState {
  topicId: string;
  status: ComprehensionStatus;
  attempts: number;
  lastTranscript: string;
  evaluation?: ComprehensionEvaluation;
  resolved: boolean;
}

export interface AssistanceRequest {
  id: string;
  sessionId: string;
  borrowerName?: string;
  language: Language;
  topic: string;
  requestedAt: string;
  status: 'queued' | 'in_review' | 'resolved';
  preferredContact?: string;
  borrowerNote?: string;
  queueNumber: number;
}

export interface BorrowerSession {
  sessionId: string;
  ownerId?: string;
  borrowerId?: string;
  borrowerName?: string;
  currentStep: number;
  maxStepReached?: number;
  language: Language;
  activeOffer?: LoanOfferFacts;
  activeOfferId?: string;
  audioEnabled?: boolean;
  
  // Comprehension answers & interactive open assessment state
  comprehensionAnswers: Record<string, number>;
  comprehensionTopics?: Record<string, ComprehensionTopicState>;
  comprehensionPassed: boolean;
  
  // Scenarios practised in Step 4
  practisedScenarios: string[];
  
  // Permissions acknowledged in Step 5
  acknowledgedPermissions: Record<string, boolean>;
  
  // Final Term Protection State
  explainedOfferVersion?: string;
  explainedOfferHash?: string;
  finalOfferVersion?: string;
  finalOfferHash?: string;
  changedTermsAcknowledged?: boolean;
  simulatedChangedDraftActive?: boolean;
  
  // Final Choice & Receipt
  consentChoice: 'pending' | 'consented' | 'declined' | 'assistance_requested';
  consentTimestamp?: string;
  receiptId?: string;
  assistanceRequestId?: string;
  assistanceQueueNumber?: number;
  assistanceTopic?: string;
  
  updatedAt: string;
  createdAt: string;
}

export interface ReviewerAuthUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'reviewer' | 'borrower';
  isAnonymous: boolean;
}

export interface ExtractionResult {
  facts: LoanOfferFacts;
  rawExtraction: any;
  arithmeticCheck: {
    passed: boolean;
    netMatches: boolean;
    repaymentMatches: boolean;
    calculatedNetPaise: number;
    calculatedRepaymentPaise: number;
    notes: string[];
  };
  extractionWarnings: string[];
}

export interface TestCase {
  id: string;
  name: string;
  category: 'paraphrase' | 'incorrect_amount' | 'partial' | 'contradictory' | 'hindi_numbers' | 'hinglish' | 'microphone_denial' | 'provider_failure' | 'prompt_injection';
  questionId: string;
  questionText: string;
  inputTranscript: string;
  language: Language;
  expectedStatus: ComprehensionStatus;
  description: string;
  strictNumberValidation?: {
    expectedNumber?: number;
    fieldTested: string;
  };
}

export interface TestRunResult {
  testId: string;
  passed: boolean;
  actualStatus: ComprehensionStatus;
  expectedStatus: ComprehensionStatus;
  details: string;
  latencyMs: number;
}
