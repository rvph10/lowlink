import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { type Link as LinkType } from "@/types/types";

/**
 * Header component for the link detail page
 */
const LinkHeader = ({
  link,
  onOpenEditDialog,
  onOpenDeleteDialog,
}: {
  link: LinkType;
  onOpenEditDialog: () => void;
  onOpenDeleteDialog: () => void;
}) => {
  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to dashboard
          </Link>
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
