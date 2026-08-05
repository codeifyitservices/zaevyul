import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Trash2 } from 'lucide-react';
import { MOCK_ORDERS, formatCurrency, formatDate, ORDER_STATUS } from '../../../lib/mockData';
import PageHeader from '../../../components/PageHeader';
import DataTable from '../../../components/DataTable';
import StatusBadge from '../../../components/StatusBadge';

export default function Orders() {
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState([]);

  const filtered = useMemo(() => orders.filter(o => {
    const q = search.toLowerCase();
    if (q && !o.orderNumber.toLowerCase().includes(q) && !o.customerName.toLowerCase().includes(q)) return false;
    if (statusFilter && o.status !== statusFilter) return false;
    return true;
  }), [orders, search, statusFilter]);

  const handleBulkDelete = async () => {
    await new Promise(r => setTimeout(r, 400));
    setOrders(ps => ps.filter(o => !selected.includes(o.id)));
    setSelected([]);
  };

  const COLUMNS = [
    {
      key: 'orderNumber', label: 'Order', sortable: true,
      render: (val, row) => (
        <Link to={`/admin/orders/${row.id}`} style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-walnut)', textDecoration: 'none' }}>
          {val}
        </Link>
      )
    },
    { key: 'customerName', label: 'Customer', sortable: true, render: v => <span style={{ fontSize: 13 }}>{v}</span> },
    {
      key: 'items', label: 'Items',
      render: v => <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{v.length} item{v.length !== 1 ? 's' : ''}</span>
    },
    {
      key: 'total', label: 'Total', sortable: true,
      render: v => <span style={{ fontSize: 13, fontWeight: 500 }}>{formatCurrency(v)}</span>
    },
    { key: 'paymentStatus', label: 'Payment', render: v => <StatusBadge status={v} /> },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    {
      key: 'createdAt', label: 'Date', sortable: true,
      render: v => <span style={{ fontSize: 12, color: 'var(--color-text-caption)' }}>{formatDate(v)}</span>
    },
    {
      key: 'id', label: '',
      render: v => <Link to={`/admin/orders/${v}`} className="btn btn-ghost btn-sm">View</Link>
    },
  ];

  const pendingCount = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="page page-enter">
      <PageHeader
        title="Orders"
        subtitle={`${orders.length} total · ${pendingCount} pending`}
        crumbs={[{ label: 'Orders' }]}
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
            <input className="field-input" style={{ paddingLeft: 30, height: 32 }} placeholder="Order number or customer…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="field-select" style={{ width: 160, height: 32 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
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
          emptyTitle="No orders found"
          emptyDesc="Try adjusting your filters"
        />
      </div>
    </div>
  );
}
