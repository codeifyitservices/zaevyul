import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Bookmark, 
  Bell, 
  MoreHorizontal, 
  ArrowRight, 
  Minus, 
  Plus, 
  Trash2, 
  Gift, 
  Truck, 
  RotateCcw, 
  Lock, 
  Check,
  ShoppingBag,
  CreditCard
} from "lucide-react";
import Navbar from "./components/Navbar";
import SiteFooter from "./components/SiteFooter";
import { useCart } from "../context/CartContext";
import { getCategorySlug } from "../lib/api";
import { useToast } from "../context/ToastContext";

export default function CartPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const {
    cart,
    updateQuantity,
    removeItem,
    totals,
    clearCart
  } = useCart();

  // State for gift note
  const [showGiftInput, setShowGiftInput] = useState(false);
  const [giftNote, setGiftNote] = useState(() => {
    return localStorage.getItem("zae_cart_gift_note") || "";
  });
  const [isGiftSaved, setIsGiftSaved] = useState(!!giftNote);

  // State for checkout modal
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1 = Info, 2 = Processing, 3 = Success
  const [checkoutForm, setCheckoutForm] = useState({
    email: "",
    name: "",
    address: "",
    city: "",
    postalCode: "",
    cardNumber: "4111 2222 3333 4444",
    cardExpiry: "12/29",
    cardCvc: "123"
  });

  const handleSaveGiftNote = (e) => {
    e.preventDefault();
    localStorage.setItem("zae_cart_gift_note", giftNote);
    setIsGiftSaved(true);
    toast("Gift note saved to your order", "success");
    setShowGiftInput(false);
  };

  const handleClearGiftNote = () => {
    localStorage.removeItem("zae_cart_gift_note");
    setGiftNote("");
    setIsGiftSaved(false);
    toast("Gift note removed", "success");
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!checkoutForm.email || !checkoutForm.name || !checkoutForm.address) {
      toast("Please fill in all shipping details", "error");
      return;
    }
    setCheckoutStep(2);
    setTimeout(() => {
      setCheckoutStep(3);
      clearCart();
      localStorage.removeItem("zae_cart_gift_note");
      setGiftNote("");
      setIsGiftSaved(false);
      toast("Order placed successfully!", "success");
    }, 2500);
  };

  return (
    <div className="bg-[#FAF8F5] text-[#1C1916] font-sans min-h-screen flex flex-col justify-between overflow-x-hidden">
      {/* Standard Site Navbar */}
      <Navbar />

      {/* Main Container with top padding to clear the fixed navbar */}
      <main className="flex-1 pt-[68px]">
        
        {/* Dedicated Minimal Cart Header */}
        <div className="border-b border-[#E6DED4]/60 bg-[#FAF8F5]">
          <div className="mx-auto max-w-[1200px] w-full px-6 sm:px-10 lg:px-16 py-4 flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 text-[10px] font-semibold tracking-[0.25em] uppercase text-[#1C1916]/70 hover:text-[#1C1916] cursor-pointer transition-colors duration-200"
            >
              <span className="inline-block transition-transform duration-200 group-hover:-translate-x-1">←</span> CART
            </button>
            <div className="flex items-center gap-5 text-[#1C1916]/70">
              <button 
                onClick={() => toast("Added to saved items", "success")}
                className="hover:text-[#1C1916] cursor-pointer transition-colors"
                aria-label="Bookmark cart status"
              >
                <Bookmark size={15} strokeWidth={1.4} />
              </button>
              <button 
                onClick={() => toast("Notifications set for this cart", "success")}
                className="hover:text-[#1C1916] cursor-pointer transition-colors"
                aria-label="Notifications"
              >
                <Bell size={15} strokeWidth={1.4} />
              </button>
              <button 
                onClick={() => toast("More options coming soon", "success")}
                className="hover:text-[#1C1916] cursor-pointer transition-colors"
                aria-label="More options"
              >
                <MoreHorizontal size={15} strokeWidth={1.4} />
              </button>
            </div>
          </div>
        </div>

        {/* Cart Contents Section */}
        <div className="mx-auto max-w-[1200px] w-full px-6 sm:px-10 lg:px-16 py-12">
          
          {/* Title Area */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 pb-6 border-b border-[#E6DED4]/60">
            <div>
              <h1 className="font-serif text-[32px] md:text-[38px] font-normal tracking-wide text-[#1C1916]">
                Your Cart
              </h1>
              <p className="font-sans text-[12px] text-[#8A857E] mt-1.5 font-light">
                {totals.itemCount} {totals.itemCount === 1 ? "item" : "items"}
              </p>
            </div>
            <Link 
              to="/collections" 
              className="group inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] uppercase text-[#1C1916] hover:text-[#B58A5B] transition-colors duration-200 cursor-pointer"
            >
              Continue Shopping <ArrowRight size={12} className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          {cart.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#F5EFE7] text-[#B58A5B]">
                <ShoppingBag size={24} strokeWidth={1.3} />
              </div>
              <h2 className="font-serif text-[20px] font-light text-[#1C1916] mb-3">
                Your cart is empty
              </h2>
              <p className="font-sans text-[13.5px] text-[#8A857E] font-light mb-8 max-w-[320px] leading-relaxed">
                Explore our handwoven luxury collections to add a touch of Kashmiri heritage to your wardrobe.
              </p>
              <Link
                to="/collections"
                className="border border-[#1C1916] text-[#1C1916] hover:bg-[#1C1916] hover:text-white transition-colors duration-300 px-8 py-3.5 text-[10px] font-semibold tracking-[0.2em] uppercase rounded-[2px] cursor-pointer"
              >
                Explore Collections
              </Link>
            </div>
          ) : (
            /* Main Cart Layout */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 items-start">
              
              {/* Left Side: Items List & Extras */}
              <div className="lg:col-span-2 space-y-8">
                <div className="divide-y divide-[#E6DED4]/60 bg-white rounded-lg border border-[#E6DED4]/40 px-6">
                  {cart.map((item) => {
                    const productSlug = item.slug || (item.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                    const detailPath = `/collection/${getCategorySlug(item.category)}/${productSlug}`;

                    return (
                      <div 
                        key={item.key} 
                        className="flex gap-6 py-6 md:py-8"
                      >
                        {/* Image */}
                        <Link 
                          to={detailPath} 
                          className="aspect-[4/5] w-[100px] sm:w-[130px] shrink-0 overflow-hidden rounded-[4px] bg-[#EFE9E1] border border-[#E6DED4]/30 shadow-sm"
                        >
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                        </Link>

                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-4">
                              <Link 
                                to={detailPath}
                                className="font-serif text-[16px] sm:text-[19px] font-normal leading-snug text-[#1C1916] hover:text-[#B58A5B] transition-colors cursor-pointer"
                              >
                                {item.name}
                              </Link>
                              
                              {/* Price */}
                              <span className="font-sans text-[15px] sm:text-[16px] font-medium text-[#1C1916] whitespace-nowrap">
                                ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                              </span>
                            </div>

                            {/* Options Details */}
                            <p className="font-sans text-[11px] sm:text-[12px] text-[#8A857E] mt-2 font-light">
                              {item.color} <span className="mx-1.5 text-[#E6DED4]">•</span> {item.size}
                            </p>
                            
                            {/* Stock Indicator */}
                            {item.stockQuantity <= 5 && (
                              <span className="inline-block mt-2 font-sans text-[9px] font-semibold uppercase tracking-wider text-[#C94C4C] bg-[#C94C4C]/5 px-2 py-0.5 rounded-[2px]">
                                Only {item.stockQuantity} items left
                              </span>
                            )}
                          </div>

                          {/* Controls & Delete */}
                          <div className="flex items-center justify-between mt-4">
                            
                            {/* Quantity Selector */}
                            <div className="flex items-center border border-[#E6DED4] bg-white rounded-[2px] shadow-xs">
                              <button
                                onClick={() => updateQuantity(item.key, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="px-3 py-1.5 text-[#8A857E] hover:text-[#1C1916] disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={11} />
                              </button>
                              <span className="px-2.5 font-sans text-[12px] text-[#1C1916] font-medium select-none min-w-[20px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.key, item.quantity + 1)}
                                disabled={item.quantity >= item.stockQuantity}
                                className="px-3 py-1.5 text-[#8A857E] hover:text-[#1C1916] disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed"
                                aria-label="Increase quantity"
                              >
                                <Plus size={11} />
                              </button>
                            </div>

                            {/* Trash Button */}
                            <button
                              onClick={() => {
                                removeItem(item.key);
                                toast("Item removed from cart", "info");
                              }}
                              className="p-2 text-[#8A857E] hover:text-[#C94C4C] hover:bg-[#C94C4C]/5 rounded-full cursor-pointer transition-colors duration-200"
                              aria-label="Remove item"
                            >
                              <Trash2 size={16} strokeWidth={1.5} />
                            </button>

                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Gift Note Accordion */}
                <div className="border border-[#E6DED4]/60 rounded-[4px] bg-[#FBF9F6] overflow-hidden transition-all duration-300">
                  <button
                    onClick={() => setShowGiftInput(!showGiftInput)}
                    className="w-full flex items-center justify-between p-5 text-left cursor-pointer hover:bg-[#F5EFE7]/30 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <Gift size={16} className="text-[#B58A5B]" />
                      <div>
                        <span className="font-sans text-[12px] md:text-[13px] font-medium tracking-wide text-[#1C1916]">
                          Add a gift note or special instructions
                        </span>
                        {isGiftSaved && (
                          <span className="ml-3 inline-flex items-center gap-1 text-[10px] font-semibold text-[#2E7D32] uppercase tracking-wider bg-[#2E7D32]/5 px-2 py-0.5 rounded-[2px]">
                            <Check size={8} strokeWidth={3} /> Added
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[#8A857E] font-light text-lg">
                      {showGiftInput ? "−" : "+"}
                    </span>
                  </button>

                  {showGiftInput && (
                    <form onSubmit={handleSaveGiftNote} className="px-5 pb-5 pt-1 border-t border-[#E6DED4]/40">
                      <textarea
                        value={giftNote}
                        onChange={(e) => setGiftNote(e.target.value)}
                        placeholder="Write a message to be hand-written on our luxury packaging card (Max 250 characters)..."
                        maxLength={250}
                        rows={3}
                        className="w-full p-3 bg-white border border-[#E6DED4] rounded-[2px] font-sans text-[12.5px] font-light text-[#1C1916] placeholder:text-[#8A857E]/65 focus:outline-none focus:border-[#B58A5B] transition-colors resize-none"
                      />
                      <div className="flex items-center justify-end gap-3 mt-3">
                        {isGiftSaved && (
                          <button
                            type="button"
                            onClick={handleClearGiftNote}
                            className="px-4 py-2 text-[10px] font-semibold tracking-wider uppercase text-[#C94C4C] hover:bg-[#C94C4C]/5 rounded-[2px] transition-colors cursor-pointer"
                          >
                            Remove Note
                          </button>
                        )}
                        <button
                          type="submit"
                          className="px-5 py-2 bg-[#1C1916] hover:bg-[#B58A5B] text-white text-[10px] font-semibold tracking-wider uppercase rounded-[2px] transition-colors cursor-pointer"
                        >
                          Save Instructions
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* Right Side: Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-[#FBF9F6] border border-[#E6DED4]/60 rounded-[4px] p-6 md:p-8 sticky top-[95px] shadow-xs">
                  <h2 className="font-serif text-[18px] font-normal tracking-wide text-[#1C1916] mb-6">
                    Order Summary
                  </h2>

                  <div className="space-y-4 font-sans text-[12.5px] font-light text-[#6B6560]">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-[#1C1916] font-medium">₹{totals.subtotal.toLocaleString("en-IN")}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className="text-[#1C1916]">
                        {totals.shipping === 0 ? (
                          <span className="text-[#2E7D32] font-semibold uppercase tracking-wider text-[10px] bg-[#2E7D32]/5 px-2 py-0.5 rounded-[2px]">Free</span>
                        ) : (
                          "Calculated at checkout"
                        )}
                      </span>
                    </div>

                    {totals.tax > 0 && (
                      <div className="flex justify-between">
                        <span>Estimated Tax</span>
                        <span className="text-[#1C1916]">₹{totals.tax.toLocaleString("en-IN")}</span>
                      </div>
                    )}

                    <div className="border-t border-[#E6DED4]/60 my-5 pt-4 flex justify-between text-[15px] font-normal text-[#1C1916]">
                      <span className="font-medium">Total</span>
                      <div className="text-right">
                        <span className="font-serif text-[18px] font-semibold">
                          ₹{(totals.subtotal + (totals.shipping > 0 ? totals.shipping : 0)).toLocaleString("en-IN")}
                        </span>
                        <p className="text-[10px] text-[#8A857E] mt-0.5 font-light">Taxes included</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCheckoutStep(1);
                      setShowCheckoutModal(true);
                    }}
                    className="w-full mt-6 bg-[#1C1916] text-white py-4 font-sans text-[10.5px] font-semibold uppercase tracking-[0.25em] rounded-[2px] hover:bg-[#B58A5B] transition-colors duration-300 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Checkout <ArrowRight size={13} />
                  </button>

                  {/* Benefit items */}
                  <div className="mt-8 pt-6 border-t border-[#E6DED4]/60 space-y-4 text-[11px] font-sans text-[#8A857E] font-light">
                    <div className="flex items-center gap-3">
                      <Truck size={14} className="text-[#B58A5B]" />
                      <span>Complimentary shipping on all orders</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Lock size={14} className="text-[#B58A5B]" />
                      <span>100% secure checkout and data protection</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <RotateCcw size={14} className="text-[#B58A5B]" />
                      <span>Easy returns within 7 days of delivery</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Footer Trust Badges (Matching details exactly) */}
          <div className="border-t border-[#E6DED4]/60 mt-20 pt-12 max-w-[1000px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-[#E6DED4]/60">
              
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-10 h-10 rounded-full bg-[#F5EFE7] flex items-center justify-center mb-3">
                  <Truck size={17} className="text-[#B58A5B]" />
                </div>
                <h4 className="font-serif text-[14px] font-normal text-[#1C1916]">
                  Complimentary Shipping
                </h4>
                <p className="text-[11.5px] text-[#8A857E] mt-1 font-light max-w-[180px]">
                  On all domestic orders
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-4 pt-8 md:pt-4">
                <div className="w-10 h-10 rounded-full bg-[#F5EFE7] flex items-center justify-center mb-3">
                  <RotateCcw size={17} className="text-[#B58A5B]" />
                </div>
                <h4 className="font-serif text-[14px] font-normal text-[#1C1916]">
                  Easy Returns
                </h4>
                <p className="text-[11.5px] text-[#8A857E] mt-1 font-light max-w-[180px]">
                  Within 7 days of delivery
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-4 pt-8 md:pt-4">
                <div className="w-10 h-10 rounded-full bg-[#F5EFE7] flex items-center justify-center mb-3">
                  <Lock size={17} className="text-[#B58A5B]" />
                </div>
                <h4 className="font-serif text-[14px] font-normal text-[#1C1916]">
                  Secure Payments
                </h4>
                <p className="text-[11.5px] text-[#8A857E] mt-1 font-light max-w-[180px]">
                  100% protected checkout
                </p>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Standard Site Footer */}
      <SiteFooter />

      {/* Checkout Dialog Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <div 
            onClick={() => setShowCheckoutModal(false)}
            className="fixed inset-0 bg-[#1C1916]/45 backdrop-blur-[4px] cursor-pointer"
          />

          {/* Modal content */}
          <div className="relative z-10 w-full max-w-[500px] bg-[#FAF8F5] border border-[#E6DED4] rounded-lg shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setShowCheckoutModal(false)}
              className="absolute right-4 top-4 text-[#8A857E] hover:text-[#1C1916] cursor-pointer text-xl font-light p-1"
            >
              ✕
            </button>

            {checkoutStep === 1 && (
              <form onSubmit={handleCheckoutSubmit}>
                <h3 className="font-serif text-[22px] font-normal tracking-wide text-[#1C1916] mb-2 flex items-center gap-2">
                  <CreditCard className="text-[#B58A5B]" size={20} /> Heritage Checkout
                </h3>
                <p className="font-sans text-[12.5px] text-[#8A857E] mb-6 font-light">
                  Provide your shipping information to complete the order.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B6560] mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={checkoutForm.email}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                      placeholder="e.g. customer@luxury.com"
                      className="w-full p-3 bg-white border border-[#E6DED4] rounded-[2px] font-sans text-[12.5px] placeholder:text-[#8A857E]/50 focus:outline-none focus:border-[#B58A5B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B6560] mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={checkoutForm.name}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                      placeholder="e.g. Devendra Singh"
                      className="w-full p-3 bg-white border border-[#E6DED4] rounded-[2px] font-sans text-[12.5px] placeholder:text-[#8A857E]/50 focus:outline-none focus:border-[#B58A5B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B6560] mb-1.5">
                      Shipping Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={checkoutForm.address}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                      placeholder="Street address, apartment, suite"
                      className="w-full p-3 bg-white border border-[#E6DED4] rounded-[2px] font-sans text-[12.5px] placeholder:text-[#8A857E]/50 focus:outline-none focus:border-[#B58A5B]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B6560] mb-1.5">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={checkoutForm.city}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, city: e.target.value })}
                        placeholder="Srinagar"
                        className="w-full p-3 bg-white border border-[#E6DED4] rounded-[2px] font-sans text-[12.5px] placeholder:text-[#8A857E]/50 focus:outline-none focus:border-[#B58A5B]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B6560] mb-1.5">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={checkoutForm.postalCode}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, postalCode: e.target.value })}
                        placeholder="190001"
                        className="w-full p-3 bg-white border border-[#E6DED4] rounded-[2px] font-sans text-[12.5px] placeholder:text-[#8A857E]/50 focus:outline-none focus:border-[#B58A5B]"
                      />
                    </div>
                  </div>

                  <div className="border-t border-[#E6DED4]/60 pt-4 mt-2">
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B6560] mb-1.5">
                      Card Details (Simulated Test Card)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={checkoutForm.cardNumber}
                      className="w-full p-3 bg-[#FAF8F5] border border-[#E6DED4] rounded-[2px] font-sans text-[12.5px] text-[#8A857E] cursor-not-allowed select-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-6 bg-[#1C1916] text-white py-4 font-sans text-[10.5px] font-semibold uppercase tracking-[0.2em] rounded-[2px] hover:bg-[#B58A5B] transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2"
                >
                  Pay Now (₹{(totals.subtotal + (totals.shipping > 0 ? totals.shipping : 0)).toLocaleString("en-IN")})
                </button>
              </form>
            )}

            {checkoutStep === 2 && (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 border-3 border-[#B58A5B] border-t-transparent rounded-full animate-spin mb-6" />
                <h3 className="font-serif text-[19px] text-[#1C1916] mb-2">Authenticating Transaction</h3>
                <p className="font-sans text-[13px] text-[#8A857E] font-light max-w-[280px] leading-relaxed">
                  Connecting to secure payment gateway. Please do not close this window.
                </p>
              </div>
            )}

            {checkoutStep === 3 && (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#2E7D32]/8 flex items-center justify-center text-[#2E7D32] mb-6 animate-bounce">
                  <Check size={32} strokeWidth={2} />
                </div>
                <h3 className="font-serif text-[24px] text-[#1C1916] mb-3">Order Confirmed</h3>
                <p className="font-sans text-[13.5px] text-[#8A857E] font-light max-w-[320px] leading-relaxed mb-8">
                  Thank you for your purchase. We have received your order and are preparing your luxury packaging. A confirmation email has been sent.
                </p>
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="bg-[#1C1916] hover:bg-[#B58A5B] text-white px-8 py-3.5 text-[10px] font-semibold tracking-[0.2em] uppercase rounded-[2px] transition-colors cursor-pointer"
                >
                  Return to Store
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
