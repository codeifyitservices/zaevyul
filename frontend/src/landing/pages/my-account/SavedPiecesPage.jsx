import { Heart } from "lucide-react";

export default function SavedPiecesPage({ savedPieces, onToggleHeart }) {
  return (
    <div className="bg-white border border-[#E6DED4]/40 rounded-[4px] p-6 sm:p-8 shadow-xs">
      <div className="flex items-center justify-between border-b border-[#E6DED4]/60 pb-4 mb-6">
        <h3 className="font-serif text-[18px] font-normal tracking-wide text-[#1C1916] flex items-center gap-2.5">
          <Heart size={16} className="text-[#B58A5B]" /> Saved Pieces
        </h3>
      </div>

      {savedPieces.length === 0 ? (
        <div className="py-12 text-center text-[#8A857E] font-sans text-xs">
          No saved pieces yet. Browse items and click heart icon to save.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {savedPieces.map((p) => (
            <div key={p.id} className="group relative flex flex-col">
              <div className="relative aspect-[4/5] rounded-[2px] bg-[#EFE9E1] overflow-hidden border border-[#E6DED4]/30 shadow-xs">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                />
                <button
                  onClick={() => onToggleHeart(p.id, p.name)}
                  className="absolute top-2.5 right-2.5 bg-white/80 hover:bg-white p-2 rounded-full shadow-md text-[#B58A5B] hover:text-[#C94C4C] transition-all cursor-pointer"
                  aria-label="Remove from saved"
                >
                  <Heart size={12} fill="#B58A5B" strokeWidth={0} />
                </button>
              </div>
              <h4 className="font-sans text-[12px] font-medium text-[#1C1916] mt-3 leading-tight truncate">
                {p.name}
              </h4>
              <span className="font-sans text-[11px] text-[#6B6560] mt-1 font-light">
                ₹{p.price.toLocaleString("en-IN")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
