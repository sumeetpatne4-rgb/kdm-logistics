# KDM Logistics — Full-stack starter

Responsive logistics website built with React + Vite, Express, MongoDB/Mongoose, JWT authentication, shipment booking, tracking, customer dashboard, and admin shipment management.

## Prerequisites
- Node.js 20+ and npm
- MongoDB local installation or a MongoDB Atlas connection string

## 1. Configure the API

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Edit `server/.env` and set:
- `MONGODB_URI` to your MongoDB connection string
- `JWT_SECRET` to a long random secret
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` for the initial admin account

The server seeds the admin user when it starts if that email is not already registered.

## 2. Configure the React website

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Visit the URL printed by Vite, normally `http://localhost:5173`.

The Vite development server proxies `/api` requests to `http://localhost:5000`.

## Demo workflow
1. Create a customer account from **Login / Register**.
2. Submit a shipment quote request from **Book a shipment**.
3. Copy the tracking ID shown after booking, then use **Track shipment**.
4. Sign in with the configured admin email/password to update shipment status in **Admin**.

## API overview
- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/shipments` (authenticated)
- `GET /api/shipments/mine` (authenticated customer)
- `GET /api/shipments/track/:trackingId` (public tracking view; limited public fields)
- `GET /api/shipments` (admin)
- `PATCH /api/shipments/:id/status` (admin)

## Notes before production
This is an educational starter, not a production dispatch platform. Before deployment, add email/SMS notifications, rate limiting, audit logs, password reset, CSRF strategy if switching token storage, request monitoring, backups, and stricter operational policies. Public tracking deliberately returns only selected shipment fields. Store secrets only in environment variables and never commit `.env`.
