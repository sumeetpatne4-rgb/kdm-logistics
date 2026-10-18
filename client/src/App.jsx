import { useEffect, useState } from "react";
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, BadgeCheck, Box, Building2, Check, ChevronDown,
  CircleHelp, Clock3, Container, Globe2, Headphones, MapPin, Menu, PackageCheck, PackageSearch,
  Phone, Route, ShieldCheck, Truck, Warehouse, X, LogIn, LogOut, UserRound, ClipboardList, Search
} from "lucide-react";

const API = "/api";
const SERVICES = [
  { title: "Road Freight", tag: "Reliable ground transport", text: "Flexible full-truckload and shared-load transport for business-critical cargo.", icon: Truck, number: "01" },
  { title: "Express Delivery", tag: "When every hour matters", text: "Priority handling and clear milestones for time-sensitive consignments.", icon: PackageCheck, number: "02" },
  { title: "Warehousing", tag: "Space to scale", text: "Organized storage, inventory handling, and distribution support in one workflow.", icon: Warehouse, number: "03" },
  { title: "Supply Chain", tag: "Connected operations", text: "Coordinate movement, planning, and shipment visibility from pickup to destination.", icon: Route, number: "04" }
];
const STATUSES = ["Quote Requested", "Confirmed", "Picked Up", "In Transit", "Out for Delivery", "Delivered", "On Hold"];
const emptyBooking = { service: "Road Freight", origin: "", destination: "", pickupDate: "", packageType: "Cartons", weightKg: "", notes: "" };

async function api(path, options = {}, token) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Something went wrong. Please try again.");
  return data;
}
function Logo({ light = false }) {
  return <a className={`brand ${light ? "brand-light" : ""}`} href="#home" aria-label="KDM Logistics home">
    <span className="brand-mark"><span>K</span><span>D</span><span>M</span></span>
    <span className="brand-copy"><b>KDM <em>LOGISTICS</em></b><small>MOVE WITH CONFIDENCE</small></span>
  </a>;
}
function Header({ user, onAuth, onLogout }) {
  const [open, setOpen] = useState(false);
  return <header className="header">
    <div className="nav-wrap container">
      <Logo />
      <button className="mobile-toggle" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X/> : <Menu/>}</button>
      <nav className={open ? "nav nav-open" : "nav"}>
        <a href="#services" onClick={() => setOpen(false)}>Services</a>
        <a href="#tracking" onClick={() => setOpen(false)}>Track shipment</a>
        <a href="#about" onClick={() => setOpen(false)}>About us</a>
        {user?.role === "admin" && <a href="#admin" onClick={() => setOpen(false)}>Admin</a>}
        {user ? <div className="nav-user"><span className="avatar"><UserRound size={16}/></span><span>{user.name.split(" ")[0]}</span><button className="icon-button" onClick={onLogout} title="Sign out"><LogOut size={17}/></button></div>
          : <button className="nav-login" onClick={() => { onAuth(); setOpen(false); }}>Sign in <ArrowUpRight size={16}/></button>}
        <a className="btn btn-orange nav-cta" href="#book" onClick={() => setOpen(false)}>Get a quote <ArrowRight size={16}/></a>
      </nav>
    </div>
  </header>;
}
function SectionEyebrow({ children }) { return <div className="eyebrow"><span/> {children}</div>; }
function Hero({ onTrack }) {
  const [tracking, setTracking] = useState("");
  return <section className="hero" id="home">
    <div className="hero-grid"/>
    <div className="container hero-layout">
      <div className="hero-copy">
        <div className="hero-pill"><span className="pulse-dot"/> LOGISTICS THAT KEEP YOU MOVING</div>
        <h1>Moving your<br/>business <span>forward.</span></h1>
        <p className="hero-sub">Dependable freight. Clear visibility. A logistics partner that moves at the speed of your ambition.</p>
        <div className="hero-actions"><a className="btn btn-orange btn-large" href="#book">Ship with KDM <ArrowRight size={18}/></a><a className="text-link" href="#services">Explore services <ArrowDownRight size={17}/></a></div>
        <div className="hero-proof"><div className="proof-icon"><ShieldCheck size={21}/></div><div><b>Built around your business</b><span>Careful handling. Clear communication.</span></div></div>
      </div>
      <div className="hero-visual">
        <div className="hero-image" role="img" aria-label="Freight truck travelling on a highway">
          <div className="image-overlay"/>
          <div className="image-label"><span className="label-icon"><Truck size={17}/></span><div><b>Every mile matters.</b><small>From pickup to delivery</small></div><ArrowUpRight size={17}/></div>
        </div>
        <div className="floating-card route-card"><span className="float-icon"><Route size={20}/></span><div><small>SMARTER MOVEMENT</small><b>One connected journey</b></div></div>
        <div className="floating-card status-card"><span className="status-check"><Check size={17}/></span><div><small>SHIPMENT VISIBILITY</small><b>Stay in the know</b></div></div>
        <div className="hero-stamp"><Globe2 size={21}/><span>LOCAL REACH.<br/><b>WIDER POSSIBILITIES.</b></span></div>
      </div>
    </div>
    <div className="container hero-bottom"><span>LOGISTICS, MADE MORE HUMAN</span><div className="hero-bottom-line"/><span>SCROLL TO DISCOVER <ArrowDownRight size={14}/></span></div>
  </section>;
}
function Tracking({ onResult }) {
  const [id, setId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e) {
    e.preventDefault(); if (!id.trim()) return;
    setBusy(true); setError("");
    try { const result = await api(`/shipments/track/${encodeURIComponent(id.trim())}`); onResult(result.shipment); }
    catch (err) { setError(err.message); onResult(null); }
    finally { setBusy(false); }
  }
  return <section className="tracking-section" id="tracking">
    <div className="container tracking-layout">
      <div className="tracking-heading"><span className="tracking-icon"><PackageSearch size={22}/></span><div><SectionEyebrow>TRACK YOUR SHIPMENT</SectionEyebrow><h2>Your delivery,<br/><span>in the know.</span></h2><p>Enter your KDM tracking number for the latest shipment status.</p></div></div>
      <form className="tracking-form" onSubmit={submit}><label htmlFor="trackingId">TRACKING NUMBER</label><div className="tracking-input"><Search size={18}/><input id="trackingId" placeholder="e.g. KDM-1A2B3C4D" value={id} onChange={e => setId(e.target.value)} required/><button className="btn btn-orange" disabled={busy}>{busy ? "Checking…" : "Track now"} <ArrowRight size={16}/></button></div>{error && <p className="form-error">{error}</p>}<small><ShieldCheck size={13}/> Shipment details are securely retrieved from our system.</small></form>
    </div>
  </section>;
}
function TrackResult({ shipment, onClose }) {
  if (!shipment) return null;
  const steps = ["Quote Requested", "Confirmed", "Picked Up", "In Transit", "Out for Delivery", "Delivered"];
  const idx = steps.indexOf(shipment.status);
  return <div className="modal-backdrop" onClick={onClose}><div className="modal tracking-result" onClick={e => e.stopPropagation()}>
    <button className="modal-close" onClick={onClose}><X/></button><span className="success-icon"><PackageCheck size={24}/></span><SectionEyebrow>SHIPMENT DETAILS</SectionEyebrow><h2>{shipment.trackingId}</h2><p className="muted">Your shipment status is shown below.</p>
    <div className="result-status"><span className="mini-label">CURRENT STATUS</span><b>{shipment.status}</b></div>
    <div className="route-points"><div><span className="route-dot origin-dot"/><small>ORIGIN</small><b>{shipment.origin}</b></div><div className="route-dash"/><div><span className="route-dot destination-dot"/><small>DESTINATION</small><b>{shipment.destination}</b></div></div>
    <div className="progress-steps">{steps.map((step, i) => <div className={`progress-step ${idx >= i ? "complete" : ""}`} key={step}><span>{idx > i ? <Check size={12}/> : i + 1}</span><small>{step}</small></div>)}</div>
    <button className="btn btn-dark btn-full" onClick={onClose}>Done</button>
  </div></div>;
}
function Services() {
  return <section className="section services-section" id="services"><div className="container">
    <div className="section-heading"><div><SectionEyebrow>WHAT WE DO</SectionEyebrow><h2>More than moving.<br/><span>We move you ahead.</span></h2></div><p>Practical logistics solutions designed to make every connection smoother and every delivery more dependable.</p></div>
    <div className="services-grid">{SERVICES.map((s) => { const Icon = s.icon; return <article className="service-card" key={s.title}><div className="service-top"><span className="service-icon"><Icon size={23}/></span><span className="service-number">{s.number}</span></div><small>{s.tag}</small><h3>{s.title}</h3><p>{s.text}</p><a href="#book" aria-label={`Request a quote for ${s.title}`}>Explore service <ArrowUpRight size={16}/></a></article>; })}</div>
  </div></section>;
}
function About() {
  return <section className="about-section" id="about"><div className="container about-layout"><div className="about-visual"><div className="about-image" role="img" aria-label="Freight containers at a logistics terminal"/><div className="about-note"><span><BadgeCheck size={22}/></span><div><b>Every shipment has a story.</b><small>We help it reach its destination.</small></div></div><div className="about-vertical">DEPENDABLE BY DESIGN · KDM LOGISTICS</div></div>
    <div className="about-copy"><SectionEyebrow>THE KDM DIFFERENCE</SectionEyebrow><h2>Good logistics<br/>is <span>good business.</span></h2><p className="about-lead">Your supply chain is more than a route. It is a promise to your customer. We help you keep it.</p><p className="muted">KDM Logistics is presented here as a modern logistics brand concept focused on reliable transportation, shipment visibility, and responsive service. Replace this introduction with your company's verified history, locations, and operating capabilities before publishing.</p><div className="about-points"><div><span><Check size={15}/></span><div><b>Clear communication</b><small>Useful updates, without the guesswork.</small></div></div><div><span><Check size={15}/></span><div><b>Customer-first planning</b><small>Solutions shaped around your cargo.</small></div></div><div><span><Check size={15}/></span><div><b>One connected view</b><small>Booking and tracking in one place.</small></div></div></div><a href="#book" className="btn btn-dark">Let's move forward <ArrowRight size={16}/></a></div>
  </div></section>;
}
function Booking({ user, onAuth, onBooked }) {
  const [form, setForm] = useState(emptyBooking);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const update = (key, value) => setForm(old => ({ ...old, [key]: value }));
  async function submit(e) {
    e.preventDefault();
    if (!user) { onAuth(); return; }
    setBusy(true); setError("");
    try { const data = await api("/shipments", { method: "POST", body: JSON.stringify(form) }, user.token); onBooked(data.shipment); setForm(emptyBooking); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <section className="booking-section" id="book"><div className="container booking-layout"><div className="booking-intro"><SectionEyebrow>LET'S GET IT MOVING</SectionEyebrow><h2>Tell us where<br/>it needs to <span>go.</span></h2><p>Share a few shipment details and our team can review your request. A quote is not confirmed until your logistics team follows up.</p><div className="booking-help"><span><Headphones size={20}/></span><div><b>Need a hand?</b><small>Use the contact form to share your question with our team.</small></div></div><div className="booking-decoration"><Route size={120} strokeWidth={0.7}/></div></div>
    <form className="booking-form" onSubmit={submit}><div className="form-head"><div><span className="form-step">01 / SHIPMENT DETAILS</span><h3>Request a quote</h3></div><span className="form-lock"><ShieldCheck size={19}/></span></div>
      {!user && <div className="inline-notice"><CircleHelp size={17}/> Please sign in before submitting a shipment request. <button type="button" onClick={onAuth}>Sign in</button></div>}
      <div className="form-grid"><div className="field field-full"><label>LOGISTICS SERVICE *</label><select value={form.service} onChange={e => update("service", e.target.value)} required>{SERVICES.map(s => <option key={s.title}>{s.title}</option>)}</select></div>
      <div className="field"><label>PICKUP LOCATION *</label><div className="field-icon"><MapPin size={16}/><input value={form.origin} onChange={e => update("origin", e.target.value)} placeholder="City or postcode" required maxLength={180}/></div></div>
      <div className="field"><label>DELIVERY LOCATION *</label><div className="field-icon"><MapPin size={16}/><input value={form.destination} onChange={e => update("destination", e.target.value)} placeholder="City or postcode" required maxLength={180}/></div></div>
      <div className="field"><label>PREFERRED PICKUP DATE *</label><input type="date" value={form.pickupDate} min={new Date().toISOString().slice(0,10)} onChange={e => update("pickupDate", e.target.value)} required/></div>
      <div className="field"><label>PACKAGE TYPE *</label><select value={form.packageType} onChange={e => update("packageType", e.target.value)} required>{["Cartons","Pallets","Documents","Industrial goods","Fragile goods","Other"].map(v => <option key={v}>{v}</option>)}</select></div>
      <div className="field"><label>WEIGHT (KG) *</label><input type="number" min="0.1" max="100000" step="0.1" value={form.weightKg} onChange={e => update("weightKg", e.target.value)} placeholder="e.g. 250" required/></div>
      <div className="field field-full"><label>ADDITIONAL DETAILS</label><textarea value={form.notes} onChange={e => update("notes", e.target.value)} placeholder="Dimensions, handling instructions, or other details…" rows="3" maxLength={1000}/></div></div>
      {error && <p className="form-error">{error}</p>}
      <button className="btn btn-orange btn-full" disabled={busy}>{busy ? "Submitting request…" : "Submit quote request"} <ArrowRight size={17}/></button><p className="form-foot"><ShieldCheck size={13}/> Your shipment request is associated with your account.</p>
    </form></div></section>;
}
function AuthModal({ onClose, onSuccess }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError("");
    try { const result = await api(`/auth/${mode}`, { method: "POST", body: JSON.stringify({ name, email, password }) }); onSuccess(result); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <div className="modal-backdrop" onClick={onClose}><div className="modal auth-modal" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={onClose}><X/></button><Logo/><SectionEyebrow>YOUR KDM ACCOUNT</SectionEyebrow><h2>{mode === "login" ? "Welcome back." : "Let's get moving."}</h2><p className="muted">{mode === "login" ? "Sign in to view your shipments and requests." : "Create an account to request and track shipments."}</p>
    <form onSubmit={submit}>{mode === "register" && <div className="field"><label>FULL NAME</label><input value={name} onChange={e => setName(e.target.value)} autoComplete="name" required minLength={2}/></div>}<div className="field"><label>EMAIL ADDRESS</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required/></div><div className="field"><label>PASSWORD</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={8}/></div>
    {error && <p className="form-error">{error}</p>}<button className="btn btn-orange btn-full" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"} <ArrowRight size={17}/></button></form>
    <p className="auth-switch">{mode === "login" ? "New to KDM?" : "Already have an account?"} <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>{mode === "login" ? "Create an account" : "Sign in"}</button></p>
  </div></div>;
}
function Dashboard({ user, onTrack }) {
  const [shipments, setShipments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => { let active = true; api("/shipments/mine", {}, user.token).then(d => { if (active) setShipments(d.shipments); }).catch(e => { if (active) setError(e.message); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [user.token]);
  const activeCount = shipments.filter(s => !["Delivered"].includes(s.status)).length;
  return <section className="dashboard-section"><div className="container"><div className="dashboard-head"><div><SectionEyebrow>CUSTOMER PORTAL</SectionEyebrow><h2>Good to see you, <span>{user.name.split(" ")[0]}.</span></h2><p className="muted">Your shipments and quote requests, all in one place.</p></div><a href="#book" className="btn btn-orange">New shipment <ArrowRight size={16}/></a></div>
    <div className="dashboard-stats"><div><span className="dash-stat-icon"><Container size={20}/></span><small>TOTAL SHIPMENTS</small><b>{shipments.length}</b></div><div><span className="dash-stat-icon"><Truck size={20}/></span><small>IN PROGRESS</small><b>{activeCount}</b></div><div><span className="dash-stat-icon"><PackageCheck size={20}/></span><small>DELIVERED</small><b>{shipments.filter(s => s.status === "Delivered").length}</b></div></div>
    <div className="table-panel"><div className="panel-heading"><div><h3>Your shipments</h3><p>Track your recent activity and delivery progress.</p></div><span className="count-pill">{shipments.length} records</span></div>
      {loading ? <div className="empty-state">Loading your shipments…</div> : error ? <div className="empty-state form-error">{error}</div> : shipments.length === 0 ? <div className="empty-state"><span className="empty-icon"><PackageSearch size={25}/></span><b>No shipments yet</b><p>Your quote requests will appear here once submitted.</p><a className="btn btn-dark" href="#book">Request your first quote</a></div> :
      <div className="table-scroll"><table><thead><tr><th>TRACKING ID</th><th>ROUTE</th><th>SERVICE</th><th>STATUS</th><th>DETAILS</th></tr></thead><tbody>{shipments.map(s => <tr key={s._id}><td className="tracking-code">{s.trackingId}</td><td><b>{s.origin}</b><span className="route-arrow"> → </span><b>{s.destination}</b></td><td>{s.service}</td><td><span className={`status-badge ${s.status === "Delivered" ? "status-green" : ""}`}>{s.status}</span></td><td><button className="table-action" onClick={() => onTrack(s.trackingId)}>Track <ArrowUpRight size={14}/></button></td></tr>)}</tbody></table></div>}
    </div></div></section>;
}
function AdminPanel({ user }) {
  const [shipments, setShipments] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState("");
  const [notice, setNotice] = useState("");
  async function load() {
    setLoading(true); setError("");
    try { const d = await api(`/shipments?search=${encodeURIComponent(search)}&status=${encodeURIComponent(statusFilter)}`, {}, user.token); setShipments(d.shipments); }
    catch (e) { setError(e.message); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [user.token, search, statusFilter]);
  async function changeStatus(id, status) {
    setSaving(id); setNotice(""); setError("");
    try { await api(`/shipments/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }, user.token); setShipments(old => old.map(s => s._id === id ? { ...s, status } : s)); setNotice("Shipment status updated."); }
    catch (e) { setError(e.message); } finally { setSaving(""); }
  }
  return <section className="admin-section" id="admin"><div className="container"><div className="dashboard-head"><div><SectionEyebrow>OPERATIONS CONSOLE</SectionEyebrow><h2>Shipment <span>management.</span></h2><p className="muted">Review quote requests and keep customers up to date.</p></div><span className="admin-role"><ShieldCheck size={16}/> Administrator</span></div>
    <div className="admin-summary"><div><small>VISIBLE RECORDS</small><b>{shipments.length}</b></div><div><small>AWAITING QUOTE</small><b>{shipments.filter(s => s.status === "Quote Requested").length}</b></div><div><small>IN TRANSIT</small><b>{shipments.filter(s => s.status === "In Transit").length}</b></div><div><small>DELIVERED</small><b>{shipments.filter(s => s.status === "Delivered").length}</b></div></div>
    <div className="table-panel"><div className="admin-filters"><div className="admin-search"><Search size={17}/><input placeholder="Search tracking, customer, route…" value={search} onChange={e => setSearch(e.target.value)}/></div><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="">All statuses</option>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
    {error && <p className="form-error admin-message">{error}</p>}{notice && <p className="form-success admin-message">{notice}</p>}
    {loading ? <div className="empty-state">Loading shipment records…</div> : shipments.length === 0 ? <div className="empty-state">No matching shipment records.</div> : <div className="table-scroll"><table><thead><tr><th>SHIPMENT</th><th>CUSTOMER</th><th>ROUTE</th><th>REQUESTED</th><th>UPDATE STATUS</th></tr></thead><tbody>{shipments.map(s => <tr key={s._id}><td><b className="tracking-code">{s.trackingId}</b><span className="table-sub">{s.service}</span></td><td><b>{s.customerName}</b><span className="table-sub">{s.customerEmail}</span></td><td><b>{s.origin}</b><span className="table-sub">to {s.destination}</span></td><td>{new Date(s.createdAt).toLocaleDateString()}</td><td><select className="status-select" disabled={saving === s._id} value={s.status} onChange={e => changeStatus(s._id, e.target.value)}>{STATUSES.map(v => <option key={v}>{v}</option>)}</select>{saving === s._id && <small className="table-sub">Saving…</small>}</td></tr>)}</tbody></table></div>}
    </div></div></section>;
}
function Toast({ message, onClose }) {
  useEffect(() => { if (!message) return; const id = setTimeout(onClose, 6500); return () => clearTimeout(id); }, [message]);
  if (!message) return null;
  return <div className="toast"><span><Check size={17}/></span><div><b>{message}</b><small>You're all set. Keep your tracking number handy.</small></div><button onClick={onClose}><X size={16}/></button></div>;
}
function Footer({ onAuth }) {
  return <footer className="footer"><div className="container"><div className="footer-main"><div className="footer-brand"><Logo light/><p>Moving business forward with dependable logistics and shipment visibility.</p><div className="footer-tag"><Globe2 size={16}/> CONNECTING THE EVERYDAY.</div></div><div className="footer-links"><b>EXPLORE</b><a href="#services">Our services</a><a href="#tracking">Track shipment</a><a href="#about">About KDM</a><a href="#book">Request a quote</a></div><div className="footer-links"><b>YOUR ACCOUNT</b><button onClick={onAuth}>Sign in / Register</button><a href="#book">Book a shipment</a><a href="#tracking">Shipment status</a></div><div className="footer-contact"><b>LET'S CONNECT</b><p><Phone size={15}/> Add your official contact number</p><p><MapPin size={15}/> Add your company address</p><small>Replace placeholder contact details before publishing.</small></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} KDM Logistics. Project concept for educational use.</span><span>BUILT FOR THE JOURNEY <ArrowUpRight size={14}/></span></div></div></footer>;
}
export default function App() {
  const [user, setUser] = useState(() => { try { return JSON.parse(sessionStorage.getItem("kdmUser") || "null"); } catch { return null; } });
  const [authOpen, setAuthOpen] = useState(false);
  const [trackResult, setTrackResult] = useState(null);
  const [toast, setToast] = useState("");
  const [booked, setBooked] = useState(null);
  useEffect(() => { if (user?.token) sessionStorage.setItem("kdmUser", JSON.stringify(user)); else sessionStorage.removeItem("kdmUser"); }, [user]);
  function signOut() { setUser(null); setToast("You have signed out."); window.scrollTo({ top: 0, behavior: "smooth" }); }
  async function trackFromDashboard(id) {
    try { const d = await api(`/shipments/track/${encodeURIComponent(id)}`); setTrackResult(d.shipment); }
    catch (e) { setToast(e.message); }
  }
  function onBooked(shipment) { setBooked(shipment); setToast(`Quote request submitted. Tracking ID: ${shipment.trackingId}`); }
  return <>
    <Header user={user} onAuth={() => setAuthOpen(true)} onLogout={signOut}/>
    <main><Hero/><Tracking onResult={setTrackResult}/><Services/><About/><Booking user={user} onAuth={() => setAuthOpen(true)} onBooked={onBooked}/>{user && user.role === "customer" && <Dashboard key={user.id || user.email} user={user} onTrack={trackFromDashboard}/ >}{user?.role === "admin" && <AdminPanel user={user}/>}</main>
    <Footer onAuth={() => setAuthOpen(true)}/>
    {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onSuccess={result => { setUser(result.user ? { ...result.user, token: result.token } : null); setAuthOpen(false); setToast("Signed in successfully."); }}/>}
    <TrackResult shipment={trackResult} onClose={() => setTrackResult(null)}/>
    {booked && <div className="modal-backdrop" onClick={() => setBooked(null)}><div className="modal booked-modal" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setBooked(null)}><X/></button><span className="success-icon"><Check size={24}/></span><SectionEyebrow>REQUEST RECEIVED</SectionEyebrow><h2>Let's get it moving.</h2><p className="muted">Your quote request has been saved. Keep this tracking number for future updates.</p><div className="tracking-number-box"><small>YOUR TRACKING NUMBER</small><b>{booked.trackingId}</b><button onClick={() => { navigator.clipboard?.writeText(booked.trackingId); setToast("Tracking number copied."); }} title="Copy tracking number"><ClipboardList size={17}/></button></div><button className="btn btn-orange btn-full" onClick={() => { setBooked(null); setTrackResult({ trackingId: booked.trackingId, service: booked.service, origin: booked.origin, destination: booked.destination, pickupDate: booked.pickupDate, status: booked.status }); }}>View shipment details <ArrowRight size={16}/></button></div></div>}
    <Toast message={toast} onClose={() => setToast("")}/>
  </>;
}
