import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductCategory, StorageCondition } from '../../types';
import { calculateDaysRemaining, calculateSuggestedMarkdown, getExpiryStatus } from '../../utils/expiryRules';
import { X, Barcode, ShieldAlert, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (batchId: string) => void;
}

const BARCODE_DATABASE: Record<string, { name: string; brand: string; category: ProductCategory; unit: 'cartons' | 'crates' | 'bags (25kg)' | 'bags (50kg)' | 'cases' | 'packs'; weightKg: number; retailPrice: number; nafdac: string }> = {
  '61511000293': {
    name: 'Beloxxi Cream Crackers (Bulk Cartons)',
    brand: 'Beloxxi Industries',
    category: 'Packaged Foods & Biscuits',
    unit: 'cartons',
    weightKg: 10,
    retailPrice: 2600,
    nafdac: '01-2940-02',
  },
  '61511000845': {
    name: 'Gino Peppe & Onion Tomato Paste (400g x 24)',
    brand: 'Gino (Wander)',
    category: 'Canned Goods & Pastes',
    unit: 'crates',
    weightKg: 9.6,
    retailPrice: 18500,
    nafdac: '01-4412-11',
  },
  '61511000621': {
    name: 'Golden Penny Semovita Flour (10kg Bags)',
    brand: 'Golden Penny (Flour Mills of Nigeria)',
    category: 'Grains & Flour',
    unit: 'bags (25kg)',
    weightKg: 10,
    retailPrice: 14000,
    nafdac: '01-8899-01',
  },
  '61511000993': {
    name: 'Indomie Instant Noodles (Super Pack 40x120g)',
    brand: 'Indomie (Dufil Prima)',
    category: 'Pasta & Noodles',
    unit: 'cartons',
    weightKg: 5,
    retailPrice: 12500,
    nafdac: '01-1209-40',
  },
  '61511000510': {
    name: 'Peak Full Cream Evaporated Milk (160g x 48)',
    brand: 'Peak (FrieslandCampina)',
    category: 'Dairy & Beverages',
    unit: 'cartons',
    weightKg: 8,
    retailPrice: 34000,
    nafdac: '01-0021-99',
  },
};

export const RegisterBatchModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { registerBatch, currentBusiness, referenceDate } = useApp();

  const [barcode, setBarcode] = useState('');
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Packaged Foods & Biscuits');
  const [quantity, setQuantity] = useState<number>(50);
  const [unit, setUnit] = useState<'cartons' | 'crates' | 'bags (25kg)' | 'bags (50kg)' | 'cases' | 'packs'>('cartons');
  const [unitWeightKg, setUnitWeightKg] = useState<number>(10);
  const [costPricePerUnit, setCostPricePerUnit] = useState<number>(2000);
  const [standardRetailPrice, setStandardRetailPrice] = useState<number>(2600);
  const [expiryDate, setExpiryDate] = useState('2026-12-20');
  const [storageCondition, setStorageCondition] = useState<StorageCondition>('cool_dry');
  const [warehouseLocation, setWarehouseLocation] = useState('Mushin Depot, Bay B-02');
  const [originalPackagingIntact, setOriginalPackagingIntact] = useState(true);
  const [nafdacNumber, setNafdacNumber] = useState('01-9988-12');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleBarcodeLookup = (code: string) => {
    setBarcode(code);
    const item = BARCODE_DATABASE[code.trim()];
    if (item) {
      setProductName(item.name);
      setBrand(item.brand);
      setCategory(item.category);
      setUnit(item.unit);
      setUnitWeightKg(item.weightKg);
      setStandardRetailPrice(item.retailPrice);
      setCostPricePerUnit(Math.round(item.retailPrice * 0.8));
      setNafdacNumber(item.nafdac);
      setError(null);
    }
  };

  const daysRemaining = calculateDaysRemaining(expiryDate, referenceDate);
  const urgency = getExpiryStatus(daysRemaining);
  const suggestedMarkdown = calculateSuggestedMarkdown(daysRemaining);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!productName.trim()) {
      setError('Product name is required.');
      return;
    }

    if (quantity <= 0) {
      setError('Quantity must be greater than zero.');
      return;
    }

    if (daysRemaining <= 0) {
      setError('RULE 1 VIOLATION: Expired food products can NEVER be registered or traded.');
      return;
    }

    if (!originalPackagingIntact) {
      setError('RULE 2 VIOLATION: Products must have original packaging intact to prevent adulteration.');
      return;
    }

    const result = registerBatch({
      productName,
      brand: brand || 'FMCG Packaged Goods',
      category,
      barcode: barcode || '61511000999',
      quantity,
      unit,
      unitWeightKg,
      costPricePerUnit,
      standardRetailPrice,
      expiryDate,
      storageCondition,
      warehouseLocation: warehouseLocation || currentBusiness.detailedAddress,
      originalPackagingIntact,
      nafdacNumber,
    });

    if (!result.success) {
      setError(result.error || 'Failed to register batch.');
      return;
    }

    onSuccess(result.batch!.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-[6px] border border-neutral-200 max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-[#F8FAF7]">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-[#0B3E2E] text-white rounded-[3px]">
                SCAN / FAST LOG
              </span>
              <h2 className="text-base font-bold text-neutral-900 font-display">
                Register New Inventory Batch
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Target execution speed: &lt; 45s. Captures batch ID, printed expiry date, and storage condition.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1 rounded-md transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-[4px] text-xs text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Barcode Scanner Simulation */}
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-[4px]">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="barcode-input" className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                <Barcode className="w-4 h-4 text-[#0B3E2E]" />
                Barcode Scanner (Auto-fill Demo)
              </label>
              <span className="text-[11px] text-neutral-500">Click quick SKU preset:</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {Object.entries(BARCODE_DATABASE).map(([code, item]) => (
                <button
                  type="button"
                  key={code}
                  onClick={() => handleBarcodeLookup(code)}
                  className={`text-[11px] px-2 py-1 rounded-[3px] border transition-colors cursor-pointer ${
                    barcode === code
                      ? 'bg-[#0B3E2E] text-white border-[#0B3E2E]'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                  }`}
                >
                  {item.brand} ({code.slice(-4)})
                </button>
              ))}
            </div>
            <input
              id="barcode-input"
              type="text"
              value={barcode}
              onChange={(e) => handleBarcodeLookup(e.target.value)}
              placeholder="e.g. 61511000293 or scan via handheld scanner"
              className="w-full px-3 py-1.5 text-xs font-mono border border-neutral-300 rounded-[4px] bg-white focus:outline-none focus:ring-1 focus:ring-[#0B3E2E]"
            />
          </div>

          {/* Product Name & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="product-name" className="block text-xs font-semibold text-neutral-700 mb-1">
                Product Name *
              </label>
              <input
                id="product-name"
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Beloxxi Cream Crackers"
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0B3E2E]"
              />
            </div>
            <div>
              <label htmlFor="brand-name" className="block text-xs font-semibold text-neutral-700 mb-1">
                Brand / Manufacturer
              </label>
              <input
                id="brand-name"
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Beloxxi Industries"
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0B3E2E]"
              />
            </div>
          </div>

          {/* Category & NAFDAC */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="product-category" className="block text-xs font-semibold text-neutral-700 mb-1">
                Product Category *
              </label>
              <select
                id="product-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-[4px] bg-white focus:outline-none focus:ring-1 focus:ring-[#0B3E2E]"
              >
                <option value="Packaged Foods & Biscuits">Packaged Foods & Biscuits</option>
                <option value="Grains & Flour">Grains & Flour</option>
                <option value="Canned Goods & Pastes">Canned Goods & Pastes</option>
                <option value="Pasta & Noodles">Pasta & Noodles</option>
                <option value="Cooking Oils & Seasoning">Cooking Oils & Seasoning</option>
                <option value="Dairy & Beverages">Dairy & Beverages</option>
              </select>
            </div>
            <div>
              <label htmlFor="nafdac-reg" className="block text-xs font-semibold text-neutral-700 mb-1">
                NAFDAC Reg No.
              </label>
              <input
                id="nafdac-reg"
                type="text"
                value={nafdacNumber}
                onChange={(e) => setNafdacNumber(e.target.value)}
                placeholder="e.g. 01-2940-02"
                className="w-full px-3 py-2 text-xs font-mono border border-neutral-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0B3E2E]"
              />
            </div>
          </div>

          {/* Quantity, Unit & Unit Weight */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="batch-quantity" className="block text-xs font-semibold text-neutral-700 mb-1">
                Batch Quantity *
              </label>
              <input
                id="batch-quantity"
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0B3E2E]"
              />
            </div>
            <div>
              <label htmlFor="batch-unit" className="block text-xs font-semibold text-neutral-700 mb-1">
                Commercial Unit *
              </label>
              <select
                id="batch-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-[4px] bg-white focus:outline-none focus:ring-1 focus:ring-[#0B3E2E]"
              >
                <option value="cartons">Cartons</option>
                <option value="crates">Crates</option>
                <option value="bags (25kg)">Bags (25kg)</option>
                <option value="bags (50kg)">Bags (50kg)</option>
                <option value="cases">Cases</option>
                <option value="packs">Packs</option>
              </select>
            </div>
            <div>
              <label htmlFor="unit-weight" className="block text-xs font-semibold text-neutral-700 mb-1">
                Unit Weight (kg)
              </label>
              <input
                id="unit-weight"
                type="number"
                step="0.1"
                value={unitWeightKg}
                onChange={(e) => setUnitWeightKg(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0B3E2E]"
              />
            </div>
          </div>

          {/* Pricing: Standard Retail vs Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="standard-price" className="block text-xs font-semibold text-neutral-700 mb-1">
                Standard Retail Price (₦ per unit) *
              </label>
              <input
                id="standard-price"
                type="number"
                min="1"
                required
                value={standardRetailPrice}
                onChange={(e) => setStandardRetailPrice(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0B3E2E]"
              />
            </div>
            <div>
              <label htmlFor="cost-price" className="block text-xs font-semibold text-neutral-700 mb-1">
                Wholesaler Cost Price (₦ per unit)
              </label>
              <input
                id="cost-price"
                type="number"
                min="1"
                value={costPricePerUnit}
                onChange={(e) => setCostPricePerUnit(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0B3E2E]"
              />
            </div>
          </div>

          {/* Printed Expiry Date & Expiry Radar Feedback */}
          <div className="p-4 bg-[#F8FAF7] border border-neutral-200 rounded-[4px] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label htmlFor="printed-expiry" className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                Printed Expiry Date on Box (Mandatory Check) *
              </label>
              <input
                id="printed-expiry"
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="px-3 py-1.5 text-xs font-mono border border-neutral-300 rounded-[4px] bg-white focus:outline-none focus:ring-1 focus:ring-[#0B3E2E]"
              />
            </div>

            {/* Live calculation banner */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-200">
              <div className="flex items-center gap-2">
                <span className="text-neutral-500">Days to Expiry:</span>
                <span className={`font-mono font-bold ${daysRemaining <= 0 ? 'text-red-600' : daysRemaining <= 42 ? 'text-[#C2410C]' : 'text-emerald-700'}`}>
                  {daysRemaining} Days
                </span>
                <span className="text-neutral-400">·</span>
                <span className="capitalize font-medium text-neutral-700">
                  Status: {urgency.replace('_', ' ')}
                </span>
              </div>
              {daysRemaining > 0 && daysRemaining <= 42 && (
                <div className="text-[11px] text-[#C2410C] font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Suggested Radar Markdown: {suggestedMarkdown}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Storage & Original Packaging Intact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="storage-conditions" className="block text-xs font-semibold text-neutral-700 mb-1">
                Storage Condition
              </label>
              <select
                id="storage-conditions"
                value={storageCondition}
                onChange={(e) => setStorageCondition(e.target.value as StorageCondition)}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-[4px] bg-white focus:outline-none focus:ring-1 focus:ring-[#0B3E2E]"
              >
                <option value="cool_dry">Cool & Dry Warehouse</option>
                <option value="ambient">Ambient Market Stash</option>
                <option value="refrigerated">Refrigerated / Cold Storage</option>
              </select>
            </div>
            <div>
              <label htmlFor="warehouse-bay" className="block text-xs font-semibold text-neutral-700 mb-1">
                Depot Warehouse Bay
              </label>
              <input
                id="warehouse-bay"
                type="text"
                value={warehouseLocation}
                onChange={(e) => setWarehouseLocation(e.target.value)}
                placeholder="e.g. Mushin Depot, Bay A-03"
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0B3E2E]"
              />
            </div>
          </div>

          {/* Anti-Repackaging Protection Guarantee Checkbox */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-[4px] flex items-start gap-2.5">
            <input
              id="packaging-check"
              type="checkbox"
              checked={originalPackagingIntact}
              onChange={(e) => setOriginalPackagingIntact(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-[#0B3E2E] rounded border-neutral-300 focus:ring-[#22C55E]"
            />
            <label htmlFor="packaging-check" className="text-xs text-neutral-800 cursor-pointer">
              <span className="font-semibold text-neutral-900 block">
                Food Safety Guarantee: Factory packaging is unopened and tamper-free
              </span>
              <span className="text-[11px] text-neutral-600 block mt-0.5">
                SecondShelf strictly prohibits repacked or loose near-expiry stock per Lagos Food Safety directives.
              </span>
            </label>
          </div>

          {/* Footer CTA */}
          <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#0B3E2E] hover:bg-[#125740] rounded-[4px] transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
              <span>Register Batch into Expiry Radar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
