"use client";

import { useState } from "react";
import { useTaskManager } from "@/hooks/useTaskManager";
import { Button } from "@/components/ui/button";
import TaskList from "@/components/TaskList";
import { CreateTaskForm } from "@/components/CreateTaskForm";
import { PlusCircle, ClipboardList } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Dashboard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { createTask, refreshTasks, tasks, deleteTask, toggleTaskComplete } =
    useTaskManager();

  const handleCreateTask = async (taskData: {
    title: string;
    description: string;
    completed: boolean;
    label: string | null;
    due_date: Date | undefined;
  }) => {
    await createTask(
      taskData.title,
      taskData.description,
      taskData.completed,
      taskData.label,
      taskData.due_date
    );
    await refreshTasks();
    console.log(`New Task Created: ${taskData.title}`);
    setIsDialogOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-foreground">
          Your Tasks
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg px-6">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl text-foreground">
                Create New Task
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Enter the details for your new task below.
              </DialogDescription>
            </DialogHeader>
            <CreateTaskForm onSubmit={handleCreateTask} />
          </DialogContent>
        </Dialog>
      </div>
      {tasks.length > 0 ? (
        <div className="border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg bg-white/50 backdrop-blur-sm">
          <TaskList
            tasks={tasks}
            onDelete={deleteTask}
            onToggleComplete={toggleTaskComplete}
          />
        </div>
      ) : (
        <div className="border-2 border-gray-200 rounded-2xl p-12 text-center bg-yellow-50/50 backdrop-blur-sm">
          <ClipboardList className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <p className="text-foreground font-medium text-lg">Create a Task to get started.</p>
        </div>
      )}
    </div>
  );
}
