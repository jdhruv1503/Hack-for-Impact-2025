"use client"

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface WaveformChartProps {
  currentData: number[];
  voltageData: number[];
}

export function WaveformChart({ currentData, voltageData }: WaveformChartProps) {
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    // Generate time labels for x-axis
    const newLabels = Array.from({ length: Math.max(currentData.length, voltageData.length) }, 
      (_, i) => `${i}`);
    setLabels(newLabels);
  }, [currentData, voltageData]);

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time',
        },
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 10,
          display: false,
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Amplitude',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Current & Voltage Waveforms',
      },
    },
    animation: {
      duration: 0, // Disable animation for faster rendering
    },
    elements: {
      point: {
        radius: 0, // Hide points for cleaner waveform display
      },
      line: {
        tension: 0.4, // Add some smoothing
      },
    },
  };

  const data = {
    labels,
    datasets: [
      {
        label: 'Current (A)',
        data: currentData,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        fill: false,
        yAxisID: 'y',
      },
      {
        label: 'Voltage (V)',
        data: voltageData,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        fill: false,
        yAxisID: 'y',
      },
    ],
  };

  return (
    <div className="w-full h-[300px]">
      <Line options={options} data={data} />
    </div>
  );
} 