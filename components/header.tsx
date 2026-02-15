"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, Home, Users, BookOpen, BarChart3, Settings, Activity } from "lucide-react"

/**
 * Header Component for GitVitals
 * 
 * Displays the GitVitals logo in the top left and a navigation menu in the top right.
 * The header is sticky and remains visible when scrolling.
 * 
 * Usage:
 *   import { Header } from "@/components/header"
 *   
 *   <Header />
 */
export function Header() {
  const router = useRouter()

  // Navigation menu items - customize these based on your routes
  const menuItems = [
    { label: "Dashboard", icon: Home, href: "/dashboard" },
    { label: "Instructor Panel", icon: Users, href: "/instructor" },
    { label: "Student Panel", icon: BookOpen, href: "/student" },
    { label: "Analytics", icon: BarChart3, href: "/analytics" },
    { label: "Settings", icon: Settings, href: "/settings" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo Section - Left Side */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          {/* Logo Icon - Activity pulse representing vitals monitoring */}
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Activity className="h-6 w-6 text-primary-foreground" />
          </div>
          
          {/* Logo Text */}
          <div className="flex flex-col">
            <span className="text-lg font-semibold leading-none">GitVitals</span>
            <span className="text-xs text-muted-foreground">Student Management</span>
          </div>
        </button>

        {/* Navigation Menu - Right Side */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Navegação</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* Menu Items */}
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <DropdownMenuItem
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className="cursor-pointer"
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}