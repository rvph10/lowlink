"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  IconExternalLink,
  IconQrcode,
  IconCopy,
  IconPlus,
  IconSearch,
  IconCheck,
} from "@tabler/icons-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Image from "next/image";
import PageContainer from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";
import { EditIcon } from "lucide-react";

type Link = {
  id: string;
  title: string;
  originalUrl: string;
  shortUrl: string;
  qrCode: string | null;
  status: "active" | "inactive";
  scans: number;
  lastUpdated: string;
};

// Mock link data
const mockLinks: Link[] = [
  {
    id: "link-123",
    title: "Product Launch Campaign",
    originalUrl: "https://example.com/product-launch-special-offer-spring-2025",
    shortUrl: "lowlink.co/pl2025",
    qrCode: "/images/qr-code.png",
    status: "active",
    scans: 1247,
    lastUpdated: "2 days ago",
  },
  {
    id: "link-456",
    title: "Newsletter Signup",
    originalUrl: "https://example.com/newsletter-signup-page",
    shortUrl: "lowlink.co/news",
    qrCode: "/images/qr-code.png",
    status: "active",
    scans: 526,
    lastUpdated: "5 days ago",
  },
  {
    id: "link-789",
    title: "Summer Sale 2025",
    originalUrl: "https://example.com/summer-promotions-2025",
    shortUrl: "lowlink.co/sum25",
    qrCode: null,
    status: "inactive",
    scans: 0,
    lastUpdated: "1 hour ago",
  },
  {
    id: "link-101",
    title: "Product Launch Campaign",
    originalUrl: "https://example.com/product-launch-special-offer-spring-2025",
    shortUrl: "lowlink.co/pl2025",
    qrCode: "/images/qr-code.png",
    status: "active",
    scans: 1247,
    lastUpdated: "2 days ago",
  },
  {
    id: "link-102",
    title: "Order Confirmation",
    originalUrl: "https://example.com/order-confirmation-page",
    shortUrl: "lowlink.co/order",
    qrCode: "/images/qr-code.png",
    status: "active",
    scans: 147,
    lastUpdated: "2 days ago",
  },
];

// Skeleton Loading Component for Link Cards
const LinkCardSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-col space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-5 w-16" />
      </CardHeader>

      <CardContent className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* QR code skeleton */}
          <div className="flex flex-col items-center justify-center md:justify-start space-y-3">
            <Skeleton className="h-28 w-28 rounded-md" />
          </div>

          {/* Details skeleton */}
          <div className="md:col-span-2 space-y-4">
            <div className="space-y-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-12 w-full rounded-md" />
      </CardFooter>
    </Card>
  );
};

/**
 * LinkCard Component
 * Displays a card containing link information including title, status, and last update time
 * @param {Object} link - The link object containing link details
 * @param {string} link.title - The title of the link
 * @param {string} link.status - The status of the link (active/inactive)
 * @param {string} link.lastUpdated - When the link was last updated
 */
const LinkCard = ({ link }: { link: Link }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(link.shortUrl);
    setCopied(true);

    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-col space-y-1.5">
          <Link
            href={`/dashboard/${link.id}`}
            className="hover:underline underline md:no-underline"
          >
            <h3 className="font-medium leading-none flex items-center gap-2">
              {link.title} <EditIcon className="h-4 w-4 hover:text-primary" />
            </h3>
          </Link>
          <p className="text-xs text-muted-foreground">
            Updated {link.lastUpdated}
          </p>
        </div>
        <Badge variant={link.status === "active" ? "default" : "secondary"}>
          {link.status}
        </Badge>
      </CardHeader>

      <CardContent className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left section with QR code and scan count */}
          <div className="flex flex-col items-center justify-center md:justify-start space-y-3">
            {link.qrCode ? (
              <div className="relative">
                <Image
                  src={link.qrCode}
                  alt="QR Code"
                  className="h-28 w-28 rounded-md border transition-all hover:border-primary/50"
                  width={100}
                  height={100}
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
                      >
                        <IconQrcode className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Download QR code</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="h-28 w-28">
                      <IconQrcode className="h-6 w-6 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Generate QR Code?</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Right section with link details */}
          <div className="md:col-span-2 space-y-4">
            {/* Original URL */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Redirects to
              </p>
              <div className="flex items-center space-x-2">
                <Link
                  href={link.originalUrl}
                  className="text-sm truncate max-w-[240px]"
                  target="_blank"
                >
                  {link.originalUrl}
                </Link>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <IconExternalLink className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Open link</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Short URL */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Dynamic link
              </p>
              <div className="flex items-center space-x-2">
                <Link
                  href={`https://${link.shortUrl}`}
                  className="text-sm font-medium"
                  target="_blank"
                >
                  {link.shortUrl}
                </Link>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleCopy}
                        variant="ghost"
                        size="icon"
                        className={cn("h-6 w-6 transition-all")}
                      >
                        {copied ? (
                          <IconCheck className="h-3 w-3" />
                        ) : (
                          <IconCopy className="h-3 w-3" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{copied ? "Copied!" : "Copy link"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex flex-row items-center justify-between w-full gap-2">
          {/* Total clicks */}
          <div className="rounded-md bg-secondary/50 px-3 py-2 w-full">
            <p className="text-xs text-muted-foreground text-center">
              Total clicks
            </p>
            <p className="text-lg font-semibold text-center">
              {link.scans.toLocaleString()}
            </p>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

// Debounce function
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Page Component
const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [links, setLinks] = useState<Link[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Debounced search term
  const debouncedSearch = useDebounce(search, 500);

  // Fetch links (simulating API call)
  const fetchLinks = useCallback(async () => {
    setIsLoading(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // For now, use the mock data
    setLinks(mockLinks);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  // Filter and sort links based on current filters
  const filteredLinks = links
    .filter((link) => {
      // Apply status filter
      if (statusFilter !== "all" && link.status !== statusFilter) {
        return false;
      }

      // Apply search filter (case insensitive)
      if (
        debouncedSearch &&
        !link.title.toLowerCase().includes(debouncedSearch.toLowerCase()) &&
        !link.shortUrl.toLowerCase().includes(debouncedSearch.toLowerCase()) &&
        !link.originalUrl.toLowerCase().includes(debouncedSearch.toLowerCase())
      ) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Apply sorting
      switch (sortBy) {
        case "newest":
          // Mock implementation: assuming more recent links have "hour" vs "days" in lastUpdated
          return a.lastUpdated.includes("hour") ? -1 : 1;
        case "oldest":
          return a.lastUpdated.includes("hour") ? 1 : -1;
        case "clicks":
          return b.scans - a.scans;
        default:
          return 0;
      }
    });

  // Handler for search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);

    // If search is cleared, no need to wait for debounce
    if (e.target.value === "") {
      setSearch("");
    }
  };

  return (
    <PageContainer>
      <div className="flex flex-1 flex-col space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Your smart links
            </h1>
            <p className="text-muted-foreground">
              View analytics and manage your active dynamic links
            </p>
          </div>
          <Link
            href="/dashboard/product/new"
            className={cn(
              "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90",
              "text-xs md:text-sm md:font-semibold",
            )}
          >
            <IconPlus className="mr-2 h-4 w-4" /> Create new link
          </Link>
        </div>
        <Separator />

        {/* Filter/Search */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="relative w-full md:w-64">
            <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search links..."
              className="pl-8"
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All links</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="clicks">Most clicks</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Link Cards Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            // Show skeleton loaders while loading
            <>
              <LinkCardSkeleton />
              <LinkCardSkeleton />
              <LinkCardSkeleton />
            </>
          ) : filteredLinks.length > 0 ? (
            // Show filtered links
            filteredLinks.map((link) => <LinkCard key={link.id} link={link} />)
          ) : (
            // Show empty state when no links match filters
            <div className="col-span-3 flex flex-col items-center justify-center py-12">
              <IconSearch className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No links found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default Dashboard;
