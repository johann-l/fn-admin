"use client";

import * as React from "react";
import {
  vehicles as initialVehicles,
  drivers as initialDrivers,
  passes as initialPasses,
  documents as initialDocuments,
  routes as initialRoutes,
  alerts as initialAlerts,
  Vehicle,
  Driver,
  BusPass,
  Document,
  Expense,
  Payment,
  Route,
  Alert,
  generateHistoricalExpenses,
  generateHistoricalPayments,
} from "@/lib/data";
import {
  fetchTransactions,
  subscribeToTransactions,
} from "@/lib/supabaseService";

// ⭐ Import Announcement type

import type { Announcement } from "@/lib/data";

type VehicleFormData = Omit<
  Vehicle,
  "id" | "availability" | "location" | "currentStopIndex"
>;
type PassFormData = Omit<BusPass, "id" | "status" | "bloodGroup">;
type DriverFormData = Omit<Driver, "id" | "avatarUrl">;
type ExpenseFormData = Omit<Expense, "id">;
type RouteFormData = Omit<Route, "id">;

type AppDataContextType = {
  vehicles: Vehicle[];
  drivers: Driver[];
  passes: BusPass[];
  documents: Document[];
  expenses: Expense[];
  payments: Payment[];
  routes: Route[];
  alerts: Alert[];

  // ⭐ Added announcements state to context type

  announcements: Announcement[];

  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;

  addVehicle: (vehicle: VehicleFormData) => void;
  updateVehicle: (vehicle: Vehicle) => void;
  removeVehicle: (vehicleId: string) => void;
  addDriver: (driver: DriverFormData) => void;
  updateDriver: (driver: Driver) => void;
  removeDriver: (driverId: string) => void;
  addPass: (pass: PassFormData) => void;
  updatePass: (pass: BusPass) => void;
  removePass: (passId: string) => void;
  removeDocument: (documentId: string) => void;
  addExpense: (expense: ExpenseFormData) => void;
  updateExpense: (expenseId: string, updates: Partial<Expense>) => void;
  addRoute: (route: RouteFormData) => void;
  updateRoute: (route: Route) => void;
  removeRoute: (routeId: string) => void;
};

const AppDataContext = React.createContext<AppDataContextType | undefined>(
  undefined
);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [vehicles, setVehicles] = React.useState<Vehicle[]>(initialVehicles);
  const [drivers, setDrivers] = React.useState<Driver[]>(initialDrivers);
  const [passes, setPasses] = React.useState<BusPass[]>(initialPasses);
  const [documents, setDocuments] =
    React.useState<Document[]>(initialDocuments);
  const [expenses, setExpenses] = React.useState<Expense[] | null>(null);
  // Seed with generated historical payments so charts have data before Supabase loads
  const [payments, setPayments] = React.useState<Payment[] | null>(
    generateHistoricalPayments()
  );
  const [routes, setRoutes] = React.useState<Route[]>(initialRoutes);
  const [alerts, setAlerts] = React.useState<Alert[]>(initialAlerts);
  // ⭐ Added state for announcements

  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);

  React.useEffect(() => {
    // Generate expenses data on the client-side
    setExpenses(generateHistoricalExpenses());

    // Fetch real transactions from Supabase
    async function loadTransactions() {
      const transactions = await fetchTransactions();
      console.log("Loaded transactions from Supabase:", transactions.length);
      setPayments(transactions);
    }

    loadTransactions();

    // Subscribe to realtime transaction updates
    const unsubscribe = subscribeToTransactions((updatedPayment) => {
      console.log("Transaction updated:", updatedPayment);
      setPayments((prev) => {
        if (!prev) return [updatedPayment];
        const index = prev.findIndex((p) => p.id === updatedPayment.id);
        if (index >= 0) {
          // Update existing
          const newPayments = [...prev];
          newPayments[index] = updatedPayment;
          return newPayments;
        } else {
          // Add new
          return [updatedPayment, ...prev];
        }
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const addVehicle = (vehicle: VehicleFormData) => {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: `v${Date.now()}`,
      availability: { total: 40, occupied: 0 },
      location: { lat: 34.0522, lng: -118.2437 }, // Default to LA
      currentStopIndex: -1,
    };
    setVehicles((prev) => [...prev, newVehicle]);
  };

  const updateVehicle = (updatedVehicle: Vehicle) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === updatedVehicle.id ? updatedVehicle : v))
    );
  };

  const removeVehicle = (vehicleId: string) => {
    setDrivers((prev) =>
      prev.map((d) =>
        d.assignedVehicleId === vehicleId
          ? { ...d, assignedVehicleId: null }
          : d
      )
    );
    setPasses((prev) => prev.filter((p) => p.vehicleId !== vehicleId));
    setDocuments((prev) => prev.filter((doc) => doc.vehicleId !== vehicleId));
    setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
  };

  const addDriver = (driver: DriverFormData) => {
    const newDriver: Driver = {
      ...driver,
      id: `d${Date.now()}`,
      avatarUrl: "https://placehold.co/100x100.png",
    };
    setDrivers((prev) => [...prev, newDriver]);
  };

  const updateDriver = (updatedDriver: Driver) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === updatedDriver.id ? updatedDriver : d))
    );
  };

  const removeDriver = (driverId: string) => {
    setVehicles((prev) =>
      prev.map((v) => (v.driverId === driverId ? { ...v, driverId: null } : v))
    );
    setDrivers((prev) => prev.filter((d) => d.id !== driverId));
  };

  const addPass = (pass: PassFormData) => {
    const newPass: BusPass = {
      ...pass,
      id: `p${Date.now()}`,
      status: "Active",
      bloodGroup: "N/A",
    };
    setPasses((prev) => [...prev, newPass]);
  };

  const updatePass = (updatedPass: BusPass) => {
    setPasses((prev) =>
      prev.map((p) => (p.id === updatedPass.id ? updatedPass : p))
    );
  };

  const removePass = (passId: string) => {
    setPasses((prev) => prev.filter((p) => p.id !== passId));
  };

  const removeDocument = (documentId: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
  };

  const addExpense = (expenseData: ExpenseFormData) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => (prev ? [newExpense, ...prev] : [newExpense]));
  };

  const updateExpense = (expenseId: string, updates: Partial<Expense>) => {
    setExpenses((prev) =>
      prev
        ? prev.map((expense) =>
            expense.id === expenseId ? { ...expense, ...updates } : expense
          )
        : null
    );
  };

  const addRoute = (route: RouteFormData) => {
    const newRoute: Route = {
      ...route,
      id: `r${Date.now()}`,
    };
    setRoutes((prev) => [...prev, newRoute]);
  };

  const updateRoute = (updatedRoute: Route) => {
    setRoutes((prev) =>
      prev.map((r) => (r.id === updatedRoute.id ? updatedRoute : r))
    );
  };

  const removeRoute = (routeId: string) => {
    setVehicles((prev) =>
      prev.map((v) => (v.routeId === routeId ? { ...v, routeId: null } : v))
    );
    setRoutes((prev) => prev.filter((r) => r.id !== routeId));
  };

  return (
    <AppDataContext.Provider
      value={{
        vehicles,
        drivers,
        passes,
        documents,
        expenses: expenses || [],
        payments: payments || [],
        routes,
        alerts,
        // ⭐ Added announcements + setter to provider value

        announcements,

        setAnnouncements,

        addVehicle,
        updateVehicle,
        removeVehicle,
        addDriver,
        updateDriver,
        removeDriver,
        addPass,
        updatePass,
        removePass,
        removeDocument,
        addExpense,
        updateExpense,
        addRoute,
        updateRoute,
        removeRoute,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = React.useContext(AppDataContext);
  if (context === undefined) {
    throw new Error("useAppData must be used within an AppDataProvider");
  }
  return context;
}
