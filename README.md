# DroneForge 🚁

> The ultimate custom drone builder platform — configure, order, and track your custom drone build end-to-end.

## Overview

DroneForge is a full-stack drone e-commerce and builder platform. Users assemble custom drones part-by-part using a visual builder, add components to a cart, checkout with a multi-step form, and track their orders. Admins manage users, parts inventory, and order statuses from a dedicated dashboard.

**Live aesthetic:** Dark glassmorphism, electric cyan accents, animated UI — think cyberpunk engineering workshop.

---

## Features

- **Drone Builder** — visual slot-based builder with compatibility checks, weight/flight-time estimates, live build summary
- **Parts Catalog** — 40+ parts across 8 categories with search, filter, and "Add to Cart"
- **Shopping Cart** — session-based cart with quantity controls and live totals
- **Multi-Step Checkout** — 3-step flow (Build Review → Shipping → Payment) with client + server validation
- **Order Tracking** — order history with expandable accordion, status badges, and fabrication timeline
- **Admin Dashboard** — stat cards, recent orders, user management, parts CRUD with image upload, order status updates
- **Authentication** — register/login with bcrypt, session management, password reset via email token
- **Role-Based Navigation** — separate navbar for admin vs customer vs guest
- **Security** — Helmet headers, rate limiting on auth routes, MongoDB query sanitization

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20+ |
| Framework | Express 5 |
| Database | MongoDB + Mongoose |
| Auth | bcrypt + express-session + connect-mongo |
| Templating | EJS |
| File Uploads | Multer |
| Email | Nodemailer + Mailtrap (dev) |
| Security | helmet, express-rate-limit, express-mongo-sanitize |
| CSS | Custom glassmorphism design system (CSS variables) |

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB running locally or a MongoDB Atlas URI

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/MFaheemS/DroneForge.git
cd DroneForge

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI, session secret, and email credentials

# 4. Seed the database (optional but recommended)
node scripts/seedDemo.js

# 5. Start the server
node app.js
# or with auto-restart:
npx nodemon app.js
```

Server runs at `http://localhost:3000`

---

## Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Description |
|---|---|
| `PORT` | Server port (default 3000) |
| `MONGODB_URI` | MongoDB connection string |
| `SESSION_SECRET` | Long random string for session signing |
| `BCRYPT_SALT_ROUNDS` | bcrypt cost factor (12 recommended) |
| `EMAIL_HOST` | SMTP host (Mailtrap for dev) |
| `EMAIL_PORT` | SMTP port |
| `EMAIL_USER` | SMTP username |
| `EMAIL_PASS` | SMTP password |
| `EMAIL_FROM` | From address for password reset emails |
| `NODE_ENV` | `development` or `production` |

---

## Admin Setup

Run the demo seed script which creates the default admin account:

```bash
node scripts/seedDemo.js
```

**Admin credentials:** `admin@droneforge.io` / `Admin@1234`  
**Customer credentials:** `pilot@droneforge.io` / `Pilot@1234`

Or use the quick-fill buttons on the login page.

---

## Module Breakdown

| Module | Description |
|---|---|
| Module 1 | Auth (register/login/logout/password reset), roles, navbar, layout |
| Module 2 | Parts catalog, drone builder with visual slots |
| Module 3 | Cart, multi-step checkout, order confirmation, order history |
| Module 4 | Admin dashboard, user management, parts CRUD, order management |
| Module 5 | Home page polish, About page, Contact page, custom cursor, testimonials |
| Module 6 | Security hardening, README, demo seed, .env.example |

---

## Folder Structure

```
DroneForge/
├── controllers/       # Route handlers
├── middleware/        # requireAuth, requireAdmin
├── models/            # Mongoose schemas (User, Part, Order)
├── public/            # Static assets
│   ├── css/           # Design system CSS
│   ├── js/            # Client-side JS
│   └── images/        # Drone GIFs and illustrations
├── routes/            # Express routers
├── scripts/           # Seed scripts
├── views/             # EJS templates
│   ├── admin/         # Admin panel views
│   ├── auth/          # Login, register, password reset
│   ├── errors/        # 404, 403
│   ├── orders/        # Confirmation, order list
│   ├── parts/         # Catalog
│   └── partials/      # head, navbar, footer, scripts
├── app.js             # Express app entry point
└── .env.example       # Environment variable template
```

---

*DroneForge Aerospace — All Systems Nominal.*
