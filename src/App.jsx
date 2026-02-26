import { useState, useEffect, useCallback } from "react";
import {
  supabase, signIn, signUp, signOut,
  getEmployees, addEmployee, updateEmployee, deleteEmployee,
  getJobs, addJob, updateJob,
  getTickets, addTicket, updateTicket,
  getAnnouncements,
  getPayroll, runPayroll,
  getAnalytics,
} from "./supabase";

// ═══════════════════════════════════════════════════════════════
// NEXUS HR v2.0 — Real Backend (Supabase)
// ═══════════════════════════════════════════════════════════════

const C = {
  bg: "#080b10", surface: "#0f1218", surfaceAlt: "#141820",
  border: "#1c2230", accent: "#00e5a0", accentDim: "#00e5a015",
  gold: "#f5c842", goldDim: "#f5c84218",
  red: "#ff4d6d", redDim: "#ff4d6d18",
  blue: "#4d9fff", blueDim: "#4d9fff18",
  purple: "#b57bee", purpleDim: "#b57bee18",
  text: "#e8eaf0", textMuted: "#6b7280", textDim: "#2e3545",
};
const FM = "'Space Mono','Courier New',monospace";
const FD = "'Syne','Arial Black',sans-serif";

// ── Tiny UI atoms ─────────────────────────────────────────────

const Badge = ({ children, color = "accent" }) => {
  const m = {
    accent: [C.accentDim, C.accent], gold: [C.goldDim, C.gold],
    red: [C.redDim, C.red], blue: [C.blueDim, C.blue],
    purple: [C.purpleDim, C.purple], muted: [C.surfaceAlt, C.textMuted],
  };
  const [bg, fg] = m[color] || m.accent;
  return (
    <span style={{ background: bg, color: fg, border: `1px solid ${fg}33`,
      padding: "2px 8px", borderRadius: 4, fontSize: 11, fontFamily: FM,
      fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
};

const Av = ({ initials = "?", size = 36, color = C.accent }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0,
    background: `linear-gradient(135deg,${color}30,${color}10)`,
    border: `1.5px solid ${color}44`, display: "flex", alignItems: "center",
    justifyContent: "center", fontFamily: FM, fontSize: size * 0.33,
    fontWeight: 700, color, letterSpacing: "0.04em" }}>
    {initials}
  </div>
);

const Bar = ({ value, max = 100, color = C.accent, h = 4 }) => (
  <div style={{ background: C.border, borderRadius: 99, height: h, overflow: "hidden", width: "100%" }}>
    <div style={{ width: `${Math.min((value / max) * 100, 100)}%`, height: "100%",
      background: `linear-gradient(90deg,${color}88,${color})`, borderRadius: 99,
      transition: "width .5s ease" }} />
  </div>
);

const Spinner = ({ size = 16, color = C.accent }) => (
  <div style={{ width: size, height: size, border: `2px solid ${color}33`,
    borderTopColor: color, borderRadius: "50%", animation: "spin .7s linear infinite",
    flexShrink: 0 }} />
);

const Btn = ({ children, onClick, color = C.accent, variant = "solid", disabled, style: s = {}, size = "md" }) => {
  const pad = size === "sm" ? "6px 12px" : size === "lg" ? "13px 28px" : "9px 18px";
  const fs  = size === "sm" ? 11 : size === "lg" ? 13 : 12;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: variant === "solid" ? color : "transparent",
      color: variant === "solid" ? "#000" : color,
      border: `1px solid ${color}${variant === "ghost" ? "44" : ""}`,
      borderRadius: 8, padding: pad, fontFamily: FM, fontWeight: 700,
      fontSize: fs, cursor: disabled ? "default" : "pointer",
      opacity: disabled ? 0.45 : 1, transition: "all .15s",
      letterSpacing: "0.04em", display: "flex", alignItems: "center",
      gap: 7, whiteSpace: "nowrap", ...s,
    }}>{children}</button>
  );
};

const Input = ({ label, value, onChange, type = "text", placeholder = "", required }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ fontFamily: FM, fontSize: 10, color: C.textMuted,
      letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
      {label}{required && <span style={{ color: C.red }}> *</span>}
    </label>}
    <input type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} required={required}
      style={{ width: "100%", background: C.surfaceAlt, border: `1px solid ${C.border}`,
        borderRadius: 8, padding: "10px 14px", color: C.text, fontFamily: FM,
        fontSize: 12, outline: "none" }}
      onFocus={e => e.target.style.borderColor = C.accent}
      onBlur={e => e.target.style.borderColor = C.border}
    />
  </div>
);

const Modal = ({ title, onClose, children }) => (
  <div style={{ position: "fixed", inset: 0, background: "#000000aa", zIndex: 1000,
    display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    onClick={e => e.target === e.currentTarget && onClose()}>
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16,
      padding: 28, width: "100%", maxWidth: 480, maxHeight: "85vh", overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <span style={{ fontFamily: FD, fontWeight: 900, fontSize: 18, color: C.text }}>{title}</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: C.textMuted,
          fontSize: 20, cursor: "pointer", lineHeight: 1 }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

const Empty = ({ icon, text, sub }) => (
  <div style={{ textAlign: "center", padding: "60px 20px" }}>
    <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
    <div style={{ fontFamily: FD, fontSize: 16, color: C.text, marginBottom: 6 }}>{text}</div>
    <div style={{ fontFamily: FM, fontSize: 12, color: C.textMuted }}>{sub}</div>
  </div>
);

const Toast = ({ message, type = "success" }) => (
  <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999,
    background: type === "success" ? C.accentDim : C.redDim,
    border: `1px solid ${type === "success" ? C.accent : C.red}44`,
    borderRadius: 10, padding: "12px 20px", display: "flex", alignItems: "center", gap: 10,
    fontFamily: FM, fontSize: 12, color: type === "success" ? C.accent : C.red,
    boxShadow: "0 8px 32px #00000044" }}>
    <span>{type === "success" ? "✅" : "⚠️"}</span> {message}
  </div>
);

// ── useToast hook ─────────────────────────────────────────────
const useToast = () => {
  const [toast, setToast] = useState(null);
  const show = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);
  return { toast, show };
};

// ── Sign In / Sign Up Screen ──────────────────────────────────
const AuthScreen = ({ onAuth }) => {
  const [mode, setMode]         = useState("signin");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]         = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [mounted, setMounted]   = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    if (mode === "signin") {
      const { data, error: e } = await signIn(email, password);
      if (e) { setError(e.message); setLoading(false); }
      else onAuth(data.user);
    } else {
      if (!name.trim()) { setError("Name is required"); setLoading(false); return; }
      const { data, error: e } = await signUp(email, password, name);
      if (e) { setError(e.message); setLoading(false); }
      else if (data.user) onAuth(data.user);
      else { setError("Check your email to confirm your account"); setLoading(false); }
    }
  };

  const fu = (d = 0) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(18px)",
    transition: `opacity .5s ease ${d}s, transform .5s ease ${d}s`,
  });

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", fontFamily: FM }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:${C.bg}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes grid-move{to{transform:translate(48px,48px)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes pulse{0%{transform:scale(1);opacity:.5}100%{transform:scale(2.5);opacity:0}}
        .auth-input{width:100%;background:${C.surfaceAlt};border:1px solid ${C.border};border-radius:8px;padding:11px 15px;color:${C.text};font-family:${FM};font-size:13px;outline:none;transition:border-color .2s}
        .auth-input:focus{border-color:${C.accent}}
        .auth-input::placeholder{color:${C.textDim}}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:${C.bg}}
        ::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}
      `}</style>

      {/* LEFT — Branding */}
      <div style={{ width: "52%", background: C.surface, borderRight: `1px solid ${C.border}`,
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "60px 56px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: .05,
          backgroundImage: `linear-gradient(${C.accent} 1px,transparent 1px),linear-gradient(90deg,${C.accent} 1px,transparent 1px)`,
          backgroundSize: "48px 48px", animation: "grid-move 12s linear infinite" }} />
        <div style={{ position:"absolute",top:"20%",left:"15%",width:360,height:360,borderRadius:"50%",background:`radial-gradient(circle,${C.accent}12 0%,transparent 65%)`,pointerEvents:"none" }} />
        <div style={{ position:"absolute",bottom:"15%",right:"5%",width:260,height:260,borderRadius:"50%",background:`radial-gradient(circle,${C.purple}0d 0%,transparent 65%)`,pointerEvents:"none" }} />
        <div style={{ position:"absolute",top:"50%",left:"50%",width:120,height:120,marginLeft:-60,marginTop:-60,borderRadius:"50%",border:`1px solid ${C.accent}28`,animation:"pulse 4s ease-out infinite" }} />
        <div style={{ position:"absolute",top:"50%",left:"50%",width:120,height:120,marginLeft:-60,marginTop:-60,borderRadius:"50%",border:`1px solid ${C.accent}18`,animation:"pulse 4s ease-out 2s infinite" }} />

        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ ...fu(.05), display:"flex",alignItems:"center",gap:16,marginBottom:52 }}>
            <div style={{ width:52,height:52,borderRadius:14,background:`linear-gradient(135deg,${C.accent},${C.blue})`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FD,fontWeight:900,color:"#000",fontSize:22,boxShadow:`0 0 28px ${C.accent}44`,animation:"float 4s ease-in-out infinite" }}>N</div>
            <div>
              <div style={{ fontFamily:FD,fontWeight:900,fontSize:20,color:C.text,letterSpacing:"-0.02em" }}>NEXUS HR</div>
              <div style={{ fontFamily:FM,fontSize:9,color:C.accent,letterSpacing:"0.2em",marginTop:2 }}>OPEN SOURCE · v2.0</div>
            </div>
          </div>

          <div style={{ ...fu(.12),fontFamily:FD,fontWeight:900,fontSize:42,color:C.text,lineHeight:1.1,marginBottom:16,letterSpacing:"-0.03em" }}>
            HR Intelligence<br/><span style={{ color:C.accent }}>Built Different.</span>
          </div>
          <div style={{ ...fu(.2),fontFamily:FM,fontSize:12,color:C.textMuted,lineHeight:1.9,marginBottom:44,maxWidth:360 }}>
            The open-source HRMS that saves small teams from paying $200/month — free forever for core features, Pro when you scale.
          </div>

          {[
            { icon:"💸", text:"Save up to 85% vs BambooHR or Zoho" },
            { icon:"👥", text:"Real employee database — your data, your server" },
            { icon:"🧠", text:"AI attrition & burnout detection (Pro)" },
            { icon:"🔓", text:"MIT licensed — self-host, zero lock-in" },
          ].map((f, i) => (
            <div key={i} style={{ display:"flex",alignItems:"center",gap:12,marginBottom:12,
              opacity:mounted?1:0,transform:mounted?"translateX(0)":"translateX(-14px)",
              transition:`opacity .5s ease ${.28+i*.08}s,transform .5s ease ${.28+i*.08}s` }}>
              <span style={{ fontSize:16 }}>{f.icon}</span>
              <span style={{ fontFamily:FM,fontSize:11,color:C.textMuted }}>{f.text}</span>
            </div>
          ))}

          <div style={{ ...fu(.65),display:"flex",gap:32,marginTop:44,paddingTop:28,borderTop:`1px solid ${C.border}` }}>
            {[["MIT","License"],["100%","Free Core"],["5 min","Deploy"]].map(([v,l]) => (
              <div key={l}>
                <div style={{ fontFamily:FD,fontWeight:900,fontSize:22,color:C.accent }}>{v}</div>
                <div style={{ fontFamily:FM,fontSize:10,color:C.textMuted,marginTop:2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — Auth Form */}
      <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"60px 40px" }}>
        <div style={{ width:"100%",maxWidth:400 }}>
          {/* Mode toggle */}
          <div style={{ ...fu(.2),display:"flex",background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:4,marginBottom:32 }}>
            {["signin","signup"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); }}
                style={{ flex:1,padding:"9px",background:mode===m?C.accentDim:"transparent",
                  border:`1px solid ${mode===m?C.accent+"44":"transparent"}`,borderRadius:8,
                  color:mode===m?C.accent:C.textMuted,fontFamily:FM,fontSize:12,fontWeight:700,
                  cursor:"pointer",transition:"all .15s",letterSpacing:"0.04em" }}>
                {m === "signin" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <div style={{ ...fu(.28),marginBottom:28 }}>
            <div style={{ fontFamily:FD,fontWeight:900,fontSize:26,color:C.text,letterSpacing:"-0.02em",marginBottom:6 }}>
              {mode === "signin" ? "Welcome back" : "Get started free"}
            </div>
            <div style={{ fontFamily:FM,fontSize:12,color:C.textMuted }}>
              {mode === "signin" ? "Sign in to your workspace" : "Create your free Nexus HR workspace"}
            </div>
          </div>

          <div style={{ ...fu(.34) }}>
            {mode === "signup" && (
              <div style={{ marginBottom:14 }}>
                <label style={{ fontFamily:FM,fontSize:10,color:C.textMuted,letterSpacing:"0.1em",textTransform:"uppercase",display:"block",marginBottom:6 }}>Full Name *</label>
                <input className="auth-input" type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" onKeyDown={e=>e.key==="Enter"&&handleSubmit()} />
              </div>
            )}
            <div style={{ marginBottom:14 }}>
              <label style={{ fontFamily:FM,fontSize:10,color:C.textMuted,letterSpacing:"0.1em",textTransform:"uppercase",display:"block",marginBottom:6 }}>Email *</label>
              <input className="auth-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com" onKeyDown={e=>e.key==="Enter"&&handleSubmit()} />
            </div>
            <div style={{ marginBottom:8 }}>
              <label style={{ fontFamily:FM,fontSize:10,color:C.textMuted,letterSpacing:"0.1em",textTransform:"uppercase",display:"block",marginBottom:6 }}>Password *</label>
              <input className="auth-input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&handleSubmit()} />
            </div>

            <div style={{ height:30,display:"flex",alignItems:"center",opacity:error?1:0,transition:"opacity .2s" }}>
              <span style={{ fontFamily:FM,fontSize:11,color:C.red }}>⚠ {error}</span>
            </div>

            <button onClick={handleSubmit} disabled={loading||!email||!password}
              style={{ width:"100%",background:C.accent,color:"#000",border:"none",borderRadius:8,
                padding:"13px",fontFamily:FM,fontWeight:700,fontSize:13,cursor:loading?"default":"pointer",
                letterSpacing:"0.05em",opacity:(!email||!password)?0.45:1,
                display:"flex",alignItems:"center",justifyContent:"center",gap:10,transition:"all .2s" }}>
              {loading ? <><Spinner color="#000" /><span>Please wait...</span></> : mode === "signin" ? "Sign In →" : "Create Free Account →"}
            </button>
          </div>

          <div style={{ ...fu(.5),marginTop:24,textAlign:"center" }}>
            <a href="https://github.com/SamoTech/nexus-hr" target="_blank" rel="noreferrer"
              style={{ fontFamily:FM,fontSize:10,color:C.textDim,textDecoration:"none" }}>
              ★ github.com/SamoTech/nexus-hr · MIT License
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Nav config ────────────────────────────────────────────────
const NAV = [
  { id:"dashboard",   icon:"◉", label:"Dashboard",   free:true  },
  { id:"employees",   icon:"◈", label:"Employees",    free:true  },
  { id:"recruitment", icon:"◎", label:"Recruitment",  free:true  },
  { id:"payroll",     icon:"◆", label:"Payroll",      free:false },
  { id:"tickets",     icon:"◑", label:"Helpdesk",     free:true  },
  { id:"analytics",   icon:"◒", label:"Analytics",    free:false },
  { id:"settings",    icon:"◓", label:"Settings",     free:true  },
];

// ── Sidebar ───────────────────────────────────────────────────
const Sidebar = ({ active, setActive, isPro, user, onLogout }) => {
  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()
    : user?.email?.slice(0,2).toUpperCase() || "??";

  return (
    <div style={{ width:220,background:C.surface,borderRight:`1px solid ${C.border}`,
      display:"flex",flexDirection:"column",height:"100vh",position:"sticky",top:0,flexShrink:0 }}>
      <div style={{ padding:"22px 18px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12 }}>
        <div style={{ width:34,height:34,borderRadius:9,background:`linear-gradient(135deg,${C.accent},${C.blue})`,
          display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FD,fontWeight:900,color:"#000",fontSize:15 }}>N</div>
        <div>
          <div style={{ fontFamily:FD,fontWeight:900,fontSize:15,color:C.text,letterSpacing:"-0.02em" }}>NEXUS HR</div>
          <div style={{ fontFamily:FM,fontSize:9,color:C.accent,letterSpacing:"0.15em" }}>v2.0 LIVE</div>
        </div>
      </div>

      <nav style={{ flex:1,padding:"10px 10px",overflowY:"auto" }}>
        {NAV.map(item => {
          const locked = !item.free && !isPro;
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => setActive(item.id)} style={{
              width:"100%",display:"flex",alignItems:"center",gap:9,padding:"9px 10px",
              borderRadius:8,border:"none",marginBottom:2,
              background:isActive?C.accentDim:"transparent",
              color:isActive?C.accent:locked?C.textDim:C.textMuted,
              fontFamily:FM,fontSize:12,fontWeight:isActive?700:400,cursor:"pointer",textAlign:"left",
              transition:"all .15s",letterSpacing:"0.03em",
              borderLeft:`2px solid ${isActive?C.accent:"transparent"}`,
            }}
              onMouseEnter={e=>{ if(!isActive){e.currentTarget.style.background=C.surfaceAlt; e.currentTarget.style.color=locked?C.textDim:C.text;} }}
              onMouseLeave={e=>{ if(!isActive){e.currentTarget.style.background="transparent"; e.currentTarget.style.color=isActive?C.accent:locked?C.textDim:C.textMuted;} }}
            >
              <span style={{ fontSize:14,width:16,textAlign:"center" }}>{item.icon}</span>
              <span style={{ flex:1 }}>{item.label}</span>
              {locked && <span style={{ fontSize:9,color:C.gold,fontWeight:700 }}>PRO</span>}
            </button>
          );
        })}
      </nav>

      {!isPro && (
        <div style={{ padding:"10px 10px",borderTop:`1px solid ${C.border}` }}>
          <div style={{ background:C.goldDim,border:`1px solid ${C.gold}30`,borderRadius:10,padding:"12px" }}>
            <div style={{ fontFamily:FM,fontSize:9,color:C.gold,fontWeight:700,letterSpacing:"0.12em",marginBottom:4 }}>⭐ NEXUS PRO</div>
            <div style={{ fontFamily:FM,fontSize:11,color:C.textMuted,marginBottom:10 }}>AI analytics, payroll engine & more</div>
            <button style={{ width:"100%",background:C.gold,color:"#000",border:"none",borderRadius:6,padding:"7px",fontFamily:FM,fontWeight:700,fontSize:11,cursor:"pointer" }}>Upgrade →</button>
          </div>
        </div>
      )}

      <div style={{ padding:"12px 14px",borderTop:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10 }}>
        <Av initials={initials} size={32} color={C.purple} />
        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ fontFamily:FM,fontSize:11,color:C.text,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
            {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User"}
          </div>
          <div style={{ fontFamily:FM,fontSize:10,color:C.textMuted }}>HR Admin</div>
        </div>
        <button onClick={onLogout} title="Sign out" style={{ background:"none",border:"none",color:C.textMuted,cursor:"pointer",fontSize:14,padding:4 }}
          onMouseEnter={e=>e.currentTarget.style.color=C.red}
          onMouseLeave={e=>e.currentTarget.style.color=C.textMuted}>↩</button>
      </div>
    </div>
  );
};

// ── Dashboard ─────────────────────────────────────────────────
const Dashboard = ({ user, isPro }) => {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  useEffect(() => {
    getAnalytics().then(s => { setStats(s); setLoading(false); });
  }, []);

  const MetCard = ({ label, value, icon, color = C.accent, change }) => (
    <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:20,flex:1,minWidth:0,position:"relative",overflow:"hidden" }}
      onMouseEnter={e=>e.currentTarget.style.borderColor=color+"55"}
      onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
      <div style={{ position:"absolute",top:0,right:0,width:80,height:80,background:`radial-gradient(circle at top right,${color}15,transparent)` }} />
      <div style={{ fontFamily:FM,fontSize:10,color:C.textMuted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10,display:"flex",justifyContent:"space-between" }}>
        <span>{label}</span><span style={{ fontSize:18 }}>{icon}</span>
      </div>
      {loading ? <Spinner /> : <div style={{ fontFamily:FD,fontSize:30,fontWeight:900,color,lineHeight:1 }}>{value}</div>}
      {change && !loading && <div style={{ fontFamily:FM,fontSize:11,color:C.accent,marginTop:6 }}>{change}</div>}
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <div style={{ fontFamily:FD,fontSize:26,fontWeight:900,color:C.text,letterSpacing:"-0.02em" }}>Good morning, {firstName} 👋</div>
        <div style={{ fontFamily:FM,fontSize:12,color:C.textMuted,marginTop:4 }}>
          {new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}
          {stats && ` · ${stats.totalEmployees} employees · ${stats.atRiskCount} at-risk flagged`}
        </div>
      </div>

      <div style={{ display:"flex",gap:14,marginBottom:20,flexWrap:"wrap" }}>
        <MetCard label="Total Employees" value={stats?.totalEmployees ?? "—"} icon="👥" color={C.accent} />
        <MetCard label="Open Positions"  value={stats?.activeJobs ?? "—"}     icon="📋" color={C.blue} />
        <MetCard label="Avg Performance" value={stats?.avgPerformance ? `${stats.avgPerformance}%` : "—"} icon="📈" color={C.purple} />
        <MetCard label="Open Tickets"    value={stats?.openTickets ?? "—"}    icon="🎫" color={C.gold} />
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
        {/* Dept Breakdown */}
        <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:20 }}>
          <div style={{ fontFamily:FD,fontSize:14,fontWeight:700,color:C.text,marginBottom:16 }}>Department Breakdown</div>
          {loading ? <Spinner /> : stats?.deptBreakdown && Object.keys(stats.deptBreakdown).length > 0
            ? Object.entries(stats.deptBreakdown).map(([dept, count], i) => {
                const colors = [C.accent, C.blue, C.purple, C.gold, C.red, C.textMuted];
                const col = colors[i % colors.length];
                const max = Math.max(...Object.values(stats.deptBreakdown));
                return (
                  <div key={dept} style={{ marginBottom:10 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                      <span style={{ fontFamily:FM,fontSize:11,color:C.textMuted }}>{dept}</span>
                      <span style={{ fontFamily:FM,fontSize:11,color:col,fontWeight:700 }}>{count}</span>
                    </div>
                    <Bar value={count} max={max} color={col} />
                  </div>
                );
              })
            : <Empty icon="🏢" text="No departments yet" sub="Add employees to see breakdown" />
          }
        </div>

        {/* Quick Actions */}
        <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:20 }}>
          <div style={{ fontFamily:FD,fontSize:14,fontWeight:700,color:C.text,marginBottom:16 }}>Quick Actions</div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
            {[
              { label:"Add Employee", icon:"➕", color:C.accent },
              { label:"Post Job",     icon:"📢", color:C.blue  },
              { label:"Run Payroll",  icon:"💰", color:C.gold, pro:true },
              { label:"New Ticket",   icon:"🎫", color:C.purple },
            ].map(a => (
              <button key={a.label} style={{ background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:8,padding:12,cursor:"pointer",display:"flex",alignItems:"center",gap:8,color:a.pro&&!isPro?C.textDim:C.text,fontFamily:FM,fontSize:12,textAlign:"left",transition:"all .15s" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=a.color+"55"}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border}}>
                <span style={{ fontSize:16 }}>{a.icon}</span>
                <span>{a.label}</span>
                {a.pro&&!isPro&&<span style={{ marginLeft:"auto",fontSize:9,color:C.gold }}>PRO</span>}
              </button>
            ))}
          </div>

          {stats && (
            <div style={{ marginTop:16,background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:8,padding:14 }}>
              <div style={{ fontFamily:FM,fontSize:10,color:C.textMuted,marginBottom:8,letterSpacing:"0.08em",textTransform:"uppercase" }}>Payroll Summary</div>
              <div style={{ fontFamily:FD,fontSize:24,fontWeight:900,color:C.gold }}>
                ${(stats.totalPayroll || 0).toLocaleString()}
              </div>
              <div style={{ fontFamily:FM,fontSize:11,color:C.textMuted,marginTop:4 }}>Total paid out (all time)</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Employees ─────────────────────────────────────────────────
const Employees = ({ isPro, showToast }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [saving, setSaving]       = useState(false);
  const [selected, setSelected]   = useState(null);

  const blank = { name:"",role:"",department:"",email:"",salary:"",status:"active",performance:80,mood:"😊",risk_level:"low",skills:"" };
  const [form, setForm] = useState(blank);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await getEmployees();
    setEmployees(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd  = ()    => { setForm(blank); setEditing(null); setShowModal(true); };
  const openEdit = (emp) => {
    setForm({ ...emp, skills: Array.isArray(emp.skills) ? emp.skills.join(", ") : (emp.skills||"") });
    setEditing(emp.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = {
      ...form,
      salary: parseInt(form.salary) || 0,
      performance: parseInt(form.performance) || 80,
      skills: form.skills ? form.skills.split(",").map(s=>s.trim()).filter(Boolean) : [],
    };
    if (editing) {
      const { error } = await updateEmployee(editing, payload);
      if (!error) { showToast("Employee updated ✅"); load(); }
      else showToast(error.message, "error");
    } else {
      const { error } = await addEmployee(payload);
      if (!error) { showToast("Employee added ✅"); load(); }
      else showToast(error.message, "error");
    }
    setSaving(false);
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this employee?")) return;
    const { error } = await deleteEmployee(id);
    if (!error) { showToast("Employee deleted"); load(); setSelected(null); }
    else showToast(error.message, "error");
  };

  const filtered = employees.filter(e =>
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.role?.toLowerCase().includes(search.toLowerCase()) ||
    e.department?.toLowerCase().includes(search.toLowerCase())
  );

  const sel = selected ? employees.find(e => e.id === selected) : null;

  return (
    <div style={{ display:"grid", gridTemplateColumns: sel ? "1fr 320px" : "1fr", gap:16 }}>
      <div>
        <div style={{ display:"flex",gap:12,marginBottom:20,alignItems:"center",flexWrap:"wrap" }}>
          <div style={{ fontFamily:FD,fontSize:22,fontWeight:900,color:C.text,flex:1 }}>People Directory</div>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 14px",color:C.text,fontFamily:FM,fontSize:12,outline:"none",width:180 }} />
          <Btn onClick={openAdd} color={C.accent}>+ Add Employee</Btn>
        </div>

        {loading ? (
          <div style={{ display:"flex",justifyContent:"center",padding:60 }}><Spinner size={32} /></div>
        ) : filtered.length === 0 ? (
          <Empty icon="👥" text="No employees yet" sub='Click "+ Add Employee" to get started' />
        ) : (
          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            {filtered.map(emp => (
              <div key={emp.id} onClick={() => setSelected(selected===emp.id?null:emp.id)}
                style={{ background:selected===emp.id?C.accentDim:C.surface,
                  border:`1px solid ${selected===emp.id?C.accent+"44":C.border}`,
                  borderRadius:10,padding:"14px 16px",display:"flex",alignItems:"center",
                  gap:14,cursor:"pointer",transition:"all .15s" }}
                onMouseEnter={e=>{if(selected!==emp.id)e.currentTarget.style.borderColor=C.accent+"33"}}
                onMouseLeave={e=>{if(selected!==emp.id)e.currentTarget.style.borderColor=C.border}}>
                <Av initials={(emp.name||"??").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
                  size={42} color={emp.risk_level==="high"?C.red:emp.risk_level==="medium"?C.gold:C.accent} />
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:2 }}>
                    <span style={{ fontFamily:FD,fontSize:14,fontWeight:700,color:C.text }}>{emp.name}</span>
                    <span style={{ fontSize:13 }}>{emp.mood}</span>
                    {emp.risk_level==="high" && <Badge color="red">At Risk</Badge>}
                    {emp.risk_level==="medium" && <Badge color="gold">Watch</Badge>}
                  </div>
                  <div style={{ fontFamily:FM,fontSize:11,color:C.textMuted }}>{emp.role}{emp.department?` · ${emp.department}`:""}</div>
                </div>
                <div style={{ textAlign:"right",flexShrink:0 }}>
                  <div style={{ fontFamily:FD,fontSize:18,fontWeight:900,
                    color:emp.performance>85?C.accent:emp.performance>70?C.gold:C.red }}>
                    {emp.performance}%
                  </div>
                  <div style={{ fontFamily:FM,fontSize:10,color:C.textMuted }}>Performance</div>
                </div>
                <Badge color={emp.status==="active"?"accent":emp.status==="remote"?"blue":emp.status==="leave"?"gold":"muted"}>
                  {emp.status||"active"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {sel && (
        <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:20,height:"fit-content",position:"sticky",top:20 }}>
          <button onClick={()=>setSelected(null)} style={{ background:"none",border:"none",color:C.textMuted,fontFamily:FM,fontSize:12,cursor:"pointer",marginBottom:16,padding:0 }}>← Close</button>
          <div style={{ display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",marginBottom:20 }}>
            <Av initials={(sel.name||"??").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()} size={64} color={sel.risk_level==="high"?C.red:C.accent} />
            <div style={{ marginTop:10 }}>
              <div style={{ fontFamily:FD,fontSize:18,fontWeight:900,color:C.text }}>{sel.name}</div>
              <div style={{ fontFamily:FM,fontSize:12,color:C.textMuted }}>{sel.role}{sel.department?` · ${sel.department}`:""}</div>
            </div>
          </div>
          {[
            { label:"Email",    value: sel.email||"—" },
            { label:"Status",   value: sel.status||"active" },
            { label:"Joined",   value: sel.joined_date||"—" },
            { label:"Leaves",   value: `${sel.leaves_taken||0} days` },
            { label:"Salary",   value: isPro ? `$${(sel.salary||0).toLocaleString()}/yr` : "****" },
          ].map(r => (
            <div key={r.label} style={{ display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}` }}>
              <span style={{ fontFamily:FM,fontSize:11,color:C.textMuted }}>{r.label}</span>
              <span style={{ fontFamily:FM,fontSize:11,color:C.text,fontWeight:700 }}>{r.value}</span>
            </div>
          ))}
          {sel.skills?.length > 0 && (
            <div style={{ marginTop:14 }}>
              <div style={{ fontFamily:FM,fontSize:10,color:C.textMuted,marginBottom:8,letterSpacing:"0.08em",textTransform:"uppercase" }}>Skills</div>
              <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
                {sel.skills.map(s => <Badge key={s} color="muted">{s}</Badge>)}
              </div>
            </div>
          )}
          <div style={{ marginTop:16 }}>
            <Bar value={sel.performance||80} color={sel.performance>85?C.accent:sel.performance>70?C.gold:C.red} h={6} />
            <div style={{ fontFamily:FM,fontSize:11,color:C.textMuted,marginTop:6 }}>{sel.performance||80}% performance score</div>
          </div>
          <div style={{ display:"flex",gap:8,marginTop:16 }}>
            <Btn onClick={()=>openEdit(sel)} color={C.accent} variant="ghost" style={{ flex:1,justifyContent:"center" }}>Edit</Btn>
            <Btn onClick={()=>handleDelete(sel.id)} color={C.red} variant="ghost" style={{ flex:1,justifyContent:"center" }}>Delete</Btn>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal title={editing ? "Edit Employee" : "Add New Employee"} onClose={()=>setShowModal(false)}>
          <Input label="Full Name" value={form.name} onChange={v=>setForm({...form,name:v})} required />
          <Input label="Job Title / Role" value={form.role} onChange={v=>setForm({...form,role:v})} />
          <Input label="Department" value={form.department} onChange={v=>setForm({...form,department:v})} />
          <Input label="Email" type="email" value={form.email} onChange={v=>setForm({...form,email:v})} />
          <Input label="Annual Salary ($)" type="number" value={form.salary} onChange={v=>setForm({...form,salary:v})} />
          <Input label="Performance Score (0-100)" type="number" value={form.performance} onChange={v=>setForm({...form,performance:v})} />
          <Input label="Skills (comma separated)" value={form.skills} onChange={v=>setForm({...form,skills:v})} placeholder="React, Node, AWS" />
          <div style={{ marginBottom:14 }}>
            <label style={{ fontFamily:FM,fontSize:10,color:C.textMuted,letterSpacing:"0.1em",textTransform:"uppercase",display:"block",marginBottom:6 }}>Status</label>
            <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}
              style={{ width:"100%",background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",color:C.text,fontFamily:FM,fontSize:12,outline:"none" }}>
              {["active","remote","leave","inactive"].map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ fontFamily:FM,fontSize:10,color:C.textMuted,letterSpacing:"0.1em",textTransform:"uppercase",display:"block",marginBottom:6 }}>Risk Level</label>
            <select value={form.risk_level} onChange={e=>setForm({...form,risk_level:e.target.value})}
              style={{ width:"100%",background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",color:C.text,fontFamily:FM,fontSize:12,outline:"none" }}>
              {["low","medium","high"].map(r=><option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <Btn onClick={handleSave} disabled={saving||!form.name.trim()} color={C.accent} style={{ width:"100%",justifyContent:"center" }} size="lg">
            {saving ? <><Spinner color="#000" /><span>Saving...</span></> : editing ? "Save Changes" : "Add Employee"}
          </Btn>
        </Modal>
      )}
    </div>
  );
};

// ── Recruitment ───────────────────────────────────────────────
const Recruitment = ({ showToast }) => {
  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]   = useState(false);
  const blank = { title:"",department:"",priority:"medium",stage:"Screening",status:"active",applicants:0,description:"" };
  const [form, setForm] = useState(blank);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await getJobs();
    setJobs(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const { error } = await addJob({ ...form, applicants: parseInt(form.applicants)||0 });
    if (!error) { showToast("Job posted ✅"); load(); setShowModal(false); setForm(blank); }
    else showToast(error.message,"error");
    setSaving(false);
  };

  const stages = ["Screening","Interview","Assessment","Offer"];

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24 }}>
        <div style={{ fontFamily:FD,fontSize:22,fontWeight:900,color:C.text }}>Recruitment Pipeline</div>
        <Btn onClick={()=>setShowModal(true)} color={C.accent}>+ Post Job</Btn>
      </div>

      <div style={{ display:"flex",gap:14,marginBottom:24 }}>
        {[
          { label:"Active Jobs",    value:jobs.filter(j=>j.status==="active").length,              color:C.accent },
          { label:"Total Applicants",value:jobs.reduce((s,j)=>s+(j.applicants||0),0),             color:C.blue },
          { label:"In Interview",   value:jobs.filter(j=>j.stage==="Interview").length,            color:C.purple },
          { label:"Offers Out",     value:jobs.filter(j=>j.stage==="Offer").length,                color:C.gold },
        ].map(m => (
          <div key={m.label} style={{ flex:1,background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:16 }}>
            <div style={{ fontFamily:FM,fontSize:10,color:C.textMuted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8 }}>{m.label}</div>
            {loading ? <Spinner /> : <div style={{ fontFamily:FD,fontSize:28,fontWeight:900,color:m.color }}>{m.value}</div>}
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ display:"flex",justifyContent:"center",padding:60 }}><Spinner size={32} /></div>
      ) : jobs.length === 0 ? (
        <Empty icon="📋" text="No job postings yet" sub='Click "+ Post Job" to create your first posting' />
      ) : (
        <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12 }}>
          {stages.map(stage => (
            <div key={stage} style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:14 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
                <div style={{ fontFamily:FM,fontSize:10,fontWeight:700,color:C.textMuted,letterSpacing:"0.08em",textTransform:"uppercase" }}>{stage}</div>
                <Badge color="muted">{jobs.filter(j=>j.stage===stage).length}</Badge>
              </div>
              {jobs.filter(j=>j.stage===stage).map(job => (
                <div key={job.id} style={{ background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:8,padding:12,marginBottom:8 }}>
                  <div style={{ fontFamily:FM,fontSize:12,fontWeight:700,color:C.text,marginBottom:6 }}>{job.title}</div>
                  <div style={{ fontFamily:FM,fontSize:11,color:C.textMuted,marginBottom:8 }}>{job.department}</div>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                    <span style={{ fontFamily:FM,fontSize:11,color:C.blue }}>👤 {job.applicants||0}</span>
                    <Badge color={job.priority==="high"?"red":job.priority==="medium"?"gold":"muted"}>{job.priority}</Badge>
                  </div>
                </div>
              ))}
              {jobs.filter(j=>j.stage===stage).length===0 && (
                <div style={{ fontFamily:FM,fontSize:11,color:C.textDim,textAlign:"center",padding:"20px 0" }}>Empty</div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="Post New Job" onClose={()=>setShowModal(false)}>
          <Input label="Job Title" value={form.title} onChange={v=>setForm({...form,title:v})} required />
          <Input label="Department" value={form.department} onChange={v=>setForm({...form,department:v})} />
          <Input label="Number of Applicants" type="number" value={form.applicants} onChange={v=>setForm({...form,applicants:v})} />
          <div style={{ marginBottom:14 }}>
            <label style={{ fontFamily:FM,fontSize:10,color:C.textMuted,letterSpacing:"0.1em",textTransform:"uppercase",display:"block",marginBottom:6 }}>Priority</label>
            <select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}
              style={{ width:"100%",background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",color:C.text,fontFamily:FM,fontSize:12,outline:"none" }}>
              {["low","medium","high"].map(p=><option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ fontFamily:FM,fontSize:10,color:C.textMuted,letterSpacing:"0.1em",textTransform:"uppercase",display:"block",marginBottom:6 }}>Pipeline Stage</label>
            <select value={form.stage} onChange={e=>setForm({...form,stage:e.target.value})}
              style={{ width:"100%",background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",color:C.text,fontFamily:FM,fontSize:12,outline:"none" }}>
              {stages.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <Btn onClick={handleSave} disabled={saving||!form.title.trim()} color={C.accent} style={{ width:"100%",justifyContent:"center" }} size="lg">
            {saving ? <><Spinner color="#000" /><span>Posting...</span></> : "Post Job"}
          </Btn>
        </Modal>
      )}
    </div>
  );
};

// ── Helpdesk ──────────────────────────────────────────────────
const Helpdesk = ({ showToast }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]   = useState(false);
  const blank = { title:"",employee_name:"",type:"General",priority:"medium",description:"" };
  const [form, setForm] = useState(blank);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await getTickets();
    setTickets(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const { error } = await addTicket({ ...form, status:"open" });
    if (!error) { showToast("Ticket created ✅"); load(); setShowModal(false); setForm(blank); }
    else showToast(error.message,"error");
    setSaving(false);
  };

  const handleStatus = async (id, status) => {
    const { error } = await updateTicket(id, { status });
    if (!error) { showToast(`Ticket marked ${status} ✅`); load(); }
  };

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24 }}>
        <div style={{ fontFamily:FD,fontSize:22,fontWeight:900,color:C.text }}>Employee Helpdesk</div>
        <Btn onClick={()=>setShowModal(true)} color={C.accent}>+ New Ticket</Btn>
      </div>

      <div style={{ display:"flex",gap:14,marginBottom:24 }}>
        {[
          { label:"Open",         value:tickets.filter(t=>t.status==="open").length,        color:C.red   },
          { label:"In Progress",  value:tickets.filter(t=>t.status==="in-progress").length, color:C.gold  },
          { label:"Resolved",     value:tickets.filter(t=>t.status==="resolved").length,    color:C.accent},
          { label:"Total",        value:tickets.length,                                      color:C.blue  },
        ].map(m => (
          <div key={m.label} style={{ flex:1,background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:16 }}>
            <div style={{ fontFamily:FM,fontSize:10,color:C.textMuted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8 }}>{m.label}</div>
            {loading ? <Spinner /> : <div style={{ fontFamily:FD,fontSize:28,fontWeight:900,color:m.color }}>{m.value}</div>}
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ display:"flex",justifyContent:"center",padding:60 }}><Spinner size={32} /></div>
      ) : tickets.length === 0 ? (
        <Empty icon="🎫" text="No tickets yet" sub='Click "+ New Ticket" to submit a request' />
      ) : (
        <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
          {tickets.map(t => (
            <div key={t.id} style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:16,display:"flex",alignItems:"center",gap:14 }}>
              <div style={{ fontFamily:FM,fontSize:10,color:C.textMuted,fontWeight:700,flexShrink:0 }}>#{t.id?.slice(-6)||"------"}</div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontFamily:FM,fontSize:13,fontWeight:700,color:C.text,marginBottom:2 }}>{t.title}</div>
                <div style={{ fontFamily:FM,fontSize:11,color:C.textMuted }}>{t.employee_name||"Unknown"} · {new Date(t.created_at).toLocaleDateString()}</div>
              </div>
              <Badge color="muted">{t.type||"General"}</Badge>
              <Badge color={t.priority==="high"?"red":t.priority==="medium"?"gold":"muted"}>{t.priority}</Badge>
              <Badge color={t.status==="resolved"?"accent":t.status==="in-progress"?"blue":"red"}>{t.status}</Badge>
              {t.status !== "resolved" && (
                <select onChange={e=>handleStatus(t.id, e.target.value)} defaultValue={t.status}
                  style={{ background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:6,padding:"5px 10px",color:C.text,fontFamily:FM,fontSize:11,outline:"none",cursor:"pointer" }}>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="New Support Ticket" onClose={()=>setShowModal(false)}>
          <Input label="Issue Title" value={form.title} onChange={v=>setForm({...form,title:v})} required />
          <Input label="Employee Name" value={form.employee_name} onChange={v=>setForm({...form,employee_name:v})} />
          <div style={{ marginBottom:14 }}>
            <label style={{ fontFamily:FM,fontSize:10,color:C.textMuted,letterSpacing:"0.1em",textTransform:"uppercase",display:"block",marginBottom:6 }}>Type</label>
            <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}
              style={{ width:"100%",background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",color:C.text,fontFamily:FM,fontSize:12,outline:"none" }}>
              {["General","Payroll","IT","Leave","Performance","Other"].map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ fontFamily:FM,fontSize:10,color:C.textMuted,letterSpacing:"0.1em",textTransform:"uppercase",display:"block",marginBottom:6 }}>Priority</label>
            <select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}
              style={{ width:"100%",background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",color:C.text,fontFamily:FM,fontSize:12,outline:"none" }}>
              {["low","medium","high"].map(p=><option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <Btn onClick={handleSave} disabled={saving||!form.title.trim()} color={C.accent} style={{ width:"100%",justifyContent:"center" }} size="lg">
            {saving ? <><Spinner color="#000" /><span>Submitting...</span></> : "Submit Ticket"}
          </Btn>
        </Modal>
      )}
    </div>
  );
};

// ── Payroll (Pro) ─────────────────────────────────────────────
const Payroll = ({ isPro, showToast }) => {
  const [payroll, setPayroll]     = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [form, setForm] = useState({ employee_id:"",month:"",base_salary:"",bonus:"0",deductions:"0" });

  const load = useCallback(async () => {
    setLoading(true);
    const [pr, er] = await Promise.all([getPayroll(), getEmployees()]);
    setPayroll(pr.data || []);
    setEmployees(er.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!isPro) return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:400,textAlign:"center" }}>
      <span style={{ fontSize:48,marginBottom:16 }}>💰</span>
      <div style={{ fontFamily:FD,fontSize:28,fontWeight:900,color:C.gold,marginBottom:8 }}>Payroll Engine</div>
      <div style={{ fontFamily:FM,fontSize:13,color:C.textMuted,maxWidth:360,marginBottom:24,lineHeight:1.8 }}>
        Automated payroll runs, pay slips, tax calculations, and anomaly detection — all powered by your real employee data.
      </div>
      <Btn color={C.gold} size="lg">Upgrade to Pro →</Btn>
    </div>
  );

  const handleRun = async () => {
    if (!form.employee_id || !form.month || !form.base_salary) return;
    setSaving(true);
    const { error } = await runPayroll(form.employee_id, form.month, parseInt(form.base_salary), parseInt(form.bonus)||0, parseInt(form.deductions)||0);
    if (!error) { showToast("Payroll processed ✅"); load(); setShowModal(false); }
    else showToast(error.message,"error");
    setSaving(false);
  };

  const totalPaid = payroll.reduce((s,p)=>s+(p.net_salary||0),0);

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24 }}>
        <div style={{ fontFamily:FD,fontSize:22,fontWeight:900,color:C.text }}>Payroll Engine ⭐</div>
        <Btn onClick={()=>setShowModal(true)} color={C.gold}>+ Run Payroll</Btn>
      </div>

      <div style={{ display:"flex",gap:14,marginBottom:24 }}>
        {[
          { label:"Total Paid Out",  value:`$${totalPaid.toLocaleString()}`,       color:C.gold   },
          { label:"Records",         value:payroll.length,                          color:C.accent },
          { label:"Employees",       value:employees.length,                        color:C.blue   },
          { label:"This Month",      value:payroll.filter(p=>p.month===new Date().toISOString().slice(0,7)).length+" runs", color:C.purple },
        ].map(m => (
          <div key={m.label} style={{ flex:1,background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:16 }}>
            <div style={{ fontFamily:FM,fontSize:10,color:C.textMuted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8 }}>{m.label}</div>
            {loading ? <Spinner /> : <div style={{ fontFamily:FD,fontSize:24,fontWeight:900,color:m.color }}>{m.value}</div>}
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ display:"flex",justifyContent:"center",padding:60 }}><Spinner size={32} /></div>
      ) : payroll.length === 0 ? (
        <Empty icon="💰" text="No payroll records" sub='Click "+ Run Payroll" to process your first payroll' />
      ) : (
        <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden" }}>
          <div style={{ padding:"14px 20px",borderBottom:`1px solid ${C.border}`,fontFamily:FD,fontSize:14,fontWeight:700,color:C.text }}>Payroll Records</div>
          {payroll.map(p => (
            <div key={p.id} style={{ display:"flex",alignItems:"center",gap:14,padding:"12px 20px",borderBottom:`1px solid ${C.border}` }}>
              <Av initials={(p.employees?.name||"??").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()} size={36} />
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:FM,fontSize:12,fontWeight:700,color:C.text }}>{p.employees?.name||"Unknown"}</div>
                <div style={{ fontFamily:FM,fontSize:11,color:C.textMuted }}>{p.employees?.role||""} · {p.month}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontFamily:FD,fontSize:16,fontWeight:900,color:C.gold }}>${(p.net_salary||0).toLocaleString()}</div>
                <div style={{ fontFamily:FM,fontSize:10,color:C.textMuted }}>net salary</div>
              </div>
              {p.bonus>0 && <Badge color="accent">+${p.bonus} bonus</Badge>}
              <Badge color="accent">{p.status}</Badge>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="Process Payroll" onClose={()=>setShowModal(false)}>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontFamily:FM,fontSize:10,color:C.textMuted,letterSpacing:"0.1em",textTransform:"uppercase",display:"block",marginBottom:6 }}>Employee *</label>
            <select value={form.employee_id} onChange={e=>setForm({...form,employee_id:e.target.value})}
              style={{ width:"100%",background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",color:C.text,fontFamily:FM,fontSize:12,outline:"none" }}>
              <option value="">Select employee...</option>
              {employees.map(e=><option key={e.id} value={e.id}>{e.name} — {e.role}</option>)}
            </select>
          </div>
          <Input label="Month (YYYY-MM)" value={form.month} onChange={v=>setForm({...form,month:v})} placeholder="2025-03" required />
          <Input label="Base Salary ($)" type="number" value={form.base_salary} onChange={v=>setForm({...form,base_salary:v})} required />
          <Input label="Bonus ($)" type="number" value={form.bonus} onChange={v=>setForm({...form,bonus:v})} />
          <Input label="Deductions ($)" type="number" value={form.deductions} onChange={v=>setForm({...form,deductions:v})} />
          {form.base_salary && (
            <div style={{ background:C.goldDim,border:`1px solid ${C.gold}33`,borderRadius:8,padding:14,marginBottom:20 }}>
              <div style={{ fontFamily:FM,fontSize:11,color:C.textMuted,marginBottom:4 }}>Net Salary Preview</div>
              <div style={{ fontFamily:FD,fontSize:24,fontWeight:900,color:C.gold }}>
                ${((parseInt(form.base_salary)||0) + (parseInt(form.bonus)||0) - (parseInt(form.deductions)||0)).toLocaleString()}
              </div>
            </div>
          )}
          <Btn onClick={handleRun} disabled={saving||!form.employee_id||!form.month||!form.base_salary} color={C.gold} style={{ width:"100%",justifyContent:"center" }} size="lg">
            {saving ? <><Spinner color="#000" /><span>Processing...</span></> : "Process Payroll ✅"}
          </Btn>
        </Modal>
      )}
    </div>
  );
};

// ── Analytics (Pro) ───────────────────────────────────────────
const Analytics = ({ isPro }) => {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPro) return;
    getAnalytics().then(s => { setStats(s); setLoading(false); });
  }, [isPro]);

  if (!isPro) return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:400,textAlign:"center" }}>
      <span style={{ fontSize:48,marginBottom:16 }}>🧠</span>
      <div style={{ fontFamily:FD,fontSize:28,fontWeight:900,color:C.purple,marginBottom:8 }}>AI Analytics</div>
      <div style={{ fontFamily:FM,fontSize:13,color:C.textMuted,maxWidth:360,marginBottom:24,lineHeight:1.8 }}>
        Real insights from your actual employee data — attrition risk, department trends, payroll analytics, and more.
      </div>
      <Btn color={C.purple} size="lg">Unlock AI Analytics →</Btn>
    </div>
  );

  if (loading) return <div style={{ display:"flex",justifyContent:"center",padding:80 }}><Spinner size={40} /></div>;

  return (
    <div>
      <div style={{ fontFamily:FD,fontSize:22,fontWeight:900,color:C.text,marginBottom:24 }}>Analytics ⭐ <span style={{ fontSize:13,color:C.textMuted,fontFamily:FM,fontWeight:400 }}>Live from your database</span></div>
      <div style={{ display:"flex",gap:14,marginBottom:24,flexWrap:"wrap" }}>
        {[
          { label:"Total Employees",  value:stats?.totalEmployees,  color:C.accent },
          { label:"Active Jobs",      value:stats?.activeJobs,      color:C.blue   },
          { label:"Total Applicants", value:stats?.totalApplicants, color:C.purple },
          { label:"Avg Performance",  value:`${stats?.avgPerformance||0}%`, color:C.gold },
          { label:"At Risk",          value:stats?.atRiskCount,     color:C.red    },
          { label:"Open Tickets",     value:stats?.openTickets,     color:C.gold   },
        ].map(m => (
          <div key={m.label} style={{ flex:"1 1 140px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:16 }}>
            <div style={{ fontFamily:FM,fontSize:10,color:C.textMuted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8 }}>{m.label}</div>
            <div style={{ fontFamily:FD,fontSize:28,fontWeight:900,color:m.color }}>{m.value ?? "—"}</div>
          </div>
        ))}
      </div>

      {stats?.deptBreakdown && Object.keys(stats.deptBreakdown).length > 0 && (
        <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:20,marginBottom:16 }}>
          <div style={{ fontFamily:FD,fontSize:14,fontWeight:700,color:C.text,marginBottom:16 }}>Headcount by Department</div>
          {Object.entries(stats.deptBreakdown).map(([dept,count],i) => {
            const colors = [C.accent,C.blue,C.purple,C.gold,C.red,C.textMuted];
            const col = colors[i%colors.length];
            const max = Math.max(...Object.values(stats.deptBreakdown));
            return (
              <div key={dept} style={{ marginBottom:12 }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
                  <span style={{ fontFamily:FM,fontSize:12,color:C.text }}>{dept}</span>
                  <span style={{ fontFamily:FD,fontSize:16,fontWeight:900,color:col }}>{count}</span>
                </div>
                <Bar value={count} max={max} color={col} h={6} />
              </div>
            );
          })}
        </div>
      )}

      <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:20 }}>
        <div style={{ fontFamily:FD,fontSize:14,fontWeight:700,color:C.text,marginBottom:12 }}>Total Payroll Paid</div>
        <div style={{ fontFamily:FD,fontSize:36,fontWeight:900,color:C.gold }}>${(stats?.totalPayroll||0).toLocaleString()}</div>
        <div style={{ fontFamily:FM,fontSize:12,color:C.textMuted,marginTop:6 }}>Across all payroll runs in the database</div>
      </div>
    </div>
  );
};

// ── Settings ──────────────────────────────────────────────────
const Settings = ({ user }) => (
  <div>
    <div style={{ fontFamily:FD,fontSize:22,fontWeight:900,color:C.text,marginBottom:24 }}>Settings</div>
    <div style={{ display:"grid",gridTemplateColumns:"200px 1fr",gap:20 }}>
      <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:12,height:"fit-content" }}>
        {["Account","Company","Security","Open Source"].map((s,i) => (
          <button key={s} style={{ width:"100%",textAlign:"left",background:i===0?C.accentDim:"none",border:"none",borderRadius:6,padding:"8px 10px",color:i===0?C.accent:C.textMuted,fontFamily:FM,fontSize:12,cursor:"pointer",marginBottom:2 }}>{s}</button>
        ))}
      </div>
      <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:24 }}>
        <div style={{ fontFamily:FD,fontSize:16,fontWeight:700,color:C.text,marginBottom:20 }}>Account Settings</div>
        <div style={{ marginBottom:16 }}>
          <label style={{ fontFamily:FM,fontSize:10,color:C.textMuted,letterSpacing:"0.1em",textTransform:"uppercase",display:"block",marginBottom:6 }}>Email</label>
          <div style={{ background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",color:C.textMuted,fontFamily:FM,fontSize:12 }}>{user?.email}</div>
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={{ fontFamily:FM,fontSize:10,color:C.textMuted,letterSpacing:"0.1em",textTransform:"uppercase",display:"block",marginBottom:6 }}>Name</label>
          <div style={{ background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",color:C.textMuted,fontFamily:FM,fontSize:12 }}>{user?.user_metadata?.full_name||"—"}</div>
        </div>
        <div style={{ background:C.accentDim,border:`1px solid ${C.accent}33`,borderRadius:8,padding:"12px 16px" }}>
          <div style={{ fontFamily:FM,fontSize:12,fontWeight:700,color:C.accent,marginBottom:4 }}>🔓 Open Source</div>
          <div style={{ fontFamily:FM,fontSize:11,color:C.textMuted }}>Nexus HR is MIT licensed. Fork, self-host, or contribute at <a href="https://github.com/SamoTech/nexus-hr" target="_blank" rel="noreferrer" style={{ color:C.accent }}>github.com/SamoTech/nexus-hr</a></div>
        </div>
      </div>
    </div>
  </div>
);

// ── Main App ──────────────────────────────────────────────────
export default function App() {
  const [user, setUser]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [active, setActive]     = useState("dashboard");
  const [fadeIn, setFadeIn]     = useState(false);
  const [isPro, setIsPro]       = useState(false);
  const { toast, show: showToast } = useToast();

  // Check existing session on mount
  useEffect(() => {
    getSession().then(session => {
      if (session?.user) { setUser(session.user); setFadeIn(true); }
      setLoading(false);
    });
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = (user) => {
    setUser(user);
    setTimeout(() => setFadeIn(true), 30);
  };

  const handleLogout = async () => {
    setFadeIn(false);
    setTimeout(async () => {
      await signOut();
      setUser(null);
      setActive("dashboard");
    }, 300);
  };

  if (loading) return (
    <div style={{ minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:40,height:40,border:`3px solid ${C.accent}33`,borderTopColor:C.accent,borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto 16px" }} />
        <div style={{ fontFamily:FM,fontSize:12,color:C.textMuted }}>Loading Nexus HR...</div>
      </div>
    </div>
  );

  if (!user) return <AuthScreen onAuth={handleAuth} />;

  const renderPage = () => {
    switch (active) {
      case "dashboard":   return <Dashboard user={user} isPro={isPro} />;
      case "employees":   return <Employees isPro={isPro} showToast={showToast} />;
      case "recruitment": return <Recruitment showToast={showToast} />;
      case "payroll":     return <Payroll isPro={isPro} showToast={showToast} />;
      case "tickets":     return <Helpdesk showToast={showToast} />;
      case "analytics":   return <Analytics isPro={isPro} />;
      case "settings":    return <Settings user={user} />;
      default:            return <Dashboard user={user} isPro={isPro} />;
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:${C.bg}}
        @keyframes spin{to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:${C.bg}}
        ::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}
      `}</style>
      <div style={{ display:"flex",minHeight:"100vh",background:C.bg,fontFamily:FM,
        opacity:fadeIn?1:0,transform:fadeIn?"translateY(0)":"translateY(10px)",
        transition:"opacity .4s ease,transform .4s ease" }}>
        <Sidebar active={active} setActive={setActive} isPro={isPro} user={user} onLogout={handleLogout} />
        <div style={{ flex:1,overflowY:"auto",minWidth:0 }}>
          {/* Topbar */}
          <div style={{ height:52,background:C.surface,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",paddingLeft:24,paddingRight:20,gap:12,position:"sticky",top:0,zIndex:100 }}>
            <div style={{ fontFamily:FM,fontSize:11,color:C.textMuted,flex:1,letterSpacing:"0.05em" }}>
              {NAV.find(n=>n.id===active)?.label.toUpperCase()}
            </div>
            {/* Pro toggle (demo) */}
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <span style={{ fontFamily:FM,fontSize:10,color:C.textDim }}>Pro Mode:</span>
              <button onClick={()=>setIsPro(!isPro)} style={{ background:isPro?C.goldDim:C.surfaceAlt,border:`1px solid ${isPro?C.gold+"44":C.border}`,color:isPro?C.gold:C.textMuted,borderRadius:20,padding:"3px 12px",fontFamily:FM,fontSize:10,fontWeight:700,cursor:"pointer",transition:"all .2s" }}>
                {isPro?"⭐ PRO":"FREE"}
              </button>
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:8,background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:20,padding:"4px 12px 4px 6px" }}>
              <Av initials={user?.user_metadata?.full_name?.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()||user?.email?.slice(0,2).toUpperCase()||"??"} size={22} color={C.purple} />
              <span style={{ fontFamily:FM,fontSize:11,color:C.text }}>{user?.user_metadata?.full_name||user?.email?.split("@")[0]}</span>
            </div>
            <button onClick={handleLogout} style={{ background:"none",border:`1px solid ${C.border}`,color:C.textMuted,borderRadius:6,padding:"6px 12px",fontFamily:FM,fontSize:11,cursor:"pointer",transition:"all .15s" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=C.red+"55";e.currentTarget.style.color=C.red}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textMuted}}>
              Sign Out
            </button>
          </div>
          <div style={{ padding:28 }}>{renderPage()}</div>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}
