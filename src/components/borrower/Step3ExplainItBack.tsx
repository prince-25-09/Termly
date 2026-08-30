import React, { useState, useEffect, useRef } from 'react';
import { LoanOfferFacts, Language, ComprehensionEvaluation, ComprehensionStatus } from '../../types';
import { i18n } from '../../i18n';
import { formatPaiseToRupees } from '../../utils/formatters';
import {
  Mic,
  Square,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  PhoneCall,
  Keyboard,
  ArrowRight,
  ShieldCheck,
  Building2,
  Clock,
  Banknote,
  Send,
  Loader2,
  Info
} from 'lucide-react';
import { speechNarrator, VoiceRecorder } from '../../utils/speech';

interface Props {
  offer: LoanOfferFacts;
  language: Language;
  onAnswersChange: (answers: Record<string, number>, passed: boolean) => void;
  savedAnswers?: Record<string, number>;
}

interface OpenConceptQuestion {
  id: string;
  conceptKey: string;
  badgeEn: string;
  badgeHi: string;
  questionEn: string;
  questionHi: string;
  helperPromptEn: string;
  helperPromptHi: string;
  speechAudioTextEn: string;
  speechAudioTextHi: string;
  suggestedAnswersEn: string[];
  suggestedAnswersHi: string[];
  correctAnswerTextEn: string;
  correctAnswerTextHi: string;
}

export const Step3ExplainItBack: React.FC<Props> = ({
  offer,
  language,
  onAnswersChange,
  savedAnswers = {}
}) => {
  const t = i18n[language];

  // 7 Core concepts for interactive evaluation (4 critical first)
  const openQuestions: OpenConceptQuestion[] = [
    {
      id: 'q1_net_amount',
      conceptKey: 'net_amount_received',
      badgeEn: '1 of 7: Money in Bank Today',
      badgeHi: '1 of 7: आज बैंक में आने वाली रकम',
      questionEn: 'If your approved loan is ₹10,000 with a ₹500 fee, how much money enters your bank account today?',
      questionHi: 'यदि आपका स्वीकृत लोन ₹10,000 है और ₹500 का शुल्क काटा जाता है, तो आज आपके बैंक खाते में कितनी रकम आएगी?',
      helperPromptEn: 'Tip: You can say "Nine thousand five hundred" or "9500".',
      helperPromptHi: 'सलाह: आप "पिचानवे सौ रुपये" या "9500" बोल सकते हैं।',
      speechAudioTextEn: 'Question 1: If your approved loan is ₹10,000 with a ₹500 fee, how much money enters your bank account today?',
      speechAudioTextHi: 'प्रश्न 1: यदि आपका स्वीकृत लोन ₹10,000 है और ₹500 का शुल्क काटा जाता है, तो आज आपके बैंक खाते में कितनी रकम आएगी?',
      suggestedAnswersEn: [
        '₹9,500 (10000 minus 500 fee)',
        'I get ₹9,500 directly in bank',
        '9500'
      ],
      suggestedAnswersHi: [
        'पिचानवे सौ रुपये (₹9,500)',
        '10000 में से 500 कट कर 9500 मिलेंगे',
        '₹9,500'
      ],
      correctAnswerTextEn: 'Exactly ₹9,500 enters your bank today after ₹500 upfront processing fee is deducted.',
      correctAnswerTextHi: '₹500 का शुरुआती शुल्क कटने के बाद आज आपके खाते में ठीक ₹9,500 जमा होंगे।'
    },
    {
      id: 'q2_total_repayment',
      conceptKey: 'total_repayment',
      badgeEn: '2 of 7: Total Scheduled Repayment',
      badgeHi: '2 of 7: कुल निर्धारित भुगतान',
      questionEn: 'You have 2 monthly instalments of ₹5,600 each. What is the total amount you will repay?',
      questionHi: 'आपको ₹5,600 की 2 मासिक किस्तें देनी हैं। कुल मिलाकर आप कितनी राशि चुकाएंगे?',
      helperPromptEn: 'Tip: You can say "Eleven thousand two hundred" or "11200".',
      helperPromptHi: 'सलाह: आप "ग्यारह हज़ार दो सौ रुपये" या "11200" बोल सकते हैं।',
      speechAudioTextEn: 'Question 2: You have 2 monthly instalments of ₹5,600 each. What is the total amount you will repay?',
      speechAudioTextHi: 'प्रश्न 2: आपको ₹5,600 की 2 मासिक किस्तें देनी हैं। कुल मिलाकर आप कितनी राशि चुकाएंगे?',
      suggestedAnswersEn: [
        '₹11,200 in total across 2 months',
        '2 times 5600 which is 11200',
        '11200'
      ],
      suggestedAnswersHi: [
        'कुल ग्यारह हज़ार दो सौ (₹11,200)',
        '5600 की 2 किस्तें मिलाकर 11200 रुपये',
        '११,२००'
      ],
      correctAnswerTextEn: 'You will repay ₹11,200 in total (2 monthly EMIs of ₹5,600). The extra cost is ₹1,700.',
      correctAnswerTextHi: 'आप कुल ₹11,200 चुकाएंगे (₹5,600 की 2 किस्तें)। कुल अतिरिक्त लागत ₹1,700 है।'
    },
    {
      id: 'q3_schedule_dates',
      conceptKey: 'schedule_dates',
      badgeEn: '3 of 7: EMI Due Dates',
      badgeHi: '3 of 7: किस्तों की देय तारीखें',
      questionEn: 'On what dates are your two instalments due, and what is the EMI amount?',
      questionHi: 'आपकी दोनों किस्तें किन तारीखों पर देय हैं और प्रत्येक किस्त की रकम क्या है?',
      helperPromptEn: 'Tip: Mention 30th September, 30th October, and ₹5,600.',
      helperPromptHi: 'सलाह: 30 सितंबर, 30 अक्टूबर और ₹5,600 का उल्लेख करें।',
      speechAudioTextEn: 'Question 3: On what dates are your two instalments due, and what is the EMI amount?',
      speechAudioTextHi: 'प्रश्न 3: आपकी दोनों किस्तें किन तारीखों पर देय हैं और प्रत्येक किस्त की रकम क्या है?',
      suggestedAnswersEn: [
        '30 Sept and 30 Oct, ₹5600 each',
        'Two EMIs of 5600 on 30th of each month'
      ],
      suggestedAnswersHi: [
        '30 सितंबर और 30 अक्टूबर को 5600 की किस्त',
        'हर महीने की 30 तारीख को ₹5,600'
      ],
      correctAnswerTextEn: 'Instalment 1 is due on 30/09/2026 and Instalment 2 on 30/10/2026 for ₹5,600 each.',
      correctAnswerTextHi: 'पहली किस्त 30/09/2026 और दूसरी किस्त 30/10/2026 को ₹5,600 की होगी।'
    },
    {
      id: 'q4_late_payment',
      conceptKey: 'late_consequences',
      badgeEn: '4 of 7: Late Payment & Grace Period',
      badgeHi: '4 of 7: विलंब शुल्क और रियायत नियम',
      questionEn: 'What happens if your salary is delayed past the 3-day grace period?',
      questionHi: 'यदि आपके वेतन में 3 दिन की छूट अवधि से अधिक की देरी हो, तो क्या परिणाम होंगे?',
      helperPromptEn: 'Tip: Mention ₹50 per day late fee and CIBIL credit score impact.',
      helperPromptHi: 'सलाह: ₹50 प्रतिदिन शुल्क और सिबिल स्कोर पर असर का उल्लेख करें।',
      speechAudioTextEn: 'Question 4: What happens if your salary is delayed past the 3-day grace period?',
      speechAudioTextHi: 'प्रश्न 4: यदि आपके वेतन में 3 दिन की छूट अवधि से अधिक की देरी हो, तो क्या परिणाम होंगे?',
      suggestedAnswersEn: [
        '₹50 per day late fee and reported to CIBIL',
        'Late charge of 50 rupees daily and damages credit score'
      ],
      suggestedAnswersHi: [
        '3 दिन बाद 50 रुपये प्रतिदिन पेनल्टी और सिबिल पर असर',
        '₹50 प्रतिदिन विलंब शुल्क लगेगा'
      ],
      correctAnswerTextEn: 'There is a 3-day grace period, after which ₹50/day late fee applies (capped at ₹250) and default is reported to credit bureaus.',
      correctAnswerTextHi: '3 दिन की छूट के बाद ₹50 प्रतिदिन विलंब शुल्क (अधिकतम ₹250) लगता है और सिबिल को रिपोर्ट किया जाता है।'
    },
    {
      id: 'q5_lender_identity',
      conceptKey: 'lender_identity',
      badgeEn: '5 of 7: Regulated Lender Identity',
      badgeHi: '5 of 7: अधिकृत लेंडर की पहचान',
      questionEn: 'Who is extending this loan, and is it an RBI-registered regulated lender?',
      questionHi: 'यह लोन आपको कौन प्रदान कर रहा है, और क्या यह आरबीआई से पंजीकृत संस्था है?',
      helperPromptEn: 'Tip: Mention ABC Finance Ltd or Regulated NBFC partner.',
      helperPromptHi: 'सलाह: अधिकृत NBFC पार्टनर या ABC Finance Ltd बताएं।',
      speechAudioTextEn: 'Question 5: Who is extending this loan, and is it an RBI-registered regulated lender?',
      speechAudioTextHi: 'प्रश्न 5: यह लोन आपको कौन प्रदान कर रहा है, और क्या यह आरबीआई से पंजीकृत संस्था है?',
      suggestedAnswersEn: [
        'ABC Finance Ltd, a registered NBFC',
        'Regulated NBFC partner'
      ],
      suggestedAnswersHi: [
        'आरबीआई पंजीकृत NBFC पार्टनर (ABC Finance)',
        'पंजीकृत वित्तीय संस्था'
      ],
      correctAnswerTextEn: `The loan is provided by ${offer.lenderName}, an RBI-regulated Non-Banking Financial Company.`,
      correctAnswerTextHi: `यह लोन ${offer.lenderName} (आरबीआई पंजीकृत NBFC) द्वारा दिया जा रहा है।`
    },
    {
      id: 'q6_forbidden_permissions',
      conceptKey: 'forbidden_permissions',
      badgeEn: '6 of 7: Data Privacy & Permissions',
      badgeHi: '6 of 7: डेटा गोपनीयता और अनुमतियां',
      questionEn: 'Is any lending app allowed to access your personal phone contacts list under RBI rules?',
      questionHi: 'क्या आरबीआई नियमों के तहत कोई भी लोन ऐप आपकी फोन कॉन्टैक्ट लिस्ट मांग सकती है?',
      helperPromptEn: 'Tip: State clearly that contacts access is strictly forbidden.',
      helperPromptHi: 'सलाह: स्पष्ट कहें कि फोन कॉन्टैक्ट्स मांगना पूर्णतः प्रतिबंधित है।',
      speechAudioTextEn: 'Question 6: Is any lending app allowed to access your personal phone contacts list under RBI rules?',
      speechAudioTextHi: 'प्रश्न 6: क्या आरबीआई नियमों के तहत कोई भी लोन ऐप आपकी फोन कॉन्टैक्ट लिस्ट मांग सकती है?',
      suggestedAnswersEn: [
        'No, accessing contacts is strictly forbidden by RBI',
        'Never, contacts access is illegal'
      ],
      suggestedAnswersHi: [
        'नहीं, फोन कॉन्टैक्ट्स मांगना आरबीआई नियमों में पूर्णतः मना है',
        'बिल्कुल नहीं, यह प्रतिबंधित है'
      ],
      correctAnswerTextEn: 'Under RBI Digital Lending guidelines, accessing phone contacts, photos, or media is strictly prohibited.',
      correctAnswerTextHi: 'आरबीआई के नियमों के अनुसार, फोन कॉन्टैक्ट्स या निजी फोटो मांगना पूर्णतः प्रतिबंधित है।'
    },
    {
      id: 'q7_cooling_off',
      conceptKey: 'cooling_off_rights',
      badgeEn: '7 of 7: Cooling-Off Exit Rights',
      badgeHi: '7 of 7: लोन रद्द करने का अधिकार',
      questionEn: 'How many days do you have to cancel the loan with zero penalty after signing?',
      questionHi: 'हस्ताक्षर करने के बाद बिना किसी जुर्माने के लोन रद्द करने के लिए आपके पास कितने दिन का समय होता है?',
      helperPromptEn: 'Tip: Mention the 3-day cooling-off / look-up window.',
      helperPromptHi: 'सलाह: 3 दिन की कूलिंग-ऑफ अवधि का उल्लेख करें।',
      speechAudioTextEn: 'Question 7: How many days do you have to cancel the loan with zero penalty after signing?',
      speechAudioTextHi: 'प्रश्न 7: हस्ताक्षर करने के बाद बिना किसी जुर्माने के लोन रद्द करने के लिए आपके पास कितने दिन का समय होता है?',
      suggestedAnswersEn: [
        '3 calendar days cooling-off period with no penalty',
        '3 days to cancel without penalty'
      ],
      suggestedAnswersHi: [
        '3 दिन की कूलिंग-ऑफ अवधि बिना किसी जुर्माने के',
        '3 दिन में बिना पेनल्टी रद्द कर सकते हैं'
      ],
      correctAnswerTextEn: 'You have a statutory 3-day cooling-off period to cancel the loan by paying back only the principal and daily interest without penalties.',
      correctAnswerTextHi: 'आपके पास बिना किसी जुर्माने के 3 दिनों के भीतर लोन रद्द करने का कानूनी अधिकार है।'
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputMode, setInputMode] = useState<'voice' | 'typing'>('voice');
  const [typedAnswer, setTypedAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcribing, setTranscribing] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [transcriptDraft, setTranscriptDraft] = useState('');
  const [topicAttempts, setTopicAttempts] = useState<Record<string, number>>({});
  const [evaluations, setEvaluations] = useState<Record<string, ComprehensionEvaluation>>({});
  const [resolvedTopics, setResolvedTopics] = useState<Record<string, boolean>>({});

  const voiceRecorderRef = useRef<VoiceRecorder | null>(null);
  const timerRef = useRef<any>(null);

  const currentQ = openQuestions[currentIndex];
  const currentEvaluation = evaluations[currentQ.id];
  const attempts = topicAttempts[currentQ.id] || 0;
  const isResolved = resolvedTopics[currentQ.id] || false;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (voiceRecorderRef.current) {
        voiceRecorderRef.current.cancelRecording();
      }
      if (timerRef.current) clearInterval(timerRef.current);
      speechNarrator.stop();
    };
  }, []);

  const handleStartRecording = async () => {
    setMicError(null);
    try {
      if (!voiceRecorderRef.current) {
        voiceRecorderRef.current = new VoiceRecorder();
      }
      await voiceRecorderRef.current.startRecording();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } catch (err: any) {
      console.warn('Microphone permission error:', err);
      setMicError(err.message || 'Microphone access denied');
      setInputMode('typing');
    }
  };

  const handleStopRecording = async () => {
    if (!voiceRecorderRef.current || !isRecording) return;
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setTranscribing(true);

    try {
      const { transcript, error } = await voiceRecorderRef.current.stopRecordingAndTranscribe(language);
      if (error && !transcript) {
        setMicError('Speech recognition notice. You can edit the text or type below.');
      }
      setTranscriptDraft(transcript || '');
      setTypedAnswer(transcript || '');
    } catch (e: any) {
      setMicError(e.message || 'Error processing audio');
    } finally {
      setTranscribing(false);
    }
  };

  const handleSubmitEvaluation = async (answerText: string) => {
    if (!answerText || answerText.trim() === '') return;

    setEvaluating(true);
    const newAttempts = attempts + 1;
    setTopicAttempts(prev => ({ ...prev, [currentQ.id]: newAttempts }));

    try {
      const res = await fetch('/api/evaluate-comprehension', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQ.id,
          concept: currentQ.conceptKey,
          userTranscript: answerText.trim(),
          language,
          offerFacts: offer,
          attemptCount: newAttempts
        })
      });

      if (res.ok) {
        const evaluation: ComprehensionEvaluation = await res.json();
        setEvaluations(prev => ({ ...prev, [currentQ.id]: evaluation }));

        if (evaluation.status === 'understood' || evaluation.status === 'partly_understood') {
          const updatedResolved = { ...resolvedTopics, [currentQ.id]: true };
          setResolvedTopics(updatedResolved);

          // Update parent state
          const allResolved = openQuestions.slice(0, 4).every(q => updatedResolved[q.id]);
          const legacyAnswers: Record<string, number> = {};
          openQuestions.forEach((q, idx) => {
            if (updatedResolved[q.id]) legacyAnswers[q.id] = 1;
          });
          onAnswersChange(legacyAnswers, allResolved);
        }
      }
    } catch (err: any) {
      console.error('Comprehension evaluation request failed:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < openQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setTranscriptDraft('');
      setTypedAnswer('');
      setMicError(null);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setTranscriptDraft('');
      setTypedAnswer('');
      setMicError(null);
    }
  };

  const handleListenQuestion = () => {
    const text = language === 'hi' ? currentQ.speechAudioTextHi : currentQ.speechAudioTextEn;
    speechNarrator.toggle(text, language);
  };

  const handleQuickSampleClick = (sample: string) => {
    setTypedAnswer(sample);
    setTranscriptDraft(sample);
    handleSubmitEvaluation(sample);
  };

  const totalAnsweredCount = Object.keys(resolvedTopics).filter(k => resolvedTopics[k]).length;
  const criticalAllPassed = openQuestions.slice(0, 4).every(q => resolvedTopics[q.id]);

  return (
    <div className="space-y-8">
      {/* Header & Supportive Intro */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif italic text-[#203331] tracking-tight">
              {t.step3Title}
            </h1>
            <p className="text-base md:text-lg text-[#203331]/80 mt-2 max-w-2xl leading-relaxed">
              {t.step3Subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={handleListenQuestion}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E5E1D8] text-xs font-semibold text-[#155E59] bg-white hover:bg-[#E8F3EC] transition-all self-start sm:self-auto shadow-xs"
          >
            <Volume2 className="w-4 h-4 text-[#155E59]" />
            <span>{t.btnListen}</span>
          </button>
        </div>

        {/* Reassurance banner */}
        <div className="p-4 rounded-xl bg-white border border-[#E5E1D8] flex items-start gap-3 shadow-xs">
          <div className="p-2 rounded-xl bg-[#E8F3EC] text-[#155E59] shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="text-xs sm:text-sm text-[#203331]/85 leading-relaxed">
            {t.step3SupportiveNote}
          </p>
        </div>
      </div>

      {/* Progress Dots across 7 Concepts */}
      <div className="flex items-center justify-between gap-2 bg-white border border-[#E5E1D8] p-3 rounded-2xl shadow-xs overflow-x-auto">
        {openQuestions.map((q, idx) => {
          const isCurrent = idx === currentIndex;
          const isPassed = resolvedTopics[q.id];
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => {
                setCurrentIndex(idx);
                setTranscriptDraft('');
                setTypedAnswer('');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isCurrent
                  ? 'bg-[#155E59] text-white shadow-xs'
                  : isPassed
                  ? 'bg-[#E8F3EC] text-[#155E59] border border-[#155E59]/20'
                  : 'bg-[#FAF8F2] text-[#203331]/70 hover:bg-white'
              }`}
            >
              <span>{idx + 1}</span>
              {isPassed && <CheckCircle2 className="w-3 h-3 text-[#155E59]" />}
            </button>
          );
        })}
      </div>

      {/* Main Interactive Question Card */}
      <div className="bg-white border border-[#E5E1D8] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Question Header & Badge */}
        <div className="flex items-center justify-between border-b border-[#E5E1D8] pb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#FAF8F2] border border-[#E5E1D8] text-[#155E59]">
            {language === 'hi' ? currentQ.badgeHi : currentQ.badgeEn}
          </span>
          <span className="text-xs text-[#203331]/60 font-medium">
            {language === 'hi' ? `प्रयास: ${attempts}` : `Attempts: ${attempts}`}
          </span>
        </div>

        {/* Question Display */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-[#203331] leading-snug">
            {language === 'hi' ? currentQ.questionHi : currentQ.questionEn}
          </h2>
          <p className="text-xs sm:text-sm text-[#203331]/70 italic">
            {language === 'hi' ? currentQ.helperPromptHi : currentQ.helperPromptEn}
          </p>
        </div>

        {/* Input Switcher (Voice vs Typing) */}
        <div className="flex items-center justify-between border-t border-[#E5E1D8] pt-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setInputMode('voice')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                inputMode === 'voice'
                  ? 'bg-[#155E59] text-white'
                  : 'bg-[#FAF8F2] border border-[#E5E1D8] text-[#203331] hover:bg-white'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{t.btnUseVoice}</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('typing')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                inputMode === 'typing'
                  ? 'bg-[#155E59] text-white'
                  : 'bg-[#FAF8F2] border border-[#E5E1D8] text-[#203331] hover:bg-white'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>{t.btnTypeInstead}</span>
            </button>
          </div>
        </div>

        {/* Voice Recording Interface */}
        {inputMode === 'voice' && (
          <div className="p-6 rounded-2xl bg-[#FAF8F2] border border-[#E5E1D8] text-center space-y-4">
            {!isRecording && !transcribing && (
              <div className="space-y-4">
                <button
                  type="button"
                  id="btn-press-to-record"
                  onClick={handleStartRecording}
                  className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-[#155E59] text-white font-bold text-sm sm:text-base hover:bg-[#104743] transition-all shadow-md active:scale-98"
                >
                  <Mic className="w-5 h-5 animate-pulse" />
                  <span>{t.btnRecordVoice}</span>
                </button>
                <p className="text-xs text-[#203331]/60">
                  {language === 'hi'
                    ? 'हिंदी, इंग्लिश या हिंग्लिश में आसानी से बोलें।'
                    : 'Speak naturally in Hindi, Indian English, or mixed Hinglish.'}
                </p>
              </div>
            )}

            {/* Active Recording State */}
            {isRecording && (
              <div className="space-y-4 py-2">
                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#8A2E14]/10 border border-[#8A2E14]/20 text-[#8A2E14] font-bold text-sm">
                  <div className="w-3 h-3 rounded-full bg-[#8A2E14] animate-ping" />
                  <span>Recording... {recordingSeconds}s</span>
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    id="btn-stop-recording"
                    onClick={handleStopRecording}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#8A2E14] text-white font-bold text-sm hover:bg-[#6e2410] transition-all shadow-md"
                  >
                    <Square className="w-4 h-4" />
                    <span>{t.btnStopRecording}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Transcribing Loader */}
            {transcribing && (
              <div className="py-6 flex flex-col items-center gap-2 text-[#155E59]">
                <Loader2 className="w-7 h-7 animate-spin" />
                <span className="text-xs font-semibold">{t.btnTranscribing}</span>
              </div>
            )}

            {/* Microphone Permission Notice if Denied */}
            {micError && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-left space-y-1.5 text-xs text-amber-900">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <span>{t.micDeniedTitle}</span>
                </div>
                <p className="text-amber-800 leading-relaxed">{t.micDeniedDesc}</p>
              </div>
            )}
          </div>
        )}

        {/* Spoken / Typed Transcript Review Area */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-[#203331] uppercase tracking-wider">
            {t.transcriptLabel}
          </label>
          <div className="relative">
            <textarea
              id="input-user-transcript"
              rows={3}
              value={typedAnswer}
              onChange={(e) => {
                setTypedAnswer(e.target.value);
                setTranscriptDraft(e.target.value);
              }}
              placeholder={
                language === 'hi'
                  ? 'उदा. "10 हजार में से 500 कट के 9500 रुपये खाते में आएंगे"...'
                  : 'e.g. "9,500 reaches bank after 500 processing fee"...'
              }
              className="w-full p-4 rounded-xl border border-[#E5E1D8] bg-[#FAF8F2] text-[#203331] text-sm focus:bg-white focus:border-[#155E59] focus:outline-hidden transition-all resize-none shadow-xs"
            />
          </div>

          {/* Action Bar for Submitting */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-[#203331]/60 font-semibold">
                {language === 'hi' ? 'त्वरित उत्तर:' : 'Quick samples:'}
              </span>
              {(language === 'hi' ? currentQ.suggestedAnswersHi : currentQ.suggestedAnswersEn).map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickSampleClick(sample)}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF8F2] border border-[#E5E1D8] text-[11px] text-[#155E59] hover:bg-[#E8F3EC] transition-all"
                >
                  "{sample}"
                </button>
              ))}
            </div>

            <button
              type="button"
              id="btn-submit-evaluation"
              disabled={evaluating || !typedAnswer.trim()}
              onClick={() => handleSubmitEvaluation(typedAnswer)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#155E59] text-white text-xs font-bold hover:bg-[#104743] transition-all disabled:opacity-50 shadow-xs"
            >
              {evaluating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Evaluating...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{t.btnSubmitAnswer}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Structured AI Evaluation Feedback Result */}
        {currentEvaluation && (
          <div
            className={`p-6 rounded-2xl border transition-all space-y-4 shadow-sm ${
              currentEvaluation.status === 'understood'
                ? 'bg-[#E8F3EC] border-[#155E59]/30 text-[#155E59]'
                : currentEvaluation.status === 'partly_understood'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : currentEvaluation.status === 'unable_to_assess'
                ? 'bg-blue-50 border-blue-200 text-blue-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {/* Status Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-base">
                {currentEvaluation.status === 'understood' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-[#155E59]" />
                    <span>{t.evalStatusUnderstood}</span>
                  </>
                ) : currentEvaluation.status === 'partly_understood' ? (
                  <>
                    <Info className="w-5 h-5 text-amber-700" />
                    <span>{t.evalStatusPartly}</span>
                  </>
                ) : currentEvaluation.status === 'unable_to_assess' ? (
                  <>
                    <HelpCircle className="w-5 h-5 text-blue-700" />
                    <span>{t.evalStatusUnable}</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-rose-700" />
                    <span>{t.evalStatusMisunderstood}</span>
                  </>
                )}
              </div>

              <span className="text-xs font-semibold opacity-75">
                {language === 'hi' ? `अवधारणा: ${currentQ.conceptKey}` : `Topic: ${currentQ.conceptKey}`}
              </span>
            </div>

            {/* Evidence & Mismatch Details */}
            {currentEvaluation.identifiedMismatch && (
              <div className="p-3.5 rounded-xl bg-white/80 border border-current/15 text-xs space-y-1">
                <div className="font-bold">{t.feedbackIdentifiedMismatch}</div>
                <p className="leading-relaxed">{currentEvaluation.identifiedMismatch}</p>
              </div>
            )}

            {/* Approved Fact Correction */}
            <div className="p-3.5 rounded-xl bg-white/80 border border-current/15 text-xs space-y-1">
              <div className="font-bold">{t.feedbackCorrection}</div>
              <p className="leading-relaxed">
                {language === 'hi'
                  ? currentEvaluation.suggestedCorrectionHi || currentQ.correctAnswerTextHi
                  : currentEvaluation.suggestedCorrection || currentQ.correctAnswerTextEn}
              </p>
            </div>

            {/* Visual Example (Comparison breakdown) */}
            {currentEvaluation.visualExample?.items && (
              <div className="p-4 rounded-xl bg-white border border-current/15 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider">
                  {language === 'hi'
                    ? currentEvaluation.visualExample.titleHi
                    : currentEvaluation.visualExample.titleEn}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {currentEvaluation.visualExample.items.map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-[#FAF8F2] border border-[#E5E1D8]">
                      <div className="text-[#203331]/60 text-[11px]">
                        {language === 'hi' ? item.labelHi : item.labelEn}
                      </div>
                      <div className="font-bold text-[#203331] text-sm mt-0.5">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Counselor / Helpline Recommendation if repeated attempts */}
            {currentEvaluation.helplineRecommended && (
              <div className="p-4 rounded-xl bg-white border border-[#D9A441] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#203331]">
                <div className="space-y-1">
                  <div className="font-bold text-[#D9A441] flex items-center gap-1.5">
                    <PhoneCall className="w-4 h-4 text-[#D9A441]" />
                    <span>{t.helplineNoticeTitle}</span>
                  </div>
                  <p className="text-[#203331]/80">{t.helplineNoticeDesc}</p>
                </div>
                <a
                  href="tel:18002094357"
                  className="px-4 py-2 rounded-xl bg-[#FAF8F2] border border-[#D9A441] font-bold text-xs text-[#203331] hover:bg-[#D9A441]/10 text-center whitespace-nowrap"
                >
                  {t.btnCallHelpline}
                </a>
              </div>
            )}
          </div>
        )}

        {/* Navigation between concepts */}
        <div className="flex items-center justify-between border-t border-[#E5E1D8] pt-5">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={handlePreviousQuestion}
            className="px-4 py-2 rounded-xl border border-[#E5E1D8] text-xs font-semibold text-[#203331] hover:bg-[#FAF8F2] transition-all disabled:opacity-30"
          >
            {t.btnBack}
          </button>

          <div className="text-xs font-medium text-[#203331]/60">
            {currentIndex + 1} / {openQuestions.length}
          </div>

          <button
            type="button"
            onClick={handleNextQuestion}
            disabled={currentIndex === openQuestions.length - 1}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#155E59] text-white text-xs font-bold hover:bg-[#104743] transition-all disabled:opacity-30 shadow-xs"
          >
            <span>{t.btnNextConcept}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Completion Summary Banner when Critical Topics Understood */}
      {criticalAllPassed && (
        <div className="p-6 rounded-2xl bg-[#E8F3EC] border border-[#155E59]/20 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-[#155E59] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#155E59]" />
              <span>{t.allConceptsClearedTitle}</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#203331]/80 leading-relaxed">
              {t.allConceptsClearedDesc}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
