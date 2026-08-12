import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { api } from "../lib/api";
import { customerApi } from "../lib/customerApi";
import { useToast } from "./ToastContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const toast = useToast();
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem("zae_cart");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState(null);
  const [isBadgeAnimated, setIsBadgeAnimated] = useState(false);

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [backendTotals, setBackendTotals] = useState(null);
  const [loadingTotals, setLoadingTotals] = useState(false);
  const [errorTotals, setErrorTotals] = useState(null);

  const fetchBackendTotals = useCallback(async (items, address, coupon) => {
    if (!items || items.length === 0) {
      setBackendTotals(null);
      return;
    }
    setLoadingTotals(true);
    setErrorTotals(null);
    try {
      const data = await customerApi.orders.calculateTax({
        items: items.map(item => ({
          product: item.id,
          qty: item.quantity,
          price: item.price,
          size: item.size || ""
        })),
        shippingAddress: address,
        couponCode: coupon?.code || ""
      });
      setBackendTotals(data);
    } catch (err) {
      console.error("Failed to calculate backend totals:", err);
      setErrorTotals(err.message || "Failed to calculate tax and totals.");
    } finally {
      setLoadingTotals(false);
    }
  }, []);

  useEffect(() => {
    fetchBackendTotals(cart, selectedAddress, appliedCoupon);
  }, [cart, selectedAddress, appliedCoupon, fetchBackendTotals]);

  // Fetch settings dynamically to get freeShippingAbove threshold and taxRate
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api.settings.get();
        setSettings(data);
      } catch (err) {
        console.error("Failed to load settings in CartContext:", err);
      }
    };
    fetchSettings();
  }, []);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem("zae_cart", JSON.stringify(cart));
  }, [cart]);

  // Centralized Cart Service logic
  const addToCart = (product, quantity = 1, size = "", color = "") => {
    const productId = product._id || product.id;
    
    // Determine selected size and color
    let finalSize = size;
    if (!finalSize && product.sizes && product.sizes.length > 0) {
      finalSize = product.sizes[0].size;
    }
    if (!finalSize) {
      finalSize = product.size || "Standard (200x70cm)";
    }
    const finalColor = color || product.color || "Ivory";

    // Identifier key for variants
    const cartItemKey = `${productId}-${finalColor}-${finalSize}`;
    
    // Determine stock and price from selected size variant
    let stock = typeof product.quantity !== "undefined" ? product.quantity : (product.stockQuantity ?? 99);
    let price = product.discountPrice || product.basePrice || 30000;

    if (product.sizes && product.sizes.length > 0) {
      const selectedSizeObj = product.sizes.find(s => s.size === finalSize);
      if (selectedSizeObj) {
        stock = selectedSizeObj.quantity;
        price = selectedSizeObj.discountPrice > 0 && selectedSizeObj.discountPrice < selectedSizeObj.price
          ? selectedSizeObj.discountPrice
          : selectedSizeObj.price;
      }
    }

    if (stock <= 0) {
      toast("This product size is out of stock", "error");
      return;
    }

    let limitExceeded = false;

    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.key === cartItemKey);
      if (existingIdx > -1) {
        const currentQty = prev[existingIdx].quantity;
        if (currentQty >= stock) {
          limitExceeded = true;
          return prev;
        }
        const updated = [...prev];
        const newQty = Math.min(stock, currentQty + quantity);
        if (currentQty + quantity > stock) {
          limitExceeded = true;
        }
        updated[existingIdx].quantity = newQty;
        return updated;
      } else {
        const initialQty = Math.min(stock, quantity);
        if (quantity > stock) {
          limitExceeded = true;
        }
        const newItem = {
          key: cartItemKey,
          id: productId,
          name: product.name,
          slug: product.slug || "",
          price: price,
          image:
            product.img ||
            (product.images && product.images[0]?.url) ||
            "/storefront/prod-1.png",
          color: finalColor,
          size: finalSize,
          quantity: initialQty,
          category: product.category,
          stockQuantity: stock,
          lowStockThreshold: product.lowStockThreshold ?? 5,
          addedAt: Date.now(),
        };
        return [...prev, newItem];
      }
    });

    if (limitExceeded) {
      toast(`Cannot add more. Only ${stock} items are available in stock.`, "warning");
    } else {
      toast(`Added "${product.name}" to cart`, "success");
    }

    // Trigger badge animation and open drawer
    setIsBadgeAnimated(true);
    setTimeout(() => setIsBadgeAnimated(false), 800);
    setIsOpen(true);
  };

  const removeItem = (key) => {
    setCart((prev) => prev.filter((item) => item.key !== key));
  };

  const updateQuantity = (key, quantity) => {
    if (quantity < 1) return;
    let limitExceeded = false;
    let stockLimit = 99;
    
    setCart((prev) =>
      prev.map((item) => {
        if (item.key === key) {
          const stock = item.stockQuantity ?? 99;
          if (quantity > stock) {
            limitExceeded = true;
            stockLimit = stock;
            return { ...item, quantity: stock };
          }
          return { ...item, quantity };
        }
        return item;
      })
    );

    if (limitExceeded) {
      toast(`Only ${stockLimit} items are available in stock.`, "warning");
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  // Memoized totals calculation
  const totals = useMemo(() => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (backendTotals) {
      const freeShippingThreshold = settings?.freeShippingAbove ?? 10000;
      const isFreeShipping = subtotal >= freeShippingThreshold;
      return {
        subtotal: backendTotals.subtotal,
        shipping: backendTotals.shippingAmount,
        tax: backendTotals.taxAmount,
        taxRate: backendTotals.taxRate,
        taxName: backendTotals.taxName,
        taxType: backendTotals.taxType,
        taxJurisdiction: backendTotals.taxJurisdiction,
        total: backendTotals.total,
        discount: backendTotals.discountAmount || 0,
        itemCount,
        freeShippingThreshold,
        isFreeShipping,
        amountToFreeShipping: Math.max(0, freeShippingThreshold - subtotal),
        loading: loadingTotals,
        error: errorTotals,
        isBackend: true
      };
    }

    // Local fallback calculation while loading
    const freeShippingThreshold = settings?.freeShippingAbove ?? 10000;
    const isFreeShipping = subtotal >= freeShippingThreshold;
    const shipping = subtotal > 0 && !isFreeShipping ? 500 : 0; // ₹500 flat shipping fee if below threshold

    const taxRate = settings?.taxRate ?? 5; // default 5%
    const tax = Math.round(subtotal * (taxRate / 100));

    const total = subtotal + tax + shipping;

    return {
      subtotal,
      shipping,
      tax,
      total,
      discount: 0,
      itemCount,
      freeShippingThreshold,
      isFreeShipping,
      amountToFreeShipping: Math.max(0, freeShippingThreshold - subtotal),
      loading: loadingTotals,
      error: errorTotals,
      isBackend: false
    };
  }, [cart, backendTotals, settings, loadingTotals, errorTotals]);

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        setIsOpen,
        addToCart,
        removeItem,
        updateQuantity,
        clearCart,
        totals,
        isBadgeAnimated,
        settings,
        selectedAddress,
        setSelectedAddress,
        appliedCoupon,
        setAppliedCoupon,
        loadingTotals,
        errorTotals,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
