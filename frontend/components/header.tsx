"use client";

import { useEffect, useState } from "react";
import {
  Menu,
  X,
  User,
  LogOut,
  HeartHandshake,
  IndianRupee,
  Calendar,
  Users,
  BookOpen,
  Home,
  Bell,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/logo";
import { NotificationDropdown } from "@/components/notification-dropdown";
// import RecentActivities from "@/components/RecentActivities";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const baseNavItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/volunteer", label: "Volunteer", icon: HeartHandshake },
    { href: "/donate", label: "Donate", icon: IndianRupee },
    { href: "/posts", label: "Community", icon: Users },
    { href: "/blogs", label: "Blogs", icon: BookOpen },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
        ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
        : "bg-white/80 backdrop-blur-sm border-b border-gray-100"
        }`}
    >
      <div className="mx-auto flex w-full items-center justify-between px-3 sm:px-4 md:px-6 py-2.5 md:py-3">
        {/* Logo */}
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5 lg:gap-1 flex-1 justify-center">
          {baseNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-1 lg:gap-1.5 px-2 lg:px-4 py-2 rounded-lg text-xs lg:text-lg font-medium transition-all duration-200 group ${isActive(item.href)
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                  }`}
              >
                {Icon && <Icon size={16} className="lg:w-[18px] lg:h-[18px]" />}
                {item.label}
                {isActive(item.href) && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-blue-50 rounded-lg -z-10"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-1 lg:gap-2 flex-shrink-0">
          {user ? (
            <div className="flex items-center gap-1 lg:gap-2 xl:gap-3">
              {/* Notification Bell - Desktop */}
              <NotificationDropdown />
              
              <div className="bg-white rounded-lg lg:rounded-xl p-1 lg:p-1.5 xl:p-2 pl-1.5 lg:pl-2 xl:pl-3 border border-gray-100 max-w-[180px] lg:max-w-[200px] xl:max-w-none">
                <div className="flex items-center gap-1 lg:gap-2 xl:gap-3">
                  <Link
                    href="/profile"
                    className="flex-shrink-0 cursor-pointer group"
                    title="View Profile"
                  >
                    <Avatar className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 shadow-sm group-hover:shadow-md transition-shadow duration-200 ring-2 ring-gray-100">
                      <AvatarImage
                        src={(user as any).profilePicture}
                        alt={user.name}
                      />
                      <AvatarFallback className="text-xs md:text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        <User className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                      </AvatarFallback>
                    </Avatar>
                  </Link>

                  <div className="flex-1 min-w-0 hidden lg:block">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href="/profile"
                        className="hover:text-blue-600 transition-colors"
                      >
                        <span className="font-semibold text-gray-800 truncate text-sm">
                          {user.name}
                        </span>
                      </Link>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {user.role}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs truncate">{user.email}</p>
                  </div>

                  <button
                    onClick={logout}
                    className="flex-shrink-0 flex items-center gap-0.5 lg:gap-1 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 px-1.5 lg:px-2 xl:px-3 py-1 lg:py-1.5 xl:py-2 rounded-md lg:rounded-lg text-[10px] lg:text-xs xl:text-sm font-medium transition-all duration-200 hover:shadow-sm"
                    title="Logout"
                  >
                    <LogOut size={12} className="lg:w-3.5 lg:h-3.5 xl:w-4 xl:h-4" />
                    <span className="hidden lg:inline">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1 lg:gap-2">
              <Link
                href="/signup"
                className="px-2 lg:px-3 xl:px-4 py-1 lg:py-1.5 xl:py-2 text-[10px] lg:text-xs xl:text-sm font-medium border text-gray-700 hover:text-blue-600 transition-colors duration-200 rounded-lg hover:bg-gray-50 whitespace-nowrap"
              >
                Sign up
              </Link>
              <Link
                href="/login"
                className="px-2 lg:px-3 xl:px-4 py-1 lg:py-1.5 xl:py-2 text-[10px] lg:text-xs xl:text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:from-blue-700 hover:to-blue-800 whitespace-nowrap"
              >
                Login
              </Link>
            </div>
          )}
        </div>


        {/* Mobile menu button and notification bell */}
        <div className="md:hidden flex items-center gap-2">
          {/* Notification Bell - Only show for logged in users */}
          {user && (
            <>
              <NotificationDropdown isMobile={true} />

              {/* Profile Icon */}
              <Link
                href="/profile"
                className="flex-shrink-0 rounded-lg p-1 hover:bg-gray-100 transition-colors duration-200"
                title="View Profile"
              >
                <Avatar className="w-8 h-8 shadow-sm ring-2 ring-gray-100">
                  <AvatarImage
                    src={(user as any).profilePicture}
                    alt={user.name}
                  />
                  <AvatarFallback className="text-xs font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
              </Link>
            </>
          )}

          {/* Menu button */}
          <button
            onClick={() => setOpen(!open)}
            className="rounded-lg p-2 hover:bg-gray-100 transition-colors duration-200"
            aria-label="Toggle menu"
          >
            {open ? (
              <X className="h-5 w-5 text-gray-700" />
            ) : (
              <Menu className="h-5 w-5 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Notifications Dropdown - Removed (now handled by NotificationDropdown component) */}

      {/* Mobile nav */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute top-full left-0 w-full md:hidden border-t border-gray-200 bg-white shadow-lg z-50 overflow-hidden"
          >
            <nav className="flex flex-col px-4 py-4">
              {baseNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors duration-200 ${isActive(item.href)
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                      }`}
                  >
                    {Icon && <Icon size={20} />}
                    {item.label}
                  </Link>
                );
              })}

              <div className="my-3 border-t border-gray-200"></div>

              {user ? (
                <div className="px-4 py-3 bg-gray-50 rounded-xl">
                  <Link
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 mb-3 hover:bg-white p-2 rounded-lg transition-colors"
                  >
                    <Avatar className="w-10 h-10 ring-2 ring-white shadow-sm">
                      <AvatarImage
                        src={(user as any).profilePicture}
                        alt={user.name}
                      />
                      <AvatarFallback className="text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        <User className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">
                          {user.name}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {user.role}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm">{user.email}</p>
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 hover:text-red-600 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 hover:border-red-200 hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/signup"
                    onClick={() => setOpen(false)}
                    className="w-full text-center px-4 py-3 border border-gray-200 rounded-xl text-gray-700 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-colors duration-200 font-medium"
                  >
                    Sign up
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="w-full text-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 font-medium"
                  >
                    Login
                  </Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}