export default function AddressModal({
  show,
  onClose,
  addressForm,
  setAddressForm,
  onSubmit,
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#1C1916]/45 backdrop-blur-[4px] cursor-pointer"
      />

      <div className="relative z-10 w-full max-w-[450px] rounded-lg border border-[#E6DED4] bg-[#FAF8F5] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 sm:p-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 text-xl font-light text-[#8A857E] transition-colors hover:text-[#1C1916] cursor-pointer"
        >
          ×
        </button>

        <form onSubmit={onSubmit} className="space-y-4">
          <h3 className="mb-4 font-serif text-[20px] font-normal tracking-wide text-[#1C1916]">
            Add New Address
          </h3>

          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#6B6560]">
              Address Tag (e.g. Home, Office)
            </label>
            <input
              type="text"
              required
              value={addressForm.label}
              onChange={(e) =>
                setAddressForm({ ...addressForm, label: e.target.value })
              }
              placeholder="e.g. Home"
              className="w-full rounded-[2px] border border-[#E6DED4] bg-white p-3 font-sans text-[12.5px] focus:outline-none focus:border-[#B58A5B]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#6B6560]">
              Street Address *
            </label>
            <input
              type="text"
              required
              value={addressForm.addressLine}
              onChange={(e) =>
                setAddressForm({
                  ...addressForm,
                  addressLine: e.target.value,
                })
              }
              placeholder="House number, apartment number, street details"
              className="w-full rounded-[2px] border border-[#E6DED4] bg-white p-3 font-sans text-[12.5px] focus:outline-none focus:border-[#B58A5B]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#6B6560]">
                City *
              </label>
              <input
                type="text"
                required
                value={addressForm.city}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, city: e.target.value })
                }
                placeholder="Srinagar"
                className="w-full rounded-[2px] border border-[#E6DED4] bg-white p-3 font-sans text-[12.5px] focus:outline-none focus:border-[#B58A5B]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#6B6560]">
                State / UT
              </label>
              <input
                type="text"
                value={addressForm.state}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, state: e.target.value })
                }
                placeholder="Jammu & Kashmir"
                className="w-full rounded-[2px] border border-[#E6DED4] bg-white p-3 font-sans text-[12.5px] focus:outline-none focus:border-[#B58A5B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#6B6560]">
                Postal Code *
              </label>
              <input
                type="text"
                required
                value={addressForm.postalCode}
                onChange={(e) =>
                  setAddressForm({
                    ...addressForm,
                    postalCode: e.target.value,
                  })
                }
                placeholder="190001"
                className="w-full rounded-[2px] border border-[#E6DED4] bg-white p-3 font-sans text-[12.5px] focus:outline-none focus:border-[#B58A5B]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#6B6560]">
                Phone Number
              </label>
              <input
                type="text"
                value={addressForm.phone}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, phone: e.target.value })
                }
                placeholder="9900000000"
                className="w-full rounded-[2px] border border-[#E6DED4] bg-white p-3 font-sans text-[12.5px] focus:outline-none focus:border-[#B58A5B]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-[2px] bg-[#1C1916] py-4 font-sans text-[10.5px] font-semibold uppercase tracking-[0.2em] text-white transition-colors duration-200 hover:bg-[#B58A5B] cursor-pointer"
          >
            Add Address
          </button>
        </form>
      </div>
    </div>
  );
}
