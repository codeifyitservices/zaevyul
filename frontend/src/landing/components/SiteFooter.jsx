import { ArrowRight } from "lucide-react";

const COLUMNS = {
  Explore: ["The Craft", "Our Story"],
  Support: ["Shipping & Returns", "Privacy Policy", "Terms of Service"],
};

export default function SiteFooter() {
  return (
    <footer className="bg-[#F5EFE7] font-sans text-[#1C1916]">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-10 lg:px-16 w-full pt-16 pb-12 sm:pt-20 sm:pb-16 grid grid-cols-1 gap-14 sm:grid-cols-2 sm:gap-x-14 sm:gap-y-16 lg:grid-cols-[1.15fr_0.8fr_1fr_1.15fr] lg:gap-x-20">
        <div className="sm:col-span-2 lg:col-span-1">
          <a
            href="/"
            className="mb-4 block font-serif text-[26px] font-light text-[#1C1916] sm:text-[30px]"
          >
            Zaevyul
          </a>
          <p className="max-w-[220px] text-[13px] font-light leading-[1.7] text-[#6B6560]">
            Timeless. Thoughtful. Yours.
          </p>
        </div>

        {Object.entries(COLUMNS).map(([heading, links]) => (
          <div key={heading}>
            <h5 className="mb-5 text-[9px] font-semibold uppercase tracking-[0.25em] text-[#8A857E] sm:mb-6">
              {heading}
            </h5>
            <ul className="flex flex-col gap-3 sm:gap-4">
              {links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-[13px] font-light text-[#5A5550] transition-colors duration-200 hover:text-[#1C1916]"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h5 className="mb-5 text-[9px] font-semibold uppercase tracking-[0.25em] text-[#8A857E] sm:mb-6">
            Subscribe
          </h5>
          <p className="mb-4 max-w-[220px] text-[13px] font-light leading-[1.7] text-[#6B6560] sm:mb-5">
            To our world of craft, culture, and calm.
          </p>
          <form
            className="flex max-w-[260px] items-center border-b border-[#1C1916]/25 transition-colors duration-200 focus-within:border-[#1C1916]/60"
            onSubmit={(event) => event.preventDefault()}
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="min-w-0 flex-1 bg-transparent py-2 text-[13px] font-light text-[#1C1916] outline-none placeholder:text-[#8A857E]"
            />
            <button
              type="submit"
              aria-label="Subscribe"
              className="px-1.5 text-[#1C1916] transition-colors duration-200 hover:text-[#B58A5B]"
            >
              <ArrowRight size={15} strokeWidth={1.5} />
            </button>
          </form>
        </div>
      </div>
      <div className="mx-auto max-w-[1200px] px-6 sm:px-10 lg:px-16 w-full py-6 border-t border-[#E1D8CD]">
        <p className="text-[11px] leading-none text-[#8A857E]">
          (c) {new Date().getFullYear()} Zaevyul. Hand-loomed in Kashmir.
        </p>
      </div>
    </footer>
  );
}
