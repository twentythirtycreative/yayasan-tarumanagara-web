import { cn } from "@/lib/utils";

// Renders a real country flag image keyed off the ISO 3166-1 alpha-2 code.
// We can't rely on flag emoji (🇮🇩, 🇺🇸…): Windows browsers don't render the
// regional-indicator glyphs and fall back to the bare letters ("ID", "US"),
// so we use raster flags from flagcdn.com instead.
export function FlagIcon({
  iso,
  className,
}: {
  iso: string;
  className?: string;
}) {
  const code = iso.toLowerCase();
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/h20/${code}.png`}
      srcSet={`https://flagcdn.com/h40/${code}.png 2x`}
      width={20}
      height={15}
      loading="lazy"
      alt={iso}
      className={cn(
        "inline-block h-[15px] w-5 shrink-0 rounded-[2px] object-cover",
        className,
      )}
    />
  );
}
