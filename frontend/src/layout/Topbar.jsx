import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, Menu, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function Topbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'System active & operational', time: 'Just now', read: false }
  ]);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const loadNotifs = async () => {
      try {
        const report = await api.reports.get();
        const lowStock = report?.stats?.lowStockCount || 0;
        const pending = report?.stats?.pendingOrders || 0;
        const list = [];
        if (lowStock > 0) {
          list.push({ id: 'low-stock', message: `${lowStock} product${lowStock > 1 ? 's' : ''} low on stock`, time: 'Live alert', read: false });
        }
        if (pending > 0) {
          list.push({ id: 'pending-orders', message: `${pending} pending order${pending > 1 ? 's' : ''} awaiting fulfillment`, time: 'Live alert', read: false });
        }
        if (list.length === 0) {
          list.push({ id: 'all-clear', message: 'All inventory & orders up to date', time: 'Just now', read: true });
        }
        setNotifications(list);
      } catch (e) {
        // keep default
      }
    };
    loadNotifs();
  }, []);

  const unread = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <header className="topbar">
      {/* Mobile menu toggle */}
      <button className="topbar-btn" onClick={onMenuToggle} style={{ display: 'none' }} id="mobile-menu-btn">
        <Menu size={16} />
      </button>

      {/* Push actions to the right */}
      <div style={{ flex: 1 }} />

      {/* Actions */}
      <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center' }}>
        {/* Notifications */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button className="topbar-btn" onClick={() => setNotifOpen(o => !o)} title="Notifications">
            <Bell size={15} />
            {unread > 0 && <span className="topbar-notif-dot" />}
          </button>
          {notifOpen && (
            <div className="dropdown" style={{ minWidth: 280, right: 0 }}>
              <div style={{ padding: '8px 10px 6px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)' }}>Notifications</span>
                {unread > 0 && <span style={{ fontSize: 11, color: 'var(--color-text-caption)' }}>{unread} unread</span>}
              </div>
              {notifications.map(n => (
                <div key={n.id} className="dropdown-item" style={{ alignItems: 'flex-start', padding: '9px 10px' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: n.read ? 'transparent' : 'var(--color-walnut)', flexShrink: 0, marginTop: 4, border: n.read ? '1px solid var(--color-border)' : 'none' }} />
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-primary)', lineHeight: 1.4 }}>{n.message}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-caption)', marginTop: 2 }}>{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setProfileOpen(o => !o)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}
          >
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }} className="topbar-profile-info">
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>{user?.name || 'Admin'}</span>
              <span style={{ fontSize: 10, color: 'var(--color-text-caption)', textTransform: 'capitalize' }}>
                {user?.role?.replace('_', ' ') || 'Super Admin'}
              </span>
            </div>
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div className="topbar-avatar">{user?.initials || 'A'}</div>
            )}
          </button>
          {profileOpen && (
            <div className="dropdown" style={{ right: 0 }}>
              <div style={{ padding: '8px 10px 8px', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>{user?.name}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-caption)', marginTop: 1 }}>{user?.email}</div>
                <span className="role-badge" style={{ marginTop: 6, display: 'inline-flex' }}>
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>
              <Link to="/admin/profile" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                <User size={13} /> Profile
              </Link>
              <Link to="/admin/settings" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                <Settings size={13} /> Settings
              </Link>
              <div className="dropdown-sep" />
              <div className="dropdown-item danger" onClick={handleLogout}>
                <LogOut size={13} /> Sign out
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

