/* State */
const state = {
    menu: [],
    cart: {},
    orders: [],
    page: "home",
};

/* API */
const api = {
    async get(path) {
        const r = await fetch(path);
        if (!r.ok) throw new Error(`GET ${path} → ${r.status}`);
        return r.json();
    },
    async post(path, body) {
        const r = await fetch(path,{
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body),
        });
        if (!r.ok) {
            const err = await r.json().catch(() => ({}));
            throw new Error(err.error || `POST ${path} → ${r.status}`);
        }
        return r.json();
    },
};

/* Cart */
const cart = {
    add(id) {state.cart[id] = (state.cart[id] || 0) + 1; render();},
    remove(id) {if (!state.cart[id]) return; state.cart[id]--; if (!state.cart[id]) delete state.cart[id]; render();},
    qty(id) {return state.cart[id] || 0; },
    total() {return Object.entries(state.cart).reduce((s, [id, q]) => s + (menuById(+id)?.price || 0) * q, 0);},
      count()    { return Object.values(state.cart).reduce((a, b) => a + b, 0); },
  clear()    { state.cart = {}; },
  toItems()  { return Object.entries(state.cart).map(([menu_item_id, quantity]) => ({ menu_item_id: +menu_item_id, quantity })); },
};

function menuById(id) { return state.menu.find(m => m.id === id); }

/* ── Toast ────────────────────────────────────────────────────────────────── */
let toastTimer;
function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2500);
}

/* ── Navigation ───────────────────────────────────────────────────────────── */
function goTo(page) {
  state.page = page;
  if (page === "orders") loadOrders();
  render();
}

/* ── Icons ────────────────────────────────────────────────────────────────── */
const icons = {
  home:    `<svg viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>`,
  flame:   `<svg viewBox="0 0 24 24"><path d="M12 22c4.4 0 8-3.6 8-8 0-3-1.5-5.5-4-7 .5 2-1 4-3 4.5C14.5 10 13 8 13 6c0-1.5.5-3 1.5-4C9.5 3 4 7.5 4 14c0 4.4 3.6 8 8 8z"/></svg>`,
  menu:    `<svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></svg>`,
  list:    `<svg viewBox="0 0 24 24"><path d="M9 6h11M9 12h11M9 18h11M5 6v.01M5 12v.01M5 18v.01"/></svg>`,
  cart:    `<svg viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
  user:    `<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  order:   `<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  chevron: `<svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>`,
};

/* ── Item card ────────────────────────────────────────────────────────────── */
function renderItemCard(item) {
  const qty = cart.qty(item.id);
  return `
    <div class="item-card">
      <div class="item-emoji">${item.emoji || "🍽️"}</div>
      <div class="item-info">
        <div class="item-name">${item.name}</div>
        <div class="item-desc">${item.description}</div>
        <div class="item-meta">
          <span class="item-price">$${item.price.toFixed(2)}</span>
          <span class="item-cal">${item.calories} cal</span>
          ${item.is_popular ? `<span class="hot-pill">🔥 Popular</span>` : ""}
        </div>
      </div>
      <div class="item-controls">
        ${qty > 0 ? `
          <button class="qty-btn sub" onclick="cart.remove(${item.id})">−</button>
          <span class="qty-num">${qty}</span>
        ` : ""}
        <button class="qty-btn add" onclick="cart.add(${item.id})">+</button>
      </div>
    </div>`;
}

/* ── Pages ────────────────────────────────────────────────────────────────── */
function renderHomePage() {
  const popular = state.menu.filter(m => m.is_popular).slice(0, 4);
  return `
    <div class="home-hero">
      <div>
        <h1>Welcome to Grabbit 👋</h1>
        <p>Browse the menu and place your canteen order.</p>
      </div>
      <div class="home-rabbit">🐇</div>
    </div>

    <div class="home-tiles">
      <button class="home-tile" onclick="goTo('hot')">
        <div class="home-tile-icon">${icons.flame}</div>
        <h3>What's Hot</h3>
        <p>Popular items this week</p>
      </button>
      <button class="home-tile" onclick="goTo('menu')">
        <div class="home-tile-icon">${icons.menu}</div>
        <h3>Full Menu</h3>
        <p>Browse all available items</p>
      </button>
      <button class="home-tile" onclick="goTo('orders')">
        <div class="home-tile-icon">${icons.list}</div>
        <h3>Your Orders</h3>
        <p>View cart and order history</p>
      </button>
    </div>

    <div class="section-head">
      <h2>Popular this week</h2>
      <button class="see-all" onclick="goTo('hot')">See all →</button>
    </div>
    <div class="item-grid">
      ${popular.length ? popular.map(renderItemCard).join("") : '<div class="spinner"></div>'}
    </div>`;
}

function renderHotPage() {
  const hot = state.menu.filter(m => m.is_popular);
  return `
    <div class="page-header">
      <div>
        <h1>🔥 What's Hot</h1>
        <p>The most popular items this week</p>
      </div>
    </div>
    <div class="item-grid">
      ${hot.length ? hot.map(renderItemCard).join("") : '<div class="spinner"></div>'}
    </div>`;
}

function renderMenuPage() {
  return `
    <div class="page-header">
      <div>
        <h1>Full Menu</h1>
        <p>${state.menu.length} items available today</p>
      </div>
    </div>
    <div class="item-grid">
      ${state.menu.length ? state.menu.map(renderItemCard).join("") : '<div class="spinner"></div>'}
    </div>`;
}

function renderOrdersPage() {
  const cartItems = Object.entries(state.cart);

  const cartSection = `
    <div>
      <div class="card" style="margin-bottom:20px">
        <div class="card-head">Current order</div>
        ${cartItems.length === 0 ? `
          <div class="empty">
            <div class="empty-icon">🛒</div>
            <div class="empty-title">Your cart is empty</div>
            <div class="empty-sub">Head to the menu and add some items.</div>
            <button class="empty-btn" onclick="goTo('menu')">Browse menu</button>
          </div>` : `
          ${cartItems.map(([id, qty]) => {
            const item = menuById(+id);
            if (!item) return "";
            return `
              <div class="cart-row">
                <span style="font-size:22px">${item.emoji}</span>
                <div style="flex:1;min-width:0">
                  <div class="cart-row-name">${item.name}</div>
                  <div class="cart-row-qty">× ${qty}</div>
                </div>
                <div class="cart-row-controls">
                  <button class="qty-btn sub" style="width:26px;height:26px;font-size:15px" onclick="cart.remove(${id})">−</button>
                  <span class="qty-num">${qty}</span>
                  <button class="qty-btn add" style="width:26px;height:26px;font-size:15px" onclick="cart.add(${id})">+</button>
                </div>
                <div class="cart-row-price">$${(item.price * qty).toFixed(2)}</div>
              </div>`;
          }).join("")}
          <div class="total-row">
            <span class="total-label">Order total</span>
            <span class="total-num">$${cart.total().toFixed(2)}</span>
          </div>
          <div style="padding:0 18px 16px">
            <button class="checkout-btn" onclick="placeOrder()">Place order</button>
          </div>`}
      </div>
    </div>`;

  const pastSection = `
    <div>
      <div class="card">
        <div class="card-head">Order history</div>
        ${state.orders.length === 0 ? `
          <div class="empty" style="padding:32px">
            <div class="empty-sub">No past orders yet.</div>
          </div>` : `
          <table class="past-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${state.orders.map(o => {
                const date = new Date(o.created_at).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
                const desc = o.items.map(i => `${i.emoji} ${i.name} ×${i.quantity}`).join(", ");
                return `
                  <tr>
                    <td>${date}</td>
                    <td class="past-name">${desc}</td>
                    <td><strong>$${o.total.toFixed(2)}</strong></td>
                    <td><span class="status-pill status-${o.status}">${o.status}</span></td>
                  </tr>`;
              }).join("")}
            </tbody>
          </table>`}
      </div>
    </div>`;

  return `
    <div class="page-header"><div><h1>Your Orders</h1><p>Manage your cart and view past orders</p></div></div>
    <div class="orders-layout">${cartSection}${pastSection}</div>`;
}

function renderProfilePage() {
  const totalOrders = state.orders.length;
  const totalSpent  = state.orders.reduce((s, o) => s + o.total, 0);
  const lastOrder   = state.orders[0];
  const lastStr     = lastOrder
    ? new Date(lastOrder.created_at).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  return `
    <div class="page-header"><div><h1>Profile</h1><p>Your account and activity</p></div></div>
    <div class="profile-layout">
      <div class="profile-card">
        <div class="profile-hero">
          <div class="profile-avatar-wrap">
            <div class="profile-avatar-placeholder">${icons.user}</div>
            <div class="profile-avatar-badge">🐇</div>
          </div>
          <div class="profile-name">Grabbit User</div>
          <div class="profile-email">Canteen ordering app</div>
        </div>
        <div class="profile-stats">
          <div class="profile-stat">
            <div class="profile-stat-num">${totalOrders}</div>
            <div class="profile-stat-label">Orders</div>
          </div>
          <div class="profile-stat">
            <div class="profile-stat-num">$${totalSpent.toFixed(2)}</div>
            <div class="profile-stat-label">Spent</div>
          </div>
        </div>
        <div class="profile-section-label">Quick links</div>
        <button class="profile-row" onclick="goTo('orders')">
          <span class="profile-row-icon">${icons.order}</span>
          <div class="profile-row-body">
            <div class="profile-row-label">Your orders</div>
            <div class="profile-row-value">${totalOrders} order${totalOrders !== 1 ? "s" : ""} placed</div>
          </div>
          <span class="profile-row-chevron">${icons.chevron}</span>
        </button>
        <button class="profile-row" onclick="goTo('menu')">
          <span class="profile-row-icon">${icons.menu}</span>
          <div class="profile-row-body">
            <div class="profile-row-label">Browse menu</div>
            <div class="profile-row-value">${state.menu.length} items available</div>
          </div>
          <span class="profile-row-chevron">${icons.chevron}</span>
        </button>
        <div class="profile-footer">Grabbit v1.0 · Your canteen, made quick</div>
      </div>

      <div class="card">
        <div class="card-head">Recent activity</div>
        ${state.orders.length === 0 ? `
          <div class="empty" style="padding:32px">
            <div class="empty-icon">📋</div>
            <div class="empty-sub">No orders placed yet.</div>
          </div>` : `
          <table class="past-table">
            <thead><tr><th>Date</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              ${state.orders.slice(0, 5).map(o => {
                const date = new Date(o.created_at).toLocaleDateString("en-AU", { day: "numeric", month: "short" });
                const desc = o.items.map(i => `${i.name} ×${i.quantity}`).join(", ");
                return `<tr>
                  <td>${date}</td>
                  <td class="past-name">${desc}</td>
                  <td><strong>$${o.total.toFixed(2)}</strong></td>
                  <td><span class="status-pill status-${o.status}">${o.status}</span></td>
                </tr>`;
              }).join("")}
            </tbody>
          </table>`}
      </div>
    </div>`;
}

/* ── Sidebar ──────────────────────────────────────────────────────────────── */
function renderSidebar() {
  const navItem = (page, icon, label) =>
    `<button class="nav-item ${state.page === page ? "active" : ""}" onclick="goTo('${page}')">${icons[icon]}${label}</button>`;

  return `
    <aside class="sidebar">
      <div class="sidebar-section-label">Browse</div>
      ${navItem("home",    "home",  "Home")}
      ${navItem("hot",     "flame", "What's Hot")}
      ${navItem("menu",    "menu",  "Full Menu")}
      <div class="sidebar-section-label">Account</div>
      ${navItem("orders",  "list",  "Your Orders")}
      ${navItem("profile", "user",  "Profile")}
      <div class="sidebar-footer">🐇 Grabbit v1.0</div>
    </aside>`;
}

/* ── Main render ──────────────────────────────────────────────────────────── */
function render() {
  const pages = { home: renderHomePage, hot: renderHotPage, menu: renderMenuPage, orders: renderOrdersPage, profile: renderProfilePage };
  const cartCount = cart.count();

  document.getElementById("app").innerHTML = `
    <header class="topbar">
      <div class="topbar-logo"><span>🐇</span> Grabbit</div>
      <div class="topbar-right">
        <button class="cart-btn" onclick="goTo('orders')" aria-label="View cart">
          ${icons.cart} Cart
          <span class="cart-count" data-count="${cartCount}">${cartCount}</span>
        </button>
      </div>
    </header>

    ${renderSidebar()}

    <main class="main">
      ${Object.entries(pages).map(([key, fn]) =>
        `<div id="page-${key}" class="page ${state.page === key ? "active" : ""}">${fn()}</div>`
      ).join("")}
    </main>

    <div id="toast" class="toast"></div>`;
}

/* ── Data loading ─────────────────────────────────────────────────────────── */
async function loadMenu() {
  try { state.menu = await api.get("/api/menu"); render(); }
  catch (e) { console.error("Failed to load menu:", e); }
}

async function loadOrders() {
  try { state.orders = await api.get("/api/orders"); render(); }
  catch (e) { console.error("Failed to load orders:", e); }
}

/* ── Place order ──────────────────────────────────────────────────────────── */
async function placeOrder() {
  if (!cart.count()) return;
  const btn = document.querySelector(".checkout-btn");
  if (btn) { btn.disabled = true; btn.textContent = "Placing order…"; }
  try {
    await api.post("/api/orders", { items: cart.toItems() });
    cart.clear();
    await loadOrders();
    toast("Order placed! 🐇");
  } catch (e) {
    toast(`Error: ${e.message}`);
    render();
  }
}

/* ── Service worker ───────────────────────────────────────────────────────── */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/static/sw.js").catch(console.error);
}

/* ── Boot ─────────────────────────────────────────────────────────────────── */
(async () => {
  render();
  await loadMenu();
  await loadOrders();
})();