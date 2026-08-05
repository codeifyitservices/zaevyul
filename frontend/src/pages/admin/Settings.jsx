import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { MOCK_SETTINGS } from '../../lib/mockData';
import PageHeader from '../../components/PageHeader';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';

const SECTIONS = ['General', 'Currency & Tax', 'Shipping', 'Payment', 'Social'];

export default function Settings() {
  const toast = useToast();
  const [settings, setSettings] = useState(MOCK_SETTINGS);
  const [activeSection, setActiveSection] = useState('General');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setSettings(s => ({ ...s, [k]: v }));
  const setSocial = (k, v) => setSettings(s => ({ ...s, socialLinks: { ...s.socialLinks, [k]: v } }));
  const setPayment = (gw, k, v) => setSettings(s => ({ ...s, paymentGateways: { ...s.paymentGateways, [gw]: { ...s.paymentGateways[gw], [k]: v } } }));

  useEffect(() => {
    let active = true;
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await api.settings.get();
        if (active) {
          setSettings(data || MOCK_SETTINGS);
        }
      } catch (err) {
        toast(err.message || 'Failed to load settings', 'error');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    fetchSettings();
    return () => {
      active = false;
    };
  }, [toast]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.settings.update(settings);
      toast('Settings saved successfully', 'success');
    } catch (err) {
      toast(err.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

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
        title="Settings"
        crumbs={[{ label: 'Settings' }]}
        actions={
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={13} /> {saving ? 'Saving…' : 'Save Changes'}
          </button>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Section nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {SECTIONS.map(s => (
            <button
              key={s}
              onClick={() => setActiveSection(s)}
              style={{
                padding: '7px 12px', borderRadius: 'var(--radius-sm)', border: 'none', background: activeSection === s ? 'var(--color-cream)' : 'transparent',
                color: activeSection === s ? 'var(--color-walnut)' : 'var(--color-text-secondary)',
                fontSize: 13, fontWeight: activeSection === s ? 500 : 400, cursor: 'pointer', textAlign: 'left',
                transition: 'all var(--transition-fast)',
              }}
            >{s}</button>
          ))}
        </nav>

        {/* Content */}
        <div className="card">
          <div className="card-header"><span className="card-title">{activeSection}</span></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {activeSection === 'General' && (
              <>
                <div className="field-group">
                  <label className="field-label">Store Name</label>
                  <input className="field-input" value={settings.storeName} onChange={e => set('storeName', e.target.value)} />
                </div>
                <div className="field-group">
                  <label className="field-label">Tagline</label>
                  <input className="field-input" value={settings.tagline} onChange={e => set('tagline', e.target.value)} />
                </div>
                <div className="form-row">
                  <div className="field-group">
                    <label className="field-label">Email</label>
                    <input className="field-input" type="email" value={settings.email} onChange={e => set('email', e.target.value)} />
                    <span className="field-hint">Used for store contact and customer notifications.</span>
                  </div>
                  <div className="field-group">
                    <label className="field-label">Phone</label>
                    <input className="field-input" value={settings.phone} onChange={e => set('phone', e.target.value)} />
                  </div>
                </div>
                <div className="field-group">
                  <label className="field-label">Address</label>
                  <textarea className="field-textarea" rows={2} value={settings.address} onChange={e => set('address', e.target.value)} />
                </div>
              </>
            )}

            {activeSection === 'Currency & Tax' && (
              <>
                <div className="form-row">
                  <div className="field-group">
                    <label className="field-label">Currency Code</label>
                    <input className="field-input" value={settings.currency} onChange={e => set('currency', e.target.value)} />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Currency Symbol</label>
                    <input className="field-input" value={settings.currencySymbol} onChange={e => set('currencySymbol', e.target.value)} />
                  </div>
                </div>
                <div className="field-group" style={{ maxWidth: 200 }}>
                  <label className="field-label">Tax Rate (%)</label>
                  <input className="field-input" type="number" value={settings.taxRate} onChange={e => set('taxRate', +e.target.value)} />
                  <span className="field-hint">Applied to all products unless overridden</span>
                </div>
              </>
            )}

            {activeSection === 'Shipping' && (
              <div className="field-group" style={{ maxWidth: 220 }}>
                <label className="field-label">Free Shipping Above (₹)</label>
                <input className="field-input" type="number" value={settings.freeShippingAbove} onChange={e => set('freeShippingAbove', +e.target.value)} />
                <span className="field-hint">Set to 0 to disable free shipping threshold</span>
              </div>
            )}



            {activeSection === 'Payment' && (
              <>
                <div style={{ padding: '12px 14px', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>Razorpay</span>
                    <label className="toggle">
                      <input type="checkbox" checked={settings.paymentGateways.razorpay.enabled} onChange={e => setPayment('razorpay', 'enabled', e.target.checked)} />
                      <div className="toggle-track" /><div className="toggle-thumb" />
                    </label>
                  </div>
                  <div className="field-group">
                    <label className="field-label">Key ID</label>
                    <input className="field-input" type="password" value={settings.paymentGateways.razorpay.keyId} onChange={e => setPayment('razorpay', 'keyId', e.target.value)} placeholder="rzp_live_…" />
                  </div>
                </div>
                <div style={{ padding: '12px 14px', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>Stripe</span>
                    <label className="toggle">
                      <input type="checkbox" checked={settings.paymentGateways.stripe.enabled} onChange={e => setPayment('stripe', 'enabled', e.target.checked)} />
                      <div className="toggle-track" /><div className="toggle-thumb" />
                    </label>
                  </div>
                  <div className="field-group">
                    <label className="field-label">Key ID</label>
                    <input className="field-input" type="password" value={settings.paymentGateways.stripe.keyId} onChange={e => setPayment('stripe', 'keyId', e.target.value)} placeholder="sk_live_…" />
                  </div>
                </div>
              </>
            )}

            {activeSection === 'Social' && (
              <>
                {Object.entries(settings.socialLinks).map(([k, v]) => (
                  <div key={k} className="field-group">
                    <label className="field-label" style={{ textTransform: 'capitalize' }}>{k}</label>
                    <input className="field-input" type="url" value={v} placeholder={`https://${k}.com/zaevyul`}
                      onChange={e => setSocial(k, e.target.value)} />
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
