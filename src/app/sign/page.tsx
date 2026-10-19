'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

// ── BSS tokens ────────────────────────────────────────────────────────────────
const T = {
  black:    '#000000',
  surface:  '#0c0c0c',
  card:     '#141414',
  border:   '#222222',
  muted:    '#555555',
  subtle:   '#888888',
  offwhite: '#e8e8e8',
  white:    '#ffffff',
  blue:     '#3b82f6',
  display:  '"Playfair Display", Georgia, serif',
  body:     '"Inter", system-ui, sans-serif',
} as const;

// ── Types ─────────────────────────────────────────────────────────────────────
interface SignatureState {
  dataUrl: string;
  width: number;
  height: number;
  x: number;
  y: number;
}

type Step     = 'upload' | 'sign' | 'place' | 'done';
type SignMode  = 'draw' | 'type';
type PageMode  = 'current' | 'all' | 'select';

// ── Constants ─────────────────────────────────────────────────────────────────
const CURSIVE_FONTS = [
  { label: 'Elegant', family: '"Dancing Script", cursive',  google: 'Dancing+Script:wght@700' },
  { label: 'Classic', family: '"Great Vibes", cursive',     google: 'Great+Vibes' },
  { label: 'Modern',  family: '"Pacifico", cursive',        google: 'Pacifico' },
  { label: 'Formal',  family: '"Pinyon Script", cursive',   google: 'Pinyon+Script' },
];

const INK_SWATCHES = [
  { label: 'Black',     color: '#111111' },
  { label: 'Dark blue', color: '#1a3a6b' },
  { label: 'Dark gray', color: '#444444' },
];

const SAVED_SIG_KEY = 'bss_saved_signature';

// ── Helpers ───────────────────────────────────────────────────────────────────
function eyebrow(label: string) {
  return (
    <p style={{
      fontFamily: T.body, fontSize: 10, fontWeight: 500,
      letterSpacing: '0.18em', textTransform: 'uppercase',
      color: T.muted, margin: '0 0 12px',
    }}>
      {label}
    </p>
  );
}

function Toggle({
  checked, onChange, label,
}: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 36, height: 20, borderRadius: 10, position: 'relative',
          background: checked ? T.subtle : T.border,
          transition: 'background 0.2s', flexShrink: 0,
        }}
      >
        <div style={{
          position: 'absolute', top: 3, left: checked ? 19 : 3,
          width: 14, height: 14, borderRadius: '50%',
          background: T.white, transition: 'left 0.2s',
        }} />
      </div>
      <span style={{ fontFamily: T.body, fontSize: 12, color: T.subtle }}>{label}</span>
    </label>
  );
}

function Btn({
  children, onClick, ghost = false, disabled = false, small = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  ghost?: boolean;
  disabled?: boolean;
  small?: boolean;
}) {
  const [hov, setHov] = useState(false);
  const pad = small ? '7px 14px' : '11px 28px';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: pad,
        background: ghost ? 'transparent' : disabled ? T.border : hov ? T.offwhite : T.white,
        color: ghost ? (disabled ? T.muted : hov ? T.white : T.subtle) : T.black,
        fontFamily: T.body, fontSize: small ? 11 : 13, fontWeight: 500,
        letterSpacing: '0.04em',
        border: ghost ? `1px solid ${disabled ? T.border : hov ? T.white : T.border}` : 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background 0.15s, color 0.15s, border-color 0.15s',
      }}
    >
      {children}
    </button>
  );
}

// ── Step indicator ────────────────────────────────────────────────────────────
function Steps({ current }: { current: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: 'upload', label: 'Upload' },
    { key: 'sign',   label: 'Sign'   },
    { key: 'place',  label: 'Place'  },
    { key: 'done',   label: 'Done'   },
  ];
  const idx = steps.findIndex(s => s.key === current);
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 36 }}>
      {steps.map((s, i) => (
        <div key={s.key} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 22, height: 22,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${i <= idx ? T.white : T.border}`,
              background: i < idx ? T.white : 'transparent',
            }}>
              {i < idx ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                  stroke={T.black} strokeWidth="2.5" strokeLinecap="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              ) : (
                <span style={{ fontSize: 9, fontFamily: T.body, fontWeight: 500, color: i === idx ? T.white : T.muted }}>
                  {i + 1}
                </span>
              )}
            </div>
            <span style={{
              fontSize: 11, fontFamily: T.body, fontWeight: i === idx ? 500 : 300,
              color: i === idx ? T.white : i < idx ? T.subtle : T.muted,
              letterSpacing: '0.06em',
            }}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ width: 32, height: 1, background: T.border, margin: '0 12px' }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Live signature preview ────────────────────────────────────────────────────
function SigPreview({ dataUrl }: { dataUrl: string | null }) {
  return (
    <div style={{
      border: `1px solid ${T.border}`, background: T.card,
      padding: '12px 16px', minHeight: 72,
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <p style={{ fontFamily: T.body, fontSize: 10, color: T.muted, margin: 0, letterSpacing: '0.1em', fontWeight: 500 }}>
        PREVIEW
      </p>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', minHeight: 60 }}>
        {dataUrl ? (
          <img src={dataUrl} alt="Signature preview"
            style={{ maxHeight: 60, maxWidth: '100%', objectFit: 'contain' }} />
        ) : (
          <p style={{ fontFamily: T.body, fontSize: 11, color: T.muted, margin: 0, fontStyle: 'italic' }}>
            Your signature will appear here as you draw
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SignPage() {
  const [step, setStep]             = useState<Step>('upload');
  const [signMode, setSignMode]     = useState<SignMode>('draw');
  const [pdfFile, setPdfFile]       = useState<File | null>(null);
  const [pdfBytes, setPdfBytes]     = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount]   = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sig, setSig]               = useState<SignatureState | null>(null);
  const [dragging, setDragging]     = useState(false);
  const [resizing, setResizing]     = useState(false);
  const [sigPos, setSigPos]         = useState({ x: 60, y: 60 });
  const [sigSize, setSigSize]       = useState({ w: 180, h: 72 });
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [outputUrl, setOutputUrl]   = useState('');
  const [outputName, setOutputName] = useState('');

  // Draw mode
  const [inkColor, setInkColor]           = useState(INK_SWATCHES[0].color);
  const [customInk, setCustomInk]         = useState('#111111');
  const [livePreviewUrl, setLivePreviewUrl] = useState<string | null>(null);
  const [savedSig, setSavedSig]           = useState<string | null>(null);
  const previewThrottle = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Type mode
  const [typedName, setTypedName]       = useState('');
  const [selectedFont, setSelectedFont] = useState(0);
  const typePreviewRef                  = useRef<HTMLCanvasElement>(null);

  // Placement options
  const [pageMode, setPageMode]           = useState<PageMode>('current');
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [zoomLevel, setZoomLevel]         = useState(1);
  const [pdfScale, setPdfScale]           = useState(1.5);

  // Stamp options
  const [showStamp, setShowStamp]   = useState(false);
  const [stampName, setStampName]   = useState('');
  const [stampDate, setStampDate]   = useState(true);
  const [stampText, setStampText]   = useState('');

  const sigPadRef    = useRef<any>(null);
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const dropRef      = useRef<HTMLDivElement>(null);
  const dragOff      = useRef({ x: 0, y: 0 });
  const resizeStart  = useRef({ mx: 0, my: 0, w: 0, h: 0 });
  const pdfJsRef     = useRef<any>(null);
  const pdfDocRef    = useRef<any>(null);

  // ── Inject global styles (client-side only) ────────────────────────────────
  useEffect(() => {
    const id = 'sign-page-styles';
    if (document.getElementById(id)) return;
    const el = document.createElement('style');
    el.id = id;
    el.textContent = `
      .bss-drop-active { border-color: #ffffff !important; }
      .sig-handle {
        position: absolute; bottom: -6px; right: -6px;
        width: 16px; height: 16px;
        background: #ffffff; cursor: se-resize;
        border: 1px solid #000000; touch-action: none;
      }
      .sig-overlay { position: absolute; cursor: grab; user-select: none; touch-action: none; }
      .sig-overlay:active { cursor: grabbing; }
      .page-chip {
        display: inline-flex; align-items: center; justify-content: center;
        width: 30px; height: 30px; font-size: 11px;
        font-family: "Inter", system-ui, sans-serif;
        border: 1px solid #222222; cursor: pointer;
        transition: background 0.12s, border-color 0.12s, color 0.12s;
        background: transparent; color: #555555;
      }
      .page-chip.selected { background: #ffffff; border-color: #ffffff; color: #000000; }
    `;
    document.head.appendChild(el);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  // ── Load Google Fonts ──────────────────────────────────────────────────────
  useEffect(() => {
    CURSIVE_FONTS.forEach(f => {
      const url = `https://fonts.googleapis.com/css2?family=${f.google}&display=swap`;
      if (document.querySelector(`link[href="${url}"]`)) return;
      const link = document.createElement('link');
      link.rel = 'stylesheet'; link.href = url;
      document.head.appendChild(link);
    });
  }, []);

  // ── Load pdf.js ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as any).pdfjsLib) { pdfJsRef.current = (window as any).pdfjsLib; return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    s.onload = () => {
      const lib = (window as any).pdfjsLib;
      lib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      pdfJsRef.current = lib;
    };
    document.head.appendChild(s);
  }, []);

  // ── Load saved signature from localStorage ─────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVED_SIG_KEY);
      if (saved) setSavedSig(saved);
    } catch {}
  }, []);

  // ── Init signature pad ─────────────────────────────────────────────────────
  useEffect(() => {
    if (step !== 'sign' || signMode !== 'draw' || !sigCanvasRef.current) return;
    const init = () => {
      const SP = (window as any).SignaturePad;
      if (!SP || !sigCanvasRef.current) return;
      const canvas = sigCanvasRef.current;
      const ratio  = window.devicePixelRatio || 1;
      canvas.width  = canvas.offsetWidth  * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext('2d')!.scale(ratio, ratio);
      const pad = new SP(canvas, {
        backgroundColor: 'rgba(0,0,0,0)',
        penColor: inkColor,
        minWidth: 1.2, maxWidth: 2.8,
      });
      pad.addEventListener('afterUpdateStroke', () => {
        if (previewThrottle.current) clearTimeout(previewThrottle.current);
        previewThrottle.current = setTimeout(() => {
          setLivePreviewUrl(pad.isEmpty() ? null : pad.toDataURL('image/png'));
        }, 120);
      });
      sigPadRef.current = pad;
    };
    if ((window as any).SignaturePad) { setTimeout(init, 50); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/signature_pad/4.1.7/signature_pad.umd.min.js';
    s.onload = () => setTimeout(init, 50);
    document.head.appendChild(s);
  }, [step, signMode, inkColor]);

  // ── Update pen color live ──────────────────────────────────────────────────
  useEffect(() => {
    if (sigPadRef.current) sigPadRef.current.penColor = inkColor;
  }, [inkColor]);

  // ── Render type-preview canvas ─────────────────────────────────────────────
  useEffect(() => {
    if (signMode !== 'type' || !typePreviewRef.current) return;
    const canvas = typePreviewRef.current;
    const ctx = canvas.getContext('2d')!;
    const font = CURSIVE_FONTS[selectedFont];
    const ratio = window.devicePixelRatio || 1;
    canvas.width  = canvas.offsetWidth  * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    ctx.scale(ratio, ratio);
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    if (!typedName.trim()) return;
    const fontSize = Math.min(64, Math.max(28, Math.floor(canvas.offsetWidth / (typedName.length * 0.7))));
    ctx.font = `${fontSize}px ${font.family}`;
    ctx.fillStyle = inkColor;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText(typedName, 20, canvas.offsetHeight / 2 / ratio);
  }, [typedName, selectedFont, signMode, inkColor]);

  // ── Render PDF page ────────────────────────────────────────────────────────
  const renderPage = useCallback(async (pageNum: number, scale: number) => {
    if (!pdfDocRef.current || !pdfCanvasRef.current) return;
    const page     = await pdfDocRef.current.getPage(pageNum);
    const canvas   = pdfCanvasRef.current;
    const viewport = page.getViewport({ scale });
    canvas.width   = viewport.width;
    canvas.height  = viewport.height;
    canvas.style.width  = '100%';
    canvas.style.height = 'auto';
    await page.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise;
  }, []);

  useEffect(() => {
    if (step === 'place' && pdfDocRef.current) renderPage(currentPage, pdfScale);
  }, [step, currentPage, pdfScale, renderPage]);

  // ── File upload ────────────────────────────────────────────────────────────
  async function handleFile(file: File) {
    if (!file.type.includes('pdf')) { setError('Only PDF files are supported.'); return; }
    setError(''); setLoading(true);
    try {
      const buf = await file.arrayBuffer();
      setPdfBytes(buf); setPdfFile(file);
      await new Promise<void>(res => {
        const check = setInterval(() => { if (pdfJsRef.current) { clearInterval(check); res(); } }, 100);
      });
      const doc = await pdfJsRef.current.getDocument({ data: buf.slice(0) }).promise;
      pdfDocRef.current = doc;
      setPageCount(doc.numPages);
      setCurrentPage(1);
      setSelectedPages(new Set());
      setStep('sign');
    } catch { setError('Could not read the PDF. Please try another file.'); }
    setLoading(false);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  // ── Trim canvas PNG ────────────────────────────────────────────────────────
  function trimCanvasToPng(dataUrl: string): Promise<{ url: string; aspect: number }> {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const off = document.createElement('canvas');
        off.width = img.width; off.height = img.height;
        const ctx = off.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        const px = ctx.getImageData(0, 0, off.width, off.height).data;
        let minX = off.width, maxX = 0, minY = off.height, maxY = 0;
        for (let y = 0; y < off.height; y++) {
          for (let x = 0; x < off.width; x++) {
            if (px[(y * off.width + x) * 4 + 3] > 10) {
              if (x < minX) minX = x; if (x > maxX) maxX = x;
              if (y < minY) minY = y; if (y > maxY) maxY = y;
            }
          }
        }
        const pad = 10;
        minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad);
        maxX = Math.min(off.width, maxX + pad); maxY = Math.min(off.height, maxY + pad);
        const trimW = maxX - minX || off.width;
        const trimH = maxY - minY || off.height;
        const trim = document.createElement('canvas');
        trim.width = trimW; trim.height = trimH;
        trim.getContext('2d')!.drawImage(off, minX, minY, trimW, trimH, 0, 0, trimW, trimH);
        resolve({ url: trim.toDataURL('image/png'), aspect: trimW / trimH });
      };
      img.src = dataUrl;
    });
  }

  // ── Confirm drawn signature ────────────────────────────────────────────────
  async function confirmDrawSig() {
    const pad = sigPadRef.current;
    if (!pad || pad.isEmpty()) { setError('Draw your signature first.'); return; }
    setError('');
    const { url, aspect } = await trimCanvasToPng(pad.toDataURL('image/png'));
    const dispH = 72, dispW = Math.round(dispH * aspect);
    setSig({ dataUrl: url, width: dispW, height: dispH, x: 0, y: 0 });
    setSigPos({ x: 60, y: 60 }); setSigSize({ w: dispW, h: dispH });
    try { localStorage.setItem(SAVED_SIG_KEY, url); setSavedSig(url); } catch {}
    setStep('place');
  }

  // ── Use saved signature ────────────────────────────────────────────────────
  async function useSavedSig() {
    if (!savedSig) return;
    const { aspect } = await trimCanvasToPng(savedSig);
    const dispH = 72, dispW = Math.round(dispH * aspect);
    setSig({ dataUrl: savedSig, width: dispW, height: dispH, x: 0, y: 0 });
    setSigPos({ x: 60, y: 60 }); setSigSize({ w: dispW, h: dispH });
    setStep('place');
  }

  // ── Confirm typed signature ────────────────────────────────────────────────
  async function confirmTypeSig() {
    if (!typedName.trim()) { setError('Type your name first.'); return; }
    setError('');
    if (!typePreviewRef.current) return;
    const { url, aspect } = await trimCanvasToPng(typePreviewRef.current.toDataURL('image/png'));
    const dispH = 72, dispW = Math.round(dispH * aspect);
    setSig({ dataUrl: url, width: dispW, height: dispH, x: 0, y: 0 });
    setSigPos({ x: 60, y: 60 }); setSigSize({ w: dispW, h: dispH });
    setStep('place');
  }

  // ── Pointer drag ──────────────────────────────────────────────────────────
  function onSigPointerDown(e: React.PointerEvent) {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const rect = pdfCanvasRef.current!.getBoundingClientRect();
    dragOff.current = { x: e.clientX - rect.left - sigPos.x, y: e.clientY - rect.top - sigPos.y };
    setDragging(true);
  }
  function onSigPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const rect = pdfCanvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setSigPos({
      x: Math.max(0, Math.min(e.clientX - rect.left - dragOff.current.x, rect.width  - sigSize.w)),
      y: Math.max(0, Math.min(e.clientY - rect.top  - dragOff.current.y, rect.height - sigSize.h)),
    });
  }
  function onSigPointerUp() { setDragging(false); }

  // ── Pointer resize ────────────────────────────────────────────────────────
  function onResizePointerDown(e: React.PointerEvent) {
    e.preventDefault(); e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    resizeStart.current = { mx: e.clientX, my: e.clientY, w: sigSize.w, h: sigSize.h };
    setResizing(true);
  }
  function onResizePointerMove(e: React.PointerEvent) {
    if (!resizing) return;
    const aspect = sig ? sig.width / sig.height : 1;
    const nw = Math.max(60, resizeStart.current.w + (e.clientX - resizeStart.current.mx));
    setSigSize({ w: nw, h: Math.round(nw / aspect) });
  }
  function onResizePointerUp() { setResizing(false); }

  // ── Zoom ──────────────────────────────────────────────────────────────────
  function handleZoom(dir: 'in' | 'out') {
    const next = dir === 'in' ? Math.min(zoomLevel + 0.25, 3) : Math.max(zoomLevel - 0.25, 0.5);
    setZoomLevel(next);
    setPdfScale(1.5 * next);
  }

  // ── Build stamp text ──────────────────────────────────────────────────────
  function buildStampLines(): string[] {
    const lines: string[] = [];
    if (stampName.trim()) lines.push(stampName.trim());
    if (stampDate) lines.push(new Date().toLocaleDateString());
    if (stampText.trim()) lines.push(stampText.trim());
    return lines;
  }

  // ── Embed signature (multi-page aware + stamp) ────────────────────────────
  async function handleEmbed() {
    if (!pdfBytes || !sig) return;
    setLoading(true); setError('');
    try {
      if (!(window as any).PDFLib) {
        await new Promise<void>((res, rej) => {
          const s = document.createElement('script');
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
          s.onload = () => res(); s.onerror = () => rej(new Error('pdf-lib load failed'));
          document.head.appendChild(s);
        });
      }
      const { PDFDocument, rgb, StandardFonts } = (window as any).PDFLib;
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages  = pdfDoc.getPages();

      // Determine which pages to stamp
      let targetPages: number[];
      if (pageMode === 'all') {
        targetPages = pages.map((_: any, i: number) => i);
      } else if (pageMode === 'select') {
        targetPages = [...selectedPages].map(p => p - 1);
      } else {
        targetPages = [currentPage - 1];
      }

      const sigRes  = await fetch(sig.dataUrl);
      const sigBuf  = await sigRes.arrayBuffer();
      const pngImg  = await pdfDoc.embedPng(sigBuf);
      const helv    = showStamp && buildStampLines().length > 0
        ? await pdfDoc.embedFont(StandardFonts.Helvetica)
        : null;

      const canvasEl = pdfCanvasRef.current!;
      const dispW    = canvasEl.clientWidth;
      const dispH    = canvasEl.clientHeight;

      for (const pi of targetPages) {
        const page = pages[pi];
        const { width: pW, height: pH } = page.getSize();
        const scaleX = pW / dispW, scaleY = pH / dispH;

        const pdfX = sigPos.x * scaleX;
        const pdfY = pH - (sigPos.y * scaleY) - (sigSize.h * scaleY);
        const pdfW = sigSize.w * scaleX;
        const pdfH = sigSize.h * scaleY;
        page.drawImage(pngImg, { x: pdfX, y: pdfY, width: pdfW, height: pdfH });

        // Stamp text below signature
        if (helv && buildStampLines().length > 0) {
          const stampLines = buildStampLines();
          const fontSize = 8;
          let ty = pdfY - 4;
          const [r, g, b] = hexToRgb(inkColor);
          for (const line of stampLines) {
            ty -= fontSize + 2;
            page.drawText(line, { x: pdfX, y: ty, size: fontSize, font: helv, color: rgb(r, g, b) });
          }
        }
      }

      const outBytes = await pdfDoc.save();
      const blob = new Blob([outBytes], { type: 'application/pdf' });
      const url  = URL.createObjectURL(blob);
      const name = pdfFile ? pdfFile.name.replace(/\.pdf$/i, '_signed.pdf') : 'signed.pdf';
      setOutputUrl(url); setOutputName(name); setStep('done');
    } catch (err: any) {
      setError(err.message || 'Failed to embed signature.');
    }
    setLoading(false);
  }

  // ── Reset ──────────────────────────────────────────────────────────────────
  function reset() {
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    setStep('upload'); setPdfFile(null); setPdfBytes(null);
    setSig(null); setOutputUrl(''); setOutputName('');
    setError(''); setPageCount(0); pdfDocRef.current = null;
    setLivePreviewUrl(null); setTypedName('');
    setPageMode('current'); setSelectedPages(new Set());
    setZoomLevel(1); setPdfScale(1.5);
    setShowStamp(false); setStampName(''); setStampDate(true); setStampText('');
  }

  // ── hex → rgb 0–1 ─────────────────────────────────────────────────────────
  function hexToRgb(hex: string): [number, number, number] {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return [r, g, b];
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <>
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 36 }}>
        {eyebrow('Tools')}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <h1 style={{
            fontFamily: T.display, fontWeight: 700,
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: T.white, lineHeight: 1.05, letterSpacing: '-0.025em', margin: 0,
          }}>
            Sign Document
          </h1>
          {step !== 'upload' && (
            <button onClick={reset} style={{
              fontFamily: T.body, fontSize: 11, color: T.muted,
              background: 'none', border: 'none', cursor: 'pointer',
              letterSpacing: '0.08em', padding: 0,
            }}>
              ← Start over
            </button>
          )}
        </div>
        <p style={{
          fontFamily: T.body, fontWeight: 300, fontSize: '0.9375rem',
          color: T.subtle, lineHeight: 1.7, marginTop: 12, maxWidth: '52ch',
        }}>
          Upload a PDF, draw or type your signature, drag it into position, and download — all in your browser.
        </p>
        <div style={{ marginTop: 20, height: 1, background: T.border }} />
      </div>

      <Steps current={step} />

      {/* ── Error banner ────────────────────────────────────────────────── */}
      {error && (
        <div style={{
          marginBottom: 24, padding: '12px 16px',
          border: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke={T.subtle} strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>
          </svg>
          <p style={{ fontFamily: T.body, fontSize: 12, color: T.subtle, margin: 0, fontWeight: 300 }}>
            {error}
          </p>
        </div>
      )}

      {/* ══ STEP 1 — Upload ═════════════════════════════════════════════ */}
      {step === 'upload' && (
        <>
          <div
            ref={dropRef}
            onDragOver={e => { e.preventDefault(); dropRef.current?.classList.add('bss-drop-active'); }}
            onDragLeave={() => dropRef.current?.classList.remove('bss-drop-active')}
            onDrop={e => { dropRef.current?.classList.remove('bss-drop-active'); onDrop(e); }}
            style={{
              border: `1px solid ${T.border}`,
              padding: '64px 32px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 20, cursor: 'pointer', transition: 'border-color 0.15s', textAlign: 'center',
            }}
            onClick={() => document.getElementById('pdf-input')?.click()}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
              stroke={T.muted} strokeWidth="1" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
            <div>
              <p style={{ fontFamily: T.display, fontSize: '1.1rem', fontWeight: 700, color: T.white, margin: '0 0 6px' }}>
                Drop a PDF here
              </p>
              <p style={{ fontFamily: T.body, fontSize: 12, color: T.muted, fontWeight: 300, margin: 0 }}>
                or click to browse — PDF files only
              </p>
            </div>
            {loading && (
              <p style={{ fontFamily: T.body, fontSize: 11, color: T.subtle, letterSpacing: '0.1em' }}>
                Loading…
              </p>
            )}
          </div>

          {/* Privacy note */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke={T.muted} strokeWidth="1.5" strokeLinecap="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <p style={{ fontFamily: T.body, fontSize: 11, color: T.muted, fontWeight: 300, margin: 0 }}>
              Your PDF never leaves your browser. All processing is local.
            </p>
          </div>
        </>
      )}
      <input
        id="pdf-input" type="file" accept=".pdf,application/pdf"
        style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />

      {/* ══ STEP 2 — Sign ═══════════════════════════════════════════════ */}
      {step === 'sign' && (
        <div style={{ display: 'grid', gap: 20 }}>

          {/* ── Ink color ─────────────────────────────────────────────── */}
          <div>
            <p style={{ fontFamily: T.body, fontSize: 11, color: T.muted, margin: '0 0 10px', letterSpacing: '0.06em' }}>
              Ink color
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {INK_SWATCHES.map(sw => (
                <button
                  key={sw.color}
                  onClick={() => setInkColor(sw.color)}
                  title={sw.label}
                  style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: sw.color,
                    border: inkColor === sw.color ? `2px solid ${T.white}` : `2px solid transparent`,
                    cursor: 'pointer', outline: 'none',
                    boxShadow: inkColor === sw.color ? '0 0 0 1px #555' : 'none',
                    transition: 'border-color 0.15s',
                  }}
                />
              ))}
              {/* Custom color */}
              <div style={{ position: 'relative', width: 28, height: 28 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: `conic-gradient(red, yellow, lime, cyan, blue, magenta, red)`,
                  border: !INK_SWATCHES.find(s => s.color === inkColor) ? `2px solid ${T.white}` : `2px solid transparent`,
                  boxShadow: !INK_SWATCHES.find(s => s.color === inkColor) ? '0 0 0 1px #555' : 'none',
                  cursor: 'pointer',
                }} />
                <input
                  type="color"
                  value={customInk}
                  onChange={e => { setCustomInk(e.target.value); setInkColor(e.target.value); }}
                  title="Custom color"
                  style={{
                    position: 'absolute', inset: 0, opacity: 0,
                    cursor: 'pointer', width: '100%', height: '100%',
                  }}
                />
              </div>
              <span style={{ fontFamily: T.body, fontSize: 11, color: T.muted, marginLeft: 4 }}>
                {INK_SWATCHES.find(s => s.color === inkColor)?.label ?? 'Custom'}
              </span>
            </div>
          </div>

          {/* ── Mode tabs + panels ─────────────────────────────────────── */}
          <div style={{ border: `1px solid ${T.border}` }}>
            <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}` }}>
              {(['draw', 'type'] as SignMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => { setSignMode(mode); setError(''); }}
                  style={{
                    flex: 1, padding: '9px 0',
                    fontFamily: T.body, fontSize: 12, fontWeight: 500,
                    letterSpacing: '0.05em',
                    background: signMode === mode ? T.card : 'transparent',
                    color: signMode === mode ? T.white : T.muted,
                    border: 'none',
                    borderRight: mode === 'draw' ? `1px solid ${T.border}` : 'none',
                    cursor: 'pointer', transition: 'color 0.15s, background 0.15s',
                  }}
                >
                  {mode === 'draw' ? 'Draw' : 'Type'}
                </button>
              ))}
            </div>

            {/* ── Draw panel ────────────────────────────────────────── */}
            {signMode === 'draw' && (
              <div style={{ padding: 16, display: 'grid', gap: 16 }}>
                {/* Saved signature shortcut */}
                {savedSig && (
                  <div style={{
                    border: `1px solid ${T.border}`, padding: '10px 14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                    flexWrap: 'wrap',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img src={savedSig} alt="Saved signature"
                        style={{ height: 32, maxWidth: 120, objectFit: 'contain', opacity: 0.8 }} />
                      <span style={{ fontFamily: T.body, fontSize: 11, color: T.muted }}>
                        Saved signature
                      </span>
                    </div>
                    <Btn small onClick={useSavedSig}>
                      Use saved
                    </Btn>
                  </div>
                )}

                <div>
                  <p style={{ fontFamily: T.body, fontSize: 11, color: T.muted, margin: '0 0 10px', letterSpacing: '0.06em' }}>
                    Draw your signature
                  </p>
                  <div style={{ position: 'relative', border: `1px solid ${T.border}`, background: T.card }}>
                    <canvas
                      ref={sigCanvasRef}
                      style={{ display: 'block', width: '100%', height: 160, touchAction: 'none' }}
                    />
                    {!livePreviewUrl && (
                      <div style={{
                        position: 'absolute', inset: 0, display: 'flex',
                        alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
                      }}>
                        <p style={{ fontFamily: T.body, fontSize: 11, color: T.muted, opacity: 0.5, letterSpacing: '0.08em' }}>
                          Sign here
                        </p>
                      </div>
                    )}
                  </div>
                  <div style={{ height: 1, background: T.border }} />
                </div>

                <SigPreview dataUrl={livePreviewUrl} />

                <div style={{ display: 'flex', gap: 10 }}>
                  <Btn onClick={confirmDrawSig}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Use this signature
                  </Btn>
                  <Btn ghost onClick={() => { sigPadRef.current?.clear(); setLivePreviewUrl(null); }}>
                    Clear
                  </Btn>
                </div>
              </div>
            )}

            {/* ── Type panel ────────────────────────────────────────── */}
            {signMode === 'type' && (
              <div style={{ padding: 16, display: 'grid', gap: 16 }}>
                <div>
                  <p style={{ fontFamily: T.body, fontSize: 11, color: T.muted, margin: '0 0 10px', letterSpacing: '0.06em' }}>
                    Type your name
                  </p>
                  <input
                    type="text"
                    value={typedName}
                    onChange={e => setTypedName(e.target.value)}
                    placeholder="Your full name"
                    style={{
                      width: '100%', boxSizing: 'border-box', padding: '10px 14px',
                      background: T.card, border: `1px solid ${T.border}`,
                      color: T.white, fontFamily: T.body, fontSize: 14, outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <p style={{ fontFamily: T.body, fontSize: 11, color: T.muted, margin: '0 0 10px', letterSpacing: '0.06em' }}>
                    Choose a style
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {CURSIVE_FONTS.map((f, i) => (
                      <button
                        key={f.label}
                        onClick={() => setSelectedFont(i)}
                        style={{
                          padding: '12px 16px',
                          background: selectedFont === i ? T.card : 'transparent',
                          border: `1px solid ${selectedFont === i ? T.white : T.border}`,
                          cursor: 'pointer', display: 'flex', flexDirection: 'column',
                          alignItems: 'flex-start', gap: 4, transition: 'border-color 0.15s',
                        }}
                      >
                        <span style={{ fontFamily: T.body, fontSize: 10, color: T.muted, letterSpacing: '0.1em' }}>
                          {f.label}
                        </span>
                        <span style={{ fontFamily: f.family, fontSize: 22, color: inkColor, lineHeight: 1.2 }}>
                          {typedName || 'Your name'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Off-screen canvas for rasterizing typed sig */}
                <canvas ref={typePreviewRef}
                  style={{ display: 'block', width: '100%', height: 100, visibility: 'hidden', position: 'absolute' }}
                />

                {/* Preview */}
                <div style={{
                  border: `1px solid ${T.border}`, background: T.card,
                  padding: '12px 16px', minHeight: 72, display: 'flex', flexDirection: 'column', gap: 8,
                }}>
                  <p style={{ fontFamily: T.body, fontSize: 10, color: T.muted, margin: 0, letterSpacing: '0.1em', fontWeight: 500 }}>
                    PREVIEW
                  </p>
                  {typedName.trim() ? (
                    <span style={{ fontFamily: CURSIVE_FONTS[selectedFont].family, fontSize: 40, color: inkColor, lineHeight: 1.3 }}>
                      {typedName}
                    </span>
                  ) : (
                    <p style={{ fontFamily: T.body, fontSize: 11, color: T.muted, margin: 0, fontStyle: 'italic' }}>
                      Type your name above to see a preview
                    </p>
                  )}
                </div>

                <Btn onClick={confirmTypeSig}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Use this signature
                </Btn>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ STEP 3 — Place ══════════════════════════════════════════════ */}
      {step === 'place' && sig && (
        <div style={{ display: 'grid', gap: 20 }}>

          {/* ── Page navigation + zoom ─────────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {pageCount > 1 && (
              <>
                <Btn ghost small onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>← Prev</Btn>
                <span style={{ fontFamily: T.body, fontSize: 11, color: T.muted }}>
                  Page {currentPage} / {pageCount}
                </span>
                <Btn ghost small onClick={() => setCurrentPage(p => Math.min(pageCount, p + 1))} disabled={currentPage === pageCount}>Next →</Btn>
                <div style={{ width: 1, height: 16, background: T.border, margin: '0 4px' }} />
              </>
            )}
            {/* Zoom */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Btn ghost small onClick={() => handleZoom('out')} disabled={zoomLevel <= 0.5}>−</Btn>
              <span style={{ fontFamily: T.body, fontSize: 11, color: T.muted, minWidth: 36, textAlign: 'center' }}>
                {Math.round(zoomLevel * 100)}%
              </span>
              <Btn ghost small onClick={() => handleZoom('in')} disabled={zoomLevel >= 3}>+</Btn>
            </div>
          </div>

          {/* ── Multi-page placement mode ──────────────────────────── */}
          {pageCount > 1 && (
            <div style={{ border: `1px solid ${T.border}`, padding: '14px 16px', display: 'grid', gap: 12 }}>
              <p style={{ fontFamily: T.body, fontSize: 11, color: T.muted, margin: 0, letterSpacing: '0.06em' }}>
                Apply signature to
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {([
                  { key: 'current', label: 'This page only' },
                  { key: 'all',     label: 'All pages' },
                  { key: 'select',  label: 'Select pages' },
                ] as { key: PageMode; label: string }[]).map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setPageMode(opt.key)}
                    style={{
                      padding: '6px 14px', fontFamily: T.body, fontSize: 11, fontWeight: 500,
                      background: pageMode === opt.key ? T.white : 'transparent',
                      color: pageMode === opt.key ? T.black : T.muted,
                      border: `1px solid ${pageMode === opt.key ? T.white : T.border}`,
                      cursor: 'pointer', transition: 'all 0.12s',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Page chip picker */}
              {pageMode === 'select' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map(p => {
                    const sel = selectedPages.has(p);
                    return (
                      <button
                        key={p}
                        className={`page-chip${sel ? ' selected' : ''}`}
                        onClick={() => {
                          const next = new Set(selectedPages);
                          sel ? next.delete(p) : next.add(p);
                          setSelectedPages(next);
                        }}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Date/name stamp ───────────────────────────────────────── */}
          <div style={{ border: `1px solid ${T.border}`, padding: '14px 16px', display: 'grid', gap: 12 }}>
            <Toggle checked={showStamp} onChange={setShowStamp} label="Add text stamp below signature" />
            {showStamp && (
              <div style={{ display: 'grid', gap: 10, paddingTop: 4 }}>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={stampName}
                    onChange={e => setStampName(e.target.value)}
                    placeholder="Name (optional)"
                    style={{
                      flex: 1, minWidth: 140, padding: '7px 12px',
                      background: T.card, border: `1px solid ${T.border}`,
                      color: T.white, fontFamily: T.body, fontSize: 12, outline: 'none',
                    }}
                  />
                  <input
                    type="text"
                    value={stampText}
                    onChange={e => setStampText(e.target.value)}
                    placeholder={'"Signed" or custom text'}
                    style={{
                      flex: 1, minWidth: 140, padding: '7px 12px',
                      background: T.card, border: `1px solid ${T.border}`,
                      color: T.white, fontFamily: T.body, fontSize: 12, outline: 'none',
                    }}
                  />
                </div>
                <Toggle checked={stampDate} onChange={setStampDate} label={`Include today's date (${new Date().toLocaleDateString()})`} />
                {buildStampLines().length > 0 && (
                  <div style={{ padding: '8px 12px', background: T.card, border: `1px solid ${T.border}` }}>
                    {buildStampLines().map((l, i) => (
                      <p key={i} style={{ fontFamily: T.body, fontSize: 11, color: T.subtle, margin: '1px 0' }}>{l}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── PDF canvas with overlay ─────────────────────────────── */}
          <div style={{ position: 'relative', border: `1px solid ${T.border}`, lineHeight: 0, overflow: 'hidden' }}>
            <canvas ref={pdfCanvasRef} style={{ display: 'block', width: '100%', height: 'auto' }} />
            <div
              className="sig-overlay"
              onPointerDown={onSigPointerDown}
              onPointerMove={onSigPointerMove}
              onPointerUp={onSigPointerUp}
              style={{ left: sigPos.x, top: sigPos.y, width: sigSize.w, height: sigSize.h, outline: `1px dashed ${T.muted}` }}
            >
              <img src={sig.dataUrl} draggable={false} alt="signature"
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', pointerEvents: 'none' }} />
              <div
                className="sig-handle"
                onPointerDown={onResizePointerDown}
                onPointerMove={onResizePointerMove}
                onPointerUp={onResizePointerUp}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: T.body, fontSize: 11, color: T.muted, fontWeight: 300 }}>
              {sigSize.w} × {sigSize.h} px · {Math.round(sigPos.x)}, {Math.round(sigPos.y)}
              {pageMode === 'all' && <span style={{ marginLeft: 8, color: T.subtle }}>All {pageCount} pages</span>}
              {pageMode === 'select' && selectedPages.size > 0 && (
                <span style={{ marginLeft: 8, color: T.subtle }}>{selectedPages.size} page{selectedPages.size !== 1 ? 's' : ''}</span>
              )}
            </span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
              <Btn ghost onClick={() => setStep('sign')}>Redraw</Btn>
              <Btn
                onClick={handleEmbed}
                disabled={loading || (pageMode === 'select' && selectedPages.size === 0)}
              >
                {loading ? 'Embedding…' : 'Stamp & Download'}
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* ══ STEP 4 — Done ═══════════════════════════════════════════════ */}
      {step === 'done' && (
        <div style={{ display: 'grid', gap: 24 }}>
          <div style={{ padding: '20px', border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 14 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke={T.white} strokeWidth="1.5" strokeLinecap="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            <div>
              <p style={{ fontFamily: T.display, fontSize: '1rem', fontWeight: 700, color: T.white, margin: '0 0 3px' }}>
                Signature embedded
              </p>
              <p style={{ fontFamily: T.body, fontSize: 12, color: T.subtle, fontWeight: 300, margin: 0 }}>
                Your signed PDF is ready to download.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a
              href={outputUrl} download={outputName}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '11px 28px', background: T.white, color: T.black,
                fontFamily: T.body, fontSize: 13, fontWeight: 500, letterSpacing: '0.04em',
                textDecoration: 'none',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download {outputName}
            </a>
            <Btn ghost onClick={reset}>Sign another document</Btn>
          </div>
        </div>
      )}

      {/* ── How it works ─────────────────────────────────────────────── */}
      {step === 'upload' && (
        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 28, marginTop: 40 }}>
          <p style={{
            fontFamily: T.body, fontSize: 10, fontWeight: 500,
            letterSpacing: '0.16em', textTransform: 'uppercase', color: T.muted, marginBottom: 20,
          }}>
            How it works
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24 }}>
            {([
              ['Upload',   'Drop any PDF — it never leaves your device.'],
              ['Sign',     'Draw with your finger or type your name.'],
              ['Place',    'Drag to position, resize, pick pages, add a stamp.'],
              ['Download', 'The signed PDF is generated and saved locally.'],
            ] as const).map(([title, desc]) => (
              <div key={title}>
                <p style={{ fontFamily: T.display, fontSize: '1rem', fontWeight: 700, color: T.white, margin: '0 0 6px' }}>
                  {title}
                </p>
                <p style={{ fontFamily: T.body, fontSize: 12, fontWeight: 300, color: T.subtle, margin: 0, lineHeight: 1.7 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}