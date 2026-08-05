import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Printer, CheckCircle } from 'lucide-react';
import { MOCK_ORDERS, MOCK_CUSTOMERS, formatCurrency, formatDate, ORDER_STATUS } from '../../../lib/mockData';
import PageHeader from '../../../components/PageHeader';
import StatusBadge from '../../../components/StatusBadge';
import { useToast } from '../../../context/ToastContext';

const STATUS_FLOW = ['pending', 'processing', 'packed', 'shipped', 'delivered'];

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [note, setNote] = useState('');

  const order = orders.find(o => o.id === id);
  if (!order) return (
    <div className="page">
      <p style={{ color: 'var(--color-text-secondary)' }}>Order not found. <Link to="/admin/orders" style={{ color: 'var(--color-walnut)' }}>Back to Orders</Link></p>
    </div>
  );

  const customer = MOCK_CUSTOMERS.find(c => c.id === order.customer);
  const currentStep = STATUS_FLOW.indexOf(order.status);

  const updateStatus = (newStatus) => {
    setOrders(os => os.map(o => o.id === id ? { ...o, status: newStatus } : o));
    toast(`Order marked as ${ORDER_STATUS[newStatus]?.label}`, 'success');
  };

  return (
    <div className="page page-enter">
      <PageHeader
        crumbs={[{ label: 'Orders', to: '/admin/orders' }, { label: order.orderNumber }]}
        title={order.orderNumber}
        subtitle={`Placed ${formatDate(order.createdAt)}`}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <StatusBadge status={order.status} />
            <select
              className="field-select"
              style={{ width: 160, height: 32 }}
              value={order.status}
              onChange={e => updateStatus(e.target.value)}
              disabled={['delivered', 'cancelled', 'refunded'].includes(order.status)}
            >
              {Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Status Timeline */}
          {!['cancelled', 'refunded'].includes(order.status) && (
            <div className="card">
              <div className="card-header"><span className="card-title">Fulfilment Status</span></div>
              <div className="card-body">
                <div style={{ display: 'flex', gap: 0, alignItems: 'flex-start', overflowX: 'auto', paddingBottom: 4 }}>
                  {STATUS_FLOW.map((s, i) => {
                    const done = i <= currentStep;
                    const current = i === currentStep;
                    return (
                      <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 80 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%', border: `2px solid ${done ? 'var(--color-walnut)' : 'var(--color-border)'}`,
                            background: done ? 'var(--color-walnut)' : 'var(--color-surface)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            position: 'relative',
                          }}>
                            {done && <CheckCircle size={14} color="white" />}
                          </div>
                          <span style={{ fontSize: 10, fontWeight: current ? 600 : 400, color: done ? 'var(--color-text-primary)' : 'var(--color-text-caption)', textAlign: 'center', textTransform: 'capitalize' }}>
                            {ORDER_STATUS[s]?.label}
                          </span>
                        </div>
                        {i < STATUS_FLOW.length - 1 && (
                          <div style={{ flex: 1, height: 2, background: i < currentStep ? 'var(--color-walnut)' : 'var(--color-border)', marginBottom: 24, marginTop: -2 }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="card">
            <div className="card-header"><span className="card-title">Items</span></div>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</td>
                    <td style={{ fontSize: 13 }}>{item.qty}</td>
                    <td style={{ fontSize: 13 }}>{formatCurrency(item.price)}</td>
                    <td style={{ fontSize: 13, fontWeight: 500 }}>{formatCurrency(item.price * item.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Totals */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border)' }}>
              {[
                ['Subtotal', formatCurrency(order.subtotal)],
                ['Shipping', formatCurrency(order.shipping)],
                order.discount ? ['Discount', `−${formatCurrency(order.discount)}`] : null,
              ].filter(Boolean).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                  <span>{k}</span><span>{v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 600, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--color-border)' }}>
                <span>Total</span><span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="card">
            <div className="card-header"><span className="card-title">Order Notes</span></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {order.notes && (
                <div style={{ background: 'var(--color-surface-2)', borderRadius: 6, padding: '10px 12px', fontSize: 12, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                  "{order.notes}"
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="field-input" style={{ flex: 1 }} placeholder="Add a note…" value={note} onChange={e => setNote(e.target.value)} />
                <button className="btn btn-secondary" onClick={() => { if (note) { toast('Note added', 'success'); setNote(''); } }}>Add</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Customer */}
          <div className="card">
            <div className="card-header"><span className="card-title">Customer</span></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Link to={`/admin/customers/${order.customer}`} style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-walnut)', textDecoration: 'none' }}>
                {order.customerName}
              </Link>
              {customer && (
                <>
                  <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{customer.email}</p>
                  <p style={{ fontSize: 11, color: 'var(--color-text-caption)' }}>{customer.orderCount} orders · {formatCurrency(customer.totalSpent)} spent</p>
                </>
              )}
            </div>
          </div>

          {/* Shipping */}
          <div className="card">
            <div className="card-header"><span className="card-title">Shipping</span></div>
            <div className="card-body" style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
              <p>{order.shippingAddress.line1}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.zip}</p>
              <p>{order.shippingAddress.country}</p>
              {order.trackingNumber && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--color-border)' }}>
                  <p style={{ fontSize: 11, color: 'var(--color-text-caption)', marginBottom: 2 }}>Tracking number</p>
                  <p style={{ fontFamily: 'monospace', fontWeight: 500, color: 'var(--color-text-primary)' }}>{order.trackingNumber}</p>
                </div>
              )}
              {!order.trackingNumber && order.status !== 'pending' && (
                <div style={{ marginTop: 10 }}>
                  <input className="field-input" placeholder="Add tracking number…" style={{ fontSize: 12 }} />
                </div>
              )}
            </div>
          </div>

          {/* Payment */}
          <div className="card">
            <div className="card-header"><span className="card-title">Payment</span></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
              {[
                ['Method', order.paymentMethod],
                ['Status', null],
                ['Amount', formatCurrency(order.total)],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--color-text-caption)' }}>{k}</span>
                  {v ? <span style={{ fontWeight: 500 }}>{v}</span> : <StatusBadge status={order.paymentStatus} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
