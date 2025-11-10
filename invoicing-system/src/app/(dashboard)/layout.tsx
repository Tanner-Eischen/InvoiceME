'use client';

import dynamic from "next/dynamic";
// Dynamically import Header to avoid SSR hydration mismatches from client-only logic
const Header = dynamic(() => import("@/components/layout/header").then(m => m.Header), { ssr: false });
import { Footer } from "@/components/layout/footer";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { Toaster } from 'sonner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // Check if user is authenticated
  useEffect(() => {
    // Only redirect if not on a public page and not authenticated
    if (!isAuthenticated() && !pathname.includes('/login') && !pathname.includes('/register')) {
      router.push('/login');
    }
  }, [router, pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-6">
        {children}
      </main>
      <Footer />
      <Toaster position="top-right" />
    </div>
  );
}
