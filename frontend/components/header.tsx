"use client";

import { useEffect, useState } from "react";
import {
  Menu,
  X,
  User,
  LogOut,
  HeartHandshake,
  DollarSign,
  Calendar,
  Users,
  BookOpen,
  Home,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { usePathname } from "next/navigation";

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
    { href: "/donate", label: "Donate", icon: DollarSign },
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
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <span className="font-bold text-white text-xl">N</span>
            </div>
            <div className="absolute -inset-1.5 bg-blue-100/50 rounded-xl -z-10 group-hover:bg-blue-100/70 transition-colors duration-300" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            AMASTEP
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {baseNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive(item.href)
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                {Icon && <Icon size={18} />}
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

          <div className="ml-4 flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-3 bg-white rounded-xl p-2 pl-3 border border-gray-100">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
                  <span className="text-white font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                <div className="flex-1 min-w-0 hidden lg:block">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-800 truncate text-sm">
                      {user.name}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {user.role}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs truncate">{user.email}</p>
                </div>

                <button
                  onClick={logout}
                  className="flex-shrink-0 flex items-center gap-1.5 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-sm"
                  title="Logout"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium border text-gray-700 hover:text-blue-600 transition-colors duration-200 rounded-lg hover:bg-gray-50"
                >
                  Sign up
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:from-blue-700 hover:to-blue-800"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden rounded-lg p-2 hover:bg-gray-100 transition-colors duration-200"
          aria-label="Toggle menu"
        >
          {open ? (
            <X className="h-5 w-5 text-gray-700" />
          ) : (
            <Menu className="h-5 w-5 text-gray-700" />
          )}
        </button>
      </div>

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
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
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
                  </div>
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
                    href="/auth"
                    onClick={() => setOpen(false)}
                    className="w-full text-center px-4 py-3 border border-gray-200 rounded-xl text-gray-700 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-colors duration-200 font-medium"
                  >
                    Sign up
                  </Link>
                  <Link
                    href="/auth"
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
