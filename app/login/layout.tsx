import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account to use LowLink's URL shortening service.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
