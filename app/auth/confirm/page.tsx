"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const type = searchParams.get("type");

    if (token && type === "recovery") {
      // Redirect to update-password page with the token
      router.push(`/update-password?token=${token}`);
    } else {
      // Invalid or missing parameters, redirect to login
      router.push("/login");
    }
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin" />
        <p className="mt-4">Redirecting...</p>
      </div>
    </div>
  );
}
