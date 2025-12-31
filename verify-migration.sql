-- Run this in Supabase SQL Editor to verify the migration was applied

-- Check if table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'ai_label_suggestions'
) as table_exists;

-- Check if trigger exists
SELECT EXISTS (
   SELECT FROM pg_trigger 
   WHERE tgname = 'log_ai_suggestion_on_task_create'
) as trigger_exists;

-- Check if function exists
SELECT EXISTS (
   SELECT FROM pg_proc 
   WHERE proname = 'log_ai_label_suggestion'
) as function_exists;

-- Check if policy exists
SELECT EXISTS (
   SELECT FROM pg_policies 
   WHERE tablename = 'ai_label_suggestions' 
   AND policyname = 'Users can read own AI suggestions'
) as policy_exists;

-- If all return true, migration is applied correctly!

