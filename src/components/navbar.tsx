"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { FileText, BarChart2, Settings, Menu } from "lucide-react";
import { GithubIcon } from "@/components/icons/github-icon";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const navItems = [
    {
      name: "Exams",
      href: "/exams",
      icon: <FileText className="h-4 w-4 mr-2" />,
    },
    {
      name: "Results",
      href: "/results",
      icon: <BarChart2 className="h-4 w-4 mr-2" />,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: <Settings className="h-4 w-4 mr-2" />,
    },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex items-center justify-between h-16">
        <Link href="/" className="font-bold text-xl flex items-center gap-2">
          <FileText className="h-6 w-6" />
          <span>AI Grader</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <Link href={item.href} key={item.href}>
              <Button
                variant={isActive(item.href) ? "default" : "ghost"}
                size="sm"
              >
                {item.icon}
                {item.name}
              </Button>
            </Link>
          ))}
          <Link
            href="https://github.com/CostaFernando/exam-ai-grader"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="ghost" size="icon">
              <GithubIcon className="h-4 w-4 fill-current" />
              <span className="sr-only">GitHub Repository</span>
            </Button>
          </Link>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px] p-0">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex flex-col h-full">
                <div className="flex items-center p-6 border-b">
                  <Link
                    href="/"
                    className="font-bold text-lg flex items-center gap-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <FileText className="h-5 w-5" />
                    <span>AI Grader</span>
                  </Link>
                </div>
                <div className="flex flex-col space-y-1 p-6">
                  {navItems.map((item) => (
                    <Link
                      href={item.href}
                      key={item.href}
                      onClick={() => setIsOpen(false)}
                    >
                      <Button
                        variant={isActive(item.href) ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start",
                          isActive(item.href) ? "" : "hover:bg-accent"
                        )}
                      >
                        {item.icon}
                        {item.name}
                      </Button>
                    </Link>
                  ))}
                </div>
                <div className="mt-auto p-6 border-t">
                  <Link
                    href="https://github.com/CostaFernando/exam-ai-grader"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <GithubIcon className="h-4 w-4 mr-2 fill-current" />
                    GitHub Repository
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
