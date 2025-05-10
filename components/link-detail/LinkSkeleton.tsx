import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import PageContainer from "@/components/layout/page-container";

/**
 * Skeleton loading state for the link detail page
 */
const LinkSkeleton = ({ onBack }: { onBack: () => void }) => {
  return (
    <PageContainer>
      <div className="flex flex-1 flex-col space-y-6">
        <div className="flex items-start">
          <Button variant="ghost" className="mr-4" onClick={onBack}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>

        <Skeleton className="h-[500px] w-full" />
      </div>
    </PageContainer>
  );
};

export default LinkSkeleton;
