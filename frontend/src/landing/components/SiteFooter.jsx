import { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  Gift,
  Mail,
  CheckCircle2,
} from "lucide-react";
import { api } from "../../lib/api";
import { useToast } from "../../context/ToastContext";

function InstagramIcon({ size = 15, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
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

function FacebookIcon({ size = 15, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function PinterestIcon({ size = 15, className = "" }) {
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
  const [settings, setSettings] = useState(null);
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchSettings = async () => {
      try {
        const data = await api.settings.getPublic();
        if (active) setSettings(data);
      } catch (err) {
        // Silently handle fallback
      }
    };
    fetchSettings();
    return () => {
      active = false;
    };
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      setSubscribing(true);
      await api.newsletter.subscribe(email);
      setSubscribed(true);
      toast("Welcome to the Zaevyul Privé Circle", "success");
      setEmail("");
    } catch (err) {
      toast(err.message || "Thank you for joining our newsletter!", "info");
      setSubscribed(true);
      setEmail("");
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="bg-[#FAF7F2] font-sans text-[#1C1916] border-t border-[#E6DED4]/60">
      {/* 2. Main E-Commerce Footer Navigation Grid */}
      <div className="mx-auto max-w-[1280px] px-6 sm:px-10 lg:px-16 pt-16 pb-14">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 lg:gap-10">
          {/* Brand & Contact Column */}
          <div className="sm:col-span-2 md:col-span-3 lg:col-span-1.5 space-y-4">
            <RouterLink to="/" className="block">
              <span className="font-serif text-[24px] tracking-[0.2em] font-light text-[#1C1916] block uppercase">
                {settings?.storeName || "ZAEVYUL"}
              </span>
              <span className="block font-sans text-[8.5px] tracking-[0.35em] uppercase text-[#B58A5B] font-medium -mt-0.5">
                Pashmina • Kashmir
              </span>
            </RouterLink>

            <p className="text-[12.5px] font-light leading-[1.7] text-[#6B6560] max-w-[260px]">
              {settings?.tagline ||
                "Hand-loomed in Kashmir. Pure Changthangi Cashmere & Heritage Embroidery."}
            </p>

            <div className="pt-2 space-y-1.5 text-[12px] font-light text-[#6B6560]">
              <p>
                Email:{" "}
                <a
                  href="mailto:concierge@zaevyul.com"
                  className="hover:text-[#B58A5B] transition-colors"
                >
                  concierge@zaevyul.com
                </a>
              </p>
              <p>
                Phone:{" "}
                <a
                  href="tel:+911942400108"
                  className="hover:text-[#B58A5B] transition-colors"
                >
                  +91 (0) 194 240 0108
                </a>
              </p>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full border border-[#E6DED4] bg-white flex items-center justify-center text-[#1C1916] hover:bg-[#1C1916] hover:text-white transition-all duration-200"
              >
                <InstagramIcon size={13} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full border border-[#E6DED4] bg-white flex items-center justify-center text-[#1C1916] hover:bg-[#1C1916] hover:text-white transition-all duration-200"
              >
                <FacebookIcon size={13} />
              </a>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Pinterest"
                className="w-8 h-8 rounded-full border border-[#E6DED4] bg-white flex items-center justify-center text-[#1C1916] hover:bg-[#1C1916] hover:text-white transition-all duration-200"
              >
                <PinterestIcon size={13} />
              </a>
            </div>
          </div>

          {/* Column 2: Collections */}
          <div>
            <h5 className="mb-4 font-sans text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8A857E]">
              Collections
            </h5>
            <ul className="flex flex-col gap-2.5 text-[12.5px] font-light">
              <li>
                <RouterLink
                  to="/collections"
                  className="text-[#5A5550] hover:text-[#1C1916] hover:translate-x-0.5 transition-all inline-block"
                >
                  Pashmina Stoles
                </RouterLink>
              </li>
              <li>
                <RouterLink
                  to="/collections"
                  className="text-[#5A5550] hover:text-[#1C1916] hover:translate-x-0.5 transition-all inline-block"
                >
                  Kani Weave Shawls
                </RouterLink>
              </li>
              <li>
                <RouterLink
                  to="/collections"
                  className="text-[#5A5550] hover:text-[#1C1916] hover:translate-x-0.5 transition-all inline-block"
                >
                  Sozni Embroidery
                </RouterLink>
              </li>
              <li>
                <RouterLink
                  to="/collections"
                  className="text-[#5A5550] hover:text-[#1C1916] hover:translate-x-0.5 transition-all inline-block"
                >
                  Heritage Kalamkari
                </RouterLink>
              </li>
              <li>
                <RouterLink
                  to="/our-story"
                  className="text-[#5A5550] hover:text-[#1C1916] hover:translate-x-0.5 transition-all inline-block"
                >
                  The Master Artisans
                </RouterLink>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div>
            <h5 className="mb-4 font-sans text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8A857E]">
              Customer Support
            </h5>
            <ul className="flex flex-col gap-2.5 text-[12.5px] font-light">
              <li>
                <RouterLink
                  to="/my-account"
                  className="text-[#5A5550] hover:text-[#1C1916] hover:translate-x-0.5 transition-all inline-block"
                >
                  My Account
                </RouterLink>
              </li>
              <li>
                <RouterLink
                  to="/my-account/orders"
                  className="text-[#5A5550] hover:text-[#1C1916] hover:translate-x-0.5 transition-all inline-block"
                >
                  Track Order Status
                </RouterLink>
              </li>
              <li>
                <RouterLink
                  to="/contact"
                  className="text-[#5A5550] hover:text-[#1C1916] hover:translate-x-0.5 transition-all inline-block"
                >
                  Shipping & Customs
                </RouterLink>
              </li>
              <li>
                <RouterLink
                  to="/contact"
                  className="text-[#5A5550] hover:text-[#1C1916] hover:translate-x-0.5 transition-all inline-block"
                >
                  Returns & Exchanges
                </RouterLink>
              </li>
              <li>
                <RouterLink
                  to="/contact"
                  className="text-[#5A5550] hover:text-[#1C1916] hover:translate-x-0.5 transition-all inline-block"
                >
                  Contact Concierge
                </RouterLink>
              </li>
            </ul>
          </div>

          {/* Column 4: Heritage & Legal */}
          <div>
            <h5 className="mb-4 font-sans text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8A857E]">
              Heritage & Policy
            </h5>
            <ul className="flex flex-col gap-2.5 text-[12.5px] font-light">
              <li>
                <RouterLink
                  to="/our-story"
                  className="text-[#5A5550] hover:text-[#1C1916] hover:translate-x-0.5 transition-all inline-block"
                >
                  Authenticity Seal
                </RouterLink>
              </li>
              <li>
                <RouterLink
                  to="/journal"
                  className="text-[#5A5550] hover:text-[#1C1916] hover:translate-x-0.5 transition-all inline-block"
                >
                  Pashmina Care Guide
                </RouterLink>
              </li>
              <li>
                <RouterLink
                  to="/contact"
                  className="text-[#5A5550] hover:text-[#1C1916] hover:translate-x-0.5 transition-all inline-block"
                >
                  Privacy Policy
                </RouterLink>
              </li>
              <li>
                <RouterLink
                  to="/contact"
                  className="text-[#5A5550] hover:text-[#1C1916] hover:translate-x-0.5 transition-all inline-block"
                >
                  Terms of Service
                </RouterLink>
              </li>
            </ul>
          </div>

          {/* Column 5: Newsletter Privilege */}
          <div>
            <h5 className="mb-4 font-sans text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8A857E]">
              Zaevyul Privé
            </h5>
            <p className="mb-4 text-[12.5px] font-light leading-[1.6] text-[#6B6560]">
              Subscribe to receive private invitations to new heirloom debuts
              and artisan journals.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-[#2E7D32] bg-[#2E7D32]/8 p-3 rounded-[3px] text-[12px] font-medium border border-[#2E7D32]/20">
                <CheckCircle2 size={16} />
                <span>Joined the Privé Circle</span>
              </div>
            ) : (
              <form
                className="flex items-center border-b border-[#1C1916]/30 transition-colors focus-within:border-[#1C1916]"
                onSubmit={handleSubscribe}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full bg-transparent py-2.5 text-[12.5px] font-light text-[#1C1916] outline-none placeholder:text-[#8A857E]"
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  aria-label="Subscribe"
                  className="p-2 text-[#1C1916] hover:text-[#B58A5B] transition-colors cursor-pointer disabled:opacity-50"
                >
                  <ArrowRight size={15} strokeWidth={1.6} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* 3. Bottom Bar (Copyright, Global Delivery & Accepted Payment Icons) */}
      <div className="border-t border-[#ECE4D8] bg-[#F4EDE2]">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10 lg:px-16 py-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-[11.5px] text-[#8A857E] font-light">
            &copy; {new Date().getFullYear()}{" "}
            {settings?.storeName || "Zaevyul Pashmina"}. Hand-crafted with pride
            in Kashmir, India.
          </p>

          {/* Payment Badges */}
          <div className="flex items-center gap-2.5 text-[10px] font-sans uppercase font-semibold text-[#8A857E] tracking-wider">
            <span className="px-2 py-1 rounded-[2px] bg-white/80 border border-[#E6DED4]">
              VISA
            </span>
            <span className="px-2 py-1 rounded-[2px] bg-white/80 border border-[#E6DED4]">
              MASTERCARD
            </span>
            <span className="px-2 py-1 rounded-[2px] bg-white/80 border border-[#E6DED4]">
              AMEX
            </span>
            <span className="px-2 py-1 rounded-[2px] bg-white/80 border border-[#E6DED4]">
              APPLE PAY
            </span>
            <span className="px-2 py-1 rounded-[2px] bg-white/80 border border-[#E6DED4]">
              UPI / NETBANKING
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
