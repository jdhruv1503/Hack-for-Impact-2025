"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User } from "@/lib/data/users";
import { getAlertColor, getAlertLevel } from "@/lib/utils/dashboard";

interface TheftAlertProps {
  user: User;
  theftProbability: number;
}

export function TheftAlert({ user, theftProbability }: TheftAlertProps) {
  const alertLevel = getAlertLevel(theftProbability);
  const alertColor = getAlertColor(alertLevel);
  
  // Format probability as percentage
  const theftProbabilityPercentage = Math.round(theftProbability * 100);
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Alert className={`cursor-pointer ${alertColor}`}>
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <AlertTitle>Theft Alert</AlertTitle>
          </div>
          <AlertDescription className="flex justify-between items-center">
            <span>Potential power theft detected for {user.name}</span>
            <Badge 
              variant="outline" 
              className={`
                ${alertLevel === 'high' ? 'bg-red-500 text-white' : ''}
                ${alertLevel === 'medium' ? 'bg-yellow-500 text-white' : ''}
                ${alertLevel === 'low' ? 'bg-green-500 text-white' : ''}
              `}
            >
              {theftProbabilityPercentage}% probability
            </Badge>
          </AlertDescription>
        </Alert>
      </DialogTrigger>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Potential Power Theft Alert</DialogTitle>
          <DialogDescription>
            Our system has detected anomalies that may indicate power theft
            for user {user.name}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <h4 className="font-medium mb-2">Detection details:</h4>
            <ul className="list-disc pl-5 space-y-2">
              <li>Theft probability: <span className="font-semibold">{theftProbabilityPercentage}%</span></li>
              <li>Unusual consumption patterns detected</li>
              <li>Waveform irregularities identified</li>
              <li>Meter tampering signals present</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Recommended actions:</h4>
            <ul className="list-disc pl-5 space-y-2">
              <li>Schedule on-site inspection</li>
              <li>Temporary increase of monitoring frequency</li>
              <li>Compare with historical usage patterns</li>
              {theftProbabilityPercentage > 70 && (
                <li className="text-red-500 font-medium">Consider immediate meter lockdown</li>
              )}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 