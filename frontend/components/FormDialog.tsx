import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React from "react";

type FormDialogProps = {
  children?: React.ReactNode;
  successText?: React.ReactNode;
  failText?: React.ReactNode;
  onSuccess?: (e?: React.BaseSyntheticEvent) => unknown;
  title: string;
  description?: string;
  open: boolean;
  onOpenChange: (open: boolean) => unknown;
};

export default function FormDialog({
  children,
  successText,
  failText,
  onSuccess,
  title,
  description,
  open,
  onOpenChange,
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="outline-none">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        <DialogFooter>
          {failText && (
            <DialogClose asChild>
              <Button variant="outline">{failText}</Button>
            </DialogClose>
          )}
          {successText && (
            <Button
              onClick={(e) => {
                if (onSuccess !== undefined) onSuccess(e);
              }}
            >
              {successText}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
