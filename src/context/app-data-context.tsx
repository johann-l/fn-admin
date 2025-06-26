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

type AppDataContextType = {
  vehicles: Vehicle[]
  drivers: Driver[]
  passes: BusPass[]
  documents: Document[]
  addVehicle: (vehicle: VehicleFormData) => void
  updateVehicle: (vehicle: Vehicle) => void
  updateDriver: (driver: Driver) => void
  addPass: (pass: PassFormData) => void
  updatePass: (pass: BusPass) => void
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

  const updateDriver = (updatedDriver: Driver) => {
    setDrivers(prev => prev.map(d => d.id === updatedDriver.id ? updatedDriver : d))
  }
  
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

  return (
    <AppDataContext.Provider value={{ vehicles, drivers, passes, documents, addVehicle, updateVehicle, updateDriver, addPass, updatePass }}>
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
