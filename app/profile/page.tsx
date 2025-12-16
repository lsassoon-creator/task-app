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
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent">
        User Profile
      </h1>
      <Card className="border-2 border-purple-200/50 shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p className="font-semibold text-foreground">Name: <span className="font-normal text-muted-foreground">{user.name}</span></p>
          <p className="font-semibold text-foreground">Email: <span className="font-normal text-muted-foreground">{user.email}</span></p>
        </CardContent>
      </Card>
      <Card className="border-2 border-purple-200/50 shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
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
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full"
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
          className="rounded-full border-2 hover:bg-purple-50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
