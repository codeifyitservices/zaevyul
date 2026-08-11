import { Pencil, Trash2, Plus, MapPin } from "lucide-react";

export const INITIAL_ADDRESSES = [
  {
    id: 1,
    name: "Devyansh Grover",
    phone: "+91 98765 43210",
    lines: [
      "A-204, Green View Apartments,",
      "Sector 21, Faridabad",
      "Haryana - 121001, India",
    ],
    isDefault: true,
  },
  {
    id: 2,
    name: "Devyansh Grover",
    phone: "+91 98765 43210",
    lines: [
      "B-12, Surya Nagar,",
      "Near City Park, New Delhi",
      "Delhi - 110024, India",
    ],
    isDefault: false,
  },
  {
    id: 3,
    name: "Devyansh Grover",
    phone: "+91 98765 43210",
    lines: [
      "Flat 5C, Ocean View Residency,",
      "Marine Drive, Kochi",
      "Kerala - 682031, India",
    ],
    isDefault: false,
  },
];

export default function AddressesSection({
  addresses = INITIAL_ADDRESSES,
  onDeleteAddress,
  onAddAddress,
  onSetDefault,
}) {
  const handleDelete = (id) => {
    if (onDeleteAddress) {
      onDeleteAddress(id);
    }
  };

  const handleSetDefault = (id) => {
    if (onSetDefault) {
      onSetDefault(id);
    }
  };

  return (
    <div className="bg-white border border-[#E6DED4]/40 rounded-[4px] p-6 sm:p-8 shadow-xs">
      <div className="flex items-center justify-between border-b border-[#E6DED4]/60 pb-4 mb-6">
        <h3 className="font-serif text-[18px] font-normal tracking-wide text-[#1C1916] flex items-center gap-2.5">
          <MapPin size={16} className="text-[#B58A5B]" /> Saved Addresses
        </h3>
        <button
          onClick={onAddAddress}
          className="flex items-center gap-2 bg-[#F3EAE0] text-[#1C1916] text-[11px] font-semibold tracking-wide uppercase px-4 py-2.5 rounded-[2px] whitespace-nowrap hover:bg-[#ECDFCF] transition-colors cursor-pointer"
        >
          <Plus size={13} strokeWidth={2} />
          Add Address
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {addresses.map((addr) => (
          <div
            key={addr._id || addr.id}
            className="bg-white border border-[#ECE4D8] rounded-lg p-6 flex flex-col"
          >
            <div className="flex items-start justify-between mb-4 min-h-[26px]">
              {addr.isDefault ? (
                <span className="text-[11px] tracking-wide font-medium text-[#B08655] bg-[#F6EEE2] px-3 py-1 rounded-full">
                  Default
                </span>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-3 text-[#8A857E]">
                <button
                  className="hover:text-[#1C1916] transition-colors cursor-pointer"
                  aria-label="Edit address"
                >
                  <Pencil size={15} strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => handleDelete(addr._id || addr.id)}
                  className="hover:text-[#C0554A] transition-colors cursor-pointer"
                  aria-label="Delete address"
                >
                  <Trash2 size={15} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            <p className="text-[16px] font-medium text-[#1C1916] mb-2">
              {addr.name}
            </p>
            <p className="text-[14px] text-[#3D3833] mb-4">{addr.phone}</p>

            <div className="text-[14px] text-[#3D3833] leading-relaxed flex-1">
              {addr.lines ? (
                addr.lines.map((line, i) => (
                  <p key={i}>{line}</p>
                ))
              ) : (
                <>
                  <p>{addr.addressLine}</p>
                  <p>{addr.city}, {addr.state} - {addr.postalCode}</p>
                </>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-[#ECE4D8] flex justify-center">
              {addr.isDefault ? (
                <span className="flex items-center gap-1.5 text-[13px] text-[#7A7368]">
                  <MapPin size={13} strokeWidth={1.5} />
                  Default Address
                </span>
              ) : (
                <button
                  onClick={() => handleSetDefault(addr._id || addr.id)}
                  className="text-[13px] text-[#B08655] hover:text-[#1C1916] transition-colors cursor-pointer"
                >
                  Set as Default
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Add new address card */}
        <button
          onClick={onAddAddress}
          className="border border-dashed border-[#D8CFC0] rounded-lg flex flex-col items-center justify-center text-center py-12 px-6 min-h-[260px] hover:border-[#B08655] transition-colors cursor-pointer group"
        >
          <span className="w-12 h-12 rounded-full bg-[#F3EAE0] flex items-center justify-center mb-5 group-hover:bg-[#ECDFCF] transition-colors">
            <Plus size={18} strokeWidth={1.5} className="text-[#1C1916]" />
          </span>
          <span className="font-serif text-[18px] text-[#1C1916] mb-1.5">
            Add New Address
          </span>
          <span className="text-[13px] text-[#7A7368] leading-relaxed">
            Add a new address for
            <br />
            faster checkout.
          </span>
        </button>
      </div>
    </div>
  );
}
