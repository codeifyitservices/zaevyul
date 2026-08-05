import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Search,
  Heart,
  ShoppingBag,
  Filter,
  Grid,
  List,
  ChevronDown,
  ChevronUp,
  Plus,
  ArrowRight,
  X,
  Menu,
} from "lucide-react";
import SiteFooter from "./components/SiteFooter";
import Navbar from "./components/Navbar";

const PRODUCTS = [
  {
    id: 1,
    name: "Ivory Sozni Shawl",
    price: "₹ 48,000",
    img: "/storefront/prod-1.png",
  },
  {
    id: 2,
    name: "Embroidered Shawl",
    price: "₹ 52,000",
    img: "/storefront/cat-embroidered.png",
  },
  {
    id: 3,
    name: "Vertical Sand Stole",
    price: "₹ 25,000",
    img: "/storefront/prod-3.png",
  },
  {
    id: 4,
    name: "Square Midnight Shawl",
    price: "₹ 42,000",
    img: "/storefront/prod-2.png",
  },
  {
    id: 5,
    name: "Pashmina Stole",
    price: "₹ 18,000",
    img: "/storefront/cat-stoles.png",
  },
  {
    id: 6,
    name: "Sozni Embroidered Shawl",
    price: "₹ 55,000",
    img: "/storefront/cat-embroidered.png",
  },
  {
    id: 7,
    isSpotlight: true,
  },
  {
    id: 8,
    name: "Sand Pashmina Shawl",
    price: "₹ 32,000",
    img: "/storefront/cat-shawls.png",
  },
  {
    id: 9,
    name: "Kani Embroidered Shawl",
    price: "₹ 58,000",
    img: "/storefront/cat-embroidered.png",
  },
  {
    id: 10,
    name: "Reversible Pashmina Shawl",
    price: "₹ 35,000",
    img: "/storefront/prod-3.png",
  },
  {
    id: 11,
    name: "Midnight Garden Shawl",
    price: "₹ 42,000",
    img: "/storefront/prod-2.png",
  },
  {
    id: 12,
    name: "Pashmina Shawl",
    price: "₹ 30,000",
    img: "/storefront/prod-stack.png",
  },
];

export default function CollectionsPage() {
  const { category } = useParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [openFilters, setOpenFilters] = useState({
    categories: true,
    material: false,
    color: false,
    size: false,
    design: false,
    price: false,
  });

  const isAllCollections = !category;
  const pageTitle = isAllCollections ? "ALL PRODUCTS" : "PASHMINA & SHAWLS";
  const bannerHeading = isAllCollections ? (
    <>
      ALL
      <br />
      COLLECTIONS
    </>
  ) : (
    <>
      PASHMINA
      <br />
      & SHAWLS
    </>
  );
  
  const bannerSubtext = isAllCollections 
    ? "Explore our complete range of hand-loomed luxury pashmina products, curated with heritage."
    : "Timeless weaves. Thoughtful details. Each piece carries the warmth of Kashmir.";

  const toggleFilter = (key) => {
    setOpenFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const resetFilters = () => {
    // Logic to clear filters can be added here
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1916] font-sans selection:bg-[#B58A5B] selection:text-white">
      {/* 1. Announcement Bar */}
      <div className="bg-[#F0EBE3] text-center py-2.5 px-4 border-b border-[#E6DED4]/60">
        <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.2em] text-[#1C1916]/80">
          COMPLIMENTARY WORLDWIDE SHIPPING ON ALL ORDERS
        </p>
      </div>

      {/* 2. Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="pb-24 sm:pb-32">
        {/* 3. Breadcrumbs */}
        <div className="mx-auto max-w-[1200px] px-6 sm:px-10 lg:px-16 w-full pt-8 sm:pt-10 pb-4">
          <nav className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A857E]">
            <a href="/" className="hover:text-[#1C1916] transition-colors">HOME</a>
            <span className="mx-2.5 text-[#E6DED4] sm:mx-3">/</span>
            {isAllCollections ? (
              <span className="text-[#1C1916]">COLLECTIONS</span>
            ) : (
              <>
                <a href="/collections" className="hover:text-[#1C1916] transition-colors">COLLECTIONS</a>
                <span className="mx-2.5 text-[#E6DED4] sm:mx-3">/</span>
                <span className="text-[#1C1916]">PASHMINA & SHAWLS</span>
              </>
            )}
          </nav>
        </div>

        {/* 4. Page Header Banner */}
        <section className="bg-[#FAF8F5] overflow-hidden border-b border-[#ECE7E1] w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch w-full">
            
            {/* Left Side (aligned with content container) */}
            <div className="py-10 sm:py-14 lg:py-20 px-6 sm:px-10 lg:pl-[max(4rem,calc((100vw-1200px)/2+4rem))] lg:pr-12 w-full flex flex-col justify-center">
              <div className="max-w-[500px]">
                <h1 className="font-serif text-[2.75rem] font-light leading-[1.08] text-[#1C1916] sm:text-[3.5rem] lg:text-[4.2rem] xl:text-[4.5rem]">
                  {bannerHeading}
                </h1>
                <p className="font-sans text-[13px] sm:text-[14px] text-[#6B6560] font-light leading-relaxed mt-5 max-w-[380px]">
                  {bannerSubtext}
                </p>
              </div>
            </div>

            {/* Right Side Full-Bleed Image (touches the right edge of browser) */}
            <div className="w-full h-[280px] sm:h-[360px] lg:h-auto min-h-[300px] lg:min-h-[450px] overflow-hidden">
              <img
                src="/storefront/pashmina-banner.png"
                alt="Luxurious folded pashmina fabrics with delicate fringes"
                className="w-full h-full object-cover"
              />
            </div>

          </div>
        </section>

        {/* 5. Filter/Sort Bar */}
        <section className="border-b border-[#ECE7E1] bg-[#FAF8F5] sticky top-[76px] z-30">
          <div className="mx-auto max-w-[1200px] px-6 sm:px-10 lg:px-16 w-full py-4 flex items-center justify-between">
            
            {/* Left side */}
            <div className="flex items-center">
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="flex items-center gap-2 font-sans text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1C1916] hover:text-[#B58A5B] transition-colors"
              >
                <Filter size={13} strokeWidth={1.5} />
                <span>FILTER</span>
              </button>
              <button
                onClick={resetFilters}
                className="hidden sm:inline-block text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8A857E] hover:text-[#1C1916] transition-colors ml-8"
              >
                Clear All
              </button>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.16em] text-[#8A857E] ml-8 border-l border-[#E6DED4] pl-8">
                28 ITEMS
              </span>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5 font-sans text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1C1916]/80">
                <span>SORT BY:</span>
                <select className="bg-transparent border-0 focus:outline-none focus:ring-0 text-[#1C1916] font-semibold cursor-pointer pr-4">
                  <option value="newest">NEWEST</option>
                  <option value="price-asc">PRICE: LOW TO HIGH</option>
                  <option value="price-desc">PRICE: HIGH TO LOW</option>
                  <option value="popular">POPULAR</option>
                </select>
              </div>

              {/* Grid/List Toggle */}
              <div className="hidden sm:flex items-center gap-3 border-l border-[#E6DED4] pl-6 text-[#8A857E]">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`transition-colors duration-200 ${viewMode === "grid" ? "text-[#1C1916]" : "hover:text-[#1C1916]"}`}
                  aria-label="Grid view"
                >
                  <Grid size={15} strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`transition-colors duration-200 ${viewMode === "list" ? "text-[#1C1916]" : "hover:text-[#1C1916]"}`}
                  aria-label="List view"
                >
                  <List size={15} strokeWidth={1.5} />
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* Product Section Grid + Sidebar Layout */}
        <section className="mx-auto max-w-[1200px] px-6 sm:px-10 lg:px-16 w-full mt-10">
          <div className="flex gap-10 lg:gap-14 xl:gap-20">
            
            {/* 6. Sidebar Filters (Desktop only) */}
            <aside className="hidden lg:block w-[200px] shrink-0">
              <div className="divide-y divide-[#ECE7E1] border-b border-[#ECE7E1]">
                
                {/* 1. Categories Accordion */}
                <div className="py-4">
                  <button
                    onClick={() => toggleFilter("categories")}
                    className="flex w-full items-center justify-between text-[10px] font-semibold tracking-[0.16em] uppercase text-[#1C1916]"
                  >
                    <span>Categories</span>
                    {openFilters.categories ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                  {openFilters.categories && (
                    <div className="mt-4 flex flex-col gap-3">
                      {["Shawls", "Stoles", "Scarves", "Throws"].map((opt) => (
                        <label key={opt} className="flex items-center gap-3 cursor-pointer text-[12px] text-[#6B6560] hover:text-[#1C1916] transition-colors">
                          <input type="checkbox" className="rounded-[1px] border-[#E6DED4] text-[#B58A5B] focus:ring-[#B58A5B] w-3.5 h-3.5" />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Material Accordion */}
                <div className="py-4">
                  <button
                    onClick={() => toggleFilter("material")}
                    className="flex w-full items-center justify-between text-[10px] font-semibold tracking-[0.16em] uppercase text-[#1C1916]"
                  >
                    <span>Material</span>
                    {openFilters.material ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                  {openFilters.material && (
                    <div className="mt-4 flex flex-col gap-3">
                      {["100% Pashmina", "Silk Pashmina Blend"].map((opt) => (
                        <label key={opt} className="flex items-center gap-3 cursor-pointer text-[12px] text-[#6B6560] hover:text-[#1C1916]">
                          <input type="checkbox" className="rounded-[1px] border-[#E6DED4] text-[#B58A5B] focus:ring-[#B58A5B] w-3.5 h-3.5" />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Color Accordion */}
                <div className="py-4">
                  <button
                    onClick={() => toggleFilter("color")}
                    className="flex w-full items-center justify-between text-[10px] font-semibold tracking-[0.16em] uppercase text-[#1C1916]"
                  >
                    <span>Color</span>
                    {openFilters.color ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                  {openFilters.color && (
                    <div className="mt-4 flex flex-col gap-3">
                      {["Ivory", "Midnight Black", "Sand Beige", "Charcoal"].map((opt) => (
                        <label key={opt} className="flex items-center gap-3 cursor-pointer text-[12px] text-[#6B6560] hover:text-[#1C1916]">
                          <input type="checkbox" className="rounded-[1px] border-[#E6DED4] text-[#B58A5B] focus:ring-[#B58A5B] w-3.5 h-3.5" />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. Size Accordion */}
                <div className="py-4">
                  <button
                    onClick={() => toggleFilter("size")}
                    className="flex w-full items-center justify-between text-[10px] font-semibold tracking-[0.16em] uppercase text-[#1C1916]"
                  >
                    <span>Size</span>
                    {openFilters.size ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                  {openFilters.size && (
                    <div className="mt-4 flex flex-col gap-3">
                      {["Standard (200x70cm)", "Large (200x100cm)"].map((opt) => (
                        <label key={opt} className="flex items-center gap-3 cursor-pointer text-[12px] text-[#6B6560] hover:text-[#1C1916]">
                          <input type="checkbox" className="rounded-[1px] border-[#E6DED4] text-[#B58A5B] focus:ring-[#B58A5B] w-3.5 h-3.5" />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* 5. Design Accordion */}
                <div className="py-4">
                  <button
                    onClick={() => toggleFilter("design")}
                    className="flex w-full items-center justify-between text-[10px] font-semibold tracking-[0.16em] uppercase text-[#1C1916]"
                  >
                    <span>Design</span>
                    {openFilters.design ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                  {openFilters.design && (
                    <div className="mt-4 flex flex-col gap-3">
                      {["Solid / Plain", "Sozni Embroidery", "Kani Weave"].map((opt) => (
                        <label key={opt} className="flex items-center gap-3 cursor-pointer text-[12px] text-[#6B6560] hover:text-[#1C1916]">
                          <input type="checkbox" className="rounded-[1px] border-[#E6DED4] text-[#B58A5B] focus:ring-[#B58A5B] w-3.5 h-3.5" />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* 6. Price Accordion */}
                <div className="py-4">
                  <button
                    onClick={() => toggleFilter("price")}
                    className="flex w-full items-center justify-between text-[10px] font-semibold tracking-[0.16em] uppercase text-[#1C1916]"
                  >
                    <span>Price</span>
                    {openFilters.price ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                  {openFilters.price && (
                    <div className="mt-4 flex flex-col gap-3">
                      {["Under ₹25,000", "₹25,000 - ₹50,000", "Over ₹50,000"].map((opt) => (
                        <label key={opt} className="flex items-center gap-3 cursor-pointer text-[12px] text-[#6B6560] hover:text-[#1C1916]">
                          <input type="checkbox" className="rounded-[1px] border-[#E6DED4] text-[#B58A5B] focus:ring-[#B58A5B] w-3.5 h-3.5" />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Reset Filters button */}
              <button
                onClick={resetFilters}
                className="w-full border border-[#1C1916] text-[#1C1916] hover:bg-[#1C1916] hover:text-white transition-colors duration-300 py-3 text-[10px] font-semibold tracking-[0.2em] uppercase rounded-[1px] mt-8"
              >
                RESET FILTERS
              </button>
            </aside>

            {/* Mobile Filter Drawer Overlay */}
            {mobileFilterOpen && (
              <div className="fixed inset-0 z-50 flex lg:hidden">
                <div
                  className="fixed inset-0 bg-black/35 backdrop-blur-sm"
                  onClick={() => setMobileFilterOpen(false)}
                />
                <div className="relative w-full max-w-[320px] bg-[#FAF8F5] p-6 flex flex-col justify-between border-r border-[#E6DED4] overflow-y-auto">
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-[#E6DED4]">
                      <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1C1916]">
                        FILTERS
                      </span>
                      <button
                        onClick={() => setMobileFilterOpen(false)}
                        className="text-[#1C1916]/60 hover:text-[#1C1916]"
                      >
                        <X size={18} strokeWidth={1.5} />
                      </button>
                    </div>

                    <div className="divide-y divide-[#ECE7E1] mt-4">
                      {/* Accordions inside mobile drawer */}
                      {Object.keys(openFilters).map((filterKey) => (
                        <div key={filterKey} className="py-4">
                          <button
                            onClick={() => toggleFilter(filterKey)}
                            className="flex w-full items-center justify-between text-[10px] font-semibold tracking-[0.16em] uppercase text-[#1C1916]"
                          >
                            <span>{filterKey}</span>
                            {openFilters[filterKey] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>
                          {openFilters[filterKey] && (
                            <div className="mt-3.5 flex flex-col gap-2.5 pl-1">
                              {filterKey === "categories" &&
                                ["Shawls", "Stoles", "Scarves", "Throws"].map((opt) => (
                                  <label key={opt} className="flex items-center gap-3 cursor-pointer text-[12px] text-[#6B6560]">
                                    <input type="checkbox" className="rounded-[1px] border-[#E6DED4] text-[#B58A5B] w-3.5 h-3.5" />
                                    <span>{opt}</span>
                                  </label>
                                ))}
                              {filterKey !== "categories" &&
                                ["Option 1", "Option 2"].map((opt) => (
                                  <label key={opt} className="flex items-center gap-3 cursor-pointer text-[12px] text-[#6B6560]">
                                    <input type="checkbox" className="rounded-[1px] border-[#E6DED4] text-[#B58A5B] w-3.5 h-3.5" />
                                    <span>{opt}</span>
                                  </label>
                                ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8 pt-4 border-t border-[#ECE7E1]">
                    <button
                      onClick={() => {
                        resetFilters();
                        setMobileFilterOpen(false);
                      }}
                      className="flex-1 border border-[#1C1916]/40 text-[#1C1916]/70 py-3 text-[10px] font-semibold uppercase tracking-[0.15em]"
                    >
                      CLEAR
                    </button>
                    <button
                      onClick={() => setMobileFilterOpen(false)}
                      className="flex-1 bg-[#1C1916] text-white py-3 text-[10px] font-semibold uppercase tracking-[0.15em] hover:bg-[#B58A5B] transition-colors"
                    >
                      APPLY
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 7. Product Grid */}
            <div className="flex-1">
              <div
                className={`grid gap-x-6 gap-y-12 sm:gap-x-8 sm:gap-y-16 lg:gap-x-10
                  ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
              >
                {PRODUCTS.map((p, idx) => {
                  // Index 6 is the Artisan Spotlight Card
                  if (p.isSpotlight) {
                    return (
                      <div
                        key="spotlight"
                        className={`flex flex-col justify-between bg-[#F5EFE7] rounded-[2px] border border-[#E6DED4]/60 overflow-hidden
                          ${viewMode === "list" ? "sm:flex-row sm:items-stretch sm:min-h-[220px]" : "min-h-[380px]"}`}
                      >
                        {/* Top half: Image */}
                        <div className={`overflow-hidden relative bg-[#EFE9E1] ${viewMode === "list" ? "sm:w-[40%] sm:h-full" : "h-[45%]"}`}>
                          <img
                            src="/storefront/artisan.png"
                            alt="Artisan working at a weaving loom"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        </div>

                        {/* Bottom half: Content */}
                        <div className={`p-6 flex flex-col justify-between ${viewMode === "list" ? "sm:w-[60%] sm:justify-center" : "h-[55%]"}`}>
                          <div>
                            <span className="block font-sans text-[9px] font-semibold tracking-[0.2em] uppercase text-[#B58A5B] mb-2.5">
                              ARTISAN SPOTLIGHT
                            </span>
                            <p className="font-serif text-[15px] sm:text-[16px] font-light italic leading-relaxed text-[#1C1916]">
                              Weaver's hands to brave every seal convection what the-willsart of dimart and chant in the loom.
                            </p>
                          </div>
                          <a
                            href="#"
                            className="group inline-flex items-center gap-1.5 font-sans text-[9px] sm:text-[10px] font-semibold tracking-[0.15em] uppercase text-[#1C1916] border-b border-[#1C1916]/20 pb-0.5 w-fit mt-5 hover:border-[#1C1916] transition-all"
                          >
                            <span>The Loom (Journal)</span>
                            <ArrowRight
                              size={12}
                              strokeWidth={1.5}
                              className="transition-transform duration-300 group-hover:translate-x-1"
                            />
                          </a>
                        </div>
                      </div>
                    );
                  }

                  // Standard Product Card
                  return (
                    <div
                      key={p.id}
                      className={`group flex ${viewMode === "list" ? "flex-col sm:flex-row gap-6 items-center border-b border-[#ECE7E1] pb-8" : "flex-col"}`}
                    >
                      {/* Image container */}
                      <div
                        className={`relative overflow-hidden bg-[#EFE9E1] rounded-[2px] shrink-0
                          ${viewMode === "list" ? "w-full sm:w-[220px] aspect-[4/5]" : "w-full aspect-[4/5]"}`}
                      >
                        <img
                          src={p.img}
                          alt={p.name}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        />
                      </div>

                      {/* Details container */}
                      <div className={`flex-1 w-full ${viewMode === "list" ? "pt-2" : "mt-4"}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-col">
                            <h3 className="font-serif text-[15px] sm:text-[16px] font-normal leading-snug text-[#1C1916]">
                              {p.name}
                            </h3>
                            <span className="font-sans text-[12px] sm:text-[13px] font-normal text-[#1C1916] mt-1.5">
                              {p.price}
                            </span>
                          </div>
                          <button
                            aria-label={`Add ${p.name} to bag`}
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#1C1916]/20 text-[#1C1916] transition-colors duration-200 hover:border-[#1C1916] hover:bg-[#1C1916] hover:text-white sm:h-8 sm:w-8 mt-0.5"
                          >
                            <Plus size={13} strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 8. Load More button */}
              <div className="flex justify-center mt-16 sm:mt-20">
                <button className="border border-[#1C1916] text-[#1C1916] hover:bg-[#1C1916] hover:text-white transition-colors duration-300 px-10 py-3.5 text-[10px] font-semibold tracking-[0.25em] uppercase rounded-[1px]">
                  LOAD MORE
                </button>
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* 9. Site Footer */}
      <SiteFooter />
    </div>
  );
}
