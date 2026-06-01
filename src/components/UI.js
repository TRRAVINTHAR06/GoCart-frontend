import React from 'react';

/* ── Button ── */
export const Btn = ({ children, variant = 'primary', size = 'md', style, onClick, disabled, ...props }) => {
  const base = {
    display:'inline-flex', alignItems:'center', gap:7, fontFamily:"'Nunito',sans-serif",
    fontWeight:700, cursor:'pointer', border:'none', borderRadius:10, transition:'all .18s',
    position:'relative', overflow:'hidden',
  };
  const sizes = { sm:{ padding:'7px 13px', fontSize:13 }, md:{ padding:'10px 18px', fontSize:14 }, lg:{ padding:'13px 22px', fontSize:16 } };
  const variants = {
    primary: { background:'linear-gradient(135deg,#00D9A3,#4DA6FF)', color:'white', boxShadow:'0 4px 16px rgba(0,217,163,.35)' },
    ghost:   { background:'#fff', border:'1.5px solid rgba(0,0,0,.08)', color:'#4A5568' },
    danger:  { background:'#FFF0F0', border:'1.5px solid rgba(255,107,107,.2)', color:'#FF6B6B' },
    amber:   { background:'#FFF8EE', border:'1.5px solid rgba(255,179,71,.2)', color:'#C67600' },
    icon:    { width:38, height:38, padding:0, justifyContent:'center', background:'#fff', border:'1.5px solid rgba(0,0,0,.08)', color:'#4A5568' },
  };
  return (
    <button
      style={{ ...base, ...sizes[size], ...variants[variant], opacity: disabled ? .5 : 1, ...style }}
      onClick={e => { if (navigator.vibrate) navigator.vibrate([8]); onClick && onClick(e); }}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

/* ── Card ── */
export const Card = ({ children, accent, style, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background:'var(--surface)', borderRadius:'var(--radius)', border:'1px solid var(--border)',
      padding:24, borderTop: accent ? `3px solid ${accent}` : undefined,
      cursor: onClick ? 'pointer' : undefined, transition:'all .25s',
      ...style,
    }}
  >
    {children}
  </div>
);

/* ── Badge ── */
const badgeColors = {
  green:  { background:'#E8FFF5', color:'#00875A' },
  red:    { background:'#FFF0F0', color:'#CC3333' },
  amber:  { background:'#FFF8EE', color:'#B45C00' },
  blue:   { background:'#EEF5FF', color:'#1A6FCC' },
  violet: { background:'#F3EEFF', color:'#6B2AC8' },
  gray:   { background:'#F0F4F8', color:'#8A9AB5' },
};
export const Badge = ({ children, color = 'gray', dot, style }) => (
  <span style={{
    display:'inline-flex', alignItems:'center', gap:4, padding:'4px 10px',
    borderRadius:20, fontSize:12, fontWeight:700, ...badgeColors[color], ...style,
  }}>
    {dot && <span style={{ width:6, height:6, borderRadius:'50%', background:'currentColor' }} />}
    {children}
  </span>
);

/* ── Input ── */
export const Input = ({ label, style, ...props }) => (
  <div style={{ marginBottom:18 }}>
    {label && <label style={{ display:'block', fontSize:13, fontWeight:700, color:'var(--text2)', marginBottom:6 }}>{label}</label>}
    <input
      style={{
        width:'100%', padding:'11px 14px', borderRadius:10, border:'1.5px solid var(--border)',
        fontSize:14, fontFamily:"'Nunito',sans-serif", color:'var(--text)', background:'var(--surface)',
        outline:'none', transition:'all .18s', ...style,
      }}
      onFocus={e => { e.target.style.borderColor='var(--mint)'; e.target.style.boxShadow='0 0 0 3px rgba(0,217,163,.15)'; }}
      onBlur={e =>  { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; }}
      {...props}
    />
  </div>
);

/* ── Select ── */
export const Select = ({ label, children, style, ...props }) => (
  <div style={{ marginBottom:18 }}>
    {label && <label style={{ display:'block', fontSize:13, fontWeight:700, color:'var(--text2)', marginBottom:6 }}>{label}</label>}
    <select style={{
      width:'100%', padding:'11px 14px', borderRadius:10, border:'1.5px solid var(--border)',
      fontSize:14, fontFamily:"'Nunito',sans-serif", color:'var(--text)', background:'var(--surface)', outline:'none', ...style,
    }} {...props}>{children}</select>
  </div>
);

/* ── Modal ── */
export const Modal = ({ open, onClose, title, children, footer, maxWidth = 520 }) => {
  if (!open) return null;
  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,.45)', zIndex:200,
      display:'flex', alignItems:'center', justifyContent:'center', padding:20, backdropFilter:'blur(4px)',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background:'var(--surface)', borderRadius:'var(--radius)', width:'100%', maxWidth,
        maxHeight:'90vh', overflowY:'auto', animation:'slideUp .3s ease',
        boxShadow:'0 24px 64px rgba(0,0,0,.2)',
      }}>
        <div style={{ padding:'24px 24px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontSize:20, fontWeight:700, fontFamily:"'Space Grotesk',sans-serif" }}>{title}</div>
          <button onClick={onClose} style={{
            width:32, height:32, borderRadius:'50%', border:'none', background:'var(--surface2)',
            cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text3)',
          }}>✕</button>
        </div>
        <div style={{ padding:'20px 24px' }}>{children}</div>
        {footer && <div style={{ padding:'0 24px 24px', display:'flex', gap:10, justifyContent:'flex-end' }}>{footer}</div>}
      </div>
    </div>
  );
};

/* ── Alert ── */
const alertStyles = {
  success: { background:'var(--mint-light)', color:'var(--mint-dark)', border:'1px solid rgba(0,217,163,.3)' },
  warning: { background:'var(--amber-light)', color:'#8A5800',         border:'1px solid rgba(255,179,71,.3)' },
  danger:  { background:'var(--coral-light)', color:'#CC2222',         border:'1px solid rgba(255,107,107,.3)' },
  info:    { background:'var(--sky-light)',   color:'#1A6FCC',         border:'1px solid rgba(77,166,255,.3)' },
};
export const Alert = ({ type = 'info', children }) => (
  <div style={{ padding:'14px 18px', borderRadius:10, fontSize:14, fontWeight:600,
    display:'flex', alignItems:'center', gap:10, marginBottom:16, ...alertStyles[type] }}>
    {children}
  </div>
);

/* ── Stat Card ── */
const statGradients = {
  mint:   'linear-gradient(135deg,#00D9A3,#00B887)',
  sky:    'linear-gradient(135deg,#4DA6FF,#2980FF)',
  coral:  'linear-gradient(135deg,#FF6B6B,#FF3B3B)',
  violet: 'linear-gradient(135deg,#9B59F5,#7C3AED)',
};
export const StatCard = ({ label, value, sub, icon, color = 'mint', onClick }) => (
  <div onClick={onClick} style={{
    borderRadius:'var(--radius)', padding:22, position:'relative', overflow:'hidden', cursor:'pointer',
    background: statGradients[color], color:'white', transition:'all .25s',
  }}
    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 40px rgba(0,0,0,.2)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}
  >
    <div style={{ fontSize:12, fontWeight:700, opacity:.85, textTransform:'uppercase', letterSpacing:'.8px' }}>{label}</div>
    <div style={{ fontSize:32, fontWeight:800, marginTop:4, fontFamily:"'Space Grotesk',sans-serif" }}>{value}</div>
    <div style={{ fontSize:12, marginTop:8, opacity:.9 }}>{sub}</div>
    <div style={{ position:'absolute', right:20, top:20, fontSize:36, opacity:.25 }}>{icon}</div>
    <div style={{ position:'absolute', right:-20, bottom:-30, width:100, height:100, borderRadius:'50%', background:'rgba(255,255,255,.12)' }} />
  </div>
);

/* ── Table ── */
export const Table = ({ headers, children }) => (
  <div style={{ overflowX:'auto', borderRadius:10 }}>
    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
      <thead>
        <tr>
          {headers.map(h => (
            <th key={h} style={{ background:'var(--surface2)', padding:'12px 16px', textAlign:'left',
              fontSize:11, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.8px' }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

export const Td = ({ children, style }) => (
  <td style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)', color:'var(--text2)', verticalAlign:'middle', ...style }}>
    {children}
  </td>
);

/* ── Toggle ── */
export const Toggle = ({ checked, onChange }) => (
  <label style={{ position:'relative', width:42, height:24, flexShrink:0, cursor:'pointer' }}>
    <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
      style={{ opacity:0, width:0, height:0 }} />
    <span style={{
      position:'absolute', inset:0, borderRadius:34,
      background: checked ? 'var(--mint)' : 'rgba(0,0,0,.12)',
      transition:'.25s', border:'1.5px solid rgba(0,0,0,.1)',
    }}>
      <span style={{
        position:'absolute', height:18, width:18, borderRadius:'50%', background:'white',
        bottom:1, left: checked ? 20 : 2, transition:'.25s', boxShadow:'0 2px 4px rgba(0,0,0,.2)',
      }} />
    </span>
  </label>
);

/* ── Qty Control ── */
export const QtyControl = ({ value, onChange }) => (
  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
    <button onClick={() => onChange(-1)} style={{
      width:28, height:28, borderRadius:8, border:'1.5px solid var(--border)',
      background:'var(--surface)', cursor:'pointer', fontSize:14, fontWeight:700, transition:'all .18s',
    }}>−</button>
    <span style={{ fontSize:15, fontWeight:700, minWidth:24, textAlign:'center' }}>{value}</span>
    <button onClick={() => onChange(1)} style={{
      width:28, height:28, borderRadius:8, border:'1.5px solid var(--border)',
      background:'var(--surface)', cursor:'pointer', fontSize:14, fontWeight:700, transition:'all .18s',
    }}>+</button>
  </div>
);

/* ── Empty State ── */
export const Empty = ({ icon, title, desc }) => (
  <div style={{ textAlign:'center', padding:48, color:'var(--text3)' }}>
    <div style={{ fontSize:56, marginBottom:16 }}>{icon}</div>
    <div style={{ fontSize:18, fontWeight:700, color:'var(--text2)' }}>{title}</div>
    {desc && <div style={{ fontSize:14, marginTop:6 }}>{desc}</div>}
  </div>
);

/* ── Category bar chart ── */
export const CategoryChart = ({ data }) => {
  if (!data) return null;
  const colors = ['#00D9A3','#4DA6FF','#FF6B6B','#9B59F5','#FFB347','#00B887','#FF8C69'];
  const entries = Object.entries(data);
  const max = Math.max(...entries.map(e => e[1]));
  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:120, paddingTop:8 }}>
        {entries.map(([cat, val], i) => {
          const pct = Math.round((val / max) * 100);
          return (
            <div key={cat} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center' }}>
              <div style={{ fontSize:11, color:'var(--text3)', marginBottom:4 }}>
                {'₹' + Math.round(val / 1000) + 'k'}
              </div>
              <div style={{
                width:'100%', minHeight:8, height:`${Math.max(pct, 4)}%`,
                background:colors[i % colors.length], borderRadius:'6px 6px 0 0',
                cursor:'pointer', transition:'all .4s',
              }} title={`${cat}: ₹${val.toLocaleString()}`} />
            </div>
          );
        })}
      </div>
      <div style={{ display:'flex', gap:8, marginTop:12, flexWrap:'wrap' }}>
        {entries.map(([cat], i) => (
          <span key={cat} style={{ fontSize:11, display:'flex', alignItems:'center', gap:4, color:'var(--text3)' }}>
            <span style={{ display:'inline-block', width:8, height:8, borderRadius:2, background:colors[i % colors.length] }} />
            {cat}
          </span>
        ))}
      </div>
    </div>
  );
};
