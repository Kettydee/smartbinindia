import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getDatabase, ref, onValue, off, set, Database } from "firebase/database";
import { BinData } from "./smartbin-data";

export interface FirebaseConfig {
  databaseURL: string;
  apiKey?: string;
  projectId?: string;
  dbPath?: string;
}

const STORAGE_KEY = "smartbin_firebase_config";

export function loadSavedFirebaseConfig(): FirebaseConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // Ignore storage read error
  }
  const envUrl = import.meta.env.VITE_FIREBASE_DATABASE_URL;
  if (envUrl) {
    return {
      databaseURL: envUrl,
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
      dbPath: import.meta.env.VITE_FIREBASE_DB_PATH || "/bins",
    };
  }
  return null;
}

export function saveFirebaseConfig(config: FirebaseConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error("Failed to save Firebase config", e);
  }
}

let app: FirebaseApp | null = null;
let db: Database | null = null;

export function initFirebase(config: FirebaseConfig): Database | null {
  if (!config.databaseURL) return null;
  try {
    const formattedUrl = config.databaseURL.replace(/\/+$/, "");
    if (!getApps().length) {
      app = initializeApp({
        apiKey: config.apiKey || "AIzaSyDummyKeyForSmartBinClient",
        databaseURL: formattedUrl,
        projectId: config.projectId || "smartbin-india",
      });
    } else {
      app = getApp();
    }
    db = getDatabase(app);
    return db;
  } catch (err) {
    console.error("Firebase init failed:", err);
    return null;
  }
}

export function subscribeToBins(
  config: FirebaseConfig,
  onUpdate: (bins: BinData[]) => void,
  onError?: (err: any) => void
): () => void {
  const database = initFirebase(config);
  const path = (config.dbPath || "/bins").replace(/^\/+|\/+$/g, "");

  if (database) {
    const binsRef = ref(database, path);
    const unsubscribe = onValue(
      binsRef,
      (snapshot) => {
        const val = snapshot.val();
        if (!val) {
          onUpdate([]);
          return;
        }
        const parsed = parseFirebaseBins(val);
        onUpdate(parsed);
      },
      (error) => {
        console.warn("Firebase onValue error, falling back to REST poll:", error);
        if (onError) onError(error);
      }
    );

    return () => off(binsRef);
  }

  let active = true;
  const poll = async () => {
    try {
      const url = `${config.databaseURL.replace(/\/+$/, "")}/${path}.json${
        config.apiKey ? `?auth=${config.apiKey}` : ""
      }`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (active && data) {
        onUpdate(parseFirebaseBins(data));
      }
    } catch (e) {
      if (active && onError) onError(e);
    }
  };

  poll();
  const interval = setInterval(poll, 5000);
  return () => {
    active = false;
    clearInterval(interval);
  };
}

export async function saveBinToFirebase(config: FirebaseConfig, bin: BinData): Promise<boolean> {
  const database = initFirebase(config);
  const basePath = (config.dbPath || "/bins").replace(/^\/+|\/+$/g, "");
  const binPath = `${basePath}/${bin.bin_id}`;

  if (database) {
    try {
      const binRef = ref(database, binPath);
      await set(binRef, bin);
      return true;
    } catch (e) {
      console.warn("Direct Firebase set failed, trying REST:", e);
    }
  }

  try {
    const url = `${config.databaseURL.replace(/\/+$/, "")}/${binPath}.json${
      config.apiKey ? `?auth=${config.apiKey}` : ""
    }`;
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bin),
    });
    return res.ok;
  } catch (err) {
    console.error("Failed to save bin to Firebase:", err);
    return false;
  }
}

function parseFirebaseBins(data: any): BinData[] {
  if (Array.isArray(data)) {
    return data.filter(Boolean);
  }
  if (typeof data === "object" && data !== null) {
    if (data.bin_id && data.fill) {
      return [data as BinData];
    }
    return Object.keys(data).map((key) => {
      const item = data[key];
      return {
        bin_id: item.bin_id || key,
        timestamp: item.timestamp || new Date().toISOString(),
        gps: item.gps || { lat: 19.076, lng: 72.8777, accuracy_m: 3 },
        fill: item.fill || { wet_pct: 0, dry_pct: 0 },
        status: item.status || "ONLINE",
        battery_pct: item.battery_pct ?? 100,
        last_classification: item.last_classification || {
          class: "WET_WASTE",
          confidence: 90,
          inference_ms: 400,
        },
        total_events_today: item.total_events_today ?? 0,
        location_name: item.location_name || `Bin ${key}`,
        zone: item.zone || "Zone A",
        city: item.city || "Mumbai",
        state: item.state || "Maharashtra",
      };
    });
  }
  return [];
}
