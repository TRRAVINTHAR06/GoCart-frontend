import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../CartContext';
import { Btn, Card, Alert, QtyControl, Modal, Badge, Input } from '../components/UI';
import { fmtCurrency, getCatEmoji, getSessionId, DEMO_PRODUCTS } from '../api';
import api from '../api';
import BarcodeScanner from "../components/BarcodeScanner";
import toast from 'react-hot-toast';

export default function Scan() {
  const { items, addItem, updateQty, total, expectedWeight, clearCart } = useCart();
  const [query, setQuery]           = useState('');
  const [searchResults, setResults] = useState([]);
  const [scanned, setScanned]       = useState(null);
  const [scanQty, setScanQty]       = useState(1);
  const [actualWeight, setActualWeight] = useState('');
  const [products, setProducts]     = useState(DEMO_PRODUCTS);
  const [billModal, setBillModal]   = useState(false);
  const [bill, setBill]             = useState(null);
  const [payMethod, setPayMethod]   = useState('UPI');
  const inputRef = useRef();

  useEffect(() => {
    api.get('/api/products').then(r => { if(r.data) setProducts(r.data.map(p=>({...p}))); }).catch(() => {});
    inputRef.current?.focus();
  }, []);

  const sessionId = getSessionId();

  const search = val => {
    setQuery(val);
    if (!val || val.length < 2) { setResults([]); return; }
    setResults(products.filter(p =>
      p.name.toLowerCase().includes(val.toLowerCase()) || p.barcode.includes(val)
    ).slice(0, 5));
  };

  const selectProduct = p => {
    setScanned({ ...p, emoji: getCatEmoji(p.category) });
    setScanQty(1);
    setResults([]);
    setQuery('');
  };

  const scanBarcode = () => {
    if (!query.trim()) { toast.error('Enter a barcode or product name'); return; }
    api.get(`/api/products/barcode/${encodeURIComponent(query.trim())}`)
      .then(r => { if (r.data) selectProduct(r.data); else { const l = products.find(p=>p.barcode===query||p.name.toLowerCase().includes(query.toLowerCase())); l ? selectProduct(l) : toast.error('Product not found'); } })
      .catch(() => { const l = products.find(p=>p.barcode===query||p.name.toLowerCase().includes(query.toLowerCase())); l ? selectProduct(l) : toast.error('Product not found'); });
  };

  const addToCart = async () => {
  if (!scanned) return;

  try {
    console.log("ADDING", {
      barcode: scanned.barcode,
      quantity: scanQty,
      sessionId: sessionId
    });

    const res = await api.post('/api/cart/add', {
      barcode: scanned.barcode,
      quantity: scanQty,
      sessionId: sessionId
    });

    console.log("ADD RESPONSE", res);

    addItem(scanned, scanQty);
    toast.success("Added");
  } catch (err) {
    console.error("ADD ERROR", err);
  }
};

  const doCheckout = async () => {
    if (!items.length) { toast.error('Cart is empty'); return; }
    const aw = parseFloat(actualWeight) || 0;
    try {
      const res = await api.post('/api/cart/checkout', { sessionId, actualWeight: aw });
      setBill(res.data || res);
    } catch {
      const t = items.reduce((s,i)=>s+i.price*i.quantity,0);
      const ok = aw === 0 || Math.abs(aw - expectedWeight) / expectedWeight < 0.05;
      setBill({ id: Math.floor(Math.random()*9000+1000), items: items.map(i=>({product:{name:i.name,emoji:i.emoji||getCatEmoji(i.category)},quantity:i.quantity,price:i.price,subtotal:i.price*i.quantity})), totalAmount:t, expectedWeight, actualWeight:aw, status: ok?'PENDING':'WEIGHT_MISMATCH' });
    }
    setBillModal(true);
    if (bill?.status !== 'WEIGHT_MISMATCH') clearCart();
  };

  const doPayment = async () => {
    try {
      await api.post('/api/payment', { billId: bill.id, paymentMethod: payMethod });
      toast.success(`Payment via ${payMethod} successful ✅`);
    } catch {
      toast.success(`Payment recorded (offline) ✅`);
    }
    setBillModal(false); clearCart();
  };

  return (
    <div className="fade-in">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
        <div>
          <div style={{ fontSize:26, fontWeight:700, fontFamily:"'Space Grotesk',sans-serif" }}>Scan & Checkout</div>
          <div style={{ fontSize:14, color:'var(--text3)' }}>Scan barcodes or search products</div>
        </div>
        <span style={{ fontSize:12, color:'var(--text3)', background:'var(--surface2)', padding:'6px 12px', borderRadius:20 }}>
          Session: {sessionId.slice(0,16)}…
        </span>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        {/* Left: scan panel */}
        <div>
          <Card style={{ marginBottom:16 }}>
    <div
      style={{
        fontSize:15,
        fontWeight:700,
        marginBottom:12
      }}
    >
      📷 Live Camera Scanner
    </div>

    <BarcodeScanner
  onScan={(barcode) => {
    console.log("Barcode:", barcode);

    api
      .get(`/api/products/barcode/${barcode}`)
      .then((r) => {
        const product = r.data || r;

        selectProduct(product);

        toast.success("Product Found ✅");
      })
      .catch(() => {
        toast.error("Product Not Found ❌");
      });
  }}
/>
</Card>


          <Card style={{ marginBottom:16 }}>
            <div style={{ fontSize:15, fontWeight:700, marginBottom:14 }}>🔍 Quick Search / Barcode</div>
            <div style={{ position:'relative', marginBottom:12 }}>
              <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--text3)' }}>🔍</span>
              <input
                ref={inputRef}
                value={query}
                onChange={e => search(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && scanBarcode()}
                placeholder="Type barcode or product name…"
                style={{
                  width:'100%', padding:'11px 14px 11px 40px', borderRadius:10,
                  border:'1.5px solid var(--border)', fontSize:14, fontFamily:"'Nunito',sans-serif",
                  outline:'none', color:'var(--text)',
                }}
              />
            </div>
            <Btn variant="primary" style={{ width:'100%', justifyContent:'center' }} onClick={scanBarcode}>
              📷 Scan Barcode & Add to Cart
            </Btn>
          </Card>

          {/* Search results */}
          {searchResults.length > 0 && (
            <Card style={{ marginBottom:16 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'var(--text3)', marginBottom:10 }}>SEARCH RESULTS</div>
              {searchResults.map(p => (
                <div key={p.id} onClick={() => selectProduct(p)} style={{
                  display:'flex', alignItems:'center', gap:14, padding:14, borderRadius:10,
                  border:'1px solid var(--border)', background:'var(--surface)', marginBottom:8,
                  cursor:'pointer', transition:'all .2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,.1)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow=''}
                >
                  <div style={{ width:44,height:44,borderRadius:10,background:'var(--surface2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0 }}>{getCatEmoji(p.category)}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:14 }}>{p.name}</div>
                    <div style={{ fontSize:12, color:'var(--text3)' }}>{p.barcode} • {p.category}</div>
                  </div>
                  <div style={{ fontWeight:800, color:'var(--mint-dark)' }}>{fmtCurrency(p.price)}</div>
                </div>
              ))}
            </Card>
          )}

          {/* Scanned product */}
          {scanned && (
            <Card accent="var(--mint)" style={{ marginBottom:16 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'var(--text3)', marginBottom:10 }}>PRODUCT FOUND</div>
              <div style={{ display:'flex', gap:14, alignItems:'center', marginBottom:16 }}>
                <div style={{ width:60,height:60,borderRadius:12,background:'var(--surface2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:30,flexShrink:0 }}>{scanned.emoji}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:16, fontWeight:700 }}>{scanned.name}</div>
                  <div style={{ fontSize:13, color:'var(--text3)' }}>{scanned.barcode} • {scanned.category}</div>
                  <div style={{ fontSize:20, fontWeight:800, color:'var(--mint-dark)' }}>{fmtCurrency(scanned.price)}</div>
                </div>
                <QtyControl value={scanQty} onChange={d => setScanQty(Math.max(1, scanQty + d))} />
              </div>
              <Btn variant="primary" style={{ width:'100%', justifyContent:'center' }} onClick={addToCart}>
                ➕ Add to Cart
              </Btn>
            </Card>
          )}
        </div>

        {/* Right: cart */}
        <div style={{ maxHeight:'75vh', overflowY:'auto' }}>
          <Card>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <div style={{ fontSize:15, fontWeight:700 }}>🛒 Current Cart</div>
              <Badge color="blue">{items.length} item{items.length !== 1 ? 's' : ''}</Badge>
            </div>

            {items.length === 0 ? (
              <div style={{ textAlign:'center', padding:40, color:'var(--text3)' }}>
                <div style={{ fontSize:48, marginBottom:12 }}>🛒</div>
                <div style={{ fontWeight:700, color:'var(--text2)' }}>Cart is empty</div>
                <div style={{ fontSize:13, marginTop:6 }}>Scan a barcode to add items</div>
              </div>
            ) : (
              <>
                {items.map(item => (
                  <div key={item.barcode} style={{
                    display:'flex', alignItems:'center', gap:12, padding:12, borderRadius:10,
                    border:'1px solid var(--border)', marginBottom:8,
                  }}>
                    <div style={{ width:44,height:44,borderRadius:10,background:'var(--surface2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0 }}>{item.emoji||getCatEmoji(item.category)}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:13, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.name}</div>
                      <div style={{ fontSize:12, color:'var(--text3)' }}>{fmtCurrency(item.price)} each • {item.weight}g</div>
                    </div>
                    <QtyControl value={item.quantity} onChange={d => updateQty(item.barcode, d)} />
                    <div style={{ minWidth:64, textAlign:'right', fontWeight:700, color:'var(--mint-dark)' }}>{fmtCurrency(item.price * item.quantity)}</div>
                  </div>
                ))}

                <div style={{ borderTop:'1px solid var(--border)', marginTop:16, paddingTop:16 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}>
                    <span>Subtotal</span><span>{fmtCurrency(total)}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:16, fontWeight:800, marginBottom:16 }}>
                    <span>Total</span><span style={{ color:'var(--mint-dark)' }}>{fmtCurrency(total)}</span>
                  </div>
                  <div style={{ marginBottom:12 }}>
                    <label style={{ fontSize:13, fontWeight:700, display:'block', marginBottom:6 }}>Actual Weight (grams) — from scale</label>
                    <input value={actualWeight} onChange={e => setActualWeight(e.target.value)} type="number" placeholder="e.g. 450" min="0"
                      style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1.5px solid var(--border)', fontSize:14, outline:'none', fontFamily:"'Nunito',sans-serif" }} />
                  </div>
                  <Btn variant="primary" size="lg" style={{ width:'100%', justifyContent:'center' }} onClick={doCheckout}>
                    ✅ Checkout & Generate Bill
                  </Btn>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>

      {/* Bill Modal */}
      <Modal open={billModal} onClose={() => setBillModal(false)} title={`Bill #${bill?.id || ''}`}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setBillModal(false)}>Close</Btn>
            {bill?.status !== 'WEIGHT_MISMATCH' && (
              <>
                <select value={payMethod} onChange={e => setPayMethod(e.target.value)}
                  style={{ padding:'8px 12px', borderRadius:8, border:'1.5px solid var(--border)', fontSize:13, fontFamily:"'Nunito',sans-serif" }}>
                  <option>UPI</option><option>CASH</option><option>CARD</option>
                </select>
                <Btn variant="primary" onClick={doPayment}>💳 Pay Now</Btn>
              </>
            )}
          </>
        }>
        {bill?.status === 'WEIGHT_MISMATCH' && <Alert type="danger">⚠️ Weight mismatch! Payment blocked until resolved.</Alert>}
        {(bill?.items || []).map((item, i) => (
          <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--border)', fontSize:14 }}>
            <span>{item.product?.emoji || '📦'} {item.product?.name || item.productName} × {item.quantity}</span>
            <span>{fmtCurrency(item.subtotal || item.price * item.quantity)}</span>
          </div>
        ))}
        <div style={{ display:'flex', justifyContent:'space-between', padding:'16px 0 0', fontSize:18, fontWeight:800 }}>
          <span>Total</span><span style={{ color:'var(--mint-dark)' }}>{fmtCurrency(bill?.totalAmount)}</span>
        </div>
        {bill?.expectedWeight > 0 && (
          <div style={{ marginTop:16, padding:12, background:'var(--surface2)', borderRadius:10, fontSize:13 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}><span style={{ color:'var(--text3)' }}>Expected Weight</span><span>{bill.expectedWeight}g</span></div>
            <div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ color:'var(--text3)' }}>Actual Weight</span><span>{bill.actualWeight || 0}g</span></div>
          </div>
        )}
      </Modal>
    </div>
  );
}
