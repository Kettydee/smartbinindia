import { motion } from "framer-motion";
import { BinData, getBinStatus, getStatusColor } from "@/lib/smartbin-data";

export default function BinCard({ bin, onClick }: { bin: BinData; onClick: () => void }) {
  const status = getBinStatus(bin);
  const statusColor = getStatusColor(status);
  const timeDiff = Math.floor((Date.now() - new Date(bin.timestamp).getTime()) / 1000);
  const timeAgo = timeDiff < 60 ? `${timeDiff}s ago` : `${Math.floor(timeDiff / 60)}m ago`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="bg-card border border-border rounded-xl overflow-hidden cursor-pointer hover:border-primary/30 transition-all group"
    >
      <div className={`h-1 bg-${statusColor}`} />
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-foreground font-bold">{bin.bin_id}</span>
          <span className={`w-2 h-2 rounded-full ${bin.status === "ONLINE" ? "bg-sb-green pulse-dot" : bin.status === "OFFLINE" ? "bg-sb-danger" : "bg-sb-amber"}`} />
        </div>
        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-${statusColor}/20 text-${statusColor}`}>
          {status === "CRITICAL" ? "CRITICAL" : status === "NEAR_FULL" ? "NEAR FULL" : "NORMAL"}
        </span>
        <p className="text-xs text-muted-foreground">{bin.location_name} · {bin.zone}</p>
        <p className="text-[10px] font-mono text-muted-foreground/60">{bin.gps.lat.toFixed(4)}°N, {bin.gps.lng.toFixed(4)}°E</p>

        {/* Fill bars */}
        <div className="space-y-2">
          <FillBar label="💧 Wet" pct={bin.fill.wet_pct} color="bg-sb-wet" />
          <FillBar label="📦 Dry" pct={bin.fill.dry_pct} color="bg-sb-dry" />
        </div>

        {/* Battery */}
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>🔋 {bin.battery_pct}%</span>
          <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${bin.battery_pct > 30 ? "bg-sb-green" : "bg-sb-danger"}`} style={{ width: `${bin.battery_pct}%` }} />
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Last: {timeAgo}</span>
          <span>{bin.total_events_today} events</span>
        </div>
      </div>
    </motion.div>
  );
}

function FillBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-[10px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-foreground">{pct}%</span>
      </div>
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
          className={`h-full rounded-full ${color}`} />
      </div>
    </div>
  );
}
