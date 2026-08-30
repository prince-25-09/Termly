import React from 'react';
import { LoanOfferFacts, Language } from '../../types';
import { i18n } from '../../i18n';
import { SamajhLogo, WalletIllustration, CalendarIllustration, DocumentIllustration } from '../common/Illustrations';
import { formatPaiseToRupees } from '../../utils/formatters';
import { ArrowRight, Volume2, ShieldCheck, CheckCircle2, AlertTriangle, BookOpen } from 'lucide-react';
import { speechNarrator } from '../../utils/speech';

interface Props {
  offer: LoanOfferFacts;
  language: Language;
  onStart: () => void;
  onLanguageChange: (lang: Language) => void;
}

export const StepWelcome: React.FC<Props> = ({ offer, language, onStart, onLanguageChange }) => {
  const t = i18n[language];

  const handleListenIntro = () => {
    const speechText = language === 'hi'
      ? `${t.appTitle} में आपका स्वागत है। ${t.welcomeHeadline} ${t.welcomeLead}`
      : `Welcome to ${t.appTitle}. ${t.welcomeHeadline} ${t.welcomeLead}`;
    speechNarrator.toggle(speechText, language);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Fictional Institution Alert Banner */}
      <div className="bg-[#FAF8F2] border border-[#E5E1D8] rounded-2xl p-4 flex items-center gap-3.5 text-xs sm:text-sm text-[#203331]/80 shadow-xs">
        <div className="p-2 rounded-xl bg-[#E8F3EC] text-[#155E59] shrink-0">
          <AlertTriangle className="w-4 h-4 text-[#D9A441]" />
        </div>
        <p>
          <strong className="text-[#203331]">{language === 'hi' ? 'सूचना:' : 'Notice:'}</strong> {t.fictionalNotice}
        </p>
      </div>

      {/* Main Welcome Hero Card */}
      <div className="bg-white border border-[#E5E1D8] rounded-2xl p-6 sm:p-8 md:p-10 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E1D8] pb-6 mb-8">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-[#E8F3EC] text-[#155E59] border border-[#155E59]/10">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#155E59" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <path d="m9 10 2 2 4-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#203331] tracking-tight">
                {t.appTitle}
              </h1>
              <p className="text-xs sm:text-sm text-[#203331]/60 font-medium mt-0.5">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Audio Listen Control */}
          <button
            type="button"
            onClick={handleListenIntro}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E5E1D8] text-xs font-semibold text-[#155E59] bg-[#FAF8F2] hover:bg-[#E8F3EC] transition-all self-start sm:self-auto shadow-xs"
            aria-label="Listen to introductory text"
          >
            <Volume2 className="w-4 h-4 text-[#155E59]" />
            <span>{t.btnListen}</span>
          </button>
        </div>

        {/* Core Value Proposition */}
        <div className="space-y-3">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif italic text-[#203331] leading-tight">
            {t.welcomeHeadline}
          </h2>
          <p className="text-base sm:text-lg text-[#203331]/80 leading-relaxed max-w-3xl">
            {t.welcomeLead}
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 my-8">
          <div className="bg-[#FAF8F2] border border-[#E5E1D8] rounded-2xl p-5 flex flex-col justify-between shadow-xs">
            <div>
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E5E1D8] flex items-center justify-center mb-3 text-[#155E59]">
                <WalletIllustration className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base text-[#203331] mb-1">
                {t.welcomeFeature1Title}
              </h3>
              <p className="text-xs sm:text-sm text-[#203331]/70 leading-relaxed">
                {t.welcomeFeature1Desc}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E5E1D8] text-xs font-bold text-[#155E59]">
              Net {formatPaiseToRupees(offer.netDisbursementPaise)} in hand
            </div>
          </div>

          <div className="bg-[#FAF8F2] border border-[#E5E1D8] rounded-2xl p-5 flex flex-col justify-between shadow-xs">
            <div>
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E5E1D8] flex items-center justify-center mb-3 text-[#D9A441]">
                <CalendarIllustration className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base text-[#203331] mb-1">
                {t.welcomeFeature2Title}
              </h3>
              <p className="text-xs sm:text-sm text-[#203331]/70 leading-relaxed">
                {t.welcomeFeature2Desc}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E5E1D8] text-xs font-bold text-[#D9A441]">
              {offer.instalments.length} Monthly Instalments
            </div>
          </div>

          <div className="bg-[#FAF8F2] border border-[#E5E1D8] rounded-2xl p-5 flex flex-col justify-between shadow-xs">
            <div>
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E5E1D8] flex items-center justify-center mb-3 text-[#155E59]">
                <DocumentIllustration className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base text-[#203331] mb-1">
                {t.welcomeFeature3Title}
              </h3>
              <p className="text-xs sm:text-sm text-[#203331]/70 leading-relaxed">
                {t.welcomeFeature3Desc}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E5E1D8] text-xs font-bold text-[#155E59]">
              {offer.coolingOffDays}-Day Zero-Fee Exit
            </div>
          </div>
        </div>

        {/* Audience note & Start CTA */}
        <div className="bg-[#E8F3EC] border border-[#155E59]/10 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-[#155E59] shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-[#203331]/80 leading-relaxed">
              {t.welcomeAudienceNote}
            </p>
          </div>

          <button
            type="button"
            id="start-notebook-btn"
            onClick={onStart}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#155E59] hover:bg-[#104743] text-white font-bold rounded-xl text-sm sm:text-base transition-all shadow-lg shadow-[#155E59]/20 hover:scale-[1.02] active:scale-95 whitespace-nowrap"
          >
            <span>{t.welcomeStartButton}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
