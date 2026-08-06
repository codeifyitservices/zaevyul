import { useState, useEffect } from "react";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { api } from "../../lib/api";
import { useCart } from "../../context/CartContext";

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
  const [settings, setSettings] = useState(null);
  const { setIsOpen: setCartOpen, totals, isBadgeAnimated } = useCart();

  useEffect(() => {
    let active = true;
    const fetchSettings = async () => {
      try {
        const data = await api.settings.get();
        if (active) setSettings(data);
      } catch (err) {
        console.error("Error loading settings in Navbar:", err);
      }
    };
    fetchSettings();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);


  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex h-[68px] items-center justify-between border-b border-[#E7DED3] bg-[#FAF8F5]/92 px-5 backdrop-blur-xl sm:px-8 lg:px-14 xl:px-18">
        <div className="hidden items-center lg:flex gap-6">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href="/collections"
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
          className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-serif text-[20px] uppercase tracking-[0.32em] text-[#1C1916]"
        >
          {settings?.storeName?.toUpperCase() || "ZAEVYUL"}
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
            className="hidden lg:block transition-colors hover:text-[#1C1916]"
          >
            <User size={17} strokeWidth={1.4} />
          </button>
          <button
            aria-label="Wishlist"
            className="hidden lg:block transition-colors hover:text-[#1C1916]"
          >
            <Heart size={17} strokeWidth={1.4} />
          </button>
          <button
            aria-label="Bag"
            onClick={() => setCartOpen(true)}
            className="relative transition-colors hover:text-[#1C1916]"
          >
            <ShoppingBag size={17} strokeWidth={1.4} />
            <span
              className={`absolute -right-1.5 -top-1 flex h-[13px] w-[13px] items-center justify-center rounded-full bg-[#B58A5B] text-[8px] font-bold leading-none text-white transition-all duration-300 ${
                isBadgeAnimated ? "scale-[1.3] bg-[#825433]" : ""
              }`}
            >
              {totals.itemCount}
            </span>
          </button>
        </div>
      </nav>

      <div className={`fixed inset-0 z-[200] flex flex-col bg-[#FAF8F5] transition-transform duration-500 ease-in-out ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-[68px] items-center justify-between border-b border-[#E8E1D9] px-6 sm:px-8">
          <span className="font-serif text-[18px] uppercase tracking-[0.28em] text-[#1C1916]">
            {settings?.storeName?.toUpperCase() || "ZAEVYUL"}
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
          {NAV_LINKS.map((link, idx) => (
            <a
              key={link}
              href="/collections"
              onClick={() => setMobileOpen(false)}
              style={{
                transitionDelay: mobileOpen ? `${idx * 70}ms` : "0ms",
              }}
              className={`border-b border-[#E8E1D9] py-5 font-serif text-[27px] font-light text-[#1C1916] transition-all duration-[750ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] first:border-t hover:pl-3
                ${mobileOpen ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"}`}
            >
              {link}
            </a>
          ))}
        </nav>

        {/* Mobile Drawer Footer Actions (Profile & Wishlist) */}
        <div className="mt-auto border-t border-[#E8E1D9] p-6 sm:p-8 flex justify-around items-center bg-[#FAF8F5]">
          <a
            href="#"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1C1916]/70 hover:text-[#1C1916]"
          >
            <User size={16} strokeWidth={1.4} />
            <span>Profile</span>
          </a>
          <div className="h-4 w-px bg-[#E8E1D9]" />
          <a
            href="#"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1C1916]/70 hover:text-[#1C1916]"
          >
            <Heart size={16} strokeWidth={1.4} />
            <span>Wishlist</span>
          </a>
        </div>
      </div>
    </>
  );
}
