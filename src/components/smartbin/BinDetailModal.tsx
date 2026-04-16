import { motion } from "framer-motion";
import { BinData, getBinStatus, getStatusColor } from "@/lib/smartbin-data";

export default function BinDetailModal({ bin, onClose }: { bin: BinData; onClose: () => void }) {
  const status = getBinStatus(bin);

  const logs = [
    `[SYSTEM] SmartBin ${bin.bin_id} — ${bin.city}, ${bin.state}`,
    `[GPS]    Position: ${bin.gps.lat.toFixed(6)}°N, ${bin.gps.lng.toFixed(6)}°E | Accuracy: ${bin.gps.accuracy_m}m`,
    `[INFO]   TFLite model loaded: model.tflite (MobileNetV2)`,
    `[DETECT] Object at ${(Math.random() * 20 + 5).toFixed(1)} cm — trigger activated`,
    `[CAMERA] Frame captured: 224×224px, RGB normalised`,
    `[INFER]  Inference time: ${bin.last_classification.inference_ms} ms`,
    `[RESULT] Class: ${bin.last_classification.class} | Confidence: ${bin.last_classification.confidence}%`,
    `[SERVO]  Rotating to ${bin.last_classification.class === "WET_WASTE" ? "90" : "0"}° — actuation complete`,
    `[RESET]  Cooldown 5s — awaiting next item...`,
    status === "CRITICAL" ? `[ALERT]  Fill level critical! Collection required.` : `[OK]     Fill levels nominal.`,
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className={`h-1.5 bg-${getStatusColor(status)}`} />
        <div className="p-6 space-y-5">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold font-display text-foreground">{bin.bin_id}</h2>
              <p className="text-sm text-muted-foreground">{bin.location_name} · {bin.zone} · {bin.city}</p>
              <p className="text-xs font-mono text-muted-foreground/60 mt-1">{bin.gps.lat.toFixed(6)}°N, {bin.gps.lng.toFixed(6)}°E</p>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl">✕</button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Wet Fill", value: `${bin.fill.wet_pct}%`, color: "text-sb-wet" },
              { label: "Dry Fill", value: `${bin.fill.dry_pct}%`, color: "text-sb-dry" },
              { label: "AI Accuracy", value: `${bin.last_classification.confidence}%`, color: "text-sb-green" },
              { label: "Events Today", value: `${bin.total_events_today}`, color: "text-foreground" },
              { label: "Battery", value: `${bin.battery_pct}%`, color: bin.battery_pct > 30 ? "text-sb-green" : "text-sb-danger" },
              { label: "Status", value: bin.status, color: bin.status === "ONLINE" ? "text-sb-green" : "text-sb-danger" },
            ].map(s => (
              <div key={s.label} className="bg-muted rounded-lg p-3 text-center">
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
                <p className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Inference Log */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-2">Live Inference Log</h3>
            <div className="bg-background rounded-lg p-3 font-mono text-xs space-y-0.5 max-h-48 overflow-y-auto border border-border">
              {logs.map((line, i) => (
                <p key={i} className={line.startsWith("[ALERT]") ? "text-sb-danger" : line.startsWith("[RESULT]") ? "text-sb-green" : "text-sb-green/70"}>
                  {line}
                </p>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button className="flex-1 py-2.5 rounded-lg bg-sb-amber/20 text-sb-amber font-semibold text-sm hover:bg-sb-amber/30 transition">🚛 Request Collection</button>
            <a href={`https://maps.google.com/?q=${bin.gps.lat},${bin.gps.lng}`} target="_blank" rel="noreferrer"
              className="flex-1 py-2.5 rounded-lg bg-sb-blue/20 text-sb-blue font-semibold text-sm text-center hover:bg-sb-blue/30 transition">🗺️ View on Maps</a>
            <button onClick={onClose} className="flex-1 py-2.5 rounded-lg bg-muted text-muted-foreground font-semibold text-sm hover:text-foreground transition">Close</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
