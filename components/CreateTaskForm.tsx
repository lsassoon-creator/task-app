import { useState } from "react";
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
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { labels } from "@/lib/labels";
import { Task } from "@/types/models";

interface CreateTaskFormProps {
  onSubmit: (taskData: {
    title: string;
    description: string;
    completed: boolean;
    label: Task["label"];
    due_date: Date | undefined;
  }) => Promise<void>;
}

export function CreateTaskForm({ onSubmit }: CreateTaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [completed, setCompleted] = useState(false);
  const [label, setLabel] = useState<Task["label"]>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        title,
        description,
        completed,
        label,
        due_date: date,
      });
      setTitle("");
      setDescription("");
      setCompleted(false);
      setLabel(null);
      setDate(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="max-w-2xl mx-auto">
        <div className="space-y-6">
          {/* Title */}
          <div className="grid w-full items-center gap-2">
            <Label className="text-base font-semibold text-foreground">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-medium"
              placeholder="Task title"
              required
            />
          </div>

          {/* Description */}
          <div className="grid w-full items-start gap-2">
            <Label className="text-base font-semibold text-foreground">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[200px] text-base leading-relaxed resize-none"
              placeholder="Write your task description here..."
            />
          </div>

          {/* Completed Checkbox */}
          <div className="flex items-center space-x-3 p-4 rounded-xl border-2 border-yellow-200/50 bg-yellow-50/30">
            <Checkbox
              checked={completed}
              onCheckedChange={(checked) => setCompleted(checked as boolean)}
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
              value={label || ""}
              onValueChange={(value) => {
                if (value === "ai-suggest") {
                  // Set to null so AI will suggest
                  setLabel(null);
                } else {
                  setLabel(value as Task["label"]);
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a label or let AI suggest" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ai-suggest" className="font-semibold text-purple-600">
                  ✨ Let AI Suggest
                </SelectItem>
                <SelectItem value="" className="text-muted-foreground">
                  No Label
                </SelectItem>
                {labels.map((labelOption) => (
                  <SelectItem key={labelOption.value} value={labelOption.value}>
                    {labelOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {label === null && (
              <p className="text-sm text-purple-600 font-medium mt-1">
                ✨ AI will automatically suggest a label based on your task content
              </p>
            )}
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

          {/* Action Button */}
          <div className="pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg h-12 text-base font-semibold"
            >
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
            {error && <div className="text-red-500 text-sm mt-2 font-medium">{error}</div>}
          </div>
        </div>
      </div>
    </form>
  );
}
