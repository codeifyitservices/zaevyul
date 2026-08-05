import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { MOCK_BLOGS, MOCK_ADMINS, formatDate } from '../../../lib/mockData';
import PageHeader from '../../../components/PageHeader';
import DataTable from '../../../components/DataTable';
import StatusBadge from '../../../components/StatusBadge';
import { DeleteDialog } from '../../../components/Modal';
import { useToast } from '../../../context/ToastContext';

export default function Blogs() {
  const toast = useToast();
  const [blogs, setBlogs] = useState(MOCK_BLOGS);
  const [selected, setSelected] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    setSelected([]);
    return blogs.filter(b => !filter || b.status === filter);
  }, [blogs, filter]);

  const handleDelete = async () => {
    await new Promise(r => setTimeout(r, 400));
    
    // Mutate global array
    const idx = MOCK_BLOGS.findIndex(b => b.id === deleteTarget);
    if (idx !== -1) MOCK_BLOGS.splice(idx, 1);

    setBlogs(bs => bs.filter(b => b.id !== deleteTarget));
    setSelected(s => s.filter(id => id !== deleteTarget));
    setDeleteTarget(null);
    toast('Post deleted', 'success');
  };

  const handleBulkDelete = async () => {
    await new Promise(r => setTimeout(r, 400));
    
    // Mutate global array
    selected.forEach(id => {
      const idx = MOCK_BLOGS.findIndex(b => b.id === id);
      if (idx !== -1) MOCK_BLOGS.splice(idx, 1);
    });
    
    setBlogs(bs => bs.filter(b => !selected.includes(b.id)));
    toast(`${selected.length} posts deleted`, 'success');
    setSelected([]);
  };

  const authorName = (id) => MOCK_ADMINS.find(a => a.id === id)?.name || 'Unknown';

  const COLUMNS = [
    {
      key: 'title', label: 'Title', sortable: true, maxWidth: 280,
      render: (val, row) => (
        <div>
          <Link to={`/admin/blogs/${row.id}`} style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', textDecoration: 'none' }}
            onMouseOver={e => e.target.style.color = 'var(--color-walnut)'}
            onMouseOut={e => e.target.style.color = 'var(--color-text-primary)'}
          >{val}</Link>
          <p style={{ fontSize: 11, color: 'var(--color-text-caption)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>
            {row.excerpt}
          </p>
        </div>
      )
    },
    {
      key: 'author', label: 'Author',
      render: val => <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{authorName(val)}</span>
    },

    { key: 'status', label: 'Status', render: val => <StatusBadge status={val} /> },
    {
      key: 'publishedAt', label: 'Published', sortable: true,
      render: val => <span style={{ fontSize: 12, color: 'var(--color-text-caption)' }}>{formatDate(val)}</span>
    },
    {
      key: 'id', label: '',
      render: (val, row) => (
        <div style={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Link to={`/admin/blogs/${val}`} className="btn btn-ghost btn-sm"><Pencil size={13} /></Link>
          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-error)' }} onClick={() => setDeleteTarget(val)}><Trash2 size={13} /></button>
        </div>
      )
    }
  ];

  return (
    <div className="page page-enter">
      <PageHeader
        title="Blog"
        subtitle={`${blogs.length} posts`}
        crumbs={[{ label: 'Blog' }]}
        actions={
          <Link to="/admin/blogs/new" className="btn btn-primary">
            <Plus size={14} /> New Post
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

      <div className="table-wrap">
        <div className="table-toolbar">
          {['', 'published', 'draft'].map(s => (
            <button
              key={s || 'all'}
              className={`tab ${filter === s ? 'active' : ''}`}
              style={{ border: 'none', background: 'none', cursor: 'pointer' }}
              onClick={() => setFilter(s)}
            >
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              {' '}({s === '' ? blogs.length : blogs.filter(b => b.status === s).length})
            </button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--color-text-caption)' }}>{filtered.length} posts</span>
        </div>

        <DataTable
          columns={COLUMNS}
          data={filtered}
          selectable
          selected={selected}
          onSelect={setSelected}
          pageSize={12}
          emptyTitle="No posts found"
        />
      </div>

      <DeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete post"
        desc="This post will be permanently deleted. This cannot be undone."
      />
    </div>
  );
}
