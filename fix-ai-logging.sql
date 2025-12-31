-- Fix: Update the trigger to only log when label is set during INSERT
-- This ensures we track labels that were set when the task was created
-- The edge function will also log AI suggestions directly

-- The existing trigger should work, but let's make sure it exists
CREATE OR REPLACE FUNCTION log_ai_label_suggestion()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log if label was set and it's a new task
  IF NEW.label IS NOT NULL AND TG_OP = 'INSERT' THEN
    INSERT INTO public.ai_label_suggestions (
      task_id,
      user_id,
      original_title,
      original_description,
      suggested_label,
      accepted
    )
    VALUES (
      NEW.task_id,
      NEW.user_id,
      NEW.title,
      NEW.description,
      NEW.label,
      true
    )
    ON CONFLICT DO NOTHING; -- Prevent duplicate entries
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS log_ai_suggestion_on_task_create ON public.tasks;
CREATE TRIGGER log_ai_suggestion_on_task_create
  AFTER INSERT ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION log_ai_label_suggestion();

