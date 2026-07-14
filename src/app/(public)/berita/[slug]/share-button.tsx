"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";

export function ShareButton({ title }: { title: string }) {
  const onShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Tautan disalin");
      }
    } catch {
      /* dismissed */
    }
  };
  return (
    <button
      type="button"
      onClick={onShare}
      style={{
        backgroundImage:
          "linear-gradient(163.08deg, rgba(237,245,255,0.46) 58.52%, rgba(255,255,255,0) 99.23%)",
      }}
      className="glass-rim inline-flex cursor-pointer items-center gap-2 rounded-[78px] px-5 py-2.5 text-[14px] font-semibold text-[#015ddb] shadow-[0px_4px_4.1px_rgba(0,0,0,0.07)] backdrop-blur-sm transition-transform hover:scale-[1.03]"
    >
      <Share2 className="h-4 w-4" />
      Bagikan
    </button>
  );
}
