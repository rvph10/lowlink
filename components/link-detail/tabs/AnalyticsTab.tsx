import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart4, Map } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ClicksLineChart from "../charts/ClicksLineChart";
import DeviceBreakdownChart from "../charts/DeviceBreakDownChart";
import TrafficSourcesChart from "../charts/TrafficSourceChart";
import { type Link } from "@/types/types";

/**
 * Analytics tab content component
 */
const AnalyticsTab = ({
  link,
  onToggleStatus,
}: {
  link: Link;
  onToggleStatus: () => void;
}) => {
  // Calculate stats
  const daysSinceCreation = Math.ceil(
    (new Date().getTime() - new Date(link.createdAt).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  const clicksPerDay =
    daysSinceCreation > 0 ? (link.scans / daysSinceCreation).toFixed(1) : 0;

  // If no analytics data is available, show empty state
  if (link.scans === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Analytics Available</CardTitle>
          <CardDescription>
            This link hasn&apos;t received any clicks yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart4 className="h-24 w-24 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center max-w-md">
            Analytics will be available once your link starts receiving clicks.
            Make sure your link is active and being shared to generate traffic.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={onToggleStatus} className="w-full">
            {link.status === "active" ? "Deactivate Link" : "Activate Link"}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-lg">Total Clicks</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-3xl font-bold">{link.scans.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-lg">Daily Average</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-3xl font-bold">{clicksPerDay}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-lg">Active Days</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-3xl font-bold">{daysSinceCreation}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-lg">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-3xl font-bold">3.8%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Click Trends */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Click Trends</CardTitle>
            <CardDescription>
              Daily click activity for this link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClicksLineChart data={link.analytics.clicksByDay} height={300} />
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
            <CardDescription>Clicks by device type</CardDescription>
          </CardHeader>
          <CardContent>
            <DeviceBreakdownChart data={link.analytics.deviceBreakdown} />
          </CardContent>
        </Card>

        {/* Top Locations */}
        <Card>
          <CardHeader>
            <CardTitle>Top Locations</CardTitle>
            <CardDescription>Clicks by country</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-4">
              <Map className="h-16 w-16 text-muted-foreground" />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Country</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="text-right">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {link.analytics.locationData.map((location, index) => (
                  <TableRow key={index}>
                    <TableCell>{location.name}</TableCell>
                    <TableCell className="text-right">
                      {location.value}
                    </TableCell>
                    <TableCell className="text-right">
                      {((location.value / link.scans) * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Referrers */}
      <Card>
        <CardHeader>
          <CardTitle>Traffic Sources</CardTitle>
          <CardDescription>How users are finding your link</CardDescription>
        </CardHeader>
        <CardContent>
          <TrafficSourcesChart data={link.analytics.referrers} />
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsTab;
