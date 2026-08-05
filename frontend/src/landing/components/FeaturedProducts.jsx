import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Plus } from "lucide-react";
import { api } from "../../lib/api";
import { useCart } from "../../context/CartContext";

const getProductWeave = (p) => p.weave || p.material || "Diamond";
const getProductTime = (p) => p.time || "120 Hrs";
const getProductImage = (p) => p.img || (p.images && p.images[0]?.url) || "/storefront/prod-1.png";
const getProductPrice = (p) => {
  if (typeof p.price === 'string') return p.price;
  const priceVal = p.discountPrice || p.basePrice;
  return priceVal ? `₹ ${priceVal.toLocaleString('en-IN')}` : "₹ 30,000";
};

function ProductCard({ p }) {
  const { addToCart } = useCart();
  return (
    <Link
      to={`/products/${p._id || p.id}`}
      className="group flex flex-col text-decoration-none"
    >
      {/* Image */}
      <div
        className="relative overflow-hidden rounded-[2px] bg-[#EFE9E1]"
        style={{ aspectRatio: "4/5" }}
      >
        <img
          src={getProductImage(p)}
          alt={p.name}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out group-hover:opacity-0"
        />
        <img
          src={p.images?.[1]?.url || "/storefront/prod-2.png"}
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
        <span className="font-sans font-normal text-[#1C1916]">{getProductPrice(p)}</span>
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

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const data = await api.products.list();
        // Limit to 3 items
        setProducts(data.slice(0, 3));
      } catch (error) {
        console.error("Error loading featured products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const displayProducts = products.length > 0 ? products : [
    { id: 1, name: "Ivory Sozni Shawl", price: "₹ 48,000", img: "/storefront/prod-1.png", weave: "Diamond", time: "120 Hrs", material: "Pashmina" },
    { id: 11, name: "Midnight Garden Shawl", price: "₹ 42,000", img: "/storefront/prod-2.png", weave: "Twill", time: "240 Hrs", material: "Pashmina" },
    { id: 3, name: "Sand Pashmina Stole", price: "₹ 18,000", img: "/storefront/prod-3.png", weave: "Plain", time: "45 Hrs", material: "Pashmina" }
  ];

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

        <div className="relative z-0 grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-9 lg:grid-cols-3 lg:gap-12 xl:gap-14">
          {displayProducts.map((p) => (
            <ProductCard key={p._id || p.id} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

