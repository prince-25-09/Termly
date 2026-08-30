import React from 'react';
import { Language } from '../../types';
import { i18n } from '../../i18n';
import { Check, ShieldCheck } from 'lucide-react';

interface Props {
  currentStep: number;
  totalSteps: number;
  language: Language;
  onStepClick: (step: number) => void;
  maxStepReached: number;
}

export const ProgressRail: React.FC<Props> = ({
  currentStep,
  totalSteps,
  language,
  onStepClick,
  maxStepReached
}) => {
  const t = i18n[language];

  const stepLabels = [
    { num: 1, title: t.step1Name },
    { num: 2, title: t.step2Name },
    { num: 3, title: t.step3Name },
    { num: 4, title: t.step4Name },
    { num: 5, title: t.step5Name },
    { num: 6, title: t.step6Name },
  ];

  if (currentStep === 0) return null;

  return (
    <div>
      {/* Mobile Compact Progress Bar */}
      <div className="md:hidden bg-white border border-[#E5E1D8] rounded-2xl p-4 mb-4 shadow-sm">
        <div className="flex items-center justify-between text-xs font-semibold text-[#203331]/70 mb-2">
          <span className="text-[#155E59] font-bold">
            {t.navStep} {currentStep} {t.navOf} {totalSteps}
          </span>
          <span className="text-[#203331] font-bold truncate max-w-[200px]">
            {stepLabels[currentStep - 1]?.title}
          </span>
        </div>
        <div className="w-full bg-[#FAF8F2] border border-[#E5E1D8] h-2 rounded-full overflow-hidden">
          <div 
            className="bg-[#155E59] h-full transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop Progress Rail (Sleek Interface) */}
      <aside className="hidden md:flex flex-col gap-6 bg-white/70 backdrop-blur-xs border border-[#E5E1D8] p-6 rounded-2xl shadow-sm sticky top-20">
        <div className="text-xs font-bold uppercase tracking-widest text-[#D9A441]">
          {language === 'hi' ? 'आपकी सीखने की यात्रा' : 'Your Journey'}
        </div>

        <nav className="space-y-4">
          {stepLabels.map((step) => {
            const isCurrent = currentStep === step.num;
            const isCompleted = step.num < currentStep;
            const isAccessible = step.num <= maxStepReached;

            return (
              <button
                key={step.num}
                type="button"
                onClick={() => isAccessible && onStepClick(step.num)}
                disabled={!isAccessible}
                className={`w-full text-left p-2 rounded-xl flex items-center gap-3.5 transition-all text-sm ${
                  isCurrent
                    ? 'bg-[#E8F3EC]/80 text-[#155E59] font-semibold border border-[#155E59]/20 shadow-xs'
                    : isCompleted
                      ? 'text-[#203331] font-medium hover:bg-white'
                      : isAccessible
                        ? 'text-[#203331]/70 font-medium hover:bg-white'
                        : 'text-[#203331]/40 font-medium cursor-not-allowed opacity-50'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                    isCurrent
                      ? 'bg-[#155E59] text-white shadow-xs'
                      : isCompleted
                        ? 'bg-[#E8F3EC] text-[#155E59] border border-[#155E59]/30'
                        : 'border-2 border-[#E5E1D8] text-[#203331]/60 bg-white'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : step.num}
                </div>
                <span className="truncate">{step.title}</span>
              </button>
            );
          })}
        </nav>

        {/* Demo Lender notice */}
        <div className="mt-4 p-4 bg-[#E8F3EC] rounded-xl border border-[#155E59]/10 text-xs">
          <p className="font-bold text-[#155E59] mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Demo Verified Lender
          </p>
          <p className="text-[#203331]/70 italic">
            {language === 'hi' ? 'सुरक्षित और सत्यापित KFS प्रारूप' : 'Standardized KFS Notebook'}
          </p>
        </div>
      </aside>
    </div>
  );
};
