'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';

type Currency = 'USD' | 'LKR';
type DiscountType = 'percent' | 'fixed';
type Tab = 'form' | 'preview';

type LineItem = {
  id: string;
  description: string;
  quantity: number;
  rate: number;
};

type InvoiceData = {
  toName: string;
  toEmail: string;
  toAddress: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  items: LineItem[];
  taxRate: number;
  discount: number;
  discountType: DiscountType;
  notes: string;
  currency: Currency;
};

const BRAND = '#062A5C';
const ACCENT = '#1a73e8';

const COMPANY = {
  name: 'JenInfoTech',
  tagline: 'believe the process',
  email: 'pirakalathan.dev@gmail.com',
  phone: '+94778360855',
  address: '482/1 Kandy Road, Ariyalai, Jaffna, Sri Lanka',
};

const today = new Date().toISOString().split('T')[0];
const dueIn30 = new Date(Date.now() + 30 * 864e5).toISOString().split('T')[0];

const defaultData: InvoiceData = {
  toName: '',
  toEmail: '',
  toAddress: '',
  invoiceNumber: 'INV-001',
  invoiceDate: today,
  dueDate: dueIn30,
  items: [{ id: '1', description: '', quantity: 1, rate: 0 }],
  taxRate: 0,
  discount: 0,
  discountType: 'percent',
  notes: 'Payment is due within 30 days. Thank you for choosing JenInfoTech!',
  currency: 'USD',
};

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function fmt(n: number, currency: Currency) {
  if (currency === 'LKR') {
    return 'Rs. ' + new Intl.NumberFormat('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function fmtDate(d: string) {
  if (!d) return '';
  try {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch { return d; }
}

export default function InvoicePage() {
  const [data, setData] = useState<InvoiceData>(defaultData);
  const [previewing, setPreviewing] = useState(false);
  const [tab, setTab] = useState<Tab>('form');

  const set = useCallback(<K extends keyof InvoiceData>(key: K, val: InvoiceData[K]) => {
    setData((d) => ({ ...d, [key]: val }));
  }, []);

  const setItem = useCallback((id: string, key: keyof LineItem, val: string | number) => {
    setData((d) => ({
      ...d,
      items: d.items.map((item) => (item.id === id ? { ...item, [key]: val } : item)),
    }));
  }, []);

  const addItem = () =>
    setData((d) => ({
      ...d,
      items: [...d.items, { id: uid(), description: '', quantity: 1, rate: 0 }],
    }));

  const removeItem = (id: string) =>
    setData((d) => ({ ...d, items: d.items.filter((i) => i.id !== id) }));

  const subtotal = data.items.reduce((s, i) => s + i.quantity * i.rate, 0);
  const discountAmount =
    data.discountType === 'percent'
      ? subtotal * (data.discount / 100)
      : Math.min(data.discount, subtotal);
  const afterDiscount = subtotal - discountAmount;
  const tax = afterDiscount * (data.taxRate / 100);
  const total = afterDiscount + tax;

  const sheetProps = { data, subtotal, discountAmount, afterDiscount, tax, total };

  return (
    <div className="min-h-screen bg-slate-100">

      {/* ── Toolbar ── */}
      <header
        className="no-print sticky top-0 z-20 flex items-center justify-between px-4 py-3 shadow-md"
        style={{ backgroundColor: BRAND }}
      >
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="JenInfoTech" width={32} height={32} className="rounded-full bg-white p-0.5" />
          <span className="text-sm font-bold tracking-tight text-white hidden sm:block">Invoice Generator</span>
          <span className="text-sm font-bold tracking-tight text-white sm:hidden">Invoicer</span>
        </div>
        <button
          onClick={() => setPreviewing(true)}
          className="flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold transition-colors hover:bg-slate-100"
          style={{ color: BRAND }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
          </svg>
          Preview
        </button>
      </header>

      {/* ── Mobile Tab Bar ── */}
      <div
        className="no-print flex md:hidden border-b border-white/10 sticky top-[52px] z-10"
        style={{ backgroundColor: BRAND }}
      >
        {(['form', 'preview'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2.5 text-sm font-semibold transition-colors capitalize"
            style={
              tab === t
                ? { color: '#fff', borderBottom: '2px solid #fff' }
                : { color: 'rgba(255,255,255,0.5)', borderBottom: '2px solid transparent' }
            }
          >
            {t === 'form' ? 'Edit Invoice' : 'Invoice View'}
          </button>
        ))}
      </div>

      {/* ── Editor Layout ── */}
      <div className="no-print mx-auto flex flex-col md:flex-row max-w-[1400px] gap-4 md:gap-6 p-4 md:p-6">

        {/* Form panel — visible on desktop always; on mobile only when tab=form */}
        <aside className={`w-full md:w-72 md:shrink-0 space-y-4 ${tab !== 'form' ? 'hidden md:block' : ''}`}>

          {/* Fixed company card */}
          <section className="rounded-xl bg-white p-4 shadow-sm border-l-4" style={{ borderLeftColor: BRAND }}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">From (Fixed)</h2>
            <div className="flex items-center gap-3 mb-3">
              <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-lg" />
              <div>
                <p className="font-bold text-slate-800 text-sm">{COMPANY.name}</p>
                <p className="text-xs text-slate-400 italic">{COMPANY.tagline}</p>
              </div>
            </div>
            <div className="space-y-1 text-xs text-slate-500">
              <p>{COMPANY.email}</p>
              <p>{COMPANY.phone}</p>
              <p>{COMPANY.address}</p>
            </div>
          </section>

          {/* Currency */}
          <section className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Currency</h2>
            <div className="flex gap-2">
              {(['USD', 'LKR'] as Currency[]).map((c) => (
                <button
                  key={c}
                  onClick={() => set('currency', c)}
                  className="flex-1 rounded-lg py-2.5 text-sm font-semibold border-2 transition-all"
                  style={
                    data.currency === c
                      ? { backgroundColor: BRAND, borderColor: BRAND, color: '#fff' }
                      : { backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#64748b' }
                  }
                >
                  {c === 'USD' ? '$ USD' : 'Rs. LKR'}
                </button>
              ))}
            </div>
          </section>

          {/* Bill To */}
          <FormSection title="Bill To">
            <Field label="Client Name" value={data.toName} onChange={(v) => set('toName', v)} />
            <Field label="Email" value={data.toEmail} onChange={(v) => set('toEmail', v)} />
            <Field label="Address" value={data.toAddress} onChange={(v) => set('toAddress', v)} />
          </FormSection>

          {/* Invoice Details */}
          <FormSection title="Invoice Details">
            <Field label="Invoice #" value={data.invoiceNumber} onChange={(v) => set('invoiceNumber', v)} />
            <div className="grid grid-cols-2 gap-2">
              <Field label="Date" type="date" value={data.invoiceDate} onChange={(v) => set('invoiceDate', v)} />
              <Field label="Due Date" type="date" value={data.dueDate} onChange={(v) => set('dueDate', v)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field
                label="Tax Rate (%)"
                type="number"
                value={String(data.taxRate)}
                onChange={(v) => set('taxRate', parseFloat(v) || 0)}
              />
              {/* Discount */}
              <div>
                <label className="mb-1 block text-xs text-slate-400">Discount</label>
                <div className="flex gap-1">
                  <div className="flex rounded-md border border-slate-200 overflow-hidden text-xs font-semibold shrink-0">
                    {(['percent', 'fixed'] as DiscountType[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => set('discountType', t)}
                        className="px-2 py-2 transition-colors"
                        style={
                          data.discountType === t
                            ? { backgroundColor: BRAND, color: '#fff' }
                            : { backgroundColor: '#fff', color: '#64748b' }
                        }
                      >
                        {t === 'percent' ? '%' : data.currency === 'LKR' ? 'Rs' : '$'}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={data.discount}
                    onChange={(e) => set('discount', parseFloat(e.target.value) || 0)}
                    className="w-full rounded-md border border-slate-200 px-2 py-2 text-sm text-slate-700 focus:outline-none min-w-0"
                    placeholder="0"
                    onFocus={(e) => (e.target.style.borderColor = BRAND)}
                    onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                  />
                </div>
              </div>
            </div>
          </FormSection>

          {/* Notes */}
          <FormSection title="Notes">
            <textarea
              rows={3}
              value={data.notes}
              onChange={(e) => set('notes', e.target.value)}
              className="w-full resize-none rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:outline-none"
              onFocus={(e) => (e.target.style.borderColor = BRAND)}
              onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
            />
          </FormSection>
        </aside>

        {/* Invoice preview panel — desktop always visible; mobile only when tab=preview */}
        <div className={`w-full md:flex-1 ${tab !== 'preview' ? 'hidden md:block' : ''}`}>
          {/* Horizontal scroll wrapper for small screens */}
          <div className="overflow-x-auto rounded-2xl shadow-xl">
            <div style={{ minWidth: 600 }}>
              <InvoiceSheet
                {...sheetProps}
                editable
                onSetItem={setItem}
                onAddItem={addItem}
                onRemoveItem={removeItem}
              />
            </div>
          </div>

          {/* Mobile: quick action button below preview */}
          <div className="mt-4 md:hidden">
            <button
              onClick={() => setPreviewing(true)}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow transition-opacity hover:opacity-90"
              style={{ backgroundColor: BRAND }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
              </svg>
              Print / Save PDF
            </button>
          </div>
        </div>
      </div>

      {/* ── Preview Modal ── */}
      {previewing && (
        <div
          className="no-print fixed inset-0 z-50 flex flex-col"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
        >
          {/* Modal toolbar */}
          <div
            className="flex shrink-0 items-center justify-between px-4 py-3 shadow-lg"
            style={{ backgroundColor: BRAND }}
          >
            <div className="flex items-center gap-2.5">
              <Image src="/logo.png" alt="Logo" width={26} height={26} className="rounded-full bg-white p-0.5" />
              <span className="text-sm font-semibold text-white">Invoice Preview</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold transition-colors hover:bg-slate-100"
                style={{ color: BRAND }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
                </svg>
                <span className="hidden sm:inline">Print / Save PDF</span>
                <span className="sm:hidden">Print</span>
              </button>
              <button
                onClick={() => setPreviewing(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white text-xl leading-none"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              >
                ×
              </button>
            </div>
          </div>

          {/* Paper scroll area */}
          <div className="flex-1 overflow-auto py-6 px-3" style={{ backgroundColor: '#3a3a3a' }}>
            <div
              className="mx-auto bg-white shadow-2xl"
              style={{ width: '794px', minHeight: '1123px', maxWidth: '100%' }}
            >
              <InvoiceSheet
                {...sheetProps}
                editable={false}
                onSetItem={() => {}}
                onAddItem={() => {}}
                onRemoveItem={() => {}}
              />
            </div>
          </div>
        </div>
      )}

      {/* Print-only */}
      <div className="print-only">
        <InvoiceSheet
          {...sheetProps}
          editable={false}
          onSetItem={() => {}}
          onAddItem={() => {}}
          onRemoveItem={() => {}}
        />
      </div>
    </div>
  );
}

/* ── Form helpers ── */

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, value, onChange, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-slate-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:outline-none"
        onFocus={(e) => (e.target.style.borderColor = BRAND)}
        onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
      />
    </div>
  );
}

/* ── Invoice Sheet ── */

function InvoiceSheet({ data, subtotal, discountAmount, afterDiscount, tax, total, editable, onSetItem, onAddItem, onRemoveItem }: {
  data: InvoiceData; subtotal: number; discountAmount: number; afterDiscount: number;
  tax: number; total: number; editable: boolean;
  onSetItem: (id: string, key: keyof LineItem, val: string | number) => void;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
}) {
  const f = (n: number) => fmt(n, data.currency);

  return (
    <div className="invoice-sheet bg-white flex flex-col" style={{ minHeight: 900 }}>

      {/* Header */}
      <div style={{ backgroundColor: BRAND }}>
        <div className="flex items-start justify-between px-8 pt-8 pb-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-2xl p-2 shadow-md shrink-0" style={{ width: 80, height: 80 }}>
              <Image src="/logo.png" alt="JenInfoTech" width={64} height={64} className="block" />
            </div>
            <div>
              <p className="text-xl font-black text-white tracking-wide">{COMPANY.name}</p>
              <p className="text-xs text-blue-200 italic mt-0.5">{COMPANY.tagline}</p>
              <div className="mt-2 space-y-0.5">
                <p className="text-xs text-blue-100">{COMPANY.email}</p>
                <p className="text-xs text-blue-100">{COMPANY.phone}</p>
                <p className="text-xs text-blue-100">{COMPANY.address}</p>
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-4xl font-black tracking-[0.15em] text-white" style={{ opacity: 0.92 }}>
              INVOICE
            </p>
            <div className="mt-2 space-y-0.5">
              <p className="text-sm font-semibold text-blue-100">{data.invoiceNumber}</p>
              {data.invoiceDate && <p className="text-xs text-blue-200">Issued: {fmtDate(data.invoiceDate)}</p>}
              {data.dueDate && <p className="text-xs text-blue-200">Due: {fmtDate(data.dueDate)}</p>}
              <p className="text-xs font-semibold text-blue-100">{data.currency}</p>
            </div>
          </div>
        </div>
        {/* Accent stripe */}
        <div className="flex h-1.5">
          {['#1a73e8', '#0ea5e9', '#38bdf8', '#7dd3fc'].map((c) => (
            <div key={c} className="flex-1" style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>

      {/* Bill To + Info Boxes */}
      <div className="border-b border-slate-100 px-8 py-5 flex flex-wrap gap-4 items-start justify-between">
        <div className="min-w-[160px]">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest" style={{ color: BRAND }}>Bill To</p>
          {data.toName ? (
            <>
              <p className="text-base font-bold text-slate-800">{data.toName}</p>
              {data.toEmail && <p className="text-sm text-slate-500 mt-0.5">{data.toEmail}</p>}
              {data.toAddress && <p className="text-sm text-slate-500">{data.toAddress}</p>}
            </>
          ) : (
            <p className="text-sm text-slate-300 italic">Client details will appear here</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <InfoBox label="Invoice No." value={data.invoiceNumber} />
          <InfoBox label="Issue Date" value={data.invoiceDate ? fmtDate(data.invoiceDate) : '—'} />
          <InfoBox label="Due Date" value={data.dueDate ? fmtDate(data.dueDate) : '—'} />
        </div>
      </div>

      {/* Line Items */}
      <div className="px-8 py-5 flex-1">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: BRAND }}>
              <th className="py-2.5 pl-3 text-left text-xs font-semibold uppercase tracking-wider text-blue-100 w-8">#</th>
              <th className="py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-blue-100">Description</th>
              <th className="py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-blue-100 w-16">Qty</th>
              <th className="py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-blue-100 w-28">Unit Price</th>
              <th className="py-2.5 pr-3 text-right text-xs font-semibold uppercase tracking-wider text-blue-100 w-28">Amount</th>
              {editable && <th className="w-6" />}
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, idx) => (
              <tr key={item.id} className="group border-b border-slate-100" style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f8faff' }}>
                <td className="py-3 pl-3 text-xs text-slate-400 font-medium">{idx + 1}</td>
                <td className="py-3 pr-3">
                  {editable ? (
                    <input
                      className="w-full rounded px-1 py-1 text-slate-700 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                      value={item.description}
                      placeholder="Item description…"
                      onChange={(e) => onSetItem(item.id, 'description', e.target.value)}
                    />
                  ) : <span className="text-slate-700">{item.description}</span>}
                </td>
                <td className="py-3 text-right">
                  {editable ? (
                    <input
                      type="number" min={0}
                      className="w-14 rounded px-1 py-1 text-right text-slate-700 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                      value={item.quantity}
                      onChange={(e) => onSetItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                  ) : <span className="text-slate-700">{item.quantity}</span>}
                </td>
                <td className="py-3 text-right">
                  {editable ? (
                    <input
                      type="number" min={0}
                      className="w-24 rounded px-1 py-1 text-right text-slate-700 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                      value={item.rate}
                      onChange={(e) => onSetItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                    />
                  ) : <span className="text-slate-700">{f(item.rate)}</span>}
                </td>
                <td className="py-3 pr-3 text-right font-semibold" style={{ color: BRAND }}>
                  {f(item.quantity * item.rate)}
                </td>
                {editable && (
                  <td className="py-3 pl-1">
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-400 text-xl leading-none"
                    >×</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {editable && (
          <button onClick={onAddItem} className="mt-3 text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: ACCENT }}>
            + Add line item
          </button>
        )}

        {/* Totals */}
        <div className="mt-6 flex justify-end">
          <div className="w-64">
            <TotalRow label="Subtotal" value={f(subtotal)} />
            {discountAmount > 0 && (
              <>
                <TotalRow
                  label={`Discount${data.discountType === 'percent' && data.discount > 0 ? ` (${data.discount}%)` : ''}`}
                  value={`- ${f(discountAmount)}`}
                  valueClass="text-emerald-600"
                />
                <TotalRow label="After Discount" value={f(afterDiscount)} />
              </>
            )}
            {data.taxRate > 0 && <TotalRow label={`Tax (${data.taxRate}%)`} value={f(tax)} />}
            <div
              className="flex justify-between items-center mt-2 px-4 py-3 rounded-xl"
              style={{ backgroundColor: BRAND }}
            >
              <span className="text-xs font-bold text-blue-100 uppercase tracking-wider">Total Due</span>
              <span className="text-lg font-black text-white">{f(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {data.notes && (
        <div className="mx-8 mb-6 rounded-xl border border-slate-100 px-5 py-4" style={{ backgroundColor: '#f0f5ff' }}>
          <p className="mb-1.5 text-xs font-bold uppercase tracking-widest" style={{ color: BRAND }}>
            Notes &amp; Payment Terms
          </p>
          <p className="text-sm text-slate-500 leading-relaxed">{data.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div style={{ backgroundColor: BRAND }}>
        <div className="flex h-1.5">
          {['#7dd3fc', '#38bdf8', '#0ea5e9', '#1a73e8'].map((c) => (
            <div key={c} className="flex-1" style={{ backgroundColor: c }} />
          ))}
        </div>
        <div className="px-8 py-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="JenInfoTech" width={28} height={28} className="bg-white rounded-lg p-0.5" />
            <span className="text-sm font-bold text-white">{COMPANY.name}</span>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-blue-200">
            <span>{COMPANY.email}</span>
            <span>{COMPANY.phone}</span>
            <span>{COMPANY.address}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TotalRow({ label, value, valueClass = 'text-slate-700' }: {
  label: string; value: string; valueClass?: string;
}) {
  return (
    <div className="flex justify-between py-2 border-b border-slate-100 text-sm text-slate-500">
      <span>{label}</span>
      <span className={`font-medium ${valueClass}`}>{value}</span>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-lg px-3 py-2 text-center min-w-[100px]"
      style={{ backgroundColor: `${BRAND}08`, border: `1px solid ${BRAND}18` }}
    >
      <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: BRAND }}>{label}</p>
      <p className="text-xs font-bold text-slate-700">{value}</p>
    </div>
  );
}
