"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MonthlyConsumption } from "@/lib/data/energy-data";
import { getTotalConsumption, getTotalProduction } from "@/lib/utils/dashboard";
import { cn } from "@/lib/utils";

interface ConsumptionSummaryProps {
  data: MonthlyConsumption[];
}

export function ConsumptionSummary({ data }: ConsumptionSummaryProps) {
  const totalConsumption = getTotalConsumption(data);
  const totalProduction = getTotalProduction(data);
  
  // Calculate self-sufficiency percentage
  const selfSufficiencyPercentage = 
    totalConsumption > 0 
      ? Math.min(Math.round((totalProduction / totalConsumption) * 100), 100)
      : 0;
  
  // Calculate carbon offset (rough estimate: 0.5 kg CO2 per kWh of renewable)
  const carbonOffset = Math.round(totalProduction * 0.5);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Energy Consumption</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Total Consumption</span>
              <span className="font-medium">{totalConsumption.toFixed(2)} kWh</span>
            </div>
            <Progress 
              value={100} 
              className={cn("h-2 bg-red-100")} 
            />
            <div className="h-1 w-full bg-red-500 mt-[-8px] rounded-full"></div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Production Offset</span>
              <span className="font-medium">{totalProduction.toFixed(2)} kWh</span>
            </div>
            <Progress 
              value={selfSufficiencyPercentage} 
              className={cn("h-2 bg-green-100")} 
            />
            <div className="h-1 w-full bg-green-500 mt-[-8px] rounded-full" style={{ width: `${selfSufficiencyPercentage}%` }}></div>
          </div>
          
          <div className="pt-2 border-t">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Energy Self-Sufficiency</span>
              <span className="text-sm font-bold">{selfSufficiencyPercentage}%</span>
            </div>
            
            <div className="text-xs text-muted-foreground">
              {selfSufficiencyPercentage < 30 
                ? "Low self-sufficiency. Consider adding more renewable sources."
                : selfSufficiencyPercentage < 70
                ? "Moderate self-sufficiency. Good renewable contribution."
                : "High self-sufficiency. Excellent renewable utilization!"
              }
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Environmental Impact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 rounded-full p-3">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 text-green-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" 
                />
              </svg>
            </div>
            <div>
              <div className="text-lg font-semibold">{carbonOffset} kg</div>
              <div className="text-sm text-muted-foreground">CO₂ emissions prevented</div>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground pt-2 border-t">
            Equivalent to planting approximately {Math.round(carbonOffset / 20)} trees
            or not driving a car for {Math.round(carbonOffset / 2.3)} miles.
          </div>
          
          <div className="pt-2 border-t">
            <div className="text-sm font-medium mb-1">PowerCoins Earned from Production</div>
            <div className="text-xl font-bold">{Math.round(totalProduction * 1.5)} PC</div>
            <div className="text-xs text-muted-foreground">
              Based on current conversion rate of 1.5 PC per kWh produced
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 