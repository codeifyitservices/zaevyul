import { useParams, Link } from 'react-router-dom';
import { MOCK_CUSTOMERS, MOCK_ORDERS, formatCurrency, formatDate } from '../../../lib/mockData';
import PageHeader from '../../../components/PageHeader';
import StatusBadge from '../../../components/StatusBadge';

export default function CustomerDetail() {
  const { id } = useParams();
  const customer = MOCK_CUSTOMERS.find(c => c.id === id);
  if (!customer) return (
    <div className="page">
      <p style={{ color: 'var(--color-text-secondary)' }}>Customer not found. <Link to="/admin/customers" style={{ color: 'var(--color-walnut)' }}>Back</Link></p>
    </div>
  );

  const orders = MOCK_ORDERS.filter(o => o.customer === id);

  const STATS = [
    { label: 'Total Spent', value: formatCurrency(customer.totalSpent) },
    { label: 'Orders', value: customer.orderCount },
    { label: 'Avg. Order Value', value: formatCurrency(customer.avgOrderValue) },
    { label: 'Status', value: <StatusBadge status={customer.status} /> },
  ];

  return (
    <div className="page page-enter">
      <PageHeader
        crumbs={[{ label: 'Customers', to: '/admin/customers' }, { label: customer.name }]}
        title={customer.name}
        subtitle={customer.email}
      />

      {/* Stats row */}
      <div className="grid-cols-4" style={{ marginBottom: 20 }}>
        {STATS.map(s => (
          <div key={s.label} className="metric-card">
            <p className="metric-label">{s.label}</p>
            <div className="metric-value" style={{ fontSize: 20 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16 }}>
        {/* Order History */}
        <div className="card">
          <div className="card-header"><span className="card-title">Purchase History</span></div>
          {orders.length === 0 ? (
            <p style={{ padding: '24px', fontSize: 13, color: 'var(--color-text-caption)', textAlign: 'center' }}>No orders yet</p>
          ) : (
            <table>
              <thead><tr><th>Order</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td>
                      <Link to={`/admin/orders/${o.id}`} style={{ fontSize: 12, color: 'var(--color-walnut)', textDecoration: 'none', fontWeight: 500 }}>
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{o.items.length}</td>
                    <td style={{ fontSize: 12, fontWeight: 500 }}>{formatCurrency(o.total)}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td style={{ fontSize: 11, color: 'var(--color-text-caption)' }}>{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card">
            <div className="card-header"><span className="card-title">Contact</span></div>
            <div className="card-body" style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                ['Email', customer.email],
                ['Phone', customer.phone || '—'],
                ['City', `${customer.city}, ${customer.country}`],
                ['Joined', formatDate(customer.joinedAt)],
                ['Last order', formatDate(customer.lastOrder)],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-caption)' }}>{k}</span>
                  <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500, maxWidth: 160, textAlign: 'right' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {customer.notes && (
            <div className="card">
              <div className="card-header"><span className="card-title">Notes</span></div>
              <div className="card-body">
                <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{customer.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
