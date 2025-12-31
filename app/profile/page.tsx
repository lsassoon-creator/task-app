"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, LogOut, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { createBrowserClient } from "@supabase/ssr";
import { Badge } from "@/components/ui/badge";

interface AILabelSuggestion {
  suggestion_id: string;
  task_id: string;
  original_title: string;
  original_description: string | null;
  suggested_label: string;
  accepted: boolean;
  created_at: string;
}

export default function Profile() {
  const { user, isLoading, signOut } = useAuth();
  const { session } = useAuth();
  const { manageSubscription } = useSubscription();
  const [aiSuggestions, setAiSuggestions] = useState<AILabelSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchAISuggestions = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("ai_label_suggestions")
          .select("*")
          .eq("user_id", user.user_id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) throw error;
        setAiSuggestions(data || []);
      } catch (error) {
        console.error("Error fetching AI suggestions:", error);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    if (user) {
      fetchAISuggestions();
    }
  }, [user, supabase]);

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
      <Card className="border-2 border-gray-200 shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            AI Label Suggestions History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {loadingSuggestions ? (
            <p className="text-muted-foreground">Loading AI suggestions...</p>
          ) : aiSuggestions.length === 0 ? (
            <p className="text-muted-foreground">
              No AI label suggestions yet. Create tasks with labels to see them here!
            </p>
          ) : (
            <div className="space-y-3">
              <p className="font-semibold text-foreground">
                Total AI Suggestions: <span className="font-normal text-muted-foreground">{aiSuggestions.length}</span>
              </p>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {aiSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.suggestion_id}
                    className="p-3 border border-gray-200 rounded-lg bg-gray-50/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        {suggestion.suggested_label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(suggestion.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="font-medium text-foreground text-xs mb-1">
                      {suggestion.original_title}
                    </p>
                    {suggestion.original_description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {suggestion.original_description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
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
