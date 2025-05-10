// Types for the link application

export type LinkStatus = "active" | "inactive";

export type Link = {
  id: string;
  title: string;
  originalUrl: string;
  shortUrl: string;
  qrCode: string | null;
  status: LinkStatus;
  scans: number;
  lastUpdated: string;
  createdAt: string;
  analytics: LinkAnalytics;
  history: LinkHistoryEvent[];
};

export type LinkAnalytics = {
  clicksByDay: DailyClicks[];
  deviceBreakdown: DeviceStats[];
  locationData: LocationStats[];
  referrers: ReferrerStats[];
};

export type DailyClicks = {
  date: string;
  clicks: number;
};

export type DeviceStats = {
  name: string;
  value: number;
};

export type LocationStats = {
  name: string;
  value: number;
};

export type ReferrerStats = {
  name: string;
  value: number;
};

export type LinkHistoryEvent = {
  action: string;
  timestamp: string;
  user: string;
  details?: string;
};

export type EditLinkFormData = {
  title: string;
  originalUrl: string;
  status: boolean;
};
