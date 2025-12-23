"use client";

import { Button } from "@/components/ui/button";
import { CreditCard, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";

export default function Profile() {
  const { user, isLoading, signOut } = useAuth();
  const { session } = useAuth();
  const { manageSubscription } = useSubscription();

  if (isLoading || !user) {
    return <LoadingSkeleton />;
  }
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold mb-8 text-foreground">
        User Profile
      </h1>
      <Card className="border-2 border-gray-200 shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p className="font-semibold text-foreground">Name: <span className="font-normal text-muted-foreground">{user.name}</span></p>
          <p className="font-semibold text-foreground">Email: <span className="font-normal text-muted-foreground">{user.email}</span></p>
        </CardContent>
      </Card>
      <Card className="border-2 border-gray-200 shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="space-y-2">
            <p className="font-semibold text-foreground">Current Plan: <span className="font-normal text-muted-foreground">{user.subscription_plan}</span></p>
            <p className="font-semibold text-foreground">
              Tasks Created: <span className="font-normal text-muted-foreground">{user.tasks_created} / {user.tasks_limit}</span>
            </p>
          </div>
          <Button 
            onClick={() => manageSubscription(session?.access_token)}
            className="bg-yellow-500 hover:bg-yellow-600 text-black shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Manage Subscription
          </Button>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          onClick={signOut}
          className="rounded-lg border-2 border-gray-300 hover:bg-gray-50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
