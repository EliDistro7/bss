'use client';
import { useState, useRef } from 'react';

// ── Constants ─────────────────────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_YT_TRIM_API_URL || 'https://yt-trimmer-21vn.onrender.com';

// ── Helpers ───────────────────────────────────────────────────────────────────
function toSeconds(str: string | null | undefined): number | null {
  if (!str) return null;
  str = str.trim();
  if (/^\d+$/.test(str)) return parseInt(str, 10);
  const parts = str.split(':').map(Number);
  if (parts.some(isNaN)) return null;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return null;
}

function formatDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1);
    return u.searchParams.get('v');
  } catch {
    return null;
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────
function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-2">
      <label className="block text-[10px] font-medium font-body text-bss-muted tracking-[0.16em] uppercase">
        {children}
      </label>
      {hint && (
        <p className="text-[11px] text-bss-subtle mt-1 font-body font-light leading-snug">
          {hint}
        </p>
      )}
    </div>
  );
}

function BSSInput({
  value, onChange, placeholder, error,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
}) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={[
        'w-full px-3.5 py-2.5',
        'text-[13px] font-body font-light text-bss-offwhite',
        'bg-bss-black rounded-none outline-none',
        'border transition-colors duration-150',
        'placeholder:text-bss-muted',
        error
          ? 'border-bss-muted'
          : 'border-bss-border focus:border-bss-white',
      ].join(' ')}
    />
  );
}

type Status = 'idle' | 'preparing' | 'downloading' | 'done' | 'error';

function StatusPill({ status }: { status: Status }) {
  const map: Record<Status, { label: string; cls: string }> = {
    idle:        { label: 'Ready',     cls: 'text-bss-muted'    },
    preparing:   { label: 'Preparing', cls: 'text-bss-subtle'   },
    downloading: { label: 'Trimming',  cls: 'text-bss-offwhite' },
    done:        { label: 'Complete',  cls: 'text-bss-white'    },
    error:       { label: 'Failed',    cls: 'text-bss-subtle'   },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-medium font-body tracking-[0.14em] uppercase ${s.cls}`}>
      {status === 'downloading' && (
        <span className="w-[5px] h-[5px] rounded-full bg-bss-white animate-[bss-pulse_1.4s_ease-in-out_infinite]" />
      )}
      {status === 'done' && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      )}
      {s.label}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function YTTrimPage() {
  const [url,      setUrl]      = useState('');
  const [start,    setStart]    = useState('');
  const [end,      setEnd]      = useState('');
  const [endMode,  setEndMode]  = useState<'endtime' | 'duration'>('endtime');
  const [filename, setFilename] = useState('');
  const [status,   setStatus]   = useState<Status>('idle');
  const [error,    setError]    = useState('');
  const [progress, setProgress] = useState(0);
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const abortRef = useRef<AbortController | null>(null);

  const videoId  = extractVideoId(url);
  const startSec = toSeconds(start);
  const endSec   = toSeconds(end);
  const duration =
    startSec != null && endSec != null && endMode === 'endtime' ? endSec - startSec
    : endSec != null && endMode === 'duration' ? endSec
    : null;

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!url.trim())           e.url   = 'Paste a YouTube URL.';
    else if (!videoId)         e.url   = "Doesn't look like a valid YouTube URL.";
    if (!start.trim())         e.start = 'Enter a start time.';
    else if (startSec == null) e.start = 'Use HH:MM:SS or plain seconds.';
    if (!end.trim())           e.end   = 'Enter an end time or duration.';
    else if (endSec == null)   e.end   = 'Use HH:MM:SS or plain seconds.';
    if (!e.start && !e.end) {
      if (endMode === 'endtime'  && endSec! <= startSec!) e.end = 'End must be after start.';
      if (endMode === 'duration' && endSec! <= 0)         e.end = 'Duration must be greater than 0.';
      if (duration! > 3600) e.end = 'Clips cannot exceed 1 hour.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleTrim() {
    if (!validate()) return;
    setError('');
    setStatus('preparing');
    setProgress(0);

    const body = {
      url:      url.trim(),
      start:    start.trim(),
      end:      end.trim(),
      end_mode: endMode,
      ...(filename.trim() && {
        filename: filename.trim().endsWith('.mp4')
          ? filename.trim()
          : `${filename.trim()}.mp4`,
      }),
    };

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch(`${API_BASE}/clip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as any).detail || `Server error ${res.status}`);
      }

      setStatus('downloading');

      const reader = res.body!.getReader();
      const chunks: Uint8Array<ArrayBuffer>[] = [];
      let received = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(new Uint8Array(value.buffer as ArrayBuffer, value.byteOffset, value.byteLength));
        received += value.length;
        setProgress(received);
      }

      const cd    = res.headers.get('Content-Disposition') || '';
      const match = cd.match(/filename="?([^"]+)"?/);
      const fname = match?.[1] || (body as any).filename || 'clip.mp4';

      const blob = new Blob(chunks, { type: 'video/mp4' });
      const link = document.createElement('a');
      link.href     = URL.createObjectURL(blob);
      link.download = fname;
      link.click();
      URL.revokeObjectURL(link.href);

      setStatus('done');
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setStatus('idle');
      } else {
        setError(err.message || 'Something went wrong.');
        setStatus('error');
      }
    }
  }

  function handleCancel() { abortRef.current?.abort(); setStatus('idle'); setProgress(0); }
  function handleReset()  { setStatus('idle'); setError(''); setProgress(0); setErrors({}); }

  const busy = status === 'preparing' || status === 'downloading';

  return (
    <>
      <style>{`
        @keyframes bss-pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes bss-bar   { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
      `}</style>

      {/* ── PAGE HEADER — matches About page pattern ──────────────────── */}
      <section className="pt-36 pb-20 border-b border-bss-border">
        <div className="container-site">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="eyebrow">Tools</p>
              <h1 className="display-xl max-w-2xl mb-4">Clip Trimmer</h1>
              <p className="body-lead max-w-prose">
                Paste a YouTube link, set your clip window, and download an MP4 — nothing stored on the server.
              </p>
            </div>
            <StatusPill status={status} />
          </div>
        </div>
      </section>

      {/* ── CONTENT ───────────────────────────────────────────────────── */}
      <section className="section-pad">
        <div className="container-site">
          <div className="grid gap-7 max-w-prose">

            {/* Video URL */}
            <div>
              <FieldLabel hint="Any youtube.com or youtu.be link">Video URL</FieldLabel>
              <BSSInput
                value={url}
                onChange={v => { setUrl(v); setErrors(e => ({ ...e, url: '' })); }}
                placeholder="https://www.youtube.com/watch?v=…"
                error={errors.url}
              />
              {errors.url && (
                <p className="text-[11px] text-bss-subtle mt-1 font-body">{errors.url}</p>
              )}
              {videoId && (
                <div className="mt-3 relative overflow-hidden border border-bss-border aspect-[16/5] max-h-[110px] bg-bss-black">
                  <img
                    src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover opacity-55 block"
                  />
                  <div className="absolute inset-0 flex items-center px-5">
                    <p className="text-bss-white text-[12px] font-body font-normal tracking-[0.04em] m-0">
                      Video found — set your clip times below
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Timing row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel hint="HH:MM:SS or plain seconds">Start time</FieldLabel>
                <BSSInput
                  value={start}
                  onChange={v => { setStart(v); setErrors(e => ({ ...e, start: '' })); }}
                  placeholder="0:30 or 30"
                  error={errors.start}
                />
                {errors.start && (
                  <p className="text-[11px] text-bss-subtle mt-1 font-body">{errors.start}</p>
                )}
              </div>
              <div>
                <FieldLabel hint={endMode === 'duration' ? 'Seconds to clip' : 'HH:MM:SS or plain seconds'}>
                  {endMode === 'duration' ? 'Duration' : 'End time'}
                </FieldLabel>
                <BSSInput
                  value={end}
                  onChange={v => { setEnd(v); setErrors(e => ({ ...e, end: '' })); }}
                  placeholder={endMode === 'duration' ? '60' : '1:30 or 90'}
                  error={errors.end}
                />
                {errors.end && (
                  <p className="text-[11px] text-bss-subtle mt-1 font-body">{errors.end}</p>
                )}
              </div>
            </div>

            {/* End mode toggle + duration preview */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex border border-bss-border">
                {(['endtime', 'duration'] as const).map(val => (
                  <button
                    key={val}
                    onClick={() => { setEndMode(val); setErrors(e => ({ ...e, end: '' })); }}
                    className={[
                      'px-[18px] py-[7px]',
                      'text-[10px] font-body font-medium tracking-[0.12em] uppercase',
                      'border-none cursor-pointer transition-colors duration-150',
                      endMode === val
                        ? 'bg-bss-white text-bss-black'
                        : 'bg-transparent text-bss-muted hover:text-bss-subtle',
                    ].join(' ')}
                  >
                    {val === 'endtime' ? 'End time' : 'Duration'}
                  </button>
                ))}
              </div>

              {duration != null && duration > 0 && (
                <span className="text-[11px] font-body font-normal text-bss-subtle flex items-center gap-1.5">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
                  </svg>
                  {formatDuration(duration)} clip
                  {duration > 3600 && (
                    <span className="text-bss-muted"> — exceeds 1 hour limit</span>
                  )}
                </span>
              )}
            </div>

            {/* Optional filename */}
            <div>
              <FieldLabel hint="Optional — defaults to clip.mp4">Save as</FieldLabel>
              <BSSInput value={filename} onChange={setFilename} placeholder="my-clip" />
            </div>

            {/* Progress indicators */}
            {status === 'downloading' && (
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-[11px] font-body text-bss-subtle font-light">Streaming clip…</span>
                  <span className="text-[11px] font-body text-bss-muted font-light">
                    {(progress / 1024 / 1024).toFixed(1)} MB received
                  </span>
                </div>
                <div className="h-px bg-bss-border overflow-hidden relative">
                  <div className="absolute inset-0 bg-bss-white animate-[bss-bar_1.6s_ease-in-out_infinite]" />
                </div>
              </div>
            )}

            {status === 'preparing' && (
              <div className="flex items-center gap-2">
                <span className="w-[5px] h-[5px] rounded-full bg-bss-white animate-[bss-pulse_1.2s_ease-in-out_infinite]" />
                <span className="text-[11px] font-body text-bss-subtle font-light">Contacting server…</span>
              </div>
            )}

            {/* Success */}
            {status === 'done' && (
              <div className="p-4 border border-bss-border flex items-center gap-2.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  className="text-bss-white shrink-0">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                <p className="text-[13px] text-bss-offwhite font-body font-light m-0">
                  Clip downloaded — check your downloads folder.
                </p>
              </div>
            )}

            {/* Error */}
            {status === 'error' && error && (
              <div className="p-4 border border-bss-border flex items-start gap-2.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                  className="text-bss-subtle shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>
                </svg>
                <p className="text-[13px] text-bss-subtle font-body font-light m-0">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2 border-t border-bss-border">
              {!busy && status !== 'done' && (
                <button onClick={handleTrim} className="btn-primary">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Trim &amp; Download
                </button>
              )}

              {busy && (
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 bg-transparent text-bss-muted font-body text-[13px] font-normal border border-bss-border cursor-pointer hover:border-bss-muted transition-colors duration-150"
                >
                  Cancel
                </button>
              )}

              {status === 'done' && (
                <button onClick={handleReset} className="btn-primary">
                  Trim another clip
                </button>
              )}

              {status === 'error' && (
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-transparent text-bss-muted font-body text-[13px] font-normal border border-bss-border cursor-pointer hover:border-bss-muted transition-colors duration-150"
                >
                  Try again
                </button>
              )}

              <a
                href={`${API_BASE}/health`}
                target="_blank"
                rel="noreferrer"
                className="ml-auto inline-flex items-center gap-1.5 text-[10px] font-body font-normal tracking-[0.1em] uppercase text-bss-muted hover:text-bss-subtle transition-colors duration-150 no-underline"
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
                </svg>
                Server status
              </a>
            </div>

            {/* How it works */}
            <div className="border-t border-bss-border pt-7">
              <p className="eyebrow mb-5">How it works</p>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-6">
                {([
                  ['Paste URL',  'Any youtube.com or youtu.be link works.'],
                  ['Set times',  'Use HH:MM:SS, M:SS, or plain seconds like 90.'],
                  ['Download',   'The clip streams directly to you — nothing stored on the server.'],
                ] as const).map(([title, desc]) => (
                  <div key={title}>
                    <p className="font-display text-base font-bold text-bss-white mb-1.5 m-0">{title}</p>
                    <p className="font-body text-[12px] font-light text-bss-subtle leading-relaxed m-0">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}