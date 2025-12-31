// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import OpenAI from "npm:openai";

// Load environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { title, description, completed, label, due_date } = await req.json();

    console.log("🔄 Creating task with AI suggestions...");
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Initialize Supabase client
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Get user session
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    if (!user) throw new Error("No user found");

    // Determine the label to use
    let finalLabel = label;
    let isAiSuggested = false;
    
    // If no label provided, use AI to suggest one
    if (!finalLabel && OPENAI_API_KEY) {
      // Initialize OpenAI
      const openai = new OpenAI({
        apiKey: OPENAI_API_KEY,
      });

      // Get label suggestion from OpenAI
      const prompt = `Based on this task title: "${title}" and description: "${description || ""}", suggest ONE of these labels: work, personal, priority, shopping, home. Reply with just the label word and nothing else.`;

      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-4o-mini",
        temperature: 0.3,
        max_tokens: 16,
      });

      const suggestedLabel = completion.choices[0].message.content
        ?.toLowerCase()
        .trim();

      console.log(`✨ AI Suggested Label: ${suggestedLabel}`);

      // Validate the label
      const validLabels = ["work", "personal", "priority", "shopping", "home"];
      finalLabel = validLabels.includes(suggestedLabel) ? suggestedLabel : null;
      isAiSuggested = finalLabel !== null;
    }

    // Create the task with all fields
    const { data, error } = await supabaseClient
      .from("tasks")
      .insert({
        title,
        description: description || null,
        completed: completed || false,
        label: finalLabel,
        due_date: due_date || null,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    // If AI suggested the label, log it to ai_label_suggestions table
    if (isAiSuggested && data) {
      try {
        await supabaseClient
          .from("ai_label_suggestions")
          .insert({
            task_id: data.task_id,
            user_id: user.id,
            original_title: title,
            original_description: description || null,
            suggested_label: finalLabel,
            accepted: true,
          });
        console.log(`✅ Logged AI suggestion for task ${data.task_id}`);
      } catch (suggestionError) {
        // Don't fail the task creation if logging fails
        console.error("Failed to log AI suggestion:", suggestionError);
      }
    }

    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error in create-task-with-ai:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
