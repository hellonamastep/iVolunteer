"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Heart, DollarSign, Gift, Building2, LogIn, Shield, Settings } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function Navigation() {
  const pathname = usePathname()
  const { user } = useAuth()

  const baseNavItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/posts", icon: Heart, label: "Posts" },
    { href: "/volunteer", icon: Heart, label: "Volunteer" },
    { href: "/donate", icon: DollarSign, label: "Donate" },
    { href: "/activities", icon: Building2, label: "Activities" }, // added Activities
  ]

  let navItems = [...baseNavItems]

  if (user) {
    if (user.role === "ngo") {
      navItems.push({ href: "/ngo-dashboard", icon: Settings, label: "Dashboard" })
    } else if (user.role === "admin") {
      navItems.push({ href: "/admin", icon: Shield, label: "Admin" })
    } else if (user.role === "user") {
      navItems.push({ href: "/rewards", icon: Gift, label: "Rewards" })
      navItems.push({ href: "/my-applications", icon: Heart, label: "My Applications" })
    }
  } else {
    navItems.push({ href: "/login", icon: LogIn, label: "Login" })
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
