"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TaskRow from "./TaskRow";
import { Task } from "@/types/models";
import { createBrowserClient } from "@supabase/ssr";

interface TaskListProps {
  tasks: Task[];
  onDelete: (taskId: string) => Promise<void>;
  onToggleComplete: (taskId: string, completed: boolean) => Promise<void>;
}

const TaskList = ({ tasks, onDelete, onToggleComplete }: TaskListProps) => {
  const [aiSuggestedTaskIds, setAiSuggestedTaskIds] = useState<Set<string>>(new Set());
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchAiSuggestions = async () => {
      if (tasks.length === 0) return;
      
      try {
        const taskIds = tasks.map(t => t.task_id);
        console.log("🔍 Fetching AI suggestions for tasks:", taskIds);
        
        const { data, error } = await supabase
          .from("ai_label_suggestions")
          .select("task_id")
          .in("task_id", taskIds);

        if (!error && data) {
          console.log("✅ AI suggestions found:", data);
          const suggestedIds = new Set(data.map(s => s.task_id));
          console.log("✨ Tasks with AI suggestions:", Array.from(suggestedIds));
          setAiSuggestedTaskIds(suggestedIds);
        } else if (error) {
          console.error("❌ Error fetching AI suggestions:", error);
          console.error("Error details:", error.message, error.code);
        }
      } catch (error) {
        console.error("❌ Exception fetching AI suggestions:", error);
      }
    };

    fetchAiSuggestions();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks]);

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent bg-yellow-50/50 border-b-2 border-yellow-200">
          <TableHead className="w-[50px] py-4 font-bold text-foreground">✓</TableHead>
          <TableHead className="py-4 font-bold text-foreground">Title</TableHead>
          <TableHead className="w-[100px] py-4 font-bold text-foreground">Label</TableHead>
          <TableHead className="w-[120px] py-4 font-bold text-foreground">Due Date</TableHead>
          <TableHead className="w-[100px] text-right py-4 font-bold text-foreground">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TaskRow
            key={task.task_id}
            task={task}
            onDelete={onDelete}
            onToggleComplete={onToggleComplete}
            isAiSuggested={aiSuggestedTaskIds.has(task.task_id)}
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default TaskList;
