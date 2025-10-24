export type Vehicle = {
  id: string;
  name: string;
  model: string;
  year: number;
  licensePlate: string;
  driverId: string | null;
  routeId: string | null;
  status: 'On Time' | 'Delayed' | 'Early' | 'Maintenance' | 'Out of Service';
  lastService: string;
  totalSeats: number;
  occupiedSeats: number;
  location?: {
    lat: number;
    lng: number;
  };
};
