'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ── Templates ─────────────────────────────────────────────────────────────────
type TemplateKey = 'product' | 'contact' | 'url' | 'custom';

interface FieldDef {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  multiline?: boolean;
}

interface Template {
  key: TemplateKey;
  icon: string;
  label: string;
  description: string;
  fields: FieldDef[];
  encode: (vals: Record<string, string>) => string;
}

const TEMPLATES: Template[] = [
  {
    key: 'product',
    icon: '📦',
    label: 'Product',
    description: 'Name, SKU, price, and description for a product label.',
    fields: [
      { id: 'name',        label: 'Product name',  hint: 'e.g. Red Rice 5 kg', required: true },
      { id: 'sku',         label: 'SKU / code',    hint: 'e.g. RR-5KG-001' },
      { id: 'price',       label: 'Price',         hint: 'e.g. TZS 12,000' },
      { id: 'description', label: 'Description',   hint: 'Short product details', multiline: true },
    ],
    encode: v => [
      v.name        && `Product: ${v.name}`,
      v.sku         && `SKU: ${v.sku}`,
      v.price       && `Price: ${v.price}`,
      v.description && `Info: ${v.description}`,
    ].filter(Boolean).join('\n'),
  },
  {
    key: 'contact',
    icon: '👤',
    label: 'Contact',
    description: 'vCard-style contact info: name, phone, email, company.',
    fields: [
      { id: 'name',    label: 'Full name',    required: true },
      { id: 'phone',   label: 'Phone',        hint: '+255 7xx xxx xxx' },
      { id: 'email',   label: 'Email' },
      { id: 'company', label: 'Company / org' },
      { id: 'address', label: 'Address' },
    ],
    encode: v => [
      'BEGIN:VCARD',
      'VERSION:3.0',
      v.name    && `FN:${v.name}`,
      v.phone   && `TEL:${v.phone}`,
      v.email   && `EMAIL:${v.email}`,
      v.company && `ORG:${v.company}`,
      v.address && `ADR:;;${v.address};;;;`,
      'END:VCARD',
    ].filter(Boolean).join('\n'),
  },
  {
    key: 'url',
    icon: '🔗',
    label: 'URL',
    description: 'A single link — website, social profile, or deep link.',
    fields: [
      { id: 'url',   label: 'URL', hint: 'https://…', required: true },
      { id: 'label', label: 'Label (optional)', hint: 'Shown below QR code' },
    ],
    encode: v => v.url.trim(),
  },
  {
    key: 'custom',
    icon: '✏️',
    label: 'Custom',
    description: 'Type or paste any text to encode directly.',
    fields: [
      { id: 'text', label: 'Content', hint: 'Any text, URL, or data', required: true, multiline: true },
    ],
    encode: v => v.text.trim(),
  },
];

// ── QR generation via qrcode.js (CDN) ────────────────────────────────────────
declare global {
  interface Window { QRCode: any; }
}

function useQrLib(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (window.QRCode) { setReady(true); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    s.onload = () => setReady(true);
    document.head.appendChild(s);
  }, []);
  return ready;
}

// ── Field values state ────────────────────────────────────────────────────────
function emptyVals(fields: FieldDef[]): Record<string, string> {
  return Object.fromEntries(fields.map(f => [f.id, '']));
}

// ── Custom field helpers ───────────────────────────────────────────────────────
let _customId = 0;
function newCustomField(): FieldDef {
  _customId++;
  return { id: `custom_${_customId}`, label: `Field ${_customId}` };
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function QrPage() {
  const [step, setStep]               = useState<'pick' | 'fill'>('pick');
  const [templateKey, setTemplateKey] = useState<TemplateKey>('product');
  const [fields, setFields]           = useState<FieldDef[]>([]);
  const [vals, setVals]               = useState<Record<string, string>>({});
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [editLabelVal, setEditLabelVal] = useState('');
  const [qrContent, setQrContent]     = useState('');
  const [generated, setGenerated]     = useState(false);
  const [errors, setErrors]           = useState<Record<string, string>>({});

  const qrDivRef   = useRef<HTMLDivElement>(null);
  const qrInstance = useRef<any>(null);
  const qrReady    = useQrLib();

  const template = TEMPLATES.find(t => t.key === templateKey)!;

  // ── Pick template ──────────────────────────────────────────────────────────
  function pickTemplate(key: TemplateKey) {
    const t = TEMPLATES.find(t => t.key === key)!;
    setTemplateKey(key);
    setFields(t.fields.map(f => ({ ...f })));
    setVals(emptyVals(t.fields));
    setErrors({});
    setGenerated(false);
    setQrContent('');
    setStep('fill');
  }

  // ── Field value change ─────────────────────────────────────────────────────
  function setVal(id: string, v: string) {
    setVals(prev => ({ ...prev, [id]: v }));
    if (errors[id]) setErrors(prev => ({ ...prev, [id]: '' }));
    setGenerated(false);
  }

  // ── Custom fields ──────────────────────────────────────────────────────────
  function addField() {
    const f = newCustomField();
    setFields(prev => [...prev, f]);
    setVals(prev => ({ ...prev, [f.id]: '' }));
  }

  function removeField(id: string) {
    setFields(prev => prev.filter(f => f.id !== id));
    setVals(prev => { const n = { ...prev }; delete n[id]; return n; });
  }

  function startEditLabel(f: FieldDef) {
    setEditingLabel(f.id);
    setEditLabelVal(f.label);
  }

  function commitLabel(id: string) {
    setFields(prev => prev.map(f => f.id === id ? { ...f, label: editLabelVal.trim() || f.label } : f));
    setEditingLabel(null);
  }

  // ── Validate ───────────────────────────────────────────────────────────────
  function validate(): boolean {
    const e: Record<string, string> = {};
    for (const f of fields) {
      if (f.required && !vals[f.id]?.trim()) e[f.id] = 'Required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Generate QR ────────────────────────────────────────────────────────────
  const generateQr = useCallback((content: string) => {
    if (!qrReady || !qrDivRef.current) return;
    if (qrInstance.current) {
      qrInstance.current.clear();
      qrInstance.current.makeCode(content);
    } else {
      qrInstance.current = new window.QRCode(qrDivRef.current, {
        text: content,
        width: 280,
        height: 280,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: window.QRCode.CorrectLevel.M,
      });
    }
  }, [qrReady]);

  function handleGenerate() {
    if (!validate()) return;
    const content = template.encode(vals);
    if (!content.trim()) { setErrors({ _: 'Nothing to encode — fill in at least one field.' }); return; }
    setQrContent(content);
    setGenerated(false);
    // small delay so qrDivRef is rendered
    setTimeout(() => { generateQr(content); setGenerated(true); }, 80);
  }

  // Re-render QR when lib loads if content already set
  useEffect(() => {
    if (qrReady && qrContent && qrDivRef.current) {
      generateQr(qrContent);
      setGenerated(true);
    }
  }, [qrReady, qrContent, generateQr]);

  // ── Download PNG ───────────────────────────────────────────────────────────
  function downloadPng() {
    const canvas = qrDivRef.current?.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'qr-code.png';
    link.href = (canvas as HTMLCanvasElement).toDataURL('image/png');
    link.click();
  }

  // ── Download SVG ───────────────────────────────────────────────────────────
  function downloadSvg() {
    const canvas = qrDivRef.current?.querySelector('canvas');
    if (!canvas) return;
    const size = 280;
    const dataUrl = (canvas as HTMLCanvasElement).toDataURL('image/png');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <image href="${dataUrl}" width="${size}" height="${size}"/>
</svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const link = document.createElement('a');
    link.download = 'qr-code.svg';
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  }

  // ── Reset ──────────────────────────────────────────────────────────────────
  function reset() {
    setStep('pick');
    setGenerated(false);
    setQrContent('');
    setErrors({});
    qrInstance.current = null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
      <section className="pt-36 pb-20 border-b border-bss-border">
        <div className="container-site">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="eyebrow">Tools</p>
              <h1 className="display-xl max-w-2xl mb-4">QR Generator</h1>
              <p className="body-lead max-w-prose">
                Pick a template, fill in your details, and download a QR code as PNG or SVG — generated entirely in your browser.
              </p>
            </div>
            {step === 'fill' && (
              <button
                onClick={reset}
                className="font-body text-[11px] text-bss-muted bg-transparent border-none cursor-pointer tracking-[0.08em] hover:text-bss-subtle transition-colors pb-1"
              >
                ← Change template
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── CONTENT ─────────────────────────────────────────────────── */}
      <section className="section-pad">
        <div className="container-site">

          {/* ══ STEP 1 — Template picker ══════════════════════════════ */}
          {step === 'pick' && (
            <div className="max-w-prose">
              <p className="font-body text-sm text-bss-subtle font-light mb-6">
                Choose the type of QR code to generate.
              </p>
              <div className="divide-y divide-bss-border border-t border-bss-border">
                {TEMPLATES.map(t => (
                  <button
                    key={t.key}
                    onClick={() => pickTemplate(t.key)}
                    className="w-full text-left flex items-center gap-5 py-5 group transition-colors hover:bg-bss-surface px-1"
                  >
                    <span className="text-2xl w-8 text-center flex-shrink-0">{t.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-bss-white text-base mb-0.5">{t.label}</p>
                      <p className="font-body text-xs text-bss-muted font-light">{t.description}</p>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="#555555" strokeWidth="1.5" strokeLinecap="round"
                      className="flex-shrink-0 group-hover:stroke-bss-subtle transition-colors">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ══ STEP 2 — Fill + Preview ════════════════════════════════ */}
          {step === 'fill' && (
            <div className="grid lg:grid-cols-[1fr_300px] gap-12 items-start">

              {/* ── Left: form ──────────────────────────────────────── */}
              <div className="grid gap-6 max-w-prose">

                {/* Template chip */}
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-2 px-3 py-1.5 border border-bss-border text-bss-muted font-body text-[11px] tracking-[0.06em] cursor-pointer transition-colors hover:border-bss-subtle hover:text-bss-subtle w-fit"
                >
                  <span>{template.icon}</span>
                  <span>{template.label}</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>

                {/* Global error */}
                {errors._ && (
                  <div className="px-4 py-3 border border-bss-border flex items-center gap-2.5">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="#888888" strokeWidth="1.5" strokeLinecap="round">
                      <circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>
                    </svg>
                    <p className="font-body text-xs text-bss-subtle font-light">{errors._}</p>
                  </div>
                )}

                {/* Fields */}
                <div className="grid gap-5">
                  {fields.map((f, idx) => (
                    <div key={f.id}>
                      {/* Label row */}
                      <div className="flex items-center justify-between mb-1.5">
                        {editingLabel === f.id ? (
                          <input
                            autoFocus
                            value={editLabelVal}
                            onChange={e => setEditLabelVal(e.target.value)}
                            onBlur={() => commitLabel(f.id)}
                            onKeyDown={e => { if (e.key === 'Enter') commitLabel(f.id); }}
                            className="font-body text-[11px] text-bss-white bg-transparent border-b border-bss-border outline-none pb-0.5 w-40"
                          />
                        ) : (
                          <button
                            onClick={() => startEditLabel(f)}
                            className="flex items-center gap-1.5 group cursor-pointer bg-transparent border-none p-0"
                          >
                            <span className="font-body text-[11px] text-bss-muted tracking-[0.06em]">
                              {f.label}
                              {f.required && <span className="text-bss-subtle ml-0.5">*</span>}
                            </span>
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
                              stroke="#555555" strokeWidth="1.5" strokeLinecap="round"
                              className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                        )}
                        {/* Remove — only for custom-added fields */}
                        {templateKey === 'custom' || !template.fields.find(tf => tf.id === f.id) ? (
                          idx >= template.fields.length && (
                            <button
                              onClick={() => removeField(f.id)}
                              className="text-bss-muted hover:text-bss-subtle transition-colors bg-transparent border-none cursor-pointer p-0"
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                              </svg>
                            </button>
                          )
                        ) : null}
                      </div>

                      {/* Input */}
                      {f.multiline ? (
                        <textarea
                          value={vals[f.id] ?? ''}
                          onChange={e => setVal(f.id, e.target.value)}
                          placeholder={f.hint ?? `Enter ${f.label.toLowerCase()}`}
                          rows={3}
                          className={`w-full px-3.5 py-2.5 font-body text-[13px] font-light text-bss-offwhite bg-bss-black border outline-none resize-none placeholder:text-bss-muted transition-colors
                            ${errors[f.id] ? 'border-bss-subtle' : 'border-bss-border focus:border-bss-white'}`}
                        />
                      ) : (
                        <input
                          type="text"
                          value={vals[f.id] ?? ''}
                          onChange={e => setVal(f.id, e.target.value)}
                          placeholder={f.hint ?? `Enter ${f.label.toLowerCase()}`}
                          className={`w-full px-3.5 py-2.5 font-body text-[13px] font-light text-bss-offwhite bg-bss-black border outline-none placeholder:text-bss-muted transition-colors
                            ${errors[f.id] ? 'border-bss-subtle' : 'border-bss-border focus:border-bss-white'}`}
                        />
                      )}
                      {errors[f.id] && (
                        <p className="font-body text-[11px] text-bss-subtle mt-1">{errors[f.id]}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add field — for non-url templates */}
                {templateKey !== 'url' && (
                  <button
                    onClick={addField}
                    className="inline-flex items-center gap-2 font-body text-[11px] text-bss-muted tracking-[0.06em] border border-bss-border px-3.5 py-2 cursor-pointer hover:border-bss-subtle hover:text-bss-subtle transition-colors bg-transparent w-fit"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Add field
                  </button>
                )}

                {/* Generate button */}
                <div className="pt-2 border-t border-bss-border">
                  <button
                    onClick={handleGenerate}
                    className="btn-primary"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <rect x="3" y="3" width="7" height="7"/>
                      <rect x="14" y="3" width="7" height="7"/>
                      <rect x="3" y="14" width="7" height="7"/>
                      <path d="M14 14h3v3M17 20h3M20 17v3"/>
                    </svg>
                    Generate QR code
                  </button>
                </div>
              </div>

              {/* ── Right: QR preview ────────────────────────────────── */}
              <div className="lg:sticky lg:top-28 grid gap-4">
                <div className="border border-bss-border bg-bss-card p-6 flex flex-col items-center gap-4">
                  <p className="font-body text-[10px] text-bss-muted tracking-[0.1em] font-medium self-start">PREVIEW</p>

                  {/* QR canvas mount */}
                  <div
                    ref={qrDivRef}
                    className={`transition-opacity duration-300 ${generated ? 'opacity-100' : 'opacity-0'}`}
                    style={{ width: 280, height: 280 }}
                  />

                  {/* Placeholder */}
                  {!generated && (
                    <div className="w-[280px] h-[280px] border border-bss-border flex items-center justify-center -mt-[280px] relative z-10">
                      <p className="font-body text-xs text-bss-muted italic text-center px-6">
                        Fill in the fields and click Generate
                      </p>
                    </div>
                  )}

                  {/* URL label */}
                  {generated && templateKey === 'url' && vals.label?.trim() && (
                    <p className="font-body text-xs text-bss-subtle text-center">{vals.label}</p>
                  )}
                </div>

                {/* Download buttons */}
                {generated && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={downloadPng}
                      className="btn-primary justify-center text-[12px] py-2.5"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      PNG
                    </button>
                    <button
                      onClick={downloadSvg}
                      className="btn-ghost justify-center text-[12px] py-2.5"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      SVG
                    </button>
                  </div>
                )}

                {/* Encoded content preview */}
                {generated && qrContent && (
                  <div className="border border-bss-border px-4 py-3">
                    <p className="font-body text-[10px] text-bss-muted tracking-[0.1em] font-medium mb-1.5">ENCODED</p>
                    <p className="font-body text-[11px] text-bss-subtle font-light whitespace-pre-wrap break-all leading-relaxed">
                      {qrContent.length > 200 ? qrContent.slice(0, 200) + '…' : qrContent}
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ── How it works — only on picker step ─────────────────── */}
          {step === 'pick' && (
            <div className="border-t border-bss-border pt-7 mt-12 max-w-prose">
              <p className="eyebrow mb-5">How it works</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {([
                  ['Pick a template', 'Choose the type of data your QR code will carry.'],
                  ['Fill in the fields', 'Add your details — rename or add fields as needed.'],
                  ['Download', 'Get a 280 × 280 px PNG or an SVG file, ready to use.'],
                ] as const).map(([title, desc]) => (
                  <div key={title}>
                    <p className="font-display text-base font-bold text-bss-white mb-1.5">{title}</p>
                    <p className="font-body text-xs font-light text-bss-subtle leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>
    </>
  );
}