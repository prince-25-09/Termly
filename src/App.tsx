import React, { useState, useEffect } from 'react';
import { LoanOfferFacts, Language, BorrowerSession } from './types';
import { SAMPLE_OFFERS } from './data/sampleOffers';
import { Header } from './components/common/Header';
import { ProgressRail } from './components/common/ProgressRail';
import { BottomActionBar } from './components/common/BottomActionBar';
import { HelpModal } from './components/common/HelpModal';
import { SaveResumeModal } from './components/common/SaveResumeModal';
import { StepWelcome } from './components/borrower/StepWelcome';
import { Step1YourLoan } from './components/borrower/Step1YourLoan';
import { Step2Understand } from './components/borrower/Step2Understand';
import { Step3ExplainItBack } from './components/borrower/Step3ExplainItBack';
import { Step4DifficultMonth } from './components/borrower/Step4DifficultMonth';
import { Step5CheckFinalTerms } from './components/borrower/Step5CheckFinalTerms';
import { Step6ChoiceReceipt } from './components/borrower/Step6ChoiceReceipt';
import { ReviewerWorkspace } from './components/reviewer/ReviewerWorkspace';
import { 
  ensureBorrowerAuth, 
  saveSessionToFirestore, 
  getSessionFromFirestore, 
  deleteSessionFromFirestore,
  getApprovedOffersFromFirestore,
  auth
} from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { AnimatePresence, motion } from 'motion/react';

const LOCAL_SESSION_KEY = 'termly_borrower_session_v1';
const LEGACY_SESSION_KEY = 'samajh_borrower_session_v1';

export function App() {
  // Current Auth User (Anonymous borrower or logged-in reviewer)
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Active Loan Offer (Defaults to standard verified sample offer)
  const [activeOffer, setActiveOffer] = useState<LoanOfferFacts>(SAMPLE_OFFERS[0]);

  // Borrower Session State
  const [session, setSession] = useState<BorrowerSession>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_SESSION_KEY) || localStorage.getItem(LEGACY_SESSION_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      // Fallback
    }

    return {
      sessionId: `TRM-SESS-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      activeOfferId: SAMPLE_OFFERS[0].id,
      currentStep: 0,
      maxStepReached: 0,
      language: 'en',
      comprehensionAnswers: {},
      comprehensionPassed: false,
      practisedScenarios: [],
      acknowledgedPermissions: {},
      consentChoice: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });

  // UI state
  const [isReviewerMode, setIsReviewerMode] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isSaveOpen, setIsSaveOpen] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'local_only'>('synced');

  // Simulated Modified Final Contract Draft Demo State (+₹500 increase)
  const [isSimulatedChangedDraftActive, setIsSimulatedChangedDraftActive] = useState<boolean>(false);

  // Derive Proposed Final Offer (matches active offer, or modified demo version)
  const modifiedOffer = SAMPLE_OFFERS.find(o => o.id === 'offer-kfs-001-modified-demo') || activeOffer;
  const proposedFinalOffer = isSimulatedChangedDraftActive ? modifiedOffer : activeOffer;

  // Initialize Auth & Approved Offers on mount
  useEffect(() => {
    // 1. Authenticate guest borrower anonymously
    ensureBorrowerAuth().then(user => {
      if (user) setCurrentUser(user);
    });

    if (auth) {
      const unsub = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
      });
      return () => unsub();
    }

    // 2. Fetch any newly approved offers from Firestore
    getApprovedOffersFromFirestore().then(offers => {
      if (offers && offers.length > 0) {
        // If current active offer is in the fetched list, sync it
        const matched = offers.find(o => o.id === session.activeOfferId) || offers[0];
        setActiveOffer(matched);
      }
    }).catch(console.warn);
  }, []);

  // Sync to Firestore & LocalStorage on state changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
      setSyncStatus('saving');

      // 1. Save to Firestore
      saveSessionToFirestore(session, currentUser?.uid).then((res) => {
        if (res.storage === 'firestore') {
          setSyncStatus('synced');
        } else {
          setSyncStatus('local_only');
        }
      }).catch(() => {
        setSyncStatus('local_only');
      });

      // 2. Mirror to Server API
      fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...session,
          ownerId: currentUser?.uid || 'guest_demo_user'
        })
      }).catch(() => {});
    } catch (e) {
      setSyncStatus('local_only');
    }
  }, [session, currentUser]);

  const updateSession = (partial: Partial<BorrowerSession>) => {
    setSession(prev => ({
      ...prev,
      ...partial,
      updatedAt: new Date().toISOString()
    }));
  };

  const handleLanguageChange = (newLang: Language) => {
    updateSession({ language: newLang });
  };

  const handleStartJourney = () => {
    updateSession({
      currentStep: 1,
      maxStepReached: Math.max(session.maxStepReached, 1)
    });
  };

  const handleGoToStep = (step: number) => {
    updateSession({
      currentStep: step,
      maxStepReached: Math.max(session.maxStepReached, step)
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    if (session.currentStep === 5 && isSimulatedChangedDraftActive && !session.changedTermsAcknowledged) {
      alert(session.language === 'hi' 
        ? 'कृपया आगे बढ़ने से पहले अंतिम अनुबंध में हुए ₹500 के बदलाव की पावती स्वीकार करें।' 
        : 'Please review and acknowledge the changed contract terms (+₹500 repayment increase) before proceeding to final receipt.');
      return;
    }

    if (session.currentStep < 6) {
      const nextStep = session.currentStep + 1;
      updateSession({
        currentStep: nextStep,
        maxStepReached: Math.max(session.maxStepReached, nextStep)
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (session.currentStep > 0) {
      updateSession({
        currentStep: session.currentStep - 1
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleResumeSession = (sessionIdToResume: string): boolean => {
    // 1. Try local storage first
    try {
      const cached = localStorage.getItem(LOCAL_SESSION_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.sessionId === sessionIdToResume) {
          setSession(parsed);
          return true;
        }
      }
    } catch (e) {}

    // 2. Try fetching from Firestore asynchronously
    getSessionFromFirestore(sessionIdToResume).then(cloudSession => {
      if (cloudSession) {
        setSession(cloudSession);
      }
    }).catch(console.warn);

    // 3. Fallback check
    if (sessionIdToResume === session.sessionId) {
      return true;
    }

    return false;
  };

  const handleResetSession = () => {
    const oldId = session.sessionId;
    const newSess: BorrowerSession = {
      sessionId: `TRM-SESS-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      ownerId: currentUser?.uid || 'guest_demo_user',
      activeOfferId: activeOffer.id,
      currentStep: 0,
      maxStepReached: 0,
      language: session.language,
      comprehensionAnswers: {},
      comprehensionPassed: false,
      practisedScenarios: [],
      acknowledgedPermissions: {},
      consentChoice: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setSession(newSess);
    localStorage.removeItem(LOCAL_SESSION_KEY);
    localStorage.removeItem(LEGACY_SESSION_KEY);

    // Delete from Firestore & server store
    deleteSessionFromFirestore(oldId).catch(console.warn);
    fetch(`/api/sessions/${oldId}`, { method: 'DELETE' }).catch(console.warn);
  };

  const handleApproveOffer = (approvedOffer: LoanOfferFacts) => {
    setActiveOffer(approvedOffer);
    updateSession({
      activeOfferId: approvedOffer.id,
      currentStep: 1,
      maxStepReached: 1
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F2] text-[#203331] flex flex-col font-sans antialiased selection:bg-[#E8F3EC] selection:text-[#155E59]">
      {/* Top Header */}
      <Header
        language={session.language}
        onLanguageChange={handleLanguageChange}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenSave={() => setIsSaveOpen(true)}
        onToggleWorkspace={() => setIsReviewerMode(!isReviewerMode)}
        isReviewerMode={isReviewerMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 md:py-8">
        {isReviewerMode ? (
          /* Isolated Reviewer Workspace */
          <ReviewerWorkspace
            onApproveOffer={handleApproveOffer}
            activeOffer={activeOffer}
            onExitReviewer={() => setIsReviewerMode(false)}
            isSimulatedChangedDraftActive={isSimulatedChangedDraftActive}
            onToggleSimulatedChangedDraft={(active) => {
              setIsSimulatedChangedDraftActive(active);
              // Reset acknowledgement when draft changes
              updateSession({ changedTermsAcknowledged: false });
            }}
          />
        ) : (
          /* Borrower 6-Step Notebook Experience */
          <div>
            {session.currentStep === 0 ? (
              /* Step 0: Welcome Screen */
              <StepWelcome
                offer={activeOffer}
                language={session.language}
                onStart={handleStartJourney}
                onLanguageChange={handleLanguageChange}
              />
            ) : (
              /* Multi-step Layout with Progress Rail */
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Left Sidebar: Progress Rail (3 cols on desktop) */}
                <div className="md:col-span-3">
                  <ProgressRail
                    currentStep={session.currentStep}
                    totalSteps={6}
                    language={session.language}
                    onStepClick={handleGoToStep}
                    maxStepReached={session.maxStepReached}
                  />
                </div>

                {/* Right Content Panel (9 cols on desktop) */}
                <div className="md:col-span-9">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={session.currentStep}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="bg-transparent"
                    >
                      {session.currentStep === 1 && (
                        <Step1YourLoan
                          offer={activeOffer}
                          language={session.language}
                        />
                      )}

                      {session.currentStep === 2 && (
                        <Step2Understand
                          offer={activeOffer}
                          language={session.language}
                        />
                      )}

                      {session.currentStep === 3 && (
                        <Step3ExplainItBack
                          offer={activeOffer}
                          language={session.language}
                          onAnswersChange={(answers, passed) => {
                            updateSession({
                              comprehensionAnswers: answers,
                              comprehensionPassed: passed
                            });
                          }}
                          savedAnswers={session.comprehensionAnswers}
                        />
                      )}

                      {session.currentStep === 4 && (
                        <Step4DifficultMonth
                          offer={activeOffer}
                          language={session.language}
                          sessionId={session.sessionId}
                          onNavigateToSchedule={() => handleGoToStep(2)}
                          onScenarioPractised={(scenarioId) => {
                            if (!session.practisedScenarios.includes(scenarioId)) {
                              updateSession({
                                practisedScenarios: [...session.practisedScenarios, scenarioId]
                              });
                            }
                          }}
                          onRequestHelp={(topic) => {
                            // Link to assistance queue
                            updateSession({
                              assistanceTopic: topic
                            });
                          }}
                        />
                      )}

                      {session.currentStep === 5 && (
                        <Step5CheckFinalTerms
                          offer={activeOffer}
                          proposedFinalOffer={proposedFinalOffer}
                          language={session.language}
                          onPermissionsAcknowledged={(perms) => {
                            updateSession({
                              acknowledgedPermissions: perms
                            });
                          }}
                          savedAcknowledged={session.acknowledgedPermissions}
                          changedTermsAcknowledged={session.changedTermsAcknowledged}
                          onAcknowledgeChangedTerms={(ack) => {
                            updateSession({
                              changedTermsAcknowledged: ack
                            });
                          }}
                          onReassessTopic={(topicId) => {
                            handleGoToStep(3);
                          }}
                        />
                      )}

                      {session.currentStep === 6 && (
                        <Step6ChoiceReceipt
                          offer={activeOffer}
                          proposedFinalOffer={proposedFinalOffer}
                          language={session.language}
                          session={session}
                          onConsentChoice={(choice) => {
                            updateSession({
                              consentChoice: choice,
                              consentTimestamp: new Date().toLocaleString('en-IN', {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                              }),
                              receiptId: session.receiptId || `TRM-REC-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
                            });
                          }}
                          onResetSession={handleResetSession}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Sticky Action Bar for Mobile & Desktop (when in Borrower flow) */}
      {!isReviewerMode && (
        <BottomActionBar
          currentStep={session.currentStep}
          totalSteps={6}
          language={session.language}
          onBack={handleBack}
          onNext={handleNext}
        />
      )}

      {/* Help Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        language={session.language}
      />

      {/* Save & Resume Modal */}
      <SaveResumeModal
        isOpen={isSaveOpen}
        onClose={() => setIsSaveOpen(false)}
        language={session.language}
        currentSessionId={session.sessionId}
        onResumeSession={handleResumeSession}
        onDeleteSession={handleResetSession}
      />
    </div>
  );
}

export default App;
