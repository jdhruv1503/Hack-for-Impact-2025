"use client"

import Link from 'next/link'
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/lib/data/users";
import { formatDate, formatPowerCoins, getCardVariant, getStatusBadgeColor } from "@/lib/utils/dashboard";

interface UserCardProps {
  user: User;
}

export function UserCard({ user }: UserCardProps) {
  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('');
    
  const statusColor = getStatusBadgeColor(user.status);
  const cardVariant = getCardVariant(user);
  
  return (
    <Link href={`/users/${user.id}`}>
      <Card className={`hover:shadow-md transition-shadow ${cardVariant}`}>
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <CardTitle className="text-lg">{user.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm">
            <div className="font-medium">Address</div>
            <div className="text-muted-foreground">{user.address}</div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-2 border-t">
          <Badge className={statusColor}>{user.status}</Badge>
          <div className="text-sm font-medium">
            {formatPowerCoins(user.powerCoins)}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
} 