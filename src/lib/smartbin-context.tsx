import React, { createContext, useContext, useState, useCallback } from "react";
import { BinData, TruckData, generateDemoBins, generateDemoTrucks } from "./smartbin-data";

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
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setAppState] = useState<AppState>({
    isLoggedIn: false, mode: null, userName: "", employeeId: "",
    state: "Maharashtra", city: "Mumbai", bins: [], trucks: [],
    manualEntries: [], classificationEvents: [],
  });

  const login = useCallback((name: string, empId: string, st: string, city: string) => {
    setAppState(s => ({ ...s, isLoggedIn: true, userName: name, employeeId: empId, state: st, city }));
  }, []);

  const logout = useCallback(() => {
    setAppState(s => ({ ...s, isLoggedIn: false, mode: null, userName: "", employeeId: "", bins: [], trucks: [], classificationEvents: [] }));
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

  return (
    <AppContext.Provider value={{
      ...state, login, logout, setMode, setCity, setState: setSt,
      addManualEntry, deleteManualEntry, dispatchTruck, addClassificationEvent,
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
