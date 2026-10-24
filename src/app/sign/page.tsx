'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

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
function Toggle({
  checked, onChange, label,
}: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className="relative w-9 h-5 rounded-full flex-shrink-0 transition-colors duration-200"
        style={{ background: checked ? '#888888' : '#222222' }}
      >
        <div
          className="absolute top-[3px] w-3.5 h-3.5 rounded-full bg-bss-white transition-all duration-200"
          style={{ left: checked ? 19 : 3 }}
        />
      </div>
      <span className="font-body text-xs text-bss-subtle">{label}</span>
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
  if (ghost) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`inline-flex items-center gap-1.5 border border-bss-border text-bss-subtle font-body font-medium tracking-wide transition-all duration-150
          hover:border-bss-white hover:text-bss-white disabled:opacity-50 disabled:cursor-not-allowed
          ${small ? 'px-3.5 py-1.5 text-[11px]' : 'px-7 py-2.5 text-[13px]'}`}
      >
        {children}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 bg-bss-white text-bss-black font-body font-medium tracking-wide transition-all duration-150
        hover:bg-bss-offwhite disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-bss-border
        ${small ? 'px-3.5 py-1.5 text-[11px]' : 'px-7 py-2.5 text-[13px]'}`}
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
    <div className="flex items-center mb-9">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className="w-[22px] h-[22px] flex items-center justify-center border transition-colors"
              style={{
                borderColor: i <= idx ? '#ffffff' : '#222222',
                background:  i <  idx ? '#ffffff' : 'transparent',
              }}
            >
              {i < idx ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                  stroke="#000000" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              ) : (
                <span className={`text-[9px] font-body font-medium ${i === idx ? 'text-bss-white' : 'text-bss-muted'}`}>
                  {i + 1}
                </span>
              )}
            </div>
            <span className={`text-[11px] font-body tracking-[0.06em]
              ${i === idx ? 'font-medium text-bss-white' : i < idx ? 'font-light text-bss-subtle' : 'font-light text-bss-muted'}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="w-8 h-px bg-bss-border mx-3" />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Live signature preview ────────────────────────────────────────────────────
function SigPreview({ dataUrl }: { dataUrl: string | null }) {
  return (
    <div className="border border-bss-border bg-bss-card p-3 min-h-[72px] flex flex-col gap-2">
      <p className="font-body text-[10px] text-bss-muted tracking-[0.1em] font-medium m-0">PREVIEW</p>
      <div className="flex-1 flex items-center min-h-[60px]">
        {dataUrl ? (
          <img src={dataUrl} alt="Signature preview"
            className="max-h-[60px] max-w-full object-contain" />
        ) : (
          <p className="font-body text-xs text-bss-muted italic">Your signature will appear here as you draw</p>
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
  const [inkColor, setInkColor]             = useState(INK_SWATCHES[0].color);
  const [customInk, setCustomInk]           = useState('#111111');
  const [livePreviewUrl, setLivePreviewUrl] = useState<string | null>(null);
  const [savedSig, setSavedSig]             = useState<string | null>(null);
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
  const [showStamp, setShowStamp] = useState(false);
  const [stampName, setStampName] = useState('');
  const [stampDate, setStampDate] = useState(true);
  const [stampText, setStampText] = useState('');

  const sigPadRef    = useRef<any>(null);
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const dropRef      = useRef<HTMLDivElement>(null);
  const dragOff      = useRef({ x: 0, y: 0 });
  const resizeStart  = useRef({ mx: 0, my: 0, w: 0, h: 0 });
  const pdfJsRef     = useRef<any>(null);
  const pdfDocRef    = useRef<any>(null);

  // ── Inject global styles ───────────────────────────────────────────────────
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

  // ── Load saved signature ───────────────────────────────────────────────────
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

  useEffect(() => {
    if (sigPadRef.current) sigPadRef.current.penColor = inkColor;
  }, [inkColor]);

  // ── Type-preview canvas ────────────────────────────────────────────────────
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

  // ── Confirm signatures ─────────────────────────────────────────────────────
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

  async function useSavedSig() {
    if (!savedSig) return;
    const { aspect } = await trimCanvasToPng(savedSig);
    const dispH = 72, dispW = Math.round(dispH * aspect);
    setSig({ dataUrl: savedSig, width: dispW, height: dispH, x: 0, y: 0 });
    setSigPos({ x: 60, y: 60 }); setSigSize({ w: dispW, h: dispH });
    setStep('place');
  }

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

  // ── Pointer drag ───────────────────────────────────────────────────────────
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

  // ── Pointer resize ─────────────────────────────────────────────────────────
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

  // ── Zoom ───────────────────────────────────────────────────────────────────
  function handleZoom(dir: 'in' | 'out') {
    const next = dir === 'in' ? Math.min(zoomLevel + 0.25, 3) : Math.max(zoomLevel - 0.25, 0.5);
    setZoomLevel(next);
    setPdfScale(1.5 * next);
  }

  // ── Stamp ──────────────────────────────────────────────────────────────────
  function buildStampLines(): string[] {
    const lines: string[] = [];
    if (stampName.trim()) lines.push(stampName.trim());
    if (stampDate) lines.push(new Date().toLocaleDateString());
    if (stampText.trim()) lines.push(stampText.trim());
    return lines;
  }

  // ── Embed signature ────────────────────────────────────────────────────────
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

      let targetPages: number[];
      if (pageMode === 'all') {
        targetPages = pages.map((_: any, i: number) => i);
      } else if (pageMode === 'select') {
        targetPages = Array.from(selectedPages).map(p => p - 1);
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
      {/* ── PAGE HEADER — matches About page pattern ──────────────────── */}
      <section className="pt-36 pb-20 border-b border-bss-border">
        <div className="container-site">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="eyebrow">Tools</p>
              <h1 className="display-xl max-w-2xl mb-4">Sign Document</h1>
              <p className="body-lead max-w-prose">
                Upload a PDF, draw or type your signature, drag it into position, and download — all in your browser.
              </p>
            </div>
            {step !== 'upload' && (
              <button
                onClick={reset}
                className="font-body text-[11px] text-bss-muted bg-transparent border-none cursor-pointer tracking-[0.08em] hover:text-bss-subtle transition-colors pb-1"
              >
                ← Start over
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── CONTENT ───────────────────────────────────────────────────── */}
      <section className="section-pad">
        <div className="container-site">
          <Steps current={step} />

          {/* Error banner */}
          {error && (
            <div className="mb-6 px-4 py-3 border border-bss-border flex items-center gap-2.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="#888888" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>
              </svg>
              <p className="font-body text-xs text-bss-subtle font-light">{error}</p>
            </div>
          )}

          {/* ══ STEP 1 — Upload ══════════════════════════════════════════ */}
          {step === 'upload' && (
            <>
                {/* Hidden file input — enables native file picker on mobile and desktop */}
    <input
      id="pdf-input"
      type="file"
      accept=".pdf,application/pdf"
      className="hidden"
      onChange={e => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
        e.target.value = '';
      }}
    />
              <div
                ref={dropRef}
                onDragOver={e => { e.preventDefault(); dropRef.current?.classList.add('bss-drop-active'); }}
                onDragLeave={() => dropRef.current?.classList.remove('bss-drop-active')}
                onDrop={e => { dropRef.current?.classList.remove('bss-drop-active'); onDrop(e); }}
                onClick={() => document.getElementById('pdf-input')?.click()}
                className="border border-bss-border px-8 py-16 flex flex-col items-center justify-center gap-5 cursor-pointer transition-colors text-center hover:border-bss-subtle"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                  stroke="#555555" strokeWidth="1" strokeLinecap="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
                <div>
                  <p className="font-display text-lg font-bold text-bss-white mb-1.5">Drop a PDF here</p>
                  <p className="font-body text-xs text-bss-muted font-light">or click to browse — PDF files only</p>
                </div>
                {loading && <p className="font-body text-[11px] text-bss-subtle tracking-[0.1em]">Loading…</p>}
              </div>

              <div className="flex items-center gap-2 mt-3">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                  stroke="#555555" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <p className="font-body text-[11px] text-bss-muted font-light">
                  Your PDF never leaves your browser. All processing is local.
                </p>
              </div>

              {/* How it works */}
              <div className="border-t border-bss-border pt-7 mt-10">
                <p className="eyebrow mb-5">How it works</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {([
                    ['Upload',   'Drop any PDF — it never leaves your device.'],
                    ['Sign',     'Draw with your finger or type your name.'],
                    ['Place',    'Drag to position, resize, pick pages, add a stamp.'],
                    ['Download', 'The signed PDF is generated and saved locally.'],
                  ] as const).map(([title, desc]) => (
                    <div key={title}>
                      <p className="display-md text-base mb-1.5">{title}</p>
                      <p className="body-base text-xs leading-relaxed">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ══ STEP 2 — Sign ════════════════════════════════════════════ */}
          {step === 'sign' && (
            <div className="grid gap-5">

              {/* Ink color */}
              <div>
                <p className="font-body text-[11px] text-bss-muted mb-2.5 tracking-[0.06em]">Ink color</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {INK_SWATCHES.map(sw => (
                    <button
                      key={sw.color}
                      onClick={() => setInkColor(sw.color)}
                      title={sw.label}
                      className="w-7 h-7 rounded-full cursor-pointer outline-none transition-all"
                      style={{
                        background: sw.color,
                        border: inkColor === sw.color ? '2px solid #ffffff' : '2px solid transparent',
                        boxShadow: inkColor === sw.color ? '0 0 0 1px #555' : 'none',
                      }}
                    />
                  ))}
                  {/* Custom color */}
                  <div className="relative w-7 h-7">
                    <div
                      className="w-7 h-7 rounded-full cursor-pointer"
                      style={{
                        background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)',
                        border: !INK_SWATCHES.find(s => s.color === inkColor) ? '2px solid #ffffff' : '2px solid transparent',
                        boxShadow: !INK_SWATCHES.find(s => s.color === inkColor) ? '0 0 0 1px #555' : 'none',
                      }}
                    />
                    <input
                      type="color" value={customInk}
                      onChange={e => { setCustomInk(e.target.value); setInkColor(e.target.value); }}
                      title="Custom color"
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </div>
                  <span className="font-body text-[11px] text-bss-muted ml-1">
                    {INK_SWATCHES.find(s => s.color === inkColor)?.label ?? 'Custom'}
                  </span>
                </div>
              </div>

              {/* Mode tabs */}
              <div className="border border-bss-border">
                <div className="flex border-b border-bss-border">
                  {(['draw', 'type'] as SignMode[]).map(mode => (
                    <button
                      key={mode}
                      onClick={() => { setSignMode(mode); setError(''); }}
                      className={`flex-1 py-2.5 font-body text-xs font-medium tracking-[0.05em] transition-colors duration-150 border-r last:border-r-0 border-bss-border
                        ${signMode === mode ? 'bg-bss-card text-bss-white' : 'bg-transparent text-bss-muted hover:text-bss-subtle'}`}
                    >
                      {mode === 'draw' ? 'Draw' : 'Type'}
                    </button>
                  ))}
                </div>

                {/* Draw panel */}
                {signMode === 'draw' && (
                  <div className="p-4 grid gap-4">
                    {savedSig && (
                      <div className="border border-bss-border px-3.5 py-2.5 flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3">
                          <img src={savedSig} alt="Saved signature"
                            className="h-8 max-w-[120px] object-contain opacity-80" />
                          <span className="font-body text-[11px] text-bss-muted">Saved signature</span>
                        </div>
                        <Btn small onClick={useSavedSig}>Use saved</Btn>
                      </div>
                    )}

                    <div>
                      <p className="font-body text-[11px] text-bss-muted mb-2.5 tracking-[0.06em]">Draw your signature</p>
                      <div className="relative border border-bss-border bg-bss-card">
                        <canvas
                          ref={sigCanvasRef}
                          className="block w-full touch-none"
                          style={{ height: 160 }}
                        />
                        {!livePreviewUrl && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <p className="font-body text-[11px] text-bss-muted opacity-50 tracking-[0.08em]">Sign here</p>
                          </div>
                        )}
                      </div>
                      <div className="h-px bg-bss-border" />
                    </div>

                    <SigPreview dataUrl={livePreviewUrl} />

                    <div className="flex gap-2.5">
                      <Btn onClick={confirmDrawSig}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Use this signature
                      </Btn>
                      <Btn ghost onClick={() => { sigPadRef.current?.clear(); setLivePreviewUrl(null); }}>Clear</Btn>
                    </div>
                  </div>
                )}

                {/* Type panel */}
                {signMode === 'type' && (
                  <div className="p-4 grid gap-4">
                    <div>
                      <p className="font-body text-[11px] text-bss-muted mb-2.5 tracking-[0.06em]">Type your name</p>
                      <input
                        type="text" value={typedName}
                        onChange={e => setTypedName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full px-3.5 py-2.5 bg-bss-card border border-bss-border text-bss-white font-body text-sm outline-none"
                      />
                    </div>

                    <div>
                      <p className="font-body text-[11px] text-bss-muted mb-2.5 tracking-[0.06em]">Choose a style</p>
                      <div className="grid grid-cols-2 gap-2">
                        {CURSIVE_FONTS.map((f, i) => (
                          <button
                            key={f.label}
                            onClick={() => setSelectedFont(i)}
                            className={`px-4 py-3 flex flex-col items-start gap-1 transition-colors cursor-pointer
                              ${selectedFont === i ? 'bg-bss-card border border-bss-white' : 'bg-transparent border border-bss-border hover:border-bss-subtle'}`}
                          >
                            <span className="font-body text-[10px] text-bss-muted tracking-[0.1em]">{f.label}</span>
                            <span style={{ fontFamily: f.family, fontSize: 22, color: inkColor, lineHeight: 1.2 }}>
                              {typedName || 'Your name'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <canvas ref={typePreviewRef}
                      className="block w-full invisible absolute"
                      style={{ height: 100 }}
                    />

                    <div className="border border-bss-border bg-bss-card px-4 py-3 min-h-[72px] flex flex-col gap-2">
                      <p className="font-body text-[10px] text-bss-muted tracking-[0.1em] font-medium">PREVIEW</p>
                      {typedName.trim() ? (
                        <span style={{ fontFamily: CURSIVE_FONTS[selectedFont].family, fontSize: 40, color: inkColor, lineHeight: 1.3 }}>
                          {typedName}
                        </span>
                      ) : (
                        <p className="font-body text-xs text-bss-muted italic">Type your name above to see a preview</p>
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

          {/* ══ STEP 3 — Place ═══════════════════════════════════════════ */}
          {step === 'place' && sig && (
            <div className="grid gap-5">

              {/* Page nav + zoom */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {pageCount > 1 && (
                  <>
                    <Btn ghost small onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>← Prev</Btn>
                    <span className="font-body text-[11px] text-bss-muted">Page {currentPage} / {pageCount}</span>
                    <Btn ghost small onClick={() => setCurrentPage(p => Math.min(pageCount, p + 1))} disabled={currentPage === pageCount}>Next →</Btn>
                    <div className="w-px h-4 bg-bss-border mx-1" />
                  </>
                )}
                <div className="flex items-center gap-1.5">
                  <Btn ghost small onClick={() => handleZoom('out')} disabled={zoomLevel <= 0.5}>−</Btn>
                  <span className="font-body text-[11px] text-bss-muted min-w-[36px] text-center">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <Btn ghost small onClick={() => handleZoom('in')} disabled={zoomLevel >= 3}>+</Btn>
                </div>
              </div>

              {/* Multi-page placement */}
              {pageCount > 1 && (
                <div className="border border-bss-border px-4 py-3.5 grid gap-3">
                  <p className="font-body text-[11px] text-bss-muted tracking-[0.06em]">Apply signature to</p>
                  <div className="flex gap-2 flex-wrap">
                    {([
                      { key: 'current', label: 'This page only' },
                      { key: 'all',     label: 'All pages' },
                      { key: 'select',  label: 'Select pages' },
                    ] as { key: PageMode; label: string }[]).map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => setPageMode(opt.key)}
                        className={`px-3.5 py-1.5 font-body text-[11px] font-medium transition-all cursor-pointer
                          ${pageMode === opt.key
                            ? 'bg-bss-white text-bss-black border border-bss-white'
                            : 'bg-transparent text-bss-muted border border-bss-border hover:border-bss-subtle'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {pageMode === 'select' && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
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

              {/* Stamp options */}
              <div className="border border-bss-border px-4 py-3.5 grid gap-3">
                <Toggle checked={showStamp} onChange={setShowStamp} label="Add text stamp below signature" />
                {showStamp && (
                  <div className="grid gap-2.5 pt-1">
                    <div className="flex gap-2.5 flex-wrap items-center">
                      <input
                        type="text" value={stampName}
                        onChange={e => setStampName(e.target.value)}
                        placeholder="Name (optional)"
                        className="flex-1 min-w-[140px] px-3 py-1.5 bg-bss-card border border-bss-border text-bss-white font-body text-xs outline-none"
                      />
                      <input
                        type="text" value={stampText}
                        onChange={e => setStampText(e.target.value)}
                        placeholder={'"Signed" or custom text'}
                        className="flex-1 min-w-[140px] px-3 py-1.5 bg-bss-card border border-bss-border text-bss-white font-body text-xs outline-none"
                      />
                    </div>
                    <Toggle checked={stampDate} onChange={setStampDate} label={`Include today's date (${new Date().toLocaleDateString()})`} />
                    {buildStampLines().length > 0 && (
                      <div className="px-3 py-2 bg-bss-card border border-bss-border">
                        {buildStampLines().map((l, i) => (
                          <p key={i} className="font-body text-[11px] text-bss-subtle my-px">{l}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* PDF canvas */}
              <div className="relative border border-bss-border leading-[0] overflow-hidden">
                <canvas ref={pdfCanvasRef} className="block w-full h-auto" />
                <div
                  className="sig-overlay"
                  onPointerDown={onSigPointerDown}
                  onPointerMove={onSigPointerMove}
                  onPointerUp={onSigPointerUp}
                  style={{ left: sigPos.x, top: sigPos.y, width: sigSize.w, height: sigSize.h, outline: '1px dashed #555555' }}
                >
                  <img src={sig.dataUrl} draggable={false} alt="signature"
                    className="w-full h-full object-contain block pointer-events-none" />
                  <div
                    className="sig-handle"
                    onPointerDown={onResizePointerDown}
                    onPointerMove={onResizePointerMove}
                    onPointerUp={onResizePointerUp}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <span className="font-body text-[11px] text-bss-muted font-light">
                  {sigSize.w} × {sigSize.h} px · {Math.round(sigPos.x)}, {Math.round(sigPos.y)}
                  {pageMode === 'all' && <span className="ml-2 text-bss-subtle">All {pageCount} pages</span>}
                  {pageMode === 'select' && selectedPages.size > 0 && (
                    <span className="ml-2 text-bss-subtle">{selectedPages.size} page{selectedPages.size !== 1 ? 's' : ''}</span>
                  )}
                </span>
                <div className="ml-auto flex gap-2.5">
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

          {/* ══ STEP 4 — Done ════════════════════════════════════════════ */}
          {step === 'done' && (
            <div className="grid gap-6">
              <div className="p-5 border border-bss-border flex items-center gap-3.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                <div>
                  <p className="font-display text-base font-bold text-bss-white mb-0.5">Signature embedded</p>
                  <p className="font-body text-xs text-bss-subtle font-light">Your signed PDF is ready to download.</p>
                </div>
              </div>
              <div className="flex gap-3 flex-wrap">
                <a
                  href={outputUrl} download={outputName}
                  className="btn-primary"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Download {outputName}
                </a>
                <Btn ghost onClick={reset}>Sign another document</Btn>
              </div>
            </div>
          )}

        </div>
      </section>
    </>
  );
}