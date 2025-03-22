export interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  avatar: string;
  status: 'active' | 'inactive' | 'tampered';
  powerCoins: number;
  lastUpdated: string;
}

export const users: User[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    address: '123 Maple Street, Springfield',
    avatar: '/avatars/user-1.png',
    status: 'active',
    powerCoins: 2456,
    lastUpdated: '2023-05-15T09:24:00Z',
  },
  {
    id: '2',
    name: 'Emily Johnson',
    email: 'emily.johnson@example.com',
    address: '456 Oak Avenue, Riverside',
    avatar: '/avatars/user-2.png',
    status: 'active',
    powerCoins: 1832,
    lastUpdated: '2023-05-14T14:35:00Z',
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    address: '789 Pine Road, Lakeside',
    avatar: '/avatars/user-3.png',
    status: 'active',
    powerCoins: 3120,
    lastUpdated: '2023-05-15T10:12:00Z',
  },
  {
    id: '4',
    name: 'Sarah Williams',
    email: 'sarah.williams@example.com',
    address: '101 Elm Boulevard, Hillcrest',
    avatar: '/avatars/user-4.png',
    status: 'tampered',
    powerCoins: 986,
    lastUpdated: '2023-05-13T08:50:00Z',
  }
]; 