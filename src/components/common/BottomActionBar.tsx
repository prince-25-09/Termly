import React from 'react';
import { Language } from '../../types';
import { i18n } from '../../i18n';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

interface Props {
  currentStep: number;
  totalSteps: number;
  language: Language;
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
}

export const BottomActionBar: React.FC<Props> = ({
  currentStep,
  totalSteps,
  language,
  onBack,
  onNext,
  nextDisabled = false,
}) => {
  const t = i18n[language];

  if (currentStep === 0 || currentStep === 6) return null;

  return (
    <footer className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-md border-t border-[#E5E1D8] px-4 sm:px-8 md:px-10 py-4 md:py-5 mt-8 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Back Button */}
        <div>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 rounded-xl font-medium text-[#203331]/70 hover:bg-[#FAF8F2] border border-[#E5E1D8] transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.btnBack}</span>
            </button>
          )}
        </div>

        {/* Center: Step Indicator */}
        <div className="text-xs font-semibold text-[#203331]/60 hidden sm:block">
          {t.navStep} {currentStep} {t.navOf} {totalSteps}
        </div>

        {/* Right: Continue / Next Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled}
            className={`flex items-center justify-center gap-2 px-6 sm:px-10 md:px-12 py-2.5 md:py-3 rounded-xl font-bold text-sm text-white shadow-lg shadow-[#155E59]/20 transition-all ${
              nextDisabled
                ? 'bg-[#A0ABA9] cursor-not-allowed opacity-60'
                : 'bg-[#155E59] hover:bg-[#104743] hover:scale-[1.02] active:scale-95'
            }`}
          >
            <span>
              {currentStep === 5 
                ? (language === 'hi' ? 'निर्णय पर जाएं →' : 'Proceed to Choice →') 
                : (language === 'hi' ? 'अगला कदम →' : `${t.btnContinue} →`)}
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
};
