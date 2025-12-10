-- Add due date to tasks
alter table public.tasks
add column if not exists due_date timestamptz;

-- Add toggle for calendar sync
alter table public.tasks
add column if not exists sync_to_calendar boolean default false;

-- Table to store external calendar event IDs
create table if not exists public.task_calendar_events (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks(task_id) on delete cascade,
  calendar_event_id text,
  provider text default 'google',
  created_at timestamptz default now()
);

-- RLS
alter table public.task_calendar_events enable row level security;

create policy "Users can access own calendar events"
on public.task_calendar_events
for all
using (
  auth.uid() = (select user_id from public.tasks where task_id = task_calendar_events.task_id)
);
