import { Link } from "react-router-dom";

const RELATED = [
  {
    id: 8,
    name: "Sand Pashmina Shawl",
    price: "₹ 32,000",
    img: "/storefront/cat-shawls.png",
  },
  {
    id: 10,
    name: "Reversible Pashmina Shawl",
    price: "₹ 35,000",
    img: "/storefront/prod-3.png",
  },
  {
    id: 11,
    name: "Midnight Garden Shawl",
    price: "₹ 42,000",
    img: "/storefront/prod-2.png",
  },
  {
    id: 6,
    name: "Sozni Embroidered Shawl",
    price: "₹ 55,000",
    img: "/storefront/cat-embroidered.png",
  },
  {
    id: 12,
    name: "Pashmina Shawl",
    price: "₹ 30,000",
    img: "/storefront/prod-stack.png",
  },
];

export default function RelatedProducts() {
  return (
    <section className="bg-[#FAF8F5] py-16 sm:py-20 lg:py-24 border-t border-[#ECE7E1]">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-10 lg:px-16 w-full">
        
        {/* Section Title */}
        <h2 className="text-center font-sans text-[10px] sm:text-[11px] font-semibold tracking-[0.25em] uppercase text-[#8A857E] mb-12">
          YOU MAY ALSO LOVE
        </h2>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-6 xl:gap-8">
          {RELATED.map((p) => (
            <Link
              key={p.id}
              to={`/products/${p.id}`}
              onClick={() => window.scrollTo(0, 0)}
              className="group flex flex-col text-decoration-none"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-[#EFE9E1]">
                <img
                  src={p.img}
                  alt={p.name}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out group-hover:opacity-0"
                />
                <img
                  src={p.images?.[1]?.url || "/storefront/prod-2.png"}
                  alt={`${p.name} hover detail`}
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out opacity-0 scale-[1.02] group-hover:opacity-100 group-hover:scale-100"
                />
              </div>

              {/* Title & Price */}
              <div className="mt-4 flex flex-col">
                <h3 className="font-serif text-[13px] sm:text-[14px] font-normal leading-snug text-[#1C1916] group-hover:text-[#B58A5B] transition-colors duration-200">
                  {p.name}
                </h3>
                <span className="font-sans text-[11px] sm:text-[12px] font-light text-[#6B6560] mt-1">
                  {p.price}
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
