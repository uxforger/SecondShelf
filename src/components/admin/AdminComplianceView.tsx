import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatNaira } from '../../utils/expiryRules';
import {
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Building,
  UserCheck,
  FileText,
  Search,
} from 'lucide-react';

export const AdminComplianceView: React.FC = () => {
  const { businesses, auditLogs, verifyBusiness, batches, listings, transactions } = useApp();
  const [filterAction, setFilterAction] = useState<string>('all');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleVerify = (bizId: string, name: string) => {
    verifyBusiness(bizId);
    setStatusMessage(`Business "${name}" successfully verified. KYC badge issued.`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const filteredLogs = auditLogs.filter((log) => {
    if (filterAction === 'all') return true;
    return log.action === filterAction;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-[6px] border border-neutral-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-[#1F2937] text-white rounded-[3px]">
              ADMIN · COMPLIANCE & CONTROL
            </span>
            <span className="text-xs text-neutral-400">·</span>
            <span className="text-xs text-neutral-600 font-medium">Lagos Wholesale Network Oversight</span>
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 font-display">
            Platform Governance & Audit Directorate
          </h1>
          <p className="text-xs text-neutral-600 mt-1 max-w-2xl">
            Review trader accreditation, physical depot KYC validation, food safety enforcement, and tamper-evident audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2 text-right">
          <div className="p-3 bg-neutral-100 rounded-[4px] text-xs">
            <span className="text-neutral-500 block">Total Audited Events</span>
            <span className="text-base font-bold font-mono text-neutral-900">
              {auditLogs.length} Records
            </span>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[4px] text-xs font-medium text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* SECTION 1: BUSINESS KYC ACCREDITATION */}
      <div className="bg-white rounded-[6px] border border-neutral-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-neutral-200 bg-[#F8FAF7] flex items-center justify-between">
          <h2 className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-2">
            <Building className="w-4 h-4 text-[#0B3E2E]" />
            Accredited Market Businesses & KYC Status ({businesses.length})
          </h2>
          <span className="text-[11px] text-neutral-500 font-mono">
            {businesses.filter((b) => b.verified).length} Verified / {businesses.filter((b) => !b.verified).length} Pending
          </span>
        </div>

        <div className="divide-y divide-neutral-200">
          {businesses.map((biz) => (
            <div
              key={biz.id}
              className="p-4 hover:bg-neutral-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-neutral-900">{biz.name}</h3>
                  <span
                    className={`px-2 py-0.5 rounded-[3px] text-[10px] font-bold uppercase tracking-wider ${
                      biz.verified
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {biz.verificationBadge}
                  </span>
                </div>
                <div className="text-xs text-neutral-600 flex flex-wrap gap-x-3 gap-y-0.5">
                  <span>Type: <strong className="capitalize">{biz.type.replace('_', ' ')}</strong></span>
                  <span>·</span>
                  <span>Depot: <strong>{biz.location}</strong></span>
                  <span>·</span>
                  <span>Contact: <strong>{biz.contactPerson}</strong></span>
                </div>
                <div className="text-[11px] text-neutral-500 font-mono">
                  {biz.detailedAddress} {biz.rcNumber && `· CAC ${biz.rcNumber}`}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!biz.verified ? (
                  <button
                    onClick={() => handleVerify(biz.id, biz.name)}
                    className="px-3.5 py-1.5 bg-[#0B3E2E] hover:bg-[#125740] text-white text-xs font-bold rounded-[4px] transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-[#22C55E]" />
                    <span>Approve Depot KYC</span>
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Accredited Partner</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: AUDIT LOGS LEDGER */}
      <div className="bg-white rounded-[6px] border border-neutral-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-neutral-200 bg-[#F8FAF7] flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#0B3E2E]" />
            Tamper-Evident System Audit Trail
          </h2>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-500">Filter Action:</span>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-2.5 py-1 text-xs border border-neutral-300 rounded-[4px] bg-white text-neutral-700"
            >
              <option value="all">All Actions</option>
              <option value="REGISTER_BATCH">REGISTER_BATCH</option>
              <option value="PUBLISH_LISTING">PUBLISH_LISTING</option>
              <option value="SUBMIT_OFFER">SUBMIT_OFFER</option>
              <option value="ACCEPT_OFFER">ACCEPT_OFFER</option>
              <option value="CONFIRM_HANDOVER">CONFIRM_HANDOVER</option>
              <option value="ROUTE_TO_RECOVERY">ROUTE_TO_RECOVERY</option>
              <option value="VERIFIED_BUSINESS">VERIFIED_BUSINESS</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-neutral-200 max-h-96 overflow-y-auto">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-3.5 hover:bg-neutral-50 transition-colors text-xs space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-neutral-900 bg-neutral-100 px-1.5 py-0.5 rounded-[3px]">
                    {log.action}
                  </span>
                  <span className="text-neutral-400">·</span>
                  <span className="text-neutral-700 font-medium">{log.actorName}</span>
                  <span className="text-[10px] text-neutral-500 font-mono uppercase">
                    ({log.actorRole})
                  </span>
                </div>
                <span className="font-mono text-[10.5px] text-neutral-400">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-neutral-600 text-[11.5px] pl-1 border-l-2 border-neutral-200">
                {log.details}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
