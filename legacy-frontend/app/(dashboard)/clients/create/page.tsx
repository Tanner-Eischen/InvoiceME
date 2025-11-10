import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { ClientForm } from "@/components/clients/client-form";

export const metadata: Metadata = {
  title: "Create Client",
  description: "Create a new client",
};

export default function CreateClientPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/clients">
            <Button variant="outline" size="icon">
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight">Create Client</h2>
        </div>
      </div>
      <div className="space-y-4">
        <ClientForm />
      </div>
    </div>
  );
}
