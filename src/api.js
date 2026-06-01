import axios from 'axios';

const getBase = () => localStorage.getItem('gocart_api') || 'http://localhost:8080';

const api = axios.create({ baseURL: getBase() });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('gocart_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  cfg.baseURL = getBase();
  return cfg;
});

api.interceptors.response.use(r => r.data, err => Promise.reject(err));

export default api;

export const fmtCurrency = n =>
  '₹' + parseFloat(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const getSessionId = () => {
  let s = localStorage.getItem('gocart_session');
  if (!s) { s = 'guest-' + Math.random().toString(36).substr(2, 9); localStorage.setItem('gocart_session', s); }
  return s;
};

export const CAT_EMOJIS = {
  Groceries: '🌾', Dairy: '🥛', Beverages: '🥤', Snacks: '🍿',
  'Personal Care': '💄', Household: '🏠', 'Fresh Produce': '🥦',
  Frozen: '❄️', Electronics: '⚡', Other: '📦',
};
export const getCatEmoji = cat => CAT_EMOJIS[cat] || '📦';

export const haptic = () => { if (navigator.vibrate) navigator.vibrate([10]); };

export const DEMO_PRODUCTS = [
  { id:1,  name:'Basmati Rice 1kg',         barcode:'8901234567890', price:89,   weight:1000, stock:45,  category:'Groceries',      active:true, lowStockThreshold:10 },
  { id:2,  name:'Amul Full Cream Milk 1L',   barcode:'8901030592270', price:68,   weight:1020, stock:18,  category:'Dairy',           active:true, lowStockThreshold:20 },
  { id:3,  name:"Lay's Classic Salted",      barcode:'8901491104216', price:20,   weight:26,   stock:120, category:'Snacks',          active:true, lowStockThreshold:30 },
  { id:4,  name:'Coca-Cola 600ml',           barcode:'8901058001016', price:40,   weight:620,  stock:8,   category:'Beverages',       active:true, lowStockThreshold:15 },
  { id:5,  name:'Dove Soap Bar',             barcode:'8901030748804', price:55,   weight:100,  stock:35,  category:'Personal Care',   active:true, lowStockThreshold:10 },
  { id:6,  name:'Atta Chakki Fresh 5kg',     barcode:'8901234560001', price:249,  weight:5000, stock:5,   category:'Groceries',       active:true, lowStockThreshold:8  },
  { id:7,  name:'Tata Salt 1kg',             barcode:'8901234560002', price:24,   weight:1000, stock:60,  category:'Groceries',       active:true, lowStockThreshold:20 },
  { id:8,  name:'Maggi 2 Min Noodles',       barcode:'8901058001017', price:14,   weight:70,   stock:90,  category:'Snacks',          active:true, lowStockThreshold:25 },
  { id:9,  name:'Colgate MaxFresh 150g',     barcode:'8714789934632', price:79,   weight:150,  stock:3,   category:'Personal Care',   active:true, lowStockThreshold:10 },
  { id:10, name:'Surf Excel 1kg',            barcode:'8901030592271', price:189,  weight:1000, stock:22,  category:'Household',       active:true, lowStockThreshold:10 },
  { id:11, name:'Lays Masala 26g',           barcode:'8901491104217', price:20,   weight:26,   stock:75,  category:'Snacks',          active:true, lowStockThreshold:30 },
  { id:12, name:'Haldirams Bhujia 200g',     barcode:'8906002350031', price:60,   weight:200,  stock:40,  category:'Snacks',          active:true, lowStockThreshold:15 },
];

export const DEMO_ANALYTICS = {
  totalRevenue: 485920.50,
  todayRevenue: 12340.00,
  totalOrders: 324,
  todayOrders: 18,
  totalProducts: 12,
  lowStockProducts: 4,
  totalCustomers: 87,
  revenueByCategory: { Groceries:182340, Dairy:43200, Beverages:28900, Snacks:96750, 'Personal Care':67840, Household:43200, Others:23690 },
};

export const DEMO_USERS = [
  { id:1, name:'GoCart Admin',  email:'admin@gocart.com',  phone:'9999999999', role:'ADMIN',    active:true  },
  { id:2, name:'Priya Sharma',  email:'priya@gocart.com',  phone:'9876543210', role:'EMPLOYEE', active:true  },
  { id:3, name:'Rajan Kumar',   email:'rajan@example.com', phone:'8765432109', role:'CUSTOMER', active:true  },
  { id:4, name:'Ananya Patel',  email:'ananya@example.com',phone:'7654321098', role:'CUSTOMER', active:false },
  { id:5, name:'Vikram Singh',  email:'vikram@gocart.com', phone:'6543210987', role:'EMPLOYEE', active:true  },
];

export const DEMO_BILLS = Array.from({ length: 12 }, (_, i) => ({
  id: 1001 + i,
  createdAt: new Date(Date.now() - i * 3600000 * 4).toISOString(),
  itemCount: Math.floor(Math.random() * 5) + 1,
  totalAmount: Math.random() * 800 + 80,
  expectedWeight: Math.floor(Math.random() * 2000 + 200),
  actualWeight:   Math.floor(Math.random() * 2100 + 200),
  status: i === 3 ? 'WEIGHT_MISMATCH' : i === 7 ? 'PAID' : 'PENDING',
}));
