import mongoose from 'mongoose';
import CustomerUser from '../model/CustomerUser.js';
import Product from '../model/Product.js';

/**
 * GET /api/customer/favorites
 * Returns the authenticated customer's favorite product IDs and populated items.
 */
export const getFavorites = async (req, res) => {
  try {
    const customer = await CustomerUser.findById(req.customerUser._id).lean();

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const rawFavs = (customer.favorites || []).map((f) => (f && f._id ? String(f._id) : String(f)));
    const validObjIds = rawFavs.filter((id) => mongoose.Types.ObjectId.isValid(id));

    // Fetch products matching ObjectId or string id/slug
    const dbProducts = await Product.find({
      $or: [
        { _id: { $in: validObjIds } },
        { id: { $in: rawFavs } }
      ]
    }).select('_id id name slug basePrice discountPrice images category quantity sizes').lean();

    return res.status(200).json({
      success: true,
      favorites: dbProducts || [],
      favoriteIds: rawFavs,
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
    const strId = String(productId);
    const customer = await CustomerUser.findByIdAndUpdate(
      req.customerUser._id,
      { $addToSet: { favorites: strId } }, // $addToSet prevents duplicates
      { new: true }
    );

    const favIds = (customer.favorites || []).map((f) => (f && f._id ? String(f._id) : String(f)));

    return res.status(200).json({
      success: true,
      message: 'Added to favorites.',
      favoriteIds: favIds,
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
    const strId = String(productId);
    const customer = await CustomerUser.findByIdAndUpdate(
      req.customerUser._id,
      { $pull: { favorites: strId } },
      { new: true }
    );

    const favIds = (customer.favorites || []).map((f) => (f && f._id ? String(f._id) : String(f)));

    return res.status(200).json({
      success: true,
      message: 'Removed from favorites.',
      favoriteIds: favIds,
    });
  } catch (error) {
    console.error('[customerFavorites] removeFavorite error:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
