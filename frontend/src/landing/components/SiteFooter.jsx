import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { ArrowRight, Mail } from "lucide-react";
import { useToast } from "../../context/ToastContext";

function InstagramIcon({ size = 18, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function PinterestIcon({ size = 18, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.62 0 12.017 0z" />
    </svg>
  );
}

export default function SiteFooter() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      setSubscribing(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSubscribed(true);
      toast("Thank you for joining our newsletter!", "success");
      setEmail("");
    } catch (err) {
      toast("Welcome to the Zaevyul newsletter!", "info");
      setSubscribed(true);
      setEmail("");
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="bg-[#FAF8F5] font-sans text-[#1C1916] border-t border-[#ECE7E1]">
      {/* Main E-Commerce Footer Navigation Grid */}
      <div className="mx-auto max-w-[1280px] px-6 sm:px-10 lg:px-16 pt-16 pb-16">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 lg:gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <RouterLink to="/" className="block">
              <span className="font-serif text-[22px] tracking-[0.25em] font-light text-[#1C1916] block uppercase">
                Z A E V Y U L
              </span>
              <span className="block font-sans text-[8px] tracking-[0.4em] uppercase text-[#B58A5B] font-medium mt-1">
                P A S H M I N A
              </span>
            </RouterLink>
            <div className="w-8 border-t border-[#B58A5B]/30 my-3"></div>
            <p className="text-[13px] font-light leading-[1.6] text-[#6B6560]">
              Timeless elegance,
              <br />
              crafted for you.
            </p>
          </div>

          {/* Column 2: SHOP */}
          <div>
            <h5 className="mb-4 font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1C1916]">
              SHOP
            </h5>
            <ul className="flex flex-col gap-3 text-[13px] font-light text-[#6B6560]">
              <li>
                <RouterLink to="/collections" className="hover:text-[#1C1916] transition-colors">
                  All Products
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/collections" className="hover:text-[#1C1916] transition-colors">
                  Shawls
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/collections" className="hover:text-[#1C1916] transition-colors">
                  Scarves
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/collections" className="hover:text-[#1C1916] transition-colors">
                  Accessories
                </RouterLink>
              </li>
            </ul>
          </div>

          {/* Column 3: OUR STORY */}
          <div>
            <h5 className="mb-4 font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1C1916]">
              OUR STORY
            </h5>
            <ul className="flex flex-col gap-3 text-[13px] font-light text-[#6B6560]">
              <li>
                <RouterLink to="/our-story" className="hover:text-[#1C1916] transition-colors">
                  Our Story
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/our-story" className="hover:text-[#1C1916] transition-colors">
                  Our Craft
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/our-story" className="hover:text-[#1C1916] transition-colors">
                  Sustainability
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/journal" className="hover:text-[#1C1916] transition-colors">
                  Journal
                </RouterLink>
              </li>
            </ul>
          </div>

          {/* Column 4: HELP */}
          <div>
            <h5 className="mb-4 font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1C1916]">
              HELP
            </h5>
            <ul className="flex flex-col gap-3 text-[13px] font-light text-[#6B6560]">
              <li>
                <RouterLink to="/contact" className="hover:text-[#1C1916] transition-colors">
                  Shipping & Delivery
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/contact" className="hover:text-[#1C1916] transition-colors">
                  Returns & Exchanges
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/contact" className="hover:text-[#1C1916] transition-colors">
                  FAQs
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/contact" className="hover:text-[#1C1916] transition-colors">
                  Contact Us
                </RouterLink>
              </li>
            </ul>
          </div>

          {/* Column 5: STAY IN THE LOOP */}
          <div>
            <h5 className="mb-4 font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1C1916]">
              STAY IN THE LOOP
            </h5>
            <div className="space-y-4">
              {subscribed ? (
                <div className="text-[12.5px] font-medium text-[#2E7D32]">
                  Thank you for subscribing!
                </div>
              ) : (
                <form className="flex items-center w-full max-w-[280px]" onSubmit={handleSubscribe}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="flex-1 bg-white border border-[#E6DED4] px-3.5 h-11 text-[13px] font-light text-[#1C1916] outline-none placeholder:text-[#8A857E] rounded-l-[2px]"
                  />
                  <button
                    type="submit"
                    disabled={subscribing}
                    className="bg-[#B58A5B] hover:bg-[#9A7246] text-white px-4 h-11 flex items-center justify-center transition-colors cursor-pointer border border-[#B58A5B] rounded-r-[2px]"
                  >
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}

              {/* Social Icons */}
              <div className="flex items-center gap-5 pt-1 text-[#1C1916]">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="hover:text-[#B58A5B] transition-colors"
                >
                  <InstagramIcon size={18} />
                </a>
                <a
                  href="https://pinterest.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Pinterest"
                  className="hover:text-[#B58A5B] transition-colors"
                >
                  <PinterestIcon size={18} />
                </a>
                <a
                  href="mailto:concierge@zaevyul.com"
                  aria-label="Email"
                  className="hover:text-[#B58A5B] transition-colors"
                >
                  <Mail size={18} strokeWidth={1.5} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Thin Strip */}
      <div className="border-t border-[#ECE7E1] bg-[#FAF8F5]">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10 lg:px-16 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-[#8A857E] font-light">
            &copy; 2025 Zaevyul Pashmina. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-[12px] text-[#8A857E] font-light">
            <RouterLink to="/contact" className="hover:text-[#1C1916] transition-colors">
              Privacy Policy
            </RouterLink>
            <span className="text-[#ECE7E1]">|</span>
            <RouterLink to="/contact" className="hover:text-[#1C1916] transition-colors">
              Terms & Conditions
            </RouterLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
