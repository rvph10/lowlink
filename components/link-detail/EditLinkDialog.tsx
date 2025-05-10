import React from "react";
import { useForm } from "react-hook-form";
import { type Link, type EditLinkFormData } from "@/types/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

/**
 * Dialog component for editing a link
 */
const EditLinkDialog = ({
  link,
  open,
  onOpenChange,
  onSubmit,
}: {
  link: Link;
  open: boolean;
  onOpenChange: () => void;
  onSubmit: (data: EditLinkFormData) => void;
}) => {
  const form = useForm({
    defaultValues: {
      title: link?.title || "",
      originalUrl: link?.originalUrl || "",
      status: link?.status === "active" || false,
    },
  });

  // Update form values when link data changes
  React.useEffect(() => {
    if (link) {
      form.reset({
        title: link.title,
        originalUrl: link.originalUrl,
        status: link.status === "active",
      });
    }
  }, [link, form]);

  const handleSubmit = (data: EditLinkFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit link</DialogTitle>
          <DialogDescription>
            Make changes to your link. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4 pt-4"
        >
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="title">Link title</Label>
              <Input
                id="title"
                {...form.register("title")}
                defaultValue={link?.title}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="originalUrl">Destination URL</Label>
              <Input
                id="originalUrl"
                {...form.register("originalUrl")}
                defaultValue={link?.originalUrl}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="status">Active</Label>
              <Switch
                id="status"
                {...form.register("status")}
                defaultChecked={link?.status === "active"}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditLinkDialog;
