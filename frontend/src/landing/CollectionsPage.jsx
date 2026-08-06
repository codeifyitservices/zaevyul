import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Search,
  Heart,
  ShoppingBag,
  Filter,
  Grid,
  List,
  ChevronDown,
  ChevronUp,
  Plus,
  ArrowRight,
  X,
  Menu,
} from "lucide-react";
import SiteFooter from "./components/SiteFooter";
import Navbar from "./components/Navbar";

import { api, getCategorySlug, getHoverImage } from "../lib/api";
import { useCart } from "../context/CartContext";

const FILTER_OPTIONS = {
  material: ["100% Pashmina", "Silk Pashmina Blend"],
  color: ["Ivory", "Midnight Black", "Sand Beige", "Charcoal"],
  size: ["Standard (200x70cm)", "Large (200x100cm)"],
  design: ["Solid / Plain", "Sozni Embroidery", "Kani Weave"],
  price: ["Under ₹25,000", "₹25,000 - ₹50,000", "Over ₹50,000"],
};

const getProductImage = (p) => p.img || (p.images && p.images[0]?.url) || "/storefront/prod-1.png";
const getProductPrice = (p) => {
  if (typeof p.price === 'string') return p.price;
  const priceVal = p.discountPrice || p.basePrice;
  return priceVal ? `₹ ${priceVal.toLocaleString('en-IN')}` : "₹ 30,000";
};

export default function CollectionsPage() {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [openFilters, setOpenFilters] = useState({
    categories: true,
    material: false,
    color: false,
    size: false,
    design: false,
    price: false,
  });

  const [selectedFilters, setSelectedFilters] = useState({
    categories: [],
    material: [],
    color: [],
    size: [],
    design: [],
    price: [],
  });
  const [sortBy, setSortBy] = useState("newest");
  const { addToCart } = useCart();

  const handleFilterChange = (filterKey, value) => {
    setSelectedFilters((prev) => {
      const current = prev[filterKey] || [];
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [filterKey]: updated };
    });
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [prodList, catList] = await Promise.all([
          api.products.list(),
          api.categories.list()
        ]);
        setProducts(prodList);
        setCategories(catList);
      } catch (error) {
        console.error("Error loading collections page data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (mobileFilterOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileFilterOpen]);
  const activeCategoryObj = categories.find(
    (c) => (c.slug || c.id || "").toLowerCase() === (category || "").toLowerCase()
  );

  const isAllCollections = !category;

  useEffect(() => {
    if (isAllCollections) {
      document.title = "All Collections | Zaevyul Pashmina";
    } else {
      const name = activeCategoryObj?.name || category || "Pashmina & Shawls";
      document.title = `${name} | Zaevyul Pashmina`;
    }
    return () => {
      document.title = "Zaevyul Pashmina";
    };
  }, [isAllCollections, activeCategoryObj, category]);
  
  const filteredProducts = activeCategoryObj
    ? products.filter((p) => {
        const pCat = p.category;
        if (!pCat) return false;
        const pCatId = typeof pCat === "string" ? pCat : pCat._id || pCat.id;
        const activeCatId = activeCategoryObj._id || activeCategoryObj.id;
        return String(pCatId) === String(activeCatId);
      })
    : products;

  const activeFilteredProducts = filteredProducts.filter((p) => {
    // 1. Categories filter
    if (selectedFilters.categories.length > 0) {
      const pCat = p.category;
      if (!pCat) return false;
      const pCatId = typeof pCat === "string" ? pCat : pCat._id || pCat.id;
      if (!selectedFilters.categories.includes(String(pCatId))) return false;
    }

    // 2. Material filter
    if (selectedFilters.material.length > 0) {
      if (!p.material) return false;
      const m = p.material.toLowerCase();
      const match = selectedFilters.material.some((mat) => {
        if (mat === "100% Pashmina") return m.includes("100%") || m.includes("pure");
        if (mat === "Silk Pashmina Blend") return m.includes("silk") || m.includes("blend");
        return m.includes(mat.toLowerCase());
      });
      if (!match) return false;
    }

    // 3. Color filter
    if (selectedFilters.color.length > 0) {
      if (!p.color) return false;
      const c = p.color.toLowerCase();
      const match = selectedFilters.color.some((col) => {
        if (col === "Ivory") return c.includes("ivory") || c.includes("cream") || c.includes("white");
        if (col === "Midnight Black") return c.includes("black") || c.includes("midnight") || c.includes("dark") || c.includes("charcoal");
        if (col === "Sand Beige") return c.includes("beige") || c.includes("sand") || c.includes("saffron") || c.includes("amber") || c.includes("brown");
        if (col === "Charcoal") return c.includes("charcoal") || c.includes("grey") || c.includes("gray") || c.includes("stone") || c.includes("mist");
        return c.includes(col.toLowerCase());
      });
      if (!match) return false;
    }

    // 4. Size filter
    if (selectedFilters.size.length > 0) {
      if (!p.size) return false;
      const s = p.size.toLowerCase();
      const match = selectedFilters.size.some((sz) => {
        if (sz === "Standard (200x70cm)") return s.includes("standard") || s.includes("170") || s.includes("190") || s.includes("200");
        if (sz === "Large (200x100cm)") return s.includes("large") || s.includes("king") || s.includes("240");
        return s.includes(sz.toLowerCase());
      });
      if (!match) return false;
    }

    // 5. Design filter
    if (selectedFilters.design.length > 0) {
      const text = `${p.name} ${p.description || ""}`.toLowerCase();
      const match = selectedFilters.design.some((ds) => {
        if (ds === "Solid / Plain") return text.includes("solid") || text.includes("plain") || text.includes("classic") || text.includes("undyed");
        if (ds === "Sozni Embroidery") return text.includes("embroidery") || text.includes("embroidered") || text.includes("sozni");
        if (ds === "Kani Weave") return text.includes("kani") || text.includes("weave") || text.includes("woven") || text.includes("loomed") || text.includes("heritage");
        return text.includes(ds.toLowerCase());
      });
      if (!match) return false;
    }

    // 6. Price filter
    if (selectedFilters.price.length > 0) {
      const price = p.discountPrice || p.basePrice || 0;
      const match = selectedFilters.price.some((pr) => {
        if (pr === "Under ₹25,000") return price < 25000;
        if (pr === "₹25,000 - ₹50,000") return price >= 25000 && price <= 50000;
        if (pr === "Over ₹50,000") return price > 50000;
        return false;
      });
      if (!match) return false;
    }

    return true;
  });

  const sortedProducts = [...activeFilteredProducts];
  if (sortBy === "price-asc") {
    sortedProducts.sort((a, b) => {
      const pa = a.discountPrice || a.basePrice || 0;
      const pb = b.discountPrice || b.basePrice || 0;
      return pa - pb;
    });
  } else if (sortBy === "price-desc") {
    sortedProducts.sort((a, b) => {
      const pa = a.discountPrice || a.basePrice || 0;
      const pb = b.discountPrice || b.basePrice || 0;
      return pb - pa;
    });
  } else if (sortBy === "newest") {
    sortedProducts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  } else if (sortBy === "popular") {
    sortedProducts.sort((a, b) => (b.quantity || 0) - (a.quantity || 0));
  }

  const filteredProductsCount = sortedProducts.length;

  // Inject spotlight card at index 6 if there are enough products
  const displayProducts = [...sortedProducts];
  if (displayProducts.length >= 6) {
    displayProducts.splice(6, 0, { id: "spotlight", isSpotlight: true });
  } else {
    displayProducts.push({ id: "spotlight", isSpotlight: true });
  }

  const pageTitle = isAllCollections ? "ALL PRODUCTS" : (activeCategoryObj?.name?.toUpperCase() || "PASHMINA & SHAWLS");

  const getBannerHeading = () => {
    if (isAllCollections) {
      return (
        <>
          ALL
          <br />
          COLLECTIONS
        </>
      );
    }
    const name = activeCategoryObj?.name || category || "PASHMINA & SHAWLS";
    const upperName = name.toUpperCase();
    
    const words = upperName.split(" ");
    if (words.length > 1) {
      const ampersandIdx = words.indexOf("&");
      if (ampersandIdx !== -1) {
        const firstLine = words.slice(0, ampersandIdx).join(" ");
        const secondLine = words.slice(ampersandIdx).join(" ");
        return (
          <>
            {firstLine}
            <br />
            {secondLine}
          </>
        );
      }
      const mid = Math.ceil(words.length / 2);
      const firstLine = words.slice(0, mid).join(" ");
      const secondLine = words.slice(mid).join(" ");
      return (
        <>
          {firstLine}
          <br />
          {secondLine}
        </>
      );
    }
    
    return upperName;
  };

  const bannerHeading = getBannerHeading();
  
  const bannerSubtext = isAllCollections 
    ? "Explore our complete range of hand-loomed luxury pashmina products, curated with heritage."
    : (activeCategoryObj?.description || "Timeless weaves. Thoughtful details. Each piece carries the warmth of Kashmir.");

  const toggleFilter = (key) => {
    setOpenFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const resetFilters = () => {
    setSelectedFilters({
      categories: [],
      material: [],
      color: [],
      size: [],
      design: [],
      price: [],
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1916] font-sans selection:bg-[#B58A5B] selection:text-white">
      {/* 2. Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="pb-24 sm:pb-32">
        {/* 3. Breadcrumbs */}
        <div className="mx-auto max-w-[1200px] px-6 sm:px-10 lg:px-16 w-full pt-8 sm:pt-10 pb-4">
          <nav className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A857E]">
            <a href="/" className="hover:text-[#1C1916] transition-colors">HOME</a>
            <span className="mx-2.5 text-[#E6DED4] sm:mx-3">/</span>
            {isAllCollections ? (
              <span className="text-[#1C1916]">COLLECTIONS</span>
            ) : (
              <>
                <a href="/collections" className="hover:text-[#1C1916] transition-colors">COLLECTIONS</a>
                <span className="mx-2.5 text-[#E6DED4] sm:mx-3">/</span>
                <span className="text-[#1C1916]">{activeCategoryObj?.name?.toUpperCase() || "PASHMINA & SHAWLS"}</span>
              </>
            )}
          </nav>
        </div>

        {/* 4. Page Header Banner */}
        <section className="bg-[#FAF8F5] overflow-hidden border-b border-[#ECE7E1] w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch w-full">
            
            {/* Left Side (aligned with content container) */}
            <div className="py-10 sm:py-14 lg:py-20 px-6 sm:px-10 lg:pl-[max(4rem,calc((100vw-1200px)/2+4rem))] lg:pr-12 w-full flex flex-col justify-center">
              <div className="max-w-[500px]">
                <h1 className="font-serif text-[2.75rem] font-light leading-[1.08] text-[#1C1916] sm:text-[3.5rem] lg:text-[4.2rem] xl:text-[4.5rem]">
                  {bannerHeading}
                </h1>
                <p className="font-sans text-[13px] sm:text-[14px] text-[#6B6560] font-light leading-relaxed mt-5 max-w-[380px]">
                  {bannerSubtext}
                </p>
              </div>
            </div>

            {/* Right Side Full-Bleed Image (touches the right edge of browser) */}
            <div className="w-full h-[280px] sm:h-[360px] lg:h-auto min-h-[300px] lg:min-h-[450px] overflow-hidden">
              <img
                src="/storefront/pashmina-banner.png"
                alt="Luxurious folded pashmina fabrics with delicate fringes"
                className="w-full h-full object-cover"
              />
            </div>

          </div>
        </section>

        {/* 5. Filter/Sort Bar */}
        <section className="border-b border-[#ECE7E1] bg-[#FAF8F5] sticky top-[68px] z-30">
          <div className="mx-auto max-w-[1200px] px-6 sm:px-10 lg:px-16 w-full py-4 flex items-center justify-between">
            
            {/* Left side */}
            <div className="flex items-center">
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="flex items-center gap-2 font-sans text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1C1916] hover:text-[#B58A5B] transition-colors"
              >
                <Filter size={13} strokeWidth={1.5} />
                <span>FILTER</span>
              </button>
              <button
                onClick={resetFilters}
                className="hidden sm:inline-block text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8A857E] hover:text-[#1C1916] transition-colors ml-8"
              >
                Clear All
              </button>
              <span className="text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.16em] text-[#8A857E] ml-4 pl-4 sm:ml-8 sm:pl-8 border-l border-[#E6DED4]">
                {filteredProductsCount} {filteredProductsCount === 1 ? 'ITEM' : 'ITEMS'}
              </span>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-1 font-sans text-[9px] sm:text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1C1916]/80">
                <span className="hidden sm:inline">SORT BY:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-0 focus:outline-none focus:ring-0 text-[#1C1916] font-semibold cursor-pointer pr-4 text-[9px] sm:text-[10px] md:text-[11px]"
                >
                  <option value="newest">NEWEST</option>
                  <option value="price-asc">PRICE: LOW TO HIGH</option>
                  <option value="price-desc">PRICE: HIGH TO LOW</option>
                  <option value="popular">POPULAR</option>
                </select>
              </div>

              {/* Grid/List Toggle */}
              <div className="hidden sm:flex items-center gap-3 border-l border-[#E6DED4] pl-6 text-[#8A857E]">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`transition-colors duration-200 ${viewMode === "grid" ? "text-[#1C1916]" : "hover:text-[#1C1916]"}`}
                  aria-label="Grid view"
                >
                  <Grid size={15} strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`transition-colors duration-200 ${viewMode === "list" ? "text-[#1C1916]" : "hover:text-[#1C1916]"}`}
                  aria-label="List view"
                >
                  <List size={15} strokeWidth={1.5} />
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* Product Section Grid + Sidebar Layout */}
        <section className="mx-auto max-w-[1200px] px-6 sm:px-10 lg:px-16 w-full mt-10">
          <div className="flex gap-10 lg:gap-14 xl:gap-20">
            
            {/* 6. Sidebar Filters (Desktop only) */}
            <aside className="hidden lg:block w-[200px] shrink-0">
              <div className="divide-y divide-[#ECE7E1] border-b border-[#ECE7E1]">
                
                {/* 1. Categories Accordion */}
                <div className="py-4">
                  <button
                    onClick={() => toggleFilter("categories")}
                    className="flex w-full items-center justify-between text-[10px] font-semibold tracking-[0.16em] uppercase text-[#1C1916]"
                  >
                    <span>Categories</span>
                    {openFilters.categories ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                  {openFilters.categories && (
                    <div className="mt-4 flex flex-col gap-3">
                      {(categories.length > 0 ? categories : [
                        { _id: "shawls", name: "Shawls", slug: "shawls" },
                        { _id: "stoles", name: "Stoles", slug: "stoles" },
                        { _id: "scarves", name: "Scarves", slug: "scarves" },
                        { _id: "throws", name: "Throws", slug: "throws" },
                      ]).map((opt) => {
                        const optId = String(opt.id || opt._id);
                        return (
                          <label key={optId} className="flex items-center gap-3 cursor-pointer text-[12px] text-[#6B6560] hover:text-[#1C1916] transition-colors">
                            <input
                              type="checkbox"
                              checked={selectedFilters.categories.includes(optId)}
                              onChange={() => handleFilterChange("categories", optId)}
                              className="rounded-[1px] border-[#E6DED4] text-[#B58A5B] focus:ring-[#B58A5B] w-3.5 h-3.5"
                            />
                            <span>{opt.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. Material Accordion */}
                <div className="py-4">
                  <button
                    onClick={() => toggleFilter("material")}
                    className="flex w-full items-center justify-between text-[10px] font-semibold tracking-[0.16em] uppercase text-[#1C1916]"
                  >
                    <span>Material</span>
                    {openFilters.material ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                  {openFilters.material && (
                    <div className="mt-4 flex flex-col gap-3">
                      {FILTER_OPTIONS.material.map((opt) => (
                        <label key={opt} className="flex items-center gap-3 cursor-pointer text-[12px] text-[#6B6560] hover:text-[#1C1916]">
                          <input
                            type="checkbox"
                            checked={selectedFilters.material.includes(opt)}
                            onChange={() => handleFilterChange("material", opt)}
                            className="rounded-[1px] border-[#E6DED4] text-[#B58A5B] focus:ring-[#B58A5B] w-3.5 h-3.5"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Color Accordion */}
                <div className="py-4">
                  <button
                    onClick={() => toggleFilter("color")}
                    className="flex w-full items-center justify-between text-[10px] font-semibold tracking-[0.16em] uppercase text-[#1C1916]"
                  >
                    <span>Color</span>
                    {openFilters.color ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                  {openFilters.color && (
                    <div className="mt-4 flex flex-col gap-3">
                      {FILTER_OPTIONS.color.map((opt) => (
                        <label key={opt} className="flex items-center gap-3 cursor-pointer text-[12px] text-[#6B6560] hover:text-[#1C1916]">
                          <input
                            type="checkbox"
                            checked={selectedFilters.color.includes(opt)}
                            onChange={() => handleFilterChange("color", opt)}
                            className="rounded-[1px] border-[#E6DED4] text-[#B58A5B] focus:ring-[#B58A5B] w-3.5 h-3.5"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. Size Accordion */}
                <div className="py-4">
                  <button
                    onClick={() => toggleFilter("size")}
                    className="flex w-full items-center justify-between text-[10px] font-semibold tracking-[0.16em] uppercase text-[#1C1916]"
                  >
                    <span>Size</span>
                    {openFilters.size ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                  {openFilters.size && (
                    <div className="mt-4 flex flex-col gap-3">
                      {FILTER_OPTIONS.size.map((opt) => (
                        <label key={opt} className="flex items-center gap-3 cursor-pointer text-[12px] text-[#6B6560] hover:text-[#1C1916]">
                          <input
                            type="checkbox"
                            checked={selectedFilters.size.includes(opt)}
                            onChange={() => handleFilterChange("size", opt)}
                            className="rounded-[1px] border-[#E6DED4] text-[#B58A5B] focus:ring-[#B58A5B] w-3.5 h-3.5"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* 5. Design Accordion */}
                <div className="py-4">
                  <button
                    onClick={() => toggleFilter("design")}
                    className="flex w-full items-center justify-between text-[10px] font-semibold tracking-[0.16em] uppercase text-[#1C1916]"
                  >
                    <span>Design</span>
                    {openFilters.design ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                  {openFilters.design && (
                    <div className="mt-4 flex flex-col gap-3">
                      {FILTER_OPTIONS.design.map((opt) => (
                        <label key={opt} className="flex items-center gap-3 cursor-pointer text-[12px] text-[#6B6560] hover:text-[#1C1916]">
                          <input
                            type="checkbox"
                            checked={selectedFilters.design.includes(opt)}
                            onChange={() => handleFilterChange("design", opt)}
                            className="rounded-[1px] border-[#E6DED4] text-[#B58A5B] focus:ring-[#B58A5B] w-3.5 h-3.5"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* 6. Price Accordion */}
                <div className="py-4">
                  <button
                    onClick={() => toggleFilter("price")}
                    className="flex w-full items-center justify-between text-[10px] font-semibold tracking-[0.16em] uppercase text-[#1C1916]"
                  >
                    <span>Price</span>
                    {openFilters.price ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                  {openFilters.price && (
                    <div className="mt-4 flex flex-col gap-3">
                      {FILTER_OPTIONS.price.map((opt) => (
                        <label key={opt} className="flex items-center gap-3 cursor-pointer text-[12px] text-[#6B6560] hover:text-[#1C1916]">
                          <input
                            type="checkbox"
                            checked={selectedFilters.price.includes(opt)}
                            onChange={() => handleFilterChange("price", opt)}
                            className="rounded-[1px] border-[#E6DED4] text-[#B58A5B] focus:ring-[#B58A5B] w-3.5 h-3.5"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Reset Filters button */}
              <button
                onClick={resetFilters}
                className="w-full border border-[#1C1916] text-[#1C1916] hover:bg-[#1C1916] hover:text-white transition-colors duration-300 py-3 text-[10px] font-semibold tracking-[0.2em] uppercase rounded-[1px] mt-8"
              >
                RESET FILTERS
              </button>
            </aside>

            {/* Mobile Filter Drawer Overlay */}
            <div className={`fixed inset-0 z-50 flex lg:hidden transition-opacity duration-300 ${mobileFilterOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
              <div
                className="fixed inset-0 bg-black/35 backdrop-blur-sm"
                onClick={() => setMobileFilterOpen(false)}
              />
              <div className={`relative w-full max-w-[320px] bg-[#FAF8F5] p-6 flex flex-col justify-between border-r border-[#E6DED4] overflow-y-auto transition-transform duration-500 ease-in-out ${mobileFilterOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-[#E6DED4]">
                    <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1C1916]">
                      FILTERS
                    </span>
                    <button
                      onClick={() => setMobileFilterOpen(false)}
                      className="text-[#1C1916]/60 hover:text-[#1C1916]"
                    >
                      <X size={18} strokeWidth={1.5} />
                    </button>
                  </div>

                  <div className="divide-y divide-[#ECE7E1] mt-4">
                    {/* Accordions inside mobile drawer */}
                    {Object.keys(openFilters).map((filterKey) => (
                      <div key={filterKey} className="py-4">
                        <button
                          onClick={() => toggleFilter(filterKey)}
                          className="flex w-full items-center justify-between text-[10px] font-semibold tracking-[0.16em] uppercase text-[#1C1916]"
                        >
                          <span className="capitalize">{filterKey}</span>
                          {openFilters[filterKey] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                        {openFilters[filterKey] && (
                          <div className="mt-3.5 flex flex-col gap-2.5 pl-1">
                            {filterKey === "categories" &&
                              (categories.length > 0 ? categories : [
                                { _id: "shawls", name: "Shawls", slug: "shawls" },
                                { _id: "stoles", name: "Stoles", slug: "stoles" },
                                { _id: "scarves", name: "Scarves", slug: "scarves" },
                                { _id: "throws", name: "Throws", slug: "throws" },
                              ]).map((opt) => {
                                const optId = String(opt.id || opt._id);
                                return (
                                  <label key={optId} className="flex items-center gap-3 cursor-pointer text-[12px] text-[#6B6560]">
                                    <input
                                      type="checkbox"
                                      checked={selectedFilters.categories.includes(optId)}
                                      onChange={() => handleFilterChange("categories", optId)}
                                      className="rounded-[1px] border-[#E6DED4] text-[#B58A5B] w-3.5 h-3.5"
                                    />
                                    <span>{opt.name}</span>
                                  </label>
                                );
                              })}
                            {filterKey !== "categories" &&
                              (FILTER_OPTIONS[filterKey] || []).map((opt) => (
                                <label key={opt} className="flex items-center gap-3 cursor-pointer text-[12px] text-[#6B6560]">
                                  <input
                                    type="checkbox"
                                    checked={selectedFilters[filterKey].includes(opt)}
                                    onChange={() => handleFilterChange(filterKey, opt)}
                                    className="rounded-[1px] border-[#E6DED4] text-[#B58A5B] w-3.5 h-3.5"
                                  />
                                  <span>{opt}</span>
                                </label>
                              ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 mt-8 pt-4 border-t border-[#ECE7E1]">
                  <button
                    onClick={() => {
                      resetFilters();
                      setMobileFilterOpen(false);
                    }}
                    className="flex-1 border border-[#1C1916]/40 text-[#1C1916]/70 py-3 text-[10px] font-semibold uppercase tracking-[0.15em]"
                  >
                    CLEAR
                  </button>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="flex-1 bg-[#1C1916] text-white py-3 text-[10px] font-semibold uppercase tracking-[0.15em] hover:bg-[#B58A5B] transition-colors"
                  >
                    APPLY
                  </button>
                </div>
              </div>
            </div>

            {/* 7. Product Grid */}
            <div className="flex-1">
              {sortedProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-[#ECE7E1] rounded-[2px] bg-[#FAF8F5] px-6">
                  <span className="font-serif text-[18px] uppercase tracking-[0.15em] text-[#6B6560] mb-2">
                    No products found
                  </span>
                  <p className="font-sans text-[12px] text-[#8A857E] max-w-[320px] leading-relaxed">
                    We couldn't find any products matching your current filter selections. Try clearing some filters.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="mt-6 bg-[#1C1916] text-white px-8 py-3 text-[9px] font-semibold uppercase tracking-[0.2em] rounded-[1px] hover:bg-[#B58A5B] transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <>
                  <div
                    className={`grid gap-x-6 gap-y-12 sm:gap-x-8 sm:gap-y-16 lg:gap-x-10
                      ${viewMode === "grid" ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
                  >
                    {displayProducts.map((p, idx) => {
                      // Index 6 is the Artisan Spotlight Card
                      if (p.isSpotlight) {
                        return (
                          <div
                            key="spotlight"
                            className={`flex flex-col justify-between bg-[#F5EFE7] rounded-[2px] border border-[#E6DED4]/60 overflow-hidden
                              ${viewMode === "list" ? "sm:flex-row sm:items-stretch sm:min-h-[220px]" : "min-h-[380px]"}`}
                          >
                            {/* Top half: Image */}
                            <div className={`overflow-hidden relative bg-[#EFE9E1] ${viewMode === "list" ? "sm:w-[40%] sm:h-full" : "h-[45%]"}`}>
                              <img
                                src="/storefront/artisan.png"
                                alt="Artisan working at a weaving loom"
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                            </div>

                            {/* Bottom half: Content */}
                            <div className={`p-6 flex flex-col justify-between ${viewMode === "list" ? "sm:w-[60%] sm:justify-center" : "h-[55%]"}`}>
                              <div>
                                <span className="block font-sans text-[9px] font-semibold tracking-[0.2em] uppercase text-[#B58A5B] mb-2.5">
                                  ARTISAN SPOTLIGHT
                                </span>
                                <p className="font-serif text-[15px] sm:text-[16px] font-light italic leading-relaxed text-[#1C1916]">
                                  Weaver's hands to brave every seal convection what the-willsart of dimart and chant in the loom.
                                </p>
                              </div>
                              <a
                                href="#"
                                className="group inline-flex items-center gap-1.5 font-sans text-[9px] sm:text-[10px] font-semibold tracking-[0.15em] uppercase text-[#1C1916] border-b border-[#1C1916]/20 pb-0.5 w-fit mt-5 hover:border-[#1C1916] transition-all"
                              >
                                <span>The Loom (Journal)</span>
                                <ArrowRight
                                  size={12}
                                  strokeWidth={1.5}
                                  className="transition-transform duration-300 group-hover:translate-x-1"
                                />
                              </a>
                            </div>
                          </div>
                        );
                      }

                      // Standard Product Card
                      return (
                        <Link
                          key={p._id || p.id}
                          to={`/collection/${getCategorySlug(p.category)}/${p.slug}`}
                          className={`group flex text-decoration-none ${viewMode === "list" ? "flex-col sm:flex-row gap-6 items-center border-b border-[#ECE7E1] pb-8" : "flex-col"}`}
                        >
                          {/* Image container */}
                          <div
                            className={`relative overflow-hidden bg-[#EFE9E1] rounded-[2px] shrink-0
                              ${viewMode === "list" ? "w-full sm:w-[220px] aspect-[4/5]" : "w-full aspect-[4/5]"}`}
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

                          {/* Details container */}
                          <div className={`flex-1 w-full ${viewMode === "list" ? "pt-2" : "mt-4"}`}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex flex-col">
                                <h3 className="font-serif text-[15px] sm:text-[16px] font-normal leading-snug text-[#1C1916] group-hover:text-[#B58A5B] transition-colors duration-200">
                                  {p.name}
                                </h3>
                                <span className="font-sans text-[12px] sm:text-[13px] font-normal text-[#1C1916] mt-1.5">
                                  {getProductPrice(p)}
                                </span>
                              </div>
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
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  {/* 8. Load More button */}
                  <div className="flex justify-center mt-16 sm:mt-20">
                    <button className="border border-[#1C1916] text-[#1C1916] hover:bg-[#1C1916] hover:text-white transition-colors duration-300 px-10 py-3.5 text-[10px] font-semibold tracking-[0.25em] uppercase rounded-[1px]">
                      LOAD MORE
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </section>
      </main>

      {/* 9. Site Footer */}
      <SiteFooter />
    </div>
  );
}
