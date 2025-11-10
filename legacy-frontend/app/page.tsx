"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if the user is already authenticated
    const token = localStorage.getItem("auth_token");

    if (token) {
      // If authenticated, redirect to dashboard
      router.push("/dashboard");
    } else {
      // Otherwise, redirect to login
      router.push("/login");
    }
  }, [router]);

  // Simple loading state while redirection happens
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">Invoicing System</h1>
      <p className="text-muted-foreground">Redirecting, please wait...</p>
    </div>
  );
}
