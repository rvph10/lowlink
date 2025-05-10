import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Edit, Trash2 } from "lucide-react";
import { type Link } from "@/types/types";

/**
 * Header component for the link detail page
 */
const LinkHeader = ({
  link,
  onBack,
  onOpenEditDialog,
  onOpenDeleteDialog,
}: {
  link: Link;
  onBack: () => void;
  onOpenEditDialog: () => void;
  onOpenDeleteDialog: () => void;
}) => {
  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" className="mr-4" onClick={onBack}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onOpenEditDialog}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={onOpenDeleteDialog}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
      <div>
        <h1 className="text-2xl font-bold">{link.title}</h1>
        <div className="flex items-center mt-1">
          <Badge
            variant={link.status === "active" ? "default" : "secondary"}
            className="mr-2"
          >
            {link.status}
          </Badge>
          <p className="text-sm text-muted-foreground">
            Created {new Date(link.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LinkHeader;
