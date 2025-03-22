"use client"

import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TheftAlert } from "@/components/dashboard/theft-alert";
import { WaveformChart } from "@/components/dashboard/waveform-chart";
import { EnergyMetrics } from "@/components/dashboard/energy-metrics";
import { ConsumptionChart } from "@/components/dashboard/consumption-chart";
import { TransactionHistory } from "@/components/dashboard/transaction-history";
import { ConsumptionSummary } from "@/components/dashboard/consumption-summary";
import { users } from "@/lib/data/users";
import { currentMeasurements, monthlyConsumptionData, transactionHistory } from "@/lib/data/energy-data";
import { formatDate } from "@/lib/utils/dashboard";
import { useSerialData } from "@/lib/hooks/useSerialData";
import { Badge } from "@/components/ui/badge";

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  
  // Check if this is a serial data user
  const isSerialUser = userId.startsWith('serial-');
  
  const { realtimeData, monthlyData, transactionData, isLoading } = 
    isSerialUser ? useSerialData(userId) : { realtimeData: null, monthlyData: [], transactionData: [], isLoading: false };
  
  // For regular (non-serial) users, use the static data
  const regularUser = users.find(u => u.id === userId);
  const regularEnergyData = currentMeasurements[userId];
  const regularConsumptionData = monthlyConsumptionData[userId];
  const regularTransactions = transactionHistory[userId];
  
  // Combine data sources based on user type
  const user = isSerialUser 
    ? {
        id: userId,
        name: `Real-time Meter ${userId.split('-')[1] || ''}`,
        email: `meter-${userId}@powercoins.example`,
        address: 'Connected via Serial Port',
        avatar: '',
        status: (realtimeData?.theftProbability || 0) > 0.5 ? 'tampered' : 'active',
        powerCoins: transactionData?.reduce((sum, tx) => {
          const multiplier = tx.type === 'billing' ? -1 : 1;
          return sum + (tx.amount * multiplier);
        }, 1000) || 1000,
        lastUpdated: realtimeData?.timestamp || new Date().toISOString(),
      } as typeof regularUser
    : regularUser;
  
  const energyData = isSerialUser ? realtimeData : regularEnergyData;
  const consumptionData = isSerialUser ? monthlyData : regularConsumptionData;
  const transactions = isSerialUser ? transactionData : regularTransactions;
  
  // Handle loading and not found states
  if (isSerialUser && isLoading) {
    return (
      <main className="container mx-auto py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="sm">Back to Dashboard</Button>
          </Link>
          <h1 className="text-3xl font-bold">Loading...</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-pulse">
          {/* Loading skeleton */}
          <div className="lg:col-span-2 h-80 bg-gray-100 rounded-lg"></div>
          <div className="h-80 bg-gray-100 rounded-lg"></div>
        </div>
      </main>
    );
  }
  
  if (!user || !energyData || (!consumptionData && !isSerialUser) || (!transactions && !isSerialUser)) {
    return (
      <main className="container mx-auto py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="sm">Back to Dashboard</Button>
          </Link>
          <h1 className="text-3xl font-bold">User Not Found</h1>
        </div>
        <p>The requested user data could not be found.</p>
      </main>
    );
  }
  
  return (
    <main className="container mx-auto py-8">
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/">
          <Button variant="outline" size="sm">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
              />
            </svg>
            Back to Dashboard
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">{user.name}'s Energy Data</h1>
          {isSerialUser && (
            <Badge className="bg-blue-500 text-white ml-2">live data</Badge>
          )}
        </div>
      </div>
      
      {/* User Info Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Real-time Waveform Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {energyData && (
              <WaveformChart 
                currentData={energyData.current} 
                voltageData={energyData.voltage} 
              />
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium">Email</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
            <div>
              <div className="text-sm font-medium">Address</div>
              <div className="text-sm text-muted-foreground">{user.address}</div>
            </div>
            <div>
              <div className="text-sm font-medium">Last Updated</div>
              <div className="text-sm text-muted-foreground">{formatDate(user.lastUpdated)}</div>
            </div>
            <div>
              <div className="text-sm font-medium">Meter Status</div>
              <div 
                className={`text-sm font-semibold ${
                  user.status === 'active' ? 'text-green-600' : 
                  user.status === 'inactive' ? 'text-gray-600' : 
                  'text-red-600'
                }`}
              >
                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Energy Metrics */}
      {energyData && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Energy Metrics</h2>
          <EnergyMetrics 
            powerFactor={energyData.powerFactor}
            rmsCurrent={energyData.rmsCurrent}
            rmsVoltage={energyData.rmsVoltage}
            frequency={energyData.frequency}
          />
        </section>
      )}
      
      {/* Theft Alert */}
      {energyData && energyData.theftProbability > 0.1 && (
        <section className="mb-8">
          <TheftAlert user={user} theftProbability={energyData.theftProbability} />
        </section>
      )}
      
      {/* Monthly Consumption */}
      {consumptionData && consumptionData.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Monthly Consumption</h2>
          <Card>
            <CardContent className="pt-6">
              <ConsumptionChart data={consumptionData} />
            </CardContent>
          </Card>
        </section>
      )}
      
      {/* Consumption Summary */}
      {consumptionData && consumptionData.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Consumption Summary</h2>
          <ConsumptionSummary data={consumptionData} />
        </section>
      )}
      
      {/* Transaction History */}
      {transactions && transactions.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">PowerCoin Transaction History</h2>
          <TransactionHistory transactions={transactions} />
        </section>
      )}
    </main>
  );
} 