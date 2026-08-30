import React, { useState, useMemo } from 'react';
import { LoanOfferFacts, Language } from '../../types';
import { i18n } from '../../i18n';
import { formatPaiseToRupees } from '../../utils/formatters';
import { compareDocumentTerms, generateDocumentHash, TermComparisonResult } from '../../utils/termComparison';
import { 
  ShieldCheck, 
  Lock, 
  AlertCircle, 
  Phone, 
  Mail, 
  Building, 
  Volume2, 
  CheckCircle2, 
  FileText, 
  AlertTriangle, 
  GitCompare, 
  ArrowRight, 
  RefreshCw, 
  HelpCircle,
  Hash,
  Scale,
  Calendar,
  FileCheck
} from 'lucide-react';
import { speechNarrator } from '../../utils/speech';

interface Props {
  offer: LoanOfferFacts;
  proposedFinalOffer?: LoanOfferFacts;
  language: Language;
  onPermissionsAcknowledged: (perms: Record<string, boolean>) => void;
  savedAcknowledged?: Record<string, boolean>;
  onAcknowledgeChangedTerms?: (acknowledged: boolean) => void;
  changedTermsAcknowledged?: boolean;
  onReassessTopic?: (topicId: string) => void;
  isSimulatedCorruptOffer?: boolean;
}

export const Step5CheckFinalTerms: React.FC<Props> = ({
  offer,
  proposedFinalOffer = offer,
  language,
  onPermissionsAcknowledged,
  savedAcknowledged = {},
  onAcknowledgeChangedTerms,
  changedTermsAcknowledged = false,
  onReassessTopic,
  isSimulatedCorruptOffer = false
}) => {
  const t = i18n[language];
  const isHi = language === 'hi';

  const [acknowledged, setAcknowledged] = useState<Record<string, boolean>>(savedAcknowledged);
  const [localChangedAcknowledged, setLocalChangedAcknowledged] = useState<boolean>(changedTermsAcknowledged);
  const [activeTab, setActiveTab] = useState<'comparison' | 'cooling_permissions' | 'grievance'>('comparison');

  // Perform code-based deterministic comparison
  const comparison: TermComparisonResult = useMemo(() => {
    if (isSimulatedCorruptOffer) {
      return compareDocumentTerms(offer, null);
    }
    return compareDocumentTerms(offer, proposedFinalOffer);
  }, [offer, proposedFinalOffer, isSimulatedCorruptOffer]);

  const togglePermission = (id: string) => {
    const updated = { ...acknowledged, [id]: !acknowledged[id] };
    setAcknowledged(updated);
    onPermissionsAcknowledged(updated);
  };

  const handleToggleChangedAcknowledged = (checked: boolean) => {
    setLocalChangedAcknowledged(checked);
    if (onAcknowledgeChangedTerms) {
      onAcknowledgeChangedTerms(checked);
    }
  };

  const handleListen = () => {
    let text = '';
    if (comparison.isUnparseable) {
      text = isHi 
        ? 'चेतावनी: अंतिम अनुबंध दस्तावेज को पार्स नहीं किया जा सका। आगे बढ़ने से पहले मानवीय समीक्षा अनिवार्य है।'
        : 'Warning: Final contract document could not be parsed. Human verification is required before proceeding.';
    } else if (!comparison.isMatch) {
      text = isHi
        ? `चेतावनी: अंतिम अनुबंध की शर्तों में बदलाव पाया गया है। कुल भुगतान ${formatPaiseToRupees(comparison.totalCostChangePaise)} बढ़ गया है। कृपया नीचे दिए गए बदलावों को ध्यान से देखें।`
        : `Notice: Final contract terms differ from the explained version. Total repayment has changed by ${formatPaiseToRupees(comparison.totalCostChangePaise)}. Please review the side-by-side comparison.`;
    } else {
      text = isHi
        ? `${t.step5Title}। सभी 11 प्रमुख वित्तीय और कानूनी शर्तें समझाई गई KFS से 100% मेल खाती हैं। आपके पास 3 दिन की कूलिंग-ऑफ अवधि है।`
        : `${t.step5Title}. All 11 material financial and legal terms exactly match the explained Key Fact Statement. You have a 3-day cooling-off window.`;
    }
    speechNarrator.toggle(text, language);
  };

  return (
    <div className="space-y-8" id="step5-check-final-terms-container">
      {/* Title & Speech */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF8F2] border border-[#E5E1D8] text-[11px] font-bold text-[#155E59] uppercase tracking-wider mb-2">
            <GitCompare className="w-3.5 h-3.5" />
            <span>{isHi ? 'चरण 5: अंतिम शर्तों का सत्यापन' : 'Stage 5: Final Term Protection'}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif italic text-[#203331] tracking-tight">
            {t.step5Title}
          </h1>
          <p className="text-base md:text-lg text-[#203331]/80 mt-2 max-w-2xl leading-relaxed">
            {isHi 
              ? 'प्रस्तावित अंतिम अनुबंध की तुलना सीधे समझाई गई KFS से की जाती है। किसी भी बदलाव पर दोबारा सहमति जरूरी है।'
              : 'Compare the final proposed contract terms with the exact version explained to you in earlier stages.'}
          </p>
        </div>

        <button
          type="button"
          id="btn-listen-step5"
          onClick={handleListen}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E5E1D8] text-xs font-semibold text-[#155E59] bg-white hover:bg-[#E8F3EC] transition-all self-start sm:self-auto shadow-xs"
        >
          <Volume2 className="w-4 h-4 text-[#155E59]" />
          <span>{t.btnListen}</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-[#E5E1D8] gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('comparison')}
          className={`pb-3 text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'comparison'
              ? 'text-[#155E59] border-b-2 border-[#155E59]'
              : 'text-[#203331]/60 hover:text-[#203331]'
          }`}
        >
          <GitCompare className="w-4 h-4" />
          <span>{isHi ? '1. समझाई गई KFS बनाम अंतिम अनुबंध' : '1. Explained vs Final Terms Match'}</span>
          {!comparison.isMatch && (
            <span className="px-2 py-0.5 rounded-full bg-[#8A2E14] text-white text-[10px] font-bold">
              {comparison.differences.length} {isHi ? 'बदलाव' : 'Changes'}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cooling_permissions')}
          className={`pb-3 text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'cooling_permissions'
              ? 'text-[#155E59] border-b-2 border-[#155E59]'
              : 'text-[#203331]/60 hover:text-[#203331]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{isHi ? '2. कूलिंग-ऑफ और अनुमतियां' : '2. Cooling-off & Permissions'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('grievance')}
          className={`pb-3 text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'grievance'
              ? 'text-[#155E59] border-b-2 border-[#155E59]'
              : 'text-[#203331]/60 hover:text-[#203331]'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>{isHi ? '3. शिकायत निवारण संपर्क' : '3. Grievance Redressal'}</span>
        </button>
      </div>

      {activeTab === 'comparison' && (
        <div className="space-y-6">
          {/* Comparison Status Banner */}
          {comparison.isUnparseable ? (
            /* Unparseable Final Document Banner */
            <div className="p-6 rounded-2xl bg-[#FAF8F2] border-2 border-[#8A2E14] space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#8A2E14] text-white">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#8A2E14]">
                    {isHi ? 'अंतिम अनुबंध दस्तावेज पार्स नहीं हो सका' : 'Unparseable Final Document Draft'}
                  </h3>
                  <p className="text-xs text-[#203331]/80">
                    {comparison.unparseableReason || 'Final document structured terms could not be parsed or validated.'}
                  </p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white border border-[#8A2E14]/30 text-xs text-[#8A2E14] leading-relaxed">
                {isHi 
                  ? 'सुरक्षा नियम: अपार्सिबल या भ्रष्ट अनुबंध को कभी "शून्य बदलाव" नहीं माना जाएगा। आगे बढ़ने से पहले जोखिम अधिकारी की समीक्षा अनिवार्य है।'
                  : 'Safety Policy: An unparseable final document triggers mandatory compliance review, never a false "No changes" result.'}
              </div>
            </div>
          ) : !comparison.isMatch ? (
            /* Changed Terms Detected Banner */
            <div className="p-6 rounded-2xl bg-[#FAF8F2] border-2 border-[#8A2E14] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#8A2E14] text-white shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#8A2E14]">
                      {isHi ? 'सावधान: अंतिम अनुबंध की शर्तों में बदलाव पाया गया' : 'Attention: Material Term Changes Detected in Final Contract'}
                    </h3>
                    <p className="text-xs text-[#203331]/80">
                      {isHi 
                        ? `अंतिम अनुबंध ड्राफ्ट (${comparison.proposedVersion}) में ${comparison.differences.length} शर्तें समझाई गई KFS (${comparison.explainedVersion}) से भिन्न हैं।`
                        : `The final draft (${comparison.proposedVersion}) contains ${comparison.differences.length} modified term(s) compared to the explained version (${comparison.explainedVersion}).`}
                    </p>
                  </div>
                </div>

                {comparison.totalCostChangePaise > 0 && (
                  <div className="px-4 py-2 rounded-xl bg-[#8A2E14] text-white text-right shrink-0">
                    <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                      {isHi ? 'अतिरिक्त लागत' : 'Repayment Increase'}
                    </div>
                    <div className="text-base font-bold">
                      +{formatPaiseToRupees(comparison.totalCostChangePaise)}
                    </div>
                  </div>
                )}
              </div>

              {/* Invalidation Alert */}
              <div className="p-4 rounded-xl bg-white border border-[#8A2E14]/30 text-xs text-[#203331] leading-relaxed space-y-2">
                <div className="font-bold text-[#8A2E14] flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4" />
                  <span>
                    {isHi ? 'पिछली सहमति स्वतः अमान्य हो गई है:' : 'Earlier Acknowledgement Invalidated for Changed Terms:'}
                  </span>
                </div>
                <p>
                  {isHi
                    ? 'क्योंकि अंतिम अनुबंध की किस्तों और कुल भुगतान में बदलाव हुआ है, इसलिए पहले दर्ज की गई समझ को नए बदलावों के अनुसार दोबारा जांचना आवश्यक है।'
                    : 'Because scheduled EMIs and total repayment have changed, earlier acknowledgements have been invalidated for the affected topics. You must review and re-acknowledge.'}
                </p>
              </div>

              {/* Side-by-Side Detailed Differences Breakdown */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-[#203331] uppercase tracking-wider">
                  {isHi ? 'बदलावों का विवरण (पहले बनाम अब):' : 'Detailed Before vs. After Breakdown:'}
                </div>

                <div className="space-y-3">
                  {comparison.differences.map((diff, i) => (
                    <div key={diff.fieldKey} className="p-4 rounded-xl bg-white border border-[#E5E1D8] shadow-xs space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E1D8] pb-2">
                        <span className="font-bold text-sm text-[#203331]">
                          {isHi ? diff.fieldLabelHi : diff.fieldLabelEn}
                        </span>
                        {diff.deltaRupees !== undefined && (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            diff.deltaRupees > 0 ? 'bg-[#8A2E14]/10 text-[#8A2E14]' : 'bg-[#155E59]/10 text-[#155E59]'
                          }`}>
                            Delta: {diff.deltaRupees > 0 ? '+' : ''}₹{diff.deltaRupees}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 rounded-lg bg-[#FAF8F2] border border-[#E5E1D8]">
                          <span className="text-[10px] font-bold uppercase text-[#203331]/60 block mb-1">
                            {isHi ? 'पहले समझाई गई शर्त:' : 'Originally Explained:'}
                          </span>
                          <span className="font-semibold text-[#203331] line-through text-sm">
                            {diff.oldValue}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-[#FAF8F2] border border-[#8A2E14]/30">
                          <span className="text-[10px] font-bold uppercase text-[#8A2E14] block mb-1">
                            {isHi ? 'अंतिम अनुबंध में नई शर्त:' : 'New Proposed Final Term:'}
                          </span>
                          <span className="font-bold text-[#8A2E14] text-sm">
                            {diff.newValue}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-[#203331]/80 italic pt-1">
                        {isHi ? diff.explanationHi : diff.explanationEn}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Explicit Re-Acknowledgement Checkbox */}
              <div className="p-4 rounded-xl bg-white border border-[#8A2E14] space-y-3">
                <label className="flex items-start gap-3 cursor-pointer text-xs sm:text-sm text-[#203331] font-semibold">
                  <input
                    type="checkbox"
                    id="checkbox-acknowledge-changes"
                    checked={localChangedAcknowledged}
                    onChange={(e) => handleToggleChangedAcknowledged(e.target.checked)}
                    className="w-5 h-5 rounded border-[#8A2E14] text-[#8A2E14] focus:ring-[#8A2E14] mt-0.5 accent-[#8A2E14]"
                  />
                  <span>
                    {isHi 
                      ? 'मैंने अंतिम अनुबंध में हुए इन बदलावों (विशेषकर कुल भुगतान और किस्तों में ₹500 की बढ़ोतरी) को देख और समझ लिया है।'
                      : 'I have reviewed and acknowledge these changed terms (specifically the ₹500 repayment increase and revised EMIs).'}
                  </span>
                </label>
              </div>
            </div>
          ) : (
            /* Exact 100% Match Banner */
            <div className="p-6 rounded-2xl bg-[#E8F3EC] border border-[#155E59]/20 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#155E59] text-white">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#155E59]">
                    {isHi ? '100% सत्यापन: अंतिम शर्तें समझाई गई KFS से पूर्णतः मेल खाती हैं' : '100% Verified Match: Final Terms Identical to Explained Version'}
                  </h3>
                  <p className="text-xs text-[#203331]/80">
                    {isHi 
                      ? 'सभी 11 मुख्य वित्तीय, कानूनी और प्रक्रियात्मक शर्तों की कोड द्वारा पुष्टि की गई है। कोई अघोषित परिवर्तन नहीं है।'
                      : 'All 11 normalized financial, legal, and operational fields exactly match the borrower explanation.'}
                  </p>
                </div>
              </div>

              {/* Verified Fields Checklist Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                {[
                  { labelEn: 'Lender Identity', labelHi: 'लेंडर संस्था', val: offer.lenderName },
                  { labelEn: 'Sanctioned Loan', labelHi: 'स्वीकृत लोन', val: formatPaiseToRupees(offer.sanctionedAmountPaise) },
                  { labelEn: 'Upfront Fee (5%)', labelHi: 'काटा गया शुल्क', val: formatPaiseToRupees(offer.upfrontFeePaise) },
                  { labelEn: 'Net Bank Payout', labelHi: 'बैंक में जमा', val: formatPaiseToRupees(offer.netDisbursementPaise) },
                  { labelEn: 'Total Repayment', labelHi: 'कुल भुगतान', val: formatPaiseToRupees(offer.totalScheduledRepaymentPaise) },
                  { labelEn: 'Instalment #1', labelHi: 'किस्त 1', val: `${formatPaiseToRupees(offer.instalments[0]?.amountPaise || 560000)} (30/09)` },
                  { labelEn: 'Instalment #2', labelHi: 'किस्त 2', val: `${formatPaiseToRupees(offer.instalments[1]?.amountPaise || 560000)} (30/10)` },
                  { labelEn: 'Cooling-Off Window', labelHi: 'कूलिंग-ऑफ', val: `${offer.coolingOffDays} Days Zero Fee` },
                  { labelEn: 'Late Fee Cap', labelHi: 'विलंब शुल्क', val: `₹50/day (3 days grace)` }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white border border-[#155E59]/15 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[#155E59] font-bold">
                      <span>{isHi ? item.labelHi : item.labelEn}</span>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="font-semibold text-[#203331]">
                      {item.val}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cryptographic Versioning & Hash Card */}
          <div className="p-5 rounded-2xl bg-white border border-[#E5E1D8] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#203331]/70 flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-[#155E59]" />
                <span>{isHi ? 'दस्तावेज संस्करण व फिंगरप्रिंट' : 'Document Versioning & Fingerprint Hashes'}</span>
              </span>
              <span className="text-[11px] text-[#203331]/60 font-mono">
                SHA-256 Checksum Engine
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#FAF8F2] border border-[#E5E1D8] space-y-1">
                <div className="text-[10px] font-bold uppercase text-[#203331]/60 font-sans">
                  {isHi ? 'समझाई गई KFS (Explained Version):' : 'Explained Version & Hash:'}
                </div>
                <div className="font-sans font-bold text-[#155E59]">
                  {offer.documentVersion} ({offer.offerCode})
                </div>
                <div className="text-[11px] text-[#203331]/70 break-all">
                  {comparison.explainedHash}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F2] border border-[#E5E1D8] space-y-1">
                <div className="text-[10px] font-bold uppercase text-[#203331]/60 font-sans">
                  {isHi ? 'प्रस्तावित अंतिम अनुबंध (Final Proposed):' : 'Final Proposed Version & Hash:'}
                </div>
                <div className="font-sans font-bold text-[#155E59]">
                  {proposedFinalOffer.documentVersion}
                </div>
                <div className="text-[11px] text-[#203331]/70 break-all">
                  {comparison.proposedHash}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#203331]/70 italic leading-relaxed pt-1">
              {isHi 
                ? 'नोट: हैश (Hash) किसी दस्तावेज़ के विशिष्ट संस्करण की पहचान करता है; यह स्वयं प्रमाणिकता या अनामीयता स्थापित नहीं करता।'
                : 'Explicit regulatory disclosure: A hash identifies a document version; it does not establish authenticity or anonymity.'}
            </p>
          </div>
        </div>
      )}

      {activeTab === 'cooling_permissions' && (
        <div className="space-y-6">
          {/* Cooling-Off Cancellation Rights Banner */}
          <div className="bg-[#E8F3EC] border border-[#155E59]/15 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-white text-[#155E59] shadow-xs shrink-0">
                <ShieldCheck className="w-6 h-6 text-[#155E59]" />
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-bold text-lg md:text-xl text-[#155E59]">
                    {t.step5CoolingOffTitle}
                  </h3>
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-white text-[#155E59] border border-[#155E59]/20">
                    {offer.coolingOffDays} Days Zero-Fee Window
                  </span>
                </div>
                <p className="text-sm md:text-base text-[#203331]/85 leading-relaxed">
                  {language === 'hi' ? offer.coolingOffDetailsHi : offer.coolingOffDetails}
                </p>
                <p className="text-xs text-[#203331]/60 font-medium">
                  {t.step5CoolingOffDesc}
                </p>
              </div>
            </div>
          </div>

          {/* Data Permissions & Stated Purposes */}
          <div className="bg-white border border-[#E5E1D8] rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
            <h3 className="font-bold text-base md:text-lg text-[#203331] flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#FAF8F2] text-[#D9A441] border border-[#E5E1D8]">
                <Lock className="w-5 h-5" />
              </div>
              <span>{t.step5PermissionsTitle}</span>
            </h3>

            <div className="space-y-3.5">
              {offer.dataPermissions.map((perm) => {
                const isChecked = acknowledged[perm.id] ?? false;

                return (
                  <div 
                    key={perm.id}
                    onClick={() => togglePermission(perm.id)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 shadow-xs ${
                      isChecked 
                        ? 'bg-[#FAF8F2] border-[#155E59] ring-1 ring-[#155E59]/20' 
                        : 'bg-[#FAF8F2] border-[#E5E1D8] hover:border-[#155E59]/40'
                    }`}
                  >
                    <input 
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="w-5 h-5 rounded border-[#E5E1D8] text-[#155E59] focus:ring-[#155E59] mt-0.5 cursor-pointer accent-[#155E59]"
                    />
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm md:text-base text-[#203331]">
                          {language === 'hi' ? perm.nameHi : perm.name}
                        </h4>
                        {perm.isMandatory ? (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white border border-[#E5E1D8] text-[#203331]/70">
                            {language === 'hi' ? 'आवश्यक' : 'Required'}
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#E8F3EC] text-[#155E59]">
                            {language === 'hi' ? 'प्रतिबंधित / अस्वीकृत' : 'Prohibited by RBI'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs md:text-sm text-[#203331]/70 leading-relaxed">
                        {language === 'hi' ? perm.purposeHi : perm.purpose}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'grievance' && (
        /* Grievance Redressal & Ombudsman Contact Info */
        <div className="bg-white border border-[#E5E1D8] rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
          <h3 className="font-bold text-base md:text-lg text-[#203331] flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#E8F3EC] text-[#155E59]">
              <Building className="w-5 h-5" />
            </div>
            <span>{t.step5GrievanceTitle}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Nodal Officer Contact */}
            <div className="p-5 rounded-2xl bg-[#FAF8F2] border border-[#E5E1D8] space-y-2.5">
              <span className="text-[11px] font-bold text-[#203331]/60 uppercase tracking-wider">
                {t.step5OfficerName}
              </span>
              <div className="font-bold text-base md:text-lg text-[#203331]">
                {offer.complaintOfficer.name}
              </div>
              <div className="text-xs text-[#203331]/70 font-medium">
                {offer.complaintOfficer.designation}
              </div>
              <div className="pt-3 border-t border-[#E5E1D8] text-xs space-y-1.5 text-[#203331]">
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#155E59]" />
                  <a href={`mailto:${offer.complaintOfficer.email}`} className="text-[#155E59] font-medium underline">
                    {offer.complaintOfficer.email}
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#155E59]" />
                  <span>{offer.complaintOfficer.phone}</span>
                </p>
              </div>
            </div>

            {/* RBI Escalation Ombudsman */}
            <div className="p-5 rounded-2xl bg-[#FAF8F2] border border-[#E5E1D8] space-y-2.5">
              <span className="text-[11px] font-bold text-[#D9A441] uppercase tracking-wider">
                Regulatory Ombudsman Escalation
              </span>
              <div className="font-bold text-base md:text-lg text-[#203331]">
                Reserve Bank of India (RBI CMS)
              </div>
              <p className="text-xs text-[#203331]/70 leading-relaxed">
                {t.step5OmbudsmanNote}
              </p>
              <div className="pt-3 border-t border-[#E5E1D8] text-xs">
                <span className="text-[#203331]/70">Official Portal: </span>
                <a 
                  href={offer.complaintOfficer.ombudsmanPortal} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[#155E59] font-bold underline"
                >
                  cms.rbi.org.in
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
