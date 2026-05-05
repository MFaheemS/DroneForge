# DroneForge — Screens & Features Reference

---

## Screens

| # | Screen | Route | Access |
|---|--------|--------|--------|
| 1 | Home | `/` | Public |
| 2 | Register | `/auth/register` | Guest only |
| 3 | Login | `/auth/login` | Guest only |
| 4 | Forgot Password | `/auth/forgot-password` | Guest only |
| 5 | Reset Password | `/auth/reset-password/:token` | Guest only |
| 6 | Parts Catalog | `/parts` | Public |
| 7 | Drone Builder | `/build` | Logged in |
| 8 | Cart | `/cart` | Logged in |
| 9 | Checkout | `/checkout` | Logged in |
| 10 | Order Confirmation | `/orders/confirmation/:id` | Logged in |
| 11 | My Orders | `/orders` | Logged in |
| 12 | About | `/about` | Public |
| 13 | Contact | `/contact` | Public |
| 14 | Admin Dashboard | `/admin` | Admin only |
| 15 | Admin — Users | `/admin/users` | Admin only |
| 16 | Admin — Parts | `/admin/parts` | Admin only |
| 17 | Admin — Orders | `/admin/orders` | Admin only |
| 18 | 404 Error | `*` | Public |
| 19 | 403 Error | — | Public |

---

## Features by Screen

### 1. Home (`/`)
- Hero section with headline, subheading, and two CTA buttons (Start Building / Browse Parts)
- Animated stats bar: Drones Built, Parts Available, Active Pilots, Satisfaction
- How It Works section: 3-step flow (Pick Parts → Build → Fly), each card animates on scroll
- Featured Drones section: 3 pre-built drone showcases with specs and hover tilt effect
- Testimonials carousel with auto-scroll and manual controls
- Navbar changes links based on role (Guest / User / Admin)

---

### 2. Register (`/auth/register`)
- Form fields: Name, Email, Password, Confirm Password
- Client-side validation: required fields, email format, password match, min length
- Server-side validation and sanitization
- Inline error messages per field
- On success: session started, redirect to home
- Redirect to home if already logged in

---

### 3. Login (`/auth/login`)
- Form fields: Email, Password
- Show/hide password toggle
- Client-side and server-side validation
- Inline error messages
- On success: redirect admin → `/admin`, user → `/`
- Redirect to home if already logged in

---

### 4. Forgot Password (`/auth/forgot-password`)
- Form field: Email
- Server generates a time-limited reset token (15 min) and sends email
- Success message shown regardless of whether email exists (no user enumeration)
- Inline error messages

---

### 5. Reset Password (`/auth/reset-password/:token`)
- Form fields: New Password, Confirm Password
- Token validated for freshness on page load — shows error if expired/invalid
- Client-side and server-side validation
- On success: password updated, redirect to login

---

### 6. Parts Catalog (`/parts`)
- Search bar with live filtering (no page reload)
- Filter sidebar:
  - Filter by category (8 categories)
  - Price range slider (min/max)
  - Max weight slider
  - Reset all filters button
- Sort dropdown: price low→high, price high→low, weight, name
- Part cards showing: image, name, category badge, price, weight, short description
- Quick spec popup on each card (shows all specs)
- "Add to Build" button — saves part to localStorage build
- Out of Stock indicator when stock = 0
- Empty state when no results match filters
- Results count updates live

---

### 7. Drone Builder (`/build`) — Auth required
- Visual drone schematic (SVG) with 8 labeled, clickable slots:
  - Frame, Motors ×4, Propellers, Battery, Flight Controller, Camera, ESC, Transmitter
- Clicking a slot opens a modal with parts for that category
- Modal has: search/filter input, part list with image/name/specs/price, selected state indicator
- Selecting a part snaps it into the slot
- Slot status bar below schematic showing filled/empty state per slot
- Build Summary sidebar:
  - List of selected parts with remove button
  - Running total price
  - Total weight
  - Estimated flight time (calculated from battery mAh and motor count)
  - Compatibility indicator (green / yellow / red)
- Inline compatibility warning banners (e.g. motor count mismatch, heavy battery)
- Reset Build button with confirmation modal
- Save & Order button → sends build to cart
- Build persisted to localStorage (survives page refresh)

---

### 8. Cart (`/cart`) — Auth required
- Itemized list of all parts in the current build
- Quantity controls (+/-) per item
- Remove item button
- Order summary panel: subtotal, item count
- "Proceed to Checkout" button
- "Continue Building" link back to builder
- Cart stored server-side in session
- Animated cart icon in navbar with item count badge

---

### 9. Checkout (`/checkout`) — Auth required
- Multi-step form with animated progress bar (3 steps):
  - **Step 1:** Build review + drone name input
  - **Step 2:** Shipping address (name, address line, city, country, zip)
  - **Step 3:** Fake payment form (card number, expiry, CVV) + order review
- Client-side validation on every step (required fields, formats)
- Server-side validation: sanitize inputs, verify stock, recalculate total
- Inline error messages per field
- Back/Next navigation between steps
- On success: order created in DB, cart cleared, redirect to confirmation

---

### 10. Order Confirmation (`/orders/confirmation/:id`) — Auth required
- Success animation
- Order summary card: order ID, drone name, parts list, total price, estimated delivery date
- Link to My Orders

---

### 11. My Orders (`/orders`) — Auth required
- List of all user orders sorted newest first
- Each order shows: order ID, drone name, date, total price, status badge (color coded)
- "View Details" expands an accordion showing full part list for that order
- Empty state if no orders

---

### 12. About (`/about`)
- Brand story section
- Team section with profile cards
- Timeline of DroneForge milestones with scroll-triggered reveals

---

### 13. Contact (`/contact`)
- Form fields: Name, Email, Message
- Client-side and server-side validation
- Inline error messages
- Animated submit button
- Success toast notification on submit

---

### 14. Admin Dashboard (`/admin`) — Admin only
- Stats cards with animated counters: Total Users, Total Orders, Total Revenue, Low Stock Parts
- Recent orders table (last 10): order ID, user, total, status, date
- Quick action buttons: Add Part, View All Users, View All Orders

---

### 15. Admin — User Management (`/admin/users`) — Admin only
- Paginated table: name, email, role, status, joined date, actions
- Search/filter by name or email
- Activate / Deactivate toggle per user
- Change role (user ↔ admin) with confirmation modal
- Inactive users cannot log in

---

### 16. Admin — Parts Management (`/admin/parts`) — Admin only
- Table of all parts with name, category, price, stock, actions
- Add Part form: all fields + image upload
- Edit Part: pre-filled form with image preview
- Delete Part: confirmation modal
- Server-side validation and inline errors on all forms

---

### 17. Admin — Order Management (`/admin/orders`) — Admin only
- Table of all orders with filter by status
- Update order status via dropdown (pending → confirmed → shipped → delivered → cancelled)
- View full order details in a modal

---

### 18. 404 Page
- Shown for any unmatched route
- Link back to home

---

### 19. 403 Page
- Shown when a non-admin tries to access an admin route
- Link back to home

---

## Global Features (all pages)

- Sticky responsive navbar with role-based links
- Hamburger menu on mobile
- Footer on every page: logo, nav links, social icons, copyright
- Session expires after 30 minutes of inactivity
- Toast notification system (success / error / info)
- Smooth scroll behavior
- Lazy loading on all images

---

## Data Models

| Model | Key Fields |
|-------|-----------|
| User | name, email, passwordHash, role, isActive, resetToken, resetTokenExpiry |
| Part | name, category, price, weight, description, imageUrl, specs, stock, isAvailable |
| Order | userId, buildName, parts[], totalPrice, status, shippingAddress, createdAt |
