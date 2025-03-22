export interface EnergyMeasurement {
  timestamp: string;
  voltage: number[];       // Time series of voltage values
  current: number[];       // Time series of current values
  powerFactor: number;
  rmsVoltage: number;
  rmsCurrent: number;
  frequency: number;
  theftProbability: number;
  userId: string;
}

export interface MonthlyConsumption {
  month: string;
  consumption: number;     // kWh
  production: number;      // kWh (for users with solar panels)
  userId: string;
}

export interface PowerCoinTransaction {
  id: string;
  timestamp: string;
  amount: number;
  type: 'billing' | 'credit' | 'purchase';
  status: 'completed' | 'pending' | 'failed';
  userId: string;
}

// Generate a synthetic waveform for voltage or current
function generateWaveform(amplitude: number, frequency: number, noiseLevel: number = 0.05, points: number = 100): number[] {
  const result: number[] = [];
  for (let i = 0; i < points; i++) {
    const noise = (Math.random() * 2 - 1) * noiseLevel * amplitude;
    const distortion = i > 80 && i < 90 ? amplitude * 0.2 * Math.sin(i/2) : 0; // Add some distortion in a section
    result.push(amplitude * Math.sin(2 * Math.PI * frequency * i / points) + noise + distortion);
  }
  return result;
}

// Create sample current data for each user
export const currentMeasurements: Record<string, EnergyMeasurement> = {
  '1': {
    timestamp: new Date().toISOString(),
    voltage: generateWaveform(220, 1, 0.02),
    current: generateWaveform(10, 1, 0.1),
    powerFactor: 0.92,
    rmsVoltage: 220.5,
    rmsCurrent: 10.2,
    frequency: 50.01,
    theftProbability: 0.03,
    userId: '1'
  },
  '2': {
    timestamp: new Date().toISOString(),
    voltage: generateWaveform(230, 1, 0.02),
    current: generateWaveform(8, 1, 0.08),
    powerFactor: 0.89,
    rmsVoltage: 231.2,
    rmsCurrent: 7.8,
    frequency: 49.98,
    theftProbability: 0.01,
    userId: '2'
  },
  '3': {
    timestamp: new Date().toISOString(),
    voltage: generateWaveform(225, 1, 0.04),
    current: generateWaveform(12, 1, 0.12),
    powerFactor: 0.95,
    rmsVoltage: 226.1,
    rmsCurrent: 11.9,
    frequency: 50.03,
    theftProbability: 0.02,
    userId: '3'
  },
  '4': {
    timestamp: new Date().toISOString(),
    voltage: generateWaveform(220, 1, 0.15),
    current: generateWaveform(15, 1, 0.3, 100),
    powerFactor: 0.75,
    rmsVoltage: 219.8,
    rmsCurrent: 14.7,
    frequency: 50.22,
    theftProbability: 0.87,
    userId: '4'
  }
};

// Generate monthly consumption data for each user
function generateMonthlyData(userId: string, baseConsumption: number, baseProduction: number = 0): MonthlyConsumption[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((month, i) => {
    // Add seasonal variations
    const seasonalFactor = i >= 5 && i <= 7 ? 1.3 : i >= 11 || i <= 1 ? 1.2 : 1;
    // Add some random variation
    const randomFactor = 0.8 + Math.random() * 0.4;
    
    return {
      month,
      consumption: Math.round(baseConsumption * seasonalFactor * randomFactor * 10) / 10,
      production: Math.round(baseProduction * (1 + i/12) * randomFactor * 10) / 10, // Solar production increases in summer
      userId
    };
  });
}

export const monthlyConsumptionData: Record<string, MonthlyConsumption[]> = {
  '1': generateMonthlyData('1', 350, 120),
  '2': generateMonthlyData('2', 280, 0),
  '3': generateMonthlyData('3', 420, 200),
  '4': generateMonthlyData('4', 380, 0)
};

// Generate transaction history for each user
function generateTransactions(userId: string, count: number, baseAmount: number): PowerCoinTransaction[] {
  const transactions: PowerCoinTransaction[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i * 3 - Math.floor(Math.random() * 3));
    
    const randomFactor = 0.8 + Math.random() * 0.4;
    const amount = Math.round(baseAmount * randomFactor);
    
    transactions.push({
      id: `tx-${userId}-${i}`,
      timestamp: date.toISOString(),
      amount,
      type: i % 5 === 0 ? 'credit' : 'billing',
      status: Math.random() > 0.05 ? 'completed' : 'pending',
      userId
    });
  }
  
  return transactions;
}

export const transactionHistory: Record<string, PowerCoinTransaction[]> = {
  '1': generateTransactions('1', 15, 180),
  '2': generateTransactions('2', 12, 150),
  '3': generateTransactions('3', 18, 220),
  '4': generateTransactions('4', 10, 100)
}; 