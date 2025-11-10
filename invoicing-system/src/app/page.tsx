import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center">
      <div className="max-w-3xl space-y-8 p-8">
        <h1 className="text-5xl font-bold">Invoicing System</h1>
        <p className="text-xl text-muted-foreground">
          A modern, cloud-based invoicing system for small businesses
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/register">Register</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
