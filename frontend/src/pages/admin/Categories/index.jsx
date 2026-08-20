import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Trash2, Pencil } from 'lucide-react';
import PageHeader from '../../../components/PageHeader';
import DataTable from '../../../components/DataTable';
import { DeleteDialog } from '../../../components/Modal';
import { useToast } from '../../../context/ToastContext';
import { api } from '../../../lib/api';

export default function CategoriesList() {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const catList = await api.categories.list();
      setCategories(catList);
    } catch (err) {
      toast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filtered = useMemo(() => {
    return categories.filter(c => {
      const q = search.toLowerCase();
      if (q && !c.name.toLowerCase().includes(q) && !c.slug.toLowerCase().includes(q)) return false;
      if (statusFilter && c.status !== statusFilter) return false;
      return true;
    });
  }, [categories, search, statusFilter]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.categories.delete(deleteTarget);
      setCategories(cs => cs.filter(c => (c._id || c.id) !== deleteTarget));
      setSelected(s => s.filter(id => id !== deleteTarget));
      toast('Category deleted', 'success');
    } catch (err) {
      toast('Failed to delete category', 'error');
    } finally {
      setDeleteTarget(null);
      setDeleteLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    setDeleteLoading(true);
    try {
      await Promise.all(selected.map(id => api.categories.delete(id)));
      setCategories(cs => cs.filter(c => !selected.includes(c._id || c.id)));
      toast(`${selected.length} categories deleted`, 'success');
    } catch (err) {
      toast('Failed to delete selected categories', 'error');
    } finally {
      setSelected([]);
      setBulkDeleteConfirm(false);
      setDeleteLoading(false);
    }
  };

  const handleToggleFeatured = useCallback(async (cat) => {
    const id = cat._id || cat.id;
    const featuredCount = categories.filter(c => c.featured).length;
    // Prevent enabling if max reached and this one isn't already featured
    if (!cat.featured && featuredCount >= 4) {
      toast('Maximum 4 categories can be featured. Disable one first.', 'error');
      return;
    }
    setTogglingId(id);
    try {
      const updated = await api.categories.toggleFeatured(id);
      setCategories(prev => {
        const next = prev.map(c => (c._id || c.id) === id ? { ...c, featured: updated.featured, featuredOrder: updated.featuredOrder } : c);
        // Re-compact featuredOrder across all items to stay in sync
        const featured = next.filter(c => c.featured).sort((a, b) => a.featuredOrder - b.featuredOrder);
        featured.forEach((c, i) => { c.featuredOrder = i + 1; });
        return [...next];
      });
      toast(updated.featured ? `"${cat.name}" featured at #${updated.featuredOrder}` : `"${cat.name}" removed from featured`, 'success');
    } catch (err) {
      toast(err.message || 'Failed to update featured status', 'error');
    } finally {
      setTogglingId(null);
    }
  }, [categories, toast]);

  const COLUMNS = [
    {
      key: 'name', label: 'Category', sortable: true, maxWidth: 280,
      render: (val, row) => {
        const img = row.mainImage;
        const imgUrl = img?.url || row.img;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              {imgUrl ? (
                <img src={imgUrl} alt={val} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 10, color: 'var(--color-text-caption)', fontFamily: 'var(--font-serif)' }}>Zae</span>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Link to={`/admin/categories/${row._id || row.id}`} style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', textDecoration: 'none' }}
                onMouseOver={e => e.target.style.color = 'var(--color-walnut)'}
                onMouseOut={e => e.target.style.color = 'var(--color-text-primary)'}
              >{val}</Link>
            </div>
          </div>
        );
      }
    },
    { key: 'slug', label: 'URL Slug', sortable: true },
    {
      key: 'productCount', label: 'Products', sortable: true,
      render: val => <span style={{ fontSize: 13, fontWeight: 500 }}>{val || 0}</span>
    },
    {
      key: 'featured', label: 'Featured on Homepage', sortable: false,
      render: (val, row) => {
        const id = row._id || row.id;
        const featuredCount = categories.filter(c => c.featured).length;
        const isToggling = togglingId === id;
        const disabled = isToggling || (!row.featured && featuredCount >= 4);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Toggle switch */}
            <button
              onClick={() => handleToggleFeatured(row)}
              disabled={disabled}
              title={!row.featured && featuredCount >= 4 ? 'Max 4 featured — disable one first' : ''}
              style={{
                position: 'relative', width: 32, height: 18, borderRadius: 9,
                border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
                background: row.featured ? 'var(--color-walnut)' : 'var(--color-border)',
                opacity: disabled && !isToggling ? 0.45 : 1,
                flexShrink: 0, transition: 'background 0.2s',
              }}
            >
              <span style={{
                position: 'absolute', top: 2, left: row.featured ? 16 : 2,
                width: 14, height: 14, borderRadius: '50%', background: '#fff',
                transition: 'left 0.2s', display: 'block',
              }} />
            </button>
            {/* Order badge */}
            {row.featured && row.featuredOrder && (
              <span style={{
                fontSize: 10, fontWeight: 700, lineHeight: 1,
                background: 'var(--color-walnut)', color: '#fff',
                borderRadius: 3, padding: '2px 6px',
              }}>
                #{row.featuredOrder}
              </span>
            )}
          </div>
        );
      }
    },
    {
      key: 'id', label: '',
      render: (val, row) => {
        const itemId = row._id || row.id;
        return (
          <div style={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Link to={`/admin/categories/${itemId}`} className="btn btn-ghost btn-sm" title="Edit">
              <Pencil size={13} />
            </Link>
            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-error)' }} onClick={() => setDeleteTarget(itemId)} title="Delete">
              <Trash2 size={13} />
            </button>
          </div>
        );
      }
    },
  ];

  const activeRowKey = categories[0]?._id ? "_id" : "id";

  if (loading) {
    return (
      <div className="page flex-center py-20">
        <div className="spinner" />
      </div>
    );
  }

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
          <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', marginLeft: 'auto' }} onClick={() => setBulkDeleteConfirm(true)}>
            <Trash2 size={12} /> Delete
          </button>
          <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }} onClick={() => setSelected([])}>
            Clear
          </button>
        </div>
      )}

      {/* Table & Filters */}
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
          rowKey={activeRowKey}
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
        desc="This category will be permanently removed. Products associated with this category will be detached and set to uncategorised."
      />

      <DeleteDialog
        open={bulkDeleteConfirm}
        onClose={() => setBulkDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
        loading={deleteLoading}
        title="Delete selected categories"
        desc={`Are you sure you want to delete ${selected.length} selected category(ies)? This action cannot be undone.`}
      />
    </div>
  );
}
