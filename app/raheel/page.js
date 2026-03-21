'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function AdminLogin() {
  const [mode, setMode] = useState('login'); // login | forgot
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/check').then(r => r.json()).then(d => {
      if (d.loggedIn) router.replace('/raheel/panel');
    });
  }, []);

  async function doLogin() {
    setErr(''); setOk('');
    if (!username || !password) { setErr('Username aur password dono dalo!'); return; }
    setLoading(true);
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setOk('✅ Login successful! Redirecting...');
      setTimeout(() => router.push('/raheel/panel'), 800);
    } catch(e) { setErr('❌ ' + e.message); }
    setLoading(false);
  }

  async function doForgot() {
    setErr(''); setOk('');
    setLoading(true);
    try {
      const r = await fetch('/api/auth/forgot', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setOk('✅ ' + d.message);
    } catch(e) { setErr('❌ ' + e.message); }
    setLoading(false);
  }

  return (
    <>
      <div className="scanline" />
      <Navbar />
      <div className="login-page">
        <div className="login-card">
          <div className="login-icon">🔐</div>
          <h2 className="login-title">ADMIN LOGIN</h2>
          <p className="login-sub">Secured access — RAHEEL only</p>

          {err && <div className="alert-err">{err}</div>}
          {ok  && <div className="alert-ok">{ok}</div>}

          {mode === 'login' ? (
            <>
              <label className="form-label">USERNAME</label>
              <input className="form-input" value={username} onChange={e=>setUsername(e.target.value)}
                placeholder="Enter username..." autoComplete="off"
                onKeyDown={e=>e.key==='Enter'&&doLogin()} />

              <label className="form-label">PASSWORD</label>
              <div className="pw-wrap">
                <input className="form-input" type={showPw?'text':'password'} value={password}
                  onChange={e=>setPassword(e.target.value)} placeholder="Enter password..."
                  onKeyDown={e=>e.key==='Enter'&&doLogin()} />
                <button className="pw-eye" onClick={()=>setShowPw(p=>!p)}>👁</button>
              </div>

              <button className="btn-red" style={{width:'100%',marginTop:16,padding:13,fontSize:13,letterSpacing:2}}
                onClick={doLogin} disabled={loading}>
                {loading ? '⏳ Checking...' : 'ENTER →'}
              </button>

              <button className="forgot-link" onClick={()=>{setMode('forgot');setErr('');setOk('');}}>
                Forgot password? Send reset email →
              </button>

              <div className="login-footer">
                Default: <span style={{color:'#ff0000'}}>RAHEEL</span> / <span style={{color:'#ff0000'}}>BUNNY</span>
              </div>
            </>
          ) : (
            <>
              <div className="alert-info" style={{marginBottom:16}}>
                Reset link <strong>kamibroken5@gmail.com</strong> pe bheja jayega.<br/>
                <span style={{fontSize:10,color:'#555'}}>Link 30 minute valid rahega.</span>
              </div>

              <button className="btn-red" style={{width:'100%',padding:13,fontSize:13,letterSpacing:1}}
                onClick={doForgot} disabled={loading}>
                {loading ? '⏳ Sending...' : '📧 SEND RESET EMAIL'}
              </button>

              <button className="forgot-link" onClick={()=>{setMode('login');setErr('');setOk('');}}>
                ← Back to login
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
