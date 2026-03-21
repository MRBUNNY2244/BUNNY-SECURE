'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ToastContainer, { useToast } from '@/components/Toast';

export default function AdminPanel() {
  const [tab, setTab] = useState('pages');
  const [admin, setAdmin] = useState('');
  const [stats, setStats] = useState({});
  const [pages, setPages] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [pageApis, setPageApis] = useState([]);
  const { toast } = useToast();
  const router = useRouter();

  // Page form
  const [pTitle, setPTitle] = useState('');
  const [pSlug, setPSlug] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pEmoji, setPEmoji] = useState('📦');
  const [pColor, setPColor] = useState('#ff0000');
  const [pOrder, setPOrder] = useState(0);

  // API form
  const [aName, setAName] = useState('');
  const [aUrl, setAUrl] = useState('');
  const [aKey, setAKey] = useState('');
  const [aMethod, setAMethod] = useState('POST');
  const [aDisplay, setADisplay] = useState('cards');
  const [aBody, setABody] = useState('{}');

  // Settings form
  const [sCurPass, setSCurPass] = useState('');
  const [sNewUser, setSNewUser] = useState('');
  const [sNewPass, setSNewPass] = useState('');

  // AI
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetch('/api/auth/check').then(r=>r.json()).then(d=>{
      if(!d.loggedIn){router.replace('/raheel');return;}
      setAdmin(d.username);
      loadStats(); loadPages();
    });
  }, []);

  async function loadStats() {
    const d = await fetch('/api/stats').then(r=>r.json());
    setStats(d.stats || {});
    setLogs(d.recentLogins || []);
  }

  async function loadPages() {
    const d = await fetch('/api/pages?all=1').then(r=>r.json());
    setPages(d.pages || []);
  }

  async function loadPageApis(pageId) {
    const d = await fetch(`/api/pages/${pageId}/apis`).then(r=>r.json());
    setPageApis(d.apis || []);
  }

  async function addPage() {
    const slug = pSlug.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
    if(!pTitle||!slug){toast('Title aur slug dalo!','err');return;}
    const r = await fetch('/api/pages',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({title:pTitle,slug,description:pDesc,emoji:pEmoji,color:pColor,sort_order:pOrder})});
    const d = await r.json();
    if(!r.ok){toast('❌ '+d.error,'err');return;}
    toast('✅ Page & Block ban gaya!');
    setPTitle('');setPSlug('');setPDesc('');setPEmoji('📦');setPColor('#ff0000');
    loadPages(); loadStats();
  }

  async function deletePage(id) {
    if(!confirm('Page aur uski saari APIs delete ho jaengi. Sure?'))return;
    const r = await fetch(`/api/pages/${id}`,{method:'DELETE'});
    const d = await r.json();
    if(!r.ok){toast('❌ '+d.error,'err');return;}
    toast('🗑 Delete ho gaya!');
    if(selectedPage?.id===id){setSelectedPage(null);setPageApis([]);}
    loadPages(); loadStats();
  }

  async function toggleVis(id, cur) {
    await fetch(`/api/pages/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({is_visible:cur?0:1})});
    toast(cur?'👁 Hidden!':'✅ Visible!'); loadPages();
  }

  function openApiEditor(page) {
    setSelectedPage(page);
    loadPageApis(page.id);
    setTimeout(()=>document.getElementById('api-editor')?.scrollIntoView({behavior:'smooth'}),100);
  }

  async function addApi() {
    if(!selectedPage){toast('Pehle ek page select karo!','err');return;}
    if(!aName||!aUrl){toast('API name aur URL dalo!','err');return;}
    const r = await fetch(`/api/pages/${selectedPage.id}/apis`,{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({api_name:aName,api_url:aUrl,api_key:aKey,method:aMethod,display_type:aDisplay,body_template:aBody})
    });
    const d = await r.json();
    if(!r.ok){toast('❌ '+d.error,'err');return;}
    toast('✅ API add ho gayi!');
    setAName('');setAUrl('');setAKey('');setABody('{}');
    loadPageApis(selectedPage.id); loadStats();
  }

  async function deleteApi(apiId) {
    if(!confirm('API delete karo?'))return;
    await fetch(`/api/pages/${selectedPage.id}/apis/${apiId}`,{method:'DELETE'});
    toast('🗑 API delete ho gayi!');
    loadPageApis(selectedPage.id); loadStats();
  }

  async function callAI() {
    if(!aiPrompt){toast('Prompt likho!','err');return;}
    setAiLoading(true); setAiResult('');
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:800,messages:[{role:'user',content:aiPrompt}]})
      });
      const d = await r.json();
      setAiResult(d.content?.[0]?.text||'No response');
    } catch(e){setAiResult('Error: '+e.message);}
    setAiLoading(false);
  }

  async function changeCredentials() {
    if(!sCurPass){toast('Current password dalo!','err');return;}
    const r = await fetch('/api/auth/change-credentials',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({currentPassword:sCurPass,newUsername:sNewUser,newPassword:sNewPass})
    });
    const d = await r.json();
    if(!r.ok){toast('❌ '+d.error,'err');return;}
    toast('✅ '+d.message);
    setTimeout(()=>router.push('/raheel'),1500);
  }

  async function downloadBackup() {
    const d = await fetch('/api/pages?all=1').then(r=>r.json());
    const blob = new Blob([JSON.stringify(d,null,2)],{type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `bunny-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    toast('✅ Backup download ho gaya!');
  }

  async function doLogout() {
    await fetch('/api/auth/logout',{method:'POST'});
    router.push('/');
  }

  const inputCls = 'form-input';

  return (
    <>
      <div className="scanline"/>
      <ToastContainer/>
      <Navbar isAdmin onLogout={doLogout}/>

      {/* Header */}
      <div className="adm-header">
        <div>
          <h1 className="adm-title">⚙ ADMIN PANEL</h1>
          <p className="adm-sub">Welcome <span style={{color:'#ff0000'}}>{admin}</span> — Full control</p>
        </div>
        <div className="adm-stats">
          <div className="stat-box"><span className="stat-icon">📄</span><span className="stat-num">{stats.pages??'—'}</span><span className="stat-lbl">Pages</span></div>
          <div className="stat-box"><span className="stat-icon">⚡</span><span className="stat-num">{stats.totalApis??'—'}</span><span className="stat-lbl">APIs</span></div>
          <div className="stat-box"><span className="stat-icon">🚫</span><span className="stat-num">{stats.failedLogins??'—'}</span><span className="stat-lbl">Failed</span></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="adm-tabs">
        {[['pages','📄 PAGES & BLOCKS'],['ai','🤖 AI ASSISTANT'],['settings','⚙ SETTINGS'],['logs','📋 LOGS']].map(([id,lbl])=>(
          <button key={id} className={`tab-btn ${tab===id?'on':''}`} onClick={()=>setTab(id)}>{lbl}</button>
        ))}
      </div>

      {/* ── PAGES TAB ─────────────────────────────── */}
      {tab==='pages' && (
        <>
          <div className="adm-grid">
            {/* Add form */}
            <div className="adm-card">
              <div className="card-ttl">+ ADD NEW PAGE / BLOCK</div>
              <label className="form-label">TITLE *</label>
              <input className={inputCls} value={pTitle} onChange={e=>{setPTitle(e.target.value);if(!pSlug)setPSlug(e.target.value.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,''));}} placeholder="e.g. DATABASE"/>
              <label className="form-label">SLUG * (/page/your-slug)</label>
              <input className={inputCls} value={pSlug} onChange={e=>setPSlug(e.target.value)} placeholder="e.g. database"/>
              <label className="form-label">DESCRIPTION</label>
              <input className={inputCls} value={pDesc} onChange={e=>setPDesc(e.target.value)} placeholder="Short description..."/>
              <label className="form-label">EMOJI</label>
              <input className={inputCls} value={pEmoji} onChange={e=>setPEmoji(e.target.value)} placeholder="📦"/>
              <div style={{display:'flex',gap:8,alignItems:'flex-end'}}>
                <div style={{flex:1}}>
                  <label className="form-label">COLOR</label>
                  <input className={inputCls} value={pColor} onChange={e=>setPColor(e.target.value)} placeholder="#ff0000"/>
                </div>
                <input type="color" value={pColor} onChange={e=>setPColor(e.target.value)} style={{width:44,height:40,border:'none',background:'none',cursor:'pointer',borderRadius:7,flexShrink:0}}/>
              </div>
              <label className="form-label">SORT ORDER</label>
              <input className={inputCls} type="number" value={pOrder} onChange={e=>setPOrder(Number(e.target.value))} placeholder="0"/>
              <button className="btn-red" style={{width:'100%',marginTop:14,padding:12}} onClick={addPage}>+ CREATE PAGE & BLOCK</button>
            </div>

            {/* Pages list */}
            <div className="adm-card">
              <div className="card-ttl">ALL PAGES / BLOCKS ({pages.length})</div>
              <div className="items-list">
                {pages.length===0 ? <div className="list-empty">Koi page nahi. Add karo!</div> :
                  pages.map(p=>(
                    <div key={p.id} className="list-item">
                      <div className="li-info">
                        <div className="li-title">
                          <span>{p.emoji}</span>
                          <span>{p.title}</span>
                          <span style={{width:10,height:10,borderRadius:'50%',background:p.color,display:'inline-block',border:'1px solid rgba(255,255,255,.15)'}}/>
                          <span className={`badge ${p.is_visible?'badge-green':'badge-gray'}`}>{p.is_visible?'VISIBLE':'HIDDEN'}</span>
                        </div>
                        <div className="li-sub">/page/{p.slug}</div>
                      </div>
                      <div className="li-actions">
                        <button className="btn-sm" onClick={()=>openApiEditor(p)}>⚡ APIs</button>
                        <button className="btn-grn" onClick={()=>toggleVis(p.id,p.is_visible)}>{p.is_visible?'HIDE':'SHOW'}</button>
                        <button className="btn-del" onClick={()=>deletePage(p.id)}>DEL</button>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>

          {/* API Editor */}
          {selectedPage && (
            <div className="api-editor-box" id="api-editor">
              <div className="card-ttl">
                ⚡ APIs for: <span style={{color:'#fff'}}>{selectedPage.title}</span>
                <button className="btn-del" style={{float:'right',marginTop:-2}} onClick={()=>{setSelectedPage(null);setPageApis([]);}}>CLOSE ✕</button>
              </div>

              {/* Existing APIs */}
              {pageApis.length>0 && (
                <div style={{marginBottom:16}}>
                  <div style={{color:'#555',fontSize:10,letterSpacing:1,marginBottom:8}}>ADDED APIs ({pageApis.length})</div>
                  {pageApis.map((a,i)=>(
                    <div key={a.id} style={{background:'#0a0a0a',border:'1px solid rgba(255,255,255,.04)',borderRadius:8,padding:'10px 13px',marginBottom:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div>
                        <div style={{fontSize:11,fontWeight:700,color:'#ff9900'}}>{i+1}. {a.api_name} <span className="badge badge-orange">{a.method}</span> <span className="badge badge-orange">{a.display_type}</span></div>
                        <div style={{fontSize:10,color:'#333',marginTop:3,wordBreak:'break-all'}}>{a.api_url}</div>
                      </div>
                      <button className="btn-del" onClick={()=>deleteApi(a.id)}>DEL</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add API form */}
              <div className="add-api-form">
                <div className="add-api-ttl">+ ADD MORE API</div>
                <label className="form-label">API NAME *</label>
                <input className={inputCls} value={aName} onChange={e=>setAName(e.target.value)} placeholder="e.g. Search API, AI Chat..."/>
                <label className="form-label">API URL *</label>
                <input className={inputCls} value={aUrl} onChange={e=>setAUrl(e.target.value)} placeholder="https://api.example.com/v1/..."/>
                <label className="form-label">API KEY / TOKEN (optional)</label>
                <input className={inputCls} type="password" value={aKey} onChange={e=>setAKey(e.target.value)} placeholder="sk-... or Bearer token"/>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                  <div>
                    <label className="form-label">METHOD</label>
                    <select className={inputCls} value={aMethod} onChange={e=>setAMethod(e.target.value)}>
                      {['POST','GET','PUT','PATCH','DELETE'].map(m=><option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">DISPLAY TYPE</label>
                    <select className={inputCls} value={aDisplay} onChange={e=>setADisplay(e.target.value)}>
                      <option value="cards">Cards</option>
                      <option value="text">Text</option>
                      <option value="list">List</option>
                      <option value="table">Table</option>
                      <option value="raw">Raw JSON</option>
                    </select>
                  </div>
                </div>
                <label className="form-label">BODY TEMPLATE (JSON)</label>
                <textarea className="form-textarea" style={{minHeight:60}} value={aBody} onChange={e=>setABody(e.target.value)} placeholder='{"prompt":"{{input}}"}' />
                <div style={{marginTop:12,display:'flex',gap:10}}>
                  <button className="btn-grad" onClick={addApi}>+ ADD API</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── AI TAB ──────────────────────────────────── */}
      {tab==='ai' && (
        <div className="tab-body">
          <div className="adm-card" style={{maxWidth:700,margin:'0 auto'}}>
            <div className="card-ttl">🤖 AI ASSISTANT — Claude Powered</div>
            <p style={{color:'#444',fontSize:11,marginBottom:16}}>Website content, page ideas, API help — kuch bhi generate karo</p>
            <label className="form-label">PROMPT</label>
            <textarea className="form-textarea" style={{minHeight:110}} value={aiPrompt} onChange={e=>setAiPrompt(e.target.value)} placeholder="e.g. Database page ke liye achi description likho..."/>
            <button className="btn-red" style={{marginTop:12,padding:'11px 28px'}} onClick={callAI} disabled={aiLoading}>
              {aiLoading?'⏳ GENERATING...':'🤖 ASK AI'}
            </button>
            {aiResult && (
              <>
                <div className="ai-result">{aiResult}</div>
                <div style={{display:'flex',gap:10,marginTop:12}}>
                  <button className="btn-outline" style={{padding:'8px 16px',fontSize:11}} onClick={()=>{setPDesc(aiResult.substring(0,200));setTab('pages');toast('✅ Description copy ho gayi!');}}>USE AS DESCRIPTION</button>
                  <button className="btn-outline" style={{padding:'8px 16px',fontSize:11}} onClick={()=>setAiResult('')}>CLEAR</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── SETTINGS TAB ────────────────────────────── */}
      {tab==='settings' && (
        <div className="tab-body">
          <div className="settings-section">
            <div className="settings-ttl">🔐 CHANGE USERNAME & PASSWORD</div>
            <label className="form-label">CURRENT PASSWORD *</label>
            <input className={inputCls} type="password" value={sCurPass} onChange={e=>setSCurPass(e.target.value)} placeholder="Current password..."/>
            <label className="form-label">NEW USERNAME (blank = same rakhna)</label>
            <input className={inputCls} value={sNewUser} onChange={e=>setSNewUser(e.target.value)} placeholder="New username..."/>
            <label className="form-label">NEW PASSWORD (blank = same rakhna)</label>
            <input className={inputCls} type="password" value={sNewPass} onChange={e=>setSNewPass(e.target.value)} placeholder="Min 6 characters..."/>
            <button className="btn-red" style={{marginTop:14,padding:'11px 24px'}} onClick={changeCredentials}>SAVE CHANGES</button>
            <p style={{color:'#2a2a2a',fontSize:10,marginTop:10}}>⚠ Change ke baad auto logout ho jaoge.</p>
          </div>

          <div className="settings-section">
            <div className="settings-ttl">📧 RESET EMAIL</div>
            <p style={{color:'#555',fontSize:12,lineHeight:1.8}}>
              Password reset email:<br/>
              <span style={{color:'#ff0000'}}>kamibroken5@gmail.com</span><br/>
              <span style={{color:'#2a2a2a',fontSize:10}}>Change ke liye .env.local mein EMAIL_USER edit karo.</span>
            </p>
          </div>

          <div className="settings-section">
            <div className="settings-ttl">💾 DATA BACKUP</div>
            <p style={{color:'#555',fontSize:12,marginBottom:14}}>Sare pages aur APIs JSON file mein download karo.</p>
            <button className="btn-grad" onClick={downloadBackup}>⬇ DOWNLOAD BACKUP JSON</button>
          </div>
        </div>
      )}

      {/* ── LOGS TAB ────────────────────────────────── */}
      {tab==='logs' && (
        <div className="tab-body">
          <div className="adm-card" style={{maxWidth:750,margin:'0 auto'}}>
            <div className="card-ttl">📋 RECENT LOGIN ATTEMPTS</div>
            {logs.length===0 ? <div className="list-empty">Koi log nahi</div> : (
              <>
                <div className="log-row" style={{color:'#333',fontSize:10,letterSpacing:1}}>
                  <span>IP ADDRESS</span><span>TIME</span><span>STATUS</span>
                </div>
                {logs.map(l=>(
                  <div key={l.id} className={`log-row ${l.success?'log-ok':'log-fail'}`}>
                    <span style={{color:'#555',fontSize:10}}>{l.ip||'—'}</span>
                    <span style={{color:'#3a3a3a',fontSize:10}}>{new Date(l.timestamp).toLocaleString()}</span>
                    <span className={l.success?'log-ok-txt':'log-fail-txt'}>{l.success?'✅ OK':'❌ FAIL'}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
