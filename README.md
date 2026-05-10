# DroneForge

A full-stack drone e-commerce and custom build platform. Customers can browse parts, assemble custom drone builds using an interactive builder, order prebuilt configurations, and manage their orders. Admins have a full control panel to manage parts, builds, users, and orders.

---

## Features

### Customer
- **Home Page** — Showcases top 3 featured builds sorted by purchase popularity
- **Fleet / Browse Builds** — Bento-grid gallery of all active prebuilt builds with Clone and Order actions
- **Interactive Builder** — Part selector across 8 categories (Frame, Motors, Propellers, Battery, Flight Controller, Camera, ESC, Transmitter) with real-time compatibility checking, weight/price summary, and estimated flight time
- **Clone a Build** — Loads all parts from a prebuilt build directly into the builder for customization
- **Marketplace** — Browse and filter individual parts by category, search, and sort
- **Cart** — Session-based cart with quantity management
- **Checkout** — Place orders with build name and delivery details
- **Order History** — View past orders and their status
- **User Profile** — Update name, email, and password

### Admin
- **Dashboard** — Overview stats: total users, orders, revenue, low stock alerts, recent orders
- **Parts Management** — Add, edit, delete parts with image upload (Cloudinary), specs, stock, and pricing
- **Prebuilt Builds Management** — Create and manage featured builds with part selection, spec tags, images, and active/archive toggle. Includes the same compatibility constraint checking as the customer builder
- **User Management** — View and manage all registered users
- **Order Management** — View all orders and update order status

### Security
- Session-based authentication with `express-session` + MongoDB session store
- Passwords hashed with `bcrypt`
- Role-based access control (admin / customer)
- Input validation and sanitization with `express-validator`
- MongoDB query sanitization against injection attacks
- Rate limiting on auth routes
- Security headers via `helmet`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js v5 |
| Templating | EJS |
| Database | MongoDB + Mongoose |
| Auth | express-session + bcrypt |
| File Storage | Cloudinary |
| CSS | Custom CSS with CSS variables |
| Deployment | Vercel + MongoDB Atlas |

---

## Project Structure

```
DroneForge/
├── controllers/
│   ├── adminController.js
│   └── orderController.js
├── middleware/
│   └── auth.js
├── models/
│   ├── User.js
│   ├── Part.js
│   ├── Order.js
│   └── PrebuiltBuild.js
├── public/
│   ├── css/
│   ├── js/
│   └── images/
├── routes/
│   ├── home.js
│   ├── auth.js
│   ├── parts.js
│   ├── build.js
│   ├── builds.js
│   ├── cart.js
│   ├── orders.js
│   ├── profile.js
│   └── admin.js
├── scripts/
│   └── seed-builds.js
├── views/
│   ├── auth/
│   ├── admin/
│   ├── partials/
│   └── *.ejs
├── app.js
├── vercel.json
└── .env
```

---

## Local Setup

### Prerequisites
- Node.js v18+
- MongoDB (local) or MongoDB Atlas URI
- Cloudinary account (free tier)

### 1. Clone the repository

```bash
git clone https://github.com/MFaheemS/DroneForge.git
cd DroneForge
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/droneforge
SESSION_SECRET=your_long_random_secret_here
NODE_ENV=development
BCRYPT_SALT_ROUNDS=12
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Seed the database (optional)

Populates 4 default prebuilt builds (requires parts to already exist in DB):

```bash
node scripts/seed-builds.js
```

### 5. Run the app

```bash
npm run dev
```

App runs at `http://localhost:3000`

---

## Deployment (Vercel + MongoDB Atlas)

### 1. MongoDB Atlas
- Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
- Create a database user and get the connection string
- Under **Network Access**, allow `0.0.0.0/0`

### 2. Cloudinary
- Sign up at [cloudinary.com](https://cloudinary.com)
- Get your Cloud Name, API Key, and API Secret from the dashboard

### 3. Vercel
- Push your code to GitHub
- Import the repo at [vercel.com](https://vercel.com)
- Set **Framework Preset** to `Other`
- Add environment variables:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | Your Atlas connection string |
| `SESSION_SECRET` | A long random string |
| `NODE_ENV` | `production` |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary |
| `CLOUDINARY_API_KEY` | From Cloudinary |
| `CLOUDINARY_API_SECRET` | From Cloudinary |

- Click **Deploy**

Every `git push` to `master` auto-redeploys.

---

## License

ISC
