import * as mock from "./mockData";

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/admin";
const PUBLIC_BASE_URL =
  import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:5000/api/public";
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === "true" || false;

// Helper for public (unauthenticated) storefront fetch calls (AUD-002)
const publicRequest = async (url, options = {}) => {
  options.headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  const res = await fetch(`${PUBLIC_BASE_URL}${url}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Public API request failed");
  return data;
};

// Initialize in-memory collections for fallback mock data
const loadCollection = (key, defaultData) => {
  let stored = localStorage.getItem(`zae_db_${key}`);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (
        key === "products" &&
        parsed.length > 0 &&
        (!parsed[0].images || parsed[0].images.length === 0)
      ) {
        localStorage.removeItem(`zae_db_${key}`);
        stored = null;
      } else {
        return parsed;
      }
    } catch {
      /* ignore */
    }
  }
  localStorage.setItem(`zae_db_${key}`, JSON.stringify(defaultData));
  return [...defaultData];
};

const saveCollection = (key, data) => {
  localStorage.setItem(`zae_db_${key}`, JSON.stringify(data));
};

let db = {
  products: loadCollection("products", mock.MOCK_PRODUCTS),
  categories: loadCollection("categories", mock.MOCK_CATEGORIES),
  orders: loadCollection("orders", mock.MOCK_ORDERS),
  customers: loadCollection("customers", mock.MOCK_CUSTOMERS),
  blogs: loadCollection("blogs", mock.MOCK_BLOGS),
  coupons: loadCollection("coupons", mock.MOCK_COUPONS),
  newsletter: loadCollection("newsletter", mock.MOCK_NEWSLETTER),
  settings: loadCollection("settings", [mock.MOCK_SETTINGS])[0],
  blogCategories: loadCollection("blogCategories", [
    { id: "bcat-1", name: "Heritage" },
    { id: "bcat-2", name: "Craft" },
    { id: "bcat-3", name: "Guide" },
    { id: "bcat-4", name: "Care" },
    { id: "bcat-5", name: "Sustainability" },
    { id: "bcat-6", name: "Story" },
  ]),
};

const sleep = (ms = 400) => new Promise((r) => setTimeout(r, ms));

const shouldUseMockFallback = (err) =>
  USE_MOCK ||
  err.message.includes("Failed to fetch") ||
  err.message === "Mock mode enabled";

// Helper for fetch calls
const request = async (url, options = {}) => {
  if (USE_MOCK) throw new Error("Mock mode enabled");

  options.headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Set credentials for cookies
  options.credentials = "include";

  // Check localStorage token as a fallback header
  const token = sessionStorage.getItem("zae_jwt");
  if (token) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${url}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "API request failed");
  return data;
};

export const getCategorySlug = (category) => {
  if (!category) return "shawls";
  if (typeof category === "object") return category.slug || "shawls";
  const staticMap = {
    "cat-001": "shawls",
    "cat-002": "stoles",
    "cat-003": "blankets",
    "cat-004": "scarves",
    "cat-005": "accessories",
  };
  return staticMap[category] || "shawls";
};
export const getHoverImage = (product) => {
  if (!product) return "/storefront/prod-2.png";
  if (product.images && product.images[1] && product.images[1].url) {
    return product.images[1].url;
  }
  // Stable, unique fallback per product using charCode summation on id/name
  const idStr = String(product._id || product.id || product.name || "");
  const charCodeSum = idStr
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const fallbacks = [
    "/storefront/prod-2.png",
    "/storefront/cat-embroidered.png",
    "/storefront/pashmina-banner.png",
    "/storefront/artisan.png",
    "/storefront/prod-1.png",
    "/storefront/prod-3.png",
    "/storefront/prod-stack.png",
    "/storefront/cat-shawls.png",
  ];
  return fallbacks[charCodeSum % fallbacks.length];
};

export const api = {
  // Auth
  auth: {
    login: async (email, password) => {
      try {
        const res = await request("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        if (res.token) sessionStorage.setItem("zae_jwt", res.token);
        return res.user;
      } catch (err) {
        if (!USE_MOCK && !err.message.includes("Failed to fetch")) throw err;
        // Mock fallback
        await sleep(600);
        const admin = mock.MOCK_ADMINS.find(
          (a) => a.email === email && a.password === password,
        );
        if (!admin) throw new Error("Invalid email or password");
        return {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          initials: admin.initials,
        };
      }
    },
    logout: async () => {
      try {
        await request("/auth/logout", { method: "POST" });
      } catch {
        /* ignore */
      }
      sessionStorage.removeItem("zae_jwt");
    },
    me: async () => {
      try {
        const res = await request("/auth/me");
        return res.user;
      } catch (err) {
        // If mock mode is active or backend is offline, fallback to local sessionStorage
        if (USE_MOCK || err.message.includes("Failed to fetch")) {
          try {
            const stored = sessionStorage.getItem("zae_admin");
            return stored ? JSON.parse(stored) : null;
          } catch {
            return null;
          }
        }
        // For actual authentication errors (e.g. 401 Unauthorized), return null to trigger logout
        return null;
      }
    },
  },

  // Products
  products: {
    list: async (filters = {}) => {
      try {
        const query = new URLSearchParams(filters).toString();
        const res = await publicRequest(`/products?${query}`);
        return res.products;
      } catch (err) {
        await sleep(300);
        let list = [...db.products];
        if (filters.status)
          list = list.filter((p) => p.status === filters.status);
        if (filters.category)
          list = list.filter((p) => p.category === filters.category);
        if (filters.search) {
          const q = filters.search.toLowerCase();
          list = list.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.sku.toLowerCase().includes(q),
          );
        }
        return list;
      }
    },
    featured: async () => {
      try {
        const res = await publicRequest("/products?featured=true");
        return res.products;
      } catch (err) {
        await sleep(300);
        return db.products
          .filter((p) => p.featured)
          .sort((a, b) => (a.featuredOrder || 999) - (b.featuredOrder || 999))
          .slice(0, 6);
      }
    },
    get: async (id) => {
      try {
        const res = await publicRequest(`/products/${id}`);
        return res.product;
      } catch (err) {
        await sleep(200);
        const product = db.products.find(
          (p) =>
            p.id === id ||
            p._id === id ||
            String(p.id).replace(/^prd-0*/, "") === String(id),
        );
        if (!product) throw new Error("Product not found");
        return product;
      }
    },
    getBySlug: async (slug) => {
      try {
        const res = await publicRequest(`/products/${slug}`);
        return res.product;
      } catch (err) {
        await sleep(200);
        const product = db.products.find((p) => p.slug === slug);
        if (!product) throw new Error("Product not found");
        return product;
      }
    },
    create: async (data) => {
      try {
        const res = await request("/products", {
          method: "POST",
          body: JSON.stringify(data),
        });
        return res.product;
      } catch (err) {
        await sleep(500);
        const sizes = data.sizes || [];
        let basePrice = data.basePrice;
        let discountPrice = data.discountPrice;
        let quantity = data.quantity;
        if (sizes.length > 0) {
          basePrice = sizes[0].price;
          discountPrice = sizes[0].discountPrice;
          quantity = sizes.reduce(
            (sum, s) => sum + (Number(s.quantity) || 0),
            0,
          );
        }
        const product = {
          ...data,
          basePrice,
          discountPrice,
          quantity,
          id: `prd-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        db.products = [product, ...db.products];
        saveCollection("products", db.products);
        return product;
      }
    },
    update: async (id, data) => {
      try {
        const res = await request(`/products/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
        return res.product;
      } catch (err) {
        await sleep(400);
        const sizes = data.sizes || [];
        let basePrice = data.basePrice;
        let discountPrice = data.discountPrice;
        let quantity = data.quantity;
        if (sizes.length > 0) {
          basePrice = sizes[0].price;
          discountPrice = sizes[0].discountPrice;
          quantity = sizes.reduce(
            (sum, s) => sum + (Number(s.quantity) || 0),
            0,
          );
        }
        db.products = db.products.map((p) =>
          p.id === id
            ? { ...p, ...data, basePrice, discountPrice, quantity }
            : p,
        );
        saveCollection("products", db.products);
        return db.products.find((p) => p.id === id);
      }
    },
    delete: async (id) => {
      try {
        await request(`/products/${id}`, { method: "DELETE" });
      } catch (err) {
        await sleep(300);
        db.products = db.products.filter((p) => p.id !== id);
        saveCollection("products", db.products);
      }
    },
    duplicate: async (id) => {
      try {
        const res = await request(`/products/${id}/duplicate`, {
          method: "POST",
        });
        return res.product;
      } catch (err) {
        await sleep(400);
        const original = db.products.find((p) => p.id === id);
        if (!original) throw new Error("Product not found");
        const copy = {
          ...original,
          id: `prd-${Date.now()}`,
          name: `${original.name} (Copy)`,
          sku: `${original.sku}-COPY`,
          slug: `${original.slug}-copy`,
          status: "draft",
          featured: false,
          featuredOrder: null,
          createdAt: new Date().toISOString(),
        };
        db.products = [copy, ...db.products];
        saveCollection("products", db.products);
        return copy;
      }
    },
    toggleFeatured: async (id) => {
      try {
        const res = await request(`/products/${id}/featured`, {
          method: "PATCH",
        });
        return res.product;
      } catch (err) {
        await sleep(300);
        const product = db.products.find((p) => p.id === id || p._id === id);
        if (!product) throw new Error("Product not found");
        if (
          !product.featured &&
          db.products.filter((p) => p.featured).length >= 6
        ) {
          throw new Error(
            "Maximum 6 products can be featured. Disable one first.",
          );
        }
        if (product.featured) {
          const removedOrder = product.featuredOrder;
          db.products = db.products.map((p) => {
            if (p.id === id || p._id === id)
              return { ...p, featured: false, featuredOrder: null };
            if (p.featured && p.featuredOrder > removedOrder)
              return { ...p, featuredOrder: p.featuredOrder - 1 };
            return p;
          });
        } else {
          const nextOrder = db.products.filter((p) => p.featured).length + 1;
          db.products = db.products.map((p) =>
            p.id === id || p._id === id
              ? { ...p, featured: true, featuredOrder: nextOrder }
              : p,
          );
        }
        saveCollection("products", db.products);
        return db.products.find((p) => p.id === id || p._id === id);
      }
    },
    bulkDelete: async (ids) => {
      try {
        await request("/products/bulk-delete", {
          method: "POST",
          body: JSON.stringify({ ids }),
        });
      } catch (err) {
        await sleep(400);
        db.products = db.products.filter((p) => !ids.includes(p.id));
        saveCollection("products", db.products);
      }
    },
  },

  // Categories
  categories: {
    list: async () => {
      try {
        const res = await publicRequest("/categories");
        return res.categories;
      } catch (err) {
        await sleep(200);
        return db.categories.map((c) => ({
          ...c,
          productCount: db.products.filter((p) => p.category === c.id).length,
        }));
      }
    },
    get: async (id) => {
      try {
        const res = await request(`/categories/${id}`);
        return res.category;
      } catch (err) {
        await sleep(200);
        const category = db.categories.find((c) => c.id === id);
        if (!category) throw new Error("Category not found");
        return category;
      }
    },
    create: async (data) => {
      try {
        const res = await request("/categories", {
          method: "POST",
          body: JSON.stringify(data),
        });
        return res.category;
      } catch (err) {
        await sleep(400);
        const category = { ...data, id: `cat-${Date.now()}`, productCount: 0 };
        db.categories = [...db.categories, category];
        saveCollection("categories", db.categories);
        return category;
      }
    },
    update: async (id, data) => {
      try {
        const res = await request(`/categories/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
        return res.category;
      } catch (err) {
        await sleep(300);
        db.categories = db.categories.map((c) =>
          c.id === id ? { ...c, ...data } : c,
        );
        saveCollection("categories", db.categories);
        return db.categories.find((c) => c.id === id);
      }
    },
    delete: async (id) => {
      try {
        await request(`/categories/${id}`, { method: "DELETE" });
      } catch (err) {
        await sleep(300);
        db.categories = db.categories.filter((c) => c.id !== id);
        db.products = db.products.map((p) =>
          p.category === id ? { ...p, category: null } : p,
        );
        saveCollection("categories", db.categories);
        saveCollection("products", db.products);
      }
    },
    toggleFeatured: async (id) => {
      const res = await request(`/categories/${id}/featured`, {
        method: "PATCH",
      });
      return res.category;
    },
    featured: async () => {
      try {
        const res = await request("/categories/featured");
        return res.categories;
      } catch {
        return db.categories
          .filter((c) => c.featured)
          .sort((a, b) => a.featuredOrder - b.featuredOrder);
      }
    },
  },

  // Orders
  orders: {
    list: async (filters = {}) => {
      try {
        const query = new URLSearchParams(filters).toString();
        const res = await request(`/orders?${query}`);
        return res.orders;
      } catch (err) {
        await sleep(300);
        let list = [...db.orders];
        if (filters.status)
          list = list.filter((o) => o.status === filters.status);
        if (filters.search) {
          const q = filters.search.toLowerCase();
          list = list.filter(
            (o) =>
              o.orderNumber.toLowerCase().includes(q) ||
              o.customerName.toLowerCase().includes(q),
          );
        }
        return list;
      }
    },
    get: async (id) => {
      try {
        const res = await request(`/orders/${id}`);
        return res.order;
      } catch (err) {
        await sleep(200);
        const order = db.orders.find((o) => o.id === id);
        if (!order) throw new Error("Order not found");
        return order;
      }
    },
    updateStatus: async (id, statusData) => {
      try {
        const res = await request(`/orders/${id}`, {
          method: "PUT",
          body: JSON.stringify(statusData),
        });
        return res.order;
      } catch (err) {
        await sleep(300);
        db.orders = db.orders.map((o) =>
          o.id === id ? { ...o, ...statusData } : o,
        );
        saveCollection("orders", db.orders);
        return db.orders.find((o) => o.id === id);
      }
    },
    addNote: async (id, notes) => {
      try {
        const res = await request(`/orders/${id}/notes`, {
          method: "POST",
          body: JSON.stringify({ notes }),
        });
        return res.order;
      } catch (err) {
        await sleep(200);
        db.orders = db.orders.map((o) => (o.id === id ? { ...o, notes } : o));
        saveCollection("orders", db.orders);
        return db.orders.find((o) => o.id === id);
      }
    },
    bulkDelete: async (ids) => {
      try {
        await request("/orders/bulk-delete", {
          method: "POST",
          body: JSON.stringify({ ids }),
        });
      } catch (err) {
        await sleep(400);
        db.orders = db.orders.filter((o) => !ids.includes(o.id));
        saveCollection("orders", db.orders);
      }
    },
  },

  // Customers
  customers: {
    list: async (filters = {}) => {
      try {
        const query = new URLSearchParams(filters).toString();
        const res = await request(`/customers?${query}`);
        return res.customers;
      } catch (err) {
        await sleep(300);
        let list = [...db.customers];
        if (filters.status)
          list = list.filter((c) => c.status === filters.status);
        if (filters.search) {
          const q = filters.search.toLowerCase();
          list = list.filter(
            (c) =>
              c.name.toLowerCase().includes(q) ||
              c.email.toLowerCase().includes(q),
          );
        }
        return list;
      }
    },
    get: async (id) => {
      try {
        const res = await request(`/customers/${id}`);
        return { customer: res.customer, orders: res.orders };
      } catch (err) {
        await sleep(200);
        const customer = db.customers.find((c) => c.id === id);
        if (!customer) throw new Error("Customer not found");
        const orders = db.orders.filter((o) => o.customer === id);
        return { customer, orders };
      }
    },
    bulkDelete: async (ids) => {
      try {
        await request("/customers/bulk-delete", {
          method: "POST",
          body: JSON.stringify({ ids }),
        });
      } catch (err) {
        await sleep(400);
        db.customers = db.customers.filter((c) => !ids.includes(c.id));
        saveCollection("customers", db.customers);
      }
    },
  },

  // Blogs
  blogs: {
    publicList: async () => {
      try {
        const res = await publicRequest("/blogs");
        return res.blogs;
      } catch {
        await sleep(300);
        return db.blogs.filter((b) => b.status === "published");
      }
    },
    getBySlug: async (slug) => {
      try {
        const res = await publicRequest(`/blogs/${slug}`);
        return res.blog;
      } catch (err) {
        await sleep(200);
        const blog = db.blogs.find(
          (b) => b.slug === slug || b.id === slug || b._id === slug,
        );
        if (!blog) throw new Error("Article not found");
        return blog;
      }
    },
    list: async (filters = {}) => {
      try {
        const query = new URLSearchParams(filters).toString();
        const res = await request(`/blogs?${query}`);
        return res.blogs;
      } catch {
        await sleep(300);
        let list = [...db.blogs];
        if (filters.status)
          list = list.filter((b) => b.status === filters.status);
        return list;
      }
    },
    get: async (id) => {
      try {
        const res = await request(`/blogs/${id}`);
        return res.blog;
      } catch (err) {
        await sleep(200);
        const blog = db.blogs.find((b) => b.id === id);
        if (!blog) throw new Error("Blog post not found");
        return blog;
      }
    },
    create: async (data) => {
      try {
        const res = await request("/blogs", {
          method: "POST",
          body: JSON.stringify(data),
        });
        return res.blog;
      } catch (err) {
        await sleep(400);
        const blog = {
          ...data,
          id: `blg-${Date.now()}`,
          author: "adm-001",
          createdAt: new Date().toISOString(),
        };
        if (blog.status === "published")
          blog.publishedAt = new Date().toISOString();
        db.blogs = [blog, ...db.blogs];
        saveCollection("blogs", db.blogs);
        return blog;
      }
    },
    update: async (id, data) => {
      try {
        const res = await request(`/blogs/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
        return res.blog;
      } catch (err) {
        await sleep(300);
        db.blogs = db.blogs.map((b) => (b.id === id ? { ...b, ...data } : b));
        saveCollection("blogs", db.blogs);
        return db.blogs.find((b) => b.id === id);
      }
    },
    delete: async (id) => {
      try {
        await request(`/blogs/${id}`, { method: "DELETE" });
      } catch (err) {
        await sleep(200);
        db.blogs = db.blogs.filter((b) => b.id !== id);
        saveCollection("blogs", db.blogs);
      }
    },
  },

  // Blog Categories
  blogCategories: {
    list: async () => {
      try {
        const res = await request("/blog-categories");
        return res.categories;
      } catch (err) {
        await sleep(200);
        return db.blogCategories.map((c) => ({
          ...c,
          blogCount: db.blogs.filter((b) => b.category === c.name).length,
        }));
      }
    },
    get: async (id) => {
      try {
        const res = await request(`/blog-categories/${id}`);
        return res.category;
      } catch (err) {
        await sleep(200);
        const category = db.blogCategories.find((c) => c.id === id);
        if (!category) throw new Error("Blog category not found");
        return category;
      }
    },
    create: async (data) => {
      try {
        const res = await request("/blog-categories", {
          method: "POST",
          body: JSON.stringify(data),
        });
        return res.category;
      } catch (err) {
        await sleep(400);
        const category = { ...data, id: `bcat-${Date.now()}` };
        db.blogCategories = [...db.blogCategories, category];
        saveCollection("blogCategories", db.blogCategories);
        return category;
      }
    },
    update: async (id, data) => {
      try {
        const res = await request(`/blog-categories/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
        return res.category;
      } catch (err) {
        await sleep(300);
        const oldCategory = db.blogCategories.find((c) => c.id === id);
        db.blogCategories = db.blogCategories.map((c) =>
          c.id === id ? { ...c, ...data } : c,
        );
        saveCollection("blogCategories", db.blogCategories);
        // update associated blogs categories
        if (oldCategory && data.name && data.name !== oldCategory.name) {
          db.blogs = db.blogs.map((b) =>
            b.category === oldCategory.name ? { ...b, category: data.name } : b,
          );
          saveCollection("blogs", db.blogs);
        }
        return db.blogCategories.find((c) => c.id === id);
      }
    },
    delete: async (id) => {
      try {
        await request(`/blog-categories/${id}`, { method: "DELETE" });
      } catch (err) {
        await sleep(300);
        const category = db.blogCategories.find((c) => c.id === id);
        db.blogCategories = db.blogCategories.filter((c) => c.id !== id);
        saveCollection("blogCategories", db.blogCategories);
        if (category) {
          db.blogs = db.blogs.map((b) =>
            b.category === category.name ? { ...b, category: "" } : b,
          );
          saveCollection("blogs", db.blogs);
        }
      }
    },
  },

  // Coupons
  coupons: {
    list: async () => {
      try {
        const res = await request("/coupons");
        return res.coupons;
      } catch (err) {
        await sleep(200);
        return db.coupons;
      }
    },
    create: async (data) => {
      try {
        const res = await request("/coupons", {
          method: "POST",
          body: JSON.stringify(data),
        });
        return res.coupon;
      } catch (err) {
        if (!shouldUseMockFallback(err)) throw err;
        await sleep(400);
        const coupon = {
          ...data,
          id: `cpn-${Date.now()}`,
          usedCount: 0,
          createdAt: new Date().toISOString(),
        };
        db.coupons = [coupon, ...db.coupons];
        saveCollection("coupons", db.coupons);
        return coupon;
      }
    },
    update: async (id, data) => {
      try {
        const res = await request(`/coupons/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
        return res.coupon;
      } catch (err) {
        if (!shouldUseMockFallback(err)) throw err;
        await sleep(300);
        db.coupons = db.coupons.map((c) =>
          c.id === id ? { ...c, ...data } : c,
        );
        saveCollection("coupons", db.coupons);
        return db.coupons.find((c) => c.id === id);
      }
    },
    toggle: async (id) => {
      try {
        const res = await request(`/coupons/${id}/toggle`, { method: "PUT" });
        return res.coupon;
      } catch (err) {
        if (!shouldUseMockFallback(err)) throw err;
        await sleep(200);
        db.coupons = db.coupons.map((c) =>
          c.id === id ? { ...c, active: !c.active } : c,
        );
        saveCollection("coupons", db.coupons);
        return db.coupons.find((c) => c.id === id);
      }
    },
    delete: async (id) => {
      try {
        await request(`/coupons/${id}`, { method: "DELETE" });
      } catch (err) {
        if (!shouldUseMockFallback(err)) throw err;
        await sleep(200);
        db.coupons = db.coupons.filter((c) => c.id !== id);
        saveCollection("coupons", db.coupons);
      }
    },
    validate: async (code, cartSubtotal = 0) => {
      try {
        const res = await publicRequest("/coupons/validate", {
          method: "POST",
          body: JSON.stringify({ code, cartSubtotal }),
        });
        return res;
      } catch (err) {
        await sleep(200);
        const coupon = db.coupons.find(
          (c) => c.code.toUpperCase() === code.toUpperCase() && c.active,
        );
        if (!coupon) throw new Error("Invalid or inactive coupon code");
        let discountAmount =
          coupon.discountType === "percentage"
            ? Math.round((cartSubtotal * coupon.discountValue) / 100)
            : coupon.discountValue;
        return {
          success: true,
          coupon: {
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            discountAmount,
          },
        };
      }
    },
    bulkDelete: async (ids) => {
      try {
        await request("/coupons/bulk-delete", {
          method: "POST",
          body: JSON.stringify({ ids }),
        });
      } catch (err) {
        if (!shouldUseMockFallback(err)) throw err;
        await sleep(400);
        db.coupons = db.coupons.filter((c) => !ids.includes(c.id));
        saveCollection("coupons", db.coupons);
      }
    },
    // Public storefront — list all active coupons (no auth required)
    listPublic: async () => {
      const res = await publicRequest("/coupons");
      return res.coupons; // [{ code, type, value, description, minOrderValue }]
    },
    // Public storefront — validate a coupon code
    validate: async (code, cartSubtotal = 0) => {
      const res = await publicRequest("/coupons/validate", {
        method: "POST",
        body: JSON.stringify({ code, cartSubtotal }),
      });
      return res.coupon; // { code, discountType, discountValue, discountAmount }
    },
  },

  // Newsletter
  newsletter: {
    subscribe: async (email) => {
      try {
        const res = await publicRequest("/newsletter/subscribe", {
          method: "POST",
          body: JSON.stringify({ email }),
        });
        return res;
      } catch (err) {
        await sleep(300);
        return { success: true, message: "Thank you for subscribing!" };
      }
    },
    list: async (filters = {}) => {
      try {
        const query = new URLSearchParams(filters).toString();
        const res = await request(`/newsletter?${query}`);
        return res.subscribers;
      } catch (err) {
        await sleep(300);
        let list = [...db.newsletter];
        if (filters.search) {
          const q = filters.search.toLowerCase();
          list = list.filter(
            (n) =>
              n.email.toLowerCase().includes(q) ||
              n.name.toLowerCase().includes(q),
          );
        }
        return list;
      }
    },
    delete: async (id) => {
      try {
        await request(`/newsletter/${id}`, { method: "DELETE" });
      } catch (err) {
        await sleep(200);
        db.newsletter = db.newsletter.filter((n) => n.id !== id);
        saveCollection("newsletter", db.newsletter);
      }
    },
    bulkDelete: async (ids) => {
      try {
        await request("/newsletter/bulk-delete", {
          method: "POST",
          body: JSON.stringify({ ids }),
        });
      } catch (err) {
        await sleep(300);
        db.newsletter = db.newsletter.filter((n) => !ids.includes(n.id));
        saveCollection("newsletter", db.newsletter);
      }
    },
  },

  // Reports
  reports: {
    get: async () => {
      try {
        const res = await request("/reports");
        return {
          stats: res.stats,
          categoryBreakdown: res.categoryBreakdown,
          monthlyReport: res.monthlyReport,
        };
      } catch (err) {
        await sleep(400);
        // Fallback reports
        const delivered = db.orders.filter((o) => o.status === "delivered");
        const revenue = delivered.reduce((sum, o) => sum + o.total, 0);
        return {
          stats: {
            totalRevenue: revenue,
            totalOrders: db.orders.length,
            pendingOrders: db.orders.filter((o) => o.status === "pending")
              .length,
            totalCustomers: db.customers.length,
            totalProducts: db.products.length,
            lowStockCount: db.products.filter(
              (p) => p.quantity <= p.lowStockThreshold,
            ).length,
          },
          categoryBreakdown: mock.MOCK_CATEGORY_SALES,
          monthlyReport: mock.MOCK_REVENUE_CHART,
        };
      }
    },
  },

  // Location
  location: {
    get: async () => {
      try {
        const res = await publicRequest("/location");
        return res.countryCode || "US";
      } catch (err) {
        console.warn("Failed to fetch location from backend, attempting fallback:", err);
        const geoRes = await fetch("https://ipapi.co/json/").catch(() => null);
        if (geoRes && geoRes.ok) {
          const data = await geoRes.json();
          if (data?.country_code) return data.country_code.toUpperCase();
        }
        return "US";
      }
    },
  },

  // Settings
  settings: {
    getPublicLive: async () => {
      const res = await publicRequest("/settings");
      return res.settings;
    },
    getPublic: async () => {
      try {
        const res = await publicRequest("/settings");
        return res.settings;
      } catch (err) {
        await sleep(200);
        return db.settings;
      }
    },
    get: async () => {
      try {
        const res = await request("/settings");
        return res.settings;
      } catch (err) {
        await sleep(200);
        return db.settings;
      }
    },
    update: async (data) => {
      try {
        const res = await request("/settings", {
          method: "PUT",
          body: JSON.stringify(data),
        });
        return res.settings;
      } catch (err) {
        await sleep(400);
        db.settings = { ...db.settings, ...data };
        saveCollection("settings", [db.settings]);
        return db.settings;
      }
    },
  },

  // Tax Rules
  taxRules: {
    list: async () => {
      const res = await request("/tax-rules");
      return res.taxRules;
    },
    get: async (id) => {
      const res = await request(`/tax-rules/${id}`);
      return res.taxRule;
    },
    create: async (data) => {
      const res = await request("/tax-rules", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return res.taxRule;
    },
    update: async (id, data) => {
      const res = await request(`/tax-rules/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return res.taxRule;
    },
    delete: async (id) => {
      await request(`/tax-rules/${id}`, { method: "DELETE" });
    },
  },

  // Profile
  profile: {
    get: async () => {
      try {
        const res = await request("/profile");
        return res.user;
      } catch (err) {
        await sleep(200);
        const stored = sessionStorage.getItem("zae_admin");
        return stored ? JSON.parse(stored) : null;
      }
    },
    update: async (data) => {
      try {
        const res = await request("/profile", {
          method: "PUT",
          body: JSON.stringify(data),
        });
        return res.user;
      } catch (err) {
        await sleep(400);
        const stored = sessionStorage.getItem("zae_admin");
        if (stored) {
          const user = { ...JSON.parse(stored), ...data };
          if (data.name) {
            const parts = data.name.trim().split(/\s+/);
            user.initials = parts
              .map((p) => p[0])
              .join("")
              .toUpperCase()
              .slice(0, 3);
          }
          sessionStorage.setItem("zae_admin", JSON.stringify(user));
          return user;
        }
        return null;
      }
    },
    changePassword: async (currentPassword, newPassword) => {
      try {
        await request("/profile/change-password", {
          method: "POST",
          body: JSON.stringify({ currentPassword, newPassword }),
        });
      } catch (err) {
        await sleep(500);
        if (!USE_MOCK && !err.message.includes("Failed to fetch")) throw err;
      }
    },
  },
};
