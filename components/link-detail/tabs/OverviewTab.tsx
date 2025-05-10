import React, { useState } from "react";
import {
  Calendar,
  Clock,
  ExternalLink,
  Copy,
  Check,
  X,
  BarChart4,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import ClicksLineChart from "../charts/ClicksLineChart";
import { type Link } from "@/types/types";

/**
 * Overview tab content component
 */
const OverviewTab = ({
  link,
  onToggleStatus,
  onViewAnalytics,
}: {
  link: Link;
  onToggleStatus: () => void;
  onViewAnalytics: () => void;
}) => {
  const [copied, setCopied] = useState(false);

  // Format dates for better display
  const formattedCreatedAt = new Date(link.createdAt).toLocaleString();
  const formattedLastUpdated = new Date(link.lastUpdated).toLocaleString();

  // Calculate stats
  const daysSinceCreation = Math.ceil(
    (new Date().getTime() - new Date(link.createdAt).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  const clicksPerDay =
    daysSinceCreation > 0 ? (link.scans / daysSinceCreation).toFixed(1) : 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${link.shortUrl}`);
    setCopied(true);

    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Link Performance Card */}
      <Card>
        <CardHeader>
          <CardTitle>Link Performance</CardTitle>
          <CardDescription>Click metrics for this link</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center p-4 bg-secondary/30 rounded-md">
              <p className="text-sm text-muted-foreground">Total Clicks</p>
              <p className="text-3xl font-bold">
                {link.scans.toLocaleString()}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-secondary/30 rounded-md">
              <p className="text-sm text-muted-foreground">Daily Average</p>
              <p className="text-3xl font-bold">{clicksPerDay}</p>
            </div>
          </div>

          <ClicksLineChart
            data={link.analytics.clicksByDay}
            height={200}
            showLegend={false}
          />
        </CardContent>
      </Card>

      {/* Link Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Link Details</CardTitle>
          <CardDescription>Information about this link</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* URLs */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Short URL
            </p>
            <div className="flex items-center space-x-2 p-2 bg-secondary/20 rounded-md">
              <span className="text-sm font-medium">
                https://{link.shortUrl}
              </span>
              <Button
                onClick={handleCopy}
                variant="ghost"
                size="icon"
                className={cn("h-6 w-6", copied && "text-green-600")}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Destination URL
            </p>
            <div className="flex items-center space-x-2 p-2 bg-secondary/20 rounded-md">
              <span className="text-sm truncate">{link.originalUrl}</span>
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Status toggle */}
          <div className="mt-6 flex items-center justify-between p-2 border rounded-md">
            <div className="flex flex-col">
              <p className="text-sm font-medium">Link Status</p>
              <p className="text-sm text-muted-foreground">
                {link.status === "active"
                  ? "Link is active and can be accessed"
                  : "Link is currently disabled"}
              </p>
            </div>
            <Switch
              checked={link.status === "active"}
              onCheckedChange={onToggleStatus}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex flex-col">
              <p className="text-xs text-muted-foreground">Created</p>
              <div className="flex items-center mt-1">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <p className="text-sm">{formattedCreatedAt}</p>
              </div>
            </div>
            <div className="flex flex-col">
              <p className="text-xs text-muted-foreground">Last Updated</p>
              <div className="flex items-center mt-1">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <p className="text-sm">{formattedLastUpdated}</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onToggleStatus}>
            {link.status === "active" ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Deactivate
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Activate
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onViewAnalytics}>
            <BarChart4 className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OverviewTab;
