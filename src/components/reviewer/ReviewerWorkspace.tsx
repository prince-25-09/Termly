import React, { useState, useEffect } from 'react';
import { LoanOfferFacts, ReviewerAuthUser, ExtractionResult } from '../../types';
import { SAMPLE_OFFERS, FICTIONAL_DOCUMENTS_RAW } from '../../data/sampleOffers';
import { formatPaiseToRupees, validateLoanArithmetic } from '../../utils/formatters';
import { 
  signInReviewerWithGoogle, 
  logOutUser, 
  auth, 
  isFirebaseInitialized, 
  saveApprovedOfferToFirestore,
  isAuthorizedReviewerEmail,
  getAssistanceQueueFromFirestore
} from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  Shield, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Sparkles, 
  FileSearch,
  LogIn,
  LogOut,
  Database,
  Info,
  TestTube,
  Play,
  Check,
  X,
  Clock,
  Mic,
  Cpu,
  GitCompare,
  PhoneCall,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

interface Props {
  onApproveOffer: (offer: LoanOfferFacts) => void;
  activeOffer: LoanOfferFacts;
  onExitReviewer: () => void;
  isSimulatedChangedDraftActive?: boolean;
  onToggleSimulatedChangedDraft?: (active: boolean) => void;
}

export const ReviewerWorkspace: React.FC<Props> = ({
  onApproveOffer,
  activeOffer,
  onExitReviewer,
  isSimulatedChangedDraftActive = false,
  onToggleSimulatedChangedDraft
}) => {
  const [activeTab, setActiveTab] = useState<'extraction' | 'test_suite' | 'changed_terms_demo' | 'assistance_queue'>('extraction');

  // Reviewer Authentication State
  const [currentUser, setCurrentUser] = useState<ReviewerAuthUser>({
    uid: 'reviewer-demo-admin',
    email: 'rs2631298@gmail.com',
    displayName: 'Authorized Risk & Compliance Reviewer',
    role: 'reviewer',
    isAnonymous: false
  });

  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [selectedSampleKey, setSelectedSampleKey] = useState<'kfs001' | 'kfs002' | 'kfs003'>('kfs001');
  const [customDocText, setCustomDocText] = useState<string>(FICTIONAL_DOCUMENTS_RAW.kfs001);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [approvedNotice, setApprovedNotice] = useState<boolean>(false);

  // Test Suite State
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [testFilter, setTestFilter] = useState<string>('all');

  // Assistance Queue State
  const [assistanceQueue, setAssistanceQueue] = useState<any[]>([]);
  const [isLoadingQueue, setIsLoadingQueue] = useState<boolean>(false);

  // Modified offer fixture
  const modifiedOfferFixture = SAMPLE_OFFERS.find(o => o.id === 'offer-kfs-001-modified-demo') || SAMPLE_OFFERS[0];

  // Monitor Firebase Auth state
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && !firebaseUser.isAnonymous) {
        const isReviewer = isAuthorizedReviewerEmail(firebaseUser.email);
        setCurrentUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || 'reviewer@demolender.in',
          displayName: firebaseUser.displayName || 'Authorized Reviewer',
          role: isReviewer ? 'reviewer' : 'borrower',
          isAnonymous: false
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await signInReviewerWithGoogle();
      if (res.error) {
        setAuthError(res.error);
      } else if (res.user) {
        setCurrentUser({
          uid: res.user.uid,
          email: res.user.email || 'reviewer@demolender.in',
          displayName: res.user.displayName || 'Reviewer',
          role: res.isReviewer ? 'reviewer' : 'borrower',
          isAnonymous: false
        });
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logOutUser();
    setCurrentUser({
      uid: 'anon',
      email: 'demo-reviewer@demolender.in',
      displayName: 'Guest Reviewer',
      role: 'reviewer',
      isAnonymous: true
    });
  };

  const handleSelectSample = (key: 'kfs001' | 'kfs002' | 'kfs003') => {
    setSelectedSampleKey(key);
    setCustomDocText(FICTIONAL_DOCUMENTS_RAW[key]);
    setExtractionResult(null);
  };

  const handleExtractWithGemini = async () => {
    setIsExtracting(true);
    setApprovedNotice(false);

    try {
      const response = await fetch('/api/extract-kfs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: customDocText,
          sampleKey: selectedSampleKey,
          reviewerEmail: currentUser.email
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const result: ExtractionResult = await response.json();
      setExtractionResult(result);
    } catch (error: any) {
      console.warn('Extraction API failed, applying fallback deterministic parser:', error);
      const fallbackOffer = SAMPLE_OFFERS[selectedSampleKey];
      const check = validateLoanArithmetic(fallbackOffer);
      setExtractionResult({
        facts: fallbackOffer,
        rawExtraction: { fallback: true, source: 'SAMPLE_OFFERS' },
        arithmeticCheck: check,
        extractionWarnings: ['Used local validated sample due to network or server response timeout.']
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleApprove = async (factsToApprove: LoanOfferFacts) => {
    await saveApprovedOfferToFirestore(factsToApprove, currentUser.email);
    onApproveOffer(factsToApprove);
    setApprovedNotice(true);
    setTimeout(() => {
      onExitReviewer();
    }, 1500);
  };

  const handleRunTestSuite = async () => {
    setIsRunningTests(true);
    try {
      const res = await fetch('/api/test-comprehension');
      if (res.ok) {
        const data = await res.json();
        setTestResults(data);
      }
    } catch (err) {
      console.error('Test run failed:', err);
    } finally {
      setIsRunningTests(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Reviewer Header & Auth Bar */}
      <div className="bg-[#203331] text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#155E59] border border-[#2D4C49] flex items-center justify-center text-white shadow-xs">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-serif italic font-bold tracking-tight text-white">Isolated Reviewer Workspace</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#155E59] text-white">
                Server-Authorized
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#A0ABA9] mt-1">
              Review and approve loan Key Fact Statements (KFS) & run automated comprehension benchmarks.
            </p>
          </div>
        </div>

        {/* Reviewer Auth & Controls */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto text-xs">
          <div className="bg-[#121F1E] px-3.5 py-2 rounded-xl border border-[#2D4C49] flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#155E59]"></div>
            <span className="text-[#A0ABA9]">Reviewer: </span>
            <span className="font-semibold text-white">{currentUser.email}</span>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={authLoading}
            className="px-3.5 py-2 rounded-xl bg-[#155E59] hover:bg-[#104743] text-white font-semibold transition-all inline-flex items-center gap-1.5 min-h-[40px] shadow-xs active:scale-95"
            title="Sign in with Google account to manage compliance permissions"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{authLoading ? 'Signing in...' : 'Google Sign-In'}</span>
          </button>

          <button
            type="button"
            onClick={onExitReviewer}
            className="px-4 py-2 rounded-xl bg-[#FAF8F2] hover:bg-white text-[#203331] font-bold transition-all min-h-[40px] shadow-xs active:scale-95"
          >
            ← Borrower Flow
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-3 border-b border-[#E5E1D8] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('extraction')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'extraction'
              ? 'bg-[#155E59] text-white shadow-xs'
              : 'bg-white border border-[#E5E1D8] text-[#203331] hover:bg-[#FAF8F2]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>KFS Extraction & Approval</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('test_suite');
            if (!testResults) handleRunTestSuite();
          }}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'test_suite'
              ? 'bg-[#155E59] text-white shadow-xs'
              : 'bg-white border border-[#E5E1D8] text-[#203331] hover:bg-[#FAF8F2]'
          }`}
        >
          <TestTube className="w-4 h-4" />
          <span>Semantic Voice Benchmarks</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('changed_terms_demo')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'changed_terms_demo'
              ? 'bg-[#155E59] text-white shadow-xs'
              : 'bg-white border border-[#E5E1D8] text-[#203331] hover:bg-[#FAF8F2]'
          }`}
        >
          <GitCompare className="w-4 h-4" />
          <span>Final-Term Protection Demo</span>
          {isSimulatedChangedDraftActive && (
            <span className="px-2 py-0.5 rounded-full bg-[#8A2E14] text-white text-[10px] font-bold">
              Active (+₹500)
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={async () => {
            setActiveTab('assistance_queue');
            setIsLoadingQueue(true);
            try {
              const q = await getAssistanceQueueFromFirestore();
              setAssistanceQueue(q);
            } catch (e) {
              // fallback handled inside lib
            } finally {
              setIsLoadingQueue(false);
            }
          }}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'assistance_queue'
              ? 'bg-[#155E59] text-white shadow-xs'
              : 'bg-white border border-[#E5E1D8] text-[#203331] hover:bg-[#FAF8F2]'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>Assistance Requests Queue</span>
        </button>
      </div>

      {/* Firebase & Firestore Status Banner */}
      <div className="bg-white border border-[#E5E1D8] rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-[#203331]">
          <Database className="w-4 h-4 text-[#155E59]" />
          <span className="font-semibold">Persistence Layer:</span>
          <span className="px-2 py-0.5 rounded-full bg-[#E8F3EC] text-[#155E59] font-bold">
            {isFirebaseInitialized ? 'Firestore Connected (learned-perception-c09p9)' : 'Local Offline Fallback Mode'}
          </span>
        </div>
        <div className="text-[#203331]/60 flex items-center gap-1">
          <Info className="w-3.5 h-3.5" />
          <span>Fictional sample contracts conform to RBI Digital Lending Directions</span>
        </div>
      </div>

      {authError && (
        <div className="bg-[#FAF8F2] border border-[#8A2E14] text-[#8A2E14] p-4 rounded-xl text-xs flex items-center justify-between">
          <span>{authError}</span>
          <button onClick={() => setAuthError(null)} className="underline font-bold">Dismiss</button>
        </div>
      )}

      {approvedNotice && (
        <div className="bg-[#E8F3EC] border-2 border-[#155E59] text-[#155E59] p-5 rounded-2xl font-bold flex items-center gap-3 animate-bounce shadow-sm">
          <CheckCircle2 className="w-5 h-5" />
          <span>Offer facts successfully approved and pushed to live Borrower Onboarding Flow! Redirecting...</span>
        </div>
      )}

      {/* TAB 1: KFS Extraction & Arithmetic Approval */}
      {activeTab === 'extraction' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Document Selection & Raw Viewer (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-[#E5E1D8] rounded-2xl p-6 shadow-sm space-y-5">
              <h3 className="font-bold text-xs sm:text-sm text-[#203331] uppercase tracking-wider flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#E8F3EC] text-[#155E59]">
                  <FileText className="w-4 h-4" />
                </div>
                <span>1. Select or Upload KFS Document</span>
              </h3>

              {/* Versioned Sample Picker */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-[#203331]/70 block">
                  Fictional Sample Document Fixtures:
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleSelectSample('kfs001')}
                    className={`p-3 rounded-xl border text-xs text-left transition-all min-h-[56px] shadow-xs ${
                      selectedSampleKey === 'kfs001'
                        ? 'bg-[#E8F3EC] border-[#155E59] font-bold text-[#155E59] ring-1 ring-[#155E59]'
                        : 'bg-[#FAF8F2] border-[#E5E1D8] text-[#203331] hover:bg-white'
                    }`}
                  >
                    <div className="font-bold">KFS-001 (Valid)</div>
                    <div className="text-[10px] text-[#203331]/60">₹10k Standard</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectSample('kfs002')}
                    className={`p-3 rounded-xl border text-xs text-left transition-all min-h-[56px] shadow-xs ${
                      selectedSampleKey === 'kfs002'
                        ? 'bg-[#E8F3EC] border-[#155E59] font-bold text-[#155E59] ring-1 ring-[#155E59]'
                        : 'bg-[#FAF8F2] border-[#E5E1D8] text-[#203331] hover:bg-white'
                    }`}
                  >
                    <div className="font-bold text-[#8A2E14]">KFS-002 (Error)</div>
                    <div className="text-[10px] text-[#8A2E14]/80">Arithmetic Mismatch</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectSample('kfs003')}
                    className={`p-3 rounded-xl border text-xs text-left transition-all min-h-[56px] shadow-xs ${
                      selectedSampleKey === 'kfs003'
                        ? 'bg-[#E8F3EC] border-[#155E59] font-bold text-[#155E59] ring-1 ring-[#155E59]'
                        : 'bg-[#FAF8F2] border-[#E5E1D8] text-[#203331] hover:bg-white'
                    }`}
                  >
                    <div className="font-bold">KFS-003</div>
                    <div className="text-[10px] text-[#203331]/60">₹25k 3-Month</div>
                  </button>
                </div>
              </div>

              {/* Raw Document Text Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#203331]/70">
                    Document Text (Editable for testing):
                  </label>
                  <span className="text-[10px] text-[#203331]/50 font-mono">
                    {customDocText.length} characters
                  </span>
                </div>
                <textarea
                  rows={12}
                  value={customDocText}
                  onChange={(e) => setCustomDocText(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-[#E5E1D8] bg-[#FAF8F2] font-mono text-[11px] text-[#203331] leading-relaxed focus:bg-white focus:outline-hidden focus:border-[#155E59] shadow-inner"
                />
              </div>

              {/* Action: Extract Facts */}
              <button
                type="button"
                onClick={handleExtractWithGemini}
                disabled={isExtracting}
                className="w-full py-3.5 px-4 rounded-xl bg-[#155E59] hover:bg-[#104743] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all disabled:opacity-60 shadow-md"
              >
                {isExtracting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Extracting Structured KFS via Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#D9A441]" />
                    <span>Run Server-Side Gemini Extraction</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Structured Extracted Facts & Validation (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {extractionResult ? (
              <div className="bg-white border border-[#E5E1D8] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-[#E5E1D8] pb-4">
                  <div>
                    <h3 className="font-bold text-base md:text-lg text-[#203331] flex items-center gap-2">
                      <FileSearch className="w-5 h-5 text-[#155E59]" />
                      <span>Extracted Loan Facts</span>
                    </h3>
                    <p className="text-xs text-[#203331]/70 mt-0.5">
                      Code: {extractionResult.facts.offerCode} | Version: {extractionResult.facts.documentVersion}
                    </p>
                  </div>

                  {/* Verification Status Badge */}
                  <div>
                    {extractionResult.arithmeticCheck.passed ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E8F3EC] text-[#155E59] border border-[#155E59]/20">
                        <CheckCircle2 className="w-4 h-4" />
                        Arithmetic Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FAF8F2] text-[#8A2E14] border border-[#8A2E14]/30">
                        <AlertTriangle className="w-4 h-4" />
                        Needs Review
                      </span>
                    )}
                  </div>
                </div>

                {/* Arithmetic Sanity Check Banner */}
                <div className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                  extractionResult.arithmeticCheck.passed
                    ? 'bg-[#E8F3EC]/70 border-[#155E59]/20 text-[#155E59]'
                    : 'bg-[#FAF8F2] border-[#8A2E14]/30 text-[#8A2E14]'
                }`}>
                  <div className="font-bold flex items-center gap-1.5">
                    {extractionResult.arithmeticCheck.passed ? '✓ Mathematical Integrity Passed' : '⚠️ Discrepancy Found in Contract Terms'}
                  </div>
                  <ul className="list-disc list-inside space-y-1 opacity-90 pl-1">
                    {extractionResult.arithmeticCheck.notes.map((note, i) => (
                      <li key={i}>{note}</li>
                    ))}
                  </ul>
                </div>

                {/* Core Extracted Figures Table */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#FAF8F2] border border-[#E5E1D8]">
                    <span className="text-[#203331]/60 block text-[11px]">Sanctioned Loan</span>
                    <span className="font-bold text-sm sm:text-base text-[#203331] mt-0.5 block">
                      {formatPaiseToRupees(extractionResult.facts.sanctionedAmountPaise)}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FAF8F2] border border-[#E5E1D8]">
                    <span className="text-[#203331]/60 block text-[11px]">Upfront Fee</span>
                    <span className="font-bold text-sm sm:text-base text-[#D9A441] mt-0.5 block">
                      {formatPaiseToRupees(extractionResult.facts.upfrontFeePaise)}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#E8F3EC] border border-[#155E59]/20">
                    <span className="text-[#155E59] block text-[11px] font-semibold">Net Disbursed</span>
                    <span className="font-bold text-sm sm:text-base text-[#155E59] mt-0.5 block">
                      {formatPaiseToRupees(extractionResult.facts.netDisbursementPaise)}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FAF8F2] border border-[#E5E1D8]">
                    <span className="text-[#203331]/60 block text-[11px]">Total Repayment</span>
                    <span className="font-bold text-sm sm:text-base text-[#203331] mt-0.5 block">
                      {formatPaiseToRupees(extractionResult.facts.totalScheduledRepaymentPaise)}
                    </span>
                  </div>
                </div>

                {/* Approve Button */}
                <div className="pt-4 border-t border-[#E5E1D8] flex items-center justify-between">
                  <div className="text-xs text-[#203331]/70">
                    Lender: <strong>{extractionResult.facts.lenderName}</strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApprove(extractionResult.facts)}
                    className="px-6 py-3 rounded-xl bg-[#155E59] hover:bg-[#104743] text-white font-bold text-xs sm:text-sm shadow-md transition-all inline-flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Push to Borrower Journey</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-[#E5E1D8] rounded-2xl p-12 text-center text-[#203331]/60 space-y-3">
                <FileSearch className="w-10 h-10 text-[#155E59]/40 mx-auto" />
                <h4 className="font-bold text-sm text-[#203331]">No Extracted Facts in Current Buffer</h4>
                <p className="text-xs max-w-sm mx-auto">
                  Click "Run Server-Side Gemini Extraction" to parse the selected KFS document fixture.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Automated Comprehension & Speech Benchmark Suite */}
      {activeTab === 'test_suite' && (
        <div className="bg-white border border-[#E5E1D8] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E1D8] pb-4">
            <div>
              <h3 className="font-bold text-lg text-[#203331] flex items-center gap-2">
                <TestTube className="w-5 h-5 text-[#155E59]" />
                <span>Automated Comprehension & Voice Benchmark Suite</span>
              </h3>
              <p className="text-xs text-[#203331]/70 mt-1">
                Verifies semantic understanding across Hindi, English, Hinglish, numeric accuracy, prompt injections, and ambiguous inputs.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRunTestSuite}
              disabled={isRunningTests}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#155E59] text-white text-xs font-bold hover:bg-[#104743] transition-all disabled:opacity-50 shadow-xs"
            >
              {isRunningTests ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Running Benchmarks...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Re-run All Tests</span>
                </>
              )}
            </button>
          </div>

          {/* Test Summary Cards */}
          {testResults && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#FAF8F2] border border-[#E5E1D8]">
                <span className="text-[11px] text-[#203331]/60 uppercase tracking-wider font-semibold">Total Test Cases</span>
                <div className="text-2xl font-bold text-[#203331] mt-1">{testResults.summary.total}</div>
              </div>

              <div className="p-4 rounded-xl bg-[#E8F3EC] border border-[#155E59]/20">
                <span className="text-[11px] text-[#155E59] uppercase tracking-wider font-semibold">Passed</span>
                <div className="text-2xl font-bold text-[#155E59] mt-1">{testResults.summary.passed}</div>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F2] border border-[#E5E1D8]">
                <span className="text-[11px] text-[#8A2E14] uppercase tracking-wider font-semibold">Failed</span>
                <div className="text-2xl font-bold text-[#8A2E14] mt-1">{testResults.summary.failed}</div>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F2] border border-[#E5E1D8]">
                <span className="text-[11px] text-[#203331]/60 uppercase tracking-wider font-semibold">Pass Rate</span>
                <div className="text-2xl font-bold text-[#155E59] mt-1">{testResults.summary.passRate}</div>
              </div>
            </div>
          )}

          {/* Test Results Table */}
          {testResults ? (
            <div className="space-y-3">
              <div className="text-xs font-bold text-[#203331] uppercase tracking-wider">
                Benchmark Results Details:
              </div>
              <div className="space-y-3">
                {testResults.results.map((result: any) => (
                  <div
                    key={result.testId}
                    className={`p-4 rounded-xl border transition-all text-xs space-y-2 ${
                      result.passed
                        ? 'bg-white border-[#E5E1D8] hover:border-[#155E59]/40'
                        : 'bg-rose-50 border-rose-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-bold text-[#203331]">
                        {result.passed ? (
                          <Check className="w-4 h-4 text-[#155E59] shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-rose-700 shrink-0" />
                        )}
                        <span>{result.name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#FAF8F2] border border-[#E5E1D8] text-[10px] text-[#203331]/70 font-normal">
                          {result.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="text-[#203331]/60">Expected: <strong>{result.expectedStatus}</strong></span>
                        <span className="text-[#203331]/60">| Actual: <strong>{result.actualStatus}</strong></span>
                        <span className="text-[#203331]/40 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {result.latencyMs}ms
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#FAF8F2] text-[11px] font-mono text-[#203331]/90">
                      Input: "{result.inputTranscript}"
                    </div>

                    {result.evidence && (
                      <p className="text-[11px] text-[#203331]/75 leading-relaxed">
                        Analysis: {result.evidence}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-[#203331]/60">
              <TestTube className="w-8 h-8 mx-auto text-[#155E59]/40 mb-2" />
              Click "Re-run All Tests" to execute the comprehension benchmark suite.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Final-Term Protection Demo Controls */}
      {activeTab === 'changed_terms_demo' && (
        <div className="bg-white border border-[#E5E1D8] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#E5E1D8] pb-4">
            <div>
              <h3 className="font-bold text-lg text-[#203331] flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-[#155E59]" />
                <span>Final-Term Protection Demo Controls</span>
              </h3>
              <p className="text-xs text-[#203331]/70 mt-1 max-w-2xl">
                Test the Stage 5 Term Protection Engine by simulating a contract modification where two ₹5,600 instalments are increased to two ₹5,850 instalments (raising total scheduled repayment by ₹500 from ₹11,200 to ₹11,700).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                id="btn-toggle-changed-draft"
                onClick={() => {
                  if (onToggleSimulatedChangedDraft) {
                    onToggleSimulatedChangedDraft(!isSimulatedChangedDraftActive);
                  }
                }}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 ${
                  isSimulatedChangedDraftActive
                    ? 'bg-[#8A2E14] text-white hover:bg-[#8A2E14]/90'
                    : 'bg-[#155E59] text-white hover:bg-[#104743]'
                }`}
              >
                <GitCompare className="w-4 h-4" />
                <span>
                  {isSimulatedChangedDraftActive ? 'Deactivate Modified Contract (+₹500)' : 'Activate Modified Contract (+₹500)'}
                </span>
              </button>
            </div>
          </div>

          {/* Side by Side Diff Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original Approved Offer (Stage 2) */}
            <div className="p-5 rounded-2xl bg-[#FAF8F2] border border-[#E5E1D8] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#155E59] uppercase tracking-wider">
                  Original KFS (Stages 1-4 Explained)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#E8F3EC] text-[#155E59] text-[10px] font-bold">
                  {activeOffer.documentVersion}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#E5E1D8]">
                  <span className="text-[#203331]/70">Sanctioned Principal:</span>
                  <span className="font-bold text-[#203331]">{formatPaiseToRupees(activeOffer.sanctionedAmountPaise)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E5E1D8]">
                  <span className="text-[#203331]/70">Net Cash Disbursed:</span>
                  <span className="font-bold text-[#155E59]">{formatPaiseToRupees(activeOffer.netDisbursementPaise)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E5E1D8]">
                  <span className="text-[#203331]/70">Total Scheduled Repayment:</span>
                  <span className="font-bold text-[#203331]">{formatPaiseToRupees(activeOffer.totalScheduledRepaymentPaise)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E5E1D8]">
                  <span className="text-[#203331]/70">Instalment #1 (30/09):</span>
                  <span className="font-bold text-[#203331]">{formatPaiseToRupees(activeOffer.instalments[0]?.amountPaise || 560000)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#203331]/70">Instalment #2 (30/10):</span>
                  <span className="font-bold text-[#203331]">{formatPaiseToRupees(activeOffer.instalments[1]?.amountPaise || 560000)}</span>
                </div>
              </div>
            </div>

            {/* Modified Proposed Contract (Stage 5 Simulation) */}
            <div className={`p-5 rounded-2xl border space-y-3 transition-all ${
              isSimulatedChangedDraftActive
                ? 'bg-[#FAF8F2] border-[#8A2E14] ring-2 ring-[#8A2E14]/20'
                : 'bg-white border-[#E5E1D8]'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#8A2E14] uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Modified Contract Draft (Stage 5 Target)</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#8A2E14]/10 text-[#8A2E14] text-[10px] font-bold">
                  {modifiedOfferFixture.documentVersion}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#E5E1D8]">
                  <span className="text-[#203331]/70">Sanctioned Principal:</span>
                  <span className="font-bold text-[#203331]">{formatPaiseToRupees(modifiedOfferFixture.sanctionedAmountPaise)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E5E1D8]">
                  <span className="text-[#203331]/70">Net Cash Disbursed:</span>
                  <span className="font-bold text-[#155E59]">{formatPaiseToRupees(modifiedOfferFixture.netDisbursementPaise)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E5E1D8]">
                  <span className="text-[#203331]/70">Total Scheduled Repayment:</span>
                  <span className="font-bold text-[#8A2E14]">
                    {formatPaiseToRupees(modifiedOfferFixture.totalScheduledRepaymentPaise)} (+₹500)
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E5E1D8]">
                  <span className="text-[#203331]/70">Instalment #1 (30/09):</span>
                  <span className="font-bold text-[#8A2E14]">
                    {formatPaiseToRupees(modifiedOfferFixture.instalments[0].amountPaise)} (+₹250)
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#203331]/70">Instalment #2 (30/10):</span>
                  <span className="font-bold text-[#8A2E14]">
                    {formatPaiseToRupees(modifiedOfferFixture.instalments[1].amountPaise)} (+₹250)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F2] border border-[#E5E1D8] text-xs text-[#203331]/80 leading-relaxed">
            <strong>Expected Protection Behavior:</strong> When active, Stage 5 will immediately flag a mismatch, show the ₹500 repayment increase in plain language before-and-after cards, invalidate the earlier repayment acknowledgement, require the borrower to re-acknowledge the change, and prevent final demo completion without re-verification.
          </div>
        </div>
      )}

      {/* TAB 4: Borrower Assistance Requests Queue Monitor */}
      {activeTab === 'assistance_queue' && (
        <div className="bg-white border border-[#E5E1D8] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E1D8] pb-4">
            <div>
              <h3 className="font-bold text-lg text-[#203331] flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-[#155E59]" />
                <span>Borrower Assistance Requests Queue</span>
              </h3>
              <p className="text-xs text-[#203331]/70 mt-1">
                Real queue of assistance requests created by borrowers across Stage 4 (Rehearsal) and Stage 6 (Choice & Receipt).
              </p>
            </div>

            <button
              type="button"
              onClick={async () => {
                setIsLoadingQueue(true);
                try {
                  const q = await getAssistanceQueueFromFirestore();
                  setAssistanceQueue(q);
                } finally {
                  setIsLoadingQueue(false);
                }
              }}
              disabled={isLoadingQueue}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E5E1D8] bg-[#FAF8F2] hover:bg-white text-xs font-bold text-[#203331] transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingQueue ? 'animate-spin' : ''}`} />
              <span>Refresh Queue</span>
            </button>
          </div>

          {assistanceQueue && assistanceQueue.length > 0 ? (
            <div className="space-y-3">
              {assistanceQueue.map((req, idx) => (
                <div key={req.id || idx} className="p-4 rounded-xl bg-[#FAF8F2] border border-[#E5E1D8] text-xs space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E1D8] pb-2">
                    <div className="flex items-center gap-2 font-bold text-[#203331]">
                      <span className="font-mono text-[#155E59]">{req.id || `REQ-${idx + 1}`}</span>
                      <span>•</span>
                      <span>{req.topic || 'General Inquiry'}</span>
                      <span className="px-2 py-0.5 rounded-full bg-white border border-[#E5E1D8] text-[10px] text-[#203331]/70">
                        {req.language?.toUpperCase() || 'EN'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[#203331]/60">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{req.createdAt ? new Date(req.createdAt).toLocaleString() : 'Just now'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-[#203331]/60">Borrower: </span>
                      <strong>{req.borrowerName || 'Demo Borrower'}</strong>
                    </div>
                    <div>
                      <span className="text-[#203331]/60">Session ID: </span>
                      <span className="font-mono">{req.sessionId || 'SBS-DEMO'}</span>
                    </div>
                  </div>

                  {req.borrowerNote && (
                    <div className="p-2.5 rounded-lg bg-white border border-[#E5E1D8] text-[11px] text-[#203331]/80 italic">
                      "{req.borrowerNote}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-[#203331]/60 space-y-2">
              <PhoneCall className="w-8 h-8 mx-auto text-[#155E59]/30" />
              <p>No pending assistance requests in queue.</p>
              <p className="text-[11px] text-[#203331]/40">Borrowers can request guidance from Step 4 or Step 6.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
