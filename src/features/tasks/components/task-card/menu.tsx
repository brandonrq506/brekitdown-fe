import { EllipsisIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteTaskMutation } from "../../api/tanstack/delete-task-mutation";
import { useTaskCard } from "./context";

/** The ellipsis menu: delete. Expects Actions as its parent. */
export const Menu = () => {
  const { task } = useTaskCard();
  const { mutate, isPending } = useDeleteTaskMutation();
  const menuLabel = `Task actions for ${task.name}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={isPending}
        render={
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={menuLabel}
            title={menuLabel}
          />
        }>
        <EllipsisIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          variant="destructive"
          disabled={isPending}
          closeOnClick
          onClick={() => mutate(task.reference_xid)}>
          <Trash2Icon />
          Delete task
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
