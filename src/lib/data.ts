

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
  holderName: string;
  holderType: 'Student' | 'Faculty';
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
  billUrl?: string;
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
  { id: 'p001', holderName: 'Liam Miller', holderType: 'Student', bloodGroup: 'A+', vehicleId: 'v001', route: '101', seat: '12A', validFrom: new Date('2024-07-01'), validUntil: new Date('2024-12-31'), status: 'Active' },
  { id: 'p002', holderName: 'Dr. Olivia Garcia', holderType: 'Faculty', bloodGroup: 'O-', vehicleId: 'v002', route: '202', seat: '5B', validFrom: new Date('2024-01-01'), validUntil: new Date('2024-06-30'), status: 'Expired' },
  { id: 'p003', holderName: 'Noah Martinez', holderType: 'Student', bloodGroup: 'B+', vehicleId: 'v003', route: '303', seat: '21F', validFrom: new Date('2024-07-10'), validUntil: new Date('2024-12-31'), status: 'Active' },
  { id: 'p004', holderName: 'Emma Rodriguez', holderType: 'Student', bloodGroup: 'AB+', vehicleId: 'v001', route: '101', seat: '3C', validFrom: new Date('2024-01-01'), validUntil: new Date('2024-01-01'), status: 'Invalid' },
];

export const documents: Document[] = [
  { id: 'doc001', name: 'Registration-Bus-1.pdf', vehicleId: 'v001', uploadDate: new Date('2024-01-15'), expiryDate: new Date('2025-01-14'), status: 'Valid', url: 'https://placehold.co/850x1100.png' },
  { id: 'doc002', name: 'Insurance-Bus-2.pdf', vehicleId: 'v002', uploadDate: new Date('2023-08-01'), expiryDate: new Date('2024-07-31'), status: 'Expiring Soon', url: 'https://placehold.co/850x1100.png' },
  { id: 'doc003', name: 'Maintenance-Log-Bus-3.pdf', vehicleId: 'v003', uploadDate: new Date('2024-05-20'), expiryDate: new Date('2024-06-19'), status: 'Expired', url: 'https://placehold.co/850x1100.png' },
  { id: 'doc004', name: 'Permit-Bus-4.pdf', vehicleId: 'v004', uploadDate: new Date('2024-03-10'), expiryDate: new Date('2026-03-09'), status: 'Valid', url: 'https://placehold.co/850x1100.png' },
];

export const expenses: Expense[] = [
  { "id": "exp_11_0", "vehicleId": "v001", "type": "Tolls", "description": "Tolls for vehicle", "amount": 268, "date": new Date("2023-08-25T18:30:00.000Z"), "status": "Paid", "billUrl": "https://placehold.co/850x1100.png" },
  { "id": "exp_11_1", "vehicleId": "v001", "type": "Misc", "description": "Misc for vehicle", "amount": 105, "date": new Date("2023-08-02T18:30:00.000Z"), "status": "Paid", "billUrl": "https://placehold.co/850x1100.png" },
  { "id": "exp_10_0", "vehicleId": "v003", "type": "Maintenance", "description": "Maintenance for vehicle", "amount": 233, "date": new Date("2023-09-08T18:30:00.000Z"), "status": "Paid", "billUrl": "https://placehold.co/850x1100.png" },
  { "id": "exp_10_1", "vehicleId": "v005", "type": "Insurance", "description": "Insurance for vehicle", "amount": 313, "date": new Date("2023-09-20T18:30:00.000Z"), "status": "Paid", "billUrl": "https://placehold.co/850x1100.png" },
  { "id": "exp_9_0", "vehicleId": "v005", "type": "Tolls", "description": "Tolls for vehicle", "amount": 204, "date": new Date("2023-10-23T18:30:00.000Z"), "status": "Paid", "billUrl": "https://placehold.co/850x1100.png" },
  { "id": "exp_9_1", "vehicleId": "v005", "type": "Fuel", "description": "Fuel for vehicle", "amount": 248, "date": new Date("2023-10-01T18:30:00.000Z"), "status": "Unpaid", "billUrl": "https://placehold.co/850x1100.png" },
  { "id": "exp_8_0", "vehicleId": "v003", "type": "Fuel", "description": "Fuel for vehicle", "amount": 79, "date": new Date("2023-11-20T18:30:00.000Z"), "status": "Paid", "billUrl": "https://placehold.co/850x1100.png" },
  { "id": "exp_8_1", "vehicleId": "v004", "type": "Other", "description": "Other for vehicle", "amount": 249, "date": new Date("2023-11-06T18:30:00.000Z"), "status": "Paid", "billUrl": "https://placehold.co/850x1100.png" },
  { "id": "exp_7_0", "vehicleId": "v005", "type": "Insurance", "description": "Insurance for vehicle", "amount": 257, "date": new Date("2023-12-05T18:30:00.000Z"), "status": "Paid", "billUrl": "https://placehold.co/850x1100.png" },
  { "id": "exp_7_1", "vehicleId": "v002", "type": "Fuel", "description": "Fuel for vehicle", "amount": 286, "date": new Date("2023-12-25T18:30:00.000Z"), "status": "Paid", "billUrl": "https://placehold.co/850x1100.png" },
  { "id": "exp_6_0", "vehicleId": "v003", "type": "Misc", "description": "Misc for vehicle", "amount": 232, "date": new Date("2024-01-08T18:30:00.000Z"), "status": "Paid", "billUrl": "https://placehold.co/850x1100.png" },
  { "id": "exp_6_1", "vehicleId": "v001", "type": "Insurance", "description": "Insurance for vehicle", "amount": 230, "date": new Date("2024-01-13T18:30:00.000Z"), "status": "Paid", "billUrl": "https://placehold.co/850x1100.png" },
  { "id": "exp_5_0", "vehicleId": "v004", "type": "Tolls", "description": "Tolls for vehicle", "amount": 105, "date": new Date("2024-02-18T18:30:00.000Z"), "status": "Paid", "billUrl": "https://placehold.co/850x1100.png" },
  { "id": "exp_5_1", "vehicleId": "v003", "type": "Maintenance", "description": "Maintenance for vehicle", "amount": 269, "date": new Date("2024-02-13T18:30:00.000Z"), "status": "Paid", "billUrl": "https://placehold.co/850x1100.png" },
  { "id": "exp_4_0", "vehicleId": "v003", "type": "Misc", "description": "Misc for vehicle", "amount": 143, "date": new Date("2024-03-12T18:30:00.000Z"), "status": "Paid", "billUrl": "https://placehold.co/850x1100.png" },
  { "id": "exp_4_1", "vehicleId": "v001", "type": "Insurance", "description": "Insurance for vehicle", "amount": 178, "date": new Date("2024-03-24T18:30:00.000Z"), "status": "Paid", "billUrl": "https://placehold.co/850x1100.png" },
  { "id": "exp_3_0", "vehicleId": "v005", "type": "Other", "description": "Other for vehicle", "amount": 128, "date": new Date("2024-04-18T18:30:00.000Z"), "status": "Paid", "billUrl": "https://placehold.co/850x1100.png" },
  { "id": "exp_3_1", "vehicleId": "v003", "type": "Misc", "description": "Misc for vehicle", "amount": 148, "date": new Date("2024-04-09T18:30:00.000Z"), "status": "Paid", "billUrl": "https://placehold.co/850x1100.png" },
  { "id": "exp_2_0", "vehicleId": "v004", "type": "Other", "description": "Other for vehicle", "amount": 291, "date": new Date("2024-05-23T18:30:00.000Z"), "status": "Unpaid", "billUrl": "https://placehold.co/850x1100.png" },
  { "id": "exp_2_1", "vehicleId": "v002", "type": "Other", "description": "Other for vehicle", "amount": 222, "date": new Date("2024-05-18T18:30:00.000Z"), "status": "Paid", "billUrl": "https://placehold.co/850x1100.png" },
  { "id": "exp_1_0", "vehicleId": "v002", "type": "Tolls", "description": "Tolls for vehicle", "amount": 313, "date": new Date("2024-06-25T18:30:00.000Z"), "status": "Paid", "billUrl": "https://placehold.co/850x1100.png" },
  { "id": "exp_1_1", "vehicleId": "v001", "type": "Tolls", "description": "Tolls for vehicle", "amount": 272, "date": new Date("2024-06-20T18:30:00.000Z"), "status": "Paid", "billUrl": "https://placehold.co/850x1100.png" },
  { "id": "exp_0_0", "vehicleId": "v005", "type": "Fuel", "description": "Fuel for vehicle", "amount": 169, "date": new Date("2024-07-28T18:30:00.000Z"), "status": "Paid", "billUrl": "https://placehold.co/850x1100.png" },
  { "id": "exp_0_1", "vehicleId": "v001", "type": "Maintenance", "description": "Maintenance for vehicle", "amount": 249, "date": new Date("2024-07-10T18:30:00.000Z"), "status": "Paid", "billUrl": "https://placehold.co/850x1100.png" }
];

export const payments: Payment[] = [
  { "id": "pay_in_11_0", "description": "Bus Pass Fee - Student 1", "amount": 194, "date": new Date("2023-08-16T18:30:00.000Z"), "status": "Paid", "type": "Incoming", "method": "Credit Card" },
  { "id": "pay_in_11_1", "description": "Bus Pass Fee - Student 2", "amount": 198, "date": new Date("2023-08-11T18:30:00.000Z"), "status": "Paid", "type": "Incoming", "method": "Credit Card" },
  { "id": "pay_out_11_0", "description": "Insurance Premium", "amount": 1826, "date": new Date("2023-08-25T18:30:00.000Z"), "status": "Paid", "type": "Outgoing", "method": "Bank Transfer" },
  { "id": "pay_out_11_1", "description": "Fuel Supplier Invoice", "amount": 1951, "date": new Date("2023-08-04T18:30:00.000Z"), "status": "Paid", "type": "Outgoing", "method": "Bank Transfer" },
  { "id": "pay_in_10_0", "description": "Bus Pass Fee - Student 1", "amount": 235, "date": new Date("2023-09-24T18:30:00.000Z"), "status": "Paid", "type": "Incoming", "method": "Credit Card" },
  { "id": "pay_in_10_1", "description": "Bus Pass Fee - Student 2", "amount": 159, "date": new Date("2023-09-21T18:30:00.000Z"), "status": "Paid", "type": "Incoming", "method": "Credit Card" },
  { "id": "pay_out_10_0", "description": "Insurance Premium", "amount": 911, "date": new Date("2023-09-15T18:30:00.000Z"), "status": "Paid", "type": "Outgoing", "method": "Bank Transfer" },
  { "id": "pay_out_10_1", "description": "Cleaning Services", "amount": 718, "date": new Date("2023-09-22T18:30:00.000Z"), "status": "Paid", "type": "Outgoing", "method": "Bank Transfer" },
  { "id": "pay_in_9_0", "description": "Bus Pass Fee - Student 1", "amount": 204, "date": new Date("2023-10-18T18:30:00.000Z"), "status": "Paid", "type": "Incoming", "method": "Credit Card" },
  { "id": "pay_in_9_1", "description": "Bus Pass Fee - Student 2", "amount": 242, "date": new Date("2023-10-10T18:30:00.000Z"), "status": "Paid", "type": "Incoming", "method": "Bank Transfer" },
  { "id": "pay_out_9_0", "description": "Maintenance Parts", "amount": 1782, "date": new Date("2023-10-06T18:30:00.000Z"), "status": "Paid", "type": "Outgoing", "method": "Bank Transfer" },
  { "id": "pay_out_9_1", "description": "Insurance Premium", "amount": 1656, "date": new Date("2023-10-09T18:30:00.000Z"), "status": "Paid", "type": "Outgoing", "method": "Bank Transfer" },
  { "id": "pay_in_8_0", "description": "Bus Pass Fee - Student 1", "amount": 204, "date": new Date("2023-11-06T18:30:00.000Z"), "status": "Paid", "type": "Incoming", "method": "Credit Card" },
  { "id": "pay_in_8_1", "description": "Bus Pass Fee - Student 2", "amount": 218, "date": new Date("2023-11-20T18:30:00.000Z"), "status": "Paid", "type": "Incoming", "method": "Bank Transfer" },
  { "id": "pay_out_8_0", "description": "Maintenance Parts", "amount": 1698, "date": new Date("2023-11-03T18:30:00.000Z"), "status": "Paid", "type": "Outgoing", "method": "Bank Transfer" },
  { "id": "pay_out_8_1", "description": "Cleaning Services", "amount": 1058, "date": new Date("2023-11-13T18:30:00.000Z"), "status": "Paid", "type": "Outgoing", "method": "Bank Transfer" },
  { "id": "pay_in_7_0", "description": "Bus Pass Fee - Student 1", "amount": 146, "date": new Date("2023-12-07T18:30:00.000Z"), "status": "Paid", "type": "Incoming", "method": "Credit Card" },
  { "id": "pay_in_7_1", "description": "Bus Pass Fee - Student 2", "amount": 196, "date": new Date("2023-12-14T18:30:00.000Z"), "status": "Paid", "type": "Incoming", "method": "Credit Card" },
  { "id": "pay_out_7_0", "description": "Fuel Supplier Invoice", "amount": 1468, "date": new Date("2023-12-11T18:30:00.000Z"), "status": "Paid", "type": "Outgoing", "method": "Bank Transfer" },
  { "id": "pay_out_7_1", "description": "Maintenance Parts", "amount": 1131, "date": new Date("2023-12-25T18:30:00.000Z"), "status": "Paid", "type": "Outgoing", "method": "Bank Transfer" },
  { "id": "pay_in_6_0", "description": "Bus Pass Fee - Student 1", "amount": 154, "date": new Date("2024-01-20T18:30:00.000Z"), "status": "Paid", "type": "Incoming", "method": "Credit Card" },
  { "id": "pay_in_6_1", "description": "Bus Pass Fee - Student 2", "amount": 153, "date": new Date("2024-01-13T18:30:00.000Z"), "status": "Paid", "type": "Incoming", "method": "Credit Card" },
  { "id": "pay_out_6_0", "description": "Fuel Supplier Invoice", "amount": 639, "date": new Date("2024-01-15T18:30:00.000Z"), "status": "Paid", "type": "Outgoing", "method": "Bank Transfer" },
  { "id": "pay_out_6_1", "description": "Insurance Premium", "amount": 1047, "date": new Date("2024-01-25T18:30:00.000Z"), "status": "Paid", "type": "Outgoing", "method": "Bank Transfer" },
  { "id": "pay_in_5_0", "description": "Bus Pass Fee - Student 1", "amount": 118, "date": new Date("2024-02-04T18:30:00.000Z"), "status": "Paid", "type": "Incoming", "method": "Credit Card" },
  { "id": "pay_in_5_1", "description": "Bus Pass Fee - Student 2", "amount": 149, "date": new Date("2024-02-18T18:30:00.000Z"), "status": "Paid", "type": "Incoming", "method": "Credit Card" },
  { "id": "pay_out_5_0", "description": "Maintenance Parts", "amount": 1941, "date": new Date("2024-02-08T18:30:00.000Z"), "status": "Paid", "type": "Outgoing", "method": "Bank Transfer" },
  { "id": "pay_out_5_1", "description": "Fuel Supplier Invoice", "amount": 597, "date": new Date("2024-02-19T18:30:00.000Z"), "status": "Paid", "type": "Outgoing", "method": "Bank Transfer" },
  { "id": "pay_in_4_0", "description": "Bus Pass Fee - Student 1", "amount": 192, "date": new Date("2024-03-23T18:30:00.000Z"), "status": "Paid", "type": "Incoming", "method": "Credit Card" },
  { "id": "pay_in_4_1", "description": "Bus Pass Fee - Student 2", "amount": 178, "date": new Date("2024-03-12T18:30:00.000Z"), "status": "Paid", "type": "Incoming", "method": "Credit Card" },
  { "id": "pay_out_4_0", "description": "Cleaning Services", "amount": 1056, "date": new Date("2024-03-15T18:30:00.000Z"), "status": "Paid", "type": "Outgoing", "method": "Bank Transfer" },
  { "id": "pay_out_4_1", "description": "Fuel Supplier Invoice", "amount": 1391, "date": new Date("2024-03-24T18:30:00.000Z"), "status": "Paid", "type": "Outgoing", "method": "Bank Transfer" },
  { "id": "pay_in_3_0", "description": "Bus Pass Fee - Student 1", "amount": 223, "date": new Date("2024-04-18T18:30:00.000Z"), "status": "Paid", "type": "Incoming", "method": "Credit Card" },
  { "id": "pay_in_3_1", "description": "Bus Pass Fee - Student 2", "amount": 179, "date": new Date("2024-04-09T18:30:00.000Z"), "status": "Paid", "type": "Incoming", "method": "Bank Transfer" },
  { "id": "pay_out_3_0", "description": "Cleaning Services", "amount": 1587, "date": new Date("2024-04-22T18:30:00.000Z"), "status": "Paid", "type": "Outgoing", "method": "Bank Transfer" },
  { "id": "pay_out_3_1", "description": "Maintenance Parts", "amount": 1419, "date": new Date("2024-04-28T18:30:00.000Z"), "status": "Paid", "type": "Outgoing", "method": "Bank Transfer" },
  { "id": "pay_in_2_0", "description": "Bus Pass Fee - Student 1", "amount": 249, "date": new Date("2024-05-18T18:30:00.000Z"), "status": "Paid", "type": "Incoming", "method": "Credit Card" },
  { "id": "pay_in_2_1", "description": "Bus Pass Fee - Student 2", "amount": 185, "date": new Date("2024-05-23T18:30:00.000Z"), "status": "Paid", "type": "Incoming", "method": "Credit Card" },
  { "id": "pay_out_2_0", "description": "Maintenance Parts", "amount": 1056, "date": new Date("2024-05-28T18:30:00.000Z"), "status": "Paid", "type": "Outgoing", "method": "Bank Transfer" },
  { "id": "pay_out_2_1", "description": "Maintenance Parts", "amount": 1242, "date": new Date("2024-05-09T18:30:00.000Z"), "status": "Paid", "type": "Outgoing", "method": "Bank Transfer" },
  { "id": "pay_in_1_0", "description": "Bus Pass Fee - Student 1", "amount": 196, "date": new Date("2024-06-25T18:30:00.000Z"), "status": "Paid", "type": "Incoming", "method": "Credit Card" },
  { "id": "pay_in_1_1", "description": "Bus Pass Fee - Student 2", "amount": 236, "date": new Date("2024-06-11T18:30:00.000Z"), "status": "Paid", "type": "Incoming", "method": "Credit Card" },
  { "id": "pay_out_1_0", "description": "Fuel Supplier Invoice", "amount": 1421, "date": new Date("2024-06-18T18:30:00.000Z"), "status": "Paid", "type": "Outgoing", "method": "Bank Transfer" },
  { "id": "pay_out_1_1", "description": "Insurance Premium", "amount": 1698, "date": new Date("2024-06-20T18:30:00.000Z"), "status": "Paid", "type": "Outgoing", "method": "Bank Transfer" },
  { "id": "pay_in_0_0", "description": "Bus Pass Fee - Student 1", "amount": 178, "date": new Date("2024-07-28T18:30:00.000Z"), "status": "Paid", "type": "Incoming", "method": "Credit Card" },
  { "id": "pay_in_0_1", "description": "Bus Pass Fee - Student 2", "amount": 166, "date": new Date("2024-07-10T18:30:00.000Z"), "status": "Paid", "type": "Incoming", "method": "Bank Transfer" },
  { "id": "pay_out_0_0", "description": "Cleaning Services", "amount": 1488, "date": new Date("2024-07-01T18:30:00.000Z"), "status": "Paid", "type": "Outgoing", "method": "Bank Transfer" },
  { "id": "pay_out_0_1", "description": "Maintenance Parts", "amount": 1342, "date": new Date("2024-07-04T18:30:00.000Z"), "status": "Paid", "type": "Outgoing", "method": "Bank Transfer" }
];


export const chatContacts: ChatContact[] = [
    { id: 'group_drivers', name: 'All Drivers', type: 'Group', avatarUrl: '', lastMessage: 'Remember to complete pre-trip inspections.', lastMessageTime: '8:30 AM' },
    { id: 'group_route_101', name: 'Route 101 Passengers', type: 'Group', avatarUrl: '', lastMessage: 'I left my backpack on the bus.', lastMessageTime: '10:05 AM', route: '101' },
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
     { id: 'msg_r101_1', sender: 'Liam Miller', content: 'I may have left my science project on the bus, has anyone found it?', timestamp: new Date(new Date().setDate(new Date().getDate() - 1)) },
     { id: 'msg_r101_2', sender: 'Admin', content: 'Which bus were you on, Liam? We can check with the driver.', timestamp: new Date(new Date().setDate(new Date().getDate() - 1)) },
     { id: 'msg_r101_3', sender: 'Emma Rodriguez', content: 'I think I left my blue backpack on the bus this morning.', timestamp: new Date(new Date().setHours(10, 5, 0)) },
     { id: 'msg_r101_4', sender: 'Admin', content: 'I will check with the driver, Emma.', timestamp: new Date(new Date().setHours(10, 6, 0)) },
  ],
  'group_route_303': [
    { id: 'msg_r303_1', sender: 'Noah Martinez', content: 'Hi, is the bus running on schedule today?', timestamp: new Date(new Date().setHours(9, 15, 0)) },
    { id: 'msg_r303_2', sender: 'Admin', content: 'Yes, everything is on time so far. You can track the bus live on the main dashboard map.', timestamp: new Date(new Date().setHours(9, 16, 0)) },
  ],
};

    
