
export type Vehicle = {
  id: string;
  name: string;
  model: string;
  year: number;
  licensePlate: string;
  driverId: string | null;
  route: string;
  status: 'On Time' | 'Delayed' | 'Early' | 'Maintenance' | 'Out of Service';
  lastService: Date;
  availability: {
    total: number;
    occupied: number;
  };
  location: { lat: number; lng: number };
};

export type Driver = {
  id: string;
  name: string;
  email: string;
  phone: string;
  assignedVehicleId: string | null;
  status: 'Active' | 'Suspended' | 'Inactive';
  avatarUrl: string;
};

export type BusPass = {
  id:string;
  passengerName: string;
  bloodGroup: string;
  vehicleId: string;
  route: string;
  seat: string;
  validFrom: Date;
  validUntil: Date;
  status: 'Active' | 'Expired' | 'Invalid';
};

export type Document = {
  id: string;
  name: string;
  vehicleId: string;
  uploadDate: Date;
  expiryDate: Date;
  status: 'Valid' | 'Expiring Soon' | 'Expired';
  url: string;
};

export type Expense = {
  id: string;
  vehicleId: string;
  type: 'Fuel' | 'Maintenance' | 'Insurance' | 'Other' | 'Tolls' | 'Misc';
  description: string;
  amount: number;
  date: Date;
  status: 'Paid' | 'Unpaid';
};

export type Message = {
  id: string;
  sender: 'Admin' | string; // driver name or passenger name
  content: string;
  timestamp: Date;
};

export type ChatContact = {
  id: string;
  name: string;
  type: 'Group' | 'Driver' | 'Passenger';
  avatarUrl: string;
  lastMessage: string;
  lastMessageTime: string;
  route?: string; // For passengers
};

export type Payment = {
  id: string;
  description: string;
  amount: number;
  date: Date;
  status: 'Paid' | 'Pending' | 'Failed';
  type: 'Incoming' | 'Outgoing';
  method: 'Credit Card' | 'Bank Transfer' | 'Cash';
};

export const drivers: Driver[] = [
  { id: 'd001', name: 'John Doe', email: 'john.doe@example.com', phone: '555-0101', assignedVehicleId: 'v001', status: 'Active', avatarUrl: 'https://placehold.co/100x100.png' },
  { id: 'd002', name: 'Jane Smith', email: 'jane.smith@example.com', phone: '555-0102', assignedVehicleId: 'v002', status: 'Active', avatarUrl: 'https://placehold.co/100x100.png' },
  { id: 'd003', name: 'Mike Johnson', email: 'mike.j@example.com', phone: '555-0103', assignedVehicleId: 'v003', status: 'Suspended', avatarUrl: 'https://placehold.co/100x100.png' },
  { id: 'd004', name: 'Emily Davis', email: 'emily.d@example.com', phone: '555-0104', assignedVehicleId: null, status: 'Inactive', avatarUrl: 'https://placehold.co/100x100.png' },
  { id: 'd005', name: 'Chris Lee', email: 'chris.l@example.com', phone: '555-0105', assignedVehicleId: 'v004', status: 'Active', avatarUrl: 'https://placehold.co/100x100.png' },
];

export const vehicles: Vehicle[] = [
  { id: 'v001', name: 'Bus 1', model: 'Mercedes Sprinter', year: 2022, licensePlate: 'CC-001', driverId: 'd001', route: '101', status: 'On Time', lastService: new Date('2024-05-10'), availability: { total: 40, occupied: 25 }, location: { lat: 34.0522, lng: -118.2437 } },
  { id: 'v002', name: 'Bus 2', model: 'Ford Transit', year: 2021, licensePlate: 'EX-202', driverId: 'd002', route: '202', status: 'Delayed', lastService: new Date('2024-04-22'), availability: { total: 50, occupied: 48 }, location: { lat: 34.059, lng: -118.251 } },
  { id: 'v003', name: 'Bus 3', model: 'Volvo 9700', year: 2023, licensePlate: 'SC-003', driverId: 'd003', route: '303', status: 'On Time', lastService: new Date('2024-06-01'), availability: { total: 35, occupied: 10 }, location: { lat: 34.045, lng: -118.239 } },
  { id: 'v004', name: 'Bus 4', model: 'Mercedes Sprinter', year: 2022, licensePlate: 'ML-004', driverId: 'd005', route: '404', status: 'Early', lastService: new Date('2024-05-15'), availability: { total: 40, occupied: 38 }, location: { lat: 34.061, lng: -118.245 } },
  { id: 'v005', name: 'Bus 5', model: 'Ford Transit', year: 2021, licensePlate: 'NO-005', driverId: null, route: '505', status: 'Maintenance', lastService: new Date('2024-07-01'), availability: { total: 40, occupied: 0 }, location: { lat: 34.05, lng: -118.24 } },
];

export const passes: BusPass[] = [
  { id: 'p001', passengerName: 'Alice Williams', bloodGroup: 'A+', vehicleId: 'v001', route: '101', seat: '12A', validFrom: new Date('2024-07-01'), validUntil: new Date('2024-07-31'), status: 'Active' },
  { id: 'p002', passengerName: 'Bob Brown', bloodGroup: 'O-', vehicleId: 'v002', route: '202', seat: '5B', validFrom: new Date('2024-06-01'), validUntil: new Date('2024-06-30'), status: 'Expired' },
  { id: 'p003', passengerName: 'Charlie Green', bloodGroup: 'B+', vehicleId: 'v003', route: '303', seat: '21F', validFrom: new Date('2024-07-10'), validUntil: new Date('2024-08-10'), status: 'Active' },
  { id: 'p004', passengerName: 'Diana Prince', bloodGroup: 'AB+', vehicleId: 'v001', route: '101', seat: '3C', validFrom: new Date('2024-01-01'), validUntil: new Date('2024-01-01'), status: 'Invalid' },
];

export const documents: Document[] = [
  { id: 'doc001', name: 'Registration-CC1.pdf', vehicleId: 'v001', uploadDate: new Date('2024-01-15'), expiryDate: new Date('2025-01-14'), status: 'Valid', url: 'https://placehold.co/850x1100.png' },
  { id: 'doc002', name: 'Insurance-E202.pdf', vehicleId: 'v002', uploadDate: new Date('2023-08-01'), expiryDate: new Date('2024-07-31'), status: 'Expiring Soon', url: 'https://placehold.co/850x1100.png' },
  { id: 'doc003', name: 'Maintenance-SC.pdf', vehicleId: 'v003', uploadDate: new Date('2024-05-20'), expiryDate: new Date('2024-06-19'), status: 'Expired', url: 'https://placehold.co/850x1100.png' },
  { id: 'doc004', name: 'Permit-ML.pdf', vehicleId: 'v004', uploadDate: new Date('2024-03-10'), expiryDate: new Date('2026-03-09'), status: 'Valid', url: 'https://placehold.co/850x1100.png' },
];

export const expenses: Expense[] = [
  { id: 'exp001', vehicleId: 'v001', type: 'Fuel', description: 'Refuel for Bus 1', amount: 150.75, date: new Date('2024-07-15'), status: 'Paid' },
  { id: 'exp002', vehicleId: 'v002', type: 'Maintenance', description: 'Brake pad replacement', amount: 350.00, date: new Date('2024-07-14'), status: 'Unpaid' },
  { id: 'exp003', vehicleId: 'v003', type: 'Insurance', description: 'Monthly premium', amount: 500.00, date: new Date('2024-07-01'), status: 'Paid' },
  { id: 'exp004', vehicleId: 'v004', type: 'Fuel', description: 'Refuel for Bus 4', amount: 180.50, date: new Date('2024-07-16'), status: 'Unpaid' },
  { id: 'exp005', vehicleId: 'v001', type: 'Other', description: 'Tire cleaning supplies', amount: 45.25, date: new Date('2024-07-12'), status: 'Paid' },
  { id: 'exp006', vehicleId: 'v005', type: 'Maintenance', description: 'Oil change and filter', amount: 120.00, date: new Date('2024-07-10'), status: 'Unpaid' },
  { id: 'exp007', vehicleId: 'v002', type: 'Tolls', description: 'Downtown Bridge Toll', amount: 12.50, date: new Date('2024-07-18'), status: 'Paid' },
  { id: 'exp008', vehicleId: 'v004', type: 'Misc', description: 'Driver meal allowance', amount: 25.00, date: new Date('2024-07-19'), status: 'Paid' },
];

export const payments: Payment[] = [
  { id: 'pay001', description: 'Monthly Bus Pass - A. Williams', amount: 55.00, date: new Date('2024-07-01T10:00:00Z'), status: 'Paid', type: 'Incoming', method: 'Credit Card' },
  { id: 'pay002', description: 'Fuel Supplier Invoice #FS-1024', amount: 1250.50, date: new Date('2024-07-05T11:30:00Z'), status: 'Paid', type: 'Outgoing', method: 'Bank Transfer' },
  { id: 'pay003', description: 'Downtown Shuttle Service', amount: 300.00, date: new Date('2024-07-10T14:00:00Z'), status: 'Pending', type: 'Incoming', method: 'Credit Card' },
  { id: 'pay004', description: 'Tire Replacement - Bus 2', amount: 800.00, date: new Date('2024-07-12T09:45:00Z'), status: 'Paid', type: 'Outgoing', method: 'Credit Card' },
  { id: 'pay005', description: 'Ad Revenue - Route 5 Billboards', amount: 750.00, date: new Date('2024-07-15T16:20:00Z'), status: 'Paid', type: 'Incoming', method: 'Bank Transfer' },
  { id: 'pay006', description: 'Office Cleaning Services', amount: 150.00, date: new Date('2024-07-18T18:00:00Z'), status: 'Pending', type: 'Outgoing', method: 'Bank Transfer' },
  { id: 'pay007', description: 'Special Event Charter', amount: 1200.00, date: new Date('2024-07-20T10:30:00Z'), status: 'Failed', type: 'Incoming', method: 'Credit Card' },
];

export const chatContacts: ChatContact[] = [
    { id: 'group_drivers', name: 'All Drivers', type: 'Group', avatarUrl: '', lastMessage: 'Remember to complete pre-trip inspections.', lastMessageTime: '8:30 AM' },
    { id: 'group_route_101', name: 'Route 101 Passengers', type: 'Group', avatarUrl: '', lastMessage: 'I left my umbrella on the bus.', lastMessageTime: '10:05 AM', route: '101' },
    { id: 'group_route_303', name: 'Route 303 Passengers', type: 'Group', avatarUrl: '', lastMessage: 'Is the bus running on schedule?', lastMessageTime: '9:15 AM', route: '303' },
];

export const messages: Record<string, Message[]> = {
  'group_drivers': [
    { id: 'msg_gd_1', sender: 'Admin', content: 'Good morning team. Just a reminder to complete your pre-trip vehicle inspections before heading out.', timestamp: new Date(new Date().setHours(8, 30, 0)) },
    { id: 'msg_gd_2', sender: 'John Doe', content: 'Morning! Inspection done for Bus 1.', timestamp: new Date(new Date().setHours(8, 32, 0)) },
    { id: 'msg_gd_3', sender: 'Jane Smith', content: 'All good here on Bus 2.', timestamp: new Date(new Date().setHours(8, 35, 0)) },
    { id: 'msg_gd_4', sender: 'Admin', content: 'Thanks, John and Jane. Drive safe!', timestamp: new Date(new Date().setHours(8, 40, 0)) },
  ],
  'group_route_101': [
     { id: 'msg_r101_1', sender: 'Alice Williams', content: 'I lost my wallet on the bus, has anyone found it?', timestamp: new Date(new Date().setDate(new Date().getDate() - 1)) },
     { id: 'msg_r101_2', sender: 'Admin', content: 'Which bus were you on, Alice? We can check with the driver.', timestamp: new Date(new Date().setDate(new Date().getDate() - 1)) },
     { id: 'msg_r101_3', sender: 'Diana Prince', content: 'I think I left my blue umbrella on the bus this morning.', timestamp: new Date(new Date().setHours(10, 5, 0)) },
     { id: 'msg_r101_4', sender: 'Admin', content: 'I will check with the driver, Diana.', timestamp: new Date(new Date().setHours(10, 6, 0)) },
  ],
  'group_route_303': [
    { id: 'msg_r303_1', sender: 'Charlie Green', content: 'Hi, is the bus running on schedule today?', timestamp: new Date(new Date().setHours(9, 15, 0)) },
    { id: 'msg_r303_2', sender: 'Admin', content: 'Yes, everything is on time so far. You can track the bus live on the main dashboard map.', timestamp: new Date(new Date().setHours(9, 16, 0)) },
  ],
};
