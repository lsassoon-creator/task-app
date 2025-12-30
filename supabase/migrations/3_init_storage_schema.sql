-- First, we need to remove the existing bucket if it exists.
-- This lets us reset the DB without having to manually delete the bucket.
do $$
begin
  if exists (
    select 1 from storage.buckets where id = 'task-attachments'
  ) then
    -- Delete all objects in bucket first
    delete from storage.objects where bucket_id = 'task-attachments';
    -- Then delete bucket
    delete from storage.buckets where id = 'task-attachments';
  end if;
end $$;

-- Create storage bucket with size and MIME type restrictions
insert into storage.buckets (
  id, 
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'task-attachments',
  'task-attachments',
  true,
  1000000, -- 1MB in bytes
  array[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ]
);

-- Security policy: Public can view attachments
drop policy if exists "Public can view attachments" on storage.objects;
create policy "Public can view attachments"
on storage.objects for select
using (bucket_id = 'task-attachments');

-- Security policy: Users can upload their own attachments
drop policy if exists "Users can upload their own attachments" on storage.objects;
create policy "Users can upload their own attachments"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'task-attachments'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Security policy: Users can update their own attachments
drop policy if exists "Users can update their own attachments" on storage.objects;
create policy "Users can update their own attachments"
on storage.objects for update
to authenticated
using (
  bucket_id = 'task-attachments'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'task-attachments'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Security policy: Users can delete their own attachments
drop policy if exists "Users can delete their own attachments" on storage.objects;
create policy "Users can delete their own attachments"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'task-attachments'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Function to delete task storage object
create or replace function delete_task_storage_object()
returns trigger
security definer
set search_path = public
as $$
begin
  -- Only attempt to delete if there was an image
  if old.image_url is not null then
    -- Delete directly from storage.objects table
    delete from storage.objects
    where bucket_id = 'task-attachments'
    and name = old.image_url;
  end if;
  
  return old;
end;
$$ language plpgsql;

-- Trigger to cleanup storage when task is deleted
create trigger cleanup_storage_on_task_delete
  before delete on public.tasks
  for each row
  execute function delete_task_storage_object();

-- Grant necessary permissions
grant delete on storage.objects to authenticated;

-- AI Label Suggestions Tracking Table (Database Migration)
create table if not exists public.ai_label_suggestions (
  suggestion_id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks on delete cascade,
  user_id uuid references public.profiles on delete cascade,
  original_title text,
  original_description text,
  suggested_label text,
  accepted boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Index for faster queries
create index if not exists idx_ai_suggestions_user_id on public.ai_label_suggestions(user_id);
create index if not exists idx_ai_suggestions_task_id on public.ai_label_suggestions(task_id);

-- Security policy: Users can read their own AI suggestions
create policy "Users can read own AI suggestions"
on public.ai_label_suggestions for select
using (auth.uid() = user_id);

-- Enable RLS
alter table public.ai_label_suggestions enable row level security;

-- Function to log AI label suggestions (AI-related)
create or replace function log_ai_label_suggestion()
returns trigger
security definer
set search_path = public
as $$
begin
  -- Only log if label was set and it's a new task
  if NEW.label is not null and TG_OP = 'INSERT' then
    insert into public.ai_label_suggestions (
      task_id,
      user_id,
      original_title,
      original_description,
      suggested_label,
      accepted
    )
    values (
      NEW.task_id,
      NEW.user_id,
      NEW.title,
      NEW.description,
      NEW.label,
      true
    );
  end if;
  
  return NEW;
end;
$$ language plpgsql;

-- Trigger to automatically log AI label suggestions when tasks are created
create trigger log_ai_suggestion_on_task_create
  after insert on public.tasks
  for each row
  execute function log_ai_label_suggestion();

--migration update test