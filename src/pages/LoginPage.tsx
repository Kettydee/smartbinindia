import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { STATES_CITIES } from "@/lib/smartbin-data";
import { useApp } from "@/lib/smartbin-context";

const FEATURES = [
  { icon: "🤖", title: "AI-Powered Classification", desc: "90% accuracy via TensorFlow Lite on Raspberry Pi" },
  { icon: "📡", title: "Live GPS Tracking", desc: "Real-time bin location from NEO-6M GPS modules" },
  { icon: "🚛", title: "Fleet Dispatch", desc: "Live truck assignment and route tracking" },
];

export default function LoginPage() {
  const { login } = useApp();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [empId, setEmpId] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [selectedState, setSelectedState] = useState("Maharashtra");
  const [selectedCity, setSelectedCity] = useState("Mumbai");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [dept, setDept] = useState("Sanitation");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const cities = STATES_CITIES[selectedState] || [];

  useEffect(() => {
    if (cities.length && !cities.includes(selectedCity)) setSelectedCity(cities[0]);
  }, [selectedState]);

  const autofillDemo = () => {
    setEmpId("MUN-DEMO2024");
    setPassword("smartbin@123");
    setSelectedState("Maharashtra");
    setSelectedCity("Mumbai");
  };

  const handleLogin = () => {
    if (!empId || password.length < 6) {
      setError("Invalid credentials. Password must be 6+ characters.");
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }
    setLoading(true);
    setError("");
    setTimeout(() => {
      setLoading(false);
      login(empId === "MUN-DEMO2024" ? "Demo Officer" : "Municipal Officer", empId, selectedState, selectedCity);
    }, 1500);
  };

  const handleSignup = () => {
    if (!fullName || !empId || !email || password.length < 6 || password !== confirmPw) {
      setError("Please fill all fields correctly. Passwords must match (6+ chars).");
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }
    setLoading(true);
    setError("");
    setTimeout(() => {
      setLoading(false);
      login(fullName, empId, selectedState, selectedCity);
    }, 1500);
  };

  return (
    <div className="min-h-screen grid-bg flex">
      {/* Left Hero */}
      <div className="hidden lg:flex flex-col justify-center px-16 w-[60%] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-sb-surface opacity-90" />
        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-3">
            <span className="text-4xl">♻️</span>
            <h1 className="text-5xl font-bold font-display tracking-tight text-foreground">SmartBin</h1>
          </div>
          <p className="text-xl text-foreground/80 max-w-lg leading-relaxed">
            Intelligent Waste Infrastructure for Modern India
          </p>
          <p className="text-sm text-muted-foreground">
            Government of India · Smart Cities Mission · Municipal Corporation Portal
          </p>
          <div className="h-1 w-48 rounded-full overflow-hidden flex">
            <div className="w-1/3 bg-orange-500" /><div className="w-1/3 bg-white" /><div className="w-1/3 bg-green-600" />
          </div>
          <div className="space-y-4 pt-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.2 }}
                className="flex items-start gap-4 p-4 rounded-lg bg-card/50 border border-border/50 backdrop-blur"
              >
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <p className="font-semibold text-foreground">{f.title}</p>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground/60 pt-4">
            Powered by Raspberry Pi · MobileNetV2 · NEO-6M GPS · Firebase
          </p>
        </div>
      </div>

      {/* Right Auth */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-card border border-border rounded-xl p-8 space-y-6 shadow-2xl">
            <div className="text-center lg:hidden mb-4">
              <span className="text-3xl">♻️</span>
              <h2 className="text-2xl font-bold font-display text-foreground">SmartBin</h2>
            </div>

            {/* Tab Toggle */}
            <div className="flex bg-muted rounded-lg p-1">
              {(["login", "signup"] as const).map(t => (
                <button key={t} onClick={() => { setTab(t); setError(""); }}
                  className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {t === "login" ? "Login" : "Sign Up"}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {tab === "login" ? (
                <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <Input label="Employee ID" placeholder="MUN-XXXXXXXX" value={empId} onChange={setEmpId} />
                  <Input label="Password" placeholder="••••••••" value={password} onChange={setPassword} type={showPw ? "text" : "password"}
                    right={<button onClick={() => setShowPw(!showPw)} className="text-xs text-muted-foreground hover:text-foreground">{showPw ? "Hide" : "Show"}</button>} />
                  <div className="grid grid-cols-2 gap-3">
                    <SelectInput label="State" value={selectedState} onChange={v => setSelectedState(v)} options={Object.keys(STATES_CITIES)} />
                    <SelectInput label="City" value={selectedCity} onChange={v => setSelectedCity(v)} options={cities} />
                  </div>
                  {error && <p className="text-sm text-sb-danger">{error}</p>}
                  <button onClick={handleLogin} disabled={loading}
                    className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-sm transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <Spinner /> : null} {loading ? "Accessing Portal…" : "Access Portal"}
                  </button>
                  {/* Demo Credentials */}
                  <div className="border border-border rounded-lg p-3 bg-muted/50">
                    <p className="font-mono text-xs text-muted-foreground mb-2">┌─ DEMO CREDENTIALS ─────────────────┐</p>
                    <p className="font-mono text-xs text-foreground">│  Employee ID : MUN-DEMO2024</p>
                    <p className="font-mono text-xs text-foreground">│  Password    : smartbin@123</p>
                    <p className="font-mono text-xs text-foreground">│  State       : Maharashtra</p>
                    <p className="font-mono text-xs text-foreground">│  City        : Mumbai</p>
                    <p className="font-mono text-xs text-muted-foreground">└────────────────────────────────────┘</p>
                    <button onClick={autofillDemo} className="mt-2 w-full py-1.5 text-xs rounded bg-sb-green/20 text-sb-green font-semibold hover:bg-sb-green/30 transition">
                      ⚡ Use Demo Credentials
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="signup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  <Input label="Full Name" placeholder="Your full name" value={fullName} onChange={setFullName} />
                  <Input label="Employee ID" placeholder="MUN-XXXXXXXX" value={empId} onChange={setEmpId} />
                  <SelectInput label="Department" value={dept} onChange={setDept} options={["Sanitation", "Public Works", "Health", "Urban Planning", "IT"]} />
                  <div className="grid grid-cols-2 gap-3">
                    <SelectInput label="State" value={selectedState} onChange={v => setSelectedState(v)} options={Object.keys(STATES_CITIES)} />
                    <SelectInput label="City" value={selectedCity} onChange={v => setSelectedCity(v)} options={cities} />
                  </div>
                  <Input label="Email" placeholder="you@gov.in" value={email} onChange={setEmail} />
                  <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={setPassword} />
                  <Input label="Confirm Password" type="password" placeholder="••••••••" value={confirmPw} onChange={setConfirmPw} />
                  {password && <PasswordStrength password={password} />}
                  {error && <p className="text-sm text-sb-danger">{error}</p>}
                  <button onClick={handleSignup} disabled={loading}
                    className="w-full py-3 rounded-lg bg-secondary text-secondary-foreground font-bold text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <Spinner /> : null} {loading ? "Creating Account…" : "Create Account"}
                  </button>
                  <p className="text-xs text-muted-foreground text-center">Account activation subject to Municipal Corporation approval.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Input({ label, type = "text", placeholder, value, onChange, right }: {
  label: string; type?: string; placeholder: string; value: string; onChange: (v: string) => void; right?: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground mb-1 block">{label}</label>
      <div className="relative">
        <input type={type} placeholder={placeholder} value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring" />
        {right && <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>}
      </div>
    </div>
  );
}

function SelectInput({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground mb-1 block">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Spinner() {
  return <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />;
}

function PasswordStrength({ password }: { password: string }) {
  const strength = password.length >= 12 ? 3 : password.length >= 8 ? 2 : password.length >= 6 ? 1 : 0;
  const colors = ["bg-sb-danger", "bg-sb-amber", "bg-sb-blue", "bg-sb-green"];
  const labels = ["Weak", "Fair", "Good", "Strong"];
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1 flex-1">{[0, 1, 2, 3].map(i => (
        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? colors[strength] : "bg-border"}`} />
      ))}</div>
      <span className="text-xs text-muted-foreground">{labels[strength]}</span>
    </div>
  );
}
