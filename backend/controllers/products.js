import Product from '../model/Product.js';

const compactFeaturedProductOrder = async () => {
  const featured = await Product.find({ featured: true }).sort({ featuredOrder: 1, createdAt: -1 });
  await Promise.all(featured.map((product, index) => (
    Product.findByIdAndUpdate(product._id, { featuredOrder: index + 1 })
  )));
};

export const getProducts = async (req, res) => {
  const { search, category, status } = req.query;
  try {
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, products });
  } catch (error) {
    console.error('Fetch products error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ featured: true })
      .sort({ featuredOrder: 1 })
      .limit(6)
      .populate('category', 'name slug')
      .select('name slug category basePrice discountPrice material images featuredOrder');
    return res.status(200).json({ success: true, products });
  } catch (error) {
    console.error('Fetch featured products error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.status(200).json({ success: true, product });
  } catch (error) {
    console.error('Fetch product detail error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    return res.status(201).json({ success: true, product });
  } catch (error) {
    console.error('Create product error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'SKU or Slug already exists' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.status(200).json({ success: true, product });
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (product.featured) {
      await compactFeaturedProductOrder();
    }
    return res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const duplicateProduct = async (req, res) => {
  try {
    const original = await Product.findById(req.params.id);
    if (!original) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const copyData = original.toObject();
    delete copyData._id;
    delete copyData.createdAt;
    delete copyData.updatedAt;

    copyData.name = `${original.name} (Copy)`;
    copyData.sku = `${original.sku}-COPY`;
    copyData.slug = `${original.slug}-copy-${Date.now()}`;
    copyData.status = 'draft';
    copyData.featured = false;
    copyData.featuredOrder = null;

    const copy = new Product(copyData);
    await copy.save();

    return res.status(201).json({ success: true, product: copy });
  } catch (error) {
    console.error('Duplicate product error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const toggleFeatured = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.featured) {
      const removedOrder = product.featuredOrder;
      await Product.findByIdAndUpdate(req.params.id, { featured: false, featuredOrder: null });

      const remaining = await Product.find({ featured: true, featuredOrder: { $gt: removedOrder } })
        .sort({ featuredOrder: 1 });
      await Promise.all(remaining.map((p) => (
        Product.findByIdAndUpdate(p._id, { featuredOrder: p.featuredOrder - 1 })
      )));
    } else {
      const count = await Product.countDocuments({ featured: true });
      if (count >= 6) {
        return res.status(400).json({ success: false, message: 'Maximum of 6 featured products allowed. Disable one first.' });
      }

      const nextOrder = count + 1;
      await Product.findByIdAndUpdate(req.params.id, { featured: true, featuredOrder: nextOrder });
    }

    const updated = await Product.findById(req.params.id).populate('category', 'name slug');
    return res.status(200).json({ success: true, product: updated });
  } catch (error) {
    console.error('Toggle product featured error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const bulkDeleteProducts = async (req, res) => {
  const { ids } = req.body;
  try {
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ success: false, message: 'IDs array is required' });
    }
    const deletingFeatured = await Product.exists({ _id: { $in: ids }, featured: true });
    await Product.deleteMany({ _id: { $in: ids } });
    if (deletingFeatured) {
      await compactFeaturedProductOrder();
    }
    return res.status(200).json({ success: true, message: 'Selected products deleted successfully' });
  } catch (error) {
    console.error('Bulk delete products error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
