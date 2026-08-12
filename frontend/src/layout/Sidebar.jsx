import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingBag,
  Users,
  Tag,
  FileText,
  Mail,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { MOCK_LOW_STOCK, MOCK_ORDERS } from "../lib/mockData";

const SECTIONS = [
  {
    label: null,
    items: [
      { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    ],
  },
  {
    label: "Catalog",
    items: [
      { to: "/admin/categories", icon: FolderOpen, label: "Categories" },
      {
        to: "/admin/products",
        icon: Package,
        label: "Products",
      },
    ],
  },
  {
    label: "Sales",
    items: [
      {
        to: "/admin/orders",
        icon: ShoppingBag,
        label: "Orders",
      },
      { to: "/admin/customers", icon: Users, label: "Customers" },
      { to: "/admin/coupons", icon: Tag, label: "Coupons" },
    ],
  },
  {
    label: "Content",
    items: [
      {
        to: "/admin/blog-categories",
        icon: FolderOpen,
        label: "Blog Categories",
      },
      { to: "/admin/blogs", icon: FileText, label: "Blogs" },
      { to: "/admin/newsletter", icon: Mail, label: "Newsletter" },
    ],
  },
  {
    label: "Analytics",
    items: [{ to: "/admin/reports", icon: BarChart3, label: "Reports" }],
  },
  {
    label: "Settings",
    items: [
      {
        to: "/admin/settings",
        icon: Settings,
        label: "Settings",
        roles: ["super_admin", "admin"],
      },
    ],
  },
];

export default function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}) {
  const { can } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-mobile-overlay ${mobileOpen ? "visible" : ""}`}
        onClick={onMobileClose}
      />

      <aside
        className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}
      >
        {/* Logo */}
        <div className="sidebar-logo">
          {!collapsed ? (
            <div
              style={{ textAlign: "center", width: "100%", padding: "10px 0" }}
            >
              <span
                className="sidebar-logo-text"
                style={{
                  fontSize: 16,
                  letterSpacing: "0.2em",
                  fontFamily: "var(--font-serif)",
                  display: "block",
                }}
              >
                Zaevyul
              </span>
              <span
                className="sidebar-logo-sub"
                style={{
                  fontSize: 9,
                  letterSpacing: "0.3em",
                  fontFamily: "var(--font-sans)",
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                PASHMINA
              </span>
            </div>
          ) : (
            <div
              className="sidebar-logo-mark"
              style={{ margin: "0 auto", color: "white" }}
            >
              Z
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {SECTIONS.map((section, idx) => (
            <div
              key={idx}
              style={{ marginBottom: section.label ? "12px" : "6px" }}
            >
              {section.label && !collapsed && (
                <div className="sidebar-section-label">{section.label}</div>
              )}
              {section.items.map((item) => {
                if (item.roles && !can(item.roles)) return null;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `sidebar-item${isActive ? " active" : ""}`
                    }
                    title={collapsed ? item.label : undefined}
                    onClick={onMobileClose}
                  >
                    <item.icon className="sidebar-item-icon" size={14} />
                    {!collapsed && (
                      <span style={{ flex: 1 }}>{item.label}</span>
                    )}
                    {!collapsed && item.badge && (
                      <span className="sidebar-item-badge">{item.badge}</span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer — collapse toggle only */}
        <div className="sidebar-footer">
          <button
            onClick={onToggle}
            className="sidebar-item"
            style={{
              width: "100%",
              border: "none",
              background: "none",
              cursor: "pointer",
              display: "flex",
              justifyContent: collapsed ? "center" : "flex-start",
            }}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight size={14} />
            ) : (
              <>
                <ChevronLeft size={14} />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
