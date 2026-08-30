import React, { useState } from 'react';
import { Language, BorrowerSession } from '../../types';
import { i18n } from '../../i18n';
import { X, Copy, Check, Bookmark, RefreshCw, Trash2, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  currentSessionId: string;
  onResumeSession: (sessionId: string) => boolean;
  onDeleteSession: () => void;
}

export const SaveResumeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  language,
  currentSessionId,
  onResumeSession,
  onDeleteSession
}) => {
  const t = i18n[language];
  const [copied, setCopied] = useState(false);
  const [inputSessionId, setInputSessionId] = useState('');
  const [resumeError, setResumeError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSessionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleResume = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputSessionId.trim()) return;
    const success = onResumeSession(inputSessionId.trim());
    if (success) {
      onClose();
    } else {
      setResumeError(language === 'hi' ? 'सत्र ID नहीं मिला। कृपया जांचें।' : 'Session ID not found. Please verify.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#203331]/40 backdrop-blur-xs">
      <div className="bg-white border border-[#E5E1D8] rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative space-y-6">
        <div className="flex items-center justify-between border-b border-[#E5E1D8] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#FAF8F2] text-[#D9A441] border border-[#E5E1D8]">
              <Bookmark className="w-5 h-5" />
            </div>
            <h3 className="font-serif italic font-bold text-xl text-[#203331]">{t.saveTitle}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#FAF8F2] text-[#203331]/60 hover:text-[#203331] min-h-[44px] min-w-[44px] flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-[#203331]/75 leading-relaxed">
          {t.saveDesc}
        </p>

        {/* Current Session ID Box */}
        <div className="p-5 rounded-2xl bg-[#FAF8F2] border border-[#E5E1D8] space-y-2.5">
          <span className="text-[11px] font-bold text-[#203331]/60 uppercase tracking-wider">
            {t.saveSessionId}
          </span>
          <div className="flex items-center justify-between gap-3">
            <code className="font-mono text-sm font-bold text-[#155E59] truncate bg-white px-3 py-1.5 rounded-xl border border-[#E5E1D8]">
              {currentSessionId}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#E5E1D8] text-xs font-bold text-[#203331] hover:bg-[#E8F3EC] hover:text-[#155E59] inline-flex items-center gap-1.5 transition-all shadow-xs"
            >
              {copied ? <Check className="w-4 h-4 text-[#155E59]" /> : <Copy className="w-4 h-4 text-[#203331]/60" />}
              <span>{copied ? 'Copied' : t.btnCopyId}</span>
            </button>
          </div>
          <span className="text-[11px] text-[#203331]/60 block font-medium">
            {t.statusSimulated}
          </span>
        </div>

        {/* Resume Input Form */}
        <form onSubmit={handleResume} className="space-y-3">
          <label className="block text-xs font-bold text-[#203331] uppercase tracking-wider">
            {t.saveEnterId}
          </label>
          <div className="flex gap-2">
            <input 
              type="text"
              value={inputSessionId}
              onChange={(e) => {
                setInputSessionId(e.target.value);
                setResumeError(null);
              }}
              placeholder="e.g. SBS-SESS-..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#E5E1D8] bg-[#FAF8F2] text-xs md:text-sm font-mono text-[#203331] focus:ring-2 focus:ring-[#155E59] focus:bg-white focus:outline-none transition-all"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#155E59] hover:bg-[#104743] text-white text-xs font-bold rounded-xl min-h-[44px] shadow-sm transition-all active:scale-95"
            >
              {t.btnResume}
            </button>
          </div>
          {resumeError && (
            <p className="text-xs text-[#8A2E14] font-medium">{resumeError}</p>
          )}
        </form>

        {/* Delete / Reset Section */}
        <div className="pt-4 border-t border-[#E5E1D8] flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (window.confirm(language === 'hi' ? 'क्या आप वाकई इस सत्र को हटाना चाहते हैं?' : 'Are you sure you want to reset this session?')) {
                onDeleteSession();
                onClose();
              }
            }}
            className="text-xs text-[#8A2E14] hover:text-[#5E1E0B] font-bold inline-flex items-center gap-1.5 py-2 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t.btnDeleteSession}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-[#FAF8F2] border border-[#E5E1D8] rounded-xl text-xs font-bold text-[#203331] hover:bg-white min-h-[40px] transition-all"
          >
            {t.btnClose}
          </button>
        </div>
      </div>
    </div>
  );
};
