"use client"

import { PowerCoinTransaction } from "@/lib/data/energy-data";
import { formatDate, formatPowerCoins } from "@/lib/utils/dashboard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface TransactionHistoryProps {
  transactions: PowerCoinTransaction[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  // Sort transactions by timestamp (most recent first)
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Transaction ID</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTransactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">
                {formatDate(transaction.timestamp)}
              </TableCell>
              <TableCell className="font-mono text-xs">
                {transaction.id}
              </TableCell>
              <TableCell>
                <Badge 
                  variant="outline" 
                  className={
                    transaction.type === 'billing' 
                      ? 'bg-red-50 text-red-700 border-red-200' 
                      : 'bg-green-50 text-green-700 border-green-200'
                  }
                >
                  {transaction.type}
                </Badge>
              </TableCell>
              <TableCell className={`text-right ${transaction.type === 'billing' ? 'text-red-600' : 'text-green-600'}`}>
                {transaction.type === 'billing' ? '-' : '+'}{formatPowerCoins(transaction.amount)}
              </TableCell>
              <TableCell>
                <Badge 
                  variant="outline"
                  className={`
                    ${transaction.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                    ${transaction.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : ''}
                    ${transaction.status === 'failed' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                  `}
                >
                  {transaction.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 