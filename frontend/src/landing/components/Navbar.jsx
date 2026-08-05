import { useState } from "react";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";

const NAV_LINKS = [
  "New arrivals",
  "Men",
  "Women",
  "Tailoring",
  "About",
  "Shop",
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex h-[68px] items-center justify-between border-b border-[#E7DED3] bg-[#FAF8F5]/92 px-5 backdrop-blur-xl sm:px-8 lg:px-14 xl:px-18">
        <div className="hidden items-center gap-6 lg:flex xl:gap-11">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href={link === "Shop" ? "/collections" : "#"}
              className="font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1C1916]/64 transition-colors duration-200 hover:text-[#1C1916]"
            >
              {link}
            </a>
          ))}
        </div>

        <button
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
          className="text-[#1C1916]/70 transition-colors hover:text-[#1C1916] lg:hidden"
        >
          <Menu size={20} strokeWidth={1.4} />
        </button>

        <a
          href="/"
          className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-serif text-[18px] uppercase tracking-[0.32em] text-[#1C1916]"
        >
          ZAEVYUL
        </a>

        <div className="flex items-center gap-3 text-[#1C1916]/70 sm:gap-5">
          <button
            aria-label="Search"
            className="transition-colors hover:text-[#1C1916]"
          >
            <Search size={17} strokeWidth={1.4} />
          </button>
          <button
            aria-label="Account"
            className="hidden transition-colors hover:text-[#1C1916] sm:block"
          >
            <User size={17} strokeWidth={1.4} />
          </button>
          <button
            aria-label="Wishlist"
            className="transition-colors hover:text-[#1C1916]"
          >
            <Heart size={17} strokeWidth={1.4} />
          </button>
          <button
            aria-label="Bag"
            className="relative transition-colors hover:text-[#1C1916]"
          >
            <ShoppingBag size={17} strokeWidth={1.4} />
            <span className="absolute -right-1.5 -top-1 flex h-[13px] w-[13px] items-center justify-center rounded-full bg-[#B58A5B] text-[8px] font-bold leading-none text-white">
              0
            </span>
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-[200] flex flex-col bg-[#FAF8F5]">
          <div className="flex h-[68px] items-center justify-between border-b border-[#E8E1D9] px-6 sm:px-8">
            <span className="font-serif text-[18px] uppercase tracking-[0.28em] text-[#1C1916]">
              ZAEVYUL
            </span>
            <button
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="text-[#1C1916]"
            >
              <X size={20} strokeWidth={1.4} />
            </button>
          </div>
          <nav className="flex flex-col px-6 pt-10 sm:px-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href="#"
                onClick={() => setMobileOpen(false)}
                className="border-b border-[#E8E1D9] py-5 font-serif text-[27px] font-light text-[#1C1916] transition-all duration-200 first:border-t hover:pl-3"
              >
                {link}
              </a>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
