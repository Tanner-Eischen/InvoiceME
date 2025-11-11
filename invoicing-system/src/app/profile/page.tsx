"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isAuthenticated, getUserData, logout } from "@/lib/auth";

type UserData = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    const data = getUserData();
    setUser(data || {});
  }, [router]);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Your account information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>Basic information from your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="mt-1 text-lg font-semibold">{user?.name || "Unknown"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="mt-1 text-lg font-semibold">{user?.email || "Unknown"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Role</p>
              <p className="mt-1 text-lg font-semibold">{user?.role || "User"}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/settings")}>Account Settings</Button>
          <Button variant="default" onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
          <Button variant="destructive" className="ml-auto" onClick={handleLogout}>Logout</Button>
        </CardFooter>
      </Card>
    </div>
  );
}