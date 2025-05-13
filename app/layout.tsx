import { Toaster } from "@/components/ui/sonner";
import ThemeProvider from "@/components/layout/ThemeToggle/theme-provider";
import { cn } from "@/lib/utils";
import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import NextTopLoader from "nextjs-toploader";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { AuthProvider } from "@/context/auth-context";
import "./globals.css";
import "./theme.css";
import { ProfileProvider } from "@/context/profile-context";

const META_THEME_COLORS = {
  light: "#ffffff",
  dark: "#09090b",
};

export const metadata: Metadata = {
  title: {
    default: "LowLink - Fast & Reliable Link Shortener",
    template: "%s | LowLink",
  },
  description:
    "Create, manage and track short links with our powerful link shortening service. Perfect for marketing campaigns, social media, and more.",
  keywords: [
    "link shortener",
    "QR code generator",
    "QR code",
    "QR code reader",
    "QR code scanner",
    "URL shortener",
    "short links",
    "link management",
    "link tracking",
  ],
  authors: [{ name: "rvph" }],
  creator: "UpInTown",
  publisher: "UpInTown",
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://lowlink.app",
    title: "LowLink - Fast & Reliable Link Shortener",
    description:
      "Create, manage and track short links with our powerful link shortening service.",
    siteName: "LowLink",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: META_THEME_COLORS.light,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const activeThemeValue = cookieStore.get("active_theme")?.value;
  const isScaled = activeThemeValue?.endsWith("-scaled");

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]').setAttribute('content', '${META_THEME_COLORS.dark}')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body
        className={cn(
          "bg-background overflow-hidden overscroll-none font-sans antialiased",
          activeThemeValue ? `theme-${activeThemeValue}` : "",
          isScaled ? "theme-scaled" : "",
        )}
      >
        <NextTopLoader showSpinner={false} />
        <NuqsAdapter>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            enableColorScheme
          >
            <AuthProvider>
              <ProfileProvider>
                <Toaster position="bottom-right" invert />
                {children}
              </ProfileProvider>
            </AuthProvider>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
