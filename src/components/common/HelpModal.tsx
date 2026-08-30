import React from 'react';
import { Language } from '../../types';
import { i18n } from '../../i18n';
import { X, BookOpen, HelpCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const HelpModal: React.FC<Props> = ({ isOpen, onClose, language }) => {
  const t = i18n[language];
  if (!isOpen) return null;

  const glossaryItems = [
    {
      termEn: 'Key Fact Statement (KFS)',
      termHi: 'मुख्य तथ्य विवरण (KFS)',
      descEn: 'A standardized 1-2 page summary mandated by the Reserve Bank of India (RBI) disclosing the exact loan amount, upfront charges, APR, instalment schedule, and grievance contacts before you sign.',
      descHi: 'भारतीय रिज़र्व बैंक (आरबीआई) द्वारा अनिवार्य 1-2 पेज का संक्षिप्त दस्तावेज, जिसमें हस्ताक्षर करने से पहले स्वीकृत राशि, शुरुआती शुल्क, ब्याज दर, किस्तों की समय सारिणी और शिकायत संपर्क साफ लिखे होते हैं।'
    },
    {
      termEn: 'Annual Percentage Rate (APR)',
      termHi: 'वार्षिक प्रतिशत दर (APR)',
      descEn: 'The true total annual cost of borrowing, which includes not just interest, but all upfront processing fees and documentation charges.',
      descHi: 'लोन लेने की कुल वास्तविक वार्षिक लागत, जिसमें केवल ब्याज ही नहीं, बल्कि शुरुआती प्रोसेसिंग और दस्तावेजी शुल्क भी शामिल होते हैं।'
    },
    {
      termEn: 'Cooling-Off / Look-up Period',
      termHi: 'कूलिंग-ऑफ अवधि (Cooling-off Period)',
      descEn: 'A statutory 3-day window allowing you to exit or cancel the loan without any penalty, simply by returning the principal plus proportionate interest for the 3 days.',
      descHi: 'आरबीआई द्वारा दिया गया 3 दिन का समय, जिसमें आप बिना किसी जुर्माने के लोन वापस कर सकते हैं। आपको केवल मूलधन और 3 दिन का आनुपातिक ब्याज लौटाना होता है।'
    },
    {
      termEn: 'Auto-Debit (e-NACH / UPI)',
      termHi: 'ऑटो-डेबिट (e-NACH / UPI)',
      descEn: 'An automated electronic mandate to debit your bank account for the exact monthly EMI on the due date. Always keep sufficient funds to avoid bank bounce penalties.',
      descHi: 'आपके बैंक खाते से देय तिथि पर ईएमआई की सही रकम अपने आप कटने की इलेक्ट्रॉनिक अनुमति। बाउंस चार्ज से बचने के लिए खाते में पर्याप्त पैसे रखना जरूरी है।'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#203331]/40 backdrop-blur-xs">
      <div className="bg-white border border-[#E5E1D8] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-[#E5E1D8] pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#E8F3EC] text-[#155E59]">
              <BookOpen className="w-5 h-5 text-[#155E59]" />
            </div>
            <h3 className="font-serif italic font-bold text-xl text-[#203331]">{t.helpTitle}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#FAF8F2] text-[#203331]/60 hover:text-[#203331] transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-[#203331]/75 leading-relaxed">
            {language === 'hi'
              ? 'यह शब्दावली आपको आरबीआई डिजिटल लेंडिंग नियमों के तहत आपके अधिकारों और लोन की शर्तों को आसानी से समझने में मदद करती है।'
              : 'This guide explains key financial terms and borrower rights under RBI Digital Lending Guidelines.'}
          </p>

          <div className="space-y-3">
            {glossaryItems.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#E5E1D8]">
                <h4 className="font-bold text-sm text-[#155E59] mb-1.5">
                  {language === 'hi' ? item.termHi : item.termEn}
                </h4>
                <p className="text-xs text-[#203331]/80 leading-relaxed">
                  {language === 'hi' ? item.descHi : item.descEn}
                </p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-[#E8F3EC] border border-[#155E59]/15 text-xs text-[#203331] space-y-1.5">
            <h5 className="font-bold text-[#155E59] flex items-center gap-2 text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>{language === 'hi' ? 'उधारकर्ता अधिकार सहायता' : 'Borrower Protection Helpline'}</span>
            </h5>
            <p className="text-[#203331]/80">RBI Sachet Portal: <span className="font-semibold text-[#155E59]">sachet.rbi.org.in</span></p>
            <p className="text-[#203331]/80">National Consumer Helpline: <span className="font-semibold text-[#155E59]">1915</span></p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#E5E1D8] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#155E59] text-white font-bold text-xs sm:text-sm hover:bg-[#104743] min-h-[44px] shadow-sm active:scale-95 transition-all"
          >
            {t.btnClose}
          </button>
        </div>
      </div>
    </div>
  );
};
