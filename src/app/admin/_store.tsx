"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as api from "./actions";
import { can, type AdminRole } from "@/lib/auth/roles";
import type {
  AdminGovernanceMember,
  AdminJob,
  AdminNews,
  AdminNewsCategory,
  Application,
} from "./types";

export type {
  AdminGovernanceMember,
  AdminJob,
  AdminNews,
  AdminNewsCategory,
  Application,
  GovernanceRole,
} from "./types";
export {
  NEWS_TAGS,
  ALL_NEWS_TAB_LABEL,
  GOVERNANCE_ROLES,
  slugify,
  shortId,
} from "./types";
export { can, ROLE_LABELS, type AdminRole } from "@/lib/auth/roles";

type Store = {
  news: AdminNews[];
  /** The tabs on /berita, in display order. */
  newsCategories: AdminNewsCategory[];
  jobs: AdminJob[];
  applications: Application[];
  adminEmail: string;
  /** RBAC role of the signed-in admin — pages use `can(role, …)` to scope UI. */
  role: AdminRole;
  loading: boolean;
  saveNews: (n: AdminNews) => Promise<void>;
  deleteNews: (id: string) => Promise<void>;
  togglePublish: (id: string) => Promise<void>;
  getNews: (id: string) => AdminNews | undefined;
  saveNewsCategory: (c: AdminNewsCategory) => Promise<void>;
  deleteNewsCategory: (id: string) => Promise<void>;
  moveNewsCategory: (id: string, direction: -1 | 1) => Promise<void>;
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

export function AdminStoreProvider({
  role,
  children,
}: {
  role: AdminRole;
  children: ReactNode;
}) {
  const [news, setNews] = useState<AdminNews[]>([]);
  const [newsCategories, setNewsCategories] = useState<AdminNewsCategory[]>([]);
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [governance, setGovernance] = useState<AdminGovernanceMember[]>([]);
  const [adminEmail, setAdminEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      // allSettled, not all: these are independent, and with Promise.all a
      // single rejection left every section empty — the whole panel looked blank
      // because one query failed. Each list now fails on its own.
      //
      // A list the role can't reach isn't requested at all: `requireSection`
      // would reject it server-side, and that rejection is expected, not a
      // fault worth logging.
      const skip = Promise.resolve([]);
      const [n, nc, j, a, g, me] = await Promise.allSettled([
        can(role, "berita") ? api.listNews() : skip,
        can(role, "berita") ? api.listNewsCategories() : skip,
        can(role, "lowongan") ? api.listJobs() : skip,
        can(role, "lamaran") ? api.listApplications() : skip,
        can(role, "tata-kelola") ? api.listGovernanceMembers() : skip,
        api.getCurrentAdmin(),
      ]);
      if (!active) return;

      const apply = <T,>(
        label: string,
        result: PromiseSettledResult<T>,
        set: (value: T) => void,
      ) => {
        if (result.status === "fulfilled") set(result.value);
        else console.error(`Gagal memuat ${label} (cek koneksi Turso):`, result.reason);
      };

      apply("berita", n, setNews);
      apply("kategori berita", nc, setNewsCategories);
      apply("lowongan", j, setJobs);
      apply("lamaran", a, setApplications);
      apply("tata kelola", g, setGovernance);
      apply("identitas admin", me, (v) => setAdminEmail(v.email));
      setLoading(false);
    })();
    return () => {
      active = false;
    };
    // `role` comes from the server layout and is fixed for the session; listed
    // only to satisfy the exhaustive-deps rule.
  }, [role]);

  const store: Store = {
    news,
    newsCategories,
    jobs,
    applications,
    adminEmail,
    role,
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
    saveNewsCategory: async (c) => {
      const res = await api.saveNewsCategory(c);
      if (res?.error) throw new Error(res.error);
      // The server derives the slug (and the position of a new row), so store
      // what it wrote rather than what was sent.
      const saved = res.category ?? c;
      setNewsCategories((prev) =>
        prev.some((x) => x.id === saved.id)
          ? prev.map((x) => (x.id === saved.id ? saved : x))
          : [...prev, saved],
      );
    },
    deleteNewsCategory: async (id) => {
      await api.deleteNewsCategory(id);
      setNewsCategories((prev) => prev.filter((x) => x.id !== id));
      // The action un-files every article in the category; mirror that locally
      // so the Berita list doesn't keep showing a tab that no longer exists.
      setNews((prev) =>
        prev.map((x) => (x.categoryId === id ? { ...x, categoryId: "" } : x)),
      );
    },
    moveNewsCategory: async (id, direction) => {
      const order = await api.moveNewsCategory(id, direction);
      if (order === null) {
        setNewsCategories((prev) => prev.filter((x) => x.id !== id));
        return;
      }
      const rank = new Map(order.map((categoryId, i) => [categoryId, i]));
      setNewsCategories((prev) =>
        prev.map((x) => (rank.has(x.id) ? { ...x, sortOrder: rank.get(x.id)! } : x)),
      );
    },
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
