export type Bus = {
  id: string;
  name: string;
  driverId: string;
  route: string;
  status: 'On Time' | 'Delayed' | 'Early' | 'Maintenance';
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
  assignedBusId: string | null;
  status: 'Active' | 'Suspended' | 'Inactive';
  avatarUrl: string;
};

export type BusPass = {
  id: string;
  passengerName: string;
  busId: string;
  route: string;
  seat: string;
  validFrom: Date;
  validUntil: Date;
  status: 'Active' | 'Expired' | 'Invalid';
};

export type Document = {
  id: string;
  name: string;
  busId: string;
  uploadDate: Date;
  expiryDate: Date;
  status: 'Valid' | 'Expiring Soon' | 'Expired';
};

export type Expense = {
  id: string;
  busId: string;
  type: 'Fuel' | 'Maintenance' | 'Insurance' | 'Other';
  description: string;
  amount: number;
  date: Date;
};

export type Message = {
  id: string;
  sender: 'Admin' | string; // driver name
  content: string;
  timestamp: Date;
};

export type ChatContact = {
  id: string;
  name: string;
  type: 'Driver' | 'Passenger';
  avatarUrl: string;
  lastMessage: string;
  lastMessageTime: string;
};

export const drivers: Driver[] = [
  { id: 'd001', name: 'John Doe', email: 'john.doe@example.com', phone: '555-0101', assignedBusId: 'b001', status: 'Active', avatarUrl: 'https://placehold.co/100x100.png' },
  { id: 'd002', name: 'Jane Smith', email: 'jane.smith@example.com', phone: '555-0102', assignedBusId: 'b002', status: 'Active', avatarUrl: 'https://placehold.co/100x100.png' },
  { id: 'd003', name: 'Mike Johnson', email: 'mike.j@example.com', phone: '555-0103', assignedBusId: 'b003', status: 'Suspended', avatarUrl: 'https://placehold.co/100x100.png' },
  { id: 'd004', name: 'Emily Davis', email: 'emily.d@example.com', phone: '555-0104', assignedBusId: null, status: 'Inactive', avatarUrl: 'https://placehold.co/100x100.png' },
  { id: 'd005', name: 'Chris Lee', email: 'chris.l@example.com', phone: '555-0105', assignedBusId: 'b004', status: 'Active', avatarUrl: 'https://placehold.co/100x100.png' },
];

export const buses: Bus[] = [
  { id: 'b001', name: 'City Cruiser 1', driverId: 'd001', route: 'Downtown Loop', status: 'On Time', availability: { total: 40, occupied: 25 }, location: { lat: 34.0522, lng: -118.2437 } },
  { id: 'b002', name: 'Express 202', driverId: 'd002', route: 'Uptown Express', status: 'Delayed', availability: { total: 50, occupied: 48 }, location: { lat: 34.059, lng: -118.251 } },
  { id: 'b003', name: 'Suburb Connect', driverId: 'd003', route: 'West Suburbs', status: 'On Time', availability: { total: 35, occupied: 10 }, location: { lat: 34.045, lng: -118.239 } },
  { id: 'b004', name: 'Metro Link', driverId: 'd005', route: 'Eastside Connector', status: 'Early', availability: { total: 40, occupied: 38 }, location: { lat: 34.061, lng: -118.245 } },
  { id: 'b005', name: 'Night Owl', driverId: 'd001', route: 'Late Night Route', status: 'Maintenance', availability: { total: 40, occupied: 0 }, location: { lat: 34.05, lng: -118.24 } },
];

export const passes: BusPass[] = [
  { id: 'p001', passengerName: 'Alice Williams', busId: 'b001', route: 'Downtown Loop', seat: '12A', validFrom: new Date('2024-07-01'), validUntil: new Date('2024-07-31'), status: 'Active' },
  { id: 'p002', passengerName: 'Bob Brown', busId: 'b002', route: 'Uptown Express', seat: '5B', validFrom: new Date('2024-06-01'), validUntil: new Date('2024-06-30'), status: 'Expired' },
  { id: 'p003', passengerName: 'Charlie Green', busId: 'b003', route: 'West Suburbs', seat: '21F', validFrom: new Date('2024-07-10'), validUntil: new Date('2024-08-10'), status: 'Active' },
  { id: 'p004', passengerName: 'Diana Prince', busId: 'b001', route: 'Downtown Loop', seat: '3C', validFrom: new Date('2024-01-01'), validUntil: new Date('2024-01-01'), status: 'Invalid' },
];

export const documents: Document[] = [
  { id: 'doc001', name: 'Registration-CC1.pdf', busId: 'b001', uploadDate: new Date('2024-01-15'), expiryDate: new Date('2025-01-14'), status: 'Valid' },
  { id: 'doc002', name: 'Insurance-E202.pdf', busId: 'b002', uploadDate: new Date('2023-08-01'), expiryDate: new Date('2024-07-31'), status: 'Expiring Soon' },
  { id: 'doc003', name: 'Maintenance-SC.pdf', busId: 'b003', uploadDate: new Date('2024-05-20'), expiryDate: new Date('2024-06-19'), status: 'Expired' },
  { id: 'doc004', name: 'Permit-ML.pdf', busId: 'b004', uploadDate: new Date('2024-03-10'), expiryDate: new Date('2026-03-09'), status: 'Valid' },
];

export const expenses: Expense[] = [
  { id: 'exp001', busId: 'b001', type: 'Fuel', description: 'Refuel for City Cruiser 1', amount: 150.75, date: new Date('2024-07-15') },
  { id: 'exp002', busId: 'b002', type: 'Maintenance', description: 'Brake pad replacement', amount: 350.00, date: new Date('2024-07-14') },
  { id: 'exp003', busId: 'b003', type: 'Insurance', description: 'Monthly premium', amount: 500.00, date: new Date('2024-07-01') },
  { id: 'exp004', busId: 'b004', type: 'Fuel', description: 'Refuel for Metro Link', amount: 180.50, date: new Date('2024-07-16') },
  { id: 'exp005', busId: 'b001', type: 'Other', description: 'Tire cleaning supplies', amount: 45.25, date: new Date('2024-07-12') },
  { id: 'exp006', busId: 'b005', type: 'Maintenance', description: 'Oil change and filter', amount: 120.00, date: new Date('2024-07-10') },
];

export const chatContacts: ChatContact[] = [
    { id: 'd001', name: 'John Doe', type: 'Driver', avatarUrl: 'https://placehold.co/40x40.png', lastMessage: 'Okay, copy that.', lastMessageTime: '10:42 AM' },
    { id: 'd002', name: 'Jane Smith', type: 'Driver', avatarUrl: 'https://placehold.co/40x40.png', lastMessage: 'Traffic is heavy on 5th Ave.', lastMessageTime: '10:35 AM' },
    { id: 'pass001', name: 'Alice Williams', type: 'Passenger', avatarUrl: 'https://placehold.co/40x40.png', lastMessage: 'Thank you for the help!', lastMessageTime: 'Yesterday' },
    { id: 'd005', name: 'Chris Lee', type: 'Driver', avatarUrl: 'https://placehold.co/40x40.png', lastMessage: 'I\'m starting my route now.', lastMessageTime: '9:01 AM' },
];

export const messages: Record<string, Message[]> = {
  'd001': [
    { id: 'msg1', sender: 'Admin', content: 'John, what is your current ETA for Central Station?', timestamp: new Date(new Date().setHours(10, 40, 0)) },
    { id: 'msg2', sender: 'John Doe', content: 'Should be there in 15 minutes. Light traffic.', timestamp: new Date(new Date().setHours(10, 41, 0)) },
    { id: 'msg3', sender: 'Admin', content: 'Great, keep me updated.', timestamp: new Date(new Date().setHours(10, 41, 30)) },
    { id: 'msg4', sender: 'John Doe', content: 'Okay, copy that.', timestamp: new Date(new Date().setHours(10, 42, 0)) },
  ],
  'd002': [
    { id: 'msg5', sender: 'Jane Smith', content: 'Traffic is heavy on 5th Ave.', timestamp: new Date(new Date().setHours(10, 35, 0)) },
  ],
  'pass001': [
     { id: 'msg6', sender: 'Alice Williams', content: 'I lost my wallet on the bus, has anyone found it?', timestamp: new Date(new Date().setDate(new Date().getDate() - 1)) },
     { id: 'msg7', sender: 'Admin', content: 'Which bus were you on? We can check with the driver.', timestamp: new Date(new Date().setDate(new Date().getDate() - 1)) },
     { id: 'msg8', sender: 'Alice Williams', content: 'The Downtown Loop one. Thank you for the help!', timestamp: new Date(new Date().setDate(new Date().getDate() - 1)) },
  ],
  'd005': [
     { id: 'msg9', sender: 'Chris Lee', content: "I'm starting my route now.", timestamp: new Date(new Date().setHours(9, 1, 0)) },
  ]
};
