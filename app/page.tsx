"use client"

import { UserCard } from "@/components/dashboard/user-card";
import { SerialUserCard } from "@/components/dashboard/serial-user-card";
import { users } from "@/lib/data/users";
import { useSerialUsers } from "@/lib/hooks/useSerialData";

export default function Home() {
  const serialUserIds = useSerialUsers();
  
  return (
    <main className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Energy Management Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor energy usage, detect theft, and manage PowerCoin transactions
        </p>
      </div>
      
      {/* Real-time meters section */}
      {serialUserIds.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold">Real-time Meters</h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Live Data
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {serialUserIds.map((userId) => (
              <SerialUserCard key={userId} userId={userId} />
            ))}
          </div>
        </section>
      )}
      
      {/* Static user meters section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">User Meters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {users.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      </section>
      
      <section>
        <h2 className="text-xl font-semibold mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <h3 className="text-lg font-medium mb-2">Network Health</h3>
            <div className="text-3xl font-bold text-green-600">98.7%</div>
            <p className="text-sm text-muted-foreground mt-2">
              All meters are online and reporting data normally
            </p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-medium mb-2">Total PowerCoins</h3>
            <div className="text-3xl font-bold text-blue-600">
              {users.reduce((sum, user) => sum + user.powerCoins, 0).toLocaleString()} PC
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Current coins in circulation across all users
            </p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
            <h3 className="text-lg font-medium mb-2">Theft Alerts</h3>
            <div className="text-3xl font-bold text-purple-600">
              {users.filter(user => user.status === 'tampered').length}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Active theft alerts requiring investigation
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
