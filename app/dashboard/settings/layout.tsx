import PageContainer from "@/components/layout/page-container";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
export const metadata: Metadata = {
  title: "Settings | LowLink",
  description: "Manage your account settings",
};

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <PageContainer>
        <div className="flex flex-1 flex-col gap-4">
          {/* Back to dashboard */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to dashboard
          </Link>
          {/* Settings header */}
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold tracking-tight">
              Your account settings
            </h1>
          </div>
          <Separator />
          {/* Settings content */}
          {children}
        </div>
      </PageContainer>
    </div>
  );
}
