"use client";

import { Suspense, useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Save,
  Upload,
  CalendarIcon,
  ArrowLeft,
  Trash2,
  AlertOctagon,
} from "lucide-react";
import { labels } from "@/lib/labels";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { useTaskManager } from "@/hooks/useTaskManager";
import { Task } from "@/types/models";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/hooks/use-toast";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { createBrowserClient } from '@supabase/ssr';

function TaskForm() {
  console.log("🚀 TaskForm component rendered");
  const params = useSearchParams();
  const taskId = params.get("id")!;
  console.log("Task ID from params:", taskId);
  const {
    task,
    date,
    setDate,
    updateTask,
    saveTask,
    uploadImage,
    removeImage,
    error,
  } = useTaskManager(taskId);
  const { session } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  // Create supabase client once for URL generation
  const supabase = useMemo(() => {
    console.log("🔧 Creating Supabase client in TaskForm component");
    console.log("Environment check:", {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    });
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }, []);

  const handleImageUpload = async (acceptedFiles: File[]) => {
    console.log("=== HANDLE IMAGE UPLOAD START ===");
    console.log("Accepted files:", acceptedFiles);
    const file = acceptedFiles[0];
    if (!file) {
      console.log("❌ No file provided");
      return;
    }

    try {
      console.log("🔄 Setting uploading state to true");
      setUploading(true);
      console.log("📤 Calling uploadImage function...");
      await uploadImage(file);
      console.log("✅ Upload completed successfully in handleImageUpload");
      toast({
        title: "✅ Image Uploaded",
        description: "Image uploaded successfully",
      });
    } catch (error: any) {
      console.error("❌ Error in handleImageUpload:", error);
      console.error("Error type:", typeof error);
      console.error("Error keys:", Object.keys(error || {}));
      console.error("Full error object:", JSON.stringify(error, null, 2));
      console.error("Error message:", error?.message);
      console.error("Error error:", error?.error);
      console.error("Error name:", error?.name);
      console.error("Error stack:", error?.stack);
      toast({
        title: "❌ Upload Failed",
        description: error?.message || error?.error || JSON.stringify(error) || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      console.log("🔄 Setting uploading state to false");
      setUploading(false);
      console.log("=== HANDLE IMAGE UPLOAD END ===");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => {
      console.log("🎯 Dropzone onDrop triggered with files:", files);
      handleImageUpload(files);
    },
    accept: {
      "image/jpeg": [],
      "image/png": [],
    },
    maxFiles: 1,
  });
  
  console.log("Dropzone configured, getRootProps:", typeof getRootProps);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveTask();
      toast({
        title: "✅ Task Updated",
        description: "Task updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const handleRemoveImage = async () => {
    try {
      await removeImage();
      toast({
        title: "✅ Image Removed",
        description: "Image removed successfully",
      });
    } catch (error: any) {
      toast({
        title: "❌ Remove Failed",
        description: error.message || "Failed to remove image",
        variant: "destructive",
      });
    }
  };

  const renderImageDisplay = () => {
    console.log("=== RENDER IMAGE DISPLAY ===");
    console.log("Task image_url:", task!.image_url);
    console.log("Supabase client:", supabase ? "exists" : "missing");
    
    // Check if image_url exists before calling getPublicUrl
    if (!task?.image_url) {
      return null;
    }
    
    // Use Supabase's getPublicUrl method for proper URL construction
    const { data: urlData } = supabase.storage
      .from("task-attachments")
      .getPublicUrl(task.image_url);
    
    console.log("URL data from getPublicUrl:", urlData);
    console.log("Final image URL:", urlData.publicUrl);
    console.log("=== RENDER IMAGE DISPLAY END ===");
    
    return (
      <div className="space-y-3">
        <div className="relative w-full aspect-square max-w-full rounded-xl overflow-hidden shadow-lg border-2 border-yellow-200 bg-yellow-50">
          <Image
            src={urlData.publicUrl}
            alt="Task attachment"
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover"
            onError={(e) => {
              console.error("❌ Image load error:", e);
              console.error("Failed URL:", urlData.publicUrl);
            }}
            onLoad={() => {
              console.log("✅ Image loaded successfully:", urlData.publicUrl);
            }}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleRemoveImage}
          className="w-full rounded-lg border-2 border-gray-300 hover:bg-gray-100 hover:border-gray-400"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Remove Image
        </Button>
      </div>
    );
  };

  const renderImageUpload = () => {
    return (
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300",
          isDragActive 
            ? "border-yellow-500 bg-yellow-50/50 scale-105" 
            : "border-yellow-200 hover:border-yellow-400 hover:bg-yellow-50/30"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="w-10 h-10 mx-auto mb-3 text-yellow-500" />
        {isDragActive ? (
          <p className="text-sm font-semibold text-yellow-700">Drop the image here...</p>
        ) : (
          <div className="space-y-1">
            <p className="text-sm font-medium text-yellow-700">
              Drag and drop an image here, or click to select
            </p>
            <p className="text-xs text-muted-foreground">Supports: JPEG, PNG</p>
          </div>
        )}
      </div>
    );
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertOctagon className="mx-auto h-8 w-8 text-gray-500 mb-2" />
        <div className="text-gray-700 text-sm">{error}</div>
      </div>
    );
  }

  if (!task) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 text-foreground">
        Task Details
      </h1>
      <form onSubmit={handleSubmit}>
        <div className="max-w-2xl mx-auto">
          <div className="space-y-6">
            {/* Title */}
            <div className="grid w-full items-center gap-2">
              <Label className="text-base font-semibold text-foreground">Title</Label>
              <Input
                value={task.title || ""}
                onChange={(e) => updateTask({ title: e.target.value })}
                className="text-lg font-medium"
                placeholder="Task title"
              />
            </div>

            {/* Description */}
            <div className="grid w-full items-start gap-2">
              <Label className="text-base font-semibold text-foreground">Description</Label>
              <Textarea
                value={task.description || ""}
                onChange={(e) => updateTask({ description: e.target.value })}
                className="min-h-[200px] text-base leading-relaxed resize-none"
                placeholder="Write your task description here..."
              />
            </div>

            {/* Completed Checkbox */}
            <div className="flex items-center space-x-3 p-4 rounded-xl border-2 border-yellow-200/50 bg-yellow-50/30">
              <Checkbox
                checked={task.completed || false}
                onCheckedChange={(checked) =>
                  updateTask({ completed: checked as boolean })
                }
                className="h-6 w-6"
              />
              <Label className="text-base font-semibold cursor-pointer">
                Mark as Completed
              </Label>
            </div>

            {/* Label */}
            <div className="grid w-full items-center gap-2">
              <Label className="text-base font-semibold text-foreground">Label</Label>
              <Select
                value={task.label || ""}
                onValueChange={(value) =>
                  updateTask({ label: value as Task["label"] })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a label" />
                </SelectTrigger>
                <SelectContent>
                  {labels.map((label) => (
                    <SelectItem key={label.value} value={label.value}>
                      {label.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div className="grid w-full items-center gap-2">
              <Label className="text-base font-semibold text-foreground">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal h-12",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-5 w-5" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Attach Image */}
            <div className="grid w-full items-center gap-2">
              <Label className="text-base font-semibold text-foreground">Attach Image</Label>
              <div className="space-y-2">
                {task.image_url ? renderImageDisplay() : renderImageUpload()}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3 pt-4">
              <Button 
                type="submit" 
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg h-12 text-base font-semibold"
              >
                <Save className="mr-2 h-5 w-5" />
                Save Changes
              </Button>
              <Link href="/dashboard" className="w-full">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full rounded-lg border-2 border-gray-300 hover:border-gray-400 h-12 text-base font-semibold"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function TaskDetail() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TaskForm />
    </Suspense>
  );
}
