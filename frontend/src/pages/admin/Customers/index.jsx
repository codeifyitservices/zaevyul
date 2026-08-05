import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Trash2 } from 'lucide-react';
import { MOCK_CUSTOMERS, formatCurrency, formatDate } from '../../../lib/mockData';
import PageHeader from '../../../components/PageHeader';
import DataTable from '../../../components/DataTable';
import StatusBadge from '../../../components/StatusBadge';

export default function Customers() {
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState([]);

  const filtered = useMemo(() => customers.filter(c => {
    const q = search.toLowerCase();
    if (q && !c.name.toLowerCase().includes(q) && !c.email.toLowerCase().includes(q)) return false;
    if (statusFilter && c.status !== statusFilter) return false;
    return true;
  }), [customers, search, statusFilter]);

  const handleBulkDelete = async () => {
    await new Promise(r => setTimeout(r, 400));
    setCustomers(cs => cs.filter(c => !selected.includes(c.id)));
    setSelected([]);
  };

  const COLUMNS = [
    {
      key: 'name', label: 'Customer', sortable: true,
      render: (v, row) => (
        <div>
          <Link to={`/admin/customers/${row.id}`} style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', textDecoration: 'none' }}
            onMouseOver={e => e.target.style.color = 'var(--color-walnut)'}
            onMouseOut={e => e.target.style.color = 'var(--color-text-primary)'}
          >{v}</Link>
          <p style={{ fontSize: 11, color: 'var(--color-text-caption)', marginTop: 1 }}>{row.email}</p>
        </div>
      )
    },
    { key: 'city', label: 'Location', render: (v, row) => <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{v}, {row.country}</span> },
    { key: 'orderCount', label: 'Orders', sortable: true, render: v => <span style={{ fontSize: 13 }}>{v}</span> },
    {
      key: 'totalSpent', label: 'Total Spent', sortable: true,
      render: v => <span style={{ fontSize: 13, fontWeight: 500 }}>{v > 0 ? formatCurrency(v) : '—'}</span>
    },
    {
      key: 'lastOrder', label: 'Last Order',
      render: v => <span style={{ fontSize: 12, color: 'var(--color-text-caption)' }}>{formatDate(v)}</span>
    },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    {
      key: 'id', label: '',
      render: v => <Link to={`/admin/customers/${v}`} className="btn btn-ghost btn-sm">View</Link>
    },
  ];

  return (
    <div className="page page-enter">
      <PageHeader
        title="Customers"
        subtitle={`${customers.length} registered`}
        crumbs={[{ label: 'Customers' }]}
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
          <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
            <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-caption)' }} />
            <input className="field-input" style={{ paddingLeft: 30, height: 32 }} placeholder="Name or email…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="field-select" style={{ width: 140, height: 32 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {(search || statusFilter) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setStatusFilter(''); }}>Clear</button>
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
          emptyTitle="No customers found"
        />
      </div>
    </div>
  );
}
