import React, { useState } from 'react';
import { LoanOfferFacts, Language } from '../../types';
import { formatPaiseToRupees } from '../../utils/formatters';
import { i18n } from '../../i18n';
import { Sparkles, Info, CreditCard, Calendar, CheckCircle2 } from 'lucide-react';

interface Props {
  offer: LoanOfferFacts;
  language: Language;
  interactive?: boolean;
}

export const MoneyJourneyVisual: React.FC<Props> = ({ offer, language, interactive = true }) => {
  const t = i18n[language];
  const [selectedNode, setSelectedNode] = useState<'disbursement' | number | 'total'>('disbursement');

  const extraCostPaise = offer.totalScheduledRepaymentPaise - offer.netDisbursementPaise;

  return (
    <div id="money-journey-container" className="space-y-6">
      {/* 3-Point Horizontal Money Journey Timeline */}
      <div className="relative py-2">
        {/* Connecting Path (Desktop) */}
        <div className="hidden md:block absolute top-1/2 left-10 right-10 h-[2px] bg-[#E5E1D8] -translate-y-1/2 -z-0" />
        <div className="hidden md:block absolute top-1/2 left-10 w-1/3 h-[2px] bg-[#155E59] -translate-y-1/2 -z-0" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
          {/* Point 1: Disbursement */}
          <div
            onClick={() => setSelectedNode('disbursement')}
            className={`flex flex-col items-center gap-3 bg-white p-6 rounded-2xl shadow-sm border transition-all cursor-pointer ${
              selectedNode === 'disbursement'
                ? 'border-[#155E59] ring-2 ring-[#155E59]/20'
                : 'border-[#E5E1D8] hover:border-[#155E59]/40'
            }`}
          >
            <div className="bg-[#E8F3EC] p-3 rounded-full text-[#155E59]">
              <CreditCard className="w-6 h-6" />
            </div>
            <div className="text-center">
              <span className="block text-[10px] uppercase tracking-wider text-[#D9A441] font-bold">
                {t.disbursementToday}
              </span>
              <span className="block text-2xl md:text-3xl font-bold text-[#203331] mt-0.5">
                {formatPaiseToRupees(offer.netDisbursementPaise)}
              </span>
              <span className="text-xs text-[#203331]/60">
                {t.amountSanctioned}: {formatPaiseToRupees(offer.sanctionedAmountPaise)}
              </span>
            </div>
          </div>

          {/* Point 2: Installments */}
          <div
            onClick={() => setSelectedNode(1)}
            className={`flex flex-col items-center gap-3 bg-white p-6 rounded-2xl shadow-sm border transition-all cursor-pointer ${
              typeof selectedNode === 'number'
                ? 'border-[#D9A441] ring-2 ring-[#D9A441]/20'
                : 'border-[#E5E1D8] hover:border-[#D9A441]/40'
            }`}
          >
            <div className="bg-[#FAF8F2] p-3 rounded-full text-[#D9A441]">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="text-center">
              <span className="block text-[10px] uppercase tracking-wider text-[#D9A441] font-bold">
                {offer.instalments.length} {t.instalmentCount}
              </span>
              <span className="block text-2xl md:text-3xl font-bold text-[#203331] mt-0.5">
                {formatPaiseToRupees(offer.instalments[0]?.amountPaise || 560000)}
              </span>
              <span className="text-xs text-[#203331]/60">
                {language === 'hi' ? 'पहली किस्त: ' : 'First: '}{offer.instalments[0]?.dueDate}
              </span>
            </div>
          </div>

          {/* Point 3: Total Repayment */}
          <div
            onClick={() => setSelectedNode('total')}
            className={`flex flex-col items-center gap-3 bg-white p-6 rounded-2xl shadow-sm border transition-all cursor-pointer ${
              selectedNode === 'total'
                ? 'border-[#155E59] ring-2 ring-[#155E59]/20'
                : 'border-[#155E59]/20 ring-1 ring-[#155E59]/5 hover:border-[#155E59]/40'
            }`}
          >
            <div className="bg-[#155E59] p-3 rounded-full text-white">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <span className="block text-[10px] uppercase tracking-wider text-[#155E59] font-bold">
                {t.moneyOut}
              </span>
              <span className="block text-2xl md:text-3xl font-bold text-[#155E59] mt-0.5">
                {formatPaiseToRupees(offer.totalScheduledRepaymentPaise)}
              </span>
              <span className="text-xs text-[#203331]/60">
                {language === 'hi' ? 'पूर्ण भुगतान' : 'Full Scheduled Repayment'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Panels (Sleek 2-column layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Key Information */}
        <div className="bg-[#E8F3EC] p-6 rounded-2xl border border-[#155E59]/10">
          <h3 className="font-bold text-[#155E59] mb-4 flex items-center gap-2 text-sm sm:text-base">
            <Info className="w-5 h-5" />
            {language === 'hi' ? 'मुख्य वित्तीय जानकारी' : 'Key Loan Information'}
          </h3>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between border-b border-[#155E59]/10 pb-2">
              <span className="text-[#203331]/80">{t.step1FeeLabel}</span>
              <span className="font-bold text-[#203331]">{formatPaiseToRupees(offer.upfrontFeePaise)}</span>
            </li>
            <li className="flex justify-between border-b border-[#155E59]/10 pb-2">
              <span className="text-[#203331]/80">{t.step2AprLabel}</span>
              <span className="font-bold text-[#203331]">
                {offer.aprPercent}% p.a. (KFS verified)
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-[#203331]/80">{t.step2LateFeeLabel}</span>
              <span className="font-bold text-[#203331]">₹250 per occurrence</span>
            </li>
          </ul>
        </div>

        {/* Right: Takeaway Quote Card */}
        <div className="bg-[#FAF8F2] border border-[#E5E1D8] p-6 rounded-2xl flex flex-col justify-center">
          <p className="text-sm md:text-base leading-relaxed text-[#203331]/85 italic">
            "{language === 'hi'
              ? `दो महीने के लिए यह पैसा उधार लेने पर कुल लागत `
              : `It costs `}
            <strong className="text-[#155E59] not-italic font-bold">{formatPaiseToRupees(extraCostPaise)}</strong>
            {language === 'hi'
              ? ` है। यह आपके खाते में आने वाली राशि और कुल वापस चुकाई जाने वाली राशि का वास्तविक अंतर है।`
              : ` to borrow this money for the full loan tenure. This is the exact difference between what you receive and what you pay back.`}
            "
          </p>
        </div>
      </div>
    </div>
  );
};
