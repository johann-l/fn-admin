
export type Vehicle = {
  id: string;
  name: string;
  model: string;
  year: number;
  licensePlate: string;
  driverId: string | null;
  routeId: string | null;
  status: 'On Time' | 'Delayed' | 'Early' | 'Maintenance' | 'Out of Service';
  lastService: Date;
  availability: {
    total: number;
    occupied: number;
  };
  currentStopIndex: number;
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

export type Route = {
  id: string;
  name: string;
  stops: string[];
}

export type BusPass = {
  id:string;
  holderName: string;
  holderType: 'Student' | 'Faculty';
  bloodGroup: string;
  vehicleId: string;
  seat: string;
  busStop: string;
  validFrom: Date;
  validUntil: Date;
  status: 'Active' | 'Expired' | 'Invalid';
  studentId?: string;
  semester?: string;
  course?: string;
  department?: string;
  facultyId?: string;
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
  routeId?: string; // For passengers
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

export type Alert = {
  id: string;
  title: string;
  description: string;
  details: string;
  type: 'Delay' | 'Maintenance Request' | 'System';
  vehicleId: string | null;
  timestamp: Date;
  isRead: boolean;
};

export const routes: Route[] = [
  { id: 'r101', name: 'Route 101', stops: ['Main St & 1st Ave', 'Oak Street & 5th Ave', 'Pine Lane', 'University Main Gate'] },
  { id: 'r202', name: 'Route 202', stops: ['City Library', 'Downtown Square', 'West End Terminal', 'University Main Gate'] },
  { id: 'r303', name: 'Route 303', stops: ['Elm Street Plaza', 'Maple & 12th', 'North Hub', 'East Campus'] },
  { id: 'r404', name: 'Route 404', stops: ['South Station', 'Green Park', 'Lakeview Drive', 'East Campus'] },
  { id: 'r505', name: 'Route 505', stops: ['Airport', 'Convention Center', 'Business Park', 'West End Terminal'] },
];

export const drivers: Driver[] = [
  { id: 'd001', name: 'John Doe', email: 'john.doe@example.com', phone: '555-0101', assignedVehicleId: 'v001', status: 'Active', avatarUrl: 'https://placehold.co/100x100.png' },
  { id: 'd002', name: 'Jane Smith', email: 'jane.smith@example.com', phone: '555-0102', assignedVehicleId: 'v002', status: 'Active', avatarUrl: 'https://placehold.co/100x100.png' },
  { id: 'd003', name: 'Mike Johnson', email: 'mike.j@example.com', phone: '555-0103', assignedVehicleId: 'v003', status: 'Suspended', avatarUrl: 'https://placehold.co/100x100.png' },
  { id: 'd004', name: 'Emily Davis', email: 'emily.d@example.com', phone: '555-0104', assignedVehicleId: null, status: 'Inactive', avatarUrl: 'https://placehold.co/100x100.png' },
  { id: 'd005', name: 'Chris Lee', email: 'chris.l@example.com', phone: '555-0105', assignedVehicleId: 'v004', status: 'Active', avatarUrl: 'https://placehold.co/100x100.png' },
];

export const vehicles: Vehicle[] = [
  { id: 'v001', name: 'Bus 1', model: 'Mercedes Sprinter', year: 2022, licensePlate: 'CC-001', driverId: 'd001', routeId: 'r101', status: 'On Time', lastService: new Date('2024-05-10'), availability: { total: 40, occupied: 25 }, currentStopIndex: 2, location: { lat: 34.0522, lng: -118.2437 } },
  { id: 'v002', name: 'Bus 2', model: 'Ford Transit', year: 2021, licensePlate: 'EX-202', driverId: 'd002', routeId: 'r202', status: 'Delayed', lastService: new Date('2024-04-22'), availability: { total: 50, occupied: 48 }, currentStopIndex: 1, location: { lat: 34.059, lng: -118.251 } },
  { id: 'v003', name: 'Bus 3', model: 'Volvo 9700', year: 2023, licensePlate: 'SC-003', driverId: 'd003', routeId: 'r303', status: 'On Time', lastService: new Date('2024-06-01'), availability: { total: 35, occupied: 10 }, currentStopIndex: 3, location: { lat: 34.045, lng: -118.239 } },
  { id: 'v004', name: 'Bus 4', model: 'Mercedes Sprinter', year: 2022, licensePlate: 'ML-004', driverId: 'd005', routeId: 'r404', status: 'Early', lastService: new Date('2024-05-15'), availability: { total: 40, occupied: 38 }, currentStopIndex: 0, location: { lat: 34.061, lng: -118.245 } },
  { id: 'v005', name: 'Bus 5', model: 'Ford Transit', year: 2021, licensePlate: 'NO-005', driverId: null, routeId: 'r505', status: 'Maintenance', lastService: new Date('2024-07-01'), availability: { total: 40, occupied: 0 }, currentStopIndex: -1, location: { lat: 34.05, lng: -118.24 } },
];

export const passes: BusPass[] = [
  { id: 'p001', holderName: 'Liam Miller', holderType: 'Student', bloodGroup: 'A+', vehicleId: 'v001', seat: '12A', busStop: 'Oak Street & 5th Ave', validFrom: new Date('2024-07-01'), validUntil: new Date('2024-12-31'), status: 'Active', studentId: 'STU12345', semester: 'Fall 2024', course: 'Computer Science', department: 'School of Engineering' },
  { id: 'p002', holderName: 'Dr. Olivia Garcia', holderType: 'Faculty', bloodGroup: 'O-', vehicleId: 'v002', seat: '5B', busStop: 'University Main Gate', validFrom: new Date('2024-01-01'), validUntil: new Date('2024-06-30'), status: 'Expired', facultyId: 'FAC67890', department: 'Physics Department' },
  { id: 'p003', holderName: 'Noah Martinez', holderType: 'Student', bloodGroup: 'B+', vehicleId: 'v003', seat: '21F', busStop: 'Elm Street Plaza', validFrom: new Date('2024-07-10'), validUntil: new Date('2024-12-31'), status: 'Active', studentId: 'STU54321', semester: 'Fall 2024', course: 'Mechanical Engineering', department: 'School of Engineering' },
  { id: 'p004', holderName: 'Emma Rodriguez', holderType: 'Student', bloodGroup: 'AB+', vehicleId: 'v001', seat: '3C', busStop: 'Maple & 12th', validFrom: new Date('2024-01-01'), validUntil: new Date('2024-01-01'), status: 'Invalid', studentId: 'STU98765', semester: 'Spring 2024', course: 'Fine Arts', department: 'School of Arts' },
];

export const documents: Document[] = [
  { id: 'doc001', name: 'Registration-Bus-1.pdf', vehicleId: 'v001', uploadDate: new Date('2024-01-15'), expiryDate: new Date('2025-01-14'), status: 'Valid', url: 'https://placehold.co/850x1100.png' },
  { id: 'doc002', name: 'Insurance-Bus-2.pdf', vehicleId: 'v002', uploadDate: new Date('2023-08-01'), expiryDate: new Date('2024-07-31'), status: 'Expiring Soon', url: 'https://placehold.co/850x1100.png' },
  { id: 'doc003', name: 'Maintenance-Log-Bus-3.pdf', vehicleId: 'v003', uploadDate: new Date('2024-05-20'), expiryDate: new Date('2024-06-19'), status: 'Expired', url: 'https://placehold.co/850x1100.png' },
  { id: 'doc004', name: 'Permit-Bus-4.pdf', vehicleId: 'v004', uploadDate: new Date('2024-03-10'), expiryDate: new Date('2026-03-09'), status: 'Valid', url: 'https://placehold.co/850x1100.png' },
];

const expenseDescriptionsByType: Record<Expense['type'], string[]> = {
  Fuel: ['Fuel top-up', 'Diesel refill', 'Gasoline purchase'],
  Maintenance: ['Oil change service', 'Brake pad replacement', 'Tire rotation', 'Wiper blade replacement', 'Engine diagnostic'],
  Insurance: ['Monthly insurance premium', 'Policy renewal fee'],
  Tolls: ['Highway toll fee', 'Bridge toll charge'],
  Misc: ['Tire replacement', 'First-aid kit restock', 'Interior detailing'],
  Other: ["Driver's lunch allowance", 'Parking fees', 'Bus wash service'],
};

export const generateHistoricalExpenses = (): Expense[] => {
  const expenses: Expense[] = [];
  const expenseTypes: Expense['type'][] = ['Fuel', 'Maintenance', 'Insurance', 'Tolls', 'Misc', 'Other'];
  const now = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    
    // Generate more expenses per month for better variety
    for (let j = 0; j < 5; j++) {
      const vehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
      const type = expenseTypes[Math.floor(Math.random() * expenseTypes.length)];
      const randomDay = Math.floor(Math.random() * 28) + 1;
      const expenseDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), randomDay);

      const descriptionsForType = expenseDescriptionsByType[type];
      const description = descriptionsForType[Math.floor(Math.random() * descriptionsForType.length)];

      let amount;
      switch (type) {
        case 'Fuel': amount = Math.floor(Math.random() * (150 - 80 + 1)) + 80; break;
        case 'Maintenance': amount = Math.floor(Math.random() * (500 - 100 + 1)) + 100; break;
        case 'Insurance': amount = Math.floor(Math.random() * (400 - 250 + 1)) + 250; break;
        case 'Tolls': amount = Math.floor(Math.random() * (50 - 10 + 1)) + 10; break;
        default: amount = Math.floor(Math.random() * (100 - 20 + 1)) + 20; break;
      }

      expenses.push({
        id: `exp_${i}_${j}_${Math.random()}`,
        vehicleId: vehicle.id,
        type: type,
        description: description,
        amount: amount,
        date: expenseDate,
        status: Math.random() > 0.2 ? 'Paid' : 'Unpaid',
        billUrl: "https://placehold.co/850x1100.png",
      });
    }
  }
  return expenses;
};


export const generateHistoricalPayments = (): Payment[] => {
  const payments: Payment[] = [];
  const now = new Date();
  const paymentMethods: Payment['method'][] = ['Credit Card', 'Bank Transfer'];

  for (let i = 11; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);

    for (let j = 0; j < 2; j++) {
       const randomDay = Math.floor(Math.random() * 28) + 1;
       const paymentDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), randomDay);
       payments.push({
        id: `pay_in_${i}_${j}`,
        description: `Bus Pass Fee - Student ${Math.floor(Math.random() * 200)}`,
        amount: Math.floor(Math.random() * (250 - 150 + 1)) + 150,
        date: paymentDate,
        status: 'Paid',
        type: 'Incoming',
        method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      });
    }
    
     for (let j = 0; j < 2; j++) {
        const randomDay = Math.floor(Math.random() * 28) + 1;
        const paymentDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), randomDay);
        const outgoingDescriptions = ['Fuel Supplier Invoice', 'Maintenance Parts', 'Insurance Premium', 'Cleaning Services'];
        payments.push({
          id: `pay_out_${i}_${j}`,
          description: outgoingDescriptions[Math.floor(Math.random() * outgoingDescriptions.length)],
          amount: Math.floor(Math.random() * (2000 - 500 + 1)) + 500,
          date: paymentDate,
          status: 'Paid',
          type: 'Outgoing',
          method: 'Bank Transfer',
      });
    }
  }
  return payments;
};


export const chatContacts: ChatContact[] = [
    { id: 'group_drivers', name: 'All Drivers', type: 'Group', avatarUrl: '', lastMessage: 'Remember to complete pre-trip inspections.', lastMessageTime: '8:30 AM' },
    { id: 'group_route_101', name: 'Route 101 Passengers', type: 'Group', avatarUrl: '', lastMessage: 'I left my backpack on the bus.', lastMessageTime: '10:05 AM', routeId: 'r101' },
    { id: 'group_route_303', name: 'Route 303 Passengers', type: 'Group', avatarUrl: '', lastMessage: 'Is the bus running on schedule?', lastMessageTime: '9:15 AM', routeId: 'r303' },
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

export const alerts: Alert[] = [
  {
    id: 'alert001',
    title: 'Bus 2 Delayed',
    description: 'Significant traffic on Route 202.',
    details: 'Bus 2 is experiencing significant delays on Route 202 due to unexpected road closures near the Downtown Square stop. The estimated delay is 25 minutes. All passengers have been notified.',
    type: 'Delay',
    vehicleId: 'v002',
    timestamp: new Date(new Date().setHours(new Date().getHours() - 1)),
    isRead: false,
  },
  {
    id: 'alert002',
    title: 'Maintenance: Bus 5',
    description: 'Engine issue reported by driver.',
    details: 'The driver of Bus 5 has reported a critical engine warning light. The vehicle has been taken out of service and is en route to the depot for immediate inspection. Route 505 will be covered by a standby vehicle.',
    type: 'Maintenance Request',
    vehicleId: 'v005',
    timestamp: new Date(new Date().setHours(new Date().getHours() - 2)),
    isRead: false,
  },
  {
    id: 'alert003',
    title: 'Maintenance: Bus 3',
    description: 'Brake fluid level is low.',
    details: 'Routine check on Bus 3 indicates that the brake fluid is below the recommended level. Requesting a maintenance check and top-up before its next scheduled run.',
    type: 'Maintenance Request',
    vehicleId: 'v003',
    timestamp: new Date(new Date().setHours(new Date().getHours() - 4)),
    isRead: false,
  },
];
