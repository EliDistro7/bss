"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../../../lib/hooks/useAdminAuth";
import {
  adminListPortfolio,
  updatePortfolioItem,
  deletePortfolioItem,
  logout,
  PortfolioItem,
} from "../../../lib/api/admin";

const CATEGORY_LABEL: Record<string, string> = {
  profile: "Company Profile",
  website: "Website",
  app: "Mobile App",
  card: "Business Card",
  proposal: "Proposal",
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const { admin, status } = useAdminAuth();
  const [items, setItems] = useState<PortfolioItem[] | null>(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authed") return;
    adminListPortfolio()
      .then(setItems)
      .catch(() => setError("Couldn't load portfolio items."));
  }, [status]);

  async function togglePublished(item: PortfolioItem) {
    setBusyId(item._id);
    try {
      const updated = await updatePortfolioItem(item._id, { published: !item.published });
      setItems((prev) => prev?.map((i) => (i._id === item._id ? updated : i)) ?? null);
    } catch {
      setError("Couldn't update that item. Try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(item: PortfolioItem) {
    if (!confirm(`Delete "${item.title}"? This also removes its cover and PDF from storage.`)) {
      return;
    }
    setBusyId(item._id);
    try {
      await deletePortfolioItem(item._id);
      setItems((prev) => prev?.filter((i) => i._id !== item._id) ?? null);
    } catch {
      setError("Couldn't delete that item. Try again.");
    } finally {
      setBusyId(null);
    }
  }

  function handleLogout() {
    logout();
    router.push("/admin/login");
  }

  if (status === "checking") {
    return <div className="min-h-screen bg-bss-black" />;
  }

  return (
    <div className="min-h-screen bg-bss-black">
      <div className="container-site py-12">
        <div className="flex items-center justify-between mb-10 gap-4 flex-wrap">
          <div>
            <p className="eyebrow mb-1">BSS Admin</p>
            <h1 className="display-md">Portfolio</h1>
            {admin && <p className="body-base mt-1">Signed in as {admin.email}</p>}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard/new" className="btn-primary">
              New item
            </Link>
            <button onClick={handleLogout} className="btn-ghost">
              Sign out
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400 mb-6" role="alert">
            {error}
          </p>
        )}

        {items === null && !error && (
          <p className="body-base">Loading…</p>
        )}

        {items?.length === 0 && (
          <div className="card p-12 text-center">
            <p className="body-lead mb-4">No portfolio items yet.</p>
            <Link href="/admin/dashboard/new" className="btn-primary inline-flex">
              Create the first one
            </Link>
          </div>
        )}

        {items && items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item._id} className="card overflow-hidden flex flex-col">
                <div className="relative aspect-[4/3] bg-bss-surface">
                  {item.coverUrl ? (
                    <Image
                      src={item.coverUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xs tracking-widest uppercase text-bss-muted">
                        No cover
                      </span>
                    </div>
                  )}
                  <span
                    className="absolute top-3 left-3 text-2xs tracking-widest uppercase px-2 py-1
                               bg-bss-black/80 text-bss-white border border-bss-border"
                  >
                    {item.published ? "Published" : "Draft"}
                  </span>
                  {item.epubKey && (
                    <span
                      className="absolute top-3 right-3 text-2xs tracking-widest uppercase px-2 py-1
                                 bg-bss-white text-bss-black"
                    >
                      PDF
                    </span>
                  )}
                </div>

                <div className="p-5 flex flex-col gap-3 flex-1">
                  <div>
                    <p className="eyebrow mb-1">{CATEGORY_LABEL[item.category] ?? item.category}</p>
                    <h3 className="font-display text-lg text-bss-white leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-sm text-bss-muted mt-1">
                      {item.client} · {item.year}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center gap-2 pt-3 border-t border-bss-border">
                    <Link
                      href={`/admin/dashboard/new?id=${item._id}`}
                      className="flex-1 text-center text-xs tracking-wide font-medium uppercase
                                 px-3 py-2 border border-bss-border text-bss-white
                                 hover:border-bss-white transition-colors duration-200"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => togglePublished(item)}
                      disabled={busyId === item._id}
                      className="flex-1 text-center text-xs tracking-wide font-medium uppercase
                                 px-3 py-2 border border-bss-border text-bss-white
                                 hover:border-bss-white transition-colors duration-200
                                 disabled:opacity-50"
                    >
                      {item.published ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      disabled={busyId === item._id}
                      className="text-center text-xs tracking-wide font-medium uppercase
                                 px-3 py-2 border border-bss-border text-red-400
                                 hover:border-red-400 transition-colors duration-200
                                 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}