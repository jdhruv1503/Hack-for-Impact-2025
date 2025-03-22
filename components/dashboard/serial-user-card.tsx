"use client"

import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate, formatPowerCoins } from "@/lib/utils/dashboard";
import { useSerialData } from '@/lib/hooks/useSerialData';

interface SerialUserCardProps {
  userId: string;
}

export function SerialUserCard({ userId }: SerialUserCardProps) {
  const { realtimeData, transactionData, isLoading } = useSerialData(userId);
  
  if (isLoading) {
    return (
      <Card className="hover:shadow-md transition-shadow animate-pulse">
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <div className="h-12 w-12 rounded-full bg-gray-200"></div>
          <div className="flex flex-col space-y-2">
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
            <div className="h-3 w-32 bg-gray-200 rounded"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-3 w-20 bg-gray-200 rounded"></div>
            <div className="h-3 w-40 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-2 border-t">
          <div className="h-5 w-16 bg-gray-200 rounded"></div>
          <div className="h-5 w-20 bg-gray-200 rounded"></div>
        </CardFooter>
      </Card>
    );
  }
  
  // Generate a friendly name for the serial user
  const userName = `Real-time Meter ${userId.split('-')[1] || ''}`;
  const userEmail = `meter-${userId}@powercoins.example`;
  const initials = 'RM'; // Real-time Meter initials
  
  // Determine theft probability and status
  const theftProbability = realtimeData?.theftProbability || 0;
  const status = theftProbability > 0.5 ? 'tampered' : 'active';
  const statusColor = status === 'active' ? 'bg-green-500' : 'bg-red-500';
  
  // Calculate total PowerCoins (sum of all transactions)
  const totalPowerCoins = transactionData
    ? transactionData.reduce((sum, tx) => {
        const multiplier = tx.type === 'billing' ? -1 : 1;
        return sum + (tx.amount * multiplier);
      }, 1000) // Start with base amount of 1000
    : 1000;
  
  return (
    <Link href={`/users/${userId}`}>
      <Card className={`hover:shadow-md transition-shadow ${status === 'tampered' ? 'bg-red-50 border-red-200 shadow-red-100' : ''}`}>
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <Avatar className="h-12 w-12 bg-blue-100">
            <AvatarImage src="" alt={userName} />
            <AvatarFallback className="bg-blue-100 text-blue-600">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{userName}</CardTitle>
              <Badge className="bg-blue-500 text-white">live</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{userEmail}</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm">
            <div className="font-medium">Real-time Readings</div>
            <div className="text-muted-foreground">
              {realtimeData 
                ? `${realtimeData.rmsVoltage.toFixed(1)}V / ${realtimeData.rmsCurrent.toFixed(1)}A` 
                : 'No data available'}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-2 border-t">
          <Badge className={statusColor}>{status}</Badge>
          <div className="text-sm font-medium">
            {formatPowerCoins(totalPowerCoins)}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
} 