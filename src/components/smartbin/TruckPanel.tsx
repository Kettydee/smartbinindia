import { useApp } from "@/lib/smartbin-context";

export default function TruckPanel() {
  const { trucks, bins, dispatchTruck } = useApp();

  return (
    <div>
      <h3 className="text-lg font-bold font-display text-foreground mb-4">🚛 Fleet Management</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {trucks.map(truck => (
          <div key={truck.truck_id} className="bg-card border border-border rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-mono text-sm font-bold text-foreground">{truck.truck_id}</span>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                truck.status === "IDLE" ? "bg-sb-green/20 text-sb-green"
                : truck.status === "EN_ROUTE" ? "bg-sb-amber/20 text-sb-amber"
                : truck.status === "COLLECTING" ? "bg-sb-blue/20 text-sb-blue"
                : "bg-muted text-muted-foreground"
              }`}>{truck.status.replace("_", " ")}</span>
            </div>
            <p className="text-xs text-muted-foreground">🧑 {truck.driver}</p>
            <p className="text-xs text-muted-foreground">{truck.model} · {truck.plate}</p>
            {truck.assigned_bin && <p className="text-xs text-sb-amber">→ {truck.assigned_bin} · ETA {truck.eta_min}min</p>}
            {truck.status === "IDLE" && bins.length > 0 && (
              <button onClick={() => dispatchTruck(truck.truck_id, bins[0].bin_id)}
                className="w-full py-1.5 text-xs rounded-lg bg-sb-green/20 text-sb-green font-semibold hover:bg-sb-green/30 transition">
                Assign
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
