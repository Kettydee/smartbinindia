import { useState } from "react";
import { useApp } from "@/lib/smartbin-context";
import { BinData } from "@/lib/smartbin-data";

export default function ManualEntryPanel({ onClose }: { onClose: () => void }) {
  const { city, state: appState, addManualEntry, deleteManualEntry, manualEntries } = useApp();
  const [binId, setBinId] = useState(`SB-${city.substring(0, 3).toUpperCase()}-`);
  const [locName, setLocName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [wetPct, setWetPct] = useState(30);
  const [dryPct, setDryPct] = useState(20);
  const [battery, setBattery] = useState(90);
  const [status, setStatus] = useState<"ONLINE" | "OFFLINE" | "MAINTENANCE">("ONLINE");
  const [lastClass, setLastClass] = useState<"WET_WASTE" | "DRY_WASTE">("WET_WASTE");
  const [confidence, setConfidence] = useState(85);

  const handleSubmit = () => {
    if (!binId || !locName || !lat || !lng) return;
    const entry: BinData = {
      bin_id: binId, timestamp: new Date().toISOString(),
      gps: { lat: parseFloat(lat), lng: parseFloat(lng), accuracy_m: 5 },
      fill: { wet_pct: wetPct, dry_pct: dryPct }, status, battery_pct: battery,
      last_classification: { class: lastClass, confidence, inference_ms: 420 },
      total_events_today: 0, location_name: locName, zone: "Zone A",
      city, state: appState,
    };
    addManualEntry(entry);
    setBinId(`SB-${city.substring(0, 3).toUpperCase()}-`);
    setLocName("");
    setLat("");
    setLng("");
  };

  return (
    <aside className="w-80 border-l border-border bg-sb-surface shrink-0 overflow-y-auto">
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-foreground">✏️ Data Entry</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
        </div>

        <MiniInput label="Bin ID" value={binId} onChange={setBinId} />
        <MiniInput label="Location Name" value={locName} onChange={setLocName} />
        <div className="grid grid-cols-2 gap-2">
          <MiniInput label="Latitude" value={lat} onChange={setLat} type="number" />
          <MiniInput label="Longitude" value={lng} onChange={setLng} type="number" />
        </div>
        <SliderInput label={`Wet Fill: ${wetPct}%`} value={wetPct} onChange={setWetPct} />
        <SliderInput label={`Dry Fill: ${dryPct}%`} value={dryPct} onChange={setDryPct} />
        <SliderInput label={`Battery: ${battery}%`} value={battery} onChange={setBattery} />
        <div>
          <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value as any)}
            className="w-full px-2 py-1.5 text-xs bg-muted border border-border rounded text-foreground">
            <option>ONLINE</option><option>OFFLINE</option><option>MAINTENANCE</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Classification</label>
            <select value={lastClass} onChange={e => setLastClass(e.target.value as any)}
              className="w-full px-2 py-1.5 text-xs bg-muted border border-border rounded text-foreground">
              <option>WET_WASTE</option><option>DRY_WASTE</option>
            </select>
          </div>
          <MiniInput label="Confidence %" value={String(confidence)} onChange={v => setConfidence(+v)} type="number" />
        </div>

        <button onClick={handleSubmit} className="w-full py-2 rounded-lg bg-sb-green/20 text-sb-green font-bold text-xs hover:bg-sb-green/30 transition">
          Submit Entry
        </button>

        {/* Entries table */}
        {manualEntries.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase">Entries ({manualEntries.length})</h4>
            {manualEntries.map(e => (
              <div key={e.bin_id} className="bg-card border border-border rounded-lg p-2 text-[10px]">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-foreground font-bold">{e.bin_id}</span>
                  <button onClick={() => deleteManualEntry(e.bin_id)} className="text-sb-danger hover:underline">Del</button>
                </div>
                <p className="text-muted-foreground">{e.location_name} · W:{e.fill.wet_pct}% D:{e.fill.dry_pct}%</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

function MiniInput({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-2 py-1.5 text-xs bg-muted border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
    </div>
  );
}

function SliderInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">{label}</label>
      <input type="range" min={0} max={100} value={value} onChange={e => onChange(+e.target.value)}
        className="w-full h-1 accent-primary" />
    </div>
  );
}
