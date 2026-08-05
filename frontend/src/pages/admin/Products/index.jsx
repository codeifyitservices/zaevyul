import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Trash2, Copy, Archive, Eye, MoreHorizontal, Filter } from 'lucide-react';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, formatCurrency, formatDate, PRODUCT_STATUS } from '../../../lib/mockData';
import PageHeader from '../../../components/PageHeader';
import DataTable from '../../../components/DataTable';
import StatusBadge from '../../../components/StatusBadge';
import { DeleteDialog } from '../../../components/Modal';
import { useToast } from '../../../context/ToastContext';

export default function Products() {
  const toast = useToast();
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selected, setSelected] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const filtered = useMemo(() => products.filter(p => {
    const q = search.toLowerCase();
    if (q && !p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q)) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    if (categoryFilter && p.category !== categoryFilter) return false;
    return true;
  }), [products, search, statusFilter, categoryFilter]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    await new Promise(r => setTimeout(r, 600));
    
    // Mutate global array
    const idx = MOCK_PRODUCTS.findIndex(p => p.id === deleteTarget);
    if (idx !== -1) MOCK_PRODUCTS.splice(idx, 1);
    
    setProducts(ps => ps.filter(p => p.id !== deleteTarget));
    setSelected(s => s.filter(id => id !== deleteTarget));
    setDeleteTarget(null);
    setDeleteLoading(false);
    toast('Product deleted', 'success');
  };

  const handleBulkDelete = async () => {
    await new Promise(r => setTimeout(r, 400));
    
    // Mutate global array
    selected.forEach(id => {
      const idx = MOCK_PRODUCTS.findIndex(p => p.id === id);
      if (idx !== -1) MOCK_PRODUCTS.splice(idx, 1);
    });
    
    setProducts(ps => ps.filter(p => !selected.includes(p.id)));
    toast(`${selected.length} products deleted`, 'success');
    setSelected([]);
  };

  const handleDuplicate = (product) => {
    const copy = { ...product, id: `prd-${Date.now()}`, name: `${product.name} (Copy)`, sku: `${product.sku}-COPY`, status: 'draft' };
    
    // Mutate global array
    MOCK_PRODUCTS.unshift(copy);
    
    setProducts(ps => [copy, ...ps]);
    toast('Product duplicated as draft', 'success');
  };

  const COLUMNS = [
    {
      key: 'name', label: 'Product', sortable: true, maxWidth: 280,
      render: (val, row) => {
        const img = row.mainImage || (row.images && row.images[0]);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              {img?.url ? (
                <img src={img.url} alt={val} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 10, color: 'var(--color-text-caption)', fontFamily: 'var(--font-serif)' }}>Zae</span>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Link to={`/admin/products/${row.id}`} style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', textDecoration: 'none' }}
                onMouseOver={e => e.target.style.color = 'var(--color-walnut)'}
                onMouseOut={e => e.target.style.color = 'var(--color-text-primary)'}
              >{val}</Link>
              <span style={{ fontSize: 11, color: 'var(--color-text-caption)' }}>{row.sku}</span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'category', label: 'Category',
      render: (val) => {
        const cat = MOCK_CATEGORIES.find(c => c.id === val);
        return <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{cat?.name || '—'}</span>;
      }
    },
    {
      key: 'basePrice', label: 'Price', sortable: true,
      render: (val, row) => (
        <div>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{formatCurrency(row.discountPrice || val)}</span>
          {row.discountPrice && <span style={{ fontSize: 11, color: 'var(--color-text-caption)', textDecoration: 'line-through', marginLeft: 6 }}>{formatCurrency(val)}</span>}
        </div>
      )
    },
    {
      key: 'quantity', label: 'Stock', sortable: true,
      render: (val, row) => (
        <span style={{ fontSize: 13, fontWeight: 500, color: val <= row.lowStockThreshold ? 'var(--color-saffron)' : 'var(--color-text-primary)' }}>
          {val}
          {val <= row.lowStockThreshold && ' ⚠'}
        </span>
      )
    },
    { key: 'status', label: 'Status', render: val => <StatusBadge status={val} /> },
    {
      key: 'createdAt', label: 'Added', sortable: true,
      render: val => <span style={{ fontSize: 12, color: 'var(--color-text-caption)' }}>{formatDate(val)}</span>
    },
    {
      key: 'id', label: '',
      render: (val, row) => (
        <div style={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Link to={`/admin/products/${val}`} className="btn btn-ghost btn-sm" title="Edit">
            <Eye size={13} />
          </Link>
          <button className="btn btn-ghost btn-sm" onClick={() => handleDuplicate(row)} title="Duplicate">
            <Copy size={13} />
          </button>
          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-error)' }} onClick={() => setDeleteTarget(val)} title="Delete">
            <Trash2 size={13} />
          </button>
        </div>
      )
    },
  ];

  return (
    <div className="page page-enter">
      <PageHeader
        title="Products"
        subtitle={`${products.length} total`}
        crumbs={[{ label: 'Products' }]}
        actions={
          <Link to="/admin/products/new" className="btn btn-primary">
            <Plus size={14} /> New Product
          </Link>
        }
      />

      {/* Bulk action bar */}
      {selected.length > 0 && (
        <div className="bulk-bar">
          <span>{selected.length} selected</span>
          <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', marginLeft: 'auto' }} onClick={handleBulkDelete}>
            <Trash2 size={12} /> Delete
          </button>
          <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }} onClick={() => setSelected([])}>
            Clear
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="table-wrap">
        <div className="table-toolbar">
          <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
            <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-caption)' }} />
            <input
              className="field-input"
              style={{ paddingLeft: 30, height: 32 }}
              placeholder="Search name or SKU…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="field-select" style={{ width: 140, height: 32 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <select className="field-select" style={{ width: 160, height: 32 }} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="">All categories</option>
            {MOCK_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {(search || statusFilter || categoryFilter) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setStatusFilter(''); setCategoryFilter(''); }}>
              Clear
            </button>
          )}
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--color-text-caption)' }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
        <DataTable
          columns={COLUMNS}
          data={filtered}
          selectable
          selected={selected}
          onSelect={setSelected}
          pageSize={12}
          emptyTitle="No products found"
          emptyDesc="Try adjusting your search or filters"
        />
      </div>

      <DeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete product"
        desc="This product will be permanently removed. Any orders referencing it will retain the order history."
      />
    </div>
  );
}
