

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ── Currency data ─────────────────────────────────────────────────────────────
interface Currency {
  code: string;
  flag: string;
  name: string;
}

const CURRENCIES: Currency[] = [
  { code: 'TZS', flag: '🇹🇿', name: 'Tanzanian Shilling' },
  { code: 'USD', flag: '🇺🇸', name: 'US Dollar' },
  { code: 'EUR', flag: '🇪🇺', name: 'Euro' },
  { code: 'GBP', flag: '🇬🇧', name: 'British Pound' },
  { code: 'KES', flag: '🇰🇪', name: 'Kenyan Shilling' },
  { code: 'UGX', flag: '🇺🇬', name: 'Ugandan Shilling' },
  { code: 'ZAR', flag: '🇿🇦', name: 'South African Rand' },
  { code: 'NGN', flag: '🇳🇬', name: 'Nigerian Naira' },
  { code: 'GHS', flag: '🇬🇭', name: 'Ghanaian Cedi' },
  { code: 'RWF', flag: '🇷🇼', name: 'Rwandan Franc' },
  { code: 'ETB', flag: '🇪🇹', name: 'Ethiopian Birr' },
  { code: 'ZMW', flag: '🇿🇲', name: 'Zambian Kwacha' },
  { code: 'MZN', flag: '🇲🇿', name: 'Mozambican Metical' },
  { code: 'AED', flag: '🇦🇪', name: 'UAE Dirham' },
  { code: 'SAR', flag: '🇸🇦', name: 'Saudi Riyal' },
  { code: 'CNY', flag: '🇨🇳', name: 'Chinese Yuan' },
  { code: 'JPY', flag: '🇯🇵', name: 'Japanese Yen' },
  { code: 'INR', flag: '🇮🇳', name: 'Indian Rupee' },
  { code: 'PKR', flag: '🇵🇰', name: 'Pakistani Rupee' },
  { code: 'CAD', flag: '🇨🇦', name: 'Canadian Dollar' },
  { code: 'AUD', flag: '🇦🇺', name: 'Australian Dollar' },
  { code: 'CHF', flag: '🇨🇭', name: 'Swiss Franc' },
  { code: 'BRL', flag: '🇧🇷', name: 'Brazilian Real' },
  { code: 'MXN', flag: '🇲🇽', name: 'Mexican Peso' },
  { code: 'SGD', flag: '🇸🇬', name: 'Singapore Dollar' },
  { code: 'HKD', flag: '🇭🇰', name: 'Hong Kong Dollar' },
  { code: 'TRY', flag: '🇹🇷', name: 'Turkish Lira' },
  { code: 'SEK', flag: '🇸🇪', name: 'Swedish Krona' },
  { code: 'NOK', flag: '🇳🇴', name: 'Norwegian Krone' },
  { code: 'DKK', flag: '🇩🇰', name: 'Danish Krone' },
  { code: 'PLN', flag: '🇵🇱', name: 'Polish Zloty' },
  { code: 'IDR', flag: '🇮🇩', name: 'Indonesian Rupiah' },
  { code: 'MYR', flag: '🇲🇾', name: 'Malaysian Ringgit' },
  { code: 'THB', flag: '🇹🇭', name: 'Thai Baht' },
  { code: 'PHP', flag: '🇵🇭', name: 'Philippine Peso' },
  { code: 'NZD', flag: '🇳🇿', name: 'New Zealand Dollar' },
  { code: 'EGP', flag: '🇪🇬', name: 'Egyptian Pound' },
  { code: 'MAD', flag: '🇲🇦', name: 'Moroccan Dirham' },
  { code: 'ILS', flag: '🇮🇱', name: 'Israeli Shekel' },
];

const POPULAR = ['USD', 'EUR', 'GBP', 'KES', 'ZAR', 'AED', 'CNY', 'INR'];
const ZERO_DECIMAL = new Set(['JPY', 'KRW', 'UGX', 'RWF', 'IDR', 'BIF', 'CLP', 'VND', 'MGA']);

function getMeta(code: string): Currency | undefined {
  return CURRENCIES.find(c => c.code === code);
}

// ── Formatting ────────────────────────────────────────────────────────────────
function fmt(val: number | null | undefined, code: string): string {
  if (val == null) return '—';
  const dec = ZERO_DECIMAL.has(code) ? 0 : 2;
  return val.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

// ── API ────────────────────────────────────────────────────────────────────────
const CACHE: Record<string, { rates: Record<string, number>; date: string }> = {};

async function fetchRates(from: string): Promise<{ rates: Record<string, number>; date: string }> {
  if (CACHE[from]) return CACHE[from];
  const base = from.toLowerCase();
  const urls = [
    `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${base}.json`,
    `https://latest.currency-api.pages.dev/v1/currencies/${base}.json`,
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const json = await res.json();
      const raw: Record<string, number> = json[base] ?? {};
      const rates: Record<string, number> = {};
      for (const [k, v] of Object.entries(raw)) {
        if (typeof v === 'number') rates[k.toUpperCase()] = v;
      }
      rates[from] = 1;
      const result = { rates, date: json.date ?? '' };
      CACHE[from] = result;
      return result;
    } catch { continue; }
  }
  throw new Error('fetch_failed');
}

// ── Currency selector ─────────────────────────────────────────────────────────
function CurrencySelect({
  value, onChange, accent = false,
}: {
  value: string;
  onChange: (code: string) => void;
  accent?: boolean;
}) {
  const meta = getMeta(value);
  const sorted = [...CURRENCIES].sort((a, b) => a.code.localeCompare(b.code));

  return (
    <div className={`relative flex items-center gap-1.5 px-3 py-2.5 border-r flex-shrink-0 ${accent ? 'border-bss-border' : 'border-bss-border'}`}>
      <span className="text-xl leading-none pointer-events-none">{meta?.flag}</span>
      <span className="font-body text-xs font-medium text-bss-white tracking-[0.04em] pointer-events-none">{value}</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
        stroke="#555555" strokeWidth="1.5" strokeLinecap="round"
        className="pointer-events-none">
        <path d="M6 9l6 6 6-6"/>
      </svg>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
      >
        {sorted.map(c => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.code} — {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CurrencyPage() {
  const [from, setFrom]       = useState('USD');
  const [to, setTo]           = useState('TZS');
  const [amount, setAmount]   = useState('100');
  const [rates, setRates]     = useState<Record<string, number>>({});
  const [rateDate, setRateDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(false);
  const [swapped, setSwapped] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const load = useCallback(async (base: string) => {
    setLoading(true); setError(false);
    try {
      const { rates: r, date } = await fetchRates(base);
      setRates(r);
      setRateDate(date);
    } catch {
      setError(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(from); }, [from, load]);

  // ── Computed ───────────────────────────────────────────────────────────────
  const parsedAmount  = parseFloat(amount.replace(/,/g, '')) || 0;
  const toRate        = rates[to];
  const converted     = toRate != null ? parsedAmount * toRate : null;
  const inverseRate   = toRate && toRate !== 0 ? 1 / toRate : null;
  const convertTo     = (code: string) => {
    const r = rates[code];
    return r != null ? parsedAmount * r : null;
  };

  // ── Swap ───────────────────────────────────────────────────────────────────
  function swap() {
    const prevFrom = from;
    const prevTo   = to;
    setFrom(prevTo);
    setTo(prevFrom);
    setSwapped(s => !s);
  }

  // ── Refresh ────────────────────────────────────────────────────────────────
  function refresh() {
    delete CACHE[from];
    load(from);
  }

  const fromMeta = getMeta(from);
  const toMeta   = getMeta(to);

  const otherCurrencies = CURRENCIES
    .filter(c => c.code !== from && c.code !== to && rates[c.code] != null);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
      <section className="pt-36 pb-20 border-b border-bss-border">
        <div className="container-site">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="eyebrow">Tools</p>
              <h1 className="display-xl max-w-2xl mb-4">Currency Converter</h1>
              <p className="body-lead max-w-prose">
                Live exchange rates for 39 currencies. Rates from fawazahmed0/currency-api, updated daily.
              </p>
            </div>
            <button
              onClick={refresh}
              disabled={loading}
              className="inline-flex items-center gap-2 font-body text-[11px] text-bss-muted border border-bss-border px-3.5 py-2 cursor-pointer hover:border-bss-subtle hover:text-bss-subtle transition-colors bg-transparent disabled:opacity-40"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                className={loading ? 'animate-spin' : ''}>
                <path d="M23 4v6h-6"/>
                <path d="M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              {loading ? 'Updating…' : 'Refresh rates'}
            </button>
          </div>
        </div>
      </section>

      {/* ── CONTENT ─────────────────────────────────────────────────── */}
      <section className="section-pad">
        <div className="container-site">
          <div className="grid lg:grid-cols-[360px_1fr] gap-12 items-start">

            {/* ── LEFT — converter inputs ──────────────────────────── */}
            <div className="grid gap-5">

              {/* FROM */}
              <div>
                <p className="font-body text-[10px] text-bss-muted tracking-[0.14em] mb-2">AMOUNT</p>
                <div className="flex border border-bss-border bg-bss-card">
                  <CurrencySelect
                    value={from}
                    onChange={code => { setFrom(code); }}
                  />
                  <input
                    type="text"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="flex-1 min-w-0 px-4 py-3 bg-transparent font-body text-xl font-medium text-bss-white outline-none placeholder:text-bss-muted"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Swap */}
              <div className="relative flex items-center">
                <div className="flex-1 h-px bg-bss-border" />
                <button
                  onClick={swap}
                  className={`mx-4 w-9 h-9 flex items-center justify-center border border-bss-border bg-bss-card text-bss-subtle hover:border-bss-subtle hover:text-bss-white transition-all duration-300 flex-shrink-0 ${swapped ? 'rotate-180' : 'rotate-0'}`}
                  style={{ transition: 'transform 0.32s cubic-bezier(0.34,1.56,0.64,1), border-color 0.15s, color 0.15s' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/>
                  </svg>
                </button>
                <div className="flex-1 h-px bg-bss-border" />
              </div>

              {/* TO */}
              <div>
                <p className="font-body text-[10px] text-bss-muted tracking-[0.14em] mb-2">CONVERT TO</p>
                <div className="flex border border-bss-border bg-bss-card">
                  <CurrencySelect
                    value={to}
                    onChange={setTo}
                    accent
                  />
                  <div className="flex-1 px-4 py-3 flex items-center">
                    {loading ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="#555555" strokeWidth="1.5" strokeLinecap="round"
                        className="animate-spin">
                        <path d="M23 4v6h-6"/>
                        <path d="M1 20v-6h6"/>
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                      </svg>
                    ) : (
                      <span className="font-body text-xl font-medium text-bss-white">
                        {converted != null ? fmt(converted, to) : '—'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Rate line */}
                {toRate != null && !loading && (
                  <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                    <div className="w-1.5 h-1.5 rounded-full bg-bss-subtle flex-shrink-0" />
                    <span className="font-body text-[11px] text-bss-muted">
                      1 {from} = {fmt(toRate, to)} {to}
                    </span>
                    <div className="w-1 h-1 rounded-full bg-bss-border flex-shrink-0" />
                    <span className="font-body text-[11px] text-bss-muted">
                      1 {to} = {fmt(inverseRate, from)} {from}
                    </span>
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 px-4 py-3 border border-bss-border">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="#888888" strokeWidth="1.5" strokeLinecap="round"
                    className="flex-shrink-0 mt-0.5">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <div>
                    <p className="font-body text-xs text-bss-subtle">Could not fetch rates. Check your connection.</p>
                    <button onClick={refresh}
                      className="font-body text-[11px] text-bss-muted mt-1 underline underline-offset-2 cursor-pointer bg-transparent border-none p-0 hover:text-bss-subtle transition-colors">
                      Try again
                    </button>
                  </div>
                </div>
              )}

              {/* Result summary card */}
              {converted != null && !loading && (
                <div className="border border-bss-border bg-bss-card px-4 py-4">
                  <p className="font-body text-[10px] text-bss-muted tracking-[0.14em] mb-3">SUMMARY</p>
                  <div className="grid gap-2">
                    {[
                      { label: 'Amount', value: `${fmt(parsedAmount, from)} ${from}` },
                      { label: `1 ${from}`, value: `${fmt(toRate, to)} ${to}` },
                      { label: `1 ${to}`, value: `${fmt(inverseRate, from)} ${from}` },
                    ].map(row => (
                      <div key={row.label} className="flex items-center justify-between gap-4 py-1.5 border-b border-bss-border last:border-b-0">
                        <span className="font-body text-[11px] text-bss-muted">{row.label}</span>
                        <span className="font-body text-[12px] font-medium text-bss-white tabular-nums">{row.value}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between gap-4 pt-2">
                      <span className="font-body text-[11px] text-bss-muted">
                        {fromMeta?.flag} {fmt(parsedAmount, from)} {from} =
                      </span>
                      <span className="font-body text-base font-medium text-bss-white tabular-nums">
                        {toMeta?.flag} {fmt(converted, to)} {to}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Source */}
              {rateDate && (
                <p className="font-body text-[11px] text-bss-muted font-light">
                  Rates as of {rateDate} · fawazahmed0/currency-api
                </p>
              )}
            </div>

            {/* ── RIGHT — popular + all currencies ────────────────── */}
            <div className="grid gap-8">

              {/* Popular chips */}
              <div>
                <p className="font-body text-[10px] text-bss-muted tracking-[0.14em] mb-3">POPULAR</p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR.map(code => {
                    const meta      = getMeta(code);
                    const val       = convertTo(code);
                    const isActive  = code === to;
                    return (
                      <button
                        key={code}
                        onClick={() => setTo(code)}
                        className={`flex flex-col items-start gap-1 px-3 py-2 border transition-all duration-150 cursor-pointer
                          ${isActive
                            ? 'bg-bss-card border-bss-white text-bss-white'
                            : 'bg-transparent border-bss-border text-bss-muted hover:border-bss-subtle hover:text-bss-subtle'}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm leading-none">{meta?.flag}</span>
                          <span className={`font-body text-[11px] font-medium ${isActive ? 'text-bss-white' : 'text-bss-subtle'}`}>
                            {code}
                          </span>
                        </div>
                        {val != null && !loading && (
                          <span className={`font-body text-[10px] tabular-nums ${isActive ? 'text-bss-subtle' : 'text-bss-muted'}`}>
                            {fmt(val, code)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* All other currencies */}
              {!loading && !error && Object.keys(rates).length > 0 && (
                <div>
                  <p className="font-body text-[10px] text-bss-muted tracking-[0.14em] mb-3">ALL CURRENCIES</p>
                  <div className="divide-y divide-bss-border border-t border-bss-border">
                    {otherCurrencies.map(cur => {
                      const val      = convertTo(cur.code);
                      const unitRate = rates[cur.code] !== 0 ? 1 / rates[cur.code] : null;
                      return (
                        <button
                          key={cur.code}
                          onClick={() => setTo(cur.code)}
                          className="w-full flex items-center gap-4 py-3.5 text-left transition-colors hover:bg-bss-card px-1 group"
                        >
                          <span className="text-xl w-7 text-center flex-shrink-0 leading-none">{cur.flag}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-body text-sm font-medium text-bss-white truncate">{cur.name}</p>
                            {unitRate != null && (
                              <p className="font-body text-[11px] text-bss-muted">
                                1 {cur.code} = {fmt(unitRate, from)} {from}
                              </p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-body text-sm font-medium text-bss-white tabular-nums">
                              {val != null ? fmt(val, cur.code) : '—'}
                            </p>
                            <p className="font-body text-[10px] text-bss-muted">{cur.code}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Loading skeleton */}
              {loading && (
                <div className="grid gap-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-12 bg-bss-card border border-bss-border animate-pulse" />
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>
      </section>
    </>
  );
}