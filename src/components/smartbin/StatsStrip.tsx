import { BinData } from "@/lib/smartbin-data";

export default function StatsStrip({ bins, criticalCount }: { bins: BinData[]; criticalCount: number }) {
  const stats = [
    { label: "Total Bins Active", value: bins.length, icon: "🗑️" },
    { label: "Online", value: bins.filter(b => b.status === "ONLINE").length, icon: "📡" },
    { label: "Need Collection", value: criticalCount, icon: "⚠️" },
    { label: "AI Accuracy", value: bins.length ? `${(bins.reduce((s, b) => s + b.last_classification.confidence, 0) / bins.length).toFixed(1)}%` : "—", icon: "🤖" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(s => (
        <div key={s.label} className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{s.icon}</span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</span>
          </div>
          <p className="text-2xl font-bold font-mono text-foreground">{s.value}</p>
        </div>
      ))}
    </div>
  );
}
