'use client';

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Users, FileText, Settings, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { isAdmin } from "@/lib/auth";
import { useEffect, useState } from "react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

export function NavItems() {
  const pathname = usePathname();
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    setIsAdminUser(isAdmin());
  }, []);

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: "Clients",
      href: "/clients",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Invoices",
      href: "/invoices",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "Payments",
      href: "/payments",
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
      adminOnly: true,
    },
  ];

  return (
    <>
      {navItems
        .filter(item => !item.adminOnly || (item.adminOnly && isAdminUser))
        .map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground",
              pathname === item.href && "text-foreground"
            )}
          >
            {item.icon}
            {item.title}
          </Link>
        ))}
    </>
  );
}
