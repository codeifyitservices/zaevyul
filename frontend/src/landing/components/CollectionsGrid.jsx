import { ArrowRight } from "lucide-react";

const CATEGORIES = [
  { id: "shawls", label: "Shawls", img: "/storefront/cat-shawls.png" },
  { id: "stoles", label: "Stoles", img: "/storefront/cat-stoles.png" },
  { id: "embroidered", label: "Embroidered", img: "/storefront/cat-embroidered.png" },
  { id: "scarves", label: "Scarves", img: "/storefront/cat-scarves.png" },
];

function ColCard({ cat, className = "" }) {
  return (
    <a
      href={`/collections/${cat.id}`}
      className={`group relative block h-full w-full overflow-hidden rounded-[2px] ${className}`}
    >
      <img
        src={cat.img}
        alt={cat.label}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
      <div className="absolute bottom-5 left-5 sm:bottom-7 sm:left-7">
        <span className="block font-serif text-[21px] font-normal leading-none text-white sm:text-[26px]">
          {cat.label}
        </span>
        <span className="mt-2 inline-flex items-center gap-1.5 font-sans text-[9px] font-medium uppercase tracking-[0.12em] text-white/72 sm:text-[10px]">
          Explore <ArrowRight size={11} strokeWidth={1.5} />
        </span>
      </div>
    </a>
  );
}

export default function CollectionsGrid() {
  return (
    <section id="collections" className="overflow-hidden bg-[#F3ECE3] py-20 sm:py-28 lg:py-36">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-10 lg:px-16 w-full">
        <div className="text-center mb-16 sm:mb-20">
          <p className="mb-3 font-sans text-[10px] font-semibold uppercase tracking-[0.3em] text-[#B58A5B] sm:mb-4">
            Collections
          </p>
          <h2
            className="font-serif font-normal text-[#1C1916]"
            style={{ fontSize: "clamp(2rem, 3.8vw, 3.85rem)" }}
          >
            Curated for Every Moment.
          </h2>
        </div>

        <div className="relative z-0 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 sm:[grid-template-rows:280px_280px] lg:gap-5 lg:[grid-template-rows:380px_300px]">
          <ColCard cat={CATEGORIES[0]} className="h-[360px] sm:h-full sm:row-span-2" />

          <div className="grid h-[230px] grid-cols-2 gap-3 sm:h-full sm:gap-4 lg:gap-5">
            <ColCard cat={CATEGORIES[1]} />
            <ColCard cat={CATEGORIES[2]} />
          </div>

          <ColCard cat={CATEGORIES[3]} className="h-[240px] sm:h-full" />
        </div>
      </div>
    </section>
  );
}

