import React, { useEffect, useState } from 'react';
import { useNavigate as useNav } from 'react-router-dom';

import api, {
  fmtCurrency,
  getCatEmoji,
  DEMO_PRODUCTS,
  DEMO_USERS,
  DEMO_BILLS,
  DEMO_ANALYTICS
} from '../api';

import { useCart as useCartHook } from '../CartContext';
import { useAuth as useAuthHook } from '../AuthContext';
import { useAuth } from '../AuthContext';

import {
  Btn,
  Card,
  Badge,
  Table,
  Td,
  Modal,
  Input,
  Select,
  Empty,
  StatCard,
  CategoryChart,
  QtyControl,
  Toggle
} from '../components/UI';

import toast from 'react-hot-toast';

const CATEGORIES = ['Groceries','Dairy','Beverages','Snacks','Personal Care','Household','Fresh Produce','Frozen','Electronics','Other'];

export function Products() {
  const [products, setProducts] = useState(DEMO_PRODUCTS);
  const [view, setView]         = useState('grid');
  const [query, setQuery]       = useState('');
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState({});
  const [editId, setEditId]     = useState(null);

  useEffect(() => {
    api.get('/api/products').then(r => { if(r.data) setProducts(r.data); }).catch(() => {});
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.barcode.includes(query) ||
    (p.category||'').toLowerCase().includes(query.toLowerCase())
  );

  const openAdd = () => { setForm({ lowStockThreshold:10 }); setEditId(null); setModal(true); };
  const openEdit = p => { setForm({...p}); setEditId(p.id); setModal(true); };

  const save = async () => {
    if (!form.name || !form.barcode || !form.price || !form.category) { toast.error('Fill all required fields'); return; }
    const body = { ...form, price: parseFloat(form.price), weight: parseFloat(form.weight), stock: parseInt(form.stock), lowStockThreshold: parseInt(form.lowStockThreshold)||10 };
    try {
      const res = editId ? await api.put(`/api/products/${editId}`, body) : await api.post('/api/products', body);
      const saved = res.data || res;
      if (editId) setProducts(p => p.map(x => x.id === editId ? { ...x, ...saved } : x));
      else setProducts(p => [...p, { ...saved, id: saved.id || Date.now() }]);
      toast.success(editId ? 'Product updated!' : 'Product created!');
    } catch {
      if (editId) setProducts(p => p.map(x => x.id === editId ? { ...x, ...body } : x));
      else setProducts(p => [...p, { ...body, id: Date.now(), active: true }]);
      toast.success(editId ? 'Product updated (offline)' : 'Product added (offline)');
    }
    setModal(false);
  };

  const del = async id => {
    if (!window.confirm('Delete this product?')) return;
    try { await api.delete(`/api/products/${id}`); } catch {}
    setProducts(p => p.filter(x => x.id !== id));
    toast.success('Product deleted');
  };

  return (
    <div className="fade-in">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
        <div>
          <div style={{ fontSize:26, fontWeight:700, fontFamily:"'Space Grotesk',sans-serif" }}>Product Catalogue</div>
          <div style={{ fontSize:14, color:'var(--text3)' }}>Manage all products and inventory</div>
        </div>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <div style={{ display:'flex', gap:4, background:'var(--surface2)', padding:4, borderRadius:10 }}>
            {['grid','table'].map(v => (
              <div key={v} onClick={() => setView(v)} style={{
                padding:'8px 14px', borderRadius:7, fontSize:13, fontWeight:700, cursor:'pointer',
                background: view===v ? 'var(--surface)' : 'transparent',
                color: view===v ? 'var(--text)' : 'var(--text3)',
                boxShadow: view===v ? '0 1px 8px rgba(0,0,0,.08)' : 'none',
              }}>
                {v === 'grid' ? '⊞ Grid' : '☰ Table'}
              </div>
            ))}
          </div>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="🔍 Search products…"
            style={{ padding:'9px 14px', borderRadius:10, border:'1.5px solid var(--border)', fontSize:13, outline:'none', width:180 }} />
          <Btn variant="primary" onClick={openAdd}>+ Add Product</Btn>
        </div>
      </div>

      {view === 'grid' ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:16 }}>
          {filtered.map(p => (
            <div key={p.id} onClick={() => openEdit(p)} style={{
              background:'var(--surface)', borderRadius:'var(--radius)', border:'1px solid var(--border)',
              overflow:'hidden', cursor:'pointer', transition:'all .25s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 8px 40px rgba(0,0,0,.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}
            >
              <div style={{ height:130, background:'var(--surface2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:52, position:'relative' }}>
                {getCatEmoji(p.category)}
                <div style={{ position:'absolute', top:10, right:10 }}>
                  <Badge color={p.stock <= (p.lowStockThreshold||10) ? 'red' : 'green'}>{p.stock <= (p.lowStockThreshold||10) ? 'Low Stock' : 'In Stock'}</Badge>
                </div>
              </div>
              <div style={{ padding:14 }}>
                <div style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>{p.name}</div>
                <div style={{ fontSize:12, color:'var(--text3)' }}>{p.category} • {p.weight}g</div>
                <div style={{ fontSize:18, fontWeight:800, color:'var(--mint-dark)', fontFamily:"'Space Grotesk',sans-serif", marginTop:8 }}>{fmtCurrency(p.price)}</div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:10 }}>
                  <span style={{ fontSize:12, color:'var(--text3)' }}>Qty: <b style={{ color:'var(--text)' }}>{p.stock}</b></span>
                  <Btn variant="danger" size="sm" style={{ padding:'4px 8px', fontSize:12 }} onClick={e => { e.stopPropagation(); del(p.id); }}>🗑</Btn>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <Table headers={['Product','Barcode','Category','Price','Stock','Weight','Status','Actions']}>
            {filtered.map(p => (
              <tr key={p.id}
                onMouseEnter={e => e.currentTarget.style.background='var(--surface2)'}
                onMouseLeave={e => e.currentTarget.style.background=''}
              >
                <Td><div style={{ display:'flex', alignItems:'center', gap:10 }}><span style={{ fontSize:20 }}>{getCatEmoji(p.category)}</span><b>{p.name}</b></div></Td>
                <Td><code style={{ background:'var(--surface2)', padding:'2px 6px', borderRadius:4, fontSize:12 }}>{p.barcode}</code></Td>
                <Td><Badge color="blue">{p.category}</Badge></Td>
                <Td style={{ fontWeight:700, color:'var(--mint-dark)' }}>{fmtCurrency(p.price)}</Td>
                <Td><Badge color={p.stock<=(p.lowStockThreshold||10)?'red':'green'}>{p.stock}</Badge></Td>
                <Td>{p.weight}g</Td>
                <Td><Badge color={p.active?'green':'gray'}>{p.active?'Active':'Inactive'}</Badge></Td>
                <Td>
                  <div style={{ display:'flex', gap:6 }}>
                    <Btn variant="ghost" size="sm" onClick={() => openEdit(p)}>✏️</Btn>
                    <Btn variant="danger" size="sm" onClick={() => del(p.id)}>🗑</Btn>
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Product' : 'Add Product'} maxWidth={540}
        footer={<><Btn variant="ghost" onClick={() => setModal(false)}>Cancel</Btn><Btn variant="primary" onClick={save}>💾 Save Product</Btn></>}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <Input label="Product Name *" value={form.name||''} onChange={e => setForm({...form,name:e.target.value})} placeholder="e.g. Basmati Rice 1kg" />
          <Input label="Barcode *" value={form.barcode||''} onChange={e => setForm({...form,barcode:e.target.value})} placeholder="8901234567890" />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>
          <Input label="Price (₹) *" type="number" step="0.01" value={form.price||''} onChange={e => setForm({...form,price:e.target.value})} />
          <Input label="Weight (g) *" type="number" value={form.weight||''} onChange={e => setForm({...form,weight:e.target.value})} />
          <Input label="Stock *" type="number" value={form.stock||''} onChange={e => setForm({...form,stock:e.target.value})} />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <Select label="Category *" value={form.category||''} onChange={e => setForm({...form,category:e.target.value})}>
            <option value="">Select…</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </Select>
          <Input label="Low Stock Threshold" type="number" value={form.lowStockThreshold||10} onChange={e => setForm({...form,lowStockThreshold:e.target.value})} />
        </div>
        <Input label="Image URL" value={form.imageUrl||''} onChange={e => setForm({...form,imageUrl:e.target.value})} placeholder="https://…" />
      </Modal>
    </div>
  );
}

// ─── Users ────────────────────────────────────────────────────────────────────

export function Users() {
  const [users, setUsers]   = useState(DEMO_USERS);
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState({});

  useEffect(() => {
    api.get('/api/admin/users').then(r => { if(r.data) setUsers(r.data); }).catch(() => {});
  }, []);

  const toggle = async id => {
    try { const r = await api.put(`/api/admin/users/${id}/toggle`); if(r.data) setUsers(u => u.map(x => x.id===id ? r.data : x)); }
    catch { setUsers(u => u.map(x => x.id===id ? {...x,active:!x.active} : x)); }
    toast.success('User status updated');
  };

  const save = async () => {
    try {
      const r = await api.post('/api/admin/employees', form);
      if(r.data) setUsers(u => [...u, r.data]);
      toast.success('Employee created!');
    } catch { toast.success('Employee added (offline)'); setUsers(u => [...u, {...form,id:Date.now(),role:'EMPLOYEE',active:true}]); }
    setModal(false);
  };

  const roleBadge = r => r==='ADMIN'?'red':r==='EMPLOYEE'?'blue':'gray';

  return (
    <div className="fade-in">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
        <div>
          <div style={{ fontSize:26, fontWeight:700, fontFamily:"'Space Grotesk',sans-serif" }}>User Management</div>
          <div style={{ fontSize:14, color:'var(--text3)' }}>Manage employees and customers</div>
        </div>
        <Btn variant="primary" onClick={() => { setForm({}); setModal(true); }}>+ Add Employee</Btn>
      </div>
      <Card>
        <Table headers={['User','Email','Phone','Role','Status','Actions']}>
          {users.map(u => (
            <tr key={u.id} onMouseEnter={e => e.currentTarget.style.background='var(--surface2)'} onMouseLeave={e => e.currentTarget.style.background=''}>
              <Td>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#9B59F5,#4DA6FF)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:12,fontWeight:700,flexShrink:0 }}>
                    {u.name[0].toUpperCase()}
                  </div>
                  <b>{u.name}</b>
                </div>
              </Td>
              <Td>{u.email}</Td>
              <Td>{u.phone}</Td>
              <Td><Badge color={roleBadge(u.role)}>{u.role}</Badge></Td>
              <Td><Badge color={u.active?'green':'red'}>{u.active?'Active':'Inactive'}</Badge></Td>
              <Td><Btn variant="amber" size="sm" onClick={() => toggle(u.id)}>{u.active ? '🚫 Disable' : '✅ Enable'}</Btn></Td>
            </tr>
          ))}
        </Table>
      </Card>
      <Modal open={modal} onClose={() => setModal(false)} title="Add Employee"
        footer={<><Btn variant="ghost" onClick={() => setModal(false)}>Cancel</Btn><Btn variant="primary" onClick={save}>✅ Create Employee</Btn></>}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <Input label="Full Name *" value={form.name||''} onChange={e => setForm({...form,name:e.target.value})} />
          <Input label="Phone *" value={form.phone||''} onChange={e => setForm({...form,phone:e.target.value})} />
        </div>
        <Input label="Email *" type="email" value={form.email||''} onChange={e => setForm({...form,email:e.target.value})} />
        <Input label="Password *" type="password" value={form.password||''} onChange={e => setForm({...form,password:e.target.value})} />
      </Modal>
    </div>
  );
}

// ─── Bills ────────────────────────────────────────────────────────────────────


export function Bills() {
  const { user } = useAuth();

  const [bills, setBills] = useState(DEMO_BILLS);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [payMethod, setPayMethod] = useState('UPI');

  useEffect(() => {
    api.get('/api/bills')
      .then(res => {
        setBills(res.data || []);
      })
      .catch(err => {
        console.error(err);
      });
  }, []);

  if (user?.role === 'GUEST') {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <h2>🔒 Login Required</h2>
          <p>Please login to view bills.</p>
        </div>
      </Card>
    );
  }

  const filtered = bills.filter(
    b =>
      String(b.id).includes(query) ||
      b.status.includes(query.toUpperCase())
  );

  const pay = async () => {
    try { await api.post('/api/payment', { billId: selected.id, paymentMethod: payMethod }); }
    catch {}
    setBills(b => b.map(x => x.id === selected.id ? { ...x, status:'PAID' } : x));
    toast.success(`Payment via ${payMethod} recorded ✅`);
    setSelected(null);
  };

  const statusColor = s => s==='PAID'?'green':s==='WEIGHT_MISMATCH'?'red':'amber';

  return (
    <div className="fade-in">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
        <div>
          <div style={{ fontSize:26, fontWeight:700, fontFamily:"'Space Grotesk',sans-serif" }}>Bills & Invoices</div>
          <div style={{ fontSize:14, color:'var(--text3)' }}>View and manage all transactions</div>
        </div>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="🔍 Search bills…"
          style={{ padding:'9px 14px', borderRadius:10, border:'1.5px solid var(--border)', fontSize:13, outline:'none' }} />
      </div>
      <Card>
        <Table headers={['Bill #','Date','Items','Total','Weight','Status','Actions']}>
          {filtered.map(b => {
            const d = new Date(b.createdAt);
            return (
              <tr key={b.id} onMouseEnter={e => e.currentTarget.style.background='var(--surface2)'} onMouseLeave={e => e.currentTarget.style.background=''}>
                <Td><b>#{b.id}</b></Td>
                <Td>{d.toLocaleDateString('en-IN')} {d.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</Td>
                <Td>{b.itemCount} items</Td>
                <Td style={{ fontWeight:700, color:'var(--mint-dark)' }}>{fmtCurrency(b.totalAmount)}</Td>
                <Td>{b.expectedWeight||'-'}g</Td>
                <Td><Badge color={statusColor(b.status)}>{b.status}</Badge></Td>
                <Td>
                  <div style={{ display:'flex', gap:6 }}>
                    <Btn variant="ghost" size="sm" onClick={() => setSelected(b)}>👁 View</Btn>
                    {b.status === 'PENDING' && <Btn variant="primary" size="sm" onClick={() => setSelected(b)}>💳 Pay</Btn>}
                  </div>
                </Td>
              </tr>
            );
          })}
        </Table>
      </Card>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Bill #${selected?.id}`}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setSelected(null)}>Close</Btn>
            {selected?.status === 'PENDING' && (
              <>
                <select value={payMethod} onChange={e => setPayMethod(e.target.value)}
                  style={{ padding:'8px 12px', borderRadius:8, border:'1.5px solid var(--border)', fontSize:13 }}>
                  <option>UPI</option><option>CASH</option><option>CARD</option>
                </select>
                <Btn variant="primary" onClick={pay}>💳 Process Payment</Btn>
              </>
            )}
          </>
        }>
        {selected && (
          <>
            {selected.status === 'WEIGHT_MISMATCH' && <div style={{ padding:'12px 16px', borderRadius:10, background:'#FFF0F0', color:'#CC2222', marginBottom:16, fontWeight:600 }}>⚠️ Weight mismatch! Payment blocked.</div>}
            <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
              <span style={{ color:'var(--text3)' }}>Total Amount</span>
              <span style={{ fontWeight:800, color:'var(--mint-dark)' }}>{fmtCurrency(selected.totalAmount)}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
              <span style={{ color:'var(--text3)' }}>Expected Weight</span><span>{selected.expectedWeight}g</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 0' }}>
              <span style={{ color:'var(--text3)' }}>Status</span><Badge color={statusColor(selected.status)}>{selected.status}</Badge>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

// ─── Analytics ────────────────────────────────────────────────────────────────


export function Analytics() {
  const [data, setData] = useState(DEMO_ANALYTICS);
  useEffect(() => { api.get('/api/admin/analytics').then(r => setData(r.data||r)).catch(() => {}); }, []);
  const d = data || DEMO_ANALYTICS;

  return (
    <div className="fade-in">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
        <div>
          <div style={{ fontSize:26, fontWeight:700, fontFamily:"'Space Grotesk',sans-serif" }}>Analytics Dashboard</div>
          <div style={{ fontSize:14, color:'var(--text3)' }}>Business insights and reports</div>
        </div>
        <Btn variant="ghost" size="sm" onClick={() => api.get('/api/admin/analytics').then(r => setData(r.data||r)).catch(() => {})}>🔄 Refresh</Btn>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
        <StatCard label="Today's Revenue" value={fmtCurrency(d.todayRevenue)} sub="Today only" icon="💰" color="mint" />
        <StatCard label="Today's Orders"  value={d.todayOrders||0}            sub="Transactions" icon="📋" color="sky" />
        <StatCard label="Total Revenue"   value={fmtCurrency(d.totalRevenue)} sub="All time"   icon="💸" color="coral" />
        <StatCard label="Total Orders"    value={d.totalOrders||0}            sub="All time"   icon="🛒" color="violet" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <Card accent="var(--mint)">
          <div style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>📊 Revenue by Category</div>
          <CategoryChart data={d.revenueByCategory} />
        </Card>
        <Card accent="var(--violet)">
          <div style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>📋 Summary Stats</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[
              ['📦','Total Products',     d.totalProducts],
              ['⚠️','Low Stock Alerts',   d.lowStockProducts],
              ['👥','Total Customers',    d.totalCustomers],
              ['🛒','Today\'s Orders',    d.todayOrders],
            ].map(([icon, label, val]) => (
              <div key={label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', background:'var(--surface2)', borderRadius:10 }}>
                <span style={{ fontSize:14 }}>{icon} {label}</span>
                <b style={{ fontSize:16 }}>{val||0}</b>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Low Stock ────────────────────────────────────────────────────────────────
export function LowStock({ onLoad }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      try { const r = await api.get('/api/products/low-stock'); setItems(r.data||r); }
      catch { setItems(DEMO_PRODUCTS.filter(p => p.stock <= (p.lowStockThreshold||10))); }
    };
    load().then(() => onLoad && onLoad(items.length));
  }, []);

  useEffect(() => { onLoad && onLoad(items.length); }, [items]);

  return (
    <div className="fade-in">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
        <div>
          <div style={{ fontSize:26, fontWeight:700, fontFamily:"'Space Grotesk',sans-serif" }}>Low Stock Alerts</div>
          <div style={{ fontSize:14, color:'var(--text3)' }}>Products running below threshold</div>
        </div>
        <Btn variant="amber" size="sm">📤 Export Report</Btn>
      </div>
      <div style={{ padding:'14px 18px', borderRadius:10, fontSize:14, fontWeight:600, display:'flex', alignItems:'center', gap:10, marginBottom:16, background:'var(--amber-light)', color:'#8A5800', border:'1px solid rgba(255,179,71,.3)' }}>
        ⚠️ Items below minimum stock threshold need restocking soon
      </div>
      <Card>
        <Table headers={['Product','Barcode','Category','Current Stock','Threshold','Status','Action']}>
          {items.length === 0 ? (
            <tr><td colSpan={7} style={{ textAlign:'center', padding:40, color:'var(--text3)' }}>✅ All products are well-stocked!</td></tr>
          ) : items.map(p => {
            const pct = Math.round((p.stock / (p.lowStockThreshold||10)) * 100);
            const barColor = pct < 50 ? 'var(--coral)' : pct < 80 ? 'var(--amber)' : 'var(--mint)';
            return (
              <tr key={p.id} onMouseEnter={e => e.currentTarget.style.background='var(--surface2)'} onMouseLeave={e => e.currentTarget.style.background=''}>
                <Td><div style={{ display:'flex', alignItems:'center', gap:10 }}><span style={{ fontSize:20 }}>{getCatEmoji(p.category)}</span><b>{p.name}</b></div></Td>
                <Td><code style={{ background:'var(--surface2)', padding:'2px 6px', borderRadius:4, fontSize:12 }}>{p.barcode}</code></Td>
                <Td><Badge color="blue">{p.category}</Badge></Td>
                <Td>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ flex:1, height:8, background:'var(--surface2)', borderRadius:20, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${Math.min(pct,100)}%`, background:barColor, borderRadius:20, transition:'width .5s' }} />
                    </div>
                    <b>{p.stock}</b>
                  </div>
                </Td>
                <Td>{p.lowStockThreshold||10}</Td>
                <Td><Badge color={pct<30?'red':'amber'}>{pct<30?'Critical':'Low'}</Badge></Td>
                <Td><Btn variant="primary" size="sm">📦 Restock</Btn></Td>
              </tr>
            );
          })}
        </Table>
      </Card>
    </div>
  );
}

// ─── Cart Page ────────────────────────────────────────────────────────────────

export function CartPage() {
  const { items, updateQty, clearCart, total } = useCartHook();
  const nav = useNav();

  return (
    <div className="fade-in">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
        <div>
          <div style={{ fontSize:26, fontWeight:700, fontFamily:"'Space Grotesk',sans-serif" }}>Active Cart</div>
          <div style={{ fontSize:14, color:'var(--text3)' }}>Manage current shopping session</div>
        </div>
        <div style={{ display:'flex', gap:12 }}>
          <Btn variant="danger" size="sm" onClick={clearCart}>🗑 Clear Cart</Btn>
          <Btn variant="primary" size="sm" onClick={() => nav('/scan')}>📷 Continue Scanning</Btn>
        </div>
      </div>

      {items.length === 0 ? (
        <Empty icon="🛒" title="Cart is empty" desc="Go to Scan & Checkout to add items" />
      ) : (
        <div style={{ maxWidth:600 }}>
          {items.map(item => (
            <div key={item.barcode} style={{
              display:'flex', alignItems:'center', gap:14, padding:16, borderRadius:10,
              border:'1px solid var(--border)', background:'var(--surface)', marginBottom:10,
              transition:'all .2s',
            }}>
              <div style={{ width:52,height:52,borderRadius:10,background:'var(--surface2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0 }}>{item.emoji||getCatEmoji(item.category)}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700 }}>{item.name}</div>
                <div style={{ fontSize:12, color:'var(--text3)' }}>{fmtCurrency(item.price)} × {item.quantity} = {fmtCurrency(item.price*item.quantity)}</div>
              </div>
              <QtyControl value={item.quantity} onChange={d => updateQty(item.barcode, d)} />
            </div>
          ))}
          <Card style={{ marginTop:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:18, fontWeight:800 }}>
              <span>Cart Total</span><span style={{ color:'var(--mint-dark)' }}>{fmtCurrency(total)}</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── Settings ────────────────────────────────────────────────────────────────


export function Settings() {
  const { user, logout } = useAuthHook();
  const [apiUrl, setApiUrl]       = useState(localStorage.getItem('gocart_api') || 'http://localhost:8080');
  const [apiStatus, setApiStatus] = useState('');
  const [darkMode, setDarkMode]   = useState(false);
  const [prefs, setPrefs]         = useState({ sound:true, autoPrint:false, lowStockNotif:true });

  const testConn = () => {
    localStorage.setItem('gocart_api', apiUrl);
    fetch(apiUrl + '/api/products').then(() => { setApiStatus('success'); toast.success('Backend connected!'); }).catch(() => setApiStatus('error'));
  };

  const toggleDark = on => {
    setDarkMode(on);
    const r = document.documentElement.style;
    if (on) {
      r.setProperty('--bg','#0F1523'); r.setProperty('--surface','#1A2235'); r.setProperty('--surface2','#242D40');
      r.setProperty('--text','#E8EDF5'); r.setProperty('--text2','#B0BAD0'); r.setProperty('--text3','#5A6A88'); r.setProperty('--border','rgba(255,255,255,.07)');
    } else {
      r.setProperty('--bg','#F7F9FC'); r.setProperty('--surface','#FFFFFF'); r.setProperty('--surface2','#F0F4F8');
      r.setProperty('--text','#1A2233'); r.setProperty('--text2','#4A5568'); r.setProperty('--text3','#8A9AB5'); r.setProperty('--border','rgba(0,0,0,.07)');
    }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:26, fontWeight:700, fontFamily:"'Space Grotesk',sans-serif" }}>Settings</div>
        <div style={{ fontSize:14, color:'var(--text3)' }}>Configure your GoCart system</div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <Card accent="var(--mint)">
          <div style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>🔌 API Configuration</div>
          <Input label="Backend URL" value={apiUrl} onChange={e => setApiUrl(e.target.value)} />
          {apiStatus === 'success' && <div style={{ padding:'12px 16px', borderRadius:10, background:'var(--mint-light)', color:'var(--mint-dark)', marginBottom:12, fontWeight:600 }}>✅ Connected!</div>}
          {apiStatus === 'error'   && <div style={{ padding:'12px 16px', borderRadius:10, background:'var(--coral-light)', color:'#CC2222', marginBottom:12, fontWeight:600 }}>❌ Cannot connect.</div>}
          <Btn variant="primary" size="sm" onClick={testConn}>Test Connection</Btn>
        </Card>

        <Card accent="var(--sky)">
          <div style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>👤 My Account</div>
          {user && (
            <>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                <div style={{ width:48,height:48,borderRadius:'50%',background:'linear-gradient(135deg,#9B59F5,#4DA6FF)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:18,fontWeight:700 }}>{(user.name||'A')[0].toUpperCase()}</div>
                <div>
                  <div style={{ fontWeight:700, fontSize:16 }}>{user.name}</div>
                  <div style={{ color:'var(--text3)', fontSize:13 }}>{user.email}</div>
                </div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <Badge color="green">{user.role}</Badge>
                <Badge color="blue">Active</Badge>
              </div>
            </>
          )}
          <Btn variant="danger" size="sm" style={{ marginTop:16 }} onClick={logout}>🚪 Sign Out</Btn>
        </Card>

        <Card accent="var(--violet)">
          <div style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>🎨 Preferences</div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {[
              ['Dark Mode',              darkMode,           v => toggleDark(v)],
              ['Sound Alerts',           prefs.sound,        v => setPrefs({...prefs,sound:v})],
              ['Auto Print Bills',       prefs.autoPrint,    v => setPrefs({...prefs,autoPrint:v})],
              ['Low Stock Notifications',prefs.lowStockNotif,v => setPrefs({...prefs,lowStockNotif:v})],
            ].map(([label, val, fn]) => (
              <div key={label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <label style={{ fontSize:14, fontWeight:600, color:'var(--text2)' }}>{label}</label>
                <Toggle checked={val} onChange={fn} />
              </div>
            ))}
          </div>
        </Card>

        <Card accent="var(--coral)">
          <div style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>🔐 Security</div>
          <Input label="Current Password" type="password" placeholder="••••••••" />
          <Input label="New Password" type="password" placeholder="••••••••" />
          <Input label="Confirm Password" type="password" placeholder="••••••••" />
          <Btn variant="primary" size="sm">Update Password</Btn>
        </Card>
      </div>
    </div>
  );
}
