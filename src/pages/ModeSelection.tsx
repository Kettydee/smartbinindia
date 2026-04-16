import { useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/lib/smartbin-context";

export default function ModeSelection() {
  const { userName, state, city, setMode, logout } = useApp();
  const [selected, setSelected] = useState<string | null>(null);
  const [firebaseUrl, setFirebaseUrl] = useState("");
  const [dbPath, setDbPath] = useState("/bins/SB-MUM-001");
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const cards = [
    {
      id: "live", icon: "📡", title: "Connect Real Dustbin",
      subtitle: "Access live GPS + sensor data from your physical SmartBin hardware",
      color: "sb-green", badge: null,
    },
    {
      id: "manual", icon: "✏️", title: "Manual Data Entry",
      subtitle: "Feed bin data to the database manually",
      color: "sb-blue", badge: null,
    },
    {
      id: "demo", icon: "🎬", title: "Demo Mode",
      subtitle: "See how SmartBin works — simulated live data",
      color: "sb-purple", badge: "NO SETUP REQUIRED",
    },
  ];

  const handleLaunch = (mode: string) => {
    if (mode === "live") {
      setConnecting(true);
      setTimeout(() => {
        setConnecting(false);
        setMode("live");
      }, 2000);
    } else if (mode === "manual") {
      setMode("manual");
    } else {
      setMode("demo");
    }
  };

  return (
    <div className="min-h-screen grid-bg flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <button onClick={logout} className="text-sm text-muted-foreground hover:text-foreground transition">← Back to Login</button>
        <p className="text-sm text-muted-foreground">📍 Logged in as <span className="text-foreground font-semibold">{userName}</span> · {city}, {state}</p>
      </div>

      {/* Centre content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-3">🛰️ How would you like to connect today?</h1>
          <p className="text-muted-foreground">Select your data source to continue</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {cards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.15 }}
              onClick={() => setSelected(card.id)}
              className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-300 bg-card hover:bg-card/80 ${
                selected === card.id
                  ? `border-${card.color} shadow-lg shadow-${card.color}/20`
                  : "border-border/50 opacity-80 hover:opacity-100 hover:border-border"
              }`}
            >
              {selected === card.id && (
                <div className={`absolute top-3 right-3 w-6 h-6 rounded-full bg-${card.color} flex items-center justify-center text-xs font-bold text-background`}>✓</div>
              )}
              {card.badge && (
                <span className="inline-block mb-3 px-2 py-0.5 text-[10px] font-bold rounded-full bg-sb-green/20 text-sb-green uppercase tracking-wider">{card.badge}</span>
              )}
              <div className="text-4xl mb-4">{card.icon}</div>
              <h3 className="text-lg font-bold text-foreground mb-1">{card.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{card.subtitle}</p>

              {/* Live mode inputs */}
              {card.id === "live" && selected === "live" && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="space-y-3 mt-4 border-t border-border pt-4">
                  <MiniInput label="Firebase Project URL" placeholder="https://your-project.firebaseio.com" value={firebaseUrl} onChange={setFirebaseUrl} />
                  <MiniInput label="Database Path" placeholder="/bins/SB-MUM-001" value={dbPath} onChange={setDbPath} />
                  <MiniInput label="API Key" placeholder="Your API key" type={showApiKey ? "text" : "password"} value={apiKey} onChange={setApiKey}
                    right={<button onClick={() => setShowApiKey(!showApiKey)} className="text-[10px] text-muted-foreground">{showApiKey ? "Hide" : "Show"}</button>} />
                </motion.div>
              )}

              {/* Action button */}
              <button
                onClick={e => { e.stopPropagation(); handleLaunch(card.id); }}
                className={`w-full mt-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  card.id === "live" ? "bg-sb-green/20 text-sb-green hover:bg-sb-green/30"
                  : card.id === "manual" ? "bg-sb-blue/20 text-sb-blue hover:bg-sb-blue/30"
                  : "bg-sb-purple/20 text-sb-purple hover:bg-sb-purple/30"
                }`}
              >
                {card.id === "live" && connecting ? "🔗 Connecting…" : card.id === "live" ? "🔗 Connect & Launch Dashboard" : card.id === "manual" ? "📋 Open Data Entry Panel" : "▶ Launch Demo"}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniInput({ label, placeholder, value, onChange, type = "text", right }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void; type?: string; right?: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[10px] font-semibold text-muted-foreground mb-0.5 block">{label}</label>
      <div className="relative">
        <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
          className="w-full px-2 py-1.5 text-xs bg-muted border border-border rounded text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring" />
        {right && <div className="absolute right-2 top-1/2 -translate-y-1/2">{right}</div>}
      </div>
    </div>
  );
}
