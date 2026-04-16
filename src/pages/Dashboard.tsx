import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp, AppMode } from "@/lib/smartbin-context";
import { STATES_CITIES, BinData, getBinStatus, getStatusColor, getCityCoords, generateDemoBins } from "@/lib/smartbin-data";
import BinCard from "@/components/smartbin/BinCard";
import BinDetailModal from "@/components/smartbin/BinDetailModal";
import TruckPanel from "@/components/smartbin/TruckPanel";
import StatsStrip from "@/components/smartbin/StatsStrip";
import ClassificationFeed from "@/components/smartbin/ClassificationFeed";
import ManualEntryPanel from "@/components/smartbin/ManualEntryPanel";
import DashboardMap from "@/components/smartbin/DashboardMap";
import SetupGuideModal from "@/components/smartbin/SetupGuideModal";

export default function Dashboard() {
  const app = useApp();
  const { mode, bins, trucks, state: appState, city, userName, logout, setCity, setState, classificationEvents, addClassificationEvent } = app;
  const [selectedBin, setSelectedBin] = useState<BinData | null>(null);
  const [showManualPanel, setShowManualPanel] = useState(mode === "manual");
  const [showGuide, setShowGuide] = useState(false);
  const [clock, setClock] = useState(new Date());
  const cities = STATES_CITIES[appState] || [];

  // Clock
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Demo mode: auto classification events
  useEffect(() => {
    if (mode !== "demo") return;
    const t = setInterval(() => {
      if (bins.length === 0) return;
      const bin = bins[Math.floor(Math.random() * bins.length)];
      addClassificationEvent({
        id: crypto.randomUUID(),
        bin_id: bin.bin_id,
        class: Math.random() > 0.5 ? "WET_WASTE" : "DRY_WASTE",
        confidence: +(Math.random() * 15 + 80).toFixed(1),
        time: new Date().toLocaleTimeString(),
        zone: bin.zone,
      });
    }, Math.random() * 4000 + 8000);
    return () => clearInterval(t);
  }, [mode, bins]);

  const modeBanner = {
    demo: { color: "bg-sb-purple/20 text-sb-purple border-sb-purple/30", text: "🟣 DEMO — Simulated data · Not connected to real hardware · For demonstration only" },
    manual: { color: "bg-sb-blue/20 text-sb-blue border-sb-blue/30", text: `🔵 MANUAL — Showing manually entered data · ${bins.length} entries` },
    live: { color: "bg-sb-green/20 text-sb-green border-sb-green/30", text: "🟢 LIVE — Connected to Firebase · Last sync: 3s ago" },
  };

  const criticalCount = bins.filter(b => getBinStatus(b) === "CRITICAL").length;

  return (
    <div className="min-h-screen grid-bg flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card/80 backdrop-blur flex items-center justify-between px-4 shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="text-xl">♻️</span>
          <span className="font-bold font-display text-foreground text-lg hidden sm:block">SmartBin</span>
        </div>
        <p className="text-xs text-muted-foreground hidden md:block">Ministry of Housing & Urban Affairs | Smart Cities Mission</p>
        <div className="flex items-center gap-4">
          <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${
            mode === "demo" ? "bg-sb-purple/20 text-sb-purple" : mode === "manual" ? "bg-sb-blue/20 text-sb-blue" : "bg-sb-green/20 text-sb-green"
          }`}>{mode}</span>
          {mode === "live" && <span className="w-2 h-2 rounded-full bg-sb-green pulse-dot" />}
          <span className="text-xs text-muted-foreground font-mono">{clock.toLocaleTimeString()}</span>
          <button onClick={() => setShowGuide(true)} className="text-xs text-muted-foreground hover:text-foreground">📖 Guide</button>
          <span className="text-xs text-foreground hidden sm:block">{userName}</span>
          <button onClick={logout} className="text-xs text-sb-danger hover:underline">Logout</button>
        </div>
      </header>

      {/* Mode Banner */}
      <div className={`border-b px-4 py-2 text-xs font-semibold ${modeBanner[mode!].color}`}>
        {modeBanner[mode!].text}
        {mode === "manual" && (
          <button onClick={() => setShowManualPanel(!showManualPanel)} className="ml-4 underline">✏️ {showManualPanel ? "Hide" : "Open"} Entry Panel</button>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-sb-surface shrink-0 overflow-y-auto hidden lg:block">
          <div className="p-4 space-y-4">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground block mb-1">STATE</label>
              <select value={appState} onChange={e => { setState(e.target.value); const c = STATES_CITIES[e.target.value]; if (c?.length) setCity(c[0]); }}
                className="w-full px-2 py-2 text-sm bg-muted border border-border rounded-lg text-foreground focus:outline-none">
                {Object.keys(STATES_CITIES).map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              {cities.map(c => (
                <button key={c} onClick={() => setCity(c)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                    city === c ? "bg-primary/10 text-primary border-l-2 border-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}>
                  <span className={`w-2 h-2 rounded-full ${city === c ? "bg-primary" : "bg-muted-foreground/30"}`} />
                  {c}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          <StatsStrip bins={bins} criticalCount={criticalCount} />

          {/* Location Header */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-2xl font-bold font-display text-foreground">{city}</h2>
              <p className="text-sm text-muted-foreground">{appState} · {bins.length} bins active</p>
            </div>
            <div className="flex gap-2">
              {mode === "live" && <span className="text-xs text-sb-green bg-sb-green/10 px-3 py-1.5 rounded-full font-semibold">📡 GPS Active</span>}
              <button onClick={() => { if (mode === "demo") { const newBins = generateDemoBins(city, appState); /* trigger re-render */ } }}
                className="px-3 py-1.5 text-xs rounded-lg bg-muted text-muted-foreground hover:text-foreground transition">⟳ Refresh</button>
            </div>
          </div>

          {/* Bin Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {bins.map(bin => (
              <BinCard key={bin.bin_id} bin={bin} onClick={() => setSelectedBin(bin)} />
            ))}
            {bins.length === 0 && (
              <div className="col-span-full text-center py-16 text-muted-foreground">
                {mode === "manual" ? "No manual entries yet for this city. Open the Data Entry Panel to add bins." : "No bins available."}
              </div>
            )}
          </div>

          {/* 2x2 Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <WeeklyTrendChart />
            <AIPerformanceRing bins={bins} />
            <ClassificationFeed events={classificationEvents} />
            <SystemAlerts bins={bins} />
          </div>

          {/* Map */}
          <DashboardMap bins={bins} mode={mode!} city={city} />

          {/* Trucks */}
          <TruckPanel />
        </main>

        {/* Manual Entry Sidebar */}
        {mode === "manual" && showManualPanel && (
          <ManualEntryPanel onClose={() => setShowManualPanel(false)} />
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedBin && <BinDetailModal bin={selectedBin} onClose={() => setSelectedBin(null)} />}
      </AnimatePresence>
      {showGuide && <SetupGuideModal onClose={() => setShowGuide(false)} />}
    </div>
  );
}

/* --- Inline sub-components --- */

function WeeklyTrendChart() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const wetData = [42, 55, 48, 63, 71, 58, 44];
  const dryData = [35, 40, 38, 52, 48, 43, 37];
  const maxVal = 80;
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="text-sm font-bold text-foreground mb-4">Weekly Fill Trend</h3>
      <div className="flex items-end gap-2 h-32">
        {days.map((d, i) => (
          <div key={d} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex gap-0.5 items-end" style={{ height: "100%" }}>
              <motion.div initial={{ height: 0 }} animate={{ height: `${(wetData[i] / maxVal) * 100}%` }} transition={{ delay: i * 0.05 }}
                className="flex-1 bg-sb-wet/60 rounded-t" />
              <motion.div initial={{ height: 0 }} animate={{ height: `${(dryData[i] / maxVal) * 100}%` }} transition={{ delay: i * 0.05 + 0.03 }}
                className="flex-1 bg-sb-dry/60 rounded-t" />
            </div>
            <span className="text-[10px] text-muted-foreground">{d}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-sb-wet/60" /> Wet</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-sb-dry/60" /> Dry</span>
      </div>
    </div>
  );
}

function AIPerformanceRing({ bins }: { bins: BinData[] }) {
  const avgAccuracy = bins.length ? +(bins.reduce((s, b) => s + b.last_classification.confidence, 0) / bins.length).toFixed(1) : 90;
  const circumference = 2 * Math.PI * 45;
  const dashOffset = circumference - (avgAccuracy / 100) * circumference;
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col items-center justify-center">
      <h3 className="text-sm font-bold text-foreground mb-4">AI Accuracy</h3>
      <svg width="120" height="120" className="-rotate-90">
        <circle cx="60" cy="60" r="45" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
        <motion.circle cx="60" cy="60" r="45" fill="none" stroke="hsl(var(--sb-green))" strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.5, ease: "easeOut" }} />
      </svg>
      <p className="text-3xl font-bold font-mono text-foreground -mt-[76px] mb-8">{avgAccuracy}%</p>
      <p className="text-xs text-muted-foreground">MobileNetV2 · INT8</p>
    </div>
  );
}

function SystemAlerts({ bins }: { bins: BinData[] }) {
  const alerts = bins.filter(b => getBinStatus(b) !== "NORMAL").slice(0, 6);
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="text-sm font-bold text-foreground mb-4">System Alerts</h3>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {alerts.length === 0 && <p className="text-xs text-muted-foreground">All bins nominal ✓</p>}
        {alerts.map(b => {
          const status = getBinStatus(b);
          return (
            <div key={b.bin_id} className="flex items-center gap-3 text-xs">
              <span className={`w-2 h-2 rounded-full bg-${getStatusColor(status)}`} />
              <span className="font-mono text-foreground">{b.bin_id}</span>
              <span className="text-muted-foreground flex-1">{b.location_name}</span>
              <span className={`font-semibold text-${getStatusColor(status)}`}>{status === "CRITICAL" ? "CRITICAL" : "NEAR FULL"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
