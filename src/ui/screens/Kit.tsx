import { Banknote, Tag } from 'lucide-react';
import { useState } from 'react';
import { naira } from '../../lib/format';
import { toast } from '../../lib/store';
import { BankCard, BankProcess } from '../kit/bank';
import { Button, Card, CountUp, Logo, Pill, SectionTitle, Skeleton, SuccessCheck } from '../kit/core';
import { OtpBoxes, Segmented, Slider, Stepper, TextField } from '../kit/fields';
import { Journey, MiniJourney } from '../kit/journey';
import { ProductPhoto } from '../kit/media';
import { Sheet } from '../kit/sheet';
import { Toasts } from '../kit/toasts';

/** Gate 1 review page: every v2 component on one screen. Removed before deploy. */
export function Kit() {
  const [seg, setSeg] = useState<'a' | 'b' | 'c'>('a');
  const [qty, setQty] = useState(12);
  const [pct, setPct] = useState(30);
  const [otp, setOtp] = useState('1234');
  const [open, setOpen] = useState(false);
  const [n, setN] = useState(129500);
  return (
    <div className="min-h-dvh bg-paper">
      <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6">
        <Logo />
        <h1 className="t-40 mt-6 text-ink">Sell it before it expires.</h1>
        <p className="t-16 mt-2 text-slate">Components · v2</p>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <Card className="p-5 lg:col-span-4">
            <SectionTitle title="Buttons" />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button>List it</Button>
              <Button variant="dark">Pay out</Button>
              <Button variant="secondary">Change price</Button>
              <Button variant="quiet">Cancel</Button>
              <Button variant="lime" icon={<Banknote className="size-5" />}>
                ₦129,500
              </Button>
              <Button loading loadingLabel="Sending">
                Pay out
              </Button>
            </div>
            <SectionTitle title="Pills" className="mt-5" />
            <div className="mt-2 flex flex-wrap gap-2">
              <Pill tone="amber">9 days left</Pill>
              <Pill tone="leaf">Listed</Pill>
              <Pill tone="lime">Paid</Pill>
              <Pill tone="teal">Verified</Pill>
              <Pill tone="coral">Failed</Pill>
              <Pill>In stock</Pill>
            </div>
          </Card>

          <Card className="p-5 lg:col-span-4">
            <SectionTitle title="Fields" />
            <Segmented
              className="mt-3"
              label="Role"
              value={seg}
              onChange={setSeg}
              options={[
                { value: 'a', label: 'Distributor' },
                { value: 'b', label: 'Buyer' },
                { value: 'c', label: 'Food bank' },
              ]}
            />
            <TextField className="mt-4" label="Phone or email" defaultValue="ade@adefoods.ng" />
            <Stepper label="Quantity" value={qty} onChange={setQty} unit="cartons" />
            <Slider label="Discount" value={pct} onChange={setPct} min={10} max={60} format={(v) => `${v}%`} />
          </Card>

          <Card className="p-5 lg:col-span-4">
            <SectionTitle title="Numbers" />
            <p className="t-40 mt-2 text-forest">
              <CountUp value={n} format={naira} />
            </p>
            <Button size="sm" variant="secondary" className="mt-2" onClick={() => setN((v) => v + 64750)}>
              Add sale
            </Button>
            <div className="mt-5 flex items-center gap-4">
              <SuccessCheck size={64} />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <Button size="sm" onClick={() => toast('Mama Tolu paid ₦195,000', 'success')}>
                Toast
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
                Sheet
              </Button>
            </div>
          </Card>

          <Card className="p-5 lg:col-span-7">
            <SectionTitle title="Batch journey" />
            <div className="mt-4 flex items-center gap-3">
              <ProductPhoto product={{ id: 'p-milk', name: 'Milk powder' }} className="size-16" />
              <div>
                <p className="t-20 text-ink">Milk powder</p>
                <p className="t-14 text-slate">12 × 380 g · 20 cartons</p>
              </div>
              <Pill tone="amber" className="ml-auto">
                4 weeks left
              </Pill>
            </div>
            <div className="mt-5">
              <Journey
                steps={[
                  { key: 's', label: 'Scanned', state: 'done', time: 'Today 10:02', detail: 'MP-1102 · use by 9 Dec' },
                  { key: 'l', label: 'Listed', state: 'done', time: 'Today 10:03', value: '30% off', detail: '₦12,950 a carton' },
                  { key: 'o', label: 'Sold', state: 'done', time: 'Today 10:05', detail: 'Mama Tolu Canteen · 10 cartons' },
                  { key: 'p', label: 'Paid', state: 'done', value: '₦129,500', money: true, detail: <span className="mono">SS-59487 · bank verified</span> },
                  { key: 'h', label: 'Handed over', state: 'current', detail: "Scan the buyer's code" },
                  { key: 'po', label: 'Paid out', state: 'todo', detail: 'To your bank account' },
                  { key: 'c', label: 'Carbon', state: 'todo', detail: 'Report to the carbon registry' },
                ]}
              />
            </div>
            <Button size="lg" block className="mt-6">
              Confirm handover
            </Button>
          </Card>

          <div className="space-y-6 lg:col-span-5">
            <BankCard title="BABATUNDE OLUMIDE ADEYEMI" reference="PO-59487-k2x1" status="Sent" tone="leaf">
              <p className="num t-24 text-ink">{naira(129500)}</p>
              <p className="t-14 text-slate">Fee ₦0 · Xtradot Bank ···6790</p>
            </BankCard>
            <Card className="p-5">
              <SectionTitle title="Bank process" />
              <div className="mt-3">
                <BankProcess steps={[{ label: 'Opening secure checkout' }, { label: 'Bank page' }, { label: 'Confirming with bank' }, { label: 'Paid' }]} current={2} />
              </div>
            </Card>
            <Card className="p-5">
              <SectionTitle title="Carbon" />
              <div className="mt-4">
                <MiniJourney
                  tone="teal"
                  steps={[
                    { key: 'c', label: 'Calculated', state: 'done' },
                    { key: 's', label: 'Submitted', state: 'done', value: '4,214 kWh' },
                    { key: 'v', label: 'Verified', state: 'current' },
                    { key: 'r', label: 'Retired', state: 'todo' },
                    { key: 'p', label: 'Paid', state: 'todo' },
                  ]}
                />
              </div>
            </Card>
            <Card className="p-5">
              <SectionTitle title="One-time code" />
              <div className="mt-3">
                <OtpBoxes value={otp} onChange={setOtp} />
              </div>
            </Card>
          </div>
        </div>
      </main>
      <Sheet open={open} onClose={() => setOpen(false)} title="List it">
        <div className="flex items-center gap-3">
          <ProductPhoto product={{ id: 'p-noodles', name: 'Instant noodles' }} className="size-14" />
          <div>
            <p className="t-16 font-semibold text-ink">Instant noodles</p>
            <p className="t-14 text-slate">30 cartons · 9 days left</p>
          </div>
        </div>
        <div className="mt-5">
          <Slider label="Discount" value={pct} onChange={setPct} min={10} max={60} format={(v) => `${v}%`} />
        </div>
        <Button size="lg" block className="mt-6" icon={<Tag className="size-5" />} onClick={() => setOpen(false)}>
          List now
        </Button>
      </Sheet>
      <Toasts tabBar={false} />
    </div>
  );
}
