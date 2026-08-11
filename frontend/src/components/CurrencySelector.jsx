import React from "react";
import { useCurrency } from "../context/CurrencyContext";
import { CURRENCIES } from "../config/currencies";

export default function CurrencySelector({ className = "" }) {
  const { currencyCode, setCurrency } = useCurrency();

  return (
    <div className={`relative inline-block ${className}`}>
      <select
        value={currencyCode}
        onChange={(e) => setCurrency(e.target.value)}
        aria-label="Select currency"
        className="max-w-[72px] appearance-none truncate border-0 bg-transparent pr-3 font-sans text-[9px] font-semibold uppercase tracking-[0.08em] text-[#1C1916]/64 hover:text-[#1C1916] focus:outline-none focus:ring-0 sm:max-w-none sm:pr-4 sm:text-[10px] sm:tracking-[0.16em] cursor-pointer"
        style={{
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='8' height='4' viewBox='0 0 8 4'><path fill='%231C1916' fill-opacity='0.64' d='M0 0l4 4 4-4z'/></svg>")`,
          backgroundPosition: "right 4px center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "8px 4px",
        }}
      >
        {CURRENCIES.map((c) => (
          <option
            key={c.code}
            value={c.code}
            className="bg-[#FAF8F5] text-[#1C1916] font-sans text-[10.5px] uppercase"
          >
            {c.code} ({c.symbol})
          </option>
        ))}
      </select>
    </div>
  );
}
