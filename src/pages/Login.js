import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Btn, Input, Modal, Alert } from '../components/UI';
import toast from 'react-hot-toast';

export default function Login() {
  const { login, register } = useAuth();
  const nav = useNavigate();
  const [email, setEmail]       = useState('admin@gocart.com');
  const [password, setPassword] = useState('admin@123');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showReg, setShowReg]   = useState(false);
  const [reg, setReg] = useState({ name:'', email:'', phone:'', password:'' });

  const doLogin = async e => {
    e?.preventDefault();
    setLoading(true); setError('');
    const res = await login(email, password);
    setLoading(false);
    if (res.ok) { toast.success('Welcome back! 👋'); nav('/'); }
    else setError(res.message);
  };

  const doRegister = async () => {
    const res = await register(reg);
    if (res.ok) { toast.success('Account created! Please login.'); setShowReg(false); }
    else toast.error(res.message);
  };

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'linear-gradient(135deg,#F0FFF9,#EEF5FF,#F3EEFF)',
    }}>
      <div style={{
        background:'white', borderRadius:24, padding:44, width:420,
        boxShadow:'0 20px 60px rgba(0,0,0,.12)', animation:'slideUp .5s ease',
      }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:36 }}>
          <div style={{
            width:48, height:48, borderRadius:14,
            background:'linear-gradient(135deg,#00D9A3,#4DA6FF)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:24,
          }}>🛒</div>
          <div>
            <div style={{ fontSize:24, fontWeight:800, fontFamily:"'Space Grotesk',sans-serif" }}>GoCart</div>
            <div style={{ fontSize:12, color:'var(--text3)' }}>Smart Self-Checkout System</div>
          </div>
        </div>

        {error && <Alert type="danger">⚠️ {error}</Alert>}

        <form onSubmit={doLogin}>
          <Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@gocart.com" />
          <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, fontSize:13 }}>
            <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontWeight:600, color:'var(--text2)' }}>
              <input type="checkbox" defaultChecked /> Remember me
            </label>
            <span style={{ color:'var(--mint-dark)', fontWeight:700, cursor:'pointer' }}>Forgot password?</span>
          </div>

          <Btn variant="primary" size="lg" style={{ width:'100%', justifyContent:'center' }} disabled={loading}>
            {loading ? '⏳ Signing in...' : 'Sign In →'}
          </Btn>
          <Btn variant="ghost" size="lg"style={{ width:'100%', justifyContent:'center', marginTop:12 }}
            onClick={() => {
              const guest = {
                id: null,
                name: 'Guest User',
                  email: '',
                  role: 'GUEST'
               };
               localStorage.setItem(
                'gocart_user',
                JSON.stringify(guest)
              );
               window.location.href = '/';
            }}
          >
             👤 Continue as Guest
         </Btn>
  
        </form>

        <div style={{ textAlign:'center', marginTop:20, fontSize:13, color:'var(--text3)' }}>
          Don't have an account?{' '}
          <span style={{ color:'var(--mint-dark)', fontWeight:700, cursor:'pointer' }} onClick={() => setShowReg(true)}>Register</span>
        </div>

        <div style={{ marginTop:24, padding:14, background:'var(--surface2)', borderRadius:10, fontSize:12, color:'var(--text3)' }}>
          <b style={{ color:'var(--text2)' }}>Default Admin:</b> admin@gocart.com / admin@123
        </div>
      </div>

      {/* Register Modal */}
      <Modal open={showReg} onClose={() => setShowReg(false)} title="Create Account"
        footer={<><Btn variant="ghost" onClick={() => setShowReg(false)}>Cancel</Btn><Btn variant="primary" onClick={doRegister}>Create Account</Btn></>}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <Input label="Full Name *" value={reg.name} onChange={e => setReg({...reg, name:e.target.value})} placeholder="Arjun Kumar" />
          <Input label="Phone *" value={reg.phone} onChange={e => setReg({...reg, phone:e.target.value})} placeholder="9876543210" />
        </div>
        <Input label="Email *" type="email" value={reg.email} onChange={e => setReg({...reg, email:e.target.value})} placeholder="arjun@example.com" />
        <Input label="Password *" type="password" value={reg.password} onChange={e => setReg({...reg, password:e.target.value})} placeholder="••••••••" />
      </Modal>
    </div>
  );
}
