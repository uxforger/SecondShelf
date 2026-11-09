import { Ban } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useRef, useState, type FormEvent } from 'react';
import { Scanner } from '../../components/scanner/Scanner';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { Button } from '../../components/ui/Button';
import { DateField, Input } from '../../components/ui/Field';
import { Skeleton } from '../../components/ui/Feedback';
import { QuantityStepper } from '../../components/ui/QuantityStepper';
import { api, ApiError, type Product, type Session } from '../../lib/api';
import { addDays, daysLeft, isValidDay, today } from '../../lib/dates';
import { naira, shortDate } from '../../lib/format';
import { spring } from '../../lib/motion';
import { goBack, navigate } from '../../lib/router';
import { highlight, toast } from '../../lib/store';
import { Thumb } from './parts';

type Lookup = { state: 'looking' } | { state: 'found'; product: Product } | { state: 'new' };

export function Scan(_: { session: Session }) {
  const [code, setCode] = useState<string | null>(null);
  const [lookup, setLookup] = useState<Lookup>({ state: 'looking' });
  const [sheetOpen, setSheetOpen] = useState(false);
  const run = useRef(0);

  const onDetect = async (value: string) => {
    const id = ++run.current;
    setCode(value);
    setLookup({ state: 'looking' });
    setSheetOpen(true);
    const started = Date.now();
    const product = await api.lookupBarcode(value).catch(() => null);
    const spent = Date.now() - started;
    if (spent < 400) await new Promise((r) => setTimeout(r, 400 - spent));
    if (run.current !== id) return;
    setLookup(product ? { state: 'found', product } : { state: 'new' });
  };

  const cancel = () => {
    run.current++;
    setSheetOpen(false);
  };

  const saved = (batchId: string) => {
    setSheetOpen(false);
    highlight(batchId);
    toast('Added', 'success');
    // Let the sheet leave along its entry path, then show the list.
    window.setTimeout(() => navigate('/stock', { tab: true }), 260);
  };

  return (
    <>
      <Scanner kind="product" title="Scan a carton" paused={sheetOpen} onDetect={onDetect} onClose={() => goBack('/stock')} />
      <BottomSheet open={sheetOpen} onClose={cancel} title={lookup.state === 'new' ? 'New product' : 'Add stock'}>
        <AnimatePresence mode="popLayout" initial={false}>
          {lookup.state === 'looking' ? (
            <motion.div key="looking" exit={{ opacity: 0 }} transition={spring}>
              <ProductSkeleton />
            </motion.div>
          ) : (
            <motion.div key={lookup.state} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={spring}>
              <AddForm code={code ?? ''} product={lookup.state === 'found' ? lookup.product : null} onSaved={saved} />
            </motion.div>
          )}
        </AnimatePresence>
      </BottomSheet>
    </>
  );
}

function ProductSkeleton() {
  return (
    <div aria-busy="true">
      <div className="flex items-center gap-3 rounded-[20px] bg-surface p-3 ring-1 ring-hairline">
        <Skeleton className="size-16 shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
      <p className="t-label mt-4 text-muted" aria-live="polite">
        Finding product…
      </p>
      <div className="mt-4 space-y-4">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
        <Skeleton className="h-14" />
      </div>
    </div>
  );
}

function AddForm({ code, product, onSaved }: { code: string; product: Product | null; onSaved: (id: string) => void }) {
  const [expiry, setExpiry] = useState('');
  const [batchNo, setBatchNo] = useState('');
  const [qty, setQty] = useState(24);
  const [name, setName] = useState('');
  const [netKg, setNetKg] = useState('');
  const [price, setPrice] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const left = isValidDay(expiry) ? daysLeft(expiry) : null;
  const expired = left !== null && left <= 0;
  const errors = {
    expiry: !expiry ? 'Add the expiry date.' : !isValidDay(expiry) ? 'Check the date.' : null,
    name: !product && !name.trim() ? 'Add a name.' : null,
    netKg: !product && !(parseFloat(netKg) > 0) ? 'Weight per carton, in kg.' : null,
    price: !product && !(parseInt(price.replace(/\D/g, ''), 10) > 0) ? 'Price per carton.' : null,
  };
  const blur = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }));

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ expiry: true, name: true, netKg: true, price: true });
    if (Object.values(errors).some(Boolean) || expired) return;
    setSaving(true);
    try {
      const batch = await api.addBatch({
        barcode: code,
        productId: product?.id,
        newProduct: product ? undefined : { name, netKg: parseFloat(netKg), price: parseInt(price.replace(/\D/g, ''), 10) },
        batchNo,
        expiry,
        quantity: qty,
      });
      onSaved(batch.id);
    } catch (err) {
      setSaving(false);
      toast(err instanceof ApiError ? err.message : 'Could not save.', 'error');
    }
  };

  return (
    <form onSubmit={save} noValidate>
      {product ? (
        <div className="flex items-center gap-3 rounded-[20px] bg-surface p-3 shadow-soft ring-1 ring-hairline">
          <Thumb image={product.image} focus={product.focus} zoom={product.zoom} className="size-16" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[17px] font-semibold leading-6 text-deep">{product.name}</p>
            <p className="t-caption num text-muted">
              {product.pack} · {product.netKg} kg · {naira(product.price)}
            </p>
          </div>
        </div>
      ) : (
        <div>
          <p className="t-caption num mb-3 text-muted">Barcode {code}</p>
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} onBlur={blur('name')} error={touched.name ? errors.name : null} data-autofocus />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Net weight (kg)"
              inputMode="decimal"
              value={netKg}
              onChange={(e) => setNetKg(e.target.value)}
              onBlur={blur('netKg')}
              error={touched.netKg ? errors.netKg : null}
            />
            <Input
              label="Price (₦)"
              inputMode="numeric"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              onBlur={blur('price')}
              error={touched.price ? errors.price : null}
            />
          </div>
        </div>
      )}

      <div className="mt-4">
        <DateField
          label="Expiry date"
          value={expiry}
          min={addDays(today(), 1)}
          onChange={(e) => setExpiry(e.target.value)}
          onBlur={blur('expiry')}
          error={touched.expiry && !expired ? errors.expiry : null}
          hint={left !== null && left > 0 ? `${shortDate(expiry)} · ${left} days left` : undefined}
        />
        <AnimatePresence initial={false}>
          {expired && (
            <motion.p
              role="alert"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={spring}
              className="-mt-3 mb-3 overflow-hidden"
            >
              <span className="mt-3 flex items-center gap-2 rounded-[12px] bg-danger-tint px-4 py-3 t-label text-danger">
                <Ban className="size-5 shrink-0" />
                Expired items can't be added.
              </span>
            </motion.p>
          )}
        </AnimatePresence>
        <Input label="Batch number" autoCapitalize="characters" autoComplete="off" placeholder="CC-2410" value={batchNo} onChange={(e) => setBatchNo(e.target.value)} />
        <QuantityStepper label="Quantity" value={qty} onChange={setQty} unit="cartons" />
      </div>

      <div className="mt-6">
        <Button type="submit" size="lg" block loading={saving} loadingLabel="Saving" disabled={expired}>
          Save
        </Button>
      </div>
    </form>
  );
}
