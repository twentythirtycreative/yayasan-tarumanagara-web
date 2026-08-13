import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/sections/page-hero";
import { Reveal } from "@/components/motion/reveal";
import { units } from "@/lib/site";

export function generateStaticParams() {
  return units.map((u) => ({ slug: u.slug }));
}

// The unit list is a compile-time constant, so these five pages are the only
// ones that can exist. Without this, any /unit/<anything> a crawler or scanner
// invents is rendered on demand and its 404 written to the ISR cache — a billed
// write per invented URL. false serves the 404 straight from the edge instead.
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const unit = units.find((u) => u.slug === slug);
  return { title: unit?.label ?? "Unit Usaha" };
}

export default async function UnitPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const unit = units.find((u) => u.slug === slug);
  if (!unit) notFound();

  return (
    <>
      <PageHero
        title={unit.label}
        subtitle="Informasi lengkap unit ini akan dilengkapi sesuai materi dari Figma."
      />
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <p className="text-body text-ink/75">
              Halaman {unit.label} menampilkan profil, layanan, dan kegiatan
              unit usaha di bawah Yayasan Tarumanagara.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
