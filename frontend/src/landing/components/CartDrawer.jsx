import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { X, Plus, Minus, Heart, ArrowRight } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { api, getCategorySlug } from "../../lib/api";

export default function CartDrawer() {
  const {
    cart,
    isOpen,
    setIsOpen,
    updateQuantity,
    removeItem,
    totals,
  } = useCart();

  const drawerRef = useRef(null);
  const [removingKeys, setRemovingKeys] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(false);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);

  // Focus trapping
  useEffect(() => {
    if (!isOpen) return;
    const focusable = drawerRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable || focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const handleTab = (e) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };

    first.focus();
    window.addEventListener("keydown", handleTab);
    return () => window.removeEventListener("keydown", handleTab);
  }, [isOpen]);

  // Load recommended products
  useEffect(() => {
    if (!isOpen) return;
    const fetchRecs = async () => {
      try {
        setRecLoading(true);
        const prodList = await api.products.list();
        // Filter out items already in the cart and take max 4
        const inCartIds = cart.map((item) => item.id);
        const filtered = prodList.filter((p) => !inCartIds.includes(p._id || p.id));
        setRecommendations(filtered.slice(0, 4));
      } catch (err) {
        console.error("Failed to fetch cart recommendations:", err);
      } finally {
        setRecLoading(false);
      }
    };
    fetchRecs();
  }, [isOpen, cart]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
    } else {
      const timer = setTimeout(() => setMounted(false), 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleRemoveClick = (key) => {
    setRemovingKeys((prev) => [...prev, key]);
    setTimeout(() => {
      removeItem(key);
      setRemovingKeys((prev) => prev.filter((k) => k !== key));
    }, 300); // Keep remove animation at 300ms for premium fluid feel
  };

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-[#1C1916]/30 backdrop-blur-[3px] transition-opacity duration-[350ms] ease-in-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        className={`relative z-10 flex h-full w-full flex-col bg-[#FAF8F5] border-l border-[#ECE7E1] shadow-2xl transition-transform duration-[350ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] sm:max-w-[420px] lg:max-w-[480px] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart Drawer"
      >
        {/* Sticky Header */}
        <header className="sticky top-0 z-10 flex h-[68px] items-center justify-between border-b border-[#ECE7E1] bg-[#FAF8F5] px-6 sm:px-8">
          <h2 className="font-serif text-[18px] uppercase tracking-[0.2em] text-[#1C1916]">
            Shopping Cart ({totals.itemCount})
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close cart"
            className="text-[#1C1916]/70 transition-colors hover:text-[#1C1916] p-1 -mr-1"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </header>

        {/* Free Shipping Message & Progress Bar */}
        {cart.length > 0 && (
          <div className="border-b border-[#ECE7E1] bg-[#F5EFE7]/50 px-6 py-4.5 sm:px-8">
            {totals.isFreeShipping ? (
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2E7D32]">
                Your order qualifies for Free Shipping! 🎉
              </p>
            ) : (
              <div>
                <p className="font-sans text-[11.5px] font-normal text-[#6B6560] leading-relaxed mb-2.5">
                  You're only <span className="font-semibold text-[#1C1916]">₹{totals.amountToFreeShipping.toLocaleString("en-IN")}</span> away from <span className="font-semibold text-[#1C1916]">Free Shipping</span>.
                </p>
                <div className="h-1.5 w-full bg-[#E6DED4] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#B58A5B] transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.min(
                        100,
                        (totals.subtotal / totals.freeShippingThreshold) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cart Content Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-8 space-y-8">
          {cart.length === 0 ? (
            /* Empty Cart State */
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#F5EFE7] text-[#B58A5B]">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <h3 className="font-serif text-[18px] font-light text-[#1C1916] mb-2.5">
                Your cart is empty
              </h3>
              <p className="font-sans text-[13px] text-[#8A857E] font-light mb-8 max-w-[280px] leading-relaxed">
                Add beautiful, handwoven Pashmina pieces to start your luxury collection.
              </p>
              <button
                onClick={() => setIsOpen(false)}
                className="border border-[#1C1916] text-[#1C1916] hover:bg-[#1C1916] hover:text-white transition-colors duration-300 px-8 py-3 text-[10px] font-semibold tracking-[0.2em] uppercase rounded-[1px]"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            /* Cart Items List */
            <div className="divide-y divide-[#ECE7E1] -my-4">
              {cart.map((item) => {
                const isRemoving = removingKeys.includes(item.key);
                return (
                  <div
                    key={item.key}
                    className={`flex gap-4.5 py-6 transition-all duration-300 ease-in-out ${
                      isRemoving ? "opacity-0 translate-x-8 max-h-0 py-0 overflow-hidden" : ""
                    }`}
                  >
                    {/* Product Image */}
                    <Link
                      to={`/collection/${getCategorySlug(item.category)}/${item.slug || (item.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}
                      onClick={() => setIsOpen(false)}
                      className="relative aspect-[4/5] w-[84px] shrink-0 overflow-hidden rounded-[2px] bg-[#EFE9E1]"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </Link>

                    {/* Item Details */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        {/* Name and Price */}
                        <div className="flex items-start justify-between gap-3">
                          <Link
                            to={`/collection/${getCategorySlug(item.category)}/${item.slug || (item.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}
                            onClick={() => setIsOpen(false)}
                            className="font-serif text-[14.5px] font-normal leading-snug text-[#1C1916] hover:text-[#B58A5B] transition-colors"
                          >
                            {item.name}
                          </Link>
                          <span className="font-sans text-[13.5px] font-normal text-[#1C1916] whitespace-nowrap">
                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                          </span>
                        </div>

                        {/* Variants */}
                        <div className="mt-2.5 flex flex-wrap gap-x-3.5 gap-y-1 font-sans text-[11px] text-[#8A857E]">
                          {item.color && (
                            <span className="uppercase tracking-wider">
                              Color: {item.color}
                            </span>
                          )}
                          {item.size && (
                            <span className="uppercase tracking-wider">
                              Size: {item.size}
                            </span>
                          )}
                        </div>

                        {/* Low stock indicator */}
                        {item.stockQuantity <= 5 && (
                          <span className="inline-block mt-2 font-sans text-[9.5px] font-semibold uppercase tracking-wider text-[#C94C4C]">
                            Only {item.stockQuantity} left
                          </span>
                        )}
                      </div>

                      {/* Quantity & Actions Row */}
                      <div className="mt-4 flex items-center justify-between">
                        {/* Quantity controls */}
                        <div className="flex items-center border border-[#ECE7E1] bg-white">
                          <button
                            onClick={() => updateQuantity(item.key, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                            className="p-1.5 text-[#8A857E] hover:text-[#1C1916] disabled:opacity-30 transition-colors"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="px-3.5 font-sans text-[12px] text-[#1C1916] select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.key, item.quantity + 1)}
                            disabled={item.quantity >= item.stockQuantity}
                            aria-label="Increase quantity"
                            className="p-1.5 text-[#8A857E] hover:text-[#1C1916] disabled:opacity-30 transition-colors"
                          >
                            <Plus size={11} />
                          </button>
                        </div>

                        {/* Actions buttons */}
                        <div className="flex items-center gap-4 text-[10.5px] font-semibold tracking-wider uppercase">
                          <button
                            onClick={() => handleRemoveClick(item.key)}
                            className="text-[#8A857E] hover:text-[#C94C4C] transition-colors border-b border-transparent hover:border-[#C94C4C]/40 pb-0.5"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Recommended Section (Desaturated, elegant list) */}
          {recommendations.length > 0 && (
            <div className="border-t border-[#ECE7E1] pt-8 mt-12">
              <h4 className="font-sans text-[10px] font-semibold tracking-[0.2em] uppercase text-[#8A857E] mb-6">
                You May Also Love
              </h4>
              <div className="flex flex-col gap-5">
                {recommendations.map((p) => {
                  const pImg = p.img || (p.images && p.images[0]?.url) || "/storefront/prod-1.png";
                  const pPrice = p.discountPrice || p.basePrice || 30000;
                  const catSlug = getCategorySlug(p.category);
                  const prodSlug = p.slug || (p.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                  const detailPath = `/collection/${catSlug}/${prodSlug}`;
                  return (
                    <div key={p.id || p._id} className="flex gap-4 items-center">
                      <Link
                        to={detailPath}
                        onClick={() => setIsOpen(false)}
                        className="aspect-[4/5] w-[56px] shrink-0 overflow-hidden rounded-[2px] bg-[#EFE9E1]"
                      >
                        <img
                          src={pImg}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </Link>
                      <div className="flex-1 flex flex-col justify-center">
                        <Link
                          to={detailPath}
                          onClick={() => setIsOpen(false)}
                          className="font-serif text-[13.5px] text-[#1C1916] hover:text-[#B58A5B] transition-colors leading-snug"
                        >
                          {p.name}
                        </Link>
                        <span className="font-sans text-[12px] text-[#6B6560] mt-1 font-light">
                          ₹{pPrice.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <Link
                        to={detailPath}
                        onClick={() => setIsOpen(false)}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-[#1C1916]/10 text-[#1C1916]/70 hover:border-[#1C1916] hover:text-[#1C1916] transition-all"
                        aria-label="View product details"
                      >
                        <ArrowRight size={11} />
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Order Summary (Sticky Bottom) */}
        {cart.length > 0 && (
          <footer className="sticky bottom-0 z-10 border-t border-[#ECE7E1] bg-[#FAF8F5] px-6 py-6.5 sm:px-8">
            {/* Calculation Lines */}
            <div className="space-y-2.5 mb-6 text-[12.5px] font-sans text-[#6B6560]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-[#1C1916] font-normal">₹{totals.subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-[#1C1916]">
                  {totals.shipping === 0 ? "Free" : `₹${totals.shipping.toLocaleString("en-IN")}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span className="text-[#1C1916]">₹{totals.tax.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between border-t border-[#ECE7E1] pt-3 text-[14.5px] font-normal text-[#1C1916]">
                <span className="font-medium">Estimated Total</span>
                <span className="font-medium">₹{totals.total.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Actions Buttons */}
            <div>
              <button
                onClick={() => {
                  alert("Proceeding to luxury checkout...");
                }}
                className="w-full bg-[#1C1916] text-white py-4 font-sans text-[10px] font-semibold uppercase tracking-[0.25em] rounded-[1px] hover:bg-[#B58A5B] transition-colors duration-300 shadow-sm"
              >
                Proceed to Checkout
              </button>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
