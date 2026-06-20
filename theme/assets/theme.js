/* =========================================
   KAIIN Theme — Main JavaScript
   ========================================= */

'use strict';

// ─── Scroll Reveal ───────────────────────────────────────────────────────────
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
);

const initReveal = () => {
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
    revealObserver.observe(el);
  });
};

// Run now and also after any dynamic content loads
initReveal();
document.addEventListener('shopify:section:load', initReveal);

// Hero entrance on load
const hero = document.querySelector('.hero');
if (hero) {
  requestAnimationFrame(() => hero.classList.add('is-visible'));
}

// ─── Header Behavior ─────────────────────────────────────────────────────────
const header = document.querySelector('.site-header');
if (header) {
  const heroEl = document.querySelector('.hero');
  let lastScroll = 0;

  const updateHeader = () => {
    const scrollY = window.scrollY;
    const heroHeight = heroEl ? heroEl.offsetHeight : 0;

    if (scrollY > 20) {
      header.classList.remove('site-header--transparent');
      header.classList.add('site-header--solid');
    } else {
      if (heroEl) {
        header.classList.add('site-header--transparent');
        header.classList.remove('site-header--solid');
      }
    }

    // Light text over hero
    if (heroEl && scrollY < heroHeight - 100) {
      header.classList.add('site-header--light');
    } else {
      header.classList.remove('site-header--light');
    }

    lastScroll = scrollY;
  };

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();
}

// ─── Mobile Menu ─────────────────────────────────────────────────────────────
const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');

if (menuToggle && mobileNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('is-open');
    document.body.style.overflow = isOpen ? 'hidden' : '';
    menuToggle.setAttribute('aria-expanded', isOpen);
  });

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  });
}

// ─── Custom Cursor ───────────────────────────────────────────────────────────
if (window.matchMedia('(pointer: fine)').matches) {
  const cursorDot = document.querySelector('.cursor__dot');
  const cursorCircle = document.querySelector('.cursor__circle');

  if (cursorDot && cursorCircle) {
    let mouseX = 0, mouseY = 0;
    let circleX = 0, circleY = 0;

    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top = mouseY + 'px';
    });

    const animateCursor = () => {
      circleX += (mouseX - circleX) * 0.12;
      circleY += (mouseY - circleY) * 0.12;
      cursorCircle.style.left = circleX + 'px';
      cursorCircle.style.top = circleY + 'px';
      requestAnimationFrame(animateCursor);
    };
    animateCursor();
  }
}

// ─── Cart Drawer ─────────────────────────────────────────────────────────────
class CartDrawer {
  constructor() {
    this.drawer = document.querySelector('.cart-drawer');
    this.overlay = document.querySelector('.page-overlay');
    this.cartCount = document.querySelectorAll('.cart-count');

    document.querySelectorAll('[data-cart-open]').forEach(btn => {
      btn.addEventListener('click', () => this.open());
    });

    document.querySelector('.cart-drawer__close')?.addEventListener('click', () => this.close());
    this.overlay?.addEventListener('click', () => this.close());

    this.drawer?.querySelectorAll('.cart-item__qty button').forEach(btn => {
      btn.addEventListener('click', e => this.updateQty(e.currentTarget));
    });
  }

  open() {
    this.drawer?.classList.add('is-open');
    this.overlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.drawer?.classList.remove('is-open');
    this.overlay?.classList.remove('active');
    document.body.style.overflow = '';
  }

  async updateQty(btn) {
    const item = btn.closest('.cart-item');
    const key = item?.dataset.key;
    const qtyEl = item?.querySelector('.cart-item__qty span');
    if (!key || !qtyEl) return;

    const delta = btn.dataset.action === 'increase' ? 1 : -1;
    const newQty = Math.max(0, parseInt(qtyEl.textContent) + delta);

    try {
      const res = await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: key, quantity: newQty })
      });
      const cart = await res.json();
      if (newQty === 0) {
        item.remove();
      } else {
        qtyEl.textContent = newQty;
      }
      this.updateCount(cart.item_count);
      this.updateSubtotal(cart.total_price);
    } catch (e) {
      console.error('Cart update failed', e);
    }
  }

  updateCount(count) {
    this.cartCount.forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  updateSubtotal(price) {
    const el = document.querySelector('.cart-subtotal__price');
    if (el) el.textContent = (price / 100).toFixed(2);
  }
}

new CartDrawer();

// ─── Product Gallery ──────────────────────────────────────────────────────────
class ProductGallery {
  constructor(el) {
    this.el = el;
    this.mainImg = el.querySelector('.product-gallery__main img');
    this.thumbs = el.querySelectorAll('.product-gallery__thumb');

    this.thumbs.forEach((thumb, i) => {
      thumb.addEventListener('click', () => this.setActive(thumb, i));
    });
  }

  setActive(thumb, index) {
    this.thumbs.forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
    const src = thumb.querySelector('img')?.src;
    if (src && this.mainImg) {
      this.mainImg.style.opacity = '0';
      setTimeout(() => {
        this.mainImg.src = src;
        this.mainImg.style.opacity = '1';
      }, 200);
    }
  }
}

document.querySelectorAll('.product-gallery').forEach(el => new ProductGallery(el));

// ─── Product Variant Selector ─────────────────────────────────────────────────
class VariantSelector {
  constructor(form) {
    this.form = form;
    this.sizeBtns = form.querySelectorAll('.size-btn');
    this.colorBtns = form.querySelectorAll('.color-btn');
    this.addToCartBtn = form.querySelector('.btn-add-to-cart');
    this.priceEl = form.querySelector('.product-info__price--current');
    this.variants = JSON.parse(form.dataset.variants || '[]');

    this.selected = {};

    this.sizeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('unavailable')) return;
        this.sizeBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selected.size = btn.dataset.value;
        this.updateVariant();
      });
    });

    this.colorBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.colorBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selected.color = btn.dataset.value;
        this.updateVariant();
      });
    });
  }

  updateVariant() {
    const match = this.variants.find(v =>
      Object.entries(this.selected).every(([k, val]) =>
        v.options.some(o => o === val)
      )
    );

    if (match) {
      if (this.addToCartBtn) {
        this.addToCartBtn.disabled = !match.available;
        this.addToCartBtn.querySelector('span').textContent = match.available
          ? 'Add to Cart'
          : 'Sold Out';
        this.form.querySelector('[name="id"]').value = match.id;
      }
      if (this.priceEl) {
        this.priceEl.textContent = (match.price / 100).toFixed(2);
      }
    }
  }
}

document.querySelectorAll('[data-product-form]').forEach(form => new VariantSelector(form));

// ─── Add to Cart ──────────────────────────────────────────────────────────────
document.querySelectorAll('[data-product-form]').forEach(form => {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('.btn-add-to-cart');
    const span = btn?.querySelector('span');
    const id = form.querySelector('[name="id"]')?.value;

    if (!id || btn?.disabled) return;

    btn.disabled = true;
    if (span) span.textContent = 'Adding…';

    try {
      await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, quantity: 1 })
      });

      if (span) span.textContent = 'Added!';
      setTimeout(() => {
        if (span) span.textContent = 'Add to Cart';
        btn.disabled = false;
      }, 1500);

      // Open cart drawer
      document.querySelector('.cart-drawer')?.classList.add('is-open');
      document.querySelector('.page-overlay')?.classList.add('active');
      document.body.style.overflow = 'hidden';

      // Refresh cart count
      const cartRes = await fetch('/cart.js');
      const cart = await cartRes.json();
      document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = cart.item_count;
        el.style.display = cart.item_count > 0 ? 'flex' : 'none';
      });

    } catch (err) {
      if (span) span.textContent = 'Error — Try Again';
      btn.disabled = false;
    }
  });
});

// ─── Accordion ────────────────────────────────────────────────────────────────
document.querySelectorAll('.accordion-trigger').forEach(trigger => {
  trigger.addEventListener('click', () => {
    const item = trigger.closest('.accordion-item');
    const content = item.querySelector('.accordion-content');
    const inner = item.querySelector('.accordion-content__inner');
    const isOpen = item.classList.contains('open');

    // Close all
    document.querySelectorAll('.accordion-item.open').forEach(openItem => {
      openItem.classList.remove('open');
      openItem.querySelector('.accordion-content').style.height = '0';
    });

    if (!isOpen) {
      item.classList.add('open');
      content.style.height = inner.scrollHeight + 'px';
    }
  });
});

// ─── Page Transitions ─────────────────────────────────────────────────────────
const overlay = document.querySelector('.page-overlay');

// Fade in immediately on page load
if (overlay) {
  overlay.style.opacity = '0';
  overlay.style.pointerEvents = 'none';
  overlay.style.transition = 'opacity 0.35s ease';
}

document.querySelectorAll('a[href]').forEach(link => {
  const href = link.getAttribute('href');
  if (
    !href ||
    href.startsWith('#') ||
    href.startsWith('mailto') ||
    href.startsWith('tel') ||
    link.target === '_blank' ||
    link.hasAttribute('download') ||
    (!href.startsWith('/') && !href.startsWith(window.location.origin))
  ) return;

  link.addEventListener('click', e => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    if (overlay) {
      overlay.style.opacity = '1';
      overlay.style.pointerEvents = 'all';
    }
    setTimeout(() => { window.location.href = href; }, 320);
  });
});

// ─── Parallax on Hero ─────────────────────────────────────────────────────────
const heroMedia = document.querySelector('.hero__media img, .hero__media video');
if (heroMedia) {
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    heroMedia.style.transform = `scale(1.05) translateY(${scrolled * 0.25}px)`;
  }, { passive: true });
}
