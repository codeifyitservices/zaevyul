import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { MOCK_COUPONS, formatDate, formatCurrency } from '../../lib/mockData';
import PageHeader from '../../components/PageHeader';
import Pagination from '../../components/Pagination';
import { Modal, DeleteDialog } from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../context/ToastContext';

const BLANK = { code: '', type: 'percentage', value: '', description: '', expiry: '', usageLimit: '', minOrderValue: '', active: true };

export default function Coupons() {
  const toast = useToast();
  const [coupons, setCoupons] = useState(MOCK_COUPONS);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [editId, setEditId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  const openNew = () => { setForm(BLANK); setEditId(null); setModal(true); };
  const openEdit = (c) => { setForm({ ...c }); setEditId(c.id); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.code || !form.value) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    if (editId) {
      setCoupons(cs => cs.map(c => c.id === editId ? { ...c, ...form, value: +form.value, usageLimit: +form.usageLimit, minOrderValue: +form.minOrderValue } : c));
      toast('Coupon updated', 'success');
    } else {
      setCoupons(cs => [...cs, { ...form, id: `cpn-${Date.now()}`, value: +form.value, usedCount: 0, createdAt: new Date().toISOString() }]);
      toast('Coupon created', 'success');
    }
    setSaving(false);
    setModal(false);
  };

  const toggleActive = (id) => {
    setCoupons(cs => cs.map(c => c.id === id ? { ...c, active: !c.active } : c));
    toast('Status updated', 'success');
  };

  const handleDelete = async () => {
    await new Promise(r => setTimeout(r, 400));
    setCoupons(cs => cs.filter(c => c.id !== deleteTarget));
    setDeleteTarget(null);
    toast('Coupon deleted', 'success');
  };

  const handleBulkDelete = async () => {
    await new Promise(r => setTimeout(r, 400));
    setCoupons(cs => cs.filter(c => !selected.includes(c.id)));
    setSelected([]);
  };

  const isExpired = (expiry) => expiry && new Date(expiry) < new Date();

  // Pagination
  const totalPages = Math.max(1, Math.ceil(coupons.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = coupons.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Select helpers (page-scoped, matches DataTable behaviour)
  const allOnPageSelected = paginated.length > 0 && paginated.every(c => selected.includes(c.id));
  const toggleAll = () => {
    if (allOnPageSelected) setSelected(s => s.filter(id => !paginated.some(c => c.id === id)));
    else setSelected(s => [...new Set([...s, ...paginated.map(c => c.id)])]);
  };
  const toggleRow = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  return (
    <div className="page page-enter">
      <PageHeader
        title="Coupons"
        subtitle={`${coupons.filter(c => c.active).length} active`}
        crumbs={[{ label: 'Coupons' }]}
        actions={<button className="btn btn-primary" onClick={openNew}><Plus size={14} /> New Coupon</button>}
      />

      {/* Bulk action bar — same as Products */}
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

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: 40, paddingLeft: 16 }}>
                  <input type="checkbox" className="table-checkbox" checked={allOnPageSelected} onChange={toggleAll} />
                </th>
                <th>Code</th>
                <th>Type</th>
                <th>Value</th>
                <th>Used / Limit</th>
                <th>Min. Order</th>
                <th>Expiry</th>
                <th>Status</th>
                <th style={{ width: 100 }}></th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(c => (
                <tr key={c.id}>
                  <td style={{ paddingLeft: 16, width: 40 }}>
                    <input type="checkbox" className="table-checkbox" checked={selected.includes(c.id)} onChange={() => toggleRow(c.id)} />
                  </td>
                  <td>
                    <code style={{ fontSize: 12, background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 3, padding: '2px 7px', letterSpacing: '0.06em', fontWeight: 600 }}>
                      {c.code}
                    </code>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>{c.type}</td>
                  <td style={{ fontSize: 13, fontWeight: 500 }}>
                    {c.type === 'percentage' ? `${c.value}%` : formatCurrency(c.value)}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                    {c.usedCount} / {c.usageLimit || '∞'}
                    {c.usageLimit && c.usedCount >= c.usageLimit && <span style={{ color: 'var(--color-error)', marginLeft: 6, fontSize: 10, fontWeight: 600 }}>MAXED</span>}
                  </td>
                  <td style={{ fontSize: 12 }}>{c.minOrderValue ? formatCurrency(c.minOrderValue) : '—'}</td>
                  <td style={{ fontSize: 12, color: isExpired(c.expiry) ? 'var(--color-error)' : 'var(--color-text-caption)' }}>
                    {formatDate(c.expiry)}{isExpired(c.expiry) && ' (expired)'}
                  </td>
                  <td><StatusBadge status={c.active && !isExpired(c.expiry) ? 'active' : 'inactive'} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => toggleActive(c.id)} title={c.active ? 'Deactivate' : 'Activate'}>
                        {c.active ? <ToggleRight size={14} style={{ color: 'var(--color-cedar)' }} /> : <ToggleLeft size={14} />}
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}><Pencil size={12} /></button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-error)' }} onClick={() => setDeleteTarget(c.id)}><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {coupons.length > PAGE_SIZE && (
          <Pagination page={safePage} totalPages={totalPages} total={coupons.length} pageSize={PAGE_SIZE} onPage={setPage} />
        )}
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editId ? 'Edit Coupon' : 'New Coupon'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : editId ? 'Save' : 'Create'}
            </button>
          </>
        }
      >
        <form style={{ display: 'flex', flexDirection: 'column', gap: 12 }} onSubmit={handleSave}>
          <div className="field-group">
            <label className="field-label">Code *</label>
            <input className="field-input" value={form.code} placeholder="WELCOME15"
              style={{ textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: '0.08em' }}
              onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} />
          </div>
          <div className="form-row">
            <div className="field-group">
              <label className="field-label">Type</label>
              <select className="field-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div className="field-group">
              <label className="field-label">Value *</label>
              <input className="field-input" type="number" value={form.value}
                placeholder={form.type === 'percentage' ? '15' : '2000'}
                onChange={e => setForm(f => ({ ...f, value: e.target.value }))} />
            </div>
          </div>
          <div className="field-group">
            <label className="field-label">Description</label>
            <input className="field-input" value={form.description} placeholder="Internal note"
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="form-row">
            <div className="field-group">
              <label className="field-label">Usage Limit</label>
              <input className="field-input" type="number" value={form.usageLimit} placeholder="∞ unlimited"
                onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))} />
            </div>
            <div className="field-group">
              <label className="field-label">Min. Order (₹)</label>
              <input className="field-input" type="number" value={form.minOrderValue}
                onChange={e => setForm(f => ({ ...f, minOrderValue: e.target.value }))} />
            </div>
          </div>
          <div className="field-group">
            <label className="field-label">Expiry Date</label>
            <input className="field-input" type="date" value={form.expiry ? form.expiry.slice(0, 10) : ''}
              onChange={e => setForm(f => ({ ...f, expiry: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label className="toggle">
              <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
              <div className="toggle-track" />
              <div className="toggle-thumb" />
            </label>
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Active</span>
          </div>
        </form>
      </Modal>

      <DeleteDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete coupon" desc="This coupon will be permanently removed." />
    </div>
  );
}
