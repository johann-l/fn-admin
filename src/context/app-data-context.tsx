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
  Document
} from "@/lib/data"

type VehicleFormData = Omit<Vehicle, 'id' | 'route' | 'availability' | 'location'>;
type PassFormData = Omit<BusPass, 'id' | 'status' | 'bloodGroup' | 'route'>;
type DriverFormData = Omit<Driver, 'id' | 'avatarUrl'>;

type AppDataContextType = {
  vehicles: Vehicle[]
  drivers: Driver[]
  passes: BusPass[]
  documents: Document[]
  addVehicle: (vehicle: VehicleFormData) => void
  updateVehicle: (vehicle: Vehicle) => void
  removeVehicle: (vehicleId: string) => void
  addDriver: (driver: DriverFormData) => void
  updateDriver: (driver: Driver) => void
  removeDriver: (driverId: string) => void
  addPass: (pass: PassFormData) => void
  updatePass: (pass: BusPass) => void
  removePass: (passId: string) => void
}

const AppDataContext = React.createContext<AppDataContextType | undefined>(undefined)

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [vehicles, setVehicles] = React.useState<Vehicle[]>(initialVehicles)
  const [drivers, setDrivers] = React.useState<Driver[]>(initialDrivers)
  const [passes, setPasses] = React.useState<BusPass[]>(initialPasses)
  const [documents, setDocuments] = React.useState<Document[]>(initialDocuments)

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

  return (
    <AppDataContext.Provider value={{ vehicles, drivers, passes, documents, addVehicle, updateVehicle, removeVehicle, addDriver, updateDriver, removeDriver, addPass, updatePass, removePass }}>
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
