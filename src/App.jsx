import { useState } from "react";

// ============================================================
// NEXUS HR — Open Source Human Resource Intelligence Platform
// v2.0 — With Sign In / Sign Up Flow
// ============================================================

const C = {
  bg: "#0a0c10",
  surface: "#111318",
  surfaceAlt: "#161a22",
  border: "#1e2430",
  accent: "#00e5a0",
  accentDim: "#00e5a018",
  gold: "#f5c842",
  goldDim: "#f5c84218",
  red: "#ff4d6d",
  redDim: "#ff4d6d18",
  blue: "#4d9fff",
  blueDim: "#4d9fff18",
  purple: "#b57bee",
  purpleDim: "#b57bee18",
  text: "#e8eaf0",
  textMuted: "#6b7280",
  textDim: "#2a3040",
};

const MONO = "'Space Mono', monospace";
const DISPLAY = "'Syne', 'Arial Black', sans-serif";

// ── Demo accounts ────────────────────────────────────────────
const DEMO_ACCOUNTS = [
  { email: "admin@nexushr.com",    password: "admin123",   name: "Sofia Reyes",   role: "HR Admin",        avatar: "SR", isPro: true,  color: C.purple },
  { email: "manager@nexushr.com",  password: "manager123", name: "Kiran Patel",   role: "Team Manager",    avatar: "KP", isPro: true,  color: C.blue   },
  { email: "demo@nexushr.com",     password: "demo123",    name: "Marcus Yuen",   role: "Employee (Free)", avatar: "MY", isPro: false, color: C.accent },
];

// ── Sample Data ──────────────────────────────────────────────
const EMPLOYEES = [
  { id: 1, name: "Amara Osei",   role: "Senior Engineer",  dept: "Engineering", salary: 120000, status: "active", joined: "2021-03-15", performance: 92, avatar: "AO", mood: "😊", leaves: 8,  skills: ["React","Node","AWS"],            risk: "low"    },
  { id: 2, name: "Lena Kovač",   role: "Product Designer", dept: "Design",      salary: 98000,  status: "active", joined: "2022-01-10", performance: 88, avatar: "LK", mood: "😐", leaves: 5,  skills: ["Figma","UX","Prototyping"],      risk: "medium" },
  { id: 3, name: "Marcus Yuen",  role: "Data Analyst",     dept: "Analytics",   salary: 87000,  status: "remote", joined: "2020-07-22", performance: 79, avatar: "MY", mood: "😊", leaves: 12, skills: ["Python","SQL","Tableau"],        risk: "low"    },
  { id: 4, name: "Sofia Reyes",  role: "HR Manager",       dept: "HR",          salary: 95000,  status: "active", joined: "2019-11-01", performance: 95, avatar: "SR", mood: "🤩", leaves: 3,  skills: ["Recruiting","Policy","Compliance"], risk: "low"  },
  { id: 5, name: "Kiran Patel",  role: "DevOps Lead",      dept: "Engineering", salary: 130000, status: "active", joined: "2021-06-30", performance: 91, avatar: "KP", mood: "😊", leaves: 6,  skills: ["K8s","CI/CD","Terraform"],       risk: "low"    },
  { id: 6, name: "Zara Ahmed",   role: "Marketing Lead",   dept: "Marketing",   salary: 90000,  status: "leave",  joined: "2022-09-14", performance: 73, avatar: "ZA", mood: "😔", leaves: 18, skills: ["SEO","Content","Analytics"],     risk: "high"   },
  { id: 7, name: "Theo Bernard", role: "Backend Engineer", dept: "Engineering", salary: 105000, status: "active", joined: "2023-02-01", performance: 85, avatar: "TB", mood: "😊", leaves: 4,  skills: ["Go","PostgreSQL","Redis"],       risk: "low"    },
  { id: 8, name: "Nadia Russo",  role: "Finance Analyst",  dept: "Finance",     salary: 92000,  status: "active", joined: "2020-04-18", performance: 88, avatar: "NR", mood: "😐", leaves: 7,  skills: ["Excel","SAP","FP&A"],           risk: "medium" },
];

const JOBS = [
  { id: 1, title: "Senior React Developer", dept: "Engineering", status: "active",  applicants: 34, stage: "Interview",  posted: "2025-02-01", priority: "high"   },
  { id: 2, title: "UX Researcher",          dept: "Design",      status: "active",  applicants: 18, stage: "Screening",  posted: "2025-02-10", priority: "medium" },
  { id: 3, title: "Data Scientist",         dept: "Analytics",   status: "active",  applicants: 52, stage: "Assessment", posted: "2025-01-28", priority: "high"   },
  { id: 4, title: "Content Strategist",     dept: "Marketing",   status: "closed",  applicants: 29, stage: "Closed",     posted: "2025-01-15", priority: "low"    },
];

const TICKETS = [
  { id: "TK-001", title: "Update direct deposit info",       employee: "Marcus Yuen", type: "Payroll",     status: "open",        priority: "high",   created: "2h ago" },
  { id: "TK-002", title: "Work-from-home equipment request", employee: "Lena Kovač",  type: "IT",          status: "in-progress", priority: "medium", created: "1d ago" },
  { id: "TK-003", title: "PTO balance discrepancy",          employee: "Zara Ahmed",  type: "Leave",       status: "resolved",    priority: "low",    created: "3d ago" },
  { id: "TK-004", title: "Performance review reschedule",    employee: "Kiran Patel", type: "Performance", status: "open",        priority: "medium", created: "5h ago" },
];

// ── Tiny reusable atoms ──────────────────────────────────────

const Badge = ({ children, color = "accent", size = "sm" }) => {
  const map = {
    accent: { bg: C.accentDim,  text: C.accent,  bd: C.accent  + "44" },
    gold:   { bg: C.goldDim,    text: C.gold,    bd: C.gold    + "44" },
    red:    { bg: C.redDim,     text: C.red,     bd: C.red     + "44" },
    blue:   { bg: C.blueDim,    text: C.blue,    bd: C.blue    + "44" },
    purple: { bg: C.purpleDim,  text: C.purple,  bd: C.purple  + "44" },
    muted:  { bg: C.surfaceAlt, text: C.textMuted, bd: C.border },
  };
  const s = map[color] || map.accent;
  return (
    <span style={{ background: s.bg, color: s.text, border: `1px solid ${s.bd}`, padding: size === "sm" ? "2px 8px" : "4px 12px", borderRadius: "4px", fontSize: "11px", fontFamily: MONO, fontWeight: "700", letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
};

const Av = ({ init, size = 36, color = C.accent }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg,${color}33,${color}11)`, border: `2px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: size * 0.33, fontWeight: "700", color, flexShrink: 0, letterSpacing: "0.05em" }}>
    {init}
  </div>
);

const Bar = ({ value, max = 100, color = C.accent, h = 4 }) => (
  <div style={{ background: C.border, borderRadius: "999px", height: h, overflow: "hidden", width: "100%" }}>
    <div style={{ width: `${Math.min((value / max) * 100, 100)}%`, height: "100%", background: `linear-gradient(90deg,${color}88,${color})`, borderRadius: "999px", transition: "width .6s ease" }} />
  </div>
);

const Metric = ({ label, value, change, color = C.accent, icon, locked }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px", position: "relative", overflow: "hidden", flex: 1, minWidth: 0 }}
    onMouseEnter={e => e.currentTarget.style.borderColor = color + "55"}
    onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
  >
    <div style={{ position: "absolute", top: 0, right: 0, width: "80px", height: "80px", background: `radial-gradient(circle at top right,${color}12,transparent)` }} />
    {locked && (
      <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(4px)", background: "rgba(10,12,16,.75)", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: "12px", gap: "6px" }}>
        <span style={{ fontSize: "20px" }}>🔒</span>
        <span style={{ color: C.gold, fontFamily: MONO, fontSize: "10px", fontWeight: "700", letterSpacing: "0.1em" }}>PRO FEATURE</span>
      </div>
    )}
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "10px" }}>
      <span style={{ fontFamily: MONO, fontSize: "10px", color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontSize: "18px" }}>{icon}</span>
    </div>
    <div style={{ fontFamily: DISPLAY, fontSize: "30px", fontWeight: "900", color, lineHeight: 1, marginBottom: "6px" }}>{value}</div>
    {change && <div style={{ fontFamily: MONO, fontSize: "11px", color: change.startsWith("+") ? C.accent : C.red }}>{change} vs last month</div>}
  </div>
);

// ══════════════════════════════════════════════════════════════
// SIGN-IN PAGE
// ══════════════════════════════════════════════════════════════

const SignIn = ({ onLogin }) => {
  const [mode, setMode]         = useState("signin"); // signin | signup
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]         = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const fillDemo = (acc) => { setEmail(acc.email); setPassword(acc.password); setError(""); };

  const handleSubmit = () => {
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (mode === "signin") {
        const acc = DEMO_ACCOUNTS.find(a => a.email === email && a.password === password);
        if (acc) { onLogin(acc); }
        else { setError("Invalid email or password. Try a demo account below."); }
      } else {
        if (!name.trim() || !email.trim() || !password.trim()) { setError("Please fill in all fields."); return; }
        if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
        onLogin({ name, email, role: "New Employee", avatar: name.slice(0,2).toUpperCase(), isPro: false, color: C.accent });
      }
    }, 900);
  };

  const dots = Array.from({ length: 60 });

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", position: "relative", overflow: "hidden" }}>

      {/* ── Animated grid bg ── */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${C.border} 1px, transparent 1px), linear-gradient(90deg, ${C.border} 1px, transparent 1px)`, backgroundSize: "48px 48px", opacity: 0.35 }} />

      {/* ── Glowing orbs ── */}
      <div style={{ position: "absolute", top: "-120px", left: "-120px",  width: "500px", height: "500px", borderRadius: "50%", background: `radial-gradient(circle, ${C.accent}18 0%, transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-80px", right: "-80px", width: "400px", height: "400px", borderRadius: "50%", background: `radial-gradient(circle, ${C.purple}18 0%, transparent 70%)`, pointerEvents: "none" }} />

      {/* ══ LEFT PANEL ══ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 48px", position: "relative", zIndex: 1 }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "64px" }}>
          <div style={{ width: "40px", height: "40px", background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: "900", color: "#000", fontSize: "18px" }}>N</div>
          <div>
            <div style={{ fontFamily: DISPLAY, fontWeight: "900", fontSize: "20px", color: C.text, letterSpacing: "-0.02em" }}>NEXUS HR</div>
            <div style={{ fontFamily: MONO, fontSize: "9px", color: C.textMuted, letterSpacing: "0.12em" }}>OPEN SOURCE PLATFORM</div>
          </div>
        </div>

        {/* Headline */}
        <div style={{ marginBottom: "48px" }}>
          <div style={{ fontFamily: DISPLAY, fontSize: "clamp(32px, 4vw, 52px)", fontWeight: "900", color: C.text, lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: "16px" }}>
            The HR platform<br />
            <span style={{ color: C.accent }}>your team</span><br />
            deserves.
          </div>
          <div style={{ fontFamily: MONO, fontSize: "13px", color: C.textMuted, lineHeight: 1.7, maxWidth: "380px" }}>
            Open-source, AI-powered, and free forever for core features. Built for modern teams who care about people.
          </div>
        </div>

        {/* Feature pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "48px" }}>
          {["👥 People Directory", "📋 Recruitment", "🎫 Helpdesk", "⭐ AI Analytics (Pro)", "💰 Payroll (Pro)"].map(f => (
            <div key={f} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "20px", padding: "6px 14px", fontFamily: MONO, fontSize: "11px", color: C.textMuted }}>
              {f}
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: "32px" }}>
          {[["MIT", "License"], ["∞", "Free Forever"], ["5min", "To Deploy"]].map(([val, lbl]) => (
            <div key={lbl}>
              <div style={{ fontFamily: DISPLAY, fontSize: "22px", fontWeight: "900", color: C.accent }}>{val}</div>
              <div style={{ fontFamily: MONO, fontSize: "10px", color: C.textMuted, letterSpacing: "0.06em" }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ RIGHT PANEL — FORM ══ */}
      <div style={{ width: "480px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 48px", position: "relative", zIndex: 1 }}>
        <div style={{ width: "100%", maxWidth: "380px" }}>

          {/* Card */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "20px", padding: "36px 32px", boxShadow: `0 32px 80px rgba(0,0,0,.5), 0 0 0 1px ${C.border}` }}>

            {/* Mode tabs */}
            <div style={{ display: "flex", background: C.surfaceAlt, borderRadius: "10px", padding: "4px", marginBottom: "28px" }}>
              {["signin","signup"].map(m => (
                <button key={m} onClick={() => { setMode(m); setError(""); }} style={{ flex: 1, padding: "9px", borderRadius: "7px", border: "none", background: mode === m ? C.bg : "transparent", color: mode === m ? C.text : C.textMuted, fontFamily: MONO, fontSize: "12px", fontWeight: "700", cursor: "pointer", transition: "all .2s", letterSpacing: "0.05em" }}>
                  {m === "signin" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>

            {/* Title */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontFamily: DISPLAY, fontSize: "22px", fontWeight: "900", color: C.text, marginBottom: "4px" }}>
                {mode === "signin" ? "Welcome back" : "Create account"}
              </div>
              <div style={{ fontFamily: MONO, fontSize: "11px", color: C.textMuted }}>
                {mode === "signin" ? "Sign in to your workspace" : "Join your team's workspace"}
              </div>
            </div>

            {/* Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
              {mode === "signup" && (
                <div>
                  <label style={{ fontFamily: MONO, fontSize: "10px", color: C.textMuted, letterSpacing: "0.08em", display: "block", marginBottom: "6px" }}>FULL NAME</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name"
                    style={{ width: "100%", background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "11px 14px", color: C.text, fontFamily: MONO, fontSize: "12px", outline: "none", transition: "border-color .2s" }}
                    onFocus={e => e.target.style.borderColor = C.accent + "66"}
                    onBlur={e => e.target.style.borderColor = C.border}
                  />
                </div>
              )}
              <div>
                <label style={{ fontFamily: MONO, fontSize: "10px", color: C.textMuted, letterSpacing: "0.08em", display: "block", marginBottom: "6px" }}>EMAIL</label>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" type="email"
                  style={{ width: "100%", background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "11px 14px", color: C.text, fontFamily: MONO, fontSize: "12px", outline: "none", transition: "border-color .2s" }}
                  onFocus={e => e.target.style.borderColor = C.accent + "66"}
                  onBlur={e => e.target.style.borderColor = C.border}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                />
              </div>
              <div>
                <label style={{ fontFamily: MONO, fontSize: "10px", color: C.textMuted, letterSpacing: "0.08em", display: "block", marginBottom: "6px" }}>PASSWORD</label>
                <div style={{ position: "relative" }}>
                  <input value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" type={showPass ? "text" : "password"}
                    style={{ width: "100%", background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "11px 40px 11px 14px", color: C.text, fontFamily: MONO, fontSize: "12px", outline: "none", transition: "border-color .2s" }}
                    onFocus={e => e.target.style.borderColor = C.accent + "66"}
                    onBlur={e => e.target.style.borderColor = C.border}
                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  />
                  <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: "14px", padding: "2px" }}>
                    {showPass ? "🙈" : "👁"}
                  </button>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: C.redDim, border: `1px solid ${C.red}44`, borderRadius: "8px", padding: "10px 14px", fontFamily: MONO, fontSize: "11px", color: C.red, marginBottom: "16px" }}>
                ⚠ {error}
              </div>
            )}

            {/* Submit */}
            <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", background: loading ? C.surfaceAlt : `linear-gradient(135deg, ${C.accent}, ${C.accent}cc)`, border: "none", borderRadius: "10px", padding: "13px", color: loading ? C.textMuted : "#000", fontFamily: MONO, fontWeight: "700", fontSize: "13px", cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.05em", transition: "all .2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              {loading ? (
                <>
                  <span style={{ display: "inline-block", width: "14px", height: "14px", border: `2px solid ${C.textMuted}`, borderTopColor: C.accent, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  Authenticating...
                </>
              ) : (
                mode === "signin" ? "Sign In →" : "Create Account →"
              )}
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
              <div style={{ flex: 1, height: "1px", background: C.border }} />
              <span style={{ fontFamily: MONO, fontSize: "10px", color: C.textMuted }}>DEMO ACCOUNTS</span>
              <div style={{ flex: 1, height: "1px", background: C.border }} />
            </div>

            {/* Demo accounts */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {DEMO_ACCOUNTS.map(acc => (
                <button key={acc.email} onClick={() => fillDemo(acc)} style={{ display: "flex", alignItems: "center", gap: "10px", background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "10px 12px", cursor: "pointer", textAlign: "left", transition: "all .15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = acc.color + "55"; e.currentTarget.style.background = acc.color + "08"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.surfaceAlt; }}
                >
                  <Av init={acc.avatar} size={30} color={acc.color} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: MONO, fontSize: "11px", fontWeight: "700", color: C.text }}>{acc.name}</div>
                    <div style={{ fontFamily: MONO, fontSize: "10px", color: C.textMuted }}>{acc.role}</div>
                  </div>
                  {acc.isPro && <span style={{ fontFamily: MONO, fontSize: "9px", color: C.gold, fontWeight: "700" }}>⭐ PRO</span>}
                  <span style={{ fontFamily: MONO, fontSize: "10px", color: C.textMuted }}>→</span>
                </button>
              ))}
            </div>

            <div style={{ fontFamily: MONO, fontSize: "10px", color: C.textDim, textAlign: "center", marginTop: "16px" }}>
              Click any demo account to auto-fill credentials
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign: "center", marginTop: "20px", fontFamily: MONO, fontSize: "10px", color: C.textMuted }}>
            MIT Licensed · Open Source · <a href="https://github.com/SamoTech/nexus-hr" target="_blank" rel="noreferrer" style={{ color: C.accent, textDecoration: "none" }}>GitHub ↗</a>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// DASHBOARD + ALL PAGES (same as before, uses currentUser)
// ══════════════════════════════════════════════════════════════

const NAV = [
  { id: "dashboard",   icon: "◉", label: "Dashboard",   free: true  },
  { id: "employees",   icon: "◈", label: "Employees",   free: true  },
  { id: "recruitment", icon: "◎", label: "Recruitment", free: true  },
  { id: "payroll",     icon: "◆", label: "Payroll",     free: false },
  { id: "performance", icon: "◇", label: "Performance", free: false },
  { id: "attendance",  icon: "◐", label: "Attendance",  free: true  },
  { id: "tickets",     icon: "◑", label: "Helpdesk",    free: true  },
  { id: "analytics",   icon: "◒", label: "AI Analytics",free: false },
  { id: "settings",    icon: "◓", label: "Settings",    free: true  },
];

const Sidebar = ({ active, setActive, isPro, user, onLogout }) => (
  <div style={{ width: "220px", background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0, flexShrink: 0 }}>
    <div style={{ padding: "20px 18px 14px", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "32px", height: "32px", background: `linear-gradient(135deg,${C.accent},${C.blue})`, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: "900", color: "#000", fontSize: "14px" }}>N</div>
        <div>
          <div style={{ fontFamily: DISPLAY, fontWeight: "900", fontSize: "15px", color: C.text, letterSpacing: "-0.02em" }}>NEXUS HR</div>
          <div style={{ fontFamily: MONO, fontSize: "9px", color: C.textMuted, letterSpacing: "0.1em" }}>OPEN SOURCE</div>
        </div>
      </div>
    </div>
    <nav style={{ flex: 1, padding: "10px", overflowY: "auto" }}>
      {NAV.map(item => {
        const locked = !item.free && !isPro;
        const isActive = active === item.id;
        return (
          <button key={item.id} onClick={() => setActive(item.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "9px 10px", borderRadius: "8px", border: "none", background: isActive ? C.accentDim : "transparent", color: isActive ? C.accent : locked ? C.textDim : C.textMuted, fontFamily: MONO, fontSize: "12px", fontWeight: isActive ? "700" : "400", cursor: "pointer", textAlign: "left", marginBottom: "2px", transition: "all .15s", borderLeft: isActive ? `2px solid ${C.accent}` : "2px solid transparent" }}
            onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = C.surfaceAlt; e.currentTarget.style.color = locked ? C.textDim : C.text; } }}
            onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = locked ? C.textDim : C.textMuted; } }}
          >
            <span style={{ fontSize: "13px", width: "16px", textAlign: "center" }}>{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {locked && <span style={{ fontSize: "9px", color: C.gold }}>PRO</span>}
          </button>
        );
      })}
    </nav>
    {!isPro && (
      <div style={{ padding: "10px", borderTop: `1px solid ${C.border}` }}>
        <div style={{ background: C.goldDim, border: `1px solid ${C.gold}33`, borderRadius: "10px", padding: "12px" }}>
          <div style={{ fontFamily: MONO, fontSize: "10px", color: C.gold, fontWeight: "700", letterSpacing: "0.1em", marginBottom: "4px" }}>⭐ NEXUS PRO</div>
          <div style={{ fontFamily: MONO, fontSize: "10px", color: C.textMuted, marginBottom: "8px" }}>AI features, payroll & unlimited workflows</div>
          <button style={{ width: "100%", background: C.gold, color: "#000", border: "none", borderRadius: "6px", padding: "7px", fontFamily: MONO, fontWeight: "700", fontSize: "11px", cursor: "pointer" }}>Upgrade →</button>
        </div>
      </div>
    )}
    <div style={{ padding: "12px 14px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: "10px" }}>
      <Av init={user.avatar} size={32} color={user.color || C.purple} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: MONO, fontSize: "11px", color: C.text, fontWeight: "700", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
        <div style={{ fontFamily: MONO, fontSize: "10px", color: C.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.role}</div>
      </div>
      <button onClick={onLogout} title="Sign out" style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: "14px", flexShrink: 0, padding: "2px" }}>⏏</button>
    </div>
  </div>
);

// ── Pages ────────────────────────────────────────────────────

const Dashboard = ({ isPro, user }) => (
  <div>
    <div style={{ marginBottom: "24px" }}>
      <div style={{ fontFamily: DISPLAY, fontSize: "24px", fontWeight: "900", color: C.text, letterSpacing: "-0.02em" }}>Good morning, {user.name.split(" ")[0]} 👋</div>
      <div style={{ fontFamily: MONO, fontSize: "12px", color: C.textMuted, marginTop: "4px" }}>Thursday, Feb 26 · 8 active job openings · 1 retention risk flagged</div>
    </div>
    <div style={{ display: "flex", gap: "14px", marginBottom: "20px", flexWrap: "wrap" }}>
      <Metric label="Total Employees" value="124" change="+3" icon="👥" color={C.accent} />
      <Metric label="Open Positions"  value="8"   change="+2" icon="📋" color={C.blue}   />
      <Metric label="Avg Performance" value="87%" change="+4%" icon="📈" color={C.purple} />
      <Metric label="Attrition Risk"  value="12%" icon="⚠️"  color={C.red}    locked={!isPro} />
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "18px" }}>
        <div style={{ fontFamily: DISPLAY, fontSize: "13px", fontWeight: "700", color: C.text, marginBottom: "14px" }}>Recent Activity</div>
        {[
          { icon:"✅", text:"Kiran Patel completed onboarding checklist", time:"2h ago" },
          { icon:"📨", text:"New application: Senior React Developer",    time:"3h ago" },
          { icon:"🏖", text:"Zara Ahmed leave approved (Feb 25–Mar 4)",   time:"5h ago" },
          { icon:"⚠️", text:"Payroll anomaly detected for 2 employees",  time:"1d ago" },
          { icon:"📝", text:"Q4 performance reviews finalized",           time:"2d ago" },
        ].map((a,i) => (
          <div key={i} style={{ display:"flex", gap:"10px", marginBottom:"11px", alignItems:"flex-start" }}>
            <span style={{ fontSize:"13px", flexShrink:0, marginTop:"1px" }}>{a.icon}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:MONO, fontSize:"11px", color:C.text }}>{a.text}</div>
              <div style={{ fontFamily:MONO, fontSize:"10px", color:C.textMuted, marginTop:"2px" }}>{a.time}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "18px" }}>
        <div style={{ fontFamily: DISPLAY, fontSize: "13px", fontWeight: "700", color: C.text, marginBottom: "14px" }}>Department Headcount</div>
        {[["Engineering",38,C.accent],["Design",12,C.blue],["Analytics",9,C.purple],["Marketing",18,C.gold],["Finance",14,C.red]].map(([n,c,col]) => (
          <div key={n} style={{ marginBottom:"10px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"4px" }}>
              <span style={{ fontFamily:MONO, fontSize:"11px", color:C.textMuted }}>{n}</span>
              <span style={{ fontFamily:MONO, fontSize:"11px", color:col, fontWeight:"700" }}>{c}</span>
            </div>
            <Bar value={c} max={40} color={col} />
          </div>
        ))}
      </div>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "18px" }}>
        <div style={{ fontFamily: DISPLAY, fontSize: "13px", fontWeight: "700", color: C.text, marginBottom: "14px" }}>Quick Actions</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {[["➕","Add Employee",C.accent,false],["📢","Post Job",C.blue,false],["💰","Run Payroll",C.gold,true],["📊","Generate Report",C.purple,true],["✅","Approve Leave",C.accent,false],["📣","Announce",C.red,false]].map(([ic,lbl,col,pro],i) => (
            <button key={i} style={{ background:C.surfaceAlt, border:`1px solid ${C.border}`, borderRadius:"8px", padding:"11px", cursor:"pointer", display:"flex", alignItems:"center", gap:"8px", color: pro && !isPro ? C.textDim : C.text, fontFamily:MONO, fontSize:"11px", textAlign:"left", transition:"all .15s" }}
              onMouseEnter={e=>e.currentTarget.style.borderColor=col+"55"}
              onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}
            >
              <span style={{ fontSize:"14px" }}>{ic}</span>
              <span style={{ flex:1 }}>{lbl}</span>
              {pro && !isPro && <span style={{ fontSize:"9px", color:C.gold }}>PRO</span>}
            </button>
          ))}
        </div>
      </div>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "18px", position: "relative", overflow: "hidden" }}>
        <div style={{ fontFamily: DISPLAY, fontSize: "13px", fontWeight: "700", color: C.text, marginBottom: "4px" }}>Team Mood Pulse</div>
        <div style={{ fontFamily: MONO, fontSize: "10px", color: C.textMuted, marginBottom: "14px" }}>AI-inferred from check-ins</div>
        {EMPLOYEES.slice(0,5).map(e => (
          <div key={e.id} style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"10px" }}>
            <Av init={e.avatar} size={26} color={C.purple} />
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:MONO, fontSize:"10px", color:C.text }}>{e.name}</div>
              <Bar value={e.performance} color={e.performance>85?C.accent:e.performance>70?C.gold:C.red} h={3} />
            </div>
            <span style={{ fontSize:"14px" }}>{e.mood}</span>
          </div>
        ))}
        {!isPro && (
          <div style={{ position:"absolute", inset:0, backdropFilter:"blur(3px)", background:"rgba(10,12,16,.8)", zIndex:10, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"8px", borderRadius:"12px" }}>
            <span style={{ fontSize:"26px" }}>🧠</span>
            <div style={{ fontFamily:DISPLAY, color:C.gold, fontWeight:"700", fontSize:"13px" }}>AI Mood Pulse</div>
            <div style={{ fontFamily:MONO, color:C.textMuted, fontSize:"10px", textAlign:"center", maxWidth:"190px" }}>Detect burnout before it becomes attrition</div>
            <button style={{ background:C.gold, color:"#000", border:"none", borderRadius:"6px", padding:"7px 16px", fontFamily:MONO, fontWeight:"700", fontSize:"11px", cursor:"pointer", marginTop:"4px" }}>Unlock Pro →</button>
          </div>
        )}
      </div>
    </div>
  </div>
);

const Employees = ({ isPro }) => {
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("all");
  const [selected, setSelected] = useState(null);
  const filtered = EMPLOYEES.filter(e => {
    const ms = e.name.toLowerCase().includes(search.toLowerCase()) || e.role.toLowerCase().includes(search.toLowerCase());
    const mf = filter === "all" || e.dept.toLowerCase() === filter;
    return ms && mf;
  });
  const emp = selected ? EMPLOYEES.find(e => e.id === selected) : null;
  return (
    <div style={{ display:"grid", gridTemplateColumns: selected ? "1fr 320px" : "1fr", gap:"16px" }}>
      <div>
        <div style={{ display:"flex", gap:"12px", marginBottom:"16px", flexWrap:"wrap", alignItems:"center" }}>
          <div style={{ fontFamily:DISPLAY, fontSize:"20px", fontWeight:"900", color:C.text, flex:1 }}>People Directory</div>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:"8px", padding:"8px 12px", color:C.text, fontFamily:MONO, fontSize:"11px", outline:"none", width:"180px" }} />
          <button style={{ background:C.accent, color:"#000", border:"none", borderRadius:"8px", padding:"8px 14px", fontFamily:MONO, fontWeight:"700", fontSize:"11px", cursor:"pointer" }}>+ Add</button>
        </div>
        <div style={{ display:"flex", gap:"6px", marginBottom:"14px", flexWrap:"wrap" }}>
          {["all","engineering","design","analytics","marketing","finance"].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{ background:filter===f?C.accentDim:C.surface, border:`1px solid ${filter===f?C.accent+"44":C.border}`, color:filter===f?C.accent:C.textMuted, borderRadius:"6px", padding:"4px 10px", cursor:"pointer", fontFamily:MONO, fontSize:"10px", fontWeight:"700", textTransform:"capitalize" }}>{f==="all"?"All":f}</button>
          ))}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:"7px" }}>
          {filtered.map(e => (
            <div key={e.id} onClick={()=>setSelected(selected===e.id?null:e.id)} style={{ background:selected===e.id?C.accentDim:C.surface, border:`1px solid ${selected===e.id?C.accent+"44":C.border}`, borderRadius:"10px", padding:"12px 14px", display:"flex", alignItems:"center", gap:"12px", cursor:"pointer", transition:"all .15s" }}
              onMouseEnter={ev=>{if(selected!==e.id)ev.currentTarget.style.borderColor=C.accent+"33";}}
              onMouseLeave={ev=>{if(selected!==e.id)ev.currentTarget.style.borderColor=C.border;}}
            >
              <Av init={e.avatar} size={38} color={e.risk==="high"?C.red:e.risk==="medium"?C.gold:C.accent} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"2px" }}>
                  <span style={{ fontFamily:DISPLAY, fontSize:"13px", fontWeight:"700", color:C.text }}>{e.name}</span>
                  <span>{e.mood}</span>
                  {e.risk==="high"&&<Badge color="red">At Risk</Badge>}
                  {e.risk==="medium"&&<Badge color="gold">Watch</Badge>}
                </div>
                <div style={{ fontFamily:MONO, fontSize:"10px", color:C.textMuted }}>{e.role} · {e.dept}</div>
              </div>
              <div style={{ textAlign:"right", flexShrink:0 }}>
                <div style={{ fontFamily:MONO, fontSize:"10px", color:C.textMuted }}>Performance</div>
                <div style={{ fontFamily:DISPLAY, fontSize:"15px", fontWeight:"900", color:e.performance>85?C.accent:e.performance>70?C.gold:C.red }}>{e.performance}%</div>
              </div>
              <Badge color={e.status==="active"?"accent":e.status==="remote"?"blue":e.status==="leave"?"gold":"muted"}>{e.status}</Badge>
            </div>
          ))}
        </div>
      </div>
      {emp && (
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:"12px", padding:"18px", height:"fit-content", position:"sticky", top:"20px" }}>
          <button onClick={()=>setSelected(null)} style={{ background:"none", border:"none", color:C.textMuted, fontFamily:MONO, fontSize:"11px", cursor:"pointer", marginBottom:"14px", padding:0 }}>← Close</button>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", marginBottom:"16px" }}>
            <Av init={emp.avatar} size={56} color={emp.risk==="high"?C.red:C.accent} />
            <div style={{ marginTop:"10px" }}>
              <div style={{ fontFamily:DISPLAY, fontSize:"16px", fontWeight:"900", color:C.text }}>{emp.name}</div>
              <div style={{ fontFamily:MONO, fontSize:"11px", color:C.textMuted }}>{emp.role} · {emp.dept}</div>
            </div>
          </div>
          {[["Joined",emp.joined],["Status",emp.status],["Leaves",`${emp.leaves} days`],["Salary",isPro?`$${emp.salary.toLocaleString()}`:"*****"]].map(([l,v])=>(
            <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:`1px solid ${C.border}` }}>
              <span style={{ fontFamily:MONO, fontSize:"10px", color:C.textMuted }}>{l}</span>
              <span style={{ fontFamily:MONO, fontSize:"10px", color:C.text, fontWeight:"700" }}>{v}</span>
            </div>
          ))}
          <div style={{ marginTop:"12px" }}>
            <div style={{ fontFamily:MONO, fontSize:"10px", color:C.textMuted, marginBottom:"6px" }}>SKILLS</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"5px" }}>{emp.skills.map(s=><Badge key={s} color="muted">{s}</Badge>)}</div>
          </div>
          <div style={{ marginTop:"12px" }}>
            <div style={{ fontFamily:MONO, fontSize:"10px", color:C.textMuted, marginBottom:"5px" }}>PERFORMANCE</div>
            <div style={{ fontFamily:DISPLAY, fontSize:"24px", fontWeight:"900", color:emp.performance>85?C.accent:emp.performance>70?C.gold:C.red, marginBottom:"5px" }}>{emp.performance}%</div>
            <Bar value={emp.performance} color={emp.performance>85?C.accent:emp.performance>70?C.gold:C.red} h={5} />
          </div>
          {emp.risk==="high"&&<div style={{ marginTop:"12px", background:C.redDim, border:`1px solid ${C.red}33`, borderRadius:"8px", padding:"10px 12px" }}><div style={{ fontFamily:MONO, fontSize:"11px", fontWeight:"700", color:C.red }}>⚠ Attrition Risk: HIGH</div><div style={{ fontFamily:MONO, fontSize:"10px", color:C.textMuted, marginTop:"3px" }}>High leave usage + performance dip. Consider 1:1 check-in.</div></div>}
        </div>
      )}
    </div>
  );
};

const Recruitment = () => (
  <div>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
      <div style={{ fontFamily:DISPLAY, fontSize:"20px", fontWeight:"900", color:C.text }}>Recruitment Pipeline</div>
      <button style={{ background:C.accent, color:"#000", border:"none", borderRadius:"8px", padding:"8px 16px", fontFamily:MONO, fontWeight:"700", fontSize:"11px", cursor:"pointer" }}>+ Post Job</button>
    </div>
    <div style={{ display:"flex", gap:"14px", marginBottom:"20px" }}>
      {[["Active Jobs",JOBS.filter(j=>j.status==="active").length,C.accent],["Total Applicants",JOBS.reduce((a,j)=>a+j.applicants,0),C.blue],["Avg Time-to-Hire","18d",C.purple],["Offer Accept","76%",C.gold]].map(([l,v,col])=>(
        <div key={l} style={{ flex:1, background:C.surface, border:`1px solid ${C.border}`, borderRadius:"10px", padding:"14px" }}>
          <div style={{ fontFamily:MONO, fontSize:"10px", color:C.textMuted, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"6px" }}>{l}</div>
          <div style={{ fontFamily:DISPLAY, fontSize:"26px", fontWeight:"900", color:col }}>{v}</div>
        </div>
      ))}
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"10px" }}>
      {["Screening","Interview","Assessment","Offer"].map(stage=>{
        const sj = JOBS.filter(j=>j.stage===stage);
        return (
          <div key={stage} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:"10px", padding:"12px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
              <div style={{ fontFamily:MONO, fontSize:"10px", fontWeight:"700", color:C.textMuted, letterSpacing:"0.08em", textTransform:"uppercase" }}>{stage}</div>
              <Badge color="muted">{sj.length}</Badge>
            </div>
            {sj.map(job=>(
              <div key={job.id} style={{ background:C.surfaceAlt, border:`1px solid ${C.border}`, borderRadius:"7px", padding:"10px", marginBottom:"7px" }}>
                <div style={{ fontFamily:MONO, fontSize:"11px", fontWeight:"700", color:C.text, marginBottom:"5px" }}>{job.title}</div>
                <div style={{ fontFamily:MONO, fontSize:"10px", color:C.textMuted, marginBottom:"7px" }}>{job.dept}</div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontFamily:MONO, fontSize:"10px", color:C.blue }}>👤 {job.applicants}</span>
                  <Badge color={job.priority==="high"?"red":job.priority==="medium"?"gold":"muted"}>{job.priority}</Badge>
                </div>
              </div>
            ))}
            {sj.length===0&&<div style={{ fontFamily:MONO, fontSize:"10px", color:C.textDim, textAlign:"center", padding:"16px 0" }}>Empty</div>}
          </div>
        );
      })}
    </div>
  </div>
);

const Helpdesk = () => (
  <div>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
      <div style={{ fontFamily:DISPLAY, fontSize:"20px", fontWeight:"900", color:C.text }}>Employee Helpdesk</div>
      <button style={{ background:C.accent, color:"#000", border:"none", borderRadius:"8px", padding:"8px 16px", fontFamily:MONO, fontWeight:"700", fontSize:"11px", cursor:"pointer" }}>+ New Ticket</button>
    </div>
    <div style={{ display:"flex", gap:"14px", marginBottom:"20px" }}>
      {[["Open",TICKETS.filter(t=>t.status==="open").length,C.red],["In Progress",TICKETS.filter(t=>t.status==="in-progress").length,C.gold],["Resolved",TICKETS.filter(t=>t.status==="resolved").length,C.accent],["Avg Resolve","1.4d",C.blue]].map(([l,v,col])=>(
        <div key={l} style={{ flex:1, background:C.surface, border:`1px solid ${C.border}`, borderRadius:"10px", padding:"14px" }}>
          <div style={{ fontFamily:MONO, fontSize:"10px", color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"6px" }}>{l}</div>
          <div style={{ fontFamily:DISPLAY, fontSize:"26px", fontWeight:"900", color:col }}>{v}</div>
        </div>
      ))}
    </div>
    <div style={{ display:"flex", flexDirection:"column", gap:"7px" }}>
      {TICKETS.map(t=>(
        <div key={t.id} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:"10px", padding:"14px 16px", display:"flex", alignItems:"center", gap:"12px" }}>
          <div style={{ fontFamily:MONO, fontSize:"10px", color:C.textMuted, fontWeight:"700", flexShrink:0 }}>{t.id}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:MONO, fontSize:"12px", fontWeight:"700", color:C.text, marginBottom:"2px" }}>{t.title}</div>
            <div style={{ fontFamily:MONO, fontSize:"10px", color:C.textMuted }}>{t.employee} · {t.created}</div>
          </div>
          <Badge color="muted">{t.type}</Badge>
          <Badge color={t.priority==="high"?"red":t.priority==="medium"?"gold":"muted"}>{t.priority}</Badge>
          <Badge color={t.status==="resolved"?"accent":t.status==="in-progress"?"blue":"red"}>{t.status}</Badge>
          <button style={{ background:C.surfaceAlt, border:`1px solid ${C.border}`, color:C.text, borderRadius:"6px", padding:"6px 10px", fontFamily:MONO, fontSize:"10px", cursor:"pointer" }}>Open</button>
        </div>
      ))}
    </div>
  </div>
);

const ProGate = ({ title, icon, desc, features }) => (
  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"400px", textAlign:"center" }}>
    <span style={{ fontSize:"48px", marginBottom:"14px" }}>{icon}</span>
    <div style={{ fontFamily:DISPLAY, fontSize:"26px", fontWeight:"900", color:C.gold, marginBottom:"8px" }}>{title}</div>
    <div style={{ fontFamily:MONO, fontSize:"13px", color:C.textMuted, maxWidth:"360px", marginBottom:"22px", lineHeight:"1.7" }}>{desc}</div>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", maxWidth:"460px", marginBottom:"24px" }}>
      {features.map(f=><div key={f} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:"8px", padding:"11px", fontFamily:MONO, fontSize:"11px", color:C.textMuted }}>{f}</div>)}
    </div>
    <button style={{ background:C.gold, color:"#000", border:"none", borderRadius:"10px", padding:"13px 30px", fontFamily:DISPLAY, fontWeight:"900", fontSize:"15px", cursor:"pointer" }}>Upgrade to Pro →</button>
  </div>
);

const Payroll = ({ isPro }) => !isPro ? (
  <ProGate title="Payroll Engine" icon="💰" desc="Automated runs, tax calculations, pay slips, compliance reports, and anomaly detection." features={["🤖 Auto payroll runs","🧾 Pay slip generation","📊 Tax calculations","⚠️ Anomaly detection","🌍 Multi-currency","📋 Compliance reports"]} />
) : (
  <div>
    <div style={{ fontFamily:DISPLAY, fontSize:"20px", fontWeight:"900", color:C.text, marginBottom:"20px" }}>Payroll Engine ⭐</div>
    <div style={{ display:"flex", gap:"14px", marginBottom:"20px" }}>
      {[["Next Payroll","Mar 1",C.accent],["Monthly Total","$1.24M",C.gold],["Pending","3",C.red],["Anomalies","2",C.red]].map(([l,v,col])=>(
        <div key={l} style={{ flex:1, background:C.surface, border:`1px solid ${C.border}`, borderRadius:"10px", padding:"14px" }}>
          <div style={{ fontFamily:MONO, fontSize:"10px", color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"6px" }}>{l}</div>
          <div style={{ fontFamily:DISPLAY, fontSize:"26px", fontWeight:"900", color:col }}>{v}</div>
        </div>
      ))}
    </div>
    <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:"12px", overflow:"hidden" }}>
      <div style={{ padding:"14px 18px", borderBottom:`1px solid ${C.border}`, fontFamily:DISPLAY, fontSize:"13px", fontWeight:"700", color:C.text }}>Compensation Table</div>
      {EMPLOYEES.map(e=>(
        <div key={e.id} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"11px 18px", borderBottom:`1px solid ${C.border}` }}>
          <Av init={e.avatar} size={30} />
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:MONO, fontSize:"11px", fontWeight:"700", color:C.text }}>{e.name}</div>
            <div style={{ fontFamily:MONO, fontSize:"10px", color:C.textMuted }}>{e.role}</div>
          </div>
          <div style={{ fontFamily:DISPLAY, fontSize:"15px", fontWeight:"900", color:C.gold }}>${e.salary.toLocaleString()}/yr</div>
          <Badge color="accent">Active</Badge>
          <button style={{ background:C.surfaceAlt, border:`1px solid ${C.border}`, color:C.textMuted, borderRadius:"6px", padding:"5px 10px", fontFamily:MONO, fontSize:"10px", cursor:"pointer" }}>Pay Slip</button>
        </div>
      ))}
    </div>
  </div>
);

const Analytics = ({ isPro }) => !isPro ? (
  <ProGate title="AI Analytics" icon="🧠" desc="Predict attrition, surface burnout signals, optimize headcount, and benchmark your culture — powered by AI." features={["🔮 Attrition prediction","🔥 Burnout heatmap","💡 Hiring optimization","📈 Culture score","🤖 AI recommendations","📊 Custom reports"]} />
) : (
  <div>
    <div style={{ fontFamily:DISPLAY, fontSize:"20px", fontWeight:"900", color:C.text, marginBottom:"20px" }}>AI Analytics ⭐</div>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
      {[
        { title:"🔮 Attrition Forecast", desc:"3 employees show >70% 90-day flight risk based on engagement signals and performance trajectory.", insight:"Zara Ahmed flagged as #1 risk", color:C.red },
        { title:"🔥 Burnout Heatmap",    desc:"Engineering showing overtime patterns for 3rd consecutive week. Recommend mandatory sprint pause.", insight:"9 engineers averaging 52+ hrs/week", color:C.gold },
        { title:"💡 Hiring Optimization",desc:"AI suggests 2 additional senior engineers before Q2 based on roadmap complexity and velocity trends.", insight:"Predicted productivity gap in 6 weeks", color:C.blue },
        { title:"📈 Culture Score",       desc:"Company culture score at 78/100, up +4 from last quarter. Main driver: improved manager responsiveness.", insight:"↑ Trust, Communication, Autonomy", color:C.accent },
      ].map(card=>(
        <div key={card.title} style={{ background:C.surface, border:`1px solid ${card.color}33`, borderRadius:"12px", padding:"18px" }}>
          <div style={{ fontFamily:DISPLAY, fontSize:"14px", fontWeight:"700", color:card.color, marginBottom:"8px" }}>{card.title}</div>
          <div style={{ fontFamily:MONO, fontSize:"11px", color:C.textMuted, marginBottom:"10px", lineHeight:"1.6" }}>{card.desc}</div>
          <div style={{ background:card.color+"11", border:`1px solid ${card.color}22`, borderRadius:"6px", padding:"7px 10px", fontFamily:MONO, fontSize:"10px", color:card.color, fontWeight:"700" }}>{card.insight}</div>
        </div>
      ))}
    </div>
  </div>
);

const Attendance = () => (
  <div>
    <div style={{ fontFamily:DISPLAY, fontSize:"20px", fontWeight:"900", color:C.text, marginBottom:"20px" }}>Attendance & Leave</div>
    <div style={{ display:"flex", gap:"14px", marginBottom:"20px" }}>
      {[["Present",108,C.accent],["On Leave",7,C.gold],["Remote",9,C.blue],["Pending",4,C.red]].map(([l,v,col])=>(
        <div key={l} style={{ flex:1, background:C.surface, border:`1px solid ${C.border}`, borderRadius:"10px", padding:"14px" }}>
          <div style={{ fontFamily:MONO, fontSize:"10px", color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"6px" }}>{l}</div>
          <div style={{ fontFamily:DISPLAY, fontSize:"26px", fontWeight:"900", color:col }}>{v}</div>
        </div>
      ))}
    </div>
    <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:"12px", overflow:"hidden" }}>
      <div style={{ padding:"14px 18px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between" }}>
        <span style={{ fontFamily:DISPLAY, fontSize:"13px", fontWeight:"700", color:C.text }}>Leave Balances</span>
        <button style={{ background:C.accentDim, border:`1px solid ${C.accent}33`, color:C.accent, borderRadius:"6px", padding:"5px 12px", fontFamily:MONO, fontSize:"10px", fontWeight:"700", cursor:"pointer" }}>Approve All Pending</button>
      </div>
      {EMPLOYEES.map(e=>(
        <div key={e.id} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"11px 18px", borderBottom:`1px solid ${C.border}` }}>
          <Av init={e.avatar} size={30} />
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:MONO, fontSize:"11px", fontWeight:"700", color:C.text }}>{e.name}</div>
            <div style={{ fontFamily:MONO, fontSize:"10px", color:C.textMuted }}>{e.dept}</div>
          </div>
          <div style={{ width:"120px" }}>
            <div style={{ fontFamily:MONO, fontSize:"10px", color:C.textMuted, marginBottom:"3px" }}>{e.leaves}/25 days</div>
            <Bar value={e.leaves} max={25} color={e.leaves>15?C.red:e.leaves>10?C.gold:C.accent} />
          </div>
          <Badge color={e.status==="leave"?"gold":e.status==="remote"?"blue":"accent"}>{e.status}</Badge>
        </div>
      ))}
    </div>
  </div>
);

const Settings = ({ user, onLogout }) => (
  <div>
    <div style={{ fontFamily:DISPLAY, fontSize:"20px", fontWeight:"900", color:C.text, marginBottom:"20px" }}>Settings</div>
    <div style={{ display:"grid", gridTemplateColumns:"180px 1fr", gap:"16px" }}>
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:"10px", padding:"10px", height:"fit-content" }}>
        {["General","Company","Permissions","Notifications","Billing","Open Source"].map((s,i)=>(
          <button key={s} style={{ width:"100%", textAlign:"left", background:i===0?C.accentDim:"none", border:"none", borderRadius:"6px", padding:"8px 10px", color:i===0?C.accent:C.textMuted, fontFamily:MONO, fontSize:"11px", cursor:"pointer", marginBottom:"2px" }}>{s}</button>
        ))}
      </div>
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:"10px", padding:"20px" }}>
        <div style={{ fontFamily:DISPLAY, fontSize:"15px", fontWeight:"700", color:C.text, marginBottom:"18px" }}>Account</div>
        <div style={{ display:"flex", alignItems:"center", gap:"14px", marginBottom:"20px", padding:"14px", background:C.surfaceAlt, borderRadius:"10px" }}>
          <Av init={user.avatar} size={48} color={user.color||C.accent} />
          <div>
            <div style={{ fontFamily:DISPLAY, fontSize:"16px", fontWeight:"700", color:C.text }}>{user.name}</div>
            <div style={{ fontFamily:MONO, fontSize:"11px", color:C.textMuted }}>{user.email||"demo@nexushr.com"}</div>
            <div style={{ marginTop:"4px" }}><Badge color="accent">{user.role}</Badge></div>
          </div>
        </div>
        {[["Company","Acme Corporation"],["Timezone","UTC+0 (GMT)"],["Currency","USD ($)"]].map(([l,v])=>(
          <div key={l} style={{ marginBottom:"14px" }}>
            <div style={{ fontFamily:MONO, fontSize:"10px", color:C.textMuted, marginBottom:"5px", letterSpacing:"0.05em" }}>{l}</div>
            <input defaultValue={v} style={{ background:C.surfaceAlt, border:`1px solid ${C.border}`, borderRadius:"6px", padding:"9px 12px", color:C.text, fontFamily:MONO, fontSize:"11px", outline:"none", width:"100%" }} />
          </div>
        ))}
        <div style={{ background:C.accentDim, border:`1px solid ${C.accent}33`, borderRadius:"8px", padding:"12px 14px", marginBottom:"14px" }}>
          <div style={{ fontFamily:MONO, fontSize:"11px", fontWeight:"700", color:C.accent, marginBottom:"3px" }}>🔓 Open Source</div>
          <div style={{ fontFamily:MONO, fontSize:"10px", color:C.textMuted }}>Nexus HR is MIT-licensed. Fork, self-host, and contribute at <a href="https://github.com/SamoTech/nexus-hr" style={{ color:C.accent }}>github.com/SamoTech/nexus-hr</a></div>
        </div>
        <button onClick={onLogout} style={{ background:C.redDim, border:`1px solid ${C.red}33`, color:C.red, borderRadius:"8px", padding:"10px 18px", fontFamily:MONO, fontWeight:"700", fontSize:"11px", cursor:"pointer" }}>⏏ Sign Out</button>
      </div>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════
// ROOT APP
// ══════════════════════════════════════════════════════════════

export default function App() {
  const [user,   setUser]   = useState(null);
  const [active, setActive] = useState("dashboard");
  const [isPro,  setIsPro]  = useState(false);

  const handleLogin  = (acc) => { setUser(acc); setIsPro(acc.isPro || false); setActive("dashboard"); };
  const handleLogout = ()    => { setUser(null); setActive("dashboard"); };

  if (!user) return <SignIn onLogin={handleLogin} />;

  const renderPage = () => {
    switch(active) {
      case "dashboard":   return <Dashboard   isPro={isPro} user={user} />;
      case "employees":   return <Employees   isPro={isPro} />;
      case "recruitment": return <Recruitment />;
      case "payroll":     return <Payroll     isPro={isPro} />;
      case "analytics":   return <Analytics   isPro={isPro} />;
      case "attendance":  return <Attendance  />;
      case "tickets":     return <Helpdesk    />;
      case "settings":    return <Settings    user={user} onLogout={handleLogout} />;
      default:            return <Dashboard   isPro={isPro} user={user} />;
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;900&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:${C.bg}; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-track { background:${C.bg}; }
        ::-webkit-scrollbar-thumb { background:${C.border}; border-radius:3px; }
      `}</style>
      <div style={{ display:"flex", minHeight:"100vh", background:C.bg }}>
        <Sidebar active={active} setActive={setActive} isPro={isPro} user={user} onLogout={handleLogout} />
        <div style={{ flex:1, overflowY:"auto", minWidth:0 }}>
          {/* Topbar */}
          <div style={{ height:"50px", background:C.surface, borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", paddingLeft:"22px", paddingRight:"18px", gap:"12px", position:"sticky", top:0, zIndex:100 }}>
            <div style={{ fontFamily:MONO, fontSize:"10px", color:C.textMuted, flex:1, letterSpacing:"0.08em" }}>
              {NAV.find(n=>n.id===active)?.label.toUpperCase()}
            </div>
            {/* Pro toggle */}
            <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
              <span style={{ fontFamily:MONO, fontSize:"10px", color:C.textMuted }}>Pro Demo:</span>
              <button onClick={()=>setIsPro(!isPro)} style={{ background:isPro?C.gold:C.surfaceAlt, border:`1px solid ${isPro?C.gold+"66":C.border}`, color:isPro?"#000":C.textMuted, borderRadius:"20px", padding:"4px 12px", fontFamily:MONO, fontSize:"10px", fontWeight:"700", cursor:"pointer", transition:"all .2s" }}>
                {isPro?"⭐ PRO":"FREE"}
              </button>
            </div>
            {/* Notif */}
            <div style={{ position:"relative" }}>
              <button style={{ background:C.surfaceAlt, border:`1px solid ${C.border}`, color:C.textMuted, borderRadius:"6px", padding:"6px 10px", fontFamily:MONO, fontSize:"12px", cursor:"pointer" }}>🔔</button>
              <div style={{ position:"absolute", top:"-3px", right:"-3px", width:"8px", height:"8px", background:C.red, borderRadius:"50%", border:`2px solid ${C.surface}` }} />
            </div>
            {/* User chip */}
            <div style={{ display:"flex", alignItems:"center", gap:"8px", background:C.surfaceAlt, border:`1px solid ${C.border}`, borderRadius:"20px", padding:"4px 12px 4px 6px" }}>
              <Av init={user.avatar} size={24} color={user.color||C.accent} />
              <span style={{ fontFamily:MONO, fontSize:"10px", color:C.text, fontWeight:"700" }}>{user.name.split(" ")[0]}</span>
            </div>
          </div>
          <div style={{ padding:"24px" }}>
            {renderPage()}
          </div>
        </div>
      </div>
    </>
  );
}
