import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Plus, Heart } from "lucide-react";
import { getCategorySlug, getHoverImage } from "../../lib/api";
import { useCart } from "../../context/CartContext";
import { useFavorite } from "../../context/FavoritesContext";
import { useCustomerAuth } from "../../context/CustomerAuthContext";

const getProductWeave = (p) => p.weave || p.material || "Diamond";
const getProductTime = (p) => p.time || "120 Hrs";
const getProductImage = (p) =>
  p.img || (p.images && p.images[0]?.url) || "/storefront/prod-1.png";
const getProductPrice = (p) => {
  if (typeof p.price === "string") return p.price;
  const priceVal = p.discountPrice || p.basePrice;
  return priceVal ? `₹ ${priceVal.toLocaleString("en-IN")}` : "₹ 30,000";
};

export default function ProductCard({
  p,
  viewMode = "grid",
  className = "",
  imageRef,
  showMeta = false,
  showAddButton = true,
  onClick,
}) {
  const { addToCart } = useCart();
  const { toggleFavorites, isFavorite } = useFavorite();
  const { isAuthenticated } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const productId = p._id || p.id;
  const favorite = isFavorite(productId);

  const catSlug = p.categorySlug || getCategorySlug(p.category);
  const hoverImg = p.hoverImg || getHoverImage(p);
  const detailPath = `/collection/${catSlug}/${p.slug}`;

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      // Redirect to login, preserving current page as redirect destination
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }
    await toggleFavorites(productId);
  };

  const defaultLayoutClass =
    viewMode === "list"
      ? "flex-col sm:flex-row gap-6 items-center border-b border-[#ECE7E1] pb-8"
      : "flex-col";

  const wrapperClass = `group flex text-decoration-none ${defaultLayoutClass} ${className}`;

  return (
    <Link to={detailPath} onClick={onClick} className={wrapperClass}>
      {/* Image container */}
      <div
        ref={imageRef}
        className={`relative overflow-hidden bg-[#EFE9E1] rounded-[2px] shrink-0
          ${viewMode === "list" ? "w-full sm:w-[220px] aspect-[4/5]" : "w-full aspect-[4/5]"}`}
      >
        <img
          src={getProductImage(p)}
          alt={p.name}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out group-hover:opacity-0"
        />
        <img
          src={hoverImg}
          alt={`${p.name} hover detail`}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out opacity-0 scale-[1.02] group-hover:opacity-100 group-hover:scale-100"
        />

        {/* Favorite button overlay */}
        <button
          onClick={handleToggleFavorite}
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          title={!isAuthenticated ? "Sign in to save favorites" : undefined}
          className="absolute cursor-pointer top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-[2px] text-[#1C1916] transition-all duration-200 hover:bg-white shadow-sm border border-[#1C1916]/5"
        >
          <Heart
            size={15}
            strokeWidth={1.5}
            className={`transition-colors duration-200 ${
              favorite ? "fill-[#B58A5B] text-[#B58A5B]" : "text-[#1C1916]"
            }`}
          />
        </button>
      </div>

      {/* Details container */}
      <div className={`flex-1 w-full ${viewMode === "list" ? "pt-2" : "mt-4"}`}>
        {showMeta ? (
          <>
            {/* Title + plus button row */}
            <div className="flex items-center justify-between gap-3 sm:mt-1">
              <h3 className="font-serif text-[15px] sm:text-[16px] font-normal leading-snug text-[#1C1916] group-hover:text-[#B58A5B] transition-colors duration-200">
                {p.name}
              </h3>
              {showAddButton && (
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
              )}
            </div>

            {/* Material + price row */}
            <div className="mt-1.5 flex items-center justify-between text-[12px] text-[#6B6560] sm:text-[13px]">
              <span className="font-sans font-light">
                {p.material || "Pashmina"}
              </span>
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
          </>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col">
              <h3 className="font-serif text-[15px] sm:text-[16px] font-normal leading-snug text-[#1C1916] group-hover:text-[#B58A5B] transition-colors duration-200">
                {p.name}
              </h3>
              <span className="font-sans text-[12px] sm:text-[13px] font-normal text-[#1C1916] mt-1.5">
                {getProductPrice(p)}
              </span>
            </div>
            {showAddButton && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addToCart(p, 1);
                }}
                aria-label={`Add ${p.name} to bag`}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#1C1916]/20 text-[#1C1916] transition-colors duration-200 hover:border-[#1C1916] hover:bg-[#1C1916] hover:text-white sm:h-8 sm:w-8 mt-0.5"
              >
                <Plus size={13} strokeWidth={1.5} />
              </button>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
