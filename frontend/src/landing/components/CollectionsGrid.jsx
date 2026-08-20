import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { api } from "../../lib/api";

const FALLBACK_IMAGES = {
  shawls: "https://res.cloudinary.com/dfkkjncxc/image/upload/v1787124709/zaevyul/storefront/cat-shawls.jpg",
  stoles: "https://res.cloudinary.com/dfkkjncxc/image/upload/v1787124710/zaevyul/storefront/cat-stoles.jpg",
  embroidered: "https://res.cloudinary.com/dfkkjncxc/image/upload/v1787124707/zaevyul/storefront/cat-embroidered.jpg",
  scarves: "https://res.cloudinary.com/dfkkjncxc/image/upload/v1787124708/zaevyul/storefront/cat-scarves.jpg",
  blankets: "https://res.cloudinary.com/dfkkjncxc/image/upload/v1787124718/zaevyul/storefront/prod-stack.jpg",
  accessories: "https://res.cloudinary.com/dfkkjncxc/image/upload/v1787124717/zaevyul/storefront/prod-3.jpg",
};

const getCategoryImage = (cat) => {
  if (cat.mainImage?.url) return cat.mainImage.url;
  const slug = (cat.slug || cat.name || "").toLowerCase();
  return FALLBACK_IMAGES[slug] || "https://res.cloudinary.com/dfkkjncxc/image/upload/v1787124709/zaevyul/storefront/cat-shawls.jpg";
};

function ColCard({ cat, className = "" }) {
  const heightClass = className.includes("h-") ? "" : "h-full";
  return (
    <a
      href={`/collections/${cat.slug || cat.id}`}
      className={`group relative block w-full overflow-hidden rounded-[2px] ${heightClass} ${className}`}
    >
      <img
        src={getCategoryImage(cat)}
        alt={cat.name}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
      <div className="absolute bottom-5 left-5 sm:bottom-7 sm:left-7">
        <span className="block font-serif text-[21px] font-normal leading-none text-white sm:text-[26px]">
          {cat.name}
        </span>
        <span className="mt-2 inline-flex items-center gap-1.5 font-sans text-[9px] font-medium uppercase tracking-[0.12em] text-white/72 sm:text-[10px]">
          Explore <ArrowRight size={11} strokeWidth={1.5} />
        </span>
      </div>
    </a>
  );
}

export default function CollectionsGrid() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Fetch only the admin-featured categories in their configured order
        const data = await api.categories.featured();
        setCategories(data || []);
      } catch (error) {
        console.error("Error fetching featured categories for homepage:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading || categories.length < 4) {
    // Show static skeleton or local fallbacks while loading
    const defaultCats = [
      { id: "shawls", name: "Shawls", slug: "shawls" },
      { id: "stoles", name: "Stoles", slug: "stoles" },
      { id: "embroidered", name: "Embroidered", slug: "embroidered" },
      { id: "scarves", name: "Scarves", slug: "scarves" },
    ];
    const displayCats = categories.length >= 4 ? categories : defaultCats;

    return (
      <section id="collections" className="overflow-hidden bg-[#F3ECE3] py-20 sm:py-28 lg:py-36">
      <div className="mx-auto max-w-[1720px] 2xl:max-w-[1920px] 3xl:max-w-[2200px] px-6 sm:px-10 lg:px-16 w-full">
          <div className="text-center mb-16 sm:mb-20">
            <p className="mb-3 font-sans text-[10px] font-semibold uppercase tracking-[0.3em] text-[#B58A5B] sm:mb-4">
              Collections
            </p>
            <h2
              className="font-serif font-normal text-[#1C1916]"
              style={{ fontSize: "clamp(2rem, 3.8vw, 3.85rem)" }}
            >
              Curated for Every Moment.
            </h2>
          </div>

          <div className="relative z-0 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 sm:[grid-template-rows:280px_280px] lg:gap-5 lg:[grid-template-rows:380px_300px]">
            <ColCard cat={displayCats[0]} className="h-[160px] sm:h-full sm:row-span-2" />

            <div className="contents sm:grid sm:h-full sm:grid-cols-2 sm:gap-4 lg:gap-5">
              <ColCard cat={displayCats[1]} className="h-[160px] sm:h-full" />
              <ColCard cat={displayCats[2]} className="h-[160px] sm:h-full" />
            </div>

            <ColCard cat={displayCats[3]} className="h-[160px] sm:h-full" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="collections" className="overflow-hidden bg-[#F3ECE3] py-20 sm:py-28 lg:py-36">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-10 lg:px-16 w-full">
        <div className="text-center mb-16 sm:mb-20">
          <p className="mb-3 font-sans text-[10px] font-semibold uppercase tracking-[0.3em] text-[#B58A5B] sm:mb-4">
            Collections
          </p>
          <h2
            className="font-serif font-normal text-[#1C1916]"
            style={{ fontSize: "clamp(2rem, 3.8vw, 3.85rem)" }}
          >
            Curated for Every Moment.
          </h2>
        </div>

        <div className="relative z-0 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 sm:[grid-template-rows:280px_280px] lg:gap-5 lg:[grid-template-rows:380px_300px]">
          <ColCard cat={categories[0]} className="h-[160px] sm:h-full sm:row-span-2" />

          <div className="contents sm:grid sm:h-full sm:grid-cols-2 sm:gap-4 lg:gap-5">
            <ColCard cat={categories[1]} className="h-[160px] sm:h-full" />
            <ColCard cat={categories[2]} className="h-[160px] sm:h-full" />
          </div>

          <ColCard cat={categories[3]} className="h-[160px] sm:h-full" />
        </div>
      </div>
    </section>
  );
}

