import { User } from "../data/users";
import { EnergyMeasurement, MonthlyConsumption, PowerCoinTransaction } from "../data/energy-data";

export function getStatusBadgeColor(status: User['status']) {
  switch (status) {
    case 'active':
      return 'bg-green-500';
    case 'inactive':
      return 'bg-gray-500';
    case 'tampered':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

export function formatPowerCoins(coins: number) {
  return `${coins.toLocaleString()} PC`;
}

export function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(date);
}

export function formatPowerValue(value: number, unit: string) {
  return `${value.toFixed(2)} ${unit}`;
}

export function getTotalConsumption(data: MonthlyConsumption[]) {
  return data.reduce((sum, item) => sum + item.consumption, 0);
}

export function getTotalProduction(data: MonthlyConsumption[]) {
  return data.reduce((sum, item) => sum + item.production, 0);
}

export function getAlertLevel(theftProbability: number) {
  if (theftProbability < 0.1) return 'low';
  if (theftProbability < 0.5) return 'medium';
  return 'high';
}

export function getAlertColor(level: string) {
  switch (level) {
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function getCardVariant(user: User) {
  if (user.status === 'tampered') {
    return 'bg-red-50 border-red-200 shadow-red-100';
  }
  return '';
} 