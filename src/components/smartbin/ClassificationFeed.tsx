export default function ClassificationFeed({ events }: { events: { id: string; bin_id: string; class: string; confidence: number; time: string; zone: string }[] }) {
  const recent = events.slice(0, 6);
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="text-sm font-bold text-foreground mb-4">Live Classification Events</h3>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {recent.length === 0 && <p className="text-xs text-muted-foreground">Waiting for events…</p>}
        {recent.map(e => (
          <div key={e.id} className="flex items-center gap-3 text-xs">
            <span className="text-base">{e.class === "WET_WASTE" ? "💧" : "📦"}</span>
            <span className="font-mono text-foreground">{e.bin_id}</span>
            <span className="text-muted-foreground flex-1">{e.zone}</span>
            <span className={`font-semibold ${e.class === "WET_WASTE" ? "text-sb-wet" : "text-sb-dry"}`}>{e.confidence}%</span>
            <span className="text-muted-foreground/60">{e.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
