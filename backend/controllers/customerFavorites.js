import CustomerUser from '../model/CustomerUser.js';

/**
 * GET /api/customer/favorites
 * Returns the authenticated customer's favorite product IDs.
 */
export const getFavorites = async (req, res) => {
  try {
    // Populate only the fields the storefront needs
    const customer = await CustomerUser.findById(req.customerUser._id)
      .populate('favorites', '_id name slug basePrice discountPrice images category')
      .lean();

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    return res.status(200).json({
      success: true,
      favorites: customer.favorites || [],
      favoriteIds: (customer.favorites || []).map((f) => String(f._id)),
    });
  } catch (error) {
    console.error('[customerFavorites] getFavorites error:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * POST /api/customer/favorites/:productId
 * Adds a product to the customer's favorites.
 */
export const addFavorite = async (req, res) => {
  const { productId } = req.params;

  try {
    const customer = await CustomerUser.findByIdAndUpdate(
      req.customerUser._id,
      { $addToSet: { favorites: productId } }, // $addToSet prevents duplicates
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Added to favorites.',
      favoriteIds: customer.favorites.map(String),
    });
  } catch (error) {
    console.error('[customerFavorites] addFavorite error:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * DELETE /api/customer/favorites/:productId
 * Removes a product from the customer's favorites.
 */
export const removeFavorite = async (req, res) => {
  const { productId } = req.params;

  try {
    const customer = await CustomerUser.findByIdAndUpdate(
      req.customerUser._id,
      { $pull: { favorites: productId } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Removed from favorites.',
      favoriteIds: customer.favorites.map(String),
    });
  } catch (error) {
    console.error('[customerFavorites] removeFavorite error:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
