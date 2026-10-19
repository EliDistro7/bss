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

// ── BSS design tokens (inline — no Tailwind needed for tool components) ───────
const T = {
  black:    '#000000',
  surface:  '#0c0c0c',
  card:     '#141414',
  border:   '#222222',
  muted:    '#555555',
  subtle:   '#888888',
  offwhite: '#e8e8e8',
  white:    '#ffffff',
  display:  '"Playfair Display", Georgia, serif',
  body:     '"Inter", system-ui, sans-serif',
} as const;

// ── Sub-components ────────────────────────────────────────────────────────────

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <label style={{
        display: 'block',
        fontSize: 10, fontWeight: 500, fontFamily: T.body,
        color: T.muted, letterSpacing: '0.16em', textTransform: 'uppercase',
      }}>
        {children}
      </label>
      {hint && (
        <p style={{ fontSize: 11, color: T.subtle, marginTop: 3, fontFamily: T.body, fontWeight: 300 }}>
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
  const [focused, setFocused] = useState(false);
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: '100%', boxSizing: 'border-box',
        padding: '10px 14px',
        fontSize: 13, fontFamily: T.body, fontWeight: 300,
        color: T.offwhite,
        background: T.black,
        border: `1px solid ${error ? '#555' : focused ? T.offwhite : T.border}`,
        borderRadius: 0, outline: 'none',
        transition: 'border-color 0.15s',
      }}
    />
  );
}

type Status = 'idle' | 'preparing' | 'downloading' | 'done' | 'error';

function StatusPill({ status }: { status: Status }) {
  const map: Record<Status, { label: string; color: string }> = {
    idle:        { label: 'Ready',     color: T.muted    },
    preparing:   { label: 'Preparing', color: T.subtle   },
    downloading: { label: 'Trimming',  color: T.offwhite },
    done:        { label: 'Complete',  color: T.white     },
    error:       { label: 'Failed',    color: T.subtle   },
  };
  const s = map[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 0',
      fontSize: 10, fontFamily: T.body, fontWeight: 500,
      letterSpacing: '0.14em', textTransform: 'uppercase',
      color: s.color,
    }}>
      {status === 'downloading' && (
        <span style={{
          width: 5, height: 5, borderRadius: '50%', background: T.white,
          animation: 'bss-pulse 1.4s ease-in-out infinite',
        }} />
      )}
      {status === 'done' && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
          stroke={T.white} strokeWidth="2.5" strokeLinecap="round">
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
    if (!url.trim())        e.url   = 'Paste a YouTube URL.';
    else if (!videoId)      e.url   = "Doesn't look like a valid YouTube URL.";
    if (!start.trim())      e.start = 'Enter a start time.';
    else if (startSec == null) e.start = 'Use HH:MM:SS or plain seconds.';
    if (!end.trim())        e.end   = 'Enter an end time or duration.';
    else if (endSec == null) e.end  = 'Use HH:MM:SS or plain seconds.';
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
      {/* keyframe injected once */}
      <style>{`
        @keyframes bss-pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes bss-bar   { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
        .bss-trim-input::placeholder { color: ${T.muted}; }
      `}</style>

      {/* ── Page header ────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 40 }}>
        <p style={{
          fontFamily: T.body, fontSize: 10, fontWeight: 500,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: T.muted, marginBottom: 12,
        }}>
          Tools
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
          <h1 style={{
            fontFamily: T.display, fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: T.white, lineHeight: 1.05, letterSpacing: '-0.025em', margin: 0,
          }}>
            Clip Trimmer
          </h1>
          <StatusPill status={status} />
        </div>
        <p style={{
          fontFamily: T.body, fontWeight: 300, fontSize: '0.9375rem',
          color: T.subtle, lineHeight: 1.7, marginTop: 12, maxWidth: '52ch',
        }}>
          Paste a YouTube link, set your clip window, and download an MP4 — nothing stored on the server.
        </p>
        <div style={{ marginTop: 20, height: 1, background: T.border }} />
      </div>

      {/* ── Form ───────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gap: 28, maxWidth: 680 }}>

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
            <p style={{ fontSize: 11, color: T.subtle, marginTop: 5, fontFamily: T.body }}>
              {errors.url}
            </p>
          )}

          {/* Thumbnail preview */}
          {videoId && (
            <div style={{
              marginTop: 12, position: 'relative', overflow: 'hidden',
              border: `1px solid ${T.border}`, aspectRatio: '16/5', maxHeight: 110,
              background: T.black,
            }}>
              <img
                src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                alt="Video thumbnail"
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55, display: 'block' }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', padding: '0 20px',
              }}>
                <p style={{
                  color: T.white, fontSize: 12, fontFamily: T.body,
                  fontWeight: 400, margin: 0, letterSpacing: '0.04em',
                }}>
                  Video found — set your clip times below
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Timing row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <FieldLabel hint="HH:MM:SS or plain seconds">Start time</FieldLabel>
            <BSSInput
              value={start}
              onChange={v => { setStart(v); setErrors(e => ({ ...e, start: '' })); }}
              placeholder="0:30 or 30"
              error={errors.start}
            />
            {errors.start && (
              <p style={{ fontSize: 11, color: T.subtle, marginTop: 5, fontFamily: T.body }}>
                {errors.start}
              </p>
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
              <p style={{ fontSize: 11, color: T.subtle, marginTop: 5, fontFamily: T.body }}>
                {errors.end}
              </p>
            )}
          </div>
        </div>

        {/* End mode toggle + duration preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex', border: `1px solid ${T.border}`,
          }}>
            {(['endtime', 'duration'] as const).map(val => (
              <button
                key={val}
                onClick={() => { setEndMode(val); setErrors(e => ({ ...e, end: '' })); }}
                style={{
                  padding: '7px 18px',
                  fontSize: 10, fontFamily: T.body, fontWeight: 500,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  border: 'none', cursor: 'pointer',
                  background: endMode === val ? T.white : 'transparent',
                  color: endMode === val ? T.black : T.muted,
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                {val === 'endtime' ? 'End time' : 'Duration'}
              </button>
            ))}
          </div>

          {duration != null && duration > 0 && (
            <span style={{
              fontSize: 11, fontFamily: T.body, fontWeight: 400, color: T.subtle,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke={T.subtle} strokeWidth="1.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
              </svg>
              {formatDuration(duration)} clip
              {duration > 3600 && (
                <span style={{ color: T.muted }}> — exceeds 1 hour limit</span>
              )}
            </span>
          )}
        </div>

        {/* Optional filename */}
        <div>
          <FieldLabel hint="Optional — defaults to clip.mp4">Save as</FieldLabel>
          <BSSInput value={filename} onChange={setFilename} placeholder="my-clip" />
        </div>

        {/* Progress / preparing indicators */}
        {status === 'downloading' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontFamily: T.body, color: T.subtle, fontWeight: 400 }}>
                Streaming clip…
              </span>
              <span style={{ fontSize: 11, fontFamily: T.body, color: T.muted, fontWeight: 300 }}>
                {(progress / 1024 / 1024).toFixed(1)} MB received
              </span>
            </div>
            <div style={{ height: 1, background: T.border, overflow: 'hidden', position: 'relative' }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: T.white,
                animation: 'bss-bar 1.6s ease-in-out infinite',
              }} />
            </div>
          </div>
        )}

        {status === 'preparing' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 5, height: 5, borderRadius: '50%', background: T.white,
              animation: 'bss-pulse 1.2s ease-in-out infinite',
            }} />
            <span style={{ fontSize: 11, fontFamily: T.body, color: T.subtle, fontWeight: 400 }}>
              Contacting server…
            </span>
          </div>
        )}

        {/* Success */}
        {status === 'done' && (
          <div style={{
            padding: '14px 16px', border: `1px solid ${T.border}`,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke={T.white} strokeWidth="2" strokeLinecap="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            <p style={{ fontSize: 13, color: T.offwhite, fontFamily: T.body, fontWeight: 300, margin: 0 }}>
              Clip downloaded — check your downloads folder.
            </p>
          </div>
        )}

        {/* Error */}
        {status === 'error' && error && (
          <div style={{
            padding: '14px 16px', border: `1px solid ${T.border}`,
            display: 'flex', alignItems: 'flex-start', gap: 10,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke={T.subtle} strokeWidth="1.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>
            </svg>
            <p style={{ fontSize: 13, color: T.subtle, fontFamily: T.body, fontWeight: 300, margin: 0 }}>
              {error}
            </p>
          </div>
        )}

        {/* ── Actions ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          paddingTop: 8, borderTop: `1px solid ${T.border}`,
        }}>
          {!busy && status !== 'done' && (
            <button
              onClick={handleTrim}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 28px',
                background: T.white, color: T.black,
                fontFamily: T.body, fontSize: 13, fontWeight: 500, letterSpacing: '0.04em',
                border: 'none', cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = T.offwhite)}
              onMouseLeave={e => (e.currentTarget.style.background = T.white)}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Trim &amp; Download
            </button>
          )}

          {busy && (
            <button
              onClick={handleCancel}
              style={{
                padding: '12px 24px',
                background: 'transparent', color: T.muted,
                fontFamily: T.body, fontSize: 13, fontWeight: 400,
                border: `1px solid ${T.border}`, cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          )}

          {status === 'done' && (
            <button
              onClick={handleReset}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 28px',
                background: T.white, color: T.black,
                fontFamily: T.body, fontSize: 13, fontWeight: 500, letterSpacing: '0.04em',
                border: 'none', cursor: 'pointer',
              }}
            >
              Trim another clip
            </button>
          )}

          {status === 'error' && (
            <button
              onClick={handleReset}
              style={{
                padding: '12px 24px',
                background: 'transparent', color: T.muted,
                fontFamily: T.body, fontSize: 13, fontWeight: 400,
                border: `1px solid ${T.border}`, cursor: 'pointer',
              }}
            >
              Try again
            </button>
          )}

          <a
            href={`${API_BASE}/health`}
            target="_blank"
            rel="noreferrer"
            style={{
              marginLeft: 'auto',
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 10, fontFamily: T.body, fontWeight: 400,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: T.muted, textDecoration: 'none',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = T.subtle)}
            onMouseLeave={e => (e.currentTarget.style.color = T.muted)}
          >
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
            </svg>
            Server status
          </a>
        </div>

        {/* ── How it works ── */}
        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 28 }}>
          <p style={{
            fontFamily: T.body, fontSize: 10, fontWeight: 500,
            letterSpacing: '0.16em', textTransform: 'uppercase', color: T.muted, marginBottom: 20,
          }}>
            How it works
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24 }}>
            {([
              ['Paste URL',  'Any youtube.com or youtu.be link works.'],
              ['Set times',  'Use HH:MM:SS, M:SS, or plain seconds like 90.'],
              ['Download',   'The clip streams directly to you — nothing stored on the server.'],
            ] as const).map(([title, desc]) => (
              <div key={title}>
                <p style={{
                  fontFamily: T.display, fontSize: '1rem', fontWeight: 700,
                  color: T.white, margin: '0 0 6px',
                }}>
                  {title}
                </p>
                <p style={{
                  fontFamily: T.body, fontSize: 12, fontWeight: 300,
                  color: T.subtle, margin: 0, lineHeight: 1.7,
                }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}