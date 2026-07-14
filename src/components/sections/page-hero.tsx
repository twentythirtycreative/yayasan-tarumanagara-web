import Image from "next/image";

export function PageHero({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="relative flex min-h-[46vh] items-end overflow-hidden pb-14 pt-32">
      <Image
        src="/images/hero-a.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-navy/85 via-navy/60 to-navy/85" />
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 text-white">
        <h1 className="text-header font-extrabold">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl text-body text-white/80">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
