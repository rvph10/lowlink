import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register",
  description: "Create an account to use LowLink's URL shortening service.",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
