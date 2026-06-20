/* =========================================
   KAIIN — X8-inspired Motion Theme JS
   ========================================= */
'use strict';

/* ─── Scroll Reveal ─────────────────────────────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

function initReveal() {
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .clip-reveal, .showcase__media--slide-left, .showcase__media--slide-right, .showcase__content--slide-left, .showcase__content--slide-right')
    .forEach(el => revealObserver.observe(el));
}
initReveal();
document.addEventListener('shopify:section:load', initReveal);

/* Hero entrance */
const hero = document.querySelector('.hero');
if (hero) requestAnimationFrame(() => hero.classList.add('is-visible'));

/* ─── Header solid-on-scroll ────────────────────────────────────────────── */
const header = document.querySelector('.site-header');
if (header) {
  const onScroll = () => header.classList.toggle('site-header--solid', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ─── Fullscreen Menu Overlay ───────────────────────────────────────────── */
const menuOverlay = document.querySelector('.menu-overlay');
const menuTriggers = document.querySelectorAll('[data-menu-open]');
const menuClose = document.querySelector('[data-menu-close]');

function openMenu() {
  menuOverlay?.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}
function closeMenu() {
  menuOverlay?.classList.remove('is-open');
  document.body.style.overflow = '';
}
menuTriggers.forEach(t => t.addEventListener('click', openMenu));
menuClose?.addEventListener('click', closeMenu);
menuOverlay?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

/* ─── Custom Cursor ─────────────────────────────────────────────────────── */
if (window.matchMedia('(pointer: fine)').matches) {
  const dot = document.querySelector('.cursor__dot');
  const circle = document.querySelector('.cursor__circle');
  if (dot && circle) {
    let mx = 0, my = 0, cx = 0, cy = 0;
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    });
    (function loop() {
      cx += (mx - cx) * 0.14; cy += (my - cy) * 0.14;
      circle.style.left = cx + 'px'; circle.style.top = cy + 'px';
      requestAnimationFrame(loop);
    })();
  }
}

/* ─── Magnetic buttons ──────────────────────────────────────────────────── */
if (window.matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll('[data-magnetic]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

/* ─── Hero video play toggle ────────────────────────────────────────────── */
const heroPlay = document.querySelector('.hero__play');
if (heroPlay) {
  const video = document.querySelector('.hero__media video');
  heroPlay.addEventListener('click', () => {
    if (!video) return;
    if (video.paused) { video.play(); heroPlay.style.opacity = '0'; heroPlay.style.pointerEvents = 'none'; }
  });
}

/* ─── Parallax media ────────────────────────────────────────────────────── */
const parallaxEls = document.querySelectorAll('[data-parallax]');
if (parallaxEls.length) {
  window.addEventListener('scroll', () => {
    parallaxEls.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.15;
      const rect = el.getBoundingClientRect();
      const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed;
      el.style.transform = `translateY(${-offset}px) scale(1.12)`;
    });
  }, { passive: true });
}

/* Hero scale parallax */
const heroMedia = document.querySelector('.hero__media img, .hero__media video');
if (heroMedia) {
  window.addEventListener('scroll', () => {
    const s = window.scrollY;
    if (s < window.innerHeight) heroMedia.style.transform = `scale(1.08) translateY(${s * 0.2}px)`;
  }, { passive: true });
}

/* ─── Cart Drawer (separate backdrop — fixes overlay conflict) ──────────── */
class CartDrawer {
  constructor() {
    this.drawer = document.querySelector('.cart-drawer');
    this.backdrop = document.querySelector('.cart-backdrop');
    this.cartCounts = document.querySelectorAll('.cart-count');

    document.querySelectorAll('[data-cart-open]').forEach(b => b.addEventListener('click', () => this.open()));
    document.querySelector('.cart-drawer__close')?.addEventListener('click', () => this.close());
    this.backdrop?.addEventListener('click', () => this.close());
    this.bindQty();
  }
  bindQty() {
    this.drawer?.querySelectorAll('.cart-item__qty button').forEach(b =>
      b.addEventListener('click', e => this.updateQty(e.currentTarget)));
  }
  open() { this.drawer?.classList.add('is-open'); this.backdrop?.classList.add('active'); document.body.style.overflow = 'hidden'; }
  close() { this.drawer?.classList.remove('is-open'); this.backdrop?.classList.remove('active'); document.body.style.overflow = ''; }
  async updateQty(btn) {
    const item = btn.closest('.cart-item');
    const key = item?.dataset.key;
    const qtyEl = item?.querySelector('.cart-item__qty span');
    if (!key || !qtyEl) return;
    const delta = btn.dataset.action === 'increase' ? 1 : -1;
    const newQty = Math.max(0, parseInt(qtyEl.textContent) + delta);
    try {
      const res = await fetch('/cart/change.js', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: key, quantity: newQty })
      });
      const cart = await res.json();
      if (newQty === 0) item.remove(); else qtyEl.textContent = newQty;
      this.refresh(cart);
    } catch (e) { console.error(e); }
  }
  refresh(cart) {
    this.cartCounts.forEach(el => { el.textContent = cart.item_count; });
    const sub = document.querySelector('.cart-subtotal__price');
    if (sub && window.Shopify) sub.textContent = formatMoney(cart.total_price);
  }
}
const cartDrawer = new CartDrawer();

function formatMoney(cents) {
  return (cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ─── Quick Add (from product cards) ────────────────────────────────────── */
document.querySelectorAll('[data-quick-add]').forEach(btn => {
  btn.addEventListener('click', async e => {
    e.preventDefault();
    const id = btn.dataset.variantId;
    if (!id) { window.location.href = btn.dataset.url || '#'; return; }
    const original = btn.textContent;
    btn.textContent = 'Adding…';
    try {
      await fetch('/cart/add.js', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, quantity: 1 })
      });
      const cart = await (await fetch('/cart.js')).json();
      cartDrawer.refresh(cart);
      cartDrawer.open();
      btn.textContent = original;
    } catch (err) { btn.textContent = 'Try Again'; setTimeout(() => btn.textContent = original, 1500); }
  });
});

/* ─── Product Gallery ───────────────────────────────────────────────────── */
document.querySelectorAll('.product-gallery').forEach(gal => {
  const main = gal.querySelector('.product-gallery__main img');
  gal.querySelectorAll('.product-gallery__thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      gal.querySelectorAll('.product-gallery__thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      const src = thumb.querySelector('img')?.dataset.full || thumb.querySelector('img')?.src;
      if (src && main) { main.style.opacity = '0'; setTimeout(() => { main.src = src; main.style.opacity = '1'; }, 180); }
    });
  });
});

/* ─── Variant Selector ──────────────────────────────────────────────────── */
document.querySelectorAll('[data-product-form]').forEach(form => {
  const variants = JSON.parse(form.dataset.variants || '[]');
  const idInput = form.querySelector('[name="id"]');
  const priceEl = form.querySelector('.product-info__price--current');
  const atcBtn = form.querySelector('.btn-add-to-cart');
  const selected = {};

  form.querySelectorAll('[data-option-btn]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('unavailable')) return;
      const group = btn.dataset.optionPosition;
      form.querySelectorAll(`[data-option-position="${group}"]`).forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selected[group] = btn.dataset.value;
      const colorLabel = form.querySelector(`[data-color-value]`);
      if (colorLabel && btn.dataset.isColor) colorLabel.textContent = btn.dataset.value;
      updateVariant();
    });
  });

  function updateVariant() {
    const positions = Object.keys(selected);
    const match = variants.find(v => positions.every(p => v.options[p - 1] === selected[p]));
    if (!match) return;
    if (idInput) idInput.value = match.id;
    if (priceEl) priceEl.textContent = formatMoney(match.price);
    if (atcBtn) {
      atcBtn.disabled = !match.available;
      const span = atcBtn.querySelector('span');
      if (span) span.textContent = match.available ? 'Add to Cart' : 'Sold Out';
    }
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (atcBtn?.disabled) return;
    const id = idInput?.value;
    if (!id) return;
    const span = atcBtn?.querySelector('span');
    const prev = span?.textContent;
    if (span) span.textContent = 'Adding…';
    atcBtn.disabled = true;
    try {
      await fetch('/cart/add.js', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, quantity: 1 })
      });
      const cart = await (await fetch('/cart.js')).json();
      cartDrawer.refresh(cart);
      cartDrawer.open();
      if (span) span.textContent = prev;
      atcBtn.disabled = false;
    } catch (err) {
      if (span) span.textContent = 'Error';
      atcBtn.disabled = false;
    }
  });
});

/* ─── Accordion ─────────────────────────────────────────────────────────── */
document.querySelectorAll('.accordion-trigger').forEach(trigger => {
  trigger.addEventListener('click', () => {
    const item = trigger.closest('.accordion-item');
    const content = item.querySelector('.accordion-content');
    const inner = item.querySelector('.accordion-content__inner');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.accordion-item.open').forEach(o => {
      o.classList.remove('open');
      o.querySelector('.accordion-content').style.height = '0';
    });
    if (!isOpen) { item.classList.add('open'); content.style.height = inner.scrollHeight + 'px'; }
  });
});

/* ─── Page Transitions ──────────────────────────────────────────────────── */
const transition = document.querySelector('.page-transition');
if (transition) {
  transition.classList.remove('active');
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('tel') ||
        link.target === '_blank' || link.hasAttribute('download') ||
        link.hasAttribute('data-cart-open') || link.hasAttribute('data-menu-open') ||
        (!href.startsWith('/') && !href.startsWith(window.location.origin))) return;
    link.addEventListener('click', e => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      transition.classList.add('active');
      setTimeout(() => { window.location.href = href; }, 380);
    });
  });
  window.addEventListener('pageshow', () => transition.classList.remove('active'));
}
