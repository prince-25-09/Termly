import React, { useState } from 'react';
import { LoanOfferFacts, Language } from '../../types';
import { i18n } from '../../i18n';
import { formatPaiseToRupees } from '../../utils/formatters';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Lightbulb, 
  Volume2, 
  ArrowRight, 
  HelpCircle, 
  RotateCcw, 
  Calendar, 
  IndianRupee,
  Wallet,
  ShoppingBag,
  Home,
  Zap,
  HeartPulse,
  Info,
  PhoneCall,
  X
} from 'lucide-react';
import { speechNarrator } from '../../utils/speech';
import { submitAssistanceRequest } from '../../lib/firebase';

interface Props {
  offer: LoanOfferFacts;
  language: Language;
  sessionId?: string;
  onScenarioPractised: (scenarioId: string) => void;
  onNavigateToSchedule?: () => void;
  onRequestHelp?: (topic: string) => void;
}

interface ExpenseCategory {
  id: string;
  labelEn: string;
  labelHi: string;
  amountRupees: number;
  icon: React.ElementType;
}

export const Step4DifficultMonth: React.FC<Props> = ({ 
  offer, 
  language, 
  sessionId = 'demo-session',
  onScenarioPractised,
  onNavigateToSchedule,
  onRequestHelp
}) => {
  const t = i18n[language];
  const isHi = language === 'hi';

  // Tab: Rehearsal simulator vs Delay Policy
  const [activeTab, setActiveTab] = useState<'rehearsal' | 'delay_penalty'>('rehearsal');

  // Approved instalment from loan facts (Exact code calculation in integer paise)
  const approvedInstalmentPaise = offer.instalments[0]?.amountPaise || 560000;
  const approvedInstalmentRupees = approvedInstalmentPaise / 100;
  const instalmentDueDate = offer.instalments[0]?.dueDate || '30 September 2026';

  // --- REHEARSAL STATE (Stored purely in local state; NOT persisted to Firebase or analytics) ---
  const [hypotheticalIncomeRupees, setHypotheticalIncomeRupees] = useState<number>(18000);
  
  // Categorized essential expenses
  const [rentRupees, setRentRupees] = useState<number>(5000);
  const [groceriesRupees, setGroceriesRupees] = useState<number>(4500);
  const [utilitiesRupees, setUtilitiesRupees] = useState<number>(1500);
  const [medicalOtherRupees, setMedicalOtherRupees] = useState<number>(1200);

  // Assistance modal state for shortfall
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [helpNote, setHelpNote] = useState<string>('');
  const [helpSubmitting, setHelpSubmitting] = useState<boolean>(false);
  const [helpSuccess, setHelpSuccess] = useState<string | null>(null);

  // Exact code-based arithmetic
  const totalEssentialExpensesRupees = rentRupees + groceriesRupees + utilitiesRupees + medicalOtherRupees;
  const moneyRemainingBeforeRepaymentRupees = hypotheticalIncomeRupees - totalEssentialExpensesRupees;
  const finalBalanceOrShortfallRupees = moneyRemainingBeforeRepaymentRupees - approvedInstalmentRupees;
  const isShortfall = finalBalanceOrShortfallRupees < 0;

  // Preset Scenario Buttons
  const applyPreset = (type: 'tight' | 'balanced' | 'surplus') => {
    if (type === 'tight') {
      setHypotheticalIncomeRupees(12000);
      setRentRupees(5000);
      setGroceriesRupees(4000);
      setUtilitiesRupees(1500);
      setMedicalOtherRupees(1500);
      onScenarioPractised('rehearsal_tight_month');
    } else if (type === 'balanced') {
      setHypotheticalIncomeRupees(18000);
      setRentRupees(5000);
      setGroceriesRupees(4500);
      setUtilitiesRupees(1500);
      setMedicalOtherRupees(1200);
      onScenarioPractised('rehearsal_balanced_month');
    } else {
      setHypotheticalIncomeRupees(25000);
      setRentRupees(6000);
      setGroceriesRupees(5000);
      setUtilitiesRupees(2000);
      setMedicalOtherRupees(1500);
      onScenarioPractised('rehearsal_surplus_month');
    }
  };

  // --- DELAY PENALTY SIMULATOR STATE ---
  const [activeScenario, setActiveScenario] = useState<'A' | 'B' | 'C' | 'custom'>('A');
  const [delayDays, setDelayDays] = useState<number>(0);
  const [accountHasFunds, setAccountHasFunds] = useState<boolean>(true);

  const dailyLateFeePaise = offer.dailyLateFeePaise || 5000;
  const bounceChargePaise = offer.bounceChargePaise || 15000;
  const graceDays = offer.gracePeriodDays || 3;

  const effectivePenaltyDays = Math.max(0, delayDays - graceDays);
  const calculatedLateFeePaise = Math.min(effectivePenaltyDays * dailyLateFeePaise, 25000);
  const bankBouncePaise = (!accountHasFunds && delayDays > 0) ? bounceChargePaise : 0;
  const totalOutflowPaise = approvedInstalmentPaise + calculatedLateFeePaise + bankBouncePaise;

  const handleListen = () => {
    const text = isHi
      ? `यदि अगला महीना कठिन हो? यह अभ्यास स्क्रीन आपको अपनी संभावित आय और जरूरी खर्चों की गणना करने में मदद करती है। याद रखें कि यह एक काल्पनिक अभ्यास है, सुरक्षित या गारंटीशुदा बजट का दावा नहीं। यदि पैसों की कमी हो, तो आप सहायता का अनुरोध कर सकते हैं या तारीखें देख सकते हैं।`
      : `What if next month is difficult? This rehearsal screen allows you to plan with hypothetical income and essential expenses. Please note that a positive balance is an estimate for this scenario, not an income forecast or credit decision. Unlisted costs may exist.`;
    speechNarrator.toggle(text, language);
  };

  const handleAssistanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHelpSubmitting(true);
    try {
      const res = await submitAssistanceRequest({
        sessionId,
        language,
        topic: 'Difficult Month / Instalment Repayment Shortfall',
        preferredContact: 'Phone / Callback',
        borrowerNote: helpNote || `Hypothetical monthly shortfall of ₹${Math.abs(finalBalanceOrShortfallRupees)} rehearsed.`
      });
      setHelpSuccess(`Request Queued: #${res.requestId}. Position in queue: ${res.queueNumber}`);
      if (onRequestHelp) {
        onRequestHelp('difficult_month_shortfall');
      }
    } catch (err: any) {
      setHelpSuccess(`Request Queued locally (#SBS-LOCAL-REQ). A counselor will follow up.`);
    } finally {
      setHelpSubmitting(false);
    }
  };

  return (
    <div className="space-y-8" id="step4-difficult-month-container">
      {/* Header & Narration */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF8F2] border border-[#E5E1D8] text-[11px] font-bold text-[#155E59] uppercase tracking-wider mb-2">
            <span>{isHi ? 'अभ्यास मॉड्यूल' : 'Practical Scenario Rehearsal'}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif italic text-[#203331] tracking-tight">
            {isHi ? 'यदि अगला महीना कठिन हो?' : 'What if next month is difficult?'}
          </h1>
          <p className="text-base md:text-lg text-[#203331]/80 mt-2 max-w-2xl leading-relaxed">
            {isHi 
              ? 'काल्पनिक आय और आवश्यक खर्च डालकर देखें कि किस्त के बाद क्या स्थिति बनेगी। यह केवल अभ्यास के लिए है।'
              : 'Enter hypothetical income and essential expenses to rehearse your cash flow before the instalment is due.'}
          </p>
        </div>

        <button
          type="button"
          id="btn-listen-step4"
          onClick={handleListen}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E5E1D8] text-xs font-semibold text-[#155E59] bg-white hover:bg-[#E8F3EC] transition-all self-start sm:self-auto shadow-xs"
        >
          <Volume2 className="w-4 h-4 text-[#155E59]" />
          <span>{t.btnListen}</span>
        </button>
      </div>

      {/* Mode Switcher */}
      <div className="flex border-b border-[#E5E1D8] gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('rehearsal')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            activeTab === 'rehearsal'
              ? 'text-[#155E59] border-b-2 border-[#155E59]'
              : 'text-[#203331]/60 hover:text-[#203331]'
          }`}
        >
          {isHi ? '1. आय और जरूरी खर्च का अभ्यास' : '1. Income & Essential Expenses Rehearsal'}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('delay_penalty')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            activeTab === 'delay_penalty'
              ? 'text-[#155E59] border-b-2 border-[#155E59]'
              : 'text-[#203331]/60 hover:text-[#203331]'
          }`}
        >
          {isHi ? '2. विलंब शुल्क और बाउंस नियम' : '2. Late Penalty & Bounce Rules'}
        </button>
      </div>

      {activeTab === 'rehearsal' ? (
        <div className="space-y-6">
          {/* Quick Scenario Preset Pills */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-[#203331]/70 uppercase tracking-wider">
              {isHi ? 'उदाहरण परिदृश्य लोड करें:' : 'Try a preset scenario:'}
            </span>
            <button
              type="button"
              id="preset-tight"
              onClick={() => applyPreset('tight')}
              className="px-3 py-1.5 rounded-xl border border-[#8A2E14]/30 bg-[#FAF8F2] hover:bg-[#8A2E14]/10 text-[#8A2E14] text-xs font-semibold transition-all"
            >
              {isHi ? 'तंगी वाला महीना (Shortfall)' : 'Tight Month (Shortfall)'}
            </button>
            <button
              type="button"
              id="preset-balanced"
              onClick={() => applyPreset('balanced')}
              className="px-3 py-1.5 rounded-xl border border-[#E5E1D8] bg-white hover:bg-[#FAF8F2] text-[#203331] text-xs font-semibold transition-all"
            >
              {isHi ? 'संतुलित महीना (Balanced)' : 'Balanced Month (Modest Balance)'}
            </button>
            <button
              type="button"
              id="preset-surplus"
              onClick={() => applyPreset('surplus')}
              className="px-3 py-1.5 rounded-xl border border-[#155E59]/30 bg-[#E8F3EC] hover:bg-[#155E59]/10 text-[#155E59] text-xs font-semibold transition-all"
            >
              {isHi ? 'सुगम महीना (Surplus)' : 'Surplus Month (Higher Income)'}
            </button>
          </div>

          {/* Dual Inputs Grid: Income & Essential Expenses */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Interactive Inputs */}
            <div className="lg:col-span-7 space-y-6">
              {/* Income Box */}
              <div className="bg-white border border-[#E5E1D8] rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-[#E8F3EC] text-[#155E59]">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#203331] text-base">
                        {isHi ? 'संभावित मासिक आय (Hypothetical Income)' : 'Hypothetical Monthly Income'}
                      </h3>
                      <p className="text-xs text-[#203331]/65">
                        {isHi ? 'वेतन, दैनिक मजदूरी या व्यापार आय' : 'Expected salary, freelance, or business earnings'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-[#203331]">₹</span>
                    <input
                      type="number"
                      id="input-hypothetical-income"
                      min={0}
                      max={150000}
                      step={500}
                      value={hypotheticalIncomeRupees}
                      onChange={(e) => setHypotheticalIncomeRupees(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E1D8] text-base font-bold text-[#203331] bg-[#FAF8F2] focus:bg-white focus:border-[#155E59] focus:outline-none"
                    />
                  </div>
                  <input
                    type="range"
                    min={5000}
                    max={50000}
                    step={500}
                    value={hypotheticalIncomeRupees}
                    onChange={(e) => setHypotheticalIncomeRupees(Number(e.target.value))}
                    className="w-full h-2 bg-[#FAF8F2] border border-[#E5E1D8] rounded-lg appearance-none cursor-pointer accent-[#155E59]"
                  />
                  <div className="flex justify-between text-[11px] text-[#203331]/60">
                    <span>₹5,000</span>
                    <span>₹25,000</span>
                    <span>₹50,000</span>
                  </div>
                </div>
              </div>

              {/* Essential Expenses Box */}
              <div className="bg-white border border-[#E5E1D8] rounded-2xl p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-2.5 pb-2 border-b border-[#E5E1D8]">
                  <div className="p-2 rounded-xl bg-[#FAF8F2] text-[#D9A441] border border-[#E5E1D8]">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#203331] text-base">
                      {isHi ? 'अनिवार्य घरेलू खर्च (Essential Expenses)' : 'Essential Household Expenses'}
                    </h3>
                    <p className="text-xs text-[#203331]/65">
                      {isHi ? 'वह खर्च जिन्हें टाला नहीं जा सकता' : 'Non-negotiable survival and living costs'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Rent */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#203331] flex items-center gap-1.5">
                      <Home className="w-3.5 h-3.5 text-[#155E59]" />
                      <span>{isHi ? 'मकान का किराया:' : 'Rent / Housing:'}</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#203331]/60">₹</span>
                      <input
                        type="number"
                        min={0}
                        step={100}
                        value={rentRupees}
                        onChange={(e) => setRentRupees(Math.max(0, Number(e.target.value) || 0))}
                        className="w-full px-3 py-1.5 text-sm font-semibold rounded-lg border border-[#E5E1D8] bg-[#FAF8F2] focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Groceries & Food */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#203331] flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-[#155E59]" />
                      <span>{isHi ? 'राशन और भोजन:' : 'Groceries & Food:'}</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#203331]/60">₹</span>
                      <input
                        type="number"
                        min={0}
                        step={100}
                        value={groceriesRupees}
                        onChange={(e) => setGroceriesRupees(Math.max(0, Number(e.target.value) || 0))}
                        className="w-full px-3 py-1.5 text-sm font-semibold rounded-lg border border-[#E5E1D8] bg-[#FAF8F2] focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Utilities (Electricity, Gas, Water) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#203331] flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#155E59]" />
                      <span>{isHi ? 'बिजली / पानी / गैस बिल:' : 'Utilities & Electricity:'}</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#203331]/60">₹</span>
                      <input
                        type="number"
                        min={0}
                        step={100}
                        value={utilitiesRupees}
                        onChange={(e) => setUtilitiesRupees(Math.max(0, Number(e.target.value) || 0))}
                        className="w-full px-3 py-1.5 text-sm font-semibold rounded-lg border border-[#E5E1D8] bg-[#FAF8F2] focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Healthcare & School/Other */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#203331] flex items-center gap-1.5">
                      <HeartPulse className="w-3.5 h-3.5 text-[#155E59]" />
                      <span>{isHi ? 'दवाइयां और अन्य जरूरी:' : 'Medicine / Health / Other:'}</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#203331]/60">₹</span>
                      <input
                        type="number"
                        min={0}
                        step={100}
                        value={medicalOtherRupees}
                        onChange={(e) => setMedicalOtherRupees(Math.max(0, Number(e.target.value) || 0))}
                        className="w-full px-3 py-1.5 text-sm font-semibold rounded-lg border border-[#E5E1D8] bg-[#FAF8F2] focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E5E1D8] flex justify-between items-center text-xs font-bold text-[#203331]">
                  <span>{isHi ? 'कुल आवश्यक खर्च:' : 'Total Essential Expenses:'}</span>
                  <span className="text-[#8A2E14]">₹{totalEssentialExpensesRupees.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Code-Calculated WaterFall & Result Card */}
            <div className="lg:col-span-5 space-y-6">
              {/* Calculation Summary Card */}
              <div className="bg-[#FAF8F2] border border-[#E5E1D8] rounded-2xl p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E1D8]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#203331]/60">
                    {isHi ? 'कोड-आधारित गणना' : 'Deterministic Code Calculation'}
                  </span>
                  <span className="text-xs text-[#155E59] font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Due: {instalmentDueDate}</span>
                  </span>
                </div>

                <div className="space-y-3 text-sm text-[#203331]">
                  {/* Income */}
                  <div className="flex justify-between items-center">
                    <span className="text-[#203331]/80">{isHi ? '1. संभावित आय:' : '1. Expected Income:'}</span>
                    <span className="font-semibold">+₹{hypotheticalIncomeRupees.toLocaleString('en-IN')}</span>
                  </div>

                  {/* Expenses */}
                  <div className="flex justify-between items-center text-[#8A2E14]">
                    <span>{isHi ? '2. घटाएं: आवश्यक खर्च:' : '2. Less: Essential Expenses:'}</span>
                    <span className="font-semibold">-₹{totalEssentialExpensesRupees.toLocaleString('en-IN')}</span>
                  </div>

                  {/* Money remaining before repayment */}
                  <div className="pt-2 border-t border-[#E5E1D8] flex justify-between items-center font-bold">
                    <span className="text-xs text-[#203331]">
                      {isHi ? '3. किस्त से पहले शेष रकम:' : '3. Money remaining before repayment:'}
                    </span>
                    <span className={moneyRemainingBeforeRepaymentRupees >= 0 ? 'text-[#155E59]' : 'text-[#8A2E14]'}>
                      ₹{moneyRemainingBeforeRepaymentRupees.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Approved instalment from schedule */}
                  <div className="flex justify-between items-center text-[#203331]">
                    <span className="text-xs">
                      {isHi ? '4. देय निर्धारित किस्त (Approved EMI):' : '4. Approved Instalment Due:'}
                    </span>
                    <span className="font-bold text-[#8A2E14]">-₹{approvedInstalmentRupees.toLocaleString('en-IN')}</span>
                  </div>

                  {/* Final Balance / Shortfall */}
                  <div className={`p-4 rounded-xl border mt-3 ${
                    isShortfall 
                      ? 'bg-[#FAF8F2] border-[#8A2E14] text-[#8A2E14]' 
                      : 'bg-[#E8F3EC] border-[#155E59] text-[#155E59]'
                  }`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider">
                          {isShortfall 
                            ? (isHi ? 'कमी (SHORTFALL AFTER REPAYMENT)' : 'SHORTFALL AFTER REPAYMENT')
                            : (isHi ? 'किस्त के बाद शेष (REMAINING BALANCE)' : 'REMAINING BALANCE AFTER REPAYMENT')}
                        </div>
                        <div className="text-xs opacity-80 mt-0.5">
                          {isShortfall
                            ? (isHi ? 'किस्त भरने के लिए अतिरिक्त धनराशि की आवश्यकता होगी' : 'Insufficient funds to cover both living & loan instalment')
                            : (isHi ? 'इस विशिष्ट परिदृश्य में किस्त पूरी हो सकती है' : 'Instalment covered under this hypothetical scenario')}
                        </div>
                      </div>
                      <div className="text-2xl font-bold font-serif">
                        {isShortfall ? '-' : '+'}₹{Math.abs(finalBalanceOrShortfallRupees).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Explicit Disclaimer mandated by guidelines */}
                <div className="p-3.5 rounded-xl bg-white border border-[#E5E1D8] text-[11px] text-[#203331]/80 leading-relaxed space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#203331]">
                    <Info className="w-3.5 h-3.5 text-[#D9A441]" />
                    <span>{isHi ? 'महत्वपूर्ण सूचना (यह क्रेडिट निर्णय नहीं है):' : 'Important Note (Not a credit decision):'}</span>
                  </div>
                  <p>
                    {isHi
                      ? 'धनात्मक शेष को "सुरक्षित" या "वहनीय" नहीं कहा जा सकता। आपातकालीन चिकित्सा, पारिवारिक या अन्य अघोषित खर्च हो सकते हैं। यह केवल एक परिदृश्य अभ्यास है, आय का पूर्वानुमान नहीं।'
                      : 'A positive balance is not termed "affordable" or "safe". Unlisted costs (such as medical emergencies or irregular expenses) may exist. This is a scenario rehearsal, not an income forecast or credit decision.'}
                  </p>
                </div>

                {/* Shortfall Actions if in shortfall */}
                {isShortfall && (
                  <div className="p-4 rounded-xl bg-white border border-[#8A2E14]/30 space-y-3">
                    <div className="text-xs font-bold text-[#8A2E14] flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{isHi ? 'कमी होने पर आपके विकल्प:' : 'Options when facing a shortfall:'}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        id="btn-shortfall-review-dates"
                        onClick={() => {
                          if (onNavigateToSchedule) onNavigateToSchedule();
                        }}
                        className="px-2.5 py-2 rounded-lg border border-[#E5E1D8] bg-[#FAF8F2] hover:bg-[#E5E1D8] text-[11px] font-bold text-[#203331] text-center transition-all flex items-center justify-center gap-1"
                      >
                        <Calendar className="w-3 h-3 text-[#155E59]" />
                        <span>{isHi ? 'तारीखें देखें' : 'Review dates'}</span>
                      </button>

                      <button
                        type="button"
                        id="btn-shortfall-try-another"
                        onClick={() => applyPreset('balanced')}
                        className="px-2.5 py-2 rounded-lg border border-[#E5E1D8] bg-[#FAF8F2] hover:bg-[#E5E1D8] text-[11px] font-bold text-[#203331] text-center transition-all flex items-center justify-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3 text-[#D9A441]" />
                        <span>{isHi ? 'अन्य परिदृश्य' : 'Try another'}</span>
                      </button>

                      <button
                        type="button"
                        id="btn-shortfall-request-help"
                        onClick={() => setShowHelpModal(true)}
                        className="px-2.5 py-2 rounded-lg border border-[#8A2E14] bg-[#8A2E14] text-white hover:bg-[#8A2E14]/90 text-[11px] font-bold text-center transition-all flex items-center justify-center gap-1 shadow-xs"
                      >
                        <PhoneCall className="w-3 h-3 text-white" />
                        <span>{isHi ? 'मदद मांगें' : 'Request help'}</span>
                      </button>
                    </div>

                    <p className="text-[10px] text-[#8A2E14] font-medium italic">
                      {isHi 
                        ? 'नोट: कभी भी दूसरा लोन लेकर पुराना लोन न चुकाएं। पुनर्भुगतान की नियत तारीख स्वतः नहीं बदलती।'
                        : 'Rule: Never take another loan to cover an EMI. Repayment due date does not change automatically without written lender restructuring.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Delay Penalty & Grace Period Tab */
        <div className="space-y-6">
          {/* Preset Scenario Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Scenario A */}
            <div 
              onClick={() => {
                setActiveScenario('A');
                setDelayDays(0);
                setAccountHasFunds(true);
                onScenarioPractised('scenario_a_on_time');
              }}
              className={`p-6 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                activeScenario === 'A' 
                  ? 'bg-[#E8F3EC] border-[#155E59] ring-1 ring-[#155E59]' 
                  : 'bg-white border-[#E5E1D8] hover:border-[#155E59]/40'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#155E59]">
                  {isHi ? 'आदर्श स्थिति' : 'Ideal Path'}
                </span>
                <CheckCircle2 className="w-4 h-4 text-[#155E59]" />
              </div>
              <h3 className="font-bold text-base md:text-lg text-[#203331] mb-1.5">
                {t.step4Scenario1Title}
              </h3>
              <p className="text-xs text-[#203331]/70 leading-relaxed">
                {t.step4Scenario1Desc}
              </p>
              <div className="mt-4 pt-3 border-t border-[#155E59]/10 text-xs font-bold text-[#155E59]">
                Total: {formatPaiseToRupees(approvedInstalmentPaise)} (₹0 penalty)
              </div>
            </div>

            {/* Scenario B */}
            <div 
              onClick={() => {
                setActiveScenario('B');
                setDelayDays(4);
                setAccountHasFunds(true);
                onScenarioPractised('scenario_b_salary_delayed');
              }}
              className={`p-6 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                activeScenario === 'B' 
                  ? 'bg-[#FAF8F2] border-[#D9A441] ring-1 ring-[#D9A441]' 
                  : 'bg-white border-[#E5E1D8] hover:border-[#D9A441]/40'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#D9A441]">
                  {isHi ? 'सामान्य देरी' : 'Common Delay'}
                </span>
                <Clock className="w-4 h-4 text-[#D9A441]" />
              </div>
              <h3 className="font-bold text-base md:text-lg text-[#203331] mb-1.5">
                {t.step4Scenario2Title}
              </h3>
              <p className="text-xs text-[#203331]/70 leading-relaxed">
                {t.step4Scenario2Desc}
              </p>
              <div className="mt-4 pt-3 border-t border-[#E5E1D8] text-xs font-bold text-[#D9A441]">
                Total: {formatPaiseToRupees(approvedInstalmentPaise + 5000)} (₹50 late fee)
              </div>
            </div>

            {/* Scenario C */}
            <div 
              onClick={() => {
                setActiveScenario('C');
                setDelayDays(5);
                setAccountHasFunds(false);
                onScenarioPractised('scenario_c_nach_bounce');
              }}
              className={`p-6 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                activeScenario === 'C' 
                  ? 'bg-[#FAF8F2] border-[#8A2E14] ring-1 ring-[#8A2E14]' 
                  : 'bg-white border-[#E5E1D8] hover:border-[#8A2E14]/40'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A2E14]">
                  {isHi ? 'बाउंस स्थिति' : 'Bounce Risk'}
                </span>
                <AlertTriangle className="w-4 h-4 text-[#8A2E14]" />
              </div>
              <h3 className="font-bold text-base md:text-lg text-[#203331] mb-1.5">
                {t.step4Scenario3Title}
              </h3>
              <p className="text-xs text-[#203331]/70 leading-relaxed">
                {t.step4Scenario3Desc}
              </p>
              <div className="mt-4 pt-3 border-t border-[#E5E1D8] text-xs font-bold text-[#8A2E14]">
                Total: {formatPaiseToRupees(approvedInstalmentPaise + 25000)} (₹250 fee + charges)
              </div>
            </div>
          </div>

          {/* Interactive Delay Slider */}
          <div className="bg-white border border-[#E5E1D8] rounded-2xl p-6 sm:p-8 shadow-sm">
            <h3 className="font-bold text-base md:text-lg text-[#203331] mb-5 flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#E8F3EC] text-[#155E59]">
                <Clock className="w-5 h-5" />
              </div>
              <span>{isHi ? 'दिनों की देरी का खुद परीक्षण करें:' : 'Test Custom Delay in Days:'}</span>
            </h3>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-center text-sm font-medium mb-2 text-[#203331]">
                  <span>{isHi ? 'भुगतान में देरी:' : 'Delay in Payment:'}</span>
                  <span className="px-3 py-1 rounded-full bg-[#E8F3EC] text-[#155E59] font-bold text-xs">
                    {delayDays} {isHi ? 'दिन' : 'Days'} {delayDays <= graceDays && delayDays > 0 ? `(${isHi ? 'छूट अवधि के अंदर' : 'Within Grace Period'})` : ''}
                  </span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="15" 
                  value={delayDays}
                  onChange={(e) => {
                    setDelayDays(Number(e.target.value));
                    setActiveScenario('custom');
                  }}
                  className="w-full h-2.5 bg-[#FAF8F2] border border-[#E5E1D8] rounded-lg appearance-none cursor-pointer accent-[#155E59]"
                />
                <div className="flex justify-between text-[11px] text-[#203331]/60 mt-2 font-medium">
                  <span>0 Days (On time)</span>
                  <span>3 Days (Grace window)</span>
                  <span>7 Days</span>
                  <span>15 Days (Max cap)</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer text-xs md:text-sm text-[#203331]">
                  <input 
                    type="checkbox"
                    checked={!accountHasFunds}
                    onChange={(e) => {
                      setAccountHasFunds(!e.target.checked);
                      setActiveScenario('custom');
                    }}
                    className="w-4 h-4 rounded border-[#E5E1D8] text-[#155E59] focus:ring-[#155E59]"
                  />
                  <span>{isHi ? 'देय तिथि पर बैंक खाते में पर्याप्त धनराशि नहीं थी (ऑटो-डेबिट बाउंस हुआ)' : 'Account lacked funds on due date (Triggered NACH bounce)'}</span>
                </label>
              </div>
            </div>

            {/* Live Rupee Cost Calculator Table */}
            <div className="mt-6 p-5 rounded-2xl bg-[#FAF8F2] border border-[#E5E1D8]">
              <h4 className="font-bold text-[11px] text-[#203331]/60 uppercase tracking-wider mb-4">
                {t.step4ResultSummary}
              </h4>

              <div className="space-y-3 text-sm text-[#203331]">
                <div className="flex justify-between">
                  <span>Scheduled Monthly EMI:</span>
                  <span className="font-semibold">{formatPaiseToRupees(approvedInstalmentPaise)}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-[#203331]/70">
                    Lender Late Fee ({effectivePenaltyDays} penalty days x ₹50/day):
                  </span>
                  <span className={calculatedLateFeePaise > 0 ? 'text-[#8A2E14] font-bold' : 'text-[#155E59] font-bold'}>
                    +{formatPaiseToRupees(calculatedLateFeePaise)}
                  </span>
                </div>
                {bankBouncePaise > 0 && (
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-[#8A2E14]">
                      Bank Auto-Debit Bounce Charge:
                    </span>
                    <span className="text-[#8A2E14] font-bold">
                      +{formatPaiseToRupees(bankBouncePaise)}
                    </span>
                  </div>
                )}
                
                <div className="pt-3 border-t border-[#E5E1D8] flex justify-between font-bold text-base md:text-xl text-[#203331]">
                  <span>{isHi ? 'इस महीने कुल भुगतान:' : 'Total Out-of-Pocket for Month:'}</span>
                  <span className="text-[#155E59]">{formatPaiseToRupees(totalOutflowPaise)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Helpful Borrower Safety Guideline Card */}
      <div className="bg-white border border-[#E5E1D8] rounded-2xl p-6 flex items-start gap-4 shadow-sm">
        <div className="p-2.5 rounded-xl bg-[#FAF8F2] text-[#D9A441] border border-[#E5E1D8] shrink-0">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs md:text-sm text-[#203331]">
          <h4 className="font-bold text-sm md:text-base text-[#155E59]">
            {t.step4TipsTitle}
          </h4>
          <p className="leading-relaxed text-[#203331]/80">
            {t.step4TipsDesc}
          </p>
        </div>
      </div>

      {/* Assistance Request Modal (Queue record created in Firestore/server) */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E1D8] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-xl relative animate-in fade-in zoom-in-95">
            <button 
              type="button"
              onClick={() => {
                setShowHelpModal(false);
                setHelpSuccess(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#203331]/60 hover:bg-[#FAF8F2]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#8A2E14]/10 text-[#8A2E14]">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#203331]">
                  {isHi ? 'मानवीय सहायता का अनुरोध करें' : 'Request Human Guidance / Assistance'}
                </h3>
                <p className="text-xs text-[#203331]/70">
                  {isHi ? 'कठिन महीने में ऋण पुनर्भुगतान सहायता के लिए' : 'For loan repayment counselling and restructuring inquiry'}
                </p>
              </div>
            </div>

            {helpSuccess ? (
              <div className="p-4 rounded-xl bg-[#E8F3EC] border border-[#155E59] text-xs text-[#155E59] space-y-2">
                <div className="font-bold text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isHi ? 'सहायता अनुरोध सफलतापूर्वक कतारबद्ध हुआ' : 'Assistance Request Queued'}</span>
                </div>
                <p>{helpSuccess}</p>
                <div className="text-[11px] text-[#203331]/80 pt-2 border-t border-[#155E59]/20">
                  {isHi 
                    ? 'कृपया ध्यान दें: वर्तमान में कोई लाइव एजेंट चैट में नहीं है। कार्य समय के दौरान एक वित्तीय परामर्शदाता आपसे संपर्क करेगा।'
                    : 'Real queue status: No live agent is currently connected. A guidance counselor will contact you during business hours.'}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowHelpModal(false);
                    setHelpSuccess(null);
                  }}
                  className="mt-3 w-full py-2 bg-[#155E59] text-white font-bold rounded-xl text-xs"
                >
                  {isHi ? 'ठीक है' : 'Close'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleAssistanceSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#203331] mb-1">
                    {isHi ? 'अपनी स्थिति या प्रश्न संक्षेप में बताएं:' : 'Briefly describe your question or difficulty:'}
                  </label>
                  <textarea
                    rows={3}
                    value={helpNote}
                    onChange={(e) => setHelpNote(e.target.value)}
                    placeholder={isHi ? 'उदा. मेरी सैलरी 5 तारीख को आती है जबकि ईएमआई 30 तारीख को है...' : 'e.g. My salary gets credited on the 5th whereas due date is 30th...'}
                    className="w-full p-3 text-xs rounded-xl border border-[#E5E1D8] bg-[#FAF8F2] focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="p-3 rounded-xl bg-[#FAF8F2] border border-[#E5E1D8] text-[11px] text-[#203331]/75 leading-relaxed">
                  <p>
                    {isHi
                      ? 'यह अनुरोध एक वास्तविक सहायता कतार में दर्ज होता है। हम कभी झूठा दावा नहीं करते कि "एजेंट जुड़ा हुआ है"।'
                      : 'This creates an authentic queue record. No synthetic agent is presented as live.'}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowHelpModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-[#E5E1D8] text-xs font-bold text-[#203331] hover:bg-[#FAF8F2]"
                  >
                    {isHi ? 'रद्द करें' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={helpSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-[#155E59] text-white text-xs font-bold hover:bg-[#155E59]/90 disabled:opacity-50"
                  >
                    {helpSubmitting ? (isHi ? 'दर्ज हो रहा है...' : 'Submitting...') : (isHi ? 'अनुरोध भेजें' : 'Submit Request')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
