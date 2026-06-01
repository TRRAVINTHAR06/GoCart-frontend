# GoCart Frontend — React JS

Smart Self-Checkout System built with React.

## 🚀 Quick Start

```bash
npm install
npm start
```

Open http://localhost:3000

## 🔐 Default Login
- Email: admin@gocart.com
- Password: admin@123

Works in offline/demo mode automatically if backend is not running.

## 🔌 Backend Connection
Point the app at your Spring Boot backend via Settings → API Configuration.
Default: http://localhost:8080

## 📁 Project Structure
src/
├── api.js              # Axios instance, demo data, helpers
├── App.js              # Root with routing
├── AuthContext.js      # JWT auth state
├── CartContext.js      # Cart state
├── components/
│   ├── Sidebar.js      # Navigation sidebar
│   └── UI.js           # Shared design system components
└── pages/
    ├── Login.js        # Login + Register
    ├── Dashboard.js    # Stats & analytics overview
    ├── Scan.js         # Barcode scan & checkout
    └── Pages.js        # Products, Users, Bills, Analytics, LowStock, CartPage, Settings

## 🛠️ Tech Stack
- React 18 + React Router v6
- Axios (API calls)
- react-hot-toast (notifications)
- Google Fonts: Nunito + Space Grotesk

## 🎨 Features
- Dashboard with live stats & revenue chart
- Scan & Checkout with barcode search
- Weight verification system
- Product catalogue (grid & table)
- User & employee management
- Bill history with payment processing
- Analytics dashboard
- Low stock alerts
- Dark mode toggle
- Haptic feedback on mobile
- Full offline/demo mode
