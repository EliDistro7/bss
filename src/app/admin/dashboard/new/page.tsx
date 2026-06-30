"use client";

import { Suspense, useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useAdminAuth } from "../../../../lib/hooks/useAdminAuth";
import {
  getPortfolioItem,
  createPortfolioItem,
  updatePortfolioItem,
  uploadCover,
  uploadEpub,
  deleteEpub,
  PortfolioCategory,
  PortfolioInput,
} from "../../../../lib/api/admin";

const CATEGORIES: { value: PortfolioCategory; label: string }[] = [
  { value: "profile", label: "Company Profile" },
  { value: "website", label: "Website" },
  { value: "app", label: "Mobile App" },
  { value: "card", label: "Business Card" },
  { value: "proposal", label: "Proposal" },
];

const EMPTY_FORM: PortfolioInput = {
  title: "",
  titleSw: "",
  category: "profile",
  client: "",
  year: String(new Date().getFullYear()),
  description: "",
  descriptionSw: "",
  link: "",
  published: false,
};

// ─── Inner component (safe to call useSearchParams here) ──────────────────────

function PortfolioForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEdit = Boolean(editId);

  const { status } = useAdminAuth();

  const [form, setForm] = useState<PortfolioInput>(EMPTY_FORM);
  const [coverUrl, setCoverUrl] = useState("");
  const [hasPdf, setHasPdf] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  useEffect(() => {
    if (status !== "authed" || !editId) {
      setLoading(false);
      return;
    }
    getPortfolioItem(editId)
      .then((item) => {
        setForm({
          title: item.title,
          titleSw: item.titleSw,
          category: item.category,
          client: item.client,
          year: item.year,
          description: item.description,
          descriptionSw: item.descriptionSw,
          link: item.link,
          published: item.published,
        });
        setCoverUrl(item.coverUrl);
        setHasPdf(Boolean(item.epubKey));
      })
      .catch(() => setError("Couldn't load this item."))
      .finally(() => setLoading(false));
  }, [status, editId]);

  function updateField<K extends keyof PortfolioInput>(key: K, value: PortfolioInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleCoverSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  function handlePdfSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please choose a .pdf file.");
      return;
    }
    setError("");
    setPdfFile(file);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const item = isEdit
        ? await updatePortfolioItem(editId as string, form)
        : await createPortfolioItem(form);

      if (coverFile) {
        setUploadingCover(true);
        await uploadCover(item._id, coverFile);
        setUploadingCover(false);
      }

      if (pdfFile) {
        setUploadingPdf(true);
        await uploadEpub(item._id, pdfFile);
        setUploadingPdf(false);
      }

      router.push("/admin/dashboard");
    } catch {
      setError("Couldn't save this item. Check the fields and try again.");
      setUploadingCover(false);
      setUploadingPdf(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemovePdf() {
    if (!editId) return;
    if (!confirm("Remove the PDF from this item?")) return;
    try {
      await deleteEpub(editId);
      setHasPdf(false);
    } catch {
      setError("Couldn't remove the PDF. Try again.");
    }
  }

  if (status === "checking" || loading) {
    return <div className="min-h-screen bg-bss-black" />;
  }

  const isWebOrApp = form.category === "website" || form.category === "app";

  const inputClass =
    "bg-bss-surface border border-bss-border text-bss-white px-4 py-3 text-sm w-full " +
    "focus:outline-none focus:border-bss-white transition-colors duration-200";
  const labelClass = "text-xs font-body tracking-wide uppercase text-bss-muted";

  return (
    <div className="min-h-screen bg-bss-black">
      <div className="container-site py-12 max-w-prose mx-auto">
        <p className="eyebrow mb-1">BSS Admin</p>
        <h1 className="display-md mb-10">{isEdit ? "Edit item" : "New item"}</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* ── Core fields ── */}
          <div className="card p-6 flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className={labelClass}>Title (English)</label>
                <input
                  required
                  className={inputClass}
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className={labelClass}>Title (Swahili)</label>
                <input
                  className={inputClass}
                  value={form.titleSw}
                  onChange={(e) => updateField("titleSw", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="flex flex-col gap-2">
                <label className={labelClass}>Category</label>
                <select
                  className={inputClass}
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value as PortfolioCategory)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className={labelClass}>Client</label>
                <input
                  required
                  className={inputClass}
                  value={form.client}
                  onChange={(e) => updateField("client", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className={labelClass}>Year</label>
                <input
                  required
                  className={inputClass}
                  value={form.year}
                  onChange={(e) => updateField("year", e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClass}>Description (English)</label>
              <textarea
                rows={4}
                className={inputClass}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Description (Swahili)</label>
              <textarea
                rows={4}
                className={inputClass}
                value={form.descriptionSw}
                onChange={(e) => updateField("descriptionSw", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClass}>
                Link {isWebOrApp ? "*" : "(optional)"}
              </label>
              <input
                type="url"
                required={isWebOrApp}
                placeholder="https://example.com"
                className={inputClass}
                value={form.link}
                onChange={(e) => updateField("link", e.target.value)}
              />
              <p className="text-xs text-bss-muted">
                {isWebOrApp
                  ? "Live site or app store URL — required for websites and apps."
                  : "Live site or app store URL. Leave blank if this item shouldn't link out."}
              </p>
            </div>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => updateField("published", e.target.checked)}
                className="w-4 h-4 accent-white"
              />
              <span className="text-sm text-bss-white">Published (visible on the live site)</span>
            </label>
          </div>

          {/* ── Cover image ── */}
          <div className="card p-6 flex flex-col gap-4">
            <h2 className="font-display text-lg text-bss-white">Cover image</h2>
            <div className="flex items-center gap-5">
              <div className="relative w-32 aspect-[4/3] bg-bss-surface border border-bss-border shrink-0">
                {(coverPreview || coverUrl) && (
                  <Image
                    src={coverPreview || coverUrl}
                    alt="Cover preview"
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="btn-ghost cursor-pointer text-xs px-5 py-3">
                  {coverFile ? "Change file" : "Choose file"}
                  <input type="file" accept="image/*" onChange={handleCoverSelect} className="hidden" />
                </label>
                {coverFile && <p className="text-xs text-bss-muted">{coverFile.name}</p>}
                {uploadingCover && <p className="text-xs text-bss-muted">Uploading…</p>}
              </div>
            </div>
          </div>

          {/* ── PDF (not applicable to websites/apps — they link out instead) ── */}
          {!isWebOrApp && (
            <div className="card p-6 flex flex-col gap-4">
              <h2 className="font-display text-lg text-bss-white">PDF file</h2>
              {hasPdf && !pdfFile && (
                <div className="flex items-center justify-between text-sm text-bss-white border border-bss-border px-4 py-3">
                  <span>A PDF is currently attached.</span>
                  {isEdit && (
                    <button
                      type="button"
                      onClick={handleRemovePdf}
                      className="text-red-400 text-xs uppercase tracking-wide"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label className="btn-ghost cursor-pointer text-xs px-5 py-3 self-start">
                  {pdfFile ? "Change file" : hasPdf ? "Replace PDF" : "Choose PDF"}
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handlePdfSelect}
                    className="hidden"
                  />
                </label>
                {pdfFile && <p className="text-xs text-bss-muted">{pdfFile.name}</p>}
                {uploadingPdf && <p className="text-xs text-bss-muted">Uploading…</p>}
                {!isEdit && (
                  <p className="text-xs text-bss-muted">
                    Saving will create the item, then attach this PDF.
                  </p>
                )}
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

          <div className="flex items-center gap-4">
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/dashboard")}
              className="btn-ghost"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page export — provides the required Suspense boundary ────────────────────

export default function PortfolioFormPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bss-black" />}>
      <PortfolioForm />
    </Suspense>
  );
}