import { EnergyMeasurement, MonthlyConsumption, PowerCoinTransaction } from "./energy-data";

// Interface for serial data messages
export interface SerialDataMessage {
  timestamp: string;
  voltage: number[];
  current: number[];
  powerFactor: number;
  rmsVoltage: number;
  rmsCurrent: number;
  frequency: number;
  theftProbability: number;
  userId: string;
  messageType: 'realtime' | 'monthly' | 'transaction';
  monthlyData?: {
    month: string;
    consumption: number;
    production: number;
  };
  transactionData?: {
    id: string;
    amount: number;
    type: 'billing' | 'credit' | 'purchase';
    status: 'completed' | 'pending' | 'failed';
  };
}

// In-memory storage for received data
class SerialDataStore {
  private static instance: SerialDataStore;
  private realtimeData: Record<string, EnergyMeasurement> = {};
  private monthlyData: Record<string, MonthlyConsumption[]> = {};
  private transactionData: Record<string, PowerCoinTransaction[]> = {};
  private listeners: Array<() => void> = [];

  private constructor() {}

  public static getInstance(): SerialDataStore {
    if (!SerialDataStore.instance) {
      SerialDataStore.instance = new SerialDataStore();
    }
    return SerialDataStore.instance;
  }

  public processMessage(message: SerialDataMessage): void {
    const { messageType, userId } = message;

    if (messageType === 'realtime') {
      this.realtimeData[userId] = {
        timestamp: message.timestamp,
        voltage: message.voltage,
        current: message.current,
        powerFactor: message.powerFactor,
        rmsVoltage: message.rmsVoltage,
        rmsCurrent: message.rmsCurrent,
        frequency: message.frequency,
        theftProbability: message.theftProbability,
        userId
      };
    } else if (messageType === 'monthly' && message.monthlyData) {
      if (!this.monthlyData[userId]) {
        this.monthlyData[userId] = [];
      }
      
      // Check if we already have data for this month
      const existingIndex = this.monthlyData[userId].findIndex(
        item => item.month === message.monthlyData!.month
      );
      
      if (existingIndex >= 0) {
        // Update existing month data
        this.monthlyData[userId][existingIndex] = {
          month: message.monthlyData.month,
          consumption: message.monthlyData.consumption,
          production: message.monthlyData.production,
          userId
        };
      } else {
        // Add new month data
        this.monthlyData[userId].push({
          month: message.monthlyData.month,
          consumption: message.monthlyData.consumption,
          production: message.monthlyData.production,
          userId
        });
      }
    } else if (messageType === 'transaction' && message.transactionData) {
      if (!this.transactionData[userId]) {
        this.transactionData[userId] = [];
      }
      
      this.transactionData[userId].push({
        id: message.transactionData.id,
        timestamp: message.timestamp,
        amount: message.transactionData.amount,
        type: message.transactionData.type,
        status: message.transactionData.status,
        userId
      });
    }
    
    // Notify all listeners that data has changed
    this.notifyListeners();
  }

  public getRealtimeData(userId: string): EnergyMeasurement | null {
    return this.realtimeData[userId] || null;
  }

  public getMonthlyData(userId: string): MonthlyConsumption[] {
    return this.monthlyData[userId] || [];
  }

  public getTransactionData(userId: string): PowerCoinTransaction[] {
    return this.transactionData[userId] || [];
  }
  
  public getAllUserIds(): string[] {
    // Combine all unique user IDs from all data stores
    const userIds = new Set<string>([
      ...Object.keys(this.realtimeData),
      ...Object.keys(this.monthlyData),
      ...Object.keys(this.transactionData)
    ]);
    
    return Array.from(userIds);
  }

  public addListener(callback: () => void): () => void {
    this.listeners.push(callback);
    // Return a function to remove the listener
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback());
  }
}

// Example data for when serial port is not available
const mockSerialMessages: SerialDataMessage[] = [
  {
    timestamp: new Date().toISOString(),
    voltage: Array.from({ length: 100 }, (_, i) => 
      Math.sin(i * 0.1) * 220 + (Math.random() * 5)
    ),
    current: Array.from({ length: 100 }, (_, i) => 
      Math.sin(i * 0.1) * 5 + (Math.random() * 0.5)
    ),
    powerFactor: 0.94,
    rmsVoltage: 223.7,
    rmsCurrent: 4.9,
    frequency: 49.97,
    theftProbability: 0.01,
    userId: 'serial-1',
    messageType: 'realtime'
  },
];

// Simulate monthly data
for (let i = 0; i < 12; i++) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  mockSerialMessages.push({
    timestamp: new Date().toISOString(),
    voltage: [],
    current: [],
    powerFactor: 0,
    rmsVoltage: 0,
    rmsCurrent: 0,
    frequency: 0,
    theftProbability: 0,
    userId: 'serial-1',
    messageType: 'monthly',
    monthlyData: {
      month: months[i],
      consumption: Math.round(300 + Math.random() * 150),
      production: Math.round(Math.random() * 30 * (i >= 4 && i <= 8 ? 2 : 1)) // More production in summer
    }
  });
}

// Simulate transaction data
for (let i = 0; i < 5; i++) {
  const date = new Date();
  date.setDate(date.getDate() - i * 5);
  
  mockSerialMessages.push({
    timestamp: date.toISOString(),
    voltage: [],
    current: [],
    powerFactor: 0,
    rmsVoltage: 0,
    rmsCurrent: 0,
    frequency: 0,
    theftProbability: 0,
    userId: 'serial-1',
    messageType: 'transaction',
    transactionData: {
      id: `tx-serial-${i}`,
      amount: Math.round(50 + Math.random() * 100),
      type: i % 3 === 0 ? 'credit' : 'billing',
      status: Math.random() > 0.1 ? 'completed' : 'pending'
    }
  });
}

// Load mock data to the store
mockSerialMessages.forEach(message => {
  SerialDataStore.getInstance().processMessage(message);
});

export const serialDataStore = SerialDataStore.getInstance();

// Function to simulate receiving serial data
export function simulateSerialData() {
  const store = SerialDataStore.getInstance();
  
  // Update realtime data every 2 seconds
  setInterval(() => {
    const voltage = Array.from({ length: 100 }, (_, i) => 
      Math.sin(i * 0.1) * 220 + (Math.random() * 5)
    );
    const current = Array.from({ length: 100 }, (_, i) => 
      Math.sin(i * 0.1) * 5 + (Math.random() * 0.5)
    );
    
    store.processMessage({
      timestamp: new Date().toISOString(),
      voltage,
      current,
      powerFactor: 0.92 + (Math.random() * 0.05),
      rmsVoltage: 220 + (Math.random() * 8),
      rmsCurrent: 4.5 + (Math.random() * 1),
      frequency: 50 + (Math.random() * 0.1 - 0.05),
      theftProbability: Math.random() * 0.05,
      userId: 'serial-1',
      messageType: 'realtime'
    });
  }, 2000);
} 