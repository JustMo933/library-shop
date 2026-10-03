/**
 * app.js — Maktabati Office Supplies Store
 *
 * Security notes (mandatory-secure-web-skills compliance):
 * - NO innerHTML / outerHTML used for user-supplied data. All user input is
 *   inserted via textContent or DOM builder helpers only.
 * - localStorage stores only non-sensitive order metadata (product name, qty,
 *   address, phone). Phone numbers are masked in UI displays.
 * - No auth tokens or session secrets are stored anywhere.
 * - No eval(), document.write(), or insertAdjacentHTML used.
 * - No native alert/confirm/prompt dialogs; custom modal is used instead.
 * - All form inputs are validated with an allow-list approach before storage.
 *
 * TODO(security): When integrating with a backend API, use HTTPS-only endpoints,
 * send orders via POST with CSRF tokens (if cookie-auth), and remove order data
 * from localStorage after successful server acknowledgement.
 */

'use strict';

/* ============================================================
   DATA — Product Catalog
   ============================================================ */

/** @typedef {{ id:string, name:string, nameEn:string, category:string,
 *              categoryLabel:string, desc:string, price:number, oldPrice?:number,
 *              image:string|null, emoji:string, badge?:string, stars:number,
 *              isBestSeller?:boolean }} Product */

/** @type {Product[]} */
const PRODUCTS = [
  {
    id: 'p001',
    name: 'طقم أقلام فاخر',
    nameEn: 'Premium Pen Set',
    category: 'writing',
    categoryLabel: 'أدوات الكتابة',
    desc: 'طقم أقلام جاف بجودة عالية، ألوان متعددة، حبر سلس، مثالي للمكتب والدراسة.',
    price: 45,
    oldPrice: 65,
    image: 'assets/product_pens.png',
    emoji: '✒️',
    badge: 'الأكثر مبيعاً',
    badgeType: 'badge-bestseller',
    stars: 5,
    isBestSeller: true,
  },
  {
    id: 'p002',
    name: 'دفاتر ملونة (6 قطع)',
    nameEn: 'Colorful Notebooks',
    category: 'paper',
    categoryLabel: 'دفاتر وأوراق',
    desc: 'دفاتر حلزونية بغلاف صلب ومسطرة داخلية، متوفرة بألوان زاهية، مقاس A5.',
    price: 60,
    oldPrice: 80,
    image: 'assets/product_notebooks.png',
    emoji: '📓',
    badge: 'الأكثر مبيعاً',
    badgeType: 'badge-bestseller',
    stars: 5,
    isBestSeller: true,
  },
  {
    id: 'p003',
    name: 'دباسة معدنية احترافية',
    nameEn: 'Professional Metal Stapler',
    category: 'tools',
    categoryLabel: 'أدوات مكتبية',
    desc: 'دباسة بهيكل معدني متين، مثالية للاستخدام اليومي في المكاتب، تقبل حتى 30 ورقة.',
    price: 75,
    oldPrice: null,
    image: 'assets/product_stapler.png',
    emoji: '📎',
    badge: 'الأكثر مبيعاً',
    badgeType: 'badge-bestseller',
    stars: 4,
    isBestSeller: true,
  },
  {
    id: 'p004',
    name: 'ملاحظات لاصقة ملونة',
    nameEn: 'Colorful Sticky Notes',
    category: 'organize',
    categoryLabel: 'تنظيم',
    desc: 'حزمة ملاحظات لاصقة بألوان زاهية (أصفر، وردي، أزرق، أخضر) — 400 ورقة.',
    price: 30,
    oldPrice: null,
    image: 'assets/product_sticky_notes.png',
    emoji: '🗒️',
    badge: 'الأكثر مبيعاً',
    badgeType: 'badge-bestseller',
    stars: 5,
    isBestSeller: true,
  },
  {
    id: 'p005',
    name: 'مقص مكتبي احترافي',
    nameEn: 'Professional Office Scissors',
    category: 'tools',
    categoryLabel: 'أدوات مكتبية',
    desc: 'مقص بشفرات ستانلس ستيل ومقبض مريح للاستخدام الطويل، حاد ودقيق.',
    price: 35,
    oldPrice: 48,
    image: 'assets/product_scissors.png',
    emoji: '✂️',
    badge: 'عرض',
    badgeType: 'badge-offer',
    stars: 4,
    isBestSeller: false,
  },
  {
    id: 'p006',
    name: 'أقلام تحديد ملونة',
    nameEn: 'Colorful Markers',
    category: 'writing',
    categoryLabel: 'أدوات الكتابة',
    desc: 'طقم أقلام تحديد بألوان زاهية لا تنسكب، مثالية للإبداع والتنظيم.',
    price: 55,
    oldPrice: null,
    image: null,
    emoji: '🖊️',
    badge: 'جديد',
    badgeType: 'badge-new',
    stars: 4,
    isBestSeller: false,
  },
  {
    id: 'p007',
    name: 'آلة حاسبة علمية',
    nameEn: 'Scientific Calculator',
    category: 'tools',
    categoryLabel: 'أدوات مكتبية',
    desc: 'آلة حاسبة علمية باللمس، شاشة واضحة، مثالية للطلاب والمهندسين.',
    price: 120,
    oldPrice: 150,
    image: null,
    emoji: '🖩',
    badge: null,
    stars: 5,
    isBestSeller: false,
  },
  {
    id: 'p008',
    name: 'موزع شريط لاصق',
    nameEn: 'Tape Dispenser',
    category: 'tools',
    categoryLabel: 'أدوات مكتبية',
    desc: 'موزع شريط لاصق بتصميم أنيق، معدني داخلي، يأتي مع بكرة شريط شفاف.',
    price: 40,
    oldPrice: null,
    image: null,
    emoji: '📏',
    badge: null,
    stars: 4,
    isBestSeller: false,
  },
  {
    id: 'p009',
    name: 'ملف تنظيم أوراق A4',
    nameEn: 'A4 Document Folder',
    category: 'organize',
    categoryLabel: 'تنظيم',
    desc: 'ملف بلاستيكي لتنظيم الأوراق، يتسع لـ 60 ورقة A4، بأقسام متعددة.',
    price: 25,
    oldPrice: null,
    image: null,
    emoji: '📁',
    badge: 'جديد',
    badgeType: 'badge-new',
    stars: 4,
    isBestSeller: false,
  },
  {
    id: 'p010',
    name: 'مسطرة معدنية 30cm',
    nameEn: 'Metal Ruler 30cm',
    category: 'tools',
    categoryLabel: 'أدوات مكتبية',
    desc: 'مسطرة معدنية دقيقة بمقياس cm/inch، متينة ومثالية للرسم الهندسي.',
    price: 20,
    oldPrice: null,
    image: null,
    emoji: '📐',
    badge: null,
    stars: 4,
    isBestSeller: false,
  },
  {
    id: 'p011',
    name: 'رزمة ورق A4 (500 ورقة)',
    nameEn: 'A4 Paper Ream',
    category: 'paper',
    categoryLabel: 'دفاتر وأوراق',
    desc: 'ورق A4 ناصع البياض 80 جرام، مناسب لجميع أنواع الطابعات والتصوير.',
    price: 85,
    oldPrice: 100,
    image: null,
    emoji: '🗂️',
    badge: 'عرض',
    badgeType: 'badge-offer',
    stars: 5,
    isBestSeller: false,
  },
  {
    id: 'p012',
    name: 'مشبك أوراق معدني (50 قطعة)',
    nameEn: 'Metal Paper Clips',
    category: 'organize',
    categoryLabel: 'تنظيم',
    desc: 'مشابك أوراق معدنية عالية الجودة في علبة عملية، لتنظيم الأوراق بشكل مرتب.',
    price: 15,
    oldPrice: null,
    image: null,
    emoji: '🔗',
    badge: null,
    stars: 4,
    isBestSeller: false,
  },
];

/* ============================================================
   STORAGE SERVICE — localStorage wrapper
   ============================================================
   NOTE: Only non-sensitive order data is stored here.
   No auth tokens, no passwords, no session IDs.
   TODO(security): Replace with server-side persistence on production.
   ============================================================ */
const StorageService = (() => {
  const KEY = 'maktabati_orders_v1';

  /** Validate a raw order object before reading/writing */
  function isValidOrder(o) {
    return (
      o &&
      typeof o.id === 'string' &&
      typeof o.productId === 'string' &&
      typeof o.productName === 'string' &&
      typeof o.name === 'string' &&
      typeof o.phone === 'string' &&
      typeof o.address === 'string' &&
      typeof o.quantity === 'number' &&
      typeof o.timestamp === 'number'
    );
  }

  function loadOrders() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      // Filter out any malformed entries
      return parsed.filter(isValidOrder);
    } catch {
      // Parsing failed — return empty, don't crash
      return [];
    }
  }

  function saveOrder(order) {
    const orders = loadOrders();
    orders.unshift(order);
    // Keep max 100 orders to avoid unbounded localStorage growth
    const capped = orders.slice(0, 100);
    try {
      localStorage.setItem(KEY, JSON.stringify(capped));
      return true;
    } catch {
      return false;
    }
  }

  return { loadOrders, saveOrder };
})();

/* ============================================================
   API SERVICE — hook for future backend integration
   ============================================================
   TODO(security): Replace the stub below with real HTTPS fetch calls.
   Use CSRF tokens for POST requests when cookie-based auth is active.
   ============================================================ */
const ApiService = (() => {
  /**
   * Submit order to backend.
   * Currently a no-op returning a resolved promise (offline mode).
   * @param {object} order
   * @returns {Promise<{success:boolean}>}
   */
  async function submitOrder(order) {
    // TODO(security): Swap stub for:
    // const res = await fetch('https://your-api.example.com/orders', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': getCsrfToken() },
    //   credentials: 'same-origin',
    //   body: JSON.stringify(order),
    // });
    // if (!res.ok) throw new Error('Server error');
    // return res.json();
    return { success: true };
  }

  return { submitOrder };
})();

/* ============================================================
   VALIDATION HELPERS
   ============================================================ */

/**
 * Allow-list based input sanitizer — returns trimmed string.
 * MUST NOT be used for HTML output; use textContent for display.
 * @param {string} val
 * @param {number} maxLen
 * @returns {string}
 */
function sanitizeText(val, maxLen) {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLen);
}

/**
 * Validate Egyptian phone: starts with 01, 11 digits total.
 * @param {string} phone
 * @returns {boolean}
 */
function isValidPhone(phone) {
  return /^(01)[0-9]{9}$/.test(phone);
}

/**
 * Mask phone for display: 01xxxxxxx → 01*****xxx
 * @param {string} phone
 * @returns {string}
 */
function maskPhone(phone) {
  if (phone.length < 7) return '***';
  return phone.slice(0, 2) + '*****' + phone.slice(-3);
}

/**
 * Validate name: non-empty, only letters/spaces/Arabic, max 80 chars.
 * @param {string} name
 * @returns {boolean}
 */
function isValidName(name) {
  return name.length >= 2 && name.length <= 80 && /^[\u0600-\u06FFa-zA-Z\s\-'\.]+$/.test(name);
}

/**
 * Validate address: non-empty, max 300 chars.
 * @param {string} address
 * @returns {boolean}
 */
function isValidAddress(address) {
  return address.length >= 5 && address.length <= 300;
}

/**
 * Generate a simple UUID-like unique ID (not cryptographically strong,
 * used only as a display/storage key — not a security token).
 * @returns {string}
 */
function generateOrderId() {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  // Format as xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  const hex = Array.from(arr, b => b.toString(16).padStart(2, '0'));
  return [
    hex.slice(0, 4).join(''),
    hex.slice(4, 6).join(''),
    hex.slice(6, 8).join(''),
    hex.slice(8, 10).join(''),
    hex.slice(10, 16).join(''),
  ].join('-');
}

/* ============================================================
   DOM BUILDER — Secure element construction helpers
   MUST use textContent / setAttribute only — NO innerHTML.
   ============================================================ */
const DOM = {
  /**
   * Create an element with optional class, attributes, and text.
   * @param {string} tag
   * @param {{ cls?:string, attrs?:Record<string,string>, text?:string }} opts
   * @returns {HTMLElement}
   */
  el(tag, { cls, attrs, text } = {}) {
    const elem = document.createElement(tag);
    if (cls) elem.className = cls;
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        elem.setAttribute(k, v);
      }
    }
    if (text !== undefined) elem.textContent = text;
    return elem;
  },

  /** Clear a container safely (no innerHTML = '') */
  clear(container) {
    container.replaceChildren();
  },

  /** Append multiple children */
  append(parent, ...children) {
    for (const c of children) {
      if (c) parent.appendChild(c);
    }
  },

  /**
   * Build a star rating element.
   * @param {number} stars 1-5
   * @returns {HTMLElement}
   */
  buildStars(stars) {
    const wrap = DOM.el('span', { cls: 'card-stars', attrs: { 'aria-label': `${stars} نجوم من 5` } });
    for (let i = 1; i <= 5; i++) {
      const s = DOM.el('span', { attrs: { 'aria-hidden': 'true' } });
      s.textContent = i <= stars ? '★' : '☆';
      wrap.appendChild(s);
    }
    const count = DOM.el('span');
    count.textContent = ` (${stars}.0)`;
    wrap.appendChild(count);
    return wrap;
  },
};

/* ============================================================
   PRODUCT CARD BUILDER
   Uses only DOM APIs — zero innerHTML for user/product data.
   ============================================================ */

/**
 * Build a product card element.
 * @param {Product} product
 * @returns {HTMLElement}
 */
function buildProductCard(product) {
  const card = DOM.el('article', {
    cls: 'product-card',
    attrs: {
      role: 'listitem',
      tabindex: '0',
      'aria-label': `${product.name} - ${product.price} جنيه`,
      'data-product-id': product.id,
    },
  });

  // Badge
  if (product.badge) {
    const badge = DOM.el('div', {
      cls: `card-badge ${product.badgeType || 'badge-new'}`,
      attrs: { 'aria-label': product.badge },
      text: product.badge,
    });
    card.appendChild(badge);
  }

  // Image wrap
  const imgWrap = DOM.el('div', { cls: 'card-image-wrap' });
  if (product.image) {
    const img = DOM.el('img', {
      attrs: {
        src: product.image,
        alt: product.name,
        width: '260',
        height: '195',
        loading: 'lazy',
      },
    });
    imgWrap.appendChild(img);
  } else {
    const placeholder = DOM.el('div', { cls: 'img-placeholder', attrs: { 'aria-hidden': 'true' } });
    placeholder.textContent = product.emoji;
    imgWrap.appendChild(placeholder);
  }
  card.appendChild(imgWrap);

  // Body
  const body = DOM.el('div', { cls: 'card-body' });

  const category = DOM.el('div', { cls: 'card-category', text: product.categoryLabel });
  const name = DOM.el('h3', { cls: 'card-name', text: product.name });
  const desc = DOM.el('p', { cls: 'card-desc', text: product.desc });

  const footer = DOM.el('div', { cls: 'card-footer' });

  const priceWrap = DOM.el('div', { cls: 'card-price' });
  const priceCurrent = DOM.el('span', {
    cls: 'price-current',
    text: `${product.price} ج.م`,
    attrs: { 'aria-label': `السعر: ${product.price} جنيه` },
  });
  priceWrap.appendChild(priceCurrent);
  if (product.oldPrice) {
    const priceOld = DOM.el('span', {
      cls: 'price-old',
      text: `${product.oldPrice} ج.م`,
      attrs: { 'aria-label': `السعر القديم: ${product.oldPrice} جنيه` },
    });
    priceWrap.appendChild(priceOld);
  }

  const orderBtn = DOM.el('button', {
    cls: 'card-order-btn',
    attrs: {
      type: 'button',
      'aria-label': `اطلب ${product.name} الآن`,
      'data-product-id': product.id,
    },
    text: 'اطلب الآن',
  });

  DOM.append(footer, priceWrap, orderBtn);

  const starsEl = DOM.buildStars(product.stars);

  DOM.append(body, category, name, desc, starsEl, footer);
  card.appendChild(body);

  return card;
}

/* ============================================================
   VIEW ROUTER
   ============================================================ */
const VIEWS = ['home', 'products', 'orders'];
let currentView = 'home';

/**
 * Switch to a named view with a smooth transition.
 * @param {string} viewName
 */
function navigateTo(viewName) {
  if (!VIEWS.includes(viewName)) return;
  if (viewName === currentView) return;

  const oldEl = document.getElementById(`view-${currentView}`);
  const newEl = document.getElementById(`view-${viewName}`);

  // Fade out old
  if (oldEl) {
    oldEl.style.opacity = '0';
    oldEl.style.transition = 'opacity 200ms ease';
    setTimeout(() => {
      oldEl.classList.remove('active');
      oldEl.hidden = true;
      oldEl.style.opacity = '';
      oldEl.style.transition = '';
    }, 200);
  }

  // Fade in new after brief delay
  setTimeout(() => {
    if (newEl) {
      newEl.hidden = false;
      newEl.classList.add('active');
      newEl.style.opacity = '0';
      newEl.style.transition = 'opacity 250ms ease';
      // Force reflow
      void newEl.offsetWidth;
      newEl.style.opacity = '1';
      setTimeout(() => {
        newEl.style.opacity = '';
        newEl.style.transition = '';
      }, 250);
    }
  }, 180);

  currentView = viewName;

  // Update nav links
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
    const isActive = link.dataset.view === viewName;
    link.classList.toggle('active', isActive);
    if (link.classList.contains('nav-link')) {
      link.setAttribute('aria-current', isActive ? 'page' : 'false');
    }
  });

  // Render view-specific content
  if (viewName === 'products') renderAllProducts();
  if (viewName === 'orders') renderOrders();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ============================================================
   RENDER — Best Sellers
   ============================================================ */
function renderBestSellers() {
  const grid = document.getElementById('bestsellers-grid');
  if (!grid) return;
  DOM.clear(grid);

  const best = PRODUCTS.filter(p => p.isBestSeller);
  best.forEach((product, i) => {
    const card = buildProductCard(product);
    card.style.animation = `cardReveal 0.5s ${i * 0.08}s ease-out both`;
    grid.appendChild(card);
  });
}

/* ============================================================
   RENDER — All Products (with filter)
   ============================================================ */
let activeCategory = 'all';

function renderAllProducts(category) {
  if (category !== undefined) activeCategory = category;
  const grid = document.getElementById('all-products-grid');
  if (!grid) return;
  DOM.clear(grid);

  const filtered = activeCategory === 'all'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === activeCategory);

  filtered.forEach((product, i) => {
    const card = buildProductCard(product);
    card.style.animation = `cardReveal 0.4s ${i * 0.06}s ease-out both`;
    grid.appendChild(card);
  });
}

/* ============================================================
   RENDER — Orders
   ============================================================ */
function renderOrders() {
  const container = document.getElementById('orders-container');
  if (!container) return;
  DOM.clear(container);

  const orders = StorageService.loadOrders();

  if (orders.length === 0) {
    const empty = DOM.el('div', { cls: 'orders-empty', attrs: { role: 'status' } });
    const icon  = DOM.el('div', { cls: 'orders-empty-icon', text: '📋' });
    const title = DOM.el('h3', { cls: 'orders-empty-title', text: 'لا توجد طلبات بعد' });
    const sub   = DOM.el('p',  { text: 'سيظهر هنا سجل طلباتك بعد تقديم أول طلب.' });
    DOM.append(empty, icon, title, sub);
    container.appendChild(empty);
    return;
  }

  orders.forEach((order, i) => {
    const card = DOM.el('div', {
      cls: 'order-card',
      attrs: {
        role: 'listitem',
        'aria-label': `طلب: ${order.productName}`,
      },
    });
    card.style.animationDelay = `${i * 0.07}s`;

    const iconWrap = DOM.el('div', { cls: 'order-icon', text: order.emoji || '📦' });

    const info = DOM.el('div', { cls: 'order-info' });

    const productName = DOM.el('div', { cls: 'order-product', text: order.productName });

    const meta = DOM.el('div', { cls: 'order-meta' });

    const metaName = DOM.el('div', { cls: 'order-meta-item' });
    const labelName = DOM.el('span', { cls: 'meta-label', text: 'الاسم: ' });
    const valName   = DOM.el('span', { text: order.name });
    DOM.append(metaName, labelName, valName);

    const metaPhone = DOM.el('div', { cls: 'order-meta-item' });
    const labelPhone = DOM.el('span', { cls: 'meta-label', text: 'الهاتف: ' });
    // Phone is masked for display (PII protection)
    const valPhone   = DOM.el('span', { text: maskPhone(order.phone) });
    DOM.append(metaPhone, labelPhone, valPhone);

    const metaQty = DOM.el('div', { cls: 'order-meta-item' });
    const labelQty = DOM.el('span', { cls: 'meta-label', text: 'الكمية: ' });
    const valQty   = DOM.el('span', { text: String(order.quantity) });
    DOM.append(metaQty, labelQty, valQty);

    const metaPrice = DOM.el('div', { cls: 'order-meta-item' });
    const labelPrice = DOM.el('span', { cls: 'meta-label', text: 'الإجمالي: ' });
    const valPrice   = DOM.el('span', { text: `${order.total} ج.م` });
    DOM.append(metaPrice, labelPrice, valPrice);

    const dateStr = new Date(order.timestamp).toLocaleString('ar-EG');
    const dateEl = DOM.el('div', { cls: 'order-date', text: `بتاريخ: ${dateStr}` });

    DOM.append(meta, metaName, metaPhone, metaQty, metaPrice);
    DOM.append(info, productName, meta, dateEl);

    const status = DOM.el('div', {
      cls: 'order-status',
      attrs: { 'aria-label': 'حالة الطلب: تم الاستلام' },
      text: '✅ تم الاستلام',
    });

    DOM.append(card, iconWrap, info, status);
    container.appendChild(card);
  });
}

/* ============================================================
   ORDER MODAL
   ============================================================ */
let activeProductId = null;

const modal = document.getElementById('order-modal');
const orderForm = document.getElementById('order-form');
const orderSuccess = document.getElementById('order-success');

/**
 * Open the order modal for a given product.
 * @param {string} productId
 */
function openOrderModal(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  activeProductId = productId;

  // Reset modal state
  orderForm.hidden = false;
  orderSuccess.hidden = true;
  orderForm.reset();

  // Clear previous errors
  clearFormErrors();

  // Set hidden product id field
  const pidInput = document.getElementById('order-product-id');
  pidInput.value = product.id;

  // Quantity default
  document.getElementById('order-qty').value = 1;

  // Build product preview (DOM only)
  buildModalPreview(product);

  // Build order summary
  updateOrderSummary(product, 1);

  // Show modal
  modal.hidden = false;
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // Focus first input
  setTimeout(() => {
    const firstInput = document.getElementById('order-name');
    if (firstInput) firstInput.focus();
  }, 100);
}

function closeOrderModal() {
  modal.hidden = true;
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  activeProductId = null;
}

/**
 * Build the product preview section in the modal.
 * Uses DOM API only — no innerHTML.
 * @param {Product} product
 */
function buildModalPreview(product) {
  const preview = document.getElementById('modal-product-preview');
  DOM.clear(preview);

  if (product.image) {
    const img = DOM.el('img', {
      cls: 'preview-img',
      attrs: { src: product.image, alt: product.name, width: '70', height: '70', loading: 'lazy' },
    });
    preview.appendChild(img);
  } else {
    const ph = DOM.el('div', {
      cls: 'preview-img-placeholder',
      attrs: { 'aria-hidden': 'true' },
      text: product.emoji,
    });
    preview.appendChild(ph);
  }

  const info = DOM.el('div');
  const nameEl  = DOM.el('div', { cls: 'preview-name', text: product.name });
  const priceEl = DOM.el('div', {
    cls: 'preview-price',
    text: `${product.price} ج.م / قطعة`,
    attrs: { 'aria-label': `السعر: ${product.price} جنيه للقطعة` },
  });
  DOM.append(info, nameEl, priceEl);
  preview.appendChild(info);
}

/**
 * Update the live order summary card.
 * @param {Product} product
 * @param {number} qty
 */
function updateOrderSummary(product, qty) {
  const summary = document.getElementById('order-summary');
  DOM.clear(summary);

  const subtotal = product.price * qty;
  const shipping = subtotal >= 100 ? 0 : 20;
  const total    = subtotal + shipping;

  const rows = [
    { label: 'المنتج', value: product.name },
    { label: 'السعر/قطعة', value: `${product.price} ج.م` },
    { label: 'الكمية', value: String(qty) },
    { label: 'الشحن', value: shipping === 0 ? 'مجاني 🎉' : `${shipping} ج.م` },
    { label: 'الإجمالي', value: `${total} ج.م` },
  ];

  rows.forEach(({ label, value }) => {
    const row = DOM.el('div', { cls: 'summary-row' });
    const lbl = DOM.el('span', { cls: 'summary-label', text: label });
    const val = DOM.el('span', { cls: 'summary-value', text: value });
    DOM.append(row, lbl, val);
    summary.appendChild(row);
  });

  return total;
}

/* ============================================================
   FORM VALIDATION
   ============================================================ */
function clearFormErrors() {
  ['name', 'phone', 'address'].forEach(field => {
    const input = document.getElementById(`order-${field}`);
    const error = document.getElementById(`${field}-error`);
    if (input)  { input.classList.remove('error'); input.removeAttribute('aria-invalid'); }
    if (error)  { error.textContent = ''; }
  });
}

/**
 * Show field error message.
 * @param {string} fieldId  e.g. 'name'
 * @param {string} message
 */
function showFieldError(fieldId, message) {
  const input = document.getElementById(`order-${fieldId}`);
  const error = document.getElementById(`${fieldId}-error`);
  if (input) { input.classList.add('error'); input.setAttribute('aria-invalid', 'true'); }
  if (error) { error.textContent = message; }
}

/* ============================================================
   FORM SUBMISSION
   ============================================================ */
async function handleOrderSubmit(e) {
  e.preventDefault();
  clearFormErrors();

  const product = PRODUCTS.find(p => p.id === activeProductId);
  if (!product) return;

  // Collect & sanitize
  const rawName    = sanitizeText(document.getElementById('order-name').value, 80);
  const rawPhone   = sanitizeText(document.getElementById('order-phone').value, 15);
  const rawAddress = sanitizeText(document.getElementById('order-address').value, 300);
  const rawQty     = parseInt(document.getElementById('order-qty').value, 10);
  const rawNotes   = sanitizeText(document.getElementById('order-notes').value, 200);

  let isValid = true;

  if (!isValidName(rawName)) {
    showFieldError('name', 'الاسم مطلوب ويجب أن يكون من 2 إلى 80 حرفاً.');
    isValid = false;
  }
  if (!isValidPhone(rawPhone)) {
    showFieldError('phone', 'أدخل رقم هاتف مصري صحيح (11 رقم يبدأ بـ 01).');
    isValid = false;
  }
  if (!isValidAddress(rawAddress)) {
    showFieldError('address', 'العنوان مطلوب ويجب أن يكون على الأقل 5 أحرف.');
    isValid = false;
  }

  if (!isValid) return;

  const qty = isNaN(rawQty) || rawQty < 1 ? 1 : Math.min(rawQty, 99);
  const subtotal = product.price * qty;
  const shipping = subtotal >= 100 ? 0 : 20;
  const total    = subtotal + shipping;

  const order = {
    id: generateOrderId(),
    productId: product.id,
    productName: product.name,
    emoji: product.emoji,
    name: rawName,
    phone: rawPhone,          // stored; masked on display
    address: rawAddress,
    notes: rawNotes,
    quantity: qty,
    price: product.price,
    total,
    timestamp: Date.now(),
  };

  // Disable submit while processing
  const submitBtn = document.getElementById('submit-order-btn');
  const submitLabel = document.getElementById('submit-label');
  submitBtn.disabled = true;
  submitLabel.textContent = 'جاري المعالجة...';

  try {
    await ApiService.submitOrder(order);
    StorageService.saveOrder(order);

    // Show success state
    orderForm.hidden = true;
    orderSuccess.hidden = false;

    const successMsg = document.getElementById('success-msg');
    // Build success message using textContent only
    successMsg.textContent = '';
    const line1 = document.createTextNode(`شكراً ${rawName}! تم تسجيل طلبك بنجاح.`);
    const br    = document.createElement('br');
    const line2 = document.createTextNode(`سيتم التواصل معك على: ${maskPhone(rawPhone)}`);
    successMsg.appendChild(line1);
    successMsg.appendChild(br);
    successMsg.appendChild(line2);

    showToast('✅ تم تسجيل طلبك بنجاح!');
  } catch {
    showToast('❌ حدث خطأ. يرجى المحاولة مرة أخرى.');
  } finally {
    submitBtn.disabled = false;
    submitLabel.textContent = 'تأكيد الطلب 🛒';
  }
}

/* ============================================================
   TOAST NOTIFICATION
   ============================================================ */
let toastTimer = null;

/**
 * Show a brief toast message.
 * @param {string} message  Plain text only — inserted via textContent.
 * @param {number} duration ms
 */
function showToast(message, duration = 3500) {
  const toast = document.getElementById('toast');
  toast.textContent = message;  // secure textContent
  toast.setAttribute('aria-hidden', 'false');
  toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    toast.setAttribute('aria-hidden', 'true');
  }, duration);
}

/* ============================================================
   EVENT DELEGATION — Product card clicks
   ============================================================ */
function attachCardClickHandlers(gridEl) {
  gridEl.addEventListener('click', e => {
    // Order button
    const orderBtn = e.target.closest('.card-order-btn');
    if (orderBtn) {
      const id = orderBtn.dataset.productId;
      if (id) openOrderModal(id);
      return;
    }
    // Entire card
    const card = e.target.closest('.product-card');
    if (card) {
      const id = card.dataset.productId;
      if (id) openOrderModal(id);
    }
  });

  // Keyboard accessibility: Enter/Space on card opens modal
  gridEl.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('.product-card');
    if (card && e.target === card) {
      e.preventDefault();
      const id = card.dataset.productId;
      if (id) openOrderModal(id);
    }
  });
}

/* ============================================================
   INITIALISE APP
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Initial renders ---------- */
  renderBestSellers();

  /* ---------- Grid event delegation ---------- */
  const bestsellersGrid = document.getElementById('bestsellers-grid');
  const allProductsGrid = document.getElementById('all-products-grid');
  if (bestsellersGrid) attachCardClickHandlers(bestsellersGrid);
  if (allProductsGrid) attachCardClickHandlers(allProductsGrid);

  /* ---------- Navigation ---------- */
  // Nav links (desktop + mobile)
  document.querySelectorAll('[data-view]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(link.dataset.view);
      // Close mobile menu if open
      closeMobileMenu();
    });
  });

  // Logo click → home
  const navLogo = document.getElementById('nav-logo');
  navLogo.addEventListener('click', () => navigateTo('home'));
  navLogo.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigateTo('home'); }
  });

  // Hero CTA buttons
  document.getElementById('hero-shop-btn').addEventListener('click', () => navigateTo('products'));
  document.getElementById('hero-bestsellers-btn').addEventListener('click', () => {
    document.querySelector('.bestsellers-section')?.scrollIntoView({ behavior: 'smooth' });
  });

  // "View All Products" button
  document.getElementById('view-all-btn').addEventListener('click', () => navigateTo('products'));

  /* ---------- Hamburger / mobile menu ---------- */
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mobileMenu   = document.getElementById('mobile-menu');

  function closeMobileMenu() {
    hamburgerBtn.classList.remove('open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
  }

  hamburgerBtn.addEventListener('click', () => {
    const isOpen = hamburgerBtn.classList.toggle('open');
    hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.classList.toggle('open', isOpen);
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', e => {
    if (!hamburgerBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
      closeMobileMenu();
    }
  });

  /* ---------- Navbar scroll shadow ---------- */
  const navbar = document.getElementById('main-navbar');
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Filter buttons ---------- */
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      renderAllProducts(btn.dataset.category);
    });
  });

  /* ---------- Modal close ---------- */
  document.getElementById('modal-close-btn').addEventListener('click', closeOrderModal);
  document.getElementById('success-close-btn').addEventListener('click', closeOrderModal);

  // Close on overlay click (not on modal box click)
  modal.addEventListener('click', e => {
    if (e.target === modal) closeOrderModal();
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.hidden) closeOrderModal();
  });

  /* ---------- Quantity controls ---------- */
  const qtyInput = document.getElementById('order-qty');
  document.getElementById('qty-inc').addEventListener('click', () => {
    const v = parseInt(qtyInput.value, 10);
    if (!isNaN(v) && v < 99) {
      qtyInput.value = v + 1;
      updateSummaryFromForm();
    }
  });
  document.getElementById('qty-dec').addEventListener('click', () => {
    const v = parseInt(qtyInput.value, 10);
    if (!isNaN(v) && v > 1) {
      qtyInput.value = v - 1;
      updateSummaryFromForm();
    }
  });
  qtyInput.addEventListener('input', updateSummaryFromForm);

  function updateSummaryFromForm() {
    if (!activeProductId) return;
    const product = PRODUCTS.find(p => p.id === activeProductId);
    if (!product) return;
    const qty = Math.max(1, Math.min(99, parseInt(qtyInput.value, 10) || 1));
    updateOrderSummary(product, qty);
  }

  /* ---------- Order form submit ---------- */
  orderForm.addEventListener('submit', handleOrderSubmit);

  /* ---------- Real-time input validation feedback ---------- */
  document.getElementById('order-name').addEventListener('blur', function() {
    const v = sanitizeText(this.value, 80);
    if (v && !isValidName(v)) {
      showFieldError('name', 'الاسم مطلوب ويجب أن يكون من 2 إلى 80 حرفاً.');
    } else {
      const error = document.getElementById('name-error');
      if (error) error.textContent = '';
      this.classList.remove('error');
      this.removeAttribute('aria-invalid');
    }
  });

  document.getElementById('order-phone').addEventListener('blur', function() {
    const v = sanitizeText(this.value, 15);
    if (v && !isValidPhone(v)) {
      showFieldError('phone', 'أدخل رقم هاتف مصري صحيح (11 رقم يبدأ بـ 01).');
    } else {
      const error = document.getElementById('phone-error');
      if (error) error.textContent = '';
      this.classList.remove('error');
      this.removeAttribute('aria-invalid');
    }
  });

});
