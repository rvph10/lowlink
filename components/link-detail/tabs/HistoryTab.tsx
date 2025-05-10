import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Edit, Plus, RefreshCw } from "lucide-react";
import { IconQrcode } from "@tabler/icons-react";
import { type Link } from "@/types/types";

/**
 * History tab content component
 */
const HistoryTab = ({ link }: { link: Link }) => {
  // Helper to get the appropriate icon for each action type
  const getActionIcon = (action: string) => {
    switch (action) {
      case "Created":
        return <Plus className="h-4 w-4" />;
      case "Edited Title":
      case "Edited URL":
        return <Edit className="h-4 w-4" />;
      case "QR Code Generated":
        return <IconQrcode className="h-4 w-4" />;
      case "Status Changed":
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Link History</CardTitle>
        <CardDescription>Activity and changes to this link</CardDescription>
      </CardHeader>
      <CardContent>
        {link.history.length > 0 ? (
          <div className="space-y-8">
            {link.history.map((event, index) => (
              <div key={index} className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div className="bg-primary/20 text-primary rounded-full p-2">
                    {getActionIcon(event.action)}
                  </div>
                  {index < link.history.length - 1 && (
                    <div className="w-px h-full bg-border" />
                  )}
                </div>
                <div className="pb-8">
                  <div className="flex items-center">
                    <p className="font-medium">{event.action}</p>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {new Date(event.timestamp).toLocaleDateString()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(event.timestamp).toLocaleTimeString()} by{" "}
                    {event.user}
                  </p>
                  {event.details && (
                    <p className="text-sm mt-2 bg-secondary/20 p-2 rounded-md">
                      {event.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Clock className="h-24 w-24 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No history available for this link.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HistoryTab;
