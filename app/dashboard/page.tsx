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

  const handleCreateTask = async (title: string, description: string) => {
    await createTask(title, description);
    await refreshTasks();
    console.log(`New Task Created: ${title}`);
    setIsDialogOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent">
          Your Tasks
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full px-6">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
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
        <div className="border-2 border-purple-200/50 rounded-2xl overflow-hidden shadow-lg bg-white/50 backdrop-blur-sm">
          <TaskList
            tasks={tasks}
            onDelete={deleteTask}
            onToggleComplete={toggleTaskComplete}
          />
        </div>
      ) : (
        <div className="border-2 border-purple-200/50 rounded-2xl p-12 text-center bg-gradient-to-br from-purple-50/50 to-pink-50/50 backdrop-blur-sm">
          <ClipboardList className="mx-auto h-12 w-12 text-purple-400 mb-4" />
          <p className="text-purple-600 font-medium text-lg">Create a Task to get started.</p>
        </div>
      )}
    </div>
  );
}
