import { useMemo, useState } from "react";
import { countries } from "../config/countries";

export default function CountrySelect({
  value,
  onChange,
  label = "Country",
  includeDialCode = false,
  className = "",
  showSearch = true,
}) {
  const [query, setQuery] = useState("");

  const options = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter((country) =>
      `${country.name} ${country.code} ${country.dialCode}`
        .toLowerCase()
        .includes(q),
    );
  }, [query]);

  return (
    <div className={className}>
      {label && (
        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#6B6560]">
          {label}
        </label>
      )}
      {showSearch && (
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search country"
          className="mb-2 w-full rounded-[2px] border border-[#E6DED4] bg-white p-2.5 font-sans text-[12px] focus:outline-none focus:border-[#B58A5B]"
        />
      )}
      <select
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-[2px] border border-[#E6DED4] bg-white p-3 font-sans text-[12.5px] focus:outline-none focus:border-[#B58A5B]"
      >
        <option value="">Select country</option>
        {options.map((country) => (
          <option key={country.code} value={country.code}>
            {country.flag} {country.name}
            {includeDialCode ? ` (${country.dialCode})` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
