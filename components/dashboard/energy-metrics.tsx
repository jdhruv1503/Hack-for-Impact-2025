"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPowerValue } from "@/lib/utils/dashboard";

interface EnergyMetricsProps {
  powerFactor: number;
  rmsCurrent: number;
  rmsVoltage: number;
  frequency: number;
}

export function EnergyMetrics({
  powerFactor,
  rmsCurrent,
  rmsVoltage,
  frequency,
}: EnergyMetricsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard 
        title="Power Factor" 
        value={formatPowerValue(powerFactor, "")} 
        description="Current power factor (cos φ)"
        className="bg-blue-50"
        icon={
          <div className="rounded-full bg-blue-100 p-2 w-8 h-8 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 6v6l4 2"></path>
            </svg>
          </div>
        }
      />
      
      <MetricCard 
        title="RMS Current" 
        value={formatPowerValue(rmsCurrent, "A")} 
        description="Root mean square current"
        className="bg-red-50"
        icon={
          <div className="rounded-full bg-red-100 p-2 w-8 h-8 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 20V10"></path>
              <path d="M12 20V4"></path>
              <path d="M6 20v-6"></path>
            </svg>
          </div>
        }
      />
      
      <MetricCard 
        title="RMS Voltage" 
        value={formatPowerValue(rmsVoltage, "V")} 
        description="Root mean square voltage"
        className="bg-yellow-50"
        icon={
          <div className="rounded-full bg-yellow-100 p-2 w-8 h-8 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 8 4 1 1.5-2.9a1 1 0 0 1 1.7-.1L13 13l2-4a1 1 0 0 1 1.7-.1L21 16"></path>
            </svg>
          </div>
        }
      />
      
      <MetricCard 
        title="Frequency" 
        value={formatPowerValue(frequency, "Hz")} 
        description="Current AC frequency"
        className="bg-green-50"
        icon={
          <div className="rounded-full bg-green-100 p-2 w-8 h-8 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12h-8a2 2 0 0 0-2 2v5"></path>
              <polyline points="17 11 21 7 17 3"></polyline>
              <path d="M3 8a2 2 0 0 0 2 2h5"></path>
              <polyline points="7 13 3 17 7 21"></polyline>
            </svg>
          </div>
        }
      />
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  className?: string;
  icon?: React.ReactNode;
}

function MetricCard({ title, value, description, className, icon }: MetricCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
} 