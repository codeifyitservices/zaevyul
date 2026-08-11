import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useCustomerAuth } from './CustomerAuthContext';
import { customerApi } from '../lib/customerApi';

/**
 * FavoritesContext — database-backed favorites for authenticated customers.
 *
 * - Logged OUT: clicking favorite navigates to /login
 * - Logged IN:  API request → database updated → context updated
 * - After login: favorites are fetched from backend
 * - After logout: favorites state is cleared
 *
 * Does NOT use localStorage. Database is the source of truth.
 */

const FavoritesContext = createContext(null);

export const FavoritesProvider = ({ children }) => {
  const { user, isAuthenticated } = useCustomerAuth();
  const [favorites, setFavorites] = useState([]); // array of product ID strings
  const [loading, setLoading] = useState(false);

  // Fetch favorites from backend whenever auth state changes
  useEffect(() => {
    if (!isAuthenticated) {
      setFavorites([]);
      return;
    }

    let cancelled = false;
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const res = await customerApi.favorites.getAll();
        if (!cancelled) {
          setFavorites(res.favoriteIds || []);
        }
      } catch {
        // Silently fail — favorites are non-critical
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchFavorites();
    return () => { cancelled = true; };
  }, [isAuthenticated, user?.id]);

  const isFavorite = useCallback(
    (productId) => favorites.includes(String(productId)),
    [favorites]
  );

  /**
   * Add a product to favorites.
   * @returns {boolean} true if successful, false if not authenticated
   */
  const addFavorite = useCallback(async (productId) => {
    if (!isAuthenticated) return false;
    const id = String(productId);
    // Optimistic update
    setFavorites((prev) => (prev.includes(id) ? prev : [...prev, id]));
    try {
      await customerApi.favorites.add(id);
    } catch {
      // Rollback on failure
      setFavorites((prev) => prev.filter((f) => f !== id));
    }
    return true;
  }, [isAuthenticated]);

  /**
   * Remove a product from favorites.
   * @returns {boolean} true if successful, false if not authenticated
   */
  const removeFavorites = useCallback(async (productId) => {
    if (!isAuthenticated) return false;
    const id = String(productId);
    // Optimistic update
    setFavorites((prev) => prev.filter((f) => f !== id));
    try {
      await customerApi.favorites.remove(id);
    } catch {
      // Rollback on failure
      setFavorites((prev) => [...prev, id]);
    }
    return true;
  }, [isAuthenticated]);

  /**
   * Toggle a product's favorite status.
   * @returns {boolean|'unauthenticated'} 
   *   'unauthenticated' if not logged in (caller should redirect to /login)
   *   true if toggled successfully
   */
  const toggleFavorites = useCallback(async (productId) => {
    if (!isAuthenticated) return 'unauthenticated';
    const id = String(productId);
    if (favorites.includes(id)) {
      await removeFavorites(id);
    } else {
      await addFavorite(id);
    }
    return true;
  }, [isAuthenticated, favorites, addFavorite, removeFavorites]);

  /** Clear favorites state (called on logout) */
  const clearFavorite = useCallback(() => setFavorites([]), []);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        loading,
        isFavorite,
        addFavorite,
        removeFavorites,
        toggleFavorites,
        clearFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorite = () => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorite must be inside FavoritesProvider');
  return context;
};
