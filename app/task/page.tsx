"use client";

import { Suspense, useState } from "react";
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

function TaskForm() {
  const params = useSearchParams();
  const taskId = params.get("id")!;
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

  const handleImageUpload = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setUploading(true);
      await uploadImage(file);
      toast({
        title: "✅ Image Uploaded",
        description: "Image uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "❌ Upload Failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleImageUpload,
    accept: {
      "image/jpeg": [],
      "image/png": [],
    },
    maxFiles: 1,
  });

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
    return (
      <div className="space-y-2">
        <div className="relative w-40 h-40 rounded-xl overflow-hidden shadow-lg border-2 border-purple-200">
          <Image
            src={`${
              process.env.NEXT_PUBLIC_SUPABASE_URL
            }/storage/v1/object/public/task-attachments/${task!.image_url}`}
            alt="Task attachment"
            fill
            sizes="160px"
            className="object-cover"
          />
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={handleRemoveImage}
        >
          <Trash2 className="mr-1 h-4 w-4" />
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
            ? "border-purple-500 bg-purple-50/50 scale-105" 
            : "border-purple-200 hover:border-purple-400 hover:bg-purple-50/30"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="w-10 h-10 mx-auto mb-3 text-purple-400" />
        {isDragActive ? (
          <p className="text-sm font-semibold text-purple-600">Drop the image here...</p>
        ) : (
          <div className="space-y-1">
            <p className="text-sm font-medium text-purple-600">
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
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent">
        Task Details
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid w-full items-center gap-1.5">
          <Label>Title</Label>
          <Input
            value={task.title || ""}
            onChange={(e) => updateTask({ title: e.target.value })}
          />
        </div>
        <div className="grid w-full items-center gap-1.5">
          <Label>Description</Label>
          <Textarea
            value={task.description || ""}
            onChange={(e) => updateTask({ description: e.target.value })}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={task.completed || false}
            onCheckedChange={(checked) =>
              updateTask({ completed: checked as boolean })
            }
          />
          <Label>Completed</Label>
        </div>
        <div className="grid w-full items-center gap-1.5">
          <Label>Label</Label>
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
        <div className="grid w-full items-center gap-1.5">
          <Label>Due Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
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
        <div className="grid w-full items-center gap-1.5">
          <Label>Attach Image</Label>
          <div className="space-y-2">
            {task.image_url ? renderImageDisplay() : renderImageUpload()}
          </div>
        </div>
        <div className="flex space-x-3 w-full pt-6">
          <Link href="/dashboard" className="flex-1">
            <Button type="button" variant="outline" className="w-full rounded-full border-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <Button 
            type="submit" 
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
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
