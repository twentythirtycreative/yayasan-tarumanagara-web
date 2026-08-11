"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as api from "./actions";
import type {
  AdminGovernanceMember,
  AdminJob,
  AdminNews,
  Application,
} from "./types";

export type {
  AdminGovernanceMember,
  AdminJob,
  AdminNews,
  Application,
  GovernanceRole,
} from "./types";
export { NEWS_TAGS, GOVERNANCE_ROLES, slugify, shortId } from "./types";

type Store = {
  news: AdminNews[];
  jobs: AdminJob[];
  applications: Application[];
  adminEmail: string;
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
  governance: AdminGovernanceMember[];
  saveGovernanceMember: (m: AdminGovernanceMember) => Promise<void>;
  deleteGovernanceMember: (id: string) => Promise<void>;
  toggleGovernancePublished: (id: string) => Promise<void>;
  moveGovernanceMember: (id: string, direction: -1 | 1) => Promise<void>;
  getGovernanceMember: (id: string) => AdminGovernanceMember | undefined;
};

const AdminCtx = createContext<Store | null>(null);

export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const [news, setNews] = useState<AdminNews[]>([]);
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [governance, setGovernance] = useState<AdminGovernanceMember[]>([]);
  const [adminEmail, setAdminEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [n, j, a, g, me] = await Promise.all([
          api.listNews(),
          api.listJobs(),
          api.listApplications(),
          api.listGovernanceMembers(),
          api.getCurrentAdmin(),
        ]);
        if (!active) return;
        setNews(n);
        setJobs(j);
        setApplications(a);
        setGovernance(g);
        setAdminEmail(me.email);
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
    adminEmail,
    loading,
    saveNews: async (n) => {
      const res = await api.saveNews(n);
      if (res?.error) throw new Error(res.error);
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
      const res = await api.togglePublish(id);
      // Reconcile with the server's actual state; drop the row if it's gone.
      setNews((prev) =>
        res === null
          ? prev.filter((x) => x.id !== id)
          : prev.map((x) => (x.id === id ? { ...x, published: res.published } : x)),
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
      const res = await api.toggleJobOpen(id);
      setJobs((prev) =>
        res === null
          ? prev.filter((x) => x.id !== id)
          : prev.map((x) => (x.id === id ? { ...x, isOpen: res.isOpen } : x)),
      );
    },
    getJob: (id) => jobs.find((x) => x.id === id),
    deleteApplication: async (id) => {
      await api.deleteApplication(id);
      setApplications((prev) => prev.filter((x) => x.id !== id));
    },
    governance,
    saveGovernanceMember: async (m) => {
      const res = await api.saveGovernanceMember(m);
      if (res?.error) throw new Error(res.error);
      setGovernance((prev) =>
        prev.some((x) => x.id === m.id)
          ? prev.map((x) => (x.id === m.id ? m : x))
          : [...prev, m],
      );
    },
    deleteGovernanceMember: async (id) => {
      await api.deleteGovernanceMember(id);
      setGovernance((prev) => prev.filter((x) => x.id !== id));
    },
    toggleGovernancePublished: async (id) => {
      const res = await api.toggleGovernancePublished(id);
      setGovernance((prev) =>
        res === null
          ? prev.filter((x) => x.id !== id)
          : prev.map((x) => (x.id === id ? { ...x, published: res.published } : x)),
      );
    },
    moveGovernanceMember: async (id, direction) => {
      const order = await api.moveGovernanceMember(id, direction);
      if (order === null) {
        setGovernance((prev) => prev.filter((x) => x.id !== id));
        return;
      }
      // The action renumbers the whole role densely, so mirror that here rather
      // than swapping two rows — otherwise the local sortOrder drifts from the DB.
      const rank = new Map(order.map((memberId, i) => [memberId, i]));
      setGovernance((prev) =>
        prev.map((x) =>
          rank.has(x.id) ? { ...x, sortOrder: rank.get(x.id)! } : x,
        ),
      );
    },
    getGovernanceMember: (id) => governance.find((x) => x.id === id),
  };

  return <AdminCtx.Provider value={store}>{children}</AdminCtx.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminCtx);
  if (!ctx) throw new Error("useAdmin must be used within AdminStoreProvider");
  return ctx;
}
