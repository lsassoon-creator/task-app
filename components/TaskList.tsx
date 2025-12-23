import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TaskRow from "./TaskRow";
import { Task } from "@/types/models";

interface TaskListProps {
  tasks: Task[];
  onDelete: (taskId: string) => Promise<void>;
  onToggleComplete: (taskId: string, completed: boolean) => Promise<void>;
}

const TaskList = ({ tasks, onDelete, onToggleComplete }: TaskListProps) => {
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
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default TaskList;
