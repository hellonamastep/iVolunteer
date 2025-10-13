"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

import {
  Calendar,
  MapPin,
  Users,
  Target,
  ArrowRight,
  Star,
  Building2,
  Heart,
  Filter,
  Search,
  Grid,
  List,
  IndianRupee,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useCorporate } from "@/contexts/corporate-context";
import Link from "next/link";

export default function AllEventsPage() {
  const { opportunities } = useCorporate();
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // Extract unique categories
  const categories = [
    "all",
    ...new Set(opportunities.map((opp) => opp.category)),
  ];

  // Filter and sort opportunities
  const filteredOpportunities = opportunities
    .filter((opp) => {
      const categoryMatch =
        selectedCategory === "all" || opp.category === selectedCategory;
      const searchMatch =
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.description.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && searchMatch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "featured":
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        case "date":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "participants":
          const aParts = parseInt(a.participants) || 0;
          const bParts = parseInt(b.participants) || 0;
          return bParts - aParts;
        default:
          return 0;
      }
    });

  // Calculate stats
  const totalEvents = opportunities.length;
  const featuredEvents = opportunities.filter((opp) => opp.featured).length;
  const totalParticipants = opportunities.reduce((sum, opp) => {
    const participants = parseInt(opp.participants) || 0;
    return sum + participants;
  }, 0);

  return (
    <section className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-12 bg-gradient-to-b from-[#5D8A6E] to-[#7AA981] rounded-full"></div>
              <div className="w-3 h-8 bg-gradient-to-b from-[#7AA981] to-[#9BC0A4] rounded-full"></div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-[#5D8A6E] to-[#7AA981] bg-clip-text text-transparent">
              All Events & Opportunities
            </h1>
          </div>
          <p className="text-gray-600 max-w-3xl mx-auto text-xl mb-8">
            Discover {totalEvents} curated corporate events and sponsorship
            opportunities to create meaningful impact
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mb-12">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 text-center">
              <div className="text-3xl font-bold text-[#5D8A6E] mb-2">
                {totalEvents}
              </div>
              <div className="text-gray-600 text-sm font-medium">
                Total Events
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 text-center">
              <div className="text-3xl font-bold text-[#5D8A6E] mb-2">
                {featuredEvents}
              </div>
              <div className="text-gray-600 text-sm font-medium">Featured</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 text-center">
              <div className="text-3xl font-bold text-[#5D8A6E] mb-2">
                {(totalParticipants / 1000).toFixed(1)}K+
              </div>
              <div className="text-gray-600 text-sm font-medium">
                Participants
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-[#5D8A6E] focus:border-[#5D8A6E] bg-green-50/50 transition-all duration-300"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#5D8A6E]" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-[#5D8A6E] focus:border-[#5D8A6E] bg-green-50/50"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-[#5D8A6E] focus:border-[#5D8A6E] bg-green-50/50"
              >
                <option value="featured">Featured First</option>
                <option value="date">Date</option>
                <option value="participants">Most Participants</option>
              </select>

              {/* View Toggle */}
              <div className="flex bg-green-100 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === "grid"
                      ? "bg-white text-[#5D8A6E] shadow-sm"
                      : "text-[#5D8A6E] hover:text-[#7AA981]"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === "list"
                      ? "bg-white text-[#5D8A6E] shadow-sm"
                      : "text-[#5D8A6E] hover:text-[#7AA981]"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Events Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${viewMode}-${selectedCategory}-${searchQuery}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`
              ${
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
                  : "space-y-6"
              }
            `}
          >
            {filteredOpportunities.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="col-span-full bg-white/90 backdrop-blur-lg rounded-3xl p-16 text-center border border-green-200/50 shadow-2xl"
              >
                <div className="max-w-md mx-auto">
                  <div className="mx-auto flex items-center justify-center w-28 h-28 rounded-3xl bg-gradient-to-br from-green-50 to-emerald-100 mb-8 shadow-lg">
                    <Building2 className="w-14 h-14 text-[#5D8A6E]" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    No Events Found
                  </h3>
                  <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                    {searchQuery || selectedCategory !== "all"
                      ? "Try adjusting your search or filters to find more events."
                      : "Check back soon for new events and opportunities."}
                  </p>
                  <div className="w-32 h-1.5 bg-gradient-to-r from-[#5D8A6E] to-[#7AA981] rounded-full mx-auto shadow-md"></div>
                </div>
              </motion.div>
            ) : (
              filteredOpportunities.map((item, index) => (
                <EventCard
                  key={item.id || index}
                  item={item}
                  viewMode={viewMode}
                  index={index}
                />
              ))
            )}
          </motion.div>
        </AnimatePresence>

        {/* Results Count */}
        {filteredOpportunities.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-12"
          >
            <p className="text-gray-600 text-lg">
              Showing {filteredOpportunities.length} of {totalEvents} events
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}

// Enhanced Event Card Component
const EventCard = ({
  item,
  viewMode,
  index,
}: {
  item: any;
  viewMode: "grid" | "list";
  index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 40, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{
      delay: index * 0.1,
      duration: 0.6,
      type: "spring",
      stiffness: 100,
    }}
    whileHover={{
      y: viewMode === "grid" ? -8 : -4,
      scale: viewMode === "grid" ? 1.02 : 1.01,
      transition: { duration: 0.3, ease: "easeOut" },
    }}
    className={`
      group relative bg-white rounded-3xl border-2 border-green-100 hover:border-green-300 hover:shadow-2xl transition-all duration-500 backdrop-blur-sm overflow-hidden
      ${viewMode === "list" ? "flex items-start gap-8 p-8" : "p-8"}
    `}
  >
    {/* Background Glow Effect */}
    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-green-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

    {/* Featured Ribbon */}
    {item.featured && (
      <div className="absolute top-6 right-6 bg-gradient-to-r from-amber-400 to-amber-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg z-10 flex items-center gap-2">
        <Star className="w-3 h-3 fill-current" />
        Featured
      </div>
    )}

    {/* Content Layout */}
    <div
      className={`relative z-10 ${
        viewMode === "list" ? "flex-1 flex items-start gap-8" : ""
      }`}
    >
      {/* Main Content */}
      <div className={viewMode === "list" ? "flex-1" : ""}>
        {/* Category Badge */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-4 h-4 bg-gradient-to-br from-[#5D8A6E] to-[#7AA981] rounded-full shadow-md"></div>
          <span className="text-sm font-semibold text-[#5D8A6E] bg-green-50/80 px-4 py-2 rounded-2xl border border-green-200/60 backdrop-blur-sm">
            {item.category || "General"}
          </span>
        </div>
        {/* Title and Description */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 group-hover:text-[#5D8A6E] transition-colors duration-500 leading-tight mb-4">
            {item.title}
          </h3>
          <p className="text-gray-600 leading-relaxed text-base line-clamp-3">
            {item.description}
          </p>
        </div>
        {/* Stats Grid */}
        <div
          className={`grid gap-4 mb-6 ${
            viewMode === "list" ? "grid-cols-4" : "grid-cols-2"
          }`}
        >
          <div className="flex items-center gap-4 p-4 bg-blue-50/80 rounded-2xl border border-blue-100/80 backdrop-blur-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 shadow-sm">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Date
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {item.date || "TBD"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-orange-50/80 rounded-2xl border border-orange-100/80 backdrop-blur-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-orange-100 shadow-sm">
              <MapPin className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Location
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {item.location || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-purple-50/80 rounded-2xl border border-purple-100/80 backdrop-blur-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-100 shadow-sm">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Participants
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {item.participants || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-green-50/80 rounded-2xl border border-green-100/80 backdrop-blur-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-100 shadow-sm">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Goal
              </p>
              <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                <IndianRupee className="w-4 h-4 text-green-600" />
                {item.goal || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-green-100/80 flex gap-4">
          {/* Contact Button */}
          {/* <button
            onClick={() =>
              toast.success(
                `Contact ${item.organization} at ${
                  item.sponsorshipContactNumber || "N/A"
                }`
              )
            }
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 text-base font-semibold rounded-2xl text-white bg-gradient-to-r from-[#5D8A6E] to-[#7AA981] hover:from-[#4A7A5D] hover:to-[#689870] transition-all duration-500 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Heart className="w-5 h-5" />
            Contact
          </button> */}

          {/* Mail Button */}
          <Link
            href={
              item.sponsorshipContactEmail
                ? `mailto:${item.sponsorshipContactEmail}`
                : "#"
            }
            target="_blank"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 text-base font-semibold rounded-2xl text-white bg-gradient-to-r from-[#34A853] to-[#0F9D58] hover:from-[#0C7B3E] hover:to-[#097534] transition-all duration-500 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <ArrowRight className="w-5 h-5" />
            Mail
          </Link>
        </div>
      </div>
    </div>

    {/* Hover Effect Border */}
    <div className="absolute inset-0 rounded-3xl border-3 border-transparent bg-gradient-to-br from-green-200/50 to-emerald-200/30 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none"></div>
  </motion.div>
);
