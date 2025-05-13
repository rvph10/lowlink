"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";
import Image from "next/image";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Processing authentication...");
  const supabase = createClient();

  // Handle the OAuth or email link callback
  useEffect(() => {
    const handleAuthCallback = async () => {
      const code = searchParams.get("code");
      const type = searchParams.get("type");
      const token = searchParams.get("token");

      try {
        if (code) {
          // This is an OAuth callback
          await supabase.auth.exchangeCodeForSession(code);
          setMessage("Authentication successful! Redirecting...");
          router.push("/dashboard");
        } else if (token) {
          // This is an email link callback
          if (type === "recovery") {
            // Password reset flow
            setMessage("Verifying your request...");

            const { error } = await supabase.auth.verifyOtp({
              token_hash: token,
              type: "recovery",
            });

            if (error) {
              setMessage(`Error: ${error.message}`);
            } else {
              setMessage("Verified! Redirecting to password reset...");
              router.push("/auth/update-password");
            }
          } else if (type === "signup" || type === "magiclink") {
            // Email verification or magic link
            setMessage("Verifying your email...");

            const { error } = await supabase.auth.verifyOtp({
              token_hash: token,
              type: type === "signup" ? "signup" : "magiclink",
            });

            if (error) {
              setMessage(`Error: ${error.message}`);
            } else {
              setMessage("Authentication successful! Redirecting...");
              router.push("/dashboard");
            }
          } else {
            setMessage("Invalid authentication type.");
          }
        } else {
          setMessage("No authentication parameters found.");
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        }
      } catch (error: unknown) {
        setMessage(
          `Error: ${error instanceof Error ? error.message : "Something went wrong"}`
        );
      }
    };

    handleAuthCallback();
  }, [searchParams, router]);

  return (
    <section className="bg-background flex justify-center items-center">
      <div className="container flex min-h-screen items-center justify-center py-4">
        <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6">
          <div className="flex h-14 w-14 items-center justify-center">
            <Image
              className="h-14 w-12"
              alt="Logo"
              width={56}
              height={56}
              src="https://shadcnblocks.com/images/block/block-1.svg"
            />
          </div>

          <h1 className="mb-8 w-full text-center text-3xl font-medium tracking-tighter text-foreground md:text-4xl">
            Authentication
          </h1>

          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">{message}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
