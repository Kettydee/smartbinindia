import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { BinData, TruckData, generateDemoBins, generateDemoTrucks } from "./smartbin-data";
import {
  FirebaseConfig,
  loadSavedFirebaseConfig,
  saveFirebaseConfig,
  subscribeToBins,
  saveBinToFirebase,
} from "./firebase";

export type AppMode = "live" | "manual" | "demo";

interface AppState {
  isLoggedIn: boolean;
  mode: AppMode | null;
  userName: string;
  employeeId: string;
  state: string;
  city: string;
  bins: BinData[];
  trucks: TruckData[];
  manualEntries: BinData[];
  classificationEvents: { id: string; bin_id: string; class: string; confidence: number; time: string; zone: string }[];
  firebaseConfig: FirebaseConfig | null;
}

interface AppContextType extends AppState {
  login: (name: string, empId: string, state: string, city: string) => void;
  logout: () => void;
  setMode: (mode: AppMode) => void;
  setCity: (city: string) => void;
  setState: (state: string) => void;
  addManualEntry: (entry: BinData) => void;
  deleteManualEntry: (binId: string) => void;
  dispatchTruck: (truckId: string, binId: string) => void;
  addClassificationEvent: (evt: AppState["classificationEvents"][0]) => void;
  setFirebaseConfig: (cfg: FirebaseConfig) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setAppState] = useState<AppState>(() => {
    let savedManual: BinData[] = [];
    try {
      const raw = localStorage.getItem("smartbin_manual_entries");
      if (raw) savedManual = JSON.parse(raw);
    } catch {
      // Ignore read errors
    }
    const savedFb = loadSavedFirebaseConfig();
    return {
      isLoggedIn: false,
      mode: null,
      userName: "",
      employeeId: "",
      state: "Maharashtra",
      city: "Mumbai",
      bins: [],
      trucks: [],
      manualEntries: savedManual,
      classificationEvents: [],
      firebaseConfig: savedFb,
    };
  });

  const login = useCallback((name: string, empId: string, st: string, city: string) => {
    setAppState(s => ({ ...s, isLoggedIn: true, userName: name, employeeId: empId, state: st, city }));
  }, []);

  const logout = useCallback(() => {
    setAppState(s => ({ ...s, isLoggedIn: false, mode: null, userName: "", employeeId: "", bins: [], trucks: [], classificationEvents: [] }));
  }, []);

  const setFirebaseConfig = useCallback((cfg: FirebaseConfig) => {
    saveFirebaseConfig(cfg);
    setAppState(s => ({ ...s, firebaseConfig: cfg }));
  }, []);

  const setMode = useCallback((mode: AppMode) => {
    setAppState(s => {
      const bins = mode === "demo" ? generateDemoBins(s.city, s.state) : mode === "manual" ? [...s.manualEntries] : [];
      const trucks = generateDemoTrucks(s.city);
      return { ...s, mode, bins, trucks, classificationEvents: [] };
    });
  }, []);

  const setCity = useCallback((city: string) => {
    setAppState(s => {
      const bins = s.mode === "demo" ? generateDemoBins(city, s.state) : s.mode === "manual" ? s.manualEntries.filter(b => b.city === city) : [];
      const trucks = generateDemoTrucks(city);
      return { ...s, city, bins, trucks };
    });
  }, []);

  const setSt = useCallback((st: string) => {
    setAppState(s => ({ ...s, state: st }));
  }, []);

  const addManualEntry = useCallback((entry: BinData) => {
    setAppState(s => {
      const entries = [...s.manualEntries, entry];
      localStorage.setItem("smartbin_manual_entries", JSON.stringify(entries));
      if (s.mode === "live" && s.firebaseConfig) {
        saveBinToFirebase(s.firebaseConfig, entry);
      }
      const bins = s.mode === "manual" ? entries.filter(b => b.city === s.city) : s.bins;
      return { ...s, manualEntries: entries, bins };
    });
  }, []);

  const deleteManualEntry = useCallback((binId: string) => {
    setAppState(s => {
      const entries = s.manualEntries.filter(b => b.bin_id !== binId);
      localStorage.setItem("smartbin_manual_entries", JSON.stringify(entries));
      const bins = s.mode === "manual" ? entries.filter(b => b.city === s.city) : s.bins;
      return { ...s, manualEntries: entries, bins };
    });
  }, []);

  const dispatchTruck = useCallback((truckId: string, binId: string) => {
    setAppState(s => ({
      ...s,
      trucks: s.trucks.map(t => t.truck_id === truckId ? { ...t, status: "EN_ROUTE" as const, assigned_bin: binId, eta_min: Math.floor(Math.random() * 17) + 8 } : t),
    }));
  }, []);

  const addClassificationEvent = useCallback((evt: AppState["classificationEvents"][0]) => {
    setAppState(s => ({ ...s, classificationEvents: [evt, ...s.classificationEvents].slice(0, 50) }));
  }, []);

  useEffect(() => {
    if (state.mode !== "live" || !state.firebaseConfig?.databaseURL) return;

    const unsubscribe = subscribeToBins(
      state.firebaseConfig,
      (liveBins) => {
        setAppState(s => {
          if (s.mode !== "live") return s;
          if (!liveBins || liveBins.length === 0) return s;
          const filtered = s.city ? liveBins.filter(b => !b.city || b.city === s.city) : liveBins;
          return {
            ...s,
            bins: filtered.length > 0 ? filtered : liveBins,
          };
        });
      },
      (err) => {
        console.warn("Firebase live update error:", err);
      }
    );

    return () => unsubscribe();
  }, [state.mode, state.firebaseConfig, state.city]);

  return (
    <AppContext.Provider value={{
      ...state, login, logout, setMode, setCity, setState: setSt,
      addManualEntry, deleteManualEntry, dispatchTruck, addClassificationEvent,
      setFirebaseConfig,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
