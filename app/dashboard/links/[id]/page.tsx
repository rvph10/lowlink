"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import PageContainer from "@/components/layout/page-container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockLinks } from "@/constants/data";

// Component imports
import LinkSkeleton from "@/components/link-detail/LinkSkeleton";
import LinkHeader from "@/components/link-detail/LinkHeader";
import EditLinkDialog from "@/components/link-detail/EditLinkDialog";
import DeleteLinkDialog from "@/components/link-detail/DeleteLinkDialog";
import OverviewTab from "@/components/link-detail/tabs/OverviewTab";
import AnalyticsTab from "@/components/link-detail/tabs/AnalyticsTab";
import QRCodeTab from "@/components/link-detail/tabs/QRCodeTab";
import HistoryTab from "@/components/link-detail/tabs/HistoryTab";
import { CardFooter, CardDescription, CardHeader } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { Card } from "@/components/ui/card";
import { ChevronLeft, Link } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Main link detail page component
 */
const LinkDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [link, setLink] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const linkId = params.id;

  // Mock loading a link
  useEffect(() => {
    const fetchLink = async () => {
      setIsLoading(true);
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1200));

      if (mockLinks[linkId]) {
        setLink(mockLinks[linkId]);
      }
      setIsLoading(false);
    };

    fetchLink();
  }, [linkId]);

  const handleBackClick = () => {
    router.push("/dashboard");
  };

  const handleEditSubmit = (data) => {
    console.log("Form submitted with data:", data);
    // Would typically make an API call here
    setEditDialogOpen(false);

    // Update the local state for demo purposes
    setLink({
      ...link,
      title: data.title,
      originalUrl: data.originalUrl,
      status: data.status ? "active" : "inactive",
      lastUpdated: new Date().toISOString(),
    });
  };

  const handleDelete = () => {
    console.log("Deleting link:", linkId);
    // Would typically make an API call here
    setDeleteDialogOpen(false);

    // Navigate back to the links page
    router.push("/dashboard");
  };

  const handleGenerateQr = () => {
    console.log("Generating QR code for:", linkId);
    // Would typically make an API call here

    // Update the local state for demo purposes
    setLink({
      ...link,
      qrCode: "/images/qr-code.png",
      lastUpdated: new Date().toISOString(),
    });
  };

  const handleToggleStatus = () => {
    const newStatus = link.status === "active" ? "inactive" : "active";
    console.log(`Changing status to ${newStatus}`);

    // Update the local state for demo purposes
    setLink({
      ...link,
      status: newStatus,
      lastUpdated: new Date().toISOString(),
    });
  };

  // Loading state
  if (isLoading) {
    return <LinkSkeleton onBack={handleBackClick} />;
  }

  // No link found
  if (!link) {
    return (
      <PageContainer>
        <div className="flex flex-1 flex-col space-y-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to dashboard
          </Link>

          <Card className="w-full">
            <CardHeader>
              <CardTitle>Link not found</CardTitle>
              <CardDescription>
                The link you&apos;re looking for doesn&apos;t exist or has been
                deleted.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={handleBackClick}>Return to dashboard</Button>
            </CardFooter>
          </Card>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex flex-1 flex-col space-y-6">
        {/* Header with title and action buttons */}
        <LinkHeader
          link={link}
          onOpenEditDialog={() => setEditDialogOpen(true)}
          onOpenDeleteDialog={() => setDeleteDialogOpen(true)}
        />

        {/* Main content tabs */}
        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 md:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="qrcode">QR Code</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <OverviewTab
              link={link}
              onToggleStatus={handleToggleStatus}
              onViewAnalytics={() => setActiveTab("analytics")}
            />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AnalyticsTab link={link} onToggleStatus={handleToggleStatus} />
          </TabsContent>

          {/* QR Code Tab */}
          <TabsContent value="qrcode">
            <QRCodeTab link={link} onGenerateQr={handleGenerateQr} />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <HistoryTab link={link} />
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <EditLinkDialog
          link={link}
          open={editDialogOpen}
          onOpenChange={() => setEditDialogOpen(!editDialogOpen)}
          onSubmit={handleEditSubmit}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteLinkDialog
          open={deleteDialogOpen}
          onOpenChange={() => setDeleteDialogOpen(!deleteDialogOpen)}
          onConfirm={handleDelete}
        />
      </div>
    </PageContainer>
  );
};

export default LinkDetailPage;
