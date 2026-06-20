# Amara — Shopify Theme

A soft, editorial beauty/lifestyle theme for Shopify. Online Store 2.0, fully
customizable from the theme editor, motion-rich, and mobile-first.

---

## Highlights

- **Online Store 2.0** — JSON templates, sections everywhere, drag-and-drop blocks.
- **Fully customizable** — colors, fonts, type spacing, layout width, corner radius,
  and motion toggles, all in **Theme settings**. No code required.
- **Adapts to existing stores** — menus, products, collections, cart, and customer
  data render automatically with graceful fallbacks.
- **Motion** — scroll reveals, marquee, hover image-swaps, parallax, page transitions,
  optional custom cursor. All respect each visitor's *reduce motion* setting.
- **Mobile-first** — responsive grids, touch-safe interactions, lazy `srcset` images.
- **Translations** — merchant- and customer-facing strings use locale files (`locales/`).

---

## Installation

### Option A — Upload the zip
1. Download `amara-theme.zip` (or zip the repo contents so the folders
   `assets/ config/ layout/ locales/ sections/ snippets/ templates/` are at the
   **root** of the zip).
2. In Shopify admin: **Online Store → Themes → Add theme → Upload zip file**.
3. Click **Customize** to configure.

### Option B — Shopify CLI (development)
```bash
shopify theme dev     # live local preview against your store
shopify theme push    # upload as an unpublished theme
```

### Option C — GitHub integration
**Online Store → Themes → Add theme → Connect from GitHub**, then pick this repo
and branch. (Theme files must be at the repository root — they are.)

---

## First-time setup

1. **Theme settings** (left sidebar gear): set your **Colors**, **Typography**
   (heading + body fonts), **Layout**, and **Motion** preferences.
2. **Header** section: choose your **menu** (`Main menu`), upload a **logo**, set the
   announcement bar, and add Instagram/TikTok links.
3. **Homepage**: the demo uses placeholder copy and auto-pulls your products. Edit each
   section's text and images, and point the **Featured** section at a collection.
4. **Footer**: set menus, tagline, and social links.
5. **Product pages**: edit the accordion blocks (Shipping, Details, How to use).
6. **Pages**: create an **About** page and assign the `page.about` template; create a
   **Blog** to use the blog/article templates.

---

## Sections included

| Section | Use |
|---|---|
| Hero Banner | Full-screen image/video hero with eyebrow, headline, CTA |
| Marquee Ticker | Scrolling text ticker |
| Featured Collection | Product grid (auto-falls back to all products) |
| Product Showcase | Alternating large product features |
| Collection Rows | Horizontal-scroll rows per collection |
| Split Section | Image + text, reversible |
| Feature Columns | 2–4 benefit columns with images |
| Image Gallery | Lifestyle grid, configurable columns/ratio |
| Editorial Text | Two-column editorial statement |
| Statement | Closing CTA + wordmark |
| About / Story | Chaptered brand story page |

## Templates included

Home, product, collection, list-collections, page, page.about, blog, article,
cart, search, password, gift card, 404, and customer account pages (login,
register, account, order, addresses, reset/activate password).

---

## Customizing fonts

Heading and body fonts use Shopify's font picker (**Theme settings → Typography**).
Any font from Shopify's library works; the theme falls back to a serif/sans stack if
a font can't load.

## Accessibility & performance

- All motion respects `prefers-reduced-motion`.
- Images are lazy-loaded with responsive `srcset`.
- Color/contrast is controlled by your theme settings — keep text and background
  sufficiently contrasted for AA compliance.

---

## Support

Replace this section with your support contact / documentation URL before selling.

## License

See `LICENSE.md`.
