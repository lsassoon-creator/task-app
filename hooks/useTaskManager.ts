import { useState, useEffect } from "react";
import { Task } from "@/types/models";
import { createBrowserClient } from '@supabase/ssr'
import {
  TaskState,
  TasksState,
  TaskOperations,
  TasksOperations,
} from "@/types/taskManager";

const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const FUNCTION_ENDPOINT = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-task-with-ai`;

interface UseTaskManagerReturn
  extends TaskState,
    TasksState,
    TaskOperations,
    TasksOperations {}

export function useTaskManager(taskId?: string): UseTaskManagerReturn {
  // State for single task management
  const [task, setTask] = useState<Task | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);

  // State for task list management
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Log Supabase client initialization
  console.log("🔧 Supabase client initialized:", {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  });

  // Fetch single task
  useEffect(() => {
    if (!taskId) return;

    const fetchTask = async () => {
      console.log("📥 Fetching task with ID:", taskId);
      try {
        const { data: task, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("task_id", taskId)
          .single();

        if (error) {
          console.error("❌ Error fetching task:", error);
          throw error;
        }
        console.log("✅ Task fetched successfully:", {
          task_id: task.task_id,
          user_id: task.user_id,
          image_url: task.image_url,
          title: task.title
        });
        setTask(task);
        setDate(task.due_date ? new Date(task.due_date) : undefined);
      } catch (error: any) {
        console.error(`❌ Error fetching task ID ${taskId}:`, error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  // Fetch all tasks
  useEffect(() => {
    if (taskId) return; // Don't fetch all tasks if we're managing a single task
    fetchTasks();
  }, []);

  // Single task operations
  const updateTask = (updates: Partial<Task>) => {
    setTask((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const saveTask = async (taskToSave?: Task) => {
    try {
      const taskData = taskToSave || task;
      if (!taskData) throw new Error("No task data to save");

      const { error } = await supabase
        .from("tasks")
        .update({
          ...taskData,
          due_date: date?.toISOString().split("T")[0],
          updated_at: new Date().toISOString(),
        })
        .eq("task_id", taskData.task_id);

      if (error) throw error;
    } catch (error: any) {
      console.error("Error saving task:", error);
      setError(error.message);
      throw error;
    }
  };

  const uploadImage = async (file: File) => {
    console.log("=== UPLOAD IMAGE START ===");
    console.log("File details:", {
      name: file.name,
      size: file.size,
      type: file.type,
      sizeInMB: (file.size / (1024 * 1024)).toFixed(2) + "MB"
    });

    try {
      if (file.size > MAX_FILE_SIZE) {
        console.error("❌ File too large:", file.size, "bytes (max:", MAX_FILE_SIZE, ")");
        throw new Error("File size must be less than 1MB");
      }

      if (!task) {
        console.error("❌ No task found");
        throw new Error("No task found");
      }

      console.log("Task details:", {
        task_id: task.task_id,
        user_id: task.user_id,
        current_image_url: task.image_url
      });

      const fileExt = file.name.split(".").pop();
      const fileName = `${task.user_id}/${task.task_id}.${fileExt}`;
      console.log("📤 Preparing to upload to:", fileName);
      console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log("Bucket: task-attachments");

      // First, check if the bucket exists by trying to list it
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      console.log("Available buckets:", buckets?.map(b => b.id));
      if (bucketError) {
        console.error("❌ Error listing buckets:", bucketError);
      }
      const bucketExists = buckets?.some(b => b.id === 'task-attachments');
      console.log("Bucket 'task-attachments' exists:", bucketExists);
      if (!bucketExists) {
        throw new Error("Storage bucket 'task-attachments' does not exist. Please run the migration to create it.");
      }

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("task-attachments")
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type,
          duplex: "half",
          headers: {
            "content-length": file.size.toString(),
          },
        });

      console.log("Upload response:", {
        data: uploadData,
        error: uploadError
      });

      if (uploadError) {
        console.error("❌ Upload error details:", {
          message: uploadError.message,
          statusCode: uploadError.statusCode,
          error: uploadError.error,
          name: uploadError.name
        });
        throw uploadError;
      }

      console.log("✅ Upload successful! Upload data:", uploadData);

      // Verify the file was uploaded by getting its public URL
      console.log("🔗 Getting public URL for:", fileName);
      const { data: urlData } = supabase.storage
        .from("task-attachments")
        .getPublicUrl(fileName);

      console.log("Public URL data:", urlData);
      console.log("Public URL:", urlData.publicUrl);

      const updatedTask = { ...task, image_url: fileName };
      console.log("💾 Saving task with image_url:", fileName);
      setTask(updatedTask);
      await saveTask(updatedTask);
      console.log("✅ Task saved successfully");
      console.log("=== UPLOAD IMAGE END ===");
    } catch (error: any) {
      console.error("❌ Error uploading image - Full error object:", error);
      console.error("Error message:", error?.message);
      console.error("Error statusCode:", error?.statusCode);
      console.error("Error error:", error?.error);
      console.error("Error name:", error?.name);
      console.error("Error stack:", error?.stack);
      console.error("Full error JSON:", JSON.stringify(error, null, 2));
      const errorMessage = error?.message || error?.error || JSON.stringify(error) || "Unknown error";
      setError(errorMessage);
      throw error;
    }
  };

  const removeImage = async () => {
    try {
      if (!task?.image_url) throw new Error("No image to remove");

      const fileName = task.image_url;
      const { error: storageError } = await supabase.storage
        .from("task-attachments")
        .remove([fileName]);

      if (storageError) throw storageError;

      const updatedTask = { ...task, image_url: null };
      setTask(updatedTask);
      await saveTask(updatedTask);
    } catch (error: any) {
      console.error("Error removing image:", error);
      setError(error.message);
      throw error;
    }
  };

  // Task list operations
  const fetchTasks = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", session!.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks(data || []);
      setError(null);
    } catch (error: any) {
      console.error("Error fetching tasks:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createTask = async (title: string, description: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(FUNCTION_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session!.access_token}`,
        },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create task");
      }

      const taskData = await response.json();
      if (!taskData) throw new Error("No data returned from server");

      setTasks([taskData, ...tasks]);
      setError(null);
      return taskData;
    } catch (error: any) {
      console.error("Error creating task:", error);
      setError(error.message);
      throw error;
    }
  };

  const deleteTask = async (taskIdToDelete: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("task_id", taskIdToDelete);

      if (error) throw error;
      setTasks(tasks.filter((t) => t.task_id !== taskIdToDelete));
      setError(null);
    } catch (error: any) {
      console.error("Error deleting task:", error);
      setError(error.message);
      throw error;
    }
  };

  const toggleTaskComplete = async (
    taskIdToToggle: string,
    completed: boolean
  ) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ completed })
        .eq("task_id", taskIdToToggle);

      if (error) throw error;
      setTasks(
        tasks.map((t) =>
          t.task_id === taskIdToToggle ? { ...t, completed } : t
        )
      );
      setError(null);
    } catch (error: any) {
      console.error("Error updating task:", error);
      setError(error.message);
      throw error;
    }
  };

  const refreshTasks = async () => {
    setIsLoading(true);
    await fetchTasks();
  };

  return {
    // State
    task,
    tasks,
    date,
    error,
    isLoading,

    // Single task operations
    setDate,
    updateTask,
    saveTask,
    uploadImage,
    removeImage,

    // Task list operations
    createTask,
    deleteTask,
    toggleTaskComplete,
    refreshTasks,
  };
}
