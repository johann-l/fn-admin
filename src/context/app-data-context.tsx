

"use client"

import * as React from "react"
import { 
  vehicles as initialVehicles,
  drivers as initialDrivers,
  passes as initialPasses,
  documents as initialDocuments,
  Vehicle,
  Driver,
  BusPass,
  Document,
  Expense,
  Payment,
  generateHistoricalExpenses,
  generateHistoricalPayments
} from "@/lib/data"

type VehicleFormData = Omit<Vehicle, 'id' | 'route' | 'availability' | 'location'>;
type PassFormData = Omit<BusPass, 'id' | 'status' | 'bloodGroup' | 'route'>;
type DriverFormData = Omit<Driver, 'id' | 'avatarUrl'>;
type ExpenseFormData = Omit<Expense, 'id'>;

type AppDataContextType = {
  vehicles: Vehicle[]
  drivers: Driver[]
  passes: BusPass[]
  documents: Document[]
  expenses: Expense[]
  payments: Payment[]
  addVehicle: (vehicle: VehicleFormData) => void
  updateVehicle: (vehicle: Vehicle) => void
  removeVehicle: (vehicleId: string) => void
  addDriver: (driver: DriverFormData) => void
  updateDriver: (driver: Driver) => void
  removeDriver: (driverId: string) => void
  addPass: (pass: PassFormData) => void
  updatePass: (pass: BusPass) => void
  removePass: (passId: string) => void
  removeDocument: (documentId: string) => void
  addExpense: (expense: ExpenseFormData) => void
  updateExpense: (expenseId: string, updates: Partial<Expense>) => void
}

const AppDataContext = React.createContext<AppDataContextType | undefined>(undefined)

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [vehicles, setVehicles] = React.useState<Vehicle[]>(initialVehicles)
  const [drivers, setDrivers] = React.useState<Driver[]>(initialDrivers)
  const [passes, setPasses] = React.useState<BusPass[]>(initialPasses)
  const [documents, setDocuments] = React.useState<Document[]>(initialDocuments)
  const [expenses, setExpenses] = React.useState<Expense[] | null>(null)
  const [payments, setPayments] = React.useState<Payment[] | null>(null)

  React.useEffect(() => {
    // Generate data on the client-side to avoid hydration errors
    setExpenses(generateHistoricalExpenses());
    setPayments(generateHistoricalPayments());
  }, [])

  const addVehicle = (vehicle: VehicleFormData) => {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: `v${Date.now()}`,
      route: 'Unassigned',
      availability: { total: 40, occupied: 0 },
      location: { lat: 34.0522, lng: -118.2437 }, // Default to LA
    }
    setVehicles(prev => [...prev, newVehicle])
  }

  const updateVehicle = (updatedVehicle: Vehicle) => {
    setVehicles(prev => prev.map(v => v.id === updatedVehicle.id ? updatedVehicle : v))
  }

  const removeVehicle = (vehicleId: string) => {
    setDrivers(prev => prev.map(d => d.assignedVehicleId === vehicleId ? { ...d, assignedVehicleId: null } : d));
    setPasses(prev => prev.filter(p => p.vehicleId !== vehicleId));
    setDocuments(prev => prev.filter(doc => doc.vehicleId !== vehicleId));
    setVehicles(prev => prev.filter(v => v.id !== vehicleId));
  };

  const addDriver = (driver: DriverFormData) => {
    const newDriver: Driver = {
      ...driver,
      id: `d${Date.now()}`,
      avatarUrl: 'https://placehold.co/100x100.png',
    };
    setDrivers(prev => [...prev, newDriver]);
  };

  const updateDriver = (updatedDriver: Driver) => {
    setDrivers(prev => prev.map(d => d.id === updatedDriver.id ? updatedDriver : d))
  }

  const removeDriver = (driverId: string) => {
    setVehicles(prev => prev.map(v => v.driverId === driverId ? { ...v, driverId: null } : v));
    setDrivers(prev => prev.filter(d => d.id !== driverId));
  };
  
  const addPass = (pass: PassFormData) => {
    const newPass: BusPass = {
        ...pass,
        id: `p${Date.now()}`,
        status: 'Active',
        bloodGroup: 'N/A',
        route: vehicles.find(v => v.id === pass.vehicleId)?.route || 'N/A'
    }
    setPasses(prev => [...prev, newPass])
  }

  const updatePass = (updatedPass: BusPass) => {
    setPasses(prev => prev.map(p => p.id === updatedPass.id ? updatedPass : p))
  }

  const removePass = (passId: string) => {
    setPasses(prev => prev.filter(p => p.id !== passId));
  }

  const removeDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  const addExpense = (expenseData: ExpenseFormData) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
    };
    setExpenses(prev => (prev ? [newExpense, ...prev] : [newExpense]));
  };
  
  const updateExpense = (expenseId: string, updates: Partial<Expense>) => {
    setExpenses(prev =>
      prev ? prev.map(expense =>
        expense.id === expenseId ? { ...expense, ...updates } : expense
      ) : null
    );
  };

  return (
    <AppDataContext.Provider value={{ 
        vehicles, 
        drivers, 
        passes, 
        documents, 
        expenses: expenses || [],
        payments: payments || [],
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
        updateExpense
    }}>
      {children}
    </AppDataContext.Provider>
  )
}

export function useAppData() {
  const context = React.useContext(AppDataContext)
  if (context === undefined) {
    throw new Error("useAppData must be used within an AppDataProvider")
  }
  return context
}
