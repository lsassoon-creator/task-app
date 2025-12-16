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
        <TableRow className="hover:bg-transparent bg-gradient-to-r from-purple-50/50 to-pink-50/50 border-b-2 border-purple-200">
          <TableHead className="w-[50px] py-4 font-bold text-purple-700">✓</TableHead>
          <TableHead className="py-4 font-bold text-purple-700">Title</TableHead>
          <TableHead className="w-[100px] py-4 font-bold text-purple-700">Label</TableHead>
          <TableHead className="w-[120px] py-4 font-bold text-purple-700">Due Date</TableHead>
          <TableHead className="w-[100px] text-right py-4 font-bold text-purple-700">Actions</TableHead>
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
