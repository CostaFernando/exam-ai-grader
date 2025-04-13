"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, FileText, BarChart2, Settings } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="border-b">
      <div className="container mx-auto flex items-center justify-between h-16">
        <Link href="/" className="font-bold text-xl flex items-center gap-2">
          <FileText className="h-6 w-6" />
          <span>AI Grader</span>
        </Link>

        <div className="flex items-center space-x-1">
          <Link href="/">
            <Button variant={isActive("/") ? "default" : "ghost"} size="sm">
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <Link href="/provas">
            <Button
              variant={isActive("/provas") ? "default" : "ghost"}
              size="sm"
            >
              <FileText className="h-4 w-4 mr-2" />
              Provas
            </Button>
          </Link>
          <Link href="/results">
            <Button
              variant={isActive("/results") ? "default" : "ghost"}
              size="sm"
            >
              <BarChart2 className="h-4 w-4 mr-2" />
              Results
            </Button>
          </Link>
          <Link href="/settings">
            <Button
              variant={isActive("/settings") ? "default" : "ghost"}
              size="sm"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
