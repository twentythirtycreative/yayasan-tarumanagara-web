"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as api from "./actions";
import type { AdminJob, AdminNews, Application } from "./types";

export type { AdminJob, AdminNews, Application } from "./types";
export { NEWS_TAGS, slugify } from "./types";

type Store = {
  news: AdminNews[];
  jobs: AdminJob[];
  applications: Application[];
  loading: boolean;
  saveNews: (n: AdminNews) => Promise<void>;
  deleteNews: (id: string) => Promise<void>;
  togglePublish: (id: string) => Promise<void>;
  getNews: (id: string) => AdminNews | undefined;
  saveJob: (j: AdminJob) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  toggleJobOpen: (id: string) => Promise<void>;
  getJob: (id: string) => AdminJob | undefined;
  deleteApplication: (id: string) => Promise<void>;
};

const AdminCtx = createContext<Store | null>(null);

export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const [news, setNews] = useState<AdminNews[]>([]);
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [n, j, a] = await Promise.all([
          api.listNews(),
          api.listJobs(),
          api.listApplications(),
        ]);
        if (!active) return;
        setNews(n);
        setJobs(j);
        setApplications(a);
      } catch (err) {
        console.error("Gagal memuat data admin (cek koneksi Turso):", err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const store: Store = {
    news,
    jobs,
    applications,
    loading,
    saveNews: async (n) => {
      await api.saveNews(n);
      // Optimistic local update (avoids depending on cache freshness).
      setNews((prev) =>
        prev.some((x) => x.id === n.id)
          ? prev.map((x) => (x.id === n.id ? n : x))
          : [n, ...prev],
      );
    },
    deleteNews: async (id) => {
      await api.deleteNews(id);
      setNews((prev) => prev.filter((x) => x.id !== id));
    },
    togglePublish: async (id) => {
      await api.togglePublish(id);
      setNews((prev) =>
        prev.map((x) => (x.id === id ? { ...x, published: !x.published } : x)),
      );
    },
    getNews: (id) => news.find((x) => x.id === id),
    saveJob: async (j) => {
      await api.saveJob(j);
      setJobs((prev) =>
        prev.some((x) => x.id === j.id)
          ? prev.map((x) => (x.id === j.id ? j : x))
          : [j, ...prev],
      );
    },
    deleteJob: async (id) => {
      await api.deleteJob(id);
      setJobs((prev) => prev.filter((x) => x.id !== id));
    },
    toggleJobOpen: async (id) => {
      await api.toggleJobOpen(id);
      setJobs((prev) =>
        prev.map((x) => (x.id === id ? { ...x, isOpen: !x.isOpen } : x)),
      );
    },
    getJob: (id) => jobs.find((x) => x.id === id),
    deleteApplication: async (id) => {
      await api.deleteApplication(id);
      setApplications((prev) => prev.filter((x) => x.id !== id));
    },
  };

  return <AdminCtx.Provider value={store}>{children}</AdminCtx.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminCtx);
  if (!ctx) throw new Error("useAdmin must be used within AdminStoreProvider");
  return ctx;
}
