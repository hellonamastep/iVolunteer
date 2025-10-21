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
import RecentActivities from "@/components/RecentActivities";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
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
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
          : "bg-white/80 backdrop-blur-sm border-b border-gray-100"
      }`}
    >
      <div className="mx-auto flex w-full items-center justify-between px-3 sm:px-4 md:px-6 py-2.5 md:py-3">
        {/* Logo */}
      <Link href="/" className="flex items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 group flex-shrink-0">
  <div className="relative">
    {/* Main Logo */}
    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center group-hover:scale-105 transition-all duration-300 shadow-lg">
      <span className="font-bold text-white text-base sm:text-lg md:text-xl tracking-tight">N</span>
    </div>
    
    {/* Accent Elements */}
    <div className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-sm" />
    <div className="absolute -bottom-0.5 -left-0.5 md:-bottom-1 md:-left-1 w-1.5 h-1.5 md:w-2 md:h-2 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full" />
    
    {/* Glow Effect */}
    <div className="absolute inset-0 rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-sm group-hover:blur-md transition-all duration-500 -z-10" />
  </div>

  {/* Typography */}
  <div className="flex flex-col md:hidden lg:flex min-w-0">
    <span className="text-base sm:text-xl md:text-2xl font-black bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent tracking-tight truncate">
      NAMASTEP
    </span>
    <span className="text-[7px] sm:text-[8px] md:text-[10px] font-semibold text-slate-500 tracking-[0.1em] sm:tracking-[0.15em] md:tracking-[0.2em] uppercase mt-[-2px] truncate">
      SOCIAL IMPACT
    </span>
  </div>
</Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5 lg:gap-1 flex-1 justify-center">
          {baseNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-1 lg:gap-1.5 px-2 lg:px-4 py-2 rounded-lg text-xs lg:text-lg font-medium transition-all duration-200 group ${
                  isActive(item.href)
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
              <div className="flex items-center gap-1 lg:gap-2 xl:gap-3 bg-white rounded-lg lg:rounded-xl p-1 lg:p-1.5 xl:p-2 pl-1.5 lg:pl-2 xl:pl-3 border border-gray-100 max-w-[180px] lg:max-w-[200px] xl:max-w-none">
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
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="rounded-lg p-2 hover:bg-gray-100 transition-colors duration-200 relative"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5 text-gray-700" />
                  {/* Notification badge */}
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
              </div>

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

      {/* Mobile Notifications Dropdown */}
      <AnimatePresence>
        {notificationsOpen && user && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-4 w-[calc(100%-2rem)] max-w-md md:hidden mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-semibold text-gray-800">Recent Activities</h3>
              </div>
              <button
                onClick={() => setNotificationsOpen(false)}
                className="p-1 hover:bg-white rounded-lg transition-colors"
                aria-label="Close notifications"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Activities List */}
            <div className="max-h-[60vh] overflow-y-auto">
              <div className="p-4 space-y-3">
                {/* Activity 1 */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-[#7FD47F]/[0.2] rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-[#7FD47F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#2C3E50] font-medium">vol2 joined event "mumbai event"</p>
                    <p className="text-xs text-[#6B7280] mt-1">2 hours ago</p>
                  </div>
                </div>

                {/* Activity 2 */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-[#4FC3DC]/[0.2] rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-[#4FC3DC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#2C3E50] font-medium">Event "example" approved by admin</p>
                    <p className="text-xs text-[#6B7280] mt-1">5 hours ago</p>
                  </div>
                </div>

                {/* Activity 3 */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-[#EC4899]/[0.2] rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-[#EC4899]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#2C3E50] font-medium">Received $500 donation</p>
                    <p className="text-xs text-[#6B7280] mt-1">1 day ago</p>
                  </div>
                </div>

                {/* Activity 4 */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-[#F9D71C]/[0.2] rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-[#F9D71C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#2C3E50] font-medium">New participation request from vol3</p>
                    <p className="text-xs text-[#6B7280] mt-1">2 days ago</p>
                  </div>
                </div>
              </div>

              {/* View All Button */}
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="w-full border border-[#4FC3DC] text-[#4FC3DC] text-sm font-medium py-2.5 px-4 rounded-xl hover:bg-[#4FC3DC] hover:text-white transition-colors"
                >
                  View All Activities
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors duration-200 ${
                      isActive(item.href)
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