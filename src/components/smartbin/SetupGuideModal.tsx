export default function SetupGuideModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold font-display text-foreground">📖 Setup Guide</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl">✕</button>
          </div>

          <div className="space-y-4 text-sm text-muted-foreground">
            <Section title="1. Firebase Setup">
              Create a Firebase project at console.firebase.google.com → Enable Realtime Database → Copy your project URL
              (format: <code className="font-mono text-foreground text-xs bg-muted px-1 rounded">https://YOUR-PROJECT.firebaseio.com</code>)
            </Section>

            <Section title="2. Raspberry Pi Firmware">
              <pre className="bg-background border border-border rounded-lg p-3 text-[11px] font-mono text-sb-green/80 overflow-x-auto">{`import requests, json, time
from datetime import datetime

FIREBASE_URL = "https://YOUR-PROJECT.firebaseio.com"
API_KEY = "YOUR_API_KEY"
BIN_ID = "SB-MUM-001"

def push_to_firebase(wet_pct, dry_pct, lat, lng, confidence, waste_class):
    data = {
        "bin_id": BIN_ID,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "gps": {"lat": lat, "lng": lng, "accuracy_m": 3.0},
        "fill": {"wet_pct": wet_pct, "dry_pct": dry_pct},
        "status": "ONLINE",
        "battery_pct": 95,
        "last_classification": {
            "class": waste_class,
            "confidence": confidence,
            "inference_ms": 423
        },
        "total_events_today": 0
    }
    url = f"{FIREBASE_URL}/bins/{BIN_ID}.json?auth={API_KEY}"
    requests.put(url, data=json.dumps(data))`}</pre>
            </Section>

            <Section title="3. GPS Module">
              Connect NEO-6M GPS to Raspberry Pi UART pins (TX→RX on GPIO 15). Enable UART in raspi-config. The firmware reads NMEA sentences and extracts lat/lng automatically.
            </Section>

            <Section title="4. Dashboard Connection">
              Use "Live Device Mode" on the mode selection screen. Enter your Firebase URL, database path, and API key. The dashboard will poll every 5–30 seconds for live data.
            </Section>

            <Section title="5. Hardware Components">
              <ul className="list-disc pl-4 space-y-1">
                <li>Raspberry Pi 4 Model B</li>
                <li>Pi Camera Module v2 (Sony IMX219, 8 MP)</li>
                <li>HC-SR04 Ultrasonic Sensor</li>
                <li>NEO-6M GPS Module (UART)</li>
                <li>SG90 Servo Motor</li>
                <li>Two bin chambers: Wet & Dry</li>
              </ul>
            </Section>
          </div>

          <button onClick={onClose} className="w-full py-2.5 rounded-lg bg-muted text-foreground font-semibold text-sm hover:bg-muted/80 transition">Close Guide</button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-bold text-foreground mb-1">{title}</h3>
      <div className="text-muted-foreground">{children}</div>
    </div>
  );
}
