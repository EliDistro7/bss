"use client";

import { useState, useCallback } from "react";

// ─── types ───────────────────────────────────────────────────────────────────

type Step = "input" | "price" | "processing" | "done" | "error";

interface PriceResult {
  durationSecs: number;
  price: number;          // USD cents
  displayPrice: string;   // e.g. "$0.30"
  label: string;          // e.g. "10s clip"
}

interface GenerateResult {
  fileId: string;
  filename: string;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function toSeconds(t: string): number | null {
  const trimmed = t.trim();
  if (/^\d+$/.test(trimmed)) return parseInt(trimmed, 10);
  const parts = trimmed.split(":").map(Number);
  if (parts.some(isNaN)) return null;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return null;
}

function formatTime(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

// ─── component ───────────────────────────────────────────────────────────────

export default function ClipPage() {
  const [url, setUrl]       = useState("");
  const [start, setStart]   = useState("");
  const [end, setEnd]       = useState("");
  const [step, setStep]     = useState<Step>("input");
  const [price, setPrice]   = useState<PriceResult | null>(null);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError]   = useState("");

  // ── validation ─────────────────────────────────────────────────────────────

  const startSecs = toSeconds(start);
  const endSecs   = toSeconds(end);
  const isValid =
    url.trim().length > 0 &&
    startSecs !== null &&
    endSecs !== null &&
    endSecs > (startSecs ?? 0);

  // ── step 1: get price ──────────────────────────────────────────────────────

  const handleGetPrice = useCallback(async () => {
    if (!isValid) return;
    setError("");
    setStep("price");

    try {
      const res = await fetch("/api/clip/price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start, end }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to calculate price");
      setPrice(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setStep("error");
    }
  }, [isValid, start, end]);

  // ── step 2: pay + generate ─────────────────────────────────────────────────

  const handleGenerate = useCallback(async () => {
    if (!price) return;
    setStep("processing");
    setError("");

    try {
      const res = await fetch("/api/clip/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, start, end }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setResult(data);
      setStep("done");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setStep("error");
    }
  }, [price, url, start, end]);

  // ── reset ──────────────────────────────────────────────────────────────────

  const reset = () => {
    setUrl(""); setStart(""); setEnd("");
    setStep("input"); setPrice(null); setResult(null); setError("");
  };

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <main className="clip-root">

      {/* ── page header ── */}
      <header className="clip-header">
        <span className="clip-eyebrow">Video tool</span>
        <h1 className="clip-title">Clip a YouTube segment</h1>
        <p className="clip-subtitle">
          Paste a video URL, set your in/out points, pay per second of clip — download in seconds.
        </p>
      </header>

      {/* ── card ── */}
      <section className="clip-card">

        {/* INPUT */}
        {(step === "input" || step === "error") && (
          <div className="clip-form">
            <div className="clip-field">
              <label className="clip-label">YouTube URL</label>
              <input
                className="clip-input"
                type="url"
                placeholder="https://youtu.be/…"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            <div className="clip-row">
              <div className="clip-field">
                <label className="clip-label">Start time</label>
                <input
                  className="clip-input clip-input--mono"
                  type="text"
                  placeholder="1:36:00"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </div>
              <div className="clip-divider-arrow">→</div>
              <div className="clip-field">
                <label className="clip-label">End time</label>
                <input
                  className="clip-input clip-input--mono"
                  type="text"
                  placeholder="1:36:30"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </div>
            </div>

            {/* inline duration preview */}
            {startSecs !== null && endSecs !== null && endSecs > startSecs && (
              <p className="clip-hint">
                Clip length: <strong>{endSecs - startSecs}s</strong>
                &nbsp;·&nbsp;{formatTime(startSecs)} → {formatTime(endSecs)}
              </p>
            )}

            {step === "error" && (
              <p className="clip-error">{error}</p>
            )}

            <button
              className="clip-btn clip-btn--primary"
              disabled={!isValid}
              onClick={handleGetPrice}
            >
              Check price
            </button>
          </div>
        )}

        {/* PRICE PREVIEW — skeleton while loading */}
        {step === "price" && !price && (
          <div className="clip-loading">
            <div className="clip-spinner" />
            <span>Calculating…</span>
          </div>
        )}

        {/* PRICE CONFIRM */}
        {step === "price" && price && (
          <div className="clip-price-confirm">
            <div className="clip-price-badge">
              <span className="clip-price-amount">{price.displayPrice}</span>
              <span className="clip-price-label">{price.label}</span>
            </div>

            <p className="clip-price-breakdown">
              {price.durationSecs}s × $0.03/s
            </p>

            {/* payment note — replace with real Stripe element */}
            <div className="clip-payment-placeholder">
              <span className="clip-payment-icon">💳</span>
              <span className="clip-payment-text">
                Payment via Stripe (integrate here)
              </span>
            </div>

            <div className="clip-price-actions">
              <button className="clip-btn clip-btn--ghost" onClick={reset}>
                ← Back
              </button>
              <button
                className="clip-btn clip-btn--primary"
                onClick={handleGenerate}
              >
                Pay &amp; generate clip
              </button>
            </div>
          </div>
        )}

        {/* PROCESSING */}
        {step === "processing" && (
          <div className="clip-loading">
            <div className="clip-spinner" />
            <span>Downloading and trimming your clip…</span>
            <p className="clip-loading-sub">
              This usually takes 10–30 seconds depending on clip length.
            </p>
          </div>
        )}

        {/* DONE */}
        {step === "done" && result && (
          <div className="clip-done">
            <div className="clip-done-icon">✓</div>
            <h2 className="clip-done-title">Clip ready</h2>
            <p className="clip-done-file">{result.filename}</p>
            <a
              className="clip-btn clip-btn--primary"
              href={`/api/clip/download/${result.fileId}`}
              download={result.filename}
            >
              Download MP4
            </a>
            <button className="clip-btn clip-btn--ghost" onClick={reset}>
              Trim another
            </button>
          </div>
        )}

      </section>

      {/* ── pricing table ── */}
      <section className="clip-pricing">
        <h2 className="clip-pricing-title">Simple per-second pricing</h2>
        <div className="clip-pricing-grid">
          {[
            { range: "1 – 30 s",   price: "$0.03 / s", eg: "10s = $0.30" },
            { range: "31 – 120 s", price: "$0.02 / s", eg: "60s = $1.20" },
            { range: "121 s +",    price: "$0.015 / s", eg: "5 min = $4.50" },
          ].map((tier) => (
            <div key={tier.range} className="clip-tier">
              <span className="clip-tier-range">{tier.range}</span>
              <span className="clip-tier-price">{tier.price}</span>
              <span className="clip-tier-eg">{tier.eg}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── scoped styles (BSS token system) ── */}
      <style>{`
        .clip-root {
          min-height: 100vh;
          background: var(--color-canvas, #F9F7F4);
          font-family: var(--font-sans, "DM Sans", sans-serif);
          padding: 0 1rem 4rem;
        }

        /* header */
        .clip-header {
          max-width: 560px;
          margin: 0 auto;
          padding: 4rem 0 2.5rem;
          text-align: center;
        }
        .clip-eyebrow {
          display: inline-block;
          font-family: var(--font-label, "Barlow Condensed", sans-serif);
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--color-accent-500, #1E9F91);
          margin-bottom: 0.75rem;
        }
        .clip-title {
          font-family: var(--font-display, "Playfair Display", serif);
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 600;
          color: var(--color-ink-900, #131210);
          margin: 0 0 0.75rem;
          line-height: 1.15;
        }
        .clip-subtitle {
          font-size: 1rem;
          color: var(--color-ink-500, #6B6760);
          line-height: 1.6;
          max-width: 440px;
          margin: 0 auto;
        }

        /* card */
        .clip-card {
          max-width: 520px;
          margin: 0 auto 2.5rem;
          background: var(--color-surface, #fff);
          border: 1px solid var(--color-border, #E2DFD9);
          border-radius: var(--radius-xl, 16px);
          box-shadow: var(--shadow-md, 0 4px 16px rgba(19,18,16,.10));
          padding: 2rem;
        }

        /* form */
        .clip-form { display: flex; flex-direction: column; gap: 1.25rem; }
        .clip-field { display: flex; flex-direction: column; gap: 0.4rem; }
        .clip-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--color-ink-600, #514E48);
          letter-spacing: 0.02em;
        }
        .clip-input {
          width: 100%;
          padding: 0.625rem 0.875rem;
          font-family: var(--font-sans, sans-serif);
          font-size: 0.9375rem;
          color: var(--color-ink-900, #131210);
          background: var(--color-canvas, #F9F7F4);
          border: 1px solid var(--color-border, #E2DFD9);
          border-radius: var(--radius-md, 8px);
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
        }
        .clip-input:focus {
          border-color: var(--color-accent-500, #1E9F91);
          box-shadow: 0 0 0 3px var(--color-accent-100, rgba(30,159,145,.12));
        }
        .clip-input--mono {
          font-family: var(--font-mono, "JetBrains Mono", monospace);
          font-size: 0.875rem;
          letter-spacing: 0.04em;
        }
        .clip-row {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: end;
          gap: 0.5rem;
        }
        .clip-divider-arrow {
          padding-bottom: 0.625rem;
          color: var(--color-ink-400, #8E8A82);
          font-size: 1rem;
        }
        .clip-hint {
          font-size: 0.8125rem;
          color: var(--color-ink-500, #6B6760);
          margin: -0.25rem 0 0;
        }
        .clip-hint strong { color: var(--color-ink-800, #252320); }
        .clip-error {
          font-size: 0.875rem;
          color: var(--color-danger, #D94F4F);
          background: rgba(217,79,79,.07);
          padding: 0.625rem 0.875rem;
          border-radius: var(--radius-md, 8px);
          margin: 0;
        }

        /* buttons */
        .clip-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.6875rem 1.5rem;
          font-family: var(--font-sans, sans-serif);
          font-size: 0.9375rem;
          font-weight: 500;
          border-radius: var(--radius-md, 8px);
          cursor: pointer;
          border: none;
          transition: background 0.15s, box-shadow 0.15s, opacity 0.15s;
          text-decoration: none;
        }
        .clip-btn--primary {
          background: var(--color-accent-500, #1E9F91);
          color: #fff;
          box-shadow: var(--shadow-sm);
        }
        .clip-btn--primary:hover { background: var(--color-accent-600, #197F75); }
        .clip-btn--primary:disabled { opacity: 0.45; cursor: not-allowed; }
        .clip-btn--ghost {
          background: transparent;
          color: var(--color-ink-600, #514E48);
          border: 1px solid var(--color-border, #E2DFD9);
        }
        .clip-btn--ghost:hover { background: var(--color-overlay, #F2EFE9); }

        /* loading */
        .clip-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 2.5rem 1rem;
          color: var(--color-ink-600, #514E48);
          font-size: 0.9375rem;
        }
        .clip-loading-sub {
          font-size: 0.8125rem;
          color: var(--color-ink-400, #8E8A82);
          text-align: center;
          margin: 0;
        }
        .clip-spinner {
          width: 32px;
          height: 32px;
          border: 2.5px solid var(--color-border, #E2DFD9);
          border-top-color: var(--color-accent-500, #1E9F91);
          border-radius: 50%;
          animation: spin 0.75s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* price confirm */
        .clip-price-confirm {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
          text-align: center;
        }
        .clip-price-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          padding: 1.5rem 2.5rem;
          background: var(--color-accent-100, rgba(30,159,145,.12));
          border-radius: var(--radius-lg, 12px);
        }
        .clip-price-amount {
          font-family: var(--font-display, "Playfair Display", serif);
          font-size: 2.5rem;
          font-weight: 600;
          color: var(--color-accent-600, #197F75);
          line-height: 1;
        }
        .clip-price-label {
          font-size: 0.8125rem;
          color: var(--color-ink-500, #6B6760);
        }
        .clip-price-breakdown {
          font-size: 0.8125rem;
          color: var(--color-ink-400, #8E8A82);
          margin: 0;
        }
        .clip-payment-placeholder {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: var(--color-overlay, #F2EFE9);
          border: 1px dashed var(--color-border, #E2DFD9);
          border-radius: var(--radius-md, 8px);
          font-size: 0.875rem;
          color: var(--color-ink-500, #6B6760);
          width: 100%;
        }
        .clip-payment-icon { font-size: 1rem; }
        .clip-price-actions {
          display: flex;
          gap: 0.75rem;
          width: 100%;
        }
        .clip-price-actions .clip-btn { flex: 1; }

        /* done */
        .clip-done {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem 0;
          text-align: center;
        }
        .clip-done-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--color-success, #2E9B6A);
          color: #fff;
          font-size: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .clip-done-title {
          font-family: var(--font-display, "Playfair Display", serif);
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--color-ink-900, #131210);
          margin: 0;
        }
        .clip-done-file {
          font-family: var(--font-mono, monospace);
          font-size: 0.8125rem;
          color: var(--color-ink-500, #6B6760);
          margin: 0;
        }
        .clip-done .clip-btn { width: 100%; }

        /* pricing table */
        .clip-pricing {
          max-width: 520px;
          margin: 0 auto;
        }
        .clip-pricing-title {
          font-family: var(--font-display, "Playfair Display", serif);
          font-size: 1.125rem;
          font-weight: 500;
          color: var(--color-ink-700, #3A3830);
          margin: 0 0 1rem;
          text-align: center;
        }
        .clip-pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }
        .clip-tier {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          padding: 1rem;
          background: var(--color-surface, #fff);
          border: 1px solid var(--color-border, #E2DFD9);
          border-radius: var(--radius-lg, 12px);
          text-align: center;
        }
        .clip-tier-range {
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-ink-400, #8E8A82);
        }
        .clip-tier-price {
          font-family: var(--font-display, "Playfair Display", serif);
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-accent-600, #197F75);
        }
        .clip-tier-eg {
          font-size: 0.75rem;
          color: var(--color-ink-400, #8E8A82);
        }

        @media (max-width: 520px) {
          .clip-card { padding: 1.5rem 1.25rem; }
          .clip-pricing-grid { grid-template-columns: 1fr; }
          .clip-price-actions { flex-direction: column; }
        }
      `}</style>
    </main>
  );
}