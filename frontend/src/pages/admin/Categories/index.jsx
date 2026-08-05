import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Trash2, Pencil } from 'lucide-react';
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from '../../../lib/mockData';
import PageHeader from '../../../components/PageHeader';
import DataTable from '../../../components/DataTable';
import StatusBadge from '../../../components/StatusBadge';
import { DeleteDialog } from '../../../components/Modal';
import { useToast } from '../../../context/ToastContext';

export default function CategoriesList() {
  const toast = useToast();
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Compute dynamic product count for each category from MOCK_PRODUCTS
  const categoriesWithCounts = useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      productCount: MOCK_PRODUCTS.filter(p => p.category === cat.id).length
    }));
  }, [categories]);

  const filtered = useMemo(() => {
    return categoriesWithCounts.filter(c => {
      const q = search.toLowerCase();
      if (q && !c.name.toLowerCase().includes(q) && !c.slug.toLowerCase().includes(q)) return false;
      if (statusFilter && c.status !== statusFilter) return false;
      return true;
    });
  }, [categoriesWithCounts, search, statusFilter]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    await new Promise(r => setTimeout(r, 600));

    // Update global MOCK_CATEGORIES
    const idx = MOCK_CATEGORIES.findIndex(c => c.id === deleteTarget);
    if (idx !== -1) MOCK_CATEGORIES.splice(idx, 1);

    // Detach deleted category from products in MOCK_PRODUCTS
    MOCK_PRODUCTS.forEach(p => {
      if (p.category === deleteTarget) {
        p.category = null;
      }
    });

    setCategories(cs => cs.filter(c => c.id !== deleteTarget));
    setSelected(s => s.filter(id => id !== deleteTarget));
    setDeleteTarget(null);
    setDeleteLoading(false);
    toast('Category deleted', 'success');
  };

  const handleBulkDelete = async () => {
    await new Promise(r => setTimeout(r, 400));

    // Update global MOCK_CATEGORIES
    selected.forEach(id => {
      const idx = MOCK_CATEGORIES.findIndex(c => c.id === id);
      if (idx !== -1) MOCK_CATEGORIES.splice(idx, 1);

      // Detach category from products in MOCK_PRODUCTS
      MOCK_PRODUCTS.forEach(p => {
        if (p.category === id) {
          p.category = null;
        }
      });
    });

    setCategories(cs => cs.filter(c => !selected.includes(c.id)));
    toast(`${selected.length} categories deleted`, 'success');
    setSelected([]);
  };

  const COLUMNS = [
    {
      key: 'name', label: 'Category', sortable: true, maxWidth: 280,
      render: (val, row) => {
        const img = row.mainImage;
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
              <Link to={`/admin/categories/${row.id}`} style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', textDecoration: 'none' }}
                onMouseOver={e => e.target.style.color = 'var(--color-walnut)'}
                onMouseOut={e => e.target.style.color = 'var(--color-text-primary)'}
              >{val}</Link>
            </div>
          </div>
        );
      }
    },
    {
      key: 'slug', label: 'Slug', sortable: true,
      render: (val) => <span style={{ fontSize: 12, color: 'var(--color-text-caption)', fontFamily: 'monospace' }}>{val}</span>
    },
    {
      key: 'description', label: 'Description', maxWidth: 220,
      render: (val) => (
        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
          {val || '—'}
        </span>
      )
    },
    {
      key: 'productCount', label: 'Products', sortable: true,
      render: (val) => <span style={{ fontSize: 12 }}>{val}</span>
    },
    { key: 'status', label: 'Status', render: val => <StatusBadge status={val} /> },
    {
      key: 'id', label: '',
      render: (val) => (
        <div style={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Link to={`/admin/categories/${val}`} className="btn btn-ghost btn-sm" title="Edit">
            <Pencil size={13} />
          </Link>
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
        title="Categories"
        subtitle={`${categories.length} total`}
        crumbs={[{ label: 'Categories' }]}
        actions={
          <Link to="/admin/categories/new" className="btn btn-primary">
            <Plus size={14} /> New Category
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
              placeholder="Search category name or slug…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="field-select" style={{ width: 140, height: 32 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {(search || statusFilter) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setStatusFilter(''); }}>
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
          emptyTitle="No categories found"
          emptyDesc="Try adjusting your search or filters"
        />
      </div>

      <DeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete category"
        desc="Products in this category will become uncategorised. This action cannot be undone."
      />
    </div>
  );
}
