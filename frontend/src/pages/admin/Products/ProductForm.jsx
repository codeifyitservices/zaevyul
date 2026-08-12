import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../../lib/mockData';
import PageHeader from '../../../components/PageHeader';
import ImageUploader from '../../../components/ImageUploader';
import { DeleteDialog } from '../../../components/Modal';
import StatusBadge from '../../../components/StatusBadge';
import { useToast } from '../../../context/ToastContext';
import { api } from '../../../lib/api';

const BLANK = {
  name: '', slug: '', sku: '', description: '', shortDescription: '',
  basePrice: '', discountPrice: '',
  quantity: '', lowStockThreshold: 5, status: 'draft',
  category: '', material: '', color: '', size: '',
  mainImage: null,
  hoverImage: null,
  gallery: [],
  seo: { title: '', description: '', url: '' },
  sizes: [],
};

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isNew = !id || id === 'new';

  const [form, setForm] = useState(BLANK);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    const loadFormInfo = async () => {
      try {
        const catList = await api.categories.list();
        setCategories(catList);

        if (!isNew) {
          const product = await api.products.get(id);
          if (product) {
            setForm({
              ...BLANK,
              ...product,
              mainImage: product.mainImage || (product.images && product.images[0]) || null,
              hoverImage: product.hoverImage || (product.images && product.images[1]) || null,
              gallery: product.gallery || (product.images && product.images.slice(2)) || [],
              seo: product.seo || BLANK.seo,
              category: typeof product.category === 'string' ? product.category : product.category?._id || product.category?.id || ''
            });
          } else {
            toast('Product not found', 'error');
            navigate('/admin/products');
          }
        }
      } catch (err) {
        toast('Error loading product details', 'error');
      }
    };
    loadFormInfo();
  }, [id, isNew]);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const setSeo = (field, value) => setForm(f => ({ ...f, seo: { ...f.seo, [field]: value } }));

  const generateSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleSave = async (status = form.status) => {
    if (!form.name) { toast('Product name is required', 'error'); return; }
    setSaving(true);

    const sizes = (form.sizes || []).map(s => ({
      size: s.size,
      price: Number(s.price) || 0,
      discountPrice: s.discountPrice ? Number(s.discountPrice) : null,
      quantity: Number(s.quantity) || 0
    }));

    // Calculate dynamic basePrice, discountPrice, and quantity for backward-compatibility
    let basePrice = Number(form.basePrice) || 0;
    let discountPrice = form.discountPrice ? Number(form.discountPrice) : null;
    let quantity = Number(form.quantity) || 0;

    if (sizes.length > 0) {
      basePrice = sizes[0].price;
      discountPrice = sizes[0].discountPrice;
      quantity = sizes.reduce((sum, s) => sum + s.quantity, 0);
    }

    const productData = {
      ...form,
      status,
      sizes,
      basePrice,
      discountPrice,
      quantity,
      images: [
        ...(form.mainImage ? [form.mainImage] : []),
        ...(form.hoverImage ? [form.hoverImage] : []),
        ...(form.gallery || [])
      ]
    };

    try {
      if (isNew) {
        await api.products.create(productData);
      } else {
        await api.products.update(id, productData);
      }
      toast(isNew ? 'Product created' : 'Changes saved', 'success');
      navigate('/admin/products');
    } catch (err) {
      toast(err.message || 'Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.products.delete(id);
      toast('Product deleted', 'success');
      navigate('/admin/products');
    } catch (err) {
      toast('Failed to delete product', 'error');
    }
  };

  const TABS = [
    { id: 'basic',    label: 'Basic Info' },
    { id: 'pricing',  label: 'Pricing & Stock' },
    { id: 'media',    label: 'Media' },
    { id: 'variants', label: 'Variants' },
    { id: 'seo',      label: 'SEO' },
  ];

  return (
    <div className="page page-enter">
      <PageHeader
        title={isNew ? 'New Product' : form.name || 'Edit Product'}
        crumbs={[{ label: 'Products', to: '/admin/products' }, { label: isNew ? 'New' : 'Edit' }]}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            {!isNew && (
              <button className="btn btn-secondary" onClick={() => setDeleteOpen(true)}>
                <Trash2 size={13} /> Delete
              </button>
            )}
            <button className="btn btn-secondary" onClick={() => handleSave('draft')} disabled={saving}>
              Save draft
            </button>
            <button className="btn btn-primary" onClick={() => handleSave('published')} disabled={saving}>
              <Save size={13} /> {saving ? 'Saving…' : isNew ? 'Publish' : 'Save'}
            </button>
          </div>
        }
      />

      {/* Status pill */}
      {!isNew && (
        <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <StatusBadge status={form.status} />
          <span style={{ fontSize: 11, color: 'var(--color-text-caption)' }}>SKU: {form.sku}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 24 }}>
        {TABS.map(t => (
          <button key={t.id} className={`tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, alignItems: 'start' }}>
        {/* Main content */}
        <div>
          {activeTab === 'basic' && (
            <div className="card">
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-section">
                  <p className="form-section-title">Identity</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="field-group">
                      <label className="field-label">Product Name *</label>
                      <input className="field-input" value={form.name} placeholder="e.g. Himalayan Snow Shawl"
                        onChange={e => { set('name', e.target.value); if (!form.slug) set('slug', generateSlug(e.target.value)); }} />
                    </div>
                    <div className="form-row">
                      <div className="field-group">
                        <label className="field-label">Slug</label>
                        <input className="field-input" value={form.slug} placeholder="himalayan-snow-shadow"
                          onChange={e => set('slug', e.target.value)} />
                      </div>
                      <div className="field-group">
                        <label className="field-label">SKU</label>
                        <input className="field-input" value={form.sku} placeholder="ZAE-SH-001"
                          onChange={e => set('sku', e.target.value)} />
                      </div>
                    </div>
                    <div className="field-group">
                      <label className="field-label">Short Description</label>
                      <input className="field-input" value={form.shortDescription} placeholder="One-line product summary"
                        onChange={e => set('shortDescription', e.target.value)} />
                    </div>
                    <div className="field-group">
                      <label className="field-label">Description</label>
                      <textarea className="field-textarea" rows={5} value={form.description}
                        placeholder="Describe the product — origin, material, craftsmanship…"
                        onChange={e => set('description', e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <p className="form-section-title">Organisation</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="field-group">
                      <label className="field-label">Category</label>
                      <select className="field-select" value={form.category} onChange={e => set('category', e.target.value)}>
                        <option value="">Select category</option>
                        {categories.map(c => <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="card">
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-section">
                  <p className="form-section-title">Inventory Alerts</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="field-group">
                      <label className="field-label">Low Stock Threshold</label>
                      <input className="field-input" type="number" value={form.lowStockThreshold} placeholder="5"
                        onChange={e => set('lowStockThreshold', e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Main Image */}
                <div className="card">
                  <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <p className="form-section-title">Main Image</p>
                      <span style={{ fontSize: 11, color: 'var(--color-text-caption)' }}>Primary thumbnail for catalogs and search results.</span>
                    </div>
                    <ImageUploader
                      images={form.mainImage ? [form.mainImage] : []}
                      onChange={imgs => set('mainImage', imgs[0] || null)}
                      max={1}
                      label="main image"
                    />
                  </div>
                </div>

                {/* Hover Image */}
                <div className="card">
                  <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <p className="form-section-title">Hover Image</p>
                      <span style={{ fontSize: 11, color: 'var(--color-text-caption)' }}>Secondary image shown on hover.</span>
                    </div>
                    <ImageUploader
                      images={form.hoverImage ? [form.hoverImage] : []}
                      onChange={imgs => set('hoverImage', imgs[0] || null)}
                      max={1}
                      label="hover image"
                    />
                  </div>
                </div>
              </div>

              {/* Gallery Images */}
              <div className="card">
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <p className="form-section-title">Product Gallery</p>
                    <span style={{ fontSize: 11, color: 'var(--color-text-caption)' }}>Additional detail shots and close-ups. Up to 8 photos.</span>
                  </div>
                  <ImageUploader
                    images={form.gallery || []}
                    onChange={imgs => set('gallery', imgs)}
                    max={8}
                    label="gallery images"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'variants' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Product Attributes card */}
              <div className="card">
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <p className="form-section-title">Product Attributes</p>
                  <div className="form-row">
                    <div className="field-group">
                      <label className="field-label">Color</label>
                      <input className="field-input" value={form.color} placeholder="e.g. Ivory, Walnut Brown"
                        onChange={e => set('color', e.target.value)} />
                    </div>
                    <div className="field-group">
                      <label className="field-label">Material</label>
                      <input className="field-input" value={form.material} placeholder="e.g. 100% Pashmina"
                        onChange={e => set('material', e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Size Variants card */}
              <div className="card">
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p className="form-section-title" style={{ marginBottom: 2 }}>Size Variants</p>
                      <span style={{ fontSize: 11, color: 'var(--color-text-caption)' }}>
                        Manage prices, sale prices, and stock quantities for each size.
                      </span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: 11.5 }}
                      onClick={() => {
                        const updatedSizes = [...(form.sizes || []), { size: '', price: '', discountPrice: null, quantity: 0 }];
                        set('sizes', updatedSizes);
                      }}
                    >
                      + Add Size Variant
                    </button>
                  </div>

                  {(!form.sizes || form.sizes.length === 0) ? (
                    <div style={{ padding: '24px 0', textTransform: 'uppercase', textAlign: 'center', fontSize: 11, color: 'var(--color-text-caption)', border: '1px dashed var(--color-border)', borderRadius: 4 }}>
                      No sizes configured. Click above to add one.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {form.sizes.map((s, idx) => {
                        const updateSizeVal = (key, val) => {
                          const list = [...form.sizes];
                          list[idx] = { ...list[idx], [key]: val };
                          set('sizes', list);
                        };
                        const removeSizeVal = () => {
                          const list = form.sizes.filter((_, i) => i !== idx);
                          set('sizes', list);
                        };

                        return (
                          <div
                            key={idx}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1.2fr 1fr 1fr 0.8fr 40px',
                              gap: 10,
                              alignItems: 'end',
                              padding: 12,
                              background: 'var(--color-surface-2)',
                              border: '1px solid var(--color-border)',
                              borderRadius: 4
                            }}
                          >
                            <div className="field-group">
                              <label className="field-label" style={{ fontSize: 10 }}>Size *</label>
                              <input
                                className="field-input"
                                value={s.size}
                                placeholder="e.g. Standard (200x70cm)"
                                onChange={e => updateSizeVal('size', e.target.value)}
                              />
                            </div>
                            <div className="field-group">
                              <label className="field-label" style={{ fontSize: 10 }}>Price (₹) *</label>
                              <input
                                className="field-input"
                                type="number"
                                value={s.price}
                                placeholder="Base Price"
                                onChange={e => updateSizeVal('price', e.target.value)}
                              />
                            </div>
                            <div className="field-group">
                              <label className="field-label" style={{ fontSize: 10 }}>Sale Price (₹)</label>
                              <input
                                className="field-input"
                                type="number"
                                value={s.discountPrice || ''}
                                placeholder="Leave blank if none"
                                onChange={e => updateSizeVal('discountPrice', e.target.value ? Number(e.target.value) : null)}
                              />
                            </div>
                            <div className="field-group">
                              <label className="field-label" style={{ fontSize: 10 }}>Stock Quantity *</label>
                              <input
                                className="field-input"
                                type="number"
                                value={s.quantity}
                                placeholder="0"
                                onChange={e => updateSizeVal('quantity', Number(e.target.value) || 0)}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={removeSizeVal}
                              style={{
                                height: 34,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: 'none',
                                background: 'transparent',
                                color: 'var(--color-saffron)',
                                cursor: 'pointer'
                              }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="card">
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p className="form-section-title">Search Engine Optimisation</p>
                <div className="field-group">
                  <label className="field-label">Meta Title</label>
                  <input className="field-input" value={form.seo.title} placeholder="Page title for search engines (50–60 chars)"
                    onChange={e => setSeo('title', e.target.value)} />
                  <span className="field-hint">{form.seo.title.length}/60 characters</span>
                </div>
                <div className="field-group">
                  <label className="field-label">Meta Description</label>
                  <textarea className="field-textarea" rows={3} value={form.seo.description}
                    placeholder="Short description for search results (150–160 chars)"
                    onChange={e => setSeo('description', e.target.value)} />
                  <span className="field-hint">{form.seo.description.length}/160 characters</span>
                </div>
                <div className="field-group">
                  <label className="field-label">URL Handle</label>
                  <input className="field-input" value={form.seo.url || form.slug}
                    onChange={e => setSeo('url', e.target.value)} />
                </div>
                {/* Preview */}
                {(form.seo.title || form.name) && (
                  <div style={{ border: '1px solid var(--color-border)', borderRadius: 6, padding: '12px 14px', marginTop: 4 }}>
                    <p style={{ fontSize: 11, color: 'var(--color-text-caption)', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Search preview</p>
                    <p style={{ fontSize: 14, color: '#1a0dab', marginBottom: 2 }}>{form.seo.title || form.name}</p>
                    <p style={{ fontSize: 11, color: '#006621' }}>zaevyul.com/{form.seo.url || form.slug}</p>
                    <p style={{ fontSize: 12, color: '#545454', marginTop: 2, lineHeight: 1.4 }}>{form.seo.description || form.shortDescription}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card">
            <div className="card-header"><span className="card-title">Status</span></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <select className="field-select" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => handleSave()} disabled={saving}>
                <Save size={13} /> {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>

          {!isNew && (
            <div className="card">
              <div className="card-header"><span className="card-title">Details</span></div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  ['SKU', form.sku],
                  ['Category', categories.find(c => String(c._id || c.id) === String(form.category))?.name || '—'],
                  ['Stock', form.quantity],
                  ['Price', formatCurrency(form.discountPrice || form.basePrice)],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: 'var(--color-text-caption)' }}>{k}</span>
                    <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <DeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete product"
        desc="This will permanently remove the product and all its images. Orders are not affected."
      />
    </div>
  );
}
