"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

// Figma "Tentang Kami (BARU)", four states: 16:3412 and 16:3528 (collapsed) →
// 16:3294 (Candra Naya open) → 16:3645 (Tarumanagara open). A full-bleed photo
// band with glass cards floating over its right half. Opening a card swaps the
// band photo underneath it: the Candra Naya story runs over the 1900s Candra
// Naya house, the Tarumanagara story over the Untar tower.
//
// 16:3412 and 16:3528 are the same collapsed layout over the two different
// photos: the band follows whichever card you have scrolled to, so it starts on
// the Candra Naya house and turns into the Untar tower as the Tarumanagara card
// comes up. Figma wires those two frames to each other with an AFTER_TIMEOUT at
// 3s, which is only how a prototype fakes a swap it cannot drive from scroll —
// the real trigger is the scroll position, not a timer.
//
// Once a card is open the band is pinned to that story's photo: it sticks to the
// top of the viewport and the card scrolls over it, which is the only way the
// three open frames can show the same photo behind 2000px of copy. Collapsed, it
// goes back to scrolling with the page like any other section.
const ease = [0.22, 1, 0.36, 1] as const;

type Topic = "candra" | "tarumanagara";

// Each story frames its own photo. Both are cropped by `cover` against the
// band, and neither has room to spare — candra-naya.jpg is 1734x1192 (1.455)
// and hero-untar.jpg 1332x882 (1.510) against a 1.466 band, so cover is
// width-driven and crops vertically, leaving 0px and 43px of horizontal slack.
// That is why the `object-[12%_50%]` these replace moved nothing at all.
//
// So a sideways shift has to buy its own room, and the price is fixed: moving
// by s leaves s of the band bare on the far side, and covering it needs
// (zoom-1)/2 >= s of slack, hence zoom = 1 + 2s. That holds however it is
// written — transform, oversized layer box, or object-position — so the two
// numbers always move together.
const photos: Record<Topic, { src: string; alt: string; frame: string }> = {
  candra: {
    src: "/images/candra-naya.jpg",
    alt: "Rumah Candra Naya, kediaman Mayor Khouw Kim An di kawasan Gajah Mada, Jakarta",
    // Mirrored, moved right by 5% and sitting at 45% down the source, which
    // lifts the house clear of the courtyard in the foreground.
    //
    // The mirror is free; the sideways shift is what costs the 1.1x, and the
    // two cannot be set independently — a shift of s strands s of the band on
    // the far side, so the scale can never go below 1 + 2s. Each step down in
    // zoom has taken the shift with it: 1.4/20%, then 1.3/15%, now 1.1/5%.
    // This is the end of that road — 1.0 is a plain cover crop with no
    // sideways movement available at all.
    //
    // Magnitude is written on both axes, x carrying the sign, because scaling
    // x alone would stretch the house. Two utilities rather than
    // `scale-[1.1] -scale-x-100`, which would leave x to whichever class
    // Tailwind emitted last. Nothing in this photo reads as text, so the
    // mirror shows nothing backwards.
    frame: "translate-x-[5%] -scale-x-110 scale-y-110 object-[center_45%]",
  },
  tarumanagara: {
    src: "/images/hero-untar.jpg",
    alt: "Gedung Universitas Tarumanagara",
    // Mirrored, then moved 10% left of centre. The flip itself is free — it
    // moves no edge — but the shift is not, so the magnitude goes to 1.2 on
    // both axes: x carries the sign, y has to match it or the tower stretches.
    // Written as two utilities rather than `scale-[1.2] -scale-x-100`, which
    // would leave the x value up to whichever class Tailwind emitted last.
    //
    // The translate is unscaled by the 1.2 — CSS applies the individual
    // `translate` property before `scale` — so it stays 10% of the band, and
    // it reads as leftward on screen despite the mirror.
    //
    // The flip does mirror the signage: the tower wears "UNTAR" across its
    // glass face and the Tarumanagara shield on the white pier, and both read
    // backwards here. Asked for and confirmed.
    //
    // Vertically it sits at 5%, near the top edge of the source, which pushes
    // the tower down about as far as the photo allows.
    frame: "-translate-x-[10%] -scale-x-120 scale-y-120 object-[center_5%]",
  },
};

// Figma sets these at 80px; the site caps section headers at text-header (60px)
// and every other 80px Figma heading on this page already renders through it, so
// the card titles go through the same token rather than reintroducing a raw size.
const titles: Record<Topic, React.ReactNode> = {
  candra: (
    <>
      <span className="block font-normal italic">Sejarah Singkat</span>
      {/* pb/-mb: bg-clip-text paints the gradient only inside the span's own
          box, and text-header runs at line-height 1 — so the descender of "y"
          fell outside it and came out clipped. The padding grows the painted
          box, the negative margin gives the space back to the layout. Same fix
          as the hero's "Menginspirasi". */}
      <span className="-mb-[0.18em] block bg-gradient-to-r from-[#262626] to-[#8c8c8c] bg-clip-text pb-[0.18em] font-extrabold text-transparent">
        Candra Naya
      </span>
    </>
  ),
  tarumanagara: (
    <>
      <span className="block font-normal italic">Sejarah</span>
      <span className="block font-extrabold text-[#00357d]">Tarumanagara</span>
    </>
  ),
};

const shortLabels: Record<Topic, string> = {
  candra: "Sejarah Candra Naya",
  tarumanagara: "Sejarah Tarumanagara",
};

// Paragraphs in the order Figma stacks them by y, not by node id — 1:2248 sits
// above 1:2247 in the Tarumanagara card even though it comes later in the tree.
const bodies: Record<Topic, string[]> = {
  candra: [
    "Candra Naya merupakan salah satu organisasi sosial tertua masyarakat Tionghoa di Indonesia yang berakar pada tradisi kepedulian sosial dan pengabdian kepada masyarakat sejak masa Hindia Belanda. Organisasi ini berkembang sebagai wadah untuk memajukan pendidikan, kesehatan, kegiatan sosial, olahraga, dan kesejahteraan masyarakat, sekaligus menjadi tempat berhimpunnya para tokoh yang memiliki semangat kebangsaan dan pengabdian.",
    "Nama Candra Naya juga melekat pada sebuah bangunan cagar budaya bersejarah di kawasan Gajah Mada, Jakarta Barat, yang dahulu merupakan kediaman Mayor Tionghoa Khouw Kim An. Dalam perkembangannya, kompleks tersebut digunakan sebagai pusat berbagai kegiatan sosial, pendidikan, kesehatan, olahraga, dan kemasyarakatan yang diselenggarakan oleh perkumpulan yang sebelumnya dikenal dengan nama Sin Ming Hui dan kemudian menjadi Perkumpulan Sosial Candra Naya.",
    "Dalam konteks sejarah Yayasan Tarumanagara, Candra Naya memiliki arti penting sebagai salah satu ruang bertumbuhnya berbagai gagasan dan kegiatan pengabdian di bidang pendidikan dan pelayanan sosial. Berlandaskan semangat tersebut, sejumlah tokoh yang tergabung dalam Perkumpulan Sosial Candra Naya kemudian mendirikan Yayasan Tarumanagara pada 18 Juni 1959.",
    "Nilai kepedulian sosial, semangat kebangsaan, serta komitmen terhadap pembangunan sumber daya manusia yang diwariskan oleh Candra Naya kemudian menjadi salah satu fondasi penting dalam perjalanan Yayasan Tarumanagara dan perkembangan institusi-institusi yang berada di bawah naungannya, termasuk Universitas Tarumanagara.",
  ],
  tarumanagara: [
    "Yayasan Tarumanagara didirikan pada 18 Juni 1959 oleh sejumlah tokoh masyarakat keturunan Tionghoa yang tergabung dalam Perhimpunan Sosial Candra Naya di kawasan Gajah Mada, Jakarta Barat. Pendirian Yayasan dilandasi oleh semangat kebangsaan, kepedulian sosial, serta tekad untuk memberikan kontribusi nyata dalam mencerdaskan kehidupan bangsa dan meningkatkan kesejahteraan masyarakat.",
    "Nama “Tarumanagara” diusulkan oleh M. Said dengan mengambil inspirasi dari Kerajaan Tarumanagara, salah satu kerajaan tertua di Nusantara yang pernah berkembang di wilayah Jawa Barat. Nama tersebut dipilih sebagai simbol kejayaan, ketangguhan, semangat kemajuan, serta penghormatan terhadap nilai-nilai luhur bangsa Indonesia.",
    "Sejak awal berdirinya, Yayasan Tarumanagara memusatkan pengabdiannya pada bidang pendidikan dan kesehatan. Melalui kedua bidang tersebut, Yayasan berupaya membuka akses terhadap pendidikan yang bermutu, mengembangkan ilmu pengetahuan dan keahlian, serta menyediakan pelayanan kesehatan yang profesional dan berorientasi pada kebutuhan masyarakat.",
    "Dalam perjalanan lebih dari enam dekade, Yayasan Tarumanagara terus bertumbuh dan bertransformasi menjadi institusi yang menaungi berbagai unit pendidikan, kesehatan, fasilitas hunian, properti, inovasi, serta pengembangan usaha. Di bidang pendidikan, Yayasan menaungi Universitas Tarumanagara (UNTAR), Institut Tarumanagara (ITARU) dan Tarumanagara Xinya College. Di bidang kesehatan, Yayasan mengembangkan pelayanan melalui Rumah Sakit Royal Taruma yang dikelola oleh PT Taruma Bhakti Medika.",
    "Untuk mendukung pengalaman belajar dan kehidupan mahasiswa secara menyeluruh, Yayasan juga mengembangkan UNTAR Residence (URES) sebagai fasilitas hunian yang aman, nyaman, dan kondusif bagi kehidupan akademik. Pengembangan aset dan sektor properti dikelola melalui PT Taruma Bhakti Usaha.",
    "Sebagai wujud komitmen terhadap inovasi dan pengembangan berkelanjutan, Yayasan Tarumanagara membentuk Tarumanagara Enterprise sebagai unit inovasi dan pengembangan. Unit ini berperan dalam membangun ekosistem kewirausahaan, mengembangkan program dan model usaha baru, memperkuat kolaborasi dengan industri dan mitra internasional, serta mendorong lahirnya talenta, gagasan, dan solusi yang memberikan nilai tambah bagi seluruh ekosistem Tarumanagara dan masyarakat.",
    "Perkembangan tersebut mencerminkan komitmen Yayasan Tarumanagara untuk terus beradaptasi terhadap perubahan zaman tanpa meninggalkan nilai-nilai luhur yang menjadi landasan pendiriannya. Dengan menjunjung tinggi Integritas, Profesionalisme, dan Entrepreneurship, Yayasan terus memperkuat perannya dalam membangun sumber daya manusia yang unggul, mandiri, beretika, inovatif, dan mampu memberikan kontribusi nyata bagi masyarakat.",
    "Memasuki era transformasi dan inovasi, Yayasan Tarumanagara tidak hanya berfokus pada penyelenggaraan pendidikan dan layanan kesehatan, tetapi juga membangun ekosistem yang mengintegrasikan pendidikan, kesehatan, hunian, properti, kewirausahaan, inovasi, serta pengembangan usaha secara berkelanjutan.",
    "Hingga saat ini, Yayasan Tarumanagara terus melanjutkan cita-cita para pendirinya untuk menjadi yayasan terkemuka yang berperan aktif dalam mencerdaskan dan menyejahterakan bangsa melalui pendidikan, kesehatan, inovasi, dan pengembangan usaha yang berkelanjutan.",
  ],
};

// Figma: rounded 48, 16/19/51.6 shadow at 6%, and a white-to-periwinkle gradient
// whose stops sit far outside the box so only the tail of the blue reaches the
// bottom-right corner.
//
// Padding is even, 68px a side, where Figma is lopsided: 16:3511 is a 727px
// card with a 590px content column at x=82, i.e. 82 left and 55 right. 68 is
// the average of those two, so the content column keeps the width Figma gave
// it (591 against 590) and only the imbalance goes away.
//
// Two deliberate departures from Figma, both about the fill hiding the
// backdrop. White is 0.88 rather than 0.799, which keeps the card readable
// where it hangs past the photo onto the page surface — the blur can't help
// there, because this section's z-index makes it a backdrop root and the blur
// only ever samples the section's own photo. And the blur stays at 24px rather
// than Figma's 47 (collapsed / Candra Naya) and 70 (Tarumanagara): behind an
// 88% white fill those are indistinguishable from 24, and a 70px blur over a
// card that runs past 2000px tall is enough compositing work to drop frames.
const cardClass =
  "glass-rim rounded-[28px] bg-[linear-gradient(174deg,rgba(255,255,255,0.88)_75.152%,rgba(136,155,211,0.85)_125.37%)] px-6 shadow-[16px_19px_51.6px_rgba(0,0,0,0.06)] backdrop-blur-[24px] sm:rounded-[48px] sm:px-9 lg:px-[68px]";

// Figma 16:3525 / 16:3757 — same tinted glass for both the "Selengkapnya" pill
// and the pill that swaps to the other story. Hover and cursor are left to the
// call site: in the collapsed card the pill is a <span> inside a card-wide
// button, so it lifts on group-hover rather than on its own.
const pillClass =
  "glass-rim inline-flex h-[50px] items-center rounded-[72px] bg-[rgba(1,93,219,0.06)] text-headline font-bold text-[#00357d] shadow-[0px_4px_4px_rgba(0,0,0,0.14)] backdrop-blur-sm transition-transform";

export function SejarahBand() {
  const [open, setOpen] = useState<Topic | null>(null);
  // Which photo the band is showing while nothing is open — Candra Naya until
  // you scroll far enough for the Tarumanagara card to take over. An open card
  // pins the band to its own photo instead.
  const [cycled, setCycled] = useState<Topic>("candra");
  const sectionRef = useRef<HTMLElement>(null);

  // Open, swap and close all move the card's top a long way — every trigger sits
  // at the bottom of a card that can be 2000px tall — so each one scrolls the
  // band back under the navbar.
  //
  // This has to run from an effect, not from the click handler, and it has to
  // measure the <section>, not the card column. Firing it inside the handler
  // scrolled against the pre-render layout, and the column carries motion's
  // `layout` prop, so mid-animation it is under a transform and reports a
  // position that is off by however far the animation has travelled — hence the
  // scroll landing correctly only some of the time. The section never animates.
  //
  // One jump isn't enough. The section is only as tall as its card, so the page
  // reflows for most of a second after the click — the exit, the enter and the
  // column's `layout` transition all resize it — and a jump launched into that
  // lands hundreds of pixels short. So it jumps immediately, then re-measures
  // once the layout has settled and corrects if it has drifted.
  // Guard on the PREVIOUS value of `open`, not a boolean "have I run once" flag.
  // A `first.current` flag is not Strict-Mode safe: React dev-remounts the
  // component (effect → cleanup → effect) while the ref survives, so the second
  // pass sailed through the guard and scrolled the page down to this section the
  // moment /tentang-kami opened. Comparing values makes that re-run a no-op —
  // `open` hasn't changed — while every real open/swap/close still scrolls.
  const prevOpen = useRef<Topic | null | undefined>(undefined);
  useEffect(() => {
    const previous = prevOpen.current;
    if (previous === open) return;
    prevOpen.current = open;
    if (previous === undefined) return; // first render: nothing was opened yet
    const el = sectionRef.current;
    if (!el) return;
    // scroll-mt on the <section> is the single source of truth for the offset.
    const target = () =>
      el.getBoundingClientRect().top +
      window.scrollY -
      (parseFloat(getComputedStyle(el).scrollMarginTop) || 0);

    const raf = requestAnimationFrame(() => window.scrollTo({ top: target() }));
    const settle = setTimeout(() => {
      const top = target();
      if (Math.abs(window.scrollY - top) > 2) window.scrollTo({ top });
    }, 900);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(settle);
    };
  }, [open]);

  // Collapsed, the band follows the card you have scrolled to (Figma 16:3412 →
  // 16:3528): whichever card's centre is nearest the centre of the viewport
  // owns the photo behind it.
  //
  // "Nearest centre", not an IntersectionObserver on a midline, which is what
  // this used to be. A midline hands the band over the instant the Tarumanagara
  // card's top edge crosses it — and at that moment the Candra Naya card still
  // fills the upper half of the screen, so you are reading "Sejarah Singkat
  // Candra Naya" over a photo of the Untar tower. Comparing centres moves the
  // handover to the midpoint between the two cards, where the card you are
  // actually looking at is the one the band is showing.
  const cards = useRef(new Map<Topic, HTMLElement>());
  const watchCard = useCallback((node: HTMLDivElement) => {
    const topic = node.dataset.topic as Topic;
    cards.current.set(topic, node);
    return () => {
      cards.current.delete(topic);
    };
  }, []);

  useEffect(() => {
    // An open card pins the band to its own story, so there is nothing to track
    // until the collapsed pair is back.
    if (open !== null) return;
    let frame = 0;
    const pick = () => {
      frame = 0;
      const middle = window.innerHeight / 2;
      let nearest: Topic | null = null;
      let best = Infinity;
      for (const [topic, node] of cards.current) {
        const box = node.getBoundingClientRect();
        const distance = Math.abs(box.top + box.height / 2 - middle);
        if (distance < best) {
          best = distance;
          nearest = topic;
        }
      }
      if (nearest) setCycled(nearest);
    };
    // Deferred to a frame rather than called here, both to let the collapsed
    // pair finish mounting — AnimatePresence runs in `wait` mode, so it lands a
    // beat after `open` clears — and to keep the state write out of the effect
    // body itself.
    const onScroll = () => {
      frame ||= requestAnimationFrame(pick);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  // Opening or swapping pins the band to that story, and leaves it there when
  // the card closes — until the next scroll hands it back to the observer.
  const show = (topic: Topic) => {
    setCycled(topic);
    setOpen(topic);
  };

  const active = open ?? cycled;

  return (
    // The band is one photo. Collapsed it scrolls with the page like any other
    // section, sized to its cards — a screen tall from md up, only as tall as
    // it needs to be below that. Open, it goes sticky and stays put, one screen
    // at every width, while the card — 2014px of it, for Tarumanagara —
    // travels across a photo that never moves, and only leaves once the section
    // does.
    //
    // The two states hang the photo differently, because they want opposite
    // things from it.
    //
    // Open, sticky means the band has to be in flow, which is what --band is
    // for: the band is that tall, the card column is pulled back over it by
    // exactly the same amount, and the section takes its floor from it too. So
    // the section ends up as tall as its card and no taller — an open card
    // hangs past the photo onto the page surface, and Visi always starts below
    // the card rather than behind it. That last part is what Figma does: the
    // collapsed page is 3659 tall, Candra Naya open 3962, Tarumanagara open
    // 4897, and in each one Visi sits clear of the card (16:3294 leaves 90px,
    // 16:3645 leaves 31px).
    //
    // Collapsed there is nothing to pin, so the photo comes out of flow and
    // fills the section instead — `absolute inset-0`, so it is exactly as tall
    // as the section however tall the two cards make it. That is what --band
    // could not do: as a fixed height it was a ceiling on the photo but not on
    // the cards, and the pair plus the top padding already runs past one screen
    // at common viewport heights, so the overflow came out as a white strip
    // under the photo and cards drifting toward Visi. Now --band is at most a
    // floor (min-h, and only from md up) and the photo follows the content
    // from there.
    //
    // With the photo out of flow the padding can go on the section, the same
    // clamp top and bottom, and the cards centre inside it — so the two boxes
    // sit evenly in the photo at every height rather than 142px down from the
    // top and flush against the bottom.
    //
    // z-20, not z-10: the Visi section that follows is `relative` with no
    // z-index of its own, so it never opens a stacking context and its inner
    // z-10 text column lands in the root one. At z-10 that column tied with this
    // section and won on DOM order, printing Visi's paragraph through the card
    // while it animates in and out. Stays under the navbar's z-50.
    <section
      ref={sectionRef}
      // One screen tall, replacing Figma's fixed 982px (and the vw clamp that
      // tracked it).
      //
      // lvh — the viewport with the mobile toolbars retracted — and not dvh or
      // svh. dvh resizes as the toolbar collapses, and since the card column is
      // pulled up by exactly this height, a unit that changes mid-scroll drags
      // the cards with it. svh is stable but it is the SMALLEST viewport, i.e.
      // shorter than what you are actually looking at the moment the toolbar
      // retracts: the pinned band then stopped ~50px above the bottom of the
      // screen and the white page surface showed through under the photo for
      // the whole of an open card. lvh is stable AND never shorter than the
      // visible area, so the band always reaches the bottom edge; the cost is
      // only that its last strip sits below the fold while the toolbar is out,
      // which cover simply crops. (Tailwind v4 already needs a browser newer
      // than lvh's support.)
      style={{ "--band": "100lvh" } as React.CSSProperties}
      // The one-screen floor is a floor, not a height: an open card is far
      // taller and the section grows past the photo onto the page surface,
      // which is what keeps Visi below the card. Who needs the floor depends on
      // the state, so each branch asks for it separately.
      //
      // Open, always — that is the pinned band, and it has to be a screen tall
      // at every width for the card to have something to travel across.
      //
      // Collapsed, only from md up. On a desktop the floor is the point: the
      // cards are a 727px column against the right half, so the photo needs the
      // height to read as a full-bleed band at all. On a phone they are
      // full-width blocks stacked with 48px of padding, so the photo is almost
      // entirely behind them either way and the floor buys nothing but empty
      // screen — a viewport of dead space before Visi. Below md the section is
      // just as tall as the two cards need, and only grows to a screen when a
      // card opens and there is actually something to scroll past.
      //
      // Collapsed also carries the padding and centres the cards in what is
      // left. justify-center is not redundant with the symmetric padding: the
      // padding only balances the two ends once the content is the thing
      // setting the height, and above md the floor can still leave slack the
      // cards would otherwise take entirely at the bottom.
      className={`relative z-20 scroll-mt-[100px] bg-surface ${
        open === null
          ? "flex flex-col justify-center py-[clamp(48px,9.9vw,142px)] md:min-h-[var(--band)]"
          : "min-h-[var(--band)]"
      }`}
    >
      {/* Both photos stay mounted and cross-fade on opacity rather than
          swapping through AnimatePresence: the band changes on scroll, and a
          lazily-mounted <Image> would leave it empty for however long the first
          swap takes to fetch. */}
      <div
        className={
          open
            ? "sticky top-0 h-[var(--band)] overflow-hidden"
            : "absolute inset-0 overflow-hidden"
        }
      >
        {(["candra", "tarumanagara"] as const).map((topic) => (
          // A plain CSS transition rather than a motion.div: nothing mounts or
          // unmounts here, only two opacities flip, and that is all a
          // transition needs. It also keeps the scroll-driven swap off the same
          // animation runtime as the card open/close.
          <div
            key={topic}
            aria-hidden={active !== topic}
            className={`absolute inset-0 transition-opacity duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              active === topic ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={photos[topic].src}
              alt={photos[topic].alt}
              fill
              sizes="100vw"
              // Framing is per-photo; see `photos` for each one and what it
              // costs. The vertical half of it — the object-position — is the
              // free half: cover is width-driven against a band this wide, so
              // all the overflow is vertical and there is slack sitting there
              // either way. The percentage is where the window sits in the
              // source, so 0% is its top edge and drops the photo as low as it
              // will go, and raising the number lifts the photo back up.
              className={`${photos[topic].frame} object-cover`}
            />
          </div>
        ))}
      </div>

      {/* Open, the column is pulled back up over the sticky band by its full
          height so the card sits on the photo, and pb is Figma's 90px gap
          between the bottom of the card and Visi (16:3294) — the card is taller
          than the band, so that gap lands on the page surface below it.
          Collapsed, none of this applies: the photo is out of flow and there is
          nothing to pull back over, so the spacing is the section's own
          symmetric padding and the column just sits in it. */}
      <div
        className={`site-container relative ${
          open !== null
            ? "mt-[calc(var(--band)*-1)] pt-[clamp(48px,9.9vw,142px)] pb-20 sm:pb-28 md:pb-[90px]"
            : ""
        }`}
      >
        {/* Figma puts the cards at x=624..1351 of 1440 — a 727px column hugging
            the right. Below md they take the full width instead of sitting in a
            column too narrow to hold an 80px heading. */}
        <motion.div
          layout
          transition={{ duration: 0.5, ease }}
          className="md:ml-auto md:w-[57%] md:min-w-[520px] md:max-w-[727px]"
        >
          <AnimatePresence initial={false} mode="wait">
            {open === null ? (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease }}
                className="flex flex-col gap-8"
              >
                {(["candra", "tarumanagara"] as const).map((topic) => (
                  <div
                    key={topic}
                    ref={watchCard}
                    data-topic={topic}
                    className={`${cardClass} group pt-8 pb-8 sm:pt-12 sm:pb-10 lg:pt-[63px] lg:pb-[47px]`}
                  >
                    <h2 className="text-header font-extrabold text-[#262626]">
                      {titles[topic]}
                    </h2>
                    <span className={`${pillClass} mt-6 px-[29px] group-hover:scale-[1.03]`}>
                      Selengkapnya
                    </span>
                    {/* Figma hangs the click on the card background (16:3512 /
                        16:3513), not on the pill, so the whole card is the
                        target. It's a sibling overlay rather than a <button>
                        wrapped around the card because a heading isn't valid
                        inside a button — this keeps one control, one
                        accessible name, and the <h2> intact. */}
                    <button
                      type="button"
                      onClick={() => show(topic)}
                      className="absolute inset-0 z-10 cursor-pointer rounded-[28px] sm:rounded-[48px]"
                    >
                      <span className="sr-only">
                        Selengkapnya — {shortLabels[topic]}
                      </span>
                    </button>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key={open}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease }}
                className={`${cardClass} pt-8 pb-8 sm:pt-12 sm:pb-10 lg:pt-[63px] lg:pb-[43px]`}
              >
                <h2 className="text-header font-extrabold text-[#262626]">
                  {titles[open]}
                </h2>
                <div className="mt-8 max-w-[557px] space-y-[26px] text-body font-medium text-[#262626] sm:mt-9">
                  {bodies[open].map((paragraph) => (
                    <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                  ))}
                </div>
                {/* Both open states carry the swap pill (16:3405 →
                    Tarumanagara, 16:3756 → Candra Naya) and that is the only
                    control on an open card: the prototype cycles between the
                    two forever and never returns to the two-card view, so
                    there is no close.
                    Alignment goes by the pill's own label, not by the card it
                    sits on, and the pill always names the *other* story: the
                    "Sejarah Tarumanagara" pill is the one on the Candra Naya
                    card, and it goes right; the "Sejarah Candra Naya" pill sits
                    on the Tarumanagara card and goes left. That lands exactly
                    on Figma, which right-aligns 16:3405 and left-aligns
                    16:3756. So the pill does change sides when you swap — which
                    is useful, being the one moving part that tells you the card
                    underneath actually changed. */}
                <div
                  className={`mt-10 flex ${open === "candra" ? "justify-end" : ""}`}
                >
                  <button
                    type="button"
                    onClick={() => show(open === "candra" ? "tarumanagara" : "candra")}
                    className={`${pillClass} cursor-pointer gap-3 pl-[29px] pr-[7px] hover:scale-[1.03]`}
                  >
                    {shortLabels[open === "candra" ? "tarumanagara" : "candra"]}
                    {/* Figma 16:3760 — 36px puck, its own faint glass gradient
                        and a 4/4.1 shadow at 7%, around a 24px arrow. */}
                    <span className="glass-rim grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[linear-gradient(132deg,rgba(237,245,255,0.46)_58.52%,rgba(255,255,255,0)_99.225%)] shadow-[0px_4px_4.1px_rgba(0,0,0,0.07)]">
                      <ArrowUpRight className="h-6 w-6" />
                    </span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
