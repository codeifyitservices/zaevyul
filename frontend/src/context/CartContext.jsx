import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { api } from '../lib/api';
import CartDrawer from '../landing/components/CartDrawer';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem('zae_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState(null);
  const [isBadgeAnimated, setIsBadgeAnimated] = useState(false);

  // Fetch settings dynamically to get freeShippingAbove threshold and taxRate
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api.settings.get();
        setSettings(data);
      } catch (err) {
        console.error('Failed to load settings in CartContext:', err);
      }
    };
    fetchSettings();
  }, []);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('zae_cart', JSON.stringify(cart));
  }, [cart]);

  // Centralized Cart Service logic
  const addToCart = (product, quantity = 1, size = '', color = '') => {
    const productId = product._id || product.id;
    const finalSize = size || product.size || 'Standard (200x70cm)';
    const finalColor = color || product.color || 'Ivory';
    
    // Identifier key for variants
    const cartItemKey = `${productId}-${finalColor}-${finalSize}`;

    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.key === cartItemKey);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      } else {
        const newItem = {
          key: cartItemKey,
          id: productId,
          name: product.name,
          price: product.discountPrice || product.basePrice || 30000,
          image: product.img || (product.images && product.images[0]?.url) || "/storefront/prod-1.png",
          color: finalColor,
          size: finalSize,
          quantity,
          category: product.category,
          stockQuantity: product.quantity || 99,
        };
        return [...prev, newItem];
      }
    });

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
    setCart((prev) =>
      prev.map((item) => (item.key === key ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Memoized totals calculation
  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    const freeShippingThreshold = settings?.freeShippingAbove ?? 10000;
    const isFreeShipping = subtotal >= freeShippingThreshold;
    const shipping = subtotal > 0 && !isFreeShipping ? 500 : 0; // ₹500 flat shipping fee if below threshold
    
    const taxRate = settings?.taxRate ?? 5; // default 5%
    const tax = Math.round(subtotal * (taxRate / 100));
    
    const total = subtotal + tax + shipping;
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return {
      subtotal,
      shipping,
      tax,
      total,
      itemCount,
      freeShippingThreshold,
      isFreeShipping,
      amountToFreeShipping: Math.max(0, freeShippingThreshold - subtotal),
    };
  }, [cart, settings]);

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
      }}
    >
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
