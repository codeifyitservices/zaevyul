import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate, ORDER_STATUS } from '../../../lib/mockData';
import PageHeader from '../../../components/PageHeader';
import DataTable from '../../../components/DataTable';
import StatusBadge from '../../../components/StatusBadge';
import { useToast } from '../../../context/ToastContext';
import { api } from '../../../lib/api';

export default function Orders() {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState([]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await api.orders.list();
      setOrders(data || []);
    } catch (err) {
      toast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = useMemo(() => orders.filter(o => {
    const q = search.toLowerCase();
    if (q && !o.orderNumber.toLowerCase().includes(q) && !o.customerName.toLowerCase().includes(q)) return false;
    if (statusFilter && o.status !== statusFilter) return false;
    return true;
  }), [orders, search, statusFilter]);

  const handleBulkDelete = async () => {
    try {
      await api.orders.bulkDelete(selected);
      setOrders(ps => ps.filter(o => !selected.includes(o._id || o.id)));
      toast(`${selected.length} orders deleted`, 'success');
    } catch (err) {
      toast('Failed to delete selected orders', 'error');
    } finally {
      setSelected([]);
    }
  };

  const activeRowKey = orders[0]?._id ? "_id" : "id";

  const COLUMNS = [
    {
      key: 'orderNumber', label: 'Order', sortable: true,
      render: (val, row) => (
        <Link to={`/admin/orders/${row._id || row.id}`} style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-walnut)', textDecoration: 'none' }}>
          {val}
        </Link>
      )
    },
    { key: 'customerName', label: 'Customer', sortable: true, render: v => <span style={{ fontSize: 13 }}>{v}</span> },
    {
      key: 'items', label: 'Items',
      render: v => <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{v ? v.length : 0} item{v?.length !== 1 ? 's' : ''}</span>
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
      render: (val, row) => <Link to={`/admin/orders/${row._id || row.id}`} className="btn btn-ghost btn-sm">View</Link>
    },
  ];

  if (loading) {
    return (
      <div className="page flex-center py-20">
        <div className="spinner" />
      </div>
    );
  }

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
          rowKey={activeRowKey}
          emptyTitle="No orders found"
          emptyDesc="Try adjusting your filters"
        />
      </div>
    </div>
  );
}
