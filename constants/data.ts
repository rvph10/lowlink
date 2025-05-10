import {
  IconAlertTriangle,
  IconArrowRight,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconCommand,
  IconCreditCard,
  IconFile,
  IconFileText,
  IconHelpCircle,
  IconPhoto,
  IconDeviceLaptop,
  IconLayoutDashboard,
  IconLoader2,
  IconLogin,
  IconProps,
  IconShoppingBag,
  IconMoon,
  IconDotsVertical,
  IconPizza,
  IconPlus,
  IconSettings,
  IconSun,
  IconTrash,
  IconBrandTwitter,
  IconUser,
  IconUserCircle,
  IconUserEdit,
  IconUserX,
  IconX,
  IconLayoutKanban,
  IconBrandGithub,
} from "@tabler/icons-react";

export type Icon = React.ComponentType<IconProps>;

export const Icons = {
  dashboard: IconLayoutDashboard,
  logo: IconCommand,
  login: IconLogin,
  close: IconX,
  product: IconShoppingBag,
  spinner: IconLoader2,
  kanban: IconLayoutKanban,
  chevronLeft: IconChevronLeft,
  chevronRight: IconChevronRight,
  trash: IconTrash,
  employee: IconUserX,
  post: IconFileText,
  page: IconFile,
  userPen: IconUserEdit,
  user2: IconUserCircle,
  media: IconPhoto,
  settings: IconSettings,
  billing: IconCreditCard,
  ellipsis: IconDotsVertical,
  add: IconPlus,
  warning: IconAlertTriangle,
  user: IconUser,
  arrowRight: IconArrowRight,
  help: IconHelpCircle,
  pizza: IconPizza,
  sun: IconSun,
  moon: IconMoon,
  laptop: IconDeviceLaptop,
  github: IconBrandGithub,
  twitter: IconBrandTwitter,
  check: IconCheck,
};

export interface NavItem {
  title: string;
  url: string;
  disabled?: boolean;
  external?: boolean;
  shortcut?: [string, string];
  icon?: keyof typeof Icons;
  label?: string;
  description?: string;
  isActive?: boolean;
  items?: NavItem[];
}

export type Product = {
  photo_url: string;
  name: string;
  description: string;
  created_at: string;
  price: number;
  id: number;
  category: string;
  updated_at: string;
};

//Info: The following data is used for the sidebar navigation and Cmd K bar.
export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard/overview",
    icon: "dashboard",
    isActive: false,
    shortcut: ["d", "d"],
    items: [], // Empty array as there are no child items for Dashboard
  },
  {
    title: "Product",
    url: "/dashboard/product",
    icon: "product",
    shortcut: ["p", "p"],
    isActive: false,
    items: [], // No child items
  },
  {
    title: "Account",
    url: "#", // Placeholder as there is no direct link for the parent
    icon: "billing",
    isActive: true,

    items: [
      {
        title: "Profile",
        url: "/dashboard/profile",
        icon: "userPen",
        shortcut: ["m", "m"],
      },
      {
        title: "Login",
        shortcut: ["l", "l"],
        url: "/",
        icon: "login",
      },
    ],
  },
  {
    title: "Kanban",
    url: "/dashboard/kanban",
    icon: "kanban",
    shortcut: ["k", "k"],
    isActive: false,
    items: [], // No child items
  },
];

export interface SaleUser {
  id: number;
  name: string;
  email: string;
  amount: string;
  image: string;
  initials: string;
}

export const recentSalesData: SaleUser[] = [
  {
    id: 1,
    name: "Olivia Martin",
    email: "olivia.martin@email.com",
    amount: "+$1,999.00",
    image: "https://api.slingacademy.com/public/sample-users/1.png",
    initials: "OM",
  },
  {
    id: 2,
    name: "Jackson Lee",
    email: "jackson.lee@email.com",
    amount: "+$39.00",
    image: "https://api.slingacademy.com/public/sample-users/2.png",
    initials: "JL",
  },
  {
    id: 3,
    name: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    amount: "+$299.00",
    image: "https://api.slingacademy.com/public/sample-users/3.png",
    initials: "IN",
  },
  {
    id: 4,
    name: "William Kim",
    email: "will@email.com",
    amount: "+$99.00",
    image: "https://api.slingacademy.com/public/sample-users/4.png",
    initials: "WK",
  },
  {
    id: 5,
    name: "Sofia Davis",
    email: "sofia.davis@email.com",
    amount: "+$39.00",
    image: "https://api.slingacademy.com/public/sample-users/5.png",
    initials: "SD",
  },
];

// Mock data for links

export const mockLinks = {
  "link-123": {
    id: "link-123",
    title: "Product Launch Campaign",
    originalUrl: "https://example.com/product-launch-special-offer-spring-2025",
    shortUrl: "lowlink.co/pl2025",
    qrCode: "/images/qr-code.png",
    status: "active",
    scans: 1247,
    lastUpdated: "2023-04-15T12:30:00Z",
    createdAt: "2023-04-01T09:15:00Z",
    analytics: {
      clicksByDay: [
        { date: "Apr 1", clicks: 42 },
        { date: "Apr 2", clicks: 89 },
        { date: "Apr 3", clicks: 103 },
        { date: "Apr 4", clicks: 142 },
        { date: "Apr 5", clicks: 158 },
        { date: "Apr 6", clicks: 172 },
        { date: "Apr 7", clicks: 136 },
        { date: "Apr 8", clicks: 124 },
        { date: "Apr 9", clicks: 103 },
        { date: "Apr 10", clicks: 93 },
        { date: "Apr 11", clicks: 85 },
        { date: "Apr 12", clicks: 78 },
        { date: "Apr 13", clicks: 67 },
        { date: "Apr 14", clicks: 55 },
      ],
      deviceBreakdown: [
        { name: "Mobile", value: 723 },
        { name: "Desktop", value: 412 },
        { name: "Tablet", value: 112 },
      ],
      locationData: [
        { name: "United States", value: 530 },
        { name: "United Kingdom", value: 286 },
        { name: "Canada", value: 142 },
        { name: "Germany", value: 99 },
        { name: "France", value: 85 },
        { name: "Other", value: 105 },
      ],
      referrers: [
        { name: "Direct", value: 625 },
        { name: "Social Media", value: 345 },
        { name: "Email", value: 187 },
        { name: "Other", value: 90 },
      ],
    },
    history: [
      {
        action: "Created",
        timestamp: "2023-04-01T09:15:00Z",
        user: "John Doe",
      },
      {
        action: "QR Code Generated",
        timestamp: "2023-04-01T09:16:12Z",
        user: "John Doe",
      },
      {
        action: "Edited Title",
        timestamp: "2023-04-05T14:22:45Z",
        user: "Jane Smith",
        details:
          "Changed title from 'Spring Launch' to 'Product Launch Campaign'",
      },
      {
        action: "Status Changed",
        timestamp: "2023-04-10T10:05:32Z",
        user: "John Doe",
        details: "Changed status from 'inactive' to 'active'",
      },
    ],
  },
  "link-456": {
    id: "link-456",
    title: "Newsletter Signup",
    originalUrl: "https://example.com/newsletter-signup-page",
    shortUrl: "lowlink.co/news",
    qrCode: "/images/qr-code.png",
    status: "active",
    scans: 526,
    lastUpdated: "2023-04-10T15:45:00Z",
    createdAt: "2023-03-20T11:30:00Z",
    analytics: {
      clicksByDay: [
        { date: "Apr 1", clicks: 22 },
        { date: "Apr 2", clicks: 35 },
        { date: "Apr 3", clicks: 41 },
        { date: "Apr 4", clicks: 52 },
        { date: "Apr 5", clicks: 48 },
        { date: "Apr 6", clicks: 59 },
        { date: "Apr 7", clicks: 63 },
        { date: "Apr 8", clicks: 47 },
        { date: "Apr 9", clicks: 38 },
        { date: "Apr 10", clicks: 42 },
        { date: "Apr 11", clicks: 39 },
        { date: "Apr 12", clicks: 40 },
      ],
      deviceBreakdown: [
        { name: "Mobile", value: 301 },
        { name: "Desktop", value: 185 },
        { name: "Tablet", value: 40 },
      ],
      locationData: [
        { name: "United States", value: 245 },
        { name: "United Kingdom", value: 121 },
        { name: "Canada", value: 75 },
        { name: "Germany", value: 42 },
        { name: "Other", value: 43 },
      ],
      referrers: [
        { name: "Direct", value: 248 },
        { name: "Social Media", value: 154 },
        { name: "Email", value: 95 },
        { name: "Other", value: 29 },
      ],
    },
    history: [
      {
        action: "Created",
        timestamp: "2023-03-20T11:30:00Z",
        user: "Jane Smith",
      },
      {
        action: "QR Code Generated",
        timestamp: "2023-03-20T11:31:05Z",
        user: "Jane Smith",
      },
      {
        action: "Edited URL",
        timestamp: "2023-03-25T09:12:30Z",
        user: "Jane Smith",
        details: "Updated destination URL",
      },
    ],
  },
  "link-789": {
    id: "link-789",
    title: "Summer Sale 2025",
    originalUrl: "https://example.com/summer-promotions-2025",
    shortUrl: "lowlink.co/sum25",
    qrCode: null,
    status: "inactive",
    scans: 0,
    lastUpdated: "2023-04-15T08:20:00Z",
    createdAt: "2023-04-15T08:20:00Z",
    analytics: {
      clicksByDay: [],
      deviceBreakdown: [],
      locationData: [],
      referrers: [],
    },
    history: [
      {
        action: "Created",
        timestamp: "2023-04-15T08:20:00Z",
        user: "John Doe",
      },
    ],
  },
};

// Colors for charts
export const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82ca9d",
];
