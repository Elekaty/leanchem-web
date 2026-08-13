import type { Order } from '../types';

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-2026-0842',
    productName: 'Isopropyl Alcohol, Anhydrous, HPLC Grade',
    casNumber: '67-63-0',
    placedAt: '2026-07-28T09:14:00Z',
    steps: [
      { id: 's1', label: 'Order Placed', status: 'Complete', timestamp: '2026-07-28 09:14' },
      { id: 's2', label: 'Verified', status: 'Complete', timestamp: '2026-07-28 14:02' },
      {
        id: 's3',
        label: 'Action Required',
        status: 'Action_Required',
        timestamp: '2026-08-02 11:30',
        taskType: 'Upload_Receipt',
      },
      { id: 's4', label: 'Delivering', status: 'Pending' },
    ],
  },
  {
    id: 'ORD-2026-0791',
    productName: 'Sodium Hydroxide, Pellets, ACS Reagent Grade',
    casNumber: '1310-73-2',
    placedAt: '2026-07-12T16:40:00Z',
    steps: [
      { id: 's1', label: 'Order Placed', status: 'Complete', timestamp: '2026-07-12 16:40' },
      { id: 's2', label: 'Verified', status: 'Complete', timestamp: '2026-07-13 08:15' },
      { id: 's3', label: 'Delivering', status: 'Active', timestamp: '2026-08-05 06:00' },
      {
        id: 's4',
        label: 'Documentation',
        status: 'Pending',
        taskType: 'Sign_Doc',
      },
    ],
  },
];