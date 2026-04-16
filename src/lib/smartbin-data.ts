// Geographic data & bin generation utilities

export const STATES_CITIES: Record<string, string[]> = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati", "Kakinada"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat"],
  "Bihar": ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
  "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Mandi"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro"],
  "Karnataka": ["Bengaluru", "Mysuru", "Hubli", "Mangaluru"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane"],
  "Manipur": ["Imphal", "Thoubal", "Bishnupur"],
  "Meghalaya": ["Shillong", "Tura", "Jowai"],
  "Mizoram": ["Aizawl", "Lunglei", "Champhai"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Puri"],
  "Punjab": ["Chandigarh", "Ludhiana", "Amritsar", "Jalandhar"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer"],
  "Sikkim": ["Gangtok", "Namchi", "Pelling"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar"],
  "Tripura": ["Agartala", "Udaipur", "Dharmanagar"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Noida"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Rishikesh", "Nainital"],
  "West Bengal": ["Kolkata", "Howrah", "Siliguri", "Durgapur", "Asansol"],
};

// Approximate city centres for map
const CITY_COORDS: Record<string, [number, number]> = {
  Mumbai: [19.076, 72.8777], Pune: [18.5204, 73.8567], Nagpur: [21.1458, 79.0882],
  Delhi: [28.6139, 77.209], Bengaluru: [12.9716, 77.5946], Chennai: [13.0827, 80.2707],
  Hyderabad: [17.385, 78.4867], Kolkata: [22.5726, 88.3639], Ahmedabad: [23.0225, 72.5714],
  Jaipur: [26.9124, 75.7873], Lucknow: [26.8467, 80.9462], Bhopal: [23.2599, 77.4126],
  Patna: [25.6093, 85.1376], Guwahati: [26.1445, 91.7362], Kochi: [9.9312, 76.2673],
  Thiruvananthapuram: [8.5241, 76.9366], Chandigarh: [30.7333, 76.7794],
  Dehradun: [30.3165, 78.0322], Ranchi: [23.3441, 85.3096], Bhubaneswar: [20.2961, 85.8245],
  Visakhapatnam: [17.6868, 83.2185], Raipur: [21.2514, 81.6296], Gangtok: [27.3389, 88.6065],
  Shimla: [31.1048, 77.1734], Panaji: [15.4909, 73.8278], Imphal: [24.817, 93.9368],
  Shillong: [25.5788, 91.8933], Aizawl: [23.7271, 92.7176], Kohima: [25.6751, 94.1086],
  Agartala: [23.8315, 91.2868], Itanagar: [27.0844, 93.6053],
};

export interface BinData {
  bin_id: string;
  timestamp: string;
  gps: { lat: number; lng: number; accuracy_m: number };
  fill: { wet_pct: number; dry_pct: number };
  status: "ONLINE" | "OFFLINE" | "MAINTENANCE";
  battery_pct: number;
  last_classification: { class: "WET_WASTE" | "DRY_WASTE"; confidence: number; inference_ms: number };
  total_events_today: number;
  location_name: string;
  zone: string;
  city: string;
  state: string;
}

export interface TruckData {
  truck_id: string;
  status: "IDLE" | "EN_ROUTE" | "COLLECTING" | "DONE";
  driver: string;
  model: string;
  plate: string;
  assigned_bin?: string;
  eta_min?: number;
}

const LOCATIONS = [
  "Central Market", "Railway Station", "City Park", "Bus Stand", "Hospital Complex",
  "School Campus", "Govt Office", "Residential Colony", "Shopping Mall", "Temple Area",
  "University Gate", "Industrial Zone", "Lake Garden", "Sports Complex", "Metro Station",
];
const ZONES = ["Zone A", "Zone B", "Zone C", "Zone D", "Zone E"];
const DRIVERS = ["Rajesh Kumar", "Sunil Sharma", "Amit Patel", "Vikram Singh", "Ravi Verma", "Pradeep Yadav"];
const TRUCKS = ["Tata Ace", "Mahindra Bolero Pickup", "Ashok Leyland Dost", "Eicher Pro"];
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export function getCityCoords(city: string): [number, number] {
  return CITY_COORDS[city] || [20.5937, 78.9629];
}

export function generateDemoBins(city: string, state: string, count = 12): BinData[] {
  const [baseLat, baseLng] = getCityCoords(city);
  const prefix = city.substring(0, 3).toUpperCase();
  return Array.from({ length: count }, (_, i) => {
    const wet = rand(10, 95);
    const dry = rand(10, 95);
    return {
      bin_id: `SB-${prefix}-${String(i + 1).padStart(3, "0")}`,
      timestamp: new Date(Date.now() - rand(0, 300) * 1000).toISOString(),
      gps: { lat: baseLat + (Math.random() - 0.5) * 0.05, lng: baseLng + (Math.random() - 0.5) * 0.05, accuracy_m: +(Math.random() * 5 + 1).toFixed(1) },
      fill: { wet_pct: wet, dry_pct: dry },
      status: Math.random() > 0.1 ? "ONLINE" : Math.random() > 0.5 ? "OFFLINE" : "MAINTENANCE",
      battery_pct: rand(20, 100),
      last_classification: { class: Math.random() > 0.5 ? "WET_WASTE" : "DRY_WASTE", confidence: +(Math.random() * 15 + 80).toFixed(1), inference_ms: rand(350, 550) },
      total_events_today: rand(5, 80),
      location_name: LOCATIONS[i % LOCATIONS.length],
      zone: ZONES[rand(0, ZONES.length - 1)],
      city,
      state,
    };
  });
}

export function generateDemoTrucks(city: string, count = 6): TruckData[] {
  const prefix = city.substring(0, 3).toUpperCase();
  return Array.from({ length: count }, (_, i) => ({
    truck_id: `TRK-${prefix}-${String(i + 1).padStart(2, "0")}`,
    status: (["IDLE", "IDLE", "IDLE", "EN_ROUTE", "COLLECTING", "DONE"] as const)[i % 6],
    driver: DRIVERS[i % DRIVERS.length],
    model: TRUCKS[rand(0, TRUCKS.length - 1)],
    plate: `${prefix.substring(0, 2)} ${rand(10, 99)} ${String.fromCharCode(65 + rand(0, 25))}${String.fromCharCode(65 + rand(0, 25))} ${rand(1000, 9999)}`,
  }));
}

export function getBinStatus(bin: BinData): "NORMAL" | "NEAR_FULL" | "CRITICAL" {
  const maxFill = Math.max(bin.fill.wet_pct, bin.fill.dry_pct);
  if (maxFill >= 85) return "CRITICAL";
  if (maxFill >= 65) return "NEAR_FULL";
  return "NORMAL";
}

export function getStatusColor(status: "NORMAL" | "NEAR_FULL" | "CRITICAL") {
  if (status === "CRITICAL") return "sb-danger";
  if (status === "NEAR_FULL") return "sb-amber";
  return "sb-green";
}
