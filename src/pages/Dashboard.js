import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { StatCard, Card, Btn, CategoryChart, Badge } from '../components/UI';
import { fmtCurrency} from '../api';
import api from '../api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const nav = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
  api.get('/api/admin/analytics')
    .then(r => setData(r.data || r))
    .catch(err => {
      console.error(err);
      setData({
        totalRevenue: 0,
        todayRevenue: 0,
        totalOrders: 0,
        todayOrders: 0,
        totalProducts: 0,
        lowStockProducts: 0,
        totalCustomers: 0,
        revenueByCategory: {}
      });
    });
}, []);

  const d = data || {
  totalRevenue: 0,
  todayRevenue: 0,
  totalOrders: 0,
  todayOrders: 0,
  totalProducts: 0,
  lowStockProducts: 0,
  totalCustomers: 0,
  revenueByCategory: {}
  };
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const canViewAnalytics =
  user?.role === 'ADMIN' ||
  user?.role === 'EMPLOYEE';
  return (
    <div className="fade-in">
      {/* Top bar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
        <div>
          <div style={{ fontSize:26, fontWeight:700, fontFamily:"'Space Grotesk',sans-serif" }}>{greeting} {user?.name?.split(' ')[0]} 👋</div>
          <div style={{ fontSize:14, color:'var(--text3)', marginTop:2 }}>Here's what's happening today</div>
        </div>
        <div style={{ display:'flex', gap:12 }}>
          <Btn
  variant="ghost"
  size="sm"
  onClick={() => {
    setData(null);

    api.get('/api/admin/analytics')
      .then(r => setData(r.data || r))
      .catch(err => {
        console.error(err);
        setData({
          totalRevenue: 0,
          todayRevenue: 0,
          totalOrders: 0,
          todayOrders: 0,
          totalProducts: 0,
          lowStockProducts: 0,
          totalCustomers: 0,
          revenueByCategory: {}
        });
      });
  }}
>
  🔄 Refresh
</Btn>
          <Btn variant="primary" size="sm" onClick={() => nav('/scan')}>+ New Sale</Btn>
        </div>
      </div>

      {canViewAnalytics && (
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
        <StatCard label="Total Revenue"  value={fmtCurrency(d.totalRevenue)}         sub="📈 All time"          icon="💰" color="mint"   onClick={() => nav('/analytics')} />
        <StatCard label="Total Orders"   value={(d.totalOrders||0).toLocaleString()}  sub="🧾 Transactions"     icon="📋" color="sky"    onClick={() => nav('/bills')} />
        <StatCard label="Products"       value={d.totalProducts||0}                   sub="📦 In catalogue"     icon="🏪" color="coral"  onClick={() => nav('/products')} />
        <StatCard label="Customers"      value={d.totalCustomers||0}                  sub="👥 Registered"       icon="👤" color="violet" onClick={() => nav('/users')} />
      </div>
      )}

      {/* Charts + Quick Actions */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:28 }}>
       {canViewAnalytics && (
        <Card accent="var(--mint)">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div style={{ fontSize:15, fontWeight:700 }}>Revenue by Category</div>
            <Badge color="green" dot>Live</Badge>
          </div>
          <CategoryChart data={d.revenueByCategory} />
        </Card>
       )}
        <Card accent="var(--sky)">
          <div style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>Quick Actions</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[
              ['📷','Scan & Add to Cart', '/scan'],
              ['🧾','View All Bills', '/bills'],
               ...(canViewAnalytics ? [
                  ['📦','Add New Product', '/products'],
                    ['⚠️','View Low Stock', '/lowstock']
                ] : []),
                ...(user?.role === 'ADMIN' ? [ 
                  ['👤','Add Employee', '/users']
                 ] : []) 
   
            ].map(([icon, label, path]) => (
              <Btn key={label} variant="ghost" style={{ justifyContent:'flex-start', gap:12 }} onClick={() => nav(path)}>
                <span style={{ fontSize:20 }}>{icon}</span><span>{label}</span>
              </Btn>
            ))}
          </div>
        </Card>
      </div>

      {/* Today summary */}
      {canViewAnalytics && (
      <Card accent="var(--coral)">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <div style={{ fontSize:15, fontWeight:700 }}>Today's Summary</div>
          <Badge color="blue">{d.todayOrders||0} orders today</Badge>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>
          {[
            { value: fmtCurrency(d.todayRevenue), label:"Today's Revenue", color:'var(--mint-dark)' },
            { value: d.todayOrders||0,             label:"Today's Orders",  color:'var(--sky)' },
            { value: d.lowStockProducts||0,        label:'Low Stock Alerts',color:'var(--coral)' },
          ].map(({ value, label, color }) => (
            <div key={label} style={{ textAlign:'center', padding:16, background:'var(--surface2)', borderRadius:10 }}>
              <div style={{ fontSize:28, fontWeight:800, color, fontFamily:"'Space Grotesk',sans-serif" }}>{value}</div>
              <div style={{ fontSize:12, color:'var(--text3)', marginTop:4 }}>{label}</div>
            </div>
          ))}
        </div>
      </Card>
      )}
    </div>
  );
}
