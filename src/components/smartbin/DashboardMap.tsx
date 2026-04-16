import { useEffect, useRef } from "react";
import { BinData, getBinStatus, getCityCoords } from "@/lib/smartbin-data";
import type { AppMode } from "@/lib/smartbin-context";

export default function DashboardMap({ bins, mode, city }: { bins: BinData[]; mode: AppMode; city: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (mode !== "live" && mode !== "manual") return;
    if (!mapRef.current) return;

    // Dynamically load Leaflet
    const loadLeaflet = async () => {
      const L = await import("leaflet");
      if (mapInstance.current) {
        mapInstance.current.remove();
      }
      const [lat, lng] = getCityCoords(city);
      const map = L.map(mapRef.current!, { zoomControl: true }).setView([lat, lng], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap',
      }).addTo(map);

      bins.forEach(bin => {
        const status = getBinStatus(bin);
        const color = status === "CRITICAL" ? "#ef4444" : status === "NEAR_FULL" ? "#f59e0b" : "#00e5a0";
        L.circleMarker([bin.gps.lat, bin.gps.lng], {
          radius: 8, fillColor: color, color: color, fillOpacity: 0.8, weight: 2,
        }).addTo(map).bindPopup(`
          <div style="font-family:monospace;font-size:12px;">
            <b>${bin.bin_id}</b><br/>
            ${bin.location_name}<br/>
            Wet: ${bin.fill.wet_pct}% | Dry: ${bin.fill.dry_pct}%<br/>
            Last: ${new Date(bin.timestamp).toLocaleTimeString()}
          </div>
        `);
        // Accuracy circle
        L.circle([bin.gps.lat, bin.gps.lng], {
          radius: bin.gps.accuracy_m, fillColor: color, color: color, fillOpacity: 0.1, weight: 1,
        }).addTo(map);
      });

      if (bins.length > 0) {
        const bounds = L.latLngBounds(bins.map(b => [b.gps.lat, b.gps.lng] as [number, number]));
        map.fitBounds(bounds, { padding: [30, 30] });
      }
      mapInstance.current = map;
    };
    loadLeaflet();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [bins, mode, city]);

  // Demo mode: CSS dot map
  if (mode === "demo") {
    return (
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-bold text-foreground mb-4">📍 Bin Distribution — {city}</h3>
        <div className="relative h-64 bg-background rounded-lg overflow-hidden border border-border">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: "radial-gradient(circle at 30% 40%, hsl(160 100% 45% / 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 60%, hsl(199 89% 48% / 0.1) 0%, transparent 50%)",
          }} />
          {bins.map((bin, i) => {
            const status = getBinStatus(bin);
            const color = status === "CRITICAL" ? "bg-sb-danger" : status === "NEAR_FULL" ? "bg-sb-amber" : "bg-sb-green";
            return (
              <div key={bin.bin_id} className="absolute group" style={{
                left: `${10 + (i * 7) % 80}%`, top: `${15 + ((i * 13) % 70)}%`,
              }}>
                <div className={`w-3 h-3 rounded-full ${color} pulse-dot cursor-pointer`} />
                <div className="hidden group-hover:block absolute bottom-5 left-1/2 -translate-x-1/2 bg-card border border-border rounded px-2 py-1 text-[10px] font-mono text-foreground whitespace-nowrap z-10">
                  {bin.bin_id} · W:{bin.fill.wet_pct}% D:{bin.fill.dry_pct}%
                </div>
              </div>
            );
          })}
          <p className="absolute bottom-2 right-3 text-[9px] text-muted-foreground/40">Live GPS map available in Live Device Mode</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="text-sm font-bold text-foreground mb-4">
        {mode === "live" ? "📡 Live GPS Map" : "📍 Manual Entry Map"} — {city}
      </h3>
      <div ref={mapRef} className="h-80 rounded-lg overflow-hidden" />
    </div>
  );
}
