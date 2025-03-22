"use client"

import { useEffect, useState } from 'react';
import { serialDataStore, simulateSerialData } from '@/lib/data/serial-data';
import { EnergyMeasurement, MonthlyConsumption, PowerCoinTransaction } from '../data/energy-data';

// Initialize simulation once when the hook is first used
let simulationStarted = false;

export function useSerialData(userId: string) {
  const [realtimeData, setRealtimeData] = useState<EnergyMeasurement | null>(
    serialDataStore.getRealtimeData(userId)
  );
  
  const [monthlyData, setMonthlyData] = useState<MonthlyConsumption[]>(
    serialDataStore.getMonthlyData(userId)
  );
  
  const [transactionData, setTransactionData] = useState<PowerCoinTransaction[]>(
    serialDataStore.getTransactionData(userId)
  );

  useEffect(() => {
    // Start the simulation if it hasn't been started yet
    if (!simulationStarted) {
      simulationStarted = true;
      simulateSerialData();
    }
    
    // Set up a listener for data changes
    const unsubscribe = serialDataStore.addListener(() => {
      setRealtimeData(serialDataStore.getRealtimeData(userId));
      setMonthlyData(serialDataStore.getMonthlyData(userId));
      setTransactionData(serialDataStore.getTransactionData(userId));
    });
    
    // Clean up the listener on unmount
    return unsubscribe;
  }, [userId]);

  return {
    realtimeData,
    monthlyData, 
    transactionData,
    isLoading: !realtimeData && monthlyData.length === 0 && transactionData.length === 0
  };
}

export function useSerialUsers() {
  const [userIds, setUserIds] = useState<string[]>([]);
  
  useEffect(() => {
    // Start the simulation if it hasn't been started yet
    if (!simulationStarted) {
      simulationStarted = true;
      simulateSerialData();
    }
    
    // Set initial user IDs
    setUserIds(serialDataStore.getAllUserIds());
    
    // Listen for changes
    const unsubscribe = serialDataStore.addListener(() => {
      setUserIds(serialDataStore.getAllUserIds());
    });
    
    return unsubscribe;
  }, []);
  
  return userIds;
} 