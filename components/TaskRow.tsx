import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";
import { getLabelColors, getLabelDisplayName } from "@/lib/labels";
import { Task } from "@/types/models";

interface TaskRowProps {
  task: Task;
  onDelete: (taskId: string) => void;
  onToggleComplete: (taskId: string, completed: boolean) => void;
}

const TaskRow = ({ task, onDelete, onToggleComplete }: TaskRowProps) => {
  const formatDate = (dateString: string) => {
    return dateString.split("T")[0];
  };

  return (
    <TableRow className="hover:bg-yellow-50/50 transition-all duration-300 border-b border-gray-200">
      <TableCell className="py-4">
        <Checkbox
          checked={task.completed!}
          onCheckedChange={(checked) =>
            onToggleComplete(task.task_id, checked as boolean)
          }
          className="border-2 border-gray-300 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
        />
      </TableCell>
      <TableCell className="py-4">
        <Link
          href={`/task?id=${task.task_id}`}
          className={`hover:underline font-semibold transition-colors duration-300 ${
            task.completed 
              ? "line-through text-muted-foreground" 
              : "text-foreground hover:text-yellow-600"
          }`}
        >
          {task.title}
        </Link>
      </TableCell>
      <TableCell className="py-4">
        {task.label && (
          <Badge
            variant="outline"
            className={[
              getLabelColors(task.label)["bg-color"],
              getLabelColors(task.label)["text-color"],
              getLabelColors(task.label)["border-color"],
              "rounded-full px-3 py-1 font-semibold border-2",
            ].join(" ")}
          >
            {getLabelDisplayName(task.label)}
          </Badge>
        )}
      </TableCell>
      <TableCell className="py-4 whitespace-nowrap text-muted-foreground font-medium">
        {task.due_date ? formatDate(task.due_date) : ""}
      </TableCell>
      <TableCell className="text-right py-4">
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-lg hover:bg-yellow-100 hover:text-yellow-600">
            <Link href={`/task?id=${task.task_id}`}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg hover:bg-gray-100 hover:text-gray-700"
            onClick={() => onDelete(task.task_id)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default TaskRow;
