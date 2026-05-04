# 🚁 DroneForge — Full Agent Build Prompt

---

## Project Overview

Build **DroneForge** — a dynamic, visually explosive web application where users can **simulate building custom drones part by part** (like PC Part Picker, but for drones) and **purchase them**. The site should feel like a fusion between a sci-fi arcade and a modern e-commerce platform — dark backgrounds, neon accents, floating 3D-ish drone parts, particle effects, animated transitions, and satisfying micro-interactions everywhere.

**Tech Stack:** Node.js + Express backend, MongoDB + Mongoose, EJS or React frontend (your choice), bcrypt for auth, express-session or JWT, Multer for images, Tailwind or custom CSS with heavy animations.

**Aesthetic Direction:** Dark theme (near-black backgrounds), electric cyan/neon yellow accents, glitchy hover effects, animated SVG drone parts, staggered reveal animations on scroll, custom cursor, particle/starfield background on hero. Think cyberpunk meets engineering workshop. Use a bold display font (e.g. **Orbitron** or **Exo 2** from Google Fonts) paired with a clean body font (e.g. **Sora** or **DM Sans**). Every section should feel alive — counters, sliders, animated cards, floating elements.

---

## Rubric Coverage Map

| Rubric Criterion | Covered In |
|---|---|
| Core features, forms, buttons | All modules |
| Login/Signup end-to-end | Module 1 |
| Database CRUD / API integration | Modules 1, 2, 3 |
| Password hashing (bcrypt) | Module 1 |
| No plaintext passwords stored | Module 1 |
| Secure hash comparison | Module 1 |
| Password reset (token + time-limited) | Module 1 |
| Admin & User roles in DB | Module 1 |
| Admin dashboard, 403 for users | Module 4 |
| Admin user management | Module 4 |
| Dynamic nav by role | Modules 1, 4 |
| Backend route middleware/guards | Modules 1, 4 |
| Client-side validation | Modules 2, 3 |
| Server-side validation + sanitization | Modules 2, 3 |
| Inline error messages | Modules 2, 3 |
| Working navbar, no broken links | Module 1 |
| Logical page hierarchy | Module 1 |
| Sticky/responsive navbar, dropdowns | Module 1 |
| Clean consistent layout | All modules |
| Responsive design | All modules |
| Login/logout + session/cookie | Module 1 |
| Session expiry | Module 1 |
| GitHub repo + 10+ meaningful commits | Every module push |
| Consistent commit message convention | Every module push |
| Footer on all pages | Module 1 |
| Original content | Modules 2, 5 |
| Images/icons/multimedia | Modules 2, 5 |
| Unique project concept | Whole project |
| Visual design quality | Modules 1, 5 |
| Animations & micro-interactions | Modules 1, 2, 3, 5 |
| Creative impression | Module 5 |
| Performance & asset optimization | Module 6 |
| README + setup documentation | Module 6 |
| Live demo / recorded walkthrough | Module 6 |

---

## MODULE 1 — Foundation: Auth, Roles & Layout Shell

**Git commit prefix:** `feat: module-1`

### What to Build

1. **Initialize project** — Node/Express, connect MongoDB, set up folder structure:
   ```
   /routes
   /models
   /controllers
   /middleware
   /views (or /client)
   /public
   ```

2. **User Model** with fields:
   - `name`, `email`, `passwordHash`
   - `role` — enum: `'admin'` | `'user'`
   - `isActive` — boolean
   - `resetToken`, `resetTokenExpiry`
   - `createdAt`

3. **Auth System:**
   - `POST /auth/register` — validate inputs server-side (express-validator), hash password with `bcrypt` (salt rounds ≥ 12), store user, start session
   - `POST /auth/login` — find user by email, use `bcrypt.compare()` (never string equality), set session, redirect by role
   - `GET /auth/logout` — destroy session, redirect to home
   - **Password reset flow:**
     - `POST /auth/forgot-password` — generates cryptographically random token (`crypto.randomBytes`), stores hashed token + 15-minute expiry on user doc, sends email via Nodemailer + Mailtrap (dev)
     - `POST /auth/reset-password/:token` — validates token freshness, hashes new password, clears token fields

4. **Session Config** (`express-session`):
   - `httpOnly: true`, `secure: true` (production)
   - `maxAge`: 30 minutes inactivity
   - `resave: false`, `saveUninitialized: false`

5. **Role Middleware:**
   - `requireAuth` — redirects unauthenticated users to `/auth/login`
   - `requireAdmin` — returns styled 403 page for non-admin users
   - Attach to all protected routes

6. **Global Layout Shell:**
   - Sticky navbar reading session role:
     - **Guest:** Login, Register
     - **User:** Dashboard, Build a Drone, My Orders, Logout
     - **Admin:** All user links + Admin Panel
   - Dropdown menus with smooth CSS transition animation
   - Mobile hamburger menu, fully responsive (CSS Grid/Flexbox)
   - Footer on every page: drone logo, nav links, social icons (GitHub, Twitter, Instagram), copyright notice

7. **Pages to scaffold** (placeholder content OK for now):
   - Home, Login, Register, Forgot Password, Reset Password, 404, 403

8. **Navbar animation:** slide-in on page load, underline hover effects, role badge next to username

### Commits to push
```
feat: init project structure and mongodb connection
feat: user model with roles and password reset fields
feat: register and login with bcrypt hashing
feat: session management and auth middleware
feat: password reset token flow with nodemailer
feat: global navbar with role-based links and footer
feat: 403 and 404 error pages
```

---

## MODULE 2 — Drone Parts Catalog & Builder UI

**Git commit prefix:** `feat: module-2`

### What to Build

1. **Part Model** (MongoDB) with fields:
   - `name`, `category` (enum: `frame` | `motors` | `propellers` | `battery` | `flightController` | `camera` | `ESC` | `transmitter`)
   - `price`, `weight`, `description`, `imageUrl`
   - `specs` (object — flexible key/value pairs per category)
   - `stock`, `isAvailable`

2. **Seed Script** — populate DB with at least 5 parts per category (realistic names, prices, specs). Include a mix of budget and premium tiers.

3. **Parts Catalog Page** (`/parts`):
   - Animated filter sidebar: filter by category, price range (slider), weight
   - Part cards with: image, name, category badge, price, "Add to Build" button
   - Hover effect: card lifts with neon glow, shows quick-spec popup
   - Search bar with live filtering (no page reload — vanilla JS or React state)
   - Client-side validation: search input sanitized, price range enforced

4. **Drone Builder Page** (`/build`) — the centerpiece feature:
   - Visual drone schematic in the center (SVG or CSS illustration) with labeled slots: Frame, Motors (x4), Propellers, Battery, Flight Controller, Camera, ESC, Transmitter
   - Each slot is clickable — opens a modal/panel showing compatible parts for that slot
   - When a part is selected, it snaps into the slot with a satisfying animation; the drone SVG updates visually (color/glow changes per selected parts)
   - Right sidebar: live **Build Summary** — list of selected parts, running total price, total weight, estimated flight time (simple formula: `battery_mAh / (motors_count * avg_draw)`), and a compatibility indicator (green/yellow/red)
   - "Reset Build" button with shake animation confirmation
   - **Validation:** warn if incompatible parts selected (e.g., frame too small for motor size), shown as inline alert banners
   - Build saved to `localStorage` so it persists on refresh

5. **Animations:**
   - Staggered card entrance on catalog load
   - Slot pulse animation when empty, glow when filled
   - Smooth modal slide-in
   - Counter animation on price total

### Commits to push
```
feat: part model and seed script with all categories
feat: parts catalog page with filter and search
feat: animated part cards with hover effects
feat: drone builder page with SVG schematic
feat: slot selection modal and live build summary
feat: compatibility validation and inline error messages
feat: localstorage build persistence and reset flow
```

---

## MODULE 3 — Cart, Checkout & Orders

**Git commit prefix:** `feat: module-3`

### What to Build

1. **Order Model** (MongoDB):
   - `userId`, `parts` (array of `{partId, quantity, priceAtOrder}`)
   - `totalPrice`, `status` (enum: `'pending'` | `'confirmed'` | `'shipped'` | `'delivered'` | `'cancelled'`)
   - `shippingAddress`, `createdAt`
   - `buildName` (user can name their custom drone)

2. **Cart System:**
   - "Save & Order Build" button on Builder page sends current build to cart
   - Cart page (`/cart`): itemized list of parts, quantity controls (+/-), remove button, order summary panel
   - Cart stored in session (server-side) so it survives page navigation
   - Animated cart icon in navbar with item count badge

3. **Checkout Flow** (`/checkout`):
   - Multi-step form (3 steps with animated progress bar):
     - **Step 1:** Build review + drone name input
     - **Step 2:** Shipping address form
     - **Step 3:** Fake payment form (card UI, no real processing) + order confirmation
   - **Client-side validation** on every step: required fields, email format, card number format (Luhn-style visual only), zip code pattern
   - **Server-side validation** (express-validator): sanitize all inputs, verify parts still in stock, recalculate total server-side (never trust client price)
   - Inline error messages per field, highlighted in red with icon
   - On success: create Order doc in DB, clear cart, redirect to `/orders/confirmation/:id`

4. **Order Confirmation Page:**
   - Animated success state (drone flying across screen)
   - Order summary card with order ID, parts list, total, estimated delivery

5. **My Orders Page** (`/orders`):
   - List of all user orders, sorted newest first
   - Status badge with color coding
   - "View Details" expands inline accordion with full part list

6. **Stock management:** decrement `stock` on order confirmation; show "Out of Stock" on part cards when `stock === 0`

### Commits to push
```
feat: order model with status tracking
feat: session-based cart with quantity controls
feat: multi-step checkout form with progress bar
feat: client and server side validation on checkout
feat: order confirmation page with animation
feat: my orders page with status badges
feat: stock management on order completion
```

---

## MODULE 4 — Admin Dashboard & User Management

**Git commit prefix:** `feat: module-4`

### What to Build

1. **Admin Guard:** all `/admin/*` routes wrapped in `requireAdmin` middleware — non-admins get the styled 403 page with a "You shall not pass" drone animation

2. **Admin Dashboard** (`/admin`):
   - Stats overview cards (animated counters on load):
     - Total users, total orders, total revenue, parts low on stock
   - Recent orders table (last 10)
   - Quick-action buttons: Add Part, View All Users, View All Orders

3. **User Management** (`/admin/users`):
   - Paginated table: name, email, role, status (active/inactive), joined date, action buttons
   - **Activate / Deactivate** toggle (PATCH `/admin/users/:id/toggle-status`) — inactive users cannot log in (check in login route)
   - **Change Role** dropdown (user ↔ admin) with confirmation modal
   - Search/filter by name or email

4. **Parts Management** (`/admin/parts`):
   - Full CRUD for drone parts
   - Add Part form: all fields + image upload (Multer, store locally or use Cloudinary)
   - Edit Part: pre-filled form, image preview
   - Delete Part: confirmation modal with animated warning
   - Server-side validation on all part forms
   - Inline error messages

5. **Order Management** (`/admin/orders`):
   - All orders with filter by status
   - Update order status via dropdown (PATCH `/admin/orders/:id/status`)
   - View full order details modal

6. **Frontend navigation changes by role:**
   - Admin sees "Admin Panel" in navbar with a special glowing badge
   - Regular user never sees admin links (enforced both client and server side)
   - Breadcrumbs on all admin pages

### Commits to push
```
feat: admin route guard middleware and 403 page
feat: admin dashboard with animated stat cards
feat: user management table with activate and role controls
feat: parts CRUD with image upload
feat: order management with status updates
feat: breadcrumbs and role-based nav rendering
```

---

## MODULE 5 — UI Polish, Content & Creative Pages

**Git commit prefix:** `feat: module-5`

### What to Build

1. **Home Page** (full creative treatment):
   - **Hero section:** fullscreen dark background with animated particle/starfield canvas, large headline ("BUILD YOUR BEAST"), animated drone SVG floating with CSS keyframes, CTA buttons ("Start Building" / "Browse Parts") with neon glow pulse
   - **How It Works section:** 3-step animated flow (Pick Parts → Build → Fly), each step card animates in on scroll (IntersectionObserver)
   - **Featured Drones section:** 3 pre-built drone showcases with specs, animated hover 3D-tilt effect (CSS `perspective` + JS mouse tracking)
   - **Live Stats bar:** animated counters — "Drones Built: 4,200+", "Parts Available: 120+", "Happy Pilots: 3,800+"
   - **Testimonials carousel:** auto-scroll with manual controls, smooth CSS transitions

2. **About Page** (`/about`):
   - Brand story with large editorial typography
   - Team section with animated profile cards
   - Timeline of "DroneForge milestones" with scroll-triggered reveals

3. **Contact Page** (`/contact`):
   - Contact form: name, email, message
   - Client-side + server-side validation, inline errors
   - Animated send button (rocket launch micro-interaction on submit)
   - Fake success toast notification

4. **Global polish pass:**
   - Custom animated cursor (glowing dot that trails)
   - Smooth scroll behavior site-wide
   - Page transition fade-in on every route change
   - Loading spinner/skeleton screens on data fetches
   - Toast notification system (success, error, warning) used consistently across all actions
   - All images use `loading="lazy"` and are compressed/WebP format
   - Consistent spacing, font sizing, and color usage via CSS variables throughout

5. **Responsive audit:** test and fix all pages at 320px, 768px, 1024px, 1440px breakpoints

### Commits to push
```
feat: hero section with particle canvas and drone animation
feat: how it works and featured drones sections
feat: animated stat counters and testimonials carousel
feat: about page with timeline and team cards
feat: contact page with validation and send animation
feat: custom cursor, toast system, and page transitions
feat: responsive audit and global polish pass
```

---

## MODULE 6 — Performance, Docs & Final Deployment Prep

**Git commit prefix:** `feat: module-6`

### What to Build

1. **Performance optimization:**
   - Compress all images to WebP, add width/height attributes to prevent layout shift
   - Minify CSS and JS (use a build step or manually remove dead code)
   - Add `Cache-Control` headers for static assets
   - Lazy load images and below-the-fold sections
   - Audit with browser DevTools — target < 3s first load on 3G
   - Remove any unused npm packages

2. **Security hardening:**
   - Add `helmet.js` for security headers
   - Add `express-rate-limit` on auth routes (max 10 attempts / 15 min)
   - Sanitize all MongoDB queries (use `mongoose` built-in or `mongo-sanitize`)
   - Ensure `.env` is in `.gitignore`, no secrets in code

3. **README.md** (comprehensive):
   ```markdown
   # DroneForge
   ## Overview
   ## Features
   ## Tech Stack
   ## Setup & Installation
   ## Environment Variables
   ## Running Locally
   ## Admin Setup (how to seed admin user)
   ## Module Breakdown
   ## Screenshots
   ## Live Demo
   ```

4. **Seed script for demo data:** one admin account, 5 regular users, parts catalog fully populated, 10 sample orders in various statuses

5. **Live deployment:** deploy to Render, Railway, or Vercel (backend) + MongoDB Atlas. Add live URL to README.

6. **Recorded walkthrough:** screen-record a 3–5 minute demo showing: home page, registration, building a drone, checkout, order tracking, admin dashboard, user management, part management. Upload to YouTube (unlisted) or attach as MP4.

### Commits to push
```
feat: helmet and rate limiting for security hardening
feat: image optimization and static asset caching
perf: lazy loading and bundle cleanup
feat: comprehensive README with setup instructions
feat: demo seed script for admin and sample data
feat: deploy to render with mongodb atlas
docs: add live demo link and walkthrough recording
```

---

## General Rules for the Agent

- **Every route that touches user data must have `requireAuth` middleware.**
- **Every admin route must have `requireAdmin` middleware.**
- **Never store plaintext passwords — bcrypt only, always.**
- **Never trust client-submitted prices — always recalculate server-side.**
- **All forms need both client-side AND server-side validation.**
- **Commit after completing each numbered item above — not just at module end.**
- **Use `feat:`, `fix:`, `perf:`, `docs:`, `style:` prefixes on all commits.**
- **Keep `.env` out of git. Provide a `.env.example` file.**
- **Mobile-first CSS — build for small screens first, scale up.**

---

## Environment Variables Required

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/droneforge
SESSION_SECRET=your_super_secret_key
BCRYPT_SALT_ROUNDS=12
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_mailtrap_user
EMAIL_PASS=your_mailtrap_pass
EMAIL_FROM=noreply@droneforge.io
CLOUDINARY_URL=optional_if_using_cloudinary
NODE_ENV=development
```

---

*Total marks available: 180 | Target: 175+*
