import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useCart } from '../CartContext';

const NAV = [
  { path:'/',          icon:'📊', label:'Dashboard' },
  { path:'/scan',      icon:'📷', label:'Scan & Checkout' },
  { path:'/cart',      icon:'🛒', label:'Active Cart',    cartBadge: true },
  { path:'/bills',     icon:'🧾', label:'Bills' },
];
const ADMIN_NAV = [
  { path:'/products',  icon:'📦', label:'Products' },
  { path:'/users',     icon:'👥', label:'Users' },
  { path:'/analytics', icon:'📈', label:'Analytics' },
  { path:'/lowstock',  icon:'⚠️', label:'Low Stock',      lowBadge: true },
];
const BOTTOM_NAV = [
  { path:'/settings',  icon:'⚙️', label:'Settings' },
];

export default function Sidebar({ lowStockCount }) {
  const nav  = useNavigate();
  const loc  = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const { totalQty } = useCart();

  const NavItem = ({ path, icon, label, badge }) => {
    const active = loc.pathname === path;
    return (
      <div
        onClick={() => { nav(path); if (navigator.vibrate) navigator.vibrate([8]); }}
        style={{
          display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
          borderRadius:10, cursor:'pointer', transition:'all .18s',
          fontSize:14, fontWeight:600,
          background: active ? 'var(--mint-light)' : 'transparent',
          color:      active ? 'var(--mint-dark)'  : 'var(--text2)',
          marginBottom:2,
        }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background='var(--surface2)'; }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background='transparent'; }}
      >
        <div style={{
          width:32, height:32, borderRadius:8, display:'flex', alignItems:'center',
          justifyContent:'center', fontSize:16, flexShrink:0,
          background: active ? 'var(--mint)' : 'transparent',
        }}>{icon}</div>
        <span style={{ flex:1 }}>{label}</span>
        {badge > 0 && (
          <span style={{
            background:'#FF6B6B', color:'white', fontSize:10, fontWeight:700,
            padding:'2px 6px', borderRadius:20,
          }}>{badge}</span>
        )}
      </div>
    );
  };

  return (
    <aside style={{
      position:'fixed', left:0, top:0, height:'100vh', width:240,
      background:'var(--surface)', borderRight:'1px solid var(--border)',
      display:'flex', flexDirection:'column', zIndex:100,
    }}>
      {/* Logo */}
      <div style={{ padding:'24px 20px 20px', display:'flex', alignItems:'center', gap:12, borderBottom:'1px solid var(--border)' }}>
        <div style={{
          width:40, height:40, borderRadius:12, flexShrink:0,
          background:'linear-gradient(135deg,#00D9A3,#4DA6FF)',
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:20,
        }}>🛒</div>
        <div>
          <div style={{ fontSize:20, fontWeight:700 }}>GoCart</div>
          <div style={{ fontSize:11, background:'var(--mint-light)', color:'var(--mint-dark)', padding:'2px 7px', borderRadius:20, fontWeight:700, display:'inline-block' }}>SMART POS</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding:'16px 12px', flex:1, overflowY:'auto' }}>
        <div style={{ fontSize:10, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'1.2px', padding:'4px 8px 8px' }}>Main</div>
        {NAV.map(item => (
          <NavItem key={item.path} {...item} badge={item.cartBadge ? totalQty : 0} />
        ))}

        {isAdmin && (
          <>
            <div style={{ fontSize:10, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'1.2px', padding:'12px 8px 8px' }}>Management</div>
            {ADMIN_NAV.map(item => (
              <NavItem key={item.path} {...item} badge={item.lowBadge ? lowStockCount : 0} />
            ))}
          </>
        )}

        <div style={{ fontSize:10, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'1.2px', padding:'12px 8px 8px' }}>Account</div>
        {BOTTOM_NAV.map(item => <NavItem key={item.path} {...item} />)}
      </nav>

      {/* User footer */}
      <div style={{ padding:16, borderTop:'1px solid var(--border)' }}>
        <div style={{
          display:'flex', alignItems:'center', gap:10, padding:10,
          borderRadius:10, background:'var(--surface2)', cursor:'pointer',
        }}>
          <div style={{
            width:36, height:36, borderRadius:'50%', flexShrink:0,
            background:'linear-gradient(135deg,#9B59F5,#4DA6FF)',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'white', fontSize:13, fontWeight:700,
          }}>{(user?.name || 'A')[0].toUpperCase()}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.name || 'User'}</div>
            <div style={{ fontSize:11, color:'var(--text3)' }}>{user?.role || 'ADMIN'}</div>
          </div>
          <button onClick={logout} style={{ background:'none', border:'none', cursor:'pointer', fontSize:16, color:'var(--text3)' }} title="Logout">🚪</button>
        </div>
      </div>
    </aside>
  );
}
