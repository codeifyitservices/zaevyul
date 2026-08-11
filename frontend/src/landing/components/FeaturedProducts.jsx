import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { api, getCategorySlug, getHoverImage } from "../../lib/api";
import { useCart } from "../../context/CartContext";

const getProductWeave = (p) => p.weave || p.material || "Diamond";
const getProductTime = (p) => p.time || "120 Hrs";
const getProductImage = (p) =>
  p.img || (p.images && p.images[0]?.url) || "/storefront/prod-1.png";
const getProductPrice = (p) => {
  if (typeof p.price === "string") return p.price;
  const priceVal = p.discountPrice || p.basePrice;
  return priceVal ? `₹ ${priceVal.toLocaleString("en-IN")}` : "₹ 30,000";
};

function ProductCard({ p, imageRef }) {
  const { addToCart } = useCart();
  const catSlug = getCategorySlug(p.category);
  return (
    <Link
      to={`/collection/${catSlug}/${p.slug}`}
      className="group flex flex-col text-decoration-none w-[78%] min-w-[240px] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-24px)] xl:w-[calc(33.333%-28px)] shrink-0 snap-start"
    >
      {/* Image */}
      <div
        ref={imageRef}
        className="relative overflow-hidden rounded-[2px] bg-[#EFE9E1]"
        style={{ aspectRatio: "4/5" }}
      >
        <img
          src={getProductImage(p)}
          alt={p.name}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out group-hover:opacity-0"
        />
        <img
          src={getHoverImage(p)}
          alt={`${p.name} hover detail`}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out opacity-0 scale-[1.02] group-hover:opacity-100 group-hover:scale-100"
        />
      </div>

      {/* Title + plus button row */}
      <div className="mt-4 flex items-center justify-between gap-3 sm:mt-5">
        <h3 className="font-serif text-[15px] sm:text-[16px] font-normal leading-snug text-[#1C1916] group-hover:text-[#B58A5B] transition-colors duration-200">
          {p.name}
        </h3>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addToCart(p, 1);
          }}
          aria-label={`Add ${p.name} to bag`}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#1C1916]/20 text-[#1C1916] transition-colors duration-200 hover:border-[#1C1916] hover:bg-[#1C1916] hover:text-white sm:h-8 sm:w-8"
        >
          <Plus size={13} strokeWidth={1.5} />
        </button>
      </div>

      {/* Material + price row */}
      <div className="mt-1.5 flex items-center justify-between text-[12px] text-[#6B6560] sm:text-[13px]">
        <span className="font-sans font-light">{p.material || "Pashmina"}</span>
        <span className="font-sans font-normal text-[#1C1916]">
          {getProductPrice(p)}
        </span>
      </div>

      {/* Weave / Time meta row */}
      <div className="mt-3.5 border-t border-[#ECE7E1] pt-3.5 sm:mt-4 sm:pt-4 grid grid-cols-2 gap-3">
        <div>
          <span className="block font-sans text-[9px] font-semibold tracking-[0.15em] uppercase text-[#B8AFA5] mb-1">
            Weave
          </span>
          <span className="block font-sans text-[12px] text-[#1C1916] sm:text-[13px]">
            {getProductWeave(p)}
          </span>
        </div>
        <div>
          <span className="block font-sans text-[9px] font-semibold tracking-[0.15em] uppercase text-[#B8AFA5] mb-1">
            Time
          </span>
          <span className="block font-sans text-[12px] text-[#1C1916] sm:text-[13px]">
            {getProductTime(p)}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [arrowTop, setArrowTop] = useState(null);
  const scrollerRef = useRef(null);
  const firstImageRef = useRef(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const data = await api.products.featured();
        setProducts(data);
      } catch (error) {
        console.error("Error loading featured products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const displayProducts =
    products.length > 0
      ? products
      : [
          {
            id: 1,
            name: "Ivory Sozni Shawl",
            price: "₹ 48,000",
            img: "/storefront/prod-1.png",
            weave: "Diamond",
            time: "120 Hrs",
            material: "Pashmina",
          },
          {
            id: 11,
            name: "Midnight Garden Shawl",
            price: "₹ 42,000",
            img: "/storefront/prod-2.png",
            weave: "Twill",
            time: "240 Hrs",
            material: "Pashmina",
          },
          {
            id: 3,
            name: "Sand Pashmina Stole",
            price: "₹ 18,000",
            img: "/storefront/prod-3.png",
            weave: "Plain",
            time: "45 Hrs",
            material: "Pashmina",
          },
          {
            id: 4,
            name: "Rose Kani Shawl",
            price: "₹ 55,000",
            img: "/storefront/prod-1.png",
            weave: "Kani",
            time: "300 Hrs",
            material: "Pashmina",
          },
          {
            id: 5,
            name: "Charcoal Tilla Stole",
            price: "₹ 22,000",
            img: "/storefront/prod-2.png",
            weave: "Tilla",
            time: "60 Hrs",
            material: "Pashmina",
          },
          {
            id: 6,
            name: "Blush Embroidered Shawl",
            price: "₹ 39,000",
            img: "/storefront/prod-3.png",
            weave: "Diamond",
            time: "150 Hrs",
            material: "Pashmina",
          },
        ];

  // Keep the arrow buttons vertically centered on the image itself,
  // not the full card (image + title + price + meta rows below it).
  const measureImageHeight = useCallback(() => {
    if (firstImageRef.current) {
      setArrowTop(firstImageRef.current.offsetHeight / 2);
    }
  }, []);

  useEffect(() => {
    measureImageHeight();
    window.addEventListener("resize", measureImageHeight);

    let observer;
    if (firstImageRef.current && "ResizeObserver" in window) {
      observer = new ResizeObserver(measureImageHeight);
      observer.observe(firstImageRef.current);
    }

    return () => {
      window.removeEventListener("resize", measureImageHeight);
      if (observer) observer.disconnect();
    };
  }, [measureImageHeight, displayProducts.length]);

  const scrollByCard = (direction) => {
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("a")?.offsetWidth || 300;
    const gap = 24;
    el.scrollBy({ left: direction * (cardWidth + gap), behavior: "smooth" });
  };

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

          <Link
            to="/collections"
            className="inline-flex items-center gap-2 whitespace-nowrap font-sans text-[9px] font-semibold uppercase tracking-[0.2em] text-[#6B6560] transition-colors duration-200 hover:text-[#1C1916] sm:text-[10px]"
          >
            View All
            <ArrowRight size={12} strokeWidth={1.5} />
          </Link>
        </div>

        {/* Scroller with edge-mounted chevron buttons */}
        <div className="relative">
          <button
            onClick={() => scrollByCard(-1)}
            aria-label="Scroll previous"
            style={arrowTop !== null ? { top: arrowTop } : undefined}
            className="hidden lg:flex absolute -left-5 xl:-left-6 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full border border-[#1C1916]/20 bg-[#FAF8F5] text-[#1C1916] shadow-sm transition-colors duration-200 hover:border-[#1C1916] hover:bg-[#1C1916] hover:text-white"
          >
            <ChevronLeft size={16} strokeWidth={1.5} />
          </button>

          <div
            ref={scrollerRef}
            className="relative z-0 flex overflow-x-auto pb-4 gap-6 scroll-smooth snap-x snap-mandatory scrollbar-none lg:gap-8 xl:gap-9"
          >
            {displayProducts.map((p, i) => (
              <ProductCard
                key={p._id || p.id}
                p={p}
                imageRef={i === 0 ? firstImageRef : undefined}
              />
            ))}
          </div>

          <button
            onClick={() => scrollByCard(1)}
            aria-label="Scroll next"
            style={arrowTop !== null ? { top: arrowTop } : undefined}
            className="hidden lg:flex absolute -right-5 xl:-right-6 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full border border-[#1C1916]/20 bg-[#FAF8F5] text-[#1C1916] shadow-sm transition-colors duration-200 hover:border-[#1C1916] hover:bg-[#1C1916] hover:text-white"
          >
            <ChevronRight size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </section>
  );
}
