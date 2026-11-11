import { AnimatePresence, motion } from 'motion/react';
import { useRef, useState, type FormEvent } from 'react';
import { api, ApiError, type Product } from '../../../lib/api';
import { addDays, daysLeft, isValidDay, today } from '../../../lib/dates';
import { naira, shortDate } from '../../../lib/format';
import { spring } from '../../../lib/motion';
import { goBack, navigate } from '../../../lib/router';
import { highlight, toast } from '../../../lib/store';
import { expiryWords } from '../../data';
import { Button, Pill, Skeleton } from '../../kit/core';
import { Stepper, TextField } from '../../kit/fields';
import { ProductPhoto } from '../../kit/media';
import { Scanner } from '../../kit/scanner';
import { Sheet } from '../../kit/sheet';

type Lookup = { state: 'looking' } | { state: 'found'; product: Product } | { state: 'new' };

export function Scan() {
  const [code, setCode] = useState<string | null>(null);
  const [lookup, setLookup] = useState<Lookup>({ state: 'looking' });
  const [open, setOpen] = useState(false);
  const run = useRef(0);

  const onDetect = async (value: string) => {
    const id = ++run.current;
    setCode(value);
    setLookup({ state: 'looking' });
    setOpen(true);
    const started = Date.now();
    const product = await api.lookupBarcode(value).catch(() => null);
    const spent = Date.now() - started;
    if (spent < 450) await new Promise((r) => setTimeout(r, 450 - spent));
    if (run.current !== id) return;
    setLookup(product ? { state: 'found', product } : { state: 'new' });
  };

  const saved = (batchId: string) => {
    setOpen(false);
    highlight(batchId);
    toast('Saved to stock', 'success');
    // Let the sheet leave the way it came, then land on the new batch's journey.
    window.setTimeout(() => navigate(`/batch/${batchId}`, { replace: true }), 260);
  };

  return (
    <>
      <Scanner kind="product" title="Scan a carton" paused={open} onDetect={onDetect} onClose={() => goBack('/stock')} />
      <Sheet
        open={open}
        onClose={() => {
          run.current++;
          setOpen(false);
        }}
        title={lookup.state === 'new' ? 'New product' : 'Add stock'}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {lookup.state === 'looking' ? (
            <motion.div key="l" exit={{ opacity: 0 }} transition={spring} aria-busy="true">
              <div className="flex items-center gap-3 rounded-[16px] bg-white p-3 ring-1 ring-hairline">
                <Skeleton className="size-16 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
              <p className="t-14 mt-4 text-slate" aria-live="polite">
                Finding product
              </p>
              <div className="mt-4 space-y-4">
                <Skeleton className="h-13" />
                <Skeleton className="h-12" />
                <Skeleton className="h-14 rounded-full" />
              </div>
            </motion.div>
          ) : (
            <motion.div key={lookup.state} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
              <AddForm code={code ?? ''} product={lookup.state === 'found' ? lookup.product : null} onSaved={saved} />
            </motion.div>
          )}
        </AnimatePresence>
      </Sheet>
    </>
  );
}

function AddForm({ code, product, onSaved }: { code: string; product: Product | null; onSaved: (id: string) => void }) {
  const [expiry, setExpiry] = useState('');
  const [qty, setQty] = useState(20);
  const [batchNo, setBatchNo] = useState('');
  const [name, setName] = useState('');
  const [netKg, setNetKg] = useState('');
  const [price, setPrice] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const left = isValidDay(expiry) ? daysLeft(expiry) : null;
  const expired = left !== null && left <= 0;
  const errors = {
    expiry: !expiry ? 'Add the expiry date.' : !isValidDay(expiry) ? 'Check the date.' : expired ? "Expired stock can't be added." : null,
    name: !product && !name.trim() ? 'Add a name.' : null,
    netKg: !product && !(parseFloat(netKg) > 0) ? 'Weight of one carton, in kg.' : null,
    price: !product && !(parseInt(price.replace(/\D/g, ''), 10) > 0) ? 'Price of one carton.' : null,
  };
  const blur = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }));

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ expiry: true, name: true, netKg: true, price: true });
    if (Object.values(errors).some(Boolean)) return;
    setSaving(true);
    try {
      const b = await api.addBatch({
        barcode: code,
        productId: product?.id,
        newProduct: product ? undefined : { name: name.trim(), netKg: parseFloat(netKg), price: parseInt(price.replace(/\D/g, ''), 10) },
        batchNo: batchNo.trim(),
        expiry,
        quantity: qty,
      });
      onSaved(b.id);
    } catch (err) {
      setSaving(false);
      toast(err instanceof ApiError ? err.message : 'Could not save.', 'error');
    }
  };

  return (
    <form onSubmit={save} noValidate>
      {product ? (
        <div className="flex items-center gap-3 rounded-[16px] bg-white p-3 shadow-soft ring-1 ring-hairline">
          <ProductPhoto product={product} className="size-16" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[1.0625rem] font-semibold text-ink">{product.name}</p>
            <p className="t-14 num text-slate">
              {product.pack} · {naira(product.price)}
            </p>
            <p className="mono text-slate">{code}</p>
          </div>
        </div>
      ) : (
        <>
          <p className="mono mb-3 text-slate">Barcode {code}</p>
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} onBlur={blur('name')} error={touched.name ? errors.name : null} data-autofocus />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Kg per carton" inputMode="decimal" value={netKg} onChange={(e) => setNetKg(e.target.value)} onBlur={blur('netKg')} error={touched.netKg ? errors.netKg : null} />
            <TextField label="Price (₦)" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} onBlur={blur('price')} error={touched.price ? errors.price : null} />
          </div>
        </>
      )}

      <div className="mt-5">
        <TextField
          label="Expiry date"
          type="date"
          value={expiry}
          min={addDays(today(), 1)}
          onChange={(e) => setExpiry(e.target.value)}
          onBlur={blur('expiry')}
          error={touched.expiry || expired ? errors.expiry : null}
          hint={left !== null && left > 0 ? <Pill tone={left <= 42 ? 'amber' : 'neutral'}>{`${shortDate(expiry)} · ${expiryWords(left)}`}</Pill> : undefined}
        />
        <Stepper label="Quantity" value={qty} onChange={setQty} unit="cartons" />
        <TextField label="Batch number (optional)" autoCapitalize="characters" autoComplete="off" placeholder="MP-1102" value={batchNo} onChange={(e) => setBatchNo(e.target.value)} />
      </div>
      <Button type="submit" size="lg" block loading={saving} loadingLabel="Saving" disabled={expired}>
        Save
      </Button>
    </form>
  );
}
