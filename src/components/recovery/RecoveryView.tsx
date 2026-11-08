import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RecoveryOpportunity } from '../../types';
import {
  HeartHandshake,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Calendar,
  Truck,
  Box,
  MapPin,
  Camera,
  AlertCircle,
} from 'lucide-react';

export const RecoveryView: React.FC = () => {
  const {
    recoveries,
    currentUser,
    currentBusiness,
    acceptRecoveryOpportunity,
    confirmRecoveryHandover,
  } = useApp();

  const [selectedRecoveryForAccept, setSelectedRecoveryForAccept] = useState<RecoveryOpportunity | null>(null);
  const [collectionSlot, setCollectionSlot] = useState('Tomorrow 10:00 AM - 12:00 PM');
  const [selectedRecoveryForHandover, setSelectedRecoveryForHandover] = useState<RecoveryOpportunity | null>(null);
  const [driverBadgeId, setDriverBadgeId] = useState('REC-DRV-04 (Driver Samuel)');
  const [cratesCount, setCratesCount] = useState<number>(10);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const isRecoveryPartner = currentUser.role === 'recovery_partner';

  const handleAccept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecoveryForAccept) return;

    const res = acceptRecoveryOpportunity(selectedRecoveryForAccept.id, collectionSlot);
    if (res.success) {
      setStatusMessage(`Opportunity ${selectedRecoveryForAccept.id} accepted! Collection scheduled for ${collectionSlot}.`);
      setSelectedRecoveryForAccept(null);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handleConfirmHandover = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecoveryForHandover) return;

    const res = confirmRecoveryHandover(selectedRecoveryForHandover.id, {
      driverBadgeId,
      cratesCount,
      photoUrl: '/src/assets/images/recovery_handover_crates_1794003870459.jpg',
    });

    if (res.success) {
      setStatusMessage(`Recovery handover ${selectedRecoveryForHandover.id} confirmed! Wholesome food safely routed to community feeding program.`);
      setSelectedRecoveryForHandover(null);
      setTimeout(() => setStatusMessage(null), 6000);
    }
  };

  const availableLots = recoveries.filter((r) => r.status === 'available');
  const activePickups = recoveries.filter((r) => r.status === 'collection_scheduled');
  const completedLots = recoveries.filter((r) => r.status === 'handover_confirmed');

  return (
    <div className="space-y-6">
      {/* Recovery Banner */}
      <div className="bg-[#0B3E2E] text-white rounded-[6px] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30 rounded-[3px]">
              RECOVER · VERIFIED FOOD RESCUE
            </span>
            <span className="text-white/60">·</span>
            <span className="text-xs text-white/80">Lagos Food Bank & Community Kitchens</span>
          </div>
          <h1 className="text-2xl font-extrabold font-display tracking-tight text-white">
            Wholesome Food Recovery Pipeline
          </h1>
          <p className="text-xs text-white/85 leading-relaxed mt-1">
            When inventory approaches within 14 days and cannot move commercially, SecondShelf routes lots to verified food banks before expiry occurs. 100% pre-expiry donation protocol.
          </p>
        </div>

        <div className="p-3 bg-white/10 rounded-[6px] border border-white/15 text-right shrink-0">
          <span className="text-xs text-white/70 block">Total Food Diverted to Charity</span>
          <span className="text-2xl font-mono font-bold text-[#22C55E] block mt-0.5">
            {completedLots.reduce((acc, r) => acc + r.totalWeightKg, 0).toLocaleString()} kg
          </span>
          <span className="text-[10px] text-white/60">Across Mushin & Ikeja Hubs</span>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[4px] text-xs font-medium text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* 3 Columns / Sections: Available Opportunities, Scheduled Pickups, Completed Traceability */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1: Available Recovery Lots */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
            <h2 className="text-sm font-bold text-neutral-900 font-display flex items-center gap-1.5">
              <Box className="w-4 h-4 text-[#F97316]" />
              Available Lots ({availableLots.length})
            </h2>
            <span className="text-[11px] text-neutral-500">Unclaimed surplus</span>
          </div>

          {availableLots.length === 0 ? (
            <div className="bg-white p-6 rounded-[6px] border border-neutral-200 text-center text-xs text-neutral-500">
              No unclaimed recovery lots at the moment.
            </div>
          ) : (
            availableLots.map((lot) => (
              <div
                key={lot.id}
                className="bg-white p-4 rounded-[6px] border border-neutral-200 shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[10.5px] font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-[3px]">
                    {lot.id}
                  </span>
                  <span className="text-[#C2410C] font-semibold text-[11px]">
                    {lot.daysRemaining} Days Left
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-neutral-900">{lot.productName}</h3>
                  <div className="text-xs text-neutral-600 mt-0.5">
                    Quantity: <strong className="text-neutral-900">{lot.quantity} {lot.unit}</strong> (~{lot.totalWeightKg} kg)
                  </div>
                  <div className="text-[11px] text-neutral-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-neutral-400" />
                    <span>{lot.pickupLocation}</span>
                  </div>
                </div>

                {/* VM0046 Climate Assessment Note */}
                <div className="p-2 bg-emerald-50/60 rounded-[3px] border border-emerald-100 text-[10.5px] text-emerald-900">
                  <div className="font-semibold">
                    ~{lot.potentialCo2eAvoidedTonnes} t CO₂e Avoided (Landfill Diversion)
                  </div>
                  <span className="text-[9.5px] text-neutral-500 block uppercase">
                    {lot.climateMethodologyLabel}
                  </span>
                </div>

                <div className="pt-2 border-t border-neutral-100 flex items-center justify-end">
                  <button
                    onClick={() => setSelectedRecoveryForAccept(lot)}
                    className="w-full py-2 bg-[#0B3E2E] hover:bg-[#125740] text-white text-xs font-bold rounded-[4px] transition-colors cursor-pointer text-center"
                  >
                    Accept Donation Lot
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Col 2: Collection & Transport Coordination */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
            <h2 className="text-sm font-bold text-neutral-900 font-display flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-700" />
              Scheduled Pickups ({activePickups.length})
            </h2>
            <span className="text-[11px] text-neutral-500">Crate Logistics</span>
          </div>

          {activePickups.length === 0 ? (
            <div className="bg-white p-6 rounded-[6px] border border-neutral-200 text-center text-xs text-neutral-500">
              No collection pickups scheduled right now.
            </div>
          ) : (
            activePickups.map((lot) => (
              <div
                key={lot.id}
                className="bg-white p-4 rounded-[6px] border border-emerald-200 bg-emerald-50/20 shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[10.5px] font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-[3px]">
                    {lot.id}
                  </span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold uppercase rounded-[3px]">
                    Collection Scheduled
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-neutral-900">{lot.productName}</h3>
                  <div className="text-xs text-neutral-600 mt-0.5">
                    Claimed by: <strong className="text-neutral-900">{lot.recoveryPartnerBusinessName}</strong>
                  </div>
                  <div className="text-xs text-emerald-900 font-semibold mt-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Slot: {lot.collectionSlot}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedRecoveryForHandover(lot);
                    setCratesCount(lot.quantity);
                  }}
                  className="w-full py-2 bg-[#22C55E] hover:bg-[#16a34a] text-[#072A1F] text-xs font-bold rounded-[4px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Camera className="w-3.5 h-3.5 text-[#072A1F]" />
                  <span>Verify Driver & Crate Handover</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Col 3: Verified Completed Outcomes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
            <h2 className="text-sm font-bold text-neutral-900 font-display flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#0B3E2E]" />
              Completed & Proven ({completedLots.length})
            </h2>
            <span className="text-[11px] text-neutral-500">Traceable Food Rescue</span>
          </div>

          {completedLots.length === 0 ? (
            <div className="bg-white p-6 rounded-[6px] border border-neutral-200 text-center text-xs text-neutral-500">
              No completed recovery outcomes recorded yet.
            </div>
          ) : (
            completedLots.map((lot) => (
              <div
                key={lot.id}
                className="bg-white p-4 rounded-[6px] border border-neutral-200 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[10.5px] font-bold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-[3px]">
                    {lot.id}
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-[3px]">
                    CONFIRMED
                  </span>
                </div>

                <h3 className="text-sm font-bold text-neutral-900">{lot.productName}</h3>
                <p className="text-xs text-neutral-600">
                  {lot.quantity} {lot.unit} (~{lot.totalWeightKg} kg) safely transferred to community kitchen.
                </p>

                {lot.handoverEvidence && (
                  <div className="text-[11px] text-neutral-500 font-mono space-y-0.5 pt-1 border-t border-neutral-100">
                    <div>Badge: {lot.handoverEvidence.driverBadgeId}</div>
                    <div>Green Crates: {lot.handoverEvidence.cratesCount} Verified</div>
                    <div className="text-[10px] text-neutral-400">
                      Timestamp: {new Date(lot.completedAt || '').toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* SCHEDULE COLLECTION MODAL */}
      {selectedRecoveryForAccept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-[6px] border border-neutral-200 max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-neutral-900 font-display">
              Schedule Collection Window
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Select time slot for food recovery transport vehicle at {selectedRecoveryForAccept.pickupLocation}.
            </p>

            <form onSubmit={handleAccept} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Collection Time Window
                </label>
                <select
                  value={collectionSlot}
                  onChange={(e) => setCollectionSlot(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-[4px] bg-white focus:outline-none focus:ring-1 focus:ring-[#0B3E2E]"
                >
                  <option value="Tomorrow 09:00 AM - 11:00 AM">Tomorrow 09:00 AM - 11:00 AM</option>
                  <option value="Tomorrow 11:00 AM - 01:00 PM">Tomorrow 11:00 AM - 01:00 PM</option>
                  <option value="Tomorrow 02:00 PM - 04:00 PM">Tomorrow 02:00 PM - 04:00 PM</option>
                  <option value="Same Day Urgent Pickup (Within 3 Hours)">Same Day Urgent Pickup (Within 3 Hours)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setSelectedRecoveryForAccept(null)}
                  className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0B3E2E] text-white font-bold text-xs rounded-[4px] hover:bg-[#125740] cursor-pointer"
                >
                  Confirm Collection Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRIVER & CRATE HANDOVER MODAL */}
      {selectedRecoveryForHandover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-[6px] border border-neutral-200 max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-neutral-900 font-display">
              Confirm Food Recovery Handover
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Verify driver credentials and durable green recovery containers.
            </p>

            <form onSubmit={handleConfirmHandover} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Verified Driver Badge ID *
                </label>
                <input
                  type="text"
                  required
                  value={driverBadgeId}
                  onChange={(e) => setDriverBadgeId(e.target.value)}
                  className="w-full px-3 py-1.5 font-mono border border-neutral-300 rounded-[4px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Branded Green Collection Crates Count
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={cratesCount}
                  onChange={(e) => setCratesCount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded-[4px]"
                />
              </div>

              {/* Photo Proof */}
              <div className="border border-neutral-200 rounded-[4px] p-2 bg-[#F8FAF7] flex items-center gap-3">
                <img
                  src="/src/assets/images/recovery_handover_crates_1794003870459.jpg"
                  alt="Recovery handover green crates proof"
                  className="w-16 h-12 object-cover rounded-[3px] border border-neutral-300"
                />
                <div className="text-[11px] text-neutral-600">
                  <span className="font-semibold block text-neutral-800">lfb_crates_handover.jpg</span>
                  <span>Two-sided charity handover record with tamper seal</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setSelectedRecoveryForHandover(null)}
                  className="px-3 py-1.5 text-neutral-600 hover:text-neutral-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0B3E2E] text-white font-bold rounded-[4px] hover:bg-[#125740] cursor-pointer"
                >
                  Record Traceable Handover
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
