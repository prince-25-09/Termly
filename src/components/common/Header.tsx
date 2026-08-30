import React from 'react';
import { Language } from '../../types';
import { i18n } from '../../i18n';
import { SamajhLogo } from './Illustrations';
import { Globe, HelpCircle, Bookmark, Shield, ShieldCheck, UserCheck } from 'lucide-react';

interface Props {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenHelp: () => void;
  onOpenSave: () => void;
  onToggleWorkspace: () => void;
  isReviewerMode: boolean;
}

export const Header: React.FC<Props> = ({
  language,
  onLanguageChange,
  onOpenHelp,
  onOpenSave,
  onToggleWorkspace,
  isReviewerMode
}) => {
  const t = i18n[language];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5E1D8] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-3.5 md:py-4 flex items-center justify-between gap-4">
        {/* Left: Brand logo & Title */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#E8F3EC] text-[#155E59] border border-[#155E59]/10">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#155E59" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <path d="m9 10 2 2 4-4" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg md:text-xl text-[#203331] tracking-tight">
                Termly
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E8F3EC] text-[#155E59] border border-[#155E59]/20">
                KFS Prototype
              </span>
            </div>
            <p className="text-xs text-[#203331]/60 hidden md:block">
              {language === 'hi' ? 'Understand first. Decide confidently.' : 'Understand first. Decide confidently.'}
            </p>
          </div>
        </div>

        {/* Right: Actions (Language, Help, Save/Resume, Reviewer Switch) */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Language toggle pill */}
          <div className="flex bg-[#E8F3EC] rounded-full p-1 border border-[#155E59]/20">
            <button
              type="button"
              onClick={() => onLanguageChange('en')}
              className={`px-3.5 py-1 rounded-full text-xs sm:text-sm font-medium transition-all ${
                language === 'en' 
                  ? 'bg-white text-[#203331] shadow-xs' 
                  : 'text-[#155E59]/70 hover:text-[#155E59]'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('hi')}
              className={`px-3.5 py-1 rounded-full text-xs sm:text-sm font-medium transition-all ${
                language === 'hi' 
                  ? 'bg-white text-[#203331] shadow-xs' 
                  : 'text-[#155E59]/70 hover:text-[#155E59]'
              }`}
            >
              हिंदी
            </button>
          </div>

          {/* Help button */}
          <button
            type="button"
            onClick={onOpenHelp}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-[#155E59] hover:bg-[#E8F3EC] transition-colors"
            title={t.btnHelp}
          >
            <HelpCircle className="w-4 h-4 text-[#155E59]" />
            <span>{language === 'hi' ? 'मदद' : 'Help'}</span>
          </button>

          {/* Save / Resume button */}
          <button
            type="button"
            onClick={onOpenSave}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-[#203331]/70 border border-[#E5E1D8] hover:bg-[#FAF8F2] transition-colors"
            title={t.btnSaveResume}
          >
            <Bookmark className="w-4 h-4 text-[#D9A441]" />
            <span>{language === 'hi' ? 'सहेजें' : 'Save & Resume'}</span>
          </button>

          {/* Isolated Reviewer Workspace Toggle */}
          <button
            type="button"
            onClick={onToggleWorkspace}
            className={`text-xs sm:text-sm font-semibold transition-all ${
              isReviewerMode
                ? 'px-3.5 py-1.5 rounded-xl bg-[#203331] text-white shadow-xs'
                : 'text-[#155E59] hover:text-[#104743] underline underline-offset-4'
            }`}
          >
            {isReviewerMode 
              ? (language === 'hi' ? '← वापस नोटबुक पर' : '← Borrower Flow') 
              : (language === 'hi' ? 'रिव्यूअर पोर्टल' : 'Reviewer Portal')}
          </button>
        </div>
      </div>
    </header>
  );
};
