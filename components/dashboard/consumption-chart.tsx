"use client"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { MonthlyConsumption } from '@/lib/data/energy-data';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ConsumptionChartProps {
  data: MonthlyConsumption[];
}

export function ConsumptionChart({ data }: ConsumptionChartProps) {
  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Monthly Energy Consumption & Production',
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'kWh',
        }
      }
    }
  };

  const chartData = {
    labels: data.map(item => item.month),
    datasets: [
      {
        label: 'Consumption (kWh)',
        data: data.map(item => item.consumption),
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        borderWidth: 0,
      },
      {
        label: 'Production (kWh)',
        data: data.map(item => item.production),
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderWidth: 0,
      }
    ],
  };

  return (
    <div className="w-full h-[400px]">
      <Bar options={options} data={chartData} />
    </div>
  );
} 