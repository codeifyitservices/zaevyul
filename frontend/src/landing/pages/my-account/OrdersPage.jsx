import { Link } from "react-router-dom";
import { Sparkles, Mail, ArrowRight } from "lucide-react";

export default function OrdersPage() {
  return (
    <div className="bg-white border border-[#E6DED4]/40 rounded-[4px] p-6 sm:p-8 shadow-xs">
      <div className="flex items-center justify-between border-b border-[#E6DED4]/60 pb-4 mb-6">
        <h3 className="font-serif text-[18px] font-normal tracking-wide text-[#1C1916] flex items-center gap-2.5">
          <Sparkles size={16} className="text-[#B58A5B]" /> Latest Orders
        </h3>
      </div>

      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-12 h-12 rounded-full bg-[#FBF9F6] border border-[#E6DED4]/40 flex items-center justify-center text-[#8A857E] mb-4">
          <Mail size={18} strokeWidth={1.5} />
        </div>
        <p className="font-serif text-[15px] font-light text-[#1C1916] mb-1">
          You have no orders yet.
        </p>
        <p className="font-sans text-[12.5px] text-[#8A857E] font-light mb-5">
          Explore our handwoven, curated heritage pieces.
        </p>
        <Link
          to="/collections"
          className="group inline-flex items-center gap-2 text-[10.5px] font-semibold tracking-[0.2em] uppercase text-[#1C1916] hover:text-[#B58A5B] transition-colors duration-200 cursor-pointer"
        >
          Explore Collection{" "}
          <ArrowRight
            size={12}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </Link>
      </div>
    </div>
  );
}
