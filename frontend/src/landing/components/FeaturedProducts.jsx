import { ArrowRight, Plus } from "lucide-react";

const PRODUCTS = [
  {
    id: 1,
    name: "Ivory Sozni Shawl",
    price: "Rs. 46,000",
    img: "/storefront/prod-1.png",
    weave: "Diamond",
    time: "120 Hrs",
  },
  {
    id: 2,
    name: "Midnight Garden Shawl",
    price: "Rs. 42,000",
    img: "/storefront/prod-2.png",
    weave: "Twill",
    time: "240 Hrs",
  },
  {
    id: 3,
    name: "Sand Pashmina Stole",
    price: "Rs. 18,000",
    img: "/storefront/prod-3.png",
    weave: "Plain",
    time: "45 Hrs",
  },
];

function ProductCard({ p }) {
  return (
    <div className="group flex flex-col">
      {/* Image */}
      <div
        className="relative overflow-hidden rounded-[2px] bg-[#EFE9E1]"
        style={{ aspectRatio: "4/5" }}
      >
        <img
          src={p.img}
          alt={p.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
      </div>

      {/* Title + plus button row */}
      <div className="mt-4 flex items-center justify-between gap-3 sm:mt-5">
        <h3 className="font-serif text-[15px] font-normal leading-snug text-[#1C1916] sm:text-[16px]">
          {p.name}
        </h3>
        <button
          aria-label={`Add ${p.name} to bag`}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#1C1916]/20 text-[#1C1916] transition-colors duration-200 hover:border-[#1C1916] hover:bg-[#1C1916] hover:text-white sm:h-8 sm:w-8"
        >
          <Plus size={13} strokeWidth={1.5} />
        </button>
      </div>

      {/* Material + price row */}
      <div className="mt-1.5 flex items-center justify-between text-[12px] text-[#6B6560] sm:text-[13px]">
        <span className="font-sans font-light">Pashmina</span>
        <span className="font-sans font-normal text-[#1C1916]">{p.price}</span>
      </div>

      {/* Weave / Time meta row */}
      <div className="mt-3.5 border-t border-[#ECE7E1] pt-3.5 sm:mt-4 sm:pt-4 grid grid-cols-2 gap-3">
        <div>
          <span className="block font-sans text-[9px] font-semibold tracking-[0.15em] uppercase text-[#B8AFA5] mb-1">
            Weave
          </span>
          <span className="block font-sans text-[12px] text-[#1C1916] sm:text-[13px]">
            {p.weave}
          </span>
        </div>
        <div>
          <span className="block font-sans text-[9px] font-semibold tracking-[0.15em] uppercase text-[#B8AFA5] mb-1">
            Time
          </span>
          <span className="block font-sans text-[12px] text-[#1C1916] sm:text-[13px]">
            {p.time}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function FeaturedProducts() {
  return (
    <section className="overflow-hidden bg-[#FAF8F5] py-20 sm:py-28 lg:py-36">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-10 lg:px-16 w-full">
        <div className="flex flex-col items-start justify-between gap-5 mb-12 sm:mb-16 sm:flex-row sm:items-end sm:gap-8">
          <h2
            className="font-serif font-normal text-[#1C1916]"
            style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)" }}
          >
            Carefully Crafted for you
          </h2>

          <a
            href="#"
            className="inline-flex items-center gap-2 whitespace-nowrap font-sans text-[9px] font-semibold uppercase tracking-[0.2em] text-[#6B6560] transition-colors duration-200 hover:text-[#1C1916] sm:text-[10px]"
          >
            View All
            <ArrowRight size={12} strokeWidth={1.5} />
          </a>
        </div>

        <div className="relative z-0 grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-9 lg:grid-cols-3 lg:gap-12 xl:gap-14">
          {PRODUCTS.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

