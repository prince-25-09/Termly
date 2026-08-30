import React, { useState } from 'react';
import { LoanOfferFacts, Language } from '../../types';
import { i18n } from '../../i18n';
import { MoneyJourneyVisual } from './MoneyJourneyVisual';
import { formatPaiseToRupees } from '../../utils/formatters';
import { HelpCircle, Check, ArrowRight, Info, AlertCircle, Volume2 } from 'lucide-react';
import { speechNarrator } from '../../utils/speech';

interface Props {
  offer: LoanOfferFacts;
  language: Language;
}

export const Step1YourLoan: React.FC<Props> = ({ offer, language }) => {
  const t = i18n[language];
  const [showFeeDetails, setShowFeeDetails] = useState(false);

  const handleListen = () => {
    const text = language === 'hi'
      ? `${t.step1Title}। ${t.step1Subtitle}। स्वीकृत लोन ${formatPaiseToRupees(offer.sanctionedAmountPaise)} है। ₹500 शुरुआती शुल्क कटने के बाद आपके बैंक खाते में ठीक ${formatPaiseToRupees(offer.netDisbursementPaise)} आएंगे। ${t.step1Takeaway}`
      : `${t.step1Title}. ${t.step1Subtitle}. Total approved loan is ${formatPaiseToRupees(offer.sanctionedAmountPaise)}. After deducting ${formatPaiseToRupees(offer.upfrontFeePaise)} upfront processing fee, exactly ${formatPaiseToRupees(offer.netDisbursementPaise)} will be credited to your bank account today. ${t.step1Takeaway}`;
    speechNarrator.toggle(text, language);
  };

  return (
    <div className="space-y-8">
      {/* Title & Speech header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif italic text-[#203331] tracking-tight">
            {language === 'hi' ? 'आपकी धन यात्रा' : 'Your money journey'}
          </h1>
          <p className="text-base md:text-lg text-[#203331]/80 mt-2 max-w-2xl leading-relaxed">
            {language === 'hi' 
              ? 'आइए जांचें कि क्या हमने इसे स्पष्ट रूप से समझाया है। यहां बताया गया है कि आपका ऋण शुरू से अंत तक कैसे काम करता है।' 
              : 'Let’s check whether we explained this clearly. Here is how your loan works from start to finish.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleListen}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E5E1D8] text-xs font-semibold text-[#155E59] bg-white hover:bg-[#E8F3EC] transition-all self-start sm:self-auto shadow-xs"
        >
          <Volume2 className="w-4 h-4 text-[#155E59]" />
          <span>{t.btnListen}</span>
        </button>
      </div>

      {/* Signature Visual: Your Money Journey */}
      <MoneyJourneyVisual offer={offer} language={language} interactive={true} />

      {/* Detailed 3-Box Mathematical Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Box 1: Sanctioned */}
        <div className="bg-white border border-[#E5E1D8] rounded-2xl p-6 shadow-sm">
          <div className="text-[11px] font-bold text-[#D9A441] uppercase tracking-wider">
            {t.step1SanctionedLabel}
          </div>
          <div className="text-2xl md:text-3xl font-bold text-[#203331] mt-1.5 tracking-tight">
            {formatPaiseToRupees(offer.sanctionedAmountPaise)}
          </div>
          <p className="text-xs text-[#203331]/70 mt-2 leading-relaxed">
            {t.step1SanctionedHelp}
          </p>
        </div>

        {/* Box 2: Upfront Fee */}
        <div className="bg-[#FAF8F2] border border-[#E5E1D8] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold text-[#D9A441] uppercase tracking-wider">
              {t.step1FeeLabel}
            </div>
            <button
              type="button"
              onClick={() => setShowFeeDetails(!showFeeDetails)}
              className="text-xs text-[#155E59] underline font-medium hover:text-[#104743]"
            >
              {showFeeDetails ? 'Hide breakdown' : 'Why deducted?'}
            </button>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-[#8A2E14] mt-1.5 tracking-tight">
            -{formatPaiseToRupees(offer.upfrontFeePaise)}
          </div>
          <p className="text-xs text-[#203331]/70 mt-2 leading-relaxed">
            {t.step1FeeHelp}
          </p>

          {showFeeDetails && (
            <div className="mt-3 pt-2.5 border-t border-[#E5E1D8] text-[11px] text-[#203331]/80 space-y-1">
              <p>• Loan Processing: ₹423.73</p>
              <p>• GST (18% on fee): ₹76.27</p>
              <p className="font-semibold mt-1 text-[#203331]">• Total Deducted: ₹500.00</p>
            </div>
          )}
        </div>

        {/* Box 3: Net In Hand */}
        <div className="bg-[#E8F3EC] border border-[#155E59]/20 rounded-2xl p-6 shadow-sm ring-2 ring-[#155E59]/5">
          <div className="text-[11px] font-bold text-[#155E59] uppercase tracking-wider">
            {t.step1NetLabel}
          </div>
          <div className="text-2xl md:text-3xl font-bold text-[#155E59] mt-1.5 tracking-tight">
            {formatPaiseToRupees(offer.netDisbursementPaise)}
          </div>
          <p className="text-xs text-[#203331]/80 mt-2 leading-relaxed">
            {t.step1NetHelp}
          </p>
        </div>
      </div>

      {/* Critical Borrower Notebook Takeaway Callout */}
      <div className="bg-white border border-[#E5E1D8] rounded-2xl p-6 flex items-start gap-4 shadow-sm">
        <div className="p-2.5 rounded-xl bg-[#E8F3EC] text-[#155E59] shrink-0">
          <Info className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-sm md:text-base text-[#203331]">
            {language === 'hi' ? 'महत्वपूर्ण समझ बिंदु:' : 'Important Borrower Check:'}
          </h4>
          <p className="text-sm md:text-base text-[#203331]/85 leading-relaxed">
            {t.step1Takeaway}
          </p>
        </div>
      </div>
    </div>
  );
};
