import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Plus, Minus, Heart, ChevronDown, ChevronUp } from "lucide-react";
import Navbar from "./components/Navbar";
import SiteFooter from "./components/SiteFooter";
import CraftHighlight from "./components/CraftHighlight";
import RelatedProducts from "./components/RelatedProducts";

import { api } from "../lib/api";
import { useCart } from "../context/CartContext";

const getProductPrice = (p) => {
  if (!p) return "";
  if (typeof p.price === 'string') return p.price;
  const priceVal = p.discountPrice || p.basePrice;
  return priceVal ? `₹ ${priceVal.toLocaleString('en-IN')}` : "₹ 30,000";
};

const getProductCategory = (p) => {
  if (!p) return "";
  if (typeof p.category === "string") return p.category.toUpperCase();
  return (p.category?.name || "PASHMINA & SHAWLS").toUpperCase();
};

const getProductImage = (p) => {
  if (!p) return "";
  return p.img || (p.images && p.images[0]?.url) || "/storefront/prod-1.png";
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const { addToCart } = useCart();
  const [accordions, setAccordions] = useState({
    details: true,
    shipping: false,
    care: false,
    artisan: false,
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await api.products.get(id);
        setProduct(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const toggleAccordion = (section) => {
    setAccordions((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleIncrement = () => setQuantity((q) => q + 1);
  const handleDecrement = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const handleAddToBag = () => {
    if (!product) return;
    setAdding(true);
    setTimeout(() => {
      addToCart(product, quantity);
      setAdding(false);
    }, 600);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#1C1916] font-sans flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-2 border-[#B58A5B] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-serif text-[18px] font-light text-[#6B6560] italic">Loading heritage...</p>
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#1C1916] font-sans flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-6 text-center">
          <h2 className="font-serif text-[24px] font-light text-[#1C1916] mb-3">Product Not Found</h2>
          <p className="text-[14px] text-[#6B6560] font-light mb-8 max-w-[360px]">
            The product you are looking for does not exist or may have been removed from our collection.
          </p>
          <Link to="/collections" className="bg-[#1C1916] hover:bg-[#B58A5B] text-white py-3.5 px-8 font-sans text-[10px] font-semibold uppercase tracking-[0.2em] rounded-[1px] transition-colors duration-300">
            EXPLORE COLLECTIONS
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

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

      <main className="pt-20 pb-16 sm:pb-24">
        {/* 3. Breadcrumbs */}
        <div className="mx-auto max-w-[1200px] px-6 sm:px-10 lg:px-16 w-full pt-6 pb-6 sm:pb-10">
          <nav className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A857E]">
            <Link to="/" className="hover:text-[#1C1916] transition-colors">HOME</Link>
            <span className="mx-2 text-[#E6DED4] sm:mx-3">/</span>
            <Link to="/collections" className="hover:text-[#1C1916] transition-colors">COLLECTIONS</Link>
            <span className="mx-2 text-[#E6DED4] sm:mx-3">/</span>
            <Link to="/collections" className="hover:text-[#1C1916] transition-colors">{getProductCategory(product)}</Link>
            <span className="mx-2 text-[#E6DED4] sm:mx-3">/</span>
            <span className="text-[#1C1916]">{product.name}</span>
          </nav>
        </div>

        {/* 4. Product Gallery & Specs Block */}
        <section className="mx-auto max-w-[1200px] px-6 sm:px-10 lg:px-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[1.12fr_0.88fr] gap-10 lg:gap-16 xl:gap-20 items-start">
            
            {/* Left Side: Product Image */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-[#EFE9E1]">
              <img
                src={getProductImage(product)}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            {/* Right Side: Product Configuration */}
            <div className="flex flex-col">
              {/* Category */}
              <span className="block font-sans text-[9px] sm:text-[10px] font-semibold tracking-[0.2em] uppercase text-[#8A857E] mb-3">
                {getProductCategory(product)}
              </span>

              {/* Title */}
              <h1 className="font-serif text-[32px] sm:text-[38px] lg:text-[44px] font-light leading-[1.15] text-[#1C1916] mb-3">
                {product.name}
              </h1>

              {/* Price */}
              <span className="block font-sans text-[16px] sm:text-[18px] font-normal text-[#1C1916] mb-6">
                {getProductPrice(product)}
              </span>

              {/* Description */}
              <p className="font-sans text-[13px] sm:text-[14px] text-[#6B6560] font-light leading-relaxed mb-8 border-b border-[#ECE7E1] pb-8">
                {product.description}
              </p>

              {/* Color Swatch */}
              <div className="mb-6">
                <span className="block font-sans text-[10px] font-semibold tracking-[0.16em] uppercase text-[#1C1916] mb-3">
                  COLOR: {product.color || "IVORY"}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    aria-label={`Select color ${product.color || "Ivory"}`}
                    className="w-7 h-7 rounded-full bg-[#EFE9E1] border-2 border-[#1C1916] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Size Selector */}
              <div className="mb-8">
                <span className="block font-sans text-[10px] font-semibold tracking-[0.16em] uppercase text-[#1C1916] mb-3">
                  SIZE: {product.size || "70 X 200 CM"}
                </span>
                <button className="border border-[#1C1916] text-[#1C1916] font-sans text-[11px] font-semibold uppercase tracking-[0.1em] px-5 py-2.5 bg-transparent hover:bg-[#1C1916]/5 transition-colors">
                  {product.size || "70 x 200 cm"}
                </button>
              </div>

              {/* Quantity counter */}
              <div className="mb-8 flex items-center justify-between border-t border-[#ECE7E1] pt-6">
                <span className="font-sans text-[10px] font-semibold tracking-[0.16em] uppercase text-[#1C1916]">
                  QUANTITY
                </span>
                <div className="flex items-center border border-[#ECE7E1] bg-white">
                  <button
                    onClick={handleDecrement}
                    className="p-3 text-[#6B6560] hover:text-[#1C1916] transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="px-5 font-sans text-[13px] text-[#1C1916] select-none">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrement}
                    className="p-3 text-[#6B6560] hover:text-[#1C1916] transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              {/* Add to Bag and Wishlist Buttons */}
              <div className="flex flex-col gap-4 mb-10">
                <button
                  onClick={handleAddToBag}
                  disabled={adding}
                  className="w-full bg-[#1C1916] hover:bg-[#B58A5B] text-white py-4 font-sans text-[10px] font-semibold uppercase tracking-[0.2em] rounded-[1px] transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  {adding ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>ADDING...</span>
                    </>
                  ) : (
                    "ADD TO BAG"
                  )}
                </button>
                <button className="w-full border border-[#1C1916] hover:bg-[#1C1916]/5 text-[#1C1916] py-4 font-sans text-[10px] font-semibold uppercase tracking-[0.2em] rounded-[1px] flex items-center justify-center gap-2.5 transition-colors duration-300">
                  <Heart size={14} strokeWidth={1.5} />
                  <span>ADD TO WISHLIST</span>
                </button>
              </div>

              {/* Accordion Menus */}
              <div className="divide-y divide-[#ECE7E1] border-t border-b border-[#ECE7E1]">
                
                {/* Accordion 1: Details */}
                <div className="py-4.5">
                  <button
                    onClick={() => toggleAccordion("details")}
                    className="flex w-full items-center justify-between text-[10px] font-semibold tracking-[0.16em] uppercase text-[#1C1916]"
                  >
                    <span>Product Details</span>
                    {accordions.details ? <ChevronUp size={14} strokeWidth={1.5} /> : <ChevronDown size={14} strokeWidth={1.5} />}
                  </button>
                  {accordions.details && (
                    <div className="mt-3.5 pl-0.5 text-[12.5px] sm:text-[13px] leading-relaxed text-[#6B6560] font-light">
                      <p className="mb-2">100% pure premium cashmere (Pashmina).</p>
                      <p className="mb-2">Authentic hand-spun yarn and hand-loomed weave.</p>
                      <p className="mb-2">Features traditional Sozni fine needle embroidery along the borders.</p>
                      <p>Dimensions: 70 x 200 cm (approximately 28 x 80 inches).</p>
                    </div>
                  )}
                </div>

                {/* Accordion 2: Shipping */}
                <div className="py-4.5">
                  <button
                    onClick={() => toggleAccordion("shipping")}
                    className="flex w-full items-center justify-between text-[10px] font-semibold tracking-[0.16em] uppercase text-[#1C1916]"
                  >
                    <span>Shipping & Returns</span>
                    {accordions.shipping ? <ChevronUp size={14} strokeWidth={1.5} /> : <ChevronDown size={14} strokeWidth={1.5} />}
                  </button>
                  {accordions.shipping && (
                    <div className="mt-3.5 pl-0.5 text-[12.5px] sm:text-[13px] leading-relaxed text-[#6B6560] font-light">
                      <p className="mb-2">Enjoy complimentary worldwide shipping on all orders.</p>
                      <p className="mb-2">Standard delivery takes 5-9 business days.</p>
                      <p>Handcrafted luxury items are eligible for exchange within 14 days of delivery.</p>
                    </div>
                  )}
                </div>

                {/* Accordion 3: Care */}
                <div className="py-4.5">
                  <button
                    onClick={() => toggleAccordion("care")}
                    className="flex w-full items-center justify-between text-[10px] font-semibold tracking-[0.16em] uppercase text-[#1C1916]"
                  >
                    <span>Care Instructions</span>
                    {accordions.care ? <ChevronUp size={14} strokeWidth={1.5} /> : <ChevronDown size={14} strokeWidth={1.5} />}
                  </button>
                  {accordions.care && (
                    <div className="mt-3.5 pl-0.5 text-[12.5px] sm:text-[13px] leading-relaxed text-[#6B6560] font-light">
                      <p className="mb-2">Dry clean only.</p>
                      <p className="mb-2">Store in a cool, dry place wrapped in a muslin cloth to protect from moths.</p>
                      <p>Iron on low heat under a protective cotton sheet if necessary.</p>
                    </div>
                  )}
                </div>

                {/* Accordion 4: Artisan */}
                <div className="py-4.5">
                  <button
                    onClick={() => toggleAccordion("artisan")}
                    className="flex w-full items-center justify-between text-[10px] font-semibold tracking-[0.16em] uppercase text-[#1C1916]"
                  >
                    <span>Artisan Story</span>
                    {accordions.artisan ? <ChevronUp size={14} strokeWidth={1.5} /> : <ChevronDown size={14} strokeWidth={1.5} />}
                  </button>
                  {accordions.artisan && (
                    <div className="mt-3.5 pl-0.5 text-[12.5px] sm:text-[13px] leading-relaxed text-[#6B6560] font-light">
                      <p className="mb-2">Hand-spun by Kashmiri women and hand-woven by local master weavers.</p>
                      <p className="mb-2">Embroidered by a skilled craftsman in Srinagar over a span of 120 hours.</p>
                      <p>Supports sustainable fair-trade livelihoods in the Kashmir valley.</p>
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        </section>
      </main>

      {/* 5. Craft Highlight Component */}
      <CraftHighlight />

      {/* 6. Related Products Component */}
      <RelatedProducts />

      {/* 7. Footer */}
      <SiteFooter />
    </div>
  );
}
